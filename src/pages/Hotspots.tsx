import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Flame, AlertTriangle, ArrowRight, TrendingDown,
  Zap, Recycle, Trash2, CheckCircle2, ChevronRight, Info
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import { useAppState } from '../hooks/useAppState'
import { DEMO_EMISSION_RESULTS, DEMO_LABEL, formatCO2, formatINR, SEVERITY_COLORS, CHART_COLORS } from '../lib/demo'

export default function Hotspots() {
  const { emissionResults, processData, isDemo } = useAppState()
  const navigate = useNavigate()
  const results = emissionResults ?? DEMO_EMISSION_RESULTS

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Sort sources by emissions descending
  const sortedSources = [...results.sources].sort((a, b) => b.co2e_tonnes - a.co2e_tonnes)
  const topHotspot = sortedSources[0]

  const categoryIcons: Record<string, any> = {
    Materials: Recycle,
    Energy: Zap,
    Waste: Trash2,
  }

  const categoryDescriptions: Record<string, string> = {
    Materials: 'Embodied emissions from raw virgin materials such as aluminium, steel, plastics, and process chemicals.',
    Energy: 'Scope 2 emissions from grid electricity consumption and Scope 1 emissions from on-site fuel combustion (diesel, natural gas, coal).',
    Waste: 'Emissions generated from off-site disposal in landfills, incineration, and unrecovered process scrap.',
  }

  const categoryQuickWins: Record<string, string[]> = {
    Materials: [
      'Substitute virgin feedstock with secondary/recycled grade materials',
      'Optimize component design to reduce scrap during CNC/machining',
      'Standardize material variants across production lines'
    ],
    Energy: [
      'Shift electricity load to rooftop solar or renewable open access',
      'Install variable frequency drives (VFDs) on heavy motors and pumps',
      'Implement smart scheduling to minimize peak idle load'
    ],
    Waste: [
      'Establish closed-loop internal scrap remelting and recycling',
      'Partner with certified recyclers instead of mixed landfill disposal',
      'Implement defect reduction programs to decrease rejected units'
    ],
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div className="loop-icon" style={{ background: '#FEE2E2', color: 'var(--color-hotspot-high)' }}>
              <Flame size={18} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hotspot Analysis</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Pinpoint the highest-emitting stages and material streams across your manufacturing lifecycle.
            </p>
            {isDemo && <span className="demo-label">🔬 {DEMO_LABEL}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/recommendations')}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            View Recommendations <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Top Banner Alert */}
      {topHotspot && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
          border: '1px solid #FECDD3',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#E5484D', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 800, color: '#9F1239', fontSize: '1.05rem' }}>
                  Primary Hotspot: {topHotspot.category} ({topHotspot.percentage}% of total)
                </span>
                <span className="severity-pill severity-high">High Priority</span>
              </div>
              <p style={{ color: '#881337', fontSize: '0.875rem', margin: 0, maxWidth: '680px' }}>
                {topHotspot.category} generates <strong>{formatCO2(topHotspot.co2e_tonnes)}</strong> per month.
                Targeting this category offers the fastest return on carbon reduction and circular cost recovery.
              </p>
            </div>
          </div>
          <Link
            to="/recommendations"
            className="btn"
            style={{
              background: '#BE123C',
              color: 'white',
              fontSize: '0.85rem',
              boxShadow: '0 2px 8px rgba(190, 18, 60, 0.25)'
            }}
          >
            View Recommendations
          </Link>
        </div>
      )}

      {/* Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {sortedSources.map((source, idx) => {
          const IconComponent = categoryIcons[source.category] || Flame
          const isSelected = selectedCategory === source.category
          const severityClass = source.severity === 'High' ? 'severity-high' : source.severity === 'Medium' ? 'severity-medium' : 'severity-low'

          return (
            <div
              key={source.category}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--color-loop)' : 'var(--color-border)',
                boxShadow: isSelected ? '0 0 0 2px var(--color-loop-light), 0 4px 16px rgba(0,0,0,0.06)' : undefined,
                transition: 'all 0.2s ease',
              }}
              onClick={() => setSelectedCategory(isSelected ? null : source.category)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: `${SEVERITY_COLORS[source.severity ?? 'Medium']}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: SEVERITY_COLORS[source.severity ?? 'Medium']
                  }}>
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{source.category}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Rank #{idx + 1} Contributor</span>
                  </div>
                </div>
                <span className={`severity-pill ${severityClass}`}>
                  {source.severity ?? 'Medium'}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                    {formatCO2(source.co2e_tonnes)}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: SEVERITY_COLORS[source.severity ?? 'Medium'] }}>
                    {source.percentage}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${source.percentage}%`,
                      background: SEVERITY_COLORS[source.severity ?? 'Medium']
                    }}
                  />
                </div>
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                {categoryDescriptions[source.category] ?? 'Detailed emission breakdown for this activity stream.'}
              </p>

              <div style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--color-loop)',
                fontWeight: 600
              }}>
                <span>{isSelected ? 'Collapse deep-dive' : 'Explore opportunities'}</span>
                <ChevronRight size={14} style={{ transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Category Deep Dive Panel */}
      {selectedCategory && (
        <div className="card animate-fade-in" style={{ marginBottom: '24px', background: '#F8FAFC', border: '1px solid #CBD5E1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={18} color="var(--color-loop)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {selectedCategory} Hotspot Deep Dive & Recommended Pathways
              </h3>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '10px' }}>
                Key Mitigation Levers
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(categoryQuickWins[selectedCategory] ?? []).map((win, i) => (
                  <li key={i}>{win}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px' }}>
                Next Action
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
                Compare circular solutions tailored for {selectedCategory.toLowerCase()} reduction with estimated payback and ROI.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/recommendations" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                  Recommendations
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Charts Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Hotspot Contribution Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>
            Emissions by Hotspot (tCO₂e / month)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={sortedSources.map(s => ({
                name: s.category,
                tonnes: s.co2e_tonnes,
                severity: s.severity,
              }))}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} unit="t" />
              <Tooltip
                formatter={(val: any) => [`${Number(val).toFixed(2)} tCO₂e`, 'Emissions']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="tonnes" radius={[6, 6, 0, 0]}>
                {sortedSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity ?? 'Medium']} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footprint Distribution Donut */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>
            Footprint Share Percentage
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={sortedSources.map(s => ({ name: s.category, value: s.percentage }))}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sortedSources.map((_, i) => (
                  <Cell key={`cell-pie-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Share']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
