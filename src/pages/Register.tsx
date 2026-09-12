import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Building2, Briefcase, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import EchoDecLogo from '../components/EchoDecLogo'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [industryRole, setIndustryRole] = useState('factory_operator')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password) {
      showError('Please fill in all required fields.')
      return
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { error, data } = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      companyName: companyName.trim(),
      industryRole,
    })

    setLoading(false)

    if (error) {
      showError(error.message || 'Registration failed. Please try again.')
    } else {
      setSuccess(true)
      showSuccess('Registration successful! Welcome to EchoDec.')
      const hasSession = !!data?.session
      setTimeout(() => {
        navigate(hasSession ? '/dashboard' : '/login')
      }, 1500)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', padding: '24px',
      }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px', background: '#D1FAE5', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <CheckCircle2 size={28} color="#2BB673" />
          </div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            Account Created!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
            Welcome to EchoDec. Setting up your workspace...
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-loop)', fontSize: '0.875rem' }}>
            <Loader2 size={16} className="animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: '32px 24px',
    }}>
      <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '460px', padding: '40px' }}>
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
          Create your account
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '28px' }}>
          Start tracking textile emissions &amp; circular interventions
        </p>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="reg-name">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="reg-name"
                className="input"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{ paddingLeft: '38px' }}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Company Name */}
          <div style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="reg-company">Company / Mill Name</label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="reg-company"
                className="input"
                type="text"
                placeholder="Apex Textile Processors"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                style={{ paddingLeft: '38px' }}
                autoComplete="organization"
              />
            </div>
          </div>

          {/* Industry Role */}
          <div style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="reg-role">Industry Role</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', zIndex: 1 }} />
              <select
                id="reg-role"
                className="input"
                value={industryRole}
                onChange={e => setIndustryRole(e.target.value)}
                style={{ paddingLeft: '38px', cursor: 'pointer' }}
              >
                <option value="factory_operator">Factory Operator</option>
                <option value="sustainability_manager">Sustainability Manager</option>
                <option value="plant_engineer">Plant / Process Engineer</option>
                <option value="compliance_officer">Environmental Compliance Officer</option>
                <option value="executive">Executive / Business Owner</option>
              </select>
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="reg-email">Work Email *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="reg-email"
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

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label className="label" htmlFor="reg-password">Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="reg-password"
                className="input"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button
            id="reg-submit"
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating account...</span>
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-loop)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
