import React from 'react';
import { CloudRain, Thermometer, Sprout, Sun } from 'lucide-react';
import { PredictionReason } from '../api/predict';
import { Language, translations } from '../translations';

interface ReasonListProps {
  reasons: PredictionReason[];
  currentLang: Language;
}

export const ReasonList: React.FC<ReasonListProps> = ({
  reasons,
  currentLang,
}) => {
  const t = translations[currentLang];

  const getFactorIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('बारिश') || lower.includes('rain') || lower.includes('नमी')) {
      return <CloudRain className="w-4 h-4 text-sky-600" />;
    }
    if (lower.includes('तापमान') || lower.includes('गर्मी') || lower.includes('temperature') || lower.includes('heat')) {
      return <Thermometer className="w-4 h-4 text-amber-600" />;
    }
    if (lower.includes('धूप') || lower.includes('प्रकाश') || lower.includes('sunshine')) {
      return <Sun className="w-4 h-4 text-yellow-600" />;
    }
    return <Sprout className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E4D8] shadow-xs">
      <div className="mb-3">
        <h3 className="card-title text-gray-900">
          {t.reasonsTitle}
        </h3>
        <p className="helper-text text-gray-500">
          {t.reasonsSubtitle}
        </p>
      </div>

      <div className="space-y-2">
        {reasons.slice(0, 3).map((reason, idx) => {
          const text = currentLang === 'hi' ? reason.text_hi : reason.text_en;
          const isPos = reason.impact === 'positive';
          const isNeg = reason.impact === 'negative';

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl flex items-center gap-3 border transition-all ${
                isPos
                  ? 'bg-[#F1F8E9]/70 border-[#C8E6C9]'
                  : isNeg
                  ? 'bg-[#FFEBEE]/70 border-[#FFCDD2]'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Factor context icon */}
              <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center shrink-0">
                {getFactorIcon(text)}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-snug">
                  {text}
                </p>
              </div>

              {/* Positive / Negative label (Requirement 5.6: 👍 फ़ायदेमंद or ⚠️ चिंता की बात) */}
              <div className="shrink-0">
                {isPos && (
                  <span className="text-xs font-semibold text-[#1B5E20] bg-white px-2 py-0.5 rounded-full border border-[#A5D6A7]">
                    {currentLang === 'hi' ? '👍 फ़ायदेमंद' : '👍 Favorable'}
                  </span>
                )}
                {isNeg && (
                  <span className="text-xs font-semibold text-[#B71C1C] bg-white px-2 py-0.5 rounded-full border border-[#EF9A9A]">
                    {currentLang === 'hi' ? '⚠️ चिंता की बात' : '⚠️ Concern'}
                  </span>
                )}
                {!isPos && !isNeg && (
                  <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    {currentLang === 'hi' ? 'सामान्य' : 'Neutral'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
