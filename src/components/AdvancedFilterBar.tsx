import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw, MapPin, Briefcase, GraduationCap, DollarSign, Filter, Check } from 'lucide-react';
import { LanguageMode, BoardType, CategoryType, QualificationType } from '../types';

interface AdvancedFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedBoard: BoardType | 'ALL';
  setSelectedBoard: (b: BoardType | 'ALL') => void;
  selectedCategory: CategoryType | 'ALL';
  setSelectedCategory: (c: CategoryType | 'ALL') => void;
  selectedQualification: QualificationType | 'ALL';
  setSelectedQualification: (q: QualificationType | 'ALL') => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  selectedJobType: string;
  setSelectedJobType: (jt: string) => void;
  selectedSalaryRange: string;
  setSelectedSalaryRange: (sr: string) => void;
  sortBy: 'latest' | 'deadline' | 'posts';
  setSortBy: (s: 'latest' | 'deadline' | 'posts') => void;
  onResetFilters: () => void;
  totalResultsCount: number;
  lang: LanguageMode;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedBoard,
  setSelectedBoard,
  selectedCategory,
  setSelectedCategory,
  selectedQualification,
  setSelectedQualification,
  selectedLocation,
  setSelectedLocation,
  selectedJobType,
  setSelectedJobType,
  selectedSalaryRange,
  setSelectedSalaryRange,
  sortBy,
  setSortBy,
  onResetFilters,
  totalResultsCount,
  lang,
}) => {
  const isHi = lang === 'hi';
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = 
    searchQuery.trim() !== '' ||
    selectedBoard !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedQualification !== 'ALL' ||
    selectedLocation !== 'ALL' ||
    selectedJobType !== 'ALL' ||
    selectedSalaryRange !== 'ALL';

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
      {/* Primary Search & Quick Toggle Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHi ? 'भर्ती, विभाग, पद या कीवर्ड से खोजें (जैसे: TGT, Police, VDC)...' : 'Search by job title, department, keyword...'}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
              isExpanded || hasActiveFilters
                ? 'bg-sky-50 text-[#0284c7] border-sky-300 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#0284c7]" />
            <span>{isHi ? 'एडवांस्ड फ़िल्टर' : 'Advanced Filters'}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#0284c7] inline-block animate-pulse"></span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
              title={isHi ? 'सभी फ़िल्टर रीसेट करें' : 'Reset all filters'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isHi ? 'रीसेट' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Advanced Filters Panel */}
      {isExpanded && (
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-fadeIn">
          {/* 1. Location Filter */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>{isHi ? 'स्थान (Location)' : 'Location'}</span>
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 font-medium focus:ring-1 focus:ring-[#0284c7]"
            >
              <option value="ALL">{isHi ? 'सभी स्थान (All Locations)' : 'All Locations'}</option>
              <option value="rajasthan">राजस्थान (Rajasthan)</option>
              <option value="uttar pradesh">उत्तर प्रदेश (Uttar Pradesh)</option>
              <option value="delhi">दिल्ली (Delhi)</option>
              <option value="all india">अखिल भारतीय (All India / Remote)</option>
            </select>
          </div>

          {/* 2. Industry / Department Filter */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isHi ? 'विभाग / इंडस्ट्री (Department)' : 'Department / Industry'}</span>
            </label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 font-medium focus:ring-1 focus:ring-[#0284c7]"
            >
              <option value="ALL">{isHi ? 'सभी विभाग (All Boards/Depts)' : 'All Departments'}</option>
              <option value="Education Department">शिक्षा विभाग (Education Dept)</option>
              <option value="RSMSSB">आरएसएमएसएसबी (RSMSSB)</option>
              <option value="RPSC">आरपीएससी (RPSC)</option>
              <option value="Rajasthan Police">राजस्थान पुलिस (Rajasthan Police)</option>
              <option value="Railway Board">रेलवे बोर्ड (Railway Board)</option>
              <option value="Sarkari Yojana">सरकारी योजना (Sarkari Yojana)</option>
              <option value="Central Govt">केंद्र सरकार (Central Govt)</option>
            </select>
          </div>

          {/* 3. Job Type / Contract Type */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHi ? 'नौकरी का प्रकार (Job Type)' : 'Job Type'}</span>
            </label>
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 font-medium focus:ring-1 focus:ring-[#0284c7]"
            >
              <option value="ALL">{isHi ? 'सभी प्रकार (All Types)' : 'All Job Types'}</option>
              <option value="regular">{isHi ? 'नियमित / स्थायी (Regular Govt Job)' : 'Regular / Permanent'}</option>
              <option value="contract">{isHi ? 'संविदा / अनुबंध (Contractual Basis)' : 'Contractual'}</option>
              <option value="scheme">{isHi ? 'सरकारी योजना (Sarkari Yojana)' : 'Government Scheme'}</option>
            </select>
          </div>

          {/* 4. Experience Level / Qualification */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHi ? 'योग्यता / स्तर (Qualification)' : 'Qualification Level'}</span>
            </label>
            <select
              value={selectedQualification}
              onChange={(e) => setSelectedQualification(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 font-medium focus:ring-1 focus:ring-[#0284c7]"
            >
              <option value="ALL">{isHi ? 'सभी योग्यताएं (All Qualifications)' : 'All Qualifications'}</option>
              <option value="10th">10वीं पास (Entry Level - 10th)</option>
              <option value="12th">12वीं पास (Mid Level - 12th)</option>
              <option value="Graduate">स्नातक (Graduate)</option>
              <option value="PostGraduate">स्नातकोत्तर (Post Graduate)</option>
              <option value="B.Ed/BSTC">शिक्षक योग्यता (B.Ed / BSTC / CTET)</option>
              <option value="ITI/Diploma">आईटीआई / डिप्लोमा (ITI / Diploma)</option>
            </select>
          </div>

          {/* 5. Salary Range Filter */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isHi ? 'वेतनमान / मानदेय (Salary Range)' : 'Salary Range'}</span>
            </label>
            <select
              value={selectedSalaryRange}
              onChange={(e) => setSelectedSalaryRange(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 font-medium focus:ring-1 focus:ring-[#0284c7]"
            >
              <option value="ALL">{isHi ? 'सभी वेतनमान (All Salary Ranges)' : 'All Salary Ranges'}</option>
              <option value="20k">₹20,000+ प्रति माह (Level-2+)</option>
              <option value="40k">₹40,000+ प्रति माह (Level-7+ / TGT/PGT)</option>
              <option value="contract">संविदा समेकित मानदेय (Contract Package)</option>
            </select>
          </div>

          {/* 6. Sort Order */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
              <span>{isHi ? 'क्रमबद्ध करें (Sort By)' : 'Sort By'}</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 font-medium focus:ring-1 focus:ring-[#0284c7]"
            >
              <option value="latest">{isHi ? 'नवीनतम पहले (Latest First)' : 'Newest First'}</option>
              <option value="deadline">{isHi ? 'अंतिम तिथि क्रमानुसार (Deadline)' : 'Earliest Deadline'}</option>
              <option value="posts">{isHi ? 'सर्वाधिक पद (Most Posts)' : 'Most Vacancies'}</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Count & Active Filter Pills */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100 flex-wrap gap-2">
        <div className="font-medium">
          {isHi ? `कुल ${totalResultsCount} परिणाम मिले` : `Found ${totalResultsCount} matching posts`}
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold">{isHi ? 'सक्रिय फ़िल्टर:' : 'Active:'}</span>
            {selectedLocation !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-[11px] font-bold">
                📍 {selectedLocation}
              </span>
            )}
            {selectedBoard !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[11px] font-bold">
                🏛️ {selectedBoard}
              </span>
            )}
            {selectedQualification !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[11px] font-bold">
                🎓 {selectedQualification}
              </span>
            )}
            {selectedJobType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold">
                💼 {selectedJobType}
              </span>
            )}
            {selectedSalaryRange !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[11px] font-bold">
                💵 {selectedSalaryRange}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
