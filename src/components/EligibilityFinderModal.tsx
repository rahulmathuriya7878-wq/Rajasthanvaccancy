import React, { useState } from 'react';
import { 
  X, 
  Compass, 
  CheckCircle2, 
  ChevronRight, 
  GraduationCap, 
  Award, 
  Building2, 
  Calendar,
  ExternalLink
} from 'lucide-react';
import { VacancyItem, QualificationType, LanguageMode } from '../types';

interface EligibilityFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancies: VacancyItem[];
  lang: LanguageMode;
  onSelectVacancy: (item: VacancyItem) => void;
}

export const EligibilityFinderModal: React.FC<EligibilityFinderModalProps> = ({
  isOpen,
  onClose,
  vacancies,
  lang,
  onSelectVacancy,
}) => {
  const isHi = lang === 'hi';

  const [selectedQual, setSelectedQual] = useState<QualificationType>('12th');
  const [hasRscit, setHasRscit] = useState<boolean>(true);
  const [hasCetGrad, setHasCetGrad] = useState<boolean>(false);
  const [hasCet12th, setHasCet12th] = useState<boolean>(true);
  const [candidateAge, setCandidateAge] = useState<number>(23);

  if (!isOpen) return null;

  // Filter matching vacancies
  const matchedVacancies = vacancies.filter((item) => {
    // 1. Qualification check:
    // If candidate has Graduate, they can apply for Graduate, 12th, 10th
    // If candidate has 12th, they can apply for 12th, 10th
    // If candidate has 10th, they can apply for 10th
    const itemReqs = item.qualification;
    let qualMatches = false;

    if (selectedQual === 'PostGraduate') {
      qualMatches = true;
    } else if (selectedQual === 'Graduate') {
      qualMatches = itemReqs.includes('Graduate') || itemReqs.includes('12th') || itemReqs.includes('10th');
    } else if (selectedQual === '12th') {
      qualMatches = itemReqs.includes('12th') || itemReqs.includes('10th');
    } else if (selectedQual === '10th') {
      qualMatches = itemReqs.includes('10th');
    } else {
      qualMatches = itemReqs.includes(selectedQual) || itemReqs.includes('10th');
    }

    if (!qualMatches) return false;

    // 2. CET requirement check:
    const requiresCetGrad = item.tags.some(t => t.toLowerCase().includes('cet graduate'));
    const requiresCet12th = item.tags.some(t => t.toLowerCase().includes('cet 12th'));

    if (requiresCetGrad && !hasCetGrad) return false;
    if (requiresCet12th && !hasCet12th) return false;

    // 3. Age check:
    if (candidateAge < item.ageLimit.min || candidateAge > item.ageLimit.max + 5) {
      return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                {isHi ? 'स्मार्ट पात्रता चेकर (Smart Job Matcher)' : 'Smart Job Matcher & Eligibility Quiz'}
              </h2>
              <p className="text-xs text-amber-100">
                {isHi ? 'अपनी योग्यता दर्ज करें और देखें आप किन-किन सरकारी भर्तियों में पात्र हैं' : 'Select your qualifications to find all matching Rajasthan Govt jobs'}
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

        {/* Input Parameters */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/70 space-y-4 shrink-0 text-xs sm:text-sm">
          {/* Qualification select */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>{isHi ? 'आपकी उच्चतम शैक्षणिक योग्यता (Highest Qualification):' : 'Highest Qualification:'}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['10th', '12th', 'Graduate', 'PostGraduate', 'B.Ed/BSTC', 'Engineering', 'Medical', 'ITI/Diploma'] as QualificationType[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSelectedQual(q)}
                  className={`py-2 px-2.5 rounded-lg border font-semibold text-center transition ${
                    selectedQual === q
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Computer certificate & CET & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* RSCIT Computer */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">
                {isHi ? 'RSCIT / कंप्यूटर डिप्लोमा:' : 'RSCIT / Computer Cert:'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHasRscit(true)}
                  className={`flex-1 py-1 px-2 rounded text-xs font-semibold ${
                    hasRscit ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isHi ? 'हाँ (Yes)' : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => setHasRscit(false)}
                  className={`flex-1 py-1 px-2 rounded text-xs font-semibold ${
                    !hasRscit ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isHi ? 'नहीं (No)' : 'No'}
                </button>
              </div>
            </div>

            {/* CET Status */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">
                {isHi ? 'राजस्थान CET स्थिति:' : 'CET Score Card:'}
              </span>
              <div className="space-y-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCet12th}
                    onChange={(e) => setHasCet12th(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>CET 12th Level</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCetGrad}
                    onChange={(e) => setHasCetGrad(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>CET Graduate</span>
                </label>
              </div>
            </div>

            {/* Age */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">
                {isHi ? `आपकी आयु (${candidateAge} वर्ष):` : `Your Age (${candidateAge} yrs):`}
              </span>
              <input
                type="range"
                min="17"
                max="45"
                value={candidateAge}
                onChange={(e) => setCandidateAge(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>17 yrs</span>
                <span className="font-bold text-amber-700">{candidateAge} yrs</span>
                <span>45 yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>
                {isHi ? `आपके लिए योग्य कुल भर्तियां (${matchedVacancies.length})` : `Matching Eligible Vacancies (${matchedVacancies.length})`}
              </span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {isHi ? 'योग्यता अनुसार छांटी गई' : 'Filtered automatically'}
            </span>
          </div>

          {matchedVacancies.length > 0 ? (
            <div className="space-y-2">
              {matchedVacancies.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-xs hover:shadow-sm transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {item.organization}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {typeof item.totalPosts === 'number' ? `${item.totalPosts.toLocaleString()} ${isHi ? 'पद' : 'posts'}` : item.totalPosts}
                      </span>
                      <span className="text-[10px] text-rose-700 font-medium">
                        {isHi ? 'अंतिम तिथि:' : 'Last Date:'} {item.importantDates.applyLastDate}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm hover:text-amber-700 cursor-pointer" onClick={() => { onClose(); onSelectVacancy(item); }}>
                      {isHi ? item.titleHi : item.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {isHi ? item.qualificationDetailsHi : item.qualificationDetails}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectVacancy(item);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition flex items-center gap-1 border border-amber-200"
                  >
                    <span>{isHi ? 'विवरण' : 'Details'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium text-xs sm:text-sm">
                {isHi ? 'वर्तमान में आपके चयनित मापदंडों के अनुसार कोई सीधी भर्ती नहीं मिली।' : 'No matching vacancies found for your chosen criteria.'}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {isHi ? 'कृपया योग्यता या आयु सीमा बदलकर पुनः प्रयास करें।' : 'Try tweaking your qualifications or CET selections.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            {isHi ? 'पूर्ण / बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
