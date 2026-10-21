import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Share2, 
  Bookmark, 
  DollarSign, 
  Download, 
  Clock, 
  ShieldCheck, 
  Send,
  MessageCircle,
  FileCheck,
  HelpCircle,
  ListOrdered,
  Award,
  BookOpen,
  Check,
  MessageSquare,
  Edit3,
  Lock,
  Info,
  User,
  Ticket,
  PenTool,
  CheckSquare,
  Sparkles,
  Briefcase,
  Bell,
  ChevronRight,
  ChevronLeft,
  Folder,
  Flame
} from 'lucide-react';
import { VacancyItem, LanguageMode } from '../types';
import { generateHindiShareText } from '../utils/shareUtils';
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
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  isAlertSet?: boolean;
  onToggleAlertMe?: (id: string) => void;
}

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
  isAdmin = false,
  onOpenAdminLogin,
  isAlertSet = false,
  onToggleAlertMe,
}) => {
  const isHi = lang === 'hi';
  const isScheme = vacancy.category === 'scheme' || vacancy.organization === 'Sarkari Yojana';
  const jobTitleName = vacancy.shortTitleHi || vacancy.titleHi || vacancy.title;
  const shortJobName = vacancy.shortTitleHi || vacancy.shortTitle || (isHi && vacancy.titleHi ? vacancy.titleHi.split(':')[0] : vacancy.title.split(':')[0]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isHandwritingView, setIsHandwritingView] = useState(false);

  // State for Any Doubt / Q&A Section
  const [doubtName, setDoubtName] = useState('');
  const [doubtQuery, setDoubtQuery] = useState('');
  const [doubtSubmitted, setDoubtSubmitted] = useState(false);
  const [userDoubts, setUserDoubts] = useState<
    Array<{ id: string; name: string; date: string; question: string; answer?: string }>
  >([
    {
      id: '1',
      name: 'राहुल शर्मा (चित्तौड़गढ़)',
      date: '18 Oct 2026',
      question: 'क्या टीजीटी कंप्यूटर साइंस पद के लिए सीटीईटी होना जरूरी है?',
      answer: 'नहीं, सैनिक स्कूल चित्तौड़गढ़ TGT Computer Science पद के लिए CTET/REET अनिवार्य नहीं है। ग्रेजुएशन एवं B.Ed/BCA/B.Tech योग्यता होनी चाहिए।'
    },
    {
      id: '2',
      name: 'विकास मीणा (जयपुर)',
      date: '17 Oct 2026',
      question: 'ऑफलाइन आवेदन फॉर्म किस पते पर जमा कराना होगा?',
      answer: 'फॉर्म भरकर सभी आवश्यक शैक्षणिक दस्तावेजों के साथ "प्राचार्य, सैनिक स्कूल चित्तौड़गढ़ (राजस्थान) - 312001" के पते पर पंजीकृत या स्पीड पोस्ट द्वारा 07 नवंबर 2026 तक भेजें।'
    }
  ]);

  const handleDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuery.trim()) return;
    const newDoubt = {
      id: Date.now().toString(),
      name: doubtName.trim() || (isHi ? 'अभ्यर्थी' : 'Candidate'),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      question: doubtQuery.trim(),
      answer: isHi
        ? 'आपकी शंका/प्रश्न सफलतापूर्वक दर्ज कर लिया गया है। हमारी टीम जल्द ही उत्तर प्रदान करेगी।'
        : 'Your query/doubt has been recorded. Our team will update the response shortly.'
    };
    setUserDoubts([newDoubt, ...userDoubts]);
    setDoubtQuery('');
    setDoubtSubmitted(true);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Dynamic SEO Meta Tags & Schema.org JSON-LD
    const originalTitle = document.title;
    const vacancyTitle = isHi ? (vacancy.titleHi || vacancy.title) : vacancy.title;
    const vacancyDesc = isHi 
      ? `${vacancyTitle} - कुल पद: ${vacancy.totalPosts || 'N/A'}. अंतिम तिथि: ${vacancy.importantDates.applyLastDate}. राजस्थान सरकारी भर्ती एवं ऑनलाइन आवेदन की पूरी जानकारी यहाँ देखें।`
      : `${vacancyTitle} - Total Posts: ${vacancy.totalPosts || 'N/A'}. Last Date to Apply: ${vacancy.importantDates.applyLastDate}. View complete Rajasthan govt recruitment details.`;

    document.title = `${vacancyTitle} | RAJASTHAN VACCANCY/JOBS`;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', vacancyDesc);

    // OpenGraph Meta Tags
    const ogTags = [
      { property: 'og:title', content: `${vacancyTitle} | RAJASTHAN VACCANCY/JOBS` },
      { property: 'og:description', content: vacancyDesc },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: window.location.href },
    ];

    const createdMetaEls: Element[] = [];
    ogTags.forEach((tag) => {
      let el = document.querySelector(`meta[property="${tag.property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', tag.property);
        document.head.appendChild(el);
        createdMetaEls.push(el);
      }
      el.setAttribute('content', tag.content);
    });

    // Schema.org JobPosting Structured Data (JSON-LD)
    const schemaScriptId = 'job-posting-schema-ld';
    let schemaScript = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaScriptId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const jobPostingSchema = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": vacancyTitle,
      "description": vacancyDesc,
      "datePosted": vacancy.importantDates.notificationDate || "2026-10-01",
      "validThrough": vacancy.importantDates.applyLastDate || "2026-12-31",
      "employmentType": "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": vacancy.organization || "Rajasthan Government Recruitment Board",
        "sameAs": "https://rajasthanvacancy.in"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Jaipur",
          "addressRegion": "Rajasthan",
          "addressCountry": "IN"
        }
      },
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": {
          "@type": "QuantitativeValue",
          "value": vacancy.applicationFee?.genObc ? `₹${vacancy.applicationFee.genObc}` : "As per govt rules",
          "unitText": "MONTH"
        }
      }
    };

    schemaScript.textContent = JSON.stringify(jobPostingSchema);

    return () => {
      document.title = originalTitle;
      createdMetaEls.forEach(el => el.remove());
      const s = document.getElementById(schemaScriptId);
      if (s) s.remove();
    };
  }, [vacancy.id, isHi]);

  const handleShare = () => {
    const titleHi = vacancy.titleHi || vacancy.title;
    const currentUrl = `${window.location.origin}${window.location.pathname}?vacancy=${vacancy.id}`;
    const shareText = generateHindiShareText(vacancy, currentUrl, true);

    if (navigator.share) {
      navigator.share({
        title: titleHi,
        text: shareText,
        url: currentUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const currentUrl = `${window.location.origin}${window.location.pathname}?vacancy=${vacancy.id}`;
    // As per user request: "Without link"
    const shareText = generateHindiShareText(vacancy, currentUrl, false);
    const message = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  // Required Documents list matching exact screenshot format
  const documentsList = isHi ? (vacancy.requiredDocumentsHi || [
    'जन्म प्रमाणपत्र और 10वीं की अंकतालिका।',
    'आधार कार्ड।',
    'पद के अनुसार शैक्षणिक एवं शिक्षण प्रशिक्षण प्रमाणपत्र।',
    'CTET प्रमाणपत्र, जहां लागू हो।',
    'अनुभव प्रमाणपत्र।',
    'SC/ST/OBC/EWS अभ्यर्थियों का जाति प्रमाणपत्र।',
    'भूतपूर्व सैनिक होने पर डिस्चार्ज बुक।',
    'विवाह प्रमाणपत्र, यदि लागू हो।',
    'आवेदन में उल्लेखित अन्य कोर्स, खेल, सह-पाठ्यक्रम गतिविधियों, सर्विस ट्रेनिंग और NCC के प्रमाणपत्र।'
  ]) : (vacancy.requiredDocuments || [
    'Birth certificate and 10th marksheet.',
    'Aadhaar Card.',
    'Educational and teaching training certificates according to post.',
    'CTET Certificate, where applicable.',
    'Experience Certificate.',
    'Caste Certificate for SC/ST/OBC/EWS candidates.',
    'Discharge book for Ex-Servicemen.',
    'Marriage Certificate, if applicable.',
    'Certificates of other courses, sports, co-curricular activities, service training, and NCC mentioned in application.'
  ]);

  // How to apply steps
  const howToApplySteps = isHi ? (vacancy.howToApplyHi || [
    'चरण 1: सबसे पहले राजस्थान सिंगल साइन ऑन (SSO) के आधिकारिक पोर्टल sso.rajasthan.gov.in पर जाएं।',
    'चरण 2: अपनी SSO ID और पासवर्ड दर्ज करके लॉगिन करें (यदि SSO ID नहीं है तो Jan Aadhaar से Registration करें)।',
    'चरण 3: Citizen Apps (G2C) सूची में से "Recruitment Portal" (भर्ती पोर्टल) पर क्लिक करें।',
    'चरण 4: Ongoing Recruitment सेक्शन में इस भर्ती के सामने दिए गए "Apply Now" लिंक पर क्लिक करें।',
    'चरण 5: One Time Registration (OTR) से अपनी व्यक्तिगत जानकारी, श्रेणी एवं पते का सत्यापन करें।',
    'चरण 6: शैक्षणिक योग्यता विवरण भरें तथा निर्धारित आकार में फोटो, हस्ताक्षर व आवश्यक दस्तावेज अपलोड करें।',
    'चरण 7: भरे गए संपूर्ण आवेदन पत्र की भली-भांति जांच (Preview) करें और फाइनल सबमिट कर रसीद का प्रिंटआउट सुरक्षित रखें।'
  ]) : (vacancy.howToApply || [
    'Step 1: Visit the official Rajasthan SSO portal (sso.rajasthan.gov.in).',
    'Step 2: Log in with your SSO ID and Password (or create one using Jan Aadhaar).',
    'Step 3: From Citizen Apps (G2C), click on "Recruitment Portal".',
    'Step 4: Under the Ongoing Recruitment section, locate this vacancy and click "Apply Now".',
    'Step 5: Verify your personal, category, and address details fetched from One Time Registration (OTR).',
    'Step 6: Fill educational details and upload your photograph, signature, and required certificates.',
    'Step 7: Preview the complete application, submit the form, and download/print the acknowledgment receipt.'
  ]);

  // FAQs matching exact screenshot format
  const faqItems = vacancy.faqs || [
    {
      q: `How many posts are there in ${vacancy.title}?`,
      qHi: `${vacancy.shortTitleHi || vacancy.titleHi || vacancy.title} में कितने पद हैं?`,
      a: `There are a total of ${vacancy.totalPosts} posts including TGT Math, Science, English, Computer Science, and Mess Manager.`,
      aHi: `कुल ${vacancy.totalPosts} पद हैं। इनमें TGT गणित, विज्ञान, अंग्रेजी और कंप्यूटर साइंस के एक-एक पद तथा मेस मैनेजर का एक पद शामिल है।`
    },
    {
      q: `What is the last date to apply?`,
      qHi: `आवेदन की अंतिम तिथि क्या है?`,
      a: `The complete application form along with required documents must reach the school by ${vacancy.importantDates.applyLastDate}.`,
      aHi: `पूरा आवेदन फॉर्म जरूरी दस्तावेजों सहित ${vacancy.importantDates.applyLastDate} तक विद्यालय में प्राप्त हो जाना चाहिए।`
    },
    {
      q: `Will the application be submitted online?`,
      qHi: `क्या आवेदन ऑनलाइन करना होगा?`,
      a: `The application is offline. Fill the prescribed form, attach fee demand draft and documents, and send it to the school address.`,
      aHi: `आवेदन ऑफलाइन है। निर्धारित फॉर्म भरकर शुल्क तथा अन्य दस्तावेजों के साथ डिमांड ड्राफ्ट के साथ विद्यालय के पते पर भेजना होगा।`
    },
    {
      q: `Can 10th pass candidates apply?`,
      qHi: `क्या 10वीं पास अभ्यर्थी आवेदन कर सकते हैं?`,
      a: `For the Mess Manager post, 10th pass with at least 5 years experience running catering independently and knowledge of mess accounts is required.`,
      aHi: `मेस मैनेजर पद के लिए 10वीं या समकक्ष के साथ कैटरिंग व्यवस्था स्वतंत्र रूप से चलाने का कम से कम पांच वर्ष का अनुभव और मेस अकाउंट्स का ज्ञान आवश्यक है।`
    },
    {
      q: `Is CTET mandatory for TGT Computer Science?`,
      qHi: `क्या TGT कंप्यूटर साइंस के लिए CTET जरूरी है?`,
      a: `No, passing CTET or REET is not mandatory for the TGT Computer Science post.`,
      aHi: `नहीं, TGT कंप्यूटर साइंस पद के लिए CTET / REET उत्तीर्ण होना अनिवार्य नहीं है।`
    }
  ];

  // Suggest 3 related vacancies based on current job's category, organization, and tags
  const relatedVacancies = React.useMemo(() => {
    const candidates = allVacancies.filter(v => v.id !== vacancy.id);
    const scored = candidates.map(item => {
      let score = 0;
      // 1. Same organization (+4)
      if (item.organization && item.organization === vacancy.organization) {
        score += 4;
      }
      // 2. Same category (+3)
      if (item.category && item.category === vacancy.category) {
        score += 3;
      }
      // 3. Shared tags (+2 each)
      if (item.tags && vacancy.tags) {
        const currentTags = new Set(vacancy.tags.map(t => t.toLowerCase()));
        item.tags.forEach(t => {
          if (currentTags.has(t.toLowerCase())) {
            score += 2;
          }
        });
      }
      // 4. Shared qualification (+1)
      if (item.qualification && vacancy.qualification) {
        const currentQuals = new Set(vacancy.qualification);
        item.qualification.forEach(q => {
          if (currentQuals.has(q)) {
            score += 1;
          }
        });
      }
      return { item, score };
    });

    // Sort by relevance score first, then newest date
    scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const dateA = a.item.createdAt || a.item.importantDates?.applyStartDate || '';
      const dateB = b.item.createdAt || b.item.importantDates?.applyStartDate || '';
      return dateB.localeCompare(dateA);
    });

    return scored.slice(0, 3).map(s => s.item);
  }, [allVacancies, vacancy]);

  // Previous and Next Post Navigation (for block directly below Important Dates)
  const { prevPost, nextPost } = React.useMemo(() => {
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

  // Recent Posts list for rajasthanvacancy.com screenshot style
  const recentPostsList = React.useMemo(() => {
    if (!allVacancies || allVacancies.length === 0) return [];
    return allVacancies.filter(v => v.id !== vacancy.id).slice(0, 8);
  }, [allVacancies, vacancy]);

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900 bg-amber-100/70 px-1 py-0.5 rounded border border-amber-200/50">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <article className="w-full max-w-4xl mx-auto space-y-6 text-slate-700 text-base post-content leading-relaxed">
      {/* Main Post Title Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        {/* Admin Bar (Only visible when Admin Mode is active) */}
        {isAdmin && (
          <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>{isHi ? 'एडमिन मोड' : 'Admin Mode'}</span>
              </span>
            </div>

            {/* Edit / Update & Delete Buttons - Shown ONLY for Admin */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onEditVacancy && onEditVacancy(vacancy)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                title="Edit & Update Post Details"
              >
                <Edit3 className="w-4 h-4 text-white" />
                <span>{isHi ? '✏️ पोस्ट संशोधित / अपडेट' : '✏️ Edit & Update'}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteVacancy && onDeleteVacancy(vacancy.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                title="Delete Post"
              >
                <span>{isHi ? '🗑️ डिलीट पोस्ट' : '🗑️ Delete Post'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Post Heading - Clean, Uniform Standard Size matching rajasthanvacancy.com */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-snug tracking-tight">
          {isHi ? vacancy.titleHi : vacancy.title}
        </h1>

        {/* Post Meta - Clean WordPress Blog Format matching screenshot */}
        <div className="text-slate-500 flex flex-col gap-1 pb-3 border-b border-slate-200 text-sm font-normal">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>{vacancy.updatedAt || vacancy.importantDates?.notificationDate || 'October 20, 2026'} by</span>
              <span className="text-blue-600 font-medium hover:underline cursor-pointer">RajasthanVacancy</span>
            </div>
            {vacancy.isHighDemand || (vacancy.clicksCount && vacancy.clicksCount >= 3000) || (vacancy.savesCount && vacancy.savesCount >= 600) ? (
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white flex items-center gap-1 shadow-2xs animate-pulse">
                <span>⚡</span>
                <span>{isHi ? 'हाई डिमांड भर्ती' : 'High Demand Notification'}</span>
              </span>
            ) : vacancy.isTrending || (vacancy.clicksCount && vacancy.clicksCount >= 1400) || (vacancy.savesCount && vacancy.savesCount >= 250) || isSaved ? (
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1 shadow-2xs">
                <span>🔥</span>
                <span>{isHi ? 'ट्रेंडिंग सूचना' : 'Trending Notification'}</span>
              </span>
            ) : null}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
            <span>📍 {vacancy.jobLocation}</span>
            <span>•</span>
            <span>🏢 {isHi && vacancy.departmentHi ? vacancy.departmentHi : vacancy.department}</span>
          </div>
        </div>

        {/* Quick Overview Strip - Clean Grid */}
        <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-blue-50/50 border border-blue-200/70 rounded-xl p-3 sm:p-3.5 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-xs sm:text-sm">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block font-medium">{isHi ? 'पद का नाम' : 'Post Name'}</span>
              <span className="font-bold text-slate-900 block truncate" title={vacancy.postName || vacancy.title}>
                {vacancy.postNameHi || vacancy.postName || vacancy.shortTitle || vacancy.title}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block font-medium">{isHi ? 'कुल पद' : 'Total Posts'}</span>
              <span className="font-black text-blue-700 text-sm sm:text-base block">
                {vacancy.totalPosts ? `${vacancy.totalPosts} ${isHi ? 'पद' : 'Posts'}` : 'विभिन्न पद'}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block font-medium">{isHi ? 'आवेदन शुरू' : 'Apply Start'}</span>
              <span className="font-bold text-slate-900 block">
                {vacancy.importantDates?.applyStartDate || vacancy.importantDates?.notificationDate || '25 अक्टूबर 2026'}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block font-medium">{isHi ? 'अंतिम तिथि' : 'Last Date'}</span>
              <span className="font-bold text-red-600 block">
                {vacancy.importantDates?.applyLastDate || '15 नवंबर 2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Official Notification Image Excerpt Card - Urgency with Vivid Red Title & English Snippet */}
        {vacancy.officialNotificationExcerpt && (
          <div className="my-2 p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs text-center max-w-xl mx-auto space-y-2.5 font-sans">
            <div className="font-black text-sm sm:text-base tracking-widest text-slate-900 uppercase">
              {vacancy.officialNotificationExcerpt.authority || 'SUPREME COURT OF INDIA'}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span className="font-mono">{vacancy.officialNotificationExcerpt.refNo || 'No.F.6/11/CM(S)/2026-SC (RC)'}</span>
              <span>{vacancy.officialNotificationExcerpt.date || 'Date: October 15, 2026.'}</span>
            </div>
            <div className="py-1">
              <div className="text-red-600 font-black text-xl sm:text-2xl tracking-tight">
                {vacancy.officialNotificationExcerpt.titleRed || 'Supreme Court'}
              </div>
              <div className="text-red-600 font-extrabold text-lg sm:text-xl">
                {vacancy.officialNotificationExcerpt.titleSubtitle || 'Court Master Recruitment 2026'}
              </div>
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 text-justify bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              {vacancy.officialNotificationExcerpt.body}
            </p>
          </div>
        )}

        {/* Overview Introduction Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-800 border-b border-slate-200 pb-2.5">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-800">
              <span>📝</span>
              <span>{isHi ? 'भर्ती का संक्षिप्त विवरण (Recruitment Summary)' : 'Recruitment Summary'}</span>
            </h2>
            <div className="flex items-center gap-1.5 flex-wrap">
              {vacancy.isHighDemand || (vacancy.clicksCount && vacancy.clicksCount >= 3000) || (vacancy.savesCount && vacancy.savesCount >= 600) ? (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white flex items-center gap-1 shadow-2xs animate-pulse">
                  <span>⚡</span>
                  <span>{isHi ? 'हाई डिमांड' : 'High Demand'}</span>
                </span>
              ) : vacancy.isTrending || (vacancy.clicksCount && vacancy.clicksCount >= 1400) || (vacancy.savesCount && vacancy.savesCount >= 250) || isSaved ? (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1 shadow-2xs">
                  <span>🔥</span>
                  <span>{isHi ? 'ट्रेंडिंग' : 'Trending'}</span>
                </span>
              ) : null}
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2.5 py-1 rounded">
                {vacancy.category === 'scheme' ? 'सरकारी योजना' : 'सरकारी भर्ती'}
              </span>
            </div>
          </div>

          <p className="text-[17px] text-slate-700 leading-[1.8] font-normal whitespace-pre-line">
            {renderFormattedText(
              isScheme
                ? isHi
                  ? `${vacancy.titleHi}: राजस्थान सरकार के ${vacancy.departmentHi || vacancy.department} द्वारा संचालित एक प्रमुख कल्याणकारी योजना है। इसके तहत राजकीय महाविद्यालयों एवं विश्वविद्यालयों में अध्ययनरत आरक्षित वर्गों (SC, ST, OBC, MBC एवं EWS) के नियमित छात्रों को किराए के कमरों/PG में रहने एवं भोजन हेतु ₹2,000/- प्रतिमाह (वर्ष में अधिकतम ₹20,000/-) की वित्तीय सहायता DBT के माध्यम से सीधे बैंक खाते में प्रदान की जाती है।`
                  : `${vacancy.title}: A welfare scheme by ${vacancy.department} providing ₹2,000/month (up to ₹20,000/year) via DBT to eligible SC, ST, OBC, MBC, and EWS college students staying in rented rooms or PG for higher education.`
                : isHi 
                ? (vacancy.briefSummaryHi || vacancy.briefSummary || `नमस्ते साथियों! ${vacancy.titleHi || vacancy.title} के अंतर्गत ${vacancy.organization} (${vacancy.departmentHi || vacancy.department}) द्वारा कुल ${vacancy.totalPosts || 'अनेक'} रिक्त पदों पर ऑनलाइन आवेदन आमंत्रित किए गए हैं। हमने इस भर्ती के सभी नियमों, पात्रता, परीक्षा पैटर्न और आवेदन प्रक्रिया को सरल भाषा में तैयार किया है ताकि फॉर्म भरते समय आपसे कोई गलती न हो। अंतिम तिथि ${vacancy.importantDates.applyLastDate} का इंतजार किए बिना समय पर अपना फॉर्म जरूर भर लें।`)
                : (vacancy.briefSummary || `Hello Candidates! ${vacancy.title} has been officially announced by ${vacancy.organization} (${vacancy.department}) for a total of ${vacancy.totalPosts || 'various'} vacancies. Our mentor team has compiled all critical details, eligibility rules, and application steps in simple terms so you can apply without confusion before the last date ${vacancy.importantDates.applyLastDate}.`)
            )}
          </p>



          {onOpenAdminLogin && !isAdmin && (
            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-slate-500 hover:text-slate-700 transition cursor-pointer text-xs opacity-60 hover:opacity-100 flex items-center gap-1 font-mono"
                title="Admin Portal Access"
              >
                <span>🔐 Admin Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Human-Written Post Article (विस्तृत विवरण) */}
      {(vacancy.descriptionHi || vacancy.description) && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-slate-800 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                {isHi ? `${vacancy.shortTitleHi || vacancy.titleHi || vacancy.title} का विस्तृत विवरण` : `${vacancy.title} Detailed Information`}
              </h2>
            </div>
          </div>
          <div className="text-base text-slate-700 leading-relaxed whitespace-pre-line font-normal space-y-3">
            {isHi ? (vacancy.descriptionHi || vacancy.description) : vacancy.description}
          </div>
        </div>
      )}

      {/* Dedicated Yojana General Information Section (योजना क्या है? - सामान्य जानकारी) */}
      {isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-slate-800 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
              {vacancy.yojanaGeneralInfo?.headingHi || `${vacancy.shortTitleHi || vacancy.postNameHi || 'योजना'} क्या है? (सामान्य जानकारी)`}
            </h2>
          </div>

          <div className="space-y-4 text-base text-slate-700 leading-relaxed">
            <p className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 font-medium">
              {vacancy.yojanaGeneralInfo?.descriptionHi || vacancy.descriptionHi}
            </p>

            {vacancy.yojanaGeneralInfo?.objectiveHi && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block text-base">🎯 योजना का मुख्य उद्देश्य:</span>
                <p className="text-slate-700">{vacancy.yojanaGeneralInfo.objectiveHi}</p>
              </div>
            )}

            {/* Overview Table for Yojana inserted directly after 'योजना का मुख्य उद्देश्य' */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden my-3">
              <div className="bg-white border-b-2 border-slate-300 text-slate-800 px-5 py-3.5 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-slate-800">
                  <Award className="w-5 h-5 text-slate-800 shrink-0" />
                  <span>
                    {`${vacancy.shortTitleHi || vacancy.postNameHi || 'योजना का नाम'} Overview`}
                  </span>
                </h2>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded font-mono font-bold">
                  SARKARI YOJANA
                </span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 text-sm sm:text-base">
                    <th className="py-3 px-4 font-bold w-2/5 border-r border-slate-200 text-slate-800">
                      विवरण
                    </th>
                    <th className="py-3 px-4 font-bold text-slate-800">
                      जानकारी
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm sm:text-base">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      योजना का नाम
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-bold">
                      {vacancy.yojanaOverview?.yojanaName || vacancy.postNameHi || vacancy.titleHi}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      राज्य
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {vacancy.yojanaOverview?.state || 'राजस्थान'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      संबंधित विभाग
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {vacancy.yojanaOverview?.department || vacancy.departmentHi || vacancy.department}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      शैक्षणिक सत्र
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {vacancy.yojanaOverview?.academicSession || '2025-26 / 2026-27'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      लाभार्थी
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {vacancy.yojanaOverview?.beneficiaries || vacancy.qualificationDetailsHi}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      मासिक सहायता
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {vacancy.yojanaOverview?.monthlyAssistance || vacancy.salaryHi || vacancy.salary}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      एक वर्ष में सहायता अवधि
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {vacancy.yojanaOverview?.durationPerYear || 'अधिकतम 10 माह'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      वार्षिक अधिकतम सहायता
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {vacancy.yojanaOverview?.maxAnnualAssistance || '₹20,000/- प्रति वर्ष'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      निर्धारित लाभार्थी संख्या
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-bold">
                      {vacancy.yojanaOverview?.totalBeneficiariesCount || vacancy.totalPosts}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      आवेदन शुरू
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {vacancy.yojanaOverview?.applyStartDate || vacancy.importantDates.notificationDate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      आवेदन की अंतिम तिथि
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {vacancy.yojanaOverview?.applyLastDate || vacancy.importantDates.applyLastDate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      आवेदन माध्यम
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">
                      {vacancy.yojanaOverview?.applyMode || 'ऑनलाइन (SSO Portal SJMS App)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      भुगतान का माध्यम
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {vacancy.yojanaOverview?.paymentMode || 'डायरेक्ट बेनिफिट ट्रांसफर (DBT)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">
                      आधिकारिक वेबसाइट
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      <a 
                        href={vacancy.officialLinks.officialWebsiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{vacancy.yojanaOverview?.officialWebsite || vacancy.officialLinks.officialWebsiteUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {vacancy.yojanaGeneralInfo?.benefitsSummaryHi && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block text-base">💰 वित्तीय सहायता राशि:</span>
                <p className="text-slate-700 font-medium">{vacancy.yojanaGeneralInfo.benefitsSummaryHi}</p>
              </div>
            )}

            {vacancy.yojanaGeneralInfo?.keyPointsHi && vacancy.yojanaGeneralInfo.keyPointsHi.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">📌 योजना की मुख्य बातें एवं बिंदु:</h3>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700 pl-2 text-base">
                  {vacancy.yojanaGeneralInfo.keyPointsHi.map((pt, index) => (
                    <li key={index} className="leading-relaxed">
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dedicated Yojana Eligibility Criteria Section (योजना 2026 के लिए पात्रता) */}
      {isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-800 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
              {vacancy.yojanaEligibility?.headingHi || `${vacancy.shortTitleHi || vacancy.postNameHi || 'योजना'} 2026 के लिए पात्रता (Eligibility Criteria)`}
            </h2>
          </div>

          <div className="space-y-4 text-base text-slate-700 leading-relaxed">
            {/* Criteria List */}
            {vacancy.yojanaEligibility?.criteriaHi && vacancy.yojanaEligibility.criteriaHi.length > 0 ? (
              <div className="space-y-2.5">
                <h3 className="font-bold text-slate-800 text-base">📋 अनिवार्य पात्रता मानदंड:</h3>
                <ul className="space-y-2">
                  {vacancy.yojanaEligibility.criteriaHi.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-slate-800 shrink-0 mt-1" />
                      <span className="text-slate-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-slate-700">{vacancy.qualificationDetailsHi}</p>
            )}

            {/* Family Income Limits */}
            {vacancy.yojanaEligibility?.incomeLimitHi && vacancy.yojanaEligibility.incomeLimitHi.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 mt-3">
                <h3 className="font-bold text-slate-800 text-base">👨‍👩‍👧‍👦 पारिवारिक वार्षिक आय सीमा (Annual Family Income Limit):</h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 pl-1 font-medium">
                  {vacancy.yojanaEligibility.incomeLimitHi.map((inc, i) => (
                    <li key={i}>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 1: Recruitment Overview Table (For Jobs) */}
      {!isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-white border-b-2 border-slate-300 text-slate-800 px-5 py-3.5 flex items-center justify-between">
            <h2 className="text-xl sm:text-[22px] font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-slate-700 shrink-0" />
              <span>
                {isHi
                  ? 'भर्ती का संक्षिप्त विवरण (Recruitment Overview)'
                  : 'Recruitment Overview'}
              </span>
            </h2>
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded font-mono font-bold tracking-wide">
              RAJASTHAN VACANCY
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200 text-sm sm:text-base">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 w-2/5 sm:w-1/3 border-r border-slate-200">
                  {isHi ? 'भर्ती बोर्ड / विभाग का नाम' : 'Recruitment Organization'}
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">
                  {isHi && vacancy.departmentHi ? vacancy.departmentHi : vacancy.department} ({vacancy.organization})
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'पद का नाम (Post Name)' : 'Post Name'}
                </td>
                <td className="py-3 px-4 text-slate-800 font-bold">
                  {isHi ? vacancy.postNameHi : vacancy.postName}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'विज्ञापन संख्या (Advt No.)' : 'Advertisement Number'}
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                  {vacancy.advtNo}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'कुल रिक्त पद (Total Vacancies)' : 'Total Vacancies'}
                </td>
                <td className="py-3 px-4 font-extrabold text-slate-800">
                  {typeof vacancy.totalPosts === 'number' ? `${vacancy.totalPosts.toLocaleString()} पद` : vacancy.totalPosts}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'वेतनमान (Salary / Pay Scale)' : 'Salary / Pay Level'}
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">
                  {isHi && vacancy.salaryHi ? vacancy.salaryHi : vacancy.salary}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'नौकरी का स्थान (Job Location)' : 'Job Location'}
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">
                  {vacancy.jobLocation}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'आवेदन का प्रकार (Mode of Apply)' : 'Application Mode'}
                </td>
                <td className="py-3 px-4 text-slate-800 font-bold">
                  {isHi ? 'ऑनलाइन (Online Application)' : 'Online Application'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'आधिकारिक वेबसाइट (Official Website)' : 'Official Website'}
                </td>
                <td className="py-3 px-4 text-slate-800 font-bold">
                  <a 
                    href={vacancy.officialLinks.officialWebsiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline inline-flex items-center gap-1.5 text-slate-800 font-bold"
                  >
                    <span>{vacancy.officialLinks.officialWebsiteUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Section 2: Important Dates - Render ONLY for Jobs (NOT for Scheme/Yojana) */}
      {!isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-white border-b-2 border-slate-300 px-5 py-3">
            <h2 className="text-xl sm:text-[22px] font-bold flex items-center gap-2 text-slate-800">
              <Calendar className="w-5 h-5 text-slate-700" />
              <span>{isHi ? `${jobTitleName} महत्वपूर्ण तिथियां (Important Dates)` : `${vacancy.title} Important Dates`}</span>
            </h2>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200 text-sm sm:text-base">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 w-2/5 sm:w-1/3 border-r border-slate-200">
                  {isHi ? 'विज्ञप्ति जारी तिथि:' : 'Notification Date:'}
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">{vacancy.importantDates.notificationDate}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'ऑनलाइन आवेदन प्रारंभ तिथि:' : 'Online Apply Start:'}
                </td>
                <td className="py-3 px-4 font-extrabold text-slate-800">{vacancy.importantDates.applyStartDate}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'आवेदन करने की अंतिम तिथि:' : 'Apply Last Date:'}
                </td>
                <td className="py-3 px-4 font-extrabold text-slate-800">{vacancy.importantDates.applyLastDate}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'शुल्क भुगतान अंतिम तिथि:' : 'Fee Last Date:'}
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">{vacancy.importantDates.feeLastDate || vacancy.importantDates.applyLastDate}</td>
              </tr>
              {vacancy.importantDates.examDate && (
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                    {isHi ? 'परीक्षा तिथि:' : 'Exam Date:'}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{vacancy.importantDates.examDate}</td>
                </tr>
              )}
              {vacancy.importantDates.admitCardDate && (
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                    {isHi ? 'प्रवेश पत्र जारी तिथि:' : 'Admit Card Date:'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{vacancy.importantDates.admitCardDate}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TSP / Non-TSP Breakdown Box */}
      {!isScheme && vacancy.tspBreakdown && ((vacancy.tspBreakdown.nonTsp ?? 0) > 0 || (vacancy.tspBreakdown.tsp ?? 0) > 0) && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
          <h2 className="text-xl sm:text-[22px] font-bold text-slate-800 leading-tight">
            {isHi ? `${jobTitleName} टीएसपी एवं गैर-टीएसपी पद विवरण` : `${vacancy.title} TSP & Non-TSP Breakdown`}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xs font-semibold text-slate-600 uppercase block">
                {isHi ? 'गैर-टीएसपी (Non-TSP)' : 'Non-TSP Area'}
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-800 mt-1 block">
                {vacancy.tspBreakdown.nonTsp} {isHi ? 'पद' : 'Posts'}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xs font-semibold text-slate-600 uppercase block">
                {isHi ? 'टीएसपी क्षेत्र (TSP)' : 'TSP Area'}
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-800 mt-1 block">
                {vacancy.tspBreakdown.tsp} {isHi ? 'पद' : 'Posts'}
              </span>
            </div>
            {vacancy.tspBreakdown.sahariya !== undefined && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-xs font-semibold text-slate-600 uppercase block">
                  {isHi ? 'सहरिया (Sahariya)' : 'Sahariya Area'}
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-800 mt-1 block">
                  {vacancy.tspBreakdown.sahariya} {isHi ? 'पद' : 'Posts'}
                </span>
              </div>
            )}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xs font-semibold text-slate-600 uppercase block">
                {isHi ? 'कुल पद' : 'Total Posts'}
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800 mt-1 block">
                {(Number(vacancy.tspBreakdown.nonTsp) || 0) + (Number(vacancy.tspBreakdown.tsp) || 0) + (Number(vacancy.tspBreakdown.sahariya) || 0)} {isHi ? 'पद' : 'Posts'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Responsive AdSection inside Post */}
      <AdSection label={isHi ? 'विज्ञापन' : 'Advertisement'} />

      {/* Section 4: Post Breakdown Box - Render only if postBreakdown data exists */}
      {!isScheme && vacancy.postBreakdown && vacancy.postBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
            {isHi 
              ? `${jobTitleName} पदवार विवरण (Post Breakdown)` 
              : `Post-Wise Vacancy Details for ${vacancy.title}`}
          </h2>

          {/* Clean 3-Column Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-sm sm:text-base">
                  <th className="py-3 px-4 border-r border-slate-200 font-bold w-1/2">
                    {isHi ? 'पद का नाम' : 'Post Name'}
                  </th>
                  <th className="py-3 px-4 border-r border-slate-200 font-bold text-center w-1/4">
                    {isHi ? 'श्रेणी / विभाग' : 'Category / Department'}
                  </th>
                  <th className="py-3 px-4 font-bold text-right w-1/4">
                    {isHi ? 'पदों की संख्या' : 'No. of Posts'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm sm:text-base text-slate-700">
                {vacancy.postBreakdown.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-3 px-4 border-r border-slate-200 font-medium text-slate-800">
                      {isHi ? (item.postNameHi || item.postName) : item.postName}
                    </td>
                    <td className="py-3 px-4 border-r border-slate-200 text-center font-medium">
                      {isHi ? (item.categoryOrSubjectHi || item.categoryOrSubject || '-') : (item.categoryOrSubject || '-')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {item.postsCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 5: Educational Qualification & Eligibility */}
      {!isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 border-b border-slate-200 pb-3">
            {isHi ? `${jobTitleName} शैक्षणिक योग्यता (Educational Qualification)` : `${vacancy.title} Educational Qualification`}
          </h2>

          {/* General Qualification Overview */}
          <div className="text-base text-slate-700 leading-relaxed">
            <p className="font-medium text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {isHi ? (vacancy.qualificationDetailsHi || vacancy.qualificationDetails) : vacancy.qualificationDetails}
            </p>
          </div>

          {/* Post-Wise Qualification Table (Data hone par) or Official Notification Note (Data na hone par) */}
          {(() => {
            const postWiseQualifications = (vacancy.postBreakdown || []).filter(
              (item) => Boolean(item.qualificationHi || item.qualification)
            );
            const hasPostWiseData = postWiseQualifications.length > 0;

            if (hasPostWiseData) {
              return (
                <div className="space-y-3 pt-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-slate-700">🎓</span>
                    <span>
                      {isHi 
                        ? `${jobTitleName} पद अनुसार शैक्षणिक योग्यता` 
                        : 'Post-Wise Educational Qualification:'}
                    </span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border border-slate-200 border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-sm sm:text-base">
                          <th className="py-3 px-4 border-r border-slate-200 font-bold w-1/3">
                            {isHi ? 'पद का नाम (Post Name)' : 'Post Name'}
                          </th>
                          <th className="py-3 px-4 border-r border-slate-200 font-bold">
                            {isHi ? 'अनिवार्य शैक्षणिक योग्यता एवं पात्रता' : 'Required Qualification & Eligibility'}
                          </th>
                          <th className="py-3 px-4 font-bold text-right w-1/5 whitespace-nowrap">
                            {isHi ? 'पद संख्या' : 'No. of Posts'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm sm:text-base text-slate-700">
                        {postWiseQualifications.map((item, idx) => (
                          <tr key={idx} className="bg-white hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 border-r border-slate-200 font-bold text-slate-800 align-top">
                              {isHi ? (item.postNameHi || item.postName) : item.postName}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200 text-slate-800 leading-relaxed align-top">
                              {isHi ? (item.qualificationHi || item.qualification) : (item.qualification || item.qualificationHi)}
                            </td>
                            <td className="py-3 px-4 text-right font-extrabold text-slate-800 align-top whitespace-nowrap">
                              {item.postsCount || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            return (
              <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-2">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-slate-800 text-sm sm:text-base">
                      {isHi 
                        ? 'विस्तृत जानकारी के लिए आधिकारिक नोटिफिकेशन देखें' 
                        : 'For detailed qualification details, please refer to the official notification.'}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {isHi 
                        ? 'विभिन्न पदों के अनुसार शैक्षणिक योग्यता, अनुभव, आयु छूट व अन्य विशेष पात्रता नियमों की विस्तृत जानकारी के लिए विभाग द्वारा जारी आधिकारिक भर्ती विज्ञापन (Notification PDF) अवश्य पढ़ें।' 
                        : 'Please refer to the official notification PDF released by the department for detailed post-specific educational qualifications, experience, and eligibility relaxation rules.'}
                    </p>
                    {vacancy.officialLinks.notificationPdfUrl && (
                      <div className="pt-2">
                        <a
                          href={vacancy.officialLinks.notificationPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isHi ? 'ऑफिशियल नोटिफिकेशन (PDF) देखें / डाउनलोड करें' : 'View Official Notification (PDF)'}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {vacancy.qualification && vacancy.qualification.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200 text-sm">
              <span className="font-bold text-slate-800">{isHi ? 'पात्र स्तर / योग्यता:' : 'Eligible Levels:'}</span>
              {vacancy.qualification.map((q) => (
                <span key={q} className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded border border-slate-200 text-xs">
                  {q}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 6: Age Limit & Relaxation Rules */}
      {!isScheme && vacancy.ageLimit && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 border-b border-slate-200 pb-3">
            {isHi ? `${jobTitleName} आयु सीमा (Age Limit)` : `${vacancy.title} Age Limit Details`}
          </h2>

          <p className="text-base text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-200">
            {isHi 
              ? `न्यूनतम आयु: ${vacancy.ageLimit.min} वर्ष | अधिकतम आयु: ${vacancy.ageLimit.max} वर्ष (आयु की गणना ${vacancy.ageLimit.asOnDate || vacancy.importantDates.applyLastDate} को आधार मानकर की जाएगी)।`
              : `Minimum Age: ${vacancy.ageLimit.min} years | Maximum Age: ${vacancy.ageLimit.max} years (Calculated as on ${vacancy.ageLimit.asOnDate || vacancy.importantDates.applyLastDate}).`}
          </p>

          {(vacancy.ageLimit.relaxationNotesHi || vacancy.ageLimit.relaxationNotes) && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-slate-800 text-base">
              <p className="font-bold">
                {isHi ? 'आरक्षित श्रेणियों हेतु आयु सीमा में ऊपरी छूट (Age Relaxation Rules):' : 'Upper Age Relaxation Rules:'}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {isHi ? vacancy.ageLimit.relaxationNotesHi : vacancy.ageLimit.relaxationNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Section 6.5: Application Fee Details (आवेदन शुल्क) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
          <span>{isHi ? `${jobTitleName} आवेदन शुल्क (Application Fee)` : `${vacancy.title} Application Fee Details`}</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {isHi ? 'शुल्क व भुगतान विवरण' : 'Fee & Payment Mode'}
          </span>
        </h2>

        {isScheme ? (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-base font-semibold flex items-center gap-2">
            <span>✨</span>
            <span>{isHi ? 'इस सरकारी योजना के लिए कोई आवेदन शुल्क नहीं है। आवेदन पूर्णतः निःशुल्क (Free) है।' : 'No application fee required for this government scheme. Application is 100% Free.'}</span>
          </div>
        ) : (
          <>
            {/* Fee Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-200 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-sm sm:text-base">
                    <th className="py-3 px-4 border-r border-slate-200 w-1/2">
                      {isHi ? 'श्रेणी (Category)' : 'Category'}
                    </th>
                    <th className="py-3 px-4 text-center w-1/2">
                      {isHi ? 'आवेदन शुल्क (Fee Amount)' : 'Fee Amount'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm sm:text-base text-slate-700 font-medium">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 border-r border-slate-200 font-semibold text-slate-800">
                      {isHi ? 'सामान्य / ओबीसी (Gen / OBC / Other States)' : 'General / OBC / Other States'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {vacancy.applicationFee?.genObc !== undefined 
                        ? (vacancy.applicationFee.genObc === 0 ? (isHi ? 'निःशुल्क (Nil)' : 'Free (Nil)') : `₹${vacancy.applicationFee.genObc}/-`) 
                        : '₹600/-'}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 border-r border-slate-200 font-semibold text-slate-800">
                      {isHi ? 'ओबीसी (NCL) / ईडब्ल्यूएस (OBC-NCL / EWS)' : 'OBC (NCL) / EWS'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {vacancy.applicationFee?.ews !== undefined 
                        ? (vacancy.applicationFee.ews === 0 ? (isHi ? 'निःशुल्क (Nil)' : 'Free (Nil)') : `₹${vacancy.applicationFee.ews}/-`) 
                        : '₹400/-'}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 border-r border-slate-200 font-semibold text-slate-800">
                      {isHi ? 'एससी / एसटी / दिव्यांगजन (SC / ST / PwD)' : 'SC / ST / PwD'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {vacancy.applicationFee?.scSt !== undefined 
                        ? (vacancy.applicationFee.scSt === 0 ? (isHi ? 'निःशुल्क (Nil)' : 'Free (Nil)') : `₹${vacancy.applicationFee.scSt}/-`) 
                        : '₹400/-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Mode & Notes */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-slate-800 text-sm sm:text-base leading-relaxed">
              <p className="font-bold text-slate-800">
                {isHi ? '💳 भुगतान का प्रकार (Payment Mode):' : '💳 Mode of Payment:'}
              </p>
              <p className="text-slate-700">
                {isHi 
                  ? (vacancy.applicationFee?.paymentModeHi || 'आवेदन शुल्क का भुगतान ऑनलाइन माध्यम (डेबिट कार्ड, क्रेडिट कार्ड, नेट बैंकिंग, UPI) अथवा अधिकृत ई-मित्र (E-Mitra) कियोस्क के माध्यम से किया जा सकता है।') 
                  : (vacancy.applicationFee?.paymentMode || 'Application fee can be paid online via Debit Card, Credit Card, Net Banking, UPI or authorized E-Mitra kiosk.')}
              </p>

              {(vacancy.applicationFee?.otrNoteHi || vacancy.applicationFee?.otrNote) && (
                <div className="pt-2 border-t border-slate-200 text-slate-700">
                  <span className="font-bold text-slate-800">{isHi ? '📌 नोट: ' : '📌 Note: '}</span>
                  <span>{isHi ? vacancy.applicationFee.otrNoteHi : vacancy.applicationFee.otrNote}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Benefit / Salary Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
          {isHi 
            ? (isScheme 
                ? `${jobTitleName} योजना के लाभ एवं सहायता राशि` 
                : `${jobTitleName} वेतन व पे-स्केल (Salary Details)`) 
            : (isScheme 
                ? `${vacancy.shortTitle || 'PM Awas Yojana Urban 2.0'} Scheme Benefits` 
                : `Salary / Pay Scale Details for ${vacancy.title}`)}
        </h2>

        {/* Clean Salary / Benefits Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-sm sm:text-base">
                <th className="py-3 px-4 border-r border-slate-200 font-bold w-1/3">
                  {isHi ? (isScheme ? 'योजना का नाम' : 'पद') : 'Post / Scheme'}
                </th>
                <th className="py-3 px-4 border-r border-slate-200 font-bold text-center w-1/3">
                  {isHi ? (isScheme ? 'लाभ का प्रकार' : 'पे मैट्रिक्स लेवल') : 'Type'}
                </th>
                <th className="py-3 px-4 font-bold text-center w-1/3">
                  {isHi ? (isScheme ? 'योजना के लाभ / सहायता राशि' : 'वेतनमान') : 'Amount'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm sm:text-base text-slate-700">
              {(vacancy.salaryTable && vacancy.salaryTable.length > 0 
                ? vacancy.salaryTable 
                : isScheme 
                ? [
                    { postName: vacancy.shortTitle || 'PM Awas Yojana Urban 2.0', postNameHi: vacancy.shortTitleHi || 'पीएम आवास योजना शहरी 2.0', payLevel: 'Direct Grant', payLevelHi: 'नकद अनुदान (3 किस्तें)', salaryRange: 'Rs. 2,50,000 Assistance', salaryRangeHi: '₹2,50,000/- पक्का मकान अनुदान' },
                    { postName: 'Home Loan Subsidy', postNameHi: 'गृह ऋण ब्याज सब्सिडी', payLevel: 'Interest Subsidy', payLevelHi: 'ब्याज दर सब्सिडी', salaryRange: 'Up to Rs. 1,80,000', salaryRangeHi: '₹1,80,000/- तक ब्याज सब्सिडी' }
                  ]
                : [
                    { postName: 'TGT', postNameHi: 'TGT', payLevel: 'Level-7', payLevelHi: 'लेवल-7', salaryRange: '₹44,900 to ₹1,42,400', salaryRangeHi: '₹44,900 से ₹1,42,400' },
                    { postName: 'Mess Manager', postNameHi: 'मेस मैनेजर', payLevel: 'Level-5', payLevelHi: 'लेवल-5', salaryRange: '₹29,200 to ₹92,400', salaryRangeHi: '₹29,200 से ₹92,400' },
                  ]
              ).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 border-r border-slate-200 font-medium text-slate-800">
                    {isHi ? item.postNameHi : item.postName}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-200 text-center font-medium text-slate-800">
                    {isHi ? (item.payLevelHi || item.payLevel) : item.payLevel}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">
                    {isHi ? (item.salaryRangeHi || item.salaryRange) : item.salaryRange}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Salary explanatory notes */}
        <div className="space-y-3 text-slate-700 text-base leading-relaxed pt-2">
          {isScheme ? (
            <p>
              {isHi 
                ? 'योजना के अंतर्गत सहायता राशि पात्र छात्रों के आधार लिंक बैंक खातों में डीबीटी (Direct Benefit Transfer) के माध्यम से सीधे स्थानांतरित की जाएगी।' 
                : 'Scheme benefits will be directly transferred into Aadhaar linked bank accounts via Direct Benefit Transfer (DBT).'}
            </p>
          ) : (
            <>
              <p>
                {isHi 
                  ? <>विज्ञापन के अनुसार सातवें वेतन आयोग के पे मैट्रिक्स के अनुसार महंगाई भत्ता और अन्य भत्ते लागू होंगे। ऊपर दी गई राशि <strong>वेतनमान</strong> है; इसे निश्चित इन-हैंड सैलरी नहीं माना जाए।</>
                  : <>DA and other allowances will be applicable according to 7th Pay Commission pay matrix rules. The amount shown above is the pay scale; it should not be considered fixed in-hand salary.</>}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Section 7: Selection Process (चयन प्रक्रिया) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 border-b border-slate-200 pb-3">
          {isHi ? (isScheme ? `${jobTitleName} चयन एवं सत्यापन प्रक्रिया` : `${jobTitleName} चयन प्रक्रिया (Selection Process)`) : `${vacancy.title} Selection Process`}
        </h2>

        <p className="text-slate-700 text-base leading-relaxed font-normal">
          {isHi 
            ? (isScheme ? 'आवेदन जमा करने के बाद संबंधित विभाग द्वारा ऑनलाइन सत्यापन किया जाएगा। प्रक्रिया निम्न चरणों में संपन्न होगी:' : 'आवेदन और आवश्यक योग्यता की जांच के बाद चयन परीक्षण में पद के अनुसार निम्न चरण शामिल होंगे:') 
            : 'Selection and verification process includes the following steps:'}
        </p>

        {/* Numbered List */}
        <ol className="list-decimal pl-6 space-y-2 text-slate-800 text-base font-medium">
          {(isHi ? (vacancy.selectionProcessHi && vacancy.selectionProcessHi.length > 0 ? vacancy.selectionProcessHi : [
            'लिखित परीक्षा (Written Exam)।',
            'स्किल टेस्ट / टाइपिंग टेस्ट (जहां लागू हो)।',
            'दस्तावेज सत्यापन (Document Verification)।',
            'चिकित्सा परीक्षण (Medical Test)।'
          ]) : (vacancy.selectionProcess && vacancy.selectionProcess.length > 0 ? vacancy.selectionProcess : [
            'Written Examination',
            'Skill Test (where applicable)',
            'Document Verification',
            'Medical Examination'
          ])).map((step, idx) => (
            <li key={idx} className="pl-1 leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Section 7.5: Exam Pattern (परीक्षा पैटर्न) - Standalone Section Right Below Selection Process */}
      {!isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 border-b border-slate-200 pb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
            <span>{isHi ? `${jobTitleName} परीक्षा पैटर्न (Exam Pattern)` : `${vacancy.title} Exam Pattern`}</span>
          </h2>

          <p className="text-slate-800 text-[15px] sm:text-base leading-relaxed">
            {isHi 
              ? `${jobTitleName} की लिखित परीक्षा में वस्तुनिष्ठ (Objective) एवं विश्लेषणात्मक प्रश्न पूछे जाएंगे। विस्तृत परीक्षा पैटर्न व अंक विभाजन नीचे दिया गया है:` 
              : `The written examination for ${vacancy.title} will consist of objective and analytical questions. Detailed exam pattern and mark distribution are given below:`}
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                {isHi ? 'प्रश्न का प्रकार' : 'Question Type'}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 mt-1 block">
                {isHi ? (vacancy.examPattern?.examModeHi || 'वस्तुनिष्ठ (Objective)') : (vacancy.examPattern?.examMode || 'Objective')}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                {isHi ? 'कुल अंक' : 'Total Marks'}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-800 mt-1 block">
                {vacancy.examPattern?.totalMarks || '100'} {isHi ? 'अंक' : 'Marks'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                {isHi ? 'समय अवधि' : 'Exam Duration'}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 mt-1 block">
                {isHi ? (vacancy.examPattern?.durationHi || '2 घंटे (120 मिनट)') : (vacancy.examPattern?.duration || '2 Hours (120 Mins)')}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                {isHi ? 'न्यूनतम उत्तीर्णांक' : 'Min Qualifying'}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 mt-1 block">
                {isHi ? (vacancy.examPattern?.qualifyingMarksHi || '33% अंक') : (vacancy.examPattern?.qualifyingMarks || '33% Marks')}
              </span>
            </div>
          </div>

          {/* Subject-wise Marks Distribution Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                  <th className="py-2.5 px-3 sm:px-4 border-r border-slate-200">
                    {isHi ? 'विषय / प्रश्न पत्र का भाग' : 'Subject / Section'}
                  </th>
                  <th className="py-2.5 px-3 sm:px-4 text-center border-r border-slate-200">
                    {isHi ? 'प्रश्न संख्या' : 'No. of Questions'}
                  </th>
                  <th className="py-2.5 px-3 sm:px-4 text-center">
                    {isHi ? 'कुल अंक' : 'Total Marks'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {(vacancy.examPattern?.subjects && vacancy.examPattern.subjects.length > 0 ? vacancy.examPattern.subjects : [
                  { subject: 'General Knowledge & Current Affairs', subjectHi: 'सामान्य ज्ञान एवं समसामयिकी', questions: 20, marks: 20 },
                  { subject: 'General English', subjectHi: 'सामान्य अंग्रेजी', questions: 20, marks: 20 },
                  { subject: 'Child Pedagogy & Education', subjectHi: 'बाल विकास व शिक्षणशास्त्र', questions: 20, marks: 20 },
                  { subject: 'Subject Domain Knowledge (TGT/Specific)', subjectHi: 'संबंधित विषय का ज्ञान (TGT / पद अनुसार)', questions: 40, marks: 40 }
                ]).map((sub, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-2.5 px-3 sm:px-4 font-bold border-r border-slate-200 text-slate-800">
                      {isHi ? sub.subjectHi : sub.subject}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center border-r border-slate-200 font-semibold text-slate-700">
                      {sub.questions || '-'}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center font-bold text-slate-800">
                      {sub.marks} {isHi ? 'अंक' : 'Marks'}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-800">
                  <td className="py-2.5 px-3 sm:px-4 border-r border-slate-200 text-slate-800">
                    {isHi ? 'कुल योग (Total)' : 'Total Sum'}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center border-r border-slate-200 text-slate-800">
                    100
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center text-slate-800 font-extrabold">
                    100 {isHi ? 'अंक' : 'Marks'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Guidelines notes bullet points */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-5 space-y-2.5 text-slate-800 text-[15px] sm:text-base">
            <p className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
              <span>📌</span> {isHi ? 'लिखित परीक्षा के मुख्य निर्देश:' : 'Key Exam Guidelines:'}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-800 leading-relaxed">
              {(vacancy.examPattern?.notes && vacancy.examPattern.notes.length > 0 ? (isHi ? vacancy.examPattern.notesHi || vacancy.examPattern.notes : vacancy.examPattern.notes) : [
                isHi ? 'प्रश्न पत्र द्विभाषी (हिंदी और अंग्रेजी) माध्यम में उपलब्ध रहेगा।' : 'Question paper will be available in bilingual format (Hindi & English).',
                isHi ? 'परीक्षा ओएमआर (OMR Sheet) या ऑनलाइन माध्यम से आयोजित की जाएगी।' : 'Exam will be conducted via OMR sheet or computer based online mode.',
                isHi ? 'लिखित परीक्षा में न्यूनतम 33% अंक प्राप्त करने वाले अभ्यर्थियों को ही अगले चरण के लिए विचारित किया जाएगा।' : 'Candidates must score at least 33% minimum qualifying marks to be considered for next stages.',
                isHi ? 'प्रत्येक सही उत्तर के लिए अंक प्रदान किए जाएंगे।' : 'Marks will be awarded for each correct answer as per scheme.'
              ]).map((note, nIdx) => (
                <li key={nIdx}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Section 8: Required Documents List (आवेदन के साथ आवश्यक दस्तावेज) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 border-b border-slate-200 pb-2.5">
          {isHi ? `${jobTitleName} आवश्यक दस्तावेज (Required Documents)` : `${vacancy.title} Required Documents`}
        </h2>

        <p className="text-slate-700 text-base leading-relaxed font-normal">
          {isHi 
            ? 'आवेदन में दी गई जानकारी के समर्थन में स्पष्ट और स्वप्रमाणित प्रतियां तैयार रखें:' 
            : 'Keep clear and self-attested copies ready in support of the application:'}
        </p>

        <ul className="space-y-2.5 pl-1 pt-1">
          {documentsList.map((doc, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-700 text-base leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2.5"></span>
              <span>{doc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* अभ्यर्थियों हेतु जरूरी निर्देश (शिक्षक नोट): - Exactly under Required Documents */}
      {(() => {
        const notes = vacancy.handwrittenNotes;
        const noteHeading = isHi 
          ? `${jobTitleName} अभ्यर्थियों हेतु जरूरी निर्देश (शिक्षक नोट):` 
          : `Important Instructions for ${vacancy.title} Candidates (Teacher Note):`;
        const noteSubheading = notes?.subheadingHi || (isHi ? 'फॉर्म भरने व दस्तावेज तैयार करते समय इन महत्वपूर्ण बातों का विशेष ध्यान रखें' : 'Important guidance for form submission and document verification');
        
        const defaultPoints = [
          isHi ? `आवेदन की अंतिम तिथि (${vacancy.importantDates.applyLastDate}) का इंतजार बिल्कुल न करें — अंतिम 3 दिनों में पोर्टल पर भारी ट्रैफिक से सर्वर धीमा हो जाता है, अतः समय रहते फॉर्म सबमिट करें।` : `Never wait for the deadline (${vacancy.importantDates.applyLastDate}) — portal servers slow down in final days. Apply early.`,
          isHi ? 'One Time Registration (OTR) / आवेदन फॉर्म में अपना नाम, पिता का नाम और जन्मतिथि 10वीं की मूल अंकतालिका के अनुसार ही भरें। बाद में संशोधन का अवसर नहीं मिलता।' : 'Verify your name, father’s name, and date of birth exactly as per your 10th marksheet in OTR profile.',
          isHi ? 'नवीनतम पासपोर्ट साइज रंगीन फोटो (सफेद बैकग्राउंड) और स्पष्ट हस्ताक्षर ही अपलोड करें। चश्मा, टोपी या अस्पष्ट फोटो से फॉर्म निरस्त हो सकता है।' : 'Upload recent passport photo with clear white background and clear signature. Avoid glasses or caps.',
          isHi ? 'शुल्क भुगतान के पश्चात चालान रसीद और फाइनल सबमिट आवेदन पत्र का प्रिंटआउट अवश्य निकाल कर अपने पास सुरक्षित रखें।' : 'Keep at least two printed copies of your payment receipt and submitted application form.',
          isHi ? 'परीक्षा की तैयारी हेतु आधिकारिक सिलेबस को ध्यानपूर्वक पढ़ें और रोजाना नियमित रिवीजन का नियम बनाएं।' : 'Print the syllabus, stick it near your study desk, and maintain consistent daily revision.'
        ];

        const points = notes?.pointsHi && notes.pointsHi.length > 0 ? notes.pointsHi : defaultPoints;
        const teacherSign = notes?.teacherSignHi || (isHi ? '✍️ सफलता की हार्दिक शुभकामनाएं — राजस्थान वैकेंसी संपादकीय टीम' : '✍️ Best Wishes — Editorial Mentor Team');

        return (
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✍️</span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                    {noteHeading}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                    {noteSubheading}
                  </p>
                </div>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                <span>{isHi ? 'अनुभवी शिक्षकों द्वारा संकलित' : 'Mentor Verified'}</span>
              </span>
            </div>

            <div className="text-base text-slate-800 leading-relaxed space-y-3">
              <p className="font-bold text-slate-800 text-base sm:text-lg">
                {isHi ? '📌 प्रिय अभ्यर्थियों, फॉर्म भरने से पहले ये मुख्य बातें ध्यान रखें:' : '📌 Dear Candidates, please note these essential points before applying:'}
              </p>
              <div className="space-y-2.5 pl-1">
                {points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-slate-800 font-bold shrink-0">{idx + 1}.</span>
                    <p className="leading-relaxed text-slate-800">{pt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Footer Signature */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-slate-600 text-xs sm:text-sm">
              <span>{isHi ? 'मार्गदर्शन नोट्स — राजस्थान वैकेंसी संपादकीय टीम' : 'Guidance Notes — Rajasthan Vacancy'}</span>
              <span className="font-bold text-slate-800">{teacherSign}</span>
            </div>
          </div>
        );
      })()}

      {/* Section 9: Step-by-Step How to Apply */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        <h2 className="text-xl sm:text-[22px] font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
          <ShieldCheck className="w-5 h-5 text-slate-700" />
          <span>{isHi ? `${jobTitleName} ऑनलाइन आवेदन कैसे करें (How to Apply Online)` : `How to Apply Online for ${vacancy.title}`}</span>
        </h2>

        <div className="space-y-2.5">
          {howToApplySteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="w-7 h-7 rounded bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                {idx + 1}
              </span>
              <p className="font-medium pt-0.5 text-slate-800 text-base leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 10: Useful Important Links Table - Matching Screenshot */}
      <div id="important-links" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden scroll-mt-24">
        <div className="bg-white border-b border-slate-200 px-5 py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
            {isHi 
              ? `${jobTitleName} महत्वपूर्ण लिंक व ऑनलाइन आवेदन` 
              : `${vacancy.title} Important Links`}
          </h2>
        </div>

        <table className="w-full text-left border-collapse text-sm sm:text-base">
          <tbody className="divide-y divide-slate-200">
            {/* Row 1 & 2: Start Date & Last Date - Render ONLY for Jobs (NOT for Scheme/Yojana) */}
            {!isScheme && (
              <>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/50 w-1/2 border-r border-slate-200">
                    {`Start ${vacancy.shortTitle || vacancy.title} form`}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {vacancy.importantDates.applyStartDate || '17 October 2026'}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/50 border-r border-slate-200">
                    {`Last Date ${vacancy.officialLinks.applyOnlineUrl ? 'Online' : 'Offline'} Application form`}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {vacancy.importantDates.applyLastDate || '7 November 2026'}
                  </td>
                </tr>
              </>
            )}

            {/* Row 3: Application Form / Apply Link */}
            <tr>
              <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                {vacancy.officialLinks.applyOnlineUrl
                  ? 'Apply Online Application Form'
                  : 'Offline Application Form'}
              </td>
              <td className="py-3.5 px-4">
                <a
                  href={vacancy.officialLinks.applyOnlineUrl || vacancy.officialLinks.notificationPdfUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                >
                  <span>Click Here</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </td>
            </tr>

            {/* Row 4: Official Notification PDF */}
            {vacancy.officialLinks.notificationPdfUrl && (
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  Official Notification
                </td>
                <td className="py-3.5 px-4">
                  <a
                    href={vacancy.officialLinks.notificationPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Click Here</span>
                  </a>
                </td>
              </tr>
            )}

            {/* Syllabus PDF */}
            {vacancy.officialLinks.syllabusPdfUrl && (
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'पाठ्यक्रम (Syllabus PDF)' : 'Official Syllabus PDF'}
                </td>
                <td className="py-3.5 px-4">
                  <a
                    href={vacancy.officialLinks.syllabusPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Click Here</span>
                  </a>
                </td>
              </tr>
            )}

            {/* Admit Card Link */}
            {vacancy.officialLinks.admitCardUrl && (
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'प्रवेश पत्र डाउनलोड (Download Admit Card)' : 'Download Admit Card'}
                </td>
                <td className="py-3.5 px-4">
                  <a
                    href={vacancy.officialLinks.admitCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                  >
                    <Ticket className="w-3.5 h-3.5 text-white" />
                    <span>Click Here</span>
                  </a>
                </td>
              </tr>
            )}

            {/* Result PDF Link */}
            {vacancy.officialLinks.resultPdfUrl && (
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                  {isHi ? 'परीक्षा परिणाम (Download Result)' : 'Download Exam Result'}
                </td>
                <td className="py-3.5 px-4">
                  <a
                    href={vacancy.officialLinks.resultPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5 text-white" />
                    <span>Click Here</span>
                  </a>
                </td>
              </tr>
            )}

            {/* Row 5: Official Website Portal */}
            <tr>
              <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                Official Website
              </td>
              <td className="py-3.5 px-4">
                <a
                  href={vacancy.officialLinks.officialWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                >
                  <Building2 className="w-3.5 h-3.5 text-white" />
                  <span>Click Here</span>
                </a>
              </td>
            </tr>

            {/* Row 6: Share Post Button */}
            <tr className="bg-white">
              <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                {isHi ? 'दोस्तों के साथ शेयर करें (Share Post)' : 'Share Post With Friends'}
              </td>
              <td className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4 text-white" />
                  <span>{copiedLink ? (isHi ? 'लिंक कॉपी हो गया!' : 'Link Copied!') : (isHi ? 'शेयर करें (Share Now)' : 'Share Now')}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>


      </div>

      {/* Category Tags & Prev/Next Post Navigation - Placed directly below Important Links Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-2.5 my-3">
        {/* Row 1: Folder Icon + Category Links */}
        <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-slate-700 flex-wrap">
          <Folder className="w-4.5 h-4.5 text-slate-500 shrink-0" />
          <button
            type="button"
            onClick={onBack}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Latest News
          </button>
          <span className="text-slate-400">,</span>
          <button
            type="button"
            onClick={onBack}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Latest Job
          </button>
        </div>

        {/* Row 2: Previous Post Link */}
        <div className="flex items-start gap-2 text-sm sm:text-base leading-relaxed">
          <ChevronLeft className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
          <button
            type="button"
            onClick={() => {
              if (prevPost && onSelectOtherVacancy) {
                onSelectOtherVacancy(prevPost);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="text-blue-600 font-normal hover:underline text-left transition-colors cursor-pointer"
          >
            {prevPost 
              ? (isHi ? (prevPost.titleHi || prevPost.title) : prevPost.title)
              : (isHi 
                  ? 'प्रधानमंत्री आवास योजना शहरी 2.0 (PM Awas Yojana Urban 2026): ऑनलाइन आवेदन, पात्रता, दस्तावेज एवं सब्सिडी विवरण'
                  : 'PM Awas Yojana Urban 2.0: Online Application, Eligibility & Subsidy Details')}
          </button>
        </div>

        {/* Row 3: Next Post Link */}
        <div className="flex items-start gap-2 text-sm sm:text-base leading-relaxed">
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
          <button
            type="button"
            onClick={() => {
              if (nextPost && onSelectOtherVacancy) {
                onSelectOtherVacancy(nextPost);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="text-blue-600 font-normal hover:underline text-left transition-colors cursor-pointer"
          >
            {nextPost 
              ? (isHi ? (nextPost.titleHi || nextPost.title) : nextPost.title)
              : (isHi 
                  ? 'सैनिक स्कूल चित्तौड़गढ़ भर्ती 2026: TGT शिक्षक एवं विभिन्न पदों के लिए नोटिफिकेशन जारी, यहां से करें आवेदन'
                  : 'Sainik School Chittorgarh Recruitment 2026: TGT Teacher & Various Posts Notification Released')}
          </button>
        </div>
      </div>

      {/* Responsive AdSection inside Post */}
      <AdSection label={isHi ? 'विज्ञापन' : 'Advertisement'} />

      {/* Recent Posts Section - Matching rajasthanvacancy.com screenshot style */}
      {recentPostsList.length > 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 border-b border-slate-200 pb-3">
            Recent Posts
          </h2>

          <div className="space-y-3.5 pt-1">
            {recentPostsList.map((post) => (
              <div key={post.id} className="leading-relaxed">
                <button
                  type="button"
                  onClick={() => {
                    onSelectOtherVacancy(post);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-blue-600 hover:text-blue-800 text-base sm:text-[17px] font-normal underline hover:no-underline text-left leading-snug transition-colors cursor-pointer"
                >
                  {isHi ? (post.titleHi || post.title) : post.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 11: Frequently Asked Questions (FAQ) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight border-b border-slate-200 pb-3">
          {isHi ? `${jobTitleName} अक्सर पूछे जाने वाले सवाल (FAQ)` : `${vacancy.title} FAQs`}
        </h2>

        <div className="space-y-4 pt-1">
          {faqItems.map((faq, idx) => (
            <div key={idx} className="space-y-1.5 pb-3.5 border-b border-slate-200 last:border-0 last:pb-0">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg leading-snug">
                {isHi ? faq.qHi : faq.q}
              </h3>
              <p className="text-slate-700 text-base leading-relaxed font-normal">
                {isHi ? faq.aHi : faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 13: Any Doubt / Q&A Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl sm:text-[22px] font-bold text-slate-800 leading-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-700 shrink-0" />
            <span>
              {isHi
                ? `${jobTitleName} सवाल व शंका समाधान (Any Doubt?)`
                : `${vacancy.title} Any Doubt?`}
            </span>
          </h2>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold shrink-0">
            {isHi ? 'सहायता केंद्र' : 'Support & Queries'}
          </span>
        </div>

        {/* Informational Callout */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 leading-relaxed flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 mb-1">
              {isHi ? 'क्या आपका कोई सवाल या संशय है?' : 'Have any question or doubt regarding this recruitment?'}
            </p>
            <p className="text-slate-800">
              {isHi
                ? `यदि आपके पास ${shortJobName} से संबंधित योग्यता, आयु सीमा, फीस या आवेदन प्रक्रिया से जुड़ा कोई भी सवाल है, तो नीचे कमेंट बॉक्स में अपना प्रश्न लिखें। हमारी टीम आपको तुरंत उत्तर प्रदान करेगी।`
                : `If you have any doubt regarding ${shortJobName} eligibility, age limit, application fee or process, submit your query below. Our support team will answer your question promptly.`}
            </p>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleDoubtSubmit} className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Send className="w-4 h-4 text-slate-700" />
            {isHi ? 'अपना प्रश्न या शंका दर्ज करें (Ask Your Doubt)' : 'Post Your Doubt'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {isHi ? 'आपका नाम (Your Name)' : 'Your Name'}
              </label>
              <input
                type="text"
                value={doubtName}
                onChange={(e) => setDoubtName(e.target.value)}
                placeholder={isHi ? 'उदा. राहुल शर्मा' : 'e.g. Rahul Sharma'}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {isHi ? 'जिला / शहर (City/District)' : 'District / City'}
              </label>
              <input
                type="text"
                placeholder={isHi ? 'उदा. चित्तौड़गढ़, जयपुर' : 'e.g. Chittorgarh, Jaipur'}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              {isHi ? 'आपका सवाल या डाउट (Your Question/Doubt) *' : 'Your Doubt / Question *'}
            </label>
            <textarea
              required
              rows={3}
              value={doubtQuery}
              onChange={(e) => setDoubtQuery(e.target.value)}
              placeholder={isHi ? 'यहाँ अपना सवाल लिखें...' : 'Type your doubt or query here...'}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-slate-300"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold font-bold text-sm transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{isHi ? 'सवाल पोस्ट करें (Submit Doubt)' : 'Submit Doubt'}</span>
            </button>

            {doubtSubmitted && (
              <span className="text-xs text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-slate-800" />
                {isHi ? 'आपका सवाल दर्ज हो गया है!' : 'Your doubt submitted successfully!'}
              </span>
            )}
          </div>
        </form>
      </div>

    </article>
  );
};
