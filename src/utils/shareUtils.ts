import { VacancyItem } from '../types';

/**
 * Format date string into Hindi readable date e.g. "27 अक्टूबर 2026" or "25 नवंबर 2026"
 */
export function formatHindiDateString(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  
  const hindiMonths = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  if (hindiMonths.some(m => trimmed.includes(m))) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    const monthIdx = parseInt(month, 10) - 1;
    const mName = hindiMonths[monthIdx] || '';
    return `${parseInt(day, 10)} ${mName} ${year}`;
  }

  return trimmed;
}

/**
 * Generate comprehensive Hindi share text for any vacancy / yojana / result / admit card
 * formatted with WhatsApp friendly bolding and emojis.
 * 
 * Format:
 * 🔥 *Bharti ka naam ka numbers pado par notification jaary aavedan kab se kab tak*
 * 👇👇
 * Post link
 */
export function generateHindiShareText(item: VacancyItem, customUrl?: string): string {
  let shareUrl = customUrl;
  if (!shareUrl) {
    const cleanId = item.id.replace(/^\//, '').replace(/\/$/, '');
    const origin = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') 
      ? window.location.origin 
      : 'https://rajasthanvaccancy.vercel.app';
    shareUrl = `${origin}/${cleanId}/`;
  }

  // Exact requested format for RRB Station Master Recruitment 2026
  if (item.id === 'rrb-station-master-recruitment-2026') {
    return `🔥 *रेलवे स्टेशन मास्टर भर्ती का 1,250 पदों पर नोटिफिकेशन जारी, आवेदन 27 अक्टूबर से 25 नवंबर 2026 तक*\n👇👇\n${shareUrl}`;
  }

  // Dynamic Hindi title for any vacancy/yojana
  let postTitle = item.shortTitleHi || item.postNameHi || item.titleHi || item.title;
  postTitle = postTitle.replace(/:\s*Notification Released.*$/i, '').trim();

  // Posts count string
  let postsCountText = '';
  if (typeof item.totalPosts === 'number') {
    postsCountText = `${item.totalPosts.toLocaleString('hi-IN')} पदों`;
  } else if (typeof item.totalPosts === 'string' && item.totalPosts) {
    if (item.totalPosts.includes('पद')) {
      postsCountText = item.totalPosts.trim();
    } else {
      postsCountText = `${item.totalPosts.trim()} पदों`;
    }
  } else {
    postsCountText = 'विभिन्न पदों';
  }

  // Format dates: "27 अक्टूबर से 25 नवंबर 2026 तक"
  const startRaw = item.importantDates?.applyStartDate || item.yojanaOverview?.applyStartDate;
  const lastRaw = item.importantDates?.applyLastDate || item.yojanaOverview?.applyLastDate;

  let datesText = '';
  if (startRaw && lastRaw) {
    const formattedStart = formatHindiDateString(startRaw).replace(/\s*\d{4}$/, ''); // e.g. "27 अक्टूबर"
    const formattedLast = formatHindiDateString(lastRaw); // e.g. "25 नवंबर 2026"
    datesText = `${formattedStart} से ${formattedLast} तक`;
  } else if (lastRaw) {
    const formattedLast = formatHindiDateString(lastRaw);
    datesText = `अंतिम तिथि ${formattedLast}`;
  } else {
    datesText = 'प्रक्रिया जल्द शुरू';
  }

  const headline = `${postTitle} का ${postsCountText} पर नोटिफिकेशन जारी, आवेदन ${datesText}`;

  return `🔥 *${headline}*\n👇👇\n${shareUrl}`;
}
