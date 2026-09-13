import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Lightbulb, ShieldCheck,
  TrendingDown, DollarSign, Clock, RefreshCw, Filter, Sparkles, Loader2, ArrowRight,
  Package, Recycle, Target, ChevronDown, ChevronUp, CheckCircle2, Zap, AlertTriangle
} from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import { generateRecommendations } from '../lib/api'
import { computeFacilityWasteDiagnosis } from '../lib/recommendationEngine'
import { DEMO_EMISSION_RESULTS, DEMO_PROCESS_DATA, DEMO_PROFILE, DEMO_LABEL, formatCO2, formatINR } from '../lib/demo'
import type { Recommendation, FacilityWasteDiagnosis } from '../types'

export default function Recommendations() {
  const {
    emissionResults, recommendations, saveRecommendationsData,
    updateRecommendationStatusData, processData, isDemo, loadingData, industryProfile
  } = useAppState()

  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'score' | 'co2' | 'savings' | 'payback'>('score')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [expandedRoadmaps, setExpandedRoadmaps] = useState<Record<string, boolean>>({})

  const activeProcessData = isDemo ? DEMO_PROCESS_DATA : processData
  const activeProfile = isDemo ? (DEMO_PROFILE as any) : industryProfile
  const results = isDemo ? (emissionResults ?? DEMO_EMISSION_RESULTS) : emissionResults

  // Calculate real-time facility waste & raw material diagnosis
  const diagnosis: FacilityWasteDiagnosis = useMemo(() => {
    return computeFacilityWasteDiagnosis(activeProcessData, activeProfile)
  }, [activeProcessData, activeProfile])

  const toggleRoadmap = (id: string) => {
    setExpandedRoadmaps(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const fetchRecs = async () => {
    if (!results) return
    setLoading(true)
    try {
      const res = await generateRecommendations({
        emission_results: results,
        process_data: activeProcessData,
        industry_profile: activeProfile,
        industry: activeProcessData?.industry ?? activeProfile?.industry_type ?? 'Manufacturing',
      })
      if (res?.recommendations?.length) {
        await saveRecommendationsData(res.recommendations)
        setToastMessage('Dedicated recommendation solution regenerated based on your raw material & waste data!')
        setTimeout(() => setToastMessage(null), 4000)
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
      setToastMessage('Failed to evaluate recommendations. Please try again.')
      setTimeout(() => setToastMessage(null), 4000)
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
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Loading personalized recommendations...</p>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dedicated Circular Recommendations</h1>
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
            <Recycle size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px', color: 'var(--color-ink)' }}>
            No Recommendations Available Yet
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Our dedicated engine analyzes your facility's specific raw materials, waste streams, and rejection rates to build customized circular interventions.
          </p>
          <Link to="/process-data" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', fontSize: '0.9rem' }}>
            Input Raw Materials & Waste Streams <ArrowRight size={16} />
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

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          fontSize: '0.875rem',
          fontWeight: 600,
          border: '1px solid #334155',
        }}>
          <Sparkles size={16} color="var(--color-loop)" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div className="loop-icon">
              <Lightbulb size={18} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Tailored Circular Interventions
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Dedicated recommendations engineered specifically from <strong style={{ color: 'var(--color-ink)' }}>{activeProfile?.company_name || 'your facility'}</strong>'s raw materials, scrap streams, and landfill outputs.
            </p>
            {isDemo && <span className="demo-label">🔬 {DEMO_LABEL}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchRecs}
            disabled={loading}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing Plant Data...' : 'Re-Evaluate Dedicated Engine'}
          </button>
        </div>
      </div>

      {/* FACILITY RAW MATERIAL & WASTE DIAGNOSIS PANEL */}
      <div className="card" style={{
        padding: '20px 24px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(0, 184, 169, 0.04) 0%, rgba(248, 250, 252, 1) 100%)',
        border: '1px solid rgba(0, 184, 169, 0.25)',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'var(--color-loop)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Recycle size={15} />
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-loop-dark)' }}>
                Plant Material & Waste Diagnosis
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-ink)' }}>
                Facility Circularity & Scrap Flow Baseline
              </h3>
            </div>
          </div>
          <span style={{
            fontSize: '0.75rem',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(0, 184, 169, 0.1)',
            color: 'var(--color-loop-dark)',
            fontWeight: 700,
          }}>
            🎯 Tailored to: {diagnosis.primary_material} & {diagnosis.primary_waste_stream}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px'
        }}>
          {/* Metric 1 */}
          <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <Package size={14} color="#6366F1" />
              <span>Raw Material Input</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink)' }}>
              {diagnosis.total_raw_material_kg.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>kg/mo</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              <strong style={{ color: diagnosis.virgin_material_pct > 50 ? '#DC2626' : '#16A34A' }}>
                {diagnosis.virgin_material_pct}% Virgin
              </strong> • Main: {diagnosis.primary_material}
            </div>
          </div>

          {/* Metric 2 */}
          <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <Recycle size={14} color="#F59E0B" />
              <span>Scrap & Waste Stream</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink)' }}>
              {diagnosis.total_waste_kg.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>kg/mo</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              <strong style={{ color: '#D97706' }}>{diagnosis.landfill_diversion_potential_pct}% to Landfill/Disposal</strong>
            </div>
          </div>

          {/* Metric 3 */}
          <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <Target size={14} color="#EF4444" />
              <span>Scrap Intensity Index</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: diagnosis.material_waste_ratio_pct > 15 ? '#DC2626' : 'var(--color-ink)' }}>
              {diagnosis.material_waste_ratio_pct}%
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Scrap generated per kg raw material throughput
            </div>
          </div>

          {/* Metric 4 */}
          <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <DollarSign size={14} color="#10B981" />
              <span>Uncaptured Scrap Value</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A' }}>
              {formatINR(diagnosis.uncaptured_scrap_value_inr)}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}> / yr</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Avoided tipping fees + scrap recovery value
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '4px', gap: '4px', flexWrap: 'wrap' }}>
          {['All', 'Materials', 'Waste', 'Energy'].map(cat => (
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
              {cat === 'Materials' ? 'Raw Materials' : cat === 'Waste' ? 'Waste Valorization' : cat}
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
            <option value="score">Overall Circularity Score</option>
            <option value="co2">Highest CO₂ Reduction</option>
            <option value="savings">Highest Annual Savings (₹)</option>
            <option value="payback">Shortest Payback Period</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filtered.map((rec, idx) => {
          const isExpanded = !!expandedRoadmaps[rec.id]

          return (
            <div key={rec.id} className="card" style={{ padding: '24px 28px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: idx === 0 ? 'var(--color-loop)' : 'var(--color-loop-light)',
                    color: idx === 0 ? 'white' : 'var(--color-loop)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.9rem', flexShrink: 0
                  }}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-ink)' }}>{rec.name}</h3>

                      <span className="severity-pill" style={{ background: '#E2E8F0', color: '#475569' }}>
                        {rec.category}
                      </span>

                      {rec.target_material && (
                        <span className="severity-pill" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#4F46E5' }}>
                          🎯 {rec.target_material}
                        </span>
                      )}

                      {rec.target_waste_stream && (
                        <span className="severity-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                          ♻️ {rec.target_waste_stream}
                        </span>
                      )}

                      {idx === 0 && (
                        <span className="severity-pill" style={{ background: 'var(--color-loop-light)', color: 'var(--color-loop-dark)' }}>
                          Top Facility Priority
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.885rem', color: 'var(--color-text-secondary)', margin: 0, maxWidth: '750px', lineHeight: 1.5 }}>
                      {rec.description}
                    </p>
                  </div>
                </div>

                {/* Score badge */}
                <div style={{
                  textAlign: 'right',
                  background: 'var(--color-bg)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Score</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-loop-dark)' }}>
                    {(rec.score > 1 ? rec.score : rec.score * 100).toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ 100</span>
                  </div>
                </div>
              </div>

              {/* Rationale Quote */}
              <div style={{
                background: '#F8FAFC',
                borderLeft: '4px solid var(--color-loop)',
                padding: '12px 16px',
                borderRadius: '0 8px 8px 0',
                marginBottom: '18px',
                fontSize: '0.85rem',
                color: '#334155',
                lineHeight: 1.55,
              }}>
                <strong style={{ color: 'var(--color-ink)' }}>Tailored Rationale: </strong>
                {rec.why}
              </div>

              {/* Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                padding: '14px 16px',
                background: 'var(--color-bg)',
                borderRadius: '10px',
                marginBottom: '18px',
                border: '1px solid var(--color-border)'
              }}>
                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <TrendingDown size={12} color="var(--color-hotspot-low)" /> CO₂ Abatement
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
                    <Recycle size={12} color="#059669" /> Material Diverted
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#059669' }}>
                    {rec.annual_material_recovered_tonnes || rec.waste_reduction_tonnes
                      ? `${rec.annual_material_recovered_tonnes || rec.waste_reduction_tonnes} Tonnes/yr`
                      : 'Process Saving'}
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
                    <DollarSign size={12} color="#6366F1" /> Setup Investment
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-ink)' }}>
                    {formatINR(rec.cost_range_min_inr)} – {formatINR(rec.cost_range_max_inr)}
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

              {/* ACTION ROADMAP ACCORDION */}
              {rec.action_steps && rec.action_steps.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <button
                    onClick={() => toggleRoadmap(rec.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-loop-dark)',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      padding: '4px 0',
                    }}
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    {isExpanded ? 'Hide Implementation Roadmap' : `View 3-Step Implementation Roadmap (${rec.action_steps.length} steps)`}
                  </button>

                  {isExpanded && (
                    <div style={{
                      marginTop: '10px',
                      padding: '14px 18px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                        Action Plan for {activeProfile?.company_name || 'Your Plant'}:
                      </div>
                      {rec.action_steps.map((step, sIdx) => (
                        <div key={sIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.835rem', color: '#334155' }}>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: 'var(--color-loop)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginTop: '2px'
                          }}>
                            {sIdx + 1}
                          </div>
                          <span style={{ lineHeight: 1.5 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action & Database Status Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '3px 12px',
                    borderRadius: '20px',
                    fontWeight: 700,
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
                      style={{ fontSize: '0.8rem', padding: '6px 14px' }}
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
