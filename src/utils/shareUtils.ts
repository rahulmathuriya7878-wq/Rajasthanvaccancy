import { VacancyItem } from '../types';
import { resolveJobDates, formatDateDDMMYYYY } from './dateUtils';
import { DEFAULT_PRODUCTION_ORIGIN } from './seoCanonical';

export const SHARE_BASE_URL = DEFAULT_PRODUCTION_ORIGIN;
export const DEFAULT_OG_IMAGE_URL = `${SHARE_BASE_URL}/og-preview.png`;

export function getVacancyShareUrl(vacancyId?: string): string {
  if (!vacancyId) return `${SHARE_BASE_URL}/`;
  const cleanId = vacancyId.replace(/^\/+|\/+$/g, '').trim();
  return cleanId ? `${SHARE_BASE_URL}/?vacancy=${encodeURIComponent(cleanId)}` : `${SHARE_BASE_URL}/`;
}

/**
 * Returns a valid public HTTPS image URL for OpenGraph / Twitter social previews.
 * Never returns `data:` URIs because WhatsApp, Telegram, Facebook, and X reject them.
 */
export function getSocialOgImageUrl(vacancy?: VacancyItem | null): string {
  const candidates = [
    vacancy?.seoSettings?.ogImageUrl,
    (vacancy as { featuredImage?: string } | null | undefined)?.featuredImage,
    (vacancy as { imageUrl?: string } | null | undefined)?.imageUrl,
  ];

  for (const raw of candidates) {
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }
      if (trimmed.startsWith('/')) {
        return `${SHARE_BASE_URL}${trimmed}`;
      }
    }
  }

  return DEFAULT_OG_IMAGE_URL;
}

/**
 * Generate comprehensive Hindi share text for any vacancy / yojana / result / admit card
 * formatted with WhatsApp friendly bolding and emojis.
 *
 * Standard Format across all posts:
 * https://www.rajasthanvacancy.online/?vacancy=[post-slug]
 */
export function generateHindiShareText(item: VacancyItem, customUrl?: string): string {
  const cleanId = (item.id || '').replace(/^\/+|\/+$/g, '').trim();
  const isPreviewHost = Boolean(
    customUrl &&
      (customUrl.includes('localhost') ||
        customUrl.includes('127.0.0.1') ||
        customUrl.includes('.run.app') ||
        customUrl.includes('.workers.dev') ||
        customUrl.includes('.pages.dev'))
  );
  const shareUrl = customUrl && !isPreviewHost ? customUrl : getVacancyShareUrl(cleanId);

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

export function getWhatsAppShareUrl(item: VacancyItem, customUrl?: string): string {
  return `https://wa.me/?text=${encodeURIComponent(generateHindiShareText(item, customUrl))}`;
}

export function getTelegramShareUrl(item: VacancyItem, customUrl?: string): string {
  const cleanId = (item.id || '').replace(/^\/+|\/+$/g, '').trim();
  const shareUrl = customUrl && !customUrl.includes('localhost') && !customUrl.includes('.run.app')
    ? customUrl
    : getVacancyShareUrl(cleanId);
  const title = (item.titleHi || item.title || 'Rajasthan Vacancy 2026').trim();
  return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🚨 ${title}`)}`;
}

/**
 * Reliable clipboard copy helper that works across mobile WebViews, iFrames, Safari, and desktop.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to execCommand fallback
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}
