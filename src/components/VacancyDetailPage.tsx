import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  ExternalLink, 
  Share2, 
  Bookmark, 
  Download, 
  ShieldCheck, 
  Edit3, 
  Trash2,
  Bell, 
  Search,
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Folder,
  Send,
  MessageSquare,
  MessageCircle,
  HelpCircle,
  FileText,
  Copy,
  Check,
  Plus,
  PlusCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';
import { VacancyItem, LanguageMode, CustomPostSection } from '../types';
import { generateHindiShareText } from '../utils/shareUtils';
import { formatSingleDate } from '../utils/dateUtils';
import { AdSection } from './AdSection';

interface VacancyDetailPageProps {
  vacancy: VacancyItem;
  onBack: () => void;
  lang: LanguageMode;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  allVacancies: VacancyItem[];
  onSelectOtherVacancy: (item: VacancyItem) => void;
  onEditVacancy?: (vacancy: VacancyItem) => void;
  onDeleteVacancy?: (id: string) => void;
  onUpdateVacancy?: (updatedJob: VacancyItem) => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  isAlertSet?: boolean;
  onToggleAlertMe?: (id: string) => void;
  onSelectCategory?: (category: string) => void;
}

type SarkariPost = VacancyItem;

// Pure normalizer to safely guarantee Arrays for importantDates, applicationFee, directLinks and latestNews
export const normalizePost = (v: VacancyItem): any => {
  if (!v) return v;

  const defaultDirectLinks = (v as any).directLinks && Array.isArray((v as any).directLinks) && (v as any).directLinks.length > 0
    ? (v as any).directLinks
    : [
        {
          label: 'Apply Online',
          actionText: 'Click Here',
          type: 'apply',
          url: v.officialLinks?.applyOnlineUrl || v.officialLinks?.officialWebsiteUrl || 'https://sso.rajasthan.gov.in',
          isPrimary: true
        },
        {
          label: 'Download Notification (PDF)',
          actionText: 'Download PDF',
          type: 'notification',
          url: v.officialLinks?.notificationPdfUrl || v.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in',
          isPdf: true,
          fileName: `${(v.shortTitle || v.title || 'Notification').replace(/\s+/g, '_')}.pdf`
        },
        {
          label: 'Official Website',
          actionText: 'Click Here',
          type: 'official',
          url: v.officialLinks?.officialWebsiteUrl || 'https://rajasthanvaccancy.vercel.app/'
        }
      ];

  const defaultDatesArray = Array.isArray((v as any).importantDates)
    ? (v as any).importantDates
    : [
        { label: 'Application Begin', value: (v.importantDates as any)?.applyStartDate || 'शीघ्र' },
        { label: 'Last Date for Apply Online', value: (v.importantDates as any)?.applyLastDate || 'शीघ्र' },
        { label: 'Pay Exam Fee Last Date', value: (v.importantDates as any)?.feeLastDate || (v.importantDates as any)?.applyLastDate || 'शीघ्र' },
        { label: 'Exam Date', value: (v.importantDates as any)?.examDate || 'As per Schedule' },
        { label: 'Admit Card Available', value: (v.importantDates as any)?.admitCardDate || 'Before Exam' },
        { label: 'Notification Released', value: (v.importantDates as any)?.notificationDate || 'अक्टूबर 2026' },
      ];

  const defaultFeeArray = Array.isArray((v as any).applicationFee)
    ? (v as any).applicationFee
    : [
        { category: 'General / OBC / EWS', amount: `₹${(v.applicationFee as any)?.genObc ?? 600}/-` },
        { category: 'SC / ST / Divyang', amount: `₹${(v.applicationFee as any)?.scSt ?? 400}/-` },
        { category: 'Correction Charge', amount: '₹300/-' },
        { category: 'Pay Exam Fee Through', amount: (v.applicationFee as any)?.paymentModeHi || (v.applicationFee as any)?.paymentMode || 'Online (Debit / Credit Card / Net Banking)' },
      ];

  const defaultLatestNews = (v as any).latestNews && Array.isArray((v as any).latestNews) && (v as any).latestNews.length > 0
    ? (v as any).latestNews
    : [
        {
          id: 'news-1',
          date: (v.importantDates as any)?.notificationDate || '25 अक्टूबर 2026',
          badge: 'ताज़ा अपडेट',
          headline: `${v.shortTitleHi || v.titleHi || v.title} के संबंध में नई सूचना जारी`,
          details: `${v.organization || 'विभाग'} द्वारा आधिकारिक पोर्टल पर भर्ती संबंधी आवश्यक दिशा-निर्देश व परीक्षा कैलेंडर की जानकारी अपडेट कर दी गई है।`,
          isHighlighted: true
        },
        {
          id: 'news-2',
          date: 'अक्टूबर 2026',
          badge: 'महत्वपूर्ण सूचना',
          headline: 'ऑनलाइन आवेदन व पात्रता नियम',
          details: 'इच्छुक अभ्यर्थी आवेदन करने से पूर्व अपनी शैक्षणिक योग्यता, आयु सीमा एवं आवश्यक प्रमाणपत्र (जाति/मूल निवास/EWS) की जांच अवश्य कर लें।',
          isHighlighted: false
        }
      ];

  return {
    ...v,
    directLinks: defaultDirectLinks,
    importantDates: defaultDatesArray,
    applicationFee: defaultFeeArray,
    latestNews: defaultLatestNews
  };
};

export const VacancyDetailPage: React.FC<VacancyDetailPageProps> = ({
  vacancy,
  onBack,
  lang,
  isSaved,
  onToggleSave,
  allVacancies,
  onSelectOtherVacancy,
  onEditVacancy,
  onDeleteVacancy,
  onUpdateVacancy,
  isAdmin = false,
  isAlertSet = false,
  onToggleAlertMe,
  onSelectCategory,
}) => {
  const [editablePost, setEditablePost] = useState<VacancyItem>(() => normalizePost(vacancy) as VacancyItem);
  const currentVacancy = editablePost;
  const setCurrentVacancy = setEditablePost;

  const [isDirectEditMode, setIsDirectEditMode] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  const [pdfUploadTargetIndex, setPdfUploadTargetIndex] = useState<number | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [alertFeedback, setAlertFeedback] = useState<string>('');

  useEffect(() => {
    setEditablePost(normalizePost(vacancy));
  }, [vacancy]);

  // 1. Reusable In-Place Word Editable Component (FullPagePostView.tsx)
  const EditableText: React.FC<{
    value?: string | number;
    onChange: (val: string) => void;
    className?: string;
    style?: React.CSSProperties;
    as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'div' | 'p' | 'td';
    placeholder?: string;
    titlePrefix?: string;
  }> = ({
    value = '',
    onChange,
    className = '',
    style,
    as: Tag = 'span',
    placeholder = '...',
    titlePrefix = 'टेक्स्ट'
  }) => {
    const strVal = String(value ?? '');
    
    // यदि वर्ड एडिट मोड बंद है तो साधारण टेक्स्ट दिखाएं
    if (!isDirectEditMode) {
      return (
        <Tag className={className} style={style}>
          {strVal || placeholder}
        </Tag>
      );
    }

    // वर्ड एडिट मोड चालू होने पर सीधे क्लिक करके टाइप करें
    return (
      <Tag
        contentEditable
        suppressContentEditableWarning
        style={style}
        onBlur={(e) => {
          const updated = e.currentTarget.innerText.trim();
          if (updated !== strVal) {
            onChange(updated);
          }
        }}
        className={`${className} outline-none cursor-text transition-all hover:bg-amber-100/90 focus:bg-amber-50 focus:ring-2 focus:ring-amber-500 rounded px-1 -mx-0.5 border-b border-dashed border-amber-500 min-w-[20px] inline-block`}
        title={`क्लिक करके ${titlePrefix} बदलें (Click to edit text)`}
      >
        {strVal || placeholder}
      </Tag>
    );
  };

  // 2. Real-Time Non-Blocking Auto Persistence (बिना लूप के ऑटो-सेव)
  const onUpdatePost = onUpdateVacancy;
  const lastSavedJsonRef = React.useRef<string>('');
  const onUpdatePostRef = React.useRef(onUpdatePost);

  useEffect(() => {
    onUpdatePostRef.current = onUpdatePost;
  }, [onUpdatePost]);

  useEffect(() => {
    const currentJson = JSON.stringify(editablePost);
    if (!lastSavedJsonRef.current) {
      lastSavedJsonRef.current = currentJson;
      return;
    }
    if (currentJson === lastSavedJsonRef.current) return;
    lastSavedJsonRef.current = currentJson;

    // पैरेंट कंपोनेंट व Firestore में अपडेट
    if (onUpdatePost) {
      onUpdatePost(editablePost);
    }
    // LocalStorage में तुरंत सुरक्षित
    try {
      const saved = localStorage.getItem('sarkari_admin_posts_v5');
      let currentArr: SarkariPost[] = saved ? JSON.parse(saved) : [];
      const idx = currentArr.findIndex(p => p.id === editablePost.id);
      if (idx >= 0) {
        currentArr[idx] = editablePost;
      } else {
        currentArr.push(editablePost);
      }
      localStorage.setItem('sarkari_admin_posts_v5', JSON.stringify(currentArr));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error(e);
    }
  }, [editablePost]);

  useEffect(() => {
    if (alertFeedback) {
      const timer = setTimeout(() => setAlertFeedback(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [alertFeedback]);

  const handleAttachPdfToLink = (idx: number) => {
    setPdfUploadTargetIndex(idx);
    setIsPdfModalOpen(true);
  };

  const handleAddDirectLink = () => {
    setEditablePost(prev => {
      const list = [...(prev.directLinks || [])];
      list.push({
        label: 'New Important Link / नया लिंक',
        actionText: 'Click Here',
        type: 'official',
        url: 'https://rajasthanvaccancy.vercel.app/'
      });
      return { ...prev, directLinks: list };
    });
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('कृपया केवल PDF (.pdf) फ़ाइल चुनें।');
      return;
    }

    const fileSizeKb = Math.round(file.size / 1024);
    const fileSizeStr = fileSizeKb > 1024 ? `${(fileSizeKb / 1024).toFixed(2)} MB` : `${fileSizeKb} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const cleanFileName = file.name.replace(/\.pdf$/i, '');

      setEditablePost(prev => {
        const list = [...(prev.directLinks || [])];
        if (pdfUploadTargetIndex !== null && pdfUploadTargetIndex >= 0 && pdfUploadTargetIndex < list.length) {
          list[pdfUploadTargetIndex] = {
            ...list[pdfUploadTargetIndex],
            url: dataUrl,
            fileName: file.name,
            fileSize: fileSizeStr,
            isPdf: true,
            actionText: list[pdfUploadTargetIndex].actionText || 'Download PDF'
          };
        } else {
          list.push({
            label: `Download ${cleanFileName} (PDF)`,
            actionText: 'Download PDF',
            type: 'notification',
            url: dataUrl,
            fileName: file.name,
            fileSize: fileSizeStr,
            isPdf: true,
            isPrimary: true
          });
        }
        return { ...prev, directLinks: list };
      });

      setAlertFeedback(`✅ PDF फ़ाइल "${file.name}" (${fileSizeStr}) सफलतापूर्वक जोड़ी गई!`);
      setIsPdfModalOpen(false);
    };

    reader.readAsDataURL(file);
  };

  const isHi = lang === 'hi';
  const postTitle = isHi ? (currentVacancy.titleHi || currentVacancy.title) : currentVacancy.title;
  const shortJobName = currentVacancy.shortTitleHi || currentVacancy.shortTitle || postTitle.split(':')[0] || 'भर्ती 2026';

  const [copiedLink, setCopiedLink] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Section Management State for Admin
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [newSectionType, setNewSectionType] = useState<'paragraph' | 'bullets' | 'alert_box'>('paragraph');
  const [editingCustomSection, setEditingCustomSection] = useState<CustomPostSection | null>(null);

  const deletedKeys = currentVacancy.deletedSectionKeys || [];
  const isSectionDeleted = (key: string) => deletedKeys.includes(key);

  const sectionLabels: Record<string, string> = {
    overview: 'संक्षिप्त विवरण तालिका (Quick Overview)',
    latest_update: 'लेटेस्ट अपडेट (Latest Update)',
    latest_news: 'ताज़ा समाचार (Latest News)',
    dates: 'महत्वपूर्ण तिथियाँ (Important Dates)',
    post_breakdown: 'पदों का विवरण (Post Breakdown)',
    qualification: 'शैक्षणिक योग्यता (Eligibility)',
    age_limit: 'आयु सीमा (Age Limit)',
    application_fee: 'आवेदन शुल्क (Application Fee)',
    selection_process: 'चयन प्रक्रिया (Selection Process)',
    salary: 'वेतनमान (Salary Scale)',
    teacher_notes: 'स्पेशल नोट्स (Teacher Notes)',
    how_to_apply: 'आवेदन कैसे करें (How to Apply)',
    important_links: 'महत्वपूर्ण लिंक्स (Important Links)',
    faqs: 'प्रश्नोत्तर (FAQs)'
  };

  const handleDeleteSection = (key: string) => {
    if (key.startsWith('custom_')) {
      const customId = key.replace('custom_', '');
      const updated: VacancyItem = {
        ...currentVacancy,
        customSections: (currentVacancy.customSections || []).filter(s => s.id !== customId)
      };
      setCurrentVacancy(updated);
      if (onUpdateVacancy) onUpdateVacancy(updated);
    } else {
      if (!deletedKeys.includes(key)) {
        const updated: VacancyItem = {
          ...currentVacancy,
          deletedSectionKeys: [...deletedKeys, key]
        };
        setCurrentVacancy(updated);
        if (onUpdateVacancy) onUpdateVacancy(updated);
      }
    }
  };

  const handleRestoreSection = (key: string) => {
    const updated: VacancyItem = {
      ...currentVacancy,
      deletedSectionKeys: deletedKeys.filter(k => k !== key)
    };
    setCurrentVacancy(updated);
    if (onUpdateVacancy) onUpdateVacancy(updated);
  };

  const renderAdminSectionControls = (key: string, label: string) => {
    if (!isAdmin) return null;
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        {onEditVacancy && (
          <button
            type="button"
            onClick={() => onEditVacancy(currentVacancy)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 transition cursor-pointer"
            title={`डायरेक्ट पोस्ट एडिटर में ${label} अपडेट करें`}
          >
            <Edit3 className="w-3 h-3 text-sky-600" />
            <span>एडिट करें</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => handleDeleteSection(key)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
          title={`इस ${label} सेक्शन को हटाएं`}
        >
          <Trash2 className="w-3 h-3 text-rose-600" />
          <span>सेक्शन हटाएं</span>
        </button>
      </div>
    );
  };

  const handleAddNewSection = () => {
    if (!newSectionTitle.trim()) return;
    const newSec: CustomPostSection = {
      id: Date.now().toString(),
      title: newSectionTitle.trim(),
      titleHi: newSectionTitle.trim(),
      content: newSectionContent.trim() || 'विवरण यहाँ उपलब्ध है।',
      contentHi: newSectionContent.trim() || 'विवरण यहाँ उपलब्ध है。',
      sectionType: newSectionType
    };
    const updated: VacancyItem = {
      ...currentVacancy,
      customSections: [...(currentVacancy.customSections || []), newSec]
    };
    setCurrentVacancy(updated);
    if (onUpdateVacancy) onUpdateVacancy(updated);
    setNewSectionTitle('');
    setNewSectionContent('');
    setIsAddSectionOpen(false);
  };

  const handleSaveCustomSectionEdit = () => {
    if (!editingCustomSection) return;
    const updated: VacancyItem = {
      ...currentVacancy,
      customSections: (currentVacancy.customSections || []).map(s =>
        s.id === editingCustomSection.id ? editingCustomSection : s
      )
    };
    setCurrentVacancy(updated);
    if (onUpdateVacancy) onUpdateVacancy(updated);
    setEditingCustomSection(null);
  };

  // Interactive Comments State
  const [comments, setComments] = useState<Array<{ id: string; name: string; email: string; comment: string; date: string }>>([
    {
      id: '1',
      name: 'सुरेश कुमावत (जयपुर)',
      email: 'suresh@example.com',
      comment: 'बहुत ही उपयोगी और स्पष्ट जानकारी दी गई है। धन्यवाद राजस्थान वेकेंसी टीम!',
      date: 'October 22, 2026 at 10:30 am'
    },
    {
      id: '2',
      name: 'अमित बिश्नोई (जोधपुर)',
      email: 'amit@example.com',
      comment: 'क्या इसमें अन्य राज्य के अभ्यर्थी भी सामान्य श्रेणी में आवेदन कर सकते हैं?',
      date: 'October 22, 2026 at 11:15 am'
    }
  ]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentEmail, setNewCommentEmail] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      name: newCommentName.trim() || (isHi ? 'अभ्यर्थी' : 'Candidate'),
      email: newCommentEmail.trim() || 'candidate@example.com',
      comment: newCommentText.trim(),
      date: `October 22, 2026 at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    setComments([newEntry, ...comments]);
    setNewCommentText('');
    setNewCommentName('');
    setNewCommentEmail('');
    setCommentSubmitted(true);
    setTimeout(() => setCommentSubmitted(false), 4000);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Dynamic Title & SEO
    const originalTitle = document.title;
    document.title = `${postTitle} - RajasthanVacancy`;

    return () => {
      document.title = originalTitle;
    };
  }, [vacancy.id, postTitle]);

  const getShareUrl = () => {
    const cleanId = vacancy.id.replace(/^\//, '').replace(/\/$/, '');
    return `https://rajasthanvaccancy.vercel.app/${cleanId}/`;
  };

  const handleShare = () => {
    const websiteUrl = getShareUrl();
    const shareText = generateHindiShareText(vacancy, websiteUrl);

    if (navigator.share) {
      navigator.share({
        title: postTitle,
        text: shareText,
        url: websiteUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const websiteUrl = getShareUrl();
    const shareText = generateHindiShareText(vacancy, websiteUrl);
    const message = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleTelegramShare = () => {
    const websiteUrl = getShareUrl();
    const shareText = generateHindiShareText(vacancy, websiteUrl);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(websiteUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleCopyLink = () => {
    const websiteUrl = getShareUrl();
    navigator.clipboard.writeText(websiteUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Previous and Next Post for navigation footer
  const { prevPost, nextPost } = useMemo(() => {
    if (!allVacancies || allVacancies.length === 0) return { prevPost: null, nextPost: null };
    const currentIndex = allVacancies.findIndex(v => v.id === vacancy.id);
    const listLen = allVacancies.length;

    if (currentIndex === -1 || listLen <= 1) {
      return { prevPost: null, nextPost: null };
    }

    const prevIdx = (currentIndex - 1 + listLen) % listLen;
    const nextIdx = (currentIndex + 1) % listLen;

    return {
      prevPost: allVacancies[prevIdx],
      nextPost: allVacancies[nextIdx] !== allVacancies[prevIdx] ? allVacancies[nextIdx] : null
    };
  }, [allVacancies, vacancy]);

  // Recent Posts for the right sidebar (10 items)
  const recentPosts = useMemo(() => {
    return allVacancies.filter(v => v.id !== vacancy.id).slice(0, 10);
  }, [allVacancies, vacancy]);

  // Filtered recent posts if user searches in sidebar
  const filteredRecentPosts = useMemo(() => {
    if (!sidebarSearch.trim()) return recentPosts;
    const q = sidebarSearch.toLowerCase().trim();
    return allVacancies.filter(v => 
      (v.title && v.title.toLowerCase().includes(q)) || 
      (v.titleHi && v.titleHi.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [allVacancies, recentPosts, sidebarSearch]);

  // Documents list
  const documentsList = isHi ? (vacancy.requiredDocumentsHi || [
    'दसवीं (10th) कक्षा की अंकतालिका एवं प्रमाण पत्र (जन्मतिथि सत्यापन हेतु)।',
    'बारहवीं (12th) कक्षा की अंकतालिका एवं प्रमाण पत्र।',
    'स्नातक (Graduation) / संबंधित ट्रेड में ITI / डिप्लोमा प्रमाण पत्र।',
    'मूल निवास प्रमाण पत्र (Bonafide Domicile Certificate)।',
    'जाति प्रमाण पत्र (SC / ST / OBC / MBC / EWS प्रमाण पत्र)।',
    'नवीनतम पासपोर्ट साइज रंगीन फोटो एवं हस्ताक्षर।',
    'पहचान पत्र (आधार कार्ड / पैन कार्ड अनिवार्य)।'
  ]) : [
    '10th class marksheet and certificate for date of birth verification.',
    '12th class marksheet and certificate.',
    'Graduation / ITI / Diploma certificate in relevant trade.',
    'State Domicile Certificate (Mool Niwas).',
    'Caste Certificate (SC/ST/OBC/EWS) if applicable.',
    'Recent passport size color photograph and scanned signature.',
    'Identity Proof (Aadhaar Card).'
  ];

  // How to apply steps
  const howToApplySteps = isHi ? (vacancy.howToApplyHi || [
    'चरण 1: सबसे पहले संबंधित भर्ती बोर्ड की आधिकारिक वेबसाइट अथवा राजस्थान SSO पोर्टल (sso.rajasthan.gov.in) पर जाएं।',
    'चरण 2: अपनी SSO ID और पासवर्ड के माध्यम से लॉगिन करें और "Recruitment Portal" पर क्लिक करें।',
    'चरण 3: Ongoing Recruitment सेक्शन में इस भर्ती के सामने दिए गए "Apply Now" बटन पर क्लिक करें।',
    'चरण 4: One Time Registration (OTR) से अपनी व्यक्तिगत जानकारी, श्रेणी एवं पते का सत्यापन करें।',
    'चरण 5: शैक्षणिक योग्यता, तकनीकी अनुभव एवं ट्रेड का सही विवरण दर्ज करें।',
    'चरण 6: निर्धारित प्रारूप व आकार (JPG 20-70 KB) में अपनी नवीनतम फोटो एवं हस्ताक्षर अपलोड करें।',
    'चरण 7: अपनी श्रेणी अनुसार ऑनलाइन आवेदन शुल्क का भुगतान करें।',
    'चरण 8: भरे गए संपूर्ण आवेदन पत्र की जांच (Preview) करें, फाइनल सबमिट करें और प्रिंटआउट भविष्य के लिए सुरक्षित रखें।'
  ]) : [
    'Step 1: Visit the official recruitment portal or Rajasthan SSO (sso.rajasthan.gov.in).',
    'Step 2: Log in using your credentials and open the Recruitment Portal.',
    'Step 3: Find this recruitment under the Ongoing Recruitment tab and click Apply Now.',
    'Step 4: Verify your personal details, category, and educational eligibility.',
    'Step 5: Upload your scanned photograph, signature, and required certificates.',
    'Step 6: Pay the requisite application fee via online payment gateway.',
    'Step 7: Preview the application carefully, submit, and download/print the final application form.'
  ];

  // FAQs
  const faqList = vacancy.faqs && vacancy.faqs.length > 0 ? vacancy.faqs : [
    {
      q: `What is the last date to apply for this vacancy?`,
      qHi: `इस भर्ती के लिए ऑनलाइन आवेदन की अंतिम तिथि क्या है?`,
      a: `The last date to apply is ${vacancy.importantDates?.applyLastDate || 'November 2026'}.`,
      aHi: `ऑनलाइन आवेदन करने की अंतिम तिथि ${vacancy.importantDates?.applyLastDate || '22 नवंबर 2026'} है। आवेदन रात 11:59 बजे तक जमा किए जा सकेंगे।`
    },
    {
      q: `What is the educational qualification required?`,
      qHi: `इस भर्ती के लिए शैक्षणिक योग्यता क्या है?`,
      a: `Candidates must possess minimum required educational qualification as per notification.`,
      aHi: `${vacancy.qualificationDetailsHi || 'दसवीं में न्यूनतम 50% अंकों के साथ संबंधित अधिसूचित ट्रेड में ITI / स्नातक की योग्यता आवश्यक है।'}`
    },
    {
      q: `Will there be a written exam for this recruitment?`,
      qHi: `क्या इस भर्ती में लिखित परीक्षा आयोजित की जाएगी?`,
      a: `Selection criteria is based on merit and exam pattern prescribed in the official notice.`,
      aHi: `चयन प्रक्रिया मेरिट अथवा लिखित परीक्षा और दस्तावेज सत्यापन के आधार पर नियमानुसार की जाएगी।`
    }
  ];

  return (
    <div className="w-full bg-[#f7f8f9] text-[#222222] pt-0 pb-2">


      {/* Main 2-Column WordPress GeneratePress Layout */}
      <div className="w-full max-w-7xl mx-auto px-[3%]" style={{ paddingLeft: '3%', paddingRight: '3%' }}>
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          
          {/* Main Article Content Area (70% on Desktop) */}
          <main className="w-full lg:w-[70%] min-w-0">
            <article 
              className="bg-white rounded-none sm:rounded-md p-2 sm:p-5 border-x sm:border border-slate-200 shadow-2xs"
              style={{ border: '1px solid #cbd5e1' }}
            >
              {/* Admin Actions Bar (when admin is active) */}
              {isAdmin && (
                <div className="mb-4 p-3 bg-slate-100 rounded-lg border border-slate-300 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>एडमिन कंट्रोल्स (Admin Mode Active)</span>
                      {lastSavedTime && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>ऑटो-सेव्ड ({lastSavedTime})</span>
                        </span>
                      )}
                      {hasUnsavedChanges && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-semibold animate-pulse">
                          <span>सहेजा जा रहा है...</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsDirectEditMode(!isDirectEditMode)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-xs transition cursor-pointer shadow-xs ${
                          isDirectEditMode
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        title="पेज पर सीधे शब्दों पर क्लिक करके एडिट करें"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isDirectEditMode ? '✓ वर्ड इन-प्लेस एडिट सक्रिय' : '✏️ वर्ड इन-प्लेस एडिट मोड'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddSectionOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-md font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ नया सेक्शन जोड़ें</span>
                      </button>
                      {onEditVacancy && (
                        <button
                          type="button"
                          onClick={() => onEditVacancy(currentVacancy)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-700 text-white rounded-md font-bold hover:bg-slate-800 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>फॉर्म एडिटर</span>
                        </button>
                      )}
                      {onDeleteVacancy && (
                        <button
                          type="button"
                          onClick={() => onDeleteVacancy(currentVacancy.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white rounded-md font-bold hover:bg-rose-700 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>डिलीट</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Direct Word Edit Guide Banner */}
                  {isDirectEditMode && (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-md text-amber-950 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-base">💡</span>
                        <span className="font-semibold text-xs">
                          डायरेक्ट वर्ड एडिट मोड चालू है: पेज के शीर्षक, तारीख, पद संख्या या किसी भी टेक्स्ट पर क्लिक करके सीधे टाइप करें। टाइप पूरा होते ही रियल-टाइम बिना लूप के ऑटो-सेव (Real-Time Auto-Save) हो जाएगा।
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDirectEditMode(false)}
                        className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] cursor-pointer"
                      >
                        एडिट मोड बंद करें
                      </button>
                    </div>
                  )}

                  {/* Restorable Deleted Sections Notice */}
                  {deletedKeys.length > 0 && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between gap-2 flex-wrap text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-semibold">हटाए गए सेक्शंस ({deletedKeys.length}):</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {deletedKeys.map(key => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleRestoreSection(key)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-slate-800 border border-amber-300 text-[11px] font-bold transition cursor-pointer"
                            title="इस सेक्शन को वापस लाएं"
                          >
                            <RefreshCw className="w-3 h-3 text-emerald-600" />
                            <span>{sectionLabels[key] ? sectionLabels[key].split('(')[0].trim() : key} पुनः जोड़ें</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Entry Header */}
              <header className="entry-header border-b border-slate-200 pb-4 mb-5">
                <EditableText
                  as="h1"
                  value={isHi ? (editablePost.titleHi || editablePost.title) : editablePost.title}
                  onChange={(val) => {
                    setEditablePost(prev => ({
                      ...prev,
                      titleHi: val,
                      title: val
                    }));
                  }}
                  titlePrefix="शीर्षक (Title)"
                  className="entry-title headlight font-bold text-slate-900 tracking-tight leading-snug"
                  style={{
                    fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '12pt',
                    lineHeight: 1.4
                  }}
                />

                {/* Entry Meta */}
                <div className="entry-meta text-[13px] text-[#575760] mt-2 flex items-center gap-3 flex-wrap">
                  <span className="posted-on flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <time className="entry-date published">
                      {vacancy.updatedAt || vacancy.importantDates?.notificationDate || 'October 22, 2026'}
                    </time>
                  </span>
                  <span>•</span>
                  <span className="byline">
                    by{' '}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectCategory) {
                          onSelectCategory('news');
                        } else {
                          onBack();
                        }
                      }}
                      className="font-bold text-[#0056b3] hover:underline cursor-pointer transition"
                      title={isHi ? 'लेटेस्ट न्यूज़ (Latest News) खोलें' : 'Open Latest News'}
                    >
                      RajasthanVacancy
                    </button>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                    {vacancy.organization}
                  </span>
                </div>
              </header>

              {/* Featured Graphical Card Banner */}
              <div className="mb-6 rounded-md overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-block bg-white/20 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded tracking-wider backdrop-blur-xs">
                      {editablePost.department || editablePost.organization}
                    </span>
                    <EditableText
                      as="h2"
                      value={editablePost.shortTitleHi || editablePost.shortTitle || shortJobName}
                      onChange={(val) => {
                        setEditablePost(prev => ({
                          ...prev,
                          shortTitleHi: val,
                          shortTitle: val
                        }));
                      }}
                      titlePrefix="संक्षिप्त नाम"
                      className="headlight text-lg sm:text-xl font-bold text-white tracking-wide"
                      style={{ fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: '12pt' }}
                    />
                    <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                      {isHi ? 'विस्तृत विज्ञापन, शैक्षणिक योग्यता, आयु सीमा एवं चयन प्रक्रिया' : 'Detailed Notification, Eligibility & Application Guide'}
                    </p>
                  </div>

                  {editablePost.totalPosts && (
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-center shrink-0 backdrop-blur-xs">
                      <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                        {isHi ? 'कुल पद / सीटें' : 'Total Posts'}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-amber-300">
                        <EditableText
                          value={editablePost.totalPosts}
                          onChange={(val) => {
                            setEditablePost(prev => ({ ...prev, totalPosts: val }));
                          }}
                          titlePrefix="कुल पद"
                        />
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Entry Content Body */}
              <div 
                className="entry-content space-y-6 text-[#334155]"
                style={{
                  fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '11.5pt',
                  lineHeight: 1.75
                }}
              >
                {/* Opening Lead Paragraphs */}
                <div className="space-y-3">
                  <p className="post-item">
                    <strong>{postTitle}:</strong>{' '}
                    <EditableText
                      value={editablePost.briefSummaryHi || `${editablePost.organization} द्वारा आधिकारिक नोटिफिकेशन जारी कर दिया गया है। इसके अंतर्गत कुल ${editablePost.totalPosts || 'विभिन्न'} पदों पर भर्ती हेतु योग्य अभ्यर्थियों से ऑनलाइन आवेदन आमंत्रित किए गए हैं।`}
                      onChange={(val) => {
                        setEditablePost(prev => ({ ...prev, briefSummaryHi: val }));
                      }}
                      titlePrefix="संक्षिप्त विवरण सारांश"
                    />
                  </p>
                  <p className="post-item">
                    {isHi 
                      ? `इस भर्ती के लिए ऑनलाइन आवेदन निर्धारित तिथि से प्रारंभ हो चुके हैं। इच्छुक व पात्र अभ्यर्थी निर्धारित अंतिम तिथि ${editablePost.importantDates?.applyLastDate || 'अंतिम तिथि'} तक आधिकारिक वेबसाइट पर जाकर ऑनलाइन आवेदन कर सकते हैं। भर्ती से संबंधित विस्तृत विवरण जैसे शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, चयन प्रक्रिया और महत्वपूर्ण तिथियां नीचे दी गई हैं।`
                      : `Online applications are invited for eligible candidates. The last date to submit the application form is ${editablePost.importantDates?.applyLastDate}. Check the detailed overview, eligibility criteria, application fee, and direct links below.`}
                  </p>
                </div>

                {/* Table 1: का संक्षिप्त विवरण (Quick Overview Table) */}
                {!isSectionDeleted('overview') && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        {shortJobName} का संक्षिप्त विवरण
                      </h2>
                      {renderAdminSectionControls('overview', 'संक्षिप्त विवरण')}
                    </div>
                    <div className="overflow-x-auto border border-slate-300 rounded-md">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300">
                            <th className="p-3 font-bold text-slate-900 border-r border-slate-300 w-1/3">विवरण</th>
                            <th className="p-3 font-bold text-slate-900">जानकारी</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">भर्ती संस्था</td>
                            <td className="p-3">
                              <EditableText
                                value={editablePost.department || editablePost.organization}
                                onChange={(val) => setEditablePost(prev => ({ ...prev, department: val }))}
                                titlePrefix="विभाग / संस्था"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">भर्ती का नाम</td>
                            <td className="p-3">
                              <EditableText
                                value={editablePost.shortTitleHi || editablePost.shortTitle || shortJobName}
                                onChange={(val) => setEditablePost(prev => ({ ...prev, shortTitleHi: val, shortTitle: val }))}
                                titlePrefix="भर्ती नाम"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">विज्ञापन संख्या</td>
                            <td className="p-3">
                              <EditableText
                                value={editablePost.advtNo || 'विज्ञप्ति अनुसार'}
                                onChange={(val) => setEditablePost(prev => ({ ...prev, advtNo: val }))}
                                titlePrefix="विज्ञापन संख्या"
                                placeholder="विज्ञप्ति अनुसार"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">घोषित कुल पद / सीटें</td>
                            <td className="p-3 font-bold text-emerald-800">
                              <EditableText
                                value={editablePost.totalPosts || 'विभिन्न पद'}
                                onChange={(val) => setEditablePost(prev => ({ ...prev, totalPosts: val }))}
                                titlePrefix="कुल पद"
                                className="font-bold text-emerald-800"
                                placeholder="विभिन्न पद"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">नोटिफिकेशन तिथि</td>
                            <td className="p-3">
                              <EditableText
                                value={editablePost.importantDates?.notificationDate || ''}
                                onChange={(val) => setEditablePost(prev => ({
                                  ...prev,
                                  importantDates: { ...prev.importantDates, notificationDate: val }
                                }))}
                                titlePrefix="नोटिफिकेशन तिथि"
                                placeholder="शीघ्र"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">आवेदन शुरू</td>
                            <td className="p-3 font-semibold text-emerald-700">
                              <EditableText
                                value={editablePost.importantDates?.applyStartDate || ''}
                                onChange={(val) => setEditablePost(prev => ({
                                  ...prev,
                                  importantDates: { ...prev.importantDates, applyStartDate: val }
                                }))}
                                titlePrefix="आवेदन शुरू तिथि"
                                className="font-semibold text-emerald-700"
                                placeholder="शीघ्र"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">ऑनलाइन आवेदन की अंतिम तिथि</td>
                            <td className="p-3 font-bold text-rose-700">
                              <EditableText
                                value={editablePost.importantDates?.applyLastDate || ''}
                                onChange={(val) => setEditablePost(prev => ({
                                  ...prev,
                                  importantDates: { ...prev.importantDates, applyLastDate: val }
                                }))}
                                titlePrefix="अंतिम तिथि"
                                className="font-bold text-rose-700"
                                placeholder="शीघ्र"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">आवेदन का माध्यम</td>
                            <td className="p-3">ऑनलाइन (Online Portal)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">शैक्षणिक योग्यता</td>
                            <td className="p-3">
                              <EditableText
                                value={editablePost.qualificationDetailsHi || editablePost.qualificationDetails || 'पद अनुसार 10वीं / 12वीं / स्नातक / ITI पास'}
                                onChange={(val) => setEditablePost(prev => ({
                                  ...prev,
                                  qualificationDetailsHi: val,
                                  qualificationDetails: val
                                }))}
                                titlePrefix="शैक्षणिक योग्यता"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">वेतनमान / पे-मैट्रिक्स</td>
                            <td className="p-3">
                              <EditableText
                                value={editablePost.salaryHi || editablePost.salary || 'पे-मैट्रिक्स नियमानुसार देय'}
                                onChange={(val) => setEditablePost(prev => ({
                                  ...prev,
                                  salaryHi: val,
                                  salary: val
                                }))}
                                titlePrefix="वेतनमान"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">आधिकारिक वेबसाइट</td>
                            <td className="p-3 text-blue-700 font-semibold underline">
                              <a href={editablePost.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in'} target="_blank" rel="noopener noreferrer">
                                {editablePost.officialLinks?.officialWebsiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'rajasthan.gov.in'}
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section: Latest Update */}
                {!isSectionDeleted('latest_update') && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        {shortJobName} Latest Update
                      </h2>
                      {renderAdminSectionControls('latest_update', 'लेटेस्ट अपडेट')}
                    </div>
                    <p className="post-item">
                      {vacancy.descriptionHi || vacancy.briefSummaryHi || `${vacancy.organization} द्वारा भर्ती का विस्तृत विज्ञापन जारी किया गया है। इच्छुक अभ्यर्थी आवेदन शुरू होने से पहले अपनी पात्रता जाँचकर सभी आवश्यक दस्तावेज तैयार कर लें।`}
                    </p>
                  </div>
                )}

                {/* Section: Latest News (ताज़ा समाचार / Live Updates) */}
                {!isSectionDeleted('latest_news') && (
                  <div className="my-4 border border-emerald-600 bg-white rounded shadow-2xs overflow-hidden">
                    <div 
                      className="text-white px-3 sm:px-4 py-2.5 flex items-center justify-between flex-wrap gap-2"
                      style={{ backgroundColor: '#008000' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                        </span>
                        <h2 className="text-[12pt] sm:text-[14pt] font-black uppercase tracking-wide flex items-center gap-1.5 text-white">
                          <Bell className="w-4 h-4 text-yellow-300 inline-block" />
                          <span>{shortJobName} Latest News (ताज़ा समाचार)</span>
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold bg-yellow-400 text-slate-950 px-2 py-0.5 rounded shadow-2xs">
                          {(Array.isArray(editablePost?.latestNews) ? editablePost.latestNews : []).length} अपडेट्स
                        </span>
                        {isDirectEditMode && (
                          <button
                            type="button"
                            onClick={() => {
                              const currentNews = Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [];
                              const newItem = {
                                id: `news-${Date.now()}`,
                                date: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
                                badge: 'नया अपडेट',
                                headline: 'नया समाचार शीर्षक यहां लिखें',
                                details: 'समाचार का विवरण यहां लिखें। अभ्यर्थी नियमित रूप से पोर्टल चेक करते रहें।',
                                isHighlighted: true
                              };
                              setEditablePost({
                                ...editablePost,
                                latestNews: [newItem, ...currentNews]
                              });
                            }}
                            className="text-xs bg-amber-300 hover:bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ समाचार जोड़ें</span>
                          </button>
                        )}
                        {renderAdminSectionControls('latest_news', 'ताज़ा समाचार')}
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 divide-y divide-emerald-100 space-y-3 bg-emerald-50/20">
                      {(Array.isArray(editablePost?.latestNews) ? editablePost.latestNews : []).map((news: any, idx: number) => (
                        <div 
                          key={news.id || idx} 
                          className={`p-3 rounded border transition-all ${
                            news.isHighlighted 
                              ? 'bg-amber-50/70 border-amber-300 shadow-2xs' 
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10.5px] font-black uppercase px-2 py-0.5 rounded bg-emerald-700 text-white shadow-2xs">
                                <EditableText
                                  value={news.badge || 'अपडेट'}
                                  onChange={(val) => {
                                    const list = [...(Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [])];
                                    list[idx] = { ...list[idx], badge: val };
                                    setEditablePost({ ...editablePost, latestNews: list });
                                  }}
                                  className="text-white font-black"
                                  titlePrefix="बैज"
                                />
                              </span>
                              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <EditableText
                                  value={news.date || 'अक्टूबर 2026'}
                                  onChange={(val) => {
                                    const list = [...(Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [])];
                                    list[idx] = { ...list[idx], date: val };
                                    setEditablePost({ ...editablePost, latestNews: list });
                                  }}
                                  className="font-bold text-slate-700"
                                  titlePrefix="दिनांक"
                                />
                              </span>
                            </div>

                            {isDirectEditMode && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...(Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [])];
                                    list[idx] = { ...list[idx], isHighlighted: !list[idx].isHighlighted };
                                    setEditablePost({ ...editablePost, latestNews: list });
                                  }}
                                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-bold cursor-pointer"
                                  title="हाइलाइट टॉगल करें"
                                >
                                  {news.isHighlighted ? '⭐ विशेष' : 'साधारण'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = (Array.isArray(editablePost.latestNews) ? editablePost.latestNews : []).filter((_: any, i: number) => i !== idx);
                                    setEditablePost({ ...editablePost, latestNews: list });
                                  }}
                                  className="text-[10px] px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded border border-rose-300 font-bold cursor-pointer"
                                  title="समाचार हटाएं"
                                >
                                  🗑️ हटाएं
                                </button>
                              </div>
                            )}
                          </div>

                          <h3 className="font-extrabold text-[11.5pt] sm:text-[12.5pt] mb-1 leading-snug">
                            <EditableText
                              value={news.headline}
                              onChange={(val) => {
                                const list = [...(Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [])];
                                list[idx] = { ...list[idx], headline: val };
                                setEditablePost({ ...editablePost, latestNews: list });
                              }}
                              className="text-[#0000ff] font-bold"
                              titlePrefix="हेडलाइन"
                            />
                          </h3>

                          <div className="text-[10.5pt] sm:text-[11pt] text-slate-700 leading-relaxed">
                            <EditableText
                              value={news.details}
                              onChange={(val) => {
                                const list = [...(Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [])];
                                list[idx] = { ...list[idx], details: val };
                                setEditablePost({ ...editablePost, latestNews: list });
                              }}
                              as="span"
                              className="text-slate-800"
                              titlePrefix="विवरण"
                            />
                          </div>
                        </div>
                      ))}

                      {(!Array.isArray(editablePost?.latestNews) || editablePost.latestNews.length === 0) && (
                        <div className="p-3 text-center text-slate-500 text-sm">
                          फिलहाल कोई ताज़ा समाचार नहीं है।
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2-Column Grid: Important Dates & Application Fee */}
                {!isSectionDeleted('dates') && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        महत्वपूर्ण तिथियाँ एवं आवेदन शुल्क
                      </h2>
                      {renderAdminSectionControls('dates', 'तिथियां व शुल्क')}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-400 border border-slate-400 bg-white overflow-hidden text-[11pt] sm:text-[12pt] shadow-2xs">
                      {/* कॉलम 1: Important Dates */}
                      <div className="flex flex-col bg-white">
                        <div className="text-white px-2 sm:px-3 py-1.5 text-[12pt] sm:text-[14pt] font-black uppercase text-center" style={{ backgroundColor: '#008000' }}>
                          Important Dates
                        </div>
                        <div className="p-2 sm:p-4 divide-y divide-slate-100 space-y-1.5 flex-1">
                          {(Array.isArray(editablePost?.importantDates) ? editablePost.importantDates : []).map((date: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:justify-between py-1 text-[11pt]">
                              <EditableText
                                value={date.label}
                                onChange={(val) => {
                                  const list = [...(Array.isArray(editablePost.importantDates) ? editablePost.importantDates : [])];
                                  list[idx] = { ...list[idx], label: val };
                                  setEditablePost({ ...editablePost, importantDates: list });
                                }}
                                className="font-bold text-slate-900"
                              />
                              <EditableText
                                value={date.value}
                                onChange={(val) => {
                                  const list = [...(Array.isArray(editablePost.importantDates) ? editablePost.importantDates : [])];
                                  list[idx] = { ...list[idx], value: val };
                                  setEditablePost({ ...editablePost, importantDates: list });
                                }}
                                className="font-extrabold text-[#0000ff]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* कॉलम 2: Application Fee */}
                      <div className="flex flex-col bg-white">
                        <div className="text-white px-2 sm:px-3 py-1.5 text-[12pt] sm:text-[14pt] font-black uppercase text-center" style={{ backgroundColor: '#008000' }}>
                          Application Fee
                        </div>
                        <div className="p-2 sm:p-4 divide-y divide-slate-100 space-y-1.5 flex-1">
                          {(Array.isArray(editablePost?.applicationFee) ? editablePost.applicationFee : []).map((fee: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:justify-between py-1 text-[11pt]">
                              <EditableText
                                value={fee.category}
                                onChange={(val) => {
                                  const list = [...(Array.isArray(editablePost.applicationFee) ? editablePost.applicationFee : [])];
                                  list[idx] = { ...list[idx], category: val };
                                  setEditablePost({ ...editablePost, applicationFee: list });
                                }}
                                className="font-bold text-slate-900"
                              />
                              <EditableText
                                value={fee.amount}
                                onChange={(val) => {
                                  const list = [...(Array.isArray(editablePost.applicationFee) ? editablePost.applicationFee : [])];
                                  list[idx] = { ...list[idx], amount: val };
                                  setEditablePost({ ...editablePost, applicationFee: list });
                                }}
                                className="font-extrabold text-[#ff0000]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table 3: पदों का विवरण (Post Breakdown) if available */}
                {!isSectionDeleted('post_breakdown') && vacancy.postBreakdown && vacancy.postBreakdown.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        {shortJobName} पदों / सीटों का विवरण
                      </h2>
                      {renderAdminSectionControls('post_breakdown', 'पद विवरण')}
                    </div>
                    <div className="overflow-x-auto border border-slate-300 rounded-md">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300">
                            <th className="p-3 font-bold text-slate-900 border-r border-slate-300">क्रमांक</th>
                            <th className="p-3 font-bold text-slate-900 border-r border-slate-300">पद / ट्रेड नाम</th>
                            <th className="p-3 font-bold text-slate-900 border-r border-slate-300">कुल पद</th>
                            <th className="p-3 font-bold text-slate-900">योग्यता</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {vacancy.postBreakdown.map((pb, idx) => (
                            <tr key={idx}>
                              <td className="p-3 text-center border-r border-slate-200">{idx + 1}</td>
                              <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">{isHi ? pb.postNameHi : pb.postName}</td>
                              <td className="p-3 font-bold text-emerald-700 border-r border-slate-200">{pb.postsCount}</td>
                              <td className="p-3">{isHi ? pb.qualificationHi : pb.qualification}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section 4: शैक्षणिक योग्यता (Educational Qualification) */}
                {!isSectionDeleted('qualification') && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        {shortJobName} शैक्षणिक योग्यता
                      </h2>
                      {renderAdminSectionControls('qualification', 'शैक्षणिक योग्यता')}
                    </div>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                      <li>मान्यता प्राप्त बोर्ड या संस्थान से संबंधित शैक्षणिक परीक्षा उत्तीर्ण हो।</li>
                      <li>{vacancy.qualificationDetailsHi || vacancy.qualificationDetails || '10वीं / 12वीं / स्नातक अथवा संबंधित विषय में आवश्यक डिग्री/डिप्लोमा।'}</li>
                      <li>आवेदन जमा करने की अंतिम तिथि तक सभी आवश्यक शैक्षणिक एवं तकनीकी योग्यता पूर्ण होनी चाहिए।</li>
                      <li>विस्तृत एवं पदवार शैक्षणिक योग्यता की जानकारी आधिकारिक नोटिफिकेशन से प्राप्त करें।</li>
                    </ul>
                  </div>
                )}

                {/* Section 5: आयु सीमा (Age Limit) & Table */}
                {!isSectionDeleted('age_limit') && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        आयु सीमा (Age Limit)
                      </h2>
                      {renderAdminSectionControls('age_limit', 'आयु सीमा')}
                    </div>
                    <p className="post-item mb-3">
                      अभ्यर्थी की न्यूनतम आयु{' '}
                      <strong>
                        <EditableText
                          value={editablePost.ageLimit?.min || 18}
                          onChange={(val) => {
                            const num = parseInt(val) || 18;
                            setEditablePost(prev => ({
                              ...prev,
                              ageLimit: { ...prev.ageLimit, min: num }
                            }));
                          }}
                          titlePrefix="न्यूनतम आयु"
                        />{' '}
                        वर्ष
                      </strong>{' '}
                      तथा अधिकतम आयु{' '}
                      <strong>
                        <EditableText
                          value={editablePost.ageLimit?.max || 40}
                          onChange={(val) => {
                            const num = parseInt(val) || 40;
                            setEditablePost(prev => ({
                              ...prev,
                              ageLimit: { ...prev.ageLimit, max: num }
                            }));
                          }}
                          titlePrefix="अधिकतम आयु"
                        />{' '}
                        वर्ष
                      </strong>{' '}
                      निर्धारित की गई है। आयु की गणना{' '}
                      <EditableText
                        value={editablePost.ageLimit?.asOnDate || '2026'}
                        onChange={(val) => {
                          setEditablePost(prev => ({
                            ...prev,
                            ageLimit: { ...prev.ageLimit, asOnDate: val }
                          }));
                        }}
                        titlePrefix="आयु गणना तिथि"
                      />{' '}
                      को आधार मानकर की जाएगी। आरक्षित वर्गों को नियमानुसार अधिकतम आयु सीमा में छूट देय होगी।
                    </p>

                    <div className="overflow-x-auto border border-slate-300 rounded-md">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300">
                            <th className="p-3 font-bold text-slate-900 border-r border-slate-300 w-1/2">श्रेणी</th>
                            <th className="p-3 font-bold text-slate-900">अधिकतम आयु सीमा में छूट</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="p-3 bg-slate-50 border-r border-slate-200">अनुसूचित जाति / अनुसूचित जनजाति (SC/ST)</td>
                            <td className="p-3 font-semibold text-emerald-800">5 वर्ष</td>
                          </tr>
                          <tr>
                            <td className="p-3 bg-slate-50 border-r border-slate-200">अन्य पिछड़ा वर्ग (OBC / MBC)</td>
                            <td className="p-3 font-semibold text-emerald-800">3 से 5 वर्ष</td>
                          </tr>
                          <tr>
                            <td className="p-3 bg-slate-50 border-r border-slate-200">दिव्यांग अभ्यर्थी (PwD)</td>
                            <td className="p-3 font-semibold text-emerald-800">10 वर्ष</td>
                          </tr>
                          <tr>
                            <td className="p-3 bg-slate-50 border-r border-slate-200">भूतपूर्व सैनिक (Ex-Servicemen)</td>
                            <td className="p-3 font-semibold text-emerald-800">नियमानुसार</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}



                {/* Section 7: चयन प्रक्रिया (Selection Process) */}
                {!isSectionDeleted('selection_process') && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        चयन प्रक्रिया और मेरिट की गणना
                      </h2>
                      {renderAdminSectionControls('selection_process', 'चयन प्रक्रिया')}
                    </div>
                    <p className="post-item mb-2">
                      इस भर्ती में चयन प्रक्रिया निम्नलिखित चरणों के आधार पर की जाएगी:
                    </p>
                    <ol className="list-decimal pl-5 space-y-1.5 text-slate-800">
                      <li>लिखित परीक्षा अथवा शैक्षणिक प्राप्तांकों की मेरिट सूची (Merit List)।</li>
                      <li>मूल दस्तावेजों का भौतिक सत्यापन (Document Verification)।</li>
                      <li>चिकित्सीय परीक्षण (Medical Fitness Examination)।</li>
                      <li>अंतिम चयन सूची का प्रकाशन।</li>
                    </ol>
                  </div>
                )}

                {/* In-article Ad Section */}
                <div className="my-4">
                  <AdSection 
                    client="ca-pub-8302542447035711"
                    slot="3785509362"
                    label={isHi ? 'विज्ञापन' : 'Advertisement'}
                  />
                </div>

                {/* Section 8: आवेदन के लिए आवश्यक दस्तावेज (Required Documents) */}
                {!isSectionDeleted('documents') && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        आवेदन के लिए आवश्यक दस्तावेज
                      </h2>
                      {renderAdminSectionControls('documents', 'आवश्यक दस्तावेज')}
                    </div>
                    <p className="post-item mb-2">
                      ऑनलाइन फॉर्म भरने से पूर्व निम्नलिखित दस्तावेज और जानकारी तैयार रखें:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-800 mb-4">
                      {documentsList.map((doc, i) => (
                        <li key={i}>{doc}</li>
                      ))}
                    </ul>

                    {/* Photo & Signature Specs Table */}
                    <div className="overflow-x-auto border border-slate-300 rounded-md">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300">
                            <th className="p-2.5 font-bold text-slate-900 border-r border-slate-300">दस्तावेज</th>
                            <th className="p-2.5 font-bold text-slate-900 border-r border-slate-300">निर्धारित प्रारूप</th>
                            <th className="p-2.5 font-bold text-slate-900">आकार (Size)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="p-2.5 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">पासपोर्ट साइज फोटो</td>
                            <td className="p-2.5 border-r border-slate-200">JPG / JPEG, 20 से 70 KB</td>
                            <td className="p-2.5">3.5 × 3.5 सेमी</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">हस्ताक्षर (Signature)</td>
                            <td className="p-2.5 border-r border-slate-200">JPG / JPEG, 20 से 30 KB</td>
                            <td className="p-2.5">3.5 × 2.5 सेमी</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section 9: आवेदन कैसे करें (How to Apply Step-by-Step) */}
                {!isSectionDeleted('how_to_apply') && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        {shortJobName} के लिए आवेदन कैसे करें?
                      </h2>
                      {renderAdminSectionControls('how_to_apply', 'आवेदन कैसे करें')}
                    </div>
                    <ol className="list-decimal pl-5 space-y-2 text-slate-800">
                      {howToApplySteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Some Useful Important Links Section */}
                {!isSectionDeleted('important_links') && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        {shortJobName} Useful Important Links
                      </h2>
                      {renderAdminSectionControls('important_links', 'महत्वपूर्ण लिंक्स')}
                    </div>

                    <div className="border border-slate-400 bg-white overflow-hidden text-[11.5pt] shadow-2xs">
                      {/* Header */}
                      <div 
                        className="text-white px-4 py-2.5 text-[14pt] sm:text-[16pt] font-black uppercase tracking-wide flex items-center justify-between flex-wrap gap-2" 
                        style={{ backgroundColor: '#008000' }}
                      >
                        <span>Some Useful Important Links</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-yellow-400 text-slate-950 font-bold px-2 py-0.5 rounded shadow-2xs">
                            {(Array.isArray(editablePost?.directLinks) ? editablePost.directLinks : []).length} लिंक्स
                          </span>
                          {isDirectEditMode && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* PDF जोड़ने का बटन */}
                              <button
                                type="button"
                                onClick={() => {
                                  setPdfUploadTargetIndex(null);
                                  setIsPdfModalOpen(true);
                                }}
                                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-black px-2.5 py-1 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>+ 📄 PDF जोड़ें</span>
                              </button>
                              {/* सामान्य लिंक जोड़ने का बटन */}
                              <button
                                type="button"
                                onClick={handleAddDirectLink}
                                className="text-xs bg-white text-emerald-900 hover:bg-emerald-100 font-black px-2.5 py-1 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ नया लिंक</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Links Rows */}
                      <div className="divide-y divide-slate-300 text-[11.5pt]">
                        {(Array.isArray(editablePost?.directLinks) ? editablePost.directLinks : []).map((link: any, idx: number) => {
                          // PDF लिंक डिटेक्शन
                          const isPdf = Boolean(
                            link.isPdf ||
                            link.type === 'notification' ||
                            link.type === 'syllabus' ||
                            link.label?.toLowerCase().includes('pdf') ||
                            link.actionText?.toLowerCase().includes('pdf') ||
                            (link.url && (
                              link.url.toLowerCase().endsWith('.pdf') ||
                              link.url.toLowerCase().includes('.pdf?') ||
                              link.url.startsWith('data:application/pdf')
                            ))
                          );

                          const btnBg = isPdf
                            ? 'bg-rose-700 hover:bg-rose-800'
                            : 'bg-[#0000ff] hover:bg-blue-800';

                          return (
                            <div 
                              key={idx} 
                              className={`flex flex-row items-center justify-between p-2.5 sm:p-4 hover:bg-slate-50 gap-2 sm:gap-4 transition-colors ${
                                isPdf ? 'border-l-4 border-l-rose-600' : ''
                              }`}
                            >
                              {/* Link Label & PDF Badge */}
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {isPdf ? (
                                  <span className="font-bold text-rose-600 text-base shrink-0">📄</span>
                                ) : (
                                  <span className="font-black text-slate-700 text-lg shrink-0">•</span>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <EditableText
                                      value={link.label}
                                      onChange={(newVal) => {
                                        setEditablePost(prev => {
                                          const list = [...(prev.directLinks || [])];
                                          list[idx] = { ...list[idx], label: newVal };
                                          return { ...prev, directLinks: list };
                                        });
                                      }}
                                      className="font-bold text-[11.5pt] sm:text-[13pt] leading-snug cursor-text"
                                      style={{ color: '#ff00ff' }}
                                    />
                                    {isPdf && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded uppercase">
                                        <FileText className="w-3 h-3" />
                                        <span>PDF</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Button: Click Here or Download PDF */}
                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={link.url || 'https://sarkariresult12.vercel.app/#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={isPdf ? (link.fileName || `${(link.label || 'file').replace(/\s+/g, '_')}.pdf`) : undefined}
                                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-white font-bold rounded text-[11pt] sm:text-[11.5pt] shadow-2xs ${btnBg}`}
                                >
                                  {isPdf ? (
                                    <>
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>{link.actionText || 'Download PDF'}</span>
                                      <Download className="w-3.5 h-3.5" />
                                    </>
                                  ) : (
                                    <>
                                      <span>{link.actionText || 'Click Here'}</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </>
                                  )}
                                </a>

                                {/* Edit Mode Buttons */}
                                {isDirectEditMode && (
                                  <button
                                    type="button"
                                    onClick={() => handleAttachPdfToLink(idx)}
                                    className="text-[11px] bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold px-2 py-1 rounded cursor-pointer"
                                    title="PDF फ़ाइल बदलें"
                                  >
                                    📄 PDF
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Sections added by Admin */}
                {currentVacancy.customSections && currentVacancy.customSections.length > 0 && (
                  <div className="space-y-5 pt-2">
                    {currentVacancy.customSections.map((sec) => (
                      <div key={sec.id} className="p-4 rounded-lg bg-sky-50/60 border border-sky-200 transition shadow-2xs">
                        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-sky-200">
                          <h2 
                            className="headlight font-bold text-slate-900 flex items-center gap-1.5"
                            style={{ 
                              fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                              fontSize: '12pt',
                              color: '#0f172a'
                            }}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
                            <span>{sec.titleHi || sec.title}</span>
                          </h2>
                          {isAdmin && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingCustomSection(sec)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition cursor-pointer"
                                title="इस सेक्शन को संपादित करें"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>संपादित करें</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(`custom_${sec.id}`)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                                title="इस कस्टम सेक्शन को हटाएं"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>हटाएं</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {sec.sectionType === 'alert_box' ? (
                          <div className="p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-950 rounded text-sm post-item">
                            {sec.contentHi || sec.content}
                          </div>
                        ) : sec.sectionType === 'bullets' ? (
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-800 post-item text-sm">
                            {(sec.contentHi || sec.content).split('\n').filter(Boolean).map((line, lIdx) => (
                              <li key={lIdx}>{line.replace(/^[-•*]\s*/, '')}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line post-item">
                            {sec.contentHi || sec.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin Quick Add Section Banner */}
                {isAdmin && (
                  <div className="my-4 p-4 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4 text-sky-600" />
                        <span>इस पोस्ट में नया सेक्शन जोड़ें (Add Custom Section)</span>
                      </p>
                      <p className="text-[11px] text-slate-600">
                        परीक्षा सिलेबस, कट ऑफ, आंसर की, या अतिरिक्त दिशा-निर्देश तुरंत जोड़ें।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddSectionOpen(true)}
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer shrink-0"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ नया सेक्शन जोड़ें</span>
                    </button>
                  </div>
                )}

                {/* Normal In-Content Post Share Box (सामान्य शेयर सेक्शन) */}
                <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 headlight">
                        <Share2 className="w-4 h-4 text-[#1e953a]" />
                        <span>{isHi ? 'पोस्ट शेयर करें (Share This Post):' : 'Share This Post:'}</span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {isHi ? 'व्हाट्सएप एवं टेलीग्राम पर अपने मित्रों के साथ यह जानकारी शेयर करें।' : 'Share this job update with friends on WhatsApp & Telegram.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleWhatsAppShare}
                        className="px-3.5 py-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTelegramShare}
                        className="px-3.5 py-2 rounded-lg bg-[#0088cc] hover:bg-[#0077b5] text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                        title="Share on Telegram"
                      >
                        <Send className="w-4 h-4" />
                        <span>Telegram</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-extrabold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                        title="Copy Link"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : (isHi ? 'लिंक कॉपी करें' : 'Copy Link')}</span>
                      </button>

                      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                        <button
                          type="button"
                          onClick={handleShare}
                          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                          title="More Share Options"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{isHi ? 'अन्य' : 'More'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 11: FAQs Section (Rank Math FAQ format) */}
                {!isSectionDeleted('faqs') && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                      <h2 
                        className="headlight font-bold text-slate-900"
                        style={{ 
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                          fontSize: '12pt',
                          color: '#0f172a'
                        }}
                      >
                        {shortJobName} FAQs
                      </h2>
                      {renderAdminSectionControls('faqs', 'FAQs')}
                    </div>
                    <div className="space-y-3">
                      {faqList.map((faq, idx) => (
                        <div 
                          key={idx} 
                          className="bg-slate-50 border border-slate-200 rounded-md p-4 transition"
                        >
                          <h3 
                            className="headlight font-bold text-slate-900 text-sm mb-1.5 flex items-start gap-2"
                            style={{ fontSize: '12pt' }}
                          >
                            <span className="text-[#1e953a]">Q.</span>
                            <span>{isHi ? (faq.qHi || faq.q) : faq.q}</span>
                          </h3>
                          <div className="text-slate-700 text-xs sm:text-sm pl-5 border-l-2 border-[#1e953a] mt-2">
                            <p className="post-item">{isHi ? (faq.aHi || faq.a) : faq.a}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Entry Footer Meta: Categories & Post Navigation */}
              <footer className="entry-meta border-t border-slate-200 pt-5 mt-8">
                {/* Categories Tagging */}
                <div className="flex items-center gap-2 mb-6 flex-wrap text-xs font-semibold text-slate-600">
                  <Folder className="w-4 h-4 text-[#1e953a]" />
                  <span>Categories:</span>
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                    Latest Job
                  </span>
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                    Latest News
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-200">
                    {vacancy.organization}
                  </span>
                </div>

                {/* Post Navigation: Previous & Next Post Links (Light Blue Styling) */}
                <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-sky-100 pt-4">
                  {prevPost ? (
                    <button
                      type="button"
                      onClick={() => onSelectOtherVacancy(prevPost)}
                      className="text-left p-3.5 rounded-lg border border-sky-200 bg-sky-50/80 hover:bg-sky-100/90 hover:border-sky-300 transition cursor-pointer group shadow-2xs"
                    >
                      <span className="text-[11px] font-bold text-sky-700 uppercase flex items-center gap-1 group-hover:text-blue-700">
                        <ChevronLeft className="w-3.5 h-3.5 text-sky-600" />
                        <span>Previous Post</span>
                      </span>
                      <p className="post-item font-semibold text-xs sm:text-sm text-sky-950 group-hover:text-blue-800 line-clamp-2 mt-1">
                        {isHi ? (prevPost.titleHi || prevPost.title) : prevPost.title}
                      </p>
                    </button>
                  ) : <div />}

                  {nextPost ? (
                    <button
                      type="button"
                      onClick={() => onSelectOtherVacancy(nextPost)}
                      className="text-right p-3.5 rounded-lg border border-sky-200 bg-sky-50/80 hover:bg-sky-100/90 hover:border-sky-300 transition cursor-pointer group shadow-2xs"
                    >
                      <span className="text-[11px] font-bold text-sky-700 uppercase flex items-center justify-end gap-1 group-hover:text-blue-700">
                        <span>Next Post</span>
                        <ChevronRight className="w-3.5 h-3.5 text-sky-600" />
                      </span>
                      <p className="post-item font-semibold text-xs sm:text-sm text-sky-950 group-hover:text-blue-800 line-clamp-2 mt-1">
                        {isHi ? (nextPost.titleHi || nextPost.title) : nextPost.title}
                      </p>
                    </button>
                  ) : <div />}
                </nav>
              </footer>

              {/* Leave a Comment Area matching WordPress style */}
              <div className="comments-area border-t border-slate-200 pt-6 mt-8">
                <h3 
                  className="headlight font-bold text-slate-900 text-lg mb-4"
                  style={{ fontSize: '12pt' }}
                >
                  Leave a Comment
                </h3>

                {commentSubmitted && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>आपकी टिप्पणी सफलतापूर्वक दर्ज कर ली गई है!</span>
                  </div>
                )}

                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Comment *</label>
                    <textarea
                      rows={4}
                      required
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="अपनी टिप्पणी या प्रश्न यहाँ लिखें..."
                      className="w-full bg-[#f7f8f9] border border-slate-300 rounded p-2.5 text-xs focus:bg-white focus:outline-none focus:border-[#1e953a]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={newCommentName}
                        onChange={(e) => setNewCommentName(e.target.value)}
                        placeholder="आपका नाम"
                        className="w-full bg-[#f7f8f9] border border-slate-300 rounded p-2 text-xs focus:bg-white focus:outline-none focus:border-[#1e953a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={newCommentEmail}
                        onChange={(e) => setNewCommentEmail(e.target.value)}
                        placeholder="आपका ईमेल"
                        className="w-full bg-[#f7f8f9] border border-slate-300 rounded p-2 text-xs focus:bg-white focus:outline-none focus:border-[#1e953a]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#55555e] hover:bg-[#3f4047] text-white text-xs font-bold rounded transition cursor-pointer"
                  >
                    Post Comment
                  </button>
                </form>

                {/* Display Published Comments */}
                {comments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                    <span className="text-xs font-bold text-slate-500 block mb-2">
                      टिप्पणियां ({comments.length})
                    </span>
                    {comments.map((cm) => (
                      <div key={cm.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-800">{cm.name}</span>
                          <span className="text-[11px] text-slate-400">{cm.date}</span>
                        </div>
                        <p className="text-xs text-slate-700 post-item">{cm.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </main>

          {/* Right Sidebar (30% on Desktop) */}
          <aside className="w-full lg:w-[30%] shrink-0 space-y-6">
            {/* Widget 1: Search Widget */}
            <div className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 shadow-2xs">
              <h2 
                className="headlight font-bold text-slate-900 mb-3"
                style={{ fontSize: '12pt' }}
              >
                Search
              </h2>
              <div className="relative">
                <input
                  type="search"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="खोजें..."
                  className="w-full bg-[#f7f8f9] border border-slate-300 rounded p-2 text-xs pr-8 focus:bg-white focus:outline-none focus:border-[#1e953a]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Widget 2: Recent Posts Widget */}
            <div className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 shadow-2xs">
              <h2 
                className="font-extrabold text-[#0056b3] mb-3 border-b border-blue-200 pb-2 flex items-center gap-1.5"
                style={{ fontSize: '12pt', color: '#0056b3' }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#0056b3] inline-block shrink-0"></span>
                <span className="text-[#0056b3]">{isHi ? 'हाल ही की पोस्ट (Recent Posts)' : 'Recent Posts'}</span>
              </h2>

              <ul className="space-y-3 divide-y divide-dashed divide-blue-100">
                {filteredRecentPosts.map((rp) => (
                  <li key={rp.id} className="pt-2.5 first:pt-0">
                    <button
                      type="button"
                      onClick={() => onSelectOtherVacancy(rp)}
                      className="text-left w-full group cursor-pointer block"
                    >
                      <h3 
                        className="font-bold text-[#0056b3] group-hover:text-blue-900 group-hover:underline line-clamp-2 leading-snug"
                        style={{
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '11.5pt',
                          lineHeight: 1.45,
                          color: '#0056b3'
                        }}
                      >
                        👉 <span className="text-[#0056b3] group-hover:text-blue-900 group-hover:underline">{isHi ? (rp.titleHi || rp.title) : rp.title}</span>
                      </h3>
                      <p className="text-[12px] text-blue-600/80 mt-1 pl-4 font-medium flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-blue-500"></span>
                        <span>{rp.updatedAt || rp.importantDates?.notificationDate || 'October 22, 2026'}</span>
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Widget 3: Official Social Channels */}
            <div className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 shadow-2xs text-center space-y-3">
              <h2 
                className="headlight font-bold text-slate-900"
                style={{ fontSize: '12pt' }}
              >
                Join Social Channels
              </h2>
              <p className="text-xs text-slate-600">
                प्रतिदिन सभी सरकारी भर्ती, एडमिट कार्ड एवं रिजल्ट की सबसे तेज अपडेट सीधे पाएं।
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>WhatsApp चैनल जॉइन करें</span>
                </a>
                <a
                  href="https://telegram.me/rajasthanvacancy_in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>Telegram चैनल जॉइन करें</span>
                </a>
              </div>
            </div>

            {/* In-sidebar Ad unit */}
            <AdSection 
              client="ca-pub-8302542447035711"
              slot="3785509362"
              format="rectangle"
              label={isHi ? 'विज्ञापन' : 'Advertisement'}
            />
          </aside>
        </div>
      </div>

      {/* Modal 1: Add New Section to Post */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-sky-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">नया सेक्शन जोड़ें (Add Custom Section)</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddSectionOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Quick suggestions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">सुझाए गए सेक्शन शीर्षक:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'परीक्षा पैटर्न व सिलेबस',
                    'कट ऑफ मार्क्स एवं न्यूनतम अंक',
                    'दस्तावेज सत्यापन प्रक्रिया',
                    'शारीरिक दक्षता परीक्षा (PET/PST)',
                    'विशेष दिशा-निर्देश एवं नियम'
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewSectionTitle(sug)}
                      className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 font-medium transition cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">सेक्शन का नाम (Section Title) *</label>
                <input
                  type="text"
                  required
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="उदा. परीक्षा पैटर्न एवं विस्तृत सिलेबस"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">फॉर्मेट प्रकार (Display Style)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSectionType('paragraph')}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      newSectionType === 'paragraph' ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    पैराग्राफ
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSectionType('bullets')}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      newSectionType === 'bullets' ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    बिंदुवार सूची
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSectionType('alert_box')}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      newSectionType === 'alert_box' ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    हाईलाइट बॉक्स
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">सेक्शन सामग्री (Content) *</label>
                <textarea
                  rows={5}
                  required
                  value={newSectionContent}
                  onChange={(e) => setNewSectionContent(e.target.value)}
                  placeholder={
                    newSectionType === 'bullets' 
                      ? "प्रत्येक लाइन एक बिंदु के रूप में दिखेगी:\n- भाग 1: सामान्य ज्ञान (50 अंक)\n- भाग 2: राजस्थान का इतिहास एवं भूगोल (50 अंक)\n- भाग 3: गणित एवं रीजनिंग (50 अंक)" 
                      : "सेक्शन का विस्तृत विवरण यहाँ लिखें..."
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-sky-600 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  disabled={!newSectionTitle.trim()}
                  onClick={handleAddNewSection}
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>सेक्शन जोड़ें व सेव करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Custom Section */}
      {editingCustomSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">कस्टम सेक्शन संपादित करें (Edit Section)</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingCustomSection(null)}
                className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">सेक्शन का नाम (Section Title) *</label>
                <input
                  type="text"
                  required
                  value={editingCustomSection.titleHi || editingCustomSection.title}
                  onChange={(e) => setEditingCustomSection({
                    ...editingCustomSection,
                    title: e.target.value,
                    titleHi: e.target.value
                  })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">फॉर्मेट प्रकार</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCustomSection({ ...editingCustomSection, sectionType: 'paragraph' })}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      editingCustomSection.sectionType === 'paragraph' ? 'bg-amber-50 border-amber-600 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    पैराग्राफ
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCustomSection({ ...editingCustomSection, sectionType: 'bullets' })}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      editingCustomSection.sectionType === 'bullets' ? 'bg-amber-50 border-amber-600 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    बिंदुवार सूची
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCustomSection({ ...editingCustomSection, sectionType: 'alert_box' })}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      editingCustomSection.sectionType === 'alert_box' ? 'bg-amber-50 border-amber-600 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    हाईलाइट बॉक्स
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">सामग्री (Content) *</label>
                <textarea
                  rows={6}
                  required
                  value={editingCustomSection.contentHi || editingCustomSection.content}
                  onChange={(e) => setEditingCustomSection({
                    ...editingCustomSection,
                    content: e.target.value,
                    contentHi: e.target.value
                  })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCustomSection(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomSectionEdit}
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>परिवर्तन सेव करें (Update Post)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-300 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-rose-700 text-white">
              <div className="flex items-center gap-2 font-black text-sm">
                <FileText className="w-4 h-4" />
                <span>
                  {pdfUploadTargetIndex !== null ? 'मौजूदा लिंक के लिए PDF अपलोड करें' : 'नया PDF डॉक्यूमेंट जोड़ें'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="text-white hover:bg-rose-800 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 space-y-1">
                <p className="font-bold">📄 PDF फाइल अपलोड निर्देश:</p>
                <p>कंप्यूटर या मोबाइल से कोई भी आधिकारिक PDF (नोटिफिकेशन, सिलेबस, रिजल्ट, फॉर्म) चुनें। यह तुरंत लिंक के साथ अटैच होकर डाउनलोड करने योग्य बन जाएगी।</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  PDF फ़ाइल चुनें (.pdf)
                </label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfFileChange}
                  className="block w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-700 cursor-pointer border border-slate-300 rounded p-1 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-300 cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Alert Feedback Notification */}
      {alertFeedback && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center gap-2 border border-emerald-600 animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{alertFeedback}</span>
          <button
            type="button"
            onClick={() => setAlertFeedback('')}
            className="ml-2 hover:bg-emerald-700 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
