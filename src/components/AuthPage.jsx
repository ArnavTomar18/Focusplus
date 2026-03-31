import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthPage() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState('login')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    userId: '', email: '', password: '',
    name: '', age: '', signupEmail: '', signupPassword: ''
  })

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))
  const showMsg = (text, type, ms = 6000) => {
    setMsg({ text, type })
    if (type === 'error') setTimeout(() => setMsg(null), ms)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      await login({ userId: form.userId, email: form.email, password: form.password })
    } catch (err) {
      showMsg(err.message, 'error')
    } finally { setLoading(false) }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const age = parseInt(form.age)
    if (!form.name || form.name.length < 2) return showMsg('Name must be at least 2 characters.', 'error')
    if (!age || age < 13 || age > 120) return showMsg('Please enter a valid age (13–120).', 'error')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.signupEmail)) return showMsg('Invalid email address.', 'error')
    if (form.signupPassword.length < 8) return showMsg('Password must be at least 8 characters.', 'error')
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.signupPassword))
      return showMsg('Password needs uppercase, lowercase, and a number.', 'error')
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1000))
      const user = await signup({ name: form.name, age, email: form.signupEmail, password: form.signupPassword })
      showMsg(`🎉 Account created! Your User ID: ${user.id} — save this!`, 'success', 30000)
      setMode('login')
      setForm(prev => ({ ...prev, userId: user.id, email: user.email }))
    } catch (err) {
      showMsg(err.message, 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>FOCUS PLUS ✨</h1>
          <p>Where productivity meets your vibes 🎯</p>
        </div>

        <div className="auth-toggle">
          <div className={`toggle-track ${mode === 'signup' ? 'right' : ''}`} />
          <button className={`toggle-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setMsg(null) }}>I'm Back! 👋</button>
          <button className={`toggle-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setMsg(null) }}>New Here? 🚀</button>
        </div>

        {msg && <div className={`auth-msg ${msg.type}`}>{msg.text}</div>}

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <h2>Welcome back, study buddy! 📚</h2>
            <div className="form-row">
              <div className="field">
                <label>Your Unique ID ✨</label>
                <input value={form.userId} onChange={set('userId')} placeholder="e.g. MNEEKB6I" required />
                <small>Given to you when you signed up</small>
              </div>
              <div className="field">
                <label>Email Address 📧</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" required />
                <small>The email you used to join</small>
              </div>
            </div>
            <div className="field">
              <label>Password 🔐</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••••" required />
              <small>Shhh… keep it between us! 🤫</small>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Let's Get This Study Session Started! 🎯⚡"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignup}>
            <h2>Join the productivity squad! 🎉</h2>
            <div className="form-row">
              <div className="field">
                <label>Your Name 👤</label>
                <input value={form.name} onChange={set('name')} placeholder="Your awesome name" required />
                <small>First name, nickname, whatever!</small>
              </div>
              <div className="field">
                <label>Your Age 🎂</label>
                <input type="number" min="13" max="120" value={form.age} onChange={set('age')} placeholder="Age" required />
                <small>Must be 13+ to join</small>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Email Address 📧</label>
                <input type="email" value={form.signupEmail} onChange={set('signupEmail')} placeholder="your@email.com" required />
                <small>No spam, just good vibes! ✌️</small>
              </div>
              <div className="field">
                <label>Password 🔑</label>
                <input type="password" value={form.signupPassword} onChange={set('signupPassword')} placeholder="Make it strong!" required />
                <small>Min 8 chars, upper + lower + number</small>
              </div>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Yes! I'm Ready to Level Up! 🚀✨"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
