import { useNavigate } from 'react-router-dom'
import { RefreshCw, ArrowRight, Flame, Lightbulb, Sliders, Target, BarChart3, CheckCircle2 } from 'lucide-react'
import { useAppState } from '../hooks/useAppState'

const FLOW_STEPS = [
  { icon: BarChart3, label: 'Industrial process', desc: 'Enter your energy, materials, waste and production data', color: '#6366F1' },
  { icon: Flame, label: 'Emission hotspots', desc: 'Instantly see where your biggest CO₂ sources come from', color: '#E5484D' },
  { icon: Lightbulb, label: 'Circular alternatives', desc: 'Get ranked intervention recommendations with cost/saving estimates', color: '#F2A93C' },
  { icon: Sliders, label: 'What-if simulation', desc: 'Drag sliders and watch projected CO₂ and savings update live', color: '#00B8A9' },
  { icon: Target, label: 'Optimized action plan', desc: 'Find the cheapest combination that hits your reduction target within budget', color: '#2BB673' },
]

const FEATURES = [
  { title: 'Deterministic calculation engine', desc: 'Emissions are always computed from activity × emission factor. No AI guessing.' },
  { title: 'Hotspot ranking', desc: 'Donut chart, process flow diagram, and severity cards showing exactly which process stage drives your footprint.' },
  { title: 'Greedy carbon optimizer', desc: 'Enter a target % and budget. Get the lowest-cost intervention mix that hits it — or the closest feasible option.' },
  { title: 'What-if simulator', desc: 'Animated slider UI to explore recycled material, waste recovery, renewables, and process efficiency trade-offs.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { loadDemoData } = useAppState()

  const handleExploreDemo = () => {
    loadDemoData()
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ink)', color: 'white' }}>
      {/* Navbar */}
      <nav style={{
        padding: '20px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        background: 'var(--color-ink)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', background: 'var(--color-loop)',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '1.2rem' }}>EcoLoop</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}
            style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
            Sign in
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Start assessment
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '96px 48px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '64px',
        alignItems: 'center',
      }}>
        <div className="animate-slide-up">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,184,169,0.12)', border: '1px solid rgba(0,184,169,0.25)',
            borderRadius: '9999px', padding: '6px 14px',
            color: 'var(--color-loop)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '24px',
          }}>
            <RefreshCw size={12} />
            Circular economy analytics for manufacturers
          </div>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans', fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            fontWeight: 800, lineHeight: 1.1, marginBottom: '20px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Turn Industrial Emissions Into Action.
          </h1>
          <p style={{
            fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '36px',
          }}>
            Detect your biggest emission hotspots, discover circular alternatives, simulate their impact,
            and find the lowest-cost path to your CO₂ reduction target.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/register')}
              style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Start assessment <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={handleExploreDemo}
              style={{ padding: '14px 28px', fontSize: '1rem', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
              Explore demo
            </button>
          </div>
        </div>

        {/* 5-stage flow visual */}
        <div style={{ position: 'relative' }}>
          {FLOW_STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: i < 4 ? '0' : '0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: `${step.color}20`,
                  border: `1px solid ${step.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <step.icon size={20} color={step.color} />
                </div>
                {i < 4 && (
                  <div style={{
                    width: '2px', height: '28px', background: 'rgba(255,255,255,0.1)',
                    margin: '4px 0',
                  }} />
                )}
              </div>
              <div style={{ paddingTop: '8px', paddingBottom: i < 4 ? '0' : '0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: step.color }}>{step.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        padding: '80px 48px',
        background: 'rgba(255,255,255,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans', fontSize: '2rem', fontWeight: 800,
            textAlign: 'center', marginBottom: '12px', color: 'white',
          }}>
            How it works
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: '56px', maxWidth: '560px', margin: '0 auto 56px' }}>
            EcoLoop's differentiator is the connected chain from raw data to optimal intervention plan — not sustainability platitudes, but specific numbers.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '24px',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,184,169,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                <div style={{
                  width: '32px', height: '32px', background: 'rgba(0,184,169,0.15)',
                  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '12px',
                }}>
                  <CheckCircle2 size={16} color="var(--color-loop)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: 'white' }}>{f.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Ready to find your cheapest path to net zero?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', lineHeight: 1.7 }}>
            Start a free assessment in under 5 minutes. No credit card required.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/register')}
            style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
            Start free assessment <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={14} color="var(--color-loop)" />
          <span>EcoLoop</span>
        </div>
        <span>Emission data is demo reference data — not verified regional factors.</span>
      </footer>
    </div>
  )
}
