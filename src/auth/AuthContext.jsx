import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { configureGenesisApi } from '../api/genesis/client'
import { getGenesisFirebaseAuth } from './firebaseApp'
import { displayRoleLabel, roleClaimFromJwt } from './firebaseRoles'
import { isJwtPlatformSuperAdmin } from '../lib/orgAccess'
import { registerGenesisServiceWorker } from './registerOptionalServiceWorker'

const AuthContext = createContext()

function firebaseUserToAppUser(fbUser, claims) {
  const role = roleClaimFromJwt(claims)
  return {
    displayName: fbUser.displayName || fbUser.email || 'User',
    role: displayRoleLabel(role),
    roleKey: role,
    email: fbUser.email || '',
    username: fbUser.email || fbUser.uid,
    phone: fbUser.phoneNumber || '',
    uid: fbUser.uid,
    authSource: 'firebase',
    jwtClaims: claims && typeof claims === 'object' ? claims : {},
    platformSuperAdmin: isJwtPlatformSuperAdmin(claims),
  }
}

function isFirebaseAuthAvailable() {
  return Boolean(getGenesisFirebaseAuth())
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

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
        // Firebase ID token (JWT) — same as `id_token` from the securetoken endpoint.
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
      void (async () => {
        try {
          const idt = await fbUser.getIdTokenResult()
          setUser(firebaseUserToAppUser(fbUser, idt.claims))
        } catch {
          setUser(firebaseUserToAppUser(fbUser, {}))
        }
      })()
    })
  }, [])

  const login = useCallback(async (email, password) => {
    const auth = getGenesisFirebaseAuth()
    if (!auth) {
      return { success: false, reason: 'no_firebase' }
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, String(email).trim(), password)
      const idt = await cred.user.getIdTokenResult(true)
      setUser(firebaseUserToAppUser(cred.user, idt.claims))
      setRegistrationData(null)
      return { success: true }
    } catch {
      return { success: false, reason: 'firebase_auth' }
    }
  }, [])

  const logout = useCallback(async () => {
    const auth = getGenesisFirebaseAuth()
    if (auth?.currentUser) {
      await signOut(auth)
    }
    setUser(null)
    setRegistrationData(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        firebaseConfigured: isFirebaseAuthAvailable(),
        login,
        logout,
        registrationData,
        setRegistrationData,
      }}
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
