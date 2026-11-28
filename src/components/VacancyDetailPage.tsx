'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Bell,
  ChevronRight,
  ChevronLeft,
  Folder,
  MessageCircle,
  Check,
  Home,
  Copy,
  ExternalLink,
  Tag,
  Flame,
  Share2,
} from 'lucide-react';
import { VacancyItem, LanguageMode } from '../types';
import { AdSection } from './AdSection';
import { AdSlotWrapper } from './AdSlotWrapper';
import { formatDisplayDate, resolveJobDates, compareVacanciesNewestFirst } from '../utils/dateUtils';
import { buildCanonicalUrl, applyCanonicalTag, normalizeBreadcrumbCategoryKey } from '../utils/seoCanonical';
import { getJobFeaturedImage } from '../utils/thumbnailGenerator';
import {
  copyTextToClipboard,
  getTelegramShareUrl,
  getVacancyShareUrl,
  getWhatsAppShareUrl,
  SHARE_BASE_URL,
} from '../utils/shareUtils';
import {
  isRajasthanRelatedPost,
  getAdmitCardTitles,
  type AdmitCardSectionTitles,
  generateDynamicPostFaqs,
} from '../utils/faqSchemaBuilder';
import { parseTableCellLink } from '../utils/adminPostUtils';

export { isRajasthanRelatedPost, getAdmitCardTitles, type AdmitCardSectionTitles };

interface VacancyDetailPageProps {
  vacancy: VacancyItem;
  onBack: () => void;
  lang: LanguageMode;
  allVacancies: VacancyItem[];
  onSelectOtherVacancy: (item: VacancyItem) => void;
  isAdmin?: boolean;
  onSelectCategory?: (category: string) => void;
  onSearchKeyword?: (keyword: string) => void;
}

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
          url: v.officialLinks?.officialWebsiteUrl || 'https://www.rajasthanvacancy.online/'
        }
      ];

  const isYojanaPost = v.category === 'scheme';
  const isResultPostNorm = v.category === 'result' || v.status === 'result_declared';
  const resolvedDates = resolveJobDates(v);
  const defaultDatesArray = isYojanaPost
    ? [
        { key: 'notificationDate', label: 'योजना घोषणा / अपडेट तिथि (Scheme Update Date)', value: resolvedDates.notificationDate },
        { key: 'applyStartDate', label: 'आवेदन प्रारंभ तिथि (Apply Start Date)', value: resolvedDates.applyStartDate },
        { key: 'applyLastDate', label: 'आवेदन की अंतिम तिथि (Last Date)', value: resolvedDates.applyLastDate },
        ...(resolvedDates.examDate && !['शीघ्र', 'यथासमय घोषित'].includes(resolvedDates.examDate.trim())
          ? [{ key: 'examDate', label: 'सत्यापन / लाभ वितरण स्थिति (Benefit / Verification Status)', value: resolvedDates.examDate }]
          : [])
      ]
    : isResultPostNorm
    ? (Array.isArray((v as any).importantDates) && (v as any).importantDates.length > 0
        ? (v as any).importantDates
        : [
            { key: 'notificationDate', label: 'Result Declared Date (परिणाम घोषित तिथि)', value: resolvedDates.notificationDate },
            ...(resolvedDates.examDate && !['शीघ्र', 'यथासमय घोषित'].includes(resolvedDates.examDate.trim())
              ? [{ key: 'examDate', label: 'Next Selection Stage (आगामी चयन चरण)', value: resolvedDates.examDate }]
              : [])
          ])
    : [
        { key: 'notificationDate', label: 'Notification Released (विस्तृत अधिसूचना जारी तिथि)', value: resolvedDates.notificationDate },
        { key: 'applyStartDate', label: 'Application Begin (ऑनलाइन आवेदन प्रारंभ तिथि)', value: resolvedDates.applyStartDate },
        { key: 'applyLastDate', label: 'Last Date for Apply Online (ऑनलाइन आवेदन अंतिम तिथि)', value: resolvedDates.applyLastDate },
        { key: 'feeLastDate', label: 'Pay Exam Fee Last Date (शुल्क भुगतान अंतिम तिथि)', value: resolvedDates.feeLastDate },
        { key: 'admitCardDate', label: 'Admit Card Available (एडमिट कार्ड जारी तिथि)', value: resolvedDates.admitCardDate },
        { key: 'examDate', label: 'Exam Date (परीक्षा तिथि)', value: resolvedDates.examDate },
      ];

  // If user already had custom rows, preserve any extra rows (Result posts already preserve full array above)
  if (!isResultPostNorm && Array.isArray((v as any).importantDates)) {
    const existing = (v as any).importantDates;
    for (const item of existing) {
      if (item && item.label) {
        const lbl = item.label.toLowerCase();
        const isCorrectionOrShortNotice =
          lbl.includes('संशोधन') ||
          lbl.includes('correction') ||
          lbl.includes('पत्रांक') ||
          lbl.includes('short notice');
        const isStandard = !isCorrectionOrShortNotice && (
          lbl.includes('notif') || lbl.includes('अधिसूचना') || lbl.includes('begin') ||
          lbl.includes('start') || lbl.includes('शुरू') || lbl.includes('प्रारंभ') || lbl.includes('last') || lbl.includes('अंतिम') ||
          lbl.includes('fee') || lbl.includes('शुल्क') || lbl.includes('admit') || lbl.includes('एडमिट') ||
          lbl.includes('exam') || lbl.includes('परीक्षा') || lbl.includes('योजना घोषणा')
        );
        if (!isStandard) {
          defaultDatesArray.push(item);
        }
      }
    }
  }

  const defaultFeeArray = isResultPostNorm
    ? (Array.isArray((v as any).applicationFee) ? (v as any).applicationFee : [])
    : Array.isArray((v as any).applicationFee)
    ? (v as any).applicationFee
    : isYojanaPost
      ? [
          { category: 'सभी पात्र लाभार्थी / आवेदक (All Eligible Citizens)', amount: '₹0/- (निःशुल्क आवेदन)' },
          { category: 'आवेदन एवं लाभ माध्यम (Apply / Benefit Mode)', amount: v.yojanaOverview?.paymentMode || 'DBT (सीधे बैंक खाते में) / आधिकारिक पोर्टल' }
        ]
      : [
          { category: 'General / OBC / EWS', amount: `₹${(v.applicationFee as any)?.genObc ?? 600}/-` },
          { category: 'SC / ST / Divyang', amount: `₹${(v.applicationFee as any)?.scSt ?? 400}/-` },
          { category: 'Correction Charge', amount: '₹300/-' },
          { category: 'Pay Exam Fee Through', amount: (v.applicationFee as any)?.paymentModeHi || (v.applicationFee as any)?.paymentMode || 'Online (Debit / Credit Card / Net Banking)' },
        ];

  const defaultLatestNews = isResultPostNorm
    ? (Array.isArray((v as any).latestNews) ? (v as any).latestNews : [])
    : (v as any).latestNews && Array.isArray((v as any).latestNews) && (v as any).latestNews.length > 0
    ? (v as any).latestNews
    : [
        {
          id: 'news-1',
          date: resolvedDates.notificationDate || 'नवंबर 2026',
          badge: 'ताज़ा अपडेट',
          headline: `${v.shortTitleHi || v.titleHi || v.title} के संबंध में नई सूचना जारी`,
          details: isYojanaPost
            ? `${v.departmentHi || v.organization || 'संबंधित विभाग'} द्वारा योजना के ऑनलाइन आवेदन, पात्रता व लाभ वितरण संबंधी दिशानिर्देश अपडेट किए गए हैं।`
            : `${v.organization || 'विभाग'} द्वारा आधिकारिक पोर्टल पर भर्ती संबंधी आवश्यक दिशा-निर्देश व परीक्षा कैलेंडर की जानकारी अपडेट कर दी गई है।`,
          isHighlighted: true
        },
        {
          id: 'news-2',
          date: 'नवंबर 2026',
          badge: 'महत्वपूर्ण सूचना',
          headline: isYojanaPost ? 'आवेदन व पात्रता नियम' : 'ऑनलाइन आवेदन व पात्रता नियम',
          details: isYojanaPost
            ? 'लाभार्थी आवेदन करने से पूर्व अपना जन आधार कार्ड, आधार से लिंक बैंक खाता तथा आय/निवास प्रमाण पत्र अवश्य अपडेट करवा लें।'
            : 'इच्छुक अभ्यर्थी आवेदन करने से पूर्व अपनी शैक्षणिक योग्यता, आयु सीमा एवं आवश्यक प्रमाणपत्र (जाति/मूल निवास/EWS) की जांच अवश्य कर लें।',
          isHighlighted: false
        }
      ];

  return {
    ...v,
    directLinks: defaultDirectLinks,
    importantDates: defaultDatesArray,
    applicationFee: defaultFeeArray,
    latestNews: defaultLatestNews,
    requiredDocumentsHi: isResultPostNorm
      ? (Array.isArray((v as any).requiredDocumentsHi) ? (v as any).requiredDocumentsHi : [])
      : (v as any).requiredDocumentsHi && Array.isArray((v as any).requiredDocumentsHi) && (v as any).requiredDocumentsHi.length > 0
      ? (v as any).requiredDocumentsHi
      : getHighestEligibilityDocuments(v, true),
    howToApplyHi: isResultPostNorm
      ? (Array.isArray((v as any).howToApplyHi) ? (v as any).howToApplyHi : [])
      : (v as any).howToApplyHi && Array.isArray((v as any).howToApplyHi) && (v as any).howToApplyHi.length > 0
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

  if (v.category === 'admit_card' || v.status === 'admit_card_out') {
    const examLabel = v.shortTitleHi || v.shortTitle || v.postNameHi || 'परीक्षा';
    return isHi
      ? [
          `${examLabel} ई-एडमिट कार्ड (प्रवेश पत्र) का स्पष्ट प्रिंटआउट।`,
          'मूल वैध फोटो पहचान पत्र (आधार कार्ड / पैन कार्ड / वोटर आईडी / ड्राइविंग लाइसेंस / पासपोर्ट — फोटोकॉपी मान्य नहीं)।',
          '2 नवीनतम पासपोर्ट साइज रंगीन फोटोग्राफ।',
          'पारदर्शी नीला बॉल पॉइंट पेन (Transparent Blue Ball Point Pen)।'
        ]
      : [
          `Clear printout of ${v.shortTitle || v.postName || 'Exam'} e-Admit Card / Hall Ticket.`,
          'Original valid Photo ID Proof (Aadhaar Card / PAN Card / Voter ID / Driving License / Passport).',
          '2 latest passport-size color photographs.',
          'Transparent Blue Ball Point Pen.'
        ];
  }

  if (v.category === 'scheme') {
    const schemeText = ((v.titleHi || '') + ' ' + (v.qualificationDetailsHi || '') + ' ' + (v.descriptionHi || '')).toLowerCase();
    const isScholarshipOrStudent = schemeText.includes('छात्र') || schemeText.includes('स्कूटी') || schemeText.includes('scooty') || schemeText.includes('scholarship') || schemeText.includes('कॉलेज') || schemeText.includes('12वीं');
    const isDairyOrFarmer = schemeText.includes('गोपाल') || schemeText.includes('पशुपालक') || schemeText.includes('किसान') || schemeText.includes('डेयरी') || schemeText.includes('loan') || schemeText.includes('लोन');

    if (isHi) {
      const yojanaDocs = [
        'जन आधार कार्ड (Jan Aadhaar Card) एवं परिवार के मुखिया/आवेदक का आधार कार्ड।',
        'राजस्थान का मूल निवास प्रमाण पत्र (Bonafide Domicile Certificate)।',
        'आधार कार्ड से लिंक सक्रिय बैंक खाता पासबुक (DBT / ऋण राशि प्राप्त करने हेतु)।',
        'नवीनतम पासपोर्ट साइज रंगीन फोटो एवं पंजीकृत मोबाइल नंबर।'
      ];
      if (isScholarshipOrStudent) {
        yojanaDocs.push('10वीं व 12वीं कक्षा की मूल अंकतालिका एवं वर्तमान कॉलेज/संस्थान में नियमित प्रवेश की शुल्क रसीद।');
        yojanaDocs.push('परिवार का नवीनतम आय प्रमाण पत्र एवं जाति प्रमाण पत्र (SC/ST/OBC/MBC/EWS यदि लागू हो)।');
      } else if (isDairyOrFarmer) {
        yojanaDocs.push('प्राथमिक दुग्ध उत्पादक सहकारी समिति (Dairy Society) की सदस्यता / दूध आपूर्ति पासबुक या पशुधन विवरण।');
        yojanaDocs.push('नजदीकी ई-मित्र या राजसहकार पोर्टल पर सत्यापन हेतु पैन कार्ड (यदि उपलब्ध हो) एवं स्व-घोषणा पत्र।');
      } else {
        yojanaDocs.push('परिवार का आय प्रमाण पत्र एवं श्रेणी/पात्रता प्रमाण पत्र (योजना के नियमानुसार)।');
      }
      return yojanaDocs;
    }

    return [
      'Jan Aadhaar Card & Aadhaar Card of the applicant.',
      'State Domicile Certificate (Mool Niwas).',
      'Active Bank Account Passbook linked with Aadhaar / Jan Aadhaar (for DBT).',
      'Latest Passport Size Photograph & active mobile number.',
      isScholarshipOrStudent
        ? '10th/12th Marksheet, regular college admission receipt, and Family Income / Caste Certificate.'
        : 'Scheme-specific eligibility / membership / income proof as notified by the department.'
    ];
  }
  
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
  const isYojanaPost = v.category === 'scheme';
  const isRajPost = isRajasthanRelatedPost(v);
  const preserveSso = isRajPost && (isYojanaPost || v.category === 'admit_card' || v.status === 'admit_card_out');

  if (isHi && Array.isArray(v.howToApplyHi) && v.howToApplyHi.length > 0) {
    if (preserveSso) return v.howToApplyHi;
    // Sanitize any SSO occurrences for non-Rajasthan posts
    return v.howToApplyHi.map(s => 
      s.replace(/राजस्थान\s*SSO\s*पोर्टल\s*\(sso\.rajasthan\.gov\.in\)/gi, 'आधिकारिक पोर्टल')
       .replace(/sso\.rajasthan\.gov\.in/gi, 'आधिकारिक वेबसाइट')
       .replace(/अपनी\s*SSO\s*ID\s*और\s*पासवर्ड/gi, 'अपनी लॉगिन आईडी और पासवर्ड')
       .replace(/SSO\s*पोर्टल/gi, 'आधिकारिक पोर्टल')
       .replace(/SSO\s*ID/gi, 'लॉगिन / रजिस्ट्रेशन आईडी')
    );
  }
  if (!isHi && Array.isArray(v.howToApply) && v.howToApply.length > 0) {
    if (preserveSso) return v.howToApply;
    return v.howToApply.map(s => 
      s.replace(/Rajasthan\s*SSO\s*\(sso\.rajasthan\.gov\.in\)/gi, 'Official Portal')
       .replace(/sso\.rajasthan\.gov\.in/gi, 'official website')
       .replace(/SSO\s*ID/gi, 'Login ID')
    );
  }

  const portalHost = v.officialLinks?.officialWebsiteUrl 
    ? (() => {
        try {
          return new URL(v.officialLinks.officialWebsiteUrl).hostname;
        } catch {
          return 'आधिकारिक पोर्टल';
        }
      })()
    : 'आधिकारिक योजना पोर्टल';

  if (isYojanaPost) {
    const schemeName = v.shortTitleHi || v.shortTitle || v.postNameHi || 'संबंधित सरकारी योजना';
    return isHi
      ? [
          isRajPost
            ? `चरण 1: सबसे पहले योजना के आधिकारिक पोर्टल (${portalHost}) या राजस्थान SSO पोर्टल (sso.rajasthan.gov.in) पर जाएं अथवा नजदीकी E-Mitra केंद्र पर संपर्क करें।`
            : `चरण 1: सबसे पहले योजना के आधिकारिक पोर्टल (${portalHost}) पर जाएं अथवा नजदीकी CSC / सेवा केंद्र पर संपर्क करें।`,
          isRajPost
            ? `चरण 2: अपनी SSO ID व पासवर्ड से लॉगिन करें (नए उपयोगकर्ता जन आधार / आधार संख्या से Citizen रजिस्ट्रेशन करें)।`
            : `चरण 2: अपनी लॉगिन आईडी / मोबाइल नंबर व OTP से लॉगिन करें अथवा नया पंजीकरण (New Registration) करें।`,
          `चरण 3: डैशबोर्ड पर संबंधित विभाग की "${schemeName}" के आवेदन लिंक का चयन करें।`,
          isRajPost
            ? 'चरण 4: जन आधार संख्या दर्ज कर आवेदक व परिवार के सदस्यों का ई-केवाईसी (OTP / बायोमेट्रिक) सत्यापन करें।'
            : 'चरण 4: आधार संख्या दर्ज कर आवेदक का ई-केवाईसी (OTP / बायोमेट्रिक) सत्यापन पूरा करें।',
          'चरण 5: आवेदन फॉर्म में मांगी गई व्यक्तिगत जानकारी, निवास, पात्रता व आधार-लिंक्ड बैंक खाते का विवरण सही-सही भरें।',
          'चरण 6: सभी आवश्यक दस्तावेजों (पहचान पत्र, आय/निवास प्रमाण पत्र, पासबुक व योजना संबंधी दस्तावेज) की स्पष्ट PDF/JPG प्रति अपलोड करें।',
          'चरण 7: भरे गए संपूर्ण आवेदन फॉर्म का पूर्वावलोकन (Preview) ध्यान से जांचें और फाइनल सबमिट (Final Submit) करें।',
          'चरण 8: आवेदन सबमिट होने के बाद प्राप्त रसीद / आवेदन क्रमांक (Application ID) का प्रिंटआउट भविष्य के लिए सुरक्षित रखें।'
        ]
      : [
          isRajPost
            ? `Step 1: Visit the official scheme portal (${portalHost}), SSO Rajasthan (sso.rajasthan.gov.in), or your nearest E-Mitra center.`
            : `Step 1: Visit the official scheme portal (${portalHost}) or your nearest CSC center.`,
          isRajPost
            ? 'Step 2: Log in using your SSO / Citizen credentials or complete new registration via Jan Aadhaar / Aadhaar.'
            : 'Step 2: Log in using your portal credentials / OTP or complete new citizen registration via Aadhaar.',
          `Step 3: Select "${schemeName}" from the active citizen schemes dashboard.`,
          isRajPost
            ? 'Step 4: Verify applicant details via Jan Aadhaar e-KYC and fill in required personal, eligibility, and bank account details.'
            : 'Step 4: Verify applicant details via Aadhaar e-KYC and fill in required personal, eligibility, and bank account details.',
          'Step 5: Upload clear scanned copies of all required scheme documents.',
          'Step 6: Review the application preview carefully, submit the form online, and print/save the acknowledgment receipt.'
        ];
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

export const getHowToCheckResultSteps = (v: Partial<VacancyItem>, isHi = true): string[] => {
  const isRajPost = isRajasthanRelatedPost(v);
  if (isHi && Array.isArray(v.howToApplyHi) && v.howToApplyHi.length > 0) {
    const looksLikeApplyForm = v.howToApplyHi.some((s) =>
      /Apply Online|आवेदन पत्र|फॉर्म भरें|आवेदन शुल्क का नेट बैंकिंग/i.test(s)
    );
    if (!looksLikeApplyForm) {
      return isRajPost
        ? v.howToApplyHi
        : v.howToApplyHi.map((s) =>
            s
              .replace(/sso\.rajasthan\.gov\.in/gi, 'आधिकारिक पोर्टल')
              .replace(/SSO\s*ID/gi, 'रजिस्ट्रेशन / रोल नंबर')
          );
    }
  }
  if (!isHi && Array.isArray(v.howToApply) && v.howToApply.length > 0) {
    const looksLikeApplyForm = v.howToApply.some((s) => /Apply Online|application preview/i.test(s));
    if (!looksLikeApplyForm) {
      return v.howToApply;
    }
  }

  const shortTitle = (v.shortTitleHi || v.shortTitle || v.postNameHi || v.postName || 'परीक्षा').split(':')[0];
  const orgLabel = v.departmentHi || v.department || v.organization || 'संबंधित भर्ती बोर्ड';
  const portalHost = v.officialLinks?.officialWebsiteUrl
    ? (() => {
        try {
          return new URL(v.officialLinks.officialWebsiteUrl).hostname;
        } catch {
          return 'आधिकारिक पोर्टल';
        }
      })()
    : 'आधिकारिक वेबसाइट';
  const hasPdf = Boolean(v.officialLinks?.resultPdfUrl);

  if (isHi) {
    return [
      `चरण 1: सबसे पहले ${orgLabel} की आधिकारिक वेबसाइट (${portalHost}${isRajPost ? ' या sso.rajasthan.gov.in' : ''}) पर जाएं।`,
      `चरण 2: होमपेज पर "Results / Latest News" सेक्शन में "${shortTitle}" परिणाम लिंक पर क्लिक करें।`,
      hasPdf
        ? 'चरण 3: मेरिट लिस्ट PDF डाउनलोड करें अथवा अपने Roll Number / Registration Number व जन्मतिथि से लॉगिन करें।'
        : 'चरण 3: अपना Registration Number / Roll Number तथा Password या Date of Birth दर्ज कर सबमिट करें।',
      'चरण 4: स्क्रीन पर दिख रहे परिणाम या PDF में अपना रोल नंबर (Ctrl+F द्वारा) व श्रेणीवार कट-ऑफ अंक जांचें।',
      'चरण 5: भविष्य के आगामी चयन चरण / दस्तावेज सत्यापन के लिए स्कोरकार्ड या रिजल्ट पृष्ठ का प्रिंटआउट सुरक्षित रखें।'
    ];
  }

  return [
    `Step 1: Visit the official portal of ${orgLabel} (${portalHost}).`,
    `Step 2: Open the "Results" section and click on the "${shortTitle}" link.`,
    hasPdf
      ? 'Step 3: Download the Merit List PDF or sign in with your Roll Number / Registration Number and DOB.'
      : 'Step 3: Enter your Registration Number / Roll Number and Password or Date of Birth.',
    'Step 4: Check your qualification status and category-wise cut-off marks.',
    'Step 5: Download or print the result / scorecard for upcoming selection stages.'
  ];
};

export const VacancyDetailPage: React.FC<VacancyDetailPageProps> = ({
  vacancy,
  onBack,
  lang,
  allVacancies,
  onSelectOtherVacancy,
  isAdmin = false,
  onSelectCategory,
  onSearchKeyword,
}) => {
  const editablePost = useMemo(() => normalizePost(vacancy) as VacancyItem, [vacancy]);
  const currentVacancy = editablePost;

  const displayTags =
    editablePost.tags && Array.isArray(editablePost.tags) && editablePost.tags.length > 0
      ? editablePost.tags
      : vacancy.tags && Array.isArray(vacancy.tags) && vacancy.tags.length > 0
      ? vacancy.tags
      : ['#RajasthanVacancy2026', '#SarkariResult2026', '#GovtJobsAlert', '#SarkariBharti'];

  const handleTagClick = (tag: string) => {
    const clean = tag.replace(/^#/, '');
    if (onSearchKeyword) {
      onSearchKeyword(clean);
      return;
    }
    const matching = allVacancies.find(
      (v) =>
        v.id !== vacancy.id &&
        ((v.tags && v.tags.some((t) => t.toLowerCase().includes(clean.toLowerCase()))) ||
          v.title.toLowerCase().includes(clean.toLowerCase()) ||
          (v.titleHi && v.titleHi.toLowerCase().includes(clean.toLowerCase())))
    );
    if (matching) {
      onSelectOtherVacancy(matching);
    } else if (onBack) {
      onBack();
    }
  };

  const DisplayField: React.FC<{
    value?: string | number;
    className?: string;
    style?: React.CSSProperties;
    as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'div' | 'p' | 'td';
    placeholder?: string;
    isDate?: boolean;
  }> = ({
    value = '',
    className = '',
    style,
    as: TagEl = 'span',
    placeholder = '...',
    isDate = false,
  }) => {
    const strVal = String(value ?? '');
    const isIsoOrStandardDate = /^\d{4}-\d{2}-\d{2}/.test(strVal) || /^\d{1,2}-\d{1,2}-\d{4}/.test(strVal);
    const displayVal = isDate || isIsoOrStandardDate ? formatDisplayDate(strVal) : strVal;

    return (
      <TagEl className={className} style={style}>
        {displayVal || placeholder}
      </TagEl>
    );
  };

  const isHi = lang === 'hi';
  const postTitle = isHi ? editablePost.titleHi || editablePost.title : editablePost.title;
  const shortJobName = editablePost.shortTitleHi || editablePost.shortTitle || postTitle.split(':')[0] || 'भर्ती 2026';

  const isOfflinePost =
    ((editablePost.titleHi || '') + (editablePost.postNameHi || '') + (editablePost.id || '') + (editablePost.department || ''))
      .toLowerCase()
      .includes('ऑफलाइन') ||
    ((editablePost.title || '') + (editablePost.postName || '') + (editablePost.id || ''))
      .toLowerCase()
      .includes('offline') ||
    Boolean(editablePost.id && editablePost.id.includes('hindi-typist')) ||
    Boolean(editablePost.id && editablePost.id.includes('air-force')) ||
    Boolean(editablePost.postalAddress);

  const [copiedLink, setCopiedLink] = useState(false);

  const resolvedDates = useMemo(() => resolveJobDates(editablePost), [editablePost]);

  const notificationDateDisplay = formatDisplayDate(resolvedDates.notificationDate);
  const applyStartDateDisplay = formatDisplayDate(resolvedDates.applyStartDate);
  const applyLastDateDisplay = formatDisplayDate(resolvedDates.applyLastDate);
  const admitCardDateDisplay = formatDisplayDate(resolvedDates.admitCardDate);
  const examDateDisplay = formatDisplayDate(resolvedDates.examDate);

  const deletedKeys = editablePost.deletedSectionKeys || [];
  const isSectionDeleted = (key: string) => deletedKeys.includes(key);

  const getSectionTable = (sectionKey: string) => {
    if (editablePost.sectionTableMap && editablePost.sectionTableMap[sectionKey]) {
      return editablePost.sectionTableMap[sectionKey];
    }
    return null;
  };

  const getSectionTitle = (sectionKey: string, defaultTitle: string) => {
    if (editablePost.sectionTitleMap && editablePost.sectionTitleMap[sectionKey]) {
      return editablePost.sectionTitleMap[sectionKey];
    }
    return defaultTitle;
  };

  const renderCustomTableComponent = (table: { headers: string[]; rows: string[][] }) => (
    <div className="wp-block-table overflow-x-auto border border-slate-300 rounded-md bg-white my-3 shadow-2xs">
      <table className="w-full border-collapse text-left" style={{ fontSize: '12pt' }}>
        <thead>
          <tr className="bg-slate-50 border-b border-slate-300">
            {table.headers.map((h, colIdx) => (
              <th key={colIdx} className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200 last:border-r-0">
                <span>{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {table.rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, colIdx) => {
                const parsedLink = parseTableCellLink(cell);
                return (
                  <td key={colIdx} className="p-2.5 sm:p-3 text-slate-800 font-medium border-r border-slate-200 last:border-r-0 bg-white">
                    {parsedLink ? (
                      <a
                        href={parsedLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-bold inline-flex items-center gap-1"
                      >
                        <span>{parsedLink.label}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span>{cell}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Dynamic Title & SEO
    const originalTitle = document.title;
    const cleanTitle = `${postTitle} - Rajasthan Vacancy 2026`;
    document.title = cleanTitle;

    // Dynamic Meta Description & OpenGraph Tags
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc?.getAttribute('content') || '';
    const isSchemePost = editablePost.category === 'scheme';
    const isAdmitPostMeta = editablePost.category === 'admit_card' || editablePost.status === 'admit_card_out';
    const isResultPostMeta = editablePost.category === 'result' || editablePost.status === 'result_declared';
    const newDesc = isSchemePost
      ? `${postTitle}: मुख्य लाभ (${editablePost.yojanaOverview?.maxAnnualAssistance || editablePost.salaryHi || editablePost.salary || 'सरकारी सहायता'}), पात्रता शर्तें, आवश्यक दस्तावेज, अंतिम तिथि एवं ऑनलाइन आवेदन प्रक्रिया।`
      : isAdmitPostMeta
      ? `${postTitle}: एडमिट कार्ड जारी, परीक्षा तिथि, शिफ्ट समय, ${isRajasthanRelatedPost(editablePost) ? 'SSO ID से' : 'आधिकारिक पोर्टल से'} डाउनलोड करने की विधि, केंद्र निर्देश एवं डायरेक्ट लिंक।`
      : isResultPostMeta
      ? `${postTitle}: आधिकारिक परीक्षा परिणाम, मेरिट लिस्ट PDF, कट-ऑफ अंक एवं डाउनलोड प्रक्रिया।`
      : `${postTitle}: कुल पद ${editablePost.totalPosts || 'विभिन्न पद'}। भर्ती की शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, परीक्षा तिथि एवं फॉर्म भरने की पूरी प्रक्रिया।`;
    if (metaDesc) {
      metaDesc.setAttribute('content', newDesc);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', cleanTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', newDesc);

    // Dynamic High-CTR Featured Image Thumbnail for WhatsApp, Telegram & Social Sharing
    const featuredThumbUrl = getJobFeaturedImage(editablePost);
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', featuredThumbUrl);
    let twImage = document.querySelector('meta[name="twitter:image"]');
    if (twImage) twImage.setAttribute('content', featuredThumbUrl);

    // Meta keywords & viral tags injection for search engines & web crawlers
    const activeTagsList = (editablePost.tags && Array.isArray(editablePost.tags) && editablePost.tags.length > 0)
      ? editablePost.tags.map(t => t.replace(/^#/, ''))
      : [cleanTitle, editablePost.organization || 'Rajasthan Govt', 'Rajasthan Vacancy 2026', 'Sarkari Result', 'RPSC', 'RSMSSB'];
    const keywordsStr = activeTagsList.join(', ');

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywordsStr);

    let metaNewsKeywords = document.querySelector('meta[name="news_keywords"]');
    if (!metaNewsKeywords) {
      metaNewsKeywords = document.createElement('meta');
      metaNewsKeywords.setAttribute('name', 'news_keywords');
      document.head.appendChild(metaNewsKeywords);
    }
    metaNewsKeywords.setAttribute('content', keywordsStr);

    let metaViral = document.querySelector('meta[name="viral-tags"]');
    if (!metaViral) {
      metaViral = document.createElement('meta');
      metaViral.setAttribute('name', 'viral-tags');
      document.head.appendChild(metaViral);
    }
    metaViral.setAttribute('content', keywordsStr);

    // Dynamic Canonical URL injection for Google Search Indexing (Strict Self-Referential Canonical)
    const postCanonicalUrl = buildCanonicalUrl({ vacancyId: editablePost.id });
    applyCanonicalTag(postCanonicalUrl);

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.setAttribute('content', originalDesc);
    };
  }, [vacancy.id, postTitle, editablePost]);

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

  // Recent Posts for related opportunities at the bottom of the card (10 items)
  const recentPosts = useMemo(() => {
    return [...allVacancies]
      .filter(v => v.id !== vacancy.id)
      .sort(compareVacanciesNewestFirst)
      .slice(0, 10);
  }, [allVacancies, vacancy]);

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

  const isYojana = editablePost.category === 'scheme';
  const isFlexCategory = editablePost.category === 'news' || editablePost.category === 'scheme';
  const isAdmitCardPost = editablePost.category === 'admit_card' || editablePost.status === 'admit_card_out';
  const isResultPost = editablePost.category === 'result' || editablePost.status === 'result_declared';
  const isAdmitOrResult = isAdmitCardPost || isResultPost;
  const admitTitles = useMemo(() => getAdmitCardTitles(editablePost), [editablePost]);

  // FAQs dynamically synchronized with page content & FAQPage JSON-LD
  const faqList = useMemo(() => {
    if (isAdmitOrResult) {
      return generateDynamicPostFaqs(editablePost);
    }
    if (editablePost.faqs && editablePost.faqs.length > 0) {
      return editablePost.faqs;
    }
    if (vacancy.faqs && vacancy.faqs.length > 0) {
      return vacancy.faqs;
    }
    return generateDynamicPostFaqs(editablePost);
  }, [isAdmitOrResult, editablePost, vacancy.faqs]);

  const ADMIT_CARD_SECTION_ORDER = [
    'overview',
    'admit_released',
    'admit_exam_time',
    'admit_sso_download',
    'admit_reporting_time',
    'admit_check_details',
    'admit_what_to_carry',
    'admit_troubleshoot',
    'important_links'
  ];

  const DEFAULT_SECTION_ORDER = isYojana
    ? [
        'overview',
        'yojana_info',
        'yojana_eligibility',
        'dates',
        'application_fee',
        'selection_process',
        'documents',
        'how_to_apply',
        'important_links',
        'faqs'
      ]
    : isAdmitCardPost
    ? ADMIT_CARD_SECTION_ORDER
    : [
        'overview',
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
        'official_notification',
        'important_links',
        'faqs'
      ];

  const activeSectionKeys = useMemo(() => {
    const savedOrder = currentVacancy.sectionOrder;
    const allCustomKeys = (currentVacancy.customSections || []).map((s) => `custom_${s.id}`);

    const insertMissingCustomKeys = (baseKeys: string[]): string[] => {
      const missingCustom = allCustomKeys.filter((k) => !baseKeys.includes(k));
      if (missingCustom.length === 0) return baseKeys;
      const linksIdx = baseKeys.indexOf('important_links');
      if (linksIdx >= 0) {
        return [
          ...baseKeys.slice(0, linksIdx),
          ...missingCustom,
          ...baseKeys.slice(linksIdx),
        ];
      }
      return [...baseKeys, ...missingCustom];
    };

    // Result category: no rigid recruitment section system — compose blocks dynamically from each post's actual data
    if (isResultPost) {
      const hasNews = Array.isArray(currentVacancy.latestNews) && currentVacancy.latestNews.length > 0;
      const hasResultDates =
        Array.isArray(currentVacancy.importantDates) &&
        currentVacancy.importantDates.some((d: any) => {
          const val = String(d?.value || '').trim();
          const k = String(d?.key || '').toLowerCase();
          return (
            Boolean(val) &&
            val !== 'शीघ्र' &&
            val !== 'यथासमय घोषित' &&
            !['applystartdate', 'applylastdate', 'feelastdate', 'admitcarddate'].includes(k)
          );
        });
      const hasPostBreakdown = Array.isArray(currentVacancy.postBreakdown) && currentVacancy.postBreakdown.length > 0;
      const hasQualification = Boolean(
        (currentVacancy.qualificationDetailsHi || currentVacancy.qualificationDetails || '').trim()
      );
      const hasSelection =
        Array.isArray(currentVacancy.selectionProcessHi) && currentVacancy.selectionProcessHi.length > 0;
      const hasResultDocs =
        Array.isArray(currentVacancy.requiredDocumentsHi) && currentVacancy.requiredDocumentsHi.length > 0;

      return [
        'result_overview',
        ...allCustomKeys,
        ...(hasNews ? ['latest_news'] : []),
        ...(hasResultDates ? ['dates'] : []),
        ...(hasPostBreakdown ? ['post_breakdown'] : []),
        ...(hasQualification ? ['qualification'] : []),
        'result_how_to_check',
        ...(hasSelection ? ['selection_process'] : []),
        ...(hasResultDocs ? ['documents'] : []),
        'important_links',
        'faqs'
      ];
    }

    if (isAdmitCardPost) {
      const customKeys = Array.from(
        new Set([...(savedOrder || []).filter((k) => k.startsWith('custom_')), ...allCustomKeys])
      );
      if (savedOrder && savedOrder.some((k) => k.startsWith('admit_'))) {
        const filtered = savedOrder.filter((k) => ADMIT_CARD_SECTION_ORDER.includes(k) || k.startsWith('custom_'));
        const missing = ADMIT_CARD_SECTION_ORDER.filter((k) => !filtered.includes(k));
        return insertMissingCustomKeys([...filtered, ...missing]);
      }
      return insertMissingCustomKeys([...ADMIT_CARD_SECTION_ORDER, ...customKeys]);
    }
    if (!savedOrder || savedOrder.length === 0) {
      return insertMissingCustomKeys(DEFAULT_SECTION_ORDER);
    }
    const normalizedSaved = savedOrder.map((k) => (k === 'fee' ? 'application_fee' : k === 'salary' ? 'salary_table' : k));
    const filteredSaved = isAdmitOrResult ? normalizedSaved.filter((k) => k !== 'age_limit') : normalizedSaved;
    const missing = DEFAULT_SECTION_ORDER.filter((k) => !filteredSaved.includes(k));
    return insertMissingCustomKeys([...filteredSaved, ...missing]);
  }, [
    currentVacancy.sectionOrder,
    currentVacancy.customSections,
    currentVacancy.latestNews,
    currentVacancy.importantDates,
    currentVacancy.postBreakdown,
    currentVacancy.qualificationDetailsHi,
    currentVacancy.qualificationDetails,
    currentVacancy.selectionProcessHi,
    currentVacancy.requiredDocumentsHi,
    isYojana,
    isAdmitCardPost,
    isResultPost,
    isAdmitOrResult
  ]);

  return (
    <div className="w-full text-[#222222] space-y-3 sm:space-y-4">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 px-3 sm:px-4 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap text-slate-600 font-medium">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
            className="flex items-center gap-1 text-slate-700 hover:text-[#0056b3] transition cursor-pointer font-bold"
            title="मुख्य पृष्ठ"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Home</span>
          </a>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <a
            href={`/?category=${encodeURIComponent(normalizeBreadcrumbCategoryKey(editablePost.category))}`}
            onClick={(e) => {
              e.preventDefault();
              if (onSelectCategory) {
                onSelectCategory(normalizeBreadcrumbCategoryKey(editablePost.category));
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
              : editablePost.category === 'scheme'
              ? (isHi ? 'सरकारी योजना' : 'Sarkari Yojana')
              : editablePost.category === 'news'
              ? (isHi ? 'लेटेस्ट न्यूज़' : 'Latest News')
              : editablePost.category === 'exam_date'
              ? (isHi ? 'परीक्षा तिथि' : 'Exam Dates')
              : (isHi ? 'लेटेस्ट जॉब्स' : 'Latest Jobs')}
          </a>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {editablePost.shortTitleHi || editablePost.shortTitle || shortJobName}
          </span>
        </nav>

        {/* Action Buttons (Admin Only) */}
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                const ok = await copyTextToClipboard(getVacancyShareUrl(editablePost.id));
                if (ok) {
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
              title="इस पोस्ट का पूरा URL कॉपी करें"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedLink ? '✓ Copied' : 'Copy URL'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Full-Width Clean Card Layout for Optimal Readability */}
      <div className="w-full max-w-4xl mx-auto min-w-0">
        {/* Main Article Content Area */}
        <main className="w-full min-w-0">
          <article 
            className="job-detail-card bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-8 border border-slate-200 shadow-xs min-w-0 max-w-full overflow-x-hidden"
          >
              {/* Entry Header */}
              <header className="entry-header border-b border-slate-200 pb-4 mb-5">
                <DisplayField
                  as="h1"
                  value={isHi ? (editablePost.titleHi || editablePost.title) : editablePost.title}
                  className="entry-title font-bold text-slate-900 tracking-tight leading-snug text-[22px] sm:text-[24px]"
                  style={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans Devanagari', -apple-system, sans-serif",
                    fontSize: 'clamp(22px, 3vw, 24px)',
                    lineHeight: 1.35
                  }}
                />

                {/* Entry Meta */}
                <div className="entry-meta text-[13px] text-slate-500 mt-2.5 flex items-center gap-2 flex-wrap font-medium">
                  <span className="posted-on flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <time className="entry-date published text-slate-600">
                      {notificationDateDisplay || 'November 11, 2026'}
                    </time>
                  </span>
                  <span className="text-slate-400">by</span>
                  <span className="byline">
                    <a
                      href="/?category=news"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onSelectCategory) {
                          onSelectCategory('news');
                        } else {
                          onBack();
                        }
                      }}
                      className="font-bold text-[#0073aa] hover:underline cursor-pointer transition"
                      title={isHi ? 'लेटेस्ट न्यूज़ (Latest News) खोलें' : 'Open Latest News'}
                    >
                      RajasthanVacancy
                    </a>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                    {vacancy.organization}
                  </span>
                </div>
              </header>

              {/* Featured Header Card - 100% Crystal Clear High-Contrast Dark Emerald UI */}
              <div className="job-hero-card mb-6 rounded-xl sm:rounded-2xl border border-[#10b981]/60 bg-gradient-to-br from-[#04392e] via-[#06483a] to-[#0a2e26] p-3.5 sm:p-6 shadow-xl text-white min-w-0 max-w-full overflow-hidden">
                <div className="space-y-3 min-w-0">
                  <span 
                    className="inline-block max-w-full break-words bg-[#0a5243] !text-[#a7f3d0] border border-[#10b981]/70 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-2xs"
                    style={{ color: '#a7f3d0', backgroundColor: '#0a5243' }}
                  >
                    {isYojana
                      ? (editablePost.departmentHi || editablePost.department || 'सरकारी योजना, राजस्थान सरकार')
                      : (editablePost.department || (editablePost.organization ? `${editablePost.organization} DEPARTMENT` : 'RPSC DEPARTMENT'))}
                  </span>
                  <div>
                    <DisplayField
                      as="h2"
                      value={editablePost.shortTitleHi || editablePost.shortTitle || shortJobName}
                      className="headlight text-xl sm:text-2xl font-extrabold !text-white tracking-tight leading-snug drop-shadow-xs"
                      style={{ color: '#ffffff', fontFamily: "'Noto Sans Devanagari', 'Hind', 'Poppins', sans-serif" }}
                    />
                  </div>
                  <p 
                    className="!text-[#6ee7b7] text-xs sm:text-sm font-semibold leading-relaxed"
                    style={{ color: '#6ee7b7' }}
                  >
                    {isYojana
                      ? (isHi
                          ? 'योजना का उद्देश्य, मुख्य लाभ, पात्रता शर्तें, आवश्यक दस्तावेज एवं ऑनलाइन आवेदन प्रक्रिया'
                          : 'Scheme Objectives, Benefits, Eligibility Criteria, Documents & Application Guide')
                      : isAdmitCardPost
                      ? (isHi
                          ? `प्रवेश पत्र जारी सूचना, परीक्षा तिथि व समय, ${admitTitles.isSso ? 'SSO ID से डाउनलोड विधि' : 'आधिकारिक पोर्टल से डाउनलोड विधि'}, केंद्र निर्देश एवं महत्वपूर्ण लिंक्स`
                          : 'Admit Card Release Status, Exam Schedule, Download Steps, Center Instructions & Direct Links')
                      : isResultPost
                      ? (isHi
                          ? 'आधिकारिक परीक्षा परिणाम, मेरिट लिस्ट PDF, कट-ऑफ अंक एवं डाउनलोड प्रक्रिया'
                          : 'Official Result, Merit List PDF, Cut-off Marks & Download Guide')
                      : (isHi ? 'विस्तृत विज्ञापन, शैक्षणिक योग्यता, आयु सीमा एवं चयन प्रक्रिया' : 'Detailed Notification, Eligibility & Application Guide')}
                  </p>

                  {/* Centered Total Posts / Admit Card / Scheme Benefit Box */}
                  {isYojana ? (
                    <div className="bg-[#02261e] border border-[#10b981]/70 rounded-xl p-3.5 sm:p-4 text-center mt-3.5 w-full shadow-inner">
                      <span 
                        className="text-xs uppercase font-bold !text-[#34d399] block tracking-wider"
                        style={{ color: '#34d399' }}
                      >
                        {isHi ? 'मुख्य लाभ / वित्तीय सहायता (Scheme Benefit)' : 'Scheme Benefit / Assistance'}
                      </span>
                      <span 
                        className="text-xl sm:text-2xl font-black !text-[#facc15] block mt-1 tracking-wide drop-shadow-xs leading-snug"
                        style={{ color: '#facc15' }}
                      >
                        <DisplayField
                          value={
                            editablePost.yojanaOverview?.maxAnnualAssistance ||
                            editablePost.salaryHi ||
                            editablePost.salary ||
                            editablePost.totalPosts ||
                            (isHi ? 'सरकारी सहायता व योजना लाभ' : 'Government Scheme Assistance')
                          }
                        />
                      </span>
                    </div>
                  ) : isAdmitCardPost ? (
                    <div className="bg-[#02261e] border border-[#10b981]/70 rounded-xl p-3.5 sm:p-4 text-center mt-3.5 w-full shadow-inner">
                      <span 
                        className="text-xs uppercase font-bold !text-[#34d399] block tracking-wider"
                        style={{ color: '#34d399' }}
                      >
                        {isHi ? 'प्रवेश पत्र स्थिति (Admit Card Status)' : 'Admit Card Status'}
                      </span>
                      <span 
                        className="text-xl sm:text-2xl font-black !text-[#facc15] block mt-1 tracking-wide drop-shadow-xs leading-snug"
                        style={{ color: '#facc15' }}
                      >
                        {isHi ? 'एडमिट कार्ड जारी (Download Available)' : 'Admit Card Released'}
                      </span>
                    </div>
                  ) : isResultPost ? (
                    <div className="bg-[#02261e] border border-[#10b981]/70 rounded-xl p-3.5 sm:p-4 text-center mt-3.5 w-full shadow-inner">
                      <span 
                        className="text-xs uppercase font-bold !text-[#34d399] block tracking-wider"
                        style={{ color: '#34d399' }}
                      >
                        {isHi ? 'परिणाम स्थिति (Result Status)' : 'Result Status'}
                      </span>
                      <span 
                        className="text-xl sm:text-2xl font-black !text-[#facc15] block mt-1 tracking-wide drop-shadow-xs leading-snug"
                        style={{ color: '#facc15' }}
                      >
                        {isHi ? 'रिजल्ट जारी (Result Declared)' : 'Result Declared'}
                      </span>
                    </div>
                  ) : (!isFlexCategory || (editablePost.totalPosts && String(editablePost.totalPosts).trim() !== '' && String(editablePost.totalPosts) !== 'विभिन्न पद')) && (
                    <div className="bg-[#02261e] border border-[#10b981]/70 rounded-xl p-3.5 sm:p-4 text-center mt-3.5 w-full shadow-inner">
                      <span 
                        className="text-xs uppercase font-bold !text-[#34d399] block tracking-wider"
                        style={{ color: '#34d399' }}
                      >
                        {isHi ? 'कुल पद / सीटें' : 'Total Posts'}
                      </span>
                      <span 
                        className="text-2xl sm:text-3xl font-black !text-[#facc15] block mt-0.5 tracking-wide drop-shadow-xs"
                        style={{ color: '#facc15' }}
                      >
                        <DisplayField
                          value={editablePost.totalPosts || (isHi ? 'विभिन्न पद' : 'Various Posts')}
                        />
                      </span>
                    </div>
                  )}

                  {/* Integrated Key Dates / Yojana Snapshot Grid */}
                  {isYojana ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3.5 border-t border-[#10b981]/50 text-xs">
                      {[
                        { label: 'राज्य / क्षेत्र', value: editablePost.yojanaOverview?.state || editablePost.jobLocation || 'राजस्थान', isImportant: false },
                        { label: 'आवेदन शुरू', value: applyStartDateDisplay, isImportant: false },
                        { label: 'अंतिम तिथि', value: applyLastDateDisplay, isImportant: true },
                        { label: 'आवेदन माध्यम', value: editablePost.yojanaOverview?.applyMode || editablePost.applicationMode || 'ऑनलाइन / E-Mitra', isImportant: false }
                      ].map((d, idx) => (
                        <div 
                          key={idx} 
                          className={`rounded-xl p-2.5 text-center border transition-all ${d.isImportant ? 'bg-[#3b1200] border-[#f59e0b] ring-1 ring-amber-400/40 shadow-sm' : 'bg-[#02261e] border-[#10b981]/50'}`}
                        >
                          <span 
                            className="text-[11px] uppercase font-bold block"
                            style={{ color: d.isImportant ? '#fde047' : '#a7f3d0' }}
                          >
                            {d.label}
                          </span>
                          <span 
                            className="font-extrabold text-xs sm:text-sm mt-0.5 block break-words"
                            style={{ color: d.isImportant ? '#fde047' : '#ffffff' }}
                          >
                            {d.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : isAdmitCardPost ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3.5 border-t border-[#10b981]/50 text-xs">
                      {[
                        { label: 'परीक्षा संस्था', value: editablePost.organization || 'RSMSSB', isImportant: false },
                        { label: 'एडमिट कार्ड जारी', value: admitCardDateDisplay, isImportant: false },
                        { label: 'परीक्षा तिथि', value: examDateDisplay, isImportant: true },
                        { label: 'डाउनलोड माध्यम', value: admitTitles.isSso ? 'SSO ID / पोर्टल' : 'आधिकारिक वेबसाइट', isImportant: false }
                      ].map((d, idx) => (
                        <div 
                          key={idx} 
                          className={`rounded-xl p-2.5 text-center border transition-all ${d.isImportant ? 'bg-[#3b1200] border-[#f59e0b] ring-1 ring-amber-400/40 shadow-sm' : 'bg-[#02261e] border-[#10b981]/50'}`}
                        >
                          <span 
                            className="text-[11px] uppercase font-bold block"
                            style={{ color: d.isImportant ? '#fde047' : '#a7f3d0' }}
                          >
                            {d.label}
                          </span>
                          <span 
                            className="font-extrabold text-xs sm:text-sm mt-0.5 block break-words"
                            style={{ color: d.isImportant ? '#fde047' : '#ffffff' }}
                          >
                            {d.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : isResultPost ? (() => {
                    const nextStageArr = Array.isArray(editablePost.selectionProcessHi) ? editablePost.selectionProcessHi : [];
                    const nextStageVal =
                      nextStageArr.find((s) => !/जारी|घोषित|declared|out/i.test(s)) ||
                      nextStageArr[nextStageArr.length - 1] ||
                      'दस्तावेज सत्यापन / मेरिट';
                    const resultSnapshot = [
                      { label: 'आयोजक संस्था', value: editablePost.organization || editablePost.department || 'Recruitment Board', isImportant: false },
                      { label: 'परिणाम जारी तिथि', value: notificationDateDisplay, isImportant: true },
                      { label: 'घोषित कुल पद', value: String(editablePost.totalPosts || 'विज्ञप्ति अनुसार'), isImportant: false },
                      { label: 'अगला चरण', value: nextStageVal.split('(')[0].trim(), isImportant: false }
                    ];
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3.5 border-t border-[#10b981]/50 text-xs">
                        {resultSnapshot.map((d, idx) => (
                          <div 
                            key={idx} 
                            className={`rounded-xl p-2.5 text-center border transition-all ${d.isImportant ? 'bg-[#3b1200] border-[#f59e0b] ring-1 ring-amber-400/40 shadow-sm' : 'bg-[#02261e] border-[#10b981]/50'}`}
                          >
                            <span 
                              className="text-[11px] uppercase font-bold block"
                              style={{ color: d.isImportant ? '#fde047' : '#a7f3d0' }}
                            >
                              {d.label}
                            </span>
                            <span 
                              className="font-extrabold text-xs sm:text-sm mt-0.5 block break-words"
                              style={{ color: d.isImportant ? '#fde047' : '#ffffff' }}
                            >
                              {d.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })() : !isFlexCategory && (() => {
                    const rawDates = [
                      { label: 'नोटिफिकेशन तिथि', value: notificationDateDisplay, isImportant: false },
                      { label: 'आवेदन शुरू', value: applyStartDateDisplay, isImportant: false },
                      { label: 'अंतिम तिथि', value: applyLastDateDisplay, isImportant: true },
                      { label: 'एडमिट कार्ड', value: admitCardDateDisplay, isImportant: false }
                    ];

                    const datesToShow = rawDates.filter(d => {
                      if (!isFlexCategory) return true;
                      return d.value && d.value !== 'शीघ्र' && d.value !== 'यथासमय घोषित' && d.value !== 'परीक्षा से 7 दिन पूर्व' && d.value.trim() !== '';
                    });

                    if (datesToShow.length === 0) return null;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3.5 border-t border-[#10b981]/50 text-xs">
                        {datesToShow.map((d, idx) => (
                          <div 
                            key={idx} 
                            className={`rounded-xl p-2.5 text-center border transition-all ${d.isImportant ? 'bg-[#3b1200] border-[#f59e0b] ring-1 ring-amber-400/40 shadow-sm' : 'bg-[#02261e] border-[#10b981]/50'}`}
                          >
                            <span 
                              className={`text-[11px] uppercase font-bold block`}
                              style={{ color: d.isImportant ? '#fde047' : '#a7f3d0' }}
                            >
                              {d.label}
                            </span>
                            <span 
                              className={`font-extrabold text-xs sm:text-sm mt-0.5 block`}
                              style={{ color: d.isImportant ? '#fde047' : '#ffffff' }}
                            >
                              {d.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Entry Content Body */}
              <div 
                className="entry-content space-y-6 text-[#334155]"
                style={{
                  fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '12pt',
                  lineHeight: 1.75
                }}
              >
                {/* Small Normal WhatsApp Alert & Join Bar right above संक्षिप्त विवरण */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 sm:px-3.5 bg-emerald-50/90 border border-emerald-200/80 rounded-lg text-xs min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 min-w-0">
                    <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                    <span className="text-xs sm:text-sm break-words">
                      {isYojana
                        ? (isHi ? 'सरकारी योजनाओं का ताज़ा अपडेट सीधे WhatsApp पर पाएं:' : 'Get instant Sarkari Yojana updates on WhatsApp:')
                        : (isHi ? 'भर्ती का ताज़ा अपडेट सीधे WhatsApp पर पाएं:' : 'Get instant recruitment updates on WhatsApp:')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                    <a
                      href="https://whatsapp.com/channel/0029VbEOVh74dTnTUUmjcS0j"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-md shadow-2xs transition cursor-pointer active:scale-95 shrink-0"
                      title="आधिकारिक WhatsApp चैनल से जुड़ें"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
                      <span>{isHi ? 'WhatsApp चैनल जुड़ें' : 'Join Channel'}</span>
                    </a>
                    <a
                      href={getWhatsAppShareUrl(editablePost)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-md shadow-2xs transition cursor-pointer active:scale-95 shrink-0"
                      title={`WhatsApp पर शेयर करें (${SHARE_BASE_URL})`}
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#15803d]" />
                      <span>{isHi ? 'WhatsApp शेयर' : 'WhatsApp'}</span>
                    </a>
                    <a
                      href={getTelegramShareUrl(editablePost)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold text-xs rounded-md shadow-2xs transition cursor-pointer active:scale-95 shrink-0"
                      title="Telegram पर शेयर करें"
                    >
                      <Share2 className="w-3.5 h-3.5 text-white" />
                      <span>{isHi ? 'Telegram' : 'Telegram'}</span>
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await copyTextToClipboard(getVacancyShareUrl(editablePost.id));
                        if (ok) {
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs rounded-md shadow-2xs transition cursor-pointer shrink-0"
                      title="पोस्ट का शेयर लिंक कॉपी करें"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? (isHi ? 'कॉपी हुआ' : 'Copied') : (isHi ? 'लिंक कॉपी' : 'Copy Link')}</span>
                    </button>
                  </div>
                </div>

                {/* Opening Lead Paragraphs */}
                <div className="space-y-3">
                  <p className="post-item">
                    <strong>{postTitle}:</strong>{' '}
                    <DisplayField
                      value={
                        isYojana
                          ? (editablePost.briefSummaryHi || editablePost.yojanaGeneralInfo?.descriptionHi || `${editablePost.departmentHi || editablePost.organization || 'राजस्थान सरकार'} द्वारा ${shortJobName} के अंतर्गत पात्र नागरिकों को आर्थिक व कल्याणकारी सहायता प्रदान की जा रही है।`)
                          : isAdmitCardPost
                          ? (editablePost.briefSummaryHi || `${editablePost.departmentHi || editablePost.organization} द्वारा ${shortJobName} परीक्षा के प्रवेश पत्र (Admit Card) जारी किए गए हैं। परीक्षा में सम्मिलित होने वाले सभी अभ्यर्थी आधिकारिक पोर्टल से अपना ई-एडमिट कार्ड डाउनलोड कर सकते हैं।`)
                          : isResultPost
                          ? (editablePost.briefSummaryHi || `${editablePost.departmentHi || editablePost.organization} द्वारा ${shortJobName} (${editablePost.totalPosts || 'विभिन्न पद'}) का आधिकारिक परिणाम जारी कर दिया गया है।`)
                          : (editablePost.briefSummaryHi || `${editablePost.organization} द्वारा आधिकारिक नोटिफिकेशन जारी कर दिया गया है। इसके अंतर्गत कुल ${editablePost.totalPosts || 'विभिन्न'} पदों पर भर्ती हेतु योग्य अभ्यर्थियों से ऑनलाइन आवेदन आमंत्रित किए गए हैं।`)
                      }
                    />
                  </p>
                  <p className="post-item">
                    {isYojana
                      ? (isHi
                          ? `इस सरकारी योजना की ताज़ा अधिसूचना ${notificationDateDisplay} को अपडेट की गई है। योजना के तहत आवेदन ${applyStartDateDisplay} से शुरू हो चुके हैं और पात्र लाभार्थी ${applyLastDateDisplay} तक ${editablePost.yojanaOverview?.applyMode || editablePost.applicationMode || 'ऑनलाइन पोर्टल / E-Mitra'} के माध्यम से आवेदन कर सकते हैं। योजना का उद्देश्य, मुख्य लाभ, पात्रता शर्तें, आय सीमा, आवश्यक दस्तावेज व आवेदन प्रक्रिया की संपूर्ण जानकारी नीचे दी गई है।`
                          : `Updated on ${notificationDateDisplay}, applications under this government scheme are open from ${applyStartDateDisplay} to ${applyLastDateDisplay} via ${editablePost.yojanaOverview?.applyMode || 'official online portal / E-Mitra'}. Check scheme benefits, eligibility criteria, required documents, and step-by-step application details below.`)
                      : isAdmitCardPost
                      ? (isHi
                          ? `इस परीक्षा के लिए एडमिट कार्ड ${admitCardDateDisplay} से आधिकारिक पोर्टल पर उपलब्ध हैं तथा परीक्षा का आयोजन ${examDateDisplay} को निर्धारित परीक्षा केंद्रों पर किया जाएगा। एडमिट कार्ड डाउनलोड करने की स्टेप-बाय-स्टेप प्रक्रिया, परीक्षा का समय, रिपोर्टिंग टाइम, परीक्षा केंद्र पर ले जाने वाले दस्तावेज एवं महत्वपूर्ण डायरेक्ट लिंक नीचे दिए गए हैं।`
                          : `Admit cards are available from ${admitCardDateDisplay} on the official portal, and the examination will be conducted on ${examDateDisplay}. Check complete exam timings, download procedure, reporting rules, documents to carry, and direct links below.`)
                      : isResultPost
                      ? (() => {
                          const portalHost = editablePost.officialLinks?.officialWebsiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'आधिकारिक पोर्टल';
                          const orgDisplay = editablePost.departmentHi || editablePost.department || editablePost.organization;
                          const nextStageText = Array.isArray(editablePost.selectionProcessHi) && editablePost.selectionProcessHi.length > 0
                            ? editablePost.selectionProcessHi.join(' → ')
                            : 'दस्तावेज सत्यापन एवं अंतिम चयन';
                          return isHi
                            ? `${orgDisplay} द्वारा ${shortJobName} का आधिकारिक परिणाम ${notificationDateDisplay} को ${portalHost} पर घोषित किया गया है।${editablePost.descriptionHi ? ` ${editablePost.descriptionHi}` : ''} इस भर्ती के अगले चयन चरण (${nextStageText}), श्रेणीवार कट-ऑफ अंक, रिजल्ट चेक करने की प्रक्रिया एवं डायरेक्ट डाउनलोड लिंक इस पोस्ट के विवरण अनुसार नीचे दिए गए हैं।`
                            : `${orgDisplay} declared ${shortJobName} on ${notificationDateDisplay} via ${portalHost}. Check post-specific cut-off details, next selection stage (${nextStageText}), step-by-step checking instructions, and official links below.`;
                        })()
                      : (isHi 
                          ? `इस भर्ती के लिए आधिकारिक अधिसूचना ${notificationDateDisplay} को जारी की गई थी और ऑनलाइन आवेदन ${applyStartDateDisplay} से प्रारंभ हो चुके हैं। इच्छुक व पात्र अभ्यर्थी निर्धारित अंतिम तिथि ${applyLastDateDisplay} तक आधिकारिक पोर्टल पर जाकर ऑनलाइन आवेदन कर सकते हैं। भर्ती के एडमिट कार्ड ${admitCardDateDisplay} को जारी होंगे तथा परीक्षा ${examDateDisplay} को आयोजित की जाएगी। भर्ती से संबंधित विस्तृत विवरण जैसे शैक्षणिक योग्यता, आयु सीमा, आवेदन शुल्क, चयन प्रक्रिया और महत्वपूर्ण तिथियां नीचे दी गई हैं।`
                          : `Official notification was released on ${notificationDateDisplay} and online applications began on ${applyStartDateDisplay}. The last date to submit the application form is ${applyLastDateDisplay}. Admit cards will be released on ${admitCardDateDisplay} and examination will be conducted on ${examDateDisplay}. Check the detailed overview, eligibility criteria, application fee, and direct links below.`)}
                  </p>
                </div>

                {/* Top In-Article Ad Section */}
                <AdSlotWrapper
                  height={130}
                  className="my-4"
                  ariaLabel={isHi ? 'विज्ञापन (Advertisement)' : 'Advertisement'}
                  skeletonLabel={isHi ? 'विज्ञापन (Advertisement)' : 'Advertisement'}
                >
                  <AdSection 
                    slot="3785509362"
                    client="ca-pub-3176571184961509"
                    label={isHi ? 'विज्ञापन (Advertisement)' : 'Advertisement'}
                    minHeight={90}
                    embedded
                  />
                </AdSlotWrapper>

                {/* Dynamic Reorderable Sections List */}
                {activeSectionKeys.map((sectionKey) => {
                  const key = sectionKey === 'fee' ? 'application_fee' : sectionKey === 'salary' ? 'salary_table' : sectionKey;

                  switch (key) {
                    case 'result_overview': {
                      const portalHost =
                        editablePost.officialLinks?.officialWebsiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') ||
                        'आधिकारिक पोर्टल';
                      const isPlaceholder = (val: string | undefined, placeholders: string[]) => {
                        if (!val || !val.trim()) return true;
                        return placeholders.some((p) => val.trim().toLowerCase() === p.toLowerCase());
                      };
                      const selectionSummary =
                        Array.isArray(editablePost.selectionProcessHi) && editablePost.selectionProcessHi.length > 0
                          ? editablePost.selectionProcessHi.join(' → ')
                          : '';
                      const resultOverviewRows = [
                        {
                          label: 'भर्ती / परीक्षा परिणाम का नाम',
                          val: editablePost.postNameHi || editablePost.postName || shortJobName,
                          isEdit: true,
                          keyName: 'postNameHi',
                          show: true
                        },
                        {
                          label: 'आयोजक संस्था / भर्ती बोर्ड',
                          val: editablePost.departmentHi || editablePost.department || editablePost.organization,
                          isEdit: true,
                          keyName: 'departmentHi',
                          show: true
                        },
                        {
                          label: 'विज्ञापन / संदर्भ संख्या',
                          val: editablePost.advtNo || '',
                          isEdit: true,
                          keyName: 'advtNo',
                          show: !isPlaceholder(editablePost.advtNo, ['विज्ञप्ति अनुसार', 'official notice 2026'])
                        },
                        {
                          label: 'घोषित कुल पद',
                          val: String(editablePost.totalPosts || ''),
                          isEdit: true,
                          keyName: 'totalPosts',
                          show: !isPlaceholder(String(editablePost.totalPosts || ''), ['विभिन्न पद', 'विभिन्न', 'various posts'])
                        },
                        {
                          label: 'परिणाम स्थिति (Result Status)',
                          val: editablePost.status === 'result_declared' ? 'आधिकारिक परिणाम घोषित (Result Declared)' : 'परिणाम अपडेट जारी',
                          isEdit: false,
                          show: true
                        },
                        {
                          label: 'परिणाम जारी तिथि (Declared Date)',
                          val: notificationDateDisplay,
                          isEdit: false,
                          show: !isPlaceholder(notificationDateDisplay, ['शीघ्र', 'यथासमय घोषित'])
                        },
                        {
                          label: 'निर्धारित शैक्षणिक योग्यता',
                          val: editablePost.qualificationDetailsHi || editablePost.qualificationDetails || '',
                          isEdit: true,
                          keyName: 'qualificationDetailsHi',
                          show: !isPlaceholder(editablePost.qualificationDetailsHi || editablePost.qualificationDetails, ['आधिकारिक नोटिफिकेशन देखें।', 'refer to official notification.'])
                        },
                        {
                          label: 'वेतनमान (Pay Scale)',
                          val: editablePost.salaryHi || editablePost.salary || '',
                          isEdit: true,
                          keyName: 'salaryHi',
                          show: !isPlaceholder(editablePost.salaryHi || editablePost.salary, ['नियमानुसार वेतनमान देय', 'as per govt pay matrix'])
                        },
                        {
                          label: 'चयन प्रक्रिया / अगला चरण',
                          val: selectionSummary,
                          isEdit: false,
                          show: Boolean(selectionSummary)
                        },
                        {
                          label: 'कार्यक्षेत्र / स्थान',
                          val: editablePost.jobLocation || '',
                          isEdit: true,
                          keyName: 'jobLocation',
                          show: Boolean(editablePost.jobLocation && editablePost.jobLocation.trim())
                        }
                      ].filter((r) => r.show);

                      return (
                        <div key="result_overview">
                          <div className="flex items-center justify-between gap-2 mb-2 pt-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('result_overview', `${shortJobName} संक्षिप्त विवरण (Result Overview)`)}
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                            <a
                              href={getWhatsAppShareUrl(editablePost)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded shadow-2xs transition cursor-pointer active:scale-95"
                              title="WhatsApp पर रिजल्ट विवरण शेयर करें"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
                              <span>शेयर करें</span>
                            </a>
                          </div>
                          <div className="wp-block-table overflow-x-auto border border-slate-300 bg-white rounded-md">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '12pt' }}>
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-300">
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200 w-1/3">भर्ती विवरण</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800">जानकारी</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {resultOverviewRows.map((row, idx) => (
                                  <tr key={idx} className="border-b border-slate-200 last:border-b-0">
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200 w-1/3">
                                      {row.label}
                                    </td>
                                    <td className="p-2.5 sm:p-3 text-slate-700 bg-white font-semibold">
                                      <span>{row.val}</span>
                                    </td>
                                  </tr>
                                ))}
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">
                                    आधिकारिक वेबसाइट / रिजल्ट पोर्टल
                                  </td>
                                  <td className="p-2.5 sm:p-3 bg-white">
                                    <a
                                      href={editablePost.officialLinks?.resultPdfUrl || editablePost.officialLinks?.officialWebsiteUrl || 'https://rajasthan.gov.in'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline font-semibold inline-flex items-center gap-1"
                                    >
                                      <span>{portalHost}</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    }

                    case 'overview': {
                      if (isSectionDeleted('overview')) return null;

                      const isPlaceholder = (val: string | undefined, placeholders: string[]) => {
                        if (!val || !val.trim()) return true;
                        return placeholders.some(p => val.trim().toLowerCase() === p.toLowerCase());
                      };

                      const defaultOverviewRows = isYojana
                        ? [
                            { label: 'योजना का नाम', val: editablePost.yojanaOverview?.yojanaName || editablePost.postNameHi || editablePost.shortTitleHi || shortJobName, isEdit: true, keyName: 'postNameHi' },
                            { label: 'संबंधित विभाग / मंत्रालय', val: editablePost.yojanaOverview?.department || editablePost.departmentHi || editablePost.department || editablePost.organization, isEdit: true, keyName: 'departmentHi' },
                            { label: 'राज्य / क्षेत्र', val: editablePost.yojanaOverview?.state || editablePost.jobLocation || 'राजस्थान', isEdit: true, keyName: 'jobLocation' },
                            {
                              label: 'लाभार्थी वर्ग (Beneficiaries)',
                              val: editablePost.yojanaOverview?.beneficiaries || editablePost.yojanaOverview?.totalBeneficiariesCount || editablePost.totalPosts || 'पात्र नागरिक / लाभार्थी',
                              isEdit: true,
                              keyName: 'totalPosts',
                              show: !isPlaceholder(String(editablePost.yojanaOverview?.beneficiaries || editablePost.totalPosts || ''), ['विभिन्न पद'])
                            },
                            {
                              label: 'मुख्य लाभ / सहायता राशि',
                              val: editablePost.yojanaOverview?.maxAnnualAssistance || editablePost.yojanaOverview?.monthlyAssistance || editablePost.salaryHi || editablePost.salary || 'योजना नियमानुसार देय',
                              isEdit: true,
                              keyName: 'salaryHi'
                            },
                            {
                              label: 'योजना अपडेट तिथि',
                              val: resolvedDates.notificationDate,
                              isDate: true,
                              dateKey: 'notificationDate',
                              show: !isPlaceholder(resolvedDates.notificationDate, ['शीघ्र', 'यथासमय घोषित'])
                            },
                            {
                              label: 'आवेदन प्रारंभ तिथि',
                              val: resolvedDates.applyStartDate,
                              isDate: true,
                              dateKey: 'applyStartDate',
                              show: !isPlaceholder(resolvedDates.applyStartDate, ['शीघ्र', 'यथासमय घोषित'])
                            },
                            {
                              label: 'आवेदन की अंतिम तिथि',
                              val: resolvedDates.applyLastDate,
                              isDate: true,
                              dateKey: 'applyLastDate',
                              show: !isPlaceholder(resolvedDates.applyLastDate, ['शीघ्र', 'यथासमय घोषित'])
                            },
                            {
                              label: 'आवेदन का माध्यम',
                              val: editablePost.yojanaOverview?.applyMode || editablePost.applicationMode || (isRajasthanRelatedPost(editablePost) ? 'ऑनलाइन (SSO पोर्टल / आधिकारिक वेबसाइट / E-Mitra)' : 'ऑनलाइन (आधिकारिक वेबसाइट / पोर्टल)'),
                              isEdit: true,
                              keyName: 'applicationMode'
                            },
                            ...(editablePost.yojanaOverview?.paymentMode
                              ? [{ label: 'लाभ वितरण प्रक्रिया (Payment Mode)', val: editablePost.yojanaOverview.paymentMode, isEdit: false }]
                              : []),
                            {
                              label: 'पात्रता सारांश',
                              val: editablePost.qualificationDetailsHi || editablePost.qualificationDetails || 'राजस्थान मूल निवासी एवं योजना नियमानुसार पात्र',
                              isEdit: true,
                              keyName: 'qualificationDetailsHi'
                            }
                          ].filter(r => r.show !== false)
                        : [
                            { label: 'भर्ती / योजना संस्था', val: editablePost.department || editablePost.organization, isEdit: true, keyName: 'department' },
                            { label: 'नाम / शीर्षक', val: editablePost.shortTitleHi || editablePost.shortTitle || shortJobName, isEdit: true, keyName: 'shortTitleHi' },
                            { 
                              label: 'विज्ञापन संख्या', 
                              val: editablePost.advtNo || 'विज्ञप्ति अनुसार', 
                              isEdit: true, 
                              keyName: 'advtNo',
                              show: !isFlexCategory || !isPlaceholder(editablePost.advtNo, ['विज्ञप्ति अनुसार', 'शीघ्र', 'यथासमय घोषित'])
                            },
                            { 
                              label: 'घोषित कुल पद / सीटें', 
                              val: editablePost.totalPosts || 'विभिन्न पद', 
                              isEdit: true, 
                              keyName: 'totalPosts',
                              show: !isFlexCategory || !isPlaceholder(String(editablePost.totalPosts || ''), ['विभिन्न पद', 'विभिन्न'])
                            },
                            { 
                              label: 'नोटिफिकेशन तिथि', 
                              val: resolvedDates.notificationDate, 
                              isDate: true, 
                              dateKey: 'notificationDate',
                              show: !isFlexCategory || !isPlaceholder(resolvedDates.notificationDate, ['शीघ्र', 'यथासमय घोषित', 'परीक्षा से 7 दिन पूर्व'])
                            },
                            { 
                              label: 'आवेदन शुरू', 
                              val: resolvedDates.applyStartDate, 
                              isDate: true, 
                              dateKey: 'applyStartDate',
                              show: !isFlexCategory || !isPlaceholder(resolvedDates.applyStartDate, ['शीघ्र', 'यथासमय घोषित'])
                            },
                            { 
                              label: isOfflinePost ? 'ऑफलाइन आवेदन की अंतिम तिथि' : 'ऑनलाइन आवेदन की अंतिम तिथि', 
                              val: resolvedDates.applyLastDate, 
                              isDate: true, 
                              dateKey: 'applyLastDate',
                              show: !isFlexCategory || !isPlaceholder(resolvedDates.applyLastDate, ['शीघ्र', 'यथासमय घोषित'])
                            },
                            { 
                              label: 'फीस भुगतान अंतिम तिथि', 
                              val: resolvedDates.feeLastDate, 
                              isDate: true, 
                              dateKey: 'feeLastDate',
                              show: !isFlexCategory || !isPlaceholder(resolvedDates.feeLastDate, ['शीघ्र', 'यथासमय घोषित'])
                            },
                            { 
                              label: 'एडमिट कार्ड जारी तिथि', 
                              val: resolvedDates.admitCardDate, 
                              isDate: true, 
                              dateKey: 'admitCardDate',
                              show: !isFlexCategory || !isPlaceholder(resolvedDates.admitCardDate, ['शीघ्र', 'यथासमय घोषित', 'परीक्षा से 7 दिन पूर्व'])
                            },
                            { 
                              label: 'परीक्षा तिथि', 
                              val: resolvedDates.examDate, 
                              isDate: true, 
                              dateKey: 'examDate',
                              show: !isFlexCategory || !isPlaceholder(resolvedDates.examDate, ['शीघ्र', 'यथासमय घोषित'])
                            },
                            { 
                              label: 'आवेदन का माध्यम', 
                              val: editablePost.applicationMode || (isOfflinePost ? 'ऑफलाइन (Speed Post / Registered Post)' : 'ऑनलाइन (Online Portal)'), 
                              isEdit: true,
                              keyName: 'applicationMode',
                              show: !isFlexCategory 
                            },
                            { 
                              label: 'स्थान / कार्यक्षेत्र', 
                              val: editablePost.jobLocation, 
                              isEdit: true, 
                              keyName: 'jobLocation',
                              show: Boolean(editablePost.jobLocation && editablePost.jobLocation.trim()) 
                            },
                            { 
                              label: 'शैक्षणिक योग्यता / पात्रता', 
                              val: editablePost.qualificationDetailsHi || editablePost.qualificationDetails || 'पद अनुसार 10वीं / 12वीं / स्नातक / ITI पास', 
                              isEdit: true, 
                              keyName: 'qualificationDetailsHi',
                              show: !isFlexCategory || !isPlaceholder(editablePost.qualificationDetailsHi || editablePost.qualificationDetails, ['पद अनुसार 10वीं / 12वीं / स्नातक / ITI पास', 'पद अनुसार 10वीं / 12वीं / स्नातक अथवा संबंधित विषय में आवश्यक डिग्री/डिप्लोमा।'])
                            },
                            { 
                              label: 'स्टाइपेंड / वित्तीय सहायता / वेतनमान', 
                              val: editablePost.salaryHi || editablePost.salary || 'पे-मैट्रिक्स नियमानुसार देय', 
                              isEdit: true, 
                              keyName: 'salaryHi',
                              show: !isFlexCategory || !isPlaceholder(editablePost.salaryHi || editablePost.salary, ['पे-मैट्रिक्स नियमानुसार देय'])
                            }
                          ].filter(r => r.show !== false);

                      const admitCardOverviewRows = [
                        { label: 'परीक्षा का नाम (Exam Name)', val: editablePost.postNameHi || editablePost.postName || shortJobName, isEdit: true, keyName: 'postNameHi' },
                        { label: 'आयोजक संस्था (Conducting Body)', val: editablePost.departmentHi || editablePost.department || editablePost.organization, isEdit: true, keyName: 'departmentHi' },
                        { label: 'एडमिट कार्ड स्थिति (Status)', val: editablePost.status === 'admit_card_out' ? 'एडमिट कार्ड जारी (Released)' : `जारी तिथि: ${admitCardDateDisplay}`, isEdit: false },
                        { label: 'एडमिट कार्ड जारी तिथि (Admit Card Date)', val: resolvedDates.admitCardDate, isDate: true, dateKey: 'admitCardDate' },
                        { label: 'परीक्षा तिथि (Exam Date)', val: resolvedDates.examDate, isDate: true, dateKey: 'examDate' },
                        { label: 'परीक्षा अवधि / समय (Exam Duration)', val: editablePost.examPattern?.durationHi || 'प्रवेश पत्र पर अंकित शिफ्ट समय अनुसार', isEdit: false },
                        { label: 'डाउनलोड माध्यम (Download Mode)', val: admitTitles.isSso ? 'ऑनलाइन (SSO पोर्टल / आधिकारिक वेबसाइट)' : 'ऑनलाइन (आधिकारिक वेबसाइट)', isEdit: false },
                        { label: 'परीक्षा स्थान (Exam Centres)', val: editablePost.jobLocation || 'निर्धारित परीक्षा केंद्र', isEdit: true, keyName: 'jobLocation' },
                        { label: 'आवश्यक लॉगिन विवरण (Credentials)', val: admitTitles.isSso ? 'SSO ID व पासवर्ड / Application No. व जन्मतिथि' : 'रजिस्ट्रेशन नंबर / रोल नंबर व पासवर्ड/जन्मतिथि', isEdit: false }
                      ];

                      const activeDefaultOverviewRows = isAdmitCardPost ? admitCardOverviewRows : defaultOverviewRows;
                      const hasSavedAdmitOverview =
                        Array.isArray(editablePost.overviewRows) &&
                        editablePost.overviewRows.length > 0 &&
                        (!isAdmitCardPost || editablePost.overviewRows.some((r: any) => String(r?.label || '').includes('एडमिट कार्ड स्थिति') || String(r?.label || '').includes('आयोजक संस्था')));

                      const overviewRows = hasSavedAdmitOverview
                        ? editablePost.overviewRows!
                        : activeDefaultOverviewRows;

                      return (
                        <div key="overview">
                          <div className="flex items-center justify-between gap-2 mb-2 pt-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('overview', isAdmitCardPost ? admitTitles.overview : `${shortJobName} का संक्षिप्त विवरण`)}
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                            <div className="flex items-center gap-1.5">
                              <a
                                href={getWhatsAppShareUrl(editablePost)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded shadow-2xs transition cursor-pointer active:scale-95"
                                title="WhatsApp पर संक्षिप्त विवरण शेयर करें"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
                                <span>शेयर करें</span>
                              </a>
                            </div>
                          </div>
                          <div className="wp-block-table overflow-x-auto border border-slate-300 bg-white rounded-md">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '12pt' }}>
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-300">
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200 w-1/3">विवरण</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800">जानकारी</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {overviewRows.map((row: any, idx: number) => (
                                  <tr key={idx} className="border-b border-slate-200 last:border-b-0">
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200 w-1/3">
                                      <DisplayField value={row.label} />
                                    </td>
                                    <td className="p-2.5 sm:p-3 text-slate-700 bg-white font-semibold">
                                      <DisplayField
                                        value={row.val as string}
                                        isDate={Boolean(row.isDate)}
                                      />
                                    </td>
                                  </tr>
                                ))}
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">आधिकारिक वेबसाइट / पोर्टल</td>
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
                    }

                    case 'admit_released': {
                      if (!isAdmitCardPost || isSectionDeleted('admit_released')) return null;
                      const portalHost = editablePost.officialLinks?.officialWebsiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || (admitTitles.isSso ? 'sso.rajasthan.gov.in' : 'आधिकारिक वेबसाइट');
                      const downloadUrl = editablePost.officialLinks?.admitCardUrl || editablePost.officialLinks?.officialWebsiteUrl || (admitTitles.isSso ? 'https://sso.rajasthan.gov.in/' : 'https://rajasthan.gov.in');
                      return (
                        <div key="admit_released" className="space-y-3 pt-2">
                          <div className="flex items-center justify-between gap-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('admit_released', admitTitles.admitReleased)}
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                          </div>
                          <p className="post-item text-slate-800" style={{ fontSize: '12pt' }}>
                            {editablePost.departmentHi || editablePost.organization} द्वारा <strong>{editablePost.postNameHi || editablePost.postName || shortJobName}</strong> परीक्षा के ई-एडमिट कार्ड (Admit Card / Hall Ticket) आधिकारिक पोर्टल पर जारी किए गए हैं। सभी पंजीकृत अभ्यर्थी <strong>{admitCardDateDisplay}</strong> से अपने लॉगिन विवरण (
                            {admitTitles.isSso ? 'SSO ID व पासवर्ड या Application Number व जन्मतिथि' : 'रजिस्ट्रेशन नंबर व पासवर्ड/जन्मतिथि'}
                            ) के माध्यम से अपना प्रवेश पत्र ऑनलाइन डाउनलोड कर सकते हैं।
                          </p>
                          {editablePost.descriptionHi && (
                            <p className="post-item text-slate-700" style={{ fontSize: '12pt' }}>
                              <DisplayField
                                value={editablePost.descriptionHi}
                                as="span"
                              />
                            </p>
                          )}
                          <div className="p-3 sm:p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="text-xs sm:text-sm text-emerald-950 font-semibold space-y-0.5">
                              <div>अधिकृत पोर्टल: <span className="font-bold">{portalHost}</span></div>
                              <div>परीक्षा तिथि: <span className="font-bold">{examDateDisplay}</span></div>
                            </div>
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#046c4e] hover:bg-[#03543f] text-white font-bold text-xs sm:text-sm rounded-md shadow-2xs transition shrink-0"
                            >
                              <span>एडमिट कार्ड डाउनलोड करें</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          {getSectionTable('admit_released') && renderCustomTableComponent(getSectionTable('admit_released')!)}
                        </div>
                      );
                    }

                    case 'admit_exam_time': {
                      if (!isAdmitCardPost || isSectionDeleted('admit_exam_time')) return null;
                      return (
                        <div key="admit_exam_time" className="space-y-3 pt-2">
                          <div className="flex items-center justify-between gap-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('admit_exam_time', admitTitles.examTime)}
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                          </div>
                          <p className="post-item text-slate-800" style={{ fontSize: '12pt' }}>
                            <strong>{editablePost.departmentHi || editablePost.organization}</strong> द्वारा {editablePost.postNameHi || shortJobName} परीक्षा का आयोजन <strong>{examDateDisplay}</strong> को निर्धारित परीक्षा केंद्रों पर ({editablePost.examPattern?.examModeHi || 'निर्धारित परीक्षा प्रणाली अनुसार'}) किया जाएगा। परीक्षा की शिफ्ट एवं समय का विवरण नीचे तालिका में देखें:
                          </p>
                          <div className="wp-block-table overflow-x-auto border border-slate-300 bg-white rounded-md">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '12pt' }}>
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-300">
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200">पारी / विवरण (Shift / Details)</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800">निर्धारित समय / तिथि</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">परीक्षा तिथि (Exam Date)</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">{examDateDisplay}</td>
                                </tr>
                                {admitTitles.isCet12th ? (
                                  <>
                                    <tr>
                                      <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">प्रथम पारी (Shift-I Morning)</td>
                                      <td className="p-2.5 sm:p-3 font-semibold text-slate-700 bg-white">सुबह 09:00 AM से दोपहर 12:00 PM तक</td>
                                    </tr>
                                    <tr>
                                      <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">द्वितीय पारी (Shift-II Evening)</td>
                                      <td className="p-2.5 sm:p-3 font-semibold text-slate-700 bg-white">दोपहर 03:00 PM से शाम 06:00 PM तक</td>
                                    </tr>
                                  </>
                                ) : (
                                  <tr>
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">परीक्षा समय व अवधि (Shift Timing)</td>
                                    <td className="p-2.5 sm:p-3 font-semibold text-slate-700 bg-white">
                                      {editablePost.examPattern?.durationHi || 'अभ्यर्थी के एडमिट कार्ड पर अंकित पारी समय अनुसार'}
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 bg-white border-r border-slate-200">परीक्षा केंद्र पर रिपोर्टिंग समय</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-700 bg-white">परीक्षा शुरू होने से 90 मिनट (1.5 घंटे) पूर्व</td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 font-bold text-rose-700 bg-white border-r border-slate-200">गेट बंद होने का समय (Gate Closing)</td>
                                  <td className="p-2.5 sm:p-3 font-bold text-rose-700 bg-white">परीक्षा प्रारंभ होने से ठीक 1 घंटे (60 मिनट) पूर्व</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          {getSectionTable('admit_exam_time') && renderCustomTableComponent(getSectionTable('admit_exam_time')!)}
                        </div>
                      );
                    }

                    case 'admit_how_to_download': {
                      return null;
                    }

                    case 'admit_sso_download': {
                      if (!isAdmitCardPost || isSectionDeleted('admit_sso_download')) return null;
                      const portalHost = editablePost.officialLinks?.officialWebsiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'आधिकारिक वेबसाइट';
                      return (
                        <div key="admit_sso_download" className="space-y-3 pt-2">
                          <div className="flex items-center justify-between gap-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('admit_sso_download', admitTitles.ssoDownload)}
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                          </div>
                          {admitTitles.isSso ? (
                            <div className="p-3.5 sm:p-4 rounded-md border border-slate-300 bg-white space-y-2.5">
                              <p className="post-item text-slate-800" style={{ fontSize: '12pt' }}>
                                राजस्थान में आयोजित होने वाली परीक्षाओं का एडमिट कार्ड सीधे <strong>SSO ID (sso.rajasthan.gov.in)</strong> से डाउनलोड करना सबसे आसान तरीका है:
                              </p>
                              <ol className="list-decimal pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '12pt' }}>
                                <li>सबसे पहले राजस्थान सिंगल साइन ऑन पोर्टल <strong>sso.rajasthan.gov.in</strong> ओपन करें।</li>
                                <li>अपनी <strong>SSO ID (Digital Identity)</strong>, पासवर्ड और कैप्चा कोड दर्ज कर लॉगिन करें।</li>
                                <li>डैशबोर्ड पर <strong>&ldquo;Citizen Apps (G2C)&rdquo;</strong> में जाकर <strong>&ldquo;Recruitment Portal&rdquo;</strong> आइकन पर क्लिक करें।</li>
                                <li>रिक्रूटमेंट पोर्टल खुलने के बाद ऊपर मेनू बार में <strong>&ldquo;Get Admit Card&rdquo;</strong> विकल्प पर क्लिक करें।</li>
                                <li>अब सूची में अपनी परीक्षा ({editablePost.shortTitle || shortJobName}) के सामने दिए गए <strong>&ldquo;Get Admit Card&rdquo;</strong> बटन पर क्लिक करें और PDF डाउनलोड करें।</li>
                              </ol>
                            </div>
                          ) : (
                            <div className="p-3.5 sm:p-4 rounded-md border border-slate-300 bg-white space-y-2.5">
                              <p className="post-item text-slate-800" style={{ fontSize: '12pt' }}>
                                अभ्यर्थी <strong>{portalHost}</strong> पर अपने रजिस्ट्रेशन विवरण के माध्यम से सीधे एडमिट कार्ड / कॉल लेटर प्राप्त कर सकते हैं:
                              </p>
                              <ol className="list-decimal pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '12pt' }}>
                                <li>आधिकारिक पोर्टल <strong>{portalHost}</strong> पर जाकर Call Letter / Admit Card लॉगिन पेज खोलें।</li>
                                <li>अपनी भाषा (Hindi / English) चुनें और <strong>Registration Number / Roll Number</strong> दर्ज करें।</li>
                                <li>पासवर्ड अथवा अपनी <strong>Date of Birth (DD-MM-YY)</strong> तथा स्क्रीन पर दिख रहा कैप्चा कोड भरें।</li>
                                <li><strong>Login</strong> बटन पर क्लिक करें और प्रदर्शित एडमिट कार्ड का प्रिंटआउट प्राप्त करें।</li>
                              </ol>
                            </div>
                          )}
                          {getSectionTable('admit_sso_download') && renderCustomTableComponent(getSectionTable('admit_sso_download')!)}
                        </div>
                      );
                    }

                    case 'admit_reporting_time': {
                      if (!isAdmitCardPost || isSectionDeleted('admit_reporting_time')) return null;
                      return (
                        <div key="admit_reporting_time" className="space-y-3 pt-2">
                          <div className="flex items-center justify-between gap-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('admit_reporting_time', admitTitles.reportingTime)}
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                          </div>
                          <div className="p-3.5 sm:p-4 rounded-md border border-amber-300 bg-amber-50/70 space-y-2 text-slate-800" style={{ fontSize: '12pt' }}>
                            <p className="post-item font-semibold text-amber-950">
                              परीक्षा केंद्र पर प्रवेश और सुरक्षा जांच संबंधी समय-सीमा का सख्ती से पालन करें:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                              <li><strong>रिपोर्टिंग समय (Reporting Time):</strong> अभ्यर्थियों को परीक्षा प्रारंभ होने से कम से कम <strong>90 से 120 मिनट (1.5 से 2 घंटे) पूर्व</strong> परीक्षा केंद्र पर पहुँचना अनिवार्य है।</li>
                              <li><strong>मुख्य द्वार बंद होने का समय (Gate Closing):</strong> परीक्षा शुरू होने से ठीक <strong>1 घंटे (60 मिनट) पहले</strong> परीक्षा केंद्र का मुख्य गेट बंद कर दिया जाएगा। इसके बाद किसी भी परिस्थिति में प्रवेश नहीं मिलेगा।</li>
                              <li><strong>सत्यापन प्रक्रिया:</strong> बायोमेट्रिक उपस्थिति, फोटो मिलान और फ्रिस्किंग (तलाशी) में समय लगता है, इसलिए अंतिम समय की भीड़ से बचें।</li>
                            </ul>
                          </div>
                          {getSectionTable('admit_reporting_time') && renderCustomTableComponent(getSectionTable('admit_reporting_time')!)}
                        </div>
                      );
                    }

                    case 'admit_check_details': {
                      if (!isAdmitCardPost || isSectionDeleted('admit_check_details')) return null;
                      return (
                        <div key="admit_check_details" className="space-y-3 pt-2">
                          <div className="flex items-center justify-between gap-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('admit_check_details', admitTitles.checkDetails)}
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                          </div>
                          <p className="post-item text-slate-800" style={{ fontSize: '12pt' }}>
                            ई-एडमिट कार्ड डाउनलोड करने के तुरंत बाद अपने प्रवेश पत्र में अंकित निम्नलिखित सभी विवरणों की सावधानीपूर्वक जांच अवश्य करें:
                          </p>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '12pt' }}>
                            <li><strong>अभ्यर्थी का विवरण:</strong> आपका पूरा नाम, पिता/माता का नाम, श्रेणी (Category) और जन्मतिथि (आधार कार्ड/फॉर्म के समान होनी चाहिए)।</li>
                            <li><strong>रोल नंबर व आवेदन संख्या:</strong> Roll Number, Application ID एवं बारकोड स्पष्ट रूप से छपा होना चाहिए।</li>
                            <li><strong>परीक्षा तिथि एवं पारी (Exam Date & Shift):</strong> परीक्षा की तारीख, परीक्षा शुरू होने का समय और रिपोर्टिंग टाइम।</li>
                            <li><strong>परीक्षा केंद्र का पता (Exam Centre):</strong> परीक्षा केंद्र का पूरा नाम, सेंटर कोड, जिला व लोकेशन।</li>
                            <li><strong>फोटो और हस्ताक्षर:</strong> एडमिट कार्ड पर आपकी फोटो और सिग्नेचर साफ दिखाई देने चाहिए।</li>
                            <li><strong>महत्वपूर्ण निर्देश:</strong> एडमिट कार्ड पर छपे ड्रेस कोड व कोविड/सुरक्षा संबंधी दिशा-निर्देश ध्यान से पढ़ें।</li>
                          </ul>
                          {getSectionTable('admit_check_details') && renderCustomTableComponent(getSectionTable('admit_check_details')!)}
                        </div>
                      );
                    }

                    case 'admit_what_to_carry': {
                      if (!isAdmitCardPost || isSectionDeleted('admit_what_to_carry')) return null;
                      const defaultCarryItems = [
                        `${editablePost.shortTitleHi || shortJobName} ई-एडमिट कार्ड का स्पष्ट प्रिंटआउट (रंगीन या ब्लैक एंड व्हाइट)।`,
                        'मूल वैध फोटो पहचान पत्र (आधार कार्ड अद्यतन फोटो सहित / पैन कार्ड / वोटर आईडी / ड्राइविंग लाइसेंस / पासपोर्ट — केवल मूल प्रति मान्य होगी, फोटोकॉपी या मोबाइल फोटो नहीं)।',
                        '2 नवीनतम पासपोर्ट साइज रंगीन फोटोग्राफ (उपस्थिति पत्रक / एडमिट कार्ड पर लगाने हेतु, 2.5 सेमी × 2.5 सेमी)।',
                        'पारदर्शी नीला बॉल पॉइंट पेन (Transparent Blue Ball Point Pen)।'
                      ];
                      const hasValidAdmitDocs =
                        Array.isArray(editablePost.requiredDocumentsHi) &&
                        editablePost.requiredDocumentsHi.length > 0 &&
                        editablePost.requiredDocumentsHi.some(
                          d => d.includes('एडमिट') || d.includes('प्रवेश पत्र') || d.includes('कॉल लेटर') || d.includes('हॉल टिकट')
                        ) &&
                        !editablePost.requiredDocumentsHi.some(
                          d => d.includes('अंकतालिका') || d.includes('मूल निवास') || d.includes('जाति प्रमाण')
                        );
                      const carryItems = hasValidAdmitDocs ? editablePost.requiredDocumentsHi! : defaultCarryItems;

                      return (
                        <div key="admit_what_to_carry" className="space-y-3 pt-2">
                          <div className="flex items-center justify-between gap-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('admit_what_to_carry', admitTitles.whatToCarry)}
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                          </div>
                          <p className="post-item text-slate-800" style={{ fontSize: '12pt' }}>
                            परीक्षा केंद्र में प्रवेश के लिए अभ्यर्थियों को निम्नलिखित आवश्यक दस्तावेज और सामग्री साथ ले जाना अनिवार्य है (इनके बिना परीक्षा केंद्र में प्रवेश नहीं दिया जाएगा):
                          </p>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '12pt' }}>
                            {carryItems.map((item, idx) => (
                              <li key={idx}>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="p-3 rounded-md bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 space-y-1.5">
                            <div>
                              <strong>ड्रेस कोड नियम (Dress Code):</strong> सादा, हल्का व बिना बड़े बटन, ब्रोच, मेटल पिन या जेबों वाले साधारण कपड़े एवं सामान्य चप्पल/सैंडल पहनकर आएं। पूरी आस्तीन के कपड़ों व भारी आभूषण से बचें।
                            </div>
                          </div>
                          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-900">
                            <strong>प्रतिबंधित सामग्री (Prohibited Items):</strong> मोबाइल फोन, स्मार्ट वॉच, सामान्य घड़ी, ब्लूटूथ, ईयरफोन, कैलकुलेटर, लॉग टेबल, पर्स/वॉलेट, बेल्ट, धूप का चश्मा या किसी भी प्रकार का इलेक्ट्रॉनिक उपकरण परीक्षा केंद्र में ले जाना पूर्णतः वर्जित है।
                          </div>
                          {getSectionTable('admit_what_to_carry') && renderCustomTableComponent(getSectionTable('admit_what_to_carry')!)}
                        </div>
                      );
                    }

                    case 'admit_troubleshoot': {
                      if (!isAdmitCardPost || isSectionDeleted('admit_troubleshoot')) return null;
                      const portalHost = editablePost.officialLinks?.officialWebsiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'आधिकारिक वेबसाइट';
                      return (
                        <div key="admit_troubleshoot" className="space-y-3 pt-2">
                          <div className="flex items-center justify-between gap-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('admit_troubleshoot', admitTitles.troubleshoot)}
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                          </div>
                          <p className="post-item text-slate-800" style={{ fontSize: '12pt' }}>
                            यदि आपका एडमिट कार्ड डाउनलोड नहीं हो रहा है या वेबसाइट लोड होने में दिक्कत आ रही है, तो नीचे दिए गए समाधान अपनाएं:
                          </p>
                          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '12pt' }}>
                            <li><strong>सर्वर ट्रैफिक / इंटरनेट जांचें:</strong> एडमिट कार्ड जारी होते समय वेबसाइट पर भारी ट्रैफिक रहता है; कुछ मिनट बाद या सुबह/रात्रि में पुनः प्रयास करें।</li>
                            <li><strong>ब्राउज़र बदलें / Cache साफ़ करें:</strong> Google Chrome या Firefox के Incognito Mode में {admitTitles.isSso ? 'sso.rajasthan.gov.in या ' : ''}{portalHost} खोलें।</li>
                            <li><strong>सही विवरण दर्ज करें:</strong> अपना Application Number / Registration ID, पासवर्ड और जन्मतिथि (DD/MM/YYYY) आवेदन फॉर्म की रसीद से मिलान करके सही भरें।</li>
                            <li><strong>{admitTitles.isSso ? 'Forgot SSO / Password विकल्प:' : 'Forgot Registration / Password विकल्प:'}</strong> यदि पासवर्ड या आईडी भूल गए हैं, तो लॉगिन पेज पर उपलब्ध Forgot Password / Recovery लिंक का उपयोग करें।</li>
                            <li><strong>विभागीय हेल्पडेस्क से संपर्क:</strong> एडमिट कार्ड में नाम, फोटो या केंद्र संबंधी किसी त्रुटि अथवा लगातार तकनीकी समस्या के लिए तुरंत <strong>{editablePost.organization || 'संबंधित बोर्ड/आयोग'} ({portalHost})</strong> की आधिकारिक हेल्पलाइन पर संपर्क करें।</li>
                          </ol>
                          {getSectionTable('admit_troubleshoot') && renderCustomTableComponent(getSectionTable('admit_troubleshoot')!)}
                        </div>
                      );
                    }

                    case 'result_how_to_check': {
                      const portalHost =
                        editablePost.officialLinks?.officialWebsiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') ||
                        'आधिकारिक वेबसाइट';
                      const resultUrl =
                        editablePost.officialLinks?.resultPdfUrl ||
                        editablePost.officialLinks?.officialWebsiteUrl ||
                        'https://rajasthan.gov.in';
                      const checkSteps = getHowToCheckResultSteps(editablePost, isHi);
                      return (
                        <div key="result_how_to_check" className="space-y-3 pt-2">
                          <DisplayField
                            as="h2"
                            value={getSectionTitle('result_how_to_check', `${shortJobName} रिजल्ट कैसे चेक करें?`)}
                            className="headlight font-bold text-slate-900"
                            style={{
                              fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                              fontSize: '11.5pt',
                              color: '#0f172a'
                            }}
                          />
                          <p className="post-item text-slate-800" style={{ fontSize: '12pt' }}>
                            <strong>{editablePost.departmentHi || editablePost.department || editablePost.organization}</strong> द्वारा जारी{' '}
                            <strong>{editablePost.postNameHi || shortJobName}</strong> परिणाम ऑनलाइन जांचने के लिए निम्नलिखित चरण अपनाएं:
                          </p>
                          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '12pt' }}>
                            {checkSteps.map((step, idx) => (
                              <li key={idx}>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                          <div className="p-3 sm:p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="text-xs sm:text-sm text-emerald-950 font-semibold space-y-0.5">
                              <div>अधिकृत रिजल्ट पोर्टल: <span className="font-bold">{portalHost}</span></div>
                              <div>परिणाम घोषित तिथि: <span className="font-bold">{notificationDateDisplay}</span></div>
                            </div>
                            <a
                              href={resultUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#046c4e] hover:bg-[#03543f] text-white font-bold text-xs sm:text-sm rounded-md shadow-2xs transition shrink-0"
                            >
                              <span>रिजल्ट / मेरिट लिस्ट देखें</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    }

                    case 'yojana_info': {
                      if (!isYojana || isSectionDeleted('yojana_info')) return null;
                      const genInfo = editablePost.yojanaGeneralInfo;
                      const headingText = genInfo?.headingHi || `${shortJobName} क्या है? (योजना का उद्देश्य एवं मुख्य लाभ)`;
                      const descText = genInfo?.descriptionHi || editablePost.descriptionHi || editablePost.briefSummaryHi;
                      const objText = genInfo?.objectiveHi;
                      const benefitText = genInfo?.benefitsSummaryHi || editablePost.salaryHi || editablePost.salary;
                      const keyPoints = genInfo?.keyPointsHi || [];

                      if (!descText && !objText && !benefitText && keyPoints.length === 0) return null;

                      return (
                        <div key="yojana_info" className="space-y-3">
                          <div className="flex items-center justify-between gap-2 mb-2 pt-2">
                            <h2
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {headingText}
                            </h2>
                          </div>

                          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-lg p-3.5 sm:p-4 space-y-2.5 text-slate-800" style={{ fontSize: '12pt' }}>
                            {descText && (
                              <p className="post-item leading-relaxed whitespace-pre-line">{descText}</p>
                            )}
                            {objText && (
                              <p className="post-item leading-relaxed">
                                <strong className="text-emerald-900">योजना का मुख्य उद्देश्य: </strong>
                                {objText}
                              </p>
                            )}
                            {benefitText && (
                              <p className="post-item leading-relaxed">
                                <strong className="text-emerald-900">प्रमुख वित्तीय सहायता / लाभ: </strong>
                                {benefitText}
                              </p>
                            )}
                            {keyPoints.length > 0 && (
                              <ul className="list-disc pl-5 space-y-1.5 pt-1 text-slate-700">
                                {keyPoints.map((pt, i) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          {getSectionTable('yojana_info') && renderCustomTableComponent(getSectionTable('yojana_info')!)}
                        </div>
                      );
                    }

                    case 'yojana_eligibility': {
                      if (!isYojana || isSectionDeleted('yojana_eligibility')) return null;
                      const elig = editablePost.yojanaEligibility;
                      const headingText = elig?.headingHi || `${shortJobName} के लिए पात्रता शर्तें (Eligibility & Income Limit)`;
                      const criteriaList = (elig?.criteriaHi && elig.criteriaHi.length > 0)
                        ? elig.criteriaHi
                        : [
                            `मूल निवास: आवेदक ${editablePost.yojanaOverview?.state || editablePost.jobLocation || 'राजस्थान'} राज्य का स्थायी / मूल निवासी होना चाहिए।`,
                            editablePost.qualificationDetailsHi || editablePost.qualificationDetails || 'विभाग द्वारा अधिसूचित पात्रता शर्तें पूर्ण करता हो।',
                            editablePost.ageLimit?.min
                              ? `आयु सीमा: आवेदक की आयु ${editablePost.ageLimit.min} से ${editablePost.ageLimit.max || 60} वर्ष के मध्य होनी चाहिए।`
                              : 'आवेदक के पास स्वयं का जन आधार कार्ड, आधार कार्ड व आधार-लिंक्ड बैंक खाता होना आवश्यक है।'
                          ];
                      const incomeList = elig?.incomeLimitHi || [];

                      return (
                        <div key="yojana_eligibility" className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2 mb-2 pt-2">
                            <h2
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            >
                              {headingText}
                            </h2>
                          </div>

                          <ul className="list-disc pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '12pt' }}>
                            {criteriaList.map((crit, idx) => (
                              <li key={idx}>{crit}</li>
                            ))}
                          </ul>

                          {incomeList.length > 0 && (
                            <div className="mt-2.5 p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                              <div className="font-bold text-slate-900 text-sm">पारिवारिक आय सीमा नियम (Income Limit):</div>
                              <ul className="list-disc pl-5 space-y-1 text-slate-700 text-sm">
                                {incomeList.map((inc, idx) => (
                                  <li key={idx}>{inc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {getSectionTable('yojana_eligibility') && renderCustomTableComponent(getSectionTable('yojana_eligibility')!)}
                        </div>
                      );
                    }

                    case 'latest_update':
                      return null;

                    case 'latest_news': {
                      if (isYojana || isSectionDeleted('latest_news')) return null;
                      const newsList = Array.isArray(editablePost?.latestNews) ? editablePost.latestNews : [];
                      if ((isFlexCategory || isResultPost) && newsList.length === 0) return null;

                      return (
                        <div key="latest_news" className="my-4 border border-slate-300 bg-white rounded-md shadow-2xs overflow-hidden">
                          <div className="bg-slate-100 text-slate-800 px-3 sm:px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-slate-600 inline-block" />
                              <h2 className="font-bold uppercase tracking-wide text-slate-900" style={{ fontSize: '11.5pt' }}>
                                <span>{shortJobName} {isResultPost ? 'परिणाम अपडेट (Result Update)' : 'Latest News (ताज़ा समाचार)'}</span>
                              </h2>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                                {newsList.length} अपडेट्स
                              </span>
                            </div>
                          </div>

                          <div className="p-3 sm:p-4 divide-y divide-slate-100 space-y-3 bg-white">
                            {newsList.map((news: any, idx: number) => (
                              <div 
                                key={news.id || idx} 
                                className="p-3 rounded border border-slate-200 bg-white"
                              >
                                <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10.5px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                      <DisplayField
                                        value={news.badge || 'अपडेट'}
                                        className="text-slate-700 font-bold"
                                      />
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      <DisplayField
                                        value={news.date || 'अक्टूबर 2026'}
                                        className="font-medium text-slate-600"
                                      />
                                    </span>
                                  </div>
                                </div>

                                <h3 className="font-bold text-slate-900 mb-1 leading-snug" style={{ fontSize: '11.5pt' }}>
                                  <DisplayField
                                    value={news.headline}
                                    className="text-slate-900 font-bold"
                                  />
                                </h3>

                                <div className="text-slate-700 leading-relaxed" style={{ fontSize: '12pt' }}>
                                  <DisplayField
                                    value={news.details}
                                    as="span"
                                    className="text-slate-700"
                                  />
                                </div>
                              </div>
                            ))}

                            {newsList.length === 0 && (
                              <div className="p-3 text-center text-slate-500 text-sm">
                                फिलहाल कोई ताज़ा समाचार नहीं है।
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    case 'dates': {
                      if (isSectionDeleted('dates')) return null;
                      const rawDatesList = Array.isArray(editablePost?.importantDates) ? editablePost.importantDates : [];
                      const datesList = isResultPost
                        ? rawDatesList.filter((d: any) => {
                            const val = String(d?.value || '').trim();
                            const k = String(d?.key || '').toLowerCase();
                            return (
                              Boolean(val) &&
                              val !== 'शीघ्र' &&
                              val !== 'यथासमय घोषित' &&
                              !['applystartdate', 'applylastdate', 'feelastdate', 'admitcarddate'].includes(k)
                            );
                          })
                        : isFlexCategory
                        ? rawDatesList.filter((d: any) => d.value && d.value.trim() !== '' && d.value !== 'शीघ्र' && d.value !== 'यथासमय घोषित')
                        : rawDatesList;

                      if ((isFlexCategory || isResultPost) && datesList.length === 0) return null;

                      return (
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
                              {isResultPost ? `${shortJobName} परीक्षा व परिणाम तिथियाँ (Result Schedule)` : `${shortJobName} Important Dates`}
                            </h2>
                          </div>

                          <div className="wp-block-table overflow-x-auto border border-slate-300 bg-white rounded-md">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '12pt' }}>
                              <tbody>
                                {datesList.map((date: any, idx: number) => (
                                  <tr key={idx} className="border-b border-slate-300 last:border-b-0">
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-300 w-1/2 bg-white">
                                      <DisplayField
                                        value={date.label}
                                        className="font-bold text-slate-800"
                                      />
                                    </td>
                                    <td className="p-2.5 sm:p-3 font-semibold text-slate-800 w-1/2 bg-white">
                                      <DisplayField
                                        value={date.value}
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
                    }

                    case 'application_fee': {
                      if (isSectionDeleted('fee') || isSectionDeleted('application_fee')) return null;
                      const rawFeeList = Array.isArray(editablePost?.applicationFee) ? editablePost.applicationFee : [];
                      const feeList = isFlexCategory
                        ? rawFeeList.filter((f: any) => f.amount && f.amount.trim() !== '')
                        : rawFeeList;

                      if (isFlexCategory && feeList.length === 0) return null;

                      return (
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
                              {isYojana ? `${shortJobName} आवेदन शुल्क (Application Fee)` : `${shortJobName} Application Fee`}
                            </h2>
                          </div>

                          <div className="wp-block-table overflow-x-auto border border-slate-300 bg-white rounded-md">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '12pt' }}>
                              <tbody>
                                {feeList.map((fee: any, idx: number) => (
                                  <tr key={idx} className="border-b border-slate-300 last:border-b-0">
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-300 w-1/2 bg-white">
                                      <DisplayField
                                        value={fee.category}
                                        className="font-bold text-slate-800"
                                      />
                                    </td>
                                    <td className="p-2.5 sm:p-3 font-semibold text-slate-800 w-1/2 bg-white">
                                      <DisplayField
                                        value={fee.amount}
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
                    }

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
                          </div>
                          <div className="wp-block-table overflow-x-auto border border-slate-300 rounded-md bg-white">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '12pt' }}>
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-300">
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200">क्रमांक</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200">पद / ट्रेड नाम</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200">कुल पद</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800">योग्यता</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {(editablePost.postBreakdown || vacancy.postBreakdown || []).map((pb: any, idx: number) => (
                                  <tr key={idx}>
                                    <td className="p-2.5 sm:p-3 text-center border-r border-slate-200 bg-white">{idx + 1}</td>
                                    <td className="p-2.5 sm:p-3 font-semibold text-slate-800 border-r border-slate-200 bg-white">
                                      <DisplayField
                                        value={isHi ? (pb.postNameHi || pb.postName) : (pb.postName || pb.postNameHi)}
                                      />
                                    </td>
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-900 border-r border-slate-200 bg-white">
                                      <DisplayField value={pb.postsCount} />
                                    </td>
                                    <td className="p-2.5 sm:p-3 text-slate-700 bg-white">
                                      <DisplayField
                                        value={isHi ? (pb.qualificationHi || pb.qualification) : (pb.qualification || pb.qualificationHi)}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case 'qualification': {
                      if (isSectionDeleted('qualification') || isYojana) return null;
                      const qualText = editablePost.qualificationDetailsHi || editablePost.qualificationDetails || vacancy.qualificationDetailsHi || vacancy.qualificationDetails;
                      if ((isFlexCategory || isResultPost) && !qualText) return null;

                      return (
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
                              {isResultPost ? `${shortJobName} निर्धारित शैक्षणिक योग्यता` : `${shortJobName} शैक्षणिक योग्यता`}
                            </h2>
                          </div>
                          {isResultPost ? (
                            <div className="p-3.5 rounded-md border border-slate-300 bg-white space-y-2 text-slate-700" style={{ fontSize: '12pt' }}>
                              <p className="post-item">
                                <DisplayField value={qualText} />
                              </p>
                              {(editablePost.salaryHi || editablePost.salary) && (
                                <p className="post-item text-sm text-slate-800">
                                  <strong>वेतनमान / पे मैट्रिक्स: </strong>
                                  <span>{editablePost.salaryHi || editablePost.salary}</span>
                                </p>
                              )}
                            </div>
                          ) : (
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '12pt' }}>
                              <li>
                                <DisplayField
                                  value={(editablePost as any).qualificationNote1 || 'मान्यता प्राप्त बोर्ड या संस्थान से संबंधित शैक्षणिक परीक्षा उत्तीर्ण हो।'}
                                />
                              </li>
                              <li>
                                <DisplayField
                                  value={editablePost.qualificationDetailsHi || editablePost.qualificationDetails || '10वीं / 12वीं / स्नातक अथवा संबंधित विषय में आवश्यक डिग्री/डिप्लोमा।'}
                                />
                              </li>
                              <li>
                                <DisplayField
                                  value={(editablePost as any).qualificationNote2 || 'आवेदन जमा करने की अंतिम तिथि तक सभी आवश्यक शैक्षणिक एवं तकनीकी योग्यता पूर्ण होनी चाहिए।'}
                                />
                              </li>
                              <li>
                                <DisplayField
                                  value={(editablePost as any).qualificationNote3 || 'विस्तृत एवं पदवार शैक्षणिक योग्यता की जानकारी आधिकारिक नोटिफिकेशन से प्राप्त करें।'}
                                />
                              </li>
                            </ul>
                          )}
                          {getSectionTable('qualification') && renderCustomTableComponent(getSectionTable('qualification')!)}
                        </div>
                      );
                    }

                    case 'age_limit': {
                      if (isSectionDeleted('age_limit') || isFlexCategory || isAdmitOrResult) return null;

                      const minAgeVal = editablePost.ageLimit?.min || 18;
                      const maxAgeVal = editablePost.ageLimit?.max || 40;
                      const asOnDateVal = editablePost.ageLimit?.asOnDate || applyLastDateDisplay || notificationDateDisplay || '2026';

                      return (
                        <div key="age_limit">
                          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('age_limit', `${shortJobName} Age Limit 2026`)}
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                          </div>

                          <p className="post-item mb-3 text-slate-800" style={{ fontSize: '12pt' }}>
                            {editablePost.organization || 'विभाग'} भर्ती के विस्तृत नोटिफिकेशन में सामान्य आयु सीमा{' '}
                            <strong>
                              <DisplayField value={minAgeVal} />{' '}
                              से{' '}
                              <DisplayField value={maxAgeVal} />{' '}
                              वर्ष
                            </strong>{' '}
                            दी गई है। आयु की गणना{' '}
                            <strong>
                              <DisplayField value={asOnDateVal} />
                            </strong>{' '}
                            को आधार मानकर होगी।
                          </p>

                          <div className="wp-block-table overflow-x-auto border border-slate-300 rounded-md bg-white">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '12pt' }}>
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-300">
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-200 w-1/2 text-center">विवरण</th>
                                  <th className="p-2.5 sm:p-3 font-bold text-slate-800 text-center">आयु सीमा / छूट</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                <tr>
                                  <td className="p-2.5 sm:p-3 bg-white border-r border-slate-200 text-slate-800 font-bold">न्यूनतम आयु</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">
                                    <DisplayField value={`${minAgeVal} वर्ष`} />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 bg-white border-r border-slate-200 text-slate-800 font-bold">सामान्य अधिकतम आयु</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">
                                    <DisplayField value={`${maxAgeVal} वर्ष`} />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 bg-white border-r border-slate-200 text-slate-800 font-bold">OBC-NCL को छूट</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">
                                    <DisplayField value={(editablePost as any).obcRelaxationHi || 'अधिकतम आयु में 3 वर्ष'} />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 bg-white border-r border-slate-200 text-slate-800 font-bold">SC/ST को छूट</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">
                                    <DisplayField value={(editablePost as any).scstRelaxationHi || 'अधिकतम आयु में 5 वर्ष'} />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 sm:p-3 bg-white border-r border-slate-200 text-slate-800 font-bold">भूतपूर्व सैनिक और अन्य पात्र श्रेणियाँ</td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 bg-white">
                                    <DisplayField value={(editablePost as any).otherRelaxationHi || 'विज्ञापन के नियमानुसार'} />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    }

                    case 'selection_process': {
                      if (isSectionDeleted('selection_process') || (isFlexCategory && !isYojana)) return null;
                      const defaultSelectionSteps = isYojana
                        ? [
                            isRajasthanRelatedPost(editablePost)
                              ? 'आधिकारिक योजना पोर्टल / SSO / E-Mitra के माध्यम से ऑनलाइन आवेदन जमा करना।'
                              : 'आधिकारिक योजना पोर्टल के माध्यम से ऑनलाइन आवेदन जमा करना।',
                            'संबंधित विभाग / नोडल अधिकारी द्वारा पात्रता एवं दस्तावेजों का सत्यापन।',
                            'पात्र लाभार्थियों की स्वीकृत सूची जारी होना व DBT / कार्ड के माध्यम से लाभ प्रदान करना।'
                          ]
                        : [
                            'लिखित परीक्षा अथवा शैक्षणिक प्राप्तांकों की मेरिट सूची (Merit List)।',
                            'मूल दस्तावेजों का भौतिक सत्यापन (Document Verification)।',
                            'चिकित्सीय परीक्षण (Medical Fitness Examination)।',
                            'अंतिम चयन सूची का प्रकाशन।'
                          ];
                      const stepsList = (Array.isArray(editablePost.selectionProcessHi) && editablePost.selectionProcessHi.length > 0)
                        ? editablePost.selectionProcessHi
                        : isResultPost
                        ? []
                        : defaultSelectionSteps;

                      if ((isFlexCategory || isResultPost) && (!stepsList || stepsList.length === 0)) return null;

                      return (
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
                              {isYojana
                                ? `${shortJobName} सत्यापन एवं लाभ प्राप्ति प्रक्रिया`
                                : isResultPost
                                ? `${shortJobName} रिजल्ट के बाद आगे की चयन प्रक्रिया`
                                : 'चयन प्रक्रिया और मेरिट की गणना'}
                            </h2>
                          </div>
                          <p className="post-item mb-2" style={{ fontSize: '12pt' }}>
                            {isYojana
                              ? 'इस योजना के अंतर्गत आवेदन सत्यापन तथा लाभ वितरण निम्नलिखित चरणों के अनुसार किया जाता है:'
                              : isResultPost
                              ? 'इस परीक्षा परिणाम में सफल घोषित अभ्यर्थियों की आगामी चयन प्रक्रिया इस प्रकार रहेगी:'
                              : 'इस भर्ती में चयन प्रक्रिया निम्नलिखित चरणों के आधार पर की जाएगी:'}
                          </p>
                          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700" style={{ fontSize: '12pt' }}>
                            {stepsList.map((step, idx) => (
                              <li key={idx}>
                                <DisplayField value={step} />
                              </li>
                            ))}
                          </ol>
                          {getSectionTable('selection_process') && renderCustomTableComponent(getSectionTable('selection_process')!)}
                        </div>
                      );
                    }

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
                          </div>
                          <div className="p-3 sm:p-4 rounded-md border border-slate-300 bg-white space-y-2.5 min-w-0 overflow-hidden">
                            <p className="post-item text-slate-800" style={{ fontSize: '12pt' }}>
                              अभ्यर्थी पूर्ण रूप से भरे हुए ऑफलाइन आवेदन फॉर्म को सभी आवश्यक स्वप्रमाणित दस्तावेजों के साथ नीचे दिए गए आधिकारिक पते पर पंजीकृत डाक (Registered Post) अथवा स्पीड पोस्ट (Speed Post) द्वारा भेजें:
                            </p>
                            <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded text-slate-900 font-bold leading-relaxed min-w-0 overflow-hidden" style={{ fontSize: '12pt' }}>
                              <p className="font-mono text-slate-900 select-all break-words">
                                <DisplayField
                                  value={editablePost.postalAddressHi || editablePost.postalAddress || 'The Commanding Officer, Head Quarter Southern Air Command (Unit), Akkulam, Trivandrum – 695011'}
                                />
                              </p>
                            </div>
                            <div className="text-slate-700 space-y-1 min-w-0" style={{ fontSize: '12pt' }}>
                              <p>
                                <strong>लिफाफे के ऊपर क्या लिखें (Envelope Superscription):</strong>
                              </p>
                              <p className="p-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900 font-semibold select-all break-words">
                                <DisplayField
                                  value={editablePost.envelopeNoteHi || 'APPLICATION FOR THE POST OF HINDI TYPIST AND CATEGORY: OBC'}
                                />
                              </p>
                              <p className="text-slate-600 text-xs sm:text-sm">
                                • आवेदन फॉर्म निर्धारित अंतिम तिथि ({applyLastDateDisplay}) शाम 5:00 बजे तक संबंधित पते पर अवश्य पहुंच जाना चाहिए।
                              </p>
                            </div>
                          </div>
                          {getSectionTable('postal_address') && renderCustomTableComponent(getSectionTable('postal_address')!)}
                        </div>
                      );

                    case 'documents': {
                      if (isSectionDeleted('documents')) return null;
                      const activeDocs = isResultPost
                        ? (Array.isArray(editablePost.requiredDocumentsHi) && editablePost.requiredDocumentsHi.length > 0
                            ? editablePost.requiredDocumentsHi
                            : Array.isArray(editablePost.requiredDocuments) && editablePost.requiredDocuments.length > 0
                            ? editablePost.requiredDocuments
                            : [])
                        : documentsList;
                      if ((isFlexCategory || isResultPost) && (!activeDocs || activeDocs.length === 0)) return null;

                      return (
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
                              {isResultPost
                                ? `${shortJobName} दस्तावेज सत्यापन / अगले चरण हेतु आवश्यक दस्तावेज`
                                : 'आवेदन के लिए आवश्यक दस्तावेज'}
                            </h2>
                          </div>
                          <p className="post-item mb-2" style={{ fontSize: '12pt' }}>
                            {isYojana
                              ? 'योजना के अंतर्गत ऑनलाइन आवेदन करने से पूर्व लाभार्थी निम्नलिखित आवश्यक दस्तावेज तैयार रखें:'
                              : isResultPost
                              ? 'इस परीक्षा परिणाम में सफल अभ्यर्थी आगामी चयन चरण व दस्तावेज सत्यापन (Document Verification) हेतु निम्नलिखित मूल दस्तावेज तैयार रखें:'
                              : 'ऑनलाइन फॉर्म भरने से पूर्व अभ्यर्थी पद की अधिकतम योग्यता अनुसार निम्नलिखित दस्तावेज तैयार रखें:'}
                          </p>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 mb-3" style={{ fontSize: '12pt' }}>
                            {activeDocs.map((doc, i) => (
                              <li key={i}>
                                <span>{doc}</span>
                              </li>
                            ))}
                          </ul>

                          {!isFlexCategory && !isResultPost && (
                            <div className="wp-block-table overflow-x-auto border border-slate-300 rounded-md bg-white">
                              <table className="w-full border-collapse text-left" style={{ fontSize: '12pt' }}>
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
                          )}
                          {getSectionTable('documents') && renderCustomTableComponent(getSectionTable('documents')!)}
                        </div>
                      );
                    }

                    case 'how_to_apply': {
                      if (isSectionDeleted('how_to_apply')) return null;
                      if (isFlexCategory && (!howToApplySteps || howToApplySteps.length === 0)) return null;

                      return (
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
                          </div>
                          <ol className="list-decimal pl-5 space-y-2 text-slate-700" style={{ fontSize: '12pt' }}>
                            {howToApplySteps.map((step, idx) => (
                              <li key={idx}>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                          {getSectionTable('how_to_apply') && renderCustomTableComponent(getSectionTable('how_to_apply')!)}
                        </div>
                      );
                    }

                    case 'official_notification': {
                      if (isSectionDeleted('official_notification')) return null;
                      const excerpt = editablePost.officialNotificationExcerpt;
                      if (!excerpt) return null;

                      return (
                        <div key="official_notification" className="space-y-3 pt-2">
                          <div className="flex items-center justify-between gap-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('official_notification', `${shortJobName} — आधिकारिक विज्ञप्ति (Official Notification)`)}
                              className="headlight font-bold text-slate-900"
                              style={{
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                          </div>

                          <div className="border border-slate-300 rounded-md bg-slate-50/70 p-3.5 sm:p-4 space-y-2.5">
                            {(excerpt.authority || excerpt.refNo || excerpt.date) && (
                              <div className="border-b border-slate-200 pb-2 space-y-1 text-xs sm:text-sm">
                                {excerpt.authority && (
                                  <div className="font-extrabold text-slate-900">{excerpt.authority}</div>
                                )}
                                <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600 font-semibold text-xs">
                                  {excerpt.refNo && <span>{excerpt.refNo}</span>}
                                  {excerpt.date && <span>{excerpt.date}</span>}
                                </div>
                              </div>
                            )}
                            {excerpt.titleRed && (
                              <div className="font-extrabold text-rose-700 text-sm sm:text-base">
                                {excerpt.titleRed}
                              </div>
                            )}
                            {excerpt.titleSubtitle && (
                              <div className="text-xs sm:text-sm font-bold text-slate-800">
                                {excerpt.titleSubtitle}
                              </div>
                            )}
                            {excerpt.body && (
                              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                                {excerpt.body}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }

                    case 'important_links':
                      return !isSectionDeleted('important_links') && (
                        <div key="important_links" className="space-y-2 pt-2">
                          {/* Middle Ad Section above Important Direct Links */}
                          <AdSlotWrapper
                            height={130}
                            className="my-3"
                            ariaLabel={isHi ? 'विज्ञापन' : 'Advertisement'}
                            skeletonLabel={isHi ? 'विज्ञापन' : 'Advertisement'}
                          >
                            <AdSection 
                              slot="3785509362"
                              client="ca-pub-3176571184961509"
                              label={isHi ? 'विज्ञापन' : 'Advertisement'}
                              minHeight={90}
                              embedded
                            />
                          </AdSlotWrapper>
                          <div className="flex items-center justify-between gap-2 pt-2">
                            <DisplayField
                              as="h2"
                              value={getSectionTitle('important_links', isAdmitCardPost ? admitTitles.importantLinks : `${shortJobName} Important Links`)}
                              className="headlight font-bold text-slate-900"
                              style={{ 
                                fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                fontSize: '11.5pt',
                                color: '#0f172a'
                              }}
                            />
                          </div>

                          <div className="wp-block-table overflow-x-auto border border-slate-300 bg-white rounded-md">
                            <table className="w-full border-collapse text-left" style={{ fontSize: '12pt' }}>
                              <tbody>
                                <tr className="border-b border-slate-300">
                                  <td className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-300 w-1/2 bg-white">
                                    {isYojana
                                      ? `${shortJobName} आवेदन प्रारंभ (Scheme Apply Start)`
                                      : isAdmitCardPost
                                      ? `${shortJobName} एडमिट कार्ड जारी / परीक्षा तिथि`
                                      : isResultPost
                                      ? `${shortJobName} परिणाम स्थिति / जारी तिथि`
                                      : `Start ${shortJobName} form (आवेदन प्रारंभ)`}
                                  </td>
                                  <td className="p-2.5 sm:p-3 font-semibold text-slate-800 w-1/2 bg-white">
                                    {isAdmitCardPost
                                      ? `${admitCardDateDisplay} (Exam: ${examDateDisplay})`
                                      : isResultPost
                                      ? `परिणाम घोषित (${notificationDateDisplay})`
                                      : applyStartDateDisplay}
                                  </td>
                                </tr>

                                {(Array.isArray(editablePost?.directLinks) ? editablePost.directLinks : []).map((link: any, idx: number) => {
                                  const rawUrl = typeof link.url === 'string' ? link.url.trim() : '';
                                  const isDeadUrl = !rawUrl || rawUrl === '#';
                                  const resolvedUrl = isDeadUrl
                                    ? (editablePost.officialLinks?.officialWebsiteUrl?.trim() || 'https://rajasthan.gov.in')
                                    : rawUrl;

                                  // Detect internal portal post links (?vacancy=slug) so they open smoothly in-app
                                  let internalVacancySlug: string | null = null;
                                  try {
                                    if (
                                      resolvedUrl.startsWith('/?') ||
                                      resolvedUrl.startsWith('?vacancy=') ||
                                      resolvedUrl.includes('rajasthanvacancy.online/?vacancy=')
                                    ) {
                                      const parsed = new URL(resolvedUrl, SHARE_BASE_URL);
                                      internalVacancySlug = parsed.searchParams.get('vacancy');
                                    }
                                  } catch {
                                    internalVacancySlug = null;
                                  }

                                  const isActualPdfUrl = Boolean(
                                    resolvedUrl.startsWith('data:application/pdf') ||
                                    /\.pdf(\?.*)?$/i.test(resolvedUrl)
                                  );

                                  const internalTarget = internalVacancySlug
                                    ? allVacancies.find(
                                        (v) => v.id === internalVacancySlug || v.id.toLowerCase() === internalVacancySlug!.toLowerCase()
                                      )
                                    : undefined;

                                  return (
                                    <tr key={idx} className="border-b border-slate-300">
                                      <td className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-300 w-1/2 bg-white">
                                        <DisplayField
                                          value={link.label}
                                          className="font-bold text-slate-800"
                                        />
                                      </td>
                                      <td className="p-2.5 sm:p-3 font-semibold w-1/2 bg-white">
                                        <div className="flex flex-col gap-1.5 w-full">
                                          <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-1.5">
                                              {internalTarget ? (
                                                <a
                                                  href={`/?vacancy=${encodeURIComponent(internalTarget.id)}`}
                                                  onClick={(e) => {
                                                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                                                    e.preventDefault();
                                                    onSelectOtherVacancy(internalTarget);
                                                  }}
                                                  className="text-blue-600 hover:text-blue-800 underline font-bold inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                  <span>{link.actionText || 'Click Here'}</span>
                                                </a>
                                              ) : (
                                                <a
                                                  href={resolvedUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  download={isActualPdfUrl ? (link.fileName || `${(link.label || 'file').replace(/\s+/g, '_')}.pdf`) : undefined}
                                                  className="text-blue-600 hover:text-blue-800 underline font-bold inline-flex items-center gap-1"
                                                >
                                                  <span>{link.actionText || 'Click Here'}</span>
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                                {!isAdmitCardPost && !isResultPost && !(Array.isArray(editablePost?.directLinks) && editablePost.directLinks.some((l: any) => typeof l?.url === 'string' && l.url.includes('photo-signature-resize-tool'))) && (
                                  <tr className="border-b border-slate-300 last:border-b-0">
                                    <td className="p-2.5 sm:p-3 font-bold text-slate-800 border-r border-slate-300 w-1/2 bg-white">
                                      {isHi
                                        ? 'Photo & Signature Resize Tool (फोटो व हस्ताक्षर रीसाइज़)'
                                        : 'Photo & Signature Resize Tool (20KB–50KB)'}
                                    </td>
                                    <td className="p-2.5 sm:p-3 font-semibold w-1/2 bg-white">
                                      <Link
                                        href="/photo-signature-resize-tool"
                                        className="text-blue-600 hover:text-blue-800 underline font-bold inline-flex items-center gap-1"
                                        title="ऑनलाइन फॉर्म के लिए पासपोर्ट फोटो और सिग्नेचर रीसाइज़ करें"
                                      >
                                        <span>{isHi ? 'Click Here (Resize Tool)' : 'Click Here'}</span>
                                      </Link>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case 'faqs': {
                      if (isSectionDeleted('faqs')) return null;
                      if (isFlexCategory && (!faqList || faqList.length === 0)) return null;

                      return (
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
                                  <DisplayField value={isHi ? (faq.qHi || faq.q) : faq.q} />
                                </h3>
                                <div className="text-slate-700 text-xs sm:text-sm pl-4 border-l-2 border-slate-300 mt-2">
                                  <p className="post-item" style={{ fontSize: '12pt' }}>
                                    <DisplayField value={isHi ? (faq.aHi || faq.a) : faq.a} />
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        {getSectionTable('faqs') && renderCustomTableComponent(getSectionTable('faqs')!)}
                        </div>
                      );
                    }

                    default: {
                      const customId = sectionKey.startsWith('custom_') ? sectionKey.replace('custom_', '') : sectionKey;
                      const customSec = (editablePost.customSections || []).find(s => s.id === customId);
                      if (customSec) {
                        const customTable = customSec.tableData || getSectionTable(sectionKey);

                        return (
                          <div key={sectionKey} className="space-y-2 pt-2">
                            <div className="flex items-center justify-between gap-2">
                              <h2 
                                className="headlight font-bold text-slate-900"
                                style={{ 
                                  fontFamily: "'Mangal', 'Noto Sans Devanagari', sans-serif",
                                  fontSize: '11.5pt',
                                  color: '#0f172a'
                                }}
                              >
                                <DisplayField value={customSec.titleHi || customSec.title} />
                              </h2>
                            </div>

                            {customSec.contentHi || customSec.content ? (
                              <div className="text-slate-700 text-xs sm:text-sm">
                                <DisplayField
                                  value={customSec.contentHi || customSec.content}
                                  as="p"
                                />
                              </div>
                            ) : null}

                            {customTable && renderCustomTableComponent(customTable)}
                          </div>
                        );
                      }
                      return null;
                    }
                  }
                })}
              </div>

              {/* Trending Viral Tags / SEO Related Searches Card - Hidden for normal user, accessible only to admin */}
              {isAdmin ? (
                <section className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 rounded-xl p-4 sm:p-5 border border-blue-200/80 my-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                        <Flame className="w-4 h-4 fill-rose-600 text-rose-600 animate-bounce" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          <span>{isHi ? 'वायरल टैग्स (Admin View)' : 'Viral Tags (Admin View)'}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {isHi ? 'केवल एडमिन' : 'Admin Only'}
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {isHi ? 'यह सेक्शन सामान्य यूजर्स के लिए छिपा हुआ है, केवल एडमिन मोड में दिखाई देता है।' : 'Hidden for normal users, visible only in admin mode for SEO tag management.'}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Viral Tags Badges Cloud */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {displayTags.map((tag, idx) => {
                      const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition bg-white hover:bg-blue-50 text-[#0056b3] border border-blue-200 hover:border-blue-400 shadow-2xs group"
                        >
                          <button
                            type="button"
                            onClick={() => handleTagClick(cleanTag)}
                            className="inline-flex items-center gap-1.5 cursor-pointer text-left focus:outline-none"
                            title={`${cleanTag} से संबंधित अन्य भर्तियां खोजें`}
                          >
                            <Tag className="w-3.5 h-3.5 text-[#0056b3]/70 group-hover:text-blue-700 shrink-0" />
                            <span className="group-hover:underline underline-offset-2">{cleanTag}</span>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </section>
              ) : (
                /* Hidden for normal user, available semantically for search bots without UI footprint */
                <div className="hidden" aria-hidden="true" data-post-tags={displayTags.join(', ')}></div>
              )}

              {/* Entry Footer Meta: Categories, Tags & Post Navigation */}
              <footer className="entry-meta border-t border-slate-200 pt-5 mt-8">
                {/* Categories Tagging */}
                <div className="flex items-center gap-2 mb-3 flex-wrap text-xs font-semibold">
                  <Folder className="w-4 h-4 text-[#0056b3]" />
                  <span className="text-slate-700 font-bold">Categories:</span>
                  <a
                    href={
                      isYojana
                        ? '/?category=scheme'
                        : isResultPost
                        ? '/?category=result'
                        : isAdmitCardPost
                        ? '/?category=admit_card'
                        : '/?category=latest_job'
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectCategory?.(
                        isYojana
                          ? 'scheme'
                          : isResultPost
                          ? 'result'
                          : isAdmitCardPost
                          ? 'admit_card'
                          : 'latest_job'
                      );
                    }}
                    className="text-[#0056b3] hover:text-blue-800 hover:underline cursor-pointer font-semibold transition"
                    style={{ color: '#0056b3' }}
                  >
                    {isYojana
                      ? 'Sarkari Yojana'
                      : isResultPost
                      ? 'Result'
                      : isAdmitCardPost
                      ? 'Admit Card'
                      : 'Latest Job'}
                  </a>
                  <span className="text-slate-400">,</span>
                  <a
                    href="/?category=news"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectCategory?.('news');
                    }}
                    className="text-[#0056b3] hover:text-blue-800 hover:underline cursor-pointer font-semibold transition"
                    style={{ color: '#0056b3' }}
                  >
                    Latest News
                  </a>
                  <span className="text-slate-400">,</span>
                  <a
                    href={`/?category=${encodeURIComponent(normalizeBreadcrumbCategoryKey(vacancy.category))}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectCategory?.(normalizeBreadcrumbCategoryKey(vacancy.category));
                    }}
                    className="text-[#0056b3] hover:text-blue-800 hover:underline cursor-pointer font-semibold transition"
                    style={{ color: '#0056b3' }}
                  >
                    {vacancy.organization || 'RSMSSB'}
                  </a>
                </div>

                {/* Tags Metadata Line - Only visible for admin, hidden for normal user */}
                {isAdmin && (
                  <div className="flex items-center gap-2 mb-6 flex-wrap text-xs font-semibold">
                    <Tag className="w-4 h-4 text-[#0056b3]" />
                    <span className="text-slate-700 font-bold">Tags (Admin):</span>
                    {displayTags.slice(0, 6).map((tag, idx) => {
                      const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
                      return (
                        <React.Fragment key={idx}>
                          <button
                            type="button"
                            onClick={() => handleTagClick(cleanTag)}
                            className="text-[#0056b3] hover:text-blue-800 hover:underline cursor-pointer font-semibold transition"
                            style={{ color: '#0056b3' }}
                          >
                            {cleanTag}
                          </button>
                          {idx < Math.min(displayTags.length, 6) - 1 && <span className="text-slate-400">,</span>}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* Post Navigation: Previous & Next Post Links */}
                <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                  {prevPost ? (
                    <a
                      href={`/?vacancy=${prevPost.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectOtherVacancy(prevPost);
                      }}
                      className="text-left p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer group shadow-2xs block"
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
                    </a>
                  ) : <div />}

                  {nextPost ? (
                    <a
                      href={`/?vacancy=${nextPost.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectOtherVacancy(nextPost);
                      }}
                      className="text-right p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer group shadow-2xs block"
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
                    </a>
                  ) : <div />}
                </nav>
              </footer>

              {/* Bottom Post Ad Section */}
              <AdSlotWrapper
                height={130}
                className="my-5"
                ariaLabel={isHi ? 'विज्ञापन' : 'Advertisement'}
                skeletonLabel={isHi ? 'विज्ञापन' : 'Advertisement'}
              >
                <AdSection 
                  slot="3785509362"
                  client="ca-pub-3176571184961509"
                  label={isHi ? 'विज्ञापन' : 'Advertisement'}
                  minHeight={90}
                  embedded
                />
              </AdSlotWrapper>

              {/* Recent Posts section at the bottom of the card matching user screenshot */}
              {recentPosts.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 
                    className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-5"
                    style={{
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans Devanagari', -apple-system, sans-serif",
                      color: '#111827',
                      fontWeight: 700
                    }}
                  >
                    Recent Posts
                  </h3>
                  <div className="space-y-4">
                    {recentPosts.slice(0, 8).map((rp) => (
                      <div key={rp.id} className="block">
                        <a
                          href={`/?vacancy=${encodeURIComponent(rp.id)}`}
                          onClick={(e) => {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                            e.preventDefault();
                            onSelectOtherVacancy(rp);
                          }}
                          className="post-title-link text-[16.5px] sm:text-[18px] font-semibold leading-snug cursor-pointer block transition-colors no-underline"
                          style={{
                            fontFamily: "'Mangal', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
                            color: '#0066cc',
                            textDecoration: 'none',
                          }}
                        >
                          {isHi ? (rp.titleHi || rp.title) : rp.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AdSense at the absolute bottom of the post */}
              <div className="w-full mt-[20px] pt-[20px] border-t border-slate-200">
                <AdSlotWrapper
                  height={290}
                  className="w-full mb-0"
                  ariaLabel={isHi ? 'विज्ञापन (Google AdSense)' : 'Google AdSense Advertisement'}
                  skeletonLabel={isHi ? 'विज्ञापन (Google AdSense)' : 'Google AdSense Advertisement'}
                >
                  <AdSection 
                    slot="3785509362"
                    client="ca-pub-3176571184961509"
                    label={isHi ? 'विज्ञापन (Google AdSense)' : 'Google AdSense Advertisement'}
                    minHeight={250}
                    embedded
                  />
                </AdSlotWrapper>
              </div>
            </article>
          </main>
        </div>
    </div>
  );
};
