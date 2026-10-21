import React from 'react';
import { Check } from 'lucide-react';
import { CropOption } from '../data/options';
import { Language } from '../translations';

interface CropCardProps {
  crop: CropOption;
  isSelected: boolean;
  onSelect: (cropId: string) => void;
  currentLang: Language;
}

export const CropCard: React.FC<CropCardProps> = ({
  crop,
  isSelected,
  onSelect,
  currentLang,
}) => {
  const name = currentLang === 'hi' ? crop.name_hi : crop.name_en;
  const subName = currentLang === 'hi' ? crop.name_en : crop.name_hi;

  return (
    <button
      type="button"
      onClick={() => onSelect(crop.id)}
      className={`relative w-full min-h-[92px] p-3 rounded-2xl text-left border-2 transition-all duration-150 active:scale-[0.98] flex flex-col justify-between items-start gap-1.5 overflow-hidden ${
        isSelected
          ? 'bg-[#F1F8E9] border-[#2E7D32] shadow-sm ring-1 ring-[#2E7D32]/20'
          : 'bg-white border-[#E8E4D8] hover:border-[#2E7D32]/50 hover:bg-[#FFFDF7] shadow-2xs'
      }`}
      aria-pressed={isSelected}
      aria-label={name}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-3xl select-none" role="img" aria-label={name}>
          {crop.emoji}
        </span>
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-[#2E7D32] text-white'
              : 'border border-gray-300 bg-white'
          }`}
          aria-hidden="true"
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>

      <div className="w-full mt-0.5">
        <span className="text-[15px] font-semibold text-gray-900 leading-tight block overflow-wrap-anywhere">
          {name}
        </span>
        <span className="text-[12px] text-gray-500 font-normal block leading-tight mt-0.5 overflow-wrap-anywhere">
          {subName}
        </span>
      </div>
    </button>
  );
};
