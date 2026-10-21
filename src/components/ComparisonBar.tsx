import React from 'react';
import { YieldMetrics } from '../utils/rating';
import { Language, translations } from '../translations';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

interface ComparisonBarProps {
  metrics: YieldMetrics;
  districtName: string;
  currentLang: Language;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  metrics,
  districtName,
  currentLang,
}) => {
  const t = translations[currentLang];
  const { rating, quintalPerAcre, districtAvgQuintalPerAcre } = metrics;

  const maxValue = Math.max(quintalPerAcre, districtAvgQuintalPerAcre, 1);
  const yourBarWidth = Math.min(100, Math.round((quintalPerAcre / maxValue) * 100));
  const districtBarWidth = Math.min(100, Math.round((districtAvgQuintalPerAcre / maxValue) * 100));

  const summarySentence =
    currentLang === 'hi' ? rating.summarySentence_hi : rating.summarySentence_en;

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E4D8] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="card-title text-gray-900">
            {t.comparisonTitle}
          </h3>
          <p className="helper-text text-gray-500">
            {currentLang === 'hi'
              ? `${districtName} ज़िले के औसत से तुलना`
              : `Comparison with ${districtName} average`}
          </p>
        </div>

        {/* Dynamic Comparison Badge */}
        <div
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold self-start sm:self-auto"
          style={{
            backgroundColor: rating.bgColorHex,
            color: rating.textColorHex,
            border: `1px solid ${rating.borderColorHex}`,
          }}
        >
          {rating.isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : rating.isNeutral ? (
            <Minus className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5" />
          )}
          <span>{summarySentence}</span>
        </div>
      </div>

      {/* Comparison Bars Container */}
      <div className="space-y-3.5">
        {/* Your Field Estimate Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="flex items-center gap-1.5 text-gray-900">
              <span
                className="w-3 h-3 rounded-xs inline-block"
                style={{ backgroundColor: rating.colorHex }}
              />
              <span>{currentLang === 'hi' ? 'आपका अनुमान' : 'Your Estimate'}</span>
            </span>
            <span className="tabular-nums font-bold text-gray-900 text-sm">
              {quintalPerAcre}{' '}
              <span className="text-xs font-normal text-gray-500">
                {currentLang === 'hi' ? 'क्विंटल/एकड़' : 'Q/acre'}
              </span>
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-lg h-5 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-md transition-all duration-700 ease-out flex items-center justify-end pr-2 text-white text-xs font-bold"
              style={{
                width: `${Math.max(12, yourBarWidth)}%`,
                backgroundColor: rating.colorHex,
              }}
            >
              {yourBarWidth >= 25 && `${quintalPerAcre}`}
            </div>
          </div>
        </div>

        {/* District Average Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-3 h-3 rounded-xs bg-gray-400 inline-block" />
              <span>
                {currentLang === 'hi' ? 'ज़िले की आम पैदावार' : 'District Average'}
              </span>
            </span>
            <span className="tabular-nums font-bold text-gray-700 text-sm">
              {districtAvgQuintalPerAcre}{' '}
              <span className="text-xs font-normal text-gray-500">
                {currentLang === 'hi' ? 'क्विंटल/एकड़' : 'Q/acre'}
              </span>
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-lg h-5 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-md bg-gray-400 transition-all duration-700 ease-out flex items-center justify-end pr-2 text-white text-xs font-bold"
              style={{
                width: `${Math.max(12, districtBarWidth)}%`,
              }}
            >
              {districtBarWidth >= 25 && `${districtAvgQuintalPerAcre}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
