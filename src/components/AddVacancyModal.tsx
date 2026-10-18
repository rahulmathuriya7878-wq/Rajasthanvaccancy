import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Building2, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  Briefcase,
  Landmark,
  Ticket,
  Award,
  KeyRound,
  Sparkles
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

type PostSectionType = 'gov_job' | 'gov_yojana' | 'admit_card' | 'result' | 'answer_key';

export const AddVacancyModal: React.FC<AddVacancyModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAddVacancy,
}) => {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  // Section Type (Gov job vs Gov yojana vs others)
  const [postSection, setPostSection] = useState<PostSectionType>('gov_job');

  // Form Fields
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

  // Switch section and auto-configure category & board
  const handleSectionChange = (sec: PostSectionType) => {
    setPostSection(sec);
    if (sec === 'gov_job') {
      setCategory('latest_job');
      if (organization === 'Sarkari Yojana') {
        setOrganization('RSMSSB');
      }
      setDepartment('School Education / Revenue / Police Dept');
    } else if (sec === 'gov_yojana') {
      setCategory('scheme');
      setOrganization('Sarkari Yojana');
      setDepartment('Social Justice & Empowerment / Food & Civil Supplies / WCD');
    } else if (sec === 'admit_card') {
      setCategory('admit_card');
    } else if (sec === 'result') {
      setCategory('result');
    } else if (sec === 'answer_key') {
      setCategory('answer_key');
    }
  };

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

    // Determine final category and organization based on section
    const finalCategory: CategoryType = 
      postSection === 'gov_yojana' 
        ? 'scheme' 
        : postSection === 'gov_job' 
        ? 'latest_job' 
        : category;

    const finalOrg: BoardType = 
      postSection === 'gov_yojana' 
        ? 'Sarkari Yojana' 
        : organization;

    const finalStatus: JobStatusType =
      postSection === 'admit_card'
        ? 'admit_card_out'
        : postSection === 'result'
        ? 'result_declared'
        : postSection === 'answer_key'
        ? 'answer_key_out'
        : 'active';

    const newVacancy: VacancyItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      organization: finalOrg,
      department: department.trim(),
      departmentHi: department.trim(),
      advtNo: advtNo.trim(),
      category: finalCategory,
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
        relaxationNotes: 'Standard age relaxation for reserved categories in Rajasthan.'
      },
      applicationFee: {
        genObc: postSection === 'gov_yojana' ? 0 : 600,
        scSt: postSection === 'gov_yojana' ? 0 : 400,
        ews: postSection === 'gov_yojana' ? 0 : 400,
        otrNote: 'Covered under Rajasthan SSO One Time Registration.'
      },
      importantDates: {
        notificationDate: new Date().toISOString().split('T')[0],
        applyStartDate,
        applyLastDate,
        examDate: examDate || undefined,
      },
      status: finalStatus,
      salary: salary.trim(),
      salaryHi: salary.trim(),
      jobLocation: 'Rajasthan',
      selectionProcess: ['Written Examination / Direct Benefit', 'Document Verification'],
      selectionProcessHi: ['लिखित परीक्षा / डीबीटी सत्यापन', 'दस्तावेज सत्यापन'],
      tags: [finalOrg, postSection === 'gov_yojana' ? 'सरकारी योजना' : 'सरकारी भर्ती', finalCategory],
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
                {isHi ? 'नई सूचना जोड़ें (Post Section Wise)' : 'Post New Notice (Section Wise)'}
              </h2>
              <p className="text-xs text-amber-100">
                {isHi 
                  ? 'सरकारी भर्ती को जॉब सेक्शन में तथा सरकारी योजना को योजना सेक्शन में जोड़ें' 
                  : 'Add Gov Jobs to Job Section and Government Yojana to Yojana Section'}
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
          {/* SECTION WISE SELECTION TABS */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
            <label className="font-bold text-slate-800 block mb-2 text-xs">
              {isHi ? 'सेक्शन का चयन करें (Select Target Section):' : 'Select Target Section:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSectionChange('gov_job')}
                className={`px-3 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                  postSection === 'gov_job'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>{isHi ? 'सरकारी भर्ती (Gov Job)' : 'Govt Job'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSectionChange('gov_yojana')}
                className={`px-3 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                  postSection === 'gov_yojana'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Landmark className="w-4 h-4 shrink-0" />
                <span>{isHi ? 'सरकारी योजना (Yojana)' : 'Govt Yojana'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSectionChange('admit_card')}
                className={`px-3 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                  postSection === 'admit_card'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Ticket className="w-4 h-4 shrink-0" />
                <span>{isHi ? 'प्रवेश पत्र (Admit Card)' : 'Admit Card'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSectionChange('result')}
                className={`px-3 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                  postSection === 'result'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>{isHi ? 'परीक्षा परिणाम (Result)' : 'Result'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSectionChange('answer_key')}
                className={`px-3 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                  postSection === 'answer_key'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>{isHi ? 'उत्तर कुंजी (Answer Key)' : 'Answer Key'}</span>
              </button>
            </div>

            {/* Target Section Confirmation Indicator */}
            <div className="mt-3 text-xs flex items-center gap-2 font-medium">
              <span className="text-slate-500">{isHi ? 'प्रकाशित होने वाला बॉक्स:' : 'Destination Box:'}</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                postSection === 'gov_job' ? 'bg-emerald-100 text-emerald-800' :
                postSection === 'gov_yojana' ? 'bg-purple-100 text-purple-800' :
                postSection === 'admit_card' ? 'bg-blue-100 text-blue-800' :
                postSection === 'result' ? 'bg-rose-100 text-rose-800' :
                'bg-amber-100 text-amber-900'
              }`}>
                {postSection === 'gov_job' && (isHi ? '✓ सरकारी भर्तियां (Govt Jobs) सेक्शन' : 'Govt Jobs Section')}
                {postSection === 'gov_yojana' && (isHi ? '✓ सरकारी योजनाएं (Government Yojana) सेक्शन' : 'Government Yojana Section')}
                {postSection === 'admit_card' && (isHi ? '✓ प्रवेश पत्र (Admit Card) सेक्शन' : 'Admit Card Section')}
                {postSection === 'result' && (isHi ? '✓ परीक्षा परिणाम (Results) सेक्शन' : 'Results Section')}
                {postSection === 'answer_key' && (isHi ? '✓ उत्तर कुंजी व सिलेबस सेक्शन' : 'Answer Key Section')}
              </span>
            </div>
          </div>

          {/* Title EN & HI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {postSection === 'gov_yojana' 
                  ? (isHi ? 'योजना का शीर्षक (English):' : 'Scheme Title (English) *:')
                  : (isHi ? 'भर्ती का शीर्षक (English):' : 'Job Title (English) *:')
                }
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={postSection === 'gov_yojana' ? 'e.g. Mukhyamantri Free Scooty Yojana 2026' : 'e.g. RSMSSB Junior Assistant 2026'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {postSection === 'gov_yojana' 
                  ? (isHi ? 'योजना का शीर्षक (हिन्दी):' : 'Scheme Title (Hindi):')
                  : (isHi ? 'भर्ती का शीर्षक (हिन्दी):' : 'Job Title (Hindi):')
                }
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder={postSection === 'gov_yojana' ? 'उदा. मुख्यमंत्री स्कूटी योजना 2026' : 'उदा. राजस्थान कनिष्ठ सहायक भर्ती 2026'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Organization / Board & Total Posts / Beneficiaries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'बोर्ड / आयोग / विभाग प्रकार:' : 'Board / Commission / Authority:'}
              </label>
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value as BoardType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              >
                {postSection === 'gov_yojana' ? (
                  <option value="Sarkari Yojana">सरकारी योजना / छात्रवृत्ति (Sarkari Yojana)</option>
                ) : (
                  <>
                    <option value="RSMSSB">RSMSSB (कर्मचारी चयन बोर्ड)</option>
                    <option value="RPSC">RPSC (लोक सेवा आयोग)</option>
                    <option value="Rajasthan Police">Rajasthan Police (पुलिस विभाग)</option>
                    <option value="Rajasthan High Court">Rajasthan High Court (उच्च न्यायालय)</option>
                    <option value="Education Department">Education Dept (शिक्षा विभाग / REET)</option>
                    <option value="Discom / RVUNL">Discom / RVUNL (बिजली विभाग)</option>
                    <option value="Health RUHS / NHM">Health RUHS / NHM (स्वास्थ्य विभाग)</option>
                    <option value="Central Govt">Central Govt (केन्द्रीय भर्ती)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {postSection === 'gov_yojana' 
                  ? (isHi ? 'कुल सीटें / लाभार्थी संख्या:' : 'Total Seats / Beneficiaries:')
                  : (isHi ? 'कुल रिक्त पद:' : 'Total Posts:')
                }
              </label>
              <input
                type="text"
                value={totalPosts}
                onChange={(e) => setTotalPosts(e.target.value)}
                placeholder={postSection === 'gov_yojana' ? 'उदा. 30,000+ सीटें' : 'e.g. 1,250'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Department & Advt / Scheme No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'संबंधित सरकारी विभाग:' : 'Concerned Department:'}
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="उदा. स्कूल शिक्षा विभाग / सामाजिक न्याय विभाग"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {postSection === 'gov_yojana' 
                  ? (isHi ? 'योजना क्रमांक / शासनादेश संख्या:' : 'Scheme Order / Advt No:')
                  : (isHi ? 'विज्ञप्ति / विज्ञापन संख्या:' : 'Advt. Number:')
                }
              </label>
              <input
                type="text"
                value={advtNo}
                onChange={(e) => setAdvtNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Post Name / Benefit Name & Salary / Financial Assistance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {postSection === 'gov_yojana' 
                  ? (isHi ? 'योजना का मुख्य लाभ / सुविधा:' : 'Key Benefit / Assistance:')
                  : (isHi ? 'पद का नाम (Post Name):' : 'Post Name:')
                }
              </label>
              <input
                type="text"
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
                placeholder={postSection === 'gov_yojana' ? 'निःशुल्क स्कूटी / ₹40,000 भत्ता' : 'e.g. Junior Assistant / Patwari'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {postSection === 'gov_yojana' 
                  ? (isHi ? 'वित्तीय सहायता / लाभ विवरण:' : 'Financial Benefit Details:')
                  : (isHi ? 'वेतनमान (Salary / Pay Level):' : 'Salary Scale:')
                }
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder={postSection === 'gov_yojana' ? '100% निःशुल्क लाभ' : 'Pay Matrix Level L-5'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Qualification Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              {isHi ? 'न्यूनतम शैक्षणिक योग्यता:' : 'Required Education / Eligibility:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['10th', '12th', 'Graduate', 'PostGraduate', 'B.Ed/BSTC', 'ITI/Diploma', 'Engineering', 'Medical'] as QualificationType[]).map((q) => {
                const isSelected = selectedQualifications.includes(q);
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => toggleQual(q)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Important Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'आवेदन शुरू तिथि:' : 'Start Date:'}
              </label>
              <input
                type="date"
                value={applyStartDate}
                onChange={(e) => setApplyStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'आवेदन की अंतिम तिथि:' : 'Last Date:'}
              </label>
              <input
                type="date"
                value={applyLastDate}
                onChange={(e) => setApplyLastDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Official URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'ऑनलाइन आवेदन / पोर्टल लिंक:' : 'Apply Online Link:'}
              </label>
              <input
                type="url"
                value={applyOnlineUrl}
                onChange={(e) => setApplyOnlineUrl(e.target.value)}
                placeholder="https://sso.rajasthan.gov.in"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isHi ? 'आधिकारिक नोटिफिकेशन PDF लिंक:' : 'Official PDF Link:'}
              </label>
              <input
                type="url"
                value={notificationPdfUrl}
                onChange={(e) => setNotificationPdfUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Detailed Summary */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isHi ? 'विस्तृत विवरण एवं मुख्य बिंदु:' : 'Brief Description & Highlights:'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="इस भर्ती या योजना के बारे में संक्षिप्त जानकारी लिखें..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {postSection === 'gov_yojana'
                  ? (isHi ? 'सरकारी योजना सेक्शन में प्रकाशित करें' : 'Publish to Government Yojana Section')
                  : (isHi ? 'सरकारी भर्ती सेक्शन में प्रकाशित करें' : 'Publish to Govt Jobs Section')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
