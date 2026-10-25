export type BoardType =
  | 'RSMSSB'
  | 'RPSC'
  | 'Rajasthan Police'
  | 'Rajasthan High Court'
  | 'Education Department'
  | 'Discom / RVUNL'
  | 'Health RUHS / NHM'
  | 'Central Govt'
  | 'Railway Board'
  | 'UGC NET'
  | 'Sarkari Yojana';

export type CategoryType =
  | 'latest_job'
  | 'admit_card'
  | 'result'
  | 'answer_key'
  | 'syllabus'
  | 'scheme'
  | 'upcoming'
  | 'ugc_net'
  | 'exam_date'
  | 'news';

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

export interface DirectLinkItem {
  label: string;
  actionText?: string;
  type?: string;
  url?: string;
  fileName?: string;
  fileSize?: string;
  isPdf?: boolean;
  isPrimary?: boolean;
}

export interface LatestNewsItem {
  id?: string;
  date?: string;
  badge?: string;
  headline: string;
  details?: string;
  linkUrl?: string;
  linkText?: string;
  isHighlighted?: boolean;
}

export type SarkariPost = VacancyItem;

export interface PostBreakdownItem {
  postName: string;
  postNameHi: string;
  categoryOrSubject?: string;
  categoryOrSubjectHi?: string;
  postsCount: number | string;
  qualification: string;
  qualificationHi: string;
  payLevel?: string;
}

export interface PayScaleItem {
  postName: string;
  postNameHi: string;
  payLevel: string;
  payLevelHi?: string;
  salaryRange: string;
  salaryRangeHi?: string;
}

export interface ExamSubjectPattern {
  subject: string;
  subjectHi: string;
  questions?: number | string;
  marks: number | string;
}

export interface ExamPatternDetails {
  examMode?: string;
  examModeHi?: string;
  totalMarks?: number | string;
  duration?: string;
  durationHi?: string;
  negativeMarking?: string;
  negativeMarkingHi?: string;
  qualifyingMarks?: string;
  qualifyingMarksHi?: string;
  subjects?: ExamSubjectPattern[];
  notes?: string[];
  notesHi?: string[];
}

export interface CustomPostSection {
  id: string;
  title: string;
  titleHi?: string;
  content: string;
  contentHi?: string;
  sectionType?: 'paragraph' | 'table' | 'bullets' | 'alert_box';
}

export interface VacancyItem {
  id: string;
  title: string;
  titleHi: string;
  shortTitle?: string;
  shortTitleHi?: string;
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
  applicationFee: any;
  importantDates: any;
  directLinks?: DirectLinkItem[];
  latestNews?: LatestNewsItem[];
  status: JobStatusType;
  salary: string;
  salaryHi?: string;
  salaryTable?: PayScaleItem[];
  examPattern?: ExamPatternDetails;
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
  isTrending?: boolean;
  isHighDemand?: boolean;
  clicksCount?: number;
  savesCount?: number;
  description: string;
  descriptionHi: string;
  briefSummary?: string;
  briefSummaryHi?: string;
  tspBreakdown?: {
    nonTsp: number;
    tsp: number;
    sahariya?: number;
  };
  postBreakdown?: PostBreakdownItem[];
  handwrittenNotes?: {
    headingHi?: string;
    subheadingHi?: string;
    pointsHi?: string[];
    checklistHi?: string[];
    teacherSignHi?: string;
  };
  howToApply?: string[];
  howToApplyHi?: string[];
  requiredDocuments?: string[];
  requiredDocumentsHi?: string[];
  postalAddress?: string;
  postalAddressHi?: string;
  envelopeNoteHi?: string;
  customSections?: CustomPostSection[];
  deletedSectionKeys?: string[];
  sectionOrder?: string[];
  faqs?: { q: string; qHi: string; a: string; aHi: string }[];
  yojanaOverview?: {
    yojanaName?: string;
    state?: string;
    department?: string;
    academicSession?: string;
    beneficiaries?: string;
    monthlyAssistance?: string;
    durationPerYear?: string;
    maxAnnualAssistance?: string;
    totalBeneficiariesCount?: string;
    applyStartDate?: string;
    applyLastDate?: string;
    applyMode?: string;
    paymentMode?: string;
    officialWebsite?: string;
  };
  yojanaGeneralInfo?: {
    headingHi?: string;
    descriptionHi?: string;
    objectiveHi?: string;
    benefitsSummaryHi?: string;
    keyPointsHi?: string[];
  };
  yojanaEligibility?: {
    headingHi?: string;
    criteriaHi?: string[];
    incomeLimitHi?: string[];
  };
  officialNotificationExcerpt?: {
    authority?: string;
    refNo?: string;
    date?: string;
    titleRed?: string;
    titleSubtitle?: string;
    body?: string;
  };
  seoSettings?: SeoSettings;
  updatedAt?: string;
  createdAt: string;
}

export interface SeoSettings {
  focusKeywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  robotsMeta?: string;
  ogImageUrl?: string;
}

export type LanguageMode = 'en' | 'hi';
