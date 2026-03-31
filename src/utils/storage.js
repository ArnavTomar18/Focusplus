// Storage utility — wraps localStorage with JSON parse/stringify

export const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch {}
  },
}

export const KEYS = {
  CURRENT_USER: 'currentUser',
  ALL_USERS: 'allUsers',
  THEME: 'selectedTheme',
  TASKS: 'tasks',
  REPORTS: 'savedReports',
  SESSION_COUNTER: 'sessionCounter',
  NOTEPAD: 'notepadContent',
}

// SHA-256 password hashing via Web Crypto API
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function generateUserId() {
  return Date.now().toString(36).toUpperCase()
}

export function sanitize(input) {
  if (typeof input !== 'string') return ''
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>'"]/g, '').trim()
}
