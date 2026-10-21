import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  AlertTriangle,
  MinusCircle,
  TrendingUp,
} from 'lucide-react';
import { Language, translations } from '../translations';

type HeroBgId = 'wheat' | 'green' | 'sunlit' | 'sprouts';

const HERO_BACKGROUNDS: { id: HeroBgId; emoji: string; label_en: string; label_hi: string; src: string }[] = [
  { id: 'wheat', emoji: '🌾', label_en: 'Wheat', label_hi: 'गेहूँ', src: '/images/hero-bg/wheat.webp' },
  { id: 'green', emoji: '🌿', label_en: 'Green', label_hi: 'हरियाली', src: '/images/hero-bg/green.webp' },
  { id: 'sunlit', emoji: '🌞', label_en: 'Sunlit', label_hi: 'धूप', src: '/images/hero-bg/sunlit.webp' },
  { id: 'sprouts', emoji: '🌱', label_en: 'Sprouts', label_hi: 'अंकुर', src: '/images/hero-bg/sprouts.webp' },
];

interface HomeViewProps {
  currentLang: Language;
  onStartFreshPredict: () => void;
  onNavigate: (path: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentLang,
  onStartFreshPredict,
  onNavigate,
}) => {
  const t = translations[currentLang];

  // Rating preview tier for Sample Result Showcase
  const [showcaseRating, setShowcaseRating] = useState<'great' | 'good' | 'normal' | 'low' | 'bad'>('good');

  // Hero background switcher (choice is remembered in the browser)
  const [heroBg, setHeroBg] = useState<HeroBgId>(() => {
    try {
      const saved = localStorage.getItem('fasal_hero_bg') as HeroBgId | null;
      return saved && HERO_BACKGROUNDS.some((b) => b.id === saved) ? saved : 'wheat';
    } catch {
      return 'wheat';
    }
  });
  const handleHeroBg = (id: HeroBgId) => {
    setHeroBg(id);
    try {
      localStorage.setItem('fasal_hero_bg', id);
    } catch {
      /* ignore */
    }
  };

  // FAQ accordion open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works-editorial');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sample data states for interactive showcase
  const showcaseData = {
    great: {
      badge: currentLang === 'hi' ? 'बहुत अच्छी' : 'Very Good',
      color: '#2F7D3E',
      bg: '#FAF6EC',
      border: '#2F7D3E',
      total: '68',
      perAcre: '13.6',
      icon: Sparkles,
      comparison: currentLang === 'hi' ? 'ज़िला औसत से 24% अधिक' : '24% above district avg',
      diffColor: 'text-[#2F7D3E]',
    },
    good: {
      badge: currentLang === 'hi' ? 'अच्छी पैदावार' : 'Good Yield',
      color: '#2F7D3E',
      bg: '#FAF6EC',
      border: '#C9922E',
      total: '59',
      perAcre: '11.8',
      icon: CheckCircle2,
      comparison: currentLang === 'hi' ? 'ज़िला औसत से 9% अधिक' : '9% above district avg',
      diffColor: 'text-[#2F7D3E]',
    },
    normal: {
      badge: currentLang === 'hi' ? 'सामान्य' : 'Average',
      color: '#C9922E',
      bg: '#FAF6EC',
      border: '#C9922E',
      total: '53',
      perAcre: '10.6',
      icon: MinusCircle,
      comparison: currentLang === 'hi' ? 'ज़िला औसत के बराबर' : 'Equal to district avg',
      diffColor: 'text-[#C9922E]',
    },
    low: {
      badge: currentLang === 'hi' ? 'औसत से कम' : 'Below Average',
      color: '#C9922E',
      bg: '#FAF6EC',
      border: '#5B4636',
      total: '44',
      perAcre: '8.8',
      icon: TrendingDown,
      comparison: currentLang === 'hi' ? 'ज़िला औसत से 17% कम' : '17% below district avg',
      diffColor: 'text-[#5B4636]',
    },
    bad: {
      badge: currentLang === 'hi' ? 'ख़राब' : 'Poor',
      color: '#5B4636',
      bg: '#FAF6EC',
      border: '#5B4636',
      total: '36',
      perAcre: '7.2',
      icon: AlertTriangle,
      comparison: currentLang === 'hi' ? 'ज़िला औसत से 32% कम' : '32% below district avg',
      diffColor: 'text-[#5B4636]',
    },
  }[showcaseRating];

  const ShowcaseIcon = showcaseData.icon;

  // The 8 popular crops with real photos and bilingual names
  const popularCrops = [
    {
      id: 'wheat',
      name_hi: 'गेहूँ',
      name_en: 'Wheat',
      season_hi: 'रबी सीज़न',
      season_en: 'Rabi Season',
      image: '/images/crop-wheat.webp',
      span: 'col-span-2 md:col-span-2 md:row-span-2 min-h-[220px] md:min-h-[340px]',
    },
    {
      id: 'rice',
      name_hi: 'धान (चावल)',
      name_en: 'Rice / Paddy',
      season_hi: 'खरीफ सीज़न',
      season_en: 'Kharif Season',
      image: '/images/crop-rice.webp',
      span: 'col-span-1 md:col-span-1 md:row-span-2 min-h-[200px] md:min-h-[340px]',
    },
    {
      id: 'mustard',
      name_hi: 'सरसों',
      name_en: 'Mustard',
      season_hi: 'रबी सीज़न',
      season_en: 'Rabi Season',
      image: '/images/crop-mustard.webp',
      span: 'col-span-1 md:col-span-1 min-h-[160px]',
    },
    {
      id: 'cotton',
      name_hi: 'कपास',
      name_en: 'Cotton',
      season_hi: 'खरीफ सीज़न',
      season_en: 'Kharif Season',
      image: '/images/crop-cotton.webp',
      span: 'col-span-1 md:col-span-1 min-h-[160px]',
    },
    {
      id: 'maize',
      name_hi: 'मक्का',
      name_en: 'Maize',
      season_hi: 'खरीफ सीज़न',
      season_en: 'Kharif Season',
      image: '/images/crop-maize.webp',
      span: 'col-span-1 md:col-span-1 min-h-[160px]',
    },
    {
      id: 'sugarcane',
      name_hi: 'गन्ना',
      name_en: 'Sugarcane',
      season_hi: 'वार्षिक सीज़न',
      season_en: 'Annual Crop',
      image: '/images/crop-sugarcane.webp',
      span: 'col-span-1 md:col-span-1 min-h-[160px]',
    },
    {
      id: 'chickpea',
      name_hi: 'चना',
      name_en: 'Chickpea / Gram',
      season_hi: 'रबी सीज़न',
      season_en: 'Rabi Season',
      image: '/images/crop-chickpea.webp',
      span: 'col-span-1 md:col-span-1 min-h-[160px]',
    },
    {
      id: 'potato',
      name_hi: 'आलू',
      name_en: 'Potato',
      season_hi: 'रबी सीज़न',
      season_en: 'Rabi Season',
      image: '/images/crop-potato.webp',
      span: 'col-span-1 md:col-span-1 min-h-[160px]',
    },
  ];

  return (
    <div className="space-y-0 text-[#1C1B18]">
      {/* =========================================================================
          SECTION 1: HERO (Full-bleed edge-to-edge photo with dark green overlay)
          ========================================================================= */}
      <section className="relative w-full min-h-[600px] sm:min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-24">
        {/* Full-bleed farm photographs (4 backgrounds, cross-fade on switch) */}
        {HERO_BACKGROUNDS.map((bg) => (
          <img
            key={bg.id}
            src={bg.src}
            alt={currentLang === 'hi' ? 'भारतीय कृषि भूमि' : 'Indian farmland'}
            aria-hidden={heroBg !== bg.id}
            className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transition-opacity duration-700 ${
              heroBg === bg.id ? 'opacity-100' : 'opacity-0'
            }`}
            loading={bg.id === 'wheat' ? 'eager' : 'lazy'}
          />
        ))}

        {/* Dark-green gradient overlay for perfect editorial readability */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#14391F]/95 via-[#14391F]/80 to-[#14391F]/45 pointer-events-none"
          aria-hidden="true"
        />
        {/* Mobile vertical gradient for contrast at bottom */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#14391F]/90 via-transparent to-transparent lg:hidden pointer-events-none"
          aria-hidden="true"
        />

        {/* Large faded background word behind hero text */}
        <div
          className="absolute -left-6 top-1/4 sm:top-1/3 -translate-y-1/2 text-[100px] sm:text-[180px] md:text-[230px] lg:text-[270px] font-black text-white/[0.05] select-none pointer-events-none tracking-widest leading-none font-editorial-heading whitespace-nowrap overflow-hidden"
          aria-hidden="true"
        >
          {currentLang === 'hi' ? 'फसल' : 'HARVEST'}
        </div>

        {/* Background switcher (bottom-right of hero) */}
        <div
          className="absolute bottom-4 right-3 sm:bottom-6 sm:right-6 z-20 flex items-center gap-1 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-2 py-1.5 sm:px-3"
          role="group"
          aria-label={currentLang === 'hi' ? 'पृष्ठभूमि चुनें' : 'Choose background'}
        >
          <span className="hidden sm:inline px-2 text-xs font-semibold text-white/80">
            {currentLang === 'hi' ? 'पृष्ठभूमि:' : 'Background:'}
          </span>
          {HERO_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              type="button"
              onClick={() => handleHeroBg(bg.id)}
              aria-pressed={heroBg === bg.id}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors min-h-[36px] ${
                heroBg === bg.id
                  ? 'bg-[#C9922E] text-[#14391F]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span aria-hidden="true">{bg.emoji}</span>
              <span className="hidden sm:inline">{currentLang === 'hi' ? bg.label_hi : bg.label_en}</span>
            </button>
          ))}
        </div>

        <div className="page-container relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Left-aligned Headline, Subtitle, and CTAs (No pill badges) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h1 className="hero-display-title text-[#FAF6EC] tracking-tight">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-[#FAF6EC]/85 leading-relaxed max-w-xl font-normal">
                {t.heroSubtitle}
              </p>

              {/* One primary CTA and one text link */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <button
                  type="button"
                  onClick={onStartFreshPredict}
                  className="btn-editorial-gold h-[50px] px-7 text-base shadow-lg"
                >
                  <span>{t.heroCta}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </button>

                <button
                  type="button"
                  onClick={scrollToHowItWorks}
                  className="text-sm sm:text-base font-medium text-[#FAF6EC]/90 hover:text-white underline underline-offset-4 decoration-[#C9922E] flex items-center gap-1.5 transition-colors cursor-pointer py-1"
                >
                  <span>{t.heroSecondaryCta}</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              {/* No account required disclaimer */}
              <div className="pt-1 text-xs text-[#FAF6EC]/70">
                <span>{t.heroNoAccount}</span>
              </div>
            </div>

            {/* Right Column: Small Sample-Result Card Overlapping Bottom-Right */}
            <div className="lg:col-span-5 flex justify-start lg:justify-end">
              <div className="w-full max-w-sm rounded-xl p-5 bg-[#FAF6EC] text-[#1C1B18] border border-[#E6DECD] shadow-2xl space-y-3.5 transform lg:translate-y-4">
                {/* Header with Sample Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E6DECD]">
                  <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded bg-[#C9922E]/20 text-[#5B4636] border border-[#C9922E]/30">
                    {currentLang === 'hi' ? 'नमूना / Sample' : 'Sample / Preview'}
                  </span>
                  <span className="text-xs text-[#5B4636] font-medium">
                    {currentLang === 'hi' ? 'गेहूँ • रबी सीज़न' : 'Wheat • Rabi Season'}
                  </span>
                </div>

                {/* Primary Yield Metric */}
                <div>
                  <div className="text-xs text-[#5B4636] font-medium">
                    {currentLang === 'hi' ? 'अनुमानित कुल पैदावार (5 एकड़)' : 'Estimated Total Yield (5 Acres)'}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-editorial-heading text-4xl font-bold text-[#14391F] tabular-nums tracking-tight">
                      59
                    </span>
                    <span className="text-base font-bold text-[#14391F]">
                      {t.quintal}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#2F7D3E] bg-[#2F7D3E]/10 px-2 py-0.5 rounded">
                      <TrendingUp className="w-3 h-3 text-[#2F7D3E]" />
                      <span>+9%</span>
                    </span>
                  </div>
                  <div className="text-xs text-[#5B4636] mt-0.5">
                    {currentLang === 'hi' ? '= 11.8 क्विंटल प्रति एकड़' : '= 11.8 Quintal / Acre'}
                  </div>
                </div>

                {/* District Comparison Bar */}
                <div className="pt-3 border-t border-[#E6DECD] space-y-1.5">
                  <div className="flex justify-between text-[11px] text-[#5B4636]">
                    <span>{currentLang === 'hi' ? 'ज़िला औसत: 54 क्विंटल' : 'District Avg: 54 Q'}</span>
                    <span className="font-semibold text-[#14391F]">
                      {currentLang === 'hi' ? 'लुधियाना, पंजाब' : 'Ludhiana, Punjab'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E6DECD] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2F7D3E] rounded-full w-[88%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FACTS BAND (Single thin horizontal band, hairline dividers)
          ========================================================================= */}
      <section className="page-container py-8 sm:py-10">
        <div className="bg-[#FAF6EC] border border-[#E6DECD] rounded-lg overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6DECD]">
            <div className="p-5 md:p-6 text-left">
              <div className="font-editorial-heading text-base md:text-lg font-bold text-[#14391F] leading-snug">
                {t.fact1Title}
              </div>
              <div className="text-xs md:text-sm text-[#5B4636] mt-1 leading-normal">
                {t.fact1Desc}
              </div>
            </div>

            <div className="p-5 md:p-6 text-left">
              <div className="font-editorial-heading text-base md:text-lg font-bold text-[#14391F] leading-snug">
                {t.fact2Title}
              </div>
              <div className="text-xs md:text-sm text-[#5B4636] mt-1 leading-normal">
                {t.fact2Desc}
              </div>
            </div>

            <div className="p-5 md:p-6 text-left">
              <div className="font-editorial-heading text-base md:text-lg font-bold text-[#14391F] leading-snug">
                {t.fact3Title}
              </div>
              <div className="text-xs md:text-sm text-[#5B4636] mt-1 leading-normal">
                {t.fact3Desc}
              </div>
            </div>

            <div className="p-5 md:p-6 text-left">
              <div className="font-editorial-heading text-base md:text-lg font-bold text-[#14391F] leading-snug">
                {t.fact4Title}
              </div>
              <div className="text-xs md:text-sm text-[#5B4636] mt-1 leading-normal">
                {t.fact4Desc}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HOW IT WORKS (Large numbered layout 01 02 03 04, alternating)
          ========================================================================= */}
      <section id="how-it-works-editorial" className="page-container py-12 md:py-16 scroll-mt-24 space-y-12">
        <div className="max-w-2xl text-left space-y-2 border-b border-[#E6DECD] pb-4">
          <h2 className="section-editorial-h2 text-[#14391F]">
            {t.timelineSectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#5B4636]">
            {t.timelineSectionSubtitle}
          </p>
        </div>

        <div className="space-y-12 md:space-y-16">
          {/* Step 01: Image Right, Text Left */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center border-b border-[#E6DECD] pb-12">
            <div className="md:col-span-6 space-y-3 text-left">
              <span className="font-editorial-numeral text-5xl md:text-6xl font-bold text-[#C9922E]">
                01
              </span>
              <h3 className="font-editorial-heading text-2xl font-bold text-[#14391F]">
                {t.timelineStep1Title}
              </h3>
              <p className="text-sm md:text-base text-[#5B4636] leading-relaxed">
                {t.timelineStep1Desc}
              </p>
            </div>
            <div className="md:col-span-6">
              <div className="relative rounded-lg overflow-hidden border border-[#E6DECD] h-56 sm:h-64 md:h-72">
                <img
                  src="/images/weather-sky.webp"
                  alt={currentLang === 'hi' ? 'कृषि क्षेत्र एवं ज़िला परिदृश्य' : 'Regional agricultural landscape'}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Step 02: Image Left, Text Right (Alternating) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center border-b border-[#E6DECD] pb-12">
            <div className="md:col-span-6 order-2 md:order-1">
              <div className="relative rounded-lg overflow-hidden border border-[#E6DECD] h-56 sm:h-64 md:h-72">
                <img
                  src="/images/crop-wheat.webp"
                  alt={currentLang === 'hi' ? 'फसल की पहचान और सीज़न' : 'Crop variety and season'}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
            <div className="md:col-span-6 order-1 md:order-2 space-y-3 text-left">
              <span className="font-editorial-numeral text-5xl md:text-6xl font-bold text-[#C9922E]">
                02
              </span>
              <h3 className="font-editorial-heading text-2xl font-bold text-[#14391F]">
                {t.timelineStep2Title}
              </h3>
              <p className="text-sm md:text-base text-[#5B4636] leading-relaxed">
                {t.timelineStep2Desc}
              </p>
            </div>
          </div>

          {/* Step 03: Image Right, Text Left */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center border-b border-[#E6DECD] pb-12">
            <div className="md:col-span-6 space-y-3 text-left">
              <span className="font-editorial-numeral text-5xl md:text-6xl font-bold text-[#C9922E]">
                03
              </span>
              <h3 className="font-editorial-heading text-2xl font-bold text-[#14391F]">
                {t.timelineStep3Title}
              </h3>
              <p className="text-sm md:text-base text-[#5B4636] leading-relaxed">
                {t.timelineStep3Desc}
              </p>
            </div>
            <div className="md:col-span-6">
              <div className="relative rounded-lg overflow-hidden border border-[#E6DECD] h-56 sm:h-64 md:h-72">
                <img
                  src="/images/soil-closeup.webp"
                  alt={currentLang === 'hi' ? 'खेत और कृषि भूमि' : 'Farmland and agricultural field'}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Step 04: Image Left, Text Right (Alternating) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-6 order-2 md:order-1">
              <div className="relative rounded-lg overflow-hidden border border-[#E6DECD] h-56 sm:h-64 md:h-72">
                <img
                  src="/images/farmer-phone.webp"
                  alt={currentLang === 'hi' ? 'किसान मोबाइल पर पैदावार परिणाम देखते हुए' : 'Farmer viewing crop report on smartphone'}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
            <div className="md:col-span-6 order-1 md:order-2 space-y-3 text-left">
              <span className="font-editorial-numeral text-5xl md:text-6xl font-bold text-[#C9922E]">
                04
              </span>
              <h3 className="font-editorial-heading text-2xl font-bold text-[#14391F]">
                {t.timelineStep4Title}
              </h3>
              <p className="text-sm md:text-base text-[#5B4636] leading-relaxed">
                {t.timelineStep4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CROPS SECTION (Photo-based crop tiles in an asymmetric grid)
          ========================================================================= */}
      <section className="page-container py-12 md:py-16 space-y-8">
        <div className="max-w-2xl text-left space-y-2 border-b border-[#E6DECD] pb-4">
          <h2 className="section-editorial-h2 text-[#14391F]">
            {t.cropsSectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#5B4636]">
            {t.cropsSectionSubtitle}
          </p>
        </div>

        {/* Asymmetric photo-based crop grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {popularCrops.map((crop) => (
            <button
              key={crop.id}
              onClick={onStartFreshPredict}
              className={`relative overflow-hidden rounded-lg border border-[#E6DECD] group cursor-pointer text-left ${crop.span}`}
            >
              <img
                src={crop.image}
                alt={currentLang === 'hi' ? crop.name_hi : crop.name_en}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Dark overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

              {/* Crop bilingual typography on image */}
              <div className="absolute bottom-3 left-3 right-3 text-left text-white pointer-events-none">
                <div className="font-editorial-heading text-base sm:text-lg md:text-xl font-bold leading-tight">
                  {currentLang === 'hi' ? crop.name_hi : crop.name_en}
                </div>
                <div className="text-xs text-[#FAF6EC]/80 font-medium mt-0.5 flex items-center justify-between">
                  <span>{currentLang === 'hi' ? crop.name_en : crop.name_hi}</span>
                  <span className="text-[10px] text-[#C9922E] font-semibold uppercase">
                    {currentLang === 'hi' ? crop.season_hi : crop.season_en}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FEATURES (2-Column Editorial layout: One large photo + short list)
          ========================================================================= */}
      <section className="page-container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: One Large Real Photo */}
          <div className="lg:col-span-5">
            <div className="relative rounded-lg overflow-hidden border border-[#E6DECD] shadow-sm">
              <img
                src="/images/hero-paddy.webp"
                alt={currentLang === 'hi' ? 'भारतीय धान और कृषि का परिदृश्य' : 'Indian agricultural landscape and paddy'}
                className="w-full h-[360px] sm:h-[420px] lg:h-[480px] object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-xs text-white/90 italic">
                {currentLang === 'hi'
                  ? 'ज़िले के ऐतिहासिक सरकारी आंकड़ों और पैदावार रिकॉर्ड पर आधारित'
                  : 'Based on district historical government records and yield baselines'}
              </div>
            </div>
          </div>

          {/* Right Column: Title + Short list of benefits with thin hairline dividers */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div>
              <h2 className="section-editorial-h2 text-[#14391F]">
                {t.featuresSectionTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#5B4636] mt-2 leading-relaxed">
                {t.featuresSectionSubtitle}
              </p>
            </div>

            <div className="divide-y divide-[#E6DECD] border-y border-[#E6DECD]">
              <div className="py-4">
                <h3 className="font-editorial-heading text-lg font-bold text-[#14391F]">
                  {t.feature1Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5B4636] mt-1 leading-relaxed">
                  {t.feature1Desc}
                </p>
              </div>

              <div className="py-4">
                <h3 className="font-editorial-heading text-lg font-bold text-[#14391F]">
                  {t.feature2Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5B4636] mt-1 leading-relaxed">
                  {t.feature2Desc}
                </p>
              </div>

              <div className="py-4">
                <h3 className="font-editorial-heading text-lg font-bold text-[#14391F]">
                  {t.feature4Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5B4636] mt-1 leading-relaxed">
                  {t.feature4Desc}
                </p>
              </div>

              <div className="py-4">
                <h3 className="font-editorial-heading text-lg font-bold text-[#14391F]">
                  {t.feature6Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5B4636] mt-1 leading-relaxed">
                  {t.feature6Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: SAMPLE RESULT REPORT PREVIEW (Editorial interactive showcase)
          ========================================================================= */}
      <section className="page-container py-10 md:py-14 space-y-6">
        <div className="max-w-2xl text-left space-y-2 border-b border-[#E6DECD] pb-4">
          <h2 className="section-editorial-h2 text-[#14391F]">
            {t.showcaseSectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#5B4636]">
            {t.showcaseSectionSubtitle}
          </p>
        </div>

        {/* Rating preview switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-[#5B4636] mr-2">
            {t.showcaseTabLabel}:
          </span>
          {(['great', 'good', 'normal', 'low', 'bad'] as const).map((mode) => {
            const labels = {
              great: currentLang === 'hi' ? 'बहुत अच्छी' : 'Great',
              good: currentLang === 'hi' ? 'अच्छी' : 'Good',
              normal: currentLang === 'hi' ? 'सामान्य' : 'Average',
              low: currentLang === 'hi' ? 'औसत से कम' : 'Low',
              bad: currentLang === 'hi' ? 'ख़राब' : 'Poor',
            };
            const isActive = showcaseRating === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setShowcaseRating(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#14391F] text-[#FAF6EC] border-[#14391F]'
                    : 'bg-white text-[#5B4636] border-[#E6DECD] hover:border-[#C9922E]'
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>

        {/* Report Preview Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#FAF6EC] rounded-lg p-6 sm:p-8 border border-[#E6DECD]">
          <div className="md:col-span-6 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DECD]">
              <span className="text-xs font-bold text-[#5B4636]">
                {currentLang === 'hi' ? 'लुधियाना, पंजाब · 5 एकड़ खेत' : 'Ludhiana, Punjab · 5 Acres'}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#C9922E]/20 text-[#5B4636] border border-[#C9922E]/30">
                {t.showcaseSampleBadge}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold text-[#FAF6EC] bg-[#14391F]">
              <ShowcaseIcon className="w-3.5 h-3.5" />
              <span>{showcaseData.badge}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#5B4636] font-medium">करीब</span>
              <span className="font-editorial-heading text-4xl font-bold text-[#14391F] tabular-nums">
                {showcaseData.total}
              </span>
              <span className="text-lg font-bold text-[#14391F]">
                {t.quintal}
              </span>
            </div>
            <div className="text-xs text-[#5B4636]">
              = {showcaseData.perAcre} {currentLang === 'hi' ? 'क्विंटल प्रति एकड़' : 'Quintal per acre'}
            </div>

            <div className="pt-3 border-t border-[#E6DECD] flex items-center justify-between text-xs">
              <span className="text-[#5B4636]">{currentLang === 'hi' ? 'ज़िला औसत: 10.8 Q/एकड़' : 'District Avg: 10.8 Q/Acre'}</span>
              <span className={`font-bold ${showcaseData.diffColor}`}>
                {showcaseData.comparison}
              </span>
            </div>
          </div>

          <div className="md:col-span-6 space-y-3 text-left border-t md:border-t-0 md:border-l border-[#E6DECD] pt-6 md:pt-0 md:pl-8">
            <h3 className="font-editorial-heading text-lg font-bold text-[#14391F]">
              {currentLang === 'hi' ? 'अनुमान में आपको क्या प्राप्त होता है?' : 'What will you see in your report?'}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#5B4636]">
              <li className="flex items-start gap-2">
                <span className="text-[#2F7D3E] font-bold">✓</span>
                <span>{t.showcasePoint1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2F7D3E] font-bold">✓</span>
                <span>{t.showcasePoint2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2F7D3E] font-bold">✓</span>
                <span>{t.showcasePoint3}</span>
              </li>
            </ul>

            <div className="pt-3">
              <button
                type="button"
                onClick={onStartFreshPredict}
                className="btn-editorial-primary text-xs sm:text-sm h-10 px-5"
              >
                <span>{t.heroCta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FULL-WIDTH DARK GREEN SECTION (Quote-style statement + Final CTA)
          ========================================================================= */}
      <section className="w-full bg-[#14391F] text-[#FAF6EC] py-16 sm:py-20 md:py-24 relative overflow-hidden my-12">
        {/* Faded background typographic element */}
        <div
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none text-white/[0.04] text-[90px] sm:text-[150px] md:text-[220px] font-black uppercase font-editorial-heading whitespace-nowrap overflow-hidden"
          aria-hidden="true"
        >
          {currentLang === 'hi' ? 'अन्नदाता' : 'HARVEST'}
        </div>

        <div className="page-container relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="w-12 h-0.5 bg-[#C9922E] mx-auto" aria-hidden="true" />

          <blockquote className="font-editorial-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#FAF6EC] leading-tight">
            “{t.editorialQuote}”
          </blockquote>

          <p className="text-sm sm:text-base text-[#FAF6EC]/80 max-w-xl mx-auto leading-relaxed">
            {t.editorialQuoteSub}
          </p>

          <div className="pt-4">
            <button
              type="button"
              onClick={onStartFreshPredict}
              className="btn-editorial-gold h-[50px] px-8 text-base shadow-xl"
            >
              <span>{t.heroCta}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FAQ ACCORDION (Minimal with hairline dividers, no card boxes)
          ========================================================================= */}
      <section className="page-container py-12 md:py-16 max-w-3xl space-y-8">
        <div className="text-left space-y-2 border-b border-[#E6DECD] pb-4">
          <h2 className="section-editorial-h2 text-[#14391F]">
            {t.faqSectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#5B4636]">
            {t.faqSectionSubtitle}
          </p>
        </div>

        {/* Accordion with thin hairline dividers */}
        <div className="divide-y divide-[#E6DECD] border-y border-[#E6DECD]">
          {[
            { q: t.faq1Q, a: t.faq1A },
            { q: t.faq2Q, a: t.faq2A },
            { q: t.faq3Q, a: t.faq3A },
            { q: t.faq4Q, a: t.faq4A },
            { q: t.faq5Q, a: t.faq5A },
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4 sm:py-5">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span className="font-editorial-heading text-base sm:text-lg font-bold text-[#14391F] group-hover:text-[#2F7D3E] transition-colors leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#5B4636] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#C9922E]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <p className="mt-2.5 text-xs sm:text-sm text-[#5B4636] leading-relaxed pr-6 animate-fade-up">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: FOOTER (Dark soil-brown/green, 3 columns, disclaimer)
          ========================================================================= */}
      <footer className="w-full bg-[#102B18] text-[#FAF6EC] pt-14 pb-10 border-t border-[#14391F]">
        <div className="page-container space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
            {/* Column 1: Brand & Academic Project info */}
            <div className="md:col-span-5 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="font-editorial-heading text-xl font-bold tracking-tight text-[#FAF6EC]">
                  {t.appName}
                </span>
                <span className="text-xs text-[#C9922E] font-medium">| {t.appTagline}</span>
              </div>
              <p className="text-xs text-[#FAF6EC]/70 leading-relaxed max-w-sm">
                {t.footerDesc}
              </p>
              <div className="pt-2 text-[11px] text-[#FAF6EC]/50">
                CSE, SRM Institute of Science and Technology, Delhi-NCR Campus
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-3 space-y-3 text-left">
              <div className="text-xs font-bold text-[#C9922E] uppercase tracking-wider">
                {currentLang === 'hi' ? 'नेविगेशन' : 'Navigation'}
              </div>
              <ul className="space-y-2 text-xs text-[#FAF6EC]/80">
                <li>
                  <button
                    onClick={() => onNavigate('/')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {t.navHome}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('/how-it-works')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {t.navHowItWorks}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('/about')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {t.navAbout}
                  </button>
                </li>
                <li>
                  <button
                    onClick={onStartFreshPredict}
                    className="hover:text-white transition-colors cursor-pointer text-[#C9922E]"
                  >
                    {t.navPredictBtn} →
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Agricultural Helpline & Guidance */}
            <div className="md:col-span-4 space-y-3 text-left">
              <div className="text-xs font-bold text-[#C9922E] uppercase tracking-wider">
                {currentLang === 'hi' ? 'किसान सहायता एवं संपर्क' : 'Farmer Support & Contact'}
              </div>
              <div className="text-xs text-[#FAF6EC]/80 space-y-1">
                <div>
                  <span className="font-semibold text-white">किसान कॉल सेंटर: </span>
                  <a href="tel:18001801551" className="text-[#C9922E] hover:underline font-mono">
                    1800-180-1551
                  </a>{' '}
                  (टोल-फ्री)
                </div>
                <div className="text-[#FAF6EC]/60 text-[11px] leading-relaxed">
                  {currentLang === 'hi'
                    ? 'कृषि विज्ञान केंद्र (KVK) परामर्श आधारित।'
                    : 'Guidance aligned with Krishi Vigyan Kendra (KVK) advisories.'}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Hairline & Mandatory Disclaimer */}
          <div className="pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-[#FAF6EC]/75 font-medium">
              ⚖️ {t.footerDisclaimer}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
