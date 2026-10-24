import { STATES } from '../data/options';

export interface PredictFormData {
  state: string;
  district: string;
  crop: string;
  season: 'kharif' | 'rabi' | 'zaid' | 'annual' | 'autumn' | 'winter';
  area: number;
  unit: 'acre' | 'hectare';
  sowingTiming?: string;
  sowingDate?: string;
  soilType?: string;
  fertilizer?: 'low' | 'medium' | 'high' | 'unknown';
  soilHealthCard?: {
    n?: number;
    p?: number;
    k?: number;
    ph?: number;
  };
}

export interface PredictionReason {
  impact: 'positive' | 'negative' | 'neutral';
  text_hi: string;
  text_en: string;
}

export interface PredictionAdvice {
  text_hi: string;
  text_en: string;
}

export interface PredictionResponse {
  yield_t_ha: number;
  range_low_t_ha: number;
  range_high_t_ha: number;
  district_avg_t_ha: number;
  confidence: 'low' | 'medium' | 'high';
  soil_source: 'district_average' | 'user_reported' | 'soil_health_card';
  reasons: PredictionReason[];
  advice: PredictionAdvice[];
  data_year?: number;
  expected_error_pct?: number;
}

export interface ModelInfoResponse {
  model_name?: string;
  median_abs_pct_error?: number;
  within_25_pct?: number;
  within_50_pct?: number;
  rows_evaluated?: number;
  note?: string;
}

export async function getModelInfo(): Promise<ModelInfoResponse> {
  const res = await fetch('/api/model-info');
  if (!res.ok) {
    throw new Error('Failed to fetch model info');
  }
  return res.json();
}

/**
 * Prediction API: calls the real Flask backend (/api/predict).
 * Converts state/district IDs to English names expected by the ML model.
 */
export async function predictYield(formData: PredictFormData): Promise<PredictionResponse> {
  const st = STATES.find((s) => s.id === formData.state);
  const dist = st?.districts.find((d) => d.id === formData.district);

  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state: st?.name_en ?? formData.state,
      district: dist?.name_en ?? formData.district,
      crop: formData.crop,
      season: formData.season,
      area: formData.area,
      unit: formData.unit,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Server error / सर्वर में समस्या');
  }
  return res.json();
}
