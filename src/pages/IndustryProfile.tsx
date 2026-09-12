import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Save, ChevronRight } from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import type { IndustryProfile as IProfile } from '../types'

const INDUSTRY_TYPES = [
  'Manufacturing', 'Food Processing', 'Textile', 'Chemical', 'Metal',
  'Plastic', 'Automotive', 'Electronics', 'Packaging', 'Other',
]

const SIZES = ['Micro (< 10)', 'Small (10–50)', 'Medium (50–250)', 'Large (> 250)']

export default function IndustryProfile() {
  const { industryProfile, setIndustryProfile } = useAppState()
  const navigate = useNavigate()

  const [form, setForm] = useState<IProfile>(industryProfile ?? {
    company_name: '',
    industry_type: 'Manufacturing',
    size: 'Medium',
    location: '',
    production_type: '',
    production_capacity: 0,
    production_unit: 'units',
    employees: 0,
    operating_hours_day: 8,
    operating_days_month: 25,
  })

  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (field: keyof IProfile, value: any) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.company_name.trim()) e.company_name = 'Company name is required.'
    if (!form.location.trim()) e.location = 'Location is required.'
    if (form.production_capacity < 0) e.production_capacity = 'Must be ≥ 0.'
    if (form.employees < 0) e.employees = 'Must be ≥ 0.'
    if (form.operating_hours_day <= 0 || form.operating_hours_day > 24) e.operating_hours_day = 'Must be 1–24.'
    if (form.operating_days_month <= 0 || form.operating_days_month > 31) e.operating_days_month = 'Must be 1–31.'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setIndustryProfile(form)
    setSaved(true)
    setTimeout(() => navigate('/process-data'), 1000)
  }

  const Field = ({ label, id, error, children }: any) => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      {error && <p style={{ color: 'var(--color-hotspot-high)', fontSize: '0.78rem', marginTop: '4px' }}>{error}</p>}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div className="loop-icon"><Building2 size={16} /></div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Industry profile</h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Tell us about your facility. This helps us apply the right emission factors and intervention benchmarks.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '720px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Field label="Company name" id="ip-company" error={errors.company_name}>
            <input id="ip-company" className="input" value={form.company_name}
              onChange={e => update('company_name', e.target.value)} placeholder="ABC Manufacturing Ltd." />
          </Field>

          <Field label="Industry type" id="ip-industry" error={errors.industry_type}>
            <select id="ip-industry" className="input select" value={form.industry_type}
              onChange={e => update('industry_type', e.target.value)}>
              {INDUSTRY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Company size (employees)" id="ip-size" error={errors.size}>
            <select id="ip-size" className="input select" value={form.size}
              onChange={e => update('size', e.target.value)}>
              {SIZES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Location" id="ip-location" error={errors.location}>
            <input id="ip-location" className="input" value={form.location}
              onChange={e => update('location', e.target.value)} placeholder="City, State" />
          </Field>

          <Field label="Production type" id="ip-prodtype" error={errors.production_type}>
            <input id="ip-prodtype" className="input" value={form.production_type}
              onChange={e => update('production_type', e.target.value)} placeholder="e.g. Precision metal components" />
          </Field>

          <Field label="Monthly production capacity" id="ip-capacity" error={errors.production_capacity}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input id="ip-capacity" className="input" type="number" min={0} value={form.production_capacity}
                onChange={e => update('production_capacity', parseFloat(e.target.value) || 0)} style={{ flex: 1 }} />
              <input className="input" value={form.production_unit} onChange={e => update('production_unit', e.target.value)}
                placeholder="units" style={{ width: '90px' }} />
            </div>
          </Field>

          <Field label="Employees" id="ip-employees" error={errors.employees}>
            <input id="ip-employees" className="input" type="number" min={0} value={form.employees}
              onChange={e => update('employees', parseInt(e.target.value) || 0)} />
          </Field>

          <Field label="Operating hours / day" id="ip-hours" error={errors.operating_hours_day}>
            <input id="ip-hours" className="input" type="number" min={1} max={24} value={form.operating_hours_day}
              onChange={e => update('operating_hours_day', parseFloat(e.target.value) || 8)} />
          </Field>

          <Field label="Operating days / month" id="ip-days" error={errors.operating_days_month}>
            <input id="ip-days" className="input" type="number" min={1} max={31} value={form.operating_days_month}
              onChange={e => update('operating_days_month', parseFloat(e.target.value) || 25)} />
          </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          {saved && (
            <span style={{ color: 'var(--color-hotspot-low)', fontSize: '0.875rem', alignSelf: 'center', fontWeight: 600 }}>
              ✓ Saved
            </span>
          )}
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} />
            Save and continue
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
