import React, { useEffect, useState, useMemo } from 'react';
import { 
  Calendar, 
  ShieldCheck, 
  Edit3, 
  Trash2,
  Bell, 
  Search,
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Folder,
  Send,
  MessageCircle,
  FileText,
  Check,
  Plus,
  PlusCircle,
  RefreshCw,
  EyeOff,
  X,
  Home
} from 'lucide-react';
import { VacancyItem, LanguageMode, CustomPostSection } from '../types';
import { AdSection } from './AdSection';

interface VacancyDetailPageProps {
  vacancy: VacancyItem;
  onBack: () => void;
  lang: LanguageMode;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  allVacancies: VacancyItem[];
  onSelectOtherVacancy: (item: VacancyItem) => void;
  onEditVacancy?: (vacancy: VacancyItem) => void;
  onDeleteVacancy?: (id: string) => void;
  onUpdateVacancy?: (updatedJob: VacancyItem) => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  isAlertSet?: boolean;
  onToggleAlertMe?: (id: string) => void;
  onSelectCategory?: (category: string) => void;
}

type SarkariPost = VacancyItem;

// Pure normalizer to safely guarantee Arrays for importantDates, applicationFee, directLinks and latestNews
export const normalizePost = (v: VacancyItem): any => {
  if (!v) return v;

  const defaultDirectLinks = (v as any).directLinks && Array.isArray((v as any).directLinks) && (v as any).directLinks.length > 0
    ? (v as any).directLinks
    : [
        {
          label: 'Apply Online',
          actionText: 'Click Here',
          type: 'apply',
          url: v.officialLinks?.applyOnlineUrl || v.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in',
          isPrimary: true
        },
        {
          label: 'Download Notification (PDF)',
          actionText: 'Download PDF',
          type: 'notification',
          url: v.officialLinks?.notificationPdfUrl || v.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in',
          isPdf: true,
          fileName: `${(v.shortTitle || v.title || 'Notification').replace(/\s+/g, '_')}.pdf`
        },
        {
          label: 'Official Website',
          actionText: 'Click Here',
          type: 'official',
          url: v.officialLinks?.officialWebsiteUrl || 'https://rajasthanvaccancy.vercel.app/'
        }
      ];

  const defaultDatesArray = Array.isArray((v as any).importantDates)
    ? (v as any).importantDates
    : [
        { label: 'Application Begin', value: (v.importantDates as any)?.applyStartDate || 'शीघ्र' },
        { label: 'Last Date for Apply Online', value: (v.importantDates as any)?.applyLastDate || 'शीघ्र' },
        { label: 'Pay Exam Fee Last Date', value: (v.importantDates as any)?.feeLastDate || (v.importantDates as any)?.applyLastDate || 'शीघ्र' },
        { label: 'Exam Date', value: (v.importantDates as any)?.examDate || 'As per Schedule' },
        { label: 'Admit Card Available', value: (v.importantDates as any)?.admitCardDate || 'Before Exam' },
        { label: 'Notification Released', value: (v.importantDates as any)?.notificationDate || 'अक्टूबर 2026' },
      ];

  const defaultFeeArray = Array.isArray((v as any).applicationFee)
    ? (v as any).applicationFee
    : [
        { category: 'General / OBC / EWS', amount: `₹${(v.applicationFee as any)?.genObc ?? 600}/-` },
        { category: 'SC / ST / Divyang', amount: `₹${(v.applicationFee as any)?.scSt ?? 400}/-` },
        { category: 'Correction Charge', amount: '₹300/-' },
        { category: 'Pay Exam Fee Through', amount: (v.applicationFee as any)?.paymentModeHi || (v.applicationFee as any)?.paymentMode || 'Online (Debit / Credit Card / Net Banking)' },
      ];

  const defaultLatestNews = (v as any).latestNews && Array.isArray((v as any).latestNews) && (v as any).latestNews.length > 0
    ? (v as any).latestNews
    : [
        {
          id: 'news-1',
          date: (v.importantDates as any)?.notificationDate || '25 अक्टूबर 2026',
          badge: 'ताज़ा अपडेट',
          headline: `${v.shortTitleHi || v.titleHi || v.title} के संबंध में नई सूचना जारी`,
          details: `${v.organization || 'विभाग'} द्वारा आधिकारिक पोर्टल पर भर्ती संबंधी आवश्यक दिशा-निर्देश व परीक्षा कैलेंडर की जानकारी अपडेट कर दी गई है।`,
          isHighlighted: true
        },
        {
          id: 'news-2',
          date: 'अक्टूबर 2026',
          badge: 'महत्वपूर्ण सूचना',
          headline: 'ऑनलाइन आवेदन व पात्रता नियम',
          details: 'इच्छुक अभ्यर्थी आवेदन करने से पूर्व अपनी शैक्षणिक योग्यता, आयु सीमा एवं आवश्यक प्रमाणपत्र (जाति/मूल निवास/EWS) की जांच अवश्य कर लें।',
          isHighlighted: false
        }
      ];

  return {
    ...v,
    directLinks: defaultDirectLinks,
    importantDates: defaultDatesArray,
    applicationFee: defaultFeeArray,
    latestNews: defaultLatestNews,
    requiredDocumentsHi: (v as any).requiredDocumentsHi && Array.isArray((v as any).requiredDocumentsHi) && (v as any).requiredDocumentsHi.length > 0
      ? (v as any).requiredDocumentsHi
      : getHighestEligibilityDocuments(v, true),
    howToApplyHi: (v as any).howToApplyHi && Array.isArray((v as any).howToApplyHi) && (v as any).howToApplyHi.length > 0
      ? getHowToApplySteps(v, true)
      : getHowToApplySteps(v, true)
  };
};

/**
 * Dynamically computes required educational & category documents tailored specifically
 * to the vacancy's maximum/highest eligibility tier (10th only / 12th only / Graduation / PG).
 */
export const getHighestEligibilityDocuments = (v: Partial<VacancyItem>, isHi = true): string[] => {
  if (!v) return [];
  
  const quals = (Array.isArray(v.qualification) ? v.qualification : []) as string[];
  const qualDetails = ((v.qualificationDetailsHi || '') + ' ' + (v.qualificationDetails || '')).toLowerCase();
  const title = ((v.title || '') + ' ' + (v.titleHi || '') + ' ' + (v.postName || '') + ' ' + (v.postNameHi || '')).toLowerCase();

  // Tier detection
  const isPostGrad = quals.includes('PostGraduate') || qualDetails.includes('स्नातकोत्तर') || qualDetails.includes('post graduate') || qualDetails.includes('मास्टर') || qualDetails.includes('m.sc') || qualDetails.includes('m.a') || qualDetails.includes('m.com');
  const isBEdOrBSTC = quals.includes('B.Ed/BSTC') || qualDetails.includes('b.ed') || qualDetails.includes('bstc') || qualDetails.includes('d.el.ed') || qualDetails.includes('ctet') || qualDetails.includes('reet');
  const isEngineering = quals.includes('Engineering') || qualDetails.includes('b.tech') || qualDetails.includes('b.e.') || qualDetails.includes('इंजीनियरिंग');
  const isMedical = quals.includes('Medical') || qualDetails.includes('mbbs') || qualDetails.includes('bams') || qualDetails.includes('चिकित्सा') || qualDetails.includes('नर्सिंग') || qualDetails.includes('anm') || qualDetails.includes('gnm');
  const isGraduate = isPostGrad || isBEdOrBSTC || isEngineering || isMedical || quals.includes('Graduate') || qualDetails.includes('स्नातक') || qualDetails.includes('graduate') || qualDetails.includes('डिग्री');
  const isItiDiploma = quals.includes('ITI/Diploma') || qualDetails.includes('iti') || qualDetails.includes('आईटीआई') || qualDetails.includes('डिप्लोमा') || qualDetails.includes('diploma');
  const is12th = isGraduate || quals.includes('12th') || qualDetails.includes('12वीं') || qualDetails.includes('12th') || qualDetails.includes('10+2') || qualDetails.includes('इंटरमीडिएट') || qualDetails.includes('उच्च माध्यमिक');
  const is10thOnly = !isGraduate && !is12th;

  const docs: string[] = [];

  if (isHi) {
    // 10th marksheet for Date of Birth & matriculation
    docs.push('दसवीं (10th) कक्षा की अंकतालिका एवं प्रमाण पत्र (जन्मतिथि सत्यापन हेतु)।');

    if (isPostGrad) {
      docs.push('बारहवीं (12th) कक्षा की अंकतालिका एवं प्रमाण पत्र।');
      docs.push('स्नातक (Graduation) की डिग्री एवं अंकतालिकाएं।');
      docs.push('अधिकतम शैक्षणिक योग्यता: संबंधित विषय में स्नातकोत्तर (PG / Master Degree) की डिग्री एवं अंकतालिका।');
    } else if (isBEdOrBSTC) {
      docs.push('बारहवीं (12th) कक्षा की अंकतालिका एवं प्रमाण पत्र।');
      docs.push('स्नातक (Graduation) की डिग्री व अंकतालिका।');
      docs.push('अधिकतम शैक्षणिक योग्यता: B.Ed / BSTC / D.El.Ed एवं शिक्षक पात्रता परीक्षा (CTET / REET) उत्तीर्ण प्रमाण पत्र।');
    } else if (isEngineering) {
      docs.push('बारहवीं (12th) कक्षा की अंकतालिका एवं प्रमाण पत्र।');
      docs.push('अधिकतम शैक्षणिक योग्यता: संबंधित इंजीनियरिंग शाखा में B.E. / B.Tech डिग्री एवं समस्त सेमेस्टर की अंकतालिकाएं।');
    } else if (isMedical) {
      docs.push('बारहवीं (12th) कक्षा की अंकतालिका।');
      docs.push('अधिकतम शैक्षणिक योग्यता: MBBS / नर्सिंग डिग्री / डिप्लोमा एवं संबंधित काउंसिल का वैध रजिस्ट्रेशन प्रमाण पत्र।');
    } else if (isGraduate) {
      docs.push('बारहवीं (12th) कक्षा की अंकतालिका एवं प्रमाण पत्र।');
      docs.push(v.qualificationDetailsHi
        ? `अधिकतम शैक्षणिक योग्यता: ${v.qualificationDetailsHi}`
        : 'अधिकतम शैक्षणिक योग्यता: मान्यता प्राप्त विश्वविद्यालय से स्नातक (Graduation) डिग्री एवं समस्त वर्षों की अंकतालिकाएं।'
      );
    } else if (is12th) {
      // 12th pass maximum eligibility: do NOT add Graduation!
      docs.push('बारहवीं (12th / 10+2) कक्षा उत्तीर्ण की मूल अंकतालिका एवं प्रमाण पत्र (अधिकतम शैक्षणिक योग्यता)।');
      if (qualDetails.includes('टाइपिंग') || qualDetails.includes('typing') || title.includes('typist') || title.includes('टाइपिस्ट')) {
        docs.push('कंप्यूटर टाइपिंग दक्षता प्रमाण पत्र (30 WPM हिंदी अथवा निर्धारित गति)।');
      }
      if (isItiDiploma) {
        docs.push('संबंधित ट्रेड में ITI / डिप्लोमा प्रमाण पत्र एवं अंकतालिका।');
      }
    } else if (is10thOnly) {
      // 10th pass only: do NOT add 12th or Graduation!
      if (isItiDiploma || qualDetails.includes('iti') || qualDetails.includes('आईटीआई')) {
        docs.push('संबंधित अधिसूचित ट्रेड में NCVT / SCVT द्वारा जारी ITI / नेशनल अप्रेंटिसशिप (NAC) प्रमाण पत्र (तकनीकी पदों हेतु)।');
      } else if (v.qualificationDetailsHi) {
        docs.push(`अधिकतम शैक्षणिक योग्यता: ${v.qualificationDetailsHi}`);
      }
    } else {
      if (v.qualificationDetailsHi) {
        docs.push(`अधिकतम शैक्षणिक योग्यता: ${v.qualificationDetailsHi}`);
      }
    }

    // Standard non-educational documents
    docs.push('मूल निवास प्रमाण पत्र (Bonafide Domicile Certificate)।');
    docs.push('जाति प्रमाण पत्र (SC / ST / OBC / MBC / EWS प्रमाण पत्र, यदि लागू हो)।');
    docs.push('नवीनतम पासपोर्ट साइज रंगीन फोटो एवं स्पष्ट हस्ताक्षर।');
    docs.push('पहचान पत्र (आधार कार्ड / पैन कार्ड अनिवार्य)।');
  } else {
    docs.push('10th class marksheet and certificate (for Date of Birth verification).');
    if (isGraduate) {
      docs.push('12th class marksheet and certificate.');
      docs.push(`Highest Educational Qualification: ${v.qualificationDetails || 'Graduation Degree & all semester marksheets.'}`);
    } else if (is12th) {
      docs.push(`Highest Educational Qualification: ${v.qualificationDetails || '12th (10+2) Marksheet & Passing Certificate.'}`);
      if (qualDetails.includes('typing') || title.includes('typist')) {
        docs.push('Computer typing proficiency certificate / skill certificate.');
      }
    } else {
      docs.push(`Highest Educational Qualification: ${v.qualificationDetails || '10th (Matriculation) Certificate.'}`);
    }
    docs.push('State Domicile Certificate (Mool Niwas).');
    docs.push('Caste Certificate (SC/ST/OBC/EWS) if applicable.');
    docs.push('Recent passport size photograph and scanned signature.');
    docs.push('Identity Proof (Aadhaar Card / Voter ID).');
  }

  return docs;
};

/**
 * Dynamically computes application steps completely free of SSO hardcoding.
 * Tailors to offline submissions or official portal based on vacancy type.
 */
export const getHowToApplySteps = (v: Partial<VacancyItem>, isHi = true): string[] => {
  if (isHi && Array.isArray(v.howToApplyHi) && v.howToApplyHi.length > 0) {
    // Sanitize any SSO occurrences
    return v.howToApplyHi.map(s => 
      s.replace(/राजस्थान\s*SSO\s*पोर्टल\s*\(sso\.rajasthan\.gov\.in\)/gi, 'आधिकारिक भर्ती पोर्टल')
       .replace(/sso\.rajasthan\.gov\.in/gi, 'आधिकारिक वेबसाइट')
       .replace(/अपनी\s*SSO\s*ID\s*और\s*पासवर्ड/gi, 'अपनी लॉगिन आईडी और पासवर्ड')
    );
  }
  if (!isHi && Array.isArray(v.howToApply) && v.howToApply.length > 0) {
    return v.howToApply.map(s => 
      s.replace(/Rajasthan\s*SSO\s*\(sso\.rajasthan\.gov\.in\)/gi, 'Official Recruitment Portal')
       .replace(/sso\.rajasthan\.gov\.in/gi, 'official website')
       .replace(/SSO\s*ID/gi, 'Login ID')
    );
  }

  const isOffline = ((v.postNameHi || '') + (v.titleHi || '') + (v.descriptionHi || '')).includes('ऑफलाइन') || 
                    (v.selectionProcessHi || []).some(s => s.includes('ऑफलाइन')) ||
                    (v.id && v.id.includes('air-force'));

  if (isOffline) {
    return isHi ? [
      'चरण 1: सबसे पहले आधिकारिक नोटिफिकेशन एवं निर्धारित ऑफलाइन आवेदन पत्र (Application Form PDF) डाउनलोड करें।',
      'चरण 2: आवेदन फॉर्म को A4 साइज के साफ सफेद पेपर पर स्पष्ट प्रिंट निकालें।',
      'चरण 3: फॉर्म में आवेदित पद का नाम, श्रेणी, व्यक्तिगत विवरण तथा अधिकतम शैक्षणिक योग्यता का विवरण सही-सही भरें।',
      'चरण 4: फॉर्म पर निर्धारित स्थान पर अपनी नवीनतम पासपोर्ट साइज फोटो चिपकाएं और उस पर स्व-हस्ताक्षर (Self-Attest) करें।',
      'चरण 5: सभी आवश्यक दस्तावेजों (10वीं, 12वीं/डिग्री अंकतालिका, जाति, मूल निवास प्रमाण पत्र) की स्वप्रमाणित छायाप्रतियां फॉर्म के साथ संलग्न करें।',
      'चरण 6: यदि लागू हो तो निर्धारित डाक टिकट लगा हुआ स्वयं का पता लिखा लिफाफा साथ में लगाएं।',
      'चरण 7: मुख्य लिफाफे के ऊपर बड़े अक्षरों में आवेदित पद का नाम एवं अपनी श्रेणी अवश्य लिखें।',
      'चरण 8: संपूर्ण आवेदन पत्र को अंतिम तिथि से पूर्व विभाग द्वारा अधिसूचित पते पर पंजीकृत डाक या स्पीड पोस्ट द्वारा भेजें।'
    ] : [
      'Step 1: Download the official notification and the offline application form PDF.',
      'Step 2: Print the application form clearly on clean A4 size paper.',
      'Step 3: Fill in the applied post name, category, personal details, and highest educational qualification carefully.',
      'Step 4: Affix your recent passport size photograph and self-attest across it.',
      'Step 5: Attach self-attested copies of all required educational and category certificates.',
      'Step 6: Attach a self-addressed stamped envelope if prescribed in the notification.',
      'Step 7: Superscribe the envelope with the applied post name and category.',
      'Step 8: Send the complete application by Registered or Speed Post to the designated departmental address before the deadline.'
    ];
  }

  const portalHost = v.officialLinks?.officialWebsiteUrl 
    ? (() => {
        try {
          return new URL(v.officialLinks.officialWebsiteUrl).hostname;
        } catch {
          return 'आधिकारिक पोर्टल';
        }
      })()
    : 'आधिकारिक भर्ती पोर्टल';

  if (isHi) {
    return [
      `चरण 1: सबसे पहले संबंधित विभाग / भर्ती बोर्ड के आधिकारिक पोर्टल (${portalHost}) पर जाएं।`,
      'चरण 2: पोर्टल के मुख्य पृष्ठ पर उपलब्ध "Recruitment / ऑनलाइन आवेदन" सेक्शन पर क्लिक करें।',
      'चरण 3: संबंधित पद/भर्ती के विज्ञापन के सामने दिए गए "Apply Online / फॉर्म भरें" बटन पर क्लिक करें।',
      'चरण 4: यदि आप नए अभ्यर्थी हैं तो New Registration करें अथवा अपनी यूजर आईडी व पासवर्ड से लॉगिन करें।',
      'चरण 5: अपनी व्यक्तिगत जानकारी, संपर्क विवरण, श्रेणी तथा अधिकतम शैक्षणिक योग्यता का विवरण ध्यानपूर्वक भरें।',
      'चरण 6: निर्धारित प्रारूप व आकार (JPG 20-70 KB) में अपनी नवीनतम पासपोर्ट साइज फोटो एवं हस्ताक्षर अपलोड करें।',
      'चरण 7: अपनी श्रेणी अनुसार निर्धारित ऑनलाइन आवेदन शुल्क का नेट बैंकिंग, डेबिट कार्ड या यूपीआई द्वारा भुगतान करें।',
      'चरण 8: भरे गए संपूर्ण आवेदन पत्र का पूर्वावलोकन (Preview) जांचें, फाइनल सबमिट करें और प्रिंटआउट भविष्य के लिए सुरक्षित रख लें।'
    ];
  } else {
    return [
      `Step 1: Visit the official recruitment portal of the department (${portalHost}).`,
      'Step 2: Click on the "Recruitment / Online Application" link on the homepage.',
      'Step 3: Select this recruitment and click on the "Apply Online" button.',
      'Step 4: Register as a new user or log in with your existing credentials.',
      'Step 5: Fill in your personal details, category, and highest educational qualification accurately.',
      'Step 6: Upload your latest passport size photograph and signature in the prescribed format and size.',
      'Step 7: Pay the prescribed examination fee via online payment gateway.',
      'Step 8: Review the application preview, submit the form, and download/print the final confirmation page.'
    ];
  }
};

export const VacancyDetailPage: React.FC<VacancyDetailPageProps> = ({
  vacancy,
  onBack,
  lang,
  isSaved,
  onToggleSave,
  allVacancies,
  onSelectOtherVacancy,
  onEditVacancy,
  onDeleteVacancy,
  onUpdateVacancy,
  isAdmin = false,
  isAlertSet = false,
  onToggleAlertMe,
  onSelectCategory,
}) => {
  const [editablePost, setEditablePost] = useState<VacancyItem>(() => normalizePost(vacancy) as VacancyItem);
  const currentVacancy = editablePost;
  const setCurrentVacancy = setEditablePost;

  const [isDirectEditMode, setIsDirectEditMode] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  const [pdfUploadTargetIndex, setPdfUploadTargetIndex] = useState<number | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [alertFeedback, setAlertFeedback] = useState<string>('');

  useEffect(() => {
    setEditablePost(normalizePost(vacancy));
  }, [vacancy]);

  // 1. Reusable In-Place Word Editable Component (FullPagePostView.tsx)
  const EditableText: React.FC<{
    value?: string | number;
    onChange: (val: string) => void;
    className?: string;
    style?: React.CSSProperties;
    as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'div' | 'p' | 'td';
    placeholder?: string;
    titlePrefix?: string;
  }> = ({
    value = '',
    onChange,
    className = '',
    style,
    as: Tag = 'span',
    placeholder = '...',
    titlePrefix = 'टेक्स्ट'
  }) => {
    const strVal = String(value ?? '');
    
    // यदि वर्ड एडिट मोड बंद है तो साधारण टेक्स्ट दिखाएं
    if (!isDirectEditMode) {
      return (
        <Tag className={className} style={style}>
          {strVal || placeholder}
        </Tag>
      );
    }

    // वर्ड एडिट मोड चालू होने पर सीधे क्लिक करके टाइप करें
    return (
      <Tag
        contentEditable
        suppressContentEditableWarning
        style={style}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && Tag !== 'p' && Tag !== 'div') {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        onBlur={(e) => {
          const updated = e.currentTarget.innerText.trim();
          if (updated !== strVal) {
            onChange(updated);
          }
        }}
        className={`${className} outline-none cursor-text transition-all hover:bg-amber-100/90 focus:bg-amber-50 focus:ring-2 focus:ring-amber-500 rounded px-1 -mx-0.5 border-b border-dashed border-amber-500 min-w-[20px] inline-block`}
        title={`क्लिक करके ${titlePrefix} बदलें (Click to edit text)`}
      >
        {strVal || placeholder}
      </Tag>
    );
  };

  // 2. Real-Time Non-Blocking Auto Persistence (बिना लूप के ऑटो-सेव)
  const onUpdatePost = onUpdateVacancy;
  const lastSavedJsonRef = React.useRef<string>('');
  const onUpdatePostRef = React.useRef(onUpdatePost);

  useEffect(() => {
    onUpdatePostRef.current = onUpdatePost;
  }, [onUpdatePost]);

  useEffect(() => {
    const currentJson = JSON.stringify(editablePost);
    if (!lastSavedJsonRef.current) {
      lastSavedJsonRef.current = currentJson;
      return;
    }
    if (currentJson === lastSavedJsonRef.current) return;
    lastSavedJsonRef.current = currentJson;

    // पैरेंट कंपोनेंट व Firestore में अपडेट
    if (onUpdatePost) {
      onUpdatePost(editablePost);
    }
    // LocalStorage में तुरंत सुरक्षित
    try {
      const saved = localStorage.getItem('sarkari_admin_posts_v5');
      let currentArr: SarkariPost[] = saved ? JSON.parse(saved) : [];
      const idx = currentArr.findIndex(p => p.id === editablePost.id);
      if (idx >= 0) {
        currentArr[idx] = editablePost;
      } else {
        currentArr.push(editablePost);
      }
      localStorage.setItem('sarkari_admin_posts_v5', JSON.stringify(currentArr));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error(e);
    }
  }, [editablePost]);

  useEffect(() => {
    if (alertFeedback) {
      const timer = setTimeout(() => setAlertFeedback(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [alertFeedback]);

  const handleAttachPdfToLink = (idx: number) => {
    setPdfUploadTargetIndex(idx);
    setIsPdfModalOpen(true);
  };

  const handleAddDirectLink = () => {
    setEditablePost(prev => {
      const list = [...(prev.directLinks || [])];
      list.push({
        label: 'New Important Link / नया लिंक',
        actionText: 'Click Here',
        type: 'official',
        url: 'https://rajasthanvaccancy.vercel.app/'
      });
      return { ...prev, directLinks: list };
    });
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('कृपया केवल PDF (.pdf) फ़ाइल चुनें।');
      return;
    }

    const fileSizeKb = Math.round(file.size / 1024);
    const fileSizeStr = fileSizeKb > 1024 ? `${(fileSizeKb / 1024).toFixed(2)} MB` : `${fileSizeKb} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const cleanFileName = file.name.replace(/\.pdf$/i, '');

      setEditablePost(prev => {
        const list = [...(prev.directLinks || [])];
        if (pdfUploadTargetIndex !== null && pdfUploadTargetIndex >= 0 && pdfUploadTargetIndex < list.length) {
          list[pdfUploadTargetIndex] = {
            ...list[pdfUploadTargetIndex],
            url: dataUrl,
            fileName: file.name,
            fileSize: fileSizeStr,
            isPdf: true,
            actionText: list[pdfUploadTargetIndex].actionText || 'Download PDF'
          };
        } else {
          list.push({
            label: `Download ${cleanFileName} (PDF)`,
            actionText: 'Download PDF',
            type: 'notification',
            url: dataUrl,
            fileName: file.name,
            fileSize: fileSizeStr,
            isPdf: true,
            isPrimary: true
          });
        }
        return { ...prev, directLinks: list };
      });

      setAlertFeedback(`✅ PDF फ़ाइल "${file.name}" (${fileSizeStr}) सफलतापूर्वक जोड़ी गई!`);
      setIsPdfModalOpen(false);
    };

    reader.readAsDataURL(file);
  };

  const isHi = lang === 'hi';
  const postTitle = isHi ? (currentVacancy.titleHi || currentVacancy.title) : currentVacancy.title;
  const shortJobName = currentVacancy.shortTitleHi || currentVacancy.shortTitle || postTitle.split(':')[0] || 'भर्ती 2026';

  const isOfflinePost = ((editablePost.titleHi || '') + (editablePost.postNameHi || '') + (editablePost.id || '') + (editablePost.department || '')).toLowerCase().includes('ऑफलाइन') ||
    ((editablePost.title || '') + (editablePost.postName || '') + (editablePost.id || '')).toLowerCase().includes('offline') ||
    (editablePost.id && editablePost.id.includes('hindi-typist')) ||
    (editablePost.id && editablePost.id.includes('air-force')) ||
    Boolean(editablePost.postalAddress);

  const [copiedLink, setCopiedLink] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  const getShareStartDate = () => {
    if (typeof editablePost.importantDates === 'object' && !Array.isArray(editablePost.importantDates)) {
      return (editablePost.importantDates as any)?.applyStartDate || 'शीघ्र';
    }
    if (Array.isArray(editablePost.importantDates)) {
      const found = (editablePost.importantDates as any[]).find((d: any) => 
        d.label?.toLowerCase().includes('begin') || 
        d.label?.toLowerCase().includes('start') || 
        d.label?.includes('शुरू') || 
        d.label?.includes('प्रारंभ')
      );
      if (found) return found.value;
    }
    return 'शीघ्र';
  };

  const getShareLastDate = () => {
    if (typeof editablePost.importantDates === 'object' && !Array.isArray(editablePost.importantDates)) {
      return (editablePost.importantDates as any)?.applyLastDate || 'शीघ्र';
    }
    if (Array.isArray(editablePost.importantDates)) {
      const found = (editablePost.importantDates as any[]).find((d: any) => 
        d.label?.toLowerCase().includes('last') || 
        d.label?.includes('अंतिम')
      );
      if (found) return found.value;
    }
    return 'शीघ्र';
  };

  const handleShareBigUpdate = () => {
    const jobTitle = editablePost.titleHi || editablePost.title || 'राजस्थान भर्ती 2026';
    const totalPosts = editablePost.totalPosts || '130';
    const startDate = getShareStartDate();
    const lastDate = getShareLastDate();
    const postUrl = window.location.href;

    const shareText = `🚨 *BIG अपडेट* 🚨\n\n📋 *भर्ती का नाम:* ${jobTitle}\n🔢 *कुल पद:* ${totalPosts}\n💳 *आवेदन की प्रारंभ तिथि:* ${startDate}\n⏳ *आवेदन की अंतिम तिथि:* ${lastDate}\n\n👇 *संपूर्ण विवरण पढ़ें व ऑनलाइन फॉर्म भरें:*\n${postUrl}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Section Management State for Admin
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [newSectionType, setNewSectionType] = useState<'paragraph' | 'bullets' | 'alert_box'>('paragraph');
  const [editingCustomSection, setEditingCustomSection] = useState<CustomPostSection | null>(null);

  const deletedKeys = currentVacancy.deletedSectionKeys || [];
  const isSectionDeleted = (key: string) => deletedKeys.includes(key);

  const sectionLabels: Record<string, string> = {
    overview: 'संक्षिप्त विवरण तालिका (Quick Overview)',
    latest_update: 'लेटेस्ट अपडेट (Latest Update)',
    latest_news: 'ताज़ा समाचार (Latest News)',
    dates: 'महत्वपूर्ण तिथियाँ (Important Dates)',
    post_breakdown: 'पदों का विवरण (Post Breakdown)',
    qualification: 'शैक्षणिक योग्यता (Eligibility)',
    age_limit: 'आयु सीमा (Age Limit)',
    application_fee: 'आवेदन शुल्क (Application Fee)',
    selection_process: 'चयन प्रक्रिया (Selection Process)',
    postal_address: 'आवेदन भेजने का पता (Postal Address)',
    salary: 'वेतनमान (Salary Scale)',
    teacher_notes: 'स्पेशल नोट्स (Teacher Notes)',
    how_to_apply: 'आवेदन कैसे करें (How to Apply)',
    important_links: 'महत्वपूर्ण लिंक्स (Important Links)',
    faqs: 'प्रश्नोत्तर (FAQs)'
  };

  const handleDeleteSection = (key: string) => {
    if (key.startsWith('custom_')) {
      const customId = key.replace('custom_', '');
      const updated: VacancyItem = {
        ...currentVacancy,
        customSections: (currentVacancy.customSections || []).filter(s => s.id !== customId)
      };
      setCurrentVacancy(updated);
      if (onUpdateVacancy) onUpdateVacancy(updated);
    } else {
      if (!deletedKeys.includes(key)) {
        const updated: VacancyItem = {
          ...currentVacancy,
          deletedSectionKeys: [...deletedKeys, key]
        };
        setCurrentVacancy(updated);
        if (onUpdateVacancy) onUpdateVacancy(updated);
      }
    }
  };

  const handleRestoreSection = (key: string) => {
    const updated: VacancyItem = {
      ...currentVacancy,
      deletedSectionKeys: deletedKeys.filter(k => k !== key)
    };
    setCurrentVacancy(updated);
    if (onUpdateVacancy) onUpdateVacancy(updated);
  };

  const renderAdminSectionControls = (key: string, label: string) => {
    if (!isAdmin) return null;
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        {onEditVacancy && (
          <button
            type="button"
            onClick={() => onEditVacancy(currentVacancy)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 transition cursor-pointer"
            title={`डायरेक्ट पोस्ट एडिटर में ${label} अपडेट करें`}
          >
            <Edit3 className="w-3 h-3 text-sky-600" />
            <span>एडिट करें</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => handleDeleteSection(key)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
          title={`इस ${label} सेक्शन को हटाएं`}
        >
          <Trash2 className="w-3 h-3 text-rose-600" />
          <span>सेक्शन हटाएं</span>
        </button>
      </div>
    );
  };

  const handleAddNewSection = () => {
    if (!newSectionTitle.trim()) return;
    const newSec: CustomPostSection = {
      id: Date.now().toString(),
      title: newSectionTitle.trim(),
      titleHi: newSectionTitle.trim(),
      content: newSectionContent.trim() || 'विवरण यहाँ उपलब्ध है।',
      contentHi: newSectionContent.trim() || 'विवरण यहाँ उपलब्ध है。',
      sectionType: newSectionType
    };
    const updated: VacancyItem = {
      ...currentVacancy,
      customSections: [...(currentVacancy.customSections || []), newSec]
    };
    setCurrentVacancy(updated);
    if (onUpdateVacancy) onUpdateVacancy(updated);
    setNewSectionTitle('');
    setNewSectionContent('');
    setIsAddSectionOpen(false);
  };

  const handleSaveCustomSectionEdit = () => {
    if (!editingCustomSection) return;
    const updated: VacancyItem = {
      ...currentVacancy,
      customSections: (currentVacancy.customSections || []).map(s =>
        s.id === editingCustomSection.id ? editingCustomSection : s
      )
    };
    setCurrentVacancy(updated);
    if (onUpdateVacancy) onUpdateVacancy(updated);
    setEditingCustomSection(null);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Dynamic Title & SEO
    const originalTitle = document.title;
    const cleanTitle = `${postTitle} - Rajasthan Vacancy 2026`;
    document.title = cleanTitle;

    // Dynamic Meta Description & OpenGraph Tags
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc?.getAttribute('content') || '';
    const newDesc = `${postTitle}: कुल पद ${editablePost.totalPosts || 'विभिन्न पद'}। भर्ती की शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, परीक्षा तिथि एवं फॉर्म भरने की पूरी प्रक्रिया।`;
    if (metaDesc) {
      metaDesc.setAttribute('content', newDesc);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', cleanTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', newDesc);

    // Dynamic Schema.org JobPosting JSON-LD
    let scriptEl = document.getElementById('vacancy-job-posting-ld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'vacancy-job-posting-ld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const startDate = (typeof editablePost.importantDates === 'object' && !Array.isArray(editablePost.importantDates))
      ? (editablePost.importantDates as any)?.notificationDate || editablePost.createdAt || '2026-10-25'
      : editablePost.createdAt || '2026-10-25';

    const lastDate = (typeof editablePost.importantDates === 'object' && !Array.isArray(editablePost.importantDates))
      ? (editablePost.importantDates as any)?.applyLastDate || '2026-11-25'
      : '2026-11-25';

    const formatIsoDate = (d: any, fallback: string): string => {
      if (!d || typeof d !== 'string') return fallback;
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      if (/^\d{4}-\d{2}-\d{2}T/.test(d)) return d;
      if (d.includes('2026') || d.includes('2025')) {
        if (d.includes('अक्टूबर') || d.includes('Oct')) return '2026-10-25';
        if (d.includes('जनवरी') || d.includes('Jan')) return '2026-01-15';
        if (d.includes('फरवरी') || d.includes('Feb')) return '2026-02-15';
        if (d.includes('मार्च') || d.includes('Mar')) return '2026-03-15';
        if (d.includes('नवंबर') || d.includes('Nov')) return '2026-11-15';
        if (d.includes('दिसंबर') || d.includes('Dec')) return '2026-12-15';
      }
      return fallback;
    };

    const isoDatePosted = formatIsoDate(startDate, editablePost.createdAt || '2026-10-25');
    const isoValidThrough = formatIsoDate(lastDate, '2026-11-25');

    const jobPostingData = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "@id": `https://rajasthanvaccancy.vercel.app/?vacancy=${editablePost.id}#job`,
      "title": editablePost.titleHi || editablePost.title,
      "description": editablePost.briefSummaryHi || editablePost.descriptionHi || newDesc,
      "identifier": {
        "@type": "PropertyValue",
        "name": editablePost.organization || "Rajasthan Government",
        "value": editablePost.id
      },
      "datePosted": isoDatePosted,
      "validThrough": isoValidThrough,
      "employmentType": "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": editablePost.organization || "Rajasthan Govt Department",
        "sameAs": editablePost.officialLinks?.officialWebsiteUrl || "https://rajasthan.gov.in"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressRegion": "Rajasthan",
          "addressCountry": "IN"
        }
      }
    };

    scriptEl.textContent = JSON.stringify(jobPostingData, null, 2);

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.setAttribute('content', originalDesc);
      const scriptToRemove = document.getElementById('vacancy-job-posting-ld');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [vacancy.id, postTitle, editablePost]);

  const renderSectionShareButton = (_sectionKey: string, _sectionTitle: string) => null;

  // Previous and Next Post for navigation footer
  const { prevPost, nextPost } = useMemo(() => {
    if (!allVacancies || allVacancies.length === 0) return { prevPost: null, nextPost: null };
    const currentIndex = allVacancies.findIndex(v => v.id === vacancy.id);
    const listLen = allVacancies.length;

    if (currentIndex === -1 || listLen <= 1) {
      return { prevPost: null, nextPost: null };
    }

    const prevIdx = (currentIndex - 1 + listLen) % listLen;
    const nextIdx = (currentIndex + 1) % listLen;

    return {
      prevPost: allVacancies[prevIdx],
      nextPost: allVacancies[nextIdx] !== allVacancies[prevIdx] ? allVacancies[nextIdx] : null
    };
  }, [allVacancies, vacancy]);

  // Recent Posts for the right sidebar (10 items)
  const recentPosts = useMemo(() => {
    return allVacancies.filter(v => v.id !== vacancy.id).slice(0, 10);
  }, [allVacancies, vacancy]);

  // Filtered recent posts if user searches in sidebar
  const filteredRecentPosts = useMemo(() => {
    if (!sidebarSearch.trim()) return recentPosts;
    const q = sidebarSearch.toLowerCase().trim();
    return allVacancies.filter(v => 
      (v.title && v.title.toLowerCase().includes(q)) || 
      (v.titleHi && v.titleHi.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [allVacancies, recentPosts, sidebarSearch]);

  // Documents list (tailored specifically to highest eligibility)
  const documentsList = useMemo(() => {
    if (isHi) {
      if (editablePost.requiredDocumentsHi && Array.isArray(editablePost.requiredDocumentsHi) && editablePost.requiredDocumentsHi.length > 0) {
        return editablePost.requiredDocumentsHi;
      }
      return getHighestEligibilityDocuments(editablePost, true);
    } else {
      if (editablePost.requiredDocuments && Array.isArray(editablePost.requiredDocuments) && editablePost.requiredDocuments.length > 0) {
        return editablePost.requiredDocuments;
      }
      return getHighestEligibilityDocuments(editablePost, false);
    }
  }, [editablePost, isHi]);

  // How to apply steps (completely free of SSO hardcoding, dynamically adapted)
  const howToApplySteps = useMemo(() => {
    return getHowToApplySteps(editablePost, isHi);
  }, [editablePost, isHi]);

  // FAQs
  const faqList = vacancy.faqs && vacancy.faqs.length > 0 ? vacancy.faqs : [
    {
      q: `What is the last date to apply for this vacancy?`,
      qHi: `इस भर्ती के लिए ऑनलाइन आवेदन की अंतिम तिथि क्या है?`,
      a: `The last date to apply is ${vacancy.importantDates?.applyLastDate || 'November 2026'}.`,
      aHi: `ऑनलाइन आवेदन करने की अंतिम तिथि ${vacancy.importantDates?.applyLastDate || '22 नवंबर 2026'} है। आवेदन रात 11:59 बजे तक जमा किए जा सकेंगे।`
    },
    {
      q: `What is the educational qualification required?`,
      qHi: `इस भर्ती के लिए शैक्षणिक योग्यता क्या है?`,
      a: `Candidates must possess minimum required educational qualification as per notification.`,
      aHi: `${vacancy.qualificationDetailsHi || 'दसवीं में न्यूनतम 50% अंकों के साथ संबंधित अधिसूचित ट्रेड में ITI / स्नातक की योग्यता आवश्यक है।'}`
    },
    {
      q: `Will there be a written exam for this recruitment?`,
      qHi: `क्या इस भर्ती में लिखित परीक्षा आयोजित की जाएगी?`,
      a: `Selection criteria is based on merit and exam pattern prescribed in the official notice.`,
      aHi: `चयन प्रक्रिया मेरिट अथवा लिखित परीक्षा और दस्तावेज सत्यापन के आधार पर नियमानुसार की जाएगी।`
    }
  ];

  const DEFAULT_SECTION_ORDER = [
    'overview',
    'latest_update',
    'latest_news',
    'dates',
    'application_fee',
    'post_breakdown',
    'qualification',
    'age_limit',
    'selection_process',
    'postal_address',
    'documents',
    'how_to_apply',
    'important_links',
    'faqs'
  ];

  const activeSectionKeys = useMemo(() => {
    const savedOrder = currentVacancy.sectionOrder;
    if (!savedOrder || savedOrder.length === 0) return DEFAULT_SECTION_ORDER;
    const normalizedSaved = savedOrder.map(k => k === 'fee' ? 'application_fee' : k === 'salary' ? 'salary_table' : k);
    const missing = DEFAULT_SECTION_ORDER.filter(k => !normalizedSaved.includes(k));
    return [...normalizedSaved, ...missing];
  }, [currentVacancy.sectionOrder]);

  return (
    <div className="w-full text-[#222222] space-y-3 sm:space-y-4">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 px-3 sm:px-4 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap text-slate-600 font-medium">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-slate-700 hover:text-[#0056b3] transition cursor-pointer font-bold"
            title="मुख्य पृष्ठ"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <button
            type="button"
            onClick={() => {
              if (onSelectCategory) {
                onSelectCategory(editablePost.category || 'job');
              } else {
                onBack();
              }
            }}
            className="text-slate-700 hover:text-[#0056b3] transition cursor-pointer font-semibold"
          >
            {editablePost.category === 'admit_card' 
              ? (isHi ? 'एडमिट कार्ड' : 'Admit Card')
              : editablePost.category === 'result'
              ? (isHi ? 'रिजल्ट' : 'Result')
              : editablePost.category === 'answer_key'
              ? (isHi ? 'उत्तर कुंजी' : 'Answer Key')
              : editablePost.category === 'syllabus'
              ? (isHi ? 'सिलेबस' : 'Syllabus')
              : (isHi ? 'लेटेस्ट जॉब्स' : 'Latest Jobs')}
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {editablePost.shortTitleHi || editablePost.shortTitle || shortJobName}
          </span>
        </nav>
      </div>

      {/* Main 2-Column WordPress GeneratePress Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Main Article Content Area (70% on Desktop) */}
        <main className="w-full lg:w-[70%] min-w-0">
          <article 
            className="bg-white rounded-lg sm:rounded-xl p-3.5 sm:p-6 border border-slate-200 shadow-2xs"
          >
              {/* Admin Actions Bar (when admin is active) */}
              {isAdmin && (
                <div className="mb-4 p-3 bg-slate-100 rounded-lg border border-slate-300 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>एडमिन कंट्रोल्स (Admin Mode Active)</span>
                      {lastSavedTime && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>ऑटो-सेव्ड ({lastSavedTime})</span>
                        </span>
                      )}
                      {hasUnsavedChanges && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-semibold animate-pulse">
                          <span>सहेजा जा रहा है...</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsDirectEditMode(!isDirectEditMode)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-xs transition cursor-pointer shadow-xs ${
                          isDirectEditMode
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        title="पेज पर सीधे शब्दों पर क्लिक करके एडिट करें"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isDirectEditMode ? '✓ वर्ड इन-प्लेस एडिट सक्रिय' : '✏️ वर्ड इन-प्लेस एडिट मोड'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddSectionOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-md font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ नया सेक्शन जोड़ें</span>
                      </button>
                      {onEditVacancy && (
                        <button
                          type="button"
                          onClick={() => onEditVacancy(currentVacancy)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-700 text-white rounded-md font-bold hover:bg-slate-800 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>फॉर्म एडिटर</span>
                        </button>
                      )}
                      {onDeleteVacancy && (
                        <button
                          type="button"
                          onClick={() => onDeleteVacancy(currentVacancy.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white rounded-md font-bold hover:bg-rose-700 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>डिलीट</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Direct Word Edit Guide Banner */}
                  {isDirectEditMode && (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-md text-amber-950 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-base">💡</span>
                        <span className="font-semibold text-xs">
                          डायरेक्ट वर्ड एडिट मोड चालू है: पेज के शीर्षक, तारीख, पद संख्या या किसी भी टेक्स्ट पर क्लिक करके सीधे टाइप करें। टाइप पूरा होते ही रियल-टाइम बिना लूप के ऑटो-सेव (Real-Time Auto-Save) हो जाएगा।
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDirectEditMode(false)}
                        className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] cursor-pointer"
                      >
                        एडिट मोड बंद करें
                      </button>
                    </div>
                  )}

                  {/* Restorable Deleted Sections Notice */}
                  {deletedKeys.length > 0 && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between gap-2 flex-wrap text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-semibold">हटाए गए सेक्शंस ({deletedKeys.length}):</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {deletedKeys.map(key => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleRestoreSection(key)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-slate-800 border border-amber-300 text-[11px] font-bold transition cursor-pointer"
                            title="इस सेक्शन को वापस लाएं"
                          >
                            <RefreshCw className="w-3 h-3 text-emerald-600" />
                            <span>{sectionLabels[key] ? sectionLabels[key].split('(')[0].trim() : key} पुनः जोड़ें</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Entry Header */}
              <header className="entry-header border-b border-slate-200 pb-4 mb-5">
                <EditableText
                  as="h1"
                  value={isHi ? (editablePost.titleHi || editablePost.title) : editablePost.title}
                  onChange={(val) => {
                    setEditablePost(prev => ({
                      ...prev,
                      titleHi: val,
                      title: val
                    }));
                  }}
                  titlePrefix="शीर्षक (Title)"
                  className="entry-title headlight font-bold text-slate-900 tracking-tight leading-snug"
                  style={{
                    fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '11.5pt',
                    lineHeight: 1.4
                  }}
                />

                {/* Entry Meta */}
                <div className="entry-meta text-[13px] text-slate-500 mt-2 flex items-center gap-3 flex-wrap">
                  <span className="posted-on flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <time className="entry-date published text-slate-600">
                      {vacancy.updatedAt || vacancy.importantDates?.notificationDate || 'October 22, 2026'}
                    </time>
                  </span>
                  <span>•</span>
                  <span className="byline">
                    by{' '}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectCategory) {
                          onSelectCategory('news');
                        } else {
                          onBack();
                        }
                      }}
                      className="font-bold text-slate-700 hover:text-slate-900 hover:underline cursor-pointer transition"
                      title={isHi ? 'लेटेस्ट न्यूज़ (Latest News) खोलें' : 'Open Latest News'}
                    >
                      RajasthanVacancy
                    </button>
                  </span>
                  <span>•</span>
                  <span className="text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                    {vacancy.organization}
                  </span>
                </div>
              </header>

              {/* Featured Header Card - Exact Match to User Screenshot */}
              <div className="mb-6 rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-[#0c594d] via-[#093f36] to-[#0d222c] p-5 sm:p-6 shadow-md text-white">
                <div className="space-y-2">
                  <span className="inline-block bg-[#166d5b] text-[#a7f3d0] border border-[#238772] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded">
                    {editablePost.department || (editablePost.organization ? `${editablePost.organization} DEPARTMENT` : 'RPSC DEPARTMENT')}
                  </span>
                  <EditableText
                    as="h2"
                    value={editablePost.shortTitleHi || editablePost.shortTitle || shortJobName}
                    onChange={(val) => {
                      setEditablePost(prev => ({
                        ...prev,
                        shortTitleHi: val,
                        shortTitle: val
                      }));
                    }}
                    titlePrefix="संक्षिप्त नाम"
                    className="headlight text-lg sm:text-xl font-extrabold text-white tracking-wide"
                    style={{ fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif" }}
                  />
                  <p className="text-emerald-100/90 text-xs font-normal">
                    {isHi ? 'विस्तृत विज्ञापन, शैक्षणिक योग्यता, आयु सीमा एवं चयन प्रक्रिया' : 'Detailed Notification, Eligibility & Application Guide'}
                  </p>

                  {/* Centered Total Posts Box matching screenshot */}
                  <div className="bg-[#062c26]/75 border border-[#1b6f60]/60 rounded-xl p-3.5 text-center mt-4 w-full shadow-inner">
                    <span className="text-[11px] uppercase font-bold text-[#6ee7b7] block tracking-wider">
                      {isHi ? 'कुल पद / सीटें' : 'Total Posts'}
                    </span>
                    <span className="text-2xl font-black text-[#facc15] block mt-0.5 tracking-wide">
                      <EditableText
                        value={editablePost.totalPosts || (isHi ? 'विभिन्न पद' : 'Various Posts')}
                        onChange={(val) => {
                          setEditablePost(prev => ({ ...prev, totalPosts: val }));
                        }}
                        titlePrefix="कुल पद"
                      />
                    </span>
                  </div>
                </div>
              </div>

              {/* Entry Content Body */}
              <div 
                className="entry-content space-y-6 text-[#334155]"
                style={{
                  fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '11.5pt',
                  lineHeight: 1.75
                }}
              >
                {/* Small Normal WhatsApp Share Bar right above संक्षिप्त विवरण */}
                <div className="flex items-center justify-between gap-2 p-2 px-3 bg-emerald-50/90 border border-emerald-200/80 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                    <span className="text-xs sm:text-sm">🚨 BIG अपडेट व्हाट्सएप पर शेयर करें:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleShareBigUpdate}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded shadow-2xs transition cursor-pointer active:scale-95 shrink-0"
                    title="WhatsApp पर BIG अपडेट शेयर करें"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
                    <span>WhatsApp शेयर</span>
                  </button>
                </div>

                {/* Opening Lead Paragraphs */}
                <div className="space-y-3">
                  <p className="post-item">
                    <strong>{postTitle}:</strong>{' '}
                    <EditableText
                      value={editablePost.briefSummaryHi || `${editablePost.organization} द्वारा आधिकारिक नोटिफिकेशन जारी कर दिया गया है। इसके अंतर्गत कुल ${editablePost.totalPosts || 'विभिन्न'} पदों पर भर्ती हेतु योग्य अभ्यर्थियों से ऑनलाइन आवेदन आमंत्रित किए गए हैं।`}
                      onChange={(val) => {
                        setEditablePost(prev => ({ ...prev, briefSummaryHi: val }));
                      }}
                      titlePrefix="संक्षिप्त विवरण सारांश"
                    />
                  </p>
                  <p className="post-item">
                    {isHi 
                      ? `इस भर्ती के लिए ऑनलाइन आवेदन निर्धारित तिथि से प्रारंभ हो चुके हैं। इच्छुक व पात्र अभ्यर्थी निर्धारित अंतिम तिथि ${editablePost.importantDates?.applyLastDate || 'अंतिम तिथि'} तक आधिकारिक वेबसाइट पर जाकर ऑनलाइन आवेदन कर सकते हैं। भर्ती से संबंधित विस्तृत विवरण जैसे शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, चयन प्रक्रिया और महत्वपूर्ण तिथियां नीचे दी गई हैं।`
                      : `Online applications are invited for eligible candidates. The last date to submit the application form is ${editablePost.importantDates?.applyLastDate}. Check the detailed overview, eligibility criteria, application fee, and direct links below.`}
                  </p>
                </div>

                {/* Dynamic Reorderable Sections List */}
                {activeSectionKeys.map((sectionKey) => {
                  const key = sectionKey === 'fee' ? 'application_fee' : sectionKey === 'salary' ? 'salary_table' : sectionKey;

                  switch (key) {
                    case 'overview':
                      return !isSectionDeleted('overview') && (
                        <div key="overview">
                          <div className="flex items-center justify-between gap-2 mb-2 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {shortJobName} का संक्षिप्त विवरण
                            </h2>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={handleShareBigUpdate}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded shadow-2xs transition cursor-pointer active:scale-95"
                                title="WhatsApp पर संक्षिप्त विवरण शेयर करें"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
                                <span>शेयर करें</span>
                              </button>
                              {renderSectionShareButton('overview', `${shortJobName} का संक्षिप्त विवरण`)}
                              {renderAdminSectionControls('overview', 'संक्षिप्त विवरण')}
                            </div>
                          </div>
                          <div className="overflow-x-auto border border-slate-300 bg-white rounded-md">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '11.5pt' }}>
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-300">
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200 w-1/3">विवरण</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800">जानकारी</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">भर्ती संस्था</td>
                                  <td className="p-2.5 sm:p-3 text-slate-700 bg-white">
                                    <EditableText
                                      value={editablePost.department || editablePost.organization}
                                      onChange={(val) => setEditablePost(prev => ({ ...prev, department: val }))}
                                      titlePrefix="विभाग / संस्था"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">भर्ती का नाम</td>
                                  <td className="p-2.5 sm:p-3 text-slate-700 bg-white">
                                    <EditableText
                                      value={editablePost.shortTitleHi || editablePost.shortTitle || shortJobName}
                                      onChange={(val) => setEditablePost(prev => ({ ...prev, shortTitleHi: val, shortTitle: val }))}
                                      titlePrefix="भर्ती नाम"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">विज्ञापन संख्या</td>
                                  <td className="p-2.5 sm:p-3 text-slate-700 bg-white">
                                    <EditableText
                                      value={editablePost.advtNo || 'विज्ञप्ति अनुसार'}
                                      onChange={(val) => setEditablePost(prev => ({ ...prev, advtNo: val }))}
                                      titlePrefix="विज्ञापन संख्या"
                                      placeholder="विज्ञप्ति अनुसार"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">घोषित कुल पद / सीटें</td>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white">
                                    <EditableText
                                      value={editablePost.totalPosts || 'विभिन्न पद'}
                                      onChange={(val) => setEditablePost(prev => ({ ...prev, totalPosts: val }))}
                                      titlePrefix="कुल पद"
                                      className="font-bold text-slate-800"
                                      placeholder="विभिन्न पद"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">नोटिफिकेशन तिथि</td>
                                  <td className="p-2.5 sm:p-3 text-slate-700 bg-white">
                                    <EditableText
                                      value={editablePost.importantDates?.notificationDate || ''}
                                      onChange={(val) => setEditablePost(prev => ({
                                       ...prev,
                                       importantDates: { ...prev.importantDates, notificationDate: val }
                                      }))}
                                      titlePrefix="नोटिफिकेशन तिथि"
                                      placeholder="शीघ्र"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">आवेदन शुरू</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">
                                    <EditableText
                                      value={editablePost.importantDates?.applyStartDate || ''}
                                      onChange={(val) => setEditablePost(prev => ({
                                        ...prev,
                                        importantDates: { ...prev.importantDates, applyStartDate: val }
                                      }))}
                                      titlePrefix="आवेदन शुरू तिथि"
                                      className="font-semibold text-slate-800"
                                      placeholder="शीघ्र"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">
                                    {isOfflinePost ? 'ऑफलाइन आवेदन की अंतिम तिथि' : 'ऑनलाइन आवेदन की अंतिम तिथि'}
                                  </td>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-900 bg-white">
                                    <EditableText
                                      value={editablePost.importantDates?.applyLastDate || (Array.isArray(editablePost.importantDates) ? editablePost.importantDates.find((d: any) => d.label?.includes('Last') || d.label?.includes('अंतिम'))?.value : '') || 'शीघ्र'}
                                      onChange={(val) => setEditablePost(prev => ({
                                        ...prev,
                                        importantDates: { ...prev.importantDates, applyLastDate: val }
                                      }))}
                                      titlePrefix="अंतिम तिथि"
                                      className="font-bold text-slate-900"
                                      placeholder="शीघ्र"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">आवेदन का माध्यम</td>
                                  <td className="p-2.5 sm:p-3 text-slate-700 bg-white">
                                    {isOfflinePost ? 'ऑफलाइन (Speed Post / Registered Post)' : 'ऑनलाइन (Online Portal)'}
                                  </td>
                                </tr>
                                {editablePost.jobLocation && (
                                  <tr>
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">नौकरी का स्थान</td>
                                    <td className="p-2.5 sm:p-3 text-slate-700 bg-white">
                                      <EditableText
                                        value={editablePost.jobLocation}
                                        onChange={(val) => setEditablePost(prev => ({ ...prev, jobLocation: val }))}
                                        titlePrefix="नौकरी का स्थान"
                                      />
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">शैक्षणिक योग्यता</td>
                                  <td className="p-2.5 sm:p-3 text-slate-700 bg-white">
                                    <EditableText
                                      value={editablePost.qualificationDetailsHi || editablePost.qualificationDetails || 'पद अनुसार 10वीं / 12वीं / स्नातक / ITI पास'}
                                      onChange={(val) => setEditablePost(prev => ({
                                        ...prev,
                                        qualificationDetailsHi: val,
                                        qualificationDetails: val
                                      }))}
                                      titlePrefix="शैक्षणिक योग्यता"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">वेतनमान / पे-मैट्रिक्स</td>
                                  <td className="p-2.5 sm:p-3 text-slate-700 bg-white">
                                    <EditableText
                                      value={editablePost.salaryHi || editablePost.salary || 'पे-मैट्रिक्स नियमानुसार देय'}
                                      onChange={(val) => setEditablePost(prev => ({
                                        ...prev,
                                        salaryHi: val,
                                        salary: val
                                      }))}
                                      titlePrefix="वेतनमान"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">आधिकारिक वेबसाइट</td>
                                  <td className="p-2.5 sm:p-3 bg-white">
                                    <a 
                                      href={editablePost.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in'} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline font-semibold"
                                    >
                                      {editablePost.officialLinks?.officialWebsiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'rajasthan.gov.in'}
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case 'latest_update':
                      return !isSectionDeleted('latest_update') && (
                        <div key="latest_update">
                          <div className="flex items-center justify-between gap-2 mb-2 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {shortJobName} Latest Update
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('latest_update', `${shortJobName} Latest Update`)}
                              {renderAdminSectionControls('latest_update', 'लेटेस्ट अपडेट')}
                            </div>
                          </div>
                          <p className="post-item" style={{ fontSize: '11.5pt' }}>
                            {vacancy.descriptionHi || vacancy.briefSummaryHi || `${vacancy.organization} द्वारा भर्ती का विस्तृत विज्ञापन जारी किया गया है। इच्छुक अभ्यर्थी आवेदन शुरू होने से पहले अपनी पात्रता जाँचकर सभी आवश्यक दस्तावेज तैयार कर लें।`}
                          </p>
                        </div>
                      );

                    case 'latest_news':
                      return !isSectionDeleted('latest_news') && (
                        <div key="latest_news" className="my-4 border border-slate-300 bg-white rounded-md shadow-2xs overflow-hidden">
                          <div className="bg-slate-100 text-slate-800 px-3 sm:px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-slate-600 inline-block" />
                              <h2 className="font-bold uppercase tracking-wide text-slate-900" style={{ fontSize: '11.5pt' }}>
                                <span>{shortJobName} Latest News (ताज़ा समाचार)</span>
                              </h2>
                            </div>

                            <div className="flex items-center gap-2">
                              {renderSectionShareButton('latest_news', `${shortJobName} ताज़ा समाचार`)}
                              <span className="text-[11px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                                {(Array.isArray(editablePost?.latestNews) ? editablePost.latestNews : []).length} अपडेट्स
                              </span>
                              {isDirectEditMode && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentNews = Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [];
                                    const newItem = {
                                      id: `news-${Date.now()}`,
                                      date: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
                                      badge: 'नया अपडेट',
                                      headline: 'नया समाचार शीर्षक यहां लिखें',
                                      details: 'समाचार का विवरण यहां लिखें। अभ्यर्थी नियमित रूप से पोर्टल चेक करते रहें।',
                                      isHighlighted: false
                                    };
                                    setEditablePost({
                                      ...editablePost,
                                      latestNews: [newItem, ...currentNews]
                                    });
                                  }}
                                  className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-2 py-0.5 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ समाचार जोड़ें</span>
                                </button>
                              )}
                              {renderAdminSectionControls('latest_news', 'ताज़ा समाचार')}
                            </div>
                          </div>

                          <div className="p-3 sm:p-4 divide-y divide-slate-100 space-y-3 bg-white">
                            {(Array.isArray(editablePost?.latestNews) ? editablePost.latestNews : []).map((news: any, idx: number) => (
                              <div 
                                key={news.id || idx} 
                                className="p-3 rounded border border-slate-200 bg-white"
                              >
                                <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10.5px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                      <EditableText
                                        value={news.badge || 'अपडेट'}
                                        onChange={(val) => {
                                          const list = [...(Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [])];
                                          list[idx] = { ...list[idx], badge: val };
                                          setEditablePost({ ...editablePost, latestNews: list });
                                        }}
                                        className="text-slate-700 font-bold"
                                        titlePrefix="बैज"
                                      />
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      <EditableText
                                        value={news.date || 'अक्टूबर 2026'}
                                        onChange={(val) => {
                                          const list = [...(Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [])];
                                          list[idx] = { ...list[idx], date: val };
                                          setEditablePost({ ...editablePost, latestNews: list });
                                        }}
                                        className="font-medium text-slate-600"
                                        titlePrefix="दिनांक"
                                      />
                                    </span>
                                  </div>

                                  {isDirectEditMode && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const list = (Array.isArray(editablePost.latestNews) ? editablePost.latestNews : []).filter((_: any, i: number) => i !== idx);
                                          setEditablePost({ ...editablePost, latestNews: list });
                                        }}
                                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-bold cursor-pointer"
                                        title="समाचार हटाएं"
                                      >
                                        🗑️ हटाएं
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <h3 className="font-bold text-slate-900 mb-1 leading-snug" style={{ fontSize: '11.5pt' }}>
                                  <EditableText
                                    value={news.headline}
                                    onChange={(val) => {
                                      const list = [...(Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [])];
                                      list[idx] = { ...list[idx], headline: val };
                                      setEditablePost({ ...editablePost, latestNews: list });
                                    }}
                                    className="text-slate-900 font-bold"
                                    titlePrefix="हेडलाइन"
                                  />
                                </h3>

                                <div className="text-slate-700 leading-relaxed" style={{ fontSize: '11.5pt' }}>
                                  <EditableText
                                    value={news.details}
                                    onChange={(val) => {
                                      const list = [...(Array.isArray(editablePost.latestNews) ? editablePost.latestNews : [])];
                                      list[idx] = { ...list[idx], details: val };
                                      setEditablePost({ ...editablePost, latestNews: list });
                                    }}
                                    as="span"
                                    className="text-slate-700"
                                    titlePrefix="विवरण"
                                  />
                                </div>
                              </div>
                            ))}

                            {(!Array.isArray(editablePost?.latestNews) || editablePost.latestNews.length === 0) && (
                              <div className="p-3 text-center text-slate-500 text-sm">
                                फिलहाल कोई ताज़ा समाचार नहीं है।
                              </div>
                            )}
                          </div>
                        </div>
                      );

                    case 'dates':
                      return !isSectionDeleted('dates') && (
                        <div key="dates" className="space-y-2">
                          <div className="flex items-center justify-between gap-2 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {shortJobName} Important Dates
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('dates', `${shortJobName} Important Dates`)}
                              {renderAdminSectionControls('dates', 'Important Dates')}
                            </div>
                          </div>

                          <div className="overflow-x-auto border border-slate-300 bg-white rounded-md">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '11.5pt' }}>
                              <tbody>
                                {(Array.isArray(editablePost?.importantDates) ? editablePost.importantDates : []).map((date: any, idx: number) => (
                                  <tr key={idx} className="border-b border-slate-300 last:border-b-0">
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-300 w-1/2 bg-white">
                                      <EditableText
                                        value={date.label}
                                        onChange={(val) => {
                                          const list = [...(Array.isArray(editablePost.importantDates) ? editablePost.importantDates : [])];
                                          list[idx] = { ...list[idx], label: val };
                                          setEditablePost({ ...editablePost, importantDates: list });
                                        }}
                                        className="font-bold text-slate-800"
                                      />
                                    </td>
                                    <td className="p-2.5 sm:p-3 font-semibold text-slate-800 w-1/2 bg-white">
                                      <EditableText
                                        value={date.value}
                                        onChange={(val) => {
                                          const list = [...(Array.isArray(editablePost.importantDates) ? editablePost.importantDates : [])];
                                          list[idx] = { ...list[idx], value: val };
                                          setEditablePost({ ...editablePost, importantDates: list });
                                        }}
                                        className="font-semibold text-slate-800"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case 'application_fee':
                      return !isSectionDeleted('fee') && !isSectionDeleted('application_fee') && (
                        <div key="application_fee" className="space-y-2 pt-2">
                          <div className="flex items-center justify-between gap-2 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {shortJobName} Application Fee
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('fee', `${shortJobName} Application Fee`)}
                              {renderAdminSectionControls('fee', 'Application Fee')}
                            </div>
                          </div>

                          <div className="overflow-x-auto border border-slate-300 bg-white rounded-md">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '11.5pt' }}>
                              <tbody>
                                {(Array.isArray(editablePost?.applicationFee) ? editablePost.applicationFee : []).map((fee: any, idx: number) => (
                                  <tr key={idx} className="border-b border-slate-300 last:border-b-0">
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-300 w-1/2 bg-white">
                                      <EditableText
                                        value={fee.category}
                                        onChange={(val) => {
                                          const list = [...(Array.isArray(editablePost.applicationFee) ? editablePost.applicationFee : [])];
                                          list[idx] = { ...list[idx], category: val };
                                          setEditablePost({ ...editablePost, applicationFee: list });
                                        }}
                                        className="font-bold text-slate-800"
                                      />
                                    </td>
                                    <td className="p-2.5 sm:p-3 font-semibold text-slate-800 w-1/2 bg-white">
                                      <EditableText
                                        value={fee.amount}
                                        onChange={(val) => {
                                          const list = [...(Array.isArray(editablePost.applicationFee) ? editablePost.applicationFee : [])];
                                          list[idx] = { ...list[idx], amount: val };
                                          setEditablePost({ ...editablePost, applicationFee: list });
                                        }}
                                        className="font-semibold text-slate-800"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case 'post_breakdown':
                      return !isSectionDeleted('post_breakdown') && vacancy.postBreakdown && vacancy.postBreakdown.length > 0 && (
                        <div key="post_breakdown">
                          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {shortJobName} पदों / सीटों का विवरण
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('post_breakdown', `${shortJobName} पदों का विवरण`)}
                              {renderAdminSectionControls('post_breakdown', 'पद विवरण')}
                            </div>
                          </div>
                          <div className="overflow-x-auto border border-slate-300 rounded-md bg-white">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '11.5pt' }}>
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-300">
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200">क्रमांक</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200">पद / ट्रेड नाम</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200">कुल पद</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800">योग्यता</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {vacancy.postBreakdown.map((pb, idx) => (
                                  <tr key={idx}>
                                    <td className="p-2.5 sm:p-3 text-center border-r border-slate-200 bg-white">{idx + 1}</td>
                                    <td className="p-2.5 sm:p-3 font-semibold text-slate-800 border-r border-slate-200 bg-white">{isHi ? pb.postNameHi : pb.postName}</td>
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-900 border-r border-slate-200 bg-white">{pb.postsCount}</td>
                                    <td className="p-2.5 sm:p-3 text-slate-700 bg-white">{isHi ? pb.qualificationHi : pb.qualification}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case 'qualification':
                      return !isSectionDeleted('qualification') && (
                        <div key="qualification">
                          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {shortJobName} शैक्षणिक योग्यता
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('qualification', `${shortJobName} शैक्षणिक योग्यता`)}
                              {renderAdminSectionControls('qualification', 'शैक्षणिक योग्यता')}
                            </div>
                          </div>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '11.5pt' }}>
                            <li>मान्यता प्राप्त बोर्ड या संस्थान से संबंधित शैक्षणिक परीक्षा उत्तीर्ण हो।</li>
                            <li>{vacancy.qualificationDetailsHi || vacancy.qualificationDetails || '10वीं / 12वीं / स्नातक अथवा संबंधित विषय में आवश्यक डिग्री/डिप्लोमा।'}</li>
                            <li>आवेदन जमा करने की अंतिम तिथि तक सभी आवश्यक शैक्षणिक एवं तकनीकी योग्यता पूर्ण होनी चाहिए।</li>
                            <li>विस्तृत एवं पदवार शैक्षणिक योग्यता की जानकारी आधिकारिक नोटिफिकेशन से प्राप्त करें।</li>
                          </ul>
                        </div>
                      );

                    case 'age_limit':
                      return !isSectionDeleted('age_limit') && (
                        <div key="age_limit">
                          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              आयु सीमा (Age Limit)
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('age_limit', `${shortJobName} आयु सीमा`)}
                              {renderAdminSectionControls('age_limit', 'आयु सीमा')}
                            </div>
                          </div>
                          <p className="post-item mb-3" style={{ fontSize: '11.5pt' }}>
                            अभ्यर्थी की न्यूनतम आयु{' '}
                            <strong>
                              <EditableText
                                value={editablePost.ageLimit?.min || 18}
                                onChange={(val) => {
                                  const num = parseInt(val) || 18;
                                  setEditablePost(prev => ({
                                    ...prev,
                                    ageLimit: { ...prev.ageLimit, min: num }
                                  }));
                                }}
                                titlePrefix="न्यूनतम आयु"
                              />{' '}
                              वर्ष
                            </strong>{' '}
                            तथा अधिकतम आयु{' '}
                            <strong>
                              <EditableText
                                value={editablePost.ageLimit?.max || 40}
                                onChange={(val) => {
                                  const num = parseInt(val) || 40;
                                  setEditablePost(prev => ({
                                    ...prev,
                                    ageLimit: { ...prev.ageLimit, max: num }
                                  }));
                                }}
                                titlePrefix="अधिकतम आयु"
                              />{' '}
                              वर्ष
                            </strong>{' '}
                            निर्धारित की गई है। आयु की गणना{' '}
                            <EditableText
                              value={editablePost.ageLimit?.asOnDate || '2026'}
                              onChange={(val) => {
                                setEditablePost(prev => ({
                                  ...prev,
                                  ageLimit: { ...prev.ageLimit, asOnDate: val }
                                }));
                              }}
                              titlePrefix="आयु गणना तिथि"
                            />{' '}
                            को आधार मानकर की जाएगी। आरक्षित वर्गों को नियमानुसार अधिकतम आयु सीमा में छूट देय होगी।
                          </p>

                          <div className="overflow-x-auto border border-slate-300 rounded-md bg-white">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '11.5pt' }}>
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-300">
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200 w-1/2">श्रेणी</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800">अधिकतम आयु सीमा में छूट</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                <tr>
                                  <td className="p-2.5 sm:p-3 bg-white border-r border-slate-200 text-slate-800">अनुसूचित जाति / अनुसूचित जनजाति (SC/ST)</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">5 वर्ष</td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 bg-white border-r border-slate-200 text-slate-800">अन्य पिछड़ा वर्ग (OBC / MBC)</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">3 से 5 वर्ष</td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 bg-white border-r border-slate-200 text-slate-800">दिव्यांग अभ्यर्थी (PwD)</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">10 वर्ष</td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 bg-white border-r border-slate-200 text-slate-800">भूतपूर्व सैनिक (Ex-Servicemen)</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">नियमानुसार</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case 'selection_process':
                      return !isSectionDeleted('selection_process') && (
                        <div key="selection_process">
                          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              चयन प्रक्रिया और मेरिट की गणना
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('selection_process', `${shortJobName} चयन प्रक्रिया`)}
                              {renderAdminSectionControls('selection_process', 'चयन प्रक्रिया')}
                            </div>
                          </div>
                          <p className="post-item mb-2" style={{ fontSize: '11.5pt' }}>
                            इस भर्ती में चयन प्रक्रिया निम्नलिखित चरणों के आधार पर की जाएगी:
                          </p>
                          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '11.5pt' }}>
                            {Array.isArray(editablePost.selectionProcessHi) && editablePost.selectionProcessHi.length > 0 ? (
                              editablePost.selectionProcessHi.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))
                            ) : (
                              <>
                                <li>लिखित परीक्षा अथवा शैक्षणिक प्राप्तांकों की मेरिट सूची (Merit List)।</li>
                                <li>मूल दस्तावेजों का भौतिक सत्यापन (Document Verification)।</li>
                                <li>चिकित्सीय परीक्षण (Medical Fitness Examination)।</li>
                                <li>अंतिम चयन सूची का प्रकाशन।</li>
                              </>
                            )}
                          </ol>
                        </div>
                      );

                    case 'postal_address':
                      return (editablePost.postalAddress || editablePost.postalAddressHi || isOfflinePost) && !isSectionDeleted('postal_address') && (
                        <div key="postal_address">
                          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {shortJobName} Offline Form Send Address (आवेदन भेजने का पता)
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('postal_address', `${shortJobName} आवेदन भेजने का पता`)}
                              {renderAdminSectionControls('postal_address', 'आवेदन भेजने का पता')}
                            </div>
                          </div>
                          <div className="p-4 rounded-md border border-slate-300 bg-white space-y-2.5">
                            <p className="post-item text-slate-800" style={{ fontSize: '11.5pt' }}>
                              अभ्यर्थी पूर्ण रूप से भरे हुए ऑफलाइन आवेदन फॉर्म को सभी आवश्यक स्वप्रमाणित दस्तावेजों के साथ नीचे दिए गए आधिकारिक पते पर पंजीकृत डाक (Registered Post) अथवा स्पीड पोस्ट (Speed Post) द्वारा भेजें:
                            </p>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-900 font-bold leading-relaxed" style={{ fontSize: '11.5pt' }}>
                              <p className="font-mono text-slate-900 select-all">
                                {editablePost.postalAddressHi || editablePost.postalAddress || 'The Commanding Officer, Head Quarter Southern Air Command (Unit), Akkulam, Trivandrum – 695011'}
                              </p>
                            </div>
                            <div className="text-slate-700 space-y-1" style={{ fontSize: '11.5pt' }}>
                              <p>
                                <strong>लिफाफे के ऊपर क्या लिखें (Envelope Superscription):</strong>
                              </p>
                              <p className="p-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900 font-semibold select-all">
                                {editablePost.envelopeNoteHi || 'APPLICATION FOR THE POST OF HINDI TYPIST AND CATEGORY: OBC'}
                              </p>
                              <p className="text-slate-600 text-xs sm:text-sm">
                                • आवेदन फॉर्म निर्धारित अंतिम तिथि ({editablePost.importantDates?.applyLastDate || (Array.isArray(editablePost.importantDates) ? editablePost.importantDates.find((d: any) => d.label?.includes('Last') || d.label?.includes('अंतिम'))?.value : '') || '23 नवंबर 2026'}) शाम 5:00 बजे तक संबंधित पते पर अवश्य पहुंच जाना चाहिए।
                              </p>
                            </div>
                          </div>
                        </div>
                      );

                    case 'documents':
                      return !isSectionDeleted('documents') && (
                        <div key="documents">
                          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              आवेदन के लिए आवश्यक दस्तावेज
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('documents', `${shortJobName} आवश्यक दस्तावेज`)}
                              {renderAdminSectionControls('documents', 'आवश्यक दस्तावेज')}
                            </div>
                          </div>
                          <p className="post-item mb-2" style={{ fontSize: '11.5pt' }}>
                            ऑनलाइन फॉर्म भरने से पूर्व अभ्यर्थी पद की अधिकतम योग्यता अनुसार निम्नलिखित दस्तावेज तैयार रखें:
                          </p>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 mb-3" style={{ fontSize: '11.5pt' }}>
                            {documentsList.map((doc, i) => (
                              <li key={i} className="group">
                                {isDirectEditMode ? (
                                  <div className="flex items-center gap-2">
                                    <EditableText
                                      value={doc}
                                      onChange={(val) => {
                                        const list = [...documentsList];
                                        list[i] = val;
                                        setEditablePost({ ...editablePost, requiredDocumentsHi: list });
                                      }}
                                      className="flex-1 font-medium text-slate-800"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = documentsList.filter((_, idx) => idx !== i);
                                        setEditablePost({ ...editablePost, requiredDocumentsHi: list });
                                      }}
                                      className="text-rose-500 hover:text-rose-700 text-xs px-1 cursor-pointer"
                                      title="यह दस्तावेज हटाएं"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <span>{doc}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                          {isDirectEditMode && (
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...documentsList, 'नया आवश्यक शैक्षणिक/श्रेणी दस्तावेज'];
                                setEditablePost({ ...editablePost, requiredDocumentsHi: list });
                              }}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded border border-slate-300 mb-3 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ नया दस्तावेज जोड़ें</span>
                            </button>
                          )}

                          <div className="overflow-x-auto border border-slate-300 rounded-md bg-white">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '11.5pt' }}>
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-300">
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200">दस्तावेज</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200">निर्धारित प्रारूप</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800">आकार (Size)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white border-r border-slate-200">पासपोर्ट साइज फोटो</td>
                                  <td className="p-2.5 sm:p-3 border-r border-slate-200 text-slate-700 bg-white">JPG / JPEG, 20 से 70 KB</td>
                                  <td className="p-2.5 sm:p-3 text-slate-700 bg-white">3.5 × 3.5 सेमी</td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white border-r border-slate-200">हस्ताक्षर (Signature)</td>
                                  <td className="p-2.5 sm:p-3 border-r border-slate-200 text-slate-700 bg-white">JPG / JPEG, 20 से 30 KB</td>
                                  <td className="p-2.5 sm:p-3 text-slate-700 bg-white">3.5 × 2.5 सेमी</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case 'how_to_apply':
                      return !isSectionDeleted('how_to_apply') && (
                        <div key="how_to_apply">
                          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {shortJobName} के लिए आवेदन कैसे करें?
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('how_to_apply', `${shortJobName} आवेदन कैसे करें`)}
                              {renderAdminSectionControls('how_to_apply', 'आवेदन कैसे करें')}
                            </div>
                          </div>
                          <ol className="list-decimal pl-5 space-y-2 text-slate-700" style={{ fontSize: '11.5pt' }}>
                            {howToApplySteps.map((step, idx) => (
                              <li key={idx} className="group">
                                {isDirectEditMode ? (
                                  <div className="flex items-center gap-2">
                                    <EditableText
                                      value={step}
                                      onChange={(val) => {
                                        const list = [...howToApplySteps];
                                        list[idx] = val;
                                        setEditablePost({ ...editablePost, howToApplyHi: list });
                                      }}
                                      className="flex-1 font-medium text-slate-800"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = howToApplySteps.filter((_, i) => i !== idx);
                                        setEditablePost({ ...editablePost, howToApplyHi: list });
                                      }}
                                      className="text-rose-500 hover:text-rose-700 text-xs px-1 cursor-pointer"
                                      title="यह चरण हटाएं"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <span>{step}</span>
                                )}
                              </li>
                            ))}
                          </ol>
                          {isDirectEditMode && (
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...howToApplySteps, `चरण ${howToApplySteps.length + 1}: नया चरण दर्ज करें`];
                                setEditablePost({ ...editablePost, howToApplyHi: list });
                              }}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded border border-slate-300 mt-2 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ नया चरण जोड़ें</span>
                            </button>
                          )}
                        </div>
                      );

                    case 'important_links':
                      return !isSectionDeleted('important_links') && (
                        <div key="important_links" className="space-y-2 pt-2">
                          <div className="flex items-center justify-between gap-2 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {shortJobName} Important Links
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('important_links', `${shortJobName} Important Links`)}
                              {isDirectEditMode && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPdfUploadTargetIndex(null);
                                      setIsPdfModalOpen(true);
                                    }}
                                    className="text-[11px] bg-slate-700 hover:bg-slate-800 text-white font-bold px-2 py-0.5 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>+ 📄 PDF</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleAddDirectLink}
                                    className="text-[11px] bg-slate-700 hover:bg-slate-800 text-white font-bold px-2 py-0.5 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ लिंक</span>
                                  </button>
                                </div>
                              )}
                              {renderAdminSectionControls('important_links', 'महत्वपूर्ण लिंक्स')}
                            </div>
                          </div>

                          <div className="overflow-x-auto border border-slate-300 bg-white rounded-md">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '11.5pt' }}>
                               <tbody>
                                <tr className="border-b border-slate-300">
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-300 w-1/2 bg-white">
                                    Start {shortJobName} form
                                  </td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 w-1/2 bg-white">
                                    {editablePost.importantDates?.applyStartDate || (Array.isArray(editablePost.importantDates) ? editablePost.importantDates.find((d: any) => d.label?.includes('Start') || d.label?.includes('शुरू'))?.value : '') || '24 October 2026'}
                                  </td>
                                </tr>

                                <tr className="border-b border-slate-300">
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-300 w-1/2 bg-white">
                                    Last Date {isOfflinePost ? 'Offline ' : ''}Application form
                                  </td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 w-1/2 bg-white">
                                    {editablePost.importantDates?.applyLastDate || (Array.isArray(editablePost.importantDates) ? editablePost.importantDates.find((d: any) => d.label?.includes('Last') || d.label?.includes('अंतिम'))?.value : '') || '23 November 2026'}
                                  </td>
                                </tr>

                                {(Array.isArray(editablePost?.directLinks) ? editablePost.directLinks : []).map((link: any, idx: number) => {
                                  const isPdf = Boolean(
                                    link.isPdf ||
                                    link.type === 'notification' ||
                                    link.type === 'syllabus' ||
                                    link.label?.toLowerCase().includes('pdf') ||
                                    link.actionText?.toLowerCase().includes('pdf') ||
                                    (link.url && (
                                      link.url.toLowerCase().endsWith('.pdf') ||
                                      link.url.toLowerCase().includes('.pdf?') ||
                                      link.url.startsWith('data:application/pdf')
                                    ))
                                  );

                                  return (
                                    <tr key={idx} className="border-b border-slate-300 last:border-b-0">
                                      <td className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-300 w-1/2 bg-white">
                                        <EditableText
                                          value={link.label}
                                          onChange={(newVal) => {
                                            setEditablePost(prev => {
                                              const list = [...(prev.directLinks || [])];
                                              list[idx] = { ...list[idx], label: newVal };
                                              return { ...prev, directLinks: list };
                                            });
                                          }}
                                          className="font-bold text-slate-800"
                                        />
                                      </td>
                                      <td className="p-2.5 sm:p-3 font-semibold w-1/2 bg-white">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <a
                                            href={link.url || 'https://sarkariresult12.vercel.app/#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={isPdf ? (link.fileName || `${(link.label || 'file').replace(/\s+/g, '_')}.pdf`) : undefined}
                                            className="text-blue-600 hover:text-blue-800 underline font-bold inline-flex items-center gap-1"
                                          >
                                            <span>Click Here</span>
                                          </a>
                                          {isDirectEditMode && (
                                            <button
                                              type="button"
                                              onClick={() => handleAttachPdfToLink(idx)}
                                              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold px-1.5 py-0.5 rounded cursor-pointer ml-auto"
                                              title="PDF फ़ाइल बदलें"
                                            >
                                              📄 PDF
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case 'faqs':
                      return !isSectionDeleted('faqs') && (
                        <div key="faqs">
                          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                            <h2 
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {shortJobName} FAQs
                            </h2>
                            <div className="flex items-center gap-1.5">
                              {renderSectionShareButton('faqs', `${shortJobName} FAQs`)}
                              {renderAdminSectionControls('faqs', 'FAQs')}
                            </div>
                          </div>
                          <div className="space-y-3">
                            {faqList.map((faq, idx) => (
                              <div 
                                key={idx} 
                                className="bg-white border border-slate-200 rounded-md p-3.5 sm:p-4 transition"
                              >
                                <h3 
                                  className="headlight font-bold text-slate-900 text-sm mb-1.5 flex items-start gap-2"
                                  style={{ fontSize: '11.5pt' }}
                                >
                                  <span className="text-slate-500 font-bold">Q.</span>
                                  <span>{isHi ? (faq.qHi || faq.q) : faq.q}</span>
                                </h3>
                                <div className="text-slate-700 text-xs sm:text-sm pl-4 border-l-2 border-slate-300 mt-2">
                                  <p className="post-item" style={{ fontSize: '11.5pt' }}>{isHi ? (faq.aHi || faq.a) : faq.a}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );

                    default:
                      return null;
                  }
                })}
              </div>

              {/* Entry Footer Meta: Categories & Post Navigation */}
              <footer className="entry-meta border-t border-slate-200 pt-5 mt-8">
                {/* Categories Tagging */}
                <div className="flex items-center gap-2 mb-6 flex-wrap text-xs font-semibold">
                  <Folder className="w-4 h-4 text-[#0056b3]" />
                  <span className="text-slate-700 font-bold">Categories:</span>
                  <button
                    type="button"
                    onClick={() => onSelectCategory ? onSelectCategory('job') : undefined}
                    className="text-[#0056b3] hover:text-blue-800 hover:underline cursor-pointer font-semibold transition"
                    style={{ color: '#0056b3' }}
                  >
                    Latest Job
                  </button>
                  <span className="text-slate-400">,</span>
                  <button
                    type="button"
                    onClick={() => onSelectCategory ? onSelectCategory('news') : undefined}
                    className="text-[#0056b3] hover:text-blue-800 hover:underline cursor-pointer font-semibold transition"
                    style={{ color: '#0056b3' }}
                  >
                    Latest News
                  </button>
                  <span className="text-slate-400">,</span>
                  <button
                    type="button"
                    onClick={() => onSelectCategory ? onSelectCategory(vacancy.category || 'job') : undefined}
                    className="text-[#0056b3] hover:text-blue-800 hover:underline cursor-pointer font-semibold transition"
                    style={{ color: '#0056b3' }}
                  >
                    {vacancy.organization || 'RSMSSB'}
                  </button>
                </div>

                {/* Post Navigation: Previous & Next Post Links */}
                <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                  {prevPost ? (
                    <button
                      type="button"
                      onClick={() => onSelectOtherVacancy(prevPost)}
                      className="text-left p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer group shadow-2xs"
                    >
                      <span className="text-[11px] font-bold text-[#0056b3] uppercase flex items-center gap-1 group-hover:text-blue-800">
                        <ChevronLeft className="w-3.5 h-3.5 text-[#0056b3]" />
                        <span>Previous Post</span>
                      </span>
                      <p 
                        className="post-item font-semibold text-xs sm:text-sm text-[#0056b3] group-hover:text-blue-800 group-hover:underline line-clamp-2 mt-1"
                        style={{ color: '#0056b3' }}
                      >
                        {isHi ? (prevPost.titleHi || prevPost.title) : prevPost.title}
                      </p>
                    </button>
                  ) : <div />}

                  {nextPost ? (
                    <button
                      type="button"
                      onClick={() => onSelectOtherVacancy(nextPost)}
                      className="text-right p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer group shadow-2xs"
                    >
                      <span className="text-[11px] font-bold text-[#0056b3] uppercase flex items-center justify-end gap-1 group-hover:text-blue-800">
                        <span>Next Post</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#0056b3]" />
                      </span>
                      <p 
                        className="post-item font-semibold text-xs sm:text-sm text-[#0056b3] group-hover:text-blue-800 group-hover:underline line-clamp-2 mt-1"
                        style={{ color: '#0056b3' }}
                      >
                        {isHi ? (nextPost.titleHi || nextPost.title) : nextPost.title}
                      </p>
                    </button>
                  ) : <div />}
                </nav>
              </footer>
            </article>
          </main>

          {/* Right Sidebar (30% on Desktop) */}
          <aside className="w-full lg:w-[30%] shrink-0 space-y-5 lg:sticky lg:top-4 self-start">
            {/* Widget 1: Search Widget */}
            <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-2xs">
              <h2 
                className="headlight font-bold text-slate-900 mb-3"
                style={{ fontSize: '11.5pt' }}
              >
                Search
              </h2>
              <div className="relative">
                <input
                  type="search"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="खोजें..."
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs pr-8 text-slate-800 focus:outline-none focus:border-slate-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Widget 2: Recent Posts Widget */}
            <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-2xs">
              <h2 
                className="font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2 flex items-center gap-1.5"
                style={{ fontSize: '11.5pt' }}
              >
                <span className="w-2 h-2 rounded-full bg-[#0056b3] inline-block shrink-0"></span>
                <span>{isHi ? 'हाल ही की पोस्ट (Recent Posts)' : 'Recent Posts'}</span>
              </h2>

              <ul className="space-y-3 divide-y divide-slate-100">
                {filteredRecentPosts.map((rp) => (
                  <li key={rp.id} className="pt-2.5 first:pt-0">
                    <button
                      type="button"
                      onClick={() => onSelectOtherVacancy(rp)}
                      className="text-left w-full group cursor-pointer block"
                    >
                      <h3 
                        className="font-semibold text-[#0056b3] group-hover:text-blue-800 group-hover:underline line-clamp-2 leading-snug"
                        style={{
                          fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '11.5pt',
                          lineHeight: 1.45,
                          color: '#0056b3'
                        }}
                      >
                        👉 <span className="text-[#0056b3] group-hover:text-blue-800">{isHi ? (rp.titleHi || rp.title) : rp.title}</span>
                      </h3>
                      <p className="text-[12px] text-slate-500 mt-1 pl-4 font-medium flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
                        <span>{rp.updatedAt || rp.importantDates?.notificationDate || 'October 22, 2026'}</span>
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Widget 3: Official Social Channels */}
            <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-2xs text-center space-y-3">
              <h2 
                className="headlight font-bold text-slate-900"
                style={{ fontSize: '11.5pt' }}
              >
                Join Social Channels
              </h2>
              <p className="text-xs text-slate-600">
                प्रतिदिन सभी सरकारी भर्ती, एडमिट कार्ड एवं रिजल्ट की सबसे तेज अपडेट सीधे पाएं।
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://whatsapp.com/channel/0029VbDoDuyFsn0ljkiOBX3e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp चैनल जॉइन करें</span>
                </a>
                <a
                  href="https://telegram.me/rajasthanvacancy_in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-4 h-4 fill-white" />
                  <span>Telegram चैनल जॉइन करें</span>
                </a>
              </div>
            </div>

            {/* Widget 4: Popular Categories Quick Links */}
            <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-2xs">
              <h2 
                className="font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2 flex items-center gap-1.5"
                style={{ fontSize: '11.5pt' }}
              >
                <Folder className="w-4 h-4 text-slate-500" />
                <span>{isHi ? 'महत्वपूर्ण श्रेणियां' : 'Top Categories'}</span>
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                {[
                  { key: 'job', label: isHi ? '💼 लेटेस्ट जॉब्स' : 'Latest Jobs' },
                  { key: 'admit_card', label: isHi ? '🎫 एडमिट कार्ड' : 'Admit Card' },
                  { key: 'result', label: isHi ? '🏆 रिजल्ट' : 'Result' },
                  { key: 'answer_key', label: isHi ? '🔑 उत्तर कुंजी' : 'Answer Key' },
                  { key: 'syllabus', label: isHi ? '📚 सिलेबस' : 'Syllabus' },
                  { key: 'scheme', label: isHi ? '🏛️ योजनाएं' : 'Govt Schemes' },
                ].map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(cat.key);
                      } else {
                        onBack();
                      }
                    }}
                    className="p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-center transition cursor-pointer"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* In-sidebar Ad unit */}
            <AdSection 
              client="ca-pub-8302542447035711"
              slot="3785509362"
              format="rectangle"
              label={isHi ? 'विज्ञापन' : 'Advertisement'}
            />
          </aside>
        </div>

      {/* Modal 1: Add New Section to Post */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-sky-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">नया सेक्शन जोड़ें (Add Custom Section)</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddSectionOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Quick suggestions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">सुझाए गए सेक्शन शीर्षक:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'परीक्षा पैटर्न व सिलेबस',
                    'कट ऑफ मार्क्स एवं न्यूनतम अंक',
                    'दस्तावेज सत्यापन प्रक्रिया',
                    'शारीरिक दक्षता परीक्षा (PET/PST)',
                    'विशेष दिशा-निर्देश एवं नियम'
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewSectionTitle(sug)}
                      className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 font-medium transition cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">सेक्शन का नाम (Section Title) *</label>
                <input
                  type="text"
                  required
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="उदा. परीक्षा पैटर्न एवं विस्तृत सिलेबस"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">फॉर्मेट प्रकार (Display Style)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSectionType('paragraph')}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      newSectionType === 'paragraph' ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    पैराग्राफ
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSectionType('bullets')}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      newSectionType === 'bullets' ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    बिंदुवार सूची
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSectionType('alert_box')}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      newSectionType === 'alert_box' ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    हाईलाइट बॉक्स
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">सेक्शन सामग्री (Content) *</label>
                <textarea
                  rows={5}
                  required
                  value={newSectionContent}
                  onChange={(e) => setNewSectionContent(e.target.value)}
                  placeholder={
                    newSectionType === 'bullets' 
                      ? "प्रत्येक लाइन एक बिंदु के रूप में दिखेगी:\n- भाग 1: सामान्य ज्ञान (50 अंक)\n- भाग 2: राजस्थान का इतिहास एवं भूगोल (50 अंक)\n- भाग 3: गणित एवं रीजनिंग (50 अंक)" 
                      : "सेक्शन का विस्तृत विवरण यहाँ लिखें..."
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-sky-600 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  disabled={!newSectionTitle.trim()}
                  onClick={handleAddNewSection}
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>सेक्शन जोड़ें व सेव करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Custom Section */}
      {editingCustomSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">कस्टम सेक्शन संपादित करें (Edit Section)</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingCustomSection(null)}
                className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">सेक्शन का नाम (Section Title) *</label>
                <input
                  type="text"
                  required
                  value={editingCustomSection.titleHi || editingCustomSection.title}
                  onChange={(e) => setEditingCustomSection({
                    ...editingCustomSection,
                    title: e.target.value,
                    titleHi: e.target.value
                  })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">फॉर्मेट प्रकार</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCustomSection({ ...editingCustomSection, sectionType: 'paragraph' })}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      editingCustomSection.sectionType === 'paragraph' ? 'bg-amber-50 border-amber-600 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    पैराग्राफ
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCustomSection({ ...editingCustomSection, sectionType: 'bullets' })}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      editingCustomSection.sectionType === 'bullets' ? 'bg-amber-50 border-amber-600 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    बिंदुवार सूची
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCustomSection({ ...editingCustomSection, sectionType: 'alert_box' })}
                    className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${
                      editingCustomSection.sectionType === 'alert_box' ? 'bg-amber-50 border-amber-600 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    हाईलाइट बॉक्स
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">सामग्री (Content) *</label>
                <textarea
                  rows={6}
                  required
                  value={editingCustomSection.contentHi || editingCustomSection.content}
                  onChange={(e) => setEditingCustomSection({
                    ...editingCustomSection,
                    content: e.target.value,
                    contentHi: e.target.value
                  })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCustomSection(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomSectionEdit}
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>परिवर्तन सेव करें (Update Post)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-300 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-rose-700 text-white">
              <div className="flex items-center gap-2 font-black text-sm">
                <FileText className="w-4 h-4" />
                <span>
                  {pdfUploadTargetIndex !== null ? 'मौजूदा लिंक के लिए PDF अपलोड करें' : 'नया PDF डॉक्यूमेंट जोड़ें'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="text-white hover:bg-rose-800 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 space-y-1">
                <p className="font-bold">📄 PDF फाइल अपलोड निर्देश:</p>
                <p>कंप्यूटर या मोबाइल से कोई भी आधिकारिक PDF (नोटिफिकेशन, सिलेबस, रिजल्ट, फॉर्म) चुनें। यह तुरंत लिंक के साथ अटैच होकर डाउनलोड करने योग्य बन जाएगी।</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  PDF फ़ाइल चुनें (.pdf)
                </label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfFileChange}
                  className="block w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-700 cursor-pointer border border-slate-300 rounded p-1 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-300 cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Alert Feedback Notification */}
      {alertFeedback && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center gap-2 border border-emerald-600 animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{alertFeedback}</span>
          <button
            type="button"
            onClick={() => setAlertFeedback('')}
            className="ml-2 hover:bg-emerald-700 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
