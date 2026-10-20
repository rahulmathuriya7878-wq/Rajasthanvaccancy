import React from 'react';
import { 
  Calendar, 
  Clock, 
  GraduationCap, 
  ExternalLink, 
  FileText, 
  Bookmark, 
  Share2, 
  ChevronRight, 
  AlertCircle,
  Building2,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { VacancyItem, LanguageMode } from '../types';

interface VacancyCardProps {
  vacancy: VacancyItem;
  lang: LanguageMode;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelect: (item: VacancyItem) => void;
  onShare: (item: VacancyItem) => void;
}

export const VacancyCard: React.FC<VacancyCardProps> = ({
  vacancy,
  lang,
  isSaved,
  onToggleSave,
  onSelect,
  onShare,
}) => {
  const isHi = lang === 'hi';

  const getStatusBadge = () => {
    switch (vacancy.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            {isHi ? 'आवेदन जारी' : 'Apply Online Active'}
          </span>
        );
      case 'admit_card_out':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            {isHi ? 'प्रवेश पत्र जारी' : 'Admit Card Out'}
          </span>
        );
      case 'result_declared':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            {isHi ? 'परिणाम घोषित' : 'Result Declared'}
          </span>
        );
      case 'answer_key_out':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {isHi ? 'आंसर-की जारी' : 'Answer Key Out'}
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
            {isHi ? 'शीघ्र संभावित' : 'Upcoming'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {isHi ? 'बंद' : 'Closed'}
          </span>
        );
    }
  };

  const getBoardBadgeClass = () => {
    switch (vacancy.organization) {
      case 'RSMSSB':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'RPSC':
        return 'bg-blue-50 text-blue-900 border-blue-300';
      case 'Rajasthan Police':
        return 'bg-indigo-50 text-indigo-900 border-indigo-300';
      case 'Rajasthan High Court':
        return 'bg-rose-50 text-rose-900 border-rose-300';
      case 'Central Govt':
        return 'bg-purple-50 text-purple-900 border-purple-300';
      case 'Sarkari Yojana':
        return 'bg-teal-50 text-teal-900 border-teal-300';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group">
      {/* Top Tag Bar */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${getBoardBadgeClass()}`}>
              {vacancy.organization}
            </span>
            {getStatusBadge()}
            {vacancy.isHot && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                HOT
              </span>
            )}
            {vacancy.isNew && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-600 text-white animate-pulse">
                NEW
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => onShare(vacancy)}
              className="p-1.5 rounded-md hover:bg-slate-100 hover:text-slate-700 transition"
              title="Share alert"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleSave(vacancy.id)}
              className={`p-1.5 rounded-md transition ${
                isSaved ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-100 hover:text-slate-700'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Notification'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(vacancy)}
          className="text-base sm:text-lg font-bold text-slate-900 hover:text-amber-700 cursor-pointer transition line-clamp-2 leading-snug mb-1"
        >
          {isHi ? vacancy.titleHi : vacancy.title}
        </h3>

        {/* Department & Advt */}
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-slate-700">{isHi && vacancy.departmentHi ? vacancy.departmentHi : vacancy.department}</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-[11px] text-slate-500">{vacancy.advtNo}</span>
        </p>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 rounded-lg p-2.5 mb-3 border border-slate-100">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              {isHi ? 'कुल पद' : 'Total Vacancies'}
            </span>
            <span className="font-bold text-slate-800 text-sm">
              {typeof vacancy.totalPosts === 'number' 
                ? `${vacancy.totalPosts.toLocaleString()} ${isHi ? 'पद' : 'Posts'}`
                : vacancy.totalPosts}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              {isHi ? 'न्यूनतम योग्यता' : 'Qualification'}
            </span>
            <span className="font-medium text-slate-800 truncate block" title={vacancy.qualificationDetails}>
              {vacancy.qualification.join(', ')}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              {isHi ? 'अंतिम तिथि' : 'Last Date'}
            </span>
            <span className="font-bold text-rose-700 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-rose-600" />
              <span>{vacancy.importantDates.applyLastDate || 'TBA'}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              {isHi ? 'परीक्षा तिथि' : 'Exam Date'}
            </span>
            <span className="font-medium text-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{vacancy.importantDates.examDate || 'Announced Soon'}</span>
            </span>
          </div>
        </div>

        {/* Short details */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3">
          {isHi ? vacancy.descriptionHi : vacancy.description}
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(vacancy)}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group/btn"
        >
          <span>{isHi ? 'विस्तृत विज्ञापन पढ़ें' : 'View Full Details'}</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </button>

        <div className="flex items-center gap-2">
          {vacancy.officialLinks.notificationPdfUrl && (
            <a
              href={vacancy.officialLinks.notificationPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-white text-xs font-medium transition"
              title="Download Notification PDF"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
            </a>
          )}

          {vacancy.status === 'active' && vacancy.officialLinks.applyOnlineUrl && (
            <a
              href={vacancy.officialLinks.applyOnlineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm shadow-amber-600/20"
            >
              <span>{isHi ? 'ऑनलाइन आवेदन' : 'Apply Online'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {vacancy.status === 'admit_card_out' && vacancy.officialLinks.admitCardUrl && (
            <a
              href={vacancy.officialLinks.admitCardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
            >
              <span>{isHi ? 'एडमिट कार्ड' : 'Get Card'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {vacancy.status === 'result_declared' && vacancy.officialLinks.resultPdfUrl && (
            <a
              href={vacancy.officialLinks.resultPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition"
            >
              <span>{isHi ? 'रिजल्ट चेक करें' : 'Check Result'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
