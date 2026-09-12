import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Target, Zap, DollarSign, Clock, TrendingDown, CheckCircle2,
  AlertCircle, Plus, Check, ArrowRight, ShieldCheck, Sparkles, Layers
} from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import { runOptimization, generateRecommendations } from '../lib/api'
import { DEMO_EMISSION_RESULTS, DEMO_LABEL, formatCO2, formatINR } from '../lib/demo'
import type { OptimizationResult, ActionPlanItem, Recommendation } from '../types'

export default function Optimizer() {
  const {
    emissionResults, processData, addToActionPlan, actionPlanItems, isDemo
  } = useAppState()
  const navigate = useNavigate()

  const results = emissionResults ?? DEMO_EMISSION_RESULTS

  const [targetPct, setTargetPct] = useState<number>(30)
  const [maxBudgetInr, setMaxBudgetInr] = useState<number>(500000)
  const [maxPeriodMonths, setMaxPeriodMonths] = useState<number>(36)
  const [loading, setLoading] = useState<boolean>(false)
  const [optResult, setOptResult] = useState<OptimizationResult | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Local fallback greedy optimizer if backend is unavailable
  const runLocalOptimizer = async (): Promise<OptimizationResult> => {
    const materials = processData?.materials.map(m => m.name) ?? ['Aluminium', 'Steel']
    const wasteMethods = processData?.waste.map(w => w.disposal_method) ?? ['Landfill']
    const rejectedPct = processData?.production?.[0]?.rejected_units
      ? (processData.production[0].rejected_units / processData.production[0].quantity) * 100
      : 2.5

    const recsRes = await generateRecommendations({
      emission_results: results,
      industry: processData?.industry ?? 'Manufacturing',
      materials,
      waste_disposal_methods: wasteMethods,
      rejected_pct: rejectedPct,
    })

    const recs = recsRes.recommendations || []
    const currentCO2 = results.total_co2e_tonnes
    const targetTonnes = currentCO2 * (targetPct / 100.0)

    const candidates = recs.map(r => {
      const midCost = (r.cost_range_min_inr + r.cost_range_max_inr) / 2
      const carbonRoi = midCost > 0 ? r.estimated_co2_reduction_tonnes / midCost : 0
      return { ...r, midCost, carbonRoi }
    }).sort((a, b) => b.carbonRoi - a.carbonRoi)

    const selected: Recommendation[] = []
    let totalInv = 0
    let totalRed = 0
    let totalSav = 0

    for (const c of candidates) {
      if (totalInv + c.midCost > maxBudgetInr) continue
      if (c.payback_years * 12 > maxPeriodMonths) continue

      selected.push(c)
      totalInv += c.midCost
      totalRed += c.estimated_co2_reduction_tonnes
      totalSav += c.annual_saving_inr

      if (totalRed >= targetTonnes) break
    }

    const achievedPct = currentCO2 > 0 ? (totalRed / currentCO2) * 100 : 0
    const targetAchieved = totalRed >= targetTonnes

    return {
      target_reduction_pct: targetPct,
      target_co2e_tonnes: Number(targetTonnes.toFixed(4)),
      achieved_reduction_pct: Number(achievedPct.toFixed(1)),
      achieved_co2e_reduction_tonnes: Number(totalRed.toFixed(4)),
      projected_co2e_tonnes: Number((currentCO2 - totalRed).toFixed(4)),
      total_investment_inr: Math.round(totalInv),
      annual_saving_inr: Math.round(totalSav),
      payback_years: totalInv > 0 && totalSav > 0 ? Number((totalInv / totalSav).toFixed(2)) : null,
      selected_interventions: selected,
      target_achieved: targetAchieved,
      message: targetAchieved ? null : 'Target cannot currently be achieved within the selected budget.',
      best_carbon_roi_id: selected[0]?.id || null,
    }
  }

  const handleOptimize = async () => {
    setLoading(true)
    try {
      const materials = processData?.materials.map(m => m.name) ?? ['Aluminium', 'Steel']
      const wasteMethods = processData?.waste.map(w => w.disposal_method) ?? ['Landfill']
      const rejectedPct = processData?.production?.[0]?.rejected_units
        ? (processData.production[0].rejected_units / processData.production[0].quantity) * 100
        : 2.5

      const res = await runOptimization({
        current_co2e_tonnes: results.total_co2e_tonnes,
        target_reduction_pct: targetPct,
        max_budget_inr: maxBudgetInr,
        max_period_months: maxPeriodMonths,
        industry: processData?.industry ?? 'Manufacturing',
        materials,
        waste_disposal_methods: wasteMethods,
        rejected_pct: rejectedPct,
      })

      if (res && res.selected_interventions) {
        setOptResult(res)
      } else {
        const fallback = await runLocalOptimizer()
        setOptResult(fallback)
      }
    } catch (err) {
      console.warn('Backend optimize error, running fallback algorithm:', err)
      const fallback = await runLocalOptimizer()
      setOptResult(fallback)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAllToPlan = () => {
    if (!optResult?.selected_interventions?.length) return

    let count = 0
    optResult.selected_interventions.forEach(rec => {
      const exists = actionPlanItems.some(item => item.intervention_id === rec.id)
      if (!exists) {
        const midCost = (rec.cost_range_min_inr + rec.cost_range_max_inr) / 2
        const newItem: ActionPlanItem = {
          id: `plan-${Date.now()}-${rec.id}`,
          intervention_id: rec.id,
          name: rec.name,
          estimated_cost_inr: midCost,
          expected_co2_reduction_tonnes: rec.estimated_co2_reduction_tonnes,
          status: 'Planned',
          start_date: new Date().toISOString().split('T')[0],
        }
        addToActionPlan(newItem)
        count++
      }
    })

    setToastMessage(`Added ${count} optimized initiatives to your Action Plan!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--color-ink)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease',
        }}>
          <Check size={16} color="var(--color-loop)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{toastMessage}</span>
          <Link to="/action-plan" style={{ color: 'var(--color-loop)', marginLeft: '8px', fontSize: '0.875rem', textDecoration: 'underline' }}>
            View Plan
          </Link>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div className="loop-icon">
              <Target size={18} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Carbon Target Optimizer</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Algorithmic portfolio solver: identifies the highest Carbon-ROI combination to hit your target within budget.
            </p>
            {isDemo && <span className="demo-label">🔬 {DEMO_LABEL}</span>}
          </div>
        </div>

        <Link to="/action-plan" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          Action Plan <ArrowRight size={14} />
        </Link>
      </div>

      {/* Constraints & Optimizer Input Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '18px' }}>
          Set Target & Optimization Constraints
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          {/* Target % */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="label" style={{ margin: 0 }}>Target CO₂ Reduction</label>
              <span style={{ fontWeight: 800, color: 'var(--color-loop)' }}>{targetPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              step="5"
              value={targetPct}
              onChange={e => setTargetPct(Number(e.target.value))}
              className="slider-input"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Goal: {(results.total_co2e_tonnes * (targetPct / 100)).toFixed(2)} tCO₂e / month reduction
            </span>
          </div>

          {/* Maximum Budget */}
          <div>
            <label className="label" htmlFor="opt-budget">Max Capital Budget (₹ INR)</label>
            <input
              id="opt-budget"
              type="number"
              min="50000"
              step="50000"
              value={maxBudgetInr}
              onChange={e => setMaxBudgetInr(Number(e.target.value))}
              className="input"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
              Selected: {formatINR(maxBudgetInr)}
            </span>
          </div>

          {/* Max Payback Period */}
          <div>
            <label className="label" htmlFor="opt-period">Max Payback Horizon (Months)</label>
            <input
              id="opt-period"
              type="number"
              min="6"
              max="120"
              step="6"
              value={maxPeriodMonths}
              onChange={e => setMaxPeriodMonths(Number(e.target.value))}
              className="input"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
              Max allowed: {(maxPeriodMonths / 12).toFixed(1)} years
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleOptimize}
            disabled={loading}
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', padding: '10px 24px' }}
          >
            <Sparkles size={16} />
            {loading ? 'Optimizing Portfolio...' : 'Solve Optimal Portfolio'}
          </button>
        </div>
      </div>

      {/* Optimization Results View */}
      {optResult && (
        <div className="animate-fade-in">
          {/* Status Banner */}
          <div style={{
            background: optResult.target_achieved ? '#F0FDF4' : '#FFFBEB',
            border: `1px solid ${optResult.target_achieved ? '#BBF7D0' : '#FDE68A'}`,
            borderRadius: '12px',
            padding: '18px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {optResult.target_achieved ? (
                <CheckCircle2 size={24} color="#16A34A" />
              ) : (
                <AlertCircle size={24} color="#D97706" />
              )}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: optResult.target_achieved ? '#166534' : '#92400E', margin: 0 }}>
                  {optResult.target_achieved
                    ? `Optimal Portfolio Found: Target Met (${optResult.achieved_reduction_pct}% Achieved)`
                    : 'Target Partially Achieved within Constraints'}
                </h3>
                <p style={{ fontSize: '0.825rem', color: optResult.target_achieved ? '#15803D' : '#B45309', margin: 0 }}>
                  {optResult.message ?? `Selected ${optResult.selected_interventions.length} high-ROI interventions satisfying budget and payback constraints.`}
                </p>
              </div>
            </div>

            {optResult.selected_interventions.length > 0 && (
              <button
                onClick={handleAddAllToPlan}
                className="btn btn-primary"
                style={{ fontSize: '0.825rem', padding: '8px 16px' }}
              >
                <Plus size={14} /> Add Portfolio to Action Plan
              </button>
            )}
          </div>

          {/* Results Summary KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div className="kpi-card">
              <span className="kpi-label">Achieved Reduction</span>
              <div className="kpi-value" style={{ color: 'var(--color-loop-dark)' }}>
                {optResult.achieved_reduction_pct}%
              </div>
              <div className="kpi-change" style={{ color: 'var(--color-text-secondary)' }}>
                Target: {optResult.target_reduction_pct}% ({formatCO2(optResult.achieved_co2e_reduction_tonnes)})
              </div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">Total Capital Required</span>
              <div className="kpi-value" style={{ color: 'var(--color-ink)' }}>
                {formatINR(optResult.total_investment_inr)}
              </div>
              <div className="kpi-change" style={{ color: 'var(--color-text-secondary)' }}>
                Budget: {formatINR(maxBudgetInr)}
              </div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">Est. Annual Cost Savings</span>
              <div className="kpi-value" style={{ color: '#16A34A' }}>
                {formatINR(optResult.annual_saving_inr)}
              </div>
              <div className="kpi-change" style={{ color: '#16A34A' }}>
                Per year recurring savings
              </div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">Blended Payback Period</span>
              <div className="kpi-value" style={{ color: '#6366F1' }}>
                {optResult.payback_years !== null ? `${optResult.payback_years} yrs` : 'N/A'}
              </div>
              <div className="kpi-change" style={{ color: 'var(--color-text-secondary)' }}>
                Based on combined ROI
              </div>
            </div>
          </div>

          {/* Selected Portfolio List */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                Selected Interventions in Optimal Solution ({optResult.selected_interventions.length})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Ranked by Carbon ROI (tCO₂e saved / ₹ invested)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {optResult.selected_interventions.map((item, idx) => {
                const inPlan = actionPlanItems.some(p => p.intervention_id === item.id)
                const midCost = (item.cost_range_min_inr + item.cost_range_max_inr) / 2

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'var(--color-loop)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 800, flexShrink: 0
                      }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.name}</span>
                          <span className="severity-pill" style={{ background: '#E2E8F0', color: '#475569' }}>
                            {item.category}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          Estimated Payback: {item.payback_years} years
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>Reduction</div>
                        <div style={{ fontWeight: 800, color: 'var(--color-hotspot-low)', fontSize: '0.9rem' }}>
                          {formatCO2(item.estimated_co2_reduction_tonnes)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>Est. Investment</div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                          {formatINR(midCost)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>Annual Savings</div>
                        <div style={{ fontWeight: 800, color: '#16A34A', fontSize: '0.9rem' }}>
                          {formatINR(item.annual_saving_inr)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (inPlan) return
                          const newItem: ActionPlanItem = {
                            id: `plan-${Date.now()}-${item.id}`,
                            intervention_id: item.id,
                            name: item.name,
                            estimated_cost_inr: midCost,
                            expected_co2_reduction_tonnes: item.estimated_co2_reduction_tonnes,
                            status: 'Planned',
                            start_date: new Date().toISOString().split('T')[0],
                          }
                          addToActionPlan(newItem)
                        }}
                        disabled={inPlan}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.78rem',
                          padding: '6px 12px',
                          color: inPlan ? '#94A3B8' : 'var(--color-loop)',
                        }}
                      >
                        {inPlan ? <Check size={13} /> : <Plus size={13} />}
                        {inPlan ? 'In Plan' : 'Add'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
