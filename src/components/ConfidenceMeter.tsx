import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Language, translations } from '../translations';

interface ConfidenceMeterProps {
  confidence: 'low' | 'medium' | 'high';
  soilSource: 'district_average' | 'user_reported' | 'soil_health_card';
  currentLang: Language;
  expectedErrorPct?: number;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  soilSource,
  currentLang,
  expectedErrorPct,
}) => {
  const t = translations[currentLang];

  const dotCount = confidence === 'high' ? 3 : confidence === 'medium' ? 2 : 1;

  const getConfidenceLabel = () => {
    switch (confidence) {
      case 'high':
        return t.confidenceHigh;
      case 'medium':
        return t.confidenceMedium;
      case 'low':
      default:
        return t.confidenceLow;
    }
  };

  const getReasonText = () => {
    switch (soilSource) {
      case 'soil_health_card':
        return t.confidenceReasonCard;
      case 'user_reported':
        return t.confidenceReasonReported;
      case 'district_average':
      default:
        return t.confidenceReasonUnknown;
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-base sm:text-lg">
              {t.confidenceTitle}:
            </span>
            <span className="font-bold text-[#1B5E20] text-base sm:text-lg">
              {getConfidenceLabel()}
            </span>
            {expectedErrorPct !== undefined && expectedErrorPct !== null && (
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                {t.confidenceTypicalError.replace('{pct}', String(expectedErrorPct))}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{getReasonText()}</span>
          </p>
        </div>
      </div>

      {/* 3-Dot Meter */}
      <div className="flex items-center gap-2 self-end sm:self-center bg-[#F1F8E9] px-3.5 py-2 rounded-2xl border border-[#C8E6C9]">
        {[1, 2, 3].map((dotIndex) => {
          const isActive = dotIndex <= dotCount;
          return (
            <div
              key={dotIndex}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-[#2E7D32] scale-110 shadow-xs'
                  : 'bg-gray-300'
              }`}
              title={`Level ${dotIndex}`}
            />
          );
        })}
      </div>
    </div>
  );
};
