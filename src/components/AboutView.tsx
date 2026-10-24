import React, { useState, useEffect } from 'react';
import { HeartHandshake, Smartphone, Building2, PhoneCall, ArrowRight, Award } from 'lucide-react';
import { Language, translations } from '../translations';
import { getModelInfo, ModelInfoResponse } from '../api/predict';

interface AboutViewProps {
  currentLang: Language;
  onStartPredict: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  currentLang,
  onStartPredict,
}) => {
  const t = translations[currentLang];
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);

  useEffect(() => {
    getModelInfo()
      .then((data) => {
        if (data && typeof data.median_abs_pct_error === 'number') {
          setModelInfo(data);
        }
      })
      .catch(() => {
        setModelInfo(null);
      });
  }, []);

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

        {/* Model Accuracy Section - Fetched from /api/model-info */}
        {modelInfo && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E4D8] shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0 shadow-2xs">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t.aboutAccuracyTitle}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {modelInfo.model_name ? `${modelInfo.model_name} • ` : ''}
                  {t.aboutAccuracySubtitle}
                </p>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-[#F9FBE7] border border-[#E6EE9C] text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#33691E] block">
                  ~{modelInfo.median_abs_pct_error}%
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-700 mt-1 block">
                  {t.aboutAccuracyMedian}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9] text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1B5E20] block">
                  {modelInfo.within_25_pct}%
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-700 mt-1 block">
                  {t.aboutAccuracyWithin25}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2E7D32] block">
                  {modelInfo.within_50_pct}%
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-700 mt-1 block">
                  {t.aboutAccuracyWithin50}
                </span>
              </div>
            </div>

            {/* Limitation Note */}
            <p className="text-xs sm:text-sm text-gray-600 bg-[#FFFDF7] p-3 rounded-xl border border-[#E8E4D8] leading-relaxed">
              ⚠️ {t.aboutAccuracyLimitation}
            </p>
          </div>
        )}

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
