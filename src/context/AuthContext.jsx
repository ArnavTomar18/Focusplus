import { createContext, useContext, useState, useCallback } from 'react'
import { storage, KEYS, hashPassword, generateUserId, sanitize } from '../utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => storage.get(KEYS.CURRENT_USER))

  const login = useCallback(async ({ userId, email, password }) => {
    const users = storage.get(KEYS.ALL_USERS) || []
    const hashed = await hashPassword(password)
    const user = users.find(
      u => u &&
        u.id?.toUpperCase() === userId.toUpperCase() &&
        u.email?.toLowerCase() === email.toLowerCase() &&
        u.password === hashed
    )
    if (!user) throw new Error('Invalid credentials. Please check your User ID, email, and password.')
    const session = { id: user.id, name: user.name, email: user.email, age: user.age, created: user.created }
    storage.set(KEYS.CURRENT_USER, session)
    setCurrentUser(session)
    return session
  }, [])

  const signup = useCallback(async ({ name, age, email, password }) => {
    const users = storage.get(KEYS.ALL_USERS) || []
    const exists = users.find(u => u?.email?.toLowerCase() === email.toLowerCase())
    if (exists) throw new Error('An account with this email already exists.')
    const hashed = await hashPassword(password)
    const newUser = {
      name: sanitize(name),
      age,
      email: email.toLowerCase(),
      password: hashed,
      id: generateUserId(),
      created: new Date().toISOString(),
    }
    storage.set(KEYS.ALL_USERS, [...users, newUser])
    return newUser
  }, [])

  const logout = useCallback(() => {
    storage.remove(KEYS.CURRENT_USER)
    setCurrentUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
