// EchoDec — Shared TypeScript types

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
  unit: 'kWh' | 'MWh' | 'GJ' | 'litre' | 'L' | 'kg' | 'tonne' | 'm3';
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
