import { supabase } from './supabase'
import type { Database } from '../types/database.types'
import type {
  IndustryProfile,
  ProcessData,
  EmissionResults,
  Recommendation
} from '../types'

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type IndustryProfileRow = Database['public']['Tables']['industry_profiles']['Row']
export type ProcessDataRow = Database['public']['Tables']['process_data']['Row']
export type EmissionAssessmentRow = Database['public']['Tables']['emission_assessments']['Row']
export type RecommendationRow = Database['public']['Tables']['recommendations']['Row']
export type EmissionFactorRow = Database['public']['Tables']['emission_factors']['Row']

/**
 * User Profiles
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
  return data
}

export async function updateProfile(userId: string, updates: Partial<ProfileRow>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }
  return data
}

/**
 * Industry Profiles
 */
export async function saveIndustryProfile(profile: IndustryProfile, userId: string) {
  const payload = {
    user_id: userId,
    company_name: profile.company_name,
    industry_type: profile.industry_type,
    size: profile.size,
    location: profile.location,
    production_type: profile.production_type,
    production_capacity: profile.production_capacity,
    production_unit: profile.production_unit,
    employees: profile.employees,
    operating_hours_day: profile.operating_hours_day,
    operating_days_month: profile.operating_days_month,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('industry_profiles')
    .upsert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error saving industry profile:', error)
    throw error
  }
  return data
}

export async function getLatestIndustryProfile(userId: string): Promise<IndustryProfile | null> {
  const { data, error } = await supabase
    .from('industry_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching industry profile:', error)
    throw error
  }

  if (!data) return null

  return {
    company_name: data.company_name,
    industry_type: data.industry_type,
    size: data.size || 'Medium',
    location: data.location,
    production_type: data.production_type || '',
    production_capacity: Number(data.production_capacity),
    production_unit: data.production_unit,
    employees: data.employees,
    operating_hours_day: Number(data.operating_hours_day),
    operating_days_month: Number(data.operating_days_month),
  }
}

/**
 * Process Data
 */
export async function saveProcessData(data: ProcessData, userId: string) {
  const payload = {
    user_id: userId,
    industry: data.industry || 'Manufacturing',
    energy: data.energy as any,
    materials: data.materials as any,
    production: data.production as any,
    waste: data.waste as any,
    updated_at: new Date().toISOString(),
  }

  const { data: saved, error } = await supabase
    .from('process_data')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error saving process data:', error)
    throw error
  }
  return saved
}

export async function getLatestProcessData(userId: string): Promise<ProcessData | null> {
  const { data, error } = await supabase
    .from('process_data')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching process data:', error)
    throw error
  }

  if (!data) return null

  return {
    energy: (data.energy as any) || [],
    materials: (data.materials as any) || [],
    production: (data.production as any) || [],
    waste: (data.waste as any) || [],
    industry: data.industry || undefined,
  }
}

/**
 * Emission Assessments
 */
export async function saveEmissionAssessment(
  assessment: EmissionResults,
  userId: string,
  processDataId?: string
) {
  const payload = {
    user_id: userId,
    process_data_id: processDataId || null,
    total_co2e_tonnes: assessment.total_co2e_tonnes,
    co2e_per_unit: assessment.co2e_per_unit,
    sources: assessment.sources as any,
    detailed_sources: (assessment.detailed_sources as any) || [],
    data_label: assessment.data_label || null,
  }

  const { data, error } = await supabase
    .from('emission_assessments')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error saving emission assessment:', error)
    throw error
  }
  return data
}

export async function getLatestEmissionAssessment(userId: string): Promise<EmissionResults | null> {
  const { data, error } = await supabase
    .from('emission_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching emission assessment:', error)
    throw error
  }

  if (!data) return null

  return {
    total_co2e_tonnes: Number(data.total_co2e_tonnes),
    co2e_per_unit: Number(data.co2e_per_unit),
    sources: (data.sources as any) || [],
    detailed_sources: (data.detailed_sources as any) || [],
    data_label: data.data_label || undefined,
  }
}

/**
 * Recommendations
 */
export async function saveRecommendations(
  recs: Recommendation[],
  userId: string,
  assessmentId?: string
) {
  if (!recs.length) return []

  try {
    // Clean up previous unadopted suggested recommendations to keep recommendations fresh and deduplicated
    await supabase
      .from('recommendations')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'suggested')
  } catch (cleanErr) {
    console.warn('Could not clean prior recommendations:', cleanErr)
  }

  const rows = recs.map(r => ({
    user_id: userId,
    assessment_id: assessmentId || null,
    rec_id: r.id,
    name: r.name,
    description: r.description,
    category: r.category,
    icon: r.icon,
    score: r.score,
    why: r.why,
    estimated_co2_reduction_tonnes: r.estimated_co2_reduction_tonnes,
    estimated_co2_reduction_pct: r.estimated_co2_reduction_pct,
    cost_range_min_inr: r.cost_range_min_inr,
    cost_range_max_inr: r.cost_range_max_inr,
    annual_saving_inr: r.annual_saving_inr,
    payback_years: r.payback_years,
    feasibility_score: r.feasibility_score,
    circularity_score: r.circularity_score,
    status: r.status || 'suggested',
    target_material: r.target_material || '',
    target_waste_stream: r.target_waste_stream || '',
    waste_reduction_tonnes: r.waste_reduction_tonnes || 0,
    annual_material_recovered_tonnes: r.annual_material_recovered_tonnes || 0,
    action_steps: (r.action_steps as any) || [],
  }))

  const { data, error } = await supabase
    .from('recommendations')
    .insert(rows)
    .select()

  if (error) {
    console.error('Error saving recommendations:', error)
    throw error
  }
  return data
}

export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('score', { ascending: false })

  if (error) {
    console.error('Error fetching recommendations:', error)
    throw error
  }

  return (data || []).map((r: any) => ({
    id: r.rec_id || r.id,
    name: r.name,
    description: r.description || '',
    category: r.category,
    icon: r.icon || 'Lightbulb',
    score: Number(r.score),
    why: r.why || '',
    estimated_co2_reduction_tonnes: Number(r.estimated_co2_reduction_tonnes),
    estimated_co2_reduction_pct: Number(r.estimated_co2_reduction_pct),
    cost_range_min_inr: Number(r.cost_range_min_inr),
    cost_range_max_inr: Number(r.cost_range_max_inr),
    annual_saving_inr: Number(r.annual_saving_inr),
    payback_years: Number(r.payback_years),
    feasibility_score: Number(r.feasibility_score),
    circularity_score: Number(r.circularity_score),
    status: r.status || 'suggested',
    target_material: r.target_material || '',
    target_waste_stream: r.target_waste_stream || '',
    waste_reduction_tonnes: Number(r.waste_reduction_tonnes || 0),
    annual_material_recovered_tonnes: Number(r.annual_material_recovered_tonnes || 0),
    action_steps: Array.isArray(r.action_steps) ? r.action_steps : [],
  }))
}

export async function updateRecommendationStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('recommendations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating recommendation status:', error)
    throw error
  }
  return data
}

/**
 * Emission Factors
 */
export async function getEmissionFactors() {
  const { data, error } = await supabase
    .from('emission_factors')
    .select('*')
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching emission factors:', error)
    throw error
  }
  return data
}
