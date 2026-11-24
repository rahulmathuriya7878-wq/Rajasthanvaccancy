'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Trash2,
  Bold,
  List,
  ListOrdered,
  Heading2,
  Image as ImageIcon,
  Download,
  Cloud,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Link2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePortal } from '@/context/PortalContext';
import {
  convertImageFileToWebP,
  formatBytesCompact,
  type WebPConversionResult,
} from '@/utils/adminPostUtils';
import { DEFAULT_PRODUCTION_ORIGIN } from '@/utils/seoCanonical';
import { copyTextToClipboard } from '@/utils/shareUtils';
import type {
  BoardType,
  CategoryType,
  DirectLinkItem,
  JobStatusType,
  PostBreakdownItem,
  QualificationType,
  VacancyItem,
} from '@/types';

type BuilderTab = 'basic' | 'dates_fees' | 'links_media' | 'content' | 'seo';

interface KeyValueRow {
  id: string;
  key: string;
  value: string;
}

interface CustomLinkRow {
  id: string;
  label: string;
  actionText: string;
  url: string;
  isPdf: boolean;
}

interface PostRow {
  id: string;
  postNameHi: string;
  categoryOrSubjectHi: string;
  postsCount: string;
  qualificationHi: string;
  payLevel: string;
}

interface FaqRow {
  id: string;
  qHi: string;
  aHi: string;
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

const TABS: { key: BuilderTab; label: string }[] = [
  { key: 'basic', label: '1. Quick Post Form (मुख्य फॉर्म)' },
  { key: 'dates_fees', label: '2. Extra Dates & Fees' },
  { key: 'links_media', label: '3. Extra Links & WebP' },
  { key: 'content', label: '4. Post Tables & FAQs' },
  { key: 'seo', label: '5. SEO & Indexing' },
];

const CATEGORIES: { value: CategoryType; label: string; defaultStatus: JobStatusType }[] = [
  { value: 'latest_job', label: 'Latest Jobs (सरकारी नौकरी)', defaultStatus: 'active' },
  { value: 'admit_card', label: 'Admit Card (प्रवेश पत्र)', defaultStatus: 'admit_card_out' },
  { value: 'result', label: 'Result (परीक्षा परिणाम)', defaultStatus: 'result_declared' },
  { value: 'exam_date', label: 'Exam Date (परीक्षा तिथि)', defaultStatus: 'active' },
  { value: 'news', label: 'Latest News (ताज़ा समाचार)', defaultStatus: 'active' },
  { value: 'scheme', label: 'Sarkari Yojana (सरकारी योजना)', defaultStatus: 'active' },
  { value: 'answer_key', label: 'Answer Key (उत्तर कुंजी)', defaultStatus: 'answer_key_out' },
  { value: 'syllabus', label: 'Syllabus (पाठ्यक्रम)', defaultStatus: 'active' },
];

const BOARDS: BoardType[] = [
  'RSMSSB',
  'RPSC',
  'Rajasthan Police',
  'Rajasthan High Court',
  'Education Department',
  'Discom / RVUNL',
  'Health RUHS / NHM',
  'Central Govt',
  'Railway Board',
  'UGC NET',
  'Sarkari Yojana',
];

const QUALIFICATIONS: QualificationType[] = [
  '10th',
  '12th',
  'Graduate',
  'PostGraduate',
  'B.Ed/BSTC',
  'ITI/Diploma',
  'Engineering',
  'Medical',
];

function getTodayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function makeSlug(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]+/g, ' ')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
  return s || `vacancy-${Date.now()}`;
}

function sanitizeHttpUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return '';
  return `https://${trimmed}`;
}

function makeRowId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const PostBuilderClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit')?.trim() || null;

  const { user, isCloudAdmin, getAdminAuthHeaders } = useAuth();
  const { vacancies, handleUpdateVacancy, handleDeleteVacancy, showToast } = usePortal();

  const existingPost = useMemo(
    () => (editId ? vacancies.find((v) => v.id === editId) || null : null),
    [editId, vacancies]
  );

  const todayIso = useMemo(() => getTodayIso(), []);
  const [activeTab, setActiveTab] = useState<BuilderTab>('basic');

  // Basic Info
  const [category, setCategory] = useState<CategoryType>('latest_job');
  const [status, setStatus] = useState<JobStatusType>('active');
  const [titleHi, setTitleHi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [organization, setOrganization] = useState<BoardType>('RSMSSB');
  const [department, setDepartment] = useState('');
  const [postName, setPostName] = useState('');
  const [totalPosts, setTotalPosts] = useState('');
  const [applicationMode, setApplicationMode] = useState('Online (ऑनलाइन)');
  const [advtNo, setAdvtNo] = useState('');
  const [jobLocation, setJobLocation] = useState('Rajasthan (राजस्थान)');

  // Dynamic Key-Value Tables: Dates & Fees
  const [dateRows, setDateRows] = useState<KeyValueRow[]>([
    { id: 'd-notif', key: 'Notification Released', value: todayIso },
    { id: 'd-start', key: 'Apply Start Date', value: todayIso },
    { id: 'd-last', key: 'Apply Last Date', value: '' },
    { id: 'd-exam', key: 'Exam / Admit Card Date', value: 'To be announced' },
  ]);

  const [feeRows, setFeeRows] = useState<KeyValueRow[]>([
    { id: 'f-gen', key: 'General / OBC (CL)', value: '₹600/-' },
    { id: 'f-sc', key: 'SC / ST / OBC (NCL) / EWS / PwD', value: '₹400/-' },
  ]);

  const [ageMin, setAgeMin] = useState('18');
  const [ageMax, setAgeMax] = useState('40');
  const [ageAsOnDate, setAgeAsOnDate] = useState('2026-01-01');
  const [ageRelaxation, setAgeRelaxation] = useState('आरक्षित वर्गों को नियमानुसार अधिकतम आयु सीमा में छूट देय है।');
  const [salary, setSalary] = useState('');

  // Links & WebP Media
  const [applyOnlineUrl, setApplyOnlineUrl] = useState('');
  const [notificationPdfUrl, setNotificationPdfUrl] = useState('');
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState('');
  const [customLinks, setCustomLinks] = useState<CustomLinkRow[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [webpResult, setWebpResult] = useState<WebPConversionResult | null>(null);
  const [webpQuality, setWebpQuality] = useState(0.82);
  const [webpConverting, setWebpConverting] = useState(false);

  // Content & Tables
  const [qualifications, setQualifications] = useState<QualificationType[]>(['Graduate']);
  const [qualificationDetails, setQualificationDetails] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');
  const [selectionProcessText, setSelectionProcessText] = useState(
    'लिखित परीक्षा (Written Exam)\nदस्तावेज़ सत्यापन (Document Verification)\nअंतिम मेरिट सूची (Final Merit List)'
  );
  const [howToApplyText, setHowToApplyText] = useState('');
  const [requiredDocsText, setRequiredDocsText] = useState('');
  const [postalAddressHi, setPostalAddressHi] = useState('');
  const [postRows, setPostRows] = useState<PostRow[]>([]);
  const [faqRows, setFaqRows] = useState<FaqRow[]>([]);

  // SEO & Indexing
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeywords, setFocusKeywords] = useState('rajasthan vacancy 2026, sarkari job');
  const [isNew, setIsNew] = useState(true);
  const [isHot, setIsHot] = useState(true);

  // Submit & Feedback State
  const [savingMode, setSavingMode] = useState<'draft' | 'publish' | null>(null);
  const [deletingPost, setDeletingPost] = useState(false);
  const [confirmDeletePost, setConfirmDeletePost] = useState(false);
  const [indexingNow, setIndexingNow] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    slug: string;
    synced: boolean;
    revalidated: boolean;
    indexed: boolean;
    gscInspectUrl?: string;
  } | null>(null);

  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const hydratedEditIdRef = useRef<string | null>(null);

  // Hydrate existing post when editing via ?edit=<id>
  useEffect(() => {
    if (!existingPost || hydratedEditIdRef.current === existingPost.id) return;
    hydratedEditIdRef.current = existingPost.id;

    setCategory(existingPost.category);
    setStatus(existingPost.status);
    setTitleHi(existingPost.titleHi || '');
    setTitleEn(existingPost.title || '');
    setSlug(existingPost.id);
    setSlugTouched(true);
    setOrganization(existingPost.organization || 'RSMSSB');
    setDepartment(existingPost.departmentHi || existingPost.department || '');
    setPostName(existingPost.postNameHi || existingPost.postName || '');
    setTotalPosts(String(existingPost.totalPosts ?? ''));
    setApplicationMode(existingPost.applicationMode || 'Online (ऑनलाइन)');
    setAdvtNo(existingPost.advtNo || '');
    setJobLocation(existingPost.jobLocation || 'Rajasthan');

    // Hydrate Date Rows
    const hydratedDates: KeyValueRow[] = [];
    const imp = existingPost.importantDates || {};
    if (imp.notificationDate) hydratedDates.push({ id: makeRowId('d'), key: 'Notification Released', value: String(imp.notificationDate) });
    if (imp.applyStartDate) hydratedDates.push({ id: makeRowId('d'), key: 'Apply Start Date', value: String(imp.applyStartDate) });
    if (imp.applyLastDate) hydratedDates.push({ id: makeRowId('d'), key: 'Apply Last Date', value: String(imp.applyLastDate) });
    if (imp.feeLastDate) hydratedDates.push({ id: makeRowId('d'), key: 'Fee Last Date', value: String(imp.feeLastDate) });
    if (imp.examDate) hydratedDates.push({ id: makeRowId('d'), key: 'Exam / Admit Card Date', value: String(imp.examDate) });
    if (hydratedDates.length > 0) setDateRows(hydratedDates);

    // Hydrate Fee Rows
    if (Array.isArray(existingPost.applicationFee) && existingPost.applicationFee.length > 0) {
      setFeeRows(
        existingPost.applicationFee.map((f: any) => ({
          id: makeRowId('f'),
          key: String(f.category || 'Category'),
          value: String(f.amount || ''),
        }))
      );
    }

    if (existingPost.ageLimit) {
      setAgeMin(String(existingPost.ageLimit.min ?? 18));
      setAgeMax(String(existingPost.ageLimit.max ?? 40));
      setAgeAsOnDate(existingPost.ageLimit.asOnDate || '2026-01-01');
      setAgeRelaxation(existingPost.ageLimit.relaxationNotesHi || existingPost.ageLimit.relaxationNotes || '');
    }
    setSalary(existingPost.salaryHi || existingPost.salary || '');

    setApplyOnlineUrl(existingPost.officialLinks?.applyOnlineUrl || '');
    setNotificationPdfUrl(existingPost.officialLinks?.notificationPdfUrl || '');
    setOfficialWebsiteUrl(existingPost.officialLinks?.officialWebsiteUrl || '');
    setFeaturedImageUrl(existingPost.featuredImage || existingPost.seoSettings?.ogImageUrl || '');

    if (Array.isArray(existingPost.directLinks)) {
      const extra = existingPost.directLinks
        .filter((l) => l.url && l.url !== existingPost.officialLinks?.applyOnlineUrl && l.url !== existingPost.officialLinks?.notificationPdfUrl && l.url !== existingPost.officialLinks?.officialWebsiteUrl)
        .map((l) => ({
          id: makeRowId('lnk'),
          label: l.label || '',
          actionText: l.actionText || 'Click Here',
          url: l.url || '',
          isPdf: Boolean(l.isPdf),
        }));
      setCustomLinks(extra);
    }

    setQualifications(existingPost.qualification?.length ? existingPost.qualification : ['Graduate']);
    setQualificationDetails(existingPost.qualificationDetailsHi || existingPost.qualificationDetails || '');
    setDescriptionHi(existingPost.descriptionHi || existingPost.description || '');
    setSelectionProcessText((existingPost.selectionProcessHi || existingPost.selectionProcess || []).join('\n'));
    setHowToApplyText((existingPost.howToApplyHi || existingPost.howToApply || []).join('\n'));
    setRequiredDocsText((existingPost.requiredDocumentsHi || existingPost.requiredDocuments || []).join('\n'));
    setPostalAddressHi(existingPost.postalAddressHi || existingPost.postalAddress || '');

    if (Array.isArray(existingPost.postBreakdown)) {
      setPostRows(
        existingPost.postBreakdown.map((p) => ({
          id: makeRowId('p'),
          postNameHi: p.postNameHi || p.postName || '',
          categoryOrSubjectHi: p.categoryOrSubjectHi || p.categoryOrSubject || '',
          postsCount: String(p.postsCount ?? ''),
          qualificationHi: p.qualificationHi || p.qualification || '',
          payLevel: p.payLevel || '',
        }))
      );
    }

    if (Array.isArray(existingPost.faqs)) {
      setFaqRows(
        existingPost.faqs.map((f) => ({
          id: makeRowId('faq'),
          qHi: f.qHi || f.q || '',
          aHi: f.aHi || f.a || '',
        }))
      );
    }

    setMetaTitle(existingPost.seoSettings?.metaTitle || '');
    setMetaDescription(existingPost.seoSettings?.metaDescription || existingPost.briefSummaryHi || '');
    setFocusKeywords((existingPost.seoSettings?.focusKeywords || existingPost.tags || []).join(', '));
    setIsNew(Boolean(existingPost.isNew));
    setIsHot(Boolean(existingPost.isHot));
  }, [existingPost]);

  const effectiveSlug = slug.trim() || (titleEn.trim() ? makeSlug(titleEn) : 'new-vacancy-2026');
  const duplicateSlug =
    !existingPost &&
    slug.trim().length > 0 &&
    vacancies.some((v) => v.id.toLowerCase() === slug.trim().toLowerCase());

  // Live Google SERP Preview calculations
  const previewTitle =
    metaTitle.trim() || `${titleHi.trim() || titleEn.trim() || 'Rajasthan Vacancy 2026 Notification'} - Rajasthan Vacancy`;
  const previewDescription =
    metaDescription.trim() ||
    `${department.trim() || organization} has released ${titleHi.trim() || titleEn.trim() || 'a new recruitment notification'}. Check total posts (${totalPosts || 'Various'}), eligibility, last date, and official apply links.`;
  const canonicalUrl = `${DEFAULT_PRODUCTION_ORIGIN}/?vacancy=${encodeURIComponent(effectiveSlug)}`;

  const titleLen = previewTitle.length;
  const descLen = previewDescription.length;
  const titleStatus = titleLen < 35 ? 'Short' : titleLen <= 65 ? 'Optimal' : 'Long';
  const descStatus = descLen < 90 ? 'Short' : descLen <= 165 ? 'Optimal' : 'Long';

  // Rich Text Formatting Helper (Safe Markdown/Structured Text Insertion — Zero XSS)
  const insertFormat = (prefix: string, suffix = '') => {
    const el = descriptionRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = descriptionHi.slice(start, end);
    const nextValue =
      descriptionHi.slice(0, start) + prefix + (selected || 'Text here') + suffix + descriptionHi.slice(end);
    setDescriptionHi(nextValue);
    window.requestAnimationFrame(() => {
      el.focus();
      const cursor = start + prefix.length + (selected || 'Text here').length + suffix.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  // Auto WebP Image Compression Handler
  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    setErrorMsg('');
    setWebpConverting(true);
    try {
      const converted = await convertImageFileToWebP(file, 1200, 630, webpQuality);
      setWebpResult(converted);
      showToast(`Compressed to WebP (${formatBytesCompact(converted.webpBytes)})`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Image compression failed.');
    } finally {
      setWebpConverting(false);
    }
  };

  const buildPayload = (targetStatus: JobStatusType): VacancyItem => {
    const finalTitleEn = (titleEn.trim() || titleHi.trim()).slice(0, 500);
    const finalTitleHi = (titleHi.trim() || titleEn.trim()).slice(0, 500);
    const finalSlug = slug.trim() || makeSlug(finalTitleEn);
    const finalDept = department.trim() || organization;

    // Extract structured importantDates from dynamic key-value table
    const importantDates: Record<string, string> = {};
    dateRows.forEach((row) => {
      const k = row.key.trim().toLowerCase();
      const v = row.value.trim();
      if (!v) return;
      if (k.includes('notif')) importantDates.notificationDate = v;
      else if (k.includes('start') || k.includes('begin')) importantDates.applyStartDate = v;
      else if (k.includes('fee')) importantDates.feeLastDate = v;
      else if (k.includes('last') || k.includes('closing')) importantDates.applyLastDate = v;
      else if (k.includes('admit')) importantDates.admitCardDate = v;
      else if (k.includes('exam')) importantDates.examDate = v;
      else importantDates[row.key.trim()] = v;
    });
    if (!importantDates.notificationDate) importantDates.notificationDate = todayIso;

    const cleanApplyUrl = sanitizeHttpUrl(applyOnlineUrl);
    const cleanNotifUrl = sanitizeHttpUrl(notificationPdfUrl);
    const cleanOfficialUrl = sanitizeHttpUrl(officialWebsiteUrl) || DEFAULT_PRODUCTION_ORIGIN;

    const directLinks: DirectLinkItem[] = [];
    if (cleanApplyUrl) {
      directLinks.push({
        label: applicationMode.toLowerCase().includes('offline')
          ? 'आवेदन फॉर्म डाउनलोड करें (Download Form)'
          : 'ऑनलाइन आवेदन करें (Apply Online)',
        actionText: applicationMode.toLowerCase().includes('offline') ? 'Download Form' : 'Apply Online',
        url: cleanApplyUrl,
        isPrimary: true,
      });
    }
    if (cleanNotifUrl) {
      directLinks.push({
        label: 'आधिकारिक नोटिफिकेशन पीडीएफ (Official Notification)',
        actionText: 'Download PDF',
        url: cleanNotifUrl,
        isPdf: true,
      });
    }
    customLinks.forEach((lnk) => {
      const safeUrl = sanitizeHttpUrl(lnk.url);
      if (lnk.label.trim() && safeUrl) {
        directLinks.push({
          label: lnk.label.trim(),
          actionText: lnk.actionText.trim() || 'Click Here',
          url: safeUrl,
          isPdf: lnk.isPdf,
        });
      }
    });
    if (sanitizeHttpUrl(officialWebsiteUrl)) {
      directLinks.push({
        label: 'आधिकारिक वेबसाइट (Official Website)',
        actionText: 'Official Website',
        url: cleanOfficialUrl,
      });
    }

    const applicationFee = feeRows
      .filter((r) => r.key.trim() || r.value.trim())
      .map((r) => ({
        category: r.key.trim() || 'Category',
        amount: r.value.trim() || 'As per notification',
      }));

    const parsedPostBreakdown: PostBreakdownItem[] = postRows
      .filter((r) => r.postNameHi.trim())
      .map((r) => ({
        postName: r.postNameHi.trim(),
        postNameHi: r.postNameHi.trim(),
        categoryOrSubject: r.categoryOrSubjectHi.trim() || undefined,
        categoryOrSubjectHi: r.categoryOrSubjectHi.trim() || undefined,
        postsCount: r.postsCount.trim() || 'Various',
        qualification: r.qualificationHi.trim() || qualificationDetails.trim() || 'As per notification',
        qualificationHi: r.qualificationHi.trim() || qualificationDetails.trim() || 'आधिकारिक नोटिफिकेशन देखें',
        payLevel: r.payLevel.trim() || undefined,
      }));

    const parsedFaqs = faqRows
      .filter((f) => f.qHi.trim() && f.aHi.trim())
      .map((f) => ({ q: f.qHi.trim(), qHi: f.qHi.trim(), a: f.aHi.trim(), aHi: f.aHi.trim() }));

    const parsedTags = focusKeywords
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedSelection = selectionProcessText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedHowToApply = howToApplyText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedDocs = requiredDocsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const numericPosts = Number(totalPosts.trim());
    const finalPosts: number | string =
      totalPosts.trim() === ''
        ? 'विभिन्न पद'
        : /^\d+$/.test(totalPosts.trim()) && !Number.isNaN(numericPosts)
          ? numericPosts
          : totalPosts.trim();

    const safeFeaturedImage = sanitizeHttpUrl(featuredImageUrl) || undefined;
    const minAgeNum = Number.isFinite(Number(ageMin)) && Number(ageMin) > 0 ? Number(ageMin) : 18;
    const maxAgeNum = Number.isFinite(Number(ageMax)) && Number(ageMax) >= minAgeNum ? Number(ageMax) : 40;

    return {
      ...(existingPost || {}),
      id: finalSlug,
      title: finalTitleEn,
      titleHi: finalTitleHi,
      shortTitle: finalTitleEn.slice(0, 80),
      shortTitleHi: finalTitleHi.slice(0, 80),
      organization,
      department: finalDept,
      departmentHi: finalDept,
      advtNo: advtNo.trim() || 'Official Notice 2026',
      category,
      totalPosts: finalPosts,
      postName: postName.trim() || finalTitleHi,
      postNameHi: postName.trim() || finalTitleHi,
      qualification: qualifications.length ? qualifications : ['Graduate'],
      qualificationDetails: qualificationDetails.trim() || 'Refer to official notification.',
      qualificationDetailsHi: qualificationDetails.trim() || 'आधिकारिक नोटिफिकेशन देखें।',
      ageLimit: {
        min: minAgeNum,
        max: maxAgeNum,
        asOnDate: ageAsOnDate.trim() || todayIso,
        relaxationNotes: ageRelaxation.trim(),
        relaxationNotesHi: ageRelaxation.trim(),
      },
      applicationFee: applicationFee.length
        ? applicationFee
        : [{ category: 'All Categories', amount: 'Refer to Notification' }],
      applicationMode: applicationMode.trim() || 'Online (ऑनलाइन)',
      importantDates,
      directLinks,
      status: targetStatus,
      salary: salary.trim() || 'As per Govt Pay Matrix',
      salaryHi: salary.trim() || 'नियमानुसार वेतनमान देय',
      jobLocation: jobLocation.trim() || 'Rajasthan',
      selectionProcess: parsedSelection.length ? parsedSelection : ['Written Exam & Document Verification'],
      selectionProcessHi: parsedSelection.length ? parsedSelection : ['लिखित परीक्षा एवं दस्तावेज़ सत्यापन'],
      tags: parsedTags.length ? parsedTags : ['rajasthan vacancy 2026'],
      officialLinks: {
        applyOnlineUrl: cleanApplyUrl || undefined,
        notificationPdfUrl: cleanNotifUrl || undefined,
        officialWebsiteUrl: cleanOfficialUrl,
      },
      isHot,
      isNew,
      isTrending: isHot,
      description: finalTitleEn,
      descriptionHi: descriptionHi.trim() || previewDescription,
      briefSummary: finalTitleEn,
      briefSummaryHi: metaDescription.trim() || previewDescription,
      postBreakdown: parsedPostBreakdown.length ? parsedPostBreakdown : undefined,
      howToApply: parsedHowToApply.length ? parsedHowToApply : undefined,
      howToApplyHi: parsedHowToApply.length ? parsedHowToApply : undefined,
      requiredDocuments: parsedDocs.length ? parsedDocs : undefined,
      requiredDocumentsHi: parsedDocs.length ? parsedDocs : undefined,
      postalAddress: postalAddressHi.trim() || undefined,
      postalAddressHi: postalAddressHi.trim() || undefined,
      faqs: parsedFaqs.length ? parsedFaqs : undefined,
      featuredImage: safeFeaturedImage,
      seoSettings: {
        metaTitle: metaTitle.trim() || previewTitle,
        metaDescription: metaDescription.trim() || previewDescription,
        focusKeywords: parsedTags,
        canonicalUrl,
        ogImageUrl: safeFeaturedImage,
      },
      addedAtMs: existingPost?.addedAtMs || Date.now(),
      updatedAt: todayIso,
      createdAt: existingPost?.createdAt || todayIso,
    };
  };

  /**
   * Maps PostBuilderClient form fields (Title, Slug, Category, Dates, Links, Total Posts,
   * Qualification, Description) directly to a Firestore `jobs` collection document (`/jobs/{slug}`).
   */
  const mapFormFieldsToFirestoreJob = (targetStatus: JobStatusType = status) => {
    const vacancyPayload = buildPayload(targetStatus);
    const qualSummary = [
      vacancyPayload.qualification.join(', '),
      vacancyPayload.qualificationDetailsHi || vacancyPayload.qualificationDetails,
    ]
      .filter(Boolean)
      .join(' — ');

    return {
      collection: 'jobs',
      docPath: `jobs/${vacancyPayload.id}`,
      data: {
        jobId: vacancyPayload.id,
        slug: vacancyPayload.id,
        title: vacancyPayload.title,
        titleHi: vacancyPayload.titleHi,
        category: vacancyPayload.category,
        totalPosts: String(vacancyPayload.totalPosts ?? 'विभिन्न पद'),
        qualification: qualSummary || 'As per notification',
        dates: {
          startDate: vacancyPayload.importantDates?.applyStartDate || '',
          lastDate: vacancyPayload.importantDates?.applyLastDate || '',
          notificationDate: vacancyPayload.importantDates?.notificationDate || todayIso,
          examDate:
            vacancyPayload.importantDates?.examDate ||
            vacancyPayload.importantDates?.admitCardDate ||
            '',
        },
        links: {
          applyOnlineUrl: vacancyPayload.officialLinks?.applyOnlineUrl || '',
          notificationPdfUrl: vacancyPayload.officialLinks?.notificationPdfUrl || '',
          officialWebsiteUrl: vacancyPayload.officialLinks?.officialWebsiteUrl || '',
        },
        description: vacancyPayload.descriptionHi || vacancyPayload.description || '',
        status: vacancyPayload.status,
        payload: vacancyPayload,
        updatedByUid: user?.uid || 'admin',
        createdAt: existingPost?.createdAt || todayIso,
        updatedAt: todayIso,
      },
    };
  };

  const handleDeleteCurrentJob = async () => {
    if (!existingPost) return;
    setDeletingPost(true);
    setErrorMsg('');
    try {
      const deletingId = existingPost.id;
      await handleDeleteVacancy(deletingId);
      try {
        const headers = await getAdminAuthHeaders();
        await fetch('/api/admin/revalidate', {
          method: 'POST',
          headers,
          body: JSON.stringify({ slug: deletingId }),
        });
      } catch {}
      setConfirmDeletePost(false);
      router.push('/admin');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete job post.');
    } finally {
      setDeletingPost(false);
    }
  };

  const handleSaveOrPublish = async (mode: 'draft' | 'publish') => {
    setErrorMsg('');
    setSuccessInfo(null);

    if (!titleHi.trim() && !titleEn.trim()) {
      setErrorMsg('Post title (Hindi or English) is required.');
      setActiveTab('basic');
      return;
    }

    const candidateSlug = slug.trim() || makeSlug(titleEn.trim() || titleHi.trim());
    if (!VALID_ID_REGEX.test(candidateSlug)) {
      setErrorMsg('URL Slug may only contain letters, numbers, hyphens, or underscores (max 128 chars).');
      setActiveTab('basic');
      return;
    }

    setSavingMode(mode);
    try {
      const targetStatus: JobStatusType = mode === 'draft' ? 'upcoming' : status === 'upcoming' ? 'active' : status;
      const payload = buildPayload(targetStatus);
      const cloudRes = await handleUpdateVacancy(payload);

      let revalidated = false;
      let indexed = false;
      let gscInspectUrl: string | undefined;

      const headers = await getAdminAuthHeaders();

      // Trigger On-Demand Revalidation
      try {
        const revRes = await fetch('/api/admin/revalidate', {
          method: 'POST',
          headers,
          body: JSON.stringify({ slug: payload.id }),
        });
        revalidated = revRes.ok;
      } catch {}

      // Trigger Protected Instant Indexing API on Publish
      if (mode === 'publish') {
        try {
          const idxRes = await fetch('/api/admin/index-url', {
            method: 'POST',
            headers,
            body: JSON.stringify({ slug: payload.id }),
          });
          if (idxRes.ok) {
            const idxData = await idxRes.json();
            indexed = Boolean(idxData.ok);
            gscInspectUrl = idxData.gscInspectUrl;
          }
        } catch {}
      }

      setSuccessInfo({
        slug: payload.id,
        synced: cloudRes.synced,
        revalidated,
        indexed,
        gscInspectUrl,
      });

      if (!cloudRes.synced && cloudRes.reason !== 'auth_required') {
        setErrorMsg(cloudRes.message || 'Cloud sync warning.');
      }
    } finally {
      setSavingMode(null);
    }
  };

  const handleDirectIndexTrigger = async () => {
    setIndexingNow(true);
    setErrorMsg('');
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('/api/admin/index-url', {
        method: 'POST',
        headers,
        body: JSON.stringify({ slug: effectiveSlug }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSuccessInfo((prev) => ({
          slug: effectiveSlug,
          synced: prev?.synced ?? true,
          revalidated: prev?.revalidated ?? true,
          indexed: true,
          gscInspectUrl: data.gscInspectUrl,
        }));
        showToast('Instant indexing ping sent.');
      } else {
        setErrorMsg(data.error || 'Sign in with verified Google Admin to use /api/admin/index-url.');
      }
    } catch {
      setErrorMsg('Failed to contact indexing endpoint.');
    } finally {
      setIndexingNow(false);
    }
  };

  const [codeFormatTab, setCodeFormatTab] = useState<'json' | 'markdown'>('json');
  const [copiedCodeType, setCopiedCodeType] = useState<'json' | 'markdown' | null>(null);

  const getStartDateValue = (): string => {
    const found = dateRows.find((r) => {
      const k = r.key.toLowerCase();
      return k.includes('start') || k.includes('begin');
    });
    return found?.value || '';
  };

  const setStartDateValue = (val: string) => {
    setDateRows((prev) => {
      const idx = prev.findIndex((r) => {
        const k = r.key.toLowerCase();
        return k.includes('start') || k.includes('begin');
      });
      if (idx >= 0) {
        return prev.map((r, i) => (i === idx ? { ...r, value: val } : r));
      }
      return [...prev, { id: makeRowId('d'), key: 'Apply Start Date', value: val }];
    });
  };

  const getLastDateValue = (): string => {
    const found = dateRows.find((r) => {
      const k = r.key.toLowerCase();
      return k.includes('last') || k.includes('closing');
    });
    return found?.value || '';
  };

  const setLastDateValue = (val: string) => {
    setDateRows((prev) => {
      const idx = prev.findIndex((r) => {
        const k = r.key.toLowerCase();
        return k.includes('last') || k.includes('closing');
      });
      if (idx >= 0) {
        return prev.map((r, i) => (i === idx ? { ...r, value: val } : r));
      }
      return [...prev, { id: makeRowId('d'), key: 'Apply Last Date', value: val }];
    });
  };

  const buildMarkdownOutput = (): string => {
    const payload = buildPayload(status);
    const catObj = CATEGORIES.find((c) => c.value === payload.category);
    const lines: string[] = [
      `# ${payload.titleHi || payload.title}`,
      payload.title && payload.title !== payload.titleHi ? `**${payload.title}**` : '',
      '',
      `- **URL Slug:** \`${payload.id}\``,
      `- **कैटेगरी (Category):** ${catObj?.label || payload.category}`,
      `- **विभाग / बोर्ड (Department):** ${payload.departmentHi || payload.department} (${payload.organization})`,
      `- **कुल पद (Total Posts):** ${payload.totalPosts}`,
      `- **योग्यता (Qualification):** ${payload.qualification.join(', ')} — ${payload.qualificationDetailsHi || payload.qualificationDetails}`,
      `- **आवेदन शुरू तिथि (Start Date):** ${payload.importantDates?.applyStartDate || '—'}`,
      `- **अंतिम तिथि (Last Date):** ${payload.importantDates?.applyLastDate || '—'}`,
      '',
      '## पूरा विवरण (Detailed Description)',
      payload.descriptionHi || payload.description || '',
      '',
      '## महत्वपूर्ण लिंक्स (Important Links)',
      `| लिंक का नाम | URL |`,
      `| :--- | :--- |`,
      payload.officialLinks?.applyOnlineUrl
        ? `| **Apply Online (ऑनलाइन आवेदन)** | ${payload.officialLinks.applyOnlineUrl} |`
        : '',
      payload.officialLinks?.notificationPdfUrl
        ? `| **Notification PDF (आधिकारिक नोटिफिकेशन)** | ${payload.officialLinks.notificationPdfUrl} |`
        : '',
      payload.officialLinks?.officialWebsiteUrl
        ? `| **Official Website (आधिकारिक वेबसाइट)** | ${payload.officialLinks.officialWebsiteUrl} |`
        : '',
    ];
    return lines.filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n').trim();
  };

  const handleCopyGeneratedCode = async (type: 'json' | 'markdown') => {
    const text =
      type === 'json'
        ? JSON.stringify(mapFormFieldsToFirestoreJob(status).data, null, 2)
        : buildMarkdownOutput();
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedCodeType(type);
      showToast(
        type === 'json'
          ? 'Firestore jobs JSON कोड कॉपी हो गया!'
          : 'तैयार Markdown कोड कॉपी हो गया!'
      );
      window.setTimeout(() => setCopiedCodeType(null), 2500);
    } else {
      showToast('कोड कॉपी करने में समस्या आई।');
    }
  };

  const renderCodeGeneratorPanel = () => {
    const mappedJob = mapFormFieldsToFirestoreJob(status);
    const codeText =
      codeFormatTab === 'json'
        ? JSON.stringify(mappedJob.data, null, 2)
        : buildMarkdownOutput();

    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#15803d]" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                Firestore `jobs` Collection Mapper &amp; 1-Click JSON / Markdown Copy
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                Target Path: /{mappedJob.docPath} · Auto-mapped from Title, Slug, Category, Dates &amp; Links
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 bg-neutral-100 rounded-lg border border-neutral-200">
              <button
                type="button"
                onClick={() => setCodeFormatTab('json')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  codeFormatTab === 'json'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                jobs JSON
              </button>
              <button
                type="button"
                onClick={() => setCodeFormatTab('markdown')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  codeFormatTab === 'markdown'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Markdown
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleCopyGeneratedCode('json')}
              className="px-3 py-1.5 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copiedCodeType === 'json' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedCodeType === 'json' ? 'JSON Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={() => void handleCopyGeneratedCode('markdown')}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copiedCodeType === 'markdown' ? (
                <Check className="w-3.5 h-3.5 text-[#15803d]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedCodeType === 'markdown' ? 'MD Copied!' : 'Copy Markdown'}</span>
            </button>
          </div>
        </div>

        <pre className="w-full max-h-64 overflow-auto rounded-lg bg-neutral-950 text-neutral-100 p-3.5 text-xs font-mono leading-relaxed select-all">
          {codeText}
        </pre>
      </div>
    );
  };

  const renderGoogleSnippetPreview = () => (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-neutral-700">Google Search Snippet Preview</h3>
        <span className="text-[11px] font-mono text-neutral-500">SERP Live</span>
      </div>

      {/* Simulated Google Result */}
      <div className="pt-2 border-t border-neutral-100 space-y-1">
        <div className="text-xs text-neutral-600 font-mono truncate">
          {canonicalUrl}
        </div>
        <div className="text-base font-semibold text-[#1a0dab] leading-snug line-clamp-2">
          {previewTitle}
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
          {previewDescription}
        </p>
      </div>

      {/* Character Counters (Tabular Numerals + Explicit Status Labels) */}
      <div className="pt-2 border-t border-neutral-100 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-neutral-500">Title Length</div>
          <div className="mt-0.5 flex items-center justify-between font-mono tabular-nums">
            <span className="font-semibold text-neutral-900">{titleLen} / 60</span>
            <span
              className={`font-sans font-semibold ${
                titleStatus === 'Optimal'
                  ? 'text-[#15803d]'
                  : titleStatus === 'Short'
                    ? 'text-amber-700'
                    : 'text-red-700'
              }`}
            >
              {titleStatus}
            </span>
          </div>
        </div>
        <div>
          <div className="text-neutral-500">Meta Description</div>
          <div className="mt-0.5 flex items-center justify-between font-mono tabular-nums">
            <span className="font-semibold text-neutral-900">{descLen} / 160</span>
            <span
              className={`font-sans font-semibold ${
                descStatus === 'Optimal'
                  ? 'text-[#15803d]'
                  : descStatus === 'Short'
                    ? 'text-amber-700'
                    : 'text-red-700'
              }`}
            >
              {descStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-20 space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            {existingPost ? 'Edit Recruitment Post' : 'New Recruitment Post Builder'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">
            {existingPost
              ? `Firestore Path: /jobs/${existingPost.id}`
              : `Firestore Target: /jobs/${effectiveSlug} · Live Sync & Revalidation`}
          </p>
        </div>
        {existingPost && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {confirmDeletePost ? (
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={deletingPost}
                  onClick={() => void handleDeleteCurrentJob()}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  {deletingPost ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{deletingPost ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
                <button
                  type="button"
                  disabled={deletingPost}
                  onClick={() => setConfirmDeletePost(false)}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeletePost(true)}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Job Post</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push('/admin/posts/new')}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 cursor-pointer whitespace-nowrap"
            >
              Start Fresh Post
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successInfo && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
            <span>
              {successInfo.synced
                ? `Saved & synced to Firestore /jobs/${successInfo.slug}`
                : 'Saved locally (sign in with Google Admin for Firestore /jobs sync)'}
              {successInfo.revalidated ? ' · Cache revalidated' : ''}
              {successInfo.indexed ? ' · Indexing dispatched' : ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/?vacancy=${encodeURIComponent(successInfo.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#15803d] hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              <span>View Live Post</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {successInfo.gscInspectUrl && (
              <a
                href={successInfo.gscInspectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-neutral-800 hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <span>GSC Inspect</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Segmented Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Split: Editor Left + Sticky Live SERP Preview Right (Desktop) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 space-y-5">
          {/* TAB 1: ALL-IN-ONE QUICK POST FORM (BASIC INFO + DATES + LINKS + RICH TEXT EDITOR) */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    कैटेगरी ड्रॉपडाउन (Category) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const next = e.target.value as CategoryType;
                      setCategory(next);
                      const found = CATEGORIES.find((c) => c.value === next);
                      if (found && !existingPost) setStatus(found.defaultStatus);
                      if (next === 'scheme') setOrganization('Sarkari Yojana');
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-900 bg-white focus:outline-none focus:border-[#15803d]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    पब्लिश स्थिति (Publish Status)
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobStatusType)}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-900 bg-white focus:outline-none focus:border-[#15803d]"
                  >
                    <option value="active">Published (Active)</option>
                    <option value="upcoming">Draft / Upcoming</option>
                    <option value="admit_card_out">Admit Card Out</option>
                    <option value="result_declared">Result Declared</option>
                    <option value="answer_key_out">Answer Key Out</option>
                    <option value="closed">Expired (Closed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  पोस्ट का शीर्षक — हिंदी (Hindi Post Title) *
                </label>
                <input
                  type="text"
                  maxLength={500}
                  value={titleHi}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitleHi(val);
                    if (!slugTouched && !titleEn.trim()) {
                      setSlug(makeSlug(val));
                    }
                  }}
                  placeholder="जोधपुर राशन डीलर भर्ती 2026: 14 दुकानों के लिए आवेदन शुरू"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  पोस्ट का शीर्षक — English (SEO Title &amp; Auto Slug) *
                </label>
                <input
                  type="text"
                  maxLength={500}
                  value={titleEn}
                  onChange={(e) => {
                    setTitleEn(e.target.value);
                    if (!slugTouched) setSlug(makeSlug(e.target.value));
                  }}
                  placeholder="Jodhpur Ration Dealer Vacancy 2026 Notification Out for 14 Posts"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    URL स्लग (Slug - टाइटल से अपने आप बनता है)
                  </label>
                  {slugTouched && !existingPost && (titleEn.trim() || titleHi.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlug(makeSlug(titleEn.trim() || titleHi.trim()));
                        setSlugTouched(false);
                      }}
                      className="text-xs font-semibold text-[#15803d] hover:underline cursor-pointer"
                    >
                      टाइटल से फिर बनाएँ (Regenerate)
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={128}
                  value={slug}
                  disabled={Boolean(existingPost)}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '-'));
                  }}
                  placeholder="jodhpur-ration-dealer-vacancy-2026"
                  className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 bg-neutral-50 font-mono text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-[#15803d] disabled:opacity-70"
                />
                {duplicateSlug && (
                  <p className="text-xs text-amber-700 font-medium mt-1">
                    इस स्लग (Slug) की पोस्ट पहले से मौजूद है — सेव करने पर यह अपडेट हो जाएगी।
                  </p>
                )}
              </div>

              {/* Total Posts, Board, Department, Qualification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    कुल पद (Total Posts) *
                  </label>
                  <input
                    type="text"
                    value={totalPosts}
                    onChange={(e) => setTotalPosts(e.target.value)}
                    placeholder="14 पद (या 2500)"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#15803d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    बोर्ड / संस्था (Board / Authority)
                  </label>
                  <select
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value as BoardType)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 bg-white focus:outline-none focus:border-[#15803d]"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    विभाग का नाम (Department Name)
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="खाद्य एवं नागरिक आपूर्ति विभाग, जोधपुर"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#15803d]"
                  />
                </div>
              </div>

              {/* Qualification Selector & Details */}
              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    योग्यता चुनें (Qualification) *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUALIFICATIONS.map((q) => {
                      const active = qualifications.includes(q);
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() =>
                            setQualifications((prev) =>
                              prev.includes(q)
                                ? prev.length > 1
                                  ? prev.filter((item) => item !== q)
                                  : prev
                                : [...prev, q]
                            )
                          }
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#15803d] text-white border-[#15803d]'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    योग्यता विवरण (Qualification Details)
                  </label>
                  <input
                    type="text"
                    value={qualificationDetails}
                    onChange={(e) => setQualificationDetails(e.target.value)}
                    placeholder="उदा. 12वीं पास / स्नातक + कंप्यूटर ज्ञान (RSCIT)"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#15803d]"
                  />
                </div>
              </div>

              {/* Start Date & Last Date */}
              <div className="border-t border-neutral-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    आवेदन शुरू तिथि (Application Start Date)
                  </label>
                  <input
                    type="text"
                    value={getStartDateValue()}
                    onChange={(e) => setStartDateValue(e.target.value)}
                    placeholder="2026-11-23 या 23 नवंबर 2026"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    आवेदन अंतिम तिथि (Application Last Date) *
                  </label>
                  <input
                    type="text"
                    value={getLastDateValue()}
                    onChange={(e) => setLastDateValue(e.target.value)}
                    placeholder="2026-12-20 या 20 दिसंबर 2026"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                  />
                </div>
              </div>

              {/* Important Links (Apply Online, Notification PDF, Official Website) */}
              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  महत्वपूर्ण लिंक्स (Important Links)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Apply Online लिंक
                    </label>
                    <input
                      type="url"
                      value={applyOnlineUrl}
                      onChange={(e) => setApplyOnlineUrl(e.target.value)}
                      placeholder="https://sso.rajasthan.gov.in/"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Notification PDF लिंक
                    </label>
                    <input
                      type="url"
                      value={notificationPdfUrl}
                      onChange={(e) => setNotificationPdfUrl(e.target.value)}
                      placeholder="https://.../notification.pdf"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Official Website लिंक
                    </label>
                    <input
                      type="url"
                      value={officialWebsiteUrl}
                      onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
                      placeholder="https://rssb.rajasthan.gov.in/"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                    />
                  </div>
                </div>
              </div>

              {/* Rich Text / Markdown Editor */}
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    पूरा विवरण लिखने के लिए Rich Text / Markdown एडिटर
                  </label>
                  <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => insertFormat('**', '**')}
                      title="Bold (**text**)"
                      className="p-1.5 rounded hover:bg-white text-neutral-700 cursor-pointer"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormat('\n## ')}
                      title="Heading (## Heading)"
                      className="p-1.5 rounded hover:bg-white text-neutral-700 cursor-pointer"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormat('\n• ')}
                      title="Bullet List"
                      className="p-1.5 rounded hover:bg-white text-neutral-700 cursor-pointer"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormat('\n1. ')}
                      title="Numbered List"
                      className="p-1.5 rounded hover:bg-white text-neutral-700 cursor-pointer"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormat('[लिंक टेक्स्ट](https://', ')')}
                      title="Insert Markdown Link"
                      className="p-1.5 rounded hover:bg-white text-neutral-700 cursor-pointer"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  ref={descriptionRef}
                  rows={6}
                  value={descriptionHi}
                  onChange={(e) => setDescriptionHi(e.target.value)}
                  placeholder="यहाँ भर्ती या योजना का पूरा विवरण, पात्रता, चयन प्रक्रिया और आवेदन के निर्देश Markdown या Rich Text में लिखें..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-900 leading-relaxed focus:outline-none focus:border-[#15803d]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: DYNAMIC KEY-VALUE TABLES (DATES & FEES) */}
          {activeTab === 'dates_fees' && (
            <div className="space-y-6">
              {/* Important Dates Key-Value Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">Important Dates Table</h2>
                    <p className="text-xs text-neutral-500">Renders automatically as a structured HTML table on the post page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDateRows((prev) => [...prev, { id: makeRowId('d'), key: '', value: '' }])}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {dateRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) =>
                          setDateRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, key: e.target.value } : r))
                          )
                        }
                        placeholder="Event label (e.g. Apply Last Date)"
                        className="sm:col-span-5 px-3 py-2 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#15803d]"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) =>
                          setDateRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r))
                          )
                        }
                        placeholder="2026-11-26 or 26 नवंबर 2026"
                        className="sm:col-span-6 px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                      />
                      <button
                        type="button"
                        onClick={() => setDateRows((prev) => prev.filter((r) => r.id !== row.id))}
                        aria-label="Remove date row"
                        className="sm:col-span-1 p-2 rounded-lg text-neutral-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">Application Fee Table</h2>
                    <p className="text-xs text-neutral-500">Saved as JSON array and displayed cleanly by category.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeeRows((prev) => [...prev, { id: makeRowId('f'), key: '', value: '' }])}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {feeRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) =>
                          setFeeRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, key: e.target.value } : r))
                          )
                        }
                        placeholder="Category (e.g. Gen / OBC)"
                        className="sm:col-span-6 px-3 py-2 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#15803d]"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) =>
                          setFeeRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r))
                          )
                        }
                        placeholder="₹600/-"
                        className="sm:col-span-5 px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                      />
                      <button
                        type="button"
                        onClick={() => setFeeRows((prev) => prev.filter((r) => r.id !== row.id))}
                        aria-label="Remove fee row"
                        className="sm:col-span-1 p-2 rounded-lg text-neutral-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Min Age</label>
                  <input
                    type="number"
                    min={14}
                    max={65}
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono tabular-nums text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Max Age</label>
                  <input
                    type="number"
                    min={18}
                    max={75}
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono tabular-nums text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Age As On Date</label>
                  <input
                    type="text"
                    value={ageAsOnDate}
                    onChange={(e) => setAgeAsOnDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono text-neutral-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Salary / Pay Scale</label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Pay Matrix Level-10 (₹33,800 – ₹1,06,700/-)"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Job Location</label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORTANT LINKS BUILDER + AUTO WEBP IMAGE OPTIMIZER */}
          {activeTab === 'links_media' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">Important Links Builder</h2>
                    <p className="text-xs text-neutral-500">Automatically generates styled action links on the live vacancy page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomLinks((prev) => [
                        ...prev,
                        { id: makeRowId('lnk'), label: '', actionText: 'Click Here', url: '', isPdf: false },
                      ])
                    }
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Link</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Apply Online / Form URL</label>
                    <input
                      type="url"
                      value={applyOnlineUrl}
                      onChange={(e) => setApplyOnlineUrl(e.target.value)}
                      placeholder="https://sso.rajasthan.gov.in/"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Official Notification PDF URL</label>
                    <input
                      type="url"
                      value={notificationPdfUrl}
                      onChange={(e) => setNotificationPdfUrl(e.target.value)}
                      placeholder="https://rsmssb.rajasthan.gov.in/notification.pdf"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Official Website URL</label>
                    <input
                      type="url"
                      value={officialWebsiteUrl}
                      onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
                      placeholder="https://rssb.rajasthan.gov.in/"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                    />
                  </div>
                </div>

                {customLinks.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {customLinks.map((lnk) => (
                      <div key={lnk.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={lnk.label}
                          onChange={(e) =>
                            setCustomLinks((prev) =>
                              prev.map((r) => (r.id === lnk.id ? { ...r, label: e.target.value } : r))
                            )
                          }
                          placeholder="Label (e.g. Download Admit Card)"
                          className="sm:col-span-4 px-3 py-2 rounded-lg border border-neutral-300 text-xs text-neutral-900"
                        />
                        <input
                          type="text"
                          value={lnk.actionText}
                          onChange={(e) =>
                            setCustomLinks((prev) =>
                              prev.map((r) => (r.id === lnk.id ? { ...r, actionText: e.target.value } : r))
                            )
                          }
                          placeholder="Button Text"
                          className="sm:col-span-2 px-3 py-2 rounded-lg border border-neutral-300 text-xs text-neutral-900"
                        />
                        <input
                          type="url"
                          value={lnk.url}
                          onChange={(e) =>
                            setCustomLinks((prev) =>
                              prev.map((r) => (r.id === lnk.id ? { ...r, url: e.target.value } : r))
                            )
                          }
                          placeholder="https://..."
                          className="sm:col-span-5 px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono text-neutral-900"
                        />
                        <button
                          type="button"
                          onClick={() => setCustomLinks((prev) => prev.filter((r) => r.id !== lnk.id))}
                          aria-label="Remove custom link"
                          className="sm:col-span-1 p-2 rounded-lg text-neutral-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto WebP Thumbnail Compressor */}
              <div className="border-t border-neutral-200 pt-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">Auto WebP Thumbnail Compressor</h2>
                    <p className="text-xs text-neutral-500">
                      Instant browser-side resize (1200×630) &amp; `.webp` compression — compatible with Cloudflare Workers &amp; mobile.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-neutral-600">
                    <label htmlFor="webp-quality">Quality {Math.round(webpQuality * 100)}%</label>
                    <input
                      id="webp-quality"
                      type="range"
                      min={0.6}
                      max={0.95}
                      step={0.05}
                      value={webpQuality}
                      onChange={(e) => setWebpQuality(Number(e.target.value))}
                      className="w-24 accent-[#15803d]"
                    />
                  </div>
                </div>

                <label className="block border border-dashed border-neutral-300 hover:border-[#15803d] rounded-xl p-5 text-center cursor-pointer transition-colors bg-neutral-50/60">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => void handleImageUpload(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                  <ImageIcon className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-neutral-800">
                    {webpConverting ? 'Compressing to WebP...' : 'Upload Thumbnail / Notification Banner (Auto WebP)'}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    PNG, JPG or WebP · Auto-scaled for OpenGraph &amp; WhatsApp Share cards
                  </div>
                </label>

                {webpResult && (
                  <div className="border border-neutral-200 rounded-xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
                      <span className="text-neutral-700">
                        {webpResult.fileName} ({webpResult.width}×{webpResult.height})
                      </span>
                      <span className="text-[#15803d] font-semibold">
                        {formatBytesCompact(webpResult.originalBytes)} → {formatBytesCompact(webpResult.webpBytes)}
                      </span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={webpResult.dataUrl}
                      alt="Compressed WebP preview"
                      referrerPolicy="no-referrer"
                      className="w-full max-h-52 object-cover rounded-lg border border-neutral-200"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={webpResult.dataUrl}
                        download={webpResult.fileName}
                        className="px-3 py-1.5 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold inline-flex items-center gap-1.5 no-underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Optimized .webp</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setWebpResult(null)}
                        className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Hosted Thumbnail / OG Image URL (HTTPS)
                  </label>
                  <input
                    type="url"
                    value={featuredImageUrl}
                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    placeholder="https://rajasthanvacancy.online/og-preview.png"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#15803d]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTENT, STRUCTURED RICH TEXT & TABLES */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Qualification Levels
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUALIFICATIONS.map((q) => {
                    const active = qualifications.includes(q);
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() =>
                          setQualifications((prev) =>
                            prev.includes(q)
                              ? prev.length > 1
                                ? prev.filter((item) => item !== q)
                                : prev
                              : [...prev, q]
                          )
                        }
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#15803d] text-white border-[#15803d]'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Eligibility / Qualification Details
                </label>
                <input
                  type="text"
                  value={qualificationDetails}
                  onChange={(e) => setQualificationDetails(e.target.value)}
                  placeholder="किसी भी मान्यता प्राप्त विश्वविद्यालय से स्नातक एवं RSCIT डिप्लोमा"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900"
                />
              </div>

              {/* Structured Rich Formatting Editor */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    Detailed Article / Instructions
                  </label>
                  <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => insertFormat('**', '**')}
                      title="Bold"
                      className="p-1.5 rounded hover:bg-white text-neutral-700 cursor-pointer"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormat('\n## ')}
                      title="Section Heading"
                      className="p-1.5 rounded hover:bg-white text-neutral-700 cursor-pointer"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormat('\n• ')}
                      title="Bullet Item"
                      className="p-1.5 rounded hover:bg-white text-neutral-700 cursor-pointer"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormat('\n1. ')}
                      title="Numbered Step"
                      className="p-1.5 rounded hover:bg-white text-neutral-700 cursor-pointer"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  ref={descriptionRef}
                  rows={6}
                  value={descriptionHi}
                  onChange={(e) => setDescriptionHi(e.target.value)}
                  placeholder="भर्ती का विस्तृत विवरण, पात्रता नियम, आवेदन निर्देश लिखें..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-900 leading-relaxed focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Selection Process (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={selectionProcessText}
                    onChange={(e) => setSelectionProcessText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    How to Apply (one step per line)
                  </label>
                  <textarea
                    rows={3}
                    value={howToApplyText}
                    onChange={(e) => setHowToApplyText(e.target.value)}
                    placeholder="आधिकारिक नोटिफिकेशन पढ़ें..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Required Documents (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={requiredDocsText}
                    onChange={(e) => setRequiredDocsText(e.target.value)}
                    placeholder="आधार कार्ड, मार्कशीट, फोटो व हस्ताक्षर..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Offline Postal Address (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={postalAddressHi}
                    onChange={(e) => setPostalAddressHi(e.target.value)}
                    placeholder="कार्यालय जिला रसद अधिकारी, जोधपुर..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900"
                  />
                </div>
              </div>

              {/* Post-wise Breakdown + FAQs Controls */}
              <div className="border-t border-neutral-200 pt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-neutral-800">Post-wise Vacancy Table &amp; SEO FAQs</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPostRows((prev) => [
                          ...prev,
                          {
                            id: makeRowId('p'),
                            postNameHi: '',
                            categoryOrSubjectHi: '',
                            postsCount: '',
                            qualificationHi: '',
                            payLevel: '',
                          },
                        ])
                      }
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Post Row</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaqRows((prev) => [...prev, { id: makeRowId('faq'), qHi: '', aHi: '' }])}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ</span>
                    </button>
                  </div>
                </div>

                {postRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={row.postNameHi}
                      onChange={(e) =>
                        setPostRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, postNameHi: e.target.value } : r))
                        )
                      }
                      placeholder="Post Name"
                      className="sm:col-span-4 px-2.5 py-2 rounded-lg border border-neutral-300 text-xs"
                    />
                    <input
                      type="text"
                      value={row.postsCount}
                      onChange={(e) =>
                        setPostRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, postsCount: e.target.value } : r))
                        )
                      }
                      placeholder="Posts"
                      className="sm:col-span-2 px-2.5 py-2 rounded-lg border border-neutral-300 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={row.qualificationHi}
                      onChange={(e) =>
                        setPostRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, qualificationHi: e.target.value } : r))
                        )
                      }
                      placeholder="Qualification"
                      className="sm:col-span-3 px-2.5 py-2 rounded-lg border border-neutral-300 text-xs"
                    />
                    <input
                      type="text"
                      value={row.payLevel}
                      onChange={(e) =>
                        setPostRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, payLevel: e.target.value } : r))
                        )
                      }
                      placeholder="Pay Level"
                      className="sm:col-span-2 px-2.5 py-2 rounded-lg border border-neutral-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setPostRows((prev) => prev.filter((r) => r.id !== row.id))}
                      aria-label="Remove post row"
                      className="sm:col-span-1 p-2 rounded-lg text-neutral-500 hover:text-red-700 flex justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {faqRows.map((faq) => (
                  <div key={faq.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={faq.qHi}
                      onChange={(e) =>
                        setFaqRows((prev) =>
                          prev.map((r) => (r.id === faq.id ? { ...r, qHi: e.target.value } : r))
                        )
                      }
                      placeholder="Question (प्रश्न)"
                      className="sm:col-span-5 px-2.5 py-2 rounded-lg border border-neutral-300 text-xs"
                    />
                    <input
                      type="text"
                      value={faq.aHi}
                      onChange={(e) =>
                        setFaqRows((prev) =>
                          prev.map((r) => (r.id === faq.id ? { ...r, aHi: e.target.value } : r))
                        )
                      }
                      placeholder="Answer (उत्तर)"
                      className="sm:col-span-6 px-2.5 py-2 rounded-lg border border-neutral-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setFaqRows((prev) => prev.filter((r) => r.id !== faq.id))}
                      aria-label="Remove FAQ"
                      className="sm:col-span-1 p-2 rounded-lg text-neutral-500 hover:text-red-700 flex justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SEO METADATA & INSTANT INDEXING */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  SEO Meta Title (Leave blank to auto-use Post Title)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={previewTitle}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Meta Description / Brief Summary (120–160 chars recommended)
                </label>
                <textarea
                  rows={3}
                  maxLength={320}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="संक्षिप्त SEO विवरण लिखें जो Google सर्च रिज़ल्ट में दिखाई देगा..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Focus Keywords / Search Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={focusKeywords}
                  onChange={(e) => setFocusKeywords(e.target.value)}
                  placeholder="jodhpur ration dealer, rajasthan vacancy 2026, sarkari naukri"
                  className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="w-4 h-4 accent-[#15803d]"
                  />
                  <span>Mark as New</span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHot}
                    onChange={(e) => setIsHot(e.target.checked)}
                    className="w-4 h-4 accent-[#15803d]"
                  />
                  <span>Highlight in Trending</span>
                </label>
              </div>

              <div className="xl:hidden pt-2">{renderGoogleSnippetPreview()}</div>

              <div className="border-t border-neutral-200 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-neutral-900">Instant Search Engine Indexing</div>
                  <p className="text-xs text-neutral-500">
                    Dispatch IndexNow &amp; Google Sitemap ping via protected `/api/admin/index-url`.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={indexingNow}
                  onClick={() => void handleDirectIndexTrigger()}
                  className="px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 disabled:opacity-60 text-xs font-semibold text-neutral-900 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {indexingNow ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-[#15803d]" />}
                  <span>{indexingNow ? 'Submitting...' : 'Ping Indexing API'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Always-Visible Sticky Live SERP Preview Column */}
        <div className="hidden xl:block xl:col-span-4 space-y-4 sticky top-20">
          {renderGoogleSnippetPreview()}

          <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="font-semibold text-neutral-900">Publish Checklist</div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>Firebase Cloud Auth</span>
              <span className={isCloudAdmin ? 'font-semibold text-[#15803d]' : 'font-semibold text-amber-700'}>
                {isCloudAdmin ? 'Connected' : 'Local Only'}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>Date Rows</span>
              <span className="font-mono tabular-nums text-neutral-900">
                {dateRows.filter((d) => d.value.trim()).length}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>Fee Rows</span>
              <span className="font-mono tabular-nums text-neutral-900">
                {feeRows.filter((f) => f.value.trim()).length}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>Direct Links</span>
              <span className="font-mono tabular-nums text-neutral-900">
                {[applyOnlineUrl, notificationPdfUrl, officialWebsiteUrl].filter((u) => u.trim()).length +
                  customLinks.filter((l) => l.url.trim()).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated JSON & Markdown Code (1-Click Copy) */}
      {renderCodeGeneratorPanel()}

      {/* Compact Sticky Bottom Action Bar (<= 56px height, mobile thumb friendly) */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 h-14 bg-white border-t border-neutral-200 px-4 sm:px-6 flex items-center justify-between gap-3 z-40">
        <div className="text-xs text-neutral-500 truncate hidden sm:block font-mono">
          /{effectiveSlug}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => void handleCopyGeneratedCode('json')}
            className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {copiedCodeType === 'json' ? (
              <Check className="w-3.5 h-3.5 text-[#15803d]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedCodeType === 'json' ? 'Copied!' : 'Copy JSON'}</span>
          </button>

          <button
            type="button"
            disabled={savingMode !== null}
            onClick={() => void handleSaveOrPublish('draft')}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-60 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {savingMode === 'draft' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savingMode === 'draft' ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            disabled={savingMode !== null}
            onClick={() => void handleSaveOrPublish('publish')}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#15803d] hover:bg-[#166534] disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {savingMode === 'publish' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Cloud className="w-3.5 h-3.5" />
            )}
            <span>{savingMode === 'publish' ? 'Publishing...' : 'Publish & Index'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostBuilderClient;
