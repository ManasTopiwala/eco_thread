import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import EchoDecLogo from '../components/EchoDecLogo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      showError('Please fill in all fields.')
      return
    }
    setLoading(true)

    const { error } = await signIn(email.trim(), password)
    setLoading(false)

    if (error) {
      showError(error.message || 'Invalid email or password.')
    } else {
      showSuccess('Login successful! Welcome back.')
      navigate('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: '24px',
    }}>
      <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <EchoDecLogo
            size={52}
            style={{
              borderRadius: '14px',
              boxShadow: '0 8px 20px rgba(0, 184, 169, 0.28)',
            }}
          />
        </div>

        <h1 style={{ textAlign: 'center', fontFamily: 'Plus Jakarta Sans', fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
          Welcome back
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '28px' }}>
          Sign in to your EchoDec account
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="login-email">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="login-email"
                className="input"
                type="email"
                placeholder="testuser@textile.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="login-password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            id="login-submit"
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-loop)', fontWeight: 600, textDecoration: 'none' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
