import { useRef, useEffect, useState } from 'react'
import { useTimer } from '../../hooks/useTimer'
import { useMediaPipe } from '../../hooks/useMediaPipe'
import { storage, KEYS } from '../../utils/storage'

const ASSESS = [
  { min: 90, label: 'Excellent Focus 🏆', color: '#00ff88', cat: 'EXCELLENT' },
  { min: 80, label: 'Good Focus ✅',       color: '#8bc34a', cat: 'GOOD' },
  { min: 70, label: 'Moderate Focus ⚠️',   color: '#ffb300', cat: 'MODERATE' },
  { min: 60, label: 'Below Average 📉',    color: '#ff7043', cat: 'BELOW_AVERAGE' },
  { min: 0,  label: 'Poor Focus ❌',       color: '#ff4466', cat: 'POOR' },
]
const getAssess = (pct) => ASSESS.find(a => pct >= a.min) || ASSESS[ASSESS.length - 1]

export default function StudyPanel({ onSessionComplete }) {
  const videoRef = useRef()
  const canvasRef = useRef()
  const { status, stats, attentionData, start: mpStart, stop: mpStop, resetStats, getFocusPercent, getDuration } = useMediaPipe()
  const timer = useTimer(120)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [hInput, setHInput] = useState(0)
  const [mInput, setMInput] = useState(2)
  const [sessionCount, setSessionCount] = useState(() => parseInt(storage.get(KEYS.SESSION_COUNTER) || '0'))

  useEffect(() => { timer.setOnComplete(handleComplete) }, [])

  const handleStart = async () => {
    resetStats(); timer.reset(); timer.start()
    if (videoRef.current && canvasRef.current) await mpStart(videoRef.current, canvasRef.current)
  }

  const handleComplete = () => {
    mpStop()
    const count = sessionCount + 1; setSessionCount(count)
    storage.set(KEYS.SESSION_COUNTER, String(count))
    const pct = parseFloat(getFocusPercent())
    const a = getAssess(pct)
    const report = {
      sessionId: count, timestamp: new Date().toISOString(),
      duration: parseFloat(getDuration()), completed: true,
      focusPercentage: stats.total > 0 ? pct : null,
      totalFrames: stats.total, focusedFrames: stats.focused,
      distractedFrames: stats.distracted, noFaceFrames: stats.noFace,
      assessment: a.label.replace(/ [^\s]*$/, ''), assessmentCategory: a.cat,
      detectorMetrics: { mediaPipeActive: status === 'active' },
    }
    const existing = storage.get(KEYS.REPORTS) || []
    storage.set(KEYS.REPORTS, [report, ...existing].slice(0, 50))
    onSessionComplete?.()
    showToast('🎉 Session complete! Report saved.')
  }

  const showToast = (msg) => {
    const t = document.createElement('div'); t.className = 'toast'
    t.innerHTML = `<span class="toast-icon">✅</span><span>${msg}</span><div class="toast-bar"></div>`
    document.body.appendChild(t)
    setTimeout(() => t.classList.add('show'), 50)
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350) }, 3500)
  }

  const applyTimer = () => {
    const s = (parseInt(hInput)||0)*3600 + (parseInt(mInput)||0)*60
    if (s < 60) return alert('Minimum 1 minute.')
    timer.setDuration(s); setSettingsOpen(false)
  }

  const focusPct = parseFloat(getFocusPercent())
  const assess = getAssess(focusPct)

  return (
    <>
      <div className="panel study-panel" style={{ minHeight: 520 }}>
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-icon">🎯</span>
            Attention Detection
            <span className="panel-subtitle"> · MediaPipe AI</span>
          </div>
        </div>

        {/* Camera */}
        <div className="camera-container">
          <video ref={videoRef} style={{ display: status === 'active' ? 'block' : 'none' }} autoPlay muted playsInline />
          <canvas ref={canvasRef} style={{ display: status === 'active' ? 'block' : 'none' }} />
          {status !== 'active' && (
            <div className="camera-placeholder">
              <div className="camera-icon">📷</div>
              <div className="camera-label">
                {status === 'starting' ? 'Starting camera…' : status === 'error' ? 'Camera failed' : 'AI Camera'}
              </div>
              <div className="camera-hint">
                {status === 'error' ? 'Check camera permissions and reload' : 'Start the timer to activate attention tracking'}
              </div>
            </div>
          )}
          {attentionData && (
            <div className={`attention-badge ${attentionData.hasface ? (attentionData.isFocused ? 'focused' : 'distracted') : 'noface'}`}>
              {attentionData.hasface
                ? `${attentionData.isFocused ? '● Focused' : '● Distracted'} ${Math.round(attentionData.score*100)}%`
                : '○ No Face'}
            </div>
          )}
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-val" style={{ color: '#00ff88' }}>{getFocusPercent()}%</div>
                <div className="stat-lbl">Focused</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ color: '#ff4466' }}>
                  {stats.total > 0 ? ((stats.distracted/stats.total)*100).toFixed(1) : '0.0'}%
                </div>
                <div className="stat-lbl">Distracted</div>
              </div>
              <div className="stat-card">
                <div className="stat-val">{getDuration()}<span style={{fontSize:'1rem'}}>m</span></div>
                <div className="stat-lbl">Duration</div>
              </div>
              <div className="stat-card">
                <div className="stat-val">{stats.total}</div>
                <div className="stat-lbl">Frames</div>
              </div>
            </div>
            {stats.total > 30 && (
              <div className="assess-pill" style={{ color: assess.color, borderColor: assess.color, background: assess.color+'18' }}>
                {assess.label}
              </div>
            )}
          </>
        )}

        {/* Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
          <div className="timer-display">{timer.display()}</div>
          <div className="timer-controls">
            <button className="btn-timer" onClick={handleStart} disabled={timer.running}>▶ Start</button>
            <button className="btn-timer" onClick={timer.pause} disabled={!timer.running}>⏸ Pause</button>
            <button className="btn-timer" onClick={() => { timer.reset(); mpStop(); resetStats() }}>↺ Reset</button>
            <button className="btn-timer" onClick={() => setSettingsOpen(true)}>⚙ Set</button>
          </div>
          <div className="timer-hint">Space to start/pause · R to reset</div>
        </div>
      </div>

      {/* Timer Settings Modal */}
      {settingsOpen && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setSettingsOpen(false)}>
          <div className="modal" style={{ maxHeight: '60vh', maxWidth: 480, alignSelf: 'center', borderRadius: 'var(--radius-xl)' }}>
            <div className="modal-chrome">
              <div className="modal-chrome-left">
                <span className="panel-title-icon">⏱</span>
                <span className="modal-title">Timer Settings</span>
              </div>
              <div className="modal-chrome-btns">
                <button className="win-btn close" onClick={() => setSettingsOpen(false)}>✕</button>
              </div>
            </div>
            <div className="modal-body" style={{ gap: 16 }}>
              <div className="task-modal-row">
                <div>
                  <label className="modal-field-label">Hours (0–24)</label>
                  <input className="modal-input" type="number" min="0" max="24" value={hInput} onChange={e => setHInput(e.target.value)} />
                </div>
                <div>
                  <label className="modal-field-label">Minutes (0–59)</label>
                  <input className="modal-input" type="number" min="0" max="59" value={mInput} onChange={e => setMInput(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setSettingsOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={applyTimer}>Apply Timer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
