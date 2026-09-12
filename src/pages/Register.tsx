import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RefreshCw, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    const { error } = await signUp(email, password, name)
    setLoading(false)
    if (error) { setError(error.message || 'Registration failed. Please try again.') }
    else {
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', padding: '24px',
      }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px', background: '#D1FAE5', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <CheckCircle2 size={28} color="#2BB673" />
          </div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            Account created!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: '24px',
    }}>
      <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', background: 'var(--color-loop)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={24} color="white" />
          </div>
        </div>
        <h1 style={{ textAlign: 'center', fontFamily: 'Plus Jakarta Sans', fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
          Start your assessment
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '32px' }}>
          Create your EcoLoop account — free, no credit card.
        </p>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px',
            background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px',
            color: '#B91C1C', fontSize: '0.875rem', marginBottom: '20px',
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="label">Full name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input id="reg-name" className="input" type="text" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: '38px' }} autoComplete="name" />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label className="label">Work email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input id="reg-email" className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '38px' }} autoComplete="email" />
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input id="reg-password" className="input" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: '38px' }} autoComplete="new-password" />
            </div>
          </div>
          <button id="reg-submit" className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-loop)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
