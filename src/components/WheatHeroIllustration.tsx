import React from 'react';

export const WheatHeroIllustration: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 select-none -z-10"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0 280C200 230 400 330 600 270C800 210 1000 290 1200 240V400H0V280Z"
          fill="#F1F8E9"
          fillOpacity="0.8"
        />
        <path
          d="M0 320C220 280 440 340 680 300C920 260 1080 330 1200 310V400H0V320Z"
          fill="#E8F5E9"
          fillOpacity="0.9"
        />
        {/* Stylized wheat stalks */}
        <g stroke="#F9A825" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6">
          {/* Stalk 1 */}
          <path d="M1020 380 Q1030 260 1060 180" />
          <path d="M1050 210 Q1075 200 1080 190" />
          <path d="M1045 230 Q1020 220 1015 210" />
          <path d="M1055 190 Q1080 180 1085 170" />
          <path d="M1050 170 Q1025 160 1020 150" />
          <path d="M1060 180 Q1065 140 1070 120" />

          {/* Stalk 2 */}
          <path d="M1080 380 Q1100 270 1120 190" />
          <path d="M1110 220 Q1135 210 1140 200" />
          <path d="M1105 240 Q1080 230 1075 220" />
          <path d="M1115 200 Q1140 190 1145 180" />
          <path d="M1120 190 Q1130 150 1135 130" />
        </g>
      </svg>
    </div>
  );
};
