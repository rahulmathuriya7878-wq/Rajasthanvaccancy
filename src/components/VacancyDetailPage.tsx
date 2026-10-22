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
  HelpCircle,
  FileText
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
  isAlertSet = false,
  onToggleAlertMe,
}) => {
  const isHi = lang === 'hi';
  const postTitle = isHi ? (vacancy.titleHi || vacancy.title) : vacancy.title;
  const shortJobName = vacancy.shortTitleHi || vacancy.shortTitle || postTitle.split(':')[0] || 'भर्ती 2026';

  const [copiedLink, setCopiedLink] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

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

  const handleShare = () => {
    const cleanId = vacancy.id.replace(/^\//, '').replace(/\/$/, '');
    const websiteUrl = `${window.location.origin}/${cleanId}/`;
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
    const cleanId = vacancy.id.replace(/^\//, '').replace(/\/$/, '');
    const websiteUrl = `${window.location.origin}/${cleanId}/`;
    const shareText = generateHindiShareText(vacancy, websiteUrl);
    const message = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
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
    <div className="w-full bg-[#f7f8f9] text-[#222222] py-4 sm:py-6">


      {/* Main 2-Column WordPress GeneratePress Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Main Article Content Area (70% on Desktop) */}
          <main className="w-full lg:w-[70%] min-w-0">
            <article 
              className="bg-white rounded-md p-5 sm:p-8 border border-slate-200 shadow-2xs"
              style={{ border: '1px solid #cbd5e1' }}
            >
              {/* Admin Actions Bar (when admin is active) */}
              {isAdmin && (
                <div className="mb-4 p-2.5 bg-slate-100 rounded border border-slate-300 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>एडमिन कंट्रोल्स (Admin)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onEditVacancy && (
                      <button
                        type="button"
                        onClick={() => onEditVacancy(vacancy)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>संशोधित करें</span>
                      </button>
                    )}
                    {onDeleteVacancy && (
                      <button
                        type="button"
                        onClick={() => onDeleteVacancy(vacancy.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white rounded font-bold hover:bg-rose-700 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>डिलीट</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Entry Header */}
              <header className="entry-header border-b border-slate-200 pb-4 mb-5">
                <h1 
                  className="entry-title headlight font-bold text-slate-900 tracking-tight leading-snug"
                  style={{
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                    fontSize: '12pt',
                    lineHeight: 1.4
                  }}
                >
                  {postTitle}
                </h1>

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
                    by <span className="font-bold text-slate-800">RajasthanVacancy</span>
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
                      {vacancy.department || vacancy.organization}
                    </span>
                    <h2 
                      className="headlight text-lg sm:text-xl font-bold text-white tracking-wide"
                      style={{ color: '#ffffff', fontSize: '12pt' }}
                    >
                      {shortJobName}
                    </h2>
                    <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                      {isHi ? 'विस्तृत विज्ञापन, शैक्षणिक योग्यता, आयु सीमा एवं चयन प्रक्रिया' : 'Detailed Notification, Eligibility & Application Guide'}
                    </p>
                  </div>

                  {vacancy.totalPosts && (
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-center shrink-0 backdrop-blur-xs">
                      <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                        {isHi ? 'कुल पद / सीटें' : 'Total Posts'}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-amber-300">
                        {vacancy.totalPosts}
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
                    <strong>{postTitle}:</strong> {vacancy.briefSummaryHi || `${vacancy.organization} द्वारा आधिकारिक नोटिफिकेशन जारी कर दिया गया है। इसके अंतर्गत कुल ${vacancy.totalPosts || 'विभिन्न'} पदों पर भर्ती हेतु योग्य अभ्यर्थियों से ऑनलाइन आवेदन आमंत्रित किए गए हैं।`}
                  </p>
                  <p className="post-item">
                    {isHi 
                      ? `इस भर्ती के लिए ऑनलाइन आवेदन निर्धारित तिथि से प्रारंभ हो चुके हैं। इच्छुक व पात्र अभ्यर्थी निर्धारित अंतिम तिथि ${vacancy.importantDates?.applyLastDate || 'अंतिम तिथि'} तक आधिकारिक वेबसाइट पर जाकर ऑनलाइन आवेदन कर सकते हैं। भर्ती से संबंधित विस्तृत विवरण जैसे शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, चयन प्रक्रिया और महत्वपूर्ण तिथियां नीचे दी गई हैं।`
                      : `Online applications are invited for eligible candidates. The last date to submit the application form is ${vacancy.importantDates?.applyLastDate}. Check the detailed overview, eligibility criteria, application fee, and direct links below.`}
                  </p>
                </div>

                {/* Table 1: का संक्षिप्त विवरण (Quick Overview Table) */}
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-3 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    {shortJobName} का संक्षिप्त विवरण
                  </h2>
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
                          <td className="p-3">{vacancy.department || vacancy.organization}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">भर्ती का नाम</td>
                          <td className="p-3">{shortJobName}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">विज्ञापन संख्या</td>
                          <td className="p-3">{vacancy.advtNo || 'विज्ञप्ति अनुसार'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">घोषित कुल पद / सीटें</td>
                          <td className="p-3 font-bold text-emerald-800">{vacancy.totalPosts || 'विभिन्न पद'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">नोटिफिकेशन तिथि</td>
                          <td className="p-3">{vacancy.importantDates?.notificationDate || 'अक्टूबर 2026'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">आवेदन शुरू</td>
                          <td className="p-3">{vacancy.importantDates?.applyStartDate || 'शुरू हो चुके हैं'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">आवेदन की अंतिम तिथि</td>
                          <td className="p-3 font-bold text-rose-700">{vacancy.importantDates?.applyLastDate || 'शीघ्र देखें'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">आवेदन का माध्यम</td>
                          <td className="p-3">ऑनलाइन (Online Portal)</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">शैक्षणिक योग्यता</td>
                          <td className="p-3">{vacancy.qualificationDetailsHi || vacancy.qualificationDetails || 'पद अनुसार 10वीं / 12वीं / स्नातक / ITI पास'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">वेतनमान / पे-मैट्रिक्स</td>
                          <td className="p-3">{vacancy.salaryHi || vacancy.salary || 'पे-मैट्रिक्स नियमानुसार देय'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800 bg-slate-50 border-r border-slate-200">आधिकारिक वेबसाइट</td>
                          <td className="p-3 text-blue-700 font-semibold underline">
                            <a href={vacancy.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in'} target="_blank" rel="noopener noreferrer">
                              {vacancy.officialLinks?.officialWebsiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'rajasthan.gov.in'}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section: Latest Update */}
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-2 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    {shortJobName} Latest Update
                  </h2>
                  <p className="post-item">
                    {vacancy.descriptionHi || vacancy.briefSummaryHi || `${vacancy.organization} द्वारा भर्ती का विस्तृत विज्ञापन जारी किया गया है। इच्छुक अभ्यर्थी आवेदन शुरू होने से पहले अपनी पात्रता जाँचकर सभी आवश्यक दस्तावेज तैयार कर लें।`}
                  </p>
                </div>

                {/* Table 2: महत्वपूर्ण तिथियाँ (Important Dates Table) */}
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-3 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    महत्वपूर्ण तिथियाँ (Important Dates)
                  </h2>
                  <div className="overflow-x-auto border border-slate-300 rounded-md">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300">
                          <th className="p-3 font-bold text-slate-900 border-r border-slate-300 w-1/2">कार्यक्रम</th>
                          <th className="p-3 font-bold text-slate-900">तिथि</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-3 font-medium text-slate-800 bg-slate-50 border-r border-slate-200">नोटिफिकेशन जारी तिथि</td>
                          <td className="p-3">{vacancy.importantDates?.notificationDate || '21 अक्टूबर 2026'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-800 bg-slate-50 border-r border-slate-200">ऑनलाइन आवेदन शुरू</td>
                          <td className="p-3 font-semibold text-emerald-700">{vacancy.importantDates?.applyStartDate || '23 अक्टूबर 2026'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-800 bg-slate-50 border-r border-slate-200">ऑनलाइन आवेदन की अंतिम तिथि</td>
                          <td className="p-3 font-bold text-rose-700">{vacancy.importantDates?.applyLastDate || '22 नवंबर 2026'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-800 bg-slate-50 border-r border-slate-200">आवेदन बंद होने का समय</td>
                          <td className="p-3">रात 11:59 बजे तक</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-800 bg-slate-50 border-r border-slate-200">परीक्षा / मेरिट सत्यापन तिथि</td>
                          <td className="p-3">{vacancy.importantDates?.examDate || 'आधिकारिक वेबसाइट पर शीघ्र जारी होगी'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table 3: पदों का विवरण (Post Breakdown) if available */}
                {vacancy.postBreakdown && vacancy.postBreakdown.length > 0 && (
                  <div>
                    <h2 
                      className="headlight font-bold text-slate-900 mb-3 pt-2"
                      style={{ 
                        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                        fontSize: '12pt',
                        color: '#0f172a'
                      }}
                    >
                      {shortJobName} पदों / सीटों का विवरण
                    </h2>
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
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-3 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    {shortJobName} शैक्षणिक योग्यता
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                    <li>मान्यता प्राप्त बोर्ड या संस्थान से संबंधित शैक्षणिक परीक्षा उत्तीर्ण हो।</li>
                    <li>{vacancy.qualificationDetailsHi || vacancy.qualificationDetails || '10वीं / 12वीं / स्नातक अथवा संबंधित विषय में आवश्यक डिग्री/डिप्लोमा।'}</li>
                    <li>आवेदन जमा करने की अंतिम तिथि तक सभी आवश्यक शैक्षणिक एवं तकनीकी योग्यता पूर्ण होनी चाहिए।</li>
                    <li>विस्तृत एवं पदवार शैक्षणिक योग्यता की जानकारी आधिकारिक नोटिफिकेशन से प्राप्त करें।</li>
                  </ul>
                </div>

                {/* Section 5: आयु सीमा (Age Limit) & Table */}
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-3 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    आयु सीमा (Age Limit)
                  </h2>
                  <p className="post-item mb-3">
                    अभ्यर्थी की न्यूनतम आयु <strong>{vacancy.ageLimit?.min || 18} वर्ष</strong> तथा अधिकतम आयु <strong>{vacancy.ageLimit?.max || 40} वर्ष</strong> निर्धारित की गई है। आयु की गणना {vacancy.ageLimit?.asOnDate || '2026'} को आधार मानकर की जाएगी। आरक्षित वर्गों को नियमानुसार अधिकतम आयु सीमा में छूट देय होगी।
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

                {/* Section 6: आवेदन शुल्क (Application Fee) Table */}
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-3 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    आवेदन शुल्क (Application Fee)
                  </h2>
                  <div className="overflow-x-auto border border-slate-300 rounded-md">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300">
                          <th className="p-3 font-bold text-slate-900 border-r border-slate-300 w-1/2">अभ्यर्थी श्रेणी</th>
                          <th className="p-3 font-bold text-slate-900">आवेदन शुल्क</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-3 bg-slate-50 border-r border-slate-200">सामान्य / ओबीसी / ईडब्ल्यूएस (Gen / OBC / EWS)</td>
                          <td className="p-3 font-bold text-slate-900">
                            {vacancy.applicationFee?.genObc ? `₹${vacancy.applicationFee.genObc}` : '₹100 (या नियमानुसार)'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 bg-slate-50 border-r border-slate-200">अनुसूचित जाति / अनुसूचित जनजाति (SC / ST)</td>
                          <td className="p-3 font-bold text-emerald-700">
                            {vacancy.applicationFee?.scSt ? `₹${vacancy.applicationFee.scSt}` : 'निःशुल्क'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 bg-slate-50 border-r border-slate-200">सभी वर्गों की महिला एवं दिव्यांग अभ्यर्थी</td>
                          <td className="p-3 font-bold text-emerald-700">निःशुल्क</td>
                        </tr>
                        <tr>
                          <td className="p-3 bg-slate-50 border-r border-slate-200">भुगतान का माध्यम</td>
                          <td className="p-3">ऑनलाइन (नेट बैंकिंग, डेबिट/क्रेडिट कार्ड, UPI)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 7: चयन प्रक्रिया (Selection Process) */}
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-3 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    चयन प्रक्रिया और मेरिट की गणना
                  </h2>
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

                {/* In-article Ad Section */}
                <div className="my-4">
                  <AdSection 
                    client="ca-pub-8302542447035711"
                    slot="3785509362"
                    label={isHi ? 'विज्ञापन' : 'Advertisement'}
                  />
                </div>

                {/* Section 8: आवेदन के लिए आवश्यक दस्तावेज (Required Documents) */}
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-3 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    आवेदन के लिए आवश्यक दस्तावेज
                  </h2>
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

                {/* Section 9: आवेदन कैसे करें (How to Apply Step-by-Step) */}
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-3 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    {shortJobName} के लिए आवेदन कैसे करें?
                  </h2>
                  <ol className="list-decimal pl-5 space-y-2 text-slate-800">
                    {howToApplySteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Table 10: Important Links Table */}
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-3 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    {shortJobName} Important Links
                  </h2>
                  <div className="overflow-x-auto border-2 border-slate-300 rounded-md">
                    <table className="w-full border-collapse text-left text-sm">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200 w-1/2">
                            Start Online Application Form
                          </td>
                          <td className="p-3 font-extrabold text-slate-800">
                            {vacancy.importantDates?.applyStartDate || '23 October 2026'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                            Last Date Online Application Form
                          </td>
                          <td className="p-3 font-extrabold text-rose-700">
                            {vacancy.importantDates?.applyLastDate || '22 November 2026'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                            Apply Online
                          </td>
                          <td className="p-3">
                            <a 
                              href={vacancy.officialLinks?.applyOnlineUrl || vacancy.officialLinks?.officialWebsiteUrl || 'https://sso.rajasthan.gov.in'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-1.5 rounded bg-[#1e953a] hover:bg-[#187a2f] text-white font-extrabold text-xs transition shadow-2xs"
                            >
                              Apply Now
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                            Official Notification PDF
                          </td>
                          <td className="p-3">
                            <a 
                              href={vacancy.officialLinks?.notificationPdfUrl || vacancy.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-1.5 rounded bg-[#cf2e2e] hover:bg-[#a82222] text-white font-extrabold text-xs transition shadow-2xs"
                            >
                              Click Here
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                            Official Website
                          </td>
                          <td className="p-3">
                            <a 
                              href={vacancy.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-1.5 rounded bg-[#1e73be] hover:bg-[#155a96] text-white font-extrabold text-xs transition shadow-2xs"
                            >
                              Click Here
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 11: FAQs Section (Rank Math FAQ format) */}
                <div>
                  <h2 
                    className="headlight font-bold text-slate-900 mb-3 pt-2"
                    style={{ 
                      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      fontSize: '12pt',
                      color: '#0f172a'
                    }}
                  >
                    {shortJobName} FAQs
                  </h2>
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

                {/* Post Navigation: Previous & Next Post Links */}
                <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                  {prevPost ? (
                    <button
                      type="button"
                      onClick={() => onSelectOtherVacancy(prevPost)}
                      className="text-left p-3 rounded border border-slate-200 hover:border-[#1e953a] hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1 group-hover:text-[#1e953a]">
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous Post</span>
                      </span>
                      <p className="post-item font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-[#1e953a] line-clamp-2 mt-1">
                        {isHi ? (prevPost.titleHi || prevPost.title) : prevPost.title}
                      </p>
                    </button>
                  ) : <div />}

                  {nextPost ? (
                    <button
                      type="button"
                      onClick={() => onSelectOtherVacancy(nextPost)}
                      className="text-right p-3 rounded border border-slate-200 hover:border-[#1e953a] hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-end gap-1 group-hover:text-[#1e953a]">
                        <span>Next Post</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                      <p className="post-item font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-[#1e953a] line-clamp-2 mt-1">
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
                  href="https://whatsapp.com/channel/0029Va4UN8U29757sLNagO25"
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
    </div>
  );
};
