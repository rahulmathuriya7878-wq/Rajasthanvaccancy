import React from 'react';
import { 
  X, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle, 
  FileCheck, 
  CreditCard,
  UserCheck
} from 'lucide-react';
import { LanguageMode } from '../types';

interface SSOGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
}

export const SSOGuideModal: React.FC<SSOGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  const steps = [
    {
      step: '1',
      title: isHi ? 'एसएसओ आईडी बनाएं (Create SSO ID)' : 'Create SSO ID',
      desc: isHi 
        ? 'sso.rajasthan.gov.in पर जाएं। "Registration" पर क्लिक कर अपने जन आधार कार्ड या गूगल खाते से निशुल्क एसएसओ आईडी बनाएं।'
        : 'Visit sso.rajasthan.gov.in, click "Registration" and create an account using Jan Aadhaar or Google.',
      icon: UserCheck
    },
    {
      step: '2',
      title: isHi ? 'रिक्रूटमेंट पोर्टल खोलें (Open Recruitment Portal)' : 'Open Recruitment Portal',
      desc: isHi
        ? 'लॉगिन करने के बाद Apps मेन्यू में "Recruitment Portal" (कर्मचारी चयन बोर्ड/आरपीएससी) आइकन पर क्लिक करें।'
        : 'After logging in, click "Recruitment Portal" in the Rajasthan citizen application list.',
      icon: FileCheck
    },
    {
      step: '3',
      title: isHi ? 'वन टाइम रजिस्ट्रेशन (OTR) पूरा करें' : 'Complete One Time Registration (OTR)',
      desc: isHi
        ? 'OTR टैब पर जाकर अपना नाम, पिता का नाम, जन्म तिथि व 10वीं मार्कशीट विवरण जन आधार द्वारा सत्यापित करें।'
        : 'Under OTR tab, verify your name, DOB, category and 10th marksheet credentials with Jan Aadhaar.',
      icon: CheckCircle2
    },
    {
      step: '4',
      title: isHi ? 'एकमुश्त शुल्क भुगतान (Pay OTR Fee Once)' : 'Pay OTR Fee (Once per Year)',
      desc: isHi
        ? 'सामान्य/ओबीसी को ₹600 एवं आरक्षित वर्ग को ₹400 का एकमुश्त शुल्क ऑनलाइन जमा करना होता है। इसके बाद सभी आवेदन निशुल्क होते हैं!'
        : 'Pay ₹600 (General/OBC Creamy) or ₹400 (Reserved) once. All subsequent forms throughout the year are free of cost.',
      icon: CreditCard
    },
    {
      step: '5',
      title: isHi ? 'ऑनलाइन आवेदन सबमिट करें (Apply Online)' : 'Submit Online Application',
      desc: isHi
        ? '"Ongoing Recruitment" सेक्शन में जाकर इच्छित भर्ती के सामने "Apply Now" पर क्लिक करें और फॉर्म सबमिट करें।'
        : 'Find your target vacancy in "Ongoing Recruitment" section, click "Apply Now" and submit.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                {isHi ? 'राजस्थान SSO OTR फॉर्म भरने की संपूर्ण गाइड' : 'Rajasthan SSO & OTR Complete Guide'}
              </h2>
              <p className="text-xs text-blue-100">
                {isHi ? 'sso.rajasthan.gov.in पर बिना गलती के फॉर्म कैसे भरें' : 'Step-by-step guidance for error-free Rajasthan online applications'}
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

        {/* Steps */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <div className="space-y-3">
            {steps.map((st) => (
              <div key={st.step} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
                  {st.step}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{st.title}</h4>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-amber-900 text-xs">
            <h5 className="font-bold mb-1">{isHi ? 'महत्वपूर्ण सावधानी (Common Mistakes to Avoid):' : 'Common Mistakes to Avoid:'}</h5>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700">
              <li>{isHi ? 'OTR में दर्ज नाम, पिता का नाम और जन्म तिथि 10वीं की मार्कशीट से अक्षरशः मिलना चाहिए।' : 'Name and DOB in OTR must strictly match 10th Class certificate.'}</li>
              <li>{isHi ? 'जन आधार में अपनी जाति श्रेणी (Category) पहले ही सही करा लें, क्योंकि OTR लॉक होने के बाद बदलाव कठिन होता है।' : 'Update caste category in Jan Aadhaar beforehand since OTR locking limits direct edits.'}</li>
              <li>{isHi ? 'अपनी हालिया पासपोर्ट साइज फोटो (1 माह से पुरानी न हो) ही अपलोड करें।' : 'Upload recent passport photograph (not older than 1 month) on white background.'}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
          <a
            href="https://sso.rajasthan.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1"
          >
            <span>{isHi ? 'सीधे SSO पोर्टल पर जाएं' : 'Open Rajasthan SSO Portal'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            {isHi ? 'समझ गया / बंद करें' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
