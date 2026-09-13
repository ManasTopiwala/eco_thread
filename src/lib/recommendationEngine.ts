import type {
  ProcessData,
  EmissionResults,
  Recommendation,
  FacilityWasteDiagnosis,
  IndustryProfile,
} from '../types'
import { MATERIAL_FACTORS, ENERGY_FACTORS } from './calculator'

// Realistic Indian market prices per kg (INR) for virgin vs secondary/recycled materials
const MATERIAL_ECONOMICS: Record<string, { virginPricePerKg: number; recycledPricePerKg: number; scrapSalePricePerKg: number }> = {
  Aluminium: { virginPricePerKg: 220, recycledPricePerKg: 155, scrapSalePricePerKg: 130 },
  Steel: { virginPricePerKg: 65, recycledPricePerKg: 48, scrapSalePricePerKg: 35 },
  Copper: { virginPricePerKg: 780, recycledPricePerKg: 610, scrapSalePricePerKg: 520 },
  'Plastic (PET)': { virginPricePerKg: 98, recycledPricePerKg: 64, scrapSalePricePerKg: 32 },
  'Plastic (HDPE)': { virginPricePerKg: 112, recycledPricePerKg: 74, scrapSalePricePerKg: 42 },
  'Plastic (PP)': { virginPricePerKg: 108, recycledPricePerKg: 72, scrapSalePricePerKg: 38 },
  Glass: { virginPricePerKg: 28, recycledPricePerKg: 16, scrapSalePricePerKg: 8 },
  Paper: { virginPricePerKg: 52, recycledPricePerKg: 34, scrapSalePricePerKg: 18 },
  Cardboard: { virginPricePerKg: 42, recycledPricePerKg: 26, scrapSalePricePerKg: 15 },
  'Textile (Cotton)': { virginPricePerKg: 190, recycledPricePerKg: 125, scrapSalePricePerKg: 45 },
  'Textile (Polyester)': { virginPricePerKg: 135, recycledPricePerKg: 88, scrapSalePricePerKg: 35 },
  Rubber: { virginPricePerKg: 160, recycledPricePerKg: 105, scrapSalePricePerKg: 40 },
  Wood: { virginPricePerKg: 35, recycledPricePerKg: 18, scrapSalePricePerKg: 8 },
  'Chemicals (generic)': { virginPricePerKg: 180, recycledPricePerKg: 130, scrapSalePricePerKg: 25 },
  Other: { virginPricePerKg: 80, recycledPricePerKg: 50, scrapSalePricePerKg: 25 },
}

const LANDFILL_TIPPING_FEE_PER_KG = 2.5 // Average ~₹2,500/tonne in industrial estates

export function computeFacilityWasteDiagnosis(
  processData?: ProcessData | null,
  industryProfile?: IndustryProfile | null
): FacilityWasteDiagnosis {
  const materials = processData?.materials || []
  const wasteList = processData?.waste || []
  const production = processData?.production || []

  let totalRawMaterialKg = 0
  let virginMaterialKg = 0
  let topMaterial = 'Raw Materials'
  let maxMaterialKg = 0

  materials.forEach((m) => {
    const rawQty = Math.max(0, Number(m.quantity) || 0)
    const qtyKg = m.unit === 'tonne' ? rawQty * 1000 : rawQty
    totalRawMaterialKg += qtyKg

    if (m.recycled_content === 'virgin') {
      virginMaterialKg += qtyKg
    } else if (m.recycled_content === 'partially-recycled') {
      virginMaterialKg += qtyKg * 0.5
    }

    if (qtyKg > maxMaterialKg) {
      maxMaterialKg = qtyKg
      topMaterial = m.name || 'Raw Material'
    }
  })

  let totalWasteKg = 0
  let landfillWasteKg = 0
  let topWaste = 'Industrial Scrap'
  let maxWasteKg = 0
  let recoverableScrapKg = 0

  wasteList.forEach((w) => {
    const rawQty = Math.max(0, Number(w.quantity) || 0)
    const qtyKg = w.unit === 'tonne' ? rawQty * 1000 : rawQty
    totalWasteKg += qtyKg

    const recPct = Math.min(100, Math.max(0, Number(w.recoverable_pct) || 0))
    recoverableScrapKg += qtyKg * (recPct / 100)

    if (['Landfill', 'Incineration', 'Other'].includes(w.disposal_method)) {
      landfillWasteKg += qtyKg
    }

    if (qtyKg > maxWasteKg) {
      maxWasteKg = qtyKg
      topWaste = w.waste_type || 'Production Waste'
    }
  })

  // Production defect rate
  const prodEntry = production[0]
  const prodQty = Math.max(0, Number(prodEntry?.quantity) || 0)
  const rejectedUnits = Math.max(0, Number(prodEntry?.rejected_units) || 0)
  const defectRatePct = prodQty > 0 ? Number(((rejectedUnits / prodQty) * 100).toFixed(2)) : 0

  // Scrap value estimation
  const eco = MATERIAL_ECONOMICS[topMaterial] || MATERIAL_ECONOMICS.Other
  const uncapturedScrapValue = Math.round(
    (landfillWasteKg * 12 * LANDFILL_TIPPING_FEE_PER_KG) +
    (recoverableScrapKg * 12 * eco.scrapSalePricePerKg)
  )

  const materialWasteRatio = totalRawMaterialKg > 0
    ? Number(((totalWasteKg / totalRawMaterialKg) * 100).toFixed(1))
    : 0

  const landfillDiversionPotential = totalWasteKg > 0
    ? Number(((landfillWasteKg / totalWasteKg) * 100).toFixed(1))
    : 0

  const virginMaterialPct = totalRawMaterialKg > 0
    ? Number(((virginMaterialKg / totalRawMaterialKg) * 100).toFixed(1))
    : 100

  return {
    total_raw_material_kg: Math.round(totalRawMaterialKg),
    total_raw_material_tonnes: Number((totalRawMaterialKg / 1000).toFixed(2)),
    virgin_material_pct: virginMaterialPct,
    total_waste_kg: Math.round(totalWasteKg),
    total_waste_tonnes: Number((totalWasteKg / 1000).toFixed(2)),
    landfill_waste_kg: Math.round(landfillWasteKg),
    landfill_diversion_potential_pct: landfillDiversionPotential,
    material_waste_ratio_pct: materialWasteRatio,
    uncaptured_scrap_value_inr: uncapturedScrapValue,
    primary_material: topMaterial,
    primary_waste_stream: topWaste,
    defect_rate_pct: defectRatePct,
  }
}

export function generateDedicatedRecommendations(params: {
  process_data?: ProcessData | null
  industry_profile?: IndustryProfile | null
  emission_results?: EmissionResults | null
  industry?: string
}): { recommendations: Recommendation[]; diagnosis: FacilityWasteDiagnosis } {
  const { process_data, industry_profile, emission_results } = params
  const diagnosis = computeFacilityWasteDiagnosis(process_data, industry_profile)

  const materials = process_data?.materials || []
  const wasteList = process_data?.waste || []
  const production = process_data?.production || []
  const energy = process_data?.energy || []

  const totalEmissionsTonnes = Math.max(0.1, emission_results?.total_co2e_tonnes || 10)
  const recommendations: Recommendation[] = []

  // --------------------------------------------------------------------------
  // 1. DEDICATED MATERIAL-BY-MATERIAL SUBSTITUTION INTERVENTIONS
  // --------------------------------------------------------------------------
  materials.forEach((mat, idx) => {
    const rawQty = Math.max(0, Number(mat.quantity) || 0)
    const qtyKg = mat.unit === 'tonne' ? rawQty * 1000 : rawQty
    if (qtyKg <= 0) return

    const matName = mat.name || 'Raw Material'
    const eco = MATERIAL_ECONOMICS[matName] || MATERIAL_ECONOMICS.Other
    const virginFactor = MATERIAL_FACTORS[matName] || 2.0
    const recycledFactor = virginFactor * 0.25 // 75% carbon reduction on recycled feedstocks

    // If using virgin or partially-recycled, recommend substitution
    if (mat.recycled_content === 'virgin' || mat.recycled_content === 'partially-recycled') {
      const substitutionRatio = mat.recycled_content === 'virgin' ? 0.45 : 0.30 // 45% blend for virgin, 30% further blend for partial
      const monthlyReplacedKg = qtyKg * substitutionRatio
      const annualReplacedTonnes = Number(((monthlyReplacedKg * 12) / 1000).toFixed(2))

      const co2ReductionPerKg = virginFactor - recycledFactor
      const annualCo2ReductionTonnes = Number(((monthlyReplacedKg * 12 * co2ReductionPerKg) / 1000).toFixed(2))
      const co2ReductionPct = Number(Math.min(35, (annualCo2ReductionTonnes / totalEmissionsTonnes) * 100).toFixed(1))

      const costSavingPerKg = Math.max(10, eco.virginPricePerKg - eco.recycledPricePerKg)
      const annualSavingINR = Math.round(monthlyReplacedKg * 12 * costSavingPerKg)
      const setupInvestmentMin = Math.round(Math.max(60000, annualSavingINR * 0.35))
      const setupInvestmentMax = Math.round(Math.max(140000, annualSavingINR * 0.85))
      const paybackYears = annualSavingINR > 0 ? Number((setupInvestmentMin / annualSavingINR).toFixed(1)) : 0.8

      recommendations.push({
        id: `rec-mat-${idx + 1}-${matName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: `Virgin ${matName} Circular Substitution with Certified Post-Industrial Feedstock`,
        description: `Transition ${Math.round(substitutionRatio * 100)}% of your virgin ${matName} consumption (${monthlyReplacedKg.toLocaleString()} kg/month) to certified high-purity recycled ${matName} granules/billets.`,
        category: 'Materials',
        icon: 'Package',
        score: Math.min(97, Math.round(86 + (co2ReductionPct * 0.8))),
        why: `Virgin ${matName} carries an embodied carbon footprint of ${virginFactor} kg CO2e/kg. Replacing ${monthlyReplacedKg.toLocaleString()} kg/month with secondary material cuts upstream extraction emissions while shaving ₹${costSavingPerKg}/kg off raw material procurement.`,
        estimated_co2_reduction_tonnes: annualCo2ReductionTonnes,
        estimated_co2_reduction_pct: co2ReductionPct,
        cost_range_min_inr: setupInvestmentMin,
        cost_range_max_inr: setupInvestmentMax,
        annual_saving_inr: annualSavingINR,
        payback_years: Math.max(0.3, paybackYears),
        feasibility_score: 91,
        circularity_score: 96,
        status: 'suggested',
        target_material: matName,
        target_waste_stream: 'Virgin Feedstock Displacement',
        waste_reduction_tonnes: 0,
        annual_material_recovered_tonnes: annualReplacedTonnes,
        action_steps: [
          `Audit and pre-qualify local compounders for ISO 14021 certified secondary ${matName} with documented technical datasheets (TDS).`,
          `Run 3 pilot production batches at 20%, 35%, and ${Math.round(substitutionRatio * 100)}% blend ratios, testing tensile strength, melt flow, and cycle times.`,
          `Lock in annual bilateral contracts with recycled feedstock aggregators to stabilize material costs and receive green procurement certificates.`,
        ],
      })
    }
  })

  // --------------------------------------------------------------------------
  // 2. DEDICATED WASTE STREAM VALORIZATION & IN-HOUSE RECOVERY
  // --------------------------------------------------------------------------
  wasteList.forEach((w, idx) => {
    const rawQty = Math.max(0, Number(w.quantity) || 0)
    const qtyKg = w.unit === 'tonne' ? rawQty * 1000 : rawQty
    if (qtyKg <= 0) return

    const wasteName = w.waste_type?.trim() || `Production Waste Stream #${idx + 1}`
    const recPct = Math.min(100, Math.max(0, Number(w.recoverable_pct) || 0))
    const isLandfill = ['Landfill', 'Incineration', 'Other'].includes(w.disposal_method)
    const eco = MATERIAL_ECONOMICS[diagnosis.primary_material] || MATERIAL_ECONOMICS.Other

    // In-House Closed-Loop Recovery (if recoverable > 20%)
    if (recPct >= 20) {
      const recoverableKgMonth = qtyKg * (recPct / 100)
      const recoverableAnnualTonnes = Number(((recoverableKgMonth * 12) / 1000).toFixed(2))

      // Direct displacement of virgin input
      const annualVirginDisplacedCo2Tonnes = Number(((recoverableKgMonth * 12 * 1.6) / 1000).toFixed(2))
      const co2ReductionPct = Number(Math.min(30, (annualVirginDisplacedCo2Tonnes / totalEmissionsTonnes) * 100).toFixed(1))

      const annualDisplacementSavings = Math.round(recoverableKgMonth * 12 * (eco.virginPricePerKg * 0.75))
      const granulatorMinINR = Math.round(Math.max(90000, annualDisplacementSavings * 0.4))
      const granulatorMaxINR = Math.round(Math.max(220000, annualDisplacementSavings * 0.95))
      const paybackYears = annualDisplacementSavings > 0 ? Number((granulatorMinINR / annualDisplacementSavings).toFixed(1)) : 0.6

      recommendations.push({
        id: `rec-waste-loop-${idx + 1}`,
        name: `In-House Closed-Loop Granulation & Re-feeding for ${wasteName}`,
        description: `Install an edge-of-line granulator/re-melter to recover ${recPct}% of ${wasteName} (${Math.round(recoverableKgMonth).toLocaleString()} kg/month) directly back into your production feed throat.`,
        category: 'Waste',
        icon: 'RefreshCw',
        score: Math.min(98, Math.round(90 + (recPct * 0.08))),
        why: `You currently generate ${qtyKg.toLocaleString()} kg/month of ${wasteName} with ${recPct}% recovery potential. Recycling this scrap internally eliminates transport, avoids third-party margin, and directly displaces ₹${(eco.virginPricePerKg * 0.75).toFixed(0)}/kg in raw material purchases.`,
        estimated_co2_reduction_tonnes: annualVirginDisplacedCo2Tonnes,
        estimated_co2_reduction_pct: co2ReductionPct,
        cost_range_min_inr: granulatorMinINR,
        cost_range_max_inr: granulatorMaxINR,
        annual_saving_inr: annualDisplacementSavings,
        payback_years: Math.max(0.4, paybackYears),
        feasibility_score: 93,
        circularity_score: 98,
        status: 'suggested',
        target_material: diagnosis.primary_material,
        target_waste_stream: wasteName,
        waste_reduction_tonnes: recoverableAnnualTonnes,
        annual_material_recovered_tonnes: recoverableAnnualTonnes,
        action_steps: [
          `Procure a compact, soundproof edge-of-line granulator/shredder sized for ${Math.round(recoverableKgMonth / 25)} kg/day throughput.`,
          `Set up clean scrap collection protocols directly at workstations to prevent dirt/dust mixing.`,
          `Calibrate pneumatic proportional loaders to blend 15-25% virgin/regrind mix automatically with zero manual operator intervention.`,
        ],
      })
    }

    // Zero-Landfill Diversion (if sent to Landfill/Incineration)
    if (isLandfill) {
      const annualLandfillWasteTonnes = Number(((qtyKg * 12) / 1000).toFixed(2))
      const avoidedMethaneTonnes = Number(((qtyKg * 12 * 1.25) / 1000).toFixed(2))
      const co2ReductionPct = Number(Math.min(25, (avoidedMethaneTonnes / totalEmissionsTonnes) * 100).toFixed(1))

      // Savings: Avoided tipping fee + scrap sale to registered industrial recyclers
      const avoidedTippingFees = qtyKg * 12 * LANDFILL_TIPPING_FEE_PER_KG
      const scrapRevenue = qtyKg * 12 * (eco.scrapSalePricePerKg * 0.7)
      const totalDiversionBenefitINR = Math.round(avoidedTippingFees + scrapRevenue)

      recommendations.push({
        id: `rec-landfill-div-${idx + 1}`,
        name: `Zero-Landfill Off-Take & Circular Valorization for ${wasteName}`,
        description: `Divert ${annualLandfillWasteTonnes} tonnes/year of ${wasteName} from ${w.disposal_method} by establishing certified industrial symbiosis off-take partnerships.`,
        category: 'Waste',
        icon: 'Recycle',
        score: 88,
        why: `Disposing ${wasteName} to ${w.disposal_method} causes 1.25 kg CO2e per kg in landfill emissions and costs ₹${LANDFILL_TIPPING_FEE_PER_KG}/kg in handling. Diverting this to certified reclaimers turns an expense into net scrap revenue.`,
        estimated_co2_reduction_tonnes: avoidedMethaneTonnes,
        estimated_co2_reduction_pct: co2ReductionPct,
        cost_range_min_inr: 45000,
        cost_range_max_inr: 110000,
        annual_saving_inr: totalDiversionBenefitINR,
        payback_years: 0.5,
        feasibility_score: 95,
        circularity_score: 91,
        status: 'suggested',
        target_material: diagnosis.primary_material,
        target_waste_stream: wasteName,
        waste_reduction_tonnes: annualLandfillWasteTonnes,
        annual_material_recovered_tonnes: Number((annualLandfillWasteTonnes * 0.75).toFixed(2)),
        action_steps: [
          `Deploy standardized color-coded segregated bins with manifest tracking across the plant floor.`,
          `Sign a buyback off-take agreement with authorized state pollution control board (SPCB) registered recyclers.`,
          `Register facility waste manifests on the digital circularity portal to monetize Extended Producer Responsibility (EPR) credits.`,
        ],
      })
    }
  })

  // --------------------------------------------------------------------------
  // 3. DEFECT PREVENTION & FIRST-TIME-RIGHT YIELD OPTIMIZATION
  // --------------------------------------------------------------------------
  const prodEntry = production[0]
  const prodQty = Math.max(0, Number(prodEntry?.quantity) || 0)
  const rejectedUnits = Math.max(0, Number(prodEntry?.rejected_units) || 0)
  const rejectPct = prodQty > 0 ? (rejectedUnits / prodQty) * 100 : 0

  if (rejectPct > 0.8 || rejectedUnits > 0) {
    const targetReductionPct = Math.min(60, Math.max(30, rejectPct * 10))
    const avoidedDefectiveUnitsAnnual = Math.round((rejectedUnits * 12 * targetReductionPct) / 100)

    // Estimate material wasted per defective unit
    const materialPerUnitKg = prodQty > 0 && diagnosis.total_raw_material_kg > 0
      ? (diagnosis.total_raw_material_kg / prodQty)
      : 1.2
    const avoidedScrapKgAnnual = Math.round(avoidedDefectiveUnitsAnnual * materialPerUnitKg)
    const avoidedScrapTonnes = Number((avoidedScrapKgAnnual / 1000).toFixed(2))

    const eco = MATERIAL_ECONOMICS[diagnosis.primary_material] || MATERIAL_ECONOMICS.Other
    const annualMaterialSavedINR = Math.round(avoidedScrapKgAnnual * eco.virginPricePerKg)

    const avoidedCo2Tonnes = Number(((avoidedScrapKgAnnual * (MATERIAL_FACTORS[diagnosis.primary_material] || 2.0)) / 1000).toFixed(2))
    const co2ReductionPct = Number(Math.min(25, (avoidedCo2Tonnes / totalEmissionsTonnes) * 100).toFixed(1))

    const aoiSystemCostMin = Math.round(Math.max(120000, annualMaterialSavedINR * 0.5))
    const aoiSystemCostMax = Math.round(Math.max(280000, annualMaterialSavedINR * 1.1))
    const paybackYears = annualMaterialSavedINR > 0 ? Number((aoiSystemCostMin / annualMaterialSavedINR).toFixed(1)) : 1.1

    recommendations.push({
      id: 'rec-defect-prevention',
      name: `Automated In-Line Vision AI to Cut ${diagnosis.primary_material} Scrap Rejection by ${targetReductionPct}%`,
      description: `Reduce your current ${rejectPct.toFixed(1)}% rejection rate (${rejectedUnits.toLocaleString()} units/month) by retrofitting high-speed optical inspection cameras at critical forming stages.`,
      category: 'Materials',
      icon: 'Target',
      score: 93,
      why: `Every defective part discards embedded raw material and consumed machine energy. Preventing ${avoidedDefectiveUnitsAnnual.toLocaleString()} rejects/year retains ${avoidedScrapTonnes} tonnes of raw ${diagnosis.primary_material} inside production without downcycling.`,
      estimated_co2_reduction_tonnes: avoidedCo2Tonnes,
      estimated_co2_reduction_pct: co2ReductionPct,
      cost_range_min_inr: aoiSystemCostMin,
      cost_range_max_inr: aoiSystemCostMax,
      annual_saving_inr: annualMaterialSavedINR,
      payback_years: Math.max(0.5, paybackYears),
      feasibility_score: 87,
      circularity_score: 94,
      status: 'suggested',
      target_material: diagnosis.primary_material,
      target_waste_stream: 'Defective Process Scrap',
      waste_reduction_tonnes: avoidedScrapTonnes,
      annual_material_recovered_tonnes: avoidedScrapTonnes,
      action_steps: [
        `Conduct Pareto analysis of the top 3 defect root causes (tooling misalignment, temperature drift, operator handling).`,
        `Install machine-vision camera stations above primary forming/assembly lines to reject defective workpieces before subsequent value-add stages.`,
        `Connect sensor telemetry to an operator dashboard to trigger automated mold/tool recalibration when drift exceeds ±0.2mm.`,
      ],
    })
  }

  // --------------------------------------------------------------------------
  // 4. ENERGY & THERMAL PROCESS INTERVENTIONS
  // --------------------------------------------------------------------------
  let totalKwhAnnual = 0
  energy.forEach(e => {
    const rawQty = Math.max(0, Number(e.monthly_consumption || e.quantity) || 0)
    let kwh = rawQty
    if (e.unit === 'MWh') kwh = rawQty * 1000
    if (e.source === 'Electricity') totalKwhAnnual += kwh * 12
  })

  if (totalKwhAnnual > 0) {
    const solarDisplacedKwhAnnual = Math.round(totalKwhAnnual * 0.40)
    const solarCo2SavedTonnes = Number(((solarDisplacedKwhAnnual * (ENERGY_FACTORS.Electricity || 0.82)) / 1000).toFixed(2))
    const co2ReductionPct = Number(Math.min(45, (solarCo2SavedTonnes / totalEmissionsTonnes) * 100).toFixed(1))

    // Commercial power tariff ~₹8.0/kWh; Solar LCOE ~₹3.2/kWh -> Net ₹4.8/kWh saved
    const annualElectricitySavingsINR = Math.round(solarDisplacedKwhAnnual * 4.8)
    const solarCapexMin = Math.round(Math.max(250000, annualElectricitySavingsINR * 2.1))
    const solarCapexMax = Math.round(Math.max(500000, annualElectricitySavingsINR * 3.4))
    const solarPayback = annualElectricitySavingsINR > 0 ? Number((solarCapexMin / annualElectricitySavingsINR).toFixed(1)) : 2.4

    recommendations.push({
      id: 'rec-solar-pv',
      name: `Rooftop Solar PV & Green Power Open Access for ${industry_profile?.company_name || 'Plant'}`,
      description: `Offset 40% of grid electricity consumption (${Math.round(solarDisplacedKwhAnnual / 12).toLocaleString()} kWh/month) with captive rooftop solar PV or group captive open access wheeling.`,
      category: 'Energy',
      icon: 'Zap',
      score: 95,
      why: `Indian grid power emits ~0.82 kg CO2e/kWh. Deploying on-site solar delivers the single largest reduction in baseline Scope 2 electricity emissions while insulating the facility against commercial tariff hikes.`,
      estimated_co2_reduction_tonnes: solarCo2SavedTonnes,
      estimated_co2_reduction_pct: co2ReductionPct,
      cost_range_min_inr: solarCapexMin,
      cost_range_max_inr: solarCapexMax,
      annual_saving_inr: annualElectricitySavingsINR,
      payback_years: solarPayback,
      feasibility_score: 93,
      circularity_score: 80,
      status: 'suggested',
      target_material: 'Electricity Grid Supply',
      target_waste_stream: 'Thermal Emissions Loss',
      waste_reduction_tonnes: 0,
      annual_material_recovered_tonnes: 0,
      action_steps: [
        `Conduct shadow-free rooftop structural integrity and irradiance survey (minimum 800 sq.m required).`,
        `Apply for net-metering / open-access interconnection sanction with state distribution utility (DISCOM).`,
        `Execute turnkey EPC contract with tier-1 bifacial monocrystalline solar modules and smart string inverters.`,
      ],
    })

    // Variable Frequency Drives (VFD) on Motor & Compressor Loads
    const vfdKwhAnnual = Math.round(totalKwhAnnual * 0.12)
    const vfdCo2Tonnes = Number(((vfdKwhAnnual * 0.82) / 1000).toFixed(2))
    const vfdCo2Pct = Number(Math.min(15, (vfdCo2Tonnes / totalEmissionsTonnes) * 100).toFixed(1))
    const vfdSavingsINR = Math.round(vfdKwhAnnual * 7.5)

    recommendations.push({
      id: 'rec-motor-vfd',
      name: 'IoT Variable Speed Drives (VFD) on Continuous Heavy Drive Motors',
      description: 'Retrofit variable frequency inverters on extruders, air compressors, pumps, and conveyance systems to eliminate throttling losses.',
      category: 'Energy',
      icon: 'Cpu',
      score: 84,
      why: 'Motors running at fixed full-load speeds during partial throughput conditions waste 15-25% of input electricity in heat and mechanical friction.',
      estimated_co2_reduction_tonnes: vfdCo2Tonnes,
      estimated_co2_reduction_pct: vfdCo2Pct,
      cost_range_min_inr: Math.round(Math.max(75000, vfdSavingsINR * 0.7)),
      cost_range_max_inr: Math.round(Math.max(160000, vfdSavingsINR * 1.5)),
      annual_saving_inr: vfdSavingsINR,
      payback_years: 1.1,
      feasibility_score: 96,
      circularity_score: 72,
      status: 'suggested',
      target_material: 'Motor Mechanical Work',
      target_waste_stream: 'Parasitic Power Loss',
      waste_reduction_tonnes: 0,
      annual_material_recovered_tonnes: 0,
      action_steps: [
        `Install clamp-on energy loggers on main 3-phase pump, blower, and compressor feeders for 7 days to baseline duty cycles.`,
        `Procure and mount IE4 ultra-premium efficiency motors with integrated IoT vector-control VFD drives.`,
        `Program closed-loop pressure/flow feedback control with automated setback timers during shift changeovers.`,
      ],
    })
  }

  // --------------------------------------------------------------------------
  // Fallback if user had empty inputs
  // --------------------------------------------------------------------------
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-init-circular-01',
      name: 'Facility-Wide Waste Characterization & Scrap Segregation Protocol',
      description: 'Conduct a systematic waste audit to separate high-value industrial off-cuts from generic trash, enabling certified recycling off-take.',
      category: 'Waste',
      icon: 'Recycle',
      score: 90,
      why: 'Mixed waste streams lose over 80% of secondary market value and incur substantial landfill disposal fees.',
      estimated_co2_reduction_tonnes: 2.5,
      estimated_co2_reduction_pct: 12.5,
      cost_range_min_inr: 30000,
      cost_range_max_inr: 75000,
      annual_saving_inr: 120000,
      payback_years: 0.4,
      feasibility_score: 98,
      circularity_score: 95,
      status: 'suggested',
      target_material: 'Factory Scrap',
      target_waste_stream: 'Mixed Landfill Waste',
      waste_reduction_tonnes: 5.0,
      annual_material_recovered_tonnes: 3.5,
      action_steps: [
        'Perform a 14-day mass-balance waste audit weighing all scrap leaving machining and assembly cells.',
        'Place color-coded, labeled receptacles at all waste generation points.',
        'Train floor supervisors on clean scrap handling to prevent oil/solvent contamination.',
      ],
    })
  }

  // Multi-criteria sorting: Highest multi-attribute score first
  recommendations.sort((a, b) => b.score - a.score)

  return { recommendations, diagnosis }
}
