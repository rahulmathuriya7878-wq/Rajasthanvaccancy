import React from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  ChevronRight, 
  Clock 
} from 'lucide-react';
import { VacancyItem, LanguageMode } from '../types';

interface SavedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedIds: string[];
  vacancies: VacancyItem[];
  lang: LanguageMode;
  onRemoveSave: (id: string) => void;
  onSelectVacancy: (item: VacancyItem) => void;
  onClearAll: () => void;
}

export const SavedJobsModal: React.FC<SavedJobsModalProps> = ({
  isOpen,
  onClose,
  savedIds,
  vacancies,
  lang,
  onRemoveSave,
  onSelectVacancy,
  onClearAll,
}) => {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  const savedList = vacancies.filter((v) => savedIds.includes(v.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                {isHi ? 'सुरक्षित की गई भर्तियां (Saved Notifications)' : 'Saved Job Notifications'}
              </h2>
              <p className="text-xs text-slate-400">
                {savedList.length} {isHi ? 'सूचनाएं आपके डिवाइस पर सुरक्षित हैं' : 'notifications tracked on this device'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {savedList.length > 0 ? (
            <div className="space-y-2.5">
              {savedList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl p-3.5 flex items-start justify-between gap-3 transition shadow-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {item.organization}
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.importantDates.applyLastDate}</span>
                      </span>
                    </div>

                    <h4
                      onClick={() => {
                        onClose();
                        onSelectVacancy(item);
                      }}
                      className="font-bold text-slate-900 text-sm hover:text-amber-700 cursor-pointer line-clamp-1"
                    >
                      {isHi ? item.titleHi : item.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {isHi ? item.qualificationDetailsHi : item.qualificationDetails}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectVacancy(item);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-amber-700 text-xs font-semibold"
                      title="View Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveSave(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">
                {isHi ? 'कोई सुरक्षित भर्ती नहीं है' : 'No saved notifications yet'}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {isHi ? 'भर्ती कार्ड पर बुकमार्क आइकन दबाकर सूचनाएं यहां जोड़ें' : 'Bookmark any vacancy card to easily track deadlines here'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
          {savedList.length > 0 ? (
            <button
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isHi ? 'सभी हटाएं' : 'Clear All'}</span>
            </button>
          ) : <div />}

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
