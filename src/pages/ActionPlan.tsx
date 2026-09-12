import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ClipboardList, CheckCircle2, Clock, PlayCircle, XCircle,
  Trash2, Plus, ArrowRight, Download, Calendar, DollarSign,
  TrendingDown, Sparkles, Filter, AlertCircle
} from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import { DEMO_LABEL, formatCO2, formatINR } from '../lib/demo'
import type { ActionPlanItem } from '../types'

export default function ActionPlan() {
  const {
    actionPlanItems, updateActionPlanItem, removeFromActionPlan,
    addToActionPlan, isDemo, emissionResults
  } = useAppState()
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemCost, setNewItemCost] = useState<number>(100000)
  const [newItemCO2, setNewItemCO2] = useState<number>(1.5)
  const [newItemTargetDate, setNewItemTargetDate] = useState('')

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return

    const item: ActionPlanItem = {
      id: `custom-${Date.now()}`,
      intervention_id: `custom-${Date.now()}`,
      name: newItemName,
      estimated_cost_inr: newItemCost,
      expected_co2_reduction_tonnes: newItemCO2,
      status: 'Planned',
      start_date: new Date().toISOString().split('T')[0],
      target_date: newItemTargetDate || undefined,
    }

    addToActionPlan(item)
    setNewItemName('')
    setShowAddModal(false)
  }

  // Summary computations
  const totalItems = actionPlanItems.length
  const completedItems = actionPlanItems.filter(i => i.status === 'Completed')
  const inProgressItems = actionPlanItems.filter(i => i.status === 'In Progress')
  const plannedItems = actionPlanItems.filter(i => i.status === 'Planned')

  const totalCommittedCost = actionPlanItems.reduce((s, i) => s + (i.estimated_cost_inr || 0), 0)
  const totalExpectedReduction = actionPlanItems.reduce((s, i) => s + (i.expected_co2_reduction_tonnes || 0), 0)
  const achievedReduction = completedItems.reduce((s, i) => s + (i.expected_co2_reduction_tonnes || 0), 0)

  const progressPct = totalExpectedReduction > 0 ? (achievedReduction / totalExpectedReduction) * 100 : 0

  const filteredItems = actionPlanItems.filter(item => {
    if (statusFilter === 'All') return true
    return item.status === statusFilter
  })

  const exportCSV = () => {
    const headers = 'Name,Status,Estimated Cost (INR),Expected CO2 Reduction (tCO2e),Start Date,Target Date\n'
    const rows = actionPlanItems.map(i =>
      `"${i.name}","${i.status}",${i.estimated_cost_inr},${i.expected_co2_reduction_tonnes},"${i.start_date || ''}","${i.target_date || ''}"`
    ).join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ecoloop-action-plan-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getStatusBadge = (status: ActionPlanItem['status']) => {
    switch (status) {
      case 'Completed':
        return { bg: '#DCFCE7', color: '#166534', icon: CheckCircle2 }
      case 'In Progress':
        return { bg: '#FEF3C7', color: '#92400E', icon: PlayCircle }
      case 'Cancelled':
        return { bg: '#FEE2E2', color: '#991B1B', icon: XCircle }
      default:
        return { bg: '#E0F2FE', color: '#075985', icon: Clock }
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div className="loop-icon">
              <ClipboardList size={18} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Implementation Action Plan</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Track execution milestones, track operational expenditure, and measure verified carbon reductions.
            </p>
            {isDemo && <span className="demo-label">🔬 {DEMO_LABEL}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {actionPlanItems.length > 0 && (
            <button
              onClick={exportCSV}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Download size={14} /> Export CSV
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <Plus size={14} /> Add Initiative
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="kpi-card">
          <span className="kpi-label">Total Action Items</span>
          <div className="kpi-value">{totalItems}</div>
          <div className="kpi-change" style={{ color: 'var(--color-text-secondary)' }}>
            {completedItems.length} completed • {inProgressItems.length} active
          </div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Target Decarbonization</span>
          <div className="kpi-value" style={{ color: 'var(--color-loop-dark)' }}>
            {formatCO2(totalExpectedReduction)}
          </div>
          <div className="kpi-change" style={{ color: '#16A34A' }}>
            {formatCO2(achievedReduction)} realized so far
          </div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Committed Investment</span>
          <div className="kpi-value" style={{ color: 'var(--color-ink)' }}>
            {formatINR(totalCommittedCost)}
          </div>
          <div className="kpi-change" style={{ color: 'var(--color-text-secondary)' }}>
            Across all scheduled initiatives
          </div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Execution Progress</span>
          <div className="kpi-value" style={{ color: '#16A34A' }}>
            {progressPct.toFixed(0)}%
          </div>
          <div className="kpi-change" style={{ color: 'var(--color-text-secondary)' }}>
            {completedItems.length} of {totalItems} milestones done
          </div>
        </div>
      </div>

      {/* Overall Reduction Progress Bar */}
      {totalExpectedReduction > 0 && (
        <div className="card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={16} color="var(--color-loop)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Realized Carbon Abatement</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-loop)' }}>
              {formatCO2(achievedReduction)} / {formatCO2(totalExpectedReduction)} ({progressPct.toFixed(1)}%)
            </span>
          </div>
          <div className="progress-bar" style={{ height: '10px' }}>
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, progressPct)}%`,
                background: 'linear-gradient(90deg, var(--color-loop) 0%, #2BB673 100%)',
              }}
            />
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
          {['All', 'Planned', 'In Progress', 'Completed', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? 'var(--color-loop)' : 'transparent',
                color: statusFilter === st ? 'white' : 'var(--color-ink)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
          Showing {filteredItems.length} of {totalItems} items
        </span>
      </div>

      {/* Plan Items Table / List */}
      {filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <ClipboardList size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No action items found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px' }}>
            Explore AI recommendations or use the Target Optimizer to automatically populate your decarbonization roadmap.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/recommendations" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              Browse Recommendations <ArrowRight size={14} />
            </Link>
            <button onClick={() => setShowAddModal(true)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <Plus size={14} /> Custom Item
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredItems.map(item => {
            const badge = getStatusBadge(item.status)
            const BadgeIcon = badge.icon

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderLeft: item.status === 'Completed' ? '4px solid #2BB673' : item.status === 'In Progress' ? '4px solid #F2A93C' : '4px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '240px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: badge.bg, color: badge.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: '2px'
                  }}>
                    <BadgeIcon size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.975rem', fontWeight: 800, marginBottom: '4px' }}>
                      {item.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={13} color="#6366F1" /> {formatINR(item.estimated_cost_inr)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingDown size={13} color="#16A34A" /> {formatCO2(item.expected_co2_reduction_tonnes)} reduction
                      </span>
                      {item.target_date && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> Target: {item.target_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Switcher & Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <select
                    className="input select"
                    value={item.status}
                    onChange={(e: any) => updateActionPlanItem(item.id, { status: e.target.value })}
                    style={{
                      fontSize: '0.8rem',
                      padding: '6px 28px 6px 12px',
                      background: badge.bg,
                      color: badge.color,
                      fontWeight: 700,
                      borderColor: 'transparent',
                      width: 'auto'
                    }}
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => removeFromActionPlan(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove from plan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Custom Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Add Custom Decarbonization Initiative
            </h3>

            <form onSubmit={handleAddCustom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Initiative Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LED Lighting Retrofit across Bay 2"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Estimated Cost (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newItemCost}
                    onChange={e => setNewItemCost(Number(e.target.value))}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Expected CO₂ Reduction (t)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItemCO2}
                    onChange={e => setNewItemCO2(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Target Completion Date (Optional)</label>
                <input
                  type="date"
                  value={newItemTargetDate}
                  onChange={e => setNewItemTargetDate(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Save Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
