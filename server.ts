import express from 'express';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserByUid } from './src/db/users.ts';
import { getSavedVacanciesByUserId, saveVacancyItem, removeSavedVacancyItem } from './src/db/vacancies.ts';

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
      const { fetchLiveGovernmentJobsFromRSS } = await import('./src/services/rssScraper.ts');
      const liveItems = await fetchLiveGovernmentJobsFromRSS();
      res.json({ success: true, count: liveItems.length, data: liveItems, fetchedAt: new Date().toISOString() });
    } catch (error: any) {
      console.error('Failed to scrape RSS vacancies:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch RSS feeds' });
    }
  });

  app.post('/api/vacancies/sync', async (_req, res) => {
    try {
      const { fetchLiveGovernmentJobsFromRSS } = await import('./src/services/rssScraper.ts');
      const liveItems = await fetchLiveGovernmentJobsFromRSS();
      res.json({ success: true, count: liveItems.length, items: liveItems, syncedAt: new Date().toISOString() });
    } catch (error: any) {
      console.error('Failed to sync RSS vacancies:', error);
      res.status(500).json({ success: false, error: 'Failed to sync RSS feeds' });
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

  // Vite dev middleware or production static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
