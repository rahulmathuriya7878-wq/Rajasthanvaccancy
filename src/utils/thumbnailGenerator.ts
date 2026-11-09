import { VacancyItem, CategoryType } from '../types';

export interface ThumbnailOptions {
  title: string;
  category?: string;
  organization?: string;
  totalPosts?: string | number;
  postName?: string;
  status?: string;
  advtNo?: string;
  width?: number;
  height?: number;
}

const CATEGORY_THEMES: Record<string, {
  bgGradient: [string, string, string];
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  labelHi: string;
}> = {
  latest_job: {
    bgGradient: ['#090d16', '#0f172a', '#1e293b'],
    accentColor: '#38bdf8',
    badgeBg: '#f59e0b',
    badgeText: '#000000',
    labelHi: 'सरकारी नौकरी (LATEST JOB)',
  },
  admit_card: {
    bgGradient: ['#0b1329', '#172554', '#1e3a8a'],
    accentColor: '#60a5fa',
    badgeBg: '#3b82f6',
    badgeText: '#ffffff',
    labelHi: 'प्रवेश पत्र (ADMIT CARD OUT)',
  },
  result: {
    bgGradient: ['#031c15', '#064e3b', '#065f46'],
    accentColor: '#34d399',
    badgeBg: '#10b981',
    badgeText: '#000000',
    labelHi: 'परीक्षा परिणाम (RESULT DECLARED)',
  },
  answer_key: {
    bgGradient: ['#1c1304', '#451a03', '#78350f'],
    accentColor: '#fbbf24',
    badgeBg: '#f59e0b',
    badgeText: '#000000',
    labelHi: 'उत्तर कुंजी (ANSWER KEY OUT)',
  },
  scheme: {
    bgGradient: ['#041d1a', '#134e4a', '#0f766e'],
    accentColor: '#2dd4bf',
    badgeBg: '#14b8a6',
    badgeText: '#000000',
    labelHi: 'सरकारी योजना (GOVT SCHEME)',
  },
  news: {
    bgGradient: ['#140b2e', '#1e1b4b', '#312e81'],
    accentColor: '#a78bfa',
    badgeBg: '#e11d48',
    badgeText: '#ffffff',
    labelHi: 'रोजगार समाचार (LATEST NEWS)',
  },
  exam_date: {
    bgGradient: ['#1e1408', '#3b1c06', '#592909'],
    accentColor: '#fb923c',
    badgeBg: '#ea580c',
    badgeText: '#ffffff',
    labelHi: 'परीक्षा तिथि (EXAM DATE)',
  },
  syllabus: {
    bgGradient: ['#0f172a', '#1e293b', '#334155'],
    accentColor: '#94a3b8',
    badgeBg: '#64748b',
    badgeText: '#ffffff',
    labelHi: 'पाठ्यक्रम (SYLLABUS & PATTERN)',
  },
};

const DEFAULT_THEME = CATEGORY_THEMES.latest_job;

// In-memory cache to prevent re-rendering canvases repeatedly
const thumbnailCache = new Map<string, string>();

/**
 * Wraps text into lines that fit within a maximum width on the canvas
 */
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 3
): string[] {
  // Break by words or spaces
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        // Last allowed line: assemble remainder and truncate with ellipsis if necessary
        const remaining = words.slice(i).join(' ');
        let lastLine = remaining;
        while (ctx.measureText(`${lastLine}…`).width > maxWidth && lastLine.length > 0) {
          lastLine = lastLine.slice(0, -1).trim();
        }
        lines.push(`${lastLine}…`);
        return lines;
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines);
}

/**
 * Draws rounded rectangle path on canvas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Pure SVG Fallback generator for SSR / non-DOM environments
 */
function generateSvgFallback(options: ThumbnailOptions): string {
  const {
    title,
    category = 'latest_job',
    organization = 'Rajasthan Government',
    totalPosts = 'विभिन्न पद',
    width = 1200,
    height = 630
  } = options;

  const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;
  const cleanTitle = title.length > 70 ? `${title.substring(0, 68)}…` : title;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.bgGradient[0]}" />
        <stop offset="50%" stop-color="${theme.bgGradient[1]}" />
        <stop offset="100%" stop-color="${theme.bgGradient[2]}" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <!-- Top Bar -->
    <rect x="50" y="45" width="230" height="36" rx="6" fill="#f59e0b" />
    <text x="65" y="69" font-family="'Mangal', sans-serif" font-size="16" font-weight="bold" fill="#000000">RAJASTHAN VACANCY</text>
    <rect x="920" y="45" width="230" height="36" rx="6" fill="${theme.badgeBg}" />
    <text x="935" y="69" font-family="'Mangal', sans-serif" font-size="15" font-weight="bold" fill="${theme.badgeText}">${theme.labelHi.substring(0, 24)}</text>
    <!-- Title -->
    <text x="60" y="220" font-family="'Mangal', sans-serif" font-size="44" font-weight="800" fill="#ffffff" width="1080">
      ${cleanTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;')}
    </text>
    <!-- Badges -->
    <rect x="60" y="470" width="340" height="70" rx="10" fill="#10b981" />
    <text x="80" y="515" font-family="'Mangal', sans-serif" font-size="24" font-weight="bold" fill="#000000">कुल पद: ${String(totalPosts)}</text>
    <rect x="420" y="470" width="450" height="70" rx="10" fill="#1e293b" stroke="#334155" stroke-width="2" />
    <text x="440" y="515" font-family="'Mangal', sans-serif" font-size="22" font-weight="bold" fill="#ffffff">विभाग: ${organization}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Main Canvas API Helper Function to generate professional thumbnail images
 * for jobs that lack a featured image.
 * Uses high-contrast typography, official gradient styles, category banners,
 * and key metrics overlay (Total Posts & Organization) to maximize click-through rate.
 */
export function generateJobThumbnail(options: ThumbnailOptions): string {
  const cacheKey = `${options.title}_${options.category}_${options.totalPosts}_${options.width || 1200}`;
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }

  // Fallback if running server-side without window or canvas
  if (typeof document === 'undefined') {
    const fallback = generateSvgFallback(options);
    thumbnailCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const width = options.width || 1200;
    const height = options.height || 630;
    const category = options.category || 'latest_job';
    const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;
    const organization = options.organization || 'Rajasthan Government';
    const totalPosts = options.totalPosts ? String(options.totalPosts) : 'विभिन्न पद';

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return generateSvgFallback(options);
    }

    // 1. Background Gradient (Dark, high-contrast, official)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, theme.bgGradient[0]);
    bgGradient.addColorStop(0.5, theme.bgGradient[1]);
    bgGradient.addColorStop(1, theme.bgGradient[2]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative Geometric Accents & Ambient Radial Light
    // Top-right soft radial glow
    const radialGlow = ctx.createRadialGradient(width - 150, 150, 20, width - 150, 150, 450);
    radialGlow.addColorStop(0, `${theme.accentColor}33`); // 20% opacity
    radialGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // Diagonal subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }

    // Outer subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Saffron accent top bar
    const topBarGradient = ctx.createLinearGradient(0, 0, width, 0);
    topBarGradient.addColorStop(0, '#f59e0b');
    topBarGradient.addColorStop(0.5, '#ef4444');
    topBarGradient.addColorStop(1, theme.accentColor);
    ctx.fillStyle = topBarGradient;
    ctx.fillRect(16, 16, width - 32, 8);

    // 3. Header Section (Branding & Category Tag)
    const paddingX = 64;

    // Brand Badge (Left)
    roundRect(ctx, paddingX, 48, 260, 42, 8);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#090d16';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏛️ RAJASTHAN VACANCY', paddingX + 16, 48 + 21);

    // Category Badge (Right)
    const categoryBadgeText = theme.labelHi;
    ctx.font = 'bold 16px "Mangal", "Noto Sans Devanagari", sans-serif';
    const catTextWidth = ctx.measureText(categoryBadgeText).width;
    const catBadgeWidth = Math.max(220, catTextWidth + 36);
    const catBadgeX = width - paddingX - catBadgeWidth;

    roundRect(ctx, catBadgeX, 48, catBadgeWidth, 42, 8);
    ctx.fillStyle = theme.badgeBg;
    ctx.fill();

    ctx.fillStyle = theme.badgeText;
    ctx.fillText(categoryBadgeText, catBadgeX + 18, 48 + 21);

    // 4. Job Title Overlay (Primary Attention Grabber)
    const maxTitleWidth = width - (paddingX * 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Drop Shadow for high readability against any background
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Pick font size based on length
    let fontSize = 48;
    if (options.title.length > 75) fontSize = 40;
    if (options.title.length > 110) fontSize = 34;

    ctx.font = `800 ${fontSize}px "Mangal", "Noto Sans Devanagari", -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = '#ffffff';

    const lines = wrapCanvasText(ctx, options.title, maxTitleWidth, 3);
    const lineHeight = fontSize * 1.38;
    const titleStartY = 145;

    lines.forEach((line, index) => {
      ctx.fillText(line, paddingX, titleStartY + (index * lineHeight));
    });

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 5. Divider Line with Accent Dot
    const dividerY = titleStartY + (lines.length * lineHeight) + 24;
    const divGrad = ctx.createLinearGradient(paddingX, 0, width - paddingX, 0);
    divGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    divGrad.addColorStop(0.7, theme.accentColor);
    divGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = divGrad;
    ctx.fillRect(paddingX, dividerY, width - (paddingX * 2), 2);

    // 6. Footer Info Cards (Total Posts, Department, Verification Stamp)
    const cardY = height - 140;

    // Badge 1: Total Posts (High visual conversion trigger)
    const postsBadgeWidth = 320;
    roundRect(ctx, paddingX, cardY, postsBadgeWidth, 68, 12);
    const postsGrad = ctx.createLinearGradient(paddingX, cardY, paddingX + postsBadgeWidth, cardY + 68);
    postsGrad.addColorStop(0, '#10b981');
    postsGrad.addColorStop(1, '#059669');
    ctx.fillStyle = postsGrad;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Mangal", sans-serif';
    ctx.fillText('कुल पद (TOTAL VACANCY)', paddingX + 20, cardY + 16);

    ctx.font = '900 24px "Mangal", "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#ffffff';
    const displayPosts = totalPosts.length > 20 ? `${totalPosts.slice(0, 18)}…` : totalPosts;
    ctx.fillText(`🔥 ${displayPosts}`, paddingX + 20, cardY + 36);

    // Badge 2: Department / Organization
    const orgBadgeX = paddingX + postsBadgeWidth + 20;
    const orgBadgeWidth = Math.min(420, width - orgBadgeX - paddingX - 180);
    roundRect(ctx, orgBadgeX, cardY, orgBadgeWidth, 68, 12);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px "Mangal", sans-serif';
    ctx.fillText('विभाग / बोर्ड (DEPARTMENT)', orgBadgeX + 20, cardY + 16);

    ctx.font = 'bold 19px "Mangal", "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#f8fafc';
    const displayOrg = organization.length > 28 ? `${organization.slice(0, 26)}…` : organization;
    ctx.fillText(displayOrg, orgBadgeX + 20, cardY + 36);

    // Badge 3: Official Verification Stamp (Bottom Right)
    const sealX = width - paddingX - 60;
    const sealY = cardY + 34;

    ctx.beginPath();
    ctx.arc(sealX, sealY, 32, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', sealX, sealY - 6);

    ctx.font = 'bold 9px "Mangal", sans-serif';
    ctx.fillText('VERIFIED', sealX, sealY + 14);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    thumbnailCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (err) {
    console.warn('Canvas thumbnail generation failed, using SVG fallback:', err);
    const fallback = generateSvgFallback(options);
    thumbnailCache.set(cacheKey, fallback);
    return fallback;
  }
}

/**
 * Convenience helper that accepts a VacancyItem and returns a high-res thumbnail data URL.
 * Checks if the vacancy already has a custom featuredImage/imageUrl, otherwise generates
 * a professional canvas thumbnail on the fly.
 */
export function getJobFeaturedImage(
  vacancy: VacancyItem,
  customOptions?: Partial<ThumbnailOptions>
): string {
  // If post already has a custom featured image specified, use it
  if ((vacancy as any).featuredImage) return (vacancy as any).featuredImage;
  if ((vacancy as any).imageUrl) return (vacancy as any).imageUrl;
  if (vacancy.seoSettings?.ogImageUrl) return vacancy.seoSettings.ogImageUrl;

  const title = vacancy.titleHi || vacancy.title;
  const organization = vacancy.departmentHi || vacancy.department || vacancy.organization;

  return generateJobThumbnail({
    title,
    category: vacancy.category,
    organization,
    totalPosts: vacancy.totalPosts,
    postName: vacancy.postNameHi || vacancy.postName,
    status: vacancy.status,
    advtNo: vacancy.advtNo,
    ...customOptions
  });
}
