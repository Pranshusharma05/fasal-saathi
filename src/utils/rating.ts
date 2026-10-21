export type RatingCategory = 'great' | 'good' | 'normal' | 'low' | 'bad';

export interface RatingDetails {
  category: RatingCategory;
  label_hi: string;
  label_en: string;
  colorHex: string;
  bgColorHex: string;
  textColorHex: string;
  borderColorHex: string;
  iconName: string;
  ratio: number;
  percentDiff: number;
  isPositive: boolean;
  isNeutral: boolean;
  summarySentence_hi: string;
  summarySentence_en: string;
}

export interface YieldMetrics {
  totalQuintal: number;
  quintalPerAcre: number;
  quintalPerHectare: number;
  tonPerHectare: number;
  rangeLowQuintal: number;
  rangeHighQuintal: number;
  districtAvgQuintalPerAcre: number;
  districtAvgTonPerHectare: number;
  rating: RatingDetails;
  areaAcre: number;
  areaHectare: number;
  unit: 'acre' | 'hectare';
}

/**
 * Calculates rating and all farmer unit conversions
 * 
 * Formulas:
 * ratio = predicted_yield / district_avg_yield
 * - ratio >= 1.15  -> "बहुत अच्छी" (green)
 * - 1.05 to 1.15   -> "अच्छी" (green)
 * - 0.90 to 1.05   -> "सामान्य" (yellow)
 * - 0.75 to 0.90   -> "औसत से कम" (orange)
 * - below 0.75     -> "ख़राब" (red)
 * 
 * Unit conversions:
 * quintal per hectare = ton/ha x 10
 * quintal per acre = ton/ha x 4.047
 * hectare = acre x 0.4047
 * total quintal = ton/ha x 10 x area in hectares
 * percent difference = (ratio - 1) x 100 rounded
 */
export function calculateRating(
  predicted_yield_t_ha: number,
  district_avg_t_ha: number
): RatingDetails {
  const safeAvg = district_avg_t_ha > 0 ? district_avg_t_ha : 1;
  const ratio = predicted_yield_t_ha / safeAvg;
  const percentDiff = Math.round((ratio - 1) * 100);
  const absDiff = Math.abs(percentDiff);

  let category: RatingCategory;
  let label_hi: string;
  let label_en: string;
  let colorHex: string;
  let bgColorHex: string;
  let textColorHex: string;
  let borderColorHex: string;
  let iconName: string;

  if (ratio >= 1.15) {
    category = 'great';
    label_hi = 'बहुत अच्छी';
    label_en = 'Very Good';
    colorHex = '#2E7D32';
    bgColorHex = '#E8F5E9';
    textColorHex = '#1B5E20';
    borderColorHex = '#A5D6A7';
    iconName = 'Sparkles';
  } else if (ratio >= 1.05) {
    category = 'good';
    label_hi = 'अच्छी';
    label_en = 'Good';
    colorHex = '#2E7D32';
    bgColorHex = '#F1F8E9';
    textColorHex = '#2E7D32';
    borderColorHex = '#C8E6C9';
    iconName = 'CheckCircle2';
  } else if (ratio >= 0.90) {
    category = 'normal';
    label_hi = 'सामान्य';
    label_en = 'Average';
    colorHex = '#F9A825';
    bgColorHex = '#FFFDE7';
    textColorHex = '#F57F17';
    borderColorHex = '#FFF59D';
    iconName = 'MinusCircle';
  } else if (ratio >= 0.75) {
    category = 'low';
    label_hi = 'औसत से कम';
    label_en = 'Below Average';
    colorHex = '#EF6C00';
    bgColorHex = '#FFF3E0';
    textColorHex = '#E65100';
    borderColorHex = '#FFE0B2';
    iconName = 'TrendingDown';
  } else {
    category = 'bad';
    label_hi = 'ख़राब';
    label_en = 'Poor';
    colorHex = '#C62828';
    bgColorHex = '#FFEBEE';
    textColorHex = '#B71C1C';
    borderColorHex = '#FFCDD2';
    iconName = 'AlertTriangle';
  }

  const isPositive = percentDiff > 0;
  const isNeutral = percentDiff === 0;

  let summarySentence_hi: string;
  let summarySentence_en: string;

  if (isNeutral) {
    summarySentence_hi = 'ज़िले की औसत पैदावार के बिल्कुल बराबर';
    summarySentence_en = 'Exactly matching district average yield';
  } else if (isPositive) {
    summarySentence_hi = `ज़िले की औसत से लगभग ${absDiff}% अधिक`;
    summarySentence_en = `About ${absDiff}% higher than district average`;
  } else {
    summarySentence_hi = `ज़िले की औसत से लगभग ${absDiff}% कम`;
    summarySentence_en = `About ${absDiff}% lower than district average`;
  }

  return {
    category,
    label_hi,
    label_en,
    colorHex,
    bgColorHex,
    textColorHex,
    borderColorHex,
    iconName,
    ratio,
    percentDiff,
    isPositive,
    isNeutral,
    summarySentence_hi,
    summarySentence_en,
  };
}

export function computeYieldMetrics(
  yield_t_ha: number,
  range_low_t_ha: number,
  range_high_t_ha: number,
  district_avg_t_ha: number,
  inputArea: number,
  inputUnit: 'acre' | 'hectare'
): YieldMetrics {
  const areaAcre = inputUnit === 'acre' ? inputArea : inputArea / 0.4047;
  const areaHectare = inputUnit === 'hectare' ? inputArea : inputArea * 0.4047;

  // Formula: quintal per hectare = ton/ha * 10
  const quintalPerHectare = yield_t_ha * 10;
  // Formula: quintal per acre = ton/ha * 4.047
  const quintalPerAcre = yield_t_ha * 4.047;
  // Formula: total quintal = ton/ha * 10 * area in hectares
  const totalQuintal = yield_t_ha * 10 * areaHectare;

  const rangeLowQuintal = range_low_t_ha * 10 * areaHectare;
  const rangeHighQuintal = range_high_t_ha * 10 * areaHectare;

  const districtAvgQuintalPerAcre = district_avg_t_ha * 4.047;

  const rating = calculateRating(yield_t_ha, district_avg_t_ha);

  return {
    totalQuintal: Math.round(totalQuintal * 10) / 10,
    quintalPerAcre: Math.round(quintalPerAcre * 10) / 10,
    quintalPerHectare: Math.round(quintalPerHectare * 10) / 10,
    tonPerHectare: Math.round(yield_t_ha * 10) / 10,
    rangeLowQuintal: Math.round(rangeLowQuintal),
    rangeHighQuintal: Math.round(rangeHighQuintal),
    districtAvgQuintalPerAcre: Math.round(districtAvgQuintalPerAcre * 10) / 10,
    districtAvgTonPerHectare: Math.round(district_avg_t_ha * 10) / 10,
    rating,
    areaAcre: Math.round(areaAcre * 100) / 100,
    areaHectare: Math.round(areaHectare * 100) / 100,
    unit: inputUnit,
  };
}

/**
 * Area converter helper
 */
export function convertArea(value: number, fromUnit: 'acre' | 'hectare'): {
  acre: number;
  hectare: number;
} {
  if (fromUnit === 'acre') {
    return {
      acre: value,
      hectare: Math.round(value * 0.4047 * 100) / 100,
    };
  } else {
    return {
      acre: Math.round((value / 0.4047) * 100) / 100,
      hectare: value,
    };
  }
}
