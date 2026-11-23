'use client';

import React, { useMemo, useState } from 'react';
import {
  X,
  PlusCircle,
  Cloud,
  CloudOff,
  AlertCircle,
  Link2,
  Calendar,
  FileText,
  Trash2,
  Plus,
  Loader2,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { CloudSyncResult } from '../services/vacancyCloudSync';
import { getCanonicalOrigin } from '../utils/seoCanonical';
import type {
  BoardType,
  CategoryType,
  DirectLinkItem,
  JobStatusType,
  LanguageMode,
  PostBreakdownItem,
  QualificationType,
  VacancyItem,
} from '../types';

interface AddVacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
  existingVacancies: VacancyItem[];
  onPublishVacancy: (vacancy: VacancyItem) => Promise<CloudSyncResult>;
  onSelectVacancy: (vacancy: VacancyItem) => void;
}

interface ExtraLinkRow {
  id: string;
  label: string;
  actionText: string;
  url: string;
  isPdf: boolean;
}

interface PostBreakdownRow {
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

const CATEGORY_OPTIONS: { value: CategoryType; labelHi: string; labelEn: string; defaultStatus: JobStatusType }[] = [
  { value: 'latest_job', labelHi: 'सरकारी नौकरी (Latest Jobs)', labelEn: 'Latest Jobs', defaultStatus: 'active' },
  { value: 'admit_card', labelHi: 'एडमिट कार्ड (Admit Card)', labelEn: 'Admit Card', defaultStatus: 'admit_card_out' },
  { value: 'result', labelHi: 'रिजल्ट (Results)', labelEn: 'Results', defaultStatus: 'result_declared' },
  { value: 'exam_date', labelHi: 'परीक्षा तिथि (Exam Date)', labelEn: 'Exam Date', defaultStatus: 'active' },
  { value: 'news', labelHi: 'लेटेस्ट न्यूज़ (Latest News)', labelEn: 'Latest News', defaultStatus: 'active' },
  { value: 'scheme', labelHi: 'सरकारी योजना (Sarkari Yojana)', labelEn: 'Sarkari Yojana', defaultStatus: 'active' },
  { value: 'answer_key', labelHi: 'उत्तर कुंजी (Answer Key)', labelEn: 'Answer Key', defaultStatus: 'answer_key_out' },
  { value: 'syllabus', labelHi: 'सिलेबस (Syllabus)', labelEn: 'Syllabus', defaultStatus: 'active' },
];

const BOARD_OPTIONS: BoardType[] = [
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

const STATUS_OPTIONS: { value: JobStatusType; labelHi: string; labelEn: string }[] = [
  { value: 'active', labelHi: 'आवेदन चालू (Active)', labelEn: 'Active' },
  { value: 'upcoming', labelHi: 'आगामी (Upcoming)', labelEn: 'Upcoming' },
  { value: 'admit_card_out', labelHi: 'एडमिट कार्ड जारी (Admit Card Out)', labelEn: 'Admit Card Out' },
  { value: 'result_declared', labelHi: 'रिजल्ट जारी (Result Declared)', labelEn: 'Result Declared' },
  { value: 'answer_key_out', labelHi: 'उत्तर कुंजी जारी (Answer Key Out)', labelEn: 'Answer Key Out' },
  { value: 'closed', labelHi: 'आवेदन समाप्त (Closed)', labelEn: 'Closed' },
];

const QUALIFICATION_OPTIONS: QualificationType[] = [
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
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateSlugFromTitle(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]+/g, ' ')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
  if (cleaned) return cleaned;
  return `vacancy-${Date.now()}`;
}

function sanitizeHttpUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    // Reject non-http(s) protocols such as javascript: or data:
    return '';
  }
  return `https://${trimmed}`;
}

export const AddVacancyModal: React.FC<AddVacancyModalProps> = ({
  isOpen,
  onClose,
  lang,
  existingVacancies,
  onPublishVacancy,
  onSelectVacancy,
}) => {
  const isHi = lang === 'hi';
  const { user, isCloudAdmin, signInWithGoogle } = useAuth();
  const todayIso = useMemo(() => getTodayIso(), []);

  // Core Post Details
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
  const [advtNo, setAdvtNo] = useState('');
  const [applicationMode, setApplicationMode] = useState('Online (ऑनलाइन)');
  const [jobLocation, setJobLocation] = useState('Rajasthan (राजस्थान)');

  // Important Dates
  const [notificationDate, setNotificationDate] = useState(todayIso);
  const [applyStartDate, setApplyStartDate] = useState(todayIso);
  const [applyLastDate, setApplyLastDate] = useState('');
  const [examDate, setExamDate] = useState('');

  // Eligibility, Age, Fee & Salary
  const [qualifications, setQualifications] = useState<QualificationType[]>(['Graduate']);
  const [qualificationDetails, setQualificationDetails] = useState('');
  const [ageMin, setAgeMin] = useState('18');
  const [ageMax, setAgeMax] = useState('40');
  const [ageAsOnDate, setAgeAsOnDate] = useState('2026-01-01');
  const [ageRelaxation, setAgeRelaxation] = useState('नियमानुसार आरक्षित वर्गों को अधिकतम आयु सीमा में छूट देय होगी।');
  const [applicationFeeText, setApplicationFeeText] = useState(
    'सामान्य / ओबीसी / ईडब्ल्यूएस: ₹600/-\nएससी / एसटी / दिव्यांग: ₹400/-'
  );
  const [salary, setSalary] = useState('');

  // Links
  const [applyOnlineUrl, setApplyOnlineUrl] = useState('');
  const [notificationPdfUrl, setNotificationPdfUrl] = useState('');
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState('');
  const [extraLinks, setExtraLinks] = useState<ExtraLinkRow[]>([]);

  // Summary, Description, Selection & Tags
  const [briefSummaryHi, setBriefSummaryHi] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');
  const [selectionProcessText, setSelectionProcessText] = useState(
    'लिखित परीक्षा (Written Exam)\nदस्तावेज़ सत्यापन (Document Verification)\nअंतिम मेरिट सूची (Final Merit List)'
  );
  const [tagsText, setTagsText] = useState('rajasthan vacancy 2026, govt jobs');
  const [isHot, setIsHot] = useState(true);
  const [isNew, setIsNew] = useState(true);

  // Section 6: Detailed / Expanded Post Content (Post Breakdown, How to Apply, Documents, Offline Postal Address, FAQs)
  const [postBreakdownRows, setPostBreakdownRows] = useState<PostBreakdownRow[]>([]);
  const [howToApplyText, setHowToApplyText] = useState('');
  const [requiredDocsText, setRequiredDocsText] = useState('');
  const [postalAddressHi, setPostalAddressHi] = useState('');
  const [envelopeNoteHi, setEnvelopeNoteHi] = useState('');
  const [faqRows, setFaqRows] = useState<FaqRow[]>([]);

  // Submission & Auth state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cloudWarningMsg, setCloudWarningMsg] = useState('');
  const [lastCreatedVacancy, setLastCreatedVacancy] = useState<VacancyItem | null>(null);

  const existingIdsSet = useMemo(
    () => new Set(existingVacancies.map((v) => v.id.toLowerCase())),
    [existingVacancies]
  );

  const normalizedSlug = slug.trim();
  const isDuplicateSlug = normalizedSlug.length > 0 && existingIdsSet.has(normalizedSlug.toLowerCase());
  const isSlugValid = normalizedSlug.length > 0 && VALID_ID_REGEX.test(normalizedSlug);

  if (!isOpen) return null;

  const handleTitleEnChange = (val: string) => {
    setTitleEn(val);
    if (!slugTouched) {
      setSlug(generateSlugFromTitle(val));
    }
    setErrorMsg('');
  };

  const handleCategoryChange = (nextCat: CategoryType) => {
    setCategory(nextCat);
    const found = CATEGORY_OPTIONS.find((c) => c.value === nextCat);
    if (found) {
      setStatus(found.defaultStatus);
    }
    if (nextCat === 'scheme') {
      setOrganization('Sarkari Yojana');
    }
  };

  const toggleQualification = (q: QualificationType) => {
    setQualifications((prev) =>
      prev.includes(q) ? (prev.length > 1 ? prev.filter((item) => item !== q) : prev) : [...prev, q]
    );
  };

  const addExtraLink = () => {
    setExtraLinks((prev) => [
      ...prev,
      {
        id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: '',
        actionText: 'Click Here',
        url: '',
        isPdf: false,
      },
    ]);
  };

  const updateExtraLink = (id: string, patch: Partial<ExtraLinkRow>) => {
    setExtraLinks((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeExtraLink = (id: string) => {
    setExtraLinks((prev) => prev.filter((row) => row.id !== id));
  };

  const addPostBreakdownRow = () => {
    setPostBreakdownRows((prev) => [
      ...prev,
      {
        id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        postNameHi: '',
        categoryOrSubjectHi: '',
        postsCount: '',
        qualificationHi: '',
        payLevel: '',
      },
    ]);
  };

  const updatePostBreakdownRow = (id: string, patch: Partial<PostBreakdownRow>) => {
    setPostBreakdownRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removePostBreakdownRow = (id: string) => {
    setPostBreakdownRows((prev) => prev.filter((row) => row.id !== id));
  };

  const addFaqRow = () => {
    setFaqRows((prev) => [
      ...prev,
      {
        id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        qHi: '',
        aHi: '',
      },
    ]);
  };

  const updateFaqRow = (id: string, patch: Partial<FaqRow>) => {
    setFaqRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeFaqRow = (id: string) => {
    setFaqRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleInlineGoogleLogin = async () => {
    setErrorMsg('');
    setCloudWarningMsg('');
    setIsGoogleSigningIn(true);
    try {
      const res = await signInWithGoogle();
      if (!res.ok) {
        setErrorMsg(res.error || (isHi ? 'Google लॉगिन पूरा नहीं हो सका।' : 'Google sign-in failed.'));
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const buildVacancyItem = (): VacancyItem => {
    const finalTitleEn = (titleEn.trim() || titleHi.trim()).slice(0, 500);
    const finalTitleHi = (titleHi.trim() || titleEn.trim()).slice(0, 500);
    const finalSlug = normalizedSlug || generateSlugFromTitle(finalTitleEn);
    const finalDepartment = department.trim() || organization;
    const finalPostName = postName.trim() || finalTitleHi;
    const finalTotalPostsRaw = totalPosts.trim();
    const numericPosts = Number(finalTotalPostsRaw);
    const finalTotalPosts: number | string =
      finalTotalPostsRaw === ''
        ? 'विभिन्न पद'
        : !Number.isNaN(numericPosts) && /^\d+$/.test(finalTotalPostsRaw)
          ? numericPosts
          : finalTotalPostsRaw;

    const cleanApplyUrl = sanitizeHttpUrl(applyOnlineUrl);
    const cleanNotifUrl = sanitizeHttpUrl(notificationPdfUrl);
    const cleanOfficialUrl = sanitizeHttpUrl(officialWebsiteUrl) || getCanonicalOrigin();

    // Build Direct Links list for Important Links table
    const directLinks: DirectLinkItem[] = [];
    if (cleanApplyUrl) {
      directLinks.push({
        label: applicationMode.toLowerCase().includes('offline')
          ? 'आवेदन फॉर्म डाउनलोड करें (Download Offline Form / Apply)'
          : 'ऑनलाइन आवेदन लिंक (Apply Online)',
        actionText: applicationMode.toLowerCase().includes('offline') ? 'Download Form' : 'Apply Online',
        url: cleanApplyUrl,
        isPrimary: true,
      });
    }
    if (cleanNotifUrl) {
      directLinks.push({
        label: 'आधिकारिक नोटिफिकेशन पीडीएफ (Official Notification PDF)',
        actionText: 'Download PDF',
        url: cleanNotifUrl,
        isPdf: true,
      });
    }
    extraLinks.forEach((row) => {
      const safeUrl = sanitizeHttpUrl(row.url);
      if (row.label.trim() && safeUrl) {
        directLinks.push({
          label: row.label.trim(),
          actionText: row.actionText.trim() || 'Click Here',
          url: safeUrl,
          isPdf: row.isPdf,
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

    // Parse Application Fee lines
    const feeLines = applicationFeeText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const parsedApplicationFee =
      feeLines.length > 0
        ? feeLines.map((line) => {
            const sepIdx = line.indexOf(':');
            if (sepIdx > 0) {
              return {
                category: line.slice(0, sepIdx).trim(),
                amount: line.slice(sepIdx + 1).trim() || 'आधिकारिक नोटिफिकेशन देखें',
              };
            }
            return {
              category: 'आवेदन शुल्क विवरण',
              amount: line,
            };
          })
        : [{ category: 'सभी वर्ग (All Categories)', amount: 'आधिकारिक नोटिफिकेशन देखें' }];

    // Parse Selection Process lines
    const selectionLines = selectionProcessText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // Parse Tags
    const parsedTags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (category === 'news' && !parsedTags.includes('news')) parsedTags.push('news');
    if (category === 'scheme' && !parsedTags.includes('yojana')) parsedTags.push('yojana');

    const finalQualDetails =
      qualificationDetails.trim() ||
      (isHi
        ? 'पद अनुसार आवश्यक शैक्षणिक योग्यता हेतु आधिकारिक नोटिफिकेशन अवश्य पढ़ें।'
        : 'Refer to official notification for post-wise educational qualification.');

    const autoSummaryHi =
      briefSummaryHi.trim() ||
      `${finalDepartment} द्वारा ${finalTitleHi} के अंतर्गत ${finalTotalPosts} हेतु सूचना जारी की गई है। आवेदन माध्यम: ${applicationMode}${applyLastDate ? ` एवं अंतिम तिथि: ${applyLastDate}` : ''}। संपूर्ण पात्रता, आयु सीमा व महत्वपूर्ण लिंक नीचे देखें।`;

    const autoDescriptionHi =
      descriptionHi.trim() ||
      `${autoSummaryHi}\n\n• विभाग / बोर्ड: ${finalDepartment}\n• कुल पद: ${finalTotalPosts}\n• आवेदन माध्यम: ${applicationMode}${applyStartDate ? `\n• आवेदन प्रारंभ तिथि: ${applyStartDate}` : ''}${applyLastDate ? `\n• आवेदन की अंतिम तिथि: ${applyLastDate}` : ''}${examDate ? `\n• परीक्षा / अपडेट तिथि: ${examDate}` : ''}`;

    const parsedAgeMin = Number.isFinite(Number(ageMin)) && Number(ageMin) > 0 ? Number(ageMin) : 18;
    const parsedAgeMax = Number.isFinite(Number(ageMax)) && Number(ageMax) >= parsedAgeMin ? Number(ageMax) : 40;

    const parsedPostBreakdown: PostBreakdownItem[] = postBreakdownRows
      .filter((row) => row.postNameHi.trim())
      .map((row) => ({
        postName: row.postNameHi.trim(),
        postNameHi: row.postNameHi.trim(),
        categoryOrSubject: row.categoryOrSubjectHi.trim() || undefined,
        categoryOrSubjectHi: row.categoryOrSubjectHi.trim() || undefined,
        postsCount: row.postsCount.trim() || 'विभिन्न',
        qualification: row.qualificationHi.trim() || finalQualDetails,
        qualificationHi: row.qualificationHi.trim() || finalQualDetails,
        payLevel: row.payLevel.trim() || undefined,
      }));

    const parsedHowToApply = howToApplyText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedRequiredDocs = requiredDocsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedFaqs = faqRows
      .filter((f) => f.qHi.trim() && f.aHi.trim())
      .map((f) => ({
        q: f.qHi.trim(),
        qHi: f.qHi.trim(),
        a: f.aHi.trim(),
        aHi: f.aHi.trim(),
      }));

    return {
      id: finalSlug,
      title: finalTitleEn,
      titleHi: finalTitleHi,
      shortTitle: finalTitleEn.slice(0, 80),
      shortTitleHi: finalTitleHi.slice(0, 80),
      organization,
      department: finalDepartment,
      departmentHi: finalDepartment,
      advtNo: advtNo.trim() || 'Official Notice 2026',
      category,
      totalPosts: finalTotalPosts,
      postName: finalPostName,
      postNameHi: finalPostName,
      qualification: qualifications.length > 0 ? qualifications : ['Graduate'],
      qualificationDetails: finalQualDetails,
      qualificationDetailsHi: finalQualDetails,
      ageLimit: {
        min: parsedAgeMin,
        max: parsedAgeMax,
        asOnDate: ageAsOnDate.trim() || todayIso,
        relaxationNotes: ageRelaxation.trim(),
        relaxationNotesHi: ageRelaxation.trim(),
      },
      applicationFee: parsedApplicationFee,
      applicationMode: applicationMode.trim() || 'Online (ऑनलाइन)',
      importantDates: {
        notificationDate: notificationDate.trim() || todayIso,
        applyStartDate: applyStartDate.trim() || undefined,
        applyLastDate: applyLastDate.trim() || undefined,
        examDate: examDate.trim() || undefined,
      },
      directLinks,
      status,
      salary: salary.trim() || 'नियमानुसार देय (As per Govt Rules)',
      salaryHi: salary.trim() || 'नियमानुसार देय (As per Govt Rules)',
      jobLocation: jobLocation.trim() || 'Rajasthan',
      selectionProcess: selectionLines.length > 0 ? selectionLines : ['Merit / Written Exam & Document Verification'],
      selectionProcessHi: selectionLines.length > 0 ? selectionLines : ['लिखित परीक्षा / मेरिट एवं दस्तावेज़ सत्यापन'],
      tags: parsedTags.length > 0 ? parsedTags : ['rajasthan vacancy 2026'],
      officialLinks: {
        applyOnlineUrl: cleanApplyUrl || undefined,
        notificationPdfUrl: cleanNotifUrl || undefined,
        officialWebsiteUrl: cleanOfficialUrl,
      },
      isHot,
      isNew,
      isTrending: isHot,
      description: finalTitleEn,
      descriptionHi: autoDescriptionHi,
      briefSummary: finalTitleEn,
      briefSummaryHi: autoSummaryHi,
      postBreakdown: parsedPostBreakdown.length > 0 ? parsedPostBreakdown : undefined,
      howToApply: parsedHowToApply.length > 0 ? parsedHowToApply : undefined,
      howToApplyHi: parsedHowToApply.length > 0 ? parsedHowToApply : undefined,
      requiredDocuments: parsedRequiredDocs.length > 0 ? parsedRequiredDocs : undefined,
      requiredDocumentsHi: parsedRequiredDocs.length > 0 ? parsedRequiredDocs : undefined,
      postalAddress: postalAddressHi.trim() || undefined,
      postalAddressHi: postalAddressHi.trim() || undefined,
      envelopeNoteHi: envelopeNoteHi.trim() || undefined,
      faqs: parsedFaqs.length > 0 ? parsedFaqs : undefined,
      addedAtMs: Date.now(),
      updatedAt: todayIso,
      createdAt: todayIso,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCloudWarningMsg('');

    if (!titleHi.trim() && !titleEn.trim()) {
      setErrorMsg(isHi ? 'कृपया कम से कम हिंदी या अंग्रेजी शीर्षक (Title) दर्ज करें।' : 'Please enter a post title.');
      return;
    }

    const candidateSlug = normalizedSlug || generateSlugFromTitle(titleEn.trim() || titleHi.trim());
    if (!VALID_ID_REGEX.test(candidateSlug)) {
      setErrorMsg(
        isHi
          ? 'URL Slug / Post ID में केवल अंग्रेज़ी अक्षर (a-z), अंक (0-9), हाइफ़न (-) या अंडरस्कोर (_) ही मान्य हैं (अधिकतम 128 अक्षर)।'
          : 'URL Slug must contain only letters, numbers, hyphens, or underscores (max 128 chars).'
      );
      return;
    }

    if (applyOnlineUrl.trim() && !sanitizeHttpUrl(applyOnlineUrl)) {
      setErrorMsg(isHi ? 'Apply Online URL अमान्य है (केवल https:// लिंक दर्ज करें)।' : 'Invalid Apply Online URL.');
      return;
    }
    if (notificationPdfUrl.trim() && !sanitizeHttpUrl(notificationPdfUrl)) {
      setErrorMsg(isHi ? 'Notification PDF URL अमान्य है (केवल https:// लिंक दर्ज करें)।' : 'Invalid Notification PDF URL.');
      return;
    }
    if (officialWebsiteUrl.trim() && !sanitizeHttpUrl(officialWebsiteUrl)) {
      setErrorMsg(isHi ? 'Official Website URL अमान्य है (केवल https:// लिंक दर्ज करें)।' : 'Invalid Official Website URL.');
      return;
    }

    const newVacancy = buildVacancyItem();
    setIsSubmitting(true);
    try {
      const result = await onPublishVacancy(newVacancy);
      setLastCreatedVacancy(newVacancy);

      if (result.synced) {
        onSelectVacancy(newVacancy);
        onClose();
      } else if (result.reason === 'auth_required') {
        setCloudWarningMsg(
          isHi
            ? 'यह पोस्ट अभी केवल इस डिवाइस पर सेव हुई है। सभी मोबाइल/यूज़र्स पर लाइव पब्लिश करने के लिए ऊपर "Google एडमिन लॉगिन" पर क्लिक करें और फिर से Publish दबाएं।'
            : 'Saved locally only. Sign in with your verified Google Admin account above and click Publish again to go live across all devices.'
        );
      } else {
        setErrorMsg(
          result.message ||
            (isHi ? 'Firebase क्लाउड सिंक में त्रुटि आई, कृपया पुनः प्रयास करें।' : 'Firebase cloud sync failed.')
        );
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error while publishing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewUrl = `${getCanonicalOrigin()}/?vacancy=${encodeURIComponent(normalizedSlug || 'new-vacancy-2026')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-vacancy-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-vacancy-modal-title" className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {isHi ? 'नई भर्ती / पोस्ट जोड़ें (Add New Vacancy)' : 'Add New Vacancy / Post'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                {isHi
                  ? 'सीधे एडमिन पैनल से नई भर्ती, एडमिट कार्ड, रिजल्ट या योजना लाइव Firebase पर पब्लिश करें'
                  : 'Publish a new recruitment, admit card, result, or scheme live via Firebase Firestore'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Add Vacancy Modal"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {/* Firebase Cloud Sync Status Banner */}
          {isCloudAdmin ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <Cloud className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <span>{isHi ? 'Firebase Live Cloud Publish सक्रिय है' : 'Firebase Live Cloud Publish Active'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <p className="text-emerald-800 mt-0.5">
                    {isHi
                      ? `लॉगिन खाता: ${user?.email || 'Verified Admin'} — पब्लिश करते ही पोस्ट सभी मोबाइल व वेबसाइट यूज़र्स को तुरंत लाइव दिखाई देगी।`
                      : `Signed in as ${user?.email || 'Verified Admin'} — publishing will immediately sync live to all users.`}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-bold self-start sm:self-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>LIVE SYNC</span>
              </span>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CloudOff className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950">
                  <div className="font-extrabold">
                    {isHi
                      ? 'लाइव Firebase पब्लिश के लिए Google एडमिन लॉगिन आवश्यक है'
                      : 'Google Admin Sign-In Required for Live Firebase Publish'}
                  </div>
                  <p className="text-amber-800 mt-0.5 leading-relaxed">
                    {isHi
                      ? 'अभी आप केवल लोकल एडमिन मोड में हैं। सभी यूज़र्स के फोन पर नई भर्ती लाइव करने के लिए अपने एडमिन Google खाते से लॉगिन करें।'
                      : 'You are in local admin mode. Sign in with your verified Google admin account to publish live to all devices.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isGoogleSigningIn}
                onClick={handleInlineGoogleLogin}
                className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
              >
                {isGoogleSigningIn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5" />
                )}
                <span>{isHi ? 'Google एडमिन लॉगिन करें' : 'Google Admin Sign-In'}</span>
              </button>
            </div>
          )}

          {/* Error / Cloud Warning Alerts */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 flex items-start gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {cloudWarningMsg && (
            <div className="bg-amber-50 border border-amber-300 text-amber-950 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-semibold">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{cloudWarningMsg}</span>
              </div>
              {lastCreatedVacancy && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectVacancy(lastCreatedVacancy);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer shrink-0"
                >
                  {isHi ? 'लोकल पोस्ट खोलें' : 'Open Local Post'}
                </button>
              )}
            </div>
          )}

          {/* Section 1: Core Post Info */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-[#15803d]" />
              <h3 className="text-sm font-extrabold text-slate-900">
                {isHi ? '1. भर्ती / पोस्ट की मूल जानकारी (Basic Details)' : '1. Basic Post Details'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'श्रेणी / सेक्शन (Category) *' : 'Category *'}
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as CategoryType)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-[#15803d]"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isHi ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'स्थिति (Post Status)' : 'Post Status'}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as JobStatusType)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-[#15803d]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isHi ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'हिंदी शीर्षक (Title in Hindi) *' : 'Title (Hindi) *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={500}
                  value={titleHi}
                  onChange={(e) => {
                    setTitleHi(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="उदा. जोधपुर राशन डीलर भर्ती 2026: 14 दुकानों के लिए नोटिफिकेशन जारी, अंतिम तिथि 26 नवंबर"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'अंग्रेजी शीर्षक (Title in English - SEO व Slug हेतु) *' : 'Title (English - for SEO & URL Slug) *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={500}
                  value={titleEn}
                  onChange={(e) => handleTitleEnChange(e.target.value)}
                  placeholder="e.g. Jodhpur Ration Dealer Vacancy 2026 Notification Out for 14 Posts"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {isHi ? 'URL Slug / Post ID (ऑटो-जेनरेटेड)' : 'URL Slug / Post ID (Auto-generated)'}
                  </label>
                  {slugTouched && titleEn.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlug(generateSlugFromTitle(titleEn));
                        setSlugTouched(false);
                      }}
                      className="text-[11px] font-bold text-[#15803d] hover:underline cursor-pointer"
                    >
                      {isHi ? 'शीर्षक से रीसेट करें' : 'Reset from title'}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={128}
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '-'));
                    setErrorMsg('');
                  }}
                  placeholder="jodhpur-ration-dealer-vacancy-2026"
                  className={`w-full px-3.5 py-2 rounded-lg border text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none ${
                    normalizedSlug && !isSlugValid
                      ? 'border-rose-400 text-rose-800'
                      : 'border-slate-300 text-slate-800 focus:border-[#15803d]'
                  }`}
                />
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500 break-all">
                    Live URL: <span className="font-mono text-slate-700">{previewUrl}</span>
                  </span>
                  {isDuplicateSlug && (
                    <span className="text-amber-700 font-bold">
                      {isHi
                        ? '⚠️ यह ID पहले से मौजूद है — पब्लिश करने पर पुरानी पोस्ट अपडेट हो जाएगी।'
                        : '⚠️ ID exists — publishing will update the existing post.'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'बोर्ड / संस्था (Board)' : 'Board / Organization'}
                </label>
                <select
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value as BoardType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#15803d]"
                >
                  {BOARD_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'विभाग का नाम (Department)' : 'Department Name'}
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="उदा. खाद्य एवं नागरिक आपूर्ति विभाग, जोधपुर"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'कुल पद / दुकानें (Total Posts)' : 'Total Posts'}
                </label>
                <input
                  type="text"
                  value={totalPosts}
                  onChange={(e) => setTotalPosts(e.target.value)}
                  placeholder="उदा. 14 पद / 317+ पद"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'पद का नाम (Post Name)' : 'Post Name'}
                </label>
                <input
                  type="text"
                  value={postName}
                  onChange={(e) => setPostName(e.target.value)}
                  placeholder="उदा. उचित मूल्य दुकानदार (Ration Dealer)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'आवेदन माध्यम (Apply Mode)' : 'Application Mode'}
                </label>
                <select
                  value={applicationMode}
                  onChange={(e) => setApplicationMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#15803d]"
                >
                  <option value="Online (ऑनलाइन)">Online (ऑनलाइन)</option>
                  <option value="Offline (ऑफलाइन)">Offline (ऑफलाइन)</option>
                  <option value="Online & Offline (ऑनलाइन एवं ऑफलाइन)">Online & Offline (दोनों)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'विज्ञापन संख्या (Advt No.)' : 'Advertisement No.'}
                </label>
                <input
                  type="text"
                  value={advtNo}
                  onChange={(e) => setAdvtNo(e.target.value)}
                  placeholder="उदा. 04/2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#15803d]"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Important Dates */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-[#15803d]" />
              <h3 className="text-sm font-extrabold text-slate-900">
                {isHi ? '2. महत्वपूर्ण तिथियां (Important Dates)' : '2. Important Dates'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'नोटिफिकेशन तिथि' : 'Notification Date'}
                </label>
                <input
                  type="text"
                  value={notificationDate}
                  onChange={(e) => setNotificationDate(e.target.value)}
                  placeholder="2026-11-23 या 23 नवंबर 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'आवेदन प्रारंभ तिथि' : 'Apply Start Date'}
                </label>
                <input
                  type="text"
                  value={applyStartDate}
                  onChange={(e) => setApplyStartDate(e.target.value)}
                  placeholder="2026-11-10 या 10 नवंबर 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'आवेदन की अंतिम तिथि' : 'Apply Last Date'}
                </label>
                <input
                  type="text"
                  value={applyLastDate}
                  onChange={(e) => setApplyLastDate(e.target.value)}
                  placeholder="2026-11-26 या 26 नवंबर 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'परीक्षा / एडमिट कार्ड तिथि' : 'Exam / Admit Card Date'}
                </label>
                <input
                  type="text"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  placeholder="शीघ्र घोषित / दिसंबर 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Eligibility, Age, Fee & Salary */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-[#15803d]" />
              <h3 className="text-sm font-extrabold text-slate-900">
                {isHi ? '3. पात्रता, आयु सीमा, शुल्क एवं वेतन (Eligibility, Age & Fee)' : '3. Eligibility, Age, Fee & Salary'}
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isHi ? 'योग्यता श्रेणी चुनें (Qualification Tags)' : 'Qualification Levels'}
              </label>
              <div className="flex flex-wrap gap-2">
                {QUALIFICATION_OPTIONS.map((q) => {
                  const active = qualifications.includes(q);
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => toggleQualification(q)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        active
                          ? 'bg-[#15803d] text-white border-[#15803d]'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {q}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isHi ? 'शैक्षणिक योग्यता विवरण (Qualification Details)' : 'Qualification Details'}
              </label>
              <input
                type="text"
                value={qualificationDetails}
                onChange={(e) => setQualificationDetails(e.target.value)}
                placeholder="उदा. किसी भी मान्यता प्राप्त विश्वविद्यालय से स्नातक (Graduation) एवं RSCIT कंप्यूटर डिप्लोमा"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'न्यूनतम आयु (Min Age)' : 'Min Age (Years)'}
                </label>
                <input
                  type="number"
                  min={14}
                  max={65}
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'अधिकतम आयु (Max Age)' : 'Max Age (Years)'}
                </label>
                <input
                  type="number"
                  min={18}
                  max={75}
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'आयु गणना तिथि (As On Date)' : 'Age As On Date'}
                </label>
                <input
                  type="text"
                  value={ageAsOnDate}
                  onChange={(e) => setAgeAsOnDate(e.target.value)}
                  placeholder="2026-01-01"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'आयु छूट नोट (Age Relaxation Note)' : 'Age Relaxation Note'}
                </label>
                <input
                  type="text"
                  value={ageRelaxation}
                  onChange={(e) => setAgeRelaxation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'वेतनमान / योजना लाभ (Salary / Benefit)' : 'Salary / Pay Scale'}
                </label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="उदा. पे मैट्रिक्स लेवल-10 (₹33,800 - ₹1,06,700/-) या कमीशन आधारित"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'आवेदन शुल्क (प्रति लाइन एक श्रेणी: शुल्क)' : 'Application Fee (one per line: Category: Amount)'}
                </label>
                <textarea
                  rows={3}
                  value={applicationFeeText}
                  onChange={(e) => setApplicationFeeText(e.target.value)}
                  placeholder={'सामान्य / ओबीसी: ₹100/-\nएससी / एसटी: ₹100/-'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'नौकरी का स्थान (Job Location)' : 'Job Location'}
                </label>
                <input
                  type="text"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  placeholder="जोधपुर / संपूर्ण राजस्थान"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d] mb-2"
                />
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'सर्च टैग्स (कॉमा से अलग करें)' : 'Search Tags (comma separated)'}
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="jodhpur, ration dealer, rajasthan vacancy 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Official & Important Links */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#15803d]" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  {isHi ? '4. महत्वपूर्ण लिंक्स (Important Links)' : '4. Official & Important Links'}
                </h3>
              </div>
              <button
                type="button"
                onClick={addExtraLink}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isHi ? 'अतिरिक्त लिंक जोड़ें' : 'Add Custom Link'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'Apply Online / फॉर्म लिंक URL' : 'Apply Online / Form URL'}
                </label>
                <input
                  type="url"
                  value={applyOnlineUrl}
                  onChange={(e) => setApplyOnlineUrl(e.target.value)}
                  placeholder="https://sso.rajasthan.gov.in/"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'आधिकारिक नोटिफिकेशन PDF URL' : 'Official Notification PDF URL'}
                </label>
                <input
                  type="url"
                  value={notificationPdfUrl}
                  onChange={(e) => setNotificationPdfUrl(e.target.value)}
                  placeholder="https://example.gov.in/notification.pdf"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'आधिकारिक वेबसाइट URL' : 'Official Website URL'}
                </label>
                <input
                  type="url"
                  value={officialWebsiteUrl}
                  onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
                  placeholder="https://food.rajasthan.gov.in/"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>
            </div>

            {extraLinks.length > 0 && (
              <div className="space-y-2.5 pt-2">
                {extraLinks.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  >
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateExtraLink(row.id, { label: e.target.value })}
                      placeholder="लिंक का नाम (उदा. एडमिट कार्ड डाउनलोड)"
                      className="sm:col-span-4 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={row.actionText}
                      onChange={(e) => updateExtraLink(row.id, { actionText: e.target.value })}
                      placeholder="बटन टेक्स्ट (Click Here)"
                      className="sm:col-span-2 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900"
                    />
                    <input
                      type="url"
                      value={row.url}
                      onChange={(e) => updateExtraLink(row.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="sm:col-span-5 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeExtraLink(row.id)}
                      aria-label="Remove link"
                      className="sm:col-span-1 p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Summary, Description & Selection Process */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-[#15803d]" />
              <h3 className="text-sm font-extrabold text-slate-900">
                {isHi ? '5. संक्षिप्त विवरण एवं चयन प्रक्रिया (Summary & Description)' : '5. Summary & Selection Process'}
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isHi ? 'संक्षिप्त परिचय (Brief Summary - पोस्ट के सबसे ऊपर दिखता है)' : 'Brief Summary (Hindi)'}
              </label>
              <textarea
                rows={3}
                value={briefSummaryHi}
                onChange={(e) => setBriefSummaryHi(e.target.value)}
                placeholder="खाली छोड़ने पर भर्ती की जानकारी से स्वचालित हिंदी सारांश बन जाएगा..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isHi ? 'विस्तृत जानकारी / निर्देश (Full Description)' : 'Detailed Information'}
              </label>
              <textarea
                rows={4}
                value={descriptionHi}
                onChange={(e) => setDescriptionHi(e.target.value)}
                placeholder="भर्ती से जुड़े महत्वपूर्ण निर्देश, आवेदन प्रक्रिया, आवश्यक दस्तावेज़ आदि लिखें (पब्लिश करने के बाद Word In-Place Editor से भी एडिट कर सकते हैं)..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isHi ? 'चयन प्रक्रिया (प्रति लाइन एक चरण)' : 'Selection Process (one step per line)'}
              </label>
              <textarea
                rows={3}
                value={selectionProcessText}
                onChange={(e) => setSelectionProcessText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-4 h-4 accent-[#15803d] rounded cursor-pointer"
                />
                <span>{isHi ? 'NEW बैज दिखाएं (Show NEW Badge)' : 'Show NEW Badge'}</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHot}
                  onChange={(e) => setIsHot(e.target.checked)}
                  className="w-4 h-4 accent-[#15803d] rounded cursor-pointer"
                />
                <span>{isHi ? 'हाइलाइट / ट्रेंडिंग पोस्ट (Hot / Trending)' : 'Mark as Hot / Trending'}</span>
              </label>
            </div>
          </section>

          {/* Section 6: Expanded / Detailed Post Sections (Post Breakdown, How to Apply, Documents, Offline Address & FAQs) */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#15803d]" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  {isHi
                    ? '6. विस्तृत पोस्ट सेक्शंस (पदवार तालिका, आवेदन प्रक्रिया, दस्तावेज़ व FAQs - वैकल्पिक)'
                    : '6. Detailed Post Sections (Post Breakdown, How to Apply, Documents & FAQs - Optional)'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addPostBreakdownRow}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isHi ? 'पद पंक्ति जोड़ें' : 'Add Post Row'}</span>
                </button>
                <button
                  type="button"
                  onClick={addFaqRow}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isHi ? 'FAQ जोड़ें' : 'Add FAQ'}</span>
                </button>
              </div>
            </div>

            {/* Post-wise Breakdown Dynamic Rows */}
            {postBreakdownRows.length > 0 && (
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-700">
                  {isHi ? 'पदवार / क्षेत्रवार रिक्ति विवरण (Post-wise Vacancy Table)' : 'Post-wise Vacancy Breakdown'}
                </div>
                {postBreakdownRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  >
                    <input
                      type="text"
                      value={row.postNameHi}
                      onChange={(e) => updatePostBreakdownRow(row.id, { postNameHi: e.target.value })}
                      placeholder="पद का नाम (उदा. राशन डीलर - जोधपुर ग्रामीण)"
                      className="sm:col-span-3 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={row.categoryOrSubjectHi}
                      onChange={(e) => updatePostBreakdownRow(row.id, { categoryOrSubjectHi: e.target.value })}
                      placeholder="क्षेत्र / श्रेणी / विषय"
                      className="sm:col-span-2 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={row.postsCount}
                      onChange={(e) => updatePostBreakdownRow(row.id, { postsCount: e.target.value })}
                      placeholder="पद (उदा. 14)"
                      className="sm:col-span-2 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={row.qualificationHi}
                      onChange={(e) => updatePostBreakdownRow(row.id, { qualificationHi: e.target.value })}
                      placeholder="योग्यता (स्नातक + RSCIT)"
                      className="sm:col-span-2 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={row.payLevel}
                      onChange={(e) => updatePostBreakdownRow(row.id, { payLevel: e.target.value })}
                      placeholder="वेतन / पे लेवल"
                      className="sm:col-span-2 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => removePostBreakdownRow(row.id)}
                      aria-label="Remove post row"
                      className="sm:col-span-1 p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* How to Apply & Required Documents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'आवेदन कैसे करें (प्रति लाइन एक चरण - How to Apply)' : 'How to Apply (one step per line)'}
                </label>
                <textarea
                  rows={4}
                  value={howToApplyText}
                  onChange={(e) => setHowToApplyText(e.target.value)}
                  placeholder={'आधिकारिक नोटिफिकेशन PDF ध्यानपूर्वक पढ़ें।\nऑनलाइन / ऑफलाइन आवेदन फॉर्म सही जानकारी के साथ भरें।\nआवश्यक दस्तावेज़ संलग्न कर अंतिम तिथि से पूर्व जमा करें।'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'आवश्यक दस्तावेज़ (प्रति लाइन एक दस्तावेज़ - Documents)' : 'Required Documents (one per line)'}
                </label>
                <textarea
                  rows={4}
                  value={requiredDocsText}
                  onChange={(e) => setRequiredDocsText(e.target.value)}
                  placeholder={'10वीं / 12वीं / स्नातक की अंकतालिका\nआधार कार्ड व मूल निवास प्रमाण पत्र\nजाति प्रमाण पत्र एवं पासपोर्ट साइज फोटो'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>
            </div>

            {/* Offline Form Postal Address & Envelope Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'ऑफलाइन आवेदन भेजने का पता (यदि ऑफलाइन भर्ती हो)' : 'Offline Postal Address (if Offline)'}
                </label>
                <input
                  type="text"
                  value={postalAddressHi}
                  onChange={(e) => setPostalAddressHi(e.target.value)}
                  placeholder="उदा. कार्यालय जिला रसद अधिकारी (जोधपुर), कलेक्ट्रेट परिसर, जोधपुर"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'लिफाफा / विशेष नोट (Envelope / Submission Note)' : 'Envelope / Submission Note'}
                </label>
                <input
                  type="text"
                  value={envelopeNoteHi}
                  onChange={(e) => setEnvelopeNoteHi(e.target.value)}
                  placeholder="उदा. आवेदन फॉर्म शाम 6:00 बजे तक व्यक्तिगत रूप से या पंजीकृत डाक से जमा करें"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#15803d]"
                />
              </div>
            </div>

            {/* FAQs Dynamic Rows */}
            {faqRows.length > 0 && (
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-700">
                  {isHi ? 'अक्सर पूछे जाने वाले प्रश्न (FAQs - Google SEO हेतु)' : 'Frequently Asked Questions (FAQs)'}
                </div>
                {faqRows.map((faq) => (
                  <div
                    key={faq.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  >
                    <input
                      type="text"
                      value={faq.qHi}
                      onChange={(e) => updateFaqRow(faq.id, { qHi: e.target.value })}
                      placeholder="प्रश्न (उदा. आवेदन की अंतिम तिथि क्या है?)"
                      className="sm:col-span-5 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={faq.aHi}
                      onChange={(e) => updateFaqRow(faq.id, { aHi: e.target.value })}
                      placeholder="उत्तर (उदा. आवेदन की अंतिम तिथि 26 नवंबर 2026 है।)"
                      className="sm:col-span-6 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeFaqRow(faq.id)}
                      aria-label="Remove FAQ"
                      className="sm:col-span-1 p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Footer Action Buttons (inside form for Enter submit, sticky at bottom) */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500 text-center sm:text-left">
              {isHi
                ? 'पब्लिश होने के बाद आप इस पोस्ट को सीधे पेज पर Word In-Place Editor से भी कभी भी एडिट कर सकते हैं।'
                : 'After publishing, you can also edit any table or section directly on the post page.'}
            </p>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
              >
                {isHi ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isHi ? 'Firebase में पब्लिश हो रहा है...' : 'Publishing to Firebase...'}</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>
                      {isCloudAdmin
                        ? isHi
                          ? 'लाइव पब्लिश करें (Publish to Firebase)'
                          : 'Publish Live to Firebase'
                        : isHi
                          ? 'सेव व पब्लिश करें (Save & Publish)'
                          : 'Save & Publish'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVacancyModal;
