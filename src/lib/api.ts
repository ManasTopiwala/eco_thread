import axios from 'axios'
import { supabase, SUPABASE_ANON_KEY } from './supabase'
import type {
  ProcessData, EmissionResults, Recommendation, FacilityWasteDiagnosis, IndustryProfile,
} from '../types'
import { computeEmissions } from './calculator'
import { generateDedicatedRecommendations } from './recommendationEngine'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000, // 5s timeout before falling back
})

// Attach authorization headers automatically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (SUPABASE_ANON_KEY) {
    config.headers.apikey = SUPABASE_ANON_KEY
  }
  return config
})

export async function calculateEmissions(data: ProcessData): Promise<EmissionResults & Record<string, any>> {
  try {
    const res = await api.post('/api/emissions/calculate', data)
    return res.data
  } catch (err) {
    console.info('Backend API unavailable, using built-in emissions engine:', err)
    return computeEmissions(data)
  }
}

export async function generateRecommendations(params: {
  emission_results?: EmissionResults | null;
  process_data?: ProcessData | null;
  industry_profile?: IndustryProfile | null;
  industry?: string;
  materials?: string[];
  waste_disposal_methods?: string[];
  rejected_pct?: number;
  [key: string]: any;
}): Promise<{ recommendations: Recommendation[]; diagnosis?: FacilityWasteDiagnosis }> {
  // 1. First attempt: Invoke deployed Supabase Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('generate-recommendations', {
      body: params,
    })
    if (!error && data?.recommendations?.length) {
      return {
        recommendations: data.recommendations,
        diagnosis: data.diagnosis,
      }
    }
    if (error) {
      console.info('Supabase Edge Function returned error, testing fallback:', error)
    }
  } catch (edgeErr) {
    console.info('Supabase Edge Function invocation failed, testing fallback:', edgeErr)
  }

  // 2. Second attempt: Check local/configured REST backend
  try {
    const res = await api.post('/api/recommendations/generate', params)
    if (res.data?.recommendations?.length) {
      return {
        recommendations: res.data.recommendations,
        diagnosis: res.data.diagnosis,
      }
    }
  } catch (err) {
    // Expected when no local external backend server running
  }

  // 3. Third resilient layer: Built-in dedicated material & waste recommendation engine
  return generateDedicatedRecommendations(params)
}

export default api


