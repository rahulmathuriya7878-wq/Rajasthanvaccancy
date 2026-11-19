import { VacancyItem } from '../types';
import { resolveJobDates, formatDateDDMMYYYY } from './dateUtils';

export const SHARE_BASE_URL = 'https://www.rajasthanvacancy.online';

export function getVacancyShareUrl(vacancyId?: string): string {
  if (!vacancyId) return `${SHARE_BASE_URL}/`;
  const cleanId = vacancyId.replace(/^\/+|\/+$/g, '').trim();
  return cleanId ? `${SHARE_BASE_URL}/?vacancy=${encodeURIComponent(cleanId)}` : `${SHARE_BASE_URL}/`;
}

export function getSocialShareLinks(url: string, title: string, whatsappMessage?: string) {
  const finalUrl = url || `${SHARE_BASE_URL}/`;
  const waText = whatsappMessage || `${title}\n\n👇 पूरी जानकारी यहाँ देखें:\n${finalUrl}`;
  return {
    url: finalUrl,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(finalUrl)}`,
  };
}

/**
 * Generate comprehensive Hindi share text for any vacancy / yojana / result / admit card
 * formatted with WhatsApp friendly bolding and emojis.
 * 
 * Standard Format across all posts:
 * https://www.rajasthanvacancy.online/?vacancy=[post-slug]
 */
export function generateHindiShareText(item: VacancyItem, customUrl?: string): string {
  const cleanId = (item.id || '').replace(/^\//, '').replace(/\/$/, '');
  const shareUrl = customUrl && !customUrl.includes('localhost') && !customUrl.includes('.run.app')
    ? customUrl
    : getVacancyShareUrl(cleanId);

  const postTitle = (item.titleHi || item.title || item.shortTitleHi || item.postNameHi || 'सरकारी भर्ती')
    .replace(/:\s*Notification Released.*$/i, '')
    .trim();

  const isYojana = item.category === 'scheme';
  const totalPosts = item.totalPosts || (isYojana ? 'पात्र लाभार्थी' : 'विभिन्न पद');

  // Integrated date resolution for all posts across the portal formatted as DD/MM/YYYY
  const resolved = resolveJobDates(item);
  const rawStartDate =
    resolved.applyStartDate ||
    (item.importantDates as any)?.applyStartDate ||
    item.createdAt ||
    '2026-10-25';
  const rawLastDate =
    resolved.applyLastDate ||
    (item.importantDates as any)?.applyLastDate ||
    '2026-11-09';

  const startDateText = formatDateDDMMYYYY(rawStartDate, 'शीघ्र');
  const lastDateText = formatDateDDMMYYYY(rawLastDate, 'शीघ्र');

  if (isYojana) {
    const benefitText = item.yojanaOverview?.maxAnnualAssistance || item.salaryHi || item.salary || totalPosts;
    return `🚨 *सरकारी योजना अपडेट* 🚨\n\n📋 *योजना का नाम:* ${postTitle}\n🎁 *मुख्य लाभ / सहायता:* ${benefitText}\n💳 *आवेदन की प्रारंभ तिथि:* ${startDateText}\n⏳ *आवेदन की अंतिम तिथि:* ${lastDateText}\n\n👇 *योजना की पात्रता, दस्तावेज व ऑनलाइन आवेदन प्रक्रिया देखें:*\n${shareUrl}`;
  }

  return `🚨 *BIG अपडेट* 🚨\n\n📋 *भर्ती का नाम:* ${postTitle}\n🔢 *कुल पद:* ${totalPosts}\n💳 *आवेदन की प्रारंभ तिथि:* ${startDateText}\n⏳ *आवेदन की अंतिम तिथि:* ${lastDateText}\n\n👇 *संपूर्ण विवरण पढ़ें व ऑनलाइन फॉर्म भरें:*\n${shareUrl}`;
}
