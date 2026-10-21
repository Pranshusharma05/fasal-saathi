import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  AlertCircle,
  Grid,
  Search,
  X,
} from 'lucide-react';
import {
  STATES,
  CROPS,
  SEASONS,
  CropOption,
} from '../data/options';
import { PredictFormData } from '../api/predict';
import { StepProgress } from './StepProgress';
import { CropCard } from './CropCard';
import { SearchableSelect } from './SearchableSelect';
import { convertArea } from '../utils/rating';
import { Language, translations } from '../translations';

interface PredictionFormProps {
  currentLang: Language;
  currentStep: number;
  initialData: PredictFormData;
  onStepChange: (step: number) => void;
  onSubmit: (data: PredictFormData) => void;
  onGoHome: () => void;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  currentLang,
  currentStep,
  initialData,
  onStepChange,
  onSubmit,
  onGoHome,
}) => {
  const t = translations[currentLang];

  // Form State
  const [stateId, setStateId] = useState<string>(initialData.state || '');
  const [districtId, setDistrictId] = useState<string>(initialData.district || '');
  const [cropId, setCropId] = useState<string>(initialData.crop || '');
  const [season, setSeason] = useState<'kharif' | 'rabi' | 'zaid' | 'annual' | 'autumn' | 'winter'>(
    initialData.season || 'rabi'
  );
  const [area, setArea] = useState<string>(
    initialData.area ? String(initialData.area) : '5'
  );
  const [unit, setUnit] = useState<'acre' | 'hectare'>(
    initialData.unit || 'acre'
  );

  // Extra Season expander
  const [showMoreSeasons, setShowMoreSeasons] = useState<boolean>(false);

  // All Crops Modal / Expander
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [cropSearchQuery, setCropSearchQuery] = useState<string>('');

  // Sync if initialData is updated
  useEffect(() => {
    setStateId(initialData.state || '');
    setDistrictId(initialData.district || '');
    setCropId(initialData.crop || '');
    setSeason(initialData.season || 'rabi');
    setArea(initialData.area ? String(initialData.area) : '5');
    setUnit(initialData.unit || 'acre');
  }, [initialData]);

  // Inline Validation error message
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active state data from all 28 states & 8 UTs
  const selectedStateObj = STATES.find((s) => s.id === stateId);
  const availableDistricts = selectedStateObj ? selectedStateObj.districts : [];

  // Options formatted for SearchableSelect
  const stateSelectOptions = useMemo(() => {
    return STATES.map((s) => ({
      id: s.id,
      name_hi: s.name_hi,
      name_en: s.name_en,
    }));
  }, []);

  const districtSelectOptions = useMemo(() => {
    return availableDistricts.map((d) => ({
      id: d.id,
      name_hi: d.name_hi,
      name_en: d.name_en,
    }));
  }, [availableDistricts]);

  const handleStateChange = (newStateId: string) => {
    setStateId(newStateId);
    setDistrictId(''); // Resets district when state changes
    setErrorMsg(null);
  };

  const handleCropSelect = (selectedId: string) => {
    setCropId(selectedId);
    setErrorMsg(null);
    setIsCropModalOpen(false);
    const cropObj = CROPS.find((c) => c.id === selectedId);
    if (cropObj) {
      setSeason(cropObj.defaultSeason);
    }
  };

  // 8 Popular crops for direct cards
  const popularCrops = useMemo(() => {
    return CROPS.filter((c) => c.popular);
  }, []);

  // Filtered crops for all-crops modal
  const filteredAllCrops = useMemo(() => {
    const q = cropSearchQuery.trim().toLowerCase();
    if (!q) return CROPS;
    return CROPS.filter(
      (c) =>
        c.name_hi.toLowerCase().includes(q) ||
        c.name_en.toLowerCase().includes(q)
    );
  }, [cropSearchQuery]);

  // Selected crop details
  const selectedCropObj = CROPS.find((c) => c.id === cropId);

  // Live Area Conversion helper
  const parsedArea = parseFloat(area) || 0;
  const areaConversion = convertArea(parsedArea, unit);

  // Step 1 Validation
  const validateStep1 = () => {
    if (!stateId) {
      setErrorMsg(t.errSelectState);
      return false;
    }
    if (!districtId) {
      setErrorMsg(t.errSelectDistrict);
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!cropId) {
      setErrorMsg(t.errSelectCrop);
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const val = parseFloat(area);
    if (isNaN(val) || val <= 0) {
      setErrorMsg(t.errAreaPositive);
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) onStepChange(2);
    } else if (currentStep === 2) {
      if (validateStep2()) onStepChange(3);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    } else {
      onGoHome();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    const payload: PredictFormData = {
      state: stateId,
      district: districtId,
      crop: cropId,
      season,
      area: parseFloat(area),
      unit,
    };

    onSubmit(payload);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto px-4 pb-32 pt-2">
      <StepProgress
        currentStep={currentStep}
        totalSteps={3}
        currentLang={currentLang}
        onStepClick={(step) => onStepChange(step)}
      />

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E8E4D8] shadow-xs transition-all">
        {/* Step 1: Location */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="form-question-heading text-gray-900 leading-snug">
                {t.step1Title}
              </h2>
              <p className="helper-text text-gray-600 mt-1">
                {t.step1Subtitle}
              </p>
            </div>

            {/* Searchable State Picker */}
            <SearchableSelect
              label={t.stateLabel}
              placeholder={t.statePlaceholder}
              options={stateSelectOptions}
              value={stateId}
              onChange={handleStateChange}
              currentLang={currentLang}
              required
            />

            {/* Searchable District Picker */}
            <SearchableSelect
              label={t.districtLabel}
              placeholder={t.districtPlaceholder}
              options={districtSelectOptions}
              value={districtId}
              onChange={(val) => {
                setDistrictId(val);
                setErrorMsg(null);
              }}
              disabled={!stateId}
              disabledHelp={t.districtDisabledHelp}
              currentLang={currentLang}
              required
            />
          </div>
        )}

        {/* Step 2: Crop & Season */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="form-question-heading text-gray-900 leading-snug">
                {t.step2Title}
              </h2>
              <p className="helper-text text-gray-600 mt-1">
                {t.step2Subtitle}
              </p>
            </div>

            {/* Popular Crop Cards (8 Popular) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="field-label text-gray-800">
                  {currentLang === 'hi' ? 'लोकप्रिय फसलें:' : 'Popular Crops:'}
                </span>

                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(true)}
                  className="text-xs font-semibold text-[#1B5E20] hover:text-[#2E7D32] flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[#F1F8E9] border border-[#C8E6C9]"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>{currentLang === 'hi' ? 'सभी 23 फसलें देखें' : 'View all 23 crops'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {popularCrops.map((crop) => (
                  <CropCard
                    key={crop.id}
                    crop={crop}
                    isSelected={cropId === crop.id}
                    onSelect={handleCropSelect}
                    currentLang={currentLang}
                  />
                ))}
              </div>

              {/* Notice if a non-popular crop is selected */}
              {selectedCropObj && !selectedCropObj.popular && (
                <div className="p-2.5 rounded-xl bg-[#F1F8E9] border border-[#C8E6C9] flex items-center justify-between text-xs font-semibold text-[#1B5E20]">
                  <span>
                    {currentLang === 'hi' ? 'चुनी गई फसल:' : 'Selected Crop:'}{' '}
                    {selectedCropObj.emoji}{' '}
                    {currentLang === 'hi' ? selectedCropObj.name_hi : selectedCropObj.name_en}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCropModalOpen(true)}
                    className="underline text-xs"
                  >
                    {currentLang === 'hi' ? 'बदलें' : 'Change'}
                  </button>
                </div>
              )}
            </div>

            {/* Season Cards: primary 4 + 2 under "और विकल्प" */}
            <div className="pt-4 border-t border-[#E8E4D8] space-y-2.5">
              <label className="field-label text-gray-800 block">
                {t.seasonLabel}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SEASONS.filter((s) => !s.isExtra).map((s) => {
                  const isChecked = season === s.id;
                  const name = currentLang === 'hi' ? s.name_hi : s.name_en;
                  const desc = currentLang === 'hi' ? s.description_hi : s.description_en;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeason(s.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-[#F1F8E9] border-[#2E7D32] ring-1 ring-[#2E7D32]/20 shadow-2xs'
                          : 'bg-white border-[#E8E4D8] hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          isChecked ? 'border-[#2E7D32] bg-[#2E7D32]' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* "और विकल्प" Expander */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowMoreSeasons(!showMoreSeasons)}
                  className="text-xs font-semibold text-[#1B5E20] hover:underline flex items-center gap-1"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreSeasons ? 'rotate-180' : ''}`} />
                  <span>{currentLang === 'hi' ? 'और विकल्प (शरद / शीतकालीन)' : 'More season options (Autumn / Winter)'}</span>
                </button>

                {showMoreSeasons && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 animate-in fade-in duration-150">
                    {SEASONS.filter((s) => s.isExtra).map((s) => {
                      const isChecked = season === s.id;
                      const name = currentLang === 'hi' ? s.name_hi : s.name_en;
                      const desc = currentLang === 'hi' ? s.description_hi : s.description_en;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSeason(s.id)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isChecked
                              ? 'bg-[#F1F8E9] border-[#2E7D32] ring-1 ring-[#2E7D32]/20 shadow-2xs'
                              : 'bg-white border-[#E8E4D8] hover:border-gray-300'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-sm text-gray-900">{name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                              isChecked ? 'border-[#2E7D32] bg-[#2E7D32]' : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <p className="helper-text text-gray-500">
                {t.seasonAutoSelectedHelp}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Land Area & Sowing Date */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="form-question-heading text-gray-900 leading-snug">
                {t.step3Title}
              </h2>
              <p className="helper-text text-gray-600 mt-1">
                {t.step3Subtitle}
              </p>
            </div>

            {/* Area input + Unit Segmented Toggle */}
            <div className="space-y-2">
              <label htmlFor="area-input" className="field-label text-gray-800 block">
                {t.areaLabel} <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-2">
                <input
                  id="area-input"
                  type="number"
                  step="any"
                  min="0.1"
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder={t.areaPlaceholder}
                  className="h-11 flex-1 text-lg font-bold px-3.5 rounded-xl bg-[#FFFDF7] border border-[#E8E4D8] focus:border-[#2E7D32] focus:bg-white text-gray-900 tabular-nums shadow-2xs"
                />

                {/* Unit Toggle Buttons (No English in Hindi mode!) */}
                <div className="flex rounded-xl p-1 bg-[#F1F8E9] border border-[#C8E6C9] shrink-0 h-11 items-center">
                  <button
                    type="button"
                    onClick={() => setUnit('acre')}
                    className={`h-9 px-3.5 rounded-lg text-sm font-semibold transition-all ${
                      unit === 'acre'
                        ? 'bg-[#2E7D32] text-white shadow-2xs'
                        : 'text-[#1B5E20] hover:bg-white/50'
                    }`}
                  >
                    {currentLang === 'hi' ? 'एकड़' : 'Acre'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('hectare')}
                    className={`h-9 px-3.5 rounded-lg text-sm font-semibold transition-all ${
                      unit === 'hectare'
                        ? 'bg-[#2E7D32] text-white shadow-2xs'
                        : 'text-[#1B5E20] hover:bg-white/50'
                    }`}
                  >
                    {currentLang === 'hi' ? 'हेक्टेयर' : 'Hectare'}
                  </button>
                </div>
              </div>

              {/* Live Helper Text Conversion */}
              {parsedArea > 0 && (
                <div className="p-3 rounded-xl bg-[#FFFDF7] border border-[#E8E4D8] text-xs font-medium text-gray-700 flex items-center justify-between">
                  <span className="text-gray-500">
                    {currentLang === 'hi' ? 'बराबर नाप:' : 'Equivalent Area:'}
                  </span>
                  <span className="font-semibold text-[#1B5E20] tabular-nums">
                    {unit === 'acre'
                      ? `${parsedArea} एकड़ = ${areaConversion.hectare} हेक्टेयर`
                      : `${parsedArea} हेक्टेयर = ${areaConversion.acre} एकड़`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inline Error */}
        {errorMsg && (
          <div
            className="mt-4 p-3 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#B71C1C] flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Bottom Back/Next bar: aligned INSIDE the same 720px column as the form card */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8E4D8] py-2.5 shadow-lg">
        <div className="max-w-[720px] mx-auto px-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="btn-secondary flex-1 sm:flex-initial bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 active:scale-95"
          >
            <span>{t.backBtn}</span>
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary-gradient flex-[2] sm:flex-initial"
            >
              <span>{t.nextBtn}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary-gradient flex-[2] sm:flex-initial"
            >
              <span>{t.submitBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* "सभी 23 फसलें देखें" Searchable Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E8E4D8] overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="card-title text-gray-900">
                  {currentLang === 'hi' ? 'सभी 23 फसलें' : 'All 23 Supported Crops'}
                </h3>
                <p className="text-xs text-gray-500">
                  {currentLang === 'hi' ? 'अपनी फसल चुनें:' : 'Select your crop:'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-gray-100 bg-[#FFFDF7] flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={cropSearchQuery}
                onChange={(e) => setCropSearchQuery(e.target.value)}
                placeholder={currentLang === 'hi' ? 'फसल खोजें (जैसे बाजरा, सोयाबीन)...' : 'Search crop...'}
                className="w-full bg-transparent text-sm text-gray-900 focus:outline-none placeholder-gray-400"
                autoFocus
              />
            </div>

            {/* Grid list */}
            <div className="p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredAllCrops.map((crop) => {
                const isSelected = cropId === crop.id;
                const name = currentLang === 'hi' ? crop.name_hi : crop.name_en;
                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => handleCropSelect(crop.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-[#E8F5E9] border-[#2E7D32] ring-1 ring-[#2E7D32]/20 font-semibold'
                        : 'bg-white border-[#E8E4D8] hover:bg-[#F1F8E9]/50'
                    }`}
                  >
                    <span className="text-2xl select-none">{crop.emoji}</span>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-gray-900 block truncate">
                        {name}
                      </span>
                      <span className="text-[10px] text-gray-500 block truncate">
                        {crop.name_en}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
