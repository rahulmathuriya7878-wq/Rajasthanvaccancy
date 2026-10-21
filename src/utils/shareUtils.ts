import { VacancyItem } from '../types';

/**
 * Generate comprehensive Hindi share text for any vacancy / yojana / result / admit card
 * formatted with WhatsApp friendly bolding and emojis.
 */
export function generateHindiShareText(item: VacancyItem, customUrl?: string): string {
  let shareUrl = customUrl;
  if (!shareUrl) {
    if (item.id === 'rrb-station-master-recruitment-2026') {
      shareUrl = 'https://rajasthanvacancy.com/rrb-station-master-recruitment-2026/';
    } else if (typeof window !== 'undefined') {
      shareUrl = `${window.location.origin}${window.location.pathname}?vacancy=${item.id}`;
    } else {
      shareUrl = `https://rajasthanvacancy.com/${item.id}/`;
    }
  }

  // Exact requested format for RRB Station Master Recruitment 2026
  if (item.id === 'rrb-station-master-recruitment-2026') {
    return `🔥 *रेलवे स्टेशन मास्टर भर्ती का 1,250 पदों पर नोटिफिकेशन जारी, आवेदन 27 अक्टूबर से 25 नवंबर 2026 तक*\n👇👇\nhttps://rajasthanvacancy.com/rrb-station-master-recruitment-2026/`;
  }

  // Generic dynamic headline for all vacancies & yojanas
  const postTitle = item.shortTitleHi || item.postNameHi || item.titleHi || item.title;
  const postsCountText = typeof item.totalPosts === 'number' ? `${item.totalPosts.toLocaleString('hi-IN')} पदों` : (item.totalPosts ? `${item.totalPosts}` : 'विभिन्न पदों');
  const startDate = item.importantDates?.applyStartDate || 'अक्टूबर 2026';
  const lastDate = item.importantDates?.applyLastDate || item.yojanaOverview?.applyLastDate || 'नवंबर 2026';

  const headline = `${postTitle} का ${postsCountText} पर नोटिफिकेशन जारी, आवेदन ${startDate} से ${lastDate} तक`;

  return `🔥 *${headline}*\n👇👇\n${shareUrl}`;
}
