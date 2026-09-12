import axios from 'axios'
import { SUPABASE_ANON_KEY } from './supabase'
import type {
  ProcessData, EmissionResults, Recommendation, SimulationSliders,
  SimulationResult, OptimizationResult,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
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
  const res = await api.post('/api/emissions/calculate', data)
  return res.data
}

export async function generateRecommendations(params: {
  emission_results: EmissionResults;
  industry?: string;
  materials?: string[];
  waste_disposal_methods?: string[];
  rejected_pct?: number;
  [key: string]: any;
}): Promise<{ recommendations: Recommendation[] }> {
  const res = await api.post('/api/recommendations/generate', params)
  return res.data
}

export async function runSimulation(params: {
  base_emission_results: EmissionResults;
  sliders: SimulationSliders;
}): Promise<SimulationResult> {
  const res = await api.post('/api/simulation/run', params)
  return res.data
}

export async function runOptimization(params: {
  current_co2e_tonnes: number;
  target_reduction_pct: number;
  max_budget_inr: number;
  max_period_months: number;
  industry: string;
  emission_results?: EmissionResults;
  materials: string[];
  waste_disposal_methods: string[];
  rejected_pct: number;
}): Promise<OptimizationResult> {
  const res = await api.post('/api/optimization/run', params)
  return res.data
}

export default api
