import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import AuthPage from './components/AuthPage.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  const { currentUser, logout } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!currentUser) { setReady(true); return }
    const check = setInterval(() => {
      if (typeof window.FaceDetection !== 'undefined' && typeof window.Camera !== 'undefined') {
        clearInterval(check)
        clearTimeout(fallback)
        setReady(true)
      }
    }, 200)
    const fallback = setTimeout(() => {
      clearInterval(check)
      setReady(true)
    }, 12000)
    return () => { clearInterval(check); clearTimeout(fallback) }
  }, [currentUser])

  if (currentUser && !ready) {
    return (
      <div className="loading-screen">
        <div className="loading-icon">🧠</div>
        <h2>Smart Dashboard</h2>
        <p>Loading MediaPipe Libraries…</p>
        <div className="loading-bar-wrap"><div className="loading-bar-fill" /></div>
        <p className="loading-sub">Enhanced with AI-powered attention detection</p>
      </div>
    )
  }

  if (!currentUser) return <AuthPage />
  return <Dashboard user={currentUser} onLogout={logout} />
}
