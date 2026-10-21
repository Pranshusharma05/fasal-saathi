import React, { useState, useEffect } from 'react';
import { Sprout, Globe, Menu, X, ArrowRight } from 'lucide-react';
import { Language, translations } from '../translations';

interface HeaderProps {
  currentLang: Language;
  onToggleLang: () => void;
  currentPath: string;
  onNavigate: (path: string, searchParams?: Record<string, string | number>) => void;
  onStartFreshPredict: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onToggleLang,
  currentPath,
  onNavigate,
  onStartFreshPredict,
}) => {
  const t = translations[currentLang];
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const isHome = currentPath === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const handlePredictClick = () => {
    setMobileMenuOpen(false);
    onStartFreshPredict();
  };

  // Header appearance state:
  // Transparent only when on Home page AND not scrolled AND mobile menu is closed.
  const isTransparent = isHome && !isScrolled && !mobileMenuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[68px] sm:h-[72px] md:h-[76px] transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent text-[#FAF6EC] border-b border-white/10'
          : 'bg-[#FAF6EC]/95 backdrop-blur-md text-[#1C1B18] border-b border-[#E6DECD] shadow-[0_2px_12px_rgba(20,57,31,0.04)]'
      }`}
    >
      <div className="page-container h-full flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 sm:gap-3 text-left rounded-lg py-1 transition-transform active:scale-98 cursor-pointer group"
            aria-label={t.appName}
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isTransparent
                  ? 'bg-white/15 text-[#FAF6EC] border border-white/20'
                  : 'bg-[#14391F] text-[#FAF6EC]'
              }`}
            >
              <Sprout className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-editorial-heading text-lg sm:text-xl font-bold tracking-tight leading-none transition-colors ${
                  isTransparent ? 'text-[#FAF6EC]' : 'text-[#14391F]'
                }`}
              >
                {t.appName}
              </span>
              <span
                className={`text-[11px] font-medium leading-tight mt-1 transition-colors ${
                  isTransparent ? 'text-[#FAF6EC]/75' : 'text-[#5B4636]'
                }`}
              >
                {currentLang === 'hi' ? 'फसल पैदावार साथी' : 'Crop Yield Predictor'}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-[14px] lg:text-[15px]">
          <button
            onClick={() => handleNavClick('/')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-medium ${
              isHome
                ? isTransparent
                  ? 'text-[#FAF6EC] font-semibold bg-white/15 border border-white/25'
                  : 'text-[#14391F] font-semibold bg-[#EFE9DC] border border-[#DDD3BF]'
                : isTransparent
                ? 'text-[#FAF6EC]/80 hover:text-[#FAF6EC] hover:bg-white/10'
                : 'text-[#5B4636] hover:text-[#14391F] hover:bg-[#EFE9DC]'
            }`}
          >
            {t.navHome}
          </button>
          <button
            onClick={() => handleNavClick('/how-it-works')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-medium ${
              currentPath === '/how-it-works'
                ? isTransparent
                  ? 'text-[#FAF6EC] font-semibold bg-white/15 border border-white/25'
                  : 'text-[#14391F] font-semibold bg-[#EFE9DC] border border-[#DDD3BF]'
                : isTransparent
                ? 'text-[#FAF6EC]/80 hover:text-[#FAF6EC] hover:bg-white/10'
                : 'text-[#5B4636] hover:text-[#14391F] hover:bg-[#EFE9DC]'
            }`}
          >
            {t.navHowItWorks}
          </button>
          <button
            onClick={() => handleNavClick('/about')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-medium ${
              currentPath === '/about'
                ? isTransparent
                  ? 'text-[#FAF6EC] font-semibold bg-white/15 border border-white/25'
                  : 'text-[#14391F] font-semibold bg-[#EFE9DC] border border-[#DDD3BF]'
                : isTransparent
                ? 'text-[#FAF6EC]/80 hover:text-[#FAF6EC] hover:bg-white/10'
                : 'text-[#5B4636] hover:text-[#14391F] hover:bg-[#EFE9DC]'
            }`}
          >
            {t.navAbout}
          </button>
        </nav>

        {/* Right: Language switch + Refined Compact CTA Button */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={onToggleLang}
            className={`h-[34px] sm:h-[36px] px-3 rounded-md text-[13px] font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              isTransparent
                ? 'bg-white/10 hover:bg-white/20 text-[#FAF6EC] border border-white/20'
                : 'bg-white hover:bg-[#EFE9DC] text-[#1C1B18] border border-[#E6DECD]'
            }`}
            aria-label={`Switch to ${t.languageToggle}`}
            title="भाषा बदलें / Change Language"
          >
            <Globe className={`w-3.5 h-3.5 ${isTransparent ? 'text-[#C9922E]' : 'text-[#2F7D3E]'}`} />
            <span className="whitespace-nowrap">{t.languageToggle}</span>
          </button>

          <button
            type="button"
            onClick={handlePredictClick}
            className="h-[34px] sm:h-[36px] px-3.5 rounded-md bg-[#C9922E] hover:bg-[#DC9F33] text-[#14391F] text-[13px] font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>{t.navPredictBtn}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>

        {/* Mobile controls (Language + Hamburger) */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onToggleLang}
            className={`h-[32px] px-2.5 rounded-md text-xs font-semibold border flex items-center gap-1 ${
              isTransparent
                ? 'bg-white/10 text-[#FAF6EC] border-white/20'
                : 'bg-white text-[#14391F] border-[#E6DECD]'
            }`}
          >
            <Globe className={`w-3 h-3 ${isTransparent ? 'text-[#C9922E]' : 'text-[#2F7D3E]'}`} />
            <span>{t.languageToggle}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`h-[32px] w-[32px] rounded-md border flex items-center justify-center transition-colors ${
              isTransparent
                ? 'bg-white/10 border-white/20 text-[#FAF6EC]'
                : 'bg-white border-[#E6DECD] text-[#1C1B18]'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6DECD] bg-[#FAF6EC] px-5 py-4 space-y-2.5 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleNavClick('/')}
            className={`w-full text-left py-2 px-3 rounded-md text-sm ${
              isHome ? 'bg-[#EFE9DC] text-[#14391F] font-bold' : 'text-[#5B4636] font-medium'
            }`}
          >
            {t.navHome}
          </button>
          <button
            onClick={() => handleNavClick('/how-it-works')}
            className={`w-full text-left py-2 px-3 rounded-md text-sm ${
              currentPath === '/how-it-works'
                ? 'bg-[#EFE9DC] text-[#14391F] font-bold'
                : 'text-[#5B4636] font-medium'
            }`}
          >
            {t.navHowItWorks}
          </button>
          <button
            onClick={() => handleNavClick('/about')}
            className={`w-full text-left py-2 px-3 rounded-md text-sm ${
              currentPath === '/about' ? 'bg-[#EFE9DC] text-[#14391F] font-bold' : 'text-[#5B4636] font-medium'
            }`}
          >
            {t.navAbout}
          </button>

          <div className="pt-2 border-t border-[#E6DECD]">
            <button
              onClick={handlePredictClick}
              className="w-full h-10 rounded-md bg-[#C9922E] hover:bg-[#DC9F33] text-[#14391F] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>{t.heroCta}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
