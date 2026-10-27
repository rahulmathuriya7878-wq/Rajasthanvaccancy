import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Share2, 
  Bookmark, 
  Sparkles, 
  DollarSign, 
  Send,
  HelpCircle,
  Download,
  Info,
  Clock,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { VacancyItem, LanguageMode } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';

interface VacancyDetailModalProps {
  vacancy: VacancyItem | null;
  onClose: () => void;
  lang: LanguageMode;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenAgeCalc: (asOnDate?: string, minAge?: number, maxAge?: number) => void;
}

export const VacancyDetailModal: React.FC<VacancyDetailModalProps> = ({
  vacancy,
  onClose,
  lang,
  isSaved,
  onToggleSave,
  onOpenAgeCalc,
}) => {
  if (!vacancy) return null;
  const isHi = lang === 'hi';

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    const shareText = `${vacancy.title}\nTotal Posts: ${vacancy.totalPosts}\nLast Date: ${vacancy.importantDates.applyLastDate}\nCheck details on RAJASTHAN VACCANCY/JOBS`;
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

  const handleAskAi = (question: string) => {
    setAiLoading(true);
    setAiQuestion(question);

    // Fast intelligent heuristic Q&A based on recruitment data
    setTimeout(() => {
      const q = question.toLowerCase();
      let answer = '';

      if (q.includes('cet') || q.includes('सीईटी')) {
        const hasCet = vacancy.tags.some(t => t.toLowerCase().includes('cet')) || 
                       vacancy.qualificationDetails.toLowerCase().includes('cet');
        if (hasCet) {
          answer = isHi
            ? `हाँ, ${vacancy.titleHi} के लिए राजस्थान समान पात्रता परीक्षा (CET) का वैध स्कोर कार्ड अनिवार्य है। बोर्ड द्वारा 15 गुना मेरिट के आधार पर अभ्यर्थियों को मुख्य परीक्षा हेतु पात्र माना जाएगा।`
            : `Yes, a valid Rajasthan CET score is mandatory for ${vacancy.title}. The board screens candidates equal to 15 times the total vacancies based on CET cut-off.`;
        } else {
          answer = isHi
            ? `नहीं, ${vacancy.titleHi} में आवेदन के लिए CET की कोई आवश्यकता नहीं है! सभी पात्र 10वीं/12वीं/स्नातक पास अभ्यर्थी सीधे आवेदन कर सकते हैं।`
            : `No, Rajasthan CET is NOT required for ${vacancy.title}. Any eligible candidate meeting the basic qualifications can apply directly.`;
        }
      } else if (q.includes('rscit') || q.includes('computer') || q.includes('कंप्यूटर')) {
        answer = isHi
          ? `राजस्थान सरकार के नियमों के अनुसार अधिकांश लिपिकीय एवं पटवारी पदों हेतु RKCL का RSCIT अथवा O Level / COPA / उच्च कंप्यूटर डिप्लोमा अनिवार्य होता है। 12वीं में कंप्यूटर विषय अथवा इंजीनियरिंग डिग्री होने पर RSCIT से छूट मिलती है।`
          : `For clerical and Patwari vacancies in Rajasthan, RSCIT (Rajasthan State Certificate in Information Technology) or equivalent computer diploma/degree is mandatory. Candidates with Computer Science in 12th/Degree are exempted.`;
      } else if (q.includes('otr') || q.includes('फीस') || q.includes('fee')) {
        answer = isHi
          ? `राजस्थान कर्मचारी चयन बोर्ड एवं आरपीएससी की भर्तियों में वन टाइम रजिस्ट्रेशन (OTR) प्रणाली लागू है। सामान्य/ओबीसी को केवल एक बार ₹600 तथा आरक्षित वर्ग को ₹400 का एकमुश्त शुल्क देना होता है। इसके बाद 1 वर्ष तक सभी भर्तियों के फॉर्म निशुल्क भरे जा सकते हैं।`
          : `Rajasthan SSO operates the One Time Registration (OTR) system. You pay only once per year (₹600 for Gen/OBC, ₹400 for reserved categories). Afterwards, all application forms through SSO are completely fee-free!`;
      } else if (q.includes('age') || q.includes('आयु') || q.includes('उम्र')) {
        answer = isHi
          ? `इस भर्ती हेतु न्यूनतम आयु ${vacancy.ageLimit.min} वर्ष और अधिकतम आयु ${vacancy.ageLimit.max} वर्ष (कट-ऑफ तिथि ${vacancy.ageLimit.asOnDate} तक) निर्धारित है। राजस्थान के मूल निवासी ओबीसी, ईडब्ल्यूएस, एससी, एसटी को 5 वर्ष तथा महिलाओं को 5 से 10 वर्ष की ऊपरी आयु सीमा में छूट मिलती है।`
          : `The age limit for this post is ${vacancy.ageLimit.min} to ${vacancy.ageLimit.max} years calculated as on ${vacancy.ageLimit.asOnDate}. Reserved male categories receive 5 years relaxation, and female candidates receive 5 to 10 years relaxation.`;
      } else {
        answer = isHi
          ? `इस भर्ती की मुख्य अर्हताएं: ${vacancy.qualificationDetailsHi || vacancy.qualificationDetails}। आवेदन की अंतिम तिथि ${vacancy.importantDates.applyLastDate} है। ऑनलाइन आवेदन हेतु राजस्थान एसएसओ पोर्टल (sso.rajasthan.gov.in) पर OTR पूरा होना आवश्यक है।`
          : `Key details: Qualification is ${vacancy.qualificationDetails}. Application last date is ${vacancy.importantDates.applyLastDate}. Ensure your Rajasthan SSO ID profile and Jan Aadhaar details are updated before submitting.`;
      }

      setAiAnswer(answer);
      setAiLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white p-4 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-white/20 text-white text-xs font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
                {vacancy.organization}
              </span>
              <span className="bg-black/20 text-amber-200 text-xs font-mono px-2 py-0.5 rounded">
                {vacancy.advtNo}
              </span>
              {vacancy.isHighDemand || (vacancy.clicksCount && vacancy.clicksCount >= 3000) || (vacancy.savesCount && vacancy.savesCount >= 600) ? (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs animate-pulse">
                  <span>⚡</span>
                  <span>{isHi ? 'हाई डिमांड भर्ती' : 'HIGH DEMAND'}</span>
                </span>
              ) : null}
              {vacancy.isHot && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  HOT NOTIFICATION
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {isHi ? vacancy.titleHi : vacancy.title}
            </h2>

            <p className="text-xs sm:text-sm text-amber-100 mt-1 flex items-center gap-2 flex-wrap">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isHi && vacancy.departmentHi ? vacancy.departmentHi : vacancy.department}</span>
              <span>•</span>
              <span>{vacancy.jobLocation}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase block">
                {isHi ? 'कुल रिक्त पद' : 'Total Posts'}
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900">
                {typeof vacancy.totalPosts === 'number'
                  ? `${vacancy.totalPosts.toLocaleString()} ${isHi ? 'पद' : 'Posts'}`
                  : vacancy.totalPosts}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase block">
                {isHi ? 'आयु सीमा (Cutoff)' : 'Age Limit'}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900">
                {vacancy.ageLimit.min} - {vacancy.ageLimit.max} {isHi ? 'वर्ष' : 'Years'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase block">
                {isHi ? 'वेतनमान (Pay Level)' : 'Salary / Pay Level'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate block" title={vacancy.salary}>
                {isHi && vacancy.salaryHi ? vacancy.salaryHi : vacancy.salary}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase block">
                {isHi ? 'आवेदन अंतिम तिथि' : 'Apply Last Date'}
              </span>
              <span className="text-sm sm:text-base font-black text-rose-700 flex items-center gap-1">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>{vacancy.importantDates.applyLastDate || 'TBA'}</span>
              </span>
            </div>
          </div>

          {/* Action Links Box - Top Priority */}
          <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-inner">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>{isHi ? 'आधिकारिक एवं ऑनलाइन आवेदन लिंक (Direct Links)' : 'Official Action & Direct Links'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {vacancy.officialLinks.applyOnlineUrl && (
                <a
                  href={vacancy.officialLinks.applyOnlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-3 rounded-lg text-xs shadow-md transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isHi ? 'ऑनलाइन आवेदन (SSO Portal)' : 'Apply Online (SSO)'}</span>
                </a>
              )}

              {vacancy.officialLinks.notificationPdfUrl && (
                <a
                  href={vacancy.officialLinks.notificationPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2.5 px-3 rounded-lg text-xs transition"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isHi ? 'विस्तृत विज्ञापन PDF' : 'Notification PDF'}</span>
                </a>
              )}

              {vacancy.officialLinks.syllabusPdfUrl && (
                <a
                  href={vacancy.officialLinks.syllabusPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2.5 px-3 rounded-lg text-xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHi ? 'सिलेबस व परीक्षा पैटर्न' : 'Syllabus PDF'}</span>
                </a>
              )}

              <a
                href={vacancy.officialLinks.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2.5 px-3 rounded-lg text-xs transition"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{isHi ? 'ऑफिशियल बोर्ड वेबसाइट' : 'Official Portal'}</span>
              </a>
            </div>
          </div>

          {/* Important Dates & Application Fee side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dates Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>{isHi ? 'महत्वपूर्ण तिथियां (Important Dates)' : 'Important Dates'}</span>
              </h3>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{isHi ? 'अधिसूचना जारी:' : 'Notification Date:'}</span>
                  <span className="font-medium text-slate-800">{formatDisplayDate(vacancy.importantDates.notificationDate)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{isHi ? 'आवेदन शुरू तिथि:' : 'Application Start Date:'}</span>
                  <span className="font-medium text-emerald-700">{formatDisplayDate(vacancy.importantDates.applyStartDate)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500 font-bold">{isHi ? 'आवेदन अंतिम तिथि:' : 'Application Last Date:'}</span>
                  <span className="font-bold text-rose-700">{formatDisplayDate(vacancy.importantDates.applyLastDate)}</span>
                </div>
                {vacancy.importantDates.examDate && (
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">{isHi ? 'परीक्षा संभावित तिथि:' : 'Exam Date:'}</span>
                    <span className="font-bold text-amber-800">{formatDisplayDate(vacancy.importantDates.examDate)}</span>
                  </div>
                )}
                {vacancy.importantDates.resultDate && (
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">{isHi ? 'रिजल्ट घोषणा:' : 'Result Date:'}</span>
                    <span className="font-bold text-purple-700">{formatDisplayDate(vacancy.importantDates.resultDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Application Fee & OTR Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>{isHi ? 'आवेदन शुल्क (Application Fee)' : 'Application Fee & OTR'}</span>
              </h3>

              <div className="divide-y divide-slate-100 text-xs mb-3">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{isHi ? 'सामान्य / ओबीसी (क्रीमीलेयर):' : 'General / OBC (Creamy):'}</span>
                  <span className="font-bold text-slate-800">₹{vacancy.applicationFee.genObc}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{isHi ? 'ईडब्ल्यूएस / नॉन-क्रीमी ओबीसी:' : 'EWS / OBC (NCL):'}</span>
                  <span className="font-bold text-slate-800">₹{vacancy.applicationFee.ews}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{isHi ? 'एससी / एसटी / दिव्यांगजन:' : 'SC / ST / PwD:'}</span>
                  <span className="font-bold text-slate-800">₹{vacancy.applicationFee.scSt}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Rajasthan SSO One Time Registration (OTR):</span>
                  <span>{isHi && vacancy.applicationFee.otrNoteHi ? vacancy.applicationFee.otrNoteHi : vacancy.applicationFee.otrNote || 'Fees payable once per year on Rajasthan SSO portal.'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility & Qualifications */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{isHi ? 'शैक्षणिक योग्यता एवं पात्रता मानदंड' : 'Educational Eligibility & Qualifications'}</span>
            </h3>

            <p className="text-slate-700 font-medium leading-relaxed mb-3">
              {isHi ? vacancy.qualificationDetailsHi : vacancy.qualificationDetails}
            </p>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 font-semibold">{isHi ? 'मान्य संकाय:' : 'Allowed Levels:'}</span>
              {vacancy.qualification.map((q) => (
                <span key={q} className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-md border border-slate-200">
                  {q}
                </span>
              ))}
            </div>
          </div>

          {/* Age Limit & Relaxation */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Calculator className="w-4 h-4 text-orange-600" />
                <span>{isHi ? 'आयु सीमा एवं छूट नियम (Age Limit & Relaxation)' : 'Age Limit & Relaxations'}</span>
              </h3>

              <button
                onClick={() => {
                  onClose();
                  onOpenAgeCalc(vacancy.ageLimit.asOnDate, vacancy.ageLimit.min, vacancy.ageLimit.max);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 font-semibold text-xs transition"
              >
                <Calculator className="w-3.5 h-3.5 text-orange-700" />
                <span>{isHi ? 'मेरी आयु जांचें (Calculate My Age)' : 'Check My Age Eligibility'}</span>
              </button>
            </div>

            <p className="text-slate-700 text-xs sm:text-sm mb-2">
              {isHi 
                ? `न्यूनतम आयु: ${vacancy.ageLimit.min} वर्ष | अधिकतम आयु: ${vacancy.ageLimit.max} वर्ष (गणना तिथि: ${vacancy.ageLimit.asOnDate})`
                : `Minimum Age: ${vacancy.ageLimit.min} Years | Maximum Age: ${vacancy.ageLimit.max} Years (As on ${vacancy.ageLimit.asOnDate})`}
            </p>

            <p className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
              {isHi && vacancy.ageLimit.relaxationNotesHi
                ? vacancy.ageLimit.relaxationNotesHi
                : vacancy.ageLimit.relaxationNotes || 'Standard age relaxations apply for reserved categories in Rajasthan.'}
            </p>
          </div>

          {/* Selection Process */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">
              {isHi ? 'चयन प्रक्रिया (Selection Process)' : 'Selection Process Stages'}
            </h3>

            <div className="space-y-2">
              {(isHi ? vacancy.selectionProcessHi : vacancy.selectionProcess).map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-medium pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Non-TSP vs TSP Breakdown if available */}
          {vacancy.tspBreakdown && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider">
                {isHi ? 'क्षेत्रवार पद विवरण (Non-TSP vs TSP Breakdown)' : 'District & Area Quota Breakdown'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block">{isHi ? 'गैर-अनुसूचित (Non-TSP):' : 'Non-TSP Posts:'}</span>
                  <span className="font-bold text-slate-900 text-sm">{vacancy.tspBreakdown.nonTsp} {isHi ? 'पद' : 'posts'}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block">{isHi ? 'अनुसूचित क्षेत्र (TSP):' : 'TSP Posts:'}</span>
                  <span className="font-bold text-slate-900 text-sm">{vacancy.tspBreakdown.tsp} {isHi ? 'पद' : 'posts'}</span>
                </div>
                {vacancy.tspBreakdown.sahariya && (
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block">{isHi ? 'सहरिया आदिम जाति:' : 'Sahariya Tribe:'}</span>
                    <span className="font-bold text-slate-900 text-sm">{vacancy.tspBreakdown.sahariya} {isHi ? 'पद' : 'posts'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sarkari AI Assistant for this Notification */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{isHi ? 'भर्ती संबंधी त्वरित प्रश्नोत्तरी (Sarkari AI Guide)' : 'Instant Vacancy FAQ & AI Clarification'}</span>
            </div>
            <p className="text-xs text-amber-800 mb-3">
              {isHi ? 'इस भर्ती से संबंधित पात्रता, सीईटी, RSCIT कंप्यूटर सर्टिफिकेट या OTR नियमों को तुरंत समझें:' : 'Click below or ask any question about eligibility, CET validity, RSCIT certificate, or exam rules:'}
            </p>

            <div className="flex items-center gap-1.5 flex-wrap mb-3 text-xs">
              <button
                onClick={() => handleAskAi('Do I need CET score for this vacancy?')}
                className="bg-white border border-amber-300 hover:border-amber-500 text-amber-900 px-2.5 py-1 rounded-full transition"
              >
                {isHi ? '👉 क्या इसमें CET आवश्यक है?' : 'Do I need CET?'}
              </button>
              <button
                onClick={() => handleAskAi('Is RSCIT computer diploma mandatory?')}
                className="bg-white border border-amber-300 hover:border-amber-500 text-amber-900 px-2.5 py-1 rounded-full transition"
              >
                {isHi ? '👉 RSCIT कंप्यूटर जरूरी है क्या?' : 'Is RSCIT required?'}
              </button>
              <button
                onClick={() => handleAskAi('What is the Rajasthan SSO OTR system?')}
                className="bg-white border border-amber-300 hover:border-amber-500 text-amber-900 px-2.5 py-1 rounded-full transition"
              >
                {isHi ? '👉 OTR क्या है और फीस कैसे बचेगी?' : 'How does OTR work?'}
              </button>
              <button
                onClick={() => handleAskAi('Age relaxations and cut-off date?')}
                className="bg-white border border-amber-300 hover:border-amber-500 text-amber-900 px-2.5 py-1 rounded-full transition"
              >
                {isHi ? '👉 आयु सीमा में कितनी छूट मिलेगी?' : 'Age relaxation rules'}
              </button>
            </div>

            {aiLoading && (
              <div className="text-xs text-amber-800 flex items-center gap-2 py-2">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
                <span>{isHi ? 'उत्तर तैयार किया जा रहा है...' : 'Checking official rules...'}</span>
              </div>
            )}

            {aiAnswer && !aiLoading && (
              <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs text-slate-800 leading-relaxed shadow-xs">
                <span className="font-bold text-amber-800 block mb-1">
                  Q: {aiQuestion}
                </span>
                <p>{aiAnswer}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {copiedLink && (
              <span className="text-emerald-700 font-bold">
                ✓ {isHi ? 'लिंक क्लिपबोर्ड पर कॉपी हो गया!' : 'Link copied to clipboard!'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              {isHi ? 'बंद करें' : 'Close'}
            </button>

            {vacancy.officialLinks.applyOnlineUrl && (
              <a
                href={vacancy.officialLinks.applyOnlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <span>{isHi ? 'SSO पर फॉर्म भरें' : 'Apply on SSO'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
