import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, MinusCircle, TrendingDown, AlertTriangle } from 'lucide-react';
import { YieldMetrics } from '../utils/rating';
import { Language, translations } from '../translations';

interface RatingCardProps {
  metrics: YieldMetrics;
  cropName: string;
  currentLang: Language;
}

export const RatingCard: React.FC<RatingCardProps> = ({
  metrics,
  cropName,
  currentLang,
}) => {
  const t = translations[currentLang];
  const { rating } = metrics;

  // Count up animation for totalQuintal
  const [displayQuintal, setDisplayQuintal] = useState<number>(0);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplayQuintal(metrics.totalQuintal);
      return;
    }

    const duration = 800; // ms
    const steps = 24;
    const intervalTime = duration / steps;
    const increment = metrics.totalQuintal / steps;
    let current = 0;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      current += increment;
      if (stepCount >= steps) {
        setDisplayQuintal(metrics.totalQuintal);
        clearInterval(timer);
      } else {
        setDisplayQuintal(Math.round(current * 10) / 10);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [metrics.totalQuintal]);

  const renderIcon = () => {
    const iconClass = 'w-4 h-4 shrink-0';
    switch (rating.category) {
      case 'great':
        return <Sparkles className={iconClass} />;
      case 'good':
        return <CheckCircle2 className={iconClass} />;
      case 'normal':
        return <MinusCircle className={iconClass} />;
      case 'low':
        return <TrendingDown className={iconClass} />;
      case 'bad':
      default:
        return <AlertTriangle className={iconClass} />;
    }
  };

  const ratingLabel = currentLang === 'hi' ? rating.label_hi : rating.label_en;
  const unitLabel = metrics.unit === 'acre' ? t.unitAcre : t.unitHectare;

  return (
    <div
      className="w-full rounded-3xl p-6 sm:p-7 text-left border-2 shadow-sm transition-all relative overflow-hidden"
      style={{
        backgroundColor: rating.bgColorHex,
        borderColor: rating.borderColorHex,
      }}
    >
      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Rating Badge with Icon and Word */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs sm:text-sm shadow-2xs"
            style={{
              backgroundColor: rating.colorHex,
              color: '#FFFFFF',
            }}
          >
            {renderIcon()}
            <span>{ratingLabel}</span>
          </div>

          <span className="text-xs sm:text-sm font-semibold text-gray-700">
            {currentLang === 'hi'
              ? `${cropName} की संभावित पैदावार`
              : `${cropName} Estimated Harvest`}
          </span>
        </div>

        {/* Main Number in Farmer Units (Reduced to ~3.5rem to 4rem) */}
        <div className="mt-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-medium text-gray-700">
              {t.aboutPrefix}
            </span>
            <span
              className="text-[36px] sm:text-[44px] font-bold tracking-tight tabular-nums leading-none"
              style={{ color: rating.textColorHex }}
            >
              {displayQuintal.toLocaleString()}
            </span>
            <span className="text-[18px] font-semibold text-gray-800">
              {t.quintal}
            </span>
          </div>

          {/* Sub-line */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm sm:text-base font-medium text-gray-700">
            <span className="bg-white/90 px-3 py-1 rounded-xl border border-black/5 shadow-2xs">
              ({metrics.areaAcre} {unitLabel} {currentLang === 'hi' ? 'से' : ''})
            </span>
            <span className="text-gray-400 font-bold">·</span>
            <span className="bg-white/90 px-3 py-1 rounded-xl border border-black/5 font-semibold text-gray-900 shadow-2xs">
              = {metrics.quintalPerAcre} {t.perAcreRate}
            </span>
          </div>
        </div>

        {/* Technical Unit Line: Normal font with tabular numbers (no monospace) */}
        <div className="text-xs text-gray-600 font-medium tabular-nums pt-1">
          {metrics.tonPerHectare} ton/hectare ({metrics.quintalPerHectare} {t.perHectareRate})
        </div>

        {/* Range Line */}
        <div className="mt-1 pt-3 border-t border-black/10 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-semibold text-gray-800">
          <span className="text-gray-600">{t.rangePrefix}</span>
          <span className="bg-white/90 px-2.5 py-1 rounded-lg border border-black/5 tabular-nums text-gray-900 font-bold">
            {metrics.rangeLowQuintal} {t.rangeTo} {metrics.rangeHighQuintal} {t.quintal}
          </span>
        </div>
      </div>
    </div>
  );
};
