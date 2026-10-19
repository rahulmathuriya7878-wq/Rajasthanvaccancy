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
  User
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
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
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
  isAdmin = false,
  onOpenAdminLogin,
}) => {
  const isHi = lang === 'hi';
  const isScheme = vacancy.category === 'scheme' || vacancy.organization === 'Sarkari Yojana';
  const [copiedLink, setCopiedLink] = useState(false);

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
    const shareText = `${vacancy.title}\nकुल पद: ${vacancy.totalPosts}\nआवेदन अंतिम तिथि: ${vacancy.importantDates.applyLastDate}\nRAJASTHAN VACCANCY/JOBS पोर्टल पर पूरी जानकारी देखें:`;
    if (navigator.share) {
      navigator.share({
        title: vacancy.title,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
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

  const relatedVacancies = allVacancies
    .filter(v => v.id !== vacancy.id)
    .slice(0, 4);

  return (
    <article className="w-full max-w-4xl mx-auto space-y-6 text-slate-800 text-[20pt] post-content leading-relaxed">
      {/* Main Post Title Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        {/* Badges Bar & Admin Action */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
          <div className="flex items-center gap-2 flex-wrap">
            {vacancy.isHot && (
              <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-xs">
                HOT
              </span>
            )}
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs">
              {isHi ? 'सक्रिय अधिसूचना' : 'Active'}
            </span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>{isHi ? 'एडमिन मोड' : 'Admin Mode'}</span>
              </span>
            )}
          </div>

          {/* Edit / Update Button for Admin */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => onEditVacancy && onEditVacancy(vacancy)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm shadow-amber-600/30"
              title="Edit & Update Post Details"
            >
              <Edit3 className="w-4 h-4 text-amber-100" />
              <span>{isHi ? '✏️ पोस्ट अपडेट / सम्पादित करें' : '✏️ Edit & Update Post'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              title="Admin Login to Edit Post"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>{isHi ? 'एडमिन सम्पादन एक्सेस' : 'Admin Edit Access'}</span>
            </button>
          )}
        </div>

        {/* Post Heading - 22pt Font Size */}
        <h1 className="text-[22pt] font-bold text-slate-900 leading-snug">
          {isHi ? vacancy.titleHi : vacancy.title}
        </h1>

        {/* Post Meta */}
        <div className="text-slate-600 flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100 text-[16px]">
          <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold text-slate-800">{isHi && vacancy.departmentHi ? vacancy.departmentHi : vacancy.department}</span>
          <span>•</span>
          <span>{vacancy.jobLocation}</span>
          <span>•</span>
          <span>{isHi ? 'अपडेट' : 'Updated'}: {vacancy.updatedAt || vacancy.importantDates.notificationDate || vacancy.createdAt}</span>
        </div>

        {/* Detailed Information Box */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl text-slate-800 shadow-xs space-y-2">
          <p className="text-slate-800 text-[20px] leading-relaxed font-normal">
            {isScheme
              ? isHi
                ? `${vacancy.titleHi}: राजस्थान सरकार के ${vacancy.departmentHi || vacancy.department} द्वारा संचालित एक प्रमुख कल्याणकारी योजना है। इसके तहत राजकीय महाविद्यालयों एवं विश्वविद्यालयों में अध्ययनरत आरक्षित वर्गों (SC, ST, OBC, MBC एवं EWS) के नियमित छात्रों को किराए के कमरों/PG में रहने एवं भोजन हेतु ₹2,000/- प्रतिमाह (वर्ष में अधिकतम ₹20,000/-) की वित्तीय सहायता DBT के माध्यम से सीधे बैंक खाते में प्रदान की जाती है।`
                : `${vacancy.title}: A welfare scheme by ${vacancy.department} providing ₹2,000/month (up to ₹20,000/year) via DBT to eligible SC, ST, OBC, MBC, and EWS college students staying in rented rooms or PG for higher education.`
              : isHi 
              ? `${vacancy.titleHi} के अंतर्गत ${vacancy.organization} (${vacancy.departmentHi || vacancy.department}) द्वारा कुल ${vacancy.totalPosts || 'अनेक'} रिक्त पदों पर भर्ती हेतु ऑनलाइन आवेदन आमंत्रित किए गए हैं। योग्य एवं इच्छुक अभ्यर्थी राजस्थान सिंगल साइन ऑन (SSO) पोर्टल के माध्यम से निर्धारित अंतिम तिथि ${vacancy.importantDates.applyLastDate} तक अपना ऑनलाइन आवेदन पत्र सफलतापूर्वक प्रस्तुत कर सकते हैं। इस भर्ती से संबंधित विस्तृत आयु सीमा, शैक्षणिक योग्यता, आवेदन शुल्क, चयन प्रक्रिया एवं अन्य महत्वपूर्ण जानकारियां नीचे दी गई सारणी एवं विवरण में उपलब्ध हैं।`
              : `${vacancy.title} has been officially announced by ${vacancy.organization} (${vacancy.department}) for a total of ${vacancy.totalPosts || 'various'} vacancies. Eligible and interested candidates can submit their online applications through the Rajasthan SSO portal on or before the last date of ${vacancy.importantDates.applyLastDate}. Complete details regarding age limits, educational qualifications, application fees, and selection procedures are detailed below.`}
          </p>
        </div>
      </div>

      {/* Dedicated Yojana General Information Section (योजना क्या है? - सामान्य जानकारी) */}
      {isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
            <Info className="w-6 h-6 text-amber-600 shrink-0" />
            <h2 className="text-[26px] font-bold text-slate-900 leading-tight">
              {vacancy.yojanaGeneralInfo?.headingHi || `${vacancy.shortTitleHi || vacancy.postNameHi || 'योजना'} क्या है? (सामान्य जानकारी)`}
            </h2>
          </div>

          <div className="space-y-4 text-[20px] text-slate-800 leading-relaxed">
            <p className="bg-white p-4 rounded-lg border border-slate-200 text-slate-900 shadow-2xs">
              {vacancy.yojanaGeneralInfo?.descriptionHi || vacancy.descriptionHi}
            </p>

            {vacancy.yojanaGeneralInfo?.objectiveHi && (
              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                <span className="font-bold text-slate-950 block text-[20px]">🎯 योजना का मुख्य उद्देश्य:</span>
                <p className="text-slate-800">{vacancy.yojanaGeneralInfo.objectiveHi}</p>
              </div>
            )}

            {/* Overview Table for Yojana inserted directly after 'योजना का मुख्य उद्देश्य' */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden my-3">
              <div className="bg-white border-b border-slate-200 text-slate-900 px-5 py-3.5 flex items-center justify-between">
                <h2 className="text-[26px] font-bold flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-600 shrink-0" />
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
                  <tr className="bg-white text-slate-900 border-b border-slate-200 text-[20px]">
                    <th className="py-3.5 px-4 font-bold w-2/5 border-r border-slate-200 text-slate-900">
                      विवरण
                    </th>
                    <th className="py-3.5 px-4 font-bold text-slate-900">
                      जानकारी
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      योजना का नाम
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold text-amber-900">
                      {vacancy.yojanaOverview?.yojanaName || vacancy.postNameHi || vacancy.titleHi}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      राज्य
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.state || 'राजस्थान'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      संबंधित विभाग
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.department || vacancy.departmentHi || vacancy.department}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      शैक्षणिक सत्र
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.academicSession || '2025-26 / 2026-27'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      लाभार्थी
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.beneficiaries || vacancy.qualificationDetailsHi}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      मासिक सहायता
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {vacancy.yojanaOverview?.monthlyAssistance || vacancy.salaryHi || vacancy.salary}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      एक वर्ष में सहायता अवधि
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.durationPerYear || 'अधिकतम 10 माह'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      वार्षिक अधिकतम सहायता
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-800">
                      {vacancy.yojanaOverview?.maxAnnualAssistance || '₹20,000/- प्रति वर्ष'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      निर्धारित लाभार्थी संख्या
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold">
                      {vacancy.yojanaOverview?.totalBeneficiariesCount || vacancy.totalPosts}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      आवेदन शुरू
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {vacancy.yojanaOverview?.applyStartDate || vacancy.importantDates.notificationDate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      आवेदन की अंतिम तिथि
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-700">
                      {vacancy.yojanaOverview?.applyLastDate || vacancy.importantDates.applyLastDate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      आवेदन माध्यम
                    </td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">
                      {vacancy.yojanaOverview?.applyMode || 'ऑनलाइन (SSO Portal SJMS App)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                      भुगतान का माध्यम
                    </td>
                    <td className="py-3 px-4 text-emerald-800 font-medium">
                      {vacancy.yojanaOverview?.paymentMode || 'डायरेक्ट बेनिफिट ट्रांसफर (DBT)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
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
              <div className="bg-white p-4 rounded-lg border border-emerald-300 space-y-1 shadow-2xs">
                <span className="font-bold text-emerald-900 block text-[20px]">💰 वित्तीय सहायता राशि:</span>
                <p className="text-emerald-950 font-medium">{vacancy.yojanaGeneralInfo.benefitsSummaryHi}</p>
              </div>
            )}

            {vacancy.yojanaGeneralInfo?.keyPointsHi && vacancy.yojanaGeneralInfo.keyPointsHi.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-900 text-[20px]">📌 योजना की मुख्य बातें एवं बिंदु:</h3>
                <ul className="list-disc list-inside space-y-1.5 text-slate-800 pl-2">
                  {vacancy.yojanaGeneralInfo.keyPointsHi.map((pt, index) => (
                    <li key={index} className="leading-snug">
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
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <h2 className="text-[26px] font-bold text-slate-900 leading-tight">
              {vacancy.yojanaEligibility?.headingHi || `${vacancy.shortTitleHi || vacancy.postNameHi || 'योजना'} 2026 के लिए पात्रता (Eligibility Criteria)`}
            </h2>
          </div>

          <div className="space-y-4 text-[20px] text-slate-800 leading-relaxed">
            {/* Criteria List */}
            {vacancy.yojanaEligibility?.criteriaHi && vacancy.yojanaEligibility.criteriaHi.length > 0 ? (
              <div className="space-y-2.5">
                <h3 className="font-bold text-slate-900 text-[20px]">📋 अनिवार्य पात्रता मानदंड:</h3>
                <ul className="space-y-2">
                  {vacancy.yojanaEligibility.criteriaHi.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
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
              <div className="bg-white p-4 rounded-lg border border-amber-300 space-y-2 mt-3 shadow-2xs">
                <h3 className="font-bold text-slate-950 text-[20px]">👨‍👩‍👧‍👦 पारिवारिक वार्षिक आय सीमा (Annual Family Income Limit):</h3>
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
            <h2 className="text-[26px] font-bold flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-600 shrink-0" />
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
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white w-2/5 border-r border-slate-200">
                  {isHi ? 'भर्ती बोर्ड / विभाग का नाम' : 'Recruitment Organization'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">
                  {isHi && vacancy.departmentHi ? vacancy.departmentHi : vacancy.department} ({vacancy.organization})
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                  {isHi ? 'पद का नाम (Post Name)' : 'Post Name'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-semibold">
                  {isHi ? vacancy.postNameHi : vacancy.postName}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                  {isHi ? 'विज्ञापन संख्या (Advt No.)' : 'Advertisement Number'}
                </td>
                <td className="py-3 px-4 font-mono font-medium text-slate-900">
                  {vacancy.advtNo}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                  {isHi ? 'कुल रिक्त पद (Total Vacancies)' : 'Total Vacancies'}
                </td>
                <td className="py-3 px-4 font-bold text-emerald-700">
                  {typeof vacancy.totalPosts === 'number' ? `${vacancy.totalPosts.toLocaleString()} पद` : vacancy.totalPosts}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                  {isHi ? 'वेतनमान (Salary / Pay Scale)' : 'Salary / Pay Level'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">
                  {isHi && vacancy.salaryHi ? vacancy.salaryHi : vacancy.salary}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                  {isHi ? 'नौकरी का स्थान (Job Location)' : 'Job Location'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">
                  {vacancy.jobLocation}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                  {isHi ? 'आवेदन का प्रकार (Mode of Apply)' : 'Application Mode'}
                </td>
                <td className="py-3 px-4 text-blue-700 font-semibold">
                  {isHi ? 'ऑनलाइन (Online via SSO Portal)' : 'Online via Rajasthan SSO'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
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
            <h2 className="text-[26px] font-bold flex items-center gap-2 text-slate-900">
              <Calendar className="w-6 h-6 text-amber-600" />
              <span>{isHi ? 'महत्वपूर्ण तिथियां (Important Dates)' : 'Important Dates'}</span>
            </h2>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white w-2/5 border-r border-slate-200">
                  {isHi ? 'विज्ञप्ति जारी तिथि:' : 'Notification Date:'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">{vacancy.importantDates.notificationDate}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                  {isHi ? 'ऑनलाइन आवेदन प्रारंभ तिथि:' : 'Online Apply Start:'}
                </td>
                <td className="py-3 px-4 font-bold text-emerald-700">{vacancy.importantDates.applyStartDate}</td>
              </tr>
              <tr className="bg-white">
                <td className="py-3 px-4 font-bold text-rose-900 bg-white border-r border-slate-200">
                  {isHi ? 'आवेदन करने की अंतिम तिथि:' : 'Apply Last Date:'}
                </td>
                <td className="py-3 px-4 font-bold text-rose-700">{vacancy.importantDates.applyLastDate} (11:59 PM)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                  {isHi ? 'शुल्क भुगतान अंतिम तिथि:' : 'Fee Last Date:'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-medium">{vacancy.importantDates.feeLastDate || vacancy.importantDates.applyLastDate}</td>
              </tr>
              {vacancy.importantDates.examDate && (
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                    {isHi ? 'परीक्षा / लॉटरी तिथि:' : 'Exam / Lottery Date:'}
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-800">{vacancy.importantDates.examDate}</td>
                </tr>
              )}
              {vacancy.importantDates.admitCardDate && (
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200">
                    {isHi ? 'प्रवेश पत्र जारी तिथि:' : 'Admit Card Date:'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-700">{vacancy.importantDates.admitCardDate}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 4: Post Breakdown Box - Render only for Jobs (NOT for Scheme/Yojana) */}
      {!isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          {/* Title */}
          <h2 className="text-[26px] font-bold text-slate-900 leading-tight">
            {isHi 
              ? `${vacancy.titleHi || vacancy.title} में पदों का विवरण` 
              : `Post-Wise Vacancy Details for ${vacancy.title}`}
          </h2>

          {/* Subtitle text */}
          <p className="text-slate-800 text-[15px] sm:text-base leading-relaxed">
            {isHi 
              ? `इस भर्ती में चार अलग-अलग विषयों के लिए एक-एक TGT और एक मेस मैनेजर की नियुक्ति की जाएगी।`
              : `Under this recruitment, one TGT teacher for four different subjects and one Mess Manager will be appointed.`}
          </p>

          {/* Clean 3-Column Table matching screenshot */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-white text-slate-900 font-bold border-b border-slate-300">
                  <th className="py-3 px-4 border-r border-slate-300 font-bold text-[15px] w-1/2">
                    {isHi ? 'पद का नाम' : 'Post Name'}
                  </th>
                  <th className="py-3 px-4 border-r border-slate-300 font-bold text-[15px] text-center w-1/4">
                    {isHi ? 'श्रेणी' : 'Category'}
                  </th>
                  <th className="py-3 px-4 font-bold text-[15px] text-right w-1/4">
                    {isHi ? 'पदों की संख्या' : 'No. of Posts'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-[15px] text-slate-800">
                {(vacancy.postBreakdown && vacancy.postBreakdown.length > 0 ? vacancy.postBreakdown : [
                  { postNameHi: 'TGT गणित', postName: 'TGT Mathematics', categoryOrSubjectHi: 'OBC', categoryOrSubject: 'OBC', postsCount: 1 },
                  { postNameHi: 'TGT विज्ञान', postName: 'TGT Science', categoryOrSubjectHi: 'SC', categoryOrSubject: 'SC', postsCount: 1 },
                  { postNameHi: 'TGT अंग्रेजी', postName: 'TGT English', categoryOrSubjectHi: 'OBC', categoryOrSubject: 'OBC', postsCount: 1 },
                  { postNameHi: 'TGT कंप्यूटर साइंस', postName: 'TGT Computer Science', categoryOrSubjectHi: 'ST', categoryOrSubject: 'ST', postsCount: 1 },
                  { postNameHi: 'मेस मैनेजर', postName: 'Mess Manager', categoryOrSubjectHi: 'अनारक्षित, UR', categoryOrSubject: 'Unreserved (UR)', postsCount: 1 },
                ]).map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-3 px-4 border-r border-slate-300 font-medium text-slate-900">
                      {isHi ? item.postNameHi : item.postName}
                    </td>
                    <td className="py-3 px-4 border-r border-slate-300 text-center font-medium">
                      {isHi ? (item.categoryOrSubjectHi || item.categoryOrSubject || 'अनारक्षित') : (item.categoryOrSubject || 'UR')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {item.postsCount}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-white font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3 px-4 border-r border-slate-300 font-bold">
                    {isHi ? 'कुल' : 'Total'}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-300"></td>
                  <td className="py-3 px-4 text-right font-black text-amber-800">
                    {typeof vacancy.totalPosts === 'number' ? vacancy.totalPosts : 5}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 5: Educational Qualification & Eligibility - Render only for Jobs (NOT for Scheme/Yojana) */}
      {!isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-5">
          <h2 className="text-[26px] font-bold text-slate-900 border-b border-slate-200 pb-3">
            {isHi ? 'आवेदन के लिए शैक्षणिक योग्यता' : 'Educational Qualification for Application'}
          </h2>

          {/* Post-wise Eligibility Sections matching exact screenshot formatting */}
          <div className="space-y-6 text-slate-800 text-[15px] sm:text-base leading-relaxed">
            {/* TGT Math & TGT English */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {isHi ? 'TGT गणित और TGT अंग्रेजी' : 'TGT Mathematics & TGT English'}
              </h3>
              <p>
                {isHi 
                  ? 'अभ्यर्थी के पास संबंधित विषय में नीचे दिए गए विकल्पों में से निर्धारित योग्यता होनी चाहिए:' 
                  : 'Candidates must possess the prescribed qualification from the options below in the relevant subject:'}
              </p>

              <ul className="list-disc pl-6 space-y-2 text-slate-800">
                <li>
                  {isHi 
                    ? 'NCTE से मान्यता प्राप्त संस्थान या विश्वविद्यालय से चार वर्षीय एकीकृत डिग्री, जिसमें B.Ed. शामिल हो। संबंधित विषय और कुल अंकों में कम से कम 50 प्रतिशत अंक आवश्यक हैं।'
                    : '4-year integrated degree from an NCTE recognized institution or university including B.Ed. Minimum 50% marks required in the concerned subject and aggregate.'}
                </li>
                <li>
                  {isHi 
                    ? 'अथवा मान्यता प्राप्त विश्वविद्यालय से संबंधित विषय, विषय संयोजन और कुल अंकों में कम से कम 50 प्रतिशत के साथ स्नातक या ऑनर्स डिग्री तथा NCTE से मान्यता प्राप्त संस्थान से कम से कम 50 प्रतिशत अंकों के साथ B.Ed.।'
                    : 'OR Bachelor\'s / Honours degree from a recognized university with at least 50% marks in the concerned subject, subject combination and aggregate, and B.Ed. with at least 50% marks from an NCTE recognized institute.'}
                </li>
              </ul>

              <p className="font-medium text-slate-900">
                {isHi 
                  ? 'इसके साथ CTET पेपर-II उत्तीर्ण होना और अंग्रेजी माध्यम में पढ़ाने की दक्षता आवश्यक है। गणित पद के लिए संबंधित विषय गणित और अंग्रेजी पद के लिए अंग्रेजी होना चाहिए।'
                  : 'Along with this, passing CTET Paper-II and proficiency in teaching through English medium is required. The relevant subject must be Mathematics for the Math post and English for the English post.'}
              </p>

              <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 text-sm">
                {isHi 
                  ? 'संबंधित विषय में स्नातकोत्तर योग्यता, अंग्रेजी माध्यम के आवासीय विद्यालय में अध्यापन अनुभव, खेल एवं सह-पाठ्यक्रम गतिविधियों में दक्षता और कंप्यूटर एप्लीकेशन का ज्ञान वांछनीय हैं।'
                  : 'Desirable: Postgraduate qualification in the subject, teaching experience in English medium residential school, proficiency in sports & co-curricular activities, and knowledge of computer applications.'}
              </p>
            </div>

            {/* TGT Science */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {isHi ? 'TGT विज्ञान' : 'TGT Science'}
              </h3>
              <p>
                {isHi 
                  ? 'मान्यता प्राप्त विश्वविद्यालय से भौतिकी, रसायन विज्ञान तथा वनस्पति विज्ञान / प्राणीशास्त्र विषयों के साथ कम से कम 50% अंकों में B.Sc. तथा NCTE मान्यता प्राप्त संस्थान से B.Ed.। CTET Paper-II (Science) उत्तीर्ण होना अनिवार्य है।'
                  : 'B.Sc. with Physics, Chemistry and Botany / Zoology subjects with at least 50% marks from a recognized university and B.Ed. from NCTE recognized institute. CTET Paper-II is mandatory.'}
              </p>
            </div>

            {/* TGT Computer Science */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {isHi ? 'TGT कंप्यूटर साइंस' : 'TGT Computer Science'}
              </h3>
              <p>
                {isHi 
                  ? 'मान्यता प्राप्त विश्वविद्यालय से न्यूनतम 50% अंकों के साथ B.E. / B.Tech (Computer Science / IT) अथवा BCA / B.Sc (Computer Science) अथवा M.Sc (Computer Science) / MCA डिग्री उत्तीर्ण।'
                  : 'B.E. / B.Tech (Computer Science / IT) or BCA / B.Sc (Computer Science) or M.Sc (Computer Science) / MCA degree with at least 50% marks from a recognized university.'}
              </p>
            </div>

            {/* Mess Manager */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {isHi ? 'मेस मैनेजर (Mess Manager)' : 'Mess Manager'}
              </h3>
              <p>
                {isHi 
                  ? 'मान्यता प्राप्त संस्था से कैटरिंग / हॉस्पिटैलिटी मैनेजमेंट में स्नातक डिग्री अथवा 10वीं पास के साथ किसी प्रतिष्ठित सरकारी या आवासीय विद्यालय हॉस्टल मेस में न्यूनतम 5 वर्ष का कार्य अनुभव।'
                  : 'Degree / Diploma in Catering / Hospitality Management from a recognized institute or 10th Pass with minimum 5 years working experience in a reputed government or residential school hostel mess.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200">
            <span className="font-bold text-slate-700">{isHi ? 'पात्र स्तर:' : 'Eligible Levels:'}</span>
            {vacancy.qualification.map((q) => (
              <span key={q} className="bg-white text-slate-800 font-semibold px-2.5 py-1 rounded border border-slate-200 text-xs">
                {q}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Section 6: Age Limit & Relaxation Rules - Render only for Jobs (NOT for Scheme/Yojana) */}
      {!isScheme && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[26px] font-bold text-slate-900 border-b border-slate-200 pb-3">
            {isHi ? 'आयु सीमा (Age Limit Details)' : 'Age Limit Details'}
          </h2>

          <p className="text-slate-800 text-[20px] leading-relaxed">
            {isHi 
              ? `आवेदकों की आयु की गणना ऑनलाइन आवेदन जमा करने की अंतिम तिथि ${vacancy.importantDates.applyLastDate || vacancy.ageLimit.asOnDate} को आधार मानकर की जाएगी।`
              : `The age of applicants will be calculated as on the last date of application submission (${vacancy.importantDates.applyLastDate || vacancy.ageLimit.asOnDate}).`}
          </p>

          {/* Post-wise Age Limit Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-white text-slate-900 font-bold border-b border-slate-300">
                  <th className="py-3 px-4 border-r border-slate-300 font-bold text-[20px] w-1/2">
                    {isHi ? 'पद का नाम' : 'Post Name'}
                  </th>
                  <th className="py-3 px-4 border-r border-slate-300 font-bold text-[20px] text-center w-1/4">
                    {isHi ? 'न्यूनतम आयु' : 'Minimum Age'}
                  </th>
                  <th className="py-3 px-4 font-bold text-[20px] text-center w-1/4">
                    {isHi ? 'अधिकतम आयु' : 'Maximum Age'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-[20px] text-slate-800">
                <tr className="bg-white">
                  <td className="py-3 px-4 border-r border-slate-300 font-medium text-slate-900">
                    {isHi ? 'TGT शिक्षक (गणित / अंग्रेजी / विज्ञान / कंप्यूटर साइंस)' : 'TGT Teachers (Math / English / Science / Computer)'}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-300 text-center font-bold text-slate-900">
                    21 वर्ष
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    35 वर्ष
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-3 px-4 border-r border-slate-300 font-medium text-slate-900">
                    {isHi ? 'मेस मैनेजर (Mess Manager)' : 'Mess Manager'}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-300 text-center font-bold text-slate-900">
                    18 वर्ष
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    50 वर्ष
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-3 px-4 border-r border-slate-300 font-medium text-slate-900">
                    {isHi ? 'अन्य प्रशासनिक एवं चतुर्थ श्रेणी पद' : 'Other Administrative & Support Posts'}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-300 text-center font-bold text-slate-900">
                    18 वर्ष
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    40 वर्ष
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Government Relaxation Rules Note */}
          <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-2 text-slate-900">
            <p className="font-bold text-[20px]">
              {isHi ? 'आरक्षित श्रेणियों हेतु आयु सीमा में ऊपरी छूट (Age Relaxation Rules):' : 'Upper Age Relaxation Rules:'}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[20px] text-slate-800">
              <li>{isHi ? 'राजस्थान के मूल निवासी OBC / EWS / MBC पुरुष अभ्यर्थियों को: 5 वर्ष की छूट' : 'OBC / EWS / MBC Male Candidates: 5 Years Relaxation'}</li>
              <li>{isHi ? 'राजस्थान के मूल निवासी SC / ST पुरुष अभ्यर्थियों को: 5 वर्ष की छूट' : 'SC / ST Male Candidates: 5 Years Relaxation'}</li>
              <li>{isHi ? 'सामान्य एवं अनारक्षित वर्ग की महिला अभ्यर्थियों को: 5 वर्ष की छूट' : 'General Female Candidates: 5 Years Relaxation'}</li>
              <li>{isHi ? 'राजस्थान की आरक्षित वर्ग (SC/ST/OBC/EWS) की महिला अभ्यर्थियों को: 10 वर्ष की छूट' : 'Reserved Category Female Candidates: 10 Years Relaxation'}</li>
              <li>{isHi ? 'भूतपूर्व सैनिक एवं नियमानुसार अन्य पात्र श्रेणी अभ्यर्थियों को सरकारी नियमानुसार अधिकतम आयु में छूट प्रदान की जाएगी।' : 'Ex-servicemen & other eligible categories will get relaxation as per Govt rules.'}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Benefit / Salary Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        {/* Title */}
        <h2 className="text-[26px] font-bold text-slate-900 leading-tight">
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
          <table className="w-full text-left border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-white text-slate-900 font-bold border-b border-slate-300">
                <th className="py-3 px-4 border-r border-slate-300 font-bold text-[15px] w-1/3">
                  {isHi ? (isScheme ? 'योजना का नाम' : 'पद') : 'Post / Scheme'}
                </th>
                <th className="py-3 px-4 border-r border-slate-300 font-bold text-[15px] text-center w-1/3">
                  {isHi ? (isScheme ? 'लाभ का प्रकार' : 'पे मैट्रिक्स लेवल') : 'Type'}
                </th>
                <th className="py-3 px-4 font-bold text-[15px] text-center w-1/3">
                  {isHi ? (isScheme ? 'योजना के लाभ / सहायता राशि' : 'वेतनमान') : 'Amount'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[15px] text-slate-800">
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
                  <td className="py-3 px-4 border-r border-slate-300 font-medium text-slate-900">
                    {isHi ? item.postNameHi : item.postName}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-300 text-center font-medium text-slate-900">
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

        {/* Salary explanatory notes matching screenshot */}
        <div className="space-y-3 text-slate-800 text-[15px] sm:text-base leading-relaxed pt-2">
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
                  ? <>विज्ञापन के अनुसार सातवें वेतन आयोग के पे मैट्रिक्स के साथ सैनिक स्कूल्स सोसाइटी के नियमों के अनुसार महंगाई भत्ता और अन्य भत्ते लागू होंगे। ऊपर दी गई राशि <strong>वेतनमान</strong> है; इसे निश्चित इन-हैंड सैलरी नहीं माना जाए।</>
                  : <>As per the advertisement, DA and other allowances will be applicable according to 7th Pay Commission pay matrix and Sainik Schools Society rules. The amount shown above is the pay scale; it should not be considered fixed in-hand salary.</>}
              </p>

              <p>
                {isHi 
                  ? 'चयनित अभ्यर्थियों की परिवीक्षा अवधि एक वर्ष होगी जिसे दो वर्ष तक बढ़ाया जा सकता है। उपलब्ध होने पर परिसर में किराया-मुक्त आवास दिया जाएगा और आवंटित परिसर आवास में रहना अनिवार्य होगा।'
                  : 'The probation period for selected candidates will be one year, which can be extended up to two years. Subject to availability, rent-free accommodation in the campus will be provided, and staying in the allotted campus accommodation will be mandatory.'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Section 7: Selection Process (चयन / सत्यापन प्रक्रिया) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-[26px] font-bold text-slate-900 leading-tight">
          {isHi ? (isScheme ? 'चयन एवं सत्यापन प्रक्रिया' : 'चयन प्रक्रिया') : 'Selection Process'}
        </h2>

        <p className="text-slate-800 text-[15px] sm:text-base leading-relaxed">
          {isHi 
            ? (isScheme ? 'आवेदन जमा करने के बाद संबंधित राजकीय कॉलेज एवं विभाग द्वारा ऑनलाइन सत्यापन किया जाएगा। प्रक्रिया निम्न चरणों में संपन्न होगी:' : 'आवेदन और आवश्यक योग्यता की जांच के बाद पात्र अभ्यर्थियों को शॉर्टलिस्ट किया जाएगा। चयन परीक्षण में पद के अनुसार निम्न चरण शामिल होंगे:') 
            : 'Selection and verification process includes the following steps:'}
        </p>

        {/* Numbered List */}
        <ol className="list-decimal pl-8 space-y-2 text-slate-900 text-[15px] sm:text-base font-medium">
          {(isHi ? (vacancy.selectionProcessHi && vacancy.selectionProcessHi.length > 0 ? vacancy.selectionProcessHi : [
            'लिखित परीक्षा।',
            'क्लास डेमोंस्ट्रेशन, जहां लागू हो।',
            'प्रवीणता या स्किल टेस्ट, जहां लागू हो।',
            'इंटरव्यू।'
          ]) : (vacancy.selectionProcess && vacancy.selectionProcess.length > 0 ? vacancy.selectionProcess : [
            'Written Examination',
            'Class Demonstration (where applicable)',
            'Proficiency or Skill Test (where applicable)',
            'Interview'
          ])).map((step, idx) => (
            <li key={idx} className="pl-1">
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
        <h2 className="text-[26px] font-bold text-slate-900 border-b border-slate-200 pb-2.5">
          {isHi ? 'आवेदन के साथ आवश्यक दस्तावेज' : 'Required Documents for Application'}
        </h2>

        <p className="text-slate-800 text-[20px] leading-relaxed font-normal">
          {isHi 
            ? 'आवेदन में दी गई जानकारी के समर्थन में स्पष्ट और स्वप्रमाणित प्रतियां संलग्न करें:' 
            : 'Attach clear and self-attested copies in support of the information provided in the application:'}
        </p>

        <ul className="space-y-2.5 pl-1 pt-1">
          {documentsList.map((doc, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-800 text-[20px] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0 mt-2.5"></span>
              <span>{doc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 9: Step-by-Step How to Apply */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        <h2 className="text-[26px] font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <span>{isHi ? 'ऑनलाइन आवेदन कैसे करें - स्टेप बाय स्टेप गाइड (How to Apply Online)' : 'Step-by-Step Online Application Guide'}</span>
        </h2>

        <div className="space-y-2.5">
          {howToApplySteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-slate-200">
              <span className="w-7 h-7 rounded bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                {idx + 1}
              </span>
              <p className="font-medium pt-0.5 text-slate-900 text-[20px] leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 10: Useful Important Links Table - Matching Screenshot */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-5 py-4">
          <h2 className="text-[26px] font-bold text-slate-900 leading-tight">
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
                  <td className="py-3.5 px-4 font-bold text-slate-900 bg-white w-1/2 border-r border-slate-200">
                    {`Start ${vacancy.shortTitle || vacancy.title} form`}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {vacancy.importantDates.applyStartDate || '17 October 2026'}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900 bg-white border-r border-slate-200">
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
              <td className="py-3.5 px-4 font-bold text-slate-900 bg-white border-r border-slate-200">
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
                <td className="py-3.5 px-4 font-bold text-slate-900 bg-white border-r border-slate-200">
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

            {/* Row 5: Official Website Portal */}
            <tr>
              <td className="py-3.5 px-4 font-bold text-slate-900 bg-white border-r border-slate-200">
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
              <td className="py-3.5 px-4 font-bold text-slate-900 bg-white border-r border-slate-200">
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

      {/* Section 11: Frequently Asked Questions (FAQ) - Matching Screenshot */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-[26px] font-bold text-slate-900 leading-tight border-b border-slate-200 pb-3">
          {isHi ? `${vacancy.shortTitleHi || vacancy.titleHi || vacancy.title} FAQs` : `${vacancy.title} FAQs`}
        </h2>

        <div className="space-y-4 pt-1">
          {faqItems.map((faq, idx) => (
            <div key={idx} className="space-y-1.5 pb-3.5 border-b border-slate-200 last:border-0 last:pb-0">
              <h3 className="font-bold text-slate-900 text-[20px] leading-snug">
                {isHi ? faq.qHi : faq.q}
              </h3>
              <p className="text-slate-800 text-[20px] leading-relaxed font-normal">
                {isHi ? faq.aHi : faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 12: Other Related Vacancies */}
      {relatedVacancies.length > 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
          <h3 className="text-[26px] font-bold text-slate-900 pb-2 border-b border-slate-200">
            {isHi ? 'अन्य प्रमुख सरकारी भर्तियां (Other Related Vacancies)' : 'Other Related Vacancies'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedVacancies.map((rel) => (
              <button
                key={rel.id}
                onClick={() => onSelectOtherVacancy(rel)}
                className="text-left p-3.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition flex items-start gap-2.5 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 hover:text-amber-800 line-clamp-1 text-[18px]">
                    {isHi ? rel.titleHi : rel.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {rel.organization} • {rel.importantDates.applyLastDate}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section 13: Any Doubt / Q&A Section - Matching Screenshot Design */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-[26px] font-bold text-slate-900 leading-tight flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-amber-600 shrink-0" />
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
    </article>
  );
};
