import React from 'react';
import { HeartHandshake, Smartphone, Building2, PhoneCall, ArrowRight } from 'lucide-react';
import { Language, translations } from '../translations';

interface AboutViewProps {
  currentLang: Language;
  onStartPredict: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  currentLang,
  onStartPredict,
}) => {
  const t = translations[currentLang];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-20 pt-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B5E20]">
          {t.aboutTitle}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
          {t.aboutSubtitle}
        </p>
      </div>

      <div className="space-y-5">
        {/* Mission */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E4D8] shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0 shadow-2xs mt-1">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {t.aboutMissionTitle}
            </h3>
            <p className="text-base text-gray-600 mt-2 leading-relaxed">
              {t.aboutMissionDesc}
            </p>
          </div>
        </div>

        {/* Simplicity */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E4D8] shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFDE7] text-[#F9A825] flex items-center justify-center shrink-0 shadow-2xs mt-1">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {t.aboutSimplicityTitle}
            </h3>
            <p className="text-base text-gray-600 mt-2 leading-relaxed">
              {t.aboutSimplicityDesc}
            </p>
          </div>
        </div>

        {/* KVK Support */}
        <div className="bg-[#F1F8E9] rounded-3xl p-6 sm:p-7 border border-[#C8E6C9] shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#1B5E20]">
              {t.aboutKvkTitle}
            </h3>
            <p className="text-base text-gray-700 mt-2 leading-relaxed">
              {t.aboutKvkDesc}
            </p>
            <div className="mt-4 p-3 bg-white rounded-xl border border-[#A5D6A7] flex items-center gap-2 text-sm sm:text-base font-bold text-[#1B5E20]">
              <PhoneCall className="w-5 h-5 text-[#2E7D32]" />
              <span>{t.aboutTollFree}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="text-center pt-4">
        <button
          onClick={onStartPredict}
          className="btn-primary-gradient px-8 py-4 text-lg inline-flex items-center gap-3 shadow-md active:scale-95"
        >
          <span>{t.heroCta}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
