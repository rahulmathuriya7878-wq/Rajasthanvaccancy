import { VacancyItem } from '../types';
import { buildCanonicalUrl } from './seoCanonical';
import { resolveJobDates } from './dateUtils';

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
 * Standard Format across all posts:
 * 🚨 *BIG अपडेट* 🚨
 * 
 * 📋 *भर्ती का नाम:* [भर्ती का नाम]
 * 🔢 *कुल पद:* [कुल पद]
 * 💳 *आवेदन की प्रारंभ तिथि:* [तारीख]
 * ⏳ *आवेदन की अंतिम तिथि:* [तारीख]
 * 
 * 👇 *संपूर्ण विवरण पढ़ें व ऑनलाइन फॉर्म भरें:*
 * https://rajasthanvaccancy.vercel.app/?vacancy=[post-slug]
 */
export function generateHindiShareText(item: VacancyItem, customUrl?: string): string {
  const cleanId = (item.id || '').replace(/^\//, '').replace(/\/$/, '');
  const shareUrl = customUrl && !customUrl.includes('localhost') && !customUrl.includes('.run.app')
    ? customUrl
    : `https://rajasthanvaccancy.vercel.app/?vacancy=${cleanId}`;

  const postTitle = (item.titleHi || item.title || item.shortTitleHi || item.postNameHi || 'सरकारी भर्ती')
    .replace(/:\s*Notification Released.*$/i, '')
    .trim();

  const totalPosts = item.totalPosts || 'विभिन्न पद';

  // Integrated date resolution for all posts across the portal
  const resolved = resolveJobDates(item);
  const startDateText = resolved.applyStartDate || (item.importantDates as any)?.applyStartDate || '2026-10-25';
  const lastDateText = resolved.applyLastDate || (item.importantDates as any)?.applyLastDate || '2026-11-09';

  return `🚨 *BIG अपडेट* 🚨\n\n📋 *भर्ती का नाम:* ${postTitle}\n🔢 *कुल पद:* ${totalPosts}\n💳 *आवेदन की प्रारंभ तिथि:* ${startDateText}\n⏳ *आवेदन की अंतिम तिथि:* ${lastDateText}\n\n👇 *संपूर्ण विवरण पढ़ें व ऑनलाइन फॉर्म भरें:*\n${shareUrl}`;
}

/**
 * Generate section-wise Hindi share text for WhatsApp
 */
export function generateSectionShareText(
  item: VacancyItem, 
  sectionKey: string, 
  sectionTitle?: string, 
  customUrl?: string
): string {
  const cleanId = (item.id || '').replace(/^\//, '').replace(/\/$/, '');
  const canonicalUrl = buildCanonicalUrl({ vacancyId: cleanId });
  const shareUrl = customUrl && !customUrl.includes('localhost') && !customUrl.includes('.run.app') 
    ? customUrl 
    : canonicalUrl;

  const postTitle = (item.shortTitleHi || item.postNameHi || item.titleHi || item.title).replace(/:\s*Notification Released.*$/i, '').trim();

  const startRaw = item.importantDates?.applyStartDate || item.yojanaOverview?.applyStartDate;
  const lastRaw = item.importantDates?.applyLastDate || item.yojanaOverview?.applyLastDate;
  const formattedStart = startRaw ? formatHindiDateString(startRaw).replace(/\s*\d{4}$/, '') : '';
  const formattedLast = lastRaw ? formatHindiDateString(lastRaw) : '';
  const datesText = (formattedStart && formattedLast) 
    ? `${formattedStart} ${formattedLast} तक` 
    : (formattedLast ? `अंतिम तिथि ${formattedLast}` : 'प्रक्रिया जल्द शुरू');

  switch (sectionKey) {
    case 'dates': {
      return `🔥 *${postTitle} का महत्वपूर्ण तिथियाँ एवं आवेदन शुल्क अपडेट*\n` +
        `• नोटिफिकेशन: ${item.importantDates?.notificationDate || 'जारी'}\n` +
        `• आवेदन: ${datesText}\n` +
        `👇👇\n${shareUrl}`;
    }

    case 'qualification': {
      const qual = item.qualificationDetailsHi || item.qualificationDetails || '10वीं / 12वीं / स्नातक पास';
      return `🔥 *${postTitle} - शैक्षणिक योग्यता*\n` +
        `• पात्रता: ${qual}\n` +
        `• आवेदन: ${datesText}\n` +
        `👇👇\n${shareUrl}`;
    }

    case 'age_limit': {
      const min = item.ageLimit?.min || 18;
      const max = item.ageLimit?.max || 40;
      return `🔥 *${postTitle} - आयु सीमा (Age Limit)*\n` +
        `• न्यूनतम: ${min} वर्ष, अधिकतम: ${max} वर्ष (छूट नियमानुसार)\n` +
        `• आवेदन: ${datesText}\n` +
        `👇👇\n${shareUrl}`;
    }

    case 'documents': {
      return `🔥 *${postTitle} - आवश्यक दस्तावेज लिस्ट*\n` +
        `• 10वीं/12वीं अंकतालिका, फोटो, हस्ताक्षर, आधार कार्ड\n` +
        `• आवेदन: ${datesText}\n` +
        `👇👇\n${shareUrl}`;
    }

    case 'how_to_apply': {
      return `🔥 *${postTitle} - आवेदन कैसे करें (Step-by-Step)*\n` +
        `• ऑनलाइन आवेदन निर्धारित अंतिम तिथि से पूर्व करें\n` +
        `• आवेदन: ${datesText}\n` +
        `👇👇\n${shareUrl}`;
    }

    case 'important_links': {
      return `🔥 *${postTitle} का महत्वपूर्ण लिंक्स (Apply Online & Notification PDF)*\n` +
        `• आवेदन: ${datesText}\n` +
        `👇 डायरेक्ट लिंक से आवेदन करें:\n${shareUrl}`;
    }

    case 'overview': {
      return `🔥 *${postTitle} का संक्षिप्त विवरण*\n` +
        `• संस्था: ${item.department || item.organization}\n` +
        `• आवेदन: ${datesText}\n` +
        `👇👇\n${shareUrl}`;
    }

    case 'latest_news': {
      return `🔥 *${postTitle} का लेटेस्ट न्यूज़ एवं ताज़ा अपडेट*\n` +
        `• आवेदन: ${datesText}\n` +
        `👇👇\n${shareUrl}`;
    }

    default: {
      const title = sectionTitle ? `${postTitle} - ${sectionTitle}` : `${postTitle} का नोटिफिकेशन जारी, आवेदन ${datesText}`;
      return `🔥 *${title}*\n👇👇\n${shareUrl}`;
    }
  }
}
