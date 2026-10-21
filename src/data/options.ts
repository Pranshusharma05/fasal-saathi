import indiaData from './india.json';

export interface District {
  id: string;
  name_hi: string;
  name_en: string;
}

export interface StateOption {
  id: string;
  name_hi: string;
  name_en: string;
  districts: District[];
}

export interface CropOption {
  id: string;
  name_hi: string;
  name_en: string;
  emoji: string;
  defaultSeason: 'kharif' | 'rabi' | 'zaid' | 'annual' | 'autumn' | 'winter';
  typical_yield_t_ha: number;
  popular?: boolean;
}

export interface SeasonOption {
  id: 'kharif' | 'rabi' | 'zaid' | 'annual' | 'autumn' | 'winter';
  name_hi: string;
  name_en: string;
  description_hi: string;
  description_en: string;
  isExtra?: boolean;
}

export interface SoilOption {
  id: string;
  name_hi: string;
  name_en: string;
  description_hi: string;
  description_en: string;
  emoji: string;
}

export interface FertilizerOption {
  id: 'low' | 'medium' | 'high' | 'unknown';
  name_hi: string;
  name_en: string;
  label_hi: string;
  label_en: string;
}

export interface SowingTimingOption {
  id: 'yet_to_sow' | 'this_month' | 'one_month_ago' | 'two_months_ago' | 'three_plus_months' | 'dont_remember';
  label_hi: string;
  label_en: string;
}

// Map from india.json into StateOption[]
export const STATES: StateOption[] = indiaData.states.map((s) => ({
  id: s.id,
  name_hi: s.hi,
  name_en: s.en,
  districts: s.districts.map((d) => ({
    id: d.en.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    name_hi: d.hi,
    name_en: d.en,
  })),
}));

// 28 crops: 8 popular shown first as cards, plus 20 common crops
export const CROPS: CropOption[] = [
  // 8 Popular crops
  { id: 'wheat', name_hi: 'गेहूँ', name_en: 'Wheat', emoji: '🌾', defaultSeason: 'rabi', typical_yield_t_ha: 3.2, popular: true },
  { id: 'rice', name_hi: 'धान', name_en: 'Paddy / Rice', emoji: '🌱', defaultSeason: 'kharif', typical_yield_t_ha: 3.8, popular: true },
  { id: 'maize', name_hi: 'मक्का', name_en: 'Maize', emoji: '🌽', defaultSeason: 'kharif', typical_yield_t_ha: 2.8, popular: true },
  { id: 'cotton', name_hi: 'कपास', name_en: 'Cotton', emoji: '☁️', defaultSeason: 'kharif', typical_yield_t_ha: 1.6, popular: true },
  { id: 'sugarcane', name_hi: 'गन्ना', name_en: 'Sugarcane', emoji: '🎋', defaultSeason: 'annual', typical_yield_t_ha: 65.0, popular: true },
  { id: 'mustard', name_hi: 'सरसों', name_en: 'Mustard', emoji: '🌼', defaultSeason: 'rabi', typical_yield_t_ha: 1.4, popular: true },
  { id: 'chickpea', name_hi: 'चना', name_en: 'Gram / Chickpea', emoji: '🫘', defaultSeason: 'rabi', typical_yield_t_ha: 1.2, popular: true },
  { id: 'potato', name_hi: 'आलू', name_en: 'Potato', emoji: '🥔', defaultSeason: 'rabi', typical_yield_t_ha: 22.0, popular: true },

  // Additional 20 common crops
  { id: 'bajra', name_hi: 'बाजरा', name_en: 'Bajra / Pearl Millet', emoji: '🌾', defaultSeason: 'kharif', typical_yield_t_ha: 1.5 },
  { id: 'jowar', name_hi: 'ज्वार', name_en: 'Jowar / Sorghum', emoji: '🌾', defaultSeason: 'kharif', typical_yield_t_ha: 1.2 },
  { id: 'ragi', name_hi: 'रागी', name_en: 'Ragi / Finger Millet', emoji: '🌾', defaultSeason: 'kharif', typical_yield_t_ha: 1.6 },
  { id: 'barley', name_hi: 'जौ', name_en: 'Barley', emoji: '🌾', defaultSeason: 'rabi', typical_yield_t_ha: 2.6 },
  { id: 'arhar', name_hi: 'अरहर (तूर)', name_en: 'Arhar / Pigeon Pea', emoji: '🫘', defaultSeason: 'kharif', typical_yield_t_ha: 1.0 },
  { id: 'moong', name_hi: 'मूंग', name_en: 'Moong / Green Gram', emoji: '🫘', defaultSeason: 'zaid', typical_yield_t_ha: 0.8 },
  { id: 'urad', name_hi: 'उड़द', name_en: 'Urad / Black Gram', emoji: '🫘', defaultSeason: 'kharif', typical_yield_t_ha: 0.7 },
  { id: 'masoor', name_hi: 'मसूर', name_en: 'Masoor / Red Lentil', emoji: '🫘', defaultSeason: 'rabi', typical_yield_t_ha: 1.1 },
  { id: 'peas', name_hi: 'मटर', name_en: 'Green Peas', emoji: '🫛', defaultSeason: 'rabi', typical_yield_t_ha: 3.5 },
  { id: 'groundnut', name_hi: 'मूंगफली', name_en: 'Groundnut / Peanut', emoji: '🥜', defaultSeason: 'kharif', typical_yield_t_ha: 1.8 },
  { id: 'soybean', name_hi: 'सोयाबीन', name_en: 'Soybean', emoji: '🌱', defaultSeason: 'kharif', typical_yield_t_ha: 1.4 },
  { id: 'sunflower', name_hi: 'सूरजमुखी', name_en: 'Sunflower', emoji: '🌻', defaultSeason: 'rabi', typical_yield_t_ha: 1.2 },
  { id: 'sesame', name_hi: 'तिल', name_en: 'Sesame / Til', emoji: '🌿', defaultSeason: 'kharif', typical_yield_t_ha: 0.5 },
  { id: 'jute', name_hi: 'जूट', name_en: 'Jute', emoji: '🌾', defaultSeason: 'kharif', typical_yield_t_ha: 2.5 },
  { id: 'onion', name_hi: 'प्याज', name_en: 'Onion', emoji: '🧅', defaultSeason: 'rabi', typical_yield_t_ha: 18.0 },
];

// Season cards: primary 4 + 2 under "और विकल्प"
export const SEASONS: SeasonOption[] = [
  {
    id: 'kharif',
    name_hi: 'खरीफ',
    name_en: 'Kharif',
    description_hi: 'बारिश की फसल (मानसून)',
    description_en: 'Monsoon / Rainy Season',
  },
  {
    id: 'rabi',
    name_hi: 'रबी',
    name_en: 'Rabi',
    description_hi: 'सर्दी की फसल (शीतकाल)',
    description_en: 'Winter Season',
  },
  {
    id: 'zaid',
    name_hi: 'जायद',
    name_en: 'Zaid',
    description_hi: 'गर्मी की फसल (ग्रीष्मकाल)',
    description_en: 'Summer Season',
  },
  {
    id: 'annual',
    name_hi: 'पूरे साल',
    name_en: 'Annual / Perennial',
    description_hi: 'लंबी अवधि की फसल (जैसे गन्ना)',
    description_en: 'Long duration crop (e.g. Sugarcane)',
  },
  // Under "और विकल्प"
  {
    id: 'autumn',
    name_hi: 'शरद',
    name_en: 'Autumn',
    description_hi: 'शरद ऋतु की फसल',
    description_en: 'Autumn Season',
    isExtra: true,
  },
  {
    id: 'winter',
    name_hi: 'शीतकालीन',
    name_en: 'Late Winter',
    description_hi: 'गहन शीतकालीन फसल',
    description_en: 'Late Winter Season',
    isExtra: true,
  },
];

// Sowing date chips
// Not used by the ML model yet. Keep or remove depending on the final dataset.
export const SOWING_TIMING_OPTIONS: SowingTimingOption[] = [
  { id: 'dont_remember', label_hi: 'याद नहीं ✓', label_en: "Don't remember ✓" },
  { id: 'yet_to_sow', label_hi: 'अभी बोनी है', label_en: 'Yet to sow' },
  { id: 'this_month', label_hi: 'इसी महीने बोई', label_en: 'Sown this month' },
  { id: 'one_month_ago', label_hi: '1 महीना पहले', label_en: '1 month ago' },
  { id: 'two_months_ago', label_hi: '2 महीने पहले', label_en: '2 months ago' },
  { id: 'three_plus_months', label_hi: '3 महीने या उससे पहले', label_en: '3+ months ago' },
];

export const SOIL_TYPES: SoilOption[] = [
  {
    id: 'unknown',
    name_hi: 'पता नहीं',
    name_en: "Don't know",
    description_hi: 'ज़िले की औसत मिट्टी का उपयोग होगा',
    description_en: 'Will use district average soil',
    emoji: '❓',
  },
  {
    id: 'alluvial',
    name_hi: 'जलोढ़ मिट्टी',
    name_en: 'Alluvial Soil',
    description_hi: 'नदी किनारे की उपजाऊ मिट्टी',
    description_en: 'Fertile river basin soil',
    emoji: '🌊',
  },
  {
    id: 'black',
    name_hi: 'काली मिट्टी',
    name_en: 'Black Soil (Regur)',
    description_hi: 'कपास व नमी सोखने के लिए उत्तम',
    description_en: 'Best for cotton, holds deep moisture',
    emoji: '⬛',
  },
  {
    id: 'red',
    name_hi: 'लाल मिट्टी',
    name_en: 'Red Soil',
    description_hi: 'बलुई व हलकी संरचना, अच्छी निकासी',
    description_en: 'Porous, well-draining soil',
    emoji: '🧱',
  },
  {
    id: 'sandy',
    name_hi: 'रेतीली मिट्टी',
    name_en: 'Sandy Soil',
    description_hi: 'पानी जल्दी बहने वाली हल्की मिट्टी',
    description_en: 'Light soil with quick drainage',
    emoji: '🏖️',
  },
  {
    id: 'clayey',
    name_hi: 'चिकनी मिट्टी',
    name_en: 'Clayey Soil',
    description_hi: 'पानी रोकने की ज़्यादा क्षमता',
    description_en: 'Heavy soil with high water retention',
    emoji: '🏺',
  },
  {
    id: 'loam',
    name_hi: 'दोमट मिट्टी',
    name_en: 'Loam Soil',
    description_hi: 'खेती के लिए सबसे संतुलित मिट्टी',
    description_en: 'Balanced texture ideal for crops',
    emoji: '🌱',
  },
];

export const FERTILIZER_OPTIONS: FertilizerOption[] = [
  { id: 'unknown', name_hi: 'पता नहीं', name_en: "Don't know", label_hi: 'पता नहीं (औसत)', label_en: "Don't know" },
  { id: 'low', name_hi: 'कम', name_en: 'Low', label_hi: 'कम खाद', label_en: 'Low' },
  { id: 'medium', name_hi: 'मध्यम', name_en: 'Medium', label_hi: 'मध्यम खाद', label_en: 'Medium' },
  { id: 'high', name_hi: 'ज़्यादा', name_en: 'High', label_hi: 'ज़्यादा खाद', label_en: 'High' },
];
