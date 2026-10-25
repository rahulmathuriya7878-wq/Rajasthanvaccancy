import React from 'react';
import { 
  Search, 
  X, 
  Filter, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { BoardType, CategoryType, QualificationType, JobStatusType, LanguageMode } from '../types';

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBoard: BoardType | 'ALL';
  setSelectedBoard: (board: BoardType | 'ALL') => void;
  selectedCategory: CategoryType | 'ALL';
  setSelectedCategory: (category: CategoryType | 'ALL') => void;
  selectedQualification: QualificationType | 'ALL';
  setSelectedQualification: (qual: QualificationType | 'ALL') => void;
  selectedStatus: JobStatusType | 'ALL';
  setSelectedStatus: (status: JobStatusType | 'ALL') => void;
  totalResults: number;
  onResetFilters: () => void;
  lang: LanguageMode;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  setSearchQuery,
  selectedBoard,
  setSelectedBoard,
  selectedCategory,
  setSelectedCategory,
  selectedQualification,
  setSelectedQualification,
  selectedStatus,
  setSelectedStatus,
  totalResults,
  onResetFilters,
  lang,
}) => {
  const isHi = lang === 'hi';

  const boards: { id: BoardType | 'ALL'; labelEn: string; labelHi: string }[] = [
    { id: 'ALL', labelEn: 'All Boards', labelHi: 'सभी बोर्ड' },
    { id: 'RSMSSB', labelEn: 'RSMSSB (चयन बोर्ड)', labelHi: 'RSMSSB कर्मचारी चयन बोर्ड' },
    { id: 'RPSC', labelEn: 'RPSC (लोक सेवा आयोग)', labelHi: 'RPSC लोक सेवा आयोग' },
    { id: 'Rajasthan Police', labelEn: 'Raj Police', labelHi: 'राजस्थान पुलिस' },
    { id: 'Rajasthan High Court', labelEn: 'High Court', labelHi: 'हाई कोर्ट' },
    { id: 'Education Department', labelEn: 'REET / Education', labelHi: 'रीट / शिक्षा विभाग' },
    { id: 'Central Govt', labelEn: 'Central (SSC/Railway)', labelHi: 'केन्द्रीय (SSC/रेलवे)' },
    { id: 'Discom / RVUNL', labelEn: 'Bijli Vibhag', labelHi: 'बिजली विभाग RVUNL' },
    { id: 'Health RUHS / NHM', labelEn: 'Health / CHO', labelHi: 'स्वास्थ्य NHM/CHO' },
    { id: 'Sarkari Yojana', labelEn: 'Yojana & Scholarships', labelHi: 'सरकारी योजना व छात्रवृत्ति' },
  ];

  const categories: { id: CategoryType | 'ALL'; labelEn: string; labelHi: string }[] = [
    { id: 'ALL', labelEn: 'All Categories', labelHi: 'सभी सूचनाएं' },
    { id: 'latest_job', labelEn: 'Govt Jobs', labelHi: 'सरकारी भर्तियां' },
    { id: 'admit_card', labelEn: 'Admit Cards', labelHi: 'प्रवेश पत्र' },
    { id: 'result', labelEn: 'Results', labelHi: 'रिजल्ट' },
    { id: 'answer_key', labelEn: 'Answer Keys', labelHi: 'उत्तर कुंजी' },
    { id: 'syllabus', labelEn: 'Syllabus & Pattern', labelHi: 'सिलेबस' },
    { id: 'scheme', labelEn: 'Scholarships / Schemes', labelHi: 'योजना / छात्रवृत्ति' },
    { id: 'upcoming', labelEn: 'Upcoming Jobs', labelHi: 'आगामी भर्तियां' },
  ];

  const qualifications: { id: QualificationType | 'ALL'; labelEn: string; labelHi: string }[] = [
    { id: 'ALL', labelEn: 'Any Education', labelHi: 'सभी योग्यताएं' },
    { id: '10th', labelEn: '10th Pass', labelHi: '10वीं पास' },
    { id: '12th', labelEn: '12th Pass', labelHi: '12वीं पास' },
    { id: 'Graduate', labelEn: 'Graduate (स्नातक)', labelHi: 'स्नातक (Graduate)' },
    { id: 'PostGraduate', labelEn: 'Post Graduate (PG)', labelHi: 'स्नातकोत्तर (PG)' },
    { id: 'B.Ed/BSTC', labelEn: 'B.Ed / BSTC (Teacher)', labelHi: 'बीएड / बीएसटीसी' },
    { id: 'ITI/Diploma', labelEn: 'ITI / Diploma', labelHi: 'आईटीआई / डिप्लोमा' },
    { id: 'Engineering', labelEn: 'B.Tech / Engineering', labelHi: 'इंजीनियरिंग / बीटेक' },
    { id: 'Medical', labelEn: 'Medical / Nursing', labelHi: 'मेडिकल / नर्सिंग' },
  ];

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedBoard !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedQualification !== 'ALL' ||
    selectedStatus !== 'ALL';

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 sm:p-6 mb-8">
      {/* Search Input Box */}
      <div className="relative w-full mb-2">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isHi ? 'भर्ती का नाम, पद, विभाग या विज्ञापन सं. खोजें...' : 'Search by job title, department, advt...'}
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title="खोज साफ करें"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Popular Trending Quick Search Chips */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4 text-xs pt-1">
        <span className="text-slate-500 font-bold flex items-center gap-1 text-[11px] shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>{isHi ? 'लोकप्रिय खोजें:' : 'Trending:'}</span>
        </span>
        {[
          'राजस्थान पुलिस',
          'पटवारी',
          'पशु परिचर',
          'REET',
          'CET 12th',
          'RPSC SI',
          'एडमिट कार्ड',
          'रिजल्ट'
        ].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSearchQuery(searchQuery === tag ? '' : tag)}
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition cursor-pointer border ${
              searchQuery === tag
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200 hover:border-amber-300'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{isHi ? cat.labelHi : cat.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Boards Filter Chips */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>{isHi ? 'बोर्ड / भर्ती आयोग:' : 'Select Board / Commission:'}</span>
          </span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-amber-700 hover:text-amber-800 font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              <X className="w-3 h-3" />
              <span>{isHi ? 'सभी फ़िल्टर हटाएं' : 'Reset Filters'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {boards.map((b) => {
            const isSelected = selectedBoard === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBoard(b.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-orange-50 border-orange-500 text-orange-900 ring-1 ring-orange-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isHi ? b.labelHi : b.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Qualification Row */}
      <div className="pt-3 mt-1 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          <span>{isHi ? 'शैक्षणिक योग्यता अनुसार देखें:' : 'Filter by Qualification:'}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {qualifications.map((q) => {
            const isSelected = selectedQualification === q.id;
            return (
              <button
                key={q.id}
                onClick={() => setSelectedQualification(q.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isHi ? q.labelHi : q.labelEn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
