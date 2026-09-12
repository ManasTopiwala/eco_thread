import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Lightbulb, ShieldCheck,
  TrendingDown, DollarSign, Clock, RefreshCw, Filter, Sparkles, Loader2, ArrowRight
} from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import { generateRecommendations } from '../lib/api'
import { DEMO_EMISSION_RESULTS, DEMO_LABEL, formatCO2, formatINR } from '../lib/demo'
import type { Recommendation } from '../types'

export default function Recommendations() {
  const {
    emissionResults, recommendations, saveRecommendationsData,
    updateRecommendationStatusData, processData, isDemo, loadingData, industryProfile
  } = useAppState()

  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'score' | 'co2' | 'savings' | 'payback'>('score')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const results = isDemo ? (emissionResults ?? DEMO_EMISSION_RESULTS) : emissionResults

  const fetchRecs = async () => {
    if (!results) return
    setLoading(true)
    try {
      const materials = processData?.materials?.map(m => m.name) ?? ['Aluminium', 'Steel']
      const wasteMethods = processData?.waste?.map(w => w.disposal_method) ?? ['Landfill']
      const rejectedPct = processData?.production?.[0]?.rejected_units
        ? (processData.production[0].rejected_units / processData.production[0].quantity) * 100
        : 2.5

      const res = await generateRecommendations({
        emission_results: results,
        industry: processData?.industry ?? industryProfile?.industry_type ?? 'Manufacturing',
        materials,
        waste_disposal_methods: wasteMethods,
        rejected_pct: rejectedPct,
      })
      if (res?.recommendations?.length) {
        await saveRecommendationsData(res.recommendations)
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (results && recommendations.length === 0) {
      fetchRecs()
    }
  }, [results, recommendations.length])

  if (loadingData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" color="var(--color-loop)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Loading recommendations...</p>
        </div>
      </div>
    )
  }

  if (!results && recommendations.length === 0) {
    return (
      <div className="animate-fade-in">
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="loop-icon">
            <Lightbulb size={18} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Intervention Recommendations</h1>
        </div>

        <div className="card" style={{ padding: '60px 32px', textAlign: 'center', maxWidth: '640px', margin: '40px auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(0, 184, 169, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--color-loop)'
          }}>
            <Lightbulb size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px', color: 'var(--color-ink)' }}>
            No Recommendations Available
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Actionable decarbonization and circular economy recommendations are generated based on your facility's process emission assessment.
          </p>
          <Link to="/process-data" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', fontSize: '0.9rem' }}>
            Input Process Data & Calculate <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
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
                    {(rec.score > 1 ? rec.score : rec.score * 100).toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ 100</span>
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
                    {(rec.circularity_score > 1 ? rec.circularity_score : rec.circularity_score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Action & Database Status Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontWeight: 600,
                    background: (rec as any).status === 'implemented' ? '#DCFCE7' : (rec as any).status === 'in_progress' ? '#FEF3C7' : '#F1F5F9',
                    color: (rec as any).status === 'implemented' ? '#166534' : (rec as any).status === 'in_progress' ? '#92400E' : '#475569',
                  }}>
                    {(rec as any).status === 'implemented' ? '✓ Implemented' : (rec as any).status === 'in_progress' ? '⚡ In Progress' : 'Suggested Intervention'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {(rec as any).status !== 'implemented' && (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                      onClick={async () => {
                        const newStatus = (rec as any).status === 'in_progress' ? 'implemented' : 'in_progress'
                        await updateRecommendationStatusData(rec.id, newStatus)
                        setToastMessage(newStatus === 'implemented' ? 'Intervention marked as completed!' : 'Intervention adopted! Status updated to In Progress.')
                        setTimeout(() => setToastMessage(null), 3000)
                      }}
                    >
                      {(rec as any).status === 'in_progress' ? 'Mark Completed' : 'Adopt Intervention'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
