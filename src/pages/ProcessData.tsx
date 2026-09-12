import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Zap, Package, Factory, Recycle, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import { calculateEmissions } from '../lib/api'
import type { EnergyEntry, MaterialEntry, ProductionEntry, WasteEntry } from '../types'
import { DEMO_PROCESS_DATA, DEMO_LABEL } from '../lib/demo'

const ENERGY_SOURCES = ['Electricity', 'Coal', 'Natural Gas', 'Diesel', 'Fuel Oil', 'LPG', 'Renewable']
const ENERGY_UNITS = ['kWh', 'MWh', 'GJ', 'litre', 'L', 'kg', 'tonne', 'm3']
const MATERIAL_NAMES = ['Aluminium', 'Steel', 'Copper', 'Plastic (PET)', 'Plastic (HDPE)', 'Plastic (PP)', 'Glass', 'Paper', 'Cardboard', 'Textile (Cotton)', 'Textile (Polyester)', 'Rubber', 'Wood', 'Chemicals (generic)', 'Other']
const RECYCLED_OPTIONS = ['virgin', 'partially-recycled', 'fully-recycled'] as const
const DISPOSAL_METHODS = ['Landfill', 'Incineration', 'Recycling', 'Reuse', 'Composting', 'Waste-to-Energy', 'Internal Recovery', 'Other']

function mkEnergy(): EnergyEntry { return { source: 'Electricity', quantity: 0, unit: 'kWh', monthly_consumption: 0 } }
function mkMaterial(): MaterialEntry { return { name: 'Aluminium', category: 'Metal', quantity: 0, unit: 'kg', recycled_content: 'virgin' } }
function mkProduction(): ProductionEntry { return { quantity: 0, unit: 'units', period: 'monthly', rejected_units: 0 } }
function mkWaste(): WasteEntry { return { waste_type: '', quantity: 0, unit: 'kg', disposal_method: 'Landfill', recoverable_pct: 0 } }

export default function ProcessData() {
  const { processData, saveProcessAndAssessment, industryProfile, isDemo, loadDemoData, loadingData } = useAppState()
  const navigate = useNavigate()

  const [energy, setEnergy] = useState<EnergyEntry[]>(() =>
    processData?.energy?.length ? processData.energy : [mkEnergy()]
  )
  const [materials, setMaterials] = useState<MaterialEntry[]>(() =>
    processData?.materials?.length ? processData.materials : [mkMaterial()]
  )
  const [production, setProduction] = useState<ProductionEntry[]>(() =>
    processData?.production?.length ? processData.production : [mkProduction()]
  )
  const [waste, setWaste] = useState<WasteEntry[]>(() =>
    processData?.waste?.length ? processData.waste : [mkWaste()]
  )
  const [activeTab, setActiveTab] = useState<'energy' | 'materials' | 'production' | 'waste'>('energy')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sync state if loaded from Supabase
  useEffect(() => {
    if (processData) {
      if (processData.energy?.length) setEnergy(processData.energy)
      if (processData.materials?.length) setMaterials(processData.materials)
      if (processData.production?.length) setProduction(processData.production)
      if (processData.waste?.length) setWaste(processData.waste)
    }
  }, [processData])

  const handleCalculate = async () => {
    setLoading(true); setError('')
    try {
      const data = { energy, materials, production, waste, industry: industryProfile?.industry_type || 'Manufacturing' }
      const result = await calculateEmissions(data)
      await saveProcessAndAssessment(data, result)
      navigate('/dashboard')
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Calculation failed. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadDemo = () => {
    loadDemoData()
    setEnergy(DEMO_PROCESS_DATA.energy)
    setMaterials(DEMO_PROCESS_DATA.materials)
    setProduction(DEMO_PROCESS_DATA.production)
    setWaste(DEMO_PROCESS_DATA.waste)
  }

  const TABS = [
    { id: 'energy', label: 'Energy', icon: Zap },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'production', label: 'Production', icon: Factory },
    { id: 'waste', label: 'Waste', icon: Recycle },
  ]

  if (loadingData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" color="var(--color-loop)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Loading process data from Supabase...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>Process data</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Enter monthly consumption figures across all process stages.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleLoadDemo}>Load demo data</button>
      </div>

      <div className="card">
        {/* Tab bar */}
        <div className="tab-bar" style={{ marginBottom: '28px' }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id as any)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Energy tab */}
        {activeTab === 'energy' && (
          <div className="animate-fade-in">
            {isDemo && <span className="demo-label" style={{ marginBottom: '16px', display: 'inline-block' }}>⚠️ {DEMO_LABEL}</span>}
            {energy.map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
                <div>
                  {i === 0 && <label className="label">Source</label>}
                  <select className="input select" value={e.source} onChange={ev => setEnergy(arr => arr.map((x, j) => j === i ? { ...x, source: ev.target.value as any } : x))}>
                    {ENERGY_SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  {i === 0 && <label className="label">Monthly consumption</label>}
                  <input className="input" type="number" min={0}
                    placeholder="0"
                    value={e.monthly_consumption || e.quantity || ''}
                    onChange={ev => {
                      const v = ev.target.value === '' ? 0 : parseFloat(ev.target.value) || 0
                      setEnergy(arr => arr.map((x, j) => j === i ? { ...x, quantity: v, monthly_consumption: v } : x))
                    }} />
                </div>
                <div>
                  {i === 0 && <label className="label">Unit</label>}
                  <select className="input select" value={e.unit} onChange={ev => setEnergy(arr => arr.map((x, j) => j === i ? { ...x, unit: ev.target.value as any } : x))}>
                    {ENERGY_UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div />
                <button onClick={() => setEnergy(arr => arr.filter((_, j) => j !== i))} disabled={energy.length === 1}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '10px 6px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={() => setEnergy(arr => [...arr, mkEnergy()])}>
              <Plus size={14} /> Add energy source
            </button>
          </div>
        )}

        {/* Materials tab */}
        {activeTab === 'materials' && (
          <div className="animate-fade-in">
            {isDemo && <span className="demo-label" style={{ marginBottom: '16px', display: 'inline-block' }}>⚠️ {DEMO_LABEL}</span>}
            {materials.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr auto', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
                <div>
                  {i === 0 && <label className="label">Material</label>}
                  <select className="input select" value={m.name} onChange={ev => setMaterials(arr => arr.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))}>
                    {MATERIAL_NAMES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  {i === 0 && <label className="label">Quantity</label>}
                  <input className="input" type="number" min={0}
                    placeholder="0"
                    value={m.quantity || ''}
                    onChange={ev => {
                      const v = ev.target.value === '' ? 0 : parseFloat(ev.target.value) || 0
                      setMaterials(arr => arr.map((x, j) => j === i ? { ...x, quantity: v } : x))
                    }} />
                </div>
                <div>
                  {i === 0 && <label className="label">Unit</label>}
                  <select className="input select" value={m.unit} onChange={ev => setMaterials(arr => arr.map((x, j) => j === i ? { ...x, unit: ev.target.value as any } : x))}>
                    <option>kg</option><option>tonne</option>
                  </select>
                </div>
                <div>
                  {i === 0 && <label className="label">Recycled content</label>}
                  <select className="input select" value={m.recycled_content} onChange={ev => setMaterials(arr => arr.map((x, j) => j === i ? { ...x, recycled_content: ev.target.value as any } : x))}>
                    {RECYCLED_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button onClick={() => setMaterials(arr => arr.filter((_, j) => j !== i))} disabled={materials.length === 1}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '10px 6px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={() => setMaterials(arr => [...arr, mkMaterial()])}>
              <Plus size={14} /> Add material
            </button>
          </div>
        )}

        {/* Production tab */}
        {activeTab === 'production' && (
          <div className="animate-fade-in">
            {production.map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
                <div>
                  {i === 0 && <label className="label">Monthly output</label>}
                  <input className="input" type="number" min={0}
                    placeholder="0"
                    value={p.quantity || ''}
                    onChange={ev => {
                      const v = ev.target.value === '' ? 0 : parseFloat(ev.target.value) || 0
                      setProduction(arr => arr.map((x, j) => j === i ? { ...x, quantity: v } : x))
                    }} />
                </div>
                <div>
                  {i === 0 && <label className="label">Unit</label>}
                  <input className="input" value={p.unit}
                    placeholder="units"
                    onChange={ev => setProduction(arr => arr.map((x, j) => j === i ? { ...x, unit: ev.target.value } : x))} />
                </div>
                <div>
                  {i === 0 && <label className="label">Rejected / defective units</label>}
                  <input className="input" type="number" min={0}
                    placeholder="0"
                    value={p.rejected_units || ''}
                    onChange={ev => {
                      const v = ev.target.value === '' ? 0 : parseFloat(ev.target.value) || 0
                      setProduction(arr => arr.map((x, j) => j === i ? { ...x, rejected_units: v } : x))
                    }} />
                </div>
                <button onClick={() => setProduction(arr => arr.filter((_, j) => j !== i))} disabled={production.length === 1}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '10px 6px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={() => setProduction(arr => [...arr, mkProduction()])}>
              <Plus size={14} /> Add production line
            </button>
          </div>
        )}

        {/* Waste tab */}
        {activeTab === 'waste' && (
          <div className="animate-fade-in">
            {isDemo && <span className="demo-label" style={{ marginBottom: '16px', display: 'inline-block' }}>⚠️ {DEMO_LABEL}</span>}
            {waste.map((w, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
                <div>
                  {i === 0 && <label className="label">Waste type</label>}
                  <input className="input" value={w.waste_type} placeholder="e.g. Aluminium scrap"
                    onChange={ev => setWaste(arr => arr.map((x, j) => j === i ? { ...x, waste_type: ev.target.value } : x))} />
                </div>
                <div>
                  {i === 0 && <label className="label">Quantity</label>}
                  <input className="input" type="number" min={0}
                    placeholder="0"
                    value={w.quantity || ''}
                    onChange={ev => {
                      const v = ev.target.value === '' ? 0 : parseFloat(ev.target.value) || 0
                      setWaste(arr => arr.map((x, j) => j === i ? { ...x, quantity: v } : x))
                    }} />
                </div>
                <div>
                  {i === 0 && <label className="label">Unit</label>}
                  <select className="input select" value={w.unit} onChange={ev => setWaste(arr => arr.map((x, j) => j === i ? { ...x, unit: ev.target.value as any } : x))}>
                    <option>kg</option><option>tonne</option>
                  </select>
                </div>
                <div>
                  {i === 0 && <label className="label">Disposal method</label>}
                  <select className="input select" value={w.disposal_method} onChange={ev => setWaste(arr => arr.map((x, j) => j === i ? { ...x, disposal_method: ev.target.value as any } : x))}>
                    {DISPOSAL_METHODS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  {i === 0 && <label className="label">Recoverable %</label>}
                  <input className="input" type="number" min={0} max={100}
                    placeholder="0"
                    value={w.recoverable_pct || ''}
                    onChange={ev => {
                      const v = ev.target.value === '' ? 0 : parseFloat(ev.target.value) || 0
                      setWaste(arr => arr.map((x, j) => j === i ? { ...x, recoverable_pct: v } : x))
                    }} />
                </div>
                <button onClick={() => setWaste(arr => arr.filter((_, j) => j !== i))} disabled={waste.length === 1}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '10px 6px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={() => setWaste(arr => [...arr, mkWaste()])}>
              <Plus size={14} /> Add waste stream
            </button>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '0.875rem', marginTop: '20px' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-primary" onClick={handleCalculate} disabled={loading} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Calculating & Saving...' : 'Calculate emissions'}
            {!loading && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
