import { useState, useEffect } from 'react'
import { storage, KEYS } from '../utils/storage'
import NotesPanel from './panels/NotesPanel.jsx'
import BotProfessor from './panels/BotProfessor.jsx'
import Analytics from './panels/Analytics.jsx'
import StudyPanel from './panels/StudyPanel.jsx'
import ThemePanel from './panels/ThemePanel.jsx'
import TaskPanel from './panels/TaskPanel.jsx'

const THEMES = ['theme-ocean','theme-forest','theme-sunset','theme-aurora']

export default function Dashboard({ user, onLogout }) {
  const [theme, setTheme] = useState(() => storage.get(KEYS.THEME) || 'theme-ocean')
  const [analyticsKey, setAnalyticsKey] = useState(0)

  useEffect(() => {
    THEMES.forEach(t => document.body.classList.remove(t))
    document.body.classList.add(theme)
    storage.set(KEYS.THEME, theme)
  }, [theme])

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) onLogout()
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="dashboard">
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-brand">FOCUS PLUS ✨</div>
        <div className="topbar-right">
          <div className="topbar-user">
            <div className="topbar-avatar">{initials}</div>
            <div>
              <div className="topbar-name">{user.name}</div>
              <div className="topbar-id">ID: {user.id}</div>
            </div>
          </div>
          <button className="btn-topbar-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="board-grid">
        <StudyPanel onSessionComplete={() => setAnalyticsKey(k => k + 1)} />
        <NotesPanel />
        <BotProfessor />
        <ThemePanel currentTheme={theme} onThemeChange={setTheme} />
        <Analytics refreshKey={analyticsKey} />
        <TaskPanel userId={user.id} />
      </div>
    </div>
  )
}
