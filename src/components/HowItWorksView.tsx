import React from 'react';
import { Database, CalendarDays, FlaskConical, BarChart3, AlertOctagon, ArrowRight } from 'lucide-react';
import { Language, translations } from '../translations';

interface HowItWorksViewProps {
  currentLang: Language;
  onStartPredict: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({
  currentLang,
  onStartPredict,
}) => {
  const t = translations[currentLang];

  const steps = [
    {
      icon: Database,
      title: t.timelineStep1Title,
      desc: t.timelineStep1Desc,
      color: 'bg-emerald-100 text-emerald-800',
    },
    {
      icon: CalendarDays,
      title: t.timelineStep2Title,
      desc: t.timelineStep2Desc,
      color: 'bg-amber-100 text-amber-800',
    },
    {
      icon: FlaskConical,
      title: t.timelineStep3Title,
      desc: t.timelineStep3Desc,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      icon: BarChart3,
      title: t.timelineStep4Title,
      desc: t.timelineStep4Desc,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  const limitations = [
    t.limitation1,
    t.limitation2,
    t.limitation3,
    t.limitation4,
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-20 pt-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1B5E20]">
          {t.hiwTitle}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
          {t.hiwSubtitle}
        </p>
      </div>

      {/* 4 Illustrated Steps */}
      <div className="space-y-4">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E4D8] shadow-xs flex items-start gap-4 transition-all hover:border-[#2E7D32]/40"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs mt-1 ${st.color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  {st.title}
                </h3>
                <p className="text-base text-gray-600 mt-1.5 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Honest Limitations Section ("सीमाएँ") */}
      <div className="bg-[#FFFDF7] rounded-3xl p-6 sm:p-8 border-2 border-[#EF9A9A] bg-gradient-to-b from-white to-[#FFEBEE]/30 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-[#C62828]">
          <AlertOctagon className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-bold">
            {t.limitationsTitle}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-gray-700 font-medium">
          {t.limitationsSubtitle}
        </p>

        <ul className="space-y-2.5 pt-2">
          {limitations.map((lim, idx) => (
            <li
              key={idx}
              className="text-sm sm:text-base text-gray-800 flex items-start gap-3 bg-white/80 p-3 rounded-xl border border-[#FFCDD2]"
            >
              <span className="font-bold text-[#C62828] text-lg leading-none shrink-0 mt-0.5">
                •
              </span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
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
