import { ReactNode, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Flame, Lightbulb, Sliders, Target, ClipboardList,
  Building2, Database, RefreshCw, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAppState } from '../hooks/useAppState'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hotspots', icon: Flame, label: 'Hotspots' },
  { to: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  { to: '/simulator', icon: Sliders, label: 'Simulator' },
  { to: '/optimizer', icon: Target, label: 'Optimizer' },
  { to: '/action-plan', icon: ClipboardList, label: 'Action Plan' },
]

const DATA_ITEMS = [
  { to: '/industry-profile', icon: Building2, label: 'Industry profile' },
  { to: '/process-data', icon: Database, label: 'Process data' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut, user } = useAuth()
  const { isDemo, emissionResults } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isLoopPage = ['/hotspots', '/recommendations', '/simulator', '/optimizer'].includes(location.pathname)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '60px',
        background: 'var(--color-ink)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        overflow: 'hidden',
      }}>
        {/* Logo area */}
        <div style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          minHeight: '64px',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: 'var(--color-loop)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <RefreshCw size={16} color="white" />
          </div>
          {sidebarOpen && (
            <span style={{
              color: 'white',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 800,
              fontSize: '1.1rem',
              whiteSpace: 'nowrap',
            }}>
              EcoLoop
            </span>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: '20px',
            right: sidebarOpen ? '12px' : '16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '6px',
            padding: '4px',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
          }}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Nav */}
        <nav style={{ padding: '12px 0', flex: 1, overflowY: 'auto' }}>
          {sidebarOpen && (
            <div style={{ padding: '4px 16px 8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Analysis
            </div>
          )}
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                color: isActive ? 'var(--color-loop)' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? 'rgba(0,184,169,0.1)' : 'transparent',
                borderRight: isActive ? '3px solid var(--color-loop)' : '3px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              })}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && item.label}
            </NavLink>
          ))}

          {sidebarOpen && (
            <div style={{ padding: '12px 16px 8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '8px' }}>
              Data entry
            </div>
          )}
          {DATA_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                color: isActive ? 'var(--color-loop)' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? 'rgba(0,184,169,0.1)' : 'transparent',
                borderRight: isActive ? '3px solid var(--color-loop)' : '3px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              })}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User area */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {sidebarOpen && user && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          )}
          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              padding: '4px 0',
              whiteSpace: 'nowrap',
            }}
          >
            <LogOut size={16} />
            {sidebarOpen && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{
        marginLeft: sidebarOpen ? '240px' : '60px',
        flex: 1,
        transition: 'margin-left 0.25s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top header */}
        <header style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 32px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDemo && (
              <span className="demo-label">
                🔬 Demo data — ABC Precision Manufacturing
              </span>
            )}
          </div>

          {isLoopPage && emissionResults && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-loop)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              <RefreshCw size={14} />
              <span>Total CO₂e: {emissionResults.total_co2e_tonnes.toFixed(1)} tCO₂e/month</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NavLink to="/process-data" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                Update data <ChevronRight size={14} />
              </button>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
