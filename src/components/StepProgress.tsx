import React from 'react';
import { Language, translations } from '../translations';
import { Check } from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  currentLang: Language;
  onStepClick?: (step: number) => void;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  currentLang,
  onStepClick,
}) => {
  const t = translations[currentLang];
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const stepTitles: Record<Language, string[]> = {
    hi: ['जगह', 'फसल', 'खेत'],
    en: ['Location', 'Crop', 'Farm'],
  };

  return (
    <div className="w-full bg-[#FFFDF7] pt-1 pb-4 mb-3 select-none" aria-label="Progress">
      <div className="flex items-center justify-between text-sm sm:text-base font-semibold text-[#1B5E20] mb-2 px-1">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
          <span>
            {t.stepLabel} {currentStep} {t.ofStep} {totalSteps}: {stepTitles[currentLang][currentStep - 1]}
          </span>
        </span>
        <span className="text-xs sm:text-sm text-gray-500 font-medium">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>

      {/* Progress Track */}
      <div
        className="w-full bg-[#E8E4D8] h-2.5 rounded-full overflow-hidden p-0.5"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        <div
          className="bg-gradient-to-r from-[#2E7D32] to-[#43A047] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(15, progressPercent || 15)}%` }}
        />
      </div>

      {/* Clickable Step indicators */}
      <div className="flex justify-between items-center mt-2 px-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;
          const isClickable = isDone && Boolean(onStepClick);

          return (
            <button
              key={step}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step)}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-[#2E7D32] text-white shadow-xs cursor-default'
                  : isDone
                  ? 'text-[#2E7D32] bg-[#E8F5E9] hover:bg-[#C8E6C9] cursor-pointer'
                  : 'text-gray-400 bg-transparent cursor-not-allowed'
              }`}
              title={isDone ? `Jump back to Step ${step}` : undefined}
            >
              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
              <span>{stepTitles[currentLang][step - 1]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
