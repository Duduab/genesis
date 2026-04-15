import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { configureGenesisApi } from '../api/genesis/client'
import { getGenesisFirebaseAuth } from './firebaseApp'
import { registerGenesisServiceWorker } from './registerOptionalServiceWorker'

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
    uid: raw.uid,
    authSource: raw.authSource ?? 'mock',
  }
}

function isFirebaseAuthAvailable() {
  return Boolean(getGenesisFirebaseAuth())
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (isFirebaseAuthAvailable()) return null
    try {
      const stored = sessionStorage.getItem('genesis_user')
      return stored ? normalizeStoredUser(JSON.parse(stored)) : null
    } catch {
      return null
    }
  })

  const [registrationData, setRegistrationData] = useState(null)
  const registrationDataRef = useRef(null)
  useEffect(() => {
    registrationDataRef.current = registrationData
  }, [registrationData])

  useEffect(() => {
    registerGenesisServiceWorker()
  }, [])

  useEffect(() => {
    configureGenesisApi({
      getAccessToken: async () => {
        const auth = getGenesisFirebaseAuth()
        const u = auth?.currentUser
        if (!u) return null
        return u.getIdToken()
      },
      onUnauthorized: async () => {
        const auth = getGenesisFirebaseAuth()
        const u = auth?.currentUser
        if (!u) return null
        return u.getIdToken(true)
      },
    })
  }, [])

  useEffect(() => {
    const auth = getGenesisFirebaseAuth()
    if (!auth) return undefined
    return onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setUser(null)
        return
      }
      setUser({
        displayName: fbUser.displayName || fbUser.email || 'User',
        role: 'Entrepreneur',
        email: fbUser.email || '',
        username: fbUser.email || fbUser.uid,
        phone: fbUser.phoneNumber || '',
        uid: fbUser.uid,
        authSource: 'firebase',
      })
    })
  }, [])

  const login = useCallback(
    async (username, password) => {
      const auth = getGenesisFirebaseAuth()
      if (auth) {
        const cred = await signInWithEmailAndPassword(auth, String(username).trim(), password)
        setUser({
          displayName: cred.user.displayName || cred.user.email || 'User',
          role: 'Entrepreneur',
          email: cred.user.email || '',
          username: cred.user.email || cred.user.uid,
          phone: cred.user.phoneNumber || '',
          uid: cred.user.uid,
          authSource: 'firebase',
        })
        setRegistrationData(null)
        return { success: true }
      }

      if (username === MOCK_USER.username && password === MOCK_USER.password) {
        const userData = {
          displayName: MOCK_USER.displayName,
          role: MOCK_USER.role,
          email: MOCK_USER.email,
          username: MOCK_USER.username,
          phone: MOCK_USER.phone,
          authSource: 'mock',
        }
        sessionStorage.setItem('genesis_user', JSON.stringify(userData))
        setUser(userData)
        console.log('[Auth] Registration data (Register page inputs):', registrationDataRef.current)
        setRegistrationData(null)
        return { success: true }
      }
      return { success: false }
    },
    [],
  )

  const logout = useCallback(async () => {
    const auth = getGenesisFirebaseAuth()
    if (auth?.currentUser) {
      await signOut(auth)
    }
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
