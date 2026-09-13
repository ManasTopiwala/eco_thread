import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import {
  LayoutDashboard, TrendingDown, Leaf, DollarSign, Flame,
  AlertCircle, ArrowRight, Target, Loader2, BarChart3, Building2
} from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import { generateRecommendations } from '../lib/api'
import { DEMO_EMISSION_RESULTS, DEMO_PROCESS_DATA, DEMO_PROFILE, DEMO_LABEL, formatCO2, formatINR, CHART_COLORS, SEVERITY_COLORS } from '../lib/demo'

export default function Dashboard() {
  const {
    emissionResults, recommendations, saveRecommendationsData,
    processData, isDemo, loadingData, loadDemoData, industryProfile
  } = useAppState()
  const navigate = useNavigate()

  // Only use DEMO_EMISSION_RESULTS if user explicitly toggled demo mode
  const results = isDemo ? (emissionResults ?? DEMO_EMISSION_RESULTS) : emissionResults

  useEffect(() => {
    if (results && recommendations.length === 0) {
      generateRecommendations({
        emission_results: results,
        process_data: isDemo ? DEMO_PROCESS_DATA : processData,
        industry_profile: isDemo ? (DEMO_PROFILE as any) : industryProfile,
        industry: processData?.industry ?? industryProfile?.industry_type ?? 'Manufacturing',
      }).then(r => {
        if (r?.recommendations?.length) {
          saveRecommendationsData(r.recommendations)
        }
      }).catch(() => {})
    }
  }, [recommendations.length, results, processData, industryProfile, isDemo])

  if (loadingData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" color="var(--color-loop)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Loading facility data from Supabase...</p>
        </div>
      </div>
    )
  }

  // When there is no assessment data in the database
  if (!results) {
    return (
      <div className="animate-fade-in">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Facility greenhouse gas metrics, leak points, and decarbonization roadmap.
          </p>
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
          }}>
            <BarChart3 size={32} color="var(--color-loop)" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px', color: 'var(--color-ink)' }}>
            No Carbon Assessment Found
          </h2>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '28px' }}>
            You haven't calculated any facility emissions yet. Setup your Industry Profile and enter your monthly process data to generate your real-time carbon footprint dashboard.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/industry-profile" className="btn btn-primary" style={{ padding: '12px 22px', fontSize: '0.9rem' }}>
              <Building2 size={16} /> Setup Industry Profile
            </Link>
            <Link to="/process-data" className="btn btn-secondary" style={{ padding: '12px 22px', fontSize: '0.9rem' }}>
              Enter Process Data <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={loadDemoData}
              style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}
            >
              Or preview with sample demo data
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalWaste = processData?.waste?.reduce((s, w) => s + (w.unit === 'tonne' ? Number(w.quantity) * 1000 : Number(w.quantity) || 0), 0) ?? 0
  const potentialReduction = recommendations.reduce((s, r) => s + r.estimated_co2_reduction_tonnes, 0)
  const annualSaving = recommendations.reduce((s, r) => s + r.annual_saving_inr, 0)

  const pieData = results.sources.map(s => ({ name: s.category, value: s.percentage, tonnes: s.co2e_tonnes }))

  const barData = results.sources.map(s => ({
    category: s.category,
    'CO₂e (tonnes)': s.co2e_tonnes,
    fill: SEVERITY_COLORS[s.severity ?? 'Low'],
  }))

  const kpis = [
    { label: 'Total CO₂e / month', value: formatCO2(results.total_co2e_tonnes), icon: Flame, color: '#E5484D' },
    {
      label: 'CO₂e per unit',
      value: results.co2e_per_unit > 0
        ? `${(results.co2e_per_unit * 1000).toFixed(2)} kgCO₂e`
        : 'N/A (No output units)',
      icon: LayoutDashboard,
      color: 'var(--color-loop)'
    },
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
            {emissionResults && !isDemo && (
              <span style={{ color: '#2BB673', fontSize: '0.85rem', fontWeight: 600 }}>
                ● Live Supabase Assessment
              </span>
            )}
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

    </div>
  )
}
