import React, { useState, useEffect, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  FastUpdatesGrid 
} from './components/FastUpdatesGrid';
import { 
  VacancyDetailPage 
} from './components/VacancyDetailPage';
import { 
  FAQSection 
} from './components/FAQSection';
import { 
  AgeCalculatorModal 
} from './components/AgeCalculatorModal';
import { 
  EligibilityFinderModal 
} from './components/EligibilityFinderModal';
import { 
  ExamCalendarModal 
} from './components/ExamCalendarModal';
import { 
  SSOGuideModal 
} from './components/SSOGuideModal';
import { 
  SavedJobsModal 
} from './components/SavedJobsModal';
import { 
  AddVacancyModal 
} from './components/AddVacancyModal';

import { INITIAL_VACANCIES } from './data/mockVacancies';
import { 
  VacancyItem, 
  BoardType, 
  CategoryType, 
  QualificationType, 
  JobStatusType, 
  LanguageMode 
} from './types';

import { 
  SlidersHorizontal, 
  Sparkles, 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpDown,
  FileQuestion
} from 'lucide-react';

const STORAGE_KEY_VACANCIES = 'raj_vacancies_v7';
const STORAGE_KEY_SAVED = 'raj_saved_ids_v3';
const STORAGE_KEY_LANG = 'raj_lang_pref_v2';

// Clear legacy cached vacancies
try {
  localStorage.removeItem('raj_vacancies_v1');
  localStorage.removeItem('raj_vacancies_v2');
  localStorage.removeItem('raj_vacancies_v3');
  localStorage.removeItem('raj_vacancies_v4');
  localStorage.removeItem('raj_vacancies_v5');
  localStorage.removeItem('raj_vacancies_v6');
  localStorage.removeItem('raj_saved_ids_v1');
  localStorage.removeItem('raj_saved_ids_v2');
} catch (e) {}

export default function App() {
  // Pure Hindi language
  const [lang, setLang] = useState<LanguageMode>('hi');

  // Vacancies state with localStorage sync (loads Sainik School Chittorgarh recruitment by default)
  const [vacancies, setVacancies] = useState<VacancyItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VACANCIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load stored vacancies', e);
    }
    return INITIAL_VACANCIES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VACANCIES, JSON.stringify(vacancies));
  }, [vacancies]);

  // Saved / Bookmarked IDs
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load saved IDs', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedIds));
  }, [savedIds]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<BoardType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
  const [selectedQualification, setSelectedQualification] = useState<QualificationType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<JobStatusType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'deadline' | 'posts'>('latest');

  // Modals & Selection
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyItem | null>(null);
  const [isAgeCalcOpen, setIsAgeCalcOpen] = useState(false);
  const [ageCalcParams, setAgeCalcParams] = useState<{ asOnDate?: string; minAge?: number; maxAge?: number }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);
  const [isSSOGuideOpen, setIsSSOGuideOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  // Deep linking sync for SEO (reads ?vacancy=... and ?category=... from URL/sitemap)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const vacancyParam = params.get('vacancy');
      const categoryParam = params.get('category');

      if (vacancyParam) {
        const found = vacancies.find((v) => v.id === vacancyParam);
        if (found) {
          setSelectedVacancy(found);
        }
      }

      if (categoryParam && categoryParam !== 'ALL') {
        setSelectedCategory(categoryParam as CategoryType);
      }
    } catch (e) {
      console.error('Error parsing URL params for SEO', e);
    }
  }, []);

  // Update URL and document title when selectedVacancy changes
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selectedVacancy) {
        url.searchParams.set('vacancy', selectedVacancy.id);
        window.history.replaceState({}, '', url.toString());
        document.title = `${lang === 'hi' ? selectedVacancy.titleHi : selectedVacancy.title} - Rajasthan Vacancy`;
      } else {
        url.searchParams.delete('vacancy');
        window.history.replaceState({}, '', url.toString());
        document.title = 'RAJASTHAN VACCANCY/JOBS - Govt Job Alerts & Recruitment Portal';
      }
    } catch (e) {
      console.error('Error updating URL params', e);
    }
  }, [selectedVacancy, lang]);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSave = (id: string) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter(i => i !== id));
      showToast(lang === 'hi' ? 'भर्ती को सुरक्षित सूची से हटाया गया' : 'Removed from saved jobs');
    } else {
      setSavedIds([...savedIds, id]);
      showToast(lang === 'hi' ? 'भर्ती को सुरक्षित सूची में जोड़ा गया ★' : 'Notification saved successfully ★');
    }
  };

  const handleShareVacancy = (item: VacancyItem) => {
    const text = `${item.title}\nTotal Vacancies: ${item.totalPosts}\nLast Date: ${item.importantDates.applyLastDate}\nCheck details on RAJASTHAN VACCANCY/JOBS`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      showToast(lang === 'hi' ? 'भर्ती का लिंक कॉपी हो गया!' : 'Alert link copied to clipboard!');
    }
  };

  const handleAddVacancy = (newJob: VacancyItem) => {
    setVacancies([newJob, ...vacancies]);
    if (newJob.category === 'scheme' || newJob.organization === 'Sarkari Yojana') {
      showToast(lang === 'hi' ? 'सरकारी योजना सफलतापूर्वक योजना सेक्शन में जोड़ी गई!' : 'Scheme alert posted in Yojana section!');
    } else {
      showToast(lang === 'hi' ? 'सरकारी भर्ती सफलतापूर्वक जॉब्स सेक्शन में जोड़ी गई!' : 'Govt job alert posted in Jobs section!');
    }
  };

  const handleOpenAgeCalcWithParams = (asOnDate?: string, minAge?: number, maxAge?: number) => {
    setAgeCalcParams({ asOnDate, minAge, maxAge });
    setIsAgeCalcOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBoard('ALL');
    setSelectedCategory('ALL');
    setSelectedQualification('ALL');
    setSelectedStatus('ALL');
  };

  // Filtered and Sorted vacancies
  const filteredVacancies = useMemo(() => {
    return vacancies.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(query);
        const inTitleHi = item.titleHi.toLowerCase().includes(query);
        const inDept = item.department.toLowerCase().includes(query);
        const inAdvt = item.advtNo.toLowerCase().includes(query);
        const inPost = item.postName.toLowerCase().includes(query);
        const inTags = item.tags.some(t => t.toLowerCase().includes(query));
        if (!inTitle && !inTitleHi && !inDept && !inAdvt && !inPost && !inTags) {
          return false;
        }
      }

      // 2. Board
      if (selectedBoard !== 'ALL' && item.organization !== selectedBoard) {
        return false;
      }

      // 3. Category
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // 4. Qualification
      if (selectedQualification !== 'ALL') {
        if (!item.qualification.includes(selectedQualification)) {
          return false;
        }
      }

      // 5. Status
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        const dateA = a.importantDates.applyLastDate || '9999-99-99';
        const dateB = b.importantDates.applyLastDate || '9999-99-99';
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'posts') {
        const postsA = typeof a.totalPosts === 'number' ? a.totalPosts : 0;
        const postsB = typeof b.totalPosts === 'number' ? b.totalPosts : 0;
        return postsB - postsA;
      }
      // default: latest
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [vacancies, searchQuery, selectedBoard, selectedCategory, selectedQualification, selectedStatus, sortBy]);

  const isHi = lang === 'hi';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        lang={lang}
        setLang={setLang}
        savedCount={savedIds.length}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenAgeCalc={() => handleOpenAgeCalcWithParams()}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenEligibility={() => setIsEligibilityOpen(true)}
        onOpenAddJob={() => setIsAddJobOpen(true)}
        onOpenSSOGuide={() => setIsSSOGuideOpen(true)}
        onGoHome={() => {
          setSelectedVacancy(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        latestVacancies={vacancies}
        onSelectVacancy={(item) => {
          setSelectedVacancy(item);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 flex-1 w-full">
        {selectedVacancy ? (
          /* Full Page View instead of Popup Modal */
          <VacancyDetailPage
            vacancy={selectedVacancy}
            onBack={() => {
              setSelectedVacancy(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            lang={lang}
            isSaved={savedIds.includes(selectedVacancy.id)}
            onToggleSave={handleToggleSave}
            allVacancies={vacancies}
            onSelectOtherVacancy={(item) => {
              setSelectedVacancy(item);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          /* Home View: 5-Box Fast Access Updates & FAQ */
          <div className="space-y-6">
            {/* 5-Box Fast Access Updates (Home View) */}
            <FastUpdatesGrid
              vacancies={vacancies}
              lang={lang}
              onSelectVacancy={(item) => {
                setSelectedVacancy(item);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Frequently Asked Questions (FAQ / FQA) Section */}
            <FAQSection lang={lang} />
          </div>
        )}
      </main>

      {/* Clean Minimal Light Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-bold text-slate-800">
            RAJASTHAN <span className="text-amber-600">VACCANCY/JOBS</span>
          </p>
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} RAJASTHAN VACCANCY/JOBS — राजस्थान सरकारी भर्ती एवं परीक्षा परिणाम मंच
          </p>
        </div>
      </footer>

      {/* Other Utility Modals */}

      <AgeCalculatorModal
        isOpen={isAgeCalcOpen}
        onClose={() => setIsAgeCalcOpen(false)}
        lang={lang}
        initialCutoffDate={ageCalcParams.asOnDate}
        initialMinAge={ageCalcParams.minAge}
        initialMaxAge={ageCalcParams.maxAge}
      />

      <EligibilityFinderModal
        isOpen={isEligibilityOpen}
        onClose={() => setIsEligibilityOpen(false)}
        vacancies={vacancies}
        lang={lang}
        onSelectVacancy={(item) => setSelectedVacancy(item)}
      />

      <ExamCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        lang={lang}
      />

      <SSOGuideModal
        isOpen={isSSOGuideOpen}
        onClose={() => setIsSSOGuideOpen(false)}
        lang={lang}
      />

      <SavedJobsModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedIds={savedIds}
        vacancies={vacancies}
        lang={lang}
        onRemoveSave={handleToggleSave}
        onSelectVacancy={(item) => setSelectedVacancy(item)}
        onClearAll={() => {
          setSavedIds([]);
          showToast(lang === 'hi' ? 'सभी सुरक्षित सूचनाएं हटा दी गईं' : 'All saved notifications cleared');
        }}
      />

      <AddVacancyModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        lang={lang}
        onAddVacancy={handleAddVacancy}
      />
    </div>
  );
}
