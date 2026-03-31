export default function ProfilePanel({ user, onLogout }) {
  if (!user) return null
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="panel profile-panel">
      <div className="profile-avatar">{initials}</div>
      <div className="profile-info">
        <p className="profile-name">{user.name}</p>
        <p className="profile-meta">ID: {user.id}</p>
        <p className="profile-meta">Age: {user.age || '—'}</p>
      </div>
      <button className="btn-logout" onClick={onLogout}>Logout</button>
    </div>
  )
}
