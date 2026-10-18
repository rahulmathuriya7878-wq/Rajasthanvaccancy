import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Building2, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { 
  VacancyItem, 
  BoardType, 
  CategoryType, 
  QualificationType, 
  JobStatusType, 
  LanguageMode 
} from '../types';

interface AddVacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
  onAddVacancy: (newJob: VacancyItem) => void;
}

export const AddVacancyModal: React.FC<AddVacancyModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAddVacancy,
}) => {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [organization, setOrganization] = useState<BoardType>('RSMSSB');
  const [department, setDepartment] = useState('Govt of Rajasthan');
  const [advtNo, setAdvtNo] = useState('Advt. 01/2026');
  const [category, setCategory] = useState<CategoryType>('latest_job');
  const [totalPosts, setTotalPosts] = useState('1250');
  const [postName, setPostName] = useState('Assistant / Clerk');
  const [selectedQualifications, setSelectedQualifications] = useState<QualificationType[]>(['Graduate']);
  const [qualDetails, setQualDetails] = useState('Graduate in any stream + RSCIT or equivalent computer certificate');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  const [asOnDate, setAsOnDate] = useState('2026-01-01');
  const [applyStartDate, setApplyStartDate] = useState('2025-11-01');
  const [applyLastDate, setApplyLastDate] = useState('2025-12-01');
  const [examDate, setExamDate] = useState('2026-04-15');
  const [salary, setSalary] = useState('Pay Matrix Level L-5 (Basic ₹20,800)');
  const [applyOnlineUrl, setApplyOnlineUrl] = useState('https://sso.rajasthan.gov.in');
  const [notificationPdfUrl, setNotificationPdfUrl] = useState('');
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState('https://rajasthan.gov.in');
  const [description, setDescription] = useState('Recruitment notice for eligible candidates in Rajasthan.');

  const toggleQual = (q: QualificationType) => {
    if (selectedQualifications.includes(q)) {
      if (selectedQualifications.length > 1) {
        setSelectedQualifications(selectedQualifications.filter(item => item !== q));
      }
    } else {
      setSelectedQualifications([...selectedQualifications, q]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newVacancy: VacancyItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      organization,
      department: department.trim(),
      advtNo: advtNo.trim(),
      category,
      totalPosts: isNaN(Number(totalPosts)) ? totalPosts : Number(totalPosts),
      postName: postName.trim(),
      postNameHi: postName.trim(),
      qualification: selectedQualifications,
      qualificationDetails: qualDetails.trim(),
      qualificationDetailsHi: qualDetails.trim(),
      ageLimit: {
        min: Number(minAge),
        max: Number(maxAge),
        asOnDate,
        relaxationNotes: 'Standard 5 years age relaxation for reserved categories in Rajasthan.'
      },
      applicationFee: {
        genObc: 600,
        scSt: 400,
        ews: 400,
        otrNote: 'Covered under Rajasthan SSO One Time Registration.'
      },
      importantDates: {
        notificationDate: new Date().toISOString().split('T')[0],
        applyStartDate,
        applyLastDate,
        examDate: examDate || undefined,
      },
      status: 'active',
      salary,
      jobLocation: 'Rajasthan',
      selectionProcess: ['Written Examination', 'Document Verification'],
      selectionProcessHi: ['लिखित परीक्षा', 'दस्तावेज सत्यापन'],
      tags: [organization, 'Recent Update', category],
      officialLinks: {
        applyOnlineUrl: applyOnlineUrl.trim() || undefined,
        notificationPdfUrl: notificationPdfUrl.trim() || undefined,
        officialWebsiteUrl: officialWebsiteUrl.trim() || 'https://rajasthan.gov.in'
      },
      isHot: true,
      isNew: true,
      description,
      descriptionHi: description,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddVacancy(newVacancy);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                {isHi ? 'नई भर्ती सूचना जोड़ें (Post Job Alert)' : 'Post New Govt Job Alert'}
              </h2>
              <p className="text-xs text-amber-100">
                {isHi ? 'नवीनतम नोटिफिकेशन या रोजगार सूचना डेटाबेस में शामिल करें' : 'Add a new recruitment notification to the portal database'}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Title EN & HI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'भर्ती शीर्षक (English):' : 'Title (English) *:'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. RSMSSB Junior Assistant 2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'भर्ती शीर्षक (हिन्दी):' : 'Title (Hindi):'}
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="उदा. राजस्थान कनिष्ठ सहायक भर्ती 2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Board & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'बोर्ड / आयोग:' : 'Board / Commission:'}
              </label>
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value as BoardType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              >
                <option value="RSMSSB">RSMSSB (कर्मचारी चयन बोर्ड)</option>
                <option value="RPSC">RPSC (लोक सेवा आयोग)</option>
                <option value="Rajasthan Police">Rajasthan Police</option>
                <option value="Rajasthan High Court">Rajasthan High Court</option>
                <option value="Education Department">Education Dept / REET</option>
                <option value="Discom / RVUNL">Discom / Bijli Vibhag</option>
                <option value="Health RUHS / NHM">Health NHM / CHO</option>
                <option value="Central Govt">Central Govt (SSC/Railway)</option>
                <option value="Sarkari Yojana">Sarkari Yojana / Scholarship</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'श्रेणी (Category):' : 'Category:'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              >
                <option value="latest_job">Latest Job (ताजा भर्ती)</option>
                <option value="admit_card">Admit Card (प्रवेश पत्र)</option>
                <option value="result">Result (परीक्षा परिणाम)</option>
                <option value="answer_key">Answer Key (उत्तर कुंजी)</option>
                <option value="syllabus">Syllabus (सिलेबस)</option>
                <option value="scheme">Scholarship / Scheme (योजना)</option>
                <option value="upcoming">Upcoming (आगामी भर्ती)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'कुल रिक्त पद:' : 'Total Posts:'}
              </label>
              <input
                type="text"
                value={totalPosts}
                onChange={(e) => setTotalPosts(e.target.value)}
                placeholder="e.g. 1,250"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Department & Advt No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'विभाग का नाम:' : 'Department Name:'}
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'विज्ञापन संख्या (Advt No):' : 'Advt. Number:'}
              </label>
              <input
                type="text"
                value={advtNo}
                onChange={(e) => setAdvtNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Qualifications Chips */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isHi ? 'मान्य शैक्षणिक योग्यता (Select Qualifications):' : 'Required Qualifications:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {(['10th', '12th', 'Graduate', 'PostGraduate', 'B.Ed/BSTC', 'ITI/Diploma', 'Engineering', 'Medical'] as QualificationType[]).map((q) => {
                const isSelected = selectedQualifications.includes(q);
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => toggleQual(q)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qualification Details text */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isHi ? 'विस्तृत योग्यता विवरण:' : 'Qualification Details:'}
            </label>
            <input
              type="text"
              value={qualDetails}
              onChange={(e) => setQualDetails(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'आवेदन प्रारंभ तिथि:' : 'Start Date:'}
              </label>
              <input
                type="date"
                value={applyStartDate}
                onChange={(e) => setApplyStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'आवेदन अंतिम तिथि:' : 'Last Date:'}
              </label>
              <input
                type="date"
                value={applyLastDate}
                onChange={(e) => setApplyLastDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'परीक्षा संभावित तिथि:' : 'Exam Date:'}
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'ऑनलाइन आवेदन लिंक (Apply URL):' : 'Apply Online URL:'}
              </label>
              <input
                type="url"
                value={applyOnlineUrl}
                onChange={(e) => setApplyOnlineUrl(e.target.value)}
                placeholder="https://sso.rajasthan.gov.in"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'ऑफिशियल वेबसाइट लिंक:' : 'Official Portal URL:'}
              </label>
              <input
                type="url"
                value={officialWebsiteUrl}
                onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
                placeholder="https://rsmssb.rajasthan.gov.in"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
            >
              {isHi ? 'भर्ती सूचना प्रकाशित करें' : 'Publish Job Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
