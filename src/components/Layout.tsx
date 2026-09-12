import { ReactNode, useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Flame, Lightbulb, Sliders, Target, ClipboardList,
  Building2, Database, RefreshCw, LogOut, ChevronRight, ChevronLeft, Menu
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAppState } from '../hooks/useAppState'
import EchoDecLogo from './EchoDecLogo'

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
        width: sidebarOpen ? '240px' : '64px',
        background: 'var(--color-ink)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        overflow: 'hidden',
        boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
      }}>
        {/* Logo area - ALWAYS navigates to /dashboard */}
        <div style={{
          padding: sidebarOpen ? '0 14px 0 16px' : '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          height: '64px',
          minHeight: '64px',
        }}>
          <Link
            to="/dashboard"
            title="Go to Dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <EchoDecLogo
              size={36}
              style={{
                borderRadius: '9px',
                boxShadow: '0 4px 12px rgba(0, 184, 169, 0.35)',
                transition: 'transform 0.15s ease',
              }}
            />
            {sidebarOpen && (
              <span style={{
                color: 'white',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 800,
                fontSize: '1.15rem',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}>
                EchoDec
              </span>
            )}
          </Link>

          {/* Dedicated collapse button when sidebar is open */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              title="Collapse sidebar"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.18)'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Nav Links */}
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
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                gap: '12px',
                padding: sidebarOpen ? '10px 16px' : '10px 0',
                color: isActive ? 'var(--color-loop)' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? 'rgba(0,184,169,0.1)' : 'transparent',
                borderRight: (isActive && sidebarOpen) ? '3px solid var(--color-loop)' : '3px solid transparent',
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
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                gap: '12px',
                padding: sidebarOpen ? '10px 16px' : '10px 0',
                color: isActive ? 'var(--color-loop)' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? 'rgba(0,184,169,0.1)' : 'transparent',
                borderRight: (isActive && sidebarOpen) ? '3px solid var(--color-loop)' : '3px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              })}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Bottom Controls: Collapse toggle & User logout */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {/* Expand toggle when collapsed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              title="Expand sidebar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                padding: '8px 0',
                width: '100%',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              <ChevronRight size={18} />
            </button>
          )}

          {sidebarOpen && user && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          )}

          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '8px',
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              padding: '4px 0',
              whiteSpace: 'nowrap',
              width: '100%',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >
            <LogOut size={16} />
            {sidebarOpen && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{
        marginLeft: sidebarOpen ? '240px' : '64px',
        flex: 1,
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Collapse menu' : 'Expand menu'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                borderRadius: '6px',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                e.currentTarget.style.color = 'var(--color-ink)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              <Menu size={20} />
            </button>

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
