const THEMES = [
  { id: 'theme-ocean',  label: 'Ocean',  gradient: 'linear-gradient(135deg,#0a2a4a,#00e5ff)' },
  { id: 'theme-forest', label: 'Forest', gradient: 'linear-gradient(135deg,#0a2a18,#00ff88)' },
  { id: 'theme-sunset', label: 'Sunset', gradient: 'linear-gradient(135deg,#4a1a08,#ff7043)' },
  { id: 'theme-aurora', label: 'Aurora', gradient: 'linear-gradient(135deg,#1a0a3a,#a855f7)' },
]

export default function ThemePanel({ currentTheme, onThemeChange }) {
  return (
    <div className="panel theme-panel" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
      <div className="panel-title" style={{ marginBottom: 0 }}>
        <span className="panel-title-icon">🎨</span> Appearance
      </div>
      <div className="theme-grid">
        {THEMES.map(t => (
          <div key={t.id} className="theme-swatch-wrap">
            <button
              className={`theme-swatch ${currentTheme === t.id ? 'active' : ''}`}
              style={{ background: t.gradient }}
              onClick={() => onThemeChange(t.id)}
              title={t.label}
            />
            <span className="theme-label">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
