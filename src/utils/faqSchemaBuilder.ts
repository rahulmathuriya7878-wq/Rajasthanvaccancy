import { LanguageMode, VacancyItem } from '../types';
import { formatDisplayDate, resolveJobDates } from './dateUtils';
import { buildCanonicalUrl, getCanonicalOrigin, normalizeBreadcrumbCategoryKey } from './seoCanonical';

export interface DynamicFaqItem {
  q: string;
  qHi: string;
  a: string;
  aHi: string;
}

export interface AdmitCardSectionTitles {
  isSso: boolean;
  isCet12th: boolean;
  overview: string;
  admitReleased: string;
  examTime: string;
  howToDownload: string;
  ssoDownload: string;
  reportingTime: string;
  checkDetails: string;
  whatToCarry: string;
  troubleshoot: string;
  importantLinks: string;
}

/**
 * Determines whether a post belongs to Rajasthan state departments/boards (RPSC, RSSB/RSMSSB, REET, etc.)
 * so SSO ID (sso.rajasthan.gov.in) references are strictly scoped to Rajasthan posts only.
 */
export const isRajasthanRelatedPost = (post: Partial<VacancyItem>): boolean => {
  if (!post) return false;
  const org = (post.organization || '').toLowerCase();
  const id = (post.id || '').toLowerCase();
  const title = `${post.title || ''} ${post.titleHi || ''} ${post.department || ''} ${post.departmentHi || ''}`.toLowerCase();
  const loc = (post.jobLocation || '').toLowerCase();
  const state = (post.yojanaOverview?.state || '').toLowerCase();

  const linksStr = JSON.stringify(post.officialLinks || {}).toLowerCase();
  if (linksStr.includes('sso.rajasthan.gov.in')) return true;

  const isCentralOrg =
    org.includes('central') ||
    org.includes('railway') ||
    org === 'ssc' ||
    org === 'upsc' ||
    org === 'ibps';

  if (
    isCentralOrg &&
    !title.includes('rajasthan') &&
    !title.includes('राजस्थान') &&
    !id.includes('rajasthan')
  ) {
    return false;
  }

  return (
    org.includes('rpsc') ||
    org.includes('rsmssb') ||
    org.includes('rssb') ||
    org.includes('reet') ||
    org.includes('rajasthan') ||
    id.includes('rajasthan') ||
    id.includes('rpsc') ||
    id.includes('rsmssb') ||
    id.includes('rssb') ||
    id.includes('kalibai') ||
    id.includes('devnarayan') ||
    id.includes('gopal-credit') ||
    id.includes('palanhar') ||
    id.includes('cm-higher-education') ||
    title.includes('rajasthan') ||
    title.includes('राजस्थान') ||
    title.includes('rpsc') ||
    title.includes('rsmssb') ||
    title.includes('rssb') ||
    state.includes('rajasthan') ||
    state.includes('राजस्थान') ||
    ((loc.includes('rajasthan') || loc.includes('राजस्थान')) && !loc.includes('all india'))
  );
};

export const getAdmitCardTitles = (post: Partial<VacancyItem>): AdmitCardSectionTitles => {
  const combined = `${post.id || ''} ${post.title || ''} ${post.titleHi || ''} ${post.department || ''} ${post.organization || ''} ${post.briefSummaryHi || ''}`.toLowerCase();
  const isSso = isRajasthanRelatedPost(post);

  const isCet12th =
    (post.id || '').includes('rajasthan-cet') ||
    (combined.includes('rajasthan cet') && (combined.includes('12th') || combined.includes('12वीं') || combined.includes('सीनियर सेकेंडरी')));

  if (isCet12th) {
    return {
      isSso: true,
      isCet12th: true,
      overview: 'Rajasthan CET 12th Level Admit Card 2026 Overview',
      admitReleased: 'राजस्थान सीईटी 12वीं लेवल एडमिट कार्ड 2026 जारी',
      examTime: 'Rajasthan CET 12th Level Exam Date 2026 और परीक्षा का समय',
      howToDownload: 'Rajasthan CET 12th Level Admit Card 2026 कैसे डाउनलोड करें?',
      ssoDownload: 'SSO ID से राजस्थान सीईटी एडमिट कार्ड कैसे निकालें?',
      reportingTime: 'राजस्थान सीईटी परीक्षा केंद्र पर कितने बजे पहुंचना है?',
      checkDetails: 'एडमिट कार्ड डाउनलोड करने के बाद क्या जांचें?',
      whatToCarry: 'राजस्थान सीईटी परीक्षा में साथ क्या लेकर जाएं?',
      troubleshoot: 'Rajasthan CET Admit Card डाउनलोड नहीं हो रहा तो क्या करें?',
      importantLinks: 'Rajasthan CET 12th Level Admit Card 2026 Important Links',
    };
  }

  const rawEn = (post.shortTitle || post.postName || post.title || 'Exam').split(':')[0].trim();
  const rawHi = (post.shortTitleHi || post.postNameHi || post.titleHi || rawEn).split(':')[0].trim();
  const yearMatch = `${rawEn} ${rawHi} ${post.title || ''}`.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : '2026';

  const cleanEn =
    rawEn
      .replace(/\([^)]*\)/g, '')
      .replace(/\b(admit\s*card|call\s*letter|hall\s*ticket|prelims|out|released)\b/gi, '')
      .replace(/\b20\d{2}\b/g, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Exam';

  const cleanHi =
    rawHi
      .replace(/\([^)]*\)/g, '')
      .replace(/एडमिट\s*कार्ड|प्रवेश\s*पत्र|कॉल\s*लेटर|हॉल\s*टिकट|जारी|आउट|प्रीलिम्स/gi, '')
      .replace(/\b(admit\s*card|call\s*letter|hall\s*ticket|out|released)\b/gi, '')
      .replace(/\b20\d{2}\b/g, '')
      .replace(/\s+/g, ' ')
      .trim() || cleanEn;

  return {
    isSso,
    isCet12th: false,
    overview: `${cleanEn} Admit Card ${year} Overview`,
    admitReleased: `${cleanHi} एडमिट कार्ड ${year} जारी`,
    examTime: `${cleanEn} Exam Date ${year} और परीक्षा का समय`,
    howToDownload: `${cleanEn} Admit Card ${year} कैसे डाउनलोड करें?`,
    ssoDownload: isSso
      ? `SSO ID से ${cleanHi} एडमिट कार्ड कैसे निकालें?`
      : `आधिकारिक पोर्टल से ${cleanHi} एडमिट कार्ड कैसे निकालें?`,
    reportingTime: `${cleanHi} परीक्षा केंद्र पर कितने बजे पहुंचना है?`,
    checkDetails: 'एडमिट कार्ड डाउनलोड करने के बाद क्या जांचें?',
    whatToCarry: `${cleanHi} परीक्षा में साथ क्या लेकर जाएं?`,
    troubleshoot: `${cleanEn} Admit Card डाउनलोड नहीं हो रहा तो क्या करें?`,
    importantLinks: `${cleanEn} Admit Card ${year} Important Links`,
  };
};

const stripCleanText = (val?: string | null): string => {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s*\(\s*आवेदन\s*फॉर्म\s*में\s*अपलोड\s*फोटो\s*के\s*समान\s*\)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const sanitizeSsoText = (text: string, isRaj: boolean, isHi = true): string => {
  if (isRaj) return stripCleanText(text);
  if (isHi) {
    return stripCleanText(
      text
        .replace(/राजस्थान\s*SSO\s*पोर्टल\s*\(?sso\.rajasthan\.gov\.in\)?/gi, 'आधिकारिक पोर्टल')
        .replace(/sso\.rajasthan\.gov\.in/gi, 'आधिकारिक वेबसाइट')
        .replace(/SSO\s*ID\s*(व|और)?\s*पासवर्ड/gi, 'रजिस्ट्रेशन नंबर व पासवर्ड')
        .replace(/SSO\s*ID/gi, 'रजिस्ट्रेशन / लॉगिन आईडी')
        .replace(/SSO\s*पोर्टल/gi, 'आधिकारिक पोर्टल')
    );
  }
  return stripCleanText(
    text
      .replace(/Rajasthan\s*SSO\s*\(?sso\.rajasthan\.gov\.in\)?/gi, 'the official portal')
      .replace(/sso\.rajasthan\.gov\.in/gi, 'the official website')
      .replace(/SSO\s*ID/gi, 'Registration / Login ID')
  );
};

const extractPortalHost = (post: Partial<VacancyItem>, isRaj: boolean): string => {
  const candidate =
    post.officialLinks?.admitCardUrl ||
    post.officialLinks?.resultPdfUrl ||
    post.officialLinks?.officialWebsiteUrl ||
    '';
  if (candidate) {
    try {
      const host = new URL(candidate).hostname.replace(/^www\./, '');
      if (host && (isRaj || !host.includes('sso.rajasthan.gov.in'))) {
        return host;
      }
    } catch {
      const cleaned = candidate.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (cleaned && (isRaj || !cleaned.includes('sso.rajasthan.gov.in'))) {
        return cleaned;
      }
    }
  }
  return isRaj ? 'sso.rajasthan.gov.in' : 'आधिकारिक वेबसाइट';
};

const isSectionDeleted = (post: Partial<VacancyItem>, key: string): boolean => {
  return Array.isArray(post.deletedSectionKeys) && post.deletedSectionKeys.includes(key);
};

const isAgeLimitRelatedFaq = (item: { q?: string; qHi?: string; a?: string; aHi?: string }): boolean => {
  const combined = `${item.q || ''} ${item.qHi || ''} ${item.a || ''} ${item.aHi || ''}`.toLowerCase();
  return (
    combined.includes('age limit') ||
    combined.includes('आयु सीमा') ||
    combined.includes('न्यूनतम आयु') ||
    combined.includes('अधिकतम आयु')
  );
};

const cleanAdmitCarryDocs = (post: Partial<VacancyItem>, shortNameHi: string): string[] => {
  const defaultItems = [
    `${shortNameHi} ई-एडमिट कार्ड का स्पष्ट प्रिंटआउट (रंगीन या ब्लैक एंड व्हाइट)`,
    'मूल वैध फोटो पहचान पत्र (आधार कार्ड / पैन कार्ड / वोटर आईडी / ड्राइविंग लाइसेंस / पासपोर्ट)',
    '2 नवीनतम पासपोर्ट साइज रंगीन फोटोग्राफ (2.5 सेमी × 2.5 सेमी)',
    'पारदर्शी नीला बॉल पॉइंट पेन (Transparent Blue Ball Point Pen)',
  ];

  const rawDocs = post.requiredDocumentsHi;
  if (!Array.isArray(rawDocs) || rawDocs.length === 0) {
    return defaultItems;
  }

  const hasAdmitDoc = rawDocs.some(
    (d) =>
      d.includes('एडमिट') ||
      d.includes('प्रवेश पत्र') ||
      d.includes('कॉल लेटर') ||
      d.includes('हॉल टिकट')
  );
  const hasAppMarksheet = rawDocs.some(
    (d) => d.includes('अंकतालिका') || d.includes('मूल निवास') || d.includes('जाति प्रमाण')
  );

  if (!hasAdmitDoc || hasAppMarksheet) {
    return defaultItems;
  }

  return rawDocs
    .map((d) => stripCleanText(d))
    .filter(Boolean);
};

const mergeCustomFaqs = (
  generated: DynamicFaqItem[],
  customFaqs: Array<{ q?: string; qHi?: string; a?: string; aHi?: string }> | undefined,
  isRaj: boolean,
  excludeAgeLimit: boolean
): DynamicFaqItem[] => {
  if (!Array.isArray(customFaqs) || customFaqs.length === 0) {
    return generated;
  }

  const normalizedExisting = generated.map((g) => g.qHi.toLowerCase());
  const merged = [...generated];

  for (const cf of customFaqs) {
    if (!cf || (!cf.qHi && !cf.q) || (!cf.aHi && !cf.a)) continue;
    if (excludeAgeLimit && isAgeLimitRelatedFaq(cf)) continue;

    const cleanQHi = sanitizeSsoText(cf.qHi || cf.q || '', isRaj, true);
    const cleanQ = sanitizeSsoText(cf.q || cf.qHi || '', isRaj, false);
    const cleanAHi = sanitizeSsoText(cf.aHi || cf.a || '', isRaj, true);
    const cleanA = sanitizeSsoText(cf.a || cf.aHi || '', isRaj, false);

    if (!cleanQHi || !cleanAHi) continue;

    // Avoid near-duplicate questions that cover the exact same topic as dynamic generated ones
    const lowerQ = cleanQHi.toLowerCase();
    const isDuplicate = normalizedExisting.some(
      (ex) =>
        ex === lowerQ ||
        (lowerQ.includes('कब जारी') && ex.includes('कब जारी')) ||
        (lowerQ.includes('परीक्षा कब') && ex.includes('परीक्षा का समय')) ||
        (lowerQ.includes('कैसे डाउनलोड') && (ex.includes('कैसे निकालें') || ex.includes('कैसे डाउनलोड')))
    );

    if (!isDuplicate) {
      merged.push({
        q: cleanQ,
        qHi: cleanQHi,
        a: cleanA,
        aHi: cleanAHi,
      });
      normalizedExisting.push(lowerQ);
    }
  }

  return merged;
};

/**
 * Generates dynamic, page-content-driven FAQs for any post.
 * Specializes deeply in Admit Card & Result posts (no Age Limit, SSO strictly scoped to Rajasthan).
 */
export const generateDynamicPostFaqs = (post: Partial<VacancyItem>): DynamicFaqItem[] => {
  const isAdmitCardPost = post.category === 'admit_card' || post.status === 'admit_card_out';
  const isResultPost = post.category === 'result' || post.status === 'result_declared';
  const isYojana = post.category === 'scheme';
  const isRaj = isRajasthanRelatedPost(post);

  const shortNameHi = stripCleanText(
    (post.shortTitleHi || post.postNameHi || post.titleHi || post.shortTitle || post.title || 'परीक्षा').split(':')[0]
  );
  const shortNameEn = stripCleanText(
    (post.shortTitle || post.postName || post.title || 'Exam').split(':')[0]
  );
  const examNameHi = stripCleanText(post.postNameHi || post.postName || shortNameHi);
  const orgNameHi = stripCleanText(post.departmentHi || post.department || post.organization || 'संबंधित विभाग / बोर्ड');
  const orgNameEn = stripCleanText(post.department || post.organization || 'Concerned Department / Board');
  const portalHost = extractPortalHost(post, isRaj);

  const resolvedDates = resolveJobDates(post);
  const admitCardDateDisplay = formatDisplayDate(resolvedDates.admitCardDate, 'परीक्षा से 7 दिन पूर्व');
  const examDateDisplay = formatDisplayDate(resolvedDates.examDate, 'यथासमय घोषित');
  const notificationDateDisplay = formatDisplayDate(resolvedDates.notificationDate, 'नवीनतम अपडेट');
  const applyStartDateDisplay = formatDisplayDate(resolvedDates.applyStartDate, 'शीघ्र');
  const applyLastDateDisplay = formatDisplayDate(resolvedDates.applyLastDate, 'शीघ्र');

  // 1. ADMIT CARD SECTION POSTS
  if (isAdmitCardPost) {
    const admitTitles = getAdmitCardTitles(post);
    const faqs: DynamicFaqItem[] = [];
    const summarySnippetHi = stripCleanText(post.briefSummaryHi || '');

    if (!isSectionDeleted(post, 'admit_released')) {
      const isReleased = post.status === 'admit_card_out';
      faqs.push({
        q: `When will ${shortNameEn} Admit Card be released and where to download?`,
        qHi: `${admitTitles.admitReleased} — एडमिट कार्ड कब और कहां से डाउनलोड करें?`,
        a: sanitizeSsoText(
          `${orgNameEn} ${isReleased ? 'has released' : 'will release'} the e-Admit Card for ${shortNameEn} on ${admitCardDateDisplay}. Registered candidates can download it online from ${isRaj ? `sso.rajasthan.gov.in or ${portalHost}` : portalHost}.`,
          isRaj,
          false
        ),
        aHi: sanitizeSsoText(
          `${orgNameHi} द्वारा ${examNameHi} के प्रवेश पत्र ${admitCardDateDisplay} से ${isReleased ? 'आधिकारिक रूप से जारी कर दिए गए हैं' : 'उपलब्ध होंगे'}। अभ्यर्थी ${isRaj ? `राजस्थान SSO पोर्टल (sso.rajasthan.gov.in) व आधिकारिक वेबसाइट (${portalHost})` : `आधिकारिक पोर्टल (${portalHost})`} के माध्यम से ऑनलाइन एडमिट कार्ड डाउनलोड कर सकते हैं।${summarySnippetHi ? ` ${summarySnippetHi}` : ''}`,
          isRaj,
          true
        ),
      });
    }

    if (!isSectionDeleted(post, 'admit_exam_time')) {
      const patternDurationHi = stripCleanText(post.examPattern?.durationHi || '');
      const patternModeHi = stripCleanText(post.examPattern?.examModeHi || '');
      const totalMarksHi = post.examPattern?.totalMarks ? `कुल अंक: ${post.examPattern.totalMarks}` : '';
      const shiftTextHi = admitTitles.isCet12th
        ? 'परीक्षा दो पारियों में आयोजित होगी — प्रथम पारी (Shift-I Morning): सुबह 09:00 AM से दोपहर 12:00 PM तक, तथा द्वितीय पारी (Shift-II Evening): दोपहर 03:00 PM से शाम 06:00 PM तक।'
        : `${patternDurationHi ? `परीक्षा अवधि: ${patternDurationHi}। ` : ''}परीक्षा शिफ्ट एवं समय का विवरण अभ्यर्थी के ई-एडमिट कार्ड पर अंकित रहेगा।`;

      faqs.push({
        q: `What is the ${shortNameEn} exam date and shift timing?`,
        qHi: `${admitTitles.examTime} क्या है?`,
        a: `${shortNameEn} examination is scheduled on ${examDateDisplay}${post.examPattern?.duration ? ` (${post.examPattern.duration})` : ''}. Exam center gate closes strictly 60 minutes before the shift begins.`,
        aHi: `${examNameHi} परीक्षा का आयोजन ${examDateDisplay} को${post.jobLocation ? ` (${stripCleanText(post.jobLocation)})` : ''} किया जाएगा। ${shiftTextHi}${patternModeHi ? ` परीक्षा मोड: ${patternModeHi}` : ''}${totalMarksHi ? ` (${totalMarksHi})` : ''}।`,
      });
    }

    if (!isSectionDeleted(post, 'admit_sso_download')) {
      if (isRaj) {
        faqs.push({
          q: `How to download ${shortNameEn} Admit Card via SSO ID or Official Portal?`,
          qHi: admitTitles.ssoDownload,
          a: `Log in at sso.rajasthan.gov.in using your SSO ID and password, open Citizen Apps (G2C) -> Recruitment Portal, click "Get Admit Card", and download the PDF. Alternatively, use Application Number and Date of Birth on ${portalHost}.`,
          aHi: `सबसे पहले sso.rajasthan.gov.in ओपन करें और अपनी SSO ID व पासवर्ड से लॉगिन करें। डैशबोर्ड पर "Citizen Apps (G2C)" में जाकर "Recruitment Portal" खोलें, ऊपर "Get Admit Card" टैब चुनें और अपनी परीक्षा (${shortNameHi}) के सामने क्लिक कर PDF डाउनलोड करें। आप ${portalHost} पर भी एप्लीकेशन नंबर व जन्मतिथि से प्रवेश पत्र निकाल सकते हैं।`,
        });
      } else {
        faqs.push({
          q: `How to download ${shortNameEn} Admit Card from ${portalHost}?`,
          qHi: admitTitles.ssoDownload,
          a: `Visit the official portal ${portalHost}, open the Call Letter / Admit Card login link, enter your Registration Number or Roll Number along with Password or Date of Birth (DD-MM-YY), and print the hall ticket.`,
          aHi: `सबसे पहले आधिकारिक वेबसाइट ${portalHost} पर जाएं और Call Letter / Admit Card लॉगिन पेज खोलें। अपना Registration Number / Roll Number तथा पासवर्ड या जन्मतिथि (DD-MM-YY) व कैप्चा कोड दर्ज कर लॉगिन करें और प्रवेश पत्र का प्रिंटआउट निकालें।`,
        });
      }
    }

    if (!isSectionDeleted(post, 'admit_reporting_time')) {
      faqs.push({
        q: `What is the reporting time and gate closing time for ${shortNameEn} exam?`,
        qHi: admitTitles.reportingTime,
        a: 'Candidates must report to the examination center 90 to 120 minutes before the scheduled start time. The main entry gate closes strictly 60 minutes (1 hour) before the exam begins.',
        aHi: 'अभ्यर्थियों को परीक्षा प्रारंभ होने से कम से कम 90 से 120 मिनट (1.5 से 2 घंटे) पूर्व परीक्षा केंद्र पर पहुंचना अनिवार्य है। बायोमेट्रिक उपस्थिति व सुरक्षा जांच के कारण परीक्षा शुरू होने से ठीक 1 घंटे (60 मिनट) पहले मुख्य गेट बंद कर दिया जाएगा, जिसके बाद प्रवेश नहीं मिलेगा।',
      });
    }

    if (!isSectionDeleted(post, 'admit_what_to_carry') || !isSectionDeleted(post, 'admit_check_details')) {
      const carryItems = cleanAdmitCarryDocs(post, shortNameHi);
      faqs.push({
        q: `What documents and items should I carry to the ${shortNameEn} exam center?`,
        qHi: admitTitles.whatToCarry,
        a: 'Carry a printed e-Admit Card, one valid original photo ID (Aadhaar Card / PAN / Voter ID / Driving License / Passport), 2 recent passport-size color photographs, and a transparent blue ballpoint pen. Electronic gadgets, smartwatches, mobile phones, and calculators are strictly prohibited.',
        aHi: `परीक्षा केंद्र पर ये दस्तावेज व सामग्री साथ ले जाना अनिवार्य है: ${carryItems.join('; ')}। सादा व हल्के ड्रेस कोड का पालन करें। मोबाइल फोन, स्मार्ट वॉच, ब्लूटूथ, कैलकुलेटर व इलेक्ट्रॉनिक उपकरण पूर्णतः वर्जित हैं। डाउनलोड के बाद एडमिट कार्ड में नाम, रोल नंबर, परीक्षा तिथि, पारी, परीक्षा केंद्र व फोटो-हस्ताक्षर अवश्य जांच लें।`,
      });
    }

    if (!isSectionDeleted(post, 'admit_troubleshoot')) {
      faqs.push({
        q: `What should I do if ${shortNameEn} Admit Card is not downloading?`,
        qHi: admitTitles.troubleshoot,
        a: sanitizeSsoText(
          `High server traffic may slow down ${portalHost}. Try again during off-peak hours in Google Chrome or Firefox Incognito Mode, verify your Registration ID and Date of Birth (DD/MM/YYYY), use the Forgot Password option if needed, or contact the ${stripCleanText(post.organization) || orgNameEn} helpdesk.`,
          isRaj,
          false
        ),
        aHi: sanitizeSsoText(
          `एडमिट कार्ड जारी होते समय वेबसाइट पर भारी ट्रैफिक होने पर कुछ मिनट बाद या सुबह/रात्रि में पुनः प्रयास करें। Google Chrome या Firefox के Incognito Mode में ${isRaj ? `sso.rajasthan.gov.in या ${portalHost}` : portalHost} खोलें, आवेदन रसीद से अपना Registration / Application Number व जन्मतिथि (DD/MM/YYYY) सही मिलान कर भरें। तकनीकी या विवरण त्रुटि के लिए ${stripCleanText(post.organization) || orgNameHi} हेल्पडेस्क से संपर्क करें।`,
          isRaj,
          true
        ),
      });
    }

    return mergeCustomFaqs(faqs, post.faqs, isRaj, true);
  }

  // 2. RESULT SECTION POSTS
  if (isResultPost) {
    const selectionListHi =
      Array.isArray(post.selectionProcessHi) && post.selectionProcessHi.length > 0
        ? post.selectionProcessHi.map((s) => stripCleanText(s)).filter(Boolean).join(' → ')
        : 'दस्तावेज सत्यापन (Document Verification) एवं अंतिम मेरिट सूची';
    const selectionListEn =
      Array.isArray(post.selectionProcess) && post.selectionProcess.length > 0
        ? post.selectionProcess.map((s) => stripCleanText(s)).filter(Boolean).join(' -> ')
        : 'Document Verification and Final Merit List';

    const totalPostsLabel = stripCleanText(String(post.totalPosts || 'विज्ञप्ति अनुसार'));
    const qualLabelHi = stripCleanText(post.qualificationDetailsHi || post.qualificationDetails || 'आधिकारिक विज्ञप्ति अनुसार निर्धारित शैक्षणिक योग्यता');
    const salaryLabelHi = stripCleanText(post.salaryHi || post.salary || '');
    const summaryResultHi = stripCleanText(post.briefSummaryHi || '');
    const descResultHi = stripCleanText(post.descriptionHi || '');
    const hasResultPdf = Boolean(post.officialLinks?.resultPdfUrl);

    const resultDetailsSec = (post.customSections || []).find(
      (s) =>
        s.tableData &&
        (s.id === 'result-details' ||
          (s.title || '').toLowerCase().includes('result details') ||
          (s.titleHi || '').toLowerCase().includes('result details'))
    );
    const cutoffRowsSummaryHi = resultDetailsSec?.tableData?.rows
      ? resultDetailsSec.tableData.rows
          .filter((r) => Array.isArray(r) && r[0]?.trim() && r[1]?.trim())
          .map((r) => `${stripCleanText(r[0])}: ${stripCleanText(r[1])}`)
          .join(', ')
      : '';

    const faqs: DynamicFaqItem[] = [
      {
        q: `How to check ${shortNameEn} online?`,
        qHi: `${shortNameHi} कब जारी हुआ और ऑनलाइन रिजल्ट कैसे चेक करें?`,
        a: sanitizeSsoText(
          `${orgNameEn} has declared ${shortNameEn} (${notificationDateDisplay}) on ${portalHost}. Candidates can check their result status / scorecard or search their Roll Number in the merit list PDF via the direct link on this page.`,
          isRaj,
          false
        ),
        aHi: sanitizeSsoText(
          `${orgNameHi} द्वारा ${examNameHi} का आधिकारिक परिणाम (${notificationDateDisplay}) को ${portalHost} पर जारी कर दिया गया है। अभ्यर्थी इस पृष्ठ पर दिए गए डायरेक्ट लिंक से ${hasResultPdf ? 'मेरिट लिस्ट PDF डाउनलोड कर रोल नंबर/नाम के अनुसार' : 'लॉगिन विवरण (रोल नंबर/रजिस्ट्रेशन नंबर व जन्मतिथि) दर्ज कर'} अपना रिजल्ट देख सकते हैं।${summaryResultHi ? ` ${summaryResultHi}` : ''}`,
          isRaj,
          true
        ),
      },
      {
        q: `Where can I check ${shortNameEn} Merit List PDF and Category-wise Cut-Off Marks?`,
        qHi: `${shortNameHi} मेरिट लिस्ट PDF और कैटेगरी वाइज कट-ऑफ मार्क्स कैसे देखें?`,
        a: sanitizeSsoText(
          `The category-wise Cut-Off marks (General, OBC, EWS, SC, ST) and shortlisted Roll Number Merit List PDF are published on ${portalHost}.${cutoffRowsSummaryHi ? ` Cut-off details: ${cutoffRowsSummaryHi}.` : ''} Open the PDF and use Ctrl+F to search your Roll Number.`,
          isRaj,
          false
        ),
        aHi: sanitizeSsoText(
          `${shortNameHi} की आधिकारिक मेरिट लिस्ट PDF एवं वर्गवार कट-ऑफ अंक (General / OBC / EWS / SC / ST) ${portalHost} तथा ऊपर तालिका में उपलब्ध हैं।${cutoffRowsSummaryHi ? ` श्रेणीवार कट-ऑफ अंक: ${cutoffRowsSummaryHi}।` : ''} PDF खोलकर Ctrl+F (Find) की मदद से अपना रोल नंबर तुरंत खोज सकते हैं।${descResultHi ? ` ${descResultHi}` : ''}`,
          isRaj,
          true
        ),
      },
      {
        q: `What is the next selection stage after ${shortNameEn}?`,
        qHi: `${shortNameHi} में सफल होने के बाद आगे की चयन प्रक्रिया (Next Stage) क्या है?`,
        a: `Candidates shortlisted in ${shortNameEn} will proceed to the upcoming selection stages: ${selectionListEn}. Keep all original educational and identity documents ready.`,
        aHi: `इस परीक्षा परिणाम में सफल घोषित अभ्यर्थियों के लिए चयन प्रक्रिया के चरण इस प्रकार हैं: ${selectionListHi}। शॉर्टलिस्ट अभ्यर्थियों को अगले चरण व दस्तावेज सत्यापन के लिए आधिकारिक सूचना अनुसार उपस्थित होना होगा।`,
      },
      {
        q: `How many total posts and qualifications are covered under ${shortNameEn}?`,
        qHi: `${shortNameHi} के अंतर्गत कुल कितने पद हैं और किस योग्यता हेतु परिणाम जारी हुआ है?`,
        a: `This result covers ${totalPostsLabel} posts (${qualLabelHi})${post.jobLocation ? ` in ${stripCleanText(post.jobLocation)}` : ''}.`,
        aHi: `यह परिणाम कुल ${totalPostsLabel} पदों के लिए जारी किया गया है। निर्धारित शैक्षणिक योग्यता: ${qualLabelHi}।${salaryLabelHi ? ` वेतनमान: ${salaryLabelHi}।` : ''}${post.jobLocation ? ` कार्यक्षेत्र: ${stripCleanText(post.jobLocation)}।` : ''}`,
      },
      {
        q: `What to do if ${shortNameEn} PDF or Scorecard is not opening?`,
        qHi: `यदि ${shortNameHi} मेरिट लिस्ट PDF या स्कोरकार्ड नहीं खुल रहा तो क्या करें?`,
        a: sanitizeSsoText(
          `Heavy traffic on ${portalHost} may temporarily slow down result links. Refresh after a few minutes or open in Incognito Mode, verify your Roll Number and Date of Birth (DD/MM/YYYY), and check official notices on ${portalHost}.`,
          isRaj,
          false
        ),
        aHi: sanitizeSsoText(
          `रिजल्ट जारी होने के बाद ${portalHost} पर अधिक ट्रैफिक होने पर कुछ देर बाद या Google Chrome के Incognito Mode में पुनः प्रयास करें। स्कोरकार्ड के लिए अपना सही रोल नंबर/रजिस्ट्रेशन नंबर व जन्मतिथि दर्ज करें और केवल आधिकारिक वेबसाइट (${portalHost}) पर जारी सूची से ही मिलान करें।`,
          isRaj,
          true
        ),
      },
    ];

    return mergeCustomFaqs(faqs, post.faqs, isRaj, true);
  }

  // 3. EXISTING CUSTOM FAQS (FOR JOBS / YOJANA / NEWS / EXAM DATE / SYLLABUS)
  if (Array.isArray(post.faqs) && post.faqs.length > 0) {
    return post.faqs.map((f) => ({
      q: sanitizeSsoText(f.q || f.qHi || '', isRaj, false),
      qHi: sanitizeSsoText(f.qHi || f.q || '', isRaj, true),
      a: sanitizeSsoText(f.a || f.aHi || '', isRaj, false),
      aHi: sanitizeSsoText(f.aHi || f.a || '', isRaj, true),
    }));
  }

  // 4. YOJANA / SCHEME FALLBACK
  if (isYojana) {
    const benefitHi = stripCleanText(
      post.yojanaOverview?.maxAnnualAssistance ||
        post.yojanaOverview?.monthlyAssistance ||
        post.salaryHi ||
        post.salary ||
        'पात्र लाभार्थियों को सरकारी नियमानुसार वित्तीय सहायता एवं योजना लाभ प्रदान किया जाता है।'
    );
    const qualHi = stripCleanText(
      post.qualificationDetailsHi ||
        post.qualificationDetails ||
        'संबंधित राज्य के मूल निवासी जो विभाग द्वारा निर्धारित पात्रता शर्तें पूरी करते हैं।'
    );
    return [
      {
        q: `What benefit is provided under ${shortNameEn}?`,
        qHi: `${shortNameHi} के अंतर्गत लाभार्थियों को क्या लाभ / सहायता मिलती है?`,
        a: stripCleanText(post.yojanaOverview?.maxAnnualAssistance || post.salary || 'Financial assistance and scheme benefits as per official norms.'),
        aHi: benefitHi,
      },
      {
        q: `Who is eligible to apply for ${shortNameEn}?`,
        qHi: `इस सरकारी योजना के लिए कौन-कौन पात्र (Eligible) हैं?`,
        a: stripCleanText(post.qualificationDetails || 'Eligible citizens fulfilling department norms.'),
        aHi: qualHi,
      },
      {
        q: `What is the last date to apply for ${shortNameEn}?`,
        qHi: `इस योजना में आवेदन करने की अंतिम तिथि क्या है?`,
        a: `Applications can be submitted from ${applyStartDateDisplay} to ${applyLastDateDisplay}.`,
        aHi: `योजना के अंतर्गत आवेदन ${applyStartDateDisplay} से ${applyLastDateDisplay} तक किए जा सकते हैं।`,
      },
      {
        q: `How to apply online for ${shortNameEn}?`,
        qHi: `${shortNameHi} के लिए ऑनलाइन आवेदन कैसे करें?`,
        a: isRaj
          ? `Eligible applicants can apply online via ${portalHost} / Rajasthan SSO or nearest E-Mitra center.`
          : `Eligible applicants can apply online via the official scheme portal (${portalHost}) or nearest CSC center.`,
        aHi: isRaj
          ? `पात्र आवेदक संबंधित आधिकारिक पोर्टल (${portalHost}) अथवा नजदीकी E-Mitra केंद्र के माध्यम से ऑनलाइन आवेदन कर सकते हैं।`
          : `पात्र आवेदक संबंधित आधिकारिक पोर्टल (${portalHost}) अथवा नजदीकी CSC / सेवा केंद्र के माध्यम से ऑनलाइन आवेदन कर सकते हैं।`,
      },
    ];
  }

  // 5. STANDARD RECRUITMENT / JOB FALLBACK
  return [
    {
      q: `What is the last date to apply for ${shortNameEn}?`,
      qHi: `${shortNameHi} के लिए ऑनलाइन आवेदन की अंतिम तिथि क्या है?`,
      a: `The last date to submit the application form is ${applyLastDateDisplay}.`,
      aHi: `ऑनलाइन आवेदन करने की अंतिम तिथि ${applyLastDateDisplay} है। अभ्यर्थी निर्धारित समय से पूर्व अपना आवेदन अवश्य सबमिट कर लें।`,
    },
    {
      q: `When did ${shortNameEn} notification release and application start?`,
      qHi: `${shortNameHi} का नोटिफिकेशन कब जारी हुआ और आवेदन कब से शुरू हुए?`,
      a: `Official notification was released on ${notificationDateDisplay} and online application started on ${applyStartDateDisplay}.`,
      aHi: `आधिकारिक विस्तृत अधिसूचना ${notificationDateDisplay} को जारी की गई थी तथा ऑनलाइन आवेदन की प्रक्रिया ${applyStartDateDisplay} से प्रारंभ है।`,
    },
    {
      q: `What are the official website and total vacancies for ${shortNameEn}?`,
      qHi: `${shortNameHi} के लिए आधिकारिक वेबसाइट और कुल पद संख्या क्या है?`,
      a: `Total posts: ${post.totalPosts || 'As per notification'}. Apply and verify full notification at ${portalHost}.`,
      aHi: `कुल पद/विवरण: ${post.totalPosts || 'विज्ञप्ति अनुसार'}। अभ्यर्थी आधिकारिक वेबसाइट (${portalHost}) अथवा इस पृष्ठ पर दिए गए डायरेक्ट लिंक से संपूर्ण जानकारी व ऑनलाइन फॉर्म प्राप्त कर सकते हैं।`,
    },
    {
      q: `What is the educational qualification required for ${shortNameEn}?`,
      qHi: `${shortNameHi} के लिए शैक्षणिक योग्यता क्या है?`,
      a: stripCleanText(post.qualificationDetails || 'Candidates must possess required educational qualification as per notification.'),
      aHi: stripCleanText(post.qualificationDetailsHi || post.qualificationDetails || 'पद अनुसार 10वीं / 12वीं / स्नातक / संबंधित डिग्री उत्तीर्ण होना अनिवार्य है।'),
    },
  ];
};

/**
 * Generates dynamic FAQs for category archive pages (specifically Admit Card & Result sections)
 * directly from the live list of posts in that section.
 */
export const generateCategoryArchiveFaqs = (
  category: string,
  posts: VacancyItem[],
  lang: LanguageMode = 'hi'
): DynamicFaqItem[] => {
  const normCat = normalizeBreadcrumbCategoryKey(category);
  const matchingPosts = posts.filter((v) => {
    if (normCat === 'admit_card') return v.category === 'admit_card' || v.status === 'admit_card_out';
    if (normCat === 'result') return v.category === 'result' || v.status === 'result_declared';
    return v.category === normCat;
  });

  const topPosts = matchingPosts.slice(0, 6);
  const topNamesHi = topPosts
    .map((p) => stripCleanText(p.shortTitleHi || p.shortTitle || p.titleHi))
    .filter(Boolean)
    .join(', ');
  const hasRajPosts = topPosts.some((p) => isRajasthanRelatedPost(p));

  if (normCat === 'admit_card') {
    const datesSummaryHi = topPosts
      .slice(0, 4)
      .map((p) => {
        const d = resolveJobDates(p);
        const name = stripCleanText(p.shortTitleHi || p.shortTitle || p.titleHi);
        return `${name} (${formatDisplayDate(d.examDate, 'यथासमय घोषित')})`;
      })
      .join(' | ');

    return [
      {
        q: 'Which latest Admit Cards 2026 are currently available for download?',
        qHi: 'वर्तमान में कौन-कौन सी परीक्षाओं के एडमिट कार्ड 2026 जारी व उपलब्ध हैं?',
        a: `Currently active admit cards include ${topPosts.map((p) => p.shortTitle || p.title).join(', ') || 'Rajasthan & Central Govt exams'}.`,
        aHi: topNamesHi
          ? `वर्तमान में ${topNamesHi} सहित सभी सक्रिय परीक्षाओं के एडमिट कार्ड डायरेक्ट लिंक व परीक्षा तिथि के साथ यहाँ उपलब्ध हैं।`
          : 'राजस्थान एवं केंद्र सरकार की सभी नवीनतम परीक्षाओं के एडमिट कार्ड व कॉल लेटर यहाँ उपलब्ध हैं।',
      },
      {
        q: 'How to download Rajasthan and Central Govt exam Admit Cards?',
        qHi: 'राजस्थान व केंद्रीय परीक्षाओं के एडमिट कार्ड ऑनलाइन कैसे डाउनलोड करें?',
        a: hasRajPosts
          ? 'Rajasthan exams (RSSB/RPSC) admit cards can be downloaded via SSO ID (sso.rajasthan.gov.in -> Recruitment Portal -> Get Admit Card) or board websites, while IBPS/SSC hall tickets require Registration Number and Date of Birth on the respective official portal.'
          : 'Download admit cards directly from the official exam board portal using your Registration Number or Roll Number and Date of Birth / Password.',
        aHi: hasRajPosts
          ? 'राजस्थान की परीक्षाओं (जैसे Rajasthan CET, RPSC, RSSB) के एडमिट कार्ड sso.rajasthan.gov.in पर Recruitment Portal -> Get Admit Card से तथा केंद्रीय परीक्षाओं (जैसे IBPS, SSC) के कॉल लेटर संबंधित आधिकारिक वेबसाइट पर रजिस्ट्रेशन नंबर व जन्मतिथि डालकर डाउनलोड किए जा सकते हैं।'
          : 'अभ्यर्थी संबंधित भर्ती बोर्ड के आधिकारिक पोर्टल पर जाकर अपने रजिस्ट्रेशन नंबर / रोल नंबर और पासवर्ड या जन्मतिथि के माध्यम से प्रवेश पत्र डाउनलोड कर सकते हैं।',
      },
      {
        q: 'What are the upcoming exam dates and reporting rules for active Admit Cards?',
        qHi: 'प्रमुख एडमिट कार्ड की परीक्षा तिथियां और परीक्षा केंद्र के नियम क्या हैं?',
        a: 'Candidates should report 90-120 minutes early as exam gates close 60 minutes prior to start time. Carry printed Admit Card, valid original photo ID, 2 color passport photos, and transparent blue pen.',
        aHi: `${datesSummaryHi ? `प्रमुख परीक्षा तिथियां: ${datesSummaryHi}। ` : ''}परीक्षा केंद्र पर 90 से 120 मिनट पहले पहुंचें (प्रवेश द्वार परीक्षा से 60 मिनट पहले बंद होगा)। साथ में ई-एडमिट कार्ड प्रिंटआउट, मूल फोटो पहचान पत्र, 2 पासपोर्ट फोटो व पारदर्शी नीला बॉल पेन अवश्य ले जाएं।`,
      },
    ];
  }

  if (normCat === 'result') {
    const resultSummaryHi = topPosts
      .slice(0, 4)
      .map((p) => {
        const name = stripCleanText(p.shortTitleHi || p.shortTitle || p.titleHi);
        const total = stripCleanText(String(p.totalPosts || ''));
        return total && total !== 'विभिन्न पद' ? `${name} (${total})` : name;
      })
      .join(' | ');

    return [
      {
        q: 'Which latest Sarkari Results 2026 have been declared recently?',
        qHi: 'वर्तमान में कौन-कौन से प्रमुख सरकारी परीक्षा परिणाम (Result 2026) जारी हो चुके हैं?',
        a: `Recently declared results include ${topPosts.map((p) => p.shortTitle || p.title).join(', ') || 'SSC, RSMSSB, and IBPS exams'}.`,
        aHi: topNamesHi
          ? `वर्तमान में ${topNamesHi} सहित प्रमुख भर्ती परीक्षाओं के रिजल्ट, मेरिट लिस्ट PDF व कट-ऑफ मार्क्स जारी हो चुके हैं।`
          : 'राजस्थान एवं केंद्र सरकार की सभी प्रमुख भर्ती परीक्षाओं के ताज़ा परिणाम व मेरिट सूची यहाँ उपलब्ध हैं।',
      },
      {
        q: 'How to check Merit List PDF, Cut-Off Marks, and Scorecard?',
        qHi: 'परीक्षा परिणाम की मेरिट लिस्ट PDF, कट-ऑफ मार्क्स व स्कोरकार्ड कैसे देखें?',
        a: 'Open the declared result post to access the official Merit List PDF link, check category-wise cut-off (General, OBC, EWS, SC, ST), and search your Roll Number using Ctrl+F or login with Registration Number and DOB for scorecards.',
        aHi: `${resultSummaryHi ? `सक्रिय परिणाम: ${resultSummaryHi}। ` : ''}संबंधित रिजल्ट पोस्ट खोलकर Important Links से आधिकारिक मेरिट लिस्ट PDF डाउनलोड करें (Ctrl+F से रोल नंबर खोजें) अथवा स्कोरकार्ड के लिए रजिस्ट्रेशन नंबर व जन्मतिथि से लॉगिन करें।`,
      },
      {
        q: 'What is the next selection process after the declaration of Result?',
        qHi: 'रिजल्ट जारी होने के बाद चयनित अभ्यर्थियों के लिए आगे की प्रक्रिया क्या होती है?',
        a: 'Shortlisted candidates proceed to Mains Exam, Skill Test, Interview, or Document Verification (DV) as notified by the conducting commission.',
        aHi: 'परिणाम में सफल अभ्यर्थियों को संबंधित भर्ती बोर्ड (जैसे RSSB, RPSC, SSC, IBPS) के शेड्यूल अनुसार मुख्य परीक्षा, साक्षात्कार या दस्तावेज सत्यापन (Document Verification) प्रक्रिया में शामिल होना होता है।',
      },
    ];
  }

  return getDefaultHomeFaqs(lang);
};

export const getDefaultHomeFaqs = (lang: LanguageMode = 'hi'): DynamicFaqItem[] => {
  if (lang === 'en') {
    return [
      {
        q: 'How to apply online for Rajasthan Government Jobs via SSO ID?',
        qHi: 'राजस्थान सरकारी भर्तियों के लिए SSO ID से ऑनलाइन आवेदन कैसे करें?',
        a: 'Log in at sso.rajasthan.gov.in, select Recruitment Portal, complete One Time Registration (OTR), and click Apply Now for the desired recruitment.',
        aHi: 'sso.rajasthan.gov.in पर लॉगिन करें, Recruitment Portal चुनें, One Time Registration (OTR) पूरा करें और इच्छित भर्ती के सामने Apply Now पर क्लिक करें।',
      },
      {
        q: 'How much is the One Time Registration (OTR) fee in Rajasthan?',
        qHi: 'One Time Registration (OTR) फीस कितनी है?',
        a: '₹600 for General/Creamy Layer OBC and ₹400 for Non-Creamy Layer OBC/EWS/SC/ST/PH of Rajasthan. After one-time payment, all state recruitment forms are free.',
        aHi: 'सामान्य व क्रीमीलेयर पिछड़ा वर्ग के लिए ₹600/- तथा राजस्थान के नॉन-क्रीमीलेयर OBC/EWS/SC/ST/PH के लिए ₹400/-। एक बार भुगतान के बाद सभी भर्ती फॉर्म निःशुल्क हैं।',
      },
      {
        q: 'How can I download Rajasthan & Central Govt Admit Cards and Results?',
        qHi: 'राजस्थान व केंद्रीय भर्तियों के एडमिट कार्ड और रिजल्ट कैसे डाउनलोड करें?',
        a: 'Visit the Admit Card or Result section on Rajasthan Vacancy Portal, open the official exam post, and use the verified portal or direct PDF links.',
        aHi: 'Rajasthan Vacancy पोर्टल के Admit Card या Result सेक्शन में जाकर संबंधित परीक्षा पोस्ट खोलें और दिए गए आधिकारिक डायरेक्ट लिंक से प्रवेश पत्र या मेरिट लिस्ट PDF डाउनलोड करें।',
      },
    ];
  }

  return [
    {
      q: 'How to apply online for Rajasthan Government Jobs via SSO ID?',
      qHi: 'राजस्थान सरकारी भर्तियों के लिए SSO ID से ऑनलाइन आवेदन कैसे करें?',
      a: 'Log in at sso.rajasthan.gov.in, select Recruitment Portal, complete One Time Registration (OTR), and click Apply Now for the desired recruitment.',
      aHi: 'sso.rajasthan.gov.in पर लॉगिन करें, Recruitment Portal चुनें, One Time Registration (OTR) पूरा करें और इच्छित भर्ती के सामने Apply Now पर क्लिक करें।',
    },
    {
      q: 'How much is the One Time Registration (OTR) fee in Rajasthan?',
      qHi: 'One Time Registration (OTR) फीस कितनी है?',
      a: '₹600 for General/Creamy Layer OBC and ₹400 for Non-Creamy Layer OBC/EWS/SC/ST/PH of Rajasthan.',
      aHi: 'सामान्य व क्रीमीलेयर पिछड़ा वर्ग के लिए ₹600/- तथा राजस्थान के नॉन-क्रीमीलेयर OBC/EWS/SC/ST/PH के लिए ₹400/-। एक बार भुगतान के बाद सभी भर्ती फॉर्म निःशुल्क हैं।',
    },
    {
      q: 'How can I download Admit Cards and check Sarkari Results 2026?',
      qHi: 'परीक्षा एडमिट कार्ड और रिजल्ट कैसे डाउनलोड करें?',
      a: 'Open the relevant Admit Card or Result post to access official portal download steps, exam dates, and direct merit list PDF links.',
      aHi: 'Admit Card या Result सेक्शन में संबंधित परीक्षा खोलकर आधिकारिक पोर्टल (राजस्थान परीक्षाओं हेतु SSO ID या केंद्रीय परीक्षाओं हेतु संबंधित वेबसाइट) व डायरेक्ट लिंक से डाउनलोड कर सकते हैं।',
    },
  ];
};

export interface BuildFaqSchemaOptions {
  vacancy?: Partial<VacancyItem> | null;
  category?: string | null;
  vacancies?: VacancyItem[];
  lang?: LanguageMode;
  origin?: string;
}

/**
 * Produces a valid Schema.org FAQPage JSON-LD object dynamically derived from
 * either a single post, a category archive (e.g. Admit Card / Result), or the portal home.
 */
export const buildFaqPageSchemaObject = ({
  vacancy = null,
  category = null,
  vacancies = [],
  lang = 'hi',
  origin,
}: BuildFaqSchemaOptions = {}) => {
  const isHi = lang === 'hi';
  const baseOrigin = (origin || getCanonicalOrigin()).replace(/\/+$/, '');

  let pageId = `${baseOrigin}/#faq`;
  let faqItems: DynamicFaqItem[];

  if (vacancy && vacancy.id) {
    const canonicalUrl = buildCanonicalUrl({ vacancyId: vacancy.id });
    pageId = `${canonicalUrl}#faq`;
    faqItems = generateDynamicPostFaqs(vacancy);
  } else if (category && category.toUpperCase() !== 'ALL') {
    const normCat = normalizeBreadcrumbCategoryKey(category);
    const catCanonical = buildCanonicalUrl({ category: normCat });
    pageId = `${catCanonical}#faq`;
    faqItems = generateCategoryArchiveFaqs(normCat, vacancies, lang);
  } else {
    faqItems = getDefaultHomeFaqs(lang);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': pageId,
    mainEntity: faqItems
      .filter((item) => Boolean((isHi ? item.qHi || item.q : item.q) && (isHi ? item.aHi || item.a : item.a)))
      .map((item) => ({
        '@type': 'Question',
        name: stripCleanText(isHi ? item.qHi || item.q : item.q || item.qHi),
        acceptedAnswer: {
          '@type': 'Answer',
          text: stripCleanText(isHi ? item.aHi || item.a : item.a || item.aHi),
        },
      })),
  };
};

export const buildFaqPageJsonLd = (options: BuildFaqSchemaOptions = {}): string => {
  return JSON.stringify(buildFaqPageSchemaObject(options), null, 2);
};
