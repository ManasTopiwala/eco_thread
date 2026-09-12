import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { LayoutDashboard, TrendingDown, Leaf, DollarSign, Flame, AlertCircle, ArrowRight, Target } from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import { generateRecommendations } from '../lib/api'
import { DEMO_EMISSION_RESULTS, DEMO_LABEL, formatCO2, formatINR, CHART_COLORS, SEVERITY_COLORS } from '../lib/demo'

export default function Dashboard() {
  const { emissionResults, recommendations, setRecommendations, processData, isDemo, actionPlanItems } = useAppState()
  const navigate = useNavigate()
  const results = emissionResults ?? DEMO_EMISSION_RESULTS

  useEffect(() => {
    if (recommendations.length === 0 && results) {
      const materials = processData?.materials.map(m => m.name) ?? ['Aluminium', 'Steel']
      const wasteMethods = processData?.waste.map(w => w.disposal_method) ?? ['Landfill']
      generateRecommendations({
        emission_results: results,
        industry: processData?.industry ?? 'Manufacturing',
        materials,
        waste_disposal_methods: wasteMethods,
        rejected_pct: processData?.production?.[0]?.rejected_units
          ? (processData.production[0].rejected_units / processData.production[0].quantity) * 100
          : 2.5,
      }).then(r => setRecommendations(r.recommendations)).catch(() => {})
    }
  }, [])

  const totalWaste = processData?.waste.reduce((s, w) => s + w.quantity, 0) ?? 500
  const potentialReduction = recommendations.reduce((s, r) => s + r.estimated_co2_reduction_tonnes, 0)
  const annualSaving = recommendations.reduce((s, r) => s + r.annual_saving_inr, 0)

  // Completed plan items reduce the total
  const completedReduction = actionPlanItems
    .filter(i => i.status === 'Completed')
    .reduce((s, i) => s + i.expected_co2_reduction_tonnes, 0)

  const pieData = results.sources.map(s => ({ name: s.category, value: s.percentage, tonnes: s.co2e_tonnes }))

  const barData = results.sources.map(s => ({
    category: s.category,
    'CO₂e (tonnes)': s.co2e_tonnes,
    fill: SEVERITY_COLORS[s.severity ?? 'Low'],
  }))

  const kpis = [
    { label: 'Total CO₂e / month', value: formatCO2(results.total_co2e_tonnes - completedReduction), icon: Flame, color: '#E5484D', change: completedReduction > 0 ? `-${formatCO2(completedReduction)} from completed actions` : undefined },
    { label: 'CO₂e per unit', value: `${(results.co2e_per_unit * 1000).toFixed(2)} kgCO₂e`, icon: LayoutDashboard, color: 'var(--color-loop)' },
    { label: 'Total waste / month', value: `${totalWaste.toLocaleString()} kg`, icon: Leaf, color: '#F2A93C' },
    { label: 'Potential CO₂ reduction', value: formatCO2(potentialReduction), icon: TrendingDown, color: '#2BB673' },
    { label: 'Est. annual savings', value: formatINR(annualSaving), icon: DollarSign, color: '#6366F1' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDemo && <span className="demo-label">🔬 {DEMO_LABEL}</span>}
            {!emissionResults && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Showing demo data — <Link to="/process-data" style={{ color: 'var(--color-loop)' }}>enter your own data</Link></span>}
          </div>
        </div>
        <Link to="/process-data" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
          Recalculate <ArrowRight size={14} />
        </Link>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="kpi-label" style={{ marginTop: 0 }}>{k.label}</span>
              <div style={{ width: '32px', height: '32px', background: `${k.color}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={16} color={k.color} />
              </div>
            </div>
            <div className="kpi-value">{k.value}</div>
            {k.change && <div className="kpi-change" style={{ color: 'var(--color-hotspot-low)' }}>✓ {k.change}</div>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '24px' }}>
        {/* Donut */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Emission distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, n: any, p: any) => [`${v}% (${p.payload.tonnes?.toFixed(2)} t)`, n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Emission sources — monthly (tCO₂e)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => [`${Number(v).toFixed(3)} tCO₂e`]} />
              <Bar dataKey="CO₂e (tonnes)" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current vs Potential + Top recs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Current vs Potential */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px' }}>Current vs potential footprint</h3>
          {results.sources.map((s, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.83rem' }}>
                <span style={{ fontWeight: 600 }}>{s.category}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{s.co2e_tonnes.toFixed(2)} t → {(s.co2e_tonnes * 0.72).toFixed(2)} t (est.)</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${s.percentage}%`, background: CHART_COLORS[i] }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', width: '36px', textAlign: 'right' }}>{s.percentage}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top recommendations */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Top recommendations</h3>
            <Link to="/recommendations" style={{ color: 'var(--color-loop)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {recommendations.slice(0, 3).map((r, i) => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px',
              background: 'var(--color-bg)', borderRadius: '8px', marginBottom: '8px',
            }}>
              <div style={{
                width: '28px', height: '28px', background: 'var(--color-loop-light)',
                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-loop)',
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  -{r.estimated_co2_reduction_pct}% CO₂ · {formatINR(r.annual_saving_inr)}/yr saving
                </div>
              </div>
              <AlertCircle size={14} style={{ flexShrink: 0, color: SEVERITY_COLORS[i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low'] }} />
            </div>
          ))}
          {recommendations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <Link to="/process-data" style={{ color: 'var(--color-loop)' }}>Enter process data</Link> to generate recommendations.
            </div>
          )}
        </div>
      </div>

      {/* Target progress (if action plan has items) */}
      {actionPlanItems.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Target size={18} color="var(--color-loop)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Action plan progress</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{
                width: `${Math.min(100, (completedReduction / results.total_co2e_tonnes) * 100)}%`
              }} />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--color-loop)', whiteSpace: 'nowrap' }}>
              {formatCO2(completedReduction)} reduced ({actionPlanItems.filter(i => i.status === 'Completed').length}/{actionPlanItems.length} actions)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
