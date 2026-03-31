import { useState, useEffect } from 'react'
import { storage, KEYS } from '../../utils/storage'

export default function NotesPanel() {
  const [text, setText] = useState(() => storage.get(KEYS.NOTEPAD) || '')
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    const id = setInterval(() => { storage.set(KEYS.NOTEPAD, text); setSaved(true) }, 30000)
    return () => clearInterval(id)
  }, [text])

  const handleChange = (e) => {
    setText(e.target.value)
    setSaved(false)
    storage.set(KEYS.NOTEPAD, e.target.value)
    setSaved(true)
  }

  const exportNotes = () => {
    const blob = new Blob([text || 'No notes'], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `notes-${new Date().toISOString().split('T')[0]}.txt`
    a.click(); URL.revokeObjectURL(url)
  }

  const clearNotes = () => {
    if (!confirm('Clear all notes? This cannot be undone.')) return
    setText(''); storage.remove(KEYS.NOTEPAD)
  }

  const wc = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="panel notes-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-icon">📝</span>
          Session Notes
        </div>
        <div className="notes-actions">
          <button className="btn-sm success" onClick={exportNotes}>↑ Export</button>
          <button className="btn-sm danger" onClick={clearNotes}>✕ Clear</button>
        </div>
      </div>

      <textarea
        className="notepad-textarea"
        value={text}
        onChange={handleChange}
        placeholder={`Your session notes live here...\n\n💡 Pro tips:\n• Write your goals before starting\n• Note insights and blockers\n• Track what you learned today\n\nNotes auto-save every 30 seconds.`}
      />

      <div className="notepad-footer">
        <span>
          <span className="notepad-status-dot" />
          {saved ? 'Saved' : 'Unsaved changes'}
        </span>
        <span>{wc} words · {text.length} chars</span>
      </div>
    </div>
  )
}
