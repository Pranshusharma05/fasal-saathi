import React from 'react';
import { Lightbulb, PhoneCall } from 'lucide-react';
import { PredictionAdvice } from '../api/predict';
import { Language, translations } from '../translations';

interface AdviceCardProps {
  advice: PredictionAdvice[];
  currentLang: Language;
}

export const AdviceCard: React.FC<AdviceCardProps> = ({
  advice,
  currentLang,
}) => {
  const t = translations[currentLang];

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E4D8] shadow-sm">
      <div className="mb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>{t.adviceTitle}</span>
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {t.adviceSubtitle}
        </p>
      </div>

      {/* Advice Points */}
      <div className="space-y-3 mb-5">
        {advice.map((item, idx) => {
          const text = currentLang === 'hi' ? item.text_hi : item.text_en;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8E4D8] flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-full bg-[#F9A825]/20 text-[#F57F17] flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-800 leading-snug">
                {text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Krishi Vigyan Kendra (KVK) Advisory Note */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9] flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <PhoneCall className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-[#1B5E20] text-base sm:text-lg">
            {currentLang === 'hi'
              ? 'कृषि विज्ञान केंद्र (KVK) से संपर्क करें'
              : 'Consult Nearest Krishi Vigyan Kendra (KVK)'}
          </h4>
          <p className="text-sm sm:text-base text-gray-700 mt-1 leading-relaxed">
            {t.kvkContactNote}
          </p>
          <div className="mt-2 text-xs font-semibold text-[#1B5E20] bg-white/80 inline-block px-2.5 py-1 rounded-md border border-[#A5D6A7]">
            {t.aboutTollFree}
          </div>
        </div>
      </div>
    </div>
  );
};
