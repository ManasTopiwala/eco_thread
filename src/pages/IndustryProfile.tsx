import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Pencil, Save, Loader2, MapPin, Users,
  Clock, Layers, ShieldCheck, ArrowRight, LayoutDashboard, X,
  CheckCircle2, AlertCircle, Calendar
} from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import { useAuth } from '../hooks/useAuth'
import type { IndustryProfile as IProfile } from '../types'

const INDUSTRY_TYPES = [
  'Manufacturing', 'Food Processing', 'Textile', 'Chemical', 'Metal',
  'Plastic', 'Automotive', 'Electronics', 'Packaging', 'Other',
]

const SIZES = ['Micro (< 10)', 'Small (10–50)', 'Medium (50–250)', 'Large (> 250)']

interface FormState {
  company_name: string
  industry_type: string
  size: string
  location: string
  production_type: string
  production_capacity: string | number
  production_unit: string
  employees: string | number
  operating_hours_day: string | number
  operating_days_month: string | number
}

// MUST be outside the parent component so React does not unmount/remount inputs on every keystroke
function FormField({ label, id, error, children }: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p style={{ color: 'var(--color-hotspot-high)', fontSize: '0.78rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={13} /> {error}
        </p>
      )}
    </div>
  )
}

function toFormState(p: IProfile | null, defaultCompany = ''): FormState {
  return {
    company_name: p?.company_name || defaultCompany || '',
    industry_type: p?.industry_type || 'Manufacturing',
    size: p?.size || 'Medium',
    location: p?.location || '',
    production_type: p?.production_type || '',
    production_capacity: p?.production_capacity != null && p?.production_capacity !== 0 ? p.production_capacity : '',
    production_unit: p?.production_unit || 'units',
    employees: p?.employees != null && p?.employees !== 0 ? p.employees : '',
    operating_hours_day: p?.operating_hours_day != null && p?.operating_hours_day !== 0 ? p.operating_hours_day : '',
    operating_days_month: p?.operating_days_month != null && p?.operating_days_month !== 0 ? p.operating_days_month : '',
  }
}

export default function IndustryProfile() {
  const { user, profile } = useAuth()
  const { industryProfile, saveIndustryProfileData, loadingData } = useAppState()

  const defaultCompany = profile?.company_name || user?.user_metadata?.company_name || ''
  const hasExistingProfile = Boolean(industryProfile?.company_name?.trim())
  const [isEditing, setIsEditing] = useState<boolean>(!hasExistingProfile)
  const [form, setForm] = useState<FormState>(() => toFormState(industryProfile, defaultCompany))
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sync form when database profile finishes initial loading, only if NOT editing
  useEffect(() => {
    if (industryProfile?.company_name) {
      if (!isEditing) {
        setForm(toFormState(industryProfile, defaultCompany))
      }
    } else if (defaultCompany && !form.company_name) {
      setForm(f => ({ ...f, company_name: defaultCompany }))
    }
  }, [industryProfile, isEditing, defaultCompany])

  const update = (field: keyof FormState, value: any) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) {
      setErrors(e => {
        const next = { ...e }
        delete next[field]
        return next
      })
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!String(form.company_name).trim()) e.company_name = 'Company name is required.'
    if (!String(form.location).trim()) e.location = 'Location is required.'

    const cap = parseFloat(String(form.production_capacity))
    if (isNaN(cap) || cap < 0) e.production_capacity = 'Must be a valid number ≥ 0.'

    const emp = parseInt(String(form.employees))
    if (isNaN(emp) || emp < 0) e.employees = 'Must be a valid number ≥ 0.'

    const hrs = parseFloat(String(form.operating_hours_day))
    if (isNaN(hrs) || hrs <= 0 || hrs > 24) e.operating_hours_day = 'Must be between 1 and 24.'

    const days = parseFloat(String(form.operating_days_month))
    if (isNaN(days) || days <= 0 || days > 31) e.operating_days_month = 'Must be between 1 and 31.'

    return e
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setSaving(true)
    const sanitizedProfile: IProfile = {
      company_name: String(form.company_name).trim(),
      industry_type: form.industry_type,
      size: form.size,
      location: String(form.location).trim(),
      production_type: String(form.production_type).trim(),
      production_capacity: parseFloat(String(form.production_capacity)) || 0,
      production_unit: String(form.production_unit).trim() || 'units',
      employees: parseInt(String(form.employees)) || 0,
      operating_hours_day: parseFloat(String(form.operating_hours_day)) || 8,
      operating_days_month: parseFloat(String(form.operating_days_month)) || 25,
    }

    try {
      await saveIndustryProfileData(sanitizedProfile)
      setSavedSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch (err: any) {
      setErrors({ company_name: err?.message || 'Failed to save profile to database.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(toFormState(industryProfile, defaultCompany))
    setErrors({})
    if (hasExistingProfile) {
      setIsEditing(false)
    }
  }

  if (loadingData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" color="var(--color-loop)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Loading facility profile from Supabase...</p>
        </div>
      </div>
    )
  }

  // Derived metrics for display mode
  const currentProfile = industryProfile || (hasExistingProfile ? (form as any as IProfile) : null)
  const monthlyOperatingHours = currentProfile
    ? currentProfile.operating_hours_day * currentProfile.operating_days_month
    : 0

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div className="loop-icon">
              <Building2 size={18} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Industry Profile</h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Configure and manage facility parameters, production capacity, and baseline operating schedules.
          </p>
        </div>

        {/* Edit toggle button when in View Mode */}
        {!isEditing && hasExistingProfile && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEditing(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.9rem' }}
          >
            <Pencil size={15} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          background: '#DCFCE7',
          border: '1px solid #BBF7D0',
          borderRadius: '10px',
          color: '#15803D',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <CheckCircle2 size={18} color="#16A34A" />
          <span>Industry profile successfully saved to Supabase database!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW / DISPLAY MODE */}
      {/* ========================================================================= */}
      {!isEditing && currentProfile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Facility Overview Card */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-ink)' }}>
                    {currentProfile.company_name}
                  </h2>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'rgba(0, 184, 169, 0.12)',
                    color: 'var(--color-loop-dark)',
                    border: '1px solid rgba(0, 184, 169, 0.25)',
                  }}>
                    {currentProfile.industry_type}
                  </span>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: '#F1F5F9',
                    color: '#475569',
                  }}>
                    {currentProfile.size}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={15} color="var(--color-loop)" />
                    <span>{currentProfile.location}</span>
                  </div>
                  {currentProfile.production_type && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Layers size={15} color="var(--color-text-muted)" />
                      <span>{currentProfile.production_type}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <Pencil size={14} /> Edit
                </button>
              </div>
            </div>

            {/* Operational Metrics Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border)',
            }}>
              {/* Monthly Production Capacity */}
              <div style={{
                background: 'var(--color-bg)',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
                  <Layers size={14} color="var(--color-loop)" /> Monthly Capacity
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                  {Number(currentProfile.production_capacity).toLocaleString()}{' '}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    {currentProfile.production_unit}
                  </span>
                </div>
              </div>

              {/* Workforce */}
              <div style={{
                background: 'var(--color-bg)',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
                  <Users size={14} color="#6366F1" /> Total Workforce
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                  {currentProfile.employees}{' '}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    employees
                  </span>
                </div>
              </div>

              {/* Daily Operating Hours */}
              <div style={{
                background: 'var(--color-bg)',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
                  <Clock size={14} color="#F2A93C" /> Operating Shift
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                  {currentProfile.operating_hours_day} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>hrs/day</span>
                </div>
              </div>

              {/* Monthly Operating Schedule */}
              <div style={{
                background: 'var(--color-bg)',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
                  <Calendar size={14} color="#2BB673" /> Schedule & Hours
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                  {monthlyOperatingHours} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>hrs/mo</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {currentProfile.operating_days_month} days / month
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Standards Card */}
          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(43, 182, 115, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShieldCheck size={24} color="#2BB673" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', fontWeight: 700 }}>
                  Decarbonization Baseline Active
                </h4>
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                  Calibrated to India CEA National Grid Factor (0.82 kg/kWh) & CPCB industrial norms for {currentProfile.industry_type}.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/process-data" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                Enter Process Data <ArrowRight size={15} />
              </Link>
              <Link to="/dashboard" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* EDIT / SETUP MODE */
        /* ========================================================================= */
        <div className="card" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                {hasExistingProfile ? 'Edit Industry Profile' : 'Setup Facility Profile'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Fill in the facility parameters below to configure emissions benchmarks.
              </p>
            </div>

            {hasExistingProfile && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancel}
                style={{ padding: '6px 12px', fontSize: '0.825rem' }}
              >
                <X size={15} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <FormField label="Company name" id="ip-company" error={errors.company_name}>
                <input
                  id="ip-company"
                  className="input"
                  value={form.company_name}
                  onChange={e => update('company_name', e.target.value)}
                  placeholder="e.g. Apex Textile Processors Ltd."
                />
              </FormField>

              <FormField label="Industry sector" id="ip-industry" error={errors.industry_type}>
                <select
                  id="ip-industry"
                  className="input select"
                  value={form.industry_type}
                  onChange={e => update('industry_type', e.target.value)}
                >
                  {INDUSTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>

              <FormField label="Company size (employees)" id="ip-size" error={errors.size}>
                <select
                  id="ip-size"
                  className="input select"
                  value={form.size}
                  onChange={e => update('size', e.target.value)}
                >
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>

              <FormField label="Facility location (City, State)" id="ip-location" error={errors.location}>
                <input
                  id="ip-location"
                  className="input"
                  value={form.location}
                  onChange={e => update('location', e.target.value)}
                  placeholder="e.g. Surat, Gujarat"
                />
              </FormField>

              <FormField label="Primary production process" id="ip-prodtype" error={errors.production_type}>
                <input
                  id="ip-prodtype"
                  className="input"
                  value={form.production_type}
                  onChange={e => update('production_type', e.target.value)}
                  placeholder="e.g. Reactive Cotton Dyeing or CNC Machining"
                />
              </FormField>

              <FormField label="Monthly production capacity" id="ip-capacity" error={errors.production_capacity}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="ip-capacity"
                    className="input"
                    type="number"
                    min={0}
                    value={form.production_capacity === '' ? '' : form.production_capacity}
                    onChange={e => update('production_capacity', e.target.value)}
                    placeholder="e.g. 15000"
                    style={{ flex: 1 }}
                  />
                  <input
                    className="input"
                    value={form.production_unit}
                    onChange={e => update('production_unit', e.target.value)}
                    placeholder="unit (e.g. meters, kg, units)"
                    style={{ width: '130px' }}
                  />
                </div>
              </FormField>

              <FormField label="Total employees on site" id="ip-employees" error={errors.employees}>
                <input
                  id="ip-employees"
                  className="input"
                  type="number"
                  min={0}
                  value={form.employees === '' ? '' : form.employees}
                  onChange={e => update('employees', e.target.value)}
                  placeholder="e.g. 120"
                />
              </FormField>

              <FormField label="Operating hours / day (1–24)" id="ip-hours" error={errors.operating_hours_day}>
                <input
                  id="ip-hours"
                  className="input"
                  type="number"
                  min={1}
                  max={24}
                  step={0.5}
                  value={form.operating_hours_day === '' ? '' : form.operating_hours_day}
                  onChange={e => update('operating_hours_day', e.target.value)}
                  placeholder="8"
                />
              </FormField>

              <FormField label="Operating days / month (1–31)" id="ip-days" error={errors.operating_days_month}>
                <input
                  id="ip-days"
                  className="input"
                  type="number"
                  min={1}
                  max={31}
                  value={form.operating_days_month === '' ? '' : form.operating_days_month}
                  onChange={e => update('operating_days_month', e.target.value)}
                  placeholder="25"
                />
              </FormField>
            </div>

            {/* Form Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border)',
            }}>
              {hasExistingProfile && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving to Database...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
