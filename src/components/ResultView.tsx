import React, { useState } from 'react';
import {
  Share2,
  MapPin,
  Calendar,
  ChevronDown,
  Info,
  Building2,
  PhoneCall,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { PredictionResponse, PredictFormData } from '../api/predict';
import { computeYieldMetrics } from '../utils/rating';
import { STATES, CROPS } from '../data/options';
import { ComparisonBar } from './ComparisonBar';
import { ReasonList } from './ReasonList';
import { ConfidenceMeter } from './ConfidenceMeter';
import { Language, translations } from '../translations';

interface ResultViewProps {
  prediction: PredictionResponse;
  formData: PredictFormData;
  currentLang: Language;
  onEditDetails: () => void;
  onNewPrediction: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  prediction,
  formData,
  currentLang,
  onEditDetails,
  onNewPrediction,
}) => {
  const t = translations[currentLang];
  const [showTechnical, setShowTechnical] = useState(false);
  const [showRatingLegend, setShowRatingLegend] = useState(false);

  const stateObj = STATES.find((s) => s.id === formData.state);
  const districtObj = stateObj?.districts.find((d) => d.id === formData.district);
  const cropObj = CROPS.find((c) => c.id === formData.crop);

  const stateName = stateObj
    ? currentLang === 'hi'
      ? stateObj.name_hi
      : stateObj.name_en
    : formData.state;
  const districtName = districtObj
    ? currentLang === 'hi'
      ? districtObj.name_hi
      : districtObj.name_en
    : formData.district;
  const cropName = cropObj
    ? currentLang === 'hi'
      ? cropObj.name_hi
      : cropObj.name_en
    : formData.crop;

  const metrics = computeYieldMetrics(
    prediction.yield_t_ha,
    prediction.range_low_t_ha,
    prediction.range_high_t_ha,
    prediction.district_avg_t_ha,
    formData.area,
    formData.unit
  );

  // Typical total harvest for the same area in this district
  const districtAvgTotalQuintal = Math.round(
    prediction.district_avg_t_ha * 10 * metrics.areaHectare * 10
  ) / 10;

  // Verdict config by rating category
  const verdictConfig = {
    great: {
      emoji: '😄',
      sentence_hi: 'बहुत अच्छी खबर! इस बार फसल औसत से काफ़ी बेहतर रहने की उम्मीद है।',
      sentence_en: 'Great news! Crop yield is expected to be significantly higher than average.',
      bg: 'bg-[#E8F5E9]',
      border: 'border-[#A5D6A7]',
      text: 'text-[#1B5E20]',
    },
    good: {
      emoji: '🙂',
      sentence_hi: 'अच्छी खबर! इस बार फसल औसत से बेहतर रहने की उम्मीद है।',
      sentence_en: 'Good news! Crop yield is expected to be above average.',
      bg: 'bg-[#F1F8E9]',
      border: 'border-[#C8E6C9]',
      text: 'text-[#2E7D32]',
    },
    normal: {
      emoji: '😐',
      sentence_hi: 'इस बार फसल आम सालों जैसी रहने की उम्मीद है।',
      sentence_en: 'Crop yield is expected to be normal, similar to typical years.',
      bg: 'bg-[#FFFDE7]',
      border: 'border-[#FFF59D]',
      text: 'text-[#B26A00]',
    },
    low: {
      emoji: '😟',
      sentence_hi: 'ध्यान दें: इस बार फसल औसत से थोड़ी कम रह सकती है।',
      sentence_en: 'Attention: Crop yield may be slightly below average.',
      bg: 'bg-[#FFF3E0]',
      border: 'border-[#FFE0B2]',
      text: 'text-[#E65100]',
    },
    bad: {
      emoji: '😰',
      sentence_hi: 'चिंता की बात: इस बार फसल काफ़ी कम रह सकती है। सावधानी रखें और सलाह लें।',
      sentence_en: 'Cause for concern: Crop yield may be significantly low. Take precautions and consult experts.',
      bg: 'bg-[#FFEBEE]',
      border: 'border-[#FFCDD2]',
      text: 'text-[#B71C1C]',
    },
  }[metrics.rating.category];

  const ratingSegments = [
    { key: 'bad', label_hi: 'ख़राब', label_en: 'Poor', color: 'bg-[#C62828]' },
    { key: 'low', label_hi: 'कम', label_en: 'Low', color: 'bg-[#EF6C00]' },
    { key: 'normal', label_hi: 'सामान्य', label_en: 'Average', color: 'bg-[#F9A825]' },
    { key: 'good', label_hi: 'अच्छी', label_en: 'Good', color: 'bg-[#43A047]' },
    { key: 'great', label_hi: 'बहुत अच्छी', label_en: 'Very Good', color: 'bg-[#2E7D32]' },
  ];

  const handleShareWhatsApp = () => {
    const ratingLabel = currentLang === 'hi' ? metrics.rating.label_hi : metrics.rating.label_en;
    const unitText = formData.unit === 'acre' ? (currentLang === 'hi' ? 'एकड़' : 'Acre') : (currentLang === 'hi' ? 'हेक्टेयर' : 'Hectare');
    const shareText =
      currentLang === 'hi'
        ? `🌾 *फसल साथी - फसल पैदावार अनुमान*\n` +
          `📍 *स्थान:* ${districtName}, ${stateName}\n` +
          `🌱 *फसल:* ${cropName} (${formData.area} ${unitText})\n` +
          `🚜 *अनुमानित पैदावार:* करीब ${metrics.totalQuintal} क्विंटल (= ${metrics.quintalPerAcre} क्विंटल/एकड़)\n` +
          `⭐ *स्थिति:* ${ratingLabel} (${metrics.rating.summarySentence_hi})\n` +
          `\nआप भी अपनी फसल का निःशुल्क अनुमान देखें: फसल साथी (Fasal Saathi)`
        : `🌾 *Fasal Saathi - Crop Yield Estimate*\n` +
          `📍 *Location:* ${districtName}, ${stateName}\n` +
          `🌱 *Crop:* ${cropName} (${formData.area} ${unitText})\n` +
          `🚜 *Estimated Yield:* ~${metrics.totalQuintal} Quintals (= ${metrics.quintalPerAcre} Q/acre)\n` +
          `⭐ *Rating:* ${ratingLabel} (${metrics.rating.summarySentence_en})\n` +
          `\nPredict your harvest with Fasal Saathi!`;

    const encoded = encodeURIComponent(shareText);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const unitWord = formData.unit === 'acre' ? (currentLang === 'hi' ? 'एकड़' : 'acre') : (currentLang === 'hi' ? 'हेक्टेयर' : 'hectare');

  return (
    <div className="w-full max-w-[720px] mx-auto px-4 pb-20 pt-1 space-y-4">
      {/* Top Location Summary Header & Demo Badge */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E8E4D8] shadow-2xs flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F1F8E9] text-[#2E7D32] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              {t.resultSummaryPrefix}
            </span>
            <span className="text-sm sm:text-base font-semibold text-gray-900 leading-none">
              {cropObj?.emoji} {cropName}, {districtName}, {stateName}
            </span>
          </div>
        </div>
      </div>

      {/* Historical Data Year Notice Strip */}
      {prediction.data_year && (
        <div className="w-full bg-[#F1F8E9] border border-[#C8E6C9] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#1B5E20]">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span className="leading-snug">
              {t.dataYearNotice}
            </span>
          </div>
          <span className="shrink-0 font-semibold px-2 py-0.5 rounded-md bg-white border border-[#C8E6C9] text-[11px] sm:text-xs">
            {t.dataYearLabel}: {prediction.data_year}
          </span>
        </div>
      )}

      {/* =========================================================================
          1. VERDICT BANNER (Full width, colored by rating, big emoji & ONE plain sentence)
          ========================================================================= */}
      <div
        className={`w-full rounded-2xl p-4 sm:p-5 border-2 ${verdictConfig.bg} ${verdictConfig.border} shadow-xs text-left`}
      >
        <div className="flex items-start gap-3.5">
          <span className="text-4xl sm:text-5xl select-none shrink-0" role="img" aria-label="mood">
            {verdictConfig.emoji}
          </span>
          <div className="space-y-1">
            <h2 className={`text-base sm:text-lg font-bold leading-snug ${verdictConfig.text}`}>
              {currentLang === 'hi' ? verdictConfig.sentence_hi : verdictConfig.sentence_en}
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 font-medium">
              {metrics.rating.summarySentence_hi}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. RATING METER (5-segment horizontal bar with 'आप यहाँ हैं 📍' marker)
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E4D8] shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
          <span>{currentLang === 'hi' ? 'पैदावार मीटर:' : 'Yield Meter:'}</span>
          <span className="font-bold text-[#1B5E20]">
            {currentLang === 'hi' ? metrics.rating.label_hi : metrics.rating.label_en}
          </span>
        </div>

        {/* 5 segments */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {ratingSegments.map((seg) => {
            const isActive = metrics.rating.category === seg.key;
            return (
              <div key={seg.key} className="flex flex-col items-center gap-1">
                <div
                  className={`h-3 w-full rounded-sm ${seg.color} transition-all ${
                    isActive ? 'ring-2 ring-black/40 scale-y-125' : 'opacity-40'
                  }`}
                />
                <span className={`text-[10px] sm:text-[11px] text-center font-medium ${isActive ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
                  {currentLang === 'hi' ? seg.label_hi : seg.label_en}
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold text-gray-800 whitespace-nowrap -mt-0.5">
                    {currentLang === 'hi' ? 'आप यहाँ हैं 📍' : 'You are here 📍'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* "रेटिंग का मतलब" expandable legend */}
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowRatingLegend(!showRatingLegend)}
            className="text-xs font-semibold text-[#1B5E20] hover:underline flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{currentLang === 'hi' ? 'रेटिंग का मतलब समझें' : 'Understand what ratings mean'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRatingLegend ? 'rotate-180' : ''}`} />
          </button>

          {showRatingLegend && (
            <div className="mt-2 text-xs space-y-1 text-gray-600 bg-[#FFFDF7] p-2.5 rounded-xl border border-[#E8E4D8] animate-in fade-in duration-150">
              <div>• <strong>बहुत अच्छी:</strong> ज़िले के औसत से 15% या अधिक पैदावार</div>
              <div>• <strong>अच्छी:</strong> ज़िले के औसत से 5% से 15% अधिक पैदावार</div>
              <div>• <strong>सामान्य:</strong> ज़िले के औसत के लगभग बराबर (±5%)</div>
              <div>• <strong>औसत से कम:</strong> ज़िले के औसत से 10% से 25% कम पैदावार</div>
              <div>• <strong>ख़राब:</strong> ज़िले के औसत से 25% से भी कम पैदावार</div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          3. "इसका मतलब क्या है?" CARD
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E4D8] shadow-xs space-y-3.5 text-left">
        <h3 className="card-title text-gray-900">
          {currentLang === 'hi' ? 'इसका मतलब क्या है?' : 'What does this mean for your farm?'}
        </h3>

        {/* Plain words sentence */}
        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
          {currentLang === 'hi' ? (
            <>
              आपके <strong className="text-gray-950 font-bold">{formData.area} {unitWord}</strong> से करीब{' '}
              <strong className="text-[#1B5E20] font-bold">{metrics.totalQuintal} क्विंटल</strong> {cropName} निकलने का अनुमान है।
              आम तौर पर आपके ज़िले में इतनी ही ज़मीन से करीब{' '}
              <strong className="text-gray-950 font-bold">{districtAvgTotalQuintal} क्विंटल</strong> निकलती है।
            </>
          ) : (
            <>
              From your <strong className="text-gray-950 font-bold">{formData.area} {unitWord}</strong>, an estimated{' '}
              <strong className="text-[#1B5E20] font-bold">~{metrics.totalQuintal} Quintals</strong> of {cropName} is projected.
              Typically in your district, this land area yields around{' '}
              <strong className="text-gray-950 font-bold">~{districtAvgTotalQuintal} Quintals</strong>.
            </>
          )}
        </p>

        {/* 2 Small Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#F1F8E9] border border-[#C8E6C9]">
            <span className="text-xs sm:text-sm text-gray-600 font-medium block">
              {currentLang === 'hi' ? 'कुल अनुमानित पैदावार' : 'Total Harvest'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-[32px] sm:text-[44px] font-bold text-[#1B5E20] tabular-nums leading-none">
                ~{metrics.totalQuintal}
              </span>
              <span className="text-[18px] font-semibold text-gray-700">
                {t.quintal}
              </span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#FFFDF7] border border-[#E8E4D8]">
            <span className="text-xs sm:text-sm text-gray-600 font-medium block">
              {currentLang === 'hi' ? 'प्रति एकड़ दर' : 'Per Acre Rate'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-[28px] sm:text-[36px] font-bold text-gray-900 tabular-nums leading-none">
                ~{metrics.quintalPerAcre}
              </span>
              <span className="text-[15px] sm:text-[18px] font-semibold text-gray-700">
                {currentLang === 'hi' ? 'क्विंटल/एकड़' : 'Q/acre'}
              </span>
            </div>
          </div>
        </div>

        {/* Range Line */}
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 flex items-center justify-between">
          <span className="font-medium text-gray-500">
            {currentLang === 'hi' ? 'संभावित दायरा:' : 'Possible Range:'}
          </span>
          <span className="font-semibold text-gray-900 tabular-nums">
            {currentLang === 'hi'
              ? `कम से कम ${metrics.rangeLowQuintal}, ज़्यादा से ज़्यादा ${metrics.rangeHighQuintal} क्विंटल`
              : `Minimum ${metrics.rangeLowQuintal}, Maximum ${metrics.rangeHighQuintal} Quintals`}
          </span>
        </div>
      </div>

      {/* =========================================================================
          4. COLLAPSED "तकनीकी जानकारी" (Hidden by default)
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E8E4D8] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTechnical(!showTechnical)}
          className="w-full p-3.5 flex items-center justify-between text-left text-xs font-semibold text-gray-700 hover:bg-[#FFFDF7]"
          aria-expanded={showTechnical}
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            <span>{currentLang === 'hi' ? 'तकनीकी जानकारी (ton/ha आदि)' : 'Technical Info (ton/hectare)'}</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTechnical ? 'rotate-180' : ''}`} />
        </button>

        {showTechnical && (
          <div className="p-3.5 pt-0 text-xs text-gray-600 space-y-1.5 border-t border-gray-100 bg-[#FFFDF7] tabular-nums">
            <div className="flex justify-between">
              <span>अनुमानित पैदावार (टन/हेक्टेयर):</span>
              <span className="font-semibold">{metrics.tonPerHectare} ton/ha</span>
            </div>
            <div className="flex justify-between">
              <span>ज़िला औसत (टन/हेक्टेयर):</span>
              <span className="font-semibold">{metrics.districtAvgTonPerHectare} ton/ha</span>
            </div>
            <div className="flex justify-between">
              <span>हेक्टेयर में क्षेत्रफल:</span>
              <span className="font-semibold">{metrics.areaHectare} हेक्टेयर</span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          5. COMPARISON BARS
          ========================================================================= */}
      <ComparisonBar
        metrics={metrics}
        districtName={districtName}
        currentLang={currentLang}
      />

      {/* =========================================================================
          6. "ऐसा क्यों?" CARD (with 👍 फ़ायदेमंद / ⚠️ चिंता की बात)
          ========================================================================= */}
      <ReasonList
        reasons={prediction.reasons}
        currentLang={currentLang}
      />

      {/* =========================================================================
          7. "क्या करें?" CARD (General advice only, no chemical spray advice)
          ========================================================================= */}
      <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E4D8] shadow-xs text-left space-y-3">
        <div>
          <h3 className="card-title text-gray-900">
            {t.adviceTitle}
          </h3>
          <p className="helper-text text-gray-500">
            {t.adviceSubtitle}
          </p>
        </div>

        <div className="space-y-2">
          {prediction.advice.map((item, idx) => {
            const text = currentLang === 'hi' ? item.text_hi : item.text_en;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#FFFDF7] border border-[#E8E4D8] flex items-start gap-2.5 text-xs sm:text-sm text-gray-800 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mt-1.5 shrink-0" />
                <span>{text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          8. CONFIDENCE & KVK CARDS & WHATSAPP
          ========================================================================= */}
      <ConfidenceMeter
        confidence={prediction.confidence}
        soilSource={prediction.soil_source}
        currentLang={currentLang}
        expectedErrorPct={prediction.expected_error_pct}
      />

      {/* KVK Helpline Card */}
      <div className="p-4 rounded-2xl bg-[#F1F8E9] border border-[#C8E6C9] flex items-start gap-3 text-left">
        <div className="w-9 h-9 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shrink-0 mt-0.5">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-[#1B5E20]">
            {currentLang === 'hi' ? 'कृषि विज्ञान केंद्र (KVK) सहायता' : 'Krishi Vigyan Kendra (KVK)'}
          </h4>
          <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
            {t.kvkContactNote}
          </p>
          <div className="mt-2 text-xs font-semibold text-[#1B5E20] flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t.aboutTollFree}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          10. ACTION BUTTONS: "जानकारी बदलें" and "नया अनुमान" + WhatsApp
          ========================================================================= */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <button
          type="button"
          onClick={onEditDetails}
          className="btn-secondary flex-1 bg-white hover:bg-[#F1F8E9] text-[#1B5E20] border-2 border-[#2E7D32] shadow-2xs active:scale-95"
        >
          <Edit3 className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span>{currentLang === 'hi' ? 'जानकारी बदलें' : 'Edit Details'}</span>
        </button>

        <button
          type="button"
          onClick={onNewPrediction}
          className="btn-primary-gradient flex-1"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>{currentLang === 'hi' ? 'नया अनुमान' : 'New Prediction'}</span>
        </button>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="btn-secondary sm:flex-initial bg-[#25D366] hover:bg-[#1EBE5D] text-white border-transparent shadow-xs active:scale-95"
          title="व्हाट्सएप पर शेयर करें"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>{currentLang === 'hi' ? 'व्हाट्सएप' : 'WhatsApp'}</span>
        </button>
      </div>

      {/* Bottom Disclaimer */}
      <div className="pt-4 border-t border-[#E8E4D8]/80 text-center">
        <p className="helper-text text-gray-500 max-w-xl mx-auto">
          ⚠️ {t.resultDisclaimer}
        </p>
      </div>
    </div>
  );
};
