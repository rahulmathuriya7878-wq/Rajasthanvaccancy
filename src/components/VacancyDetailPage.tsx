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
  Check
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
}

export const VacancyDetailPage: React.FC<VacancyDetailPageProps> = ({
  vacancy,
  onBack,
  lang,
  isSaved,
  onToggleSave,
  allVacancies,
  onSelectOtherVacancy,
}) => {
  const isHi = lang === 'hi';
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [vacancy.id]);

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

  // Required Documents list
  const documentsList = isHi ? (vacancy.requiredDocumentsHi || [
    'जन आधार कार्ड / आधार कार्ड (Jan Aadhaar Card)',
    '10वीं / 8वीं / स्नातक उत्तीर्ण शैक्षणिक योग्यता अंकतालिका',
    'सक्षम प्राधिकारी द्वारा जारी राजस्थान मूल निवास प्रमाण पत्र (Bonafide Certificate)',
    'सक्षम प्राधिकारी द्वारा जारी जाति प्रमाण पत्र (SC/ST/OBC/MBC/EWS)',
    'पासपोर्ट साइज नवीनतम रंगीन फोटो एवं हस्ताक्षर',
    'सक्रिय मोबाइल नंबर एवं वैध ईमेल आईडी'
  ]) : (vacancy.requiredDocuments || [
    'Jan Aadhaar Card / Aadhaar Card',
    'Educational qualification marksheet (8th/10th/12th/Graduation)',
    'Bonafide Rajasthan Resident Certificate',
    'Caste Certificate (SC/ST/OBC/MBC/EWS)',
    'Recent Passport Size Photograph & Signature',
    'Active Mobile Number & Valid Email ID'
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

  // FAQs
  const faqItems = vacancy.faqs || [
    {
      q: `What is the last date to apply online?`,
      qHi: `इस भर्ती में ऑनलाइन आवेदन करने की अंतिम तिथि क्या है?`,
      a: `The last date to submit online application on Rajasthan SSO portal is ${vacancy.importantDates.applyLastDate}.`,
      aHi: `राजस्थान एसएसओ पोर्टल पर ऑनलाइन आवेदन जमा करने की अंतिम तिथि ${vacancy.importantDates.applyLastDate} (रात्रि 11:59 बजे तक) है।`
    },
    {
      q: `What is the application fee?`,
      qHi: `इस भर्ती में आवेदन शुल्क कितना है?`,
      a: `General / Creamy layer OBC candidates pay ₹${vacancy.applicationFee.genObc}, while SC/ST/EWS/OBC (NCL) pay ₹${vacancy.applicationFee.scSt || vacancy.applicationFee.ews}. Under Rajasthan OTR, fee is paid once per year.`,
      aHi: `सामान्य एवं क्रीमीलेयर ओबीसी वर्ग हेतु ₹${vacancy.applicationFee.genObc} तथा एससी/एसटी/ईडब्ल्यूएस/नॉन-क्रीमी ओबीसी हेतु ₹${vacancy.applicationFee.scSt || vacancy.applicationFee.ews} शुल्क है। OTR शुल्क 1 वर्ष में केवल एक बार लगता है।`
    },
    {
      q: `What is the selection process?`,
      qHi: `इस भर्ती की चयन प्रक्रिया क्या रहेगी?`,
      a: (vacancy.selectionProcess || []).join(' ➔ '),
      aHi: (vacancy.selectionProcessHi || []).join(' ➔ ')
    }
  ];

  const relatedVacancies = allVacancies
    .filter(v => v.id !== vacancy.id)
    .slice(0, 4);

  return (
    <article className="w-full max-w-4xl mx-auto space-y-6 text-slate-800 text-[15px] leading-relaxed">
      {/* Top Navigation Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-amber-700 transition cursor-pointer"
          aria-label="Back"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 text-amber-600" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-amber-400 text-slate-700 hover:text-amber-800 text-xs font-semibold bg-white transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? (isHi ? 'कॉपी हुआ!' : 'Copied!') : (isHi ? 'शेयर करें' : 'Share')}</span>
          </button>
        </div>
      </div>

      {/* Main Post Title Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        {/* Badges Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs">
            {vacancy.organization}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-xs font-semibold">
            {vacancy.advtNo}
          </span>
          {vacancy.isHot && (
            <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-xs">
              HOT
            </span>
          )}
          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs">
            {isHi ? 'सक्रिय अधिसूचना' : 'Active'}
          </span>
        </div>

        {/* Post Heading */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {isHi ? vacancy.titleHi : vacancy.title}
        </h1>

        {/* Post Meta */}
        <div className="text-slate-600 flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100">
          <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold text-slate-800">{isHi && vacancy.departmentHi ? vacancy.departmentHi : vacancy.department}</span>
          <span>•</span>
          <span>{vacancy.jobLocation}</span>
          <span>•</span>
          <span>{isHi ? 'अपडेट' : 'Updated'}: {vacancy.importantDates.notificationDate}</span>
        </div>

        {/* Short Information Note */}
        <div className="bg-amber-50/70 border-l-4 border-amber-600 p-4 rounded-r-lg text-slate-800">
          <p className="font-bold text-amber-950 mb-1">
            {isHi ? 'संक्षिप्त विवरण (Short Information):' : 'Short Information:'}
          </p>
          <p>{isHi ? vacancy.descriptionHi : vacancy.description}</p>
        </div>
      </div>

      {/* Section 1: Overview Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2 text-white">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{isHi ? 'भर्ती का संक्षिप्त विवरण (Recruitment Overview)' : 'Recruitment Overview'}</span>
          </h2>
          <span className="text-xs text-amber-300 font-mono font-bold">
            RAJASTHAN VACCANCY/JOBS
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 w-2/5 border-r border-slate-200">
                {isHi ? 'भर्ती बोर्ड / विभाग का नाम' : 'Recruitment Organization'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-medium">
                {isHi && vacancy.departmentHi ? vacancy.departmentHi : vacancy.department} ({vacancy.organization})
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'पद का नाम (Post Name)' : 'Post Name'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-semibold">
                {isHi ? vacancy.postNameHi : vacancy.postName}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'विज्ञापन संख्या (Advt No.)' : 'Advertisement Number'}
              </td>
              <td className="py-3 px-4 font-mono font-medium text-slate-900">
                {vacancy.advtNo}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'कुल रिक्त पद (Total Vacancies)' : 'Total Vacancies'}
              </td>
              <td className="py-3 px-4 font-bold text-emerald-700">
                {typeof vacancy.totalPosts === 'number' ? `${vacancy.totalPosts.toLocaleString()} पद` : vacancy.totalPosts}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'वेतनमान (Salary / Pay Scale)' : 'Salary / Pay Level'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-medium">
                {isHi && vacancy.salaryHi ? vacancy.salaryHi : vacancy.salary}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'नौकरी का स्थान (Job Location)' : 'Job Location'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-medium">
                {vacancy.jobLocation}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'आवेदन का प्रकार (Mode of Apply)' : 'Application Mode'}
              </td>
              <td className="py-3 px-4 text-blue-700 font-semibold">
                {isHi ? 'ऑनलाइन (Online via SSO Portal)' : 'Online via Rajasthan SSO'}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
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

      {/* Section 2: Important Dates */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-amber-600 text-white px-5 py-3">
          <h2 className="font-bold flex items-center gap-2 text-white">
            <Calendar className="w-4 h-4 text-white" />
            <span>{isHi ? 'महत्वपूर्ण तिथियां (Important Dates)' : 'Important Dates'}</span>
          </h2>
        </div>

        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 w-2/5 border-r border-slate-200">
                {isHi ? 'विज्ञप्ति जारी तिथि:' : 'Notification Date:'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-medium">{vacancy.importantDates.notificationDate}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'ऑनलाइन आवेदन प्रारंभ तिथि:' : 'Online Apply Start:'}
              </td>
              <td className="py-3 px-4 font-bold text-emerald-700">{vacancy.importantDates.applyStartDate}</td>
            </tr>
            <tr className="bg-rose-50/60">
              <td className="py-3 px-4 font-bold text-rose-900 bg-rose-100/50 border-r border-rose-200">
                {isHi ? 'आवेदन करने की अंतिम तिथि:' : 'Apply Last Date:'}
              </td>
              <td className="py-3 px-4 font-bold text-rose-700">{vacancy.importantDates.applyLastDate} (11:59 PM)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'शुल्क भुगतान अंतिम तिथि:' : 'Fee Last Date:'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-medium">{vacancy.importantDates.feeLastDate || vacancy.importantDates.applyLastDate}</td>
            </tr>
            {vacancy.importantDates.examDate && (
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  {isHi ? 'परीक्षा / लॉटरी तिथि:' : 'Exam / Lottery Date:'}
                </td>
                <td className="py-3 px-4 font-bold text-amber-800">{vacancy.importantDates.examDate}</td>
              </tr>
            )}
            {vacancy.importantDates.admitCardDate && (
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  {isHi ? 'प्रवेश पत्र जारी तिथि:' : 'Admit Card Date:'}
                </td>
                <td className="py-3 px-4 font-semibold text-blue-700">{vacancy.importantDates.admitCardDate}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Section 3: Application Fee Details */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-emerald-700 text-white px-5 py-3">
          <h2 className="font-bold flex items-center gap-2 text-white">
            <DollarSign className="w-4 h-4 text-white" />
            <span>{isHi ? 'आवेदन शुल्क विवरण (Application Fee)' : 'Application Fee Details'}</span>
          </h2>
        </div>

        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 w-2/5 border-r border-slate-200">
                {isHi ? 'सामान्य / ओबीसी (क्रीमीलेयर):' : 'General / Creamy OBC:'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-semibold">₹{vacancy.applicationFee.genObc}/-</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'ईडब्ल्यूएस / ओबीसी (NCL) / एमबीसी:' : 'EWS / OBC (NCL) / MBC:'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-semibold">₹{vacancy.applicationFee.ews}/-</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'एससी / एसटी / दिव्यांगजन (PH):' : 'SC / ST / PwD:'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-semibold">₹{vacancy.applicationFee.scSt}/-</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'भुगतान का माध्यम:' : 'Payment Mode:'}
              </td>
              <td className="py-3 px-4 text-blue-700 font-medium">
                {isHi ? 'ऑनलाइन माध्यम (Net Banking / Debit Card / UPI / CSC Kiosk)' : 'Online (Net Banking / Debit Card / UPI)'}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="p-4 bg-blue-50/70 border-t border-blue-200 flex items-start gap-2.5 text-blue-950">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <p>
            <strong>{isHi ? 'राजस्थान SSO OTR नियम:' : 'Rajasthan SSO OTR Rule:'}</strong>{' '}
            {isHi && vacancy.applicationFee.otrNoteHi ? vacancy.applicationFee.otrNoteHi : vacancy.applicationFee.otrNote || 'Fees payable once per year under OTR.'}
          </p>
        </div>
      </div>

      {/* Section 4: Vacancy Breakdown & Quota Details */}
      {vacancy.tspBreakdown && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-5 py-3">
            <h2 className="font-bold flex items-center gap-2 text-white">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{isHi ? 'क्षेत्रवार रिक्त पद विवरण (Vacancy Breakdown)' : 'Vacancy Breakdown & Area Quota'}</span>
            </h2>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 w-2/5 border-r border-slate-200">
                  {isHi ? 'गैर-अनुसूचित क्षेत्र (Non-TSP Area):' : 'Non-TSP Area:'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-semibold">
                  {vacancy.tspBreakdown.nonTsp.toLocaleString()} {isHi ? 'पद' : 'posts'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  {isHi ? 'अनुसूचित क्षेत्र (TSP Area):' : 'TSP Area:'}
                </td>
                <td className="py-3 px-4 text-slate-900 font-semibold">
                  {vacancy.tspBreakdown.tsp.toLocaleString()} {isHi ? 'पद' : 'posts'}
                </td>
              </tr>
              <tr className="bg-amber-50/50">
                <td className="py-3 px-4 font-bold text-amber-950 bg-amber-100/50 border-r border-amber-200">
                  {isHi ? 'कुल रिक्त पद (Total Posts):' : 'Total Posts:'}
                </td>
                <td className="py-3 px-4 font-bold text-amber-900">
                  {typeof vacancy.totalPosts === 'number' ? `${vacancy.totalPosts.toLocaleString()} पद` : vacancy.totalPosts}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Section 5: Educational Qualification & Eligibility */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{isHi ? 'पात्रता एवं शैक्षणिक योग्यता (Educational Qualification & Eligibility)' : 'Educational Qualification & Eligibility'}</span>
        </h2>

        <p className="font-medium text-slate-800">
          {isHi ? vacancy.qualificationDetailsHi : vacancy.qualificationDetails}
        </p>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="font-bold text-slate-700">{isHi ? 'पात्र स्तर:' : 'Eligible Levels:'}</span>
          {vacancy.qualification.map((q) => (
            <span key={q} className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded border border-slate-200 text-xs">
              {q}
            </span>
          ))}
        </div>
      </div>

      {/* Section 6: Age Limit & Relaxation Rules */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
          <Clock className="w-4 h-4 text-orange-600" />
          <span>{isHi ? 'आयु सीमा एवं छूट नियम (Age Limit & Relaxation Rules)' : 'Age Limit & Relaxation Rules'}</span>
        </h2>

        <table className="w-full text-left border border-slate-200 border-collapse mb-3">
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 w-2/5 border-r border-slate-200">
                {isHi ? 'न्यूनतम आयु सीमा:' : 'Minimum Age:'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-semibold">
                {vacancy.ageLimit.min} {isHi ? 'वर्ष' : 'Years'}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'अधिकतम आयु सीमा:' : 'Maximum Base Age:'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-semibold">
                {vacancy.ageLimit.max} {isHi ? 'वर्ष' : 'Years'}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'आयु गणना की कट-ऑफ तारीख:' : 'Age Cutoff Date:'}
              </td>
              <td className="py-3 px-4 text-slate-900 font-medium">
                {vacancy.ageLimit.asOnDate}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="bg-amber-50/70 p-4 rounded-lg border border-amber-200 text-amber-950">
          <p className="font-bold mb-1">
            {isHi ? 'राजस्थान सरकार नियमानुसार आयु सीमा में छूट:' : 'Category-wise Age Relaxation:'}
          </p>
          <p>{isHi && vacancy.ageLimit.relaxationNotesHi ? vacancy.ageLimit.relaxationNotesHi : vacancy.ageLimit.relaxationNotes}</p>
        </div>
      </div>

      {/* Section 7: Selection Process Stages */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
          <ListOrdered className="w-4 h-4 text-blue-600" />
          <span>{isHi ? 'चयन प्रक्रिया के चरण (Selection Process Stages)' : 'Selection Process Stages'}</span>
        </h2>

        <div className="space-y-2">
          {(isHi ? vacancy.selectionProcessHi : vacancy.selectionProcess).map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                {idx + 1}
              </span>
              <span className="font-semibold pt-0.5 text-slate-900">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 8: Required Documents List */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
          <FileCheck className="w-4 h-4 text-teal-600" />
          <span>{isHi ? 'ऑनलाइन आवेदन हेतु आवश्यक दस्तावेज (Required Documents List)' : 'Required Documents for Application'}</span>
        </h2>

        <ul className="space-y-2">
          {documentsList.map((doc, idx) => (
            <li key={idx} className="flex items-start gap-2.5 p-2 rounded hover:bg-slate-50 transition">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span className="font-medium text-slate-800">{doc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 9: Step-by-Step How to Apply */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>{isHi ? 'ऑनलाइन आवेदन कैसे करें - स्टेप बाय स्टेप गाइड (How to Apply Online)' : 'Step-by-Step Online Application Guide'}</span>
        </h2>

        <div className="space-y-2.5">
          {howToApplySteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="w-6 h-6 rounded bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                {idx + 1}
              </span>
              <p className="font-medium pt-0.5 text-slate-900 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 10: Useful Important Links Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-5 py-3">
          <h2 className="font-bold flex items-center gap-2 text-white">
            <ExternalLink className="w-4 h-4" />
            <span>{isHi ? 'महत्वपूर्ण उपयोगी डायरेक्ट लिंक तालिका (Important Quick Links)' : 'Important Quick Links'}</span>
          </h2>
        </div>

        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-200">
            {vacancy.officialLinks.applyOnlineUrl && (
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 w-1/2 border-r border-slate-200">
                  {isHi ? 'ऑनलाइन आवेदन लिंक (Apply Online via SSO)' : 'Apply Online Link (SSO)'}
                </td>
                <td className="py-3 px-4">
                  <a
                    href={vacancy.officialLinks.applyOnlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <span>{isHi ? 'ऑनलाइन आवेदन करें' : 'Click Here to Apply'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </td>
              </tr>
            )}

            {vacancy.officialLinks.notificationPdfUrl && (
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  {isHi ? 'ऑफिशियल नोटिफिकेशन डाउनलोड (Notification PDF)' : 'Official Notification PDF'}
                </td>
                <td className="py-3 px-4">
                  <a
                    href={vacancy.officialLinks.notificationPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHi ? 'डाउनलोड करें (PDF)' : 'Download PDF'}</span>
                  </a>
                </td>
              </tr>
            )}

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'बोर्ड की आधिकारिक वेबसाइट (Official Website)' : 'Official Website Portal'}
              </td>
              <td className="py-3 px-4">
                <a
                  href={vacancy.officialLinks.officialWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{isHi ? 'वेबसाइट पर जाएं' : 'Visit Official Portal'}</span>
                </a>
              </td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'राजस्थान भर्ती टेलीग्राम चैनल से जुड़ें' : 'Join Telegram Alert Channel'}
              </td>
              <td className="py-3 px-4">
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Join Telegram</span>
                </a>
              </td>
            </tr>

            <tr>
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                {isHi ? 'राजस्थान भर्ती व्हाट्सएप ग्रुप से जुड़ें' : 'Join WhatsApp Alert Group'}
              </td>
              <td className="py-3 px-4">
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Join WhatsApp</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 11: Frequently Asked Questions (FAQ) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>{isHi ? 'अक्सर पूछे जाने वाले सवाल (Frequently Asked Questions - FAQ)' : 'Frequently Asked Questions (FAQ)'}</span>
        </h2>

        <div className="space-y-3">
          {faqItems.map((faq, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900 flex items-start gap-2">
                <span className="text-amber-600 font-bold">Q{idx + 1}:</span>
                <span>{isHi ? faq.qHi : faq.q}</span>
              </p>
              <p className="text-slate-700 pl-6">
                {isHi ? faq.aHi : faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 12: Other Related Vacancies */}
      {relatedVacancies.length > 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-3">
          <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-200">
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
                  <p className="font-bold text-slate-900 hover:text-amber-800 line-clamp-1">
                    {isHi ? rel.titleHi : rel.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {rel.organization} • {rel.importantDates.applyLastDate}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
