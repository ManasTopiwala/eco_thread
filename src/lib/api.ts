import axios from 'axios'
import { SUPABASE_ANON_KEY } from './supabase'
import type {
  ProcessData, EmissionResults, Recommendation,
} from '../types'
import { computeEmissions, buildRecommendations } from './calculator'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 4000, // 4s timeout before falling back
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
  emission_results: EmissionResults;
  industry?: string;
  materials?: string[];
  waste_disposal_methods?: string[];
  rejected_pct?: number;
  [key: string]: any;
}): Promise<{ recommendations: Recommendation[] }> {
  try {
    const res = await api.post('/api/recommendations/generate', params)
    if (res.data?.recommendations?.length) {
      return res.data
    }
  } catch (err) {
    console.info('Backend recommendation API unavailable, using built-in engine:', err)
  }

  const recommendations = buildRecommendations(params)
  return { recommendations }
}

export default api

