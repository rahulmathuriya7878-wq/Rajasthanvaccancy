import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { UPCOMING_EXAM_CALENDAR } from '../data/mockVacancies';
import { LanguageMode } from '../types';

interface ExamCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
}

export const ExamCalendarModal: React.FC<ExamCalendarModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                {isHi ? 'राजस्थान भर्ती परीक्षा कैलेंडर 2025-2026' : 'Rajasthan Govt Exam Calendar 2025-26'}
              </h2>
              <p className="text-xs text-amber-100">
                {isHi ? 'आरएसएमएसएसबी व आरपीएससी द्वारा घोषित संभावित परीक्षा तिथियां' : 'RSMSSB & RPSC Tentative Examination Dates & Guidelines'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Important Notice regarding 5th Option rule */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-900 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-1">
                {isHi ? '⚠️ अति महत्वपूर्ण: ओएमआर 5वें विकल्प (5th Option) का अनिवार्य नियम' : 'Crucial Warning: Mandatory 5th Option in Rajasthan OMR Exams'}
              </h4>
              <p className="text-xs leading-relaxed text-rose-800">
                {isHi 
                  ? 'राजस्थान की सभी परीक्षाओं में यदि आप किसी प्रश्न का उत्तर नहीं देना चाहते हैं, तो 5वां गोला (विकल्प \'E\') भरना अनिवार्य है। 5वां गोला न भरने पर 1/3 अंक काटे जाएंगे। यदि 10% से अधिक प्रश्नों में कोई भी गोला नहीं भरा गया तो अभ्यर्थी को अयोग्य (Disqualify) घोषित कर दिया जाएगा।'
                  : 'In all RSMSSB/RPSC exams, if you choose NOT to answer a question, darkening the 5th circle (Option E) is MANDATORY. Leaving it completely blank incurs 1/3 negative marking. If more than 10% questions have no bubble filled, candidate is disqualified.'}
              </p>
            </div>
          </div>

          {/* Exam Schedule Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-2.5 px-3">{isHi ? 'परीक्षा का नाम' : 'Exam Name'}</th>
                  <th className="py-2.5 px-3">{isHi ? 'बोर्ड' : 'Board'}</th>
                  <th className="py-2.5 px-3">{isHi ? 'पद' : 'Posts'}</th>
                  <th className="py-2.5 px-3">{isHi ? 'तारीख' : 'Date'}</th>
                  <th className="py-2.5 px-3">{isHi ? 'स्थिति' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {UPCOMING_EXAM_CALENDAR.map((exam, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {isHi ? exam.examNameHi : exam.examName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {exam.board}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">
                      {exam.posts}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {exam.examDate}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tips for Candidates */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isHi ? 'परीक्षार्थियों के लिए महत्वपूर्ण दिशा-निर्देश' : 'Important Instructions for Candidates'}</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
              <li>{isHi ? 'परीक्षा केंद्र पर प्रवेश पत्र के साथ मूल पहचान पत्र (आधार कार्ड) लाना अनिवार्य है।' : 'Original Aadhaar Card is compulsory along with Admit Card at test center.'}</li>
              <li>{isHi ? 'परीक्षा शुरू होने के ठीक 60 मिनट पहले परीक्षा केंद्र के द्वार बंद कर दिए जाएंगे।' : 'Examination gates close strictly 60 minutes before scheduled start time.'}</li>
              <li>{isHi ? 'पारदर्शी नीला/काला बॉलपॉइंट पेन ही अनुमत है।' : 'Only transparent blue/black ballpoint pens are permitted.'}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
          <a
            href="https://rsmssb.rajasthan.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
          >
            <span>RSMSSB Official Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
