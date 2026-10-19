import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { calculateCandidateAge, AgeCalculationResult } from '../utils/ageCalculator';
import { LanguageMode } from '../types';

interface AgeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
  initialCutoffDate?: string;
  initialMinAge?: number;
  initialMaxAge?: number;
}

export const AgeCalculatorModal: React.FC<AgeCalculatorModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialCutoffDate = '2026-01-01',
  initialMinAge = 18,
  initialMaxAge = 40,
}) => {
  const isHi = lang === 'hi';

  const [dob, setDob] = useState('2001-05-15');
  const [cutoffDate, setCutoffDate] = useState(initialCutoffDate);
  const [category, setCategory] = useState<'General' | 'OBC' | 'EWS' | 'MBC' | 'SC' | 'ST'>('OBC');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [minAge, setMinAge] = useState(initialMinAge);
  const [maxAge, setMaxAge] = useState(initialMaxAge);
  const [result, setResult] = useState<AgeCalculationResult | null>(null);

  useEffect(() => {
    const res = calculateCandidateAge(dob, cutoffDate, category, gender, minAge, maxAge);
    setResult(res);
  }, [dob, cutoffDate, category, gender, minAge, maxAge]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                {isHi ? 'राजस्थान सरकारी भर्ती आयु कैलकुलेटर' : 'Govt Exam Age Calculator'}
              </h2>
              <p className="text-xs text-orange-100">
                {isHi ? 'कार्मिक विभाग (DOP) नियमानुसार सटीक आयु एवं छूट गणना' : 'Accurate age check with Rajasthan DOP reservation rules'}
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

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date of Birth */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'जन्म तिथि (Date of Birth):' : 'Date of Birth (DOB):'}
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800"
              />
            </div>

            {/* Cutoff As On Date */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'आयु गणना की तारीख (Cutoff Date):' : 'Age as on Date:'}
              </label>
              <input
                type="date"
                value={cutoffDate}
                onChange={(e) => setCutoffDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {isHi ? 'प्रायः राजस्थान में 01-01-2026 निर्धारित है' : 'Usually 01-01-2026 in Rajasthan'}
              </span>
            </div>
          </div>

          {/* Category & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'आरक्षण श्रेणी (Category):' : 'Reservation Category:'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800"
              >
                <option value="General">General / Unreserved (UR)</option>
                <option value="OBC">OBC (Non-Creamy Layer)</option>
                <option value="EWS">EWS (Economically Weaker)</option>
                <option value="MBC">MBC (Most Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'लिंग (Gender):' : 'Gender:'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('Male')}
                  className={`flex-1 py-2 px-3 rounded-lg border font-semibold text-center transition ${
                    gender === 'Male'
                      ? 'bg-amber-100 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isHi ? 'पुरुष (Male)' : 'Male'}
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Female')}
                  className={`flex-1 py-2 px-3 rounded-lg border font-semibold text-center transition ${
                    gender === 'Female'
                      ? 'bg-amber-100 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isHi ? 'महिला (Female)' : 'Female'}
                </button>
              </div>
            </div>
          </div>

          {/* Base Age limits of specific exam */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                {isHi ? 'भर्ती न्यूनतम आयु:' : 'Recruitment Min Age:'}
              </label>
              <input
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                {isHi ? 'भर्ती सामान्य अधिकतम आयु:' : 'Recruitment Base Max Age:'}
              </label>
              <input
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          {/* Results Box */}
          {result && (
            <div className={`p-4 rounded-xl border ${
              result.isEligible ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span className="font-black text-base sm:text-lg">
                  {result.years} {isHi ? 'वर्ष' : 'Years'}, {result.months} {isHi ? 'महीने' : 'Months'}, {result.days} {isHi ? 'दिन' : 'Days'}
                </span>
              </div>

              <p className="font-semibold text-xs mb-2">
                {result.statusMessage}
              </p>

              <div className="text-[11px] space-y-1 bg-white/70 p-2.5 rounded-lg border border-black/5">
                <div className="flex justify-between">
                  <span>{isHi ? 'कुल जीवित दिन:' : 'Total Days on Cutoff:'}</span>
                  <span className="font-bold">{result.totalDays.toLocaleString()} {isHi ? 'दिन' : 'days'}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isHi ? 'आपकी श्रेणी हेतु अधिकतम अनुमत आयु:' : 'Max Allowed Age for Category:'}</span>
                  <span className="font-bold">{result.maxAllowedAge} {isHi ? 'वर्ष' : 'years'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{isHi ? 'राजस्थान कार्मिक विभाग छूट:' : 'Rajasthan DOP Relaxation:'}</span>
                  <span>{category === 'General' ? (gender === 'Female' ? '5 years (Women)' : 'No relaxation') : (gender === 'Female' ? '10 years (Reserved Women)' : '5 years (Reserved Male)')}</span>
                </div>
              </div>
            </div>
          )}

          {/* DOP Rules note */}
          <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              {isHi 
                ? 'नोट: राजस्थान में जिन भर्तियों का विज्ञापन पिछले वर्षों में नहीं आया, उनमें कार्मिक विभाग परिपत्र संख्या एफ.2(1)डीओपी/ए-2/86 के तहत अधिकतम 3 वर्ष तक की अतिरिक्त आयु छूट का प्रावधान रहता है।'
                : 'Note: As per Rajasthan DOP Circular F.2(1)DOP/A-2/86, if a vacancy was not advertised in preceding years, candidates often receive an additional 3-year age relaxation.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            {isHi ? 'ठीक है / बंद करें' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
