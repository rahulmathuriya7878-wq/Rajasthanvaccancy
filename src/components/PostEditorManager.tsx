import React, { useState } from 'react';
import { VacancyItem, LanguageMode } from '../types';
import { VacancyDetailPage } from './VacancyDetailPage';
import { AddVacancyModal } from './AddVacancyModal';
import { Edit3, SlidersHorizontal, ShieldCheck, Sparkles } from 'lucide-react';

export interface PostEditorManagerProps {
  vacancy: VacancyItem;
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
  isAdmin: boolean;
  onUpdateVacancy: (updatedItem: VacancyItem) => void;
  onDeleteVacancy?: (id: string) => void;
  allVacancies?: VacancyItem[];
  onSelectOtherVacancy?: (item: VacancyItem) => void;
}

/**
 * PostEditorManager (संपूर्ण पोस्ट संपादक)
 * Integrates both:
 * 1. ✏️ वर्ड इन-प्लेस लाइव एडिट मोड (Live Word In-Place Page Editor)
 * 2. ⚡ डायरेक्ट सेक्शन व पोस्ट अपडेट (Direct Section Order & Form Editor)
 */
export const PostEditorManager: React.FC<PostEditorManagerProps> = ({
  vacancy,
  isOpen,
  onClose,
  lang,
  isAdmin,
  onUpdateVacancy,
  onDeleteVacancy,
  allVacancies = [],
  onSelectOtherVacancy
}) => {
  const [editorMode, setEditorMode] = useState<'live_word' | 'section_form'>('live_word');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-white w-screen h-screen overflow-hidden">
      {/* Top Admin Workspace Header */}
      <div className="h-12 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-800 shadow-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>संपूर्ण पोस्ट संपादक (Full Editor)</span>
          </div>
          <h2 className="text-sm font-extrabold text-white truncate max-w-sm">
            {vacancy.shortTitleHi || vacancy.titleHi || vacancy.title}
          </h2>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditorMode('live_word')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              editorMode === 'live_word'
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>✏️ वर्ड इन-प्लेस लाइव एडिट मोड</span>
          </button>

          <button
            type="button"
            onClick={() => setEditorMode('section_form')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              editorMode === 'section_form'
                ? 'bg-sky-600 text-white ring-2 ring-sky-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>⚡ डायरेक्ट सेक्शन व फॉर्म अपडेट</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="ml-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto bg-white text-slate-900">
        {editorMode === 'live_word' ? (
          <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            <VacancyDetailPage
              vacancy={vacancy}
              onBack={onClose}
              lang={lang}
              isSaved={false}
              onToggleSave={() => {}}
              allVacancies={allVacancies}
              onSelectOtherVacancy={onSelectOtherVacancy || (() => {})}
              onUpdateVacancy={onUpdateVacancy}
              onDeleteVacancy={onDeleteVacancy}
              isAdmin={isAdmin}
            />
          </div>
        ) : (
          <AddVacancyModal
            isOpen={isOpen}
            onClose={onClose}
            onAddVacancy={() => {}}
            onUpdateVacancy={onUpdateVacancy}
            onDeleteVacancy={onDeleteVacancy}
            editItem={vacancy}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
};

export default PostEditorManager;
