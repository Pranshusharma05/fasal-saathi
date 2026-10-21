import React from 'react';
import { Check } from 'lucide-react';
import { SoilOption } from '../data/options';
import { Language } from '../translations';

interface SoilCardProps {
  soil: SoilOption;
  isSelected: boolean;
  onSelect: (soilId: string) => void;
  currentLang: Language;
}

export const SoilCard: React.FC<SoilCardProps> = ({
  soil,
  isSelected,
  onSelect,
  currentLang,
}) => {
  const name = currentLang === 'hi' ? soil.name_hi : soil.name_en;
  const desc = currentLang === 'hi' ? soil.description_hi : soil.description_en;

  return (
    <button
      type="button"
      onClick={() => onSelect(soil.id)}
      className={`relative w-full p-3 rounded-2xl text-left border-2 transition-all duration-150 active:scale-[0.98] flex items-start gap-3 ${
        isSelected
          ? 'bg-[#F1F8E9] border-[#2E7D32] shadow-2xs ring-1 ring-[#2E7D32]/20'
          : 'bg-white border-[#E8E4D8] hover:border-[#2E7D32]/40 hover:bg-[#FFFDF7]'
      }`}
      aria-pressed={isSelected}
    >
      <span className="text-2xl shrink-0 select-none mt-0.5" role="img" aria-hidden="true">
        {soil.emoji}
      </span>

      <div className="flex-1 pr-6">
        <div className="font-semibold text-gray-900 text-[15px] leading-snug">
          {name}
        </div>
        <p className="text-[13px] text-gray-600 mt-0.5 leading-relaxed">
          {desc}
        </p>
      </div>

      <div
        className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
          isSelected
            ? 'bg-[#2E7D32] text-white'
            : 'border border-gray-300 bg-white'
        }`}
        aria-hidden="true"
      >
        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
      </div>
    </button>
  );
};
