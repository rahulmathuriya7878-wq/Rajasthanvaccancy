export type BoardType =
  | 'RSMSSB'
  | 'RPSC'
  | 'Rajasthan Police'
  | 'Rajasthan High Court'
  | 'Education Department'
  | 'Discom / RVUNL'
  | 'Health RUHS / NHM'
  | 'Central Govt'
  | 'Sarkari Yojana';

export type CategoryType =
  | 'latest_job'
  | 'admit_card'
  | 'result'
  | 'answer_key'
  | 'syllabus'
  | 'scheme'
  | 'upcoming';

export type QualificationType =
  | '10th'
  | '12th'
  | 'Graduate'
  | 'PostGraduate'
  | 'B.Ed/BSTC'
  | 'ITI/Diploma'
  | 'Engineering'
  | 'Medical';

export type JobStatusType =
  | 'active'
  | 'upcoming'
  | 'admit_card_out'
  | 'result_declared'
  | 'answer_key_out'
  | 'closed';

export interface VacancyItem {
  id: string;
  title: string;
  titleHi: string;
  organization: BoardType;
  department: string;
  departmentHi?: string;
  advtNo: string;
  category: CategoryType;
  totalPosts: number | string;
  postName: string;
  postNameHi: string;
  qualification: QualificationType[];
  qualificationDetails: string;
  qualificationDetailsHi: string;
  ageLimit: {
    min: number;
    max: number;
    asOnDate: string;
    relaxationNotes?: string;
    relaxationNotesHi?: string;
  };
  applicationFee: {
    genObc: number;
    scSt: number;
    ews: number;
    otrNote?: string;
    otrNoteHi?: string;
  };
  importantDates: {
    notificationDate: string;
    applyStartDate: string;
    applyLastDate: string;
    feeLastDate?: string;
    examDate?: string;
    admitCardDate?: string;
    resultDate?: string;
  };
  status: JobStatusType;
  salary: string;
  salaryHi?: string;
  jobLocation: string;
  selectionProcess: string[];
  selectionProcessHi: string[];
  tags: string[];
  officialLinks: {
    applyOnlineUrl?: string;
    notificationPdfUrl?: string;
    syllabusPdfUrl?: string;
    admitCardUrl?: string;
    resultPdfUrl?: string;
    officialWebsiteUrl: string;
  };
  isHot?: boolean;
  isNew?: boolean;
  description: string;
  descriptionHi: string;
  tspBreakdown?: {
    nonTsp: number;
    tsp: number;
    sahariya?: number;
  };
  howToApply?: string[];
  howToApplyHi?: string[];
  requiredDocuments?: string[];
  requiredDocumentsHi?: string[];
  faqs?: { q: string; qHi: string; a: string; aHi: string }[];
  examPattern?: {
    totalMarks?: number | string;
    duration?: string;
    negativeMarking?: string;
    details?: string;
    detailsHi?: string;
  };
  createdAt: string;
}

export type LanguageMode = 'en' | 'hi';
