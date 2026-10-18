import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { 
  Briefcase, 
  Building2, 
  TrendingUp, 
  Users, 
  Layers, 
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { VacancyItem, LanguageMode } from '../types';

interface DepartmentVacancyChartProps {
  vacancies: VacancyItem[];
  lang: LanguageMode;
  onSelectVacancy: (item: VacancyItem) => void;
}

interface DepartmentStat {
  deptKey: string;
  name: string;
  nameHi: string;
  totalPosts: number;
  jobCount: number;
  jobs: VacancyItem[];
  color: string;
}

const DEPT_COLORS = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#ea580c', // Orange
];

export const DepartmentVacancyChart: React.FC<DepartmentVacancyChartProps> = ({
  vacancies,
  lang,
  onSelectVacancy,
}) => {
  const isHi = lang === 'hi';
  const [metricMode, setMetricMode] = useState<'posts' | 'jobs'>('posts');
  const [selectedDeptKey, setSelectedDeptKey] = useState<string | null>(null);

  // Group vacancies by standardized department (excluding Sarkari Yojanas/schemes)
  const departmentStats = useMemo(() => {
    // Only government recruitment jobs
    const jobVacancies = vacancies.filter(
      (v) => v.category !== 'scheme' && v.organization !== 'Sarkari Yojana'
    );

    const map = new Map<string, DepartmentStat>();

    const getNormalizedDept = (item: VacancyItem): { key: string; name: string; nameHi: string } => {
      const text = `${item.department} ${item.departmentHi || ''} ${item.organization} ${item.title}`.toLowerCase();
      
      if (text.includes('police') || text.includes('पुलिस') || text.includes('कांस्टेबल') || text.includes('गृह')) {
        return { key: 'police', name: 'Police & Home Guard', nameHi: 'पुलिस एवं गृह रक्षा' };
      }
      if (text.includes('school') || text.includes('शिक्षा') || text.includes('tgt') || text.includes('reet') || text.includes('lecturer') || text.includes('teacher') || text.includes('प्राध्यापक')) {
        return { key: 'education', name: 'Education Dept', nameHi: 'शिक्षा विभाग' };
      }
      if (text.includes('pashu') || text.includes('पशु') || text.includes('animal') || text.includes('परिचर')) {
        return { key: 'animal', name: 'Animal Husbandry', nameHi: 'पशुपालन विभाग' };
      }
      if (text.includes('patwari') || text.includes('पटवारी') || text.includes('revenue') || text.includes('राजस्व')) {
        return { key: 'revenue', name: 'Revenue Dept', nameHi: 'राजस्व विभाग' };
      }
      if (text.includes('health') || text.includes('चिकित्सा') || text.includes('स्वास्थ्य') || text.includes('cho') || text.includes('ruhs') || text.includes('nhm')) {
        return { key: 'health', name: 'Medical & Health', nameHi: 'चिकित्सा व स्वास्थ्य' };
      }
      if (text.includes('discom') || text.includes('rvunl') || text.includes('बिजली') || text.includes('विद्युत') || text.includes('energy')) {
        return { key: 'energy', name: 'Energy & Discoms', nameHi: 'ऊर्जा व विद्युत निगम' };
      }
      if (text.includes('court') || text.includes('न्यायालय') || text.includes('न्याय') || text.includes('judiciary')) {
        return { key: 'court', name: 'High Court & Law', nameHi: 'उच्च न्यायालय व न्याय' };
      }
      if (text.includes('rpsc') || text.includes('ras') || text.includes('secretariat') || text.includes('सचिवालय')) {
        return { key: 'admin', name: 'Administrative / RPSC', nameHi: 'प्रशासनिक सेवाएं' };
      }

      // Fallback: use organization or first part of department
      const fallbackName = item.organization || item.department.split(',')[0] || 'State Departments';
      const fallbackNameHi = item.departmentHi?.split(',')[0] || item.organization;
      return { 
        key: fallbackName.toLowerCase().replace(/[^a-z0-9]/g, '-'), 
        name: fallbackName, 
        nameHi: fallbackNameHi 
      };
    };

    jobVacancies.forEach((v) => {
      const { key, name, nameHi } = getNormalizedDept(v);
      
      // Parse numeric posts
      let postCount = 0;
      if (typeof v.totalPosts === 'number') {
        postCount = v.totalPosts;
      } else if (typeof v.totalPosts === 'string') {
        const cleaned = v.totalPosts.replace(/[^0-9]/g, '');
        postCount = cleaned ? parseInt(cleaned, 10) : 0;
      }

      if (!map.has(key)) {
        const colorIndex = map.size % DEPT_COLORS.length;
        map.set(key, {
          deptKey: key,
          name,
          nameHi,
          totalPosts: 0,
          jobCount: 0,
          jobs: [],
          color: DEPT_COLORS[colorIndex],
        });
      }

      const stat = map.get(key)!;
      stat.totalPosts += postCount;
      stat.jobCount += 1;
      stat.jobs.push(v);
    });

    // Convert map to array and sort descending by total posts
    return Array.from(map.values()).sort((a, b) => b.totalPosts - a.totalPosts);
  }, [vacancies]);

  // Chart data formatted for Recharts
  const chartData = useMemo(() => {
    return departmentStats.map((stat) => ({
      key: stat.deptKey,
      name: isHi ? stat.nameHi : stat.name,
      displayName: isHi ? stat.nameHi : stat.name,
      fullName: isHi ? stat.nameHi : stat.name,
      value: metricMode === 'posts' ? stat.totalPosts : stat.jobCount,
      posts: stat.totalPosts,
      jobs: stat.jobCount,
      color: stat.color,
      rawStat: stat,
    }));
  }, [departmentStats, isHi, metricMode]);

  // Aggregate stats
  const totalPostsOverall = useMemo(() => {
    return departmentStats.reduce((sum, d) => sum + d.totalPosts, 0);
  }, [departmentStats]);

  const totalJobsOverall = useMemo(() => {
    return departmentStats.reduce((sum, d) => sum + d.jobCount, 0);
  }, [departmentStats]);

  const topDepartment = departmentStats[0];

  // Currently focused department details
  const activeDeptStat = useMemo(() => {
    if (!selectedDeptKey) return null;
    return departmentStats.find((d) => d.deptKey === selectedDeptKey) || null;
  }, [selectedDeptKey, departmentStats]);

  if (departmentStats.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8 transition hover:border-slate-300">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isHi ? 'विभाग अनुसार उपलब्ध रिक्त पद' : 'Available Vacancies by Department'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isHi 
              ? 'राजस्थान सरकार के प्रमुख विभागों में वर्तमान में विज्ञापित पदों एवं अवसरों का आधिकारिक सांख्यिकी विवरण' 
              : 'Statistical breakdown of open government vacancies across Rajasthan departments'}
          </p>
        </div>

        {/* Metric Selector Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
          <button
            type="button"
            onClick={() => setMetricMode('posts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              metricMode === 'posts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isHi ? 'कुल रिक्त पद (Posts)' : 'Total Posts'}
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('jobs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              metricMode === 'jobs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isHi ? 'विज्ञप्ति संख्या (Alerts)' : 'Job Alerts'}
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>{isHi ? 'कुल विज्ञापित पद' : 'Total Posts'}</span>
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums">
            {totalPostsOverall.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isHi ? 'राज्य स्तरीय सक्रिय भर्तियां' : 'Active state recruitments'}
          </p>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHi ? 'सक्रिय विभाग' : 'Active Departments'}</span>
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums">
            {departmentStats.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isHi ? 'सरकारी आयोग एवं बोर्ड' : 'Govt commissions & boards'}
          </p>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>{isHi ? 'सर्वाधिक पदों वाला विभाग' : 'Top Department'}</span>
          </div>
          <div className="mt-1 text-sm sm:text-base font-black text-slate-900 truncate" title={topDepartment ? (isHi ? topDepartment.nameHi : topDepartment.name) : ''}>
            {topDepartment ? (isHi ? topDepartment.nameHi : topDepartment.name) : '-'}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono tabular-nums">
            {topDepartment ? `${topDepartment.totalPosts.toLocaleString('en-IN')} ${isHi ? 'पद' : 'posts'}` : ''}
          </p>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>{isHi ? 'कुल भर्ती सूचनाएं' : 'Total Notifications'}</span>
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums">
            {totalJobsOverall}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isHi ? 'सीधी भर्ती विज्ञप्तियां' : 'Direct recruitment notices'}
          </p>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 16, right: 16, left: -10, bottom: 40 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const clickedKey = state.activePayload[0].payload.key;
                setSelectedDeptKey(selectedDeptKey === clickedKey ? null : clickedKey);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
              stroke="#cbd5e1"
            />
            <YAxis
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(val) => val.toLocaleString('en-IN')}
              stroke="#cbd5e1"
            />
            <Tooltip
              cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white px-3 py-2.5 rounded-xl shadow-xl text-xs border border-slate-800 space-y-1 z-50">
                      <p className="font-bold text-amber-400 text-sm">{data.fullName}</p>
                      <div className="flex items-center justify-between gap-4 text-slate-300">
                        <span>{isHi ? 'कुल रिक्त पद:' : 'Total Posts:'}</span>
                        <span className="font-mono font-bold text-white tabular-nums">
                          {data.posts.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-300">
                        <span>{isHi ? 'भर्ती विज्ञप्तियां:' : 'Job Alerts:'}</span>
                        <span className="font-mono font-bold text-white tabular-nums">
                          {data.jobs}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-200/80 pt-1 border-t border-slate-800">
                        {isHi ? 'क्लिक करके विभाग की भर्तियां देखें' : 'Click bar to filter department vacancies'}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              cursor="pointer"
              animationDuration={800}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.key}`}
                  fill={selectedDeptKey === entry.key ? '#b45309' : entry.color}
                  opacity={selectedDeptKey && selectedDeptKey !== entry.key ? 0.35 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Department Pills to Filter / Explore */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 font-medium mr-1 text-[11px]">
          {isHi ? 'त्वरित फ़िल्टर:' : 'Quick filter:'}
        </span>
        <button
          type="button"
          onClick={() => setSelectedDeptKey(null)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
            selectedDeptKey === null
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isHi ? 'सभी विभाग' : 'All Departments'}
        </button>
        {departmentStats.map((dept) => {
          const isSelected = selectedDeptKey === dept.deptKey;
          return (
            <button
              key={dept.deptKey}
              type="button"
              onClick={() => setSelectedDeptKey(isSelected ? null : dept.deptKey)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: dept.color }} 
              />
              <span>{isHi ? dept.nameHi : dept.name}</span>
              <span className="font-mono text-[10px] opacity-75 tabular-nums">
                ({dept.totalPosts.toLocaleString('en-IN')})
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtered Department Vacancies Details Drawer */}
      {activeDeptStat && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: activeDeptStat.color }}
              />
              <h3 className="font-bold text-slate-900 text-sm">
                {isHi ? activeDeptStat.nameHi : activeDeptStat.name} — {isHi ? 'सक्रिय भर्तियां' : 'Active Vacancies'}
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                ({activeDeptStat.totalPosts.toLocaleString('en-IN')} {isHi ? 'पद' : 'posts'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDeptKey(null)}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
            >
              {isHi ? 'बंद करें ✕' : 'Close ✕'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeDeptStat.jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectVacancy(job)}
                className="bg-white p-3 rounded-lg border border-slate-200 hover:border-amber-400 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-amber-700 transition">
                    {isHi ? job.titleHi || job.title : job.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                      {typeof job.totalPosts === 'number' ? `${job.totalPosts} पद` : `${job.totalPosts}`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{job.organization}</span>
                    <span aria-hidden="true">·</span>
                    <span>अंतिम तिथि: {job.importantDates.applyLastDate}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
