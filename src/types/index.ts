// EcoLoop — Shared TypeScript types

export interface EmissionSource {
  category: string;
  co2e_tonnes: number;
  percentage: number;
  severity?: 'High' | 'Medium' | 'Low';
  projected_co2e_tonnes?: number;
  reduction_tonnes?: number;
}

export interface EmissionResults {
  total_co2e_tonnes: number;
  co2e_per_unit: number;
  sources: EmissionSource[];
  detailed_sources?: any[];
  data_label?: string;
}

export interface EnergyEntry {
  source: 'Electricity' | 'Coal' | 'Natural Gas' | 'Diesel' | 'Fuel Oil' | 'LPG' | 'Renewable';
  quantity: number;
  unit: 'kWh' | 'MWh' | 'GJ' | 'litre' | 'L';
  monthly_consumption?: number;
}

export interface MaterialEntry {
  name: string;
  category?: string;
  quantity: number;
  unit: 'kg' | 'tonne';
  recycled_content: 'virgin' | 'partially-recycled' | 'fully-recycled';
}

export interface ProductionEntry {
  quantity: number;
  unit: string;
  period?: string;
  rejected_units: number;
}

export interface WasteEntry {
  waste_type: string;
  quantity: number;
  unit: 'kg' | 'tonne';
  disposal_method: 'Landfill' | 'Incineration' | 'Recycling' | 'Reuse' | 'Composting' | 'Waste-to-Energy' | 'Internal Recovery' | 'Other';
  recoverable_pct: number;
}

export interface ProcessData {
  energy: EnergyEntry[];
  materials: MaterialEntry[];
  production: ProductionEntry[];
  waste: WasteEntry[];
  industry?: string;
}

export interface Recommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  score: number;
  why: string;
  estimated_co2_reduction_tonnes: number;
  estimated_co2_reduction_pct: number;
  cost_range_min_inr: number;
  cost_range_max_inr: number;
  annual_saving_inr: number;
  payback_years: number;
  feasibility_score: number;
  circularity_score: number;
}

export interface SimulationSliders {
  recycled_material_pct: number;
  waste_recovery_pct: number;
  renewable_energy_pct: number;
  process_optimization_pct: number;
  reuse_program_pct: number;
}

export interface SimulationResult {
  original_co2e_tonnes: number;
  projected_co2e_tonnes: number;
  reduction_tonnes: number;
  reduction_pct: number;
  annual_saving_inr: number;
  projected_sources: EmissionSource[];
}

export interface OptimizationResult {
  target_reduction_pct: number;
  target_co2e_tonnes: number;
  achieved_reduction_pct: number;
  achieved_co2e_reduction_tonnes: number;
  projected_co2e_tonnes: number;
  total_investment_inr: number;
  annual_saving_inr: number;
  payback_years: number | null;
  selected_interventions: Recommendation[];
  target_achieved: boolean;
  message: string | null;
  best_carbon_roi_id: string | null;
}

export interface ActionPlanItem {
  id: string;
  intervention_id: string;
  name: string;
  estimated_cost_inr: number;
  expected_co2_reduction_tonnes: number;
  start_date?: string;
  target_date?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface IndustryProfile {
  company_name: string;
  industry_type: string;
  size: string;
  location: string;
  production_type: string;
  production_capacity: number;
  production_unit: string;
  employees: number;
  operating_hours_day: number;
  operating_days_month: number;
}
