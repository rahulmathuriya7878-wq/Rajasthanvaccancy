import React from 'react';
import { LanguageMode } from '../types';
import { ShieldCheck, ArrowLeft, Lock, Database, Eye, Bell, UserCheck } from 'lucide-react';

interface PrivacyPolicyProps {
  lang: LanguageMode;
  onBack: () => void;
  onOpenAdminLogin?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ lang, onBack, onOpenAdminLogin }) => {
  const isHi = lang === 'hi';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white rounded-2xl shadow-xs border border-slate-200 my-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isHi ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
      </button>

      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isHi ? 'गोपनीयता नीति (Comprehensive Privacy Policy)' : 'Comprehensive Privacy Policy'}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {isHi ? 'अंतिम अपडेट: नवंबर 2026 | Rajasthan Vacancy (www.rajasthanvacancy.online)' : 'Last Updated: November 2026 | www.rajasthanvacancy.online'}
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <p>
            {isHi
              ? 'Rajasthan Vacancy ("हम", "हमारा", या "पोर्टल") अपने सभी आकांक्षी उपयोगकर्ताओं, पाठकों एवं अभ्यर्थियों की गोपनीयता (Privacy) की रक्षा करने के लिए पूरी तरह प्रतिबद्ध है। यह विस्तृत गोपनीयता नीति दस्तावेज स्पष्ट करता है कि जब आप हमारी वेबसाइट (https://www.rajasthanvacancy.online/) पर आते हैं, तो हम आपकी कौन-कौन सी जानकारी एकत्र करते हैं, उसका उपयोग किन उद्देश्यों के लिए करते हैं और उसकी सुरक्षा कैसे सुनिश्चित करते हैं।'
              : 'Rajasthan Vacancy (https://www.rajasthanvacancy.online/) is fully committed to protecting the privacy of all aspirants, readers, and candidates visiting our platform.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600" />
            <span>1. हम कौन सी जानकारी एकत्र करते हैं? (Information Collection)</span>
          </h2>
          <p>
            {isHi
              ? 'जब आप हमारे पोर्टल का उपयोग करते हैं, तो हम निम्नलिखित श्रेणियों में डेटा एकत्र कर सकते हैं:'
              : 'When you use our portal, we may collect the following categories of data:'}
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>{isHi ? 'लॉग डेटा और तकनीकी जानकारी:' : 'Log Data & Technical Info:'}</strong> {isHi ? 'आपका IP पता, ब्राउज़र का प्रकार (Chrome, Safari, Firefox आदि), ऑपरेटिंग सिस्टम, विज़िट की तारीख और समय, और देखे गए पृष्ठ।' : 'Your IP address, browser type, OS, timestamps, and pages visited.'}
            </li>
            <li>
              <strong>{isHi ? 'खाता और वैयक्तिकरण डेटा:' : 'Account & Personalization Data:'}</strong> {isHi ? 'यदि आप गूगल लॉगिन या बुकमार्क (Saved Jobs) सुविधा का उपयोग करते हैं, तो आपका नाम, ईमेल आईडी और सहेजी गई नौकरियों की सूची केवल आपके ब्राउज़र/खाते में सिंक्रनाइज़ करने हेतु।' : 'If you use Google login or bookmarks, your name, email ID, and saved jobs list are stored strictly for user sync.'}
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>2. जानकारी का उपयोग (Use of Information)</span>
          </h2>
          <p>
            {isHi
              ? 'एकत्रित की गई जानकारी का उपयोग निम्नलिखित कार्यों के लिए किया जाता है:' : 'The collected information is used for the following purposes:'}
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>{isHi ? 'नवीनतम सरकारी नौकरियों, एडमिट कार्ड और परिणामों के त्वरित अलर्ट और सूचनाएं प्रदान करना।' : 'Providing instant job alerts, admit cards, and result notifications.'}</li>
            <li>{isHi ? 'वेबसाइट के प्रदर्शन, गति और यूजर इंटरफेस में निरंतर सुधार करना।' : 'Continuously improving website performance, speed, and user experience.'}</li>
            <li>{isHi ? 'उपयोगकर्ताओं की भाषा प्राथमिकता (हिंदी/अंग्रेजी) और सहेजी गई पोस्ट को याद रखना।' : 'Remembering user language preference (Hindi/English) and saved bookmarks.'}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>3. कुकीज़, Google AdSense और DoubleClick DART कुकी नीति (Cookies &amp; AdSense)</span>
          </h2>
          <p>
            {isHi
              ? 'हम अपने विज़िटर्स के ब्राउज़िंग अनुभव को बेहतर बनाने और पोर्टल की निःशुल्क सेवा जारी रखने के लिए कुकीज़ (Cookies) तथा Google AdSense सहित तृतीय-पक्ष विज्ञापन सेवाओं का उपयोग करते हैं। Google, एक तृतीय-पक्ष विक्रेता के रूप में, हमारी वेबसाइट (www.rajasthanvacancy.online) पर विज्ञापन दिखाने के लिए DoubleClick DART कुकी का उपयोग करता है, जिससे पाठकों को उनकी पूर्व वेबसाइट विज़िट के आधार पर प्रासंगिक विज्ञापन प्रदर्शित किए जा सकें।'
              : 'We use cookies and third-party advertising partners including Google AdSense. Google uses the DoubleClick DART cookie to serve ads to visitors based on their visits to www.rajasthanvacancy.online and other sites on the internet.'}
          </p>
          <p>
            {isHi ? (
              <>
                उपयोगकर्ता{' '}
                <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-blue-700">
                  Google Ads Settings
                </a>{' '}
                पर जाकर वैयक्तिकृत विज्ञापनों (Personalized Advertising) से बाहर निकल सकते हैं तथा{' '}
                <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-blue-700">
                  Google Advertising Privacy Policy
                </a>{' '}
                का अवलोकन कर सकते हैं। आप चाहें तो अपने ब्राउज़र की सेटिंग्स से भी कुकीज़ को नियंत्रित या बंद कर सकते हैं।
              </>
            ) : (
              <>
                Users may opt out of personalized advertising by visiting{' '}
                <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-blue-700">
                  Google Ads Settings
                </a>{' '}
                or reviewing the{' '}
                <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-blue-700">
                  Google Advertising Privacy Policy
                </a>.
              </>
            )}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>4. तृतीय-पक्ष की वेबसाइटें (Third-Party Links)</span>
          </h2>
          <p>
            {isHi
              ? 'हमारे पोर्टल पर RSMSSB, RPSC, राजस्थान पुलिस और अन्य सरकारी पोर्टलों के बाहरी लिंक्स दिए गए हैं। इन तृतीय-पक्ष वेबसाइटों की गोपनीयता नीतियां हमसे भिन्न होती हैं। हम उन वेबसाइटों की सामग्री या गोपनीयता प्रथाओं के लिए उत्तरदायी नहीं हैं।'
              : 'Our portal contains external links to RSMSSB, RPSC, and other government portals. We are not responsible for their privacy practices.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <span>5. नीति में परिवर्तन (Policy Updates)</span>
          </h2>
          <p>
            {isHi
              ? 'हम अपनी इस गोपनीयता नीति को समय-समय पर अपडेट कर सकते हैं। नीति में किसी भी बदलाव की सूचना इसी पृष्ठ पर प्रकाशित की जाएगी। continued use of the site signifies your acceptance of the updated policy.'
              : 'We may update this privacy policy from time to time. Updates will be posted on this page.'}
          </p>
        </section>

        {onOpenAdminLogin && (
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="text-slate-400 hover:text-slate-600 transition cursor-pointer text-xs flex items-center gap-1.5"
              title="Vacancy Updates"
            >
              <span>📋</span>
              <span>{isHi ? 'वैकेंसी (Vacancy)' : 'Vacancy Updates'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

