import { useState, useEffect } from 'react'
import { storage, KEYS } from '../../utils/storage'

const CATS = {
  EXCELLENT:     { color: '#00ff88', icon: '🏆', label: 'Excellent' },
  GOOD:          { color: '#8bc34a', icon: '✅', label: 'Good' },
  MODERATE:      { color: '#ffb300', icon: '⚠️', label: 'Moderate' },
  BELOW_AVERAGE: { color: '#ff7043', icon: '📉', label: 'Below Avg' },
  POOR:          { color: '#ff4466', icon: '❌', label: 'Poor' },
}

export default function Analytics({ refreshKey }) {
  const [reports, setReports] = useState([])
  const [selected, setSelected] = useState(null)
  const [maximized, setMaximized] = useState(false)

  useEffect(() => { setReports(storage.get(KEYS.REPORTS) || []) }, [refreshKey])

  const clearAll = () => {
    if (!confirm('Delete all saved reports?')) return
    storage.remove(KEYS.REPORTS); setReports([]); setSelected(null)
  }

  const cat = r => CATS[r.assessmentCategory] || { color: '#8b90b8', icon: '📊', label: 'N/A' }
  const avgFocus = reports.filter(r => r.focusPercentage !== null)
  const avg = avgFocus.length > 0 ? (avgFocus.reduce((s,r) => s+r.focusPercentage, 0) / avgFocus.length).toFixed(1) : null

  return (
    <>
      <div className="panel analytics-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-icon">📊</span>
            Analytics
            {reports.length > 0 && (
              <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-lit)', borderRadius: 20, padding: '2px 10px', fontWeight: 700 }}>
                {reports.length}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {reports.length > 0 && <button className="btn-sm" onClick={() => setMaximized(true)}>⤢ Expand</button>}
            {reports.length > 0 && <button className="btn-sm danger" onClick={clearAll}>✕ Clear</button>}
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="analytics-empty">
            <span className="empty-icon">📈</span>
            <div className="empty-text">Complete focus sessions to see your analytics here.<br />Start a timer to begin tracking!</div>
          </div>
        ) : (
          <>
            {/* Summary row */}
            {avg && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div style={{ background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)', padding: '10px 12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{avg}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Avg Focus</div>
                </div>
                <div style={{ background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)', padding: '10px 12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{reports.length}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Sessions</div>
                </div>
                <div style={{ background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)', padding: '10px 12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {reports.reduce((s,r) => s+r.duration, 0).toFixed(0)}m
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Total Time</div>
                </div>
              </div>
            )}

            <div className="reports-scroll">
              {reports.map((r, i) => (
                <div key={i} className="report-card"
                  style={{ borderLeftColor: cat(r).color }}
                  onClick={() => { setSelected(r); setMaximized(true) }}>
                  <div className="report-card-left">
                    <div className="report-session" style={{ color: cat(r).color }}>
                      {cat(r).icon} Session {r.sessionId}
                    </div>
                    <div className="report-time">
                      {new Date(r.timestamp).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})} · {r.duration}min
                    </div>
                  </div>
                  <div className="report-score" style={{ color: cat(r).color }}>
                    {r.focusPercentage !== null ? `${r.focusPercentage}%` : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Full-screen analytics modal */}
      {maximized && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) { setMaximized(false); setSelected(null) } }}>
          <div className="modal modal-maximized">
            <div className="modal-chrome">
              <div className="modal-chrome-left">
                <span className="panel-title-icon">📊</span>
                <span className="modal-title">
                  {selected ? `Session ${selected.sessionId} Details` : 'Analytics — All Sessions'}
                </span>
              </div>
              <div className="modal-chrome-btns">
                {selected && <button className="win-btn" onClick={() => setSelected(null)} style={{ fontSize: 11, width: 'auto', padding: '0 12px' }}>← Back</button>}
                {reports.length > 0 && !selected && <button className="win-btn" style={{ fontSize: 11, width: 'auto', padding: '0 12px', color: 'var(--red)', borderColor: 'rgba(255,68,102,0.3)' }} onClick={clearAll}>Clear All</button>}
                <button className="win-btn maximize" onClick={() => { setMaximized(false); setSelected(null) }}>⤡</button>
                <button className="win-btn close" onClick={() => { setMaximized(false); setSelected(null) }}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              {selected ? (
                // Detail view
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Big focus score */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px', background: 'var(--bg-raised)', borderRadius: 'var(--radius-lg)', border: `1px solid ${cat(selected).color}44` }}>
                    <div style={{ fontSize: '5rem', lineHeight: 1 }}>{cat(selected).icon}</div>
                    <div>
                      <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: cat(selected).color, lineHeight: 1 }}>
                        {selected.focusPercentage !== null ? `${selected.focusPercentage}%` : 'N/A'}
                      </div>
                      <div style={{ color: cat(selected).color, fontWeight: 700, fontSize: '1.1rem', marginTop: 6 }}>{selected.assessment}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                        {new Date(selected.timestamp).toLocaleString()} · {selected.duration} minutes · {selected.completed ? 'Completed' : 'Incomplete'}
                      </div>
                    </div>
                  </div>
                  <div className="report-detail-grid">
                    <div className="report-detail-card">
                      <h4 style={{ color: cat(selected).color }}>Session Overview</h4>
                      {[['Session #', selected.sessionId],['Duration',`${selected.duration} minutes`],['Status',selected.completed?'✅ Completed':'⚠️ Incomplete'],['Assessment',selected.assessment]].map(([k,v]) => (
                        <div key={k} className="detail-row">
                          <span className="detail-key">{k}</span>
                          <span className="detail-val">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="report-detail-card">
                      <h4 style={{ color: cat(selected).color }}>Detection Metrics</h4>
                      {[
                        ['Focus Score', selected.focusPercentage !== null ? `${selected.focusPercentage}%` : 'N/A'],
                        ['Total Frames', selected.totalFrames || 'N/A'],
                        ['Focused Frames', selected.focusedFrames || 0],
                        ['Distracted Frames', selected.distractedFrames || 0],
                        ['No Face Frames', selected.noFaceFrames || 0],
                        ['MediaPipe', selected.detectorMetrics?.mediaPipeActive ? '✅ Active' : '—'],
                      ].map(([k,v]) => (
                        <div key={k} className="detail-row">
                          <span className="detail-key">{k}</span>
                          <span className="detail-val">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // List view
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {avg && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 8 }}>
                      {[
                        ['Avg Focus', avg+'%', 'var(--accent)'],
                        ['Sessions', reports.length, 'var(--text-primary)'],
                        ['Total Time', reports.reduce((s,r)=>s+r.duration,0).toFixed(0)+'m', 'var(--text-primary)'],
                        ['Best Session', Math.max(...reports.filter(r=>r.focusPercentage!==null).map(r=>r.focusPercentage)).toFixed(1)+'%', '#00ff88'],
                      ].map(([l,v,c]) => (
                        <div key={l} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
                          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: c }}>{v}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                    {reports.map((r,i) => (
                      <div key={i} className="report-card" style={{ borderLeftColor: cat(r).color, cursor: 'pointer', padding: '16px 20px' }} onClick={() => setSelected(r)}>
                        <div className="report-card-left">
                          <div className="report-session" style={{ color: cat(r).color, fontSize: 15 }}>{cat(r).icon} Session {r.sessionId}</div>
                          <div className="report-time">{new Date(r.timestamp).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})} · {r.duration}min</div>
                        </div>
                        <div className="report-score" style={{ color: cat(r).color, fontSize: '1.6rem' }}>
                          {r.focusPercentage !== null ? `${r.focusPercentage}%` : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
