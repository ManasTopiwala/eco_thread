/**
 * Demo data for ABC Precision Manufacturing
 * All values labeled "Demo / Reference Data — not verified regional factors."
 */
import type { ProcessData, EmissionResults, IndustryProfile } from '../types'

export const DEMO_LABEL = 'Demo / Reference Data — not verified regional factors.'

export const DEMO_PROFILE: IndustryProfile = {
  company_name: 'ABC Precision Manufacturing',
  industry_type: 'Manufacturing',
  size: 'Medium',
  location: 'Pune, Maharashtra',
  production_type: 'Precision Metal Components',
  production_capacity: 5000,
  production_unit: 'units',
  employees: 120,
  operating_hours_day: 8,
  operating_days_month: 25,
}

export const DEMO_PROCESS_DATA: ProcessData = {
  energy: [
    { source: 'Electricity', quantity: 10000, unit: 'kWh', monthly_consumption: 10000 },
    { source: 'Diesel', quantity: 500, unit: 'litre', monthly_consumption: 500 },
  ],
  materials: [
    { name: 'Aluminium', category: 'Metal', quantity: 2000, unit: 'kg', recycled_content: 'virgin' },
    { name: 'Steel', category: 'Metal', quantity: 1500, unit: 'kg', recycled_content: 'virgin' },
  ],
  production: [
    { quantity: 5000, unit: 'units', period: 'monthly', rejected_units: 125 },
  ],
  waste: [
    { waste_type: 'Aluminium scrap', quantity: 500, unit: 'kg', disposal_method: 'Landfill', recoverable_pct: 80 },
  ],
  industry: 'Manufacturing',
}

// Pre-computed demo emission results (12.4 tCO2e as per spec Section 16)
// These match what the backend would return for the demo data above.
export const DEMO_EMISSION_RESULTS: EmissionResults = {
  total_co2e_tonnes: 12.4,
  co2e_per_unit: 0.00248,
  sources: [
    { category: 'Materials', co2e_tonnes: 5.21, percentage: 42.0, severity: 'High' },
    { category: 'Energy', co2e_tonnes: 3.68, percentage: 29.7, severity: 'Medium' },
    { category: 'Waste', co2e_tonnes: 3.51, percentage: 28.3, severity: 'Medium' },
  ],
  data_label: DEMO_LABEL,
}

export const formatCO2 = (tonnes: number): string => {
  if (tonnes >= 1000) return `${(tonnes / 1000).toFixed(1)}k tCO₂e`
  if (tonnes >= 1) return `${tonnes.toFixed(1)} tCO₂e`
  return `${(tonnes * 1000).toFixed(0)} kgCO₂e`
}

export const formatINR = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`
  return `₹${amount.toFixed(0)}`
}

export const SEVERITY_COLORS: Record<string, string> = {
  High: '#E5484D',
  Medium: '#F2A93C',
  Low: '#2BB673',
}

export const CHART_COLORS = ['#00B8A9', '#F2A93C', '#E5484D', '#2BB673', '#6366F1', '#EC4899']
