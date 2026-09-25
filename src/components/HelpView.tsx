import React, { useState } from 'react';
import { PhoneCall, HelpCircle, Volume2, ShieldCheck, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { speechService } from '../services/speech';

interface HelpViewProps {
  language: LanguageCode;
}

export const HelpView: React.FC<HelpViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Where do the market prices in AgriConnect come from?',
      a: 'All market prices are retrieved from the Government Open Data Platform India (data.gov.in) and Agmarknet portal, maintained by the Directorate of Marketing and Inspection, Ministry of Agriculture and Farmers Welfare, Government of India. No fake or random data is ever generated.',
    },
    {
      q: 'How can I discover the best price for my harvest?',
      a: 'Visit the "Market Prices" page, select your crop (e.g. Tomato), and compare modal prices across neighboring APMC Mandis. You can also view historical trends on the "Price Trend" page to decide the ideal harvest dispatch day.',
    },
    {
      q: 'Are the buyers on AgriConnect verified?',
      a: 'Yes, buyers listed in AgriConnect are verified agribusiness entities, cold chain operators, and FPO aggregators with audited procurement licenses and defined payment terms.',
    },
    {
      q: 'How does the voice search work?',
      a: 'Tap the microphone button on the top navigation or home screen and speak your question naturally in any of the 11 supported Indian languages (Tamil, Hindi, Telugu, Kannada, Marathi, Malayalam, Bengali, Gujarati, Punjabi, Odia, English). The system will fetch the real price and speak the answer back to you.',
    },
  ];

  const handleReadFaq = (text: string) => {
    speechService.speakText(text, language);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display">
          {t.helpTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Dedicated assistance, toll-free advisory helplines, and government mandi guidelines
        </p>
      </div>

      {/* Kisan Call Center Hero Helpline Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-emerald-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
            Government of India · Ministry of Agriculture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">{t.kisanCallCenter}</h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg">
            Free agricultural expert advice on mandi prices, crop disease management, and weather alerts in 22 regional Indian languages.
          </p>
        </div>

        <a
          href="tel:18001801551"
          className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white text-emerald-950 font-black text-lg shadow-lg hover:bg-emerald-50 transition-all transform active:scale-95 whitespace-nowrap"
        >
          <PhoneCall className="w-6 h-6 text-emerald-800 animate-bounce" />
          <span>{t.kisanNumber}</span>
        </a>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
        <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-800" />
          <span>{t.frequentlyAsked}</span>
        </h3>

        <div className="divide-y divide-stone-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-stone-900 focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="mt-3 text-xs text-stone-600 leading-relaxed pr-8 flex items-start justify-between gap-3">
                    <p>{faq.a}</p>
                    <button
                      onClick={() => handleReadFaq(`${faq.q}. ${faq.a}`)}
                      title="Listen to FAQ"
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-800 transition-colors shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
