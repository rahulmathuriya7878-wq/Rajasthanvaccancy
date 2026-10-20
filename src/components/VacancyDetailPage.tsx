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
  Bell
} from 'lucide-react';
import { VacancyItem, LanguageMode } from '../types';

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

  const getCategoryShareText = (v: VacancyItem, url: string) => {
    const titleHi = v.titleHi || v.title;
    const category = v.category;
    const status = v.status;
    const isScheme = category === 'scheme' || v.organization === 'Sarkari Yojana';

    if (isScheme) {
      const benefit = v.yojanaOverview?.monthlyAssistance || v.yojanaOverview?.maxAnnualAssistance || v.salaryHi || v.salary || 'सरकारी सहायता एवं अनुदान';
      const lastDate = v.yojanaOverview?.applyLastDate || v.importantDates?.applyLastDate || 'TBA';
      return `*${titleHi}*\nयोजना का लाभ: ${benefit}\nआवेदन की अंतिम तिथि: ${lastDate}\nयोजना में आवेदन हेतु यहाँ क्लिक करें:\n${url}`;
    }

    if (category === 'admit_card' || status === 'admit_card_out') {
      const admitCardDate = v.importantDates?.admitCardDate || 'जारी कर दिया गया है';
      const examDate = v.importantDates?.examDate || 'नोटिफिकेशन देखें';
      return `*${titleHi}*\nप्रवेश पत्र जारी तिथि: ${admitCardDate}\nपरीक्षा तिथि: ${examDate}\nप्रवेश पत्र डाउनलोड करने हेतु यहाँ क्लिक करें:\n${url}`;
    }

    if (category === 'answer_key' || status === 'answer_key_out') {
      const keyDate = v.importantDates?.notificationDate || 'जारी कर दी गई है';
      const feeDate = v.importantDates?.feeLastDate || v.importantDates?.applyLastDate || 'आधिकारिक वेबसाइट देखें';
      return `*${titleHi}*\nउत्तर कुंजी (Answer Key) जारी तिथि: ${keyDate}\nआपत्ति दर्ज करने की अंतिम तिथि: ${feeDate}\nआंसर-की डाउनलोड करने हेतु यहाँ क्लिक करें:\n${url}`;
    }

    if (category === 'result' || status === 'result_declared') {
      const resultDate = v.importantDates?.resultDate || 'घोषित कर दिया गया है';
      return `*${titleHi}*\nपरीक्षा परिणाम घोषित तिथि: ${resultDate}\nपरिणाम एवं मेरिट लिस्ट देखने हेतु यहाँ क्लिक करें:\n${url}`;
    }

    const lastDate = v.importantDates?.applyLastDate || 'TBA';
    const postsCount = typeof v.totalPosts === 'number' ? v.totalPosts.toLocaleString() : (v.totalPosts || 'विभिन्न पद');
    return `*${titleHi}*\nकुल पद: ${postsCount}\nआवेदन की अंतिम तिथि: ${lastDate}\nऑनलाइन फॉर्म भरने हेतु यहाँ क्लिक करें:\n${url}`;
  };

  const handleShare = () => {
    const titleHi = vacancy.titleHi || vacancy.title;
    const currentUrl = window.location.href;
    const shareText = getCategoryShareText(vacancy, currentUrl);

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
    const currentUrl = window.location.href;
    const shareText = getCategoryShareText(vacancy, currentUrl);
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

  return (
    <article className="w-full max-w-4xl mx-auto space-y-6 text-slate-800 text-base post-content leading-relaxed">
      {/* Main Post Title Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        {/* Admin Bar (Only visible when Admin Mode is active) */}
        {isAdmin && (
          <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>{isHi ? 'एडमिन मोड' : 'Admin Mode'}</span>
              </span>
            </div>

            {/* Edit / Update & Delete Buttons - Shown ONLY for Admin */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onEditVacancy && onEditVacancy(vacancy)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm shadow-amber-600/30"
                title="Edit & Update Post Details"
              >
                <Edit3 className="w-4 h-4 text-amber-100" />
                <span>{isHi ? '✏️ पोस्ट संशोधित / अपडेट' : '✏️ Edit & Update'}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteVacancy && onDeleteVacancy(vacancy.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm shadow-rose-600/30"
                title="Delete Post"
              >
                <span>{isHi ? '🗑️ डिलीट पोस्ट' : '🗑️ Delete Post'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Post Heading - Clean, Uniform Standard Size */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
          {isHi ? vacancy.titleHi : vacancy.title}
        </h1>

        {/* Post Meta */}
        <div className="text-slate-600 flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-200 text-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isHi && vacancy.departmentHi ? vacancy.departmentHi : vacancy.department}</span>
            </div>
            <span>•</span>
            <span>{vacancy.jobLocation}</span>
            <span>•</span>
            <span className="text-slate-500">{isHi ? 'अपडेट' : 'Updated'}: {vacancy.updatedAt || vacancy.importantDates.notificationDate || vacancy.createdAt}</span>
          </div>

          {/* Quick Action Buttons: Alert Me, Bookmark, Share */}
          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={() => onToggleAlertMe && onToggleAlertMe(vacancy.id)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border shadow-2xs ${
                isAlertSet 
                  ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700' 
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
              }`}
              title={isAlertSet ? 'अलर्ट ऑन (Alert Active)' : 'आवेदन शुरू होने का नोटिफिकेशन पाएं'}
            >
              <Bell className={`w-3.5 h-3.5 ${isAlertSet ? 'fill-white text-white animate-bounce' : 'text-rose-600'}`} />
              <span>{isAlertSet ? (isHi ? 'अलर्ट ऑन ★' : 'Alert On ★') : (isHi ? '🔔 अलर्ट सेट करें (Alert Me)' : '🔔 Alert Me')}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(vacancy.id)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border shadow-2xs ${
                isSaved 
                  ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
              <span>{isSaved ? (isHi ? 'सेव्ड ★' : 'Saved ★') : (isHi ? 'सेव करें' : 'Save')}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition cursor-pointer shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>{isHi ? 'शेयर' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Overview Introduction Box */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-900 border-b border-slate-100 pb-2.5">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900">
              <span className="text-amber-600">📝</span>
              <span>{isHi ? 'भर्ती का संक्षिप्त विवरण (Recruitment Summary)' : 'Recruitment Summary'}</span>
            </h2>
            <span className="text-xs bg-amber-50 text-amber-900 font-semibold px-2.5 py-1 rounded border border-amber-200">
              {vacancy.category === 'scheme' ? 'सरकारी योजना' : 'सरकारी भर्ती'}
            </span>
          </div>

          <p className="text-base text-slate-800 leading-relaxed font-normal whitespace-pre-line">
            {isScheme
              ? isHi
                ? `${vacancy.titleHi}: राजस्थान सरकार के ${vacancy.departmentHi || vacancy.department} द्वारा संचालित एक प्रमुख कल्याणकारी योजना है। इसके तहत राजकीय महाविद्यालयों एवं विश्वविद्यालयों में अध्ययनरत आरक्षित वर्गों (SC, ST, OBC, MBC एवं EWS) के नियमित छात्रों को किराए के कमरों/PG में रहने एवं भोजन हेतु ₹2,000/- प्रतिमाह (वर्ष में अधिकतम ₹20,000/-) की वित्तीय सहायता DBT के माध्यम से सीधे बैंक खाते में प्रदान की जाती है।`
                : `${vacancy.title}: A welfare scheme by ${vacancy.department} providing ₹2,000/month (up to ₹20,000/year) via DBT to eligible SC, ST, OBC, MBC, and EWS college students staying in rented rooms or PG for higher education.`
              : isHi 
              ? (vacancy.briefSummaryHi || vacancy.briefSummary || `नमस्ते साथियों! ${vacancy.titleHi || vacancy.title} के अंतर्गत ${vacancy.organization} (${vacancy.departmentHi || vacancy.department}) द्वारा कुल ${vacancy.totalPosts || 'अनेक'} रिक्त पदों पर ऑनलाइन आवेदन आमंत्रित किए गए हैं। हमने इस भर्ती के सभी नियमों, पात्रता, परीक्षा पैटर्न और आवेदन प्रक्रिया को सरल भाषा में तैयार किया है ताकि फॉर्म भरते समय आपसे कोई गलती न हो। अंतिम तिथि ${vacancy.importantDates.applyLastDate} का इंतजार किए बिना समय पर अपना फॉर्म जरूर भर लें।`)
              : (vacancy.briefSummary || `Hello Candidates! ${vacancy.title} has been officially announced by ${vacancy.organization} (${vacancy.department}) for a total of ${vacancy.totalPosts || 'various'} vacancies. Our mentor team has compiled all critical details, eligibility rules, and application steps in simple terms so you can apply without confusion before the last date ${vacancy.importantDates.applyLastDate}.`)}
          </p>

          {onOpenAdminLogin && !isAdmin && (
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer text-xs opacity-50 hover:opacity-100 flex items-center gap-1 font-mono"
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
              <PenTool className="w-5 h-5 text-amber-600 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {isHi ? `${vacancy.shortTitleHi || vacancy.titleHi || vacancy.title} का विस्तृत विवरण` : `${vacancy.title} Detailed Information`}
              </h2>
            </div>
          </div>
          <div className="text-base text-slate-800 leading-relaxed whitespace-pre-line font-normal space-y-3">
            {isHi ? (vacancy.descriptionHi || vacancy.description) : vacancy.description}
          </div>
        </div>
      )}

      {/* Dedicated Yojana General Information Section (योजना क्या है? - सामान्य जानकारी) */}
      {isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {vacancy.yojanaGeneralInfo?.headingHi || `${vacancy.shortTitleHi || vacancy.postNameHi || 'योजना'} क्या है? (सामान्य जानकारी)`}
            </h2>
          </div>

          <div className="space-y-4 text-base text-slate-800 leading-relaxed">
            <p className="bg-slate-50/60 p-4 rounded-lg border border-slate-200 text-slate-900">
              {vacancy.yojanaGeneralInfo?.descriptionHi || vacancy.descriptionHi}
            </p>

            {vacancy.yojanaGeneralInfo?.objectiveHi && (
              <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-950 block text-base">🎯 योजना का मुख्य उद्देश्य:</span>
                <p className="text-slate-800">{vacancy.yojanaGeneralInfo.objectiveHi}</p>
              </div>
            )}

            {/* Overview Table for Yojana inserted directly after 'योजना का मुख्य उद्देश्य' */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden my-3">
              <div className="bg-white border-b border-slate-200 text-slate-900 px-5 py-3.5 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    {`${vacancy.shortTitleHi || vacancy.postNameHi || 'योजना का नाम'} Overview`}
                  </span>
                </h2>
                <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded font-mono font-bold">
                  SARKARI YOJANA
                </span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-900 border-b border-slate-200 text-sm sm:text-base">
                    <th className="py-3 px-4 font-bold w-2/5 border-r border-slate-200 text-slate-900">
                      विवरण
                    </th>
                    <th className="py-3 px-4 font-bold text-slate-900">
                      जानकारी
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm sm:text-base">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      योजना का नाम
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold text-amber-900">
                      {vacancy.yojanaOverview?.yojanaName || vacancy.postNameHi || vacancy.titleHi}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      राज्य
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.state || 'राजस्थान'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      संबंधित विभाग
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.department || vacancy.departmentHi || vacancy.department}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      शैक्षणिक सत्र
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.academicSession || '2025-26 / 2026-27'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      लाभार्थी
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.beneficiaries || vacancy.qualificationDetailsHi}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      मासिक सहायता
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {vacancy.yojanaOverview?.monthlyAssistance || vacancy.salaryHi || vacancy.salary}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      एक वर्ष में सहायता अवधि
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.durationPerYear || 'अधिकतम 10 माह'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      वार्षिक अधिकतम सहायता
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-800">
                      {vacancy.yojanaOverview?.maxAnnualAssistance || '₹20,000/- प्रति वर्ष'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      निर्धारित लाभार्थी संख्या
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold">
                      {vacancy.yojanaOverview?.totalBeneficiariesCount || vacancy.totalPosts}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      आवेदन शुरू
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.applyStartDate || vacancy.importantDates.notificationDate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      आवेदन की अंतिम तिथि
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-700">
                      {vacancy.yojanaOverview?.applyLastDate || vacancy.importantDates.applyLastDate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      आवेदन माध्यम
                    </td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">
                      {vacancy.yojanaOverview?.applyMode || 'ऑनलाइन (SSO Portal SJMS App)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      भुगतान का माध्यम
                    </td>
                    <td className="py-3 px-4 text-emerald-800 font-medium">
                      {vacancy.yojanaOverview?.paymentMode || 'डायरेक्ट बेनिफिट ट्रांसफर (DBT)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      आधिकारिक वेबसाइट
                    </td>
                    <td className="py-3 px-4 text-amber-700 font-medium">
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
              <div className="bg-slate-50/60 p-4 rounded-lg border border-emerald-300 space-y-1">
                <span className="font-bold text-emerald-900 block text-base">💰 वित्तीय सहायता राशि:</span>
                <p className="text-emerald-950 font-medium">{vacancy.yojanaGeneralInfo.benefitsSummaryHi}</p>
              </div>
            )}

            {vacancy.yojanaGeneralInfo?.keyPointsHi && vacancy.yojanaGeneralInfo.keyPointsHi.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">📌 योजना की मुख्य बातें एवं बिंदु:</h3>
                <ul className="list-disc list-inside space-y-1.5 text-slate-800 pl-2 text-base">
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
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {vacancy.yojanaEligibility?.headingHi || `${vacancy.shortTitleHi || vacancy.postNameHi || 'योजना'} 2026 के लिए पात्रता (Eligibility Criteria)`}
            </h2>
          </div>

          <div className="space-y-4 text-base text-slate-800 leading-relaxed">
            {/* Criteria List */}
            {vacancy.yojanaEligibility?.criteriaHi && vacancy.yojanaEligibility.criteriaHi.length > 0 ? (
              <div className="space-y-2.5">
                <h3 className="font-bold text-slate-900 text-base">📋 अनिवार्य पात्रता मानदंड:</h3>
                <ul className="space-y-2">
                  {vacancy.yojanaEligibility.criteriaHi.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-slate-50/50 p-3 rounded-lg border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      <span className="text-slate-800 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-slate-800">{vacancy.qualificationDetailsHi}</p>
            )}

            {/* Family Income Limits */}
            {vacancy.yojanaEligibility?.incomeLimitHi && vacancy.yojanaEligibility.incomeLimitHi.length > 0 && (
              <div className="bg-slate-50/50 p-4 rounded-lg border border-amber-300 space-y-2 mt-3">
                <h3 className="font-bold text-slate-950 text-base">👨‍👩‍👧‍👦 पारिवारिक वार्षिक आय सीमा (Annual Family Income Limit):</h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-900 pl-1 font-medium">
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
          <div className="bg-white border-b border-slate-200 text-slate-900 px-5 py-3.5 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                {isHi
                  ? 'भर्ती का संक्षिप्त विवरण (Recruitment Overview)'
                  : 'Recruitment Overview'}
              </span>
            </h2>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded font-mono font-bold">
              RAJASTHAN VACANCY/JOBS
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200 text-sm sm:text-base">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 w-2/5 sm:w-1/3 border-r border-slate-200">
                  {isHi ? 'भर्ती बोर्ड / विभाग का नाम' : 'Recruitment Organization'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">
                  {isHi && vacancy.departmentHi ? vacancy.departmentHi : vacancy.department} ({vacancy.organization})
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'पद का नाम (Post Name)' : 'Post Name'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-semibold">
                  {isHi ? vacancy.postNameHi : vacancy.postName}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'विज्ञापन संख्या (Advt No.)' : 'Advertisement Number'}
                </td>
                <td className="py-3 px-4 font-mono font-medium text-slate-900">
                  {vacancy.advtNo}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'कुल रिक्त पद (Total Vacancies)' : 'Total Vacancies'}
                </td>
                <td className="py-3 px-4 font-bold text-emerald-700">
                  {typeof vacancy.totalPosts === 'number' ? `${vacancy.totalPosts.toLocaleString()} पद` : vacancy.totalPosts}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'वेतनमान (Salary / Pay Scale)' : 'Salary / Pay Level'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">
                  {isHi && vacancy.salaryHi ? vacancy.salaryHi : vacancy.salary}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'नौकरी का स्थान (Job Location)' : 'Job Location'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">
                  {vacancy.jobLocation}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'आवेदन का प्रकार (Mode of Apply)' : 'Application Mode'}
                </td>
                <td className="py-3 px-4 text-blue-700 font-semibold">
                  {isHi ? 'ऑनलाइन (Online Application)' : 'Online Application'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'आधिकारिक वेबसाइट (Official Website)' : 'Official Website'}
                </td>
                <td className="py-3 px-4 text-amber-700 font-medium">
                  <a 
                    href={vacancy.officialLinks.officialWebsiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline inline-flex items-center gap-1.5"
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
          <div className="bg-white border-b border-slate-200 px-5 py-3">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-900">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>{isHi ? 'महत्वपूर्ण तिथियां (Important Dates)' : 'Important Dates'}</span>
            </h2>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200 text-sm sm:text-base">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 w-2/5 sm:w-1/3 border-r border-slate-200">
                  {isHi ? 'विज्ञप्ति जारी तिथि:' : 'Notification Date:'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">{vacancy.importantDates.notificationDate}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'ऑनलाइन आवेदन प्रारंभ तिथि:' : 'Online Apply Start:'}
                </td>
                <td className="py-3 px-4 font-bold text-emerald-700">{vacancy.importantDates.applyStartDate}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-rose-900 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'आवेदन करने की अंतिम तिथि:' : 'Apply Last Date:'}
                </td>
                <td className="py-3 px-4 font-bold text-rose-700">{vacancy.importantDates.applyLastDate}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'शुल्क भुगतान अंतिम तिथि:' : 'Fee Last Date:'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">{vacancy.importantDates.feeLastDate || vacancy.importantDates.applyLastDate}</td>
              </tr>
              {vacancy.importantDates.examDate && (
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                    {isHi ? 'परीक्षा तिथि:' : 'Exam Date:'}
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-800">{vacancy.importantDates.examDate}</td>
                </tr>
              )}
              {vacancy.importantDates.admitCardDate && (
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                    {isHi ? 'प्रवेश पत्र जारी तिथि:' : 'Admit Card Date:'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-700">{vacancy.importantDates.admitCardDate}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TSP / Non-TSP Breakdown Box */}
      {!isScheme && vacancy.tspBreakdown && ((vacancy.tspBreakdown.nonTsp ?? 0) > 0 || (vacancy.tspBreakdown.tsp ?? 0) > 0) && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {isHi ? 'टीएसपी एवं गैर-टीएसपी पद विवरण (TSP & Non-TSP Breakdown)' : 'TSP & Non-TSP Post Breakdown'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase block">
                {isHi ? 'गैर-टीएसपी (Non-TSP)' : 'Non-TSP Area'}
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-700 mt-1 block">
                {vacancy.tspBreakdown.nonTsp} {isHi ? 'पद' : 'Posts'}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase block">
                {isHi ? 'टीएसपी क्षेत्र (TSP)' : 'TSP Area'}
              </span>
              <span className="text-base sm:text-lg font-bold text-blue-700 mt-1 block">
                {vacancy.tspBreakdown.tsp} {isHi ? 'पद' : 'Posts'}
              </span>
            </div>
            {vacancy.tspBreakdown.sahariya !== undefined && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase block">
                  {isHi ? 'सहरिया (Sahariya)' : 'Sahariya Area'}
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-700 mt-1 block">
                  {vacancy.tspBreakdown.sahariya} {isHi ? 'पद' : 'Posts'}
                </span>
              </div>
            )}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase block">
                {isHi ? 'कुल पद' : 'Total Posts'}
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 mt-1 block">
                {(Number(vacancy.tspBreakdown.nonTsp) || 0) + (Number(vacancy.tspBreakdown.tsp) || 0) + (Number(vacancy.tspBreakdown.sahariya) || 0)} {isHi ? 'पद' : 'Posts'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Post Breakdown Box - Render only if postBreakdown data exists */}
      {!isScheme && vacancy.postBreakdown && vacancy.postBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {isHi 
              ? `${vacancy.shortTitleHi || vacancy.titleHi || vacancy.title} में पदों का विवरण` 
              : `Post-Wise Vacancy Details for ${vacancy.title}`}
          </h2>

          {/* Clean 3-Column Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 text-sm sm:text-base">
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
              <tbody className="divide-y divide-slate-200 text-sm sm:text-base text-slate-800">
                {vacancy.postBreakdown.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-3 px-4 border-r border-slate-200 font-medium text-slate-900">
                      {isHi ? (item.postNameHi || item.postName) : item.postName}
                    </td>
                    <td className="py-3 px-4 border-r border-slate-200 text-center font-medium">
                      {isHi ? (item.categoryOrSubjectHi || item.categoryOrSubject || '-') : (item.categoryOrSubject || '-')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
            {isHi ? 'आवेदन के लिए शैक्षणिक योग्यता (Educational Qualification)' : 'Educational Qualification for Application'}
          </h2>

          {/* General Qualification Overview */}
          <div className="text-base text-slate-800 leading-relaxed">
            <p className="font-medium text-slate-900 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
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
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-amber-600">🎓</span>
                    <span>
                      {isHi 
                        ? `${vacancy.shortTitleHi || vacancy.titleHi || vacancy.title} पद अनुसार शैक्षणिक योग्यता` 
                        : 'Post-Wise Educational Qualification:'}
                    </span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border border-slate-200 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 text-sm sm:text-base">
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
                      <tbody className="divide-y divide-slate-200 text-sm sm:text-base text-slate-800">
                        {postWiseQualifications.map((item, idx) => (
                          <tr key={idx} className="bg-white hover:bg-slate-50/40 transition-colors">
                            <td className="py-3 px-4 border-r border-slate-200 font-semibold text-slate-900 align-top">
                              {isHi ? (item.postNameHi || item.postName) : item.postName}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200 text-slate-800 leading-relaxed align-top">
                              {isHi ? (item.qualificationHi || item.qualification) : (item.qualification || item.qualificationHi)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900 align-top whitespace-nowrap">
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
              <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-2">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-slate-900 text-sm sm:text-base">
                      {isHi 
                        ? 'विस्तृत जानकारी के लिए आधिकारिक नोटिफिकेशन देखें' 
                        : 'For detailed qualification details, please refer to the official notification.'}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
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
              <span className="font-bold text-slate-700">{isHi ? 'पात्र स्तर / योग्यता:' : 'Eligible Levels:'}</span>
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
            {isHi ? 'आयु सीमा (Age Limit Details)' : 'Age Limit Details'}
          </h2>

          <p className="text-base text-slate-800 leading-relaxed font-medium bg-slate-50/60 p-4 rounded-xl border border-slate-200">
            {isHi 
              ? `न्यूनतम आयु: ${vacancy.ageLimit.min} वर्ष | अधिकतम आयु: ${vacancy.ageLimit.max} वर्ष (आयु की गणना ${vacancy.ageLimit.asOnDate || vacancy.importantDates.applyLastDate} को आधार मानकर की जाएगी)।`
              : `Minimum Age: ${vacancy.ageLimit.min} years | Maximum Age: ${vacancy.ageLimit.max} years (Calculated as on ${vacancy.ageLimit.asOnDate || vacancy.importantDates.applyLastDate}).`}
          </p>

          {(vacancy.ageLimit.relaxationNotesHi || vacancy.ageLimit.relaxationNotes) && (
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-slate-900 text-base">
              <p className="font-bold">
                {isHi ? 'आरक्षित श्रेणियों हेतु आयु सीमा में ऊपरी छूट (Age Relaxation Rules):' : 'Upper Age Relaxation Rules:'}
              </p>
              <p className="text-slate-800 leading-relaxed">
                {isHi ? vacancy.ageLimit.relaxationNotesHi : vacancy.ageLimit.relaxationNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Benefit / Salary Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          {isHi 
            ? (isScheme 
                ? `${vacancy.shortTitleHi || 'प्रधानमंत्री आवास योजना शहरी 2.0'}. योजना के लाभ एवं सहायता राशि` 
                : `${vacancy.shortTitleHi || vacancy.titleHi || vacancy.title} में वेतन`) 
            : (isScheme 
                ? `${vacancy.shortTitle || 'PM Awas Yojana Urban 2.0'}. Scheme Benefits & Assistance` 
                : `Salary / Pay Scale Details for ${vacancy.title}`)}
        </h2>

        {/* Clean Salary / Benefits Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 text-sm sm:text-base">
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
            <tbody className="divide-y divide-slate-200 text-sm sm:text-base text-slate-800">
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
                  <td className="py-3 px-4 border-r border-slate-200 font-medium text-slate-900">
                    {isHi ? item.postNameHi : item.postName}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-200 text-center font-medium text-slate-900">
                    {isHi ? (item.payLevelHi || item.payLevel) : item.payLevel}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-900">
                    {isHi ? (item.salaryRangeHi || item.salaryRange) : item.salaryRange}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Salary explanatory notes */}
        <div className="space-y-3 text-slate-800 text-base leading-relaxed pt-2">
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

      {/* Section 7: Selection Process (चयन / सत्यापन प्रक्रिया) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          {isHi ? (isScheme ? 'चयन एवं सत्यापन प्रक्रिया' : 'चयन प्रक्रिया (Selection Process)') : 'Selection Process'}
        </h2>

        <p className="text-slate-800 text-base leading-relaxed">
          {isHi 
            ? (isScheme ? 'आवेदन जमा करने के बाद संबंधित विभाग द्वारा ऑनलाइन सत्यापन किया जाएगा। प्रक्रिया निम्न चरणों में संपन्न होगी:' : 'आवेदन और आवश्यक योग्यता की जांच के बाद चयन परीक्षण में पद के अनुसार निम्न चरण शामिल होंगे:') 
            : 'Selection and verification process includes the following steps:'}
        </p>

        {/* Numbered List */}
        <ol className="list-decimal pl-6 space-y-2 text-slate-900 text-base font-medium">
          {(isHi ? (vacancy.selectionProcessHi && vacancy.selectionProcessHi.length > 0 ? vacancy.selectionProcessHi : [
            'लिखित परीक्षा।',
            'स्किल टेस्ट / टाइपिंग टेस्ट, जहां लागू हो।',
            'दस्तावेज सत्यापन।',
            'चिकित्सा परीक्षण।'
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

        {/* Sub-section: written exam pattern - Render ONLY for Jobs (NOT for Scheme/Yojana) */}
        {!isScheme && (
          <div className="pt-5 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {isHi ? `${vacancy.titleHi || vacancy.title} - लिखित परीक्षा का पैटर्न` : `${vacancy.title} - Written Exam Pattern`}
              </h3>
            </div>

            <p className="text-slate-800 text-[15px] sm:text-base leading-relaxed">
              {isHi 
                ? `${vacancy.titleHi || vacancy.title} की लिखित परीक्षा में वस्तुनिष्ठ (Objective) एवं विश्लेषणात्मक प्रश्न पूछे जाएंगे। विस्तृत परीक्षा पैटर्न व अंक विभाजन नीचे दिया गया है:` 
                : `The written examination for ${vacancy.title} will consist of objective and analytical questions. Detailed exam pattern and mark distribution are given below:`}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {isHi ? 'प्रश्न का प्रकार' : 'Question Type'}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 mt-1 block">
                  {isHi ? (vacancy.examPattern?.examModeHi || 'वस्तुनिष्ठ (Objective)') : (vacancy.examPattern?.examMode || 'Objective')}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {isHi ? 'कुल अंक' : 'Total Marks'}
                </span>
                <span className="text-sm sm:text-base font-bold text-indigo-700 mt-1 block">
                  {vacancy.examPattern?.totalMarks || '100'} {isHi ? 'अंक' : 'Marks'}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {isHi ? 'समय अवधि' : 'Exam Duration'}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 mt-1 block">
                  {isHi ? (vacancy.examPattern?.durationHi || '2 घंटे (120 मिनट)') : (vacancy.examPattern?.duration || '2 Hours (120 Mins)')}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {isHi ? 'न्यूनतम उत्तीर्णांक' : 'Min Qualifying'}
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-700 mt-1 block">
                  {isHi ? (vacancy.examPattern?.qualifyingMarksHi || '33% अंक') : (vacancy.examPattern?.qualifyingMarks || '33% Marks')}
                </span>
              </div>
            </div>

            {/* Subject-wise Marks Distribution Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-slate-800 font-semibold">
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
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {(vacancy.examPattern?.subjects && vacancy.examPattern.subjects.length > 0 ? vacancy.examPattern.subjects : [
                    { subject: 'General Knowledge & Current Affairs', subjectHi: 'सामान्य ज्ञान एवं समसामयिकी', questions: 20, marks: 20 },
                    { subject: 'General English', subjectHi: 'सामान्य अंग्रेजी', questions: 20, marks: 20 },
                    { subject: 'Child Pedagogy & Education', subjectHi: 'बाल विकास व शिक्षणशास्त्र', questions: 20, marks: 20 },
                    { subject: 'Subject Domain Knowledge (TGT/Specific)', subjectHi: 'संबंधित विषय का ज्ञान (TGT / पद अनुसार)', questions: 40, marks: 40 }
                  ]).map((sub, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="py-2.5 px-3 sm:px-4 font-medium border-r border-slate-200">
                        {isHi ? sub.subjectHi : sub.subject}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center border-r border-slate-200 font-medium">
                        {sub.questions || '-'}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center font-bold text-slate-900">
                        {sub.marks} {isHi ? 'अंक' : 'Marks'}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-white border-t-2 border-slate-300 font-bold text-slate-900">
                    <td className="py-2.5 px-3 sm:px-4 border-r border-slate-200 text-slate-950">
                      {isHi ? 'कुल योग (Total)' : 'Total Sum'}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center border-r border-slate-200 text-slate-950">
                      100
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center text-slate-900 font-extrabold">
                      100 {isHi ? 'अंक' : 'Marks'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Guidelines notes bullet points */}
            <div className="bg-white border border-amber-200 rounded-lg p-4 sm:p-5 space-y-2.5 text-slate-950 text-[15px] sm:text-base">
              <p className="font-bold text-amber-900 text-base sm:text-lg flex items-center gap-2">
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
      </div>

      {/* Section 8: Required Documents List (आवेदन के साथ आवश्यक दस्तावेज) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2.5">
          {isHi ? 'आवेदन के साथ आवश्यक दस्तावेज (Required Documents)' : 'Required Documents for Application'}
        </h2>

        <p className="text-slate-800 text-base leading-relaxed font-normal">
          {isHi 
            ? 'आवेदन में दी गई जानकारी के समर्थन में स्पष्ट और स्वप्रमाणित प्रतियां तैयार रखें:' 
            : 'Keep clear and self-attested copies ready in support of the application:'}
        </p>

        <ul className="space-y-2.5 pl-1 pt-1">
          {documentsList.map((doc, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-800 text-base leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0 mt-2.5"></span>
              <span>{doc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* अभ्यर्थियों हेतु जरूरी निर्देश (शिक्षक नोट): - Exactly under Required Documents */}
      {(() => {
        const notes = vacancy.handwrittenNotes;
        const noteHeading = isHi 
          ? 'अभ्यर्थियों हेतु जरूरी निर्देश (शिक्षक नोट):' 
          : 'Important Instructions for Candidates (Teacher Note):';
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
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                    {noteHeading}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                    {noteSubheading}
                  </p>
                </div>
              </div>
              <span className="text-xs bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{isHi ? 'अनुभवी शिक्षकों द्वारा संकलित' : 'Mentor Verified'}</span>
              </span>
            </div>

            <div className="text-base text-slate-800 leading-relaxed space-y-3">
              <p className="font-bold text-slate-900 text-base sm:text-lg">
                {isHi ? '📌 प्रिय अभ्यर्थियों, फॉर्म भरने से पहले ये मुख्य बातें ध्यान रखें:' : '📌 Dear Candidates, please note these essential points before applying:'}
              </p>
              <div className="space-y-2.5 pl-1">
                {points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-amber-600 font-bold shrink-0">{idx + 1}.</span>
                    <p className="leading-relaxed text-slate-800">{pt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Footer Signature */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-slate-500 text-xs sm:text-sm">
              <span>{isHi ? 'मार्गदर्शन नोट्स — राजस्थान वैकेंसी संपादकीय टीम' : 'Guidance Notes — Rajasthan Vacancy'}</span>
              <span className="font-semibold text-slate-800">{teacherSign}</span>
            </div>
          </div>
        );
      })()}

      {/* Section 9: Step-by-Step How to Apply */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span>{isHi ? 'ऑनलाइन आवेदन कैसे करें - स्टेप बाय स्टेप गाइड (How to Apply Online)' : 'Step-by-Step Online Application Guide'}</span>
        </h2>

        <div className="space-y-2.5">
          {howToApplySteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50/50 border border-slate-200">
              <span className="w-7 h-7 rounded bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                {idx + 1}
              </span>
              <p className="font-medium pt-0.5 text-slate-900 text-base leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 10: Useful Important Links Table - Matching Screenshot */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-5 py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {isHi 
              ? `${vacancy.shortTitleHi || vacancy.titleHi || vacancy.title} Important Links` 
              : `${vacancy.title} Important Links`}
          </h2>
        </div>

        <table className="w-full text-left border-collapse text-sm sm:text-base">
          <tbody className="divide-y divide-slate-200">
            {/* Row 1 & 2: Start Date & Last Date - Render ONLY for Jobs (NOT for Scheme/Yojana) */}
            {!isScheme && (
              <>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-50/50 w-1/2 border-r border-slate-200">
                    {`Start ${vacancy.shortTitle || vacancy.title} form`}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {vacancy.importantDates.applyStartDate || '17 October 2026'}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                    {`Last Date ${vacancy.officialLinks.applyOnlineUrl ? 'Online' : 'Offline'} Application form`}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {vacancy.importantDates.applyLastDate || '7 November 2026'}
                  </td>
                </tr>
              </>
            )}

            {/* Row 3: Application Form / Apply Link */}
            <tr>
              <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                {vacancy.officialLinks.applyOnlineUrl
                  ? 'Apply Online Application Form'
                  : 'Offline Application Form'}
              </td>
              <td className="py-3.5 px-4">
                <a
                  href={vacancy.officialLinks.applyOnlineUrl || vacancy.officialLinks.notificationPdfUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  <span>Click Here</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </td>
            </tr>

            {/* Row 4: Official Notification PDF */}
            {vacancy.officialLinks.notificationPdfUrl && (
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                  Official Notification
                </td>
                <td className="py-3.5 px-4">
                  <a
                    href={vacancy.officialLinks.notificationPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Click Here</span>
                  </a>
                </td>
              </tr>
            )}

            {/* Syllabus PDF */}
            {vacancy.officialLinks.syllabusPdfUrl && (
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'पाठ्यक्रम (Syllabus PDF)' : 'Official Syllabus PDF'}
                </td>
                <td className="py-3.5 px-4">
                  <a
                    href={vacancy.officialLinks.syllabusPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Click Here</span>
                  </a>
                </td>
              </tr>
            )}

            {/* Admit Card Link */}
            {vacancy.officialLinks.admitCardUrl && (
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'प्रवेश पत्र डाउनलोड (Download Admit Card)' : 'Download Admit Card'}
                </td>
                <td className="py-3.5 px-4">
                  <a
                    href={vacancy.officialLinks.admitCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5 text-rose-200" />
                    <span>Click Here</span>
                  </a>
                </td>
              </tr>
            )}

            {/* Result PDF Link */}
            {vacancy.officialLinks.resultPdfUrl && (
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                  {isHi ? 'परीक्षा परिणाम (Download Result)' : 'Download Exam Result'}
                </td>
                <td className="py-3.5 px-4">
                  <a
                    href={vacancy.officialLinks.resultPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Click Here</span>
                  </a>
                </td>
              </tr>
            )}

            {/* Row 5: Official Website Portal */}
            <tr>
              <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                Official Website
              </td>
              <td className="py-3.5 px-4">
                <a
                  href={vacancy.officialLinks.officialWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Click Here</span>
                </a>
              </td>
            </tr>

            {/* Row 6: Share Post Button */}
            <tr className="bg-white">
              <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                {isHi ? 'दोस्तों के साथ शेयर करें (Share Post)' : 'Share Post With Friends'}
              </td>
              <td className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4 text-amber-200" />
                  <span>{copiedLink ? (isHi ? 'लिंक कॉपी हो गया!' : 'Link Copied!') : (isHi ? 'शेयर करें (Share Now)' : 'Share Now')}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Quick Share Bar */}
        <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between flex-wrap gap-3">
          <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-amber-600" />
            <span>{isHi ? 'सूचना अपने मित्रों व ग्रुप्स में शेयर करें:' : 'Share this post with friends:'}</span>
          </span>
          <div>
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4 text-amber-200" />
              <span>{copiedLink ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : (isHi ? 'शेयर बटन (Share)' : 'Share Button')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 11: Frequently Asked Questions (FAQ) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight border-b border-slate-200 pb-3">
          {isHi ? `${vacancy.shortTitleHi || vacancy.titleHi || vacancy.title} FAQs` : `${vacancy.title} FAQs`}
        </h2>

        <div className="space-y-4 pt-1">
          {faqItems.map((faq, idx) => (
            <div key={idx} className="space-y-1.5 pb-3.5 border-b border-slate-200 last:border-0 last:pb-0">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug">
                {isHi ? faq.qHi : faq.q}
              </h3>
              <p className="text-slate-800 text-base leading-relaxed font-normal">
                {isHi ? faq.aHi : faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 13: Any Doubt / Q&A Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              {isHi
                ? `${vacancy.shortTitleHi || vacancy.titleHi || vacancy.title} Any Doubt? (सवाल पूछें)`
                : `${vacancy.title} Any Doubt?`}
            </span>
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold shrink-0">
            {isHi ? 'सहायता केंद्र' : 'Support & Queries'}
          </span>
        </div>

        {/* Informational Callout */}
        <div className="bg-white border border-amber-200 rounded-lg p-4 text-sm text-slate-800 leading-relaxed flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 mb-1">
              {isHi ? 'क्या आपका कोई सवाल या संशय है?' : 'Have any question or doubt regarding this recruitment?'}
            </p>
            <p>
              {isHi
                ? `यदि आपके पास ${vacancy.titleHi || vacancy.title} भर्ती से संबंधित योग्यता, आयु सीमा, फीस या आवेदन प्रक्रिया से जुड़ा कोई भी सवाल है, तो नीचे कमेंट बॉक्स में अपना प्रश्न लिखें। हमारी टीम आपको तुरंत उत्तर प्रदान करेगी।`
                : `If you have any doubt regarding ${vacancy.title} eligibility, age limit, application fee or process, submit your query below. Our support team will answer your question promptly.`}
            </p>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleDoubtSubmit} className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-600" />
            {isHi ? 'अपना प्रश्न या शंका दर्ज करें (Ask Your Doubt)' : 'Post Your Doubt'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {isHi ? 'आपका नाम (Your Name)' : 'Your Name'}
              </label>
              <input
                type="text"
                value={doubtName}
                onChange={(e) => setDoubtName(e.target.value)}
                placeholder={isHi ? 'उदा. राहुल शर्मा' : 'e.g. Rahul Sharma'}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {isHi ? 'जिला / शहर (City/District)' : 'District / City'}
              </label>
              <input
                type="text"
                placeholder={isHi ? 'उदा. चित्तौड़गढ़, जयपुर' : 'e.g. Chittorgarh, Jaipur'}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {isHi ? 'आपका सवाल या डाउट (Your Question/Doubt) *' : 'Your Doubt / Question *'}
            </label>
            <textarea
              required
              rows={3}
              value={doubtQuery}
              onChange={(e) => setDoubtQuery(e.target.value)}
              placeholder={isHi ? 'यहाँ अपना सवाल लिखें...' : 'Type your doubt or query here...'}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{isHi ? 'सवाल पोस्ट करें (Submit Doubt)' : 'Submit Doubt'}</span>
            </button>

            {doubtSubmitted && (
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                {isHi ? 'आपका सवाल दर्ज हो गया है!' : 'Your doubt submitted successfully!'}
              </span>
            )}
          </div>
        </form>

        {/* Existing Doubts & Admin Answers List */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-slate-600" />
            <span>
              {isHi
                ? `पूछे गए सवाल एवं समाधान (${userDoubts.length})`
                : `Asked Doubts & Answers (${userDoubts.length})`}
            </span>
          </h3>

          <div className="space-y-3.5">
            {userDoubts.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    {item.name}
                  </span>
                  <span>{item.date}</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                    {isHi ? 'सवाल (Doubt):' : 'Question:'}
                  </p>
                  <p className="text-sm text-slate-900 font-semibold leading-relaxed">
                    {item.question}
                  </p>
                </div>

                {item.answer && (
                  <div className="mt-2.5 p-3 rounded-lg bg-white border border-emerald-200 text-xs text-slate-800 space-y-1">
                    <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {isHi ? 'टीम उत्तर (Admin Response):' : 'Admin Response:'}
                    </p>
                    <p className="leading-relaxed text-slate-700">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Jobs Section - Suggested based on current job's category or organization tags */}
      {relatedVacancies.length > 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                {isHi ? 'संबंधित सरकारी नौकरियां (Related Jobs)' : 'Related Jobs & Openings'}
              </span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {isHi ? 'आपके लिए 3 अनुशंसित भर्तियां' : '3 Recommended Openings'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedVacancies.map((rel) => {
              const relLastDate = rel.importantDates?.applyLastDate || rel.yojanaOverview?.applyLastDate;
              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectOtherVacancy(rel)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-slate-50/60 transition cursor-pointer flex flex-col justify-between group shadow-2xs bg-white"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-amber-800 uppercase tracking-wider text-[11px]">
                        {rel.organization}
                      </span>
                      {rel.totalPosts && (
                        <span className="font-semibold text-slate-700 text-xs">
                          {typeof rel.totalPosts === 'number' ? `${rel.totalPosts.toLocaleString()} पद` : rel.totalPosts}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 group-hover:text-amber-800 line-clamp-2 text-sm sm:text-base leading-snug">
                      {isHi ? rel.titleHi : rel.title}
                    </h3>
                  </div>

                  {relLastDate && (
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>{isHi ? `अंतिम तिथि: ${relLastDate}` : `Last Date: ${relLastDate}`}</span>
                      </span>
                      <span className="text-amber-700 font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        <span>{isHi ? 'देखें' : 'View'}</span>
                        <span>→</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating WhatsApp Share Button */}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col items-end gap-2 animate-bounce">
        <button
          onClick={handleWhatsAppShare}
          className="group flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer font-bold text-sm border-2 border-white"
          title="Share this post on WhatsApp"
        >
          <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.587 1.93.9 3.013.9 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm9.969 5.766c0 5.503-4.466 9.969-9.969 9.969-1.758 0-3.411-.462-4.862-1.272l-5.169 1.355 1.38-5.044c-.902-1.503-1.418-3.262-1.418-5.008 0-5.503 4.466-9.969 9.969-9.969 5.503 0 9.969 4.466 9.969 9.969zm-5.719 3.82c-.22-.11-1.303-.643-1.505-.716-.202-.073-.349-.11-.496.11s-.57.716-.699.863c-.128.147-.257.165-.477.055-.22-.11-.93-.343-1.772-1.094-.655-.584-1.098-1.306-1.226-1.526-.128-.22-.014-.339.096-.448.099-.098.22-.257.33-.385.11-.128.147-.22.22-.367.073-.147.037-.275-.018-.385s-.496-1.193-.68-1.634c-.179-.43-.36-.372-.496-.379-.128-.007-.275-.008-.422-.008s-.385.055-.587.275c-.202.22-.771.753-.771 1.836s.789 2.129.899 2.276c.11.147 1.552 2.37 3.759 3.322.525.227.935.362 1.255.464.528.168 1.009.144 1.389.088.424-.063 1.303-.533 1.487-1.047.184-.514.184-.955.129-1.047-.056-.092-.203-.147-.423-.257z"/>
          </svg>
          <span className="inline sm:inline">
            {isHi ? 'WhatsApp चैनल ज्वाइन करें' : 'WhatsApp Channel'}
          </span>
        </button>
      </div>
    </article>
  );
};
