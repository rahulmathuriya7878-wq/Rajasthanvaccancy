import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Edit3,
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
  Sparkles,
  Plus,
  Trash2,
  Table,
  BookOpen,
  DollarSign,
  Download,
  ShieldCheck,
  ListOrdered,
  Layers,
  MapPin,
  Globe,
  SlidersHorizontal,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  VacancyItem, 
  BoardType, 
  CategoryType, 
  QualificationType, 
  JobStatusType, 
  LanguageMode,
  PostBreakdownItem,
  PayScaleItem,
  ExamPatternDetails,
  ExamSubjectPattern,
  SeoSettings,
  CustomPostSection
} from '../types';

import { useAuth } from '../context/AuthContext.tsx';
import { AdminLoginModal } from './AdminLoginModal.tsx';

interface AddVacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
  onAddVacancy: (newJob: VacancyItem) => void;
  onUpdateVacancy?: (updatedJob: VacancyItem) => void;
  onDeleteVacancy?: (id: string) => void;
  editItem?: VacancyItem | null;
}

type PostSectionType = 'gov_job' | 'gov_yojana' | 'admit_card' | 'result' | 'answer_key';

export const AddVacancyModal: React.FC<AddVacancyModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAddVacancy,
  onUpdateVacancy,
  onDeleteVacancy,
  editItem,
}) => {
  const { isAdmin } = useAuth();
  const isHi = lang === 'hi';
  const isEdit = !!editItem;

  const handleDeleteThisPost = () => {
    if (!editItem || !onDeleteVacancy) return;
    onDeleteVacancy(editItem.id);
    onClose();
  };

  // Active sub-tab in modal for easy navigation (Kept only AI Writer and Direct Section Update)
  const [activeTab, setActiveTab] = useState<'ai_writer' | 'direct_update'>('direct_update');
  const [districtBreakdownText, setDistrictBreakdownText] = useState(
    'जयपुर: 150 पद\nजोधपुर: 120 पद\nकोटा: 90 पद\nउदयपुर: 80 पद\nअजमेर: 75 पद\nबीकानेर: 65 पद\nसीकर: 60 पद\nअलवर: 55 पद'
  );

  // Section Management State for Direct Update
  const [deletedSectionKeys, setDeletedSectionKeys] = useState<string[]>([]);
  const [customSections, setCustomSections] = useState<CustomPostSection[]>([]);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomContent, setNewCustomContent] = useState('');
  const [newCustomType, setNewCustomType] = useState<'paragraph' | 'bullets' | 'alert_box' | 'table'>('paragraph');

  // Expanded section state for inline update in direct editor
  const [expandedSectionKey, setExpandedSectionKey] = useState<string | null>(null);

  // Custom section inline editing state
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [editCustomTitle, setEditCustomTitle] = useState('');
  const [editCustomContent, setEditCustomContent] = useState('');
  const [editCustomType, setEditCustomType] = useState<'paragraph' | 'bullets' | 'alert_box' | 'table'>('paragraph');

  // State for AI Blog Writer
  const [aiTopicPrompt, setAiTopicPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedAiBlog, setCopiedAiBlog] = useState(false);

  const handleGenerateAiBlog = async () => {
    if (!aiTopicPrompt.trim()) return;
    setAiGenerating(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiTopicPrompt.trim(),
          postSection,
          organization,
        }),
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setAiResult(resData.data);
      } else {
        setAiError(resData.error || 'Failed to generate AI blog article');
      }
    } catch (err: any) {
      setAiError(err.message || 'Error connecting to AI blog writer service');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAiDataToForm = () => {
    if (!aiResult) return;
    if (aiResult.titleHi) setTitleHi(aiResult.titleHi);
    if (aiResult.titleEn) setTitle(aiResult.titleEn);
    if (aiResult.shortTitleHi) setShortTitleHi(aiResult.shortTitleHi);
    if (aiResult.shortTitleEn) setShortTitle(aiResult.shortTitleEn);
    if (aiResult.briefSummaryHi) setBriefSummary(aiResult.briefSummaryHi);
    if (aiResult.descriptionHi) setDescription(aiResult.descriptionHi);
    if (aiResult.totalPosts) setTotalPosts(aiResult.totalPosts.toString());
    if (aiResult.departmentHi) setDepartment(aiResult.departmentHi);
    if (aiResult.qualDetailsHi) setQualDetails(aiResult.qualDetailsHi);
    if (aiResult.ageLimitMin) setMinAge(aiResult.ageLimitMin);
    if (aiResult.ageLimitMax) setMaxAge(aiResult.ageLimitMax);
    if (aiResult.salaryHi) setSalary(aiResult.salaryHi);
    if (aiResult.metaTitle) setMetaTitle(aiResult.metaTitle);
    if (aiResult.metaDescription) setMetaDescription(aiResult.metaDescription);
    if (aiResult.focusKeywords) setFocusKeywordsText(aiResult.focusKeywords);

    // Switch to direct_update tab so admin can review and finalize
    setActiveTab('direct_update');
  };

  // Section Type (Gov job vs Gov yojana vs others)
  const [postSection, setPostSection] = useState<PostSectionType>('gov_job');

  // Section 1: Basic Information
  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [shortTitleHi, setShortTitleHi] = useState('');
  const [organization, setOrganization] = useState<BoardType>('RSMSSB');
  const [department, setDepartment] = useState('Govt of Rajasthan');
  const [advtNo, setAdvtNo] = useState('Advt. 01/2026');
  const [category, setCategory] = useState<CategoryType>('latest_job');
  const [totalPosts, setTotalPosts] = useState('1250');
  const [postName, setPostName] = useState('Assistant / Clerk');
  const [jobLocation, setJobLocation] = useState('Rajasthan');
  const [selectedQualifications, setSelectedQualifications] = useState<QualificationType[]>(['Graduate']);
  const [qualDetails, setQualDetails] = useState('Graduate in any stream + RSCIT or equivalent computer certificate');

  // Section 2: Brief Summary & Full Blog Content
  const [briefSummary, setBriefSummary] = useState('');
  const [description, setDescription] = useState('Recruitment notice for eligible candidates in Rajasthan.');

  // Section 3: TSP / Non-TSP Breakdown
  const [hasTspBreakdown, setHasTspBreakdown] = useState(false);
  const [nonTspPosts, setNonTspPosts] = useState<number>(0);
  const [tspPosts, setTspPosts] = useState<number>(0);
  const [sahariyaPosts, setSahariyaPosts] = useState<number>(0);

  // Section 4: Detailed Post Breakdown Table
  const [postBreakdown, setPostBreakdown] = useState<PostBreakdownItem[]>([]);

  // Section 5: Salary & Pay Scale Table
  const [salary, setSalary] = useState('Pay Matrix Level L-5 (Basic ₹20,800)');
  const [salaryTable, setSalaryTable] = useState<PayScaleItem[]>([]);

  // Section 6: Exam Pattern & Subjects
  const [hasExamPattern, setHasExamPattern] = useState(true);
  const [examMode, setExamMode] = useState('वस्तुनिष्ठ (Objective) / OMR');
  const [examTotalMarks, setExamTotalMarks] = useState('100');
  const [examDuration, setExamDuration] = useState('2 घंटे (120 मिनट)');
  const [examNegativeMarking, setExamNegativeMarking] = useState('1/3 अंक');
  const [examQualifyingMarks, setExamQualifyingMarks] = useState('33% अंक');
  const [examSubjects, setExamSubjects] = useState<ExamSubjectPattern[]>([
    { subject: 'General Knowledge & Current Affairs', subjectHi: 'सामान्य ज्ञान एवं समसामयिकी', questions: 20, marks: 20 },
    { subject: 'General English & Hindi', subjectHi: 'सामान्य हिंदी एवं अंग्रेजी', questions: 20, marks: 20 },
    { subject: 'Child Pedagogy & Education', subjectHi: 'बाल विकास व शिक्षणशास्त्र', questions: 20, marks: 20 },
    { subject: 'Subject Domain Knowledge', subjectHi: 'संबंधित विषय का ज्ञान', questions: 40, marks: 40 }
  ]);
  const [examNotes, setExamNotes] = useState(
    'प्रश्न पत्र द्विभाषी (हिंदी और अंग्रेजी) माध्यम में उपलब्ध रहेगा।\nपरीक्षा ओएमआर (OMR Sheet) या कंप्यूटर आधारित ऑनलाइन माध्यम से आयोजित की जाएगी।\nलिखित परीक्षा में न्यूनतम उत्तीर्णांक प्राप्त करना अनिवार्य है।'
  );

  // Section 7: Important Dates, Fees & Age Limits
  const [notificationDate, setNotificationDate] = useState('2026-01-01');
  const [applyStartDate, setApplyStartDate] = useState('2026-01-01');
  const [applyLastDate, setApplyLastDate] = useState('2026-12-31');
  const [feeLastDate, setFeeLastDate] = useState('2026-12-31');
  const [examDate, setExamDate] = useState('2026-04-15');
  const [admitCardDate, setAdmitCardDate] = useState('');
  const [resultDate, setResultDate] = useState('');

  const [feeGen, setFeeGen] = useState<number>(600);
  const [feeScSt, setFeeScSt] = useState<number>(325);
  const [feeEws, setFeeEws] = useState<number>(600);
  const [otrNote, setOtrNote] = useState('राजस्थान SSO One Time Registration (OTR) के तहत केवल एक बार शुल्क देय है।');

  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  const [asOnDate, setAsOnDate] = useState('2026-01-01');
  const [relaxationNotes, setRelaxationNotes] = useState(
    'राजस्थान के मूल निवासी SC, ST, OBC, MBC, EWS पुरुष अभ्यर्थियों को 5 वर्ष तथा महिला अभ्यर्थियों को 10 वर्ष की छूट देय है।'
  );

  // Section 8: Selection Process, Documents & How to Apply
  const [selectionProcessText, setSelectionProcessText] = useState(
    'लिखित परीक्षा (Written Examination)\nदस्तावेज सत्यापन (Document Verification)\nअंतिम मेरिट सूची (Final Merit List)'
  );
  const [requiredDocumentsText, setRequiredDocumentsText] = useState(
    'जन्म प्रमाणपत्र और 10वीं की अंकतालिका।\nआधार कार्ड।\nपद के अनुसार शैक्षणिक एवं प्रशिक्षण प्रमाणपत्र।\nजाति प्रमाणपत्र (SC/ST/OBC/EWS)।\nमूल निवास प्रमाणपत्र (Domicile Certificate)।\nपासपोर्ट साइज फोटो एवं हस्ताक्षर।'
  );
  const [howToApplyText, setHowToApplyText] = useState(
    'चरण 1: सबसे पहले राजस्थान सिंगल साइन ऑन (SSO) के आधिकारिक पोर्टल sso.rajasthan.gov.in पर जाएं।\nचरण 2: अपनी SSO ID और पासवर्ड दर्ज करके लॉगिन करें।\nचरण 3: Citizen Apps (G2C) सूची में से "Recruitment Portal" पर क्लिक करें।\nचरण 4: Ongoing Recruitment सेक्शन में इस भर्ती के सामने दिए गए "Apply Now" पर क्लिक करें।\nचरण 5: शैक्षणिक विवरण भरें तथा आवश्यक दस्तावेज व फोटो अपलोड करें।\nचरण 6: संपूर्ण आवेदन पत्र की जांच करें और फाइनल सबमिट कर रसीद का प्रिंटआउट सुरक्षित रखें।'
  );

  // Section 9: Official Links
  const [applyOnlineUrl, setApplyOnlineUrl] = useState('https://sso.rajasthan.gov.in');
  const [notificationPdfUrl, setNotificationPdfUrl] = useState('');
  const [syllabusPdfUrl, setSyllabusPdfUrl] = useState('');
  const [admitCardUrl, setAdmitCardUrl] = useState('');
  const [resultPdfUrl, setResultPdfUrl] = useState('');
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState('https://rajasthan.gov.in');

  // Section 10: Authentic Handwritten Teacher Notes
  const [handwrittenHeading, setHandwrittenHeading] = useState('');
  const [handwrittenPointsText, setHandwrittenPointsText] = useState('');
  const [handwrittenChecklistText, setHandwrittenChecklistText] = useState('');
  const [handwrittenSign, setHandwrittenSign] = useState('✍️ सफलता की हार्दिक शुभकामनाएं — राजस्थान वैकेंसी संपादकीय टीम');

  // Section 11: SEO Settings
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeywordsText, setFocusKeywordsText] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robotsMeta, setRobotsMeta] = useState('index, follow, max-snippet:-1, max-image-preview:large');
  const [ogImageUrl, setOgImageUrl] = useState('');

  // Pre-fill fields when editItem is provided
  useEffect(() => {
    if (editItem) {
      setActiveTab('direct_update');
      setTitle(editItem.title || '');
      setTitleHi(editItem.titleHi || editItem.title || '');
      setShortTitle(editItem.shortTitle || editItem.title || '');
      setShortTitleHi(editItem.shortTitleHi || editItem.titleHi || editItem.title || '');
      setOrganization(editItem.organization || 'RSMSSB');
      setDepartment(editItem.departmentHi || editItem.department || '');
      setAdvtNo(editItem.advtNo || '');
      setCategory(editItem.category || 'latest_job');
      setTotalPosts(String(editItem.totalPosts || ''));
      setPostName(editItem.postNameHi || editItem.postName || '');
      setJobLocation(editItem.jobLocation || 'Rajasthan');
      setSelectedQualifications(editItem.qualification && editItem.qualification.length > 0 ? editItem.qualification : ['Graduate']);
      setQualDetails(editItem.qualificationDetailsHi || editItem.qualificationDetails || '');

      setBriefSummary(editItem.briefSummaryHi || editItem.briefSummary || '');
      setDescription(editItem.descriptionHi || editItem.description || '');

      // TSP Breakdown
      if (editItem.tspBreakdown) {
        setHasTspBreakdown(true);
        setNonTspPosts(editItem.tspBreakdown.nonTsp || 0);
        setTspPosts(editItem.tspBreakdown.tsp || 0);
        setSahariyaPosts(editItem.tspBreakdown.sahariya || 0);
      } else {
        setHasTspBreakdown(false);
        setNonTspPosts(0);
        setTspPosts(0);
        setSahariyaPosts(0);
      }

      // Pre-fill SEO Settings
      if (editItem.seoSettings) {
        setMetaTitle(editItem.seoSettings.metaTitle || '');
        setMetaDescription(editItem.seoSettings.metaDescription || '');
        setFocusKeywordsText(editItem.seoSettings.focusKeywords ? editItem.seoSettings.focusKeywords.join(', ') : '');
        setCanonicalUrl(editItem.seoSettings.canonicalUrl || '');
        setRobotsMeta(editItem.seoSettings.robotsMeta || 'index, follow, max-snippet:-1, max-image-preview:large');
        setOgImageUrl(editItem.seoSettings.ogImageUrl || '');
      } else {
        setMetaTitle('');
        setMetaDescription('');
        setFocusKeywordsText('');
        setCanonicalUrl('');
        setRobotsMeta('index, follow, max-snippet:-1, max-image-preview:large');
        setOgImageUrl('');
      }

      // Post Breakdown Table
      if (editItem.postBreakdown && editItem.postBreakdown.length > 0) {
        setPostBreakdown([...editItem.postBreakdown]);
      } else {
        setPostBreakdown([]);
      }

      // Salary
      setSalary(editItem.salaryHi || editItem.salary || '');
      if (editItem.salaryTable && editItem.salaryTable.length > 0) {
        setSalaryTable([...editItem.salaryTable]);
      } else {
        setSalaryTable([]);
      }

      // Exam Pattern
      if (editItem.examPattern) {
        setHasExamPattern(true);
        setExamMode(editItem.examPattern.examModeHi || editItem.examPattern.examMode || 'वस्तुनिष्ठ (Objective)');
        setExamTotalMarks(String(editItem.examPattern.totalMarks || '100'));
        setExamDuration(editItem.examPattern.durationHi || editItem.examPattern.duration || '2 घंटे (120 मिनट)');
        setExamNegativeMarking(editItem.examPattern.negativeMarkingHi || editItem.examPattern.negativeMarking || '1/3 अंक');
        setExamQualifyingMarks(editItem.examPattern.qualifyingMarksHi || editItem.examPattern.qualifyingMarks || '33% अंक');
        if (editItem.examPattern.subjects && editItem.examPattern.subjects.length > 0) {
          setExamSubjects([...editItem.examPattern.subjects]);
        }
        if (editItem.examPattern.notesHi || editItem.examPattern.notes) {
          setExamNotes((editItem.examPattern.notesHi || editItem.examPattern.notes || []).join('\n'));
        }
      }

      // Important Dates
      setNotificationDate(editItem.importantDates?.notificationDate || '2026-01-01');
      setApplyStartDate(editItem.importantDates?.applyStartDate || '');
      setApplyLastDate(editItem.importantDates?.applyLastDate || '');
      setFeeLastDate(editItem.importantDates?.feeLastDate || editItem.importantDates?.applyLastDate || '');
      setExamDate(editItem.importantDates?.examDate || '');
      setAdmitCardDate(editItem.importantDates?.admitCardDate || '');
      setResultDate(editItem.importantDates?.resultDate || '');

      // Fees
      setFeeGen(editItem.applicationFee?.genObc ?? 600);
      setFeeScSt(editItem.applicationFee?.scSt ?? 325);
      setFeeEws(editItem.applicationFee?.ews ?? 600);
      setOtrNote(editItem.applicationFee?.otrNoteHi || editItem.applicationFee?.otrNote || 'राजस्थान SSO OTR के तहत एक बार शुल्क देय है।');

      // Age Limits
      setMinAge(editItem.ageLimit?.min || 18);
      setMaxAge(editItem.ageLimit?.max || 40);
      setAsOnDate(editItem.ageLimit?.asOnDate || '2026-01-01');
      setRelaxationNotes(editItem.ageLimit?.relaxationNotesHi || editItem.ageLimit?.relaxationNotes || '');

      // Steps, Documents, Selection Process
      if (editItem.selectionProcessHi || editItem.selectionProcess) {
        setSelectionProcessText((editItem.selectionProcessHi || editItem.selectionProcess || []).join('\n'));
      }
      if (editItem.requiredDocumentsHi || editItem.requiredDocuments) {
        setRequiredDocumentsText((editItem.requiredDocumentsHi || editItem.requiredDocuments || []).join('\n'));
      }
      if (editItem.howToApplyHi || editItem.howToApply) {
        setHowToApplyText((editItem.howToApplyHi || editItem.howToApply || []).join('\n'));
      }

      // Official Links
      setApplyOnlineUrl(editItem.officialLinks?.applyOnlineUrl || '');
      setNotificationPdfUrl(editItem.officialLinks?.notificationPdfUrl || '');
      setSyllabusPdfUrl(editItem.officialLinks?.syllabusPdfUrl || '');
      setAdmitCardUrl(editItem.officialLinks?.admitCardUrl || '');
      setResultPdfUrl(editItem.officialLinks?.resultPdfUrl || '');
      setOfficialWebsiteUrl(editItem.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in');

      // Handwritten Teacher Notes Pre-fill
      if (editItem.handwrittenNotes) {
        setHandwrittenHeading(editItem.handwrittenNotes.headingHi || '');
        setHandwrittenPointsText((editItem.handwrittenNotes.pointsHi || []).join('\n'));
        setHandwrittenChecklistText((editItem.handwrittenNotes.checklistHi || []).join('\n'));
        setHandwrittenSign(editItem.handwrittenNotes.teacherSignHi || '✍️ सफलता की हार्दिक शुभकामनाएं — राजस्थान वैकेंसी संपादकीय टीम');
      } else {
        setHandwrittenHeading('');
        setHandwrittenPointsText('');
        setHandwrittenChecklistText('');
        setHandwrittenSign('✍️ सफलता की हार्दिक शुभकामनाएं — राजस्थान वैकेंसी संपादकीय टीम');
      }

      // Section Management sync
      setDeletedSectionKeys(editItem.deletedSectionKeys ? [...editItem.deletedSectionKeys] : []);
      setCustomSections(editItem.customSections ? [...editItem.customSections] : []);

      // Post Section category mapping
      if (editItem.category === 'scheme' || editItem.organization === 'Sarkari Yojana') {
        setPostSection('gov_yojana');
      } else if (editItem.category === 'admit_card') {
        setPostSection('admit_card');
      } else if (editItem.category === 'result') {
        setPostSection('result');
      } else if (editItem.category === 'answer_key') {
        setPostSection('answer_key');
      } else {
        setPostSection('gov_job');
      }
    } else {
      setDeletedSectionKeys([]);
      setCustomSections([]);
    }
  }, [editItem]);

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <AdminLoginModal
        isOpen={isOpen}
        onClose={onClose}
        lang={lang}
      />
    );
  }

  // Switch section and auto-configure category & board
  const handleSectionChange = (sec: PostSectionType) => {
    setPostSection(sec);
    if (sec === 'gov_job') {
      setCategory('latest_job');
      if (organization === 'Sarkari Yojana') {
        setOrganization('RSMSSB');
      }
    } else if (sec === 'gov_yojana') {
      setCategory('scheme');
      setOrganization('Sarkari Yojana');
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
        setSelectedQualifications(selectedQualifications.filter((item) => item !== q));
      }
    } else {
      setSelectedQualifications([...selectedQualifications, q]);
    }
  };

  // Dynamic Post Breakdown Handlers
  const handleAddBreakdownRow = () => {
    setPostBreakdown([
      ...postBreakdown,
      {
        postName: 'New Post Name',
        postNameHi: 'नवीन पद नाम',
        categoryOrSubject: 'General / Subject',
        categoryOrSubjectHi: 'सामान्य / विषय',
        postsCount: 100,
        qualification: 'Graduate',
        qualificationHi: 'स्नातक'
      }
    ]);
  };

  const handleUpdateBreakdownRow = (index: number, field: keyof PostBreakdownItem, value: any) => {
    const updated = [...postBreakdown];
    updated[index] = { ...updated[index], [field]: value };
    setPostBreakdown(updated);
  };

  const handleRemoveBreakdownRow = (index: number) => {
    setPostBreakdown(postBreakdown.filter((_, i) => i !== index));
  };

  // Dynamic Salary Table Handlers
  const handleAddSalaryRow = () => {
    setSalaryTable([
      ...salaryTable,
      {
        postName: postName || 'Post Name',
        postNameHi: postName || 'पद नाम',
        payLevel: 'Pay Level L-5',
        payLevelHi: 'पे मैट्रिक्स लेवल-5',
        salaryRange: '₹20,800 to ₹65,900',
        salaryRangeHi: '₹20,800 से ₹65,900'
      }
    ]);
  };

  const handleUpdateSalaryRow = (index: number, field: keyof PayScaleItem, value: string) => {
    const updated = [...salaryTable];
    updated[index] = { ...updated[index], [field]: value };
    setSalaryTable(updated);
  };

  const handleRemoveSalaryRow = (index: number) => {
    setSalaryTable(salaryTable.filter((_, i) => i !== index));
  };

  // Dynamic Exam Subjects Handlers
  const handleAddSubjectRow = () => {
    setExamSubjects([
      ...examSubjects,
      {
        subject: 'General Studies / New Subject',
        subjectHi: 'सामान्य अध्ययन / नवीन विषय',
        questions: 20,
        marks: 20
      }
    ]);
  };

  const handleUpdateSubjectRow = (index: number, field: keyof ExamSubjectPattern, value: any) => {
    const updated = [...examSubjects];
    updated[index] = { ...updated[index], [field]: value };
    setExamSubjects(updated);
  };

  const handleRemoveSubjectRow = (index: number) => {
    setExamSubjects(examSubjects.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory: CategoryType = 
      postSection === 'gov_yojana' 
        ? 'scheme' 
        : postSection === 'admit_card'
        ? 'admit_card'
        : postSection === 'result'
        ? 'result'
        : postSection === 'answer_key'
        ? 'answer_key'
        : category;

    const finalOrg: BoardType = 
      postSection === 'gov_yojana' ? 'Sarkari Yojana' : organization;

    const finalStatus: JobStatusType = 
      postSection === 'admit_card' 
        ? 'admit_card_out' 
        : postSection === 'result'
        ? 'result_declared'
        : postSection === 'answer_key'
        ? 'answer_key_out'
        : 'active';

    const formattedDate = new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    // Parse array fields
    const parsedSelectionProcess = selectionProcessText.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedDocuments = requiredDocumentsText.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedHowToApply = howToApplyText.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedExamNotes = examNotes.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedHandwrittenPoints = handwrittenPointsText.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedHandwrittenChecklist = handwrittenChecklistText.split('\n').map(s => s.trim()).filter(Boolean);

    const constructedHandwrittenNotes = (parsedHandwrittenPoints.length > 0 || handwrittenHeading.trim()) ? {
      headingHi: handwrittenHeading.trim() || undefined,
      subheadingHi: isHi ? 'प्रतियोगी छात्रों के लिए हमारे विषय विशेषज्ञों द्वारा हाथ से तैयार किए गए महत्वपूर्ण बिंदु' : 'Handcrafted practical advice for aspiring candidates',
      pointsHi: parsedHandwrittenPoints,
      checklistHi: parsedHandwrittenChecklist.length > 0 ? parsedHandwrittenChecklist : undefined,
      teacherSignHi: handwrittenSign.trim() || undefined,
    } : undefined;

    const constructedTspBreakdown = hasTspBreakdown ? {
      nonTsp: Number(nonTspPosts) || 0,
      tsp: Number(tspPosts) || 0,
      sahariya: Number(sahariyaPosts) || 0
    } : undefined;

    const constructedExamPattern: ExamPatternDetails | undefined = hasExamPattern ? {
      examMode,
      examModeHi: examMode,
      totalMarks: isNaN(Number(examTotalMarks)) ? examTotalMarks : Number(examTotalMarks),
      duration: examDuration,
      durationHi: examDuration,
      negativeMarking: examNegativeMarking,
      negativeMarkingHi: examNegativeMarking,
      qualifyingMarks: examQualifyingMarks,
      qualifyingMarksHi: examQualifyingMarks,
      subjects: examSubjects.length > 0 ? examSubjects : undefined,
      notes: parsedExamNotes,
      notesHi: parsedExamNotes
    } : undefined;

    const parsedKeywords = focusKeywordsText
      ? focusKeywordsText.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

    const constructedSeoSettings: SeoSettings = {
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      focusKeywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
      canonicalUrl: canonicalUrl.trim() || undefined,
      robotsMeta: robotsMeta.trim() || undefined,
      ogImageUrl: ogImageUrl.trim() || undefined,
    };

    if (isEdit && editItem) {
      const updatedVacancy: VacancyItem = {
        ...editItem,
        title: title.trim(),
        titleHi: titleHi.trim() || title.trim(),
        shortTitle: shortTitle.trim() || title.trim(),
        shortTitleHi: shortTitleHi.trim() || titleHi.trim() || title.trim(),
        organization: finalOrg,
        department: department.trim(),
        departmentHi: department.trim(),
        advtNo: advtNo.trim(),
        category: finalCategory,
        totalPosts: isNaN(Number(totalPosts)) ? totalPosts : Number(totalPosts),
        postName: postName.trim(),
        postNameHi: postName.trim(),
        jobLocation: jobLocation.trim() || 'Rajasthan',
        qualification: selectedQualifications,
        qualificationDetails: qualDetails.trim(),
        qualificationDetailsHi: qualDetails.trim(),
        briefSummary: briefSummary.trim(),
        briefSummaryHi: briefSummary.trim(),
        tspBreakdown: constructedTspBreakdown,
        postBreakdown: postBreakdown.length > 0 ? postBreakdown : undefined,
        salary: salary.trim(),
        salaryHi: salary.trim(),
        salaryTable: salaryTable.length > 0 ? salaryTable : undefined,
        examPattern: constructedExamPattern,
        ageLimit: {
          min: Number(minAge),
          max: Number(maxAge),
          asOnDate,
          relaxationNotes: relaxationNotes.trim(),
          relaxationNotesHi: relaxationNotes.trim(),
        },
        importantDates: {
          notificationDate: notificationDate || editItem.importantDates?.notificationDate || '2026-01-01',
          applyStartDate,
          applyLastDate,
          feeLastDate: feeLastDate || applyLastDate,
          examDate: examDate || undefined,
          admitCardDate: admitCardDate || undefined,
          resultDate: resultDate || undefined,
        },
        applicationFee: {
          genObc: Number(feeGen),
          scSt: Number(feeScSt),
          ews: Number(feeEws),
          otrNote: otrNote.trim(),
          otrNoteHi: otrNote.trim(),
        },
        selectionProcess: parsedSelectionProcess.length > 0 ? parsedSelectionProcess : ['लिखित परीक्षा', 'दस्तावेज सत्यापन'],
        selectionProcessHi: parsedSelectionProcess.length > 0 ? parsedSelectionProcess : ['लिखित परीक्षा', 'दस्तावेज सत्यापन'],
        requiredDocuments: parsedDocuments,
        requiredDocumentsHi: parsedDocuments,
        howToApply: parsedHowToApply,
        howToApplyHi: parsedHowToApply,
        officialLinks: {
          applyOnlineUrl: applyOnlineUrl.trim() || undefined,
          notificationPdfUrl: notificationPdfUrl.trim() || undefined,
          syllabusPdfUrl: syllabusPdfUrl.trim() || undefined,
          admitCardUrl: admitCardUrl.trim() || undefined,
          resultPdfUrl: resultPdfUrl.trim() || undefined,
          officialWebsiteUrl: officialWebsiteUrl.trim() || 'https://rajasthan.gov.in'
        },
        status: finalStatus,
        description: description.trim(),
        descriptionHi: description.trim(),
        handwrittenNotes: constructedHandwrittenNotes,
        seoSettings: constructedSeoSettings,
        deletedSectionKeys: deletedSectionKeys.length > 0 ? deletedSectionKeys : undefined,
        customSections: customSections.length > 0 ? customSections : undefined,
        updatedAt: formattedDate
      };

      if (onUpdateVacancy) {
        onUpdateVacancy(updatedVacancy);
      } else {
        onAddVacancy(updatedVacancy);
      }
    } else {
      const newVacancy: VacancyItem = {
        id: `custom-${Date.now()}`,
        title: title.trim(),
        titleHi: titleHi.trim() || title.trim(),
        shortTitle: shortTitle.trim() || title.trim(),
        shortTitleHi: shortTitleHi.trim() || titleHi.trim() || title.trim(),
        organization: finalOrg,
        department: department.trim(),
        departmentHi: department.trim(),
        advtNo: advtNo.trim(),
        category: finalCategory,
        totalPosts: isNaN(Number(totalPosts)) ? totalPosts : Number(totalPosts),
        postName: postName.trim(),
        postNameHi: postName.trim(),
        jobLocation: jobLocation.trim() || 'Rajasthan',
        qualification: selectedQualifications,
        qualificationDetails: qualDetails.trim(),
        qualificationDetailsHi: qualDetails.trim(),
        briefSummary: briefSummary.trim(),
        briefSummaryHi: briefSummary.trim(),
        tspBreakdown: constructedTspBreakdown,
        postBreakdown: postBreakdown.length > 0 ? postBreakdown : undefined,
        salary: salary.trim(),
        salaryHi: salary.trim(),
        salaryTable: salaryTable.length > 0 ? salaryTable : undefined,
        examPattern: constructedExamPattern,
        ageLimit: {
          min: Number(minAge),
          max: Number(maxAge),
          asOnDate,
          relaxationNotes: relaxationNotes.trim(),
          relaxationNotesHi: relaxationNotes.trim(),
        },
        importantDates: {
          notificationDate: notificationDate || new Date().toISOString().split('T')[0],
          applyStartDate,
          applyLastDate,
          feeLastDate: feeLastDate || applyLastDate,
          examDate: examDate || undefined,
          admitCardDate: admitCardDate || undefined,
          resultDate: resultDate || undefined,
        },
        applicationFee: {
          genObc: Number(feeGen),
          scSt: Number(feeScSt),
          ews: Number(feeEws),
          otrNote: otrNote.trim(),
          otrNoteHi: otrNote.trim(),
        },
        selectionProcess: parsedSelectionProcess.length > 0 ? parsedSelectionProcess : ['लिखित परीक्षा', 'दस्तावेज सत्यापन'],
        selectionProcessHi: parsedSelectionProcess.length > 0 ? parsedSelectionProcess : ['लिखित परीक्षा', 'दस्तावेज सत्यापन'],
        requiredDocuments: parsedDocuments,
        requiredDocumentsHi: parsedDocuments,
        howToApply: parsedHowToApply,
        howToApplyHi: parsedHowToApply,
        tags: [finalOrg, postSection === 'gov_yojana' ? 'सरकारी योजना' : 'सरकारी भर्ती', finalCategory],
        officialLinks: {
          applyOnlineUrl: applyOnlineUrl.trim() || undefined,
          notificationPdfUrl: notificationPdfUrl.trim() || undefined,
          syllabusPdfUrl: syllabusPdfUrl.trim() || undefined,
          admitCardUrl: admitCardUrl.trim() || undefined,
          resultPdfUrl: resultPdfUrl.trim() || undefined,
          officialWebsiteUrl: officialWebsiteUrl.trim() || 'https://rajasthan.gov.in'
        },
        status: finalStatus,
        isHot: true,
        isNew: true,
        description: description.trim(),
        descriptionHi: description.trim(),
        handwrittenNotes: constructedHandwrittenNotes,
        seoSettings: constructedSeoSettings,
        deletedSectionKeys: deletedSectionKeys.length > 0 ? deletedSectionKeys : undefined,
        customSections: customSections.length > 0 ? customSections : undefined,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: formattedDate
      };

      onAddVacancy(newVacancy);
    }
    onClose();
  };

  const standardSectionList = [
    { key: 'overview', title: 'संक्षिप्त विवरण तालिका (Overview Table)', desc: 'मुख्य पद, बोर्ड, अंतिम तिथि आदि की पहली टेबल' },
    { key: 'latest_update', title: 'लेटेस्ट अपडेट बॉक्स (Latest Update)', desc: 'शीर्ष पर दिखने वाला मुख्य अपडेट पैराग्राफ' },
    { key: 'dates', title: 'महत्वपूर्ण तिथियाँ (Important Dates Table)', desc: 'आवेदन प्रारंभ, अंतिम तिथि और परीक्षा तिथि' },
    { key: 'post_breakdown', title: 'पदों का विवरण (Post Breakdown Table)', desc: 'पद नाम, विषयवार और श्रेणीवार पदों की संख्या' },
    { key: 'salary_table', title: 'वेतनमान सारणी (Salary Scale & Pay Level)', desc: 'पदवार पे मैट्रिक्स लेवल व वेतन श्रृंखला तालिका' },
    { key: 'exam_pattern', title: 'परीक्षा पैटर्न व सिलेबस (Exam Pattern & Scheme)', desc: 'परीक्षा मोड, कुल अंक, नेगेटिव मार्किंग व विषयवार अंक तालिका' },
    { key: 'qualification', title: 'शैक्षणिक योग्यता (Eligibility & Qualification)', desc: '10वीं/12वीं/स्नातक व अन्य योग्यता' },
    { key: 'age_limit', title: 'आयु सीमा (Age Limits Table)', desc: 'न्यूनतम व अधिकतम आयु तथा नियमानुसार छूट' },
    { key: 'application_fee', title: 'आवेदन शुल्क (Application Fee Table)', desc: 'सामान्य/ओबीसी/एससी/एसटी शुल्क व भुगतान माध्यम' },
    { key: 'selection_process', title: 'चयन प्रक्रिया (Selection Process)', desc: 'लिखित परीक्षा, दस्तावेज सत्यापन, मेरिट लिस्ट चरण' },
    { key: 'documents', title: 'आवश्यक दस्तावेज (Required Documents)', desc: 'फोटो, हस्ताक्षर, आधार कार्ड व प्रमाण पत्रों की सूची' },
    { key: 'how_to_apply', title: 'आवेदन कैसे करें (How to Apply Steps)', desc: 'SSO पोर्टल पर आवेदन करने के चरणबद्ध निर्देश' },
    { key: 'important_links', title: 'महत्वपूर्ण लिंक्स (Important Links Table)', desc: 'Apply Online, Notification PDF, Official Site लिंक्स' },
    { key: 'faqs', title: 'प्रश्नोत्तर (FAQs Section)', desc: 'अभ्यर्थियों के सामान्य प्रश्न और उनके सटीक उत्तर' }
  ];

  const toggleSectionDeletion = (key: string) => {
    if (deletedSectionKeys.includes(key)) {
      setDeletedSectionKeys(deletedSectionKeys.filter(k => k !== key));
    } else {
      setDeletedSectionKeys([...deletedSectionKeys, key]);
    }
  };

  const handleAddCustomSection = () => {
    if (!newCustomTitle.trim()) return;
    const newSec: CustomPostSection = {
      id: Date.now().toString(),
      title: newCustomTitle.trim(),
      titleHi: newCustomTitle.trim(),
      content: newCustomContent.trim() || 'विवरण यहाँ उपलब्ध है।',
      contentHi: newCustomContent.trim() || 'विवरण यहाँ उपलब्ध है।',
      sectionType: newCustomType
    };
    setCustomSections([...customSections, newSec]);
    setNewCustomTitle('');
    setNewCustomContent('');
  };

  const handleRemoveCustomSection = (id: string) => {
    setCustomSections(customSections.filter(s => s.id !== id));
  };

  const handleStartEditCustom = (cs: CustomPostSection) => {
    setEditingCustomId(cs.id);
    setEditCustomTitle(cs.titleHi || cs.title);
    setEditCustomContent(cs.contentHi || cs.content);
    setEditCustomType(cs.sectionType || 'paragraph');
  };

  const handleSaveCustomEdit = () => {
    if (!editingCustomId || !editCustomTitle.trim()) return;
    setCustomSections(prev => prev.map(s => s.id === editingCustomId ? {
      ...s,
      title: editCustomTitle.trim(),
      titleHi: editCustomTitle.trim(),
      content: editCustomContent.trim(),
      contentHi: editCustomContent.trim(),
      sectionType: editCustomType
    } : s));
    setEditingCustomId(null);
  };

  const navTabs = [
    { id: 'direct_update', label: isHi ? '⚡ डायरेक्ट सेक्शन व पोस्ट अपडेट' : '⚡ Direct Sections Update', icon: SlidersHorizontal },
    { id: 'ai_writer', label: isHi ? '✨ AI ब्लॉग राइटर' : '✨ AI Blog Writer', icon: Sparkles },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              {isEdit ? <Edit3 className="w-5 h-5 text-white" /> : <PlusCircle className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                {isEdit 
                  ? (isHi ? 'संपूर्ण पोस्ट संपादक (Full Admin Post Editor)' : 'Full Post Editor (All Sections)') 
                  : (isHi ? 'नई भर्ती / योजना का संपूर्ण फॉर्म' : 'Publish Complete Job / Scheme Notice')}
              </h2>
              <p className="text-xs text-amber-100 mt-0.5">
                {isHi 
                  ? 'प्रत्येक बॉक्स, पद विवरण, वेतन सारणी, परीक्षा पैटर्न और लिंक्स को आसानी से अपडेट करें' 
                  : 'Edit every single box, table, and detail of this post'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEdit && editItem && onDeleteVacancy && (
              <button
                type="button"
                onClick={handleDeleteThisPost}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                title="Delete this post"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
                <span>{isHi ? 'पोस्ट डिलीट करें' : 'Delete Post'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer ml-1"
              title="Close Editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vertical Navigation & Form Body Container */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-[500px]">
          
          {/* Vertical Navigation Sidebar Box for Admin Sections */}
          <div className="w-full sm:w-64 bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-200 p-3 flex flex-col gap-1.5 overflow-y-auto shrink-0 scrollbar-thin max-h-[220px] sm:max-h-none">
            <div className="px-2.5 py-1 mb-1 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                {isHi ? 'एडमिन मोड' : 'Admin Mode'}
              </span>
              <span className="text-[9px] bg-sky-100 text-sky-800 font-extrabold px-1.5 py-0.5 rounded uppercase">
                {isHi ? '2 विकल्प' : '2 Options'}
              </span>
            </div>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const activeBg = tab.id === 'ai_writer'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-700/20'
                : 'bg-gradient-to-r from-sky-700 to-blue-700 text-white shadow-md shadow-sky-700/20';
              const iconColor = tab.id === 'ai_writer' ? 'text-purple-600' : 'text-sky-600';
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
                    isActive
                      ? activeBg
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : iconColor}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Body Area */}
          <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm bg-white">

          {/* TAB 0: AI BLOG WRITER */}
          {activeTab === 'ai_writer' && (
            <div className="space-y-5">
              {/* AI Writer Banner */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-purple-500/30 shadow-lg relative overflow-hidden">
                <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
                  <Sparkles className="w-32 h-32 text-amber-300" />
                </div>
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-purple-500/30 border border-purple-300/40 text-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>{isHi ? 'Gemini 3.8 Flash - ऑटो ब्लॉग जनरेटर' : 'Gemini 3.8 Flash - Auto Blog Writer'}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {isHi ? '✨ AI से संपूर्ण भर्ती आर्टिकल & डेटा ऑटो-जनरेट करें' : '✨ AI Powered Recruitment Blog Generator'}
                  </h3>
                  <p className="text-xs text-purple-200 leading-relaxed max-w-2xl">
                    {isHi 
                      ? 'केवल भर्ती का नाम, विभाग या शॉर्ट विवरण दर्ज करें। हमारा AI आपके लिए पूरा हिंदी ब्लॉग आर्टिकल, पात्रता, आयु सीमा, चयन प्रक्रिया और SEO मेटा डेटा 5 सेकंड में तैयार कर देगा!' 
                      : 'Type the vacancy title, department, or brief notes. AI will craft a complete, well-structured Hindi recruitment blog post and form details in seconds!'}
                  </p>
                </div>
              </div>

              {/* Input Form Box */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-xs sm:text-sm">
                    {isHi ? 'भर्ती या योजना का नाम / शॉर्ट नोट (Topic Prompt): *' : 'Vacancy Title or Topic Prompt: *'}
                  </label>
                  <textarea
                    rows={3}
                    value={aiTopicPrompt}
                    onChange={(e) => setAiTopicPrompt(e.target.value)}
                    placeholder={isHi 
                      ? 'उदा. RPSC Sub Inspector Recruitment 2026 Notification for 850 Posts, Apply Online Date, Eligibility & Age Limit...' 
                      : 'e.g., RSMSSB Patwari Bharti 2026 for 3000 posts in Rajasthan, eligibility, syllabus...'}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* Quick Suggestion Chips */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                    {isHi ? 'त्वरित सुझाव प्रॉमप्ट्स (Click to fill prompt):' : 'Sample Prompts:'}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      'RPSC Sub Inspector (SI) Bharti 2026 - 850 Posts, Syllabus & Age Limit',
                      'RSMSSB Patwari Bharti 2026 - 3000 Posts Notification & Qualification',
                      'Rajasthan Anuprati Coaching Yojana 2026 - Online Application & Benefit',
                      'Railway RRB ALP & Technician Recruitment 2026 Notification',
                      'REET Level 1 & 2 Teacher Recruitment 2026 Complete Details'
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiTopicPrompt(sample)}
                        className="text-[11px] bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-slate-700 font-medium px-2.5 py-1 rounded-lg transition text-left cursor-pointer"
                      >
                        ⚡ {sample}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                  <div className="text-xs text-slate-500 font-medium">
                    {isHi ? 'चयनित बोर्ड:' : 'Target Board:'} <span className="font-bold text-purple-700">{organization}</span> ({postSection})
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAiBlog}
                    disabled={aiGenerating || !aiTopicPrompt.trim()}
                    className="px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 hover:from-purple-800 hover:to-slate-950 text-white shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 text-amber-300 ${aiGenerating ? 'animate-spin' : ''}`} />
                    <span>
                      {aiGenerating
                        ? (isHi ? 'AI आर्टिकल जनरेट हो रहा है...' : 'AI Generating Article...')
                        : (isHi ? '✨ AI आर्टिकल जनरेट करें' : '✨ Generate AI Article')}
                    </span>
                  </button>
                </div>

                {aiError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                    ⚠️ {aiError}
                  </div>
                )}
              </div>

              {/* AI Generated Result Display */}
              {aiResult && (
                <div className="bg-white border-2 border-purple-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {isHi ? 'AI द्वारा जनरेट किया गया ब्लॉग आर्टिकल' : 'AI Generated Blog Article'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${aiResult.titleHi}\n\n${aiResult.briefSummaryHi}\n\n${aiResult.descriptionHi}`);
                          setCopiedAiBlog(true);
                          setTimeout(() => setCopiedAiBlog(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                      >
                        {copiedAiBlog ? '✓ कॉपी हो गया' : '📋 टेक्स्ट कॉपी करें'}
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyAiDataToForm}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isHi ? '🚀 एक क्लिक में फॉर्म में भरें' : '🚀 Pre-fill All Form Fields'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Headline Preview */}
                  <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                      {isHi ? 'जनरेट किया गया शीर्षक (Title):' : 'Generated Headline:'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {aiResult.titleHi}
                    </h3>
                  </div>

                  {/* Summary Preview */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {isHi ? 'संक्षिप्त विवरण (Brief Summary):' : 'Brief Summary:'}
                    </span>
                    <p className="leading-relaxed">{aiResult.briefSummaryHi}</p>
                  </div>

                  {/* Detailed Description Preview */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-2 max-h-80 overflow-y-auto font-sans">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {isHi ? 'विस्तृत आर्टिकल लेख (Full Description):' : 'Detailed Article Body:'}
                    </span>
                    <div className="whitespace-pre-line leading-relaxed font-normal">
                      {aiResult.descriptionHi}
                    </div>
                  </div>

                  {/* Extracted Fields Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">कुल पद:</span>
                      <span className="font-bold text-slate-900">{aiResult.totalPosts || 'N/A'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">आयु सीमा:</span>
                      <span className="font-bold text-slate-900">{aiResult.ageLimitMin || 18} - {aiResult.ageLimitMax || 40} वर्ष</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">विभाग:</span>
                      <span className="font-bold text-slate-900 truncate block">{aiResult.departmentHi || 'राजस्थान सरकार'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">वेतनमान:</span>
                      <span className="font-bold text-slate-900 truncate block">{aiResult.salaryHi || 'नियम अनुसार'}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleApplyAiDataToForm}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{isHi ? '🚀 इन विवरणों को संपूर्ण फॉर्म में ऑटो-फिल करें' : '🚀 Apply AI Data to Form & Edit'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DIRECT SECTION UPDATE & POST MANAGER */}
          {activeTab === 'direct_update' && (
            <div className="space-y-6">
              {/* Header Info Banner */}
              <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-slate-900 text-white p-5 rounded-2xl border border-sky-500/30 shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-sky-500/30 border border-sky-300/40 text-sky-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-300" />
                    <span>{isHi ? 'डायरेक्ट सेक्शन नियंत्रण' : 'Direct Section Control'}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {isHi ? '⚡ सेक्शन हटाएं, नया सेक्शन जोड़ें या डायरेक्ट पोस्ट अपडेट करें' : '⚡ Remove Sections, Add Custom Sections & Direct Post Update'}
                  </h3>
                  <p className="text-xs text-sky-200 leading-relaxed max-w-2xl">
                    {isHi 
                      ? 'आप पोस्ट का कोई भी डिफ़ॉल्ट सेक्शन (जैसे शुल्क तालिका, आयु सीमा, लिंक्स आदि) एक क्लिक में हटा सकते हैं या नए कस्टम सेक्शन जोड़कर तुरंत पोस्ट अपडेट कर सकते हैं।' 
                      : 'Remove any default section, add custom sections, and save the updated post directly with a single click.'}
                  </p>
                </div>
              </div>

              {/* Direct Quick Post Fields */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-sky-600" />
                  <span>{isHi ? 'पोस्ट त्वरित विवरण (Quick Post Details):' : 'Quick Post Details:'}</span>
                </h4>
                {/* Target Post Category / Section Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHi ? 'सेक्शन / श्रेणी का चयन (Target Category):' : 'Select Target Category:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSectionChange('gov_job')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                        postSection === 'gov_job'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span>सरकारी भर्ती</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionChange('gov_yojana')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                        postSection === 'gov_yojana'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>सरकारी योजना</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionChange('admit_card')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                        postSection === 'admit_card'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>एडमिट कार्ड</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionChange('result')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                        postSection === 'result'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span>परिणाम</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionChange('answer_key')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                        postSection === 'answer_key'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5 shrink-0" />
                      <span>उत्तर कुंजी</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">पोस्ट शीर्षक (Title) *</label>
                    <input
                      type="text"
                      required
                      value={titleHi}
                      onChange={(e) => {
                        setTitleHi(e.target.value);
                        if (!title) setTitle(e.target.value);
                      }}
                      placeholder="भर्ती का पूरा शीर्षक"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">विभाग / बोर्ड (Department/Board)</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="उदा. RSMSSB या राजस्थान पुलिस"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-sky-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">कुल पद (Total Posts)</label>
                    <input
                      type="text"
                      value={totalPosts}
                      onChange={(e) => setTotalPosts(e.target.value)}
                      placeholder="उदा. 4500"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-sky-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">आवेदन की अंतिम तिथि (Last Date)</label>
                    <input
                      type="date"
                      value={applyLastDate}
                      onChange={(e) => setApplyLastDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-sky-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">वेतनमान (Salary)</label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="उदा. पे मैट्रिक्स लेवल L-10"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-sky-600"
                    />
                  </div>
                </div>
              </div>

              {/* Standard Sections Deletion/Hiding Grid */}
              <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-600" />
                      <span>{isHi ? 'मानक सेक्शन चालू रखें या हटाएं (Standard Sections Toggle):' : 'Enable or Remove Standard Sections:'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isHi ? 'जिस सेक्शन को आप पोस्ट से हटाना चाहते हैं, उसके सामने "हटाएं" पर क्लिक करें।' : 'Click Remove for any section you want to hide from this post.'}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-slate-600">
                    हटाए गए सेक्शन: <span className="text-rose-600 font-extrabold">{deletedSectionKeys.length}</span> / {standardSectionList.length}
                  </div>
                </div>

                <div className="space-y-3">
                  {standardSectionList.map((sec) => {
                    const isDeleted = deletedSectionKeys.includes(sec.key);
                    const isExpanded = expandedSectionKey === sec.key;
                    return (
                      <div 
                        key={sec.key}
                        className={`rounded-xl border transition overflow-hidden ${
                          isDeleted 
                            ? 'bg-rose-50/50 border-rose-300' 
                            : isExpanded
                            ? 'bg-white border-sky-400 shadow-md ring-1 ring-sky-300'
                            : 'bg-white border-slate-200 shadow-2xs hover:border-sky-300'
                        }`}
                      >
                        {/* Section Card Header */}
                        <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isDeleted ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900">{sec.title}</h5>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                                isDeleted ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isDeleted ? 'हटाया गया (Hidden)' : 'चालू (Active)'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 pl-4.5">{sec.desc}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            {/* Button 1: Edit Section Content */}
                            <button
                              type="button"
                              onClick={() => setExpandedSectionKey(isExpanded ? null : sec.key)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                                isExpanded
                                  ? 'bg-sky-600 text-white shadow-2xs'
                                  : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isExpanded ? 'एडिटर बंद करें' : 'सेक्शन विवरण अपडेट करें'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                            </button>

                            {/* Button 2: Toggle Hide / Show */}
                            <button
                              type="button"
                              onClick={() => toggleSectionDeletion(sec.key)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                                isDeleted
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isDeleted ? (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>वापस चालू करें</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>सेक्शन हटाएं</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Inline Section Editor Panel when expanded */}
                        {isExpanded && (
                          <div className="p-4 bg-sky-50/40 border-t border-sky-100 space-y-3 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between border-b border-sky-200/60 pb-2">
                              <span className="text-xs font-extrabold text-sky-900 flex items-center gap-1.5">
                                <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                                <span>{sec.title} — डेटा अपडेट करें:</span>
                              </span>
                              <span className="text-[11px] text-slate-500">
                                बदलाव तुरंत इस पोस्ट के लिए सेट हो जाएंगे।
                              </span>
                            </div>

                            {/* Section Specific Input Fields */}
                            {sec.key === 'overview' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">पद का नाम (Post Name)</label>
                                  <input
                                    type="text"
                                    value={postName}
                                    onChange={(e) => setPostName(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">विभाग / संस्था (Department)</label>
                                  <input
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">विज्ञापन संख्या (Advt No)</label>
                                  <input
                                    type="text"
                                    value={advtNo}
                                    onChange={(e) => setAdvtNo(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">नौकरी स्थान (Job Location)</label>
                                  <input
                                    type="text"
                                    value={jobLocation}
                                    onChange={(e) => setJobLocation(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                              </div>
                            )}

                            {sec.key === 'latest_update' && (
                              <div className="text-xs space-y-2">
                                <label className="font-bold text-slate-700 block">लेटेस्ट अपडेट / मुख्य पैराग्राफ (Latest Update Text)</label>
                                <textarea
                                  rows={4}
                                  value={briefSummary}
                                  onChange={(e) => setBriefSummary(e.target.value)}
                                  placeholder="इस भर्ती या परिणाम के संबंध में नवीनतम समाचार और महत्वपूर्ण सूचना..."
                                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-sky-600 font-sans"
                                />
                              </div>
                            )}

                            {sec.key === 'dates' && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">नोटिफिकेशन तिथि</label>
                                  <input
                                    type="date"
                                    value={notificationDate}
                                    onChange={(e) => setNotificationDate(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">आवेदन प्रारंभ तिथि</label>
                                  <input
                                    type="date"
                                    value={applyStartDate}
                                    onChange={(e) => setApplyStartDate(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">आवेदन अंतिम तिथि</label>
                                  <input
                                    type="date"
                                    value={applyLastDate}
                                    onChange={(e) => setApplyLastDate(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">शुल्क भुगतान अंतिम तिथि</label>
                                  <input
                                    type="date"
                                    value={feeLastDate}
                                    onChange={(e) => setFeeLastDate(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">परीक्षा तिथि (Exam Date)</label>
                                  <input
                                    type="text"
                                    value={examDate}
                                    onChange={(e) => setExamDate(e.target.value)}
                                    placeholder="उदा. 2026-05-15 या शीघ्र जारी होगी"
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">एडमिट कार्ड तिथि</label>
                                  <input
                                    type="text"
                                    value={admitCardDate}
                                    onChange={(e) => setAdmitCardDate(e.target.value)}
                                    placeholder="परीक्षा से 7 दिन पूर्व"
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                              </div>
                            )}

                            {sec.key === 'post_breakdown' && (
                              <div className="space-y-4 text-xs">
                                {/* Sub-section A: TSP / Non-TSP Breakdown */}
                                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2.5">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="tsp-check-direct"
                                      checked={hasTspBreakdown}
                                      onChange={(e) => setHasTspBreakdown(e.target.checked)}
                                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                    />
                                    <label htmlFor="tsp-check-direct" className="font-bold text-slate-700 cursor-pointer">
                                      TSP / Non-TSP विभाजन सक्रिय करें
                                    </label>
                                  </div>
                                  {hasTspBreakdown && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                      <div>
                                        <label className="font-semibold text-slate-600 mb-1 block">गैर-अनुसूचित (Non-TSP पद)</label>
                                        <input
                                          type="number"
                                          value={nonTspPosts}
                                          onChange={(e) => setNonTspPosts(Number(e.target.value) || 0)}
                                          className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 focus:bg-white font-bold text-slate-800"
                                        />
                                      </div>
                                      <div>
                                        <label className="font-semibold text-slate-600 mb-1 block">अनुसूचित क्षेत्र (TSP पद)</label>
                                        <input
                                          type="number"
                                          value={tspPosts}
                                          onChange={(e) => setTspPosts(Number(e.target.value) || 0)}
                                          className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 focus:bg-white font-bold text-blue-700"
                                        />
                                      </div>
                                      <div>
                                        <label className="font-semibold text-slate-600 mb-1 block">सहरिया आदिम जाति पद</label>
                                        <input
                                          type="number"
                                          value={sahariyaPosts}
                                          onChange={(e) => setSahariyaPosts(Number(e.target.value) || 0)}
                                          className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 focus:bg-white font-bold text-amber-700"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Sub-section B: Dynamic Post Breakdown Table */}
                                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                      <h6 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                        <Table className="w-3.5 h-3.5 text-sky-600" />
                                        <span>पदवार विस्तृत विवरण सारणी (Post Breakdown Rows):</span>
                                      </h6>
                                      <p className="text-[11px] text-slate-500">
                                        प्रत्येक पद नाम, विषय/श्रेणी और रिक्त पदों की संख्या यहाँ से जोड़ें व अपडेट करें।
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={handleAddBreakdownRow}
                                      className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ नया पद पंक्ति जोड़ें</span>
                                    </button>
                                  </div>

                                  {postBreakdown.length === 0 ? (
                                    <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                                      <p className="text-xs text-slate-500">
                                        कोई पद पंक्ति नहीं है। ऊपर "+ नया पद पंक्ति जोड़ें" पर क्लिक करें।
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {postBreakdown.map((row, idx) => (
                                        <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                          <div className="sm:col-span-4">
                                            <label className="text-[10px] font-semibold text-slate-600 block">पद का नाम (Post Name):</label>
                                            <input
                                              type="text"
                                              value={row.postNameHi || row.postName}
                                              onChange={(e) => {
                                                handleUpdateBreakdownRow(idx, 'postName', e.target.value);
                                                handleUpdateBreakdownRow(idx, 'postNameHi', e.target.value);
                                              }}
                                              placeholder="उदा. सहायक कर्मचारी / LDC"
                                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                                            />
                                          </div>
                                          <div className="sm:col-span-3">
                                            <label className="text-[10px] font-semibold text-slate-600 block">श्रेणी / विषय (Category/Subject):</label>
                                            <input
                                              type="text"
                                              value={row.categoryOrSubjectHi || row.categoryOrSubject || ''}
                                              onChange={(e) => {
                                                handleUpdateBreakdownRow(idx, 'categoryOrSubject', e.target.value);
                                                handleUpdateBreakdownRow(idx, 'categoryOrSubjectHi', e.target.value);
                                              }}
                                              placeholder="उदा. सामान्य / गणित"
                                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                            />
                                          </div>
                                          <div className="sm:col-span-2">
                                            <label className="text-[10px] font-semibold text-slate-600 block">कुल पद (Count):</label>
                                            <input
                                              type="number"
                                              value={row.postsCount}
                                              onChange={(e) => handleUpdateBreakdownRow(idx, 'postsCount', Number(e.target.value) || 0)}
                                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-emerald-700"
                                            />
                                          </div>
                                          <div className="sm:col-span-2">
                                            <label className="text-[10px] font-semibold text-slate-600 block">योग्यता (Eligibility):</label>
                                            <input
                                              type="text"
                                              value={row.qualificationHi || row.qualification || ''}
                                              onChange={(e) => {
                                                handleUpdateBreakdownRow(idx, 'qualification', e.target.value);
                                                handleUpdateBreakdownRow(idx, 'qualificationHi', e.target.value);
                                              }}
                                              placeholder="उदा. स्नातक / 12वीं"
                                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                            />
                                          </div>
                                          <div className="sm:col-span-1 flex justify-end">
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveBreakdownRow(idx)}
                                              className="p-1 text-rose-600 hover:bg-rose-100 rounded transition cursor-pointer"
                                              title="पंक्ति हटाएं"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {sec.key === 'salary_table' && (
                              <div className="space-y-4 text-xs">
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">मुख्य वेतनमान सारांश (Overall Salary Highlight):</label>
                                  <input
                                    type="text"
                                    value={salary}
                                    onChange={(e) => setSalary(e.target.value)}
                                    placeholder="उदा. पे मैट्रिक्स लेवल L-5 से लेवल L-10 (₹20,800 से ₹65,900)"
                                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-emerald-800 focus:outline-none focus:border-sky-600"
                                  />
                                </div>

                                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                      <h6 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>वेतनमान एवं पे मैट्रिक्स सारणी (Salary & Pay Scale Table):</span>
                                      </h6>
                                      <p className="text-[11px] text-slate-500">
                                        प्रत्येक पद का पे मैट्रिक्स लेवल और वेतन श्रृंखला यहाँ दर्ज करें।
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={handleAddSalaryRow}
                                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ वेतन पंक्ति जोड़ें</span>
                                    </button>
                                  </div>

                                  {salaryTable.length === 0 ? (
                                    <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                                      <p className="text-xs text-slate-500">
                                        कोई अलग वेतन पंक्ति नहीं है। मुख्य वेतनमान का उपयोग होगा।
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {salaryTable.map((row, idx) => (
                                        <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                          <div className="sm:col-span-4">
                                            <label className="text-[10px] font-semibold text-slate-600 block">पद का नाम (Post):</label>
                                            <input
                                              type="text"
                                              value={row.postNameHi || row.postName}
                                              onChange={(e) => {
                                                handleUpdateSalaryRow(idx, 'postName', e.target.value);
                                                handleUpdateSalaryRow(idx, 'postNameHi', e.target.value);
                                              }}
                                              placeholder="उदा. कनिष्ठ सहायक"
                                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                                            />
                                          </div>
                                          <div className="sm:col-span-3">
                                            <label className="text-[10px] font-semibold text-slate-600 block">पे लेवल (Pay Level):</label>
                                            <input
                                              type="text"
                                              value={row.payLevelHi || row.payLevel}
                                              onChange={(e) => {
                                                handleUpdateSalaryRow(idx, 'payLevel', e.target.value);
                                                handleUpdateSalaryRow(idx, 'payLevelHi', e.target.value);
                                              }}
                                              placeholder="उदा. Level-5"
                                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800"
                                            />
                                          </div>
                                          <div className="sm:col-span-4">
                                            <label className="text-[10px] font-semibold text-slate-600 block">वेतनमान सीमा (Salary Range):</label>
                                            <input
                                              type="text"
                                              value={row.salaryRangeHi || row.salaryRange}
                                              onChange={(e) => {
                                                handleUpdateSalaryRow(idx, 'salaryRange', e.target.value);
                                                handleUpdateSalaryRow(idx, 'salaryRangeHi', e.target.value);
                                              }}
                                              placeholder="उदा. ₹20,800 से ₹65,900"
                                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-emerald-800"
                                            />
                                          </div>
                                          <div className="sm:col-span-1 flex justify-end">
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveSalaryRow(idx)}
                                              className="p-1 text-rose-600 hover:bg-rose-100 rounded transition cursor-pointer"
                                              title="पंक्ति हटाएं"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {sec.key === 'exam_pattern' && (
                              <div className="space-y-4 text-xs">
                                <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                                  <input
                                    type="checkbox"
                                    id="enableExam-direct"
                                    checked={hasExamPattern}
                                    onChange={(e) => setHasExamPattern(e.target.checked)}
                                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                  />
                                  <label htmlFor="enableExam-direct" className="font-bold text-slate-800 cursor-pointer text-xs">
                                    📖 लिखित परीक्षा पैटर्न व अंक विभाजन सक्षम करें
                                  </label>
                                </div>

                                {hasExamPattern && (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-lg border border-slate-200">
                                      <div>
                                        <label className="font-semibold text-slate-600 block mb-1">परीक्षा मोड</label>
                                        <input
                                          type="text"
                                          value={examMode}
                                          onChange={(e) => setExamMode(e.target.value)}
                                          placeholder="उदा. ऑफलाइन OMR / CBT"
                                          className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 focus:bg-white text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="font-semibold text-slate-600 block mb-1">कुल अंक</label>
                                        <input
                                          type="text"
                                          value={examTotalMarks}
                                          onChange={(e) => setExamTotalMarks(e.target.value)}
                                          placeholder="उदा. 200 या 300"
                                          className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 focus:bg-white text-xs font-bold text-sky-800"
                                        />
                                      </div>
                                      <div>
                                        <label className="font-semibold text-slate-600 block mb-1">परीक्षा अवधि</label>
                                        <input
                                          type="text"
                                          value={examDuration}
                                          onChange={(e) => setExamDuration(e.target.value)}
                                          placeholder="उदा. 2 घंटे (120 मिनट)"
                                          className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 focus:bg-white text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="font-semibold text-slate-600 block mb-1">न्यूनतम उत्तीर्णांक</label>
                                        <input
                                          type="text"
                                          value={examQualifyingMarks}
                                          onChange={(e) => setExamQualifyingMarks(e.target.value)}
                                          placeholder="उदा. 40%"
                                          className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 focus:bg-white text-xs font-bold text-emerald-700"
                                        />
                                      </div>
                                    </div>

                                    {/* Subject breakdown table */}
                                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2.5">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800 text-xs">विषयवार अंक विभाजन (Subjects Breakdown):</span>
                                        <button
                                          type="button"
                                          onClick={handleAddSubjectRow}
                                          className="px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                          <span>+ विषय पंक्ति जोड़ें</span>
                                        </button>
                                      </div>

                                      {examSubjects.map((sub, sIdx) => (
                                        <div key={sIdx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                                          <div className="col-span-5">
                                            <input
                                              type="text"
                                              value={sub.subjectHi || sub.subject}
                                              onChange={(e) => {
                                                handleUpdateSubjectRow(sIdx, 'subject', e.target.value);
                                                handleUpdateSubjectRow(sIdx, 'subjectHi', e.target.value);
                                              }}
                                              placeholder="उदा. राजस्थान सामान्य ज्ञान"
                                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                                            />
                                          </div>
                                          <div className="col-span-3">
                                            <input
                                              type="number"
                                              value={sub.questions}
                                              onChange={(e) => handleUpdateSubjectRow(sIdx, 'questions', Number(e.target.value) || 0)}
                                              placeholder="प्रश्न"
                                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                            />
                                          </div>
                                          <div className="col-span-3">
                                            <input
                                              type="number"
                                              value={sub.marks}
                                              onChange={(e) => handleUpdateSubjectRow(sIdx, 'marks', Number(e.target.value) || 0)}
                                              placeholder="अंक"
                                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-sky-700"
                                            />
                                          </div>
                                          <div className="col-span-1 flex justify-end">
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveSubjectRow(sIdx)}
                                              className="p-1 text-rose-600 hover:bg-rose-100 rounded cursor-pointer"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {sec.key === 'qualification' && (
                              <div className="text-xs space-y-3">
                                <div>
                                  <label className="font-bold text-slate-700 mb-1.5 block">योग्यता स्तर (Select Qualifications):</label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(['10th', '12th', 'Graduate', 'Post Graduate', 'ITI', 'Diploma', 'B.Ed / D.El.Ed', 'Other'] as QualificationType[]).map((q) => (
                                      <button
                                        key={q}
                                        type="button"
                                        onClick={() => toggleQual(q)}
                                        className={`px-2.5 py-1 rounded text-xs font-bold border transition cursor-pointer ${
                                          selectedQualifications.includes(q)
                                            ? 'bg-sky-600 text-white border-sky-600'
                                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
                                      >
                                        {selectedQualifications.includes(q) ? '✓ ' : '+ '}{q}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">विस्तृत शैक्षणिक योग्यता विवरण (Detailed Eligibility)</label>
                                  <textarea
                                    rows={3}
                                    value={qualDetails}
                                    onChange={(e) => setQualDetails(e.target.value)}
                                    placeholder="मान्यता प्राप्त बोर्ड से 10वीं/12वीं/स्नातक व आवश्यक कंप्यूटर प्रमाणपत्र..."
                                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                              </div>
                            )}

                            {sec.key === 'age_limit' && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">न्यूनतम आयु (वर्ष)</label>
                                  <input
                                    type="number"
                                    value={minAge}
                                    onChange={(e) => setMinAge(Number(e.target.value) || 18)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">अधिकतम आयु (वर्ष)</label>
                                  <input
                                    type="number"
                                    value={maxAge}
                                    onChange={(e) => setMaxAge(Number(e.target.value) || 40)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">आयु गणना तिथि (As on)</label>
                                  <input
                                    type="date"
                                    value={asOnDate}
                                    onChange={(e) => setAsOnDate(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div className="sm:col-span-3">
                                  <label className="font-bold text-slate-700 mb-1 block">आरक्षित वर्गों को आयु सीमा में छूट के नियम</label>
                                  <textarea
                                    rows={2}
                                    value={relaxationNotes}
                                    onChange={(e) => setRelaxationNotes(e.target.value)}
                                    placeholder="राजस्थान के मूल निवासी SC, ST, OBC, MBC, EWS अभ्यर्थियों को नियमानुसार छूट..."
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                              </div>
                            )}

                            {sec.key === 'application_fee' && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">सामान्य / ओबीसी (₹)</label>
                                  <input
                                    type="number"
                                    value={feeGen}
                                    onChange={(e) => setFeeGen(Number(e.target.value) || 0)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">एससी / एसटी (₹)</label>
                                  <input
                                    type="number"
                                    value={feeScSt}
                                    onChange={(e) => setFeeScSt(Number(e.target.value) || 0)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">ईडब्ल्यूएस (₹)</label>
                                  <input
                                    type="number"
                                    value={feeEws}
                                    onChange={(e) => setFeeEws(Number(e.target.value) || 0)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div className="sm:col-span-3">
                                  <label className="font-bold text-slate-700 mb-1 block">OTR / भुगतान नोट</label>
                                  <input
                                    type="text"
                                    value={otrNote}
                                    onChange={(e) => setOtrNote(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                              </div>
                            )}

                            {sec.key === 'selection_process' && (
                              <div className="text-xs space-y-2">
                                <label className="font-bold text-slate-700 block">चयन प्रक्रिया के चरण (प्रत्येक पंक्ति एक नया चरण)</label>
                                <textarea
                                  rows={4}
                                  value={selectionProcessText}
                                  onChange={(e) => setSelectionProcessText(e.target.value)}
                                  placeholder="लिखित परीक्षा (Written Exam)&#10;दस्तावेज सत्यापन (Document Verification)&#10;अंतिम चयन सूची (Merit List)"
                                  className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600 font-mono"
                                />
                              </div>
                            )}

                            {sec.key === 'documents' && (
                              <div className="text-xs space-y-2">
                                <label className="font-bold text-slate-700 block">आवश्यक दस्तावेज सूची (प्रत्येक पंक्ति एक दस्तावेज)</label>
                                <textarea
                                  rows={4}
                                  value={requiredDocumentsText}
                                  onChange={(e) => setRequiredDocumentsText(e.target.value)}
                                  placeholder="10वीं व 12वीं की अंकतालिका&#10;आधार कार्ड&#10;मूल निवास प्रमाण पत्र&#10;जाति प्रमाण पत्र"
                                  className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600 font-mono"
                                />
                              </div>
                            )}

                            {sec.key === 'how_to_apply' && (
                              <div className="text-xs space-y-2">
                                <label className="font-bold text-slate-700 block">आवेदन कैसे करें चरणबद्ध विवरण (प्रत्येक पंक्ति एक चरण)</label>
                                <textarea
                                  rows={5}
                                  value={howToApplyText}
                                  onChange={(e) => setHowToApplyText(e.target.value)}
                                  placeholder="चरण 1: आधिकारिक SSO पोर्टल sso.rajasthan.gov.in पर जाएं&#10;चरण 2: Recruitment Portal चुनें और Apply Now पर क्लिक करें"
                                  className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600 font-mono"
                                />
                              </div>
                            )}

                            {sec.key === 'important_links' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">Apply Online URL</label>
                                  <input
                                    type="url"
                                    value={applyOnlineUrl}
                                    onChange={(e) => setApplyOnlineUrl(e.target.value)}
                                    placeholder="https://sso.rajasthan.gov.in"
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">Notification PDF URL</label>
                                  <input
                                    type="url"
                                    value={notificationPdfUrl}
                                    onChange={(e) => setNotificationPdfUrl(e.target.value)}
                                    placeholder="https://.../notification.pdf"
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">Syllabus PDF URL</label>
                                  <input
                                    type="url"
                                    value={syllabusPdfUrl}
                                    onChange={(e) => setSyllabusPdfUrl(e.target.value)}
                                    placeholder="https://.../syllabus.pdf"
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">Admit Card URL</label>
                                  <input
                                    type="url"
                                    value={admitCardUrl}
                                    onChange={(e) => setAdmitCardUrl(e.target.value)}
                                    placeholder="https://.../admit-card"
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">Result PDF / Link URL</label>
                                  <input
                                    type="url"
                                    value={resultPdfUrl}
                                    onChange={(e) => setResultPdfUrl(e.target.value)}
                                    placeholder="https://.../result.pdf"
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 mb-1 block">Official Website URL</label>
                                  <input
                                    type="url"
                                    value={officialWebsiteUrl}
                                    onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
                                    placeholder="https://rajasthan.gov.in"
                                    className="w-full bg-white border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-600"
                                  />
                                </div>
                              </div>
                            )}

                            {sec.key === 'faqs' && (
                              <div className="text-xs space-y-2">
                                <p className="text-slate-600">
                                  पोस्ट में महत्वपूर्ण FAQs स्वचालित रूप से इस भर्ती के नाम, पात्रता, और अंतिम तिथि के अनुसार प्रस्तुत किए जाते हैं। आप ऊपर दिए गए 'तिथियां' एवं 'योग्यता' सेक्शन को अपडेट करेंगे तो FAQs स्वतः अपडेट हो जाएंगे।
                                </p>
                              </div>
                            )}

                            <div className="pt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => setExpandedSectionKey(null)}
                                className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-sky-700 shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>सेक्शन विवरण सहेजा गया (Done)</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Sections Builder with Inline Edit & Delete */}
              <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-sky-600" />
                    <span>{isHi ? 'कस्टम सेक्शन जोड़ें या अपडेट करें (Custom Sections):' : 'Custom Sections:'}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isHi ? 'सिलेबस, परीक्षा पैटर्न, कट ऑफ, या कोई भी नया सेक्शन यहाँ से जोड़ें व अपडेट करें।' : 'Add or update syllabus, cut-off, or custom sections.'}
                  </p>
                </div>

                {/* Form to add custom section */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">नया सेक्शन नाम (Title)</label>
                    <input
                      type="text"
                      value={newCustomTitle}
                      onChange={(e) => setNewCustomTitle(e.target.value)}
                      placeholder="उदा. विस्तृत परीक्षा पैटर्न एवं सिलेबस"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-sky-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">फॉर्मेट प्रकार</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewCustomType('paragraph')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          newCustomType === 'paragraph' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        पैराग्राफ
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCustomType('bullets')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          newCustomType === 'bullets' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        बिंदुवार सूची
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCustomType('alert_box')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          newCustomType === 'alert_box' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        हाईलाइट बॉक्स
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">सेक्शन सामग्री (Content)</label>
                    <textarea
                      rows={4}
                      value={newCustomContent}
                      onChange={(e) => setNewCustomContent(e.target.value)}
                      placeholder="सेक्शन की विस्तृत जानकारी यहाँ लिखें..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-sky-600 font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!newCustomTitle.trim()}
                    onClick={handleAddCustomSection}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ सेक्शन सूची में जोड़ें</span>
                  </button>
                </div>

                {/* List of currently added custom sections with Edit & Delete */}
                {customSections.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      जोड़े गए कस्टम सेक्शन ({customSections.length}):
                    </span>
                    {customSections.map((cs) => {
                      const isEditingThis = editingCustomId === cs.id;
                      return (
                        <div key={cs.id} className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3">
                          {isEditingThis ? (
                            <div className="space-y-3 bg-white p-3 rounded-lg border border-sky-300 animate-in fade-in">
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-bold text-xs text-sky-900">कस्टम सेक्शन संपादित करें:</span>
                                <button
                                  type="button"
                                  onClick={() => setEditingCustomId(null)}
                                  className="text-xs text-slate-500 hover:text-slate-800"
                                >
                                  रद्द करें
                                </button>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">शीर्षक</label>
                                <input
                                  type="text"
                                  value={editCustomTitle}
                                  onChange={(e) => setEditCustomTitle(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold focus:bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">प्रकार</label>
                                <div className="flex gap-2">
                                  {(['paragraph', 'bullets', 'alert_box'] as const).map((t) => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => setEditCustomType(t)}
                                      className={`px-2.5 py-1 text-xs rounded border cursor-pointer ${
                                        editCustomType === t ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-300'
                                      }`}
                                    >
                                      {t === 'paragraph' ? 'पैराग्राफ' : t === 'bullets' ? 'बिंदुवार' : 'हाईलाइट बॉक्स'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">सामग्री</label>
                                <textarea
                                  rows={4}
                                  value={editCustomContent}
                                  onChange={(e) => setEditCustomContent(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono focus:bg-white"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingCustomId(null)}
                                  className="px-3 py-1 text-xs rounded border border-slate-300 text-slate-700 cursor-pointer"
                                >
                                  रद्द करें
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveCustomEdit}
                                  className="px-4 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>सेक्शन अपडेट करें</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">{cs.titleHi || cs.title}</span>
                                  <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-semibold uppercase">
                                    {cs.sectionType}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{cs.contentHi || cs.content}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCustom(cs)}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded flex items-center gap-1 transition cursor-pointer"
                                  title="इस कस्टम सेक्शन को एडिट करें"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                  <span>एडिट</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomSection(cs.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-100 rounded transition cursor-pointer"
                                  title="इस कस्टम सेक्शन को हटाएं"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Direct Post Update Action */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div>
                  <h4 className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isHi ? 'डायरेक्ट पोस्ट अपडेट के लिए तैयार?' : 'Ready to direct update post?'}</span>
                  </h4>
                  <p className="text-xs text-emerald-800">
                    {isHi ? 'एक क्लिक में हटाए गए सेक्शन व जोड़े गए नए सेक्शन के साथ पोस्ट तुरंत अपडेट हो जाएगी।' : 'Save all section changes and update post immediately.'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition shadow-md cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>{isHi ? '💾 डायरेक्ट पोस्ट अपडेट सेव करें' : '💾 Save & Update Post Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">वर्तमान टैब:</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-amber-800">
                {navTabs.find(t => t.id === activeTab)?.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isEdit && editItem && onDeleteVacancy && (
                <button
                  type="button"
                  onClick={handleDeleteThisPost}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isHi ? 'पोस्ट डिलीट करें' : 'Delete Post'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isEdit
                    ? (isHi ? 'संपूर्ण पोस्ट अपडेट व सहेजें (Save Full Post Updates)' : 'Save All Post Updates')
                    : (postSection === 'gov_yojana'
                        ? (isHi ? 'सरकारी योजना सेक्शन में प्रकाशित करें' : 'Publish to Government Yojana')
                        : (isHi ? 'सरकारी भर्ती सेक्शन में प्रकाशित करें' : 'Publish to Govt Jobs')
                      )
                  }
                </span>
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
