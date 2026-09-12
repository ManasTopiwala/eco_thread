import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Lightbulb, Check, Plus, Sliders, ArrowRight, ShieldCheck,
  TrendingDown, DollarSign, Clock, RefreshCw, Filter, Sparkles
} from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import { generateRecommendations } from '../lib/api'
import { DEMO_EMISSION_RESULTS, DEMO_LABEL, formatCO2, formatINR } from '../lib/demo'
import type { Recommendation, ActionPlanItem } from '../types'

export default function Recommendations() {
  const {
    emissionResults, recommendations, setRecommendations,
    processData, addToActionPlan, actionPlanItems, isDemo
  } = useAppState()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'score' | 'co2' | 'savings' | 'payback'>('score')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const results = emissionResults ?? DEMO_EMISSION_RESULTS

  const fetchRecs = async () => {
    setLoading(true)
    try {
      const materials = processData?.materials.map(m => m.name) ?? ['Aluminium', 'Steel']
      const wasteMethods = processData?.waste.map(w => w.disposal_method) ?? ['Landfill']
      const rejectedPct = processData?.production?.[0]?.rejected_units
        ? (processData.production[0].rejected_units / processData.production[0].quantity) * 100
        : 2.5

      const res = await generateRecommendations({
        emission_results: results,
        industry: processData?.industry ?? 'Manufacturing',
        materials,
        waste_disposal_methods: wasteMethods,
        rejected_pct: rejectedPct,
      })
      if (res?.recommendations) {
        setRecommendations(res.recommendations)
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (recommendations.length === 0) {
      fetchRecs()
    }
  }, [])

  const isItemInPlan = (recId: string) => {
    return actionPlanItems.some(item => item.intervention_id === recId)
  }

  const handleAddToPlan = (rec: Recommendation) => {
    if (isItemInPlan(rec.id)) return

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
    setToastMessage(`Added "${rec.name}" to your Action Plan!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filter and sort recommendations
  const filtered = recommendations
    .filter(r => selectedCategory === 'All' || r.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score
      if (sortBy === 'co2') return b.estimated_co2_reduction_tonnes - a.estimated_co2_reduction_tonnes
      if (sortBy === 'savings') return b.annual_saving_inr - a.annual_saving_inr
      if (sortBy === 'payback') return a.payback_years - b.payback_years
      return 0
    })

  return (
    <div className="animate-fade-in">
      {/* Toast Notification */}
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
              <Lightbulb size={18} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Intervention Recommendations</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              AI-evaluated circular interventions ranked by multi-criteria score (CO₂, ROI, Feasibility & Circularity).
            </p>
            {isDemo && <span className="demo-label">🔬 {DEMO_LABEL}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchRecs}
            disabled={loading}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Evaluating...' : 'Refresh Scoring'}
          </button>
          <button
            onClick={() => navigate('/simulator')}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            Open Simulator <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Scoring Weight Info Banner */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        padding: '12px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.8rem',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={15} color="var(--color-loop)" />
          <strong style={{ color: 'var(--color-ink)' }}>Scoring weights:</strong>
          <span>40% CO₂ Reduction</span> •
          <span>25% Cost Effectiveness</span> •
          <span>20% Operational Feasibility</span> •
          <span>15% Circularity Rating</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span>{filtered.length} interventions generated</span>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
          {['All', 'Materials', 'Energy', 'Waste'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--color-loop)' : 'transparent',
                color: selectedCategory === cat ? 'white' : 'var(--color-ink)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--color-text-secondary)" />
          <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Sort by:</span>
          <select
            className="input select"
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            style={{ padding: '6px 28px 6px 12px', fontSize: '0.825rem', width: 'auto' }}
          >
            <option value="score">Overall Score</option>
            <option value="co2">Highest CO₂ Reduction</option>
            <option value="savings">Highest Annual Savings</option>
            <option value="payback">Shortest Payback Period</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {filtered.map((rec, idx) => {
          const inPlan = isItemInPlan(rec.id)

          return (
            <div key={rec.id} className="card" style={{ padding: '22px 26px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: idx === 0 ? 'var(--color-loop)' : 'var(--color-loop-light)',
                    color: idx === 0 ? 'white' : 'var(--color-loop)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.875rem', flexShrink: 0
                  }}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{rec.name}</h3>
                      <span className="severity-pill" style={{ background: '#E2E8F0', color: '#475569' }}>
                        {rec.category}
                      </span>
                      {idx === 0 && (
                        <span className="severity-pill" style={{ background: 'var(--color-loop-light)', color: 'var(--color-loop-dark)' }}>
                          Top Recommendation
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, maxWidth: '680px' }}>
                      {rec.description}
                    </p>
                  </div>
                </div>

                {/* Score badge */}
                <div style={{
                  textAlign: 'right',
                  background: 'var(--color-bg)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Score</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-loop-dark)' }}>
                    {(rec.score * 100).toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ 100</span>
                  </div>
                </div>
              </div>

              {/* Rationale Quote */}
              <div style={{
                background: '#F8FAFC',
                borderLeft: '3px solid var(--color-loop)',
                padding: '10px 14px',
                borderRadius: '0 8px 8px 0',
                marginBottom: '18px',
                fontSize: '0.825rem',
                color: '#334155',
                lineHeight: 1.5,
              }}>
                <strong>Why this recommendation: </strong>
                {rec.why}
              </div>

              {/* Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                padding: '14px',
                background: 'var(--color-bg)',
                borderRadius: '8px',
                marginBottom: '18px'
              }}>
                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <TrendingDown size={12} color="var(--color-hotspot-low)" /> CO₂ Reduction
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-ink)' }}>
                    {formatCO2(rec.estimated_co2_reduction_tonnes)}
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-hotspot-low)', marginLeft: '4px' }}>
                      ({rec.estimated_co2_reduction_pct}%)
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <DollarSign size={12} color="#6366F1" /> Est. Investment
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-ink)' }}>
                    {formatINR(rec.cost_range_min_inr)} – {formatINR(rec.cost_range_max_inr)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <DollarSign size={12} color="#2BB673" /> Annual Savings
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#16A34A' }}>
                    {formatINR(rec.annual_saving_inr)} / yr
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <Clock size={12} color="#F2A93C" /> Payback Period
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-ink)' }}>
                    {rec.payback_years} years
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <ShieldCheck size={12} color="var(--color-loop)" /> Circularity
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-loop)' }}>
                    {(rec.circularity_score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/simulator"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <Sliders size={13} /> Simulate Impact
                </Link>
                <button
                  onClick={() => handleAddToPlan(rec)}
                  disabled={inPlan}
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px 16px',
                    background: inPlan ? '#E2E8F0' : 'var(--color-loop)',
                    color: inPlan ? '#64748B' : 'white',
                    cursor: inPlan ? 'default' : 'pointer',
                  }}
                >
                  {inPlan ? (
                    <>
                      <Check size={14} /> Added to Plan
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Add to Action Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
