import { useState, useEffect } from 'react'
import { storage, KEYS } from '../../utils/storage'

function formatDate(ds) {
  const d = new Date(ds); const today = new Date(); const tom = new Date(today)
  tom.setDate(today.getDate()+1)
  d.setHours(0,0,0,0); today.setHours(0,0,0,0); tom.setHours(0,0,0,0)
  if (d.getTime()===today.getTime()) return '📅 Today'
  if (d.getTime()===tom.getTime()) return '📅 Tomorrow'
  return '📅 ' + d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})
}

export default function TaskPanel({ userId }) {
  const [tasks, setTasks] = useState([])
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [priority, setPriority] = useState('normal')
  const today = new Date().toISOString().split('T')[0]

  const load = () => {
    const all = storage.get(KEYS.TASKS) || []
    setTasks(all.filter(t => t.userId === userId).sort((a,b) => new Date(a.date)-new Date(b.date)))
  }
  useEffect(load, [userId])

  const add = () => {
    if (!name.trim() || !date) return alert('Please fill in both task name and due date.')
    const task = { id:'TASK'+Math.random().toString(36).substr(2,6).toUpperCase(), name:name.trim(), date, priority, userId, createdAt:new Date().toISOString() }
    const all = storage.get(KEYS.TASKS) || []
    storage.set(KEYS.TASKS, [...all, task])
    setName(''); setDate(''); setPriority('normal')
    load()
  }

  const remove = (id) => {
    if (!confirm('Remove this task?')) return
    const all = storage.get(KEYS.TASKS) || []
    storage.set(KEYS.TASKS, all.filter(t => t.id !== id))
    load()
  }

  const PRIORITY_COLORS = { high: '#ff4466', normal: 'var(--accent)', low: '#8b90b8' }

  return (
    <>
      <div className="panel task-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-icon">📋</span>
            Task Scheduler
            {tasks.length > 0 && (
              <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-lit)', borderRadius: 20, padding: '2px 10px', fontWeight: 700 }}>
                {tasks.length}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-sm" onClick={() => setMaximized(true)}>⤢ Expand</button>
            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => setOpen(true)}>
              + Add Task
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="task-empty">No tasks yet — click <strong>Add Task</strong> to get started!</div>
        ) : (
          <div className="task-grid">
            {tasks.map(t => {
              const overdue = new Date(t.date) < new Date()
              return (
                <div key={t.id} className={`task-card ${overdue ? 'overdue' : ''}`}
                  style={{ borderLeft: `3px solid ${PRIORITY_COLORS[t.priority||'normal']}` }}>
                  <div style={{ flex: 1 }}>
                    <div className="task-name" style={overdue ? { textDecoration: 'line-through', opacity: 0.6 } : {}}>{t.name}</div>
                    <div className="task-date">{formatDate(t.date)}</div>
                  </div>
                  <button className="btn-remove-task" onClick={() => remove(t.id)}>✕</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal — full screen */}
      {open && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal" style={{ maxWidth: 700, alignSelf: 'center', borderRadius: 'var(--radius-xl)', maxHeight: '80vh' }}>
            <div className="modal-chrome">
              <div className="modal-chrome-left">
                <span className="panel-title-icon">📋</span>
                <span className="modal-title">Add New Task</span>
              </div>
              <div className="modal-chrome-btns">
                <button className="win-btn close" onClick={() => setOpen(false)}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              <div className="task-modal-form">
                <div>
                  <label className="modal-field-label">Task Name *</label>
                  <input
                    className="modal-input"
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="What do you need to get done?"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && add()}
                  />
                </div>
                <div className="task-modal-row">
                  <div>
                    <label className="modal-field-label">Due Date *</label>
                    <input className="modal-input" type="date" min={today} value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="modal-field-label">Priority</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                      {['high','normal','low'].map(p => (
                        <button key={p} onClick={() => setPriority(p)}
                          style={{
                            flex: 1, padding: '13px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                            fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-body)', border: '1px solid',
                            transition: 'all 0.2s',
                            borderColor: priority === p ? PRIORITY_COLORS[p] : 'var(--border)',
                            background: priority === p ? PRIORITY_COLORS[p]+'22' : 'var(--bg-raised)',
                            color: priority === p ? PRIORITY_COLORS[p] : 'var(--text-muted)',
                          }}>
                          {p === 'high' ? '🔴 High' : p === 'normal' ? '🟡 Normal' : '🟢 Low'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={add}>Add Task ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen task manager */}
      {maximized && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setMaximized(false)}>
          <div className={`modal ${maximized ? 'modal-maximized' : ''}`} style={{ borderRadius: 0, maxHeight: '100vh' }}>
            <div className="modal-chrome">
              <div className="modal-chrome-left">
                <span className="panel-title-icon">📋</span>
                <span className="modal-title">Task Scheduler — Full View</span>
                {tasks.length > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>}
              </div>
              <div className="modal-chrome-btns">
                <button className="win-btn" onClick={() => setOpen(true)} style={{ fontSize: 11, width: 'auto', padding: '0 12px' }}>+ Add</button>
                <button className="win-btn maximize" onClick={() => setMaximized(false)}>⤡</button>
                <button className="win-btn close" onClick={() => setMaximized(false)}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '4rem', marginBottom: 16 }}>📋</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>No Tasks Yet</div>
                  <div style={{ fontSize: 14, marginBottom: 24 }}>Click the + Add button above to create your first task</div>
                  <button className="btn-primary" onClick={() => setOpen(true)}>+ Add First Task</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {tasks.map(t => {
                    const overdue = new Date(t.date) < new Date()
                    const PRIORITY_COLORS = { high: '#ff4466', normal: 'var(--accent)', low: '#8b90b8' }
                    return (
                      <div key={t.id} className={`task-card ${overdue ? 'overdue' : ''}`}
                        style={{ borderLeft: `3px solid ${PRIORITY_COLORS[t.priority||'normal']}`, padding: '16px 20px' }}>
                        <div style={{ flex: 1 }}>
                          <div className="task-name" style={{ fontSize: 15, ...(overdue ? { textDecoration: 'line-through', opacity: 0.6 } : {}) }}>{t.name}</div>
                          <div className="task-date" style={{ marginTop: 6 }}>{formatDate(t.date)}</div>
                          {t.priority && t.priority !== 'normal' && (
                            <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: PRIORITY_COLORS[t.priority], textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              {t.priority} priority
                            </div>
                          )}
                        </div>
                        <button className="btn-remove-task" onClick={() => remove(t.id)} style={{ alignSelf: 'flex-start' }}>✕</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
