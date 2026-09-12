import type {
  ProcessData,
  EmissionResults,
  EmissionSource,
  Recommendation,
  EnergyEntry,
  MaterialEntry,
  ProductionEntry,
  WasteEntry,
} from '../types'

// Standard emission factors (kg CO2e per unit)
// Sources: India CEA CO2 Baseline Database v19, IPCC 2006, CPCB, World Steel, World Aluminium
export const ENERGY_FACTORS: Record<string, number> = {
  Electricity: 0.82, // kgCO2e/kWh (Indian National Grid Average)
  Coal: 2.42,        // kgCO2e/kg
  'Natural Gas': 2.03, // kgCO2e/m3 or ~0.055 kgCO2e/MJ
  Diesel: 2.68,      // kgCO2e/litre
  'Fuel Oil': 3.15,  // kgCO2e/litre
  LPG: 2.98,         // kgCO2e/kg
  Renewable: 0.02,   // kgCO2e/kWh (lifecycle embodied)
}

export const MATERIAL_FACTORS: Record<string, number> = {
  Aluminium: 8.24,
  Steel: 1.85,
  Copper: 3.81,
  'Plastic (PET)': 2.15,
  'Plastic (HDPE)': 1.90,
  'Plastic (PP)': 1.95,
  Glass: 0.85,
  Paper: 0.95,
  Cardboard: 0.90,
  'Textile (Cotton)': 5.80,
  'Textile (Polyester)': 7.20,
  Rubber: 2.80,
  Wood: 0.45,
  'Chemicals (generic)': 3.20,
  Other: 2.00,
}

// Multiplier for recycled content
export const RECYCLED_DISCOUNT: Record<string, number> = {
  virgin: 1.0,
  'partially-recycled': 0.60, // 40% reduction
  'fully-recycled': 0.20,     // 80% reduction
}

export const WASTE_FACTORS: Record<string, number> = {
  Landfill: 1.25,
  Incineration: 0.95,
  Recycling: 0.15,
  Reuse: 0.05,
  Composting: 0.10,
  'Waste-to-Energy': 0.40,
  'Internal Recovery': 0.05,
  Other: 0.80,
}

export function calculateEnergyEmissions(entries: EnergyEntry[]): { totalKg: number; breakdown: any[] } {
  let totalKg = 0
  const breakdown = entries.map((entry) => {
    const factor = ENERGY_FACTORS[entry.source] || 0.82
    const rawQty = entry.monthly_consumption ?? entry.quantity
    const qty = Math.max(0, Number(rawQty) || 0)
    let adjustedQty = qty
    if (entry.unit === 'MWh') adjustedQty = qty * 1000
    if (entry.unit === 'GJ') adjustedQty = qty * 277.778
    if (entry.unit === 'tonne') adjustedQty = qty * 1000 // Handle solid fuels like coal

    const kgCO2e = adjustedQty * factor
    totalKg += kgCO2e
    return {
      source: entry.source,
      quantity: qty,
      unit: entry.unit,
      kgCO2e,
      tonnesCO2e: kgCO2e / 1000,
    }
  })
  return { totalKg, breakdown }
}

export function calculateMaterialEmissions(entries: MaterialEntry[]): { totalKg: number; breakdown: any[] } {
  let totalKg = 0
  const breakdown = entries.map((entry) => {
    const baseFactor = MATERIAL_FACTORS[entry.name] || 2.0
    const discount = RECYCLED_DISCOUNT[entry.recycled_content] || 1.0
    const factor = baseFactor * discount

    const qty = Math.max(0, Number(entry.quantity) || 0)
    let qtyKg = qty
    if (entry.unit === 'tonne') qtyKg = qty * 1000

    const kgCO2e = qtyKg * factor
    totalKg += kgCO2e
    return {
      name: entry.name,
      quantity: qty,
      unit: entry.unit,
      recycled_content: entry.recycled_content,
      kgCO2e,
      tonnesCO2e: kgCO2e / 1000,
    }
  })
  return { totalKg, breakdown }
}

export function calculateWasteEmissions(entries: WasteEntry[]): { totalKg: number; breakdown: any[] } {
  let totalKg = 0
  const breakdown = entries.map((entry) => {
    const factor = WASTE_FACTORS[entry.disposal_method] || 0.8
    const qty = Math.max(0, Number(entry.quantity) || 0)
    let qtyKg = qty
    if (entry.unit === 'tonne') qtyKg = qty * 1000

    // Clamp recoverable percentage strictly between 0 and 100
    const recPct = Math.min(100, Math.max(0, Number(entry.recoverable_pct) || 0))

    // Mass-balance accounting:
    // If disposal method is already recovery/recycling, apply that factor directly.
    // For standard disposal methods (Landfill, Incineration), unrecovered fraction incurs disposal factor,
    // while recovered fraction incurs the recycling/recovery processing factor (0.15 kg/kg).
    let kgCO2e: number
    const directRecoveryMethods = ['Recycling', 'Internal Recovery', 'Reuse', 'Composting']
    if (directRecoveryMethods.includes(entry.disposal_method)) {
      kgCO2e = qtyKg * factor
    } else {
      const unrecoveredKg = qtyKg * (1 - recPct / 100)
      const recoveredKg = qtyKg * (recPct / 100)
      kgCO2e = (unrecoveredKg * factor) + (recoveredKg * 0.15)
    }

    totalKg += kgCO2e
    return {
      waste_type: entry.waste_type,
      quantity: qty,
      unit: entry.unit,
      disposal_method: entry.disposal_method,
      recoverable_pct: recPct,
      kgCO2e,
      tonnesCO2e: kgCO2e / 1000,
    }
  })
  return { totalKg, breakdown }
}

export function computeEmissions(data: ProcessData): EmissionResults {
  const energyRes = calculateEnergyEmissions(data.energy || [])
  const matRes = calculateMaterialEmissions(data.materials || [])
  const wasteRes = calculateWasteEmissions(data.waste || [])

  const totalKg = energyRes.totalKg + matRes.totalKg + wasteRes.totalKg
  const totalTonnes = totalKg / 1000

  // Per unit intensity - safely guard against division by zero and phantom denominators
  const prod = data.production?.[0]
  const prodQty = prod ? Number(prod.quantity) || 0 : 0
  const hasValidProd = prodQty > 0
  const co2ePerUnit = hasValidProd ? totalKg / prodQty / 1000 : 0

  const sources: EmissionSource[] = []

  const addSource = (category: string, kg: number) => {
    const tonnes = kg / 1000
    const pct = totalKg > 0 ? (kg / totalKg) * 100 : 0
    let severity: 'High' | 'Medium' | 'Low' = 'Low'
    if (pct >= 40) severity = 'High'
    else if (pct >= 20) severity = 'Medium'

    sources.push({
      category,
      co2e_tonnes: Number(tonnes.toFixed(2)),
      percentage: Number(pct.toFixed(1)),
      severity,
      projected_co2e_tonnes: Number((tonnes * 0.7).toFixed(2)),
      reduction_tonnes: Number((tonnes * 0.3).toFixed(2)),
    })
  }

  addSource('Materials', matRes.totalKg)
  addSource('Energy', energyRes.totalKg)
  addSource('Waste', wasteRes.totalKg)

  // Sort by emissions descending
  sources.sort((a, b) => b.co2e_tonnes - a.co2e_tonnes)

  return {
    total_co2e_tonnes: Number(totalTonnes.toFixed(2)),
    co2e_per_unit: Number(co2ePerUnit.toFixed(5)),
    sources,
    detailed_sources: [
      { category: 'Energy', details: energyRes.breakdown },
      { category: 'Materials', details: matRes.breakdown },
      { category: 'Waste', details: wasteRes.breakdown },
    ],
    data_label: 'Calculated via EcoThread Certified Industry Benchmarks',
  }
}

/**
 * Generate intelligent recommendations based on process data & top emission sources
 */
export function buildRecommendations(params: {
  emission_results: EmissionResults
  industry?: string
  materials?: string[]
  waste_disposal_methods?: string[]
  rejected_pct?: number
}): Recommendation[] {
  const { emission_results } = params
  const topSource = emission_results.sources[0]?.category || 'Energy'

  // Extract category baseline emissions to properly scope reductions
  const energyTonnes = emission_results.sources.find(s => s.category === 'Energy')?.co2e_tonnes || 0
  const matTonnes = emission_results.sources.find(s => s.category === 'Materials')?.co2e_tonnes || 0
  const wasteTonnes = emission_results.sources.find(s => s.category === 'Waste')?.co2e_tonnes || 0
  const totalTonnes = Math.max(0.01, emission_results.total_co2e_tonnes || (energyTonnes + matTonnes + wasteTonnes) || 0.01)

  // 1. Solar PV: Targets electricity/energy (up to 35% of energy emissions)
  const solarRedTonnes = Number(Math.min(energyTonnes * 0.35, energyTonnes).toFixed(2))
  const solarPct = Number(((solarRedTonnes / totalTonnes) * 100).toFixed(1))
  // Electricity tariff net saving ~₹5.0/kWh after solar LCOE; 0.82 kg/kWh -> 1220 kWh per tonne CO2e
  const solarSavings = Math.round(solarRedTonnes * 1220 * 5.0 * 12)

  // 2. Secondary Scrap Feedstock: Targets raw materials (up to 25% of material emissions)
  const matRedTonnes = Number(Math.min(matTonnes * 0.25, matTonnes).toFixed(2))
  const matPct = Number(((matRedTonnes / totalTonnes) * 100).toFixed(1))
  // Scrap material cost delta ~₹15,000/tonne of material displaced; approx ~₹18/kg CO2e
  const matSavings = Math.round(matRedTonnes * 1000 * 18)

  // 3. Closed-Loop Scrap Remelting: Targets waste and scrap material
  const scrapRedTonnes = Number(Math.min(wasteTonnes * 0.60 + matTonnes * 0.08, matTonnes + wasteTonnes).toFixed(2))
  const scrapPct = Number(((scrapRedTonnes / totalTonnes) * 100).toFixed(1))
  // Avoided tipping fee + raw material recovery value
  const scrapSavings = Math.round(scrapRedTonnes * 1000 * 14)

  // 4. Motor VFDs: Targets motor electricity load (~12% of energy emissions)
  const vfdRedTonnes = Number(Math.min(energyTonnes * 0.12, energyTonnes).toFixed(2))
  const vfdPct = Number(((vfdRedTonnes / totalTonnes) * 100).toFixed(1))
  // Avoided peak demand & kWh charges at full commercial tariff ~₹8.5/kWh
  const vfdSavings = Math.round(vfdRedTonnes * 1220 * 8.5 * 12)

  // 5. Waste Heat Recovery: Targets thermal fuel/process heat (~10% of energy emissions)
  const heatRedTonnes = Number(Math.min(energyTonnes * 0.10, energyTonnes).toFixed(2))
  const heatPct = Number(((heatRedTonnes / totalTonnes) * 100).toFixed(1))
  // Offset fuel oil/diesel ~₹25/kg equivalent
  const heatSavings = Math.round(heatRedTonnes * 1000 * 25)

  const recs: Recommendation[] = [
    {
      id: 'rec-renew-01',
      name: 'Rooftop Solar PV & Green Power Open Access',
      description: 'Install on-site rooftop solar or subscribe to green power tariffs to replace grid electricity with zero-emission renewable energy.',
      category: 'Energy',
      icon: 'Zap',
      score: 94,
      why: 'Grid electricity in India emits ~0.82 kg CO2e/kWh. Offsetting grid load with solar delivers rapid financial and carbon return.',
      estimated_co2_reduction_tonnes: solarRedTonnes,
      estimated_co2_reduction_pct: solarPct,
      cost_range_min_inr: Math.round(Math.max(150000, solarSavings * 1.5)),
      cost_range_max_inr: Math.round(Math.max(350000, solarSavings * 3.5)),
      annual_saving_inr: solarSavings,
      payback_years: solarSavings > 0 ? 2.2 : 0,
      feasibility_score: 92,
      circularity_score: 75,
    },
    {
      id: 'rec-mat-02',
      name: 'Secondary & Recycled Scrap Feedstock Blending',
      description: 'Substitute virgin metal/plastic inputs with 30-50% certified recycled scrap, drastically cutting embodied lifecycle emissions.',
      category: 'Materials',
      icon: 'Recycle',
      score: 89,
      why: 'Recycled feedstock requires up to 80% less processing energy than virgin extraction while maintaining strict tensile specifications.',
      estimated_co2_reduction_tonnes: matRedTonnes,
      estimated_co2_reduction_pct: matPct,
      cost_range_min_inr: Math.round(Math.max(80000, matSavings * 0.5)),
      cost_range_max_inr: Math.round(Math.max(200000, matSavings * 1.2)),
      annual_saving_inr: matSavings,
      payback_years: matSavings > 0 ? 0.9 : 0,
      feasibility_score: 86,
      circularity_score: 95,
    },
    {
      id: 'rec-waste-03',
      name: 'Closed-Loop Scrap Segregation & Re-melting',
      description: 'Implement segregated bin systems at machining and punching stations to return 100% clean production scrap back into furnace melts.',
      category: 'Waste',
      icon: 'RefreshCw',
      score: 85,
      why: 'Eliminates landfill tipping fees, prevents scrap downgrading, and reclaims raw materials at internal manufacturing cost.',
      estimated_co2_reduction_tonnes: scrapRedTonnes,
      estimated_co2_reduction_pct: scrapPct,
      cost_range_min_inr: Math.round(Math.max(50000, scrapSavings * 0.4)),
      cost_range_max_inr: Math.round(Math.max(120000, scrapSavings * 0.9)),
      annual_saving_inr: scrapSavings,
      payback_years: scrapSavings > 0 ? 0.7 : 0,
      feasibility_score: 88,
      circularity_score: 98,
    },
    {
      id: 'rec-eff-04',
      name: 'Variable Frequency Drives (VFD) on Motor Drives',
      description: 'Retrofit heavy conveyor, pump, and compressor induction motors with IoT-enabled VFDs to match speed to real-time process load.',
      category: 'Energy',
      icon: 'Cpu',
      score: 81,
      why: 'Induction motors running at fixed throttle waste up to 25% of energy during idle cycles.',
      estimated_co2_reduction_tonnes: vfdRedTonnes,
      estimated_co2_reduction_pct: vfdPct,
      cost_range_min_inr: Math.round(Math.max(60000, vfdSavings * 0.8)),
      cost_range_max_inr: Math.round(Math.max(150000, vfdSavings * 1.8)),
      annual_saving_inr: vfdSavings,
      payback_years: vfdSavings > 0 ? 1.4 : 0,
      feasibility_score: 94,
      circularity_score: 70,
    },
    {
      id: 'rec-heat-05',
      name: 'Waste Heat Recovery from Exhaust Flues',
      description: 'Install heat exchangers on furnace or boiler exhausts to preheat combustion air or boiler feed water.',
      category: 'Energy',
      icon: 'Flame',
      score: 78,
      why: 'Recapturing flue heat reduces fuel oil and diesel combustion demand by 10-15%.',
      estimated_co2_reduction_tonnes: heatRedTonnes,
      estimated_co2_reduction_pct: heatPct,
      cost_range_min_inr: Math.round(Math.max(100000, heatSavings * 1.2)),
      cost_range_max_inr: Math.round(Math.max(250000, heatSavings * 2.8)),
      annual_saving_inr: heatSavings,
      payback_years: heatSavings > 0 ? 2.5 : 0,
      feasibility_score: 75,
      circularity_score: 82,
    },
  ]

  // If top source is Materials, boost Materials recommendations to the top
  if (topSource === 'Materials') {
    recs.sort((a, b) => (b.category === 'Materials' ? 1 : 0) - (a.category === 'Materials' ? 1 : 0))
  } else if (topSource === 'Waste') {
    recs.sort((a, b) => (b.category === 'Waste' ? 1 : 0) - (a.category === 'Waste' ? 1 : 0))
  }

  return recs
}
