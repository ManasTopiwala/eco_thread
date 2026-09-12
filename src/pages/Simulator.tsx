import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sliders, RotateCcw, Target, ArrowRight, Zap, Recycle,
  Trash2, TrendingDown, DollarSign, Flame, Sparkles, Check
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { useAppState } from '../hooks/useAppState'
import { DEMO_EMISSION_RESULTS, DEMO_LABEL, formatCO2, formatINR, CHART_COLORS } from '../lib/demo'
import type { SimulationSliders } from '../types'

const PRESETS: Record<string, { label: string; sliders: SimulationSliders }> = {
  reset: {
    label: 'Baseline (0%)',
    sliders: {
      recycled_material_pct: 0,
      waste_recovery_pct: 0,
      renewable_energy_pct: 0,
      process_optimization_pct: 0,
      reuse_program_pct: 0,
    },
  },
  quickWins: {
    label: 'Quick Wins (~15%)',
    sliders: {
      recycled_material_pct: 20,
      waste_recovery_pct: 30,
      renewable_energy_pct: 15,
      process_optimization_pct: 25,
      reuse_program_pct: 10,
    },
  },
  balanced: {
    label: 'Balanced Circular (~35%)',
    sliders: {
      recycled_material_pct: 50,
      waste_recovery_pct: 60,
      renewable_energy_pct: 50,
      process_optimization_pct: 40,
      reuse_program_pct: 30,
    },
  },
  aggressive: {
    label: 'Net-Zero Push (~70%+)',
    sliders: {
      recycled_material_pct: 90,
      waste_recovery_pct: 85,
      renewable_energy_pct: 100,
      process_optimization_pct: 75,
      reuse_program_pct: 60,
    },
  },
}

export default function Simulator() {
  const { emissionResults, isDemo } = useAppState()
  const navigate = useNavigate()
  const results = emissionResults ?? DEMO_EMISSION_RESULTS

  const [sliders, setSliders] = useState<SimulationSliders>({
    recycled_material_pct: 30,
    waste_recovery_pct: 50,
    renewable_energy_pct: 40,
    process_optimization_pct: 20,
    reuse_program_pct: 15,
  })

  const updateSlider = (key: keyof SimulationSliders, val: number) => {
    setSliders(s => ({ ...s, [key]: Math.max(0, Math.min(100, val)) }))
  }

  // Authoritative dynamic simulation calculation
  const simulationData = useMemo(() => {
    const sources = results.sources || []
    const totalOriginal = results.total_co2e_tonnes || 0.0

    let totalProjected = 0.0
    const projectedSources = sources.map(s => {
      const cat = s.category
      const origTonnes = s.co2e_tonnes
      let reduction = 0.0

      if (cat === 'Materials') {
        reduction += origTonnes * (sliders.recycled_material_pct / 100) * 0.30
        reduction += origTonnes * (sliders.reuse_program_pct / 100) * 0.15
      } else if (cat === 'Waste') {
        reduction += origTonnes * (sliders.waste_recovery_pct / 100) * 0.55
      } else if (cat === 'Energy') {
        reduction += origTonnes * (sliders.renewable_energy_pct / 100) * 0.85
        reduction += origTonnes * (sliders.process_optimization_pct / 100) * 0.20
      }

      const projectedTonnes = Math.max(0.0, origTonnes - reduction)
      totalProjected += projectedTonnes

      return {
        category: cat,
        original: origTonnes,
        projected: projectedTonnes,
        reduction: reduction,
      }
    })

    const reductionTonnes = Math.max(0, totalOriginal - totalProjected)
    const reductionPct = totalOriginal > 0 ? (reductionTonnes / totalOriginal) * 100 : 0
    const annualSavingInr = reductionTonnes * 8000

    return {
      totalOriginal,
      totalProjected,
      reductionTonnes,
      reductionPct,
      annualSavingInr,
      projectedSources,
    }
  }, [results, sliders])

  const chartData = simulationData.projectedSources.map(s => ({
    category: s.category,
    'Baseline (Current)': Number(s.original.toFixed(2)),
    'Projected (Simulated)': Number(s.projected.toFixed(2)),
  }))

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div className="loop-icon">
              <Sliders size={18} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Scenario Simulator</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Model what-if adoption rates for circular levers and see live CO₂e reduction & financial savings.
            </p>
            {isDemo && <span className="demo-label">🔬 {DEMO_LABEL}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setSliders(PRESETS.reset.sliders)}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={() => navigate('/optimizer')}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            Run Target Optimizer <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Preset Scenario Selector Buttons */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--color-loop)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-ink)' }}>
            Quick Presets:
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setSliders(preset.sliders)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live KPI Impact Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="kpi-label" style={{ margin: 0 }}>Baseline CO₂e</span>
            <Flame size={16} color="#E5484D" />
          </div>
          <div className="kpi-value">{formatCO2(simulationData.totalOriginal)}</div>
          <div className="kpi-change" style={{ color: 'var(--color-text-secondary)' }}>Current monthly footprint</div>
        </div>

        <div className="kpi-card" style={{ borderColor: 'var(--color-loop)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="kpi-label" style={{ margin: 0, color: 'var(--color-loop)' }}>Projected CO₂e</span>
            <TrendingDown size={16} color="var(--color-loop)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--color-loop-dark)' }}>
            {formatCO2(simulationData.totalProjected)}
          </div>
          <div className="kpi-change" style={{ color: 'var(--color-hotspot-low)' }}>
            ↓ -{simulationData.reductionPct.toFixed(1)}% reduction
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="kpi-label" style={{ margin: 0 }}>Total Carbon Avoided</span>
            <Recycle size={16} color="var(--color-hotspot-low)" />
          </div>
          <div className="kpi-value" style={{ color: '#16A34A' }}>
            {formatCO2(simulationData.reductionTonnes)}
          </div>
          <div className="kpi-change" style={{ color: '#16A34A' }}>Monthly avoided tCO₂e</div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="kpi-label" style={{ margin: 0 }}>Est. Annual Value</span>
            <DollarSign size={16} color="#6366F1" />
          </div>
          <div className="kpi-value" style={{ color: '#6366F1' }}>
            {formatINR(simulationData.annualSavingInr)}
          </div>
          <div className="kpi-change" style={{ color: 'var(--color-text-secondary)' }}>Annual energy & material savings</div>
        </div>
      </div>

      {/* Main Content Layout: Sliders Column + Chart Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Sliders Box */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '20px' }}>
            Adjust Intervention Adoption Levers
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Slider 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Recycle size={15} color="var(--color-loop)" />
                  <label className="label" style={{ margin: 0 }}>Recycled Material Substitution</label>
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-loop)' }}>
                  {sliders.recycled_material_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.recycled_material_pct}
                onChange={e => updateSlider('recycled_material_pct', Number(e.target.value))}
                className="slider-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Replaces virgin feedstock with secondary alloys / polymers (up to 30% material reduction)
              </span>
            </div>

            {/* Slider 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trash2 size={15} color="#F2A93C" />
                  <label className="label" style={{ margin: 0 }}>Internal Waste Recovery</label>
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#F2A93C' }}>
                  {sliders.waste_recovery_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.waste_recovery_pct}
                onChange={e => updateSlider('waste_recovery_pct', Number(e.target.value))}
                className="slider-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Reprocesses scrap on-site, diverting from landfill (up to 55% waste reduction)
              </span>
            </div>

            {/* Slider 3 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={15} color="#E5484D" />
                  <label className="label" style={{ margin: 0 }}>Renewable Electricity</label>
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#E5484D' }}>
                  {sliders.renewable_energy_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.renewable_energy_pct}
                onChange={e => updateSlider('renewable_energy_pct', Number(e.target.value))}
                className="slider-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Transitions grid power to solar/wind (up to 85% electricity Scope 2 reduction)
              </span>
            </div>

            {/* Slider 4 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={15} color="#6366F1" />
                  <label className="label" style={{ margin: 0 }}>Process Efficiency Optimization</label>
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#6366F1' }}>
                  {sliders.process_optimization_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.process_optimization_pct}
                onChange={e => updateSlider('process_optimization_pct', Number(e.target.value))}
                className="slider-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                VFDs, waste heat recovery, and motor optimization (up to 20% total energy reduction)
              </span>
            </div>

            {/* Slider 5 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCcw size={15} color="#2BB673" />
                  <label className="label" style={{ margin: 0 }}>Product & Material Reuse</label>
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#2BB673' }}>
                  {sliders.reuse_program_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.reuse_program_pct}
                onChange={e => updateSlider('reuse_program_pct', Number(e.target.value))}
                className="slider-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Refurbishment and internal defect rework (up to 15% material reduction)
              </span>
            </div>
          </div>
        </div>

        {/* Visual Chart Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px' }}>
            Emissions Comparison by Category (tCO₂e)
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            Real-time projection showing baseline vs post-intervention emission levels.
          </p>

          <div style={{ flex: 1, minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} unit="t" />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toFixed(2)} tCO₂e`]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Bar dataKey="Baseline (Current)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Projected (Simulated)" fill="var(--color-loop)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: 'var(--color-bg)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ready to calculate the optimal portfolio for a fixed budget?</span>
            <Link to="/optimizer" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              Target Optimizer <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
