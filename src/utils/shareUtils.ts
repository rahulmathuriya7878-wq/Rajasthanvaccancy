import { VacancyItem } from '../types';

/**
 * Generate comprehensive Hindi share text for any vacancy / yojana / result / admit card
 * formatted with WhatsApp friendly bolding and emojis.
 */
export function generateHindiShareText(item: VacancyItem, customUrl?: string): string {
  const shareUrl = customUrl || (typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?vacancy=${item.id}` 
    : `https://rajasthanvacancy.in/?vacancy=${item.id}`);

  const titleHi = item.titleHi || item.title;
  const category = item.category;
  const status = item.status;
  const isScheme = category === 'scheme' || item.organization === 'Sarkari Yojana';

  const dept = item.departmentHi || item.department || item.organization;
  const postName = item.postNameHi || item.postName || titleHi;
  const postsCount = typeof item.totalPosts === 'number' 
    ? `${item.totalPosts.toLocaleString('hi-IN')} पद` 
    : (item.totalPosts || 'विभिन्न पद');

  // 1. Sarkari Yojana (सरकारी योजना)
  if (isScheme) {
    const benefit = item.yojanaOverview?.monthlyAssistance || 
      item.yojanaOverview?.maxAnnualAssistance || 
      item.salaryHi || 
      item.salary || 
      'सरकारी वित्तीय सहायता एवं अनुदान';
    const beneficiaries = item.yojanaOverview?.beneficiaries || 
      item.qualificationDetailsHi || 
      'राजस्थान के मूल निवासी छात्र एवं नागरिक';
    const startDate = item.importantDates?.applyStartDate || 'आवेदन प्रक्रिया जारी';
    const lastDate = item.yojanaOverview?.applyLastDate || item.importantDates?.applyLastDate || 'TBA';

    return [
      `📢 *${titleHi}*`,
      `🏛️ *विभाग:* ${dept}`,
      `🎁 *योजना का लाभ:* ${benefit}`,
      `👥 *पात्रता / लाभार्थी:* ${beneficiaries}`,
      `📅 *आवेदन शुरू तिथि:* ${startDate}`,
      `⏰ *आवेदन की अंतिम तिथि:* ${lastDate}`,
      ``,
      `🔗 *ऑनलाइन आवेदन फॉर्म व योजना की पूरी जानकारी यहाँ देखें:*`,
      `${shareUrl}`,
      ``,
      `👉 *इस महत्वपूर्ण जनकल्याणकारी योजना की जानकारी जरूरतमंद साथियों व परिवारों तक अवश्य शेयर करें!*`
    ].join('\n');
  }

  // 2. Admit Card (प्रवेश पत्र)
  if (category === 'admit_card' || status === 'admit_card_out') {
    const admitCardDate = item.importantDates?.admitCardDate || 'जारी कर दिया गया है';
    const examDate = item.importantDates?.examDate || 'नोटिफिकेशन में देखें';

    return [
      `📢 *${titleHi} - एडमिट कार्ड जारी*`,
      `🏢 *भर्ती बोर्ड / विभाग:* ${dept}`,
      `📌 *पद का नाम:* ${postName}`,
      `👥 *कुल पद:* ${postsCount}`,
      `🎟️ *एडमिट कार्ड जारी तिथि:* ${admitCardDate}`,
      `📅 *परीक्षा तिथि:* ${examDate}`,
      ``,
      `🔗 *प्रवेश पत्र (Admit Card) डाउनलोड करने हेतु यहाँ क्लिक करें:*`,
      `${shareUrl}`,
      ``,
      `👉 *अपने परीक्षा देने वाले सभी साथियों के साथ तुरंत शेयर करें!*`
    ].join('\n');
  }

  // 3. Answer Key (उत्तर कुंजी)
  if (category === 'answer_key' || status === 'answer_key_out') {
    const keyDate = item.importantDates?.notificationDate || 'जारी कर दी गई है';
    const feeDate = item.importantDates?.feeLastDate || item.importantDates?.applyLastDate || 'आधिकारिक वेबसाइट देखें';

    return [
      `📢 *${titleHi} - उत्तर कुंजी (Answer Key) जारी*`,
      `🏢 *भर्ती बोर्ड / विभाग:* ${dept}`,
      `📌 *पद का नाम:* ${postName}`,
      `🔑 *आंसर-की जारी तिथि:* ${keyDate}`,
      `⏰ *आपत्ति दर्ज कराने की अंतिम तिथि:* ${feeDate}`,
      ``,
      `🔗 *आंसर-की डाउनलोड करने व आपत्ति दर्ज करने हेतु यहाँ क्लिक करें:*`,
      `${shareUrl}`,
      ``,
      `👉 *अपने सभी साथियों के साथ शेयर करें ताकि वे समय पर आपत्ति दर्ज कर सकें!*`
    ].join('\n');
  }

  // 4. Result (परीक्षा परिणाम)
  if (category === 'result' || status === 'result_declared') {
    const resultDate = item.importantDates?.resultDate || 'घोषित कर दिया गया है';

    return [
      `📢 *${titleHi} - परीक्षा परिणाम घोषित*`,
      `🏢 *भर्ती बोर्ड / विभाग:* ${dept}`,
      `📌 *पद का नाम:* ${postName}`,
      `👥 *कुल पद:* ${postsCount}`,
      `🏆 *रिजल्ट जारी तिथि:* ${resultDate}`,
      ``,
      `🔗 *रिजल्ट व मेरिट लिस्ट देखने हेतु यहाँ क्लिक करें:*`,
      `${shareUrl}`,
      ``,
      `👉 *अपने सभी परीक्षार्थी साथियों के साथ तुरंत शेयर करें!*`
    ].join('\n');
  }

  // 5. Standard Recruitment / Job (सरकारी भर्ती)
  const qualification = item.qualificationDetailsHi || 
    item.qualificationDetails || 
    (item.qualification && item.qualification.length > 0 ? item.qualification.join(' / ') : '10वीं / 12वीं / स्नातक पास');
  
  const ageLimitText = item.ageLimit 
    ? `${item.ageLimit.min} से ${item.ageLimit.max} वर्ष (आयु गणना: ${item.ageLimit.asOnDate || '01.01.2026'})` 
    : 'नियमों के अनुसार';

  let feeText = 'सामान्य/OBC: ₹600, SC/ST/EWS: ₹400';
  if (item.applicationFee) {
    const gen = item.applicationFee.genObc !== undefined ? `सामान्य/OBC: ₹${item.applicationFee.genObc}` : '';
    const reserved = item.applicationFee.scSt !== undefined ? `SC/ST: ₹${item.applicationFee.scSt}` : '';
    const otr = item.applicationFee.otrNoteHi ? ` (${item.applicationFee.otrNoteHi})` : '';
    feeText = [gen, reserved].filter(Boolean).join(', ') + otr;
    if (!feeText) feeText = 'निःशुल्क / OTR लागू';
  }

  const startDate = item.importantDates?.applyStartDate || 'आवेदन शुरू';
  const lastDate = item.importantDates?.applyLastDate || 'TBA';
  const examDate = item.importantDates?.examDate;

  const lines = [
    `📢 *${titleHi}*`,
    `🏢 *विभाग / भर्ती बोर्ड:* ${dept}`,
    `📌 *पद का नाम:* ${postName}`,
    `👥 *कुल पद:* ${postsCount}`,
    `🎓 *शैक्षणिक योग्यता:* ${qualification}`,
    `⏳ *आयु सीमा:* ${ageLimitText}`,
    `💰 *आवेदन शुल्क:* ${feeText}`,
    `📅 *आवेदन शुरू तिथि:* ${startDate}`,
    `⏰ *आवेदन की अंतिम तिथि:* ${lastDate}`
  ];

  if (examDate) {
    lines.push(`📝 *संभावित परीक्षा तिथि:* ${examDate}`);
  }

  lines.push(
    ``,
    `🔗 *ऑनलाइन फॉर्म भरने व संपूर्ण विवरण हेतु यहाँ क्लिक करें:*`,
    `${shareUrl}`,
    ``,
    `👉 *अपने सभी बेरोजगार साथियों एवं WhatsApp ग्रुप्स में जरूर शेयर करें ताकि किसी की अंतिम तिथि न छूटे!*`
  );

  return lines.join('\n');
}
