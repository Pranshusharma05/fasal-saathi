import React, { useEffect, useState } from 'react';
import { Sprout, Database, BarChart3 } from 'lucide-react';
import { Language, translations } from '../translations';

interface LoadingScreenProps {
  currentLang: Language;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    { text: t.loadingStep1, icon: Database },
    { text: t.loadingStep2, icon: BarChart3 },
    { text: t.loadingStep3, icon: Sprout },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 700);

    return () => clearInterval(timer);
  }, [steps.length]);

  const CurrentIcon = steps[currentStepIndex].icon;

  return (
    <div
      className="min-h-[460px] flex flex-col items-center justify-center p-6 text-center select-none"
      role="status"
      aria-live="polite"
    >
      {/* Animated Pulser */}
      <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#E8F5E9] animate-ping opacity-60" />
        <div className="absolute inset-2 rounded-full bg-[#C8E6C9] animate-pulse" />
        <div className="relative w-18 h-18 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-lg transition-transform duration-300 transform scale-105">
          <CurrentIcon className="w-9 h-9" />
        </div>
      </div>

      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1B5E20] mb-3">
        {t.loadingTitle}
      </h3>

      {/* Rotating status text */}
      <div className="h-10 flex items-center justify-center">
        <p className="text-lg sm:text-xl font-medium text-gray-700 transition-opacity duration-300">
          {steps[currentStepIndex].text}
        </p>
      </div>

      {/* Subtle loader bar */}
      <div className="w-56 bg-[#E8E4D8] h-2 rounded-full overflow-hidden mt-6">
        <div
          className="bg-[#2E7D32] h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      <p className="text-xs sm:text-sm text-gray-400 mt-4">
        {currentLang === 'hi'
          ? 'कृपया प्रतीक्षा करें, गणना प्रगति पर है'
          : 'Processing district historical data and baselines'}
      </p>
    </div>
  );
};
