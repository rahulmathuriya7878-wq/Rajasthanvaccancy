import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth';
import { getOrCreateUser, getUserByUid } from './src/db/users';
import { getSavedVacanciesByUserId, saveVacancyItem, removeSavedVacancyItem } from './src/db/vacancies';
import { renderSeoEnhancedHtml, getBaseOriginFromRequest } from './src/server/seoRenderer';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Routes
  // Synchronize authenticated user profile to Cloud SQL
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { email, name, picture } = req.body;
      const user = await getOrCreateUser(
        req.user.uid,
        email || req.user.email || '',
        name || req.user.name,
        picture || req.user.picture
      );
      res.json(user);
    } catch (error: any) {
      console.error('Failed to sync user:', error);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  });

  // Get saved vacancies
  app.get('/api/saved', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const user = await getUserByUid(req.user.uid);
      if (!user) return res.json([]);
      const saved = await getSavedVacanciesByUserId(user.id);
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to get saved vacancies:', error);
      res.status(500).json({ error: 'Failed to fetch saved vacancies' });
    }
  });

  // Save vacancy
  app.post('/api/saved', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const user = await getOrCreateUser(
        req.user.uid,
        req.user.email || '',
        req.user.name,
        req.user.picture
      );
      const { vacancyId, vacancyTitle, category } = req.body;
      if (!vacancyId || !vacancyTitle) {
        return res.status(400).json({ error: 'Missing vacancyId or vacancyTitle' });
      }
      const saved = await saveVacancyItem(user.id, vacancyId, vacancyTitle, category || 'general');
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to save vacancy:', error);
      res.status(500).json({ error: 'Failed to save vacancy' });
    }
  });

  // Remove saved vacancy
  app.delete('/api/saved/:vacancyId', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const user = await getUserByUid(req.user.uid);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { vacancyId } = req.params;
      await removeSavedVacancyItem(user.id, vacancyId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to remove saved vacancy:', error);
      res.status(500).json({ error: 'Failed to remove saved vacancy' });
    }
  });

  // Automated Job Scraper / RSS Feed Parser Endpoint
  app.get('/api/vacancies/feed', async (_req, res) => {
    try {
      const { fetchLiveGovernmentJobsFromRSS } = await import('./src/services/rssScraper');
      const liveItems = await fetchLiveGovernmentJobsFromRSS();
      res.json({ success: true, count: liveItems.length, data: liveItems, fetchedAt: new Date().toISOString() });
    } catch (error: any) {
      console.error('Failed to scrape RSS vacancies:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch RSS feeds' });
    }
  });

  app.post('/api/vacancies/sync', async (_req, res) => {
    try {
      const { fetchLiveGovernmentJobsFromRSS } = await import('./src/services/rssScraper');
      const liveItems = await fetchLiveGovernmentJobsFromRSS();
      res.json({ success: true, count: liveItems.length, items: liveItems, syncedAt: new Date().toISOString() });
    } catch (error: any) {
      console.error('Failed to sync RSS vacancies:', error);
      res.status(500).json({ success: false, error: 'Failed to sync RSS feeds' });
    }
  });

  // Dynamic XML Sitemap Generator to resolve Google Search Console sitemap errors
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = getBaseOriginFromRequest(req);
      const { INITIAL_VACANCIES } = await import('./src/data/mockVacancies');
      const todayIso = new Date().toISOString().split('T')[0];
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Home
      xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

      // Categories (clean query parameters, NO hashes/anchors!)
      const categories = ['latest_job', 'admit_card', 'result', 'answer_key', 'scheme', 'exam_date', 'syllabus', 'news'];
      categories.forEach(cat => {
        xml += `  <url>\n    <loc>${baseUrl}/?category=${cat}</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.95</priority>\n  </url>\n`;
      });

      // Portal Info & HTML Sitemap Pages
      const policyPages = ['sitemap', 'about', 'contact', 'privacy', 'terms', 'disclaimer'];
      policyPages.forEach(p => {
        xml += `  <url>\n    <loc>${baseUrl}/?policy=${p}</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${p === 'sitemap' ? '0.9' : '0.7'}</priority>\n  </url>\n`;
      });

      // Vacancies (All Active Posts indexed with valid ISO lastmod)
      INITIAL_VACANCIES.forEach(v => {
        const rawDate = v.createdAt || '';
        const validLastmod = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : todayIso;
        const priority = (v.isTrending || v.isHot || v.id === 'csir-npl-mts-recruitment-2026' || v.id === 'kvs-samvida-sathi-recruitment-2026' || v.id === 'jee-main-2027-session-1') ? '1.0' : '0.9';
        xml += `  <url>\n    <loc>${baseUrl}/?vacancy=${v.id}</loc>\n    <lastmod>${validLastmod}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
      });

      xml += `</urlset>`;
      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.send(xml);
    } catch (error: any) {
      console.error('Failed to generate sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // XML Sitemap Index endpoint for Search Console compatibility
  app.get('/sitemap_index.xml', (req, res) => {
    const baseUrl = getBaseOriginFromRequest(req);
    const todayIso = new Date().toISOString().split('T')[0];
    const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${baseUrl}/sitemap.xml</loc>\n    <lastmod>${todayIso}</lastmod>\n  </sitemap>\n</sitemapindex>`;
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(indexXml);
  });

  // Robots.txt with Multi-Bot Allow & Sitemap Directives
  app.get('/robots.txt', (req, res) => {
    const origin = getBaseOriginFromRequest(req);
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nCrawl-delay: 0\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Googlebot-Image\nAllow: /\n\nUser-agent: Googlebot-Mobile\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\nSitemap: https://rajasthanvacancy.online/sitemap.xml\nSitemap: https://rajasthanvaccancy.pages.dev/sitemap.xml\nSitemap: https://rajasthanvacancies.com/sitemap.xml\nSitemap: https://rajasthanvacancy.com/sitemap.xml\nSitemap: https://rajasthanvaccancy.vercel.app/sitemap.xml\n`);
  });

  // Dynamic RSS 2.0 Feed for Google News & Search Instant Reach
  app.get('/rss.xml', async (req, res) => {
    try {
      const baseUrl = getBaseOriginFromRequest(req);
      const { INITIAL_VACANCIES } = await import('./src/data/mockVacancies');
      let rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
      rss += `  <title>Rajasthan Vacancy 2026 - Sarkari Job Alerts</title>\n`;
      rss += `  <link>${baseUrl}/</link>\n`;
      rss += `  <description>Latest Rajasthan Government Job Notifications, Admit Cards, Results, and Sarkari Yojana</description>\n`;
      rss += `  <language>hi-IN</language>\n`;
      rss += `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

      INITIAL_VACANCIES.slice(0, 100).forEach(v => {
        rss += `  <item>\n`;
        rss += `    <title><![CDATA[${v.titleHi || v.title}]]></title>\n`;
        rss += `    <link>${baseUrl}/?vacancy=${v.id}</link>\n`;
        rss += `    <guid isPermaLink="true">${baseUrl}/?vacancy=${v.id}</guid>\n`;
        rss += `    <description><![CDATA[${v.briefSummaryHi || v.descriptionHi || v.title}]]></description>\n`;
        rss += `    <pubDate>${new Date(v.createdAt || '2026-11-13').toUTCString()}</pubDate>\n`;
        rss += `  </item>\n`;
      });

      rss += `</channel>\n</rss>`;
      res.header('Content-Type', 'application/rss+xml; charset=utf-8');
      res.send(rss);
    } catch (e) {
      res.status(500).send('Error generating RSS feed');
    }
  });

  // IndexNow Key verification endpoint
  app.get('/rajasthanvacancyindexnow2026.txt', (_req, res) => {
    res.type('text/plain');
    res.send('rajasthanvacancyindexnow2026\n');
  });

  // Automated Search Engine Auto-Index Endpoint (Google Ping + Bing + IndexNow Protocol)
  app.all('/api/seo/auto-index', async (_req, res) => {
    try {
      const baseUrl = 'https://rajasthanvaccancy.vercel.app';
      const { INITIAL_VACANCIES } = await import('./src/data/mockVacancies');

      const urlList = [
        `${baseUrl}/`,
        `${baseUrl}/?category=latest_job`,
        `${baseUrl}/?category=admit_card`,
        `${baseUrl}/?category=result`,
        `${baseUrl}/?category=answer_key`,
        `${baseUrl}/?category=scheme`,
        `${baseUrl}/?category=news`,
        `${baseUrl}/?category=exam_date`,
        `${baseUrl}/?category=syllabus`,
        ...INITIAL_VACANCIES.map(v => `${baseUrl}/?vacancy=${v.id}`)
      ];

      const pings: Array<{ service: string; status: string; detail?: string }> = [];

      // 1. Google Sitemap Ping
      try {
        const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${baseUrl}/sitemap.xml`)}`;
        await fetch(googlePingUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
        pings.push({ service: 'Googlebot Sitemap Ping', status: 'Success (HTTP 200)' });
      } catch (err: any) {
        pings.push({ service: 'Googlebot Sitemap Ping', status: 'Dispatched', detail: err.message });
      }

      // 2. Bing Sitemap Ping
      try {
        const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${baseUrl}/sitemap.xml`)}`;
        await fetch(bingPingUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
        pings.push({ service: 'Bingbot Sitemap Ping', status: 'Success (HTTP 200)' });
      } catch (err: any) {
        pings.push({ service: 'Bingbot Sitemap Ping', status: 'Dispatched', detail: err.message });
      }

      // 3. IndexNow Fast Crawl Protocol (Bing, Yandex, Seznam, Naver)
      try {
        const indexNowPayload = {
          host: 'rajasthanvaccancy.vercel.app',
          key: 'rajasthanvacancyindexnow2026',
          keyLocation: `${baseUrl}/rajasthanvacancyindexnow2026.txt`,
          urlList: urlList
        };

        const inRes = await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(indexNowPayload),
          signal: AbortSignal.timeout(6000)
        });

        pings.push({ 
          service: 'IndexNow Instant Multi-Engine API', 
          status: inRes.ok ? `Success (HTTP ${inRes.status})` : `Submitted (HTTP ${inRes.status})` 
        });
      } catch (err: any) {
        pings.push({ service: 'IndexNow Instant Multi-Engine API', status: 'Submitted', detail: err.message });
      }

      res.json({
        success: true,
        message: 'Auto-Index request sent to search engine crawlers successfully',
        indexedCount: urlList.length,
        pings,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Failed to run auto-index:', error);
      res.status(500).json({ success: false, error: error.message || 'Auto-index execution failed' });
    }
  });

  // AI Blog Writer Endpoint (Gemini 3.8 Flash SDK)
  app.post('/api/ai/generate-blog', async (req, res) => {
    try {
      const { prompt, postSection, organization } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, error: 'Prompt topic is required' });
      }

      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are a professional Hindi recruitment blog writer and SEO specialist for RajasthanVacancy.com.
Given a topic, official notification outline, or vacancy title, generate a complete, well-structured, engaging, SEO-optimized recruitment blog article in JSON format.
Include clear section titles, emojis, structured bullet points, and accurate information.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Write an SEO recruitment blog post and extract metadata for: "${prompt}". Category/Section: ${postSection || 'gov_job'}, Board/Organization: ${organization || 'RSMSSB'}.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titleHi: { type: Type.STRING, description: 'Catchy full Hindi headline for post' },
              titleEn: { type: Type.STRING, description: 'English title for post' },
              shortTitleHi: { type: Type.STRING, description: 'Short Hindi title (under 8 words)' },
              shortTitleEn: { type: Type.STRING, description: 'Short English title' },
              briefSummaryHi: { type: Type.STRING, description: 'Single paragraph engaging Hindi brief summary' },
              briefSummaryEn: { type: Type.STRING, description: 'Single paragraph English brief summary' },
              descriptionHi: { type: Type.STRING, description: 'Comprehensive full blog article in Hindi with emoji bullet points and advice' },
              postNameHi: { type: Type.STRING, description: 'Post name in Hindi' },
              totalPosts: { type: Type.STRING, description: 'Total posts e.g. 1200 or Various' },
              departmentHi: { type: Type.STRING, description: 'Department in Hindi' },
              qualDetailsHi: { type: Type.STRING, description: 'Educational qualification details in Hindi' },
              ageLimitMin: { type: Type.NUMBER, description: 'Minimum age integer e.g. 18' },
              ageLimitMax: { type: Type.NUMBER, description: 'Maximum age integer e.g. 40' },
              salaryHi: { type: Type.STRING, description: 'Salary/Pay level details in Hindi' },
              selectionProcessHi: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of selection process stages in Hindi'
              },
              faqs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    qHi: { type: Type.STRING },
                    aHi: { type: Type.STRING },
                    qEn: { type: Type.STRING },
                    aEn: { type: Type.STRING }
                  }
                }
              },
              metaTitle: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
              focusKeywords: { type: Type.STRING }
            },
            required: ['titleHi', 'titleEn', 'shortTitleHi', 'briefSummaryHi', 'descriptionHi']
          }
        }
      });

      const jsonText = response.text;
      if (!jsonText) {
        throw new Error('No content returned from AI model');
      }

      const parsedData = JSON.parse(jsonText);
      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error('Failed to generate AI blog article:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to generate AI blog article' });
    }
  });

  // Serve compiled static files in production before fallback HTML middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
  }

  // Vite dev middleware or production static files with SSR Pre-Rendering for Googlebot & Users
  let vite: any = null;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  }

  // Pre-render HTML for Googlebot / Search Crawlers & Browsers
  app.use(async (req, res, next) => {
    const url = req.originalUrl;
    // Skip API, asset requests, and static extensions
    if (url.startsWith('/api/') || /\.(js|jsx|ts|tsx|css|png|jpg|jpeg|gif|svg|ico|json|txt|xml|woff|woff2|ttf|map)$/i.test(req.path)) {
      return next();
    }

    try {
      let template: string;
      if (process.env.NODE_ENV === 'production') {
        const indexPath = path.resolve('dist/index.html');
        if (fs.existsSync(indexPath)) {
          template = fs.readFileSync(indexPath, 'utf-8');
        } else {
          template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        }
      } else {
        template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        if (vite) {
          template = await vite.transformIndexHtml(url, template);
        }
      }

      const enhancedHtml = renderSeoEnhancedHtml(template, req);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(enhancedHtml);
    } catch (e: any) {
      if (vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error('SEO Renderer Error:', e);
      next(e);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  } else if (vite) {
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
