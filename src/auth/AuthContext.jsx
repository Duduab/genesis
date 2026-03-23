import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext()

const MOCK_USER = {
  username: 'genesisTechnologies',
  password: 'Genesis1234',
  displayName: 'Genesis Technologies',
  role: 'Administrator',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('genesis_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback((username, password) => {
    if (username === MOCK_USER.username && password === MOCK_USER.password) {
      const userData = { displayName: MOCK_USER.displayName, role: MOCK_USER.role }
      sessionStorage.setItem('genesis_user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    }
    return { success: false }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('genesis_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
