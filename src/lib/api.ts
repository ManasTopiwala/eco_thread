import axios from 'axios'
import type {
  ProcessData, EmissionResults, Recommendation, SimulationSliders,
  SimulationResult, OptimizationResult,
} from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export async function calculateEmissions(data: ProcessData): Promise<EmissionResults & Record<string, any>> {
  const res = await api.post('/emissions/calculate', data)
  return res.data
}

export async function generateRecommendations(params: {
  emission_results: EmissionResults;
  industry: string;
  materials: string[];
  waste_disposal_methods: string[];
  rejected_pct: number;
}): Promise<{ recommendations: Recommendation[] }> {
  const res = await api.post('/recommendations/generate', params)
  return res.data
}

export async function runSimulation(params: {
  base_emission_results: EmissionResults;
  sliders: SimulationSliders;
}): Promise<SimulationResult> {
  const res = await api.post('/simulation/run', params)
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
  const res = await api.post('/optimization/run', params)
  return res.data
}

export default api
