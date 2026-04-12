import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const AuthContext = createContext()

const MOCK_USER = {
  username: 'genesisTechnologies',
  password: 'Genesis1234',
  displayName: 'Genesis Technologies',
  role: 'Administrator',
  email: 'operations@genesistechnologies.com',
  phone: '+972527752985',
}

function normalizeStoredUser(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    displayName: raw.displayName ?? MOCK_USER.displayName,
    role: raw.role ?? MOCK_USER.role,
    email: raw.email ?? MOCK_USER.email,
    username: raw.username ?? MOCK_USER.username,
    phone: raw.phone ?? MOCK_USER.phone,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('genesis_user')
      return stored ? normalizeStoredUser(JSON.parse(stored)) : null
    } catch {
      return null
    }
  })

  /** Snapshot of Register page (step 1) fields — updated as the user fills the form */
  const [registrationData, setRegistrationData] = useState(null)
  const registrationDataRef = useRef(null)
  useEffect(() => {
    registrationDataRef.current = registrationData
  }, [registrationData])

  const login = useCallback((username, password) => {
    if (username === MOCK_USER.username && password === MOCK_USER.password) {
      const userData = {
        displayName: MOCK_USER.displayName,
        role: MOCK_USER.role,
        email: MOCK_USER.email,
        username: MOCK_USER.username,
        phone: MOCK_USER.phone,
      }
      sessionStorage.setItem('genesis_user', JSON.stringify(userData))
      setUser(userData)
      console.log('[Auth] Registration data (Register page inputs):', registrationDataRef.current)
      setRegistrationData(null)
      return { success: true }
    }
    return { success: false }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('genesis_user')
    setUser(null)
    setRegistrationData(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, registrationData, setRegistrationData }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
