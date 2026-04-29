import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getGenesisFirebaseAuth } from '../auth/firebaseApp'
import { isConsoleStaffRole } from '../auth/firebaseRoles'

const AdminAuthContext = createContext(null)

async function refreshConsoleAccessFromUser(fbUser) {
  if (!fbUser) return false
  try {
    const idt = await fbUser.getIdTokenResult(true)
    return isConsoleStaffRole(idt.claims)
  } catch {
    return false
  }
}

export function AdminAuthProvider({ children }) {
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const auth = getGenesisFirebaseAuth()
    if (!auth) {
      setOk(false)
      return undefined
    }
    return onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setOk(false)
        return
      }
      void refreshConsoleAccessFromUser(fbUser).then(setOk)
    })
  }, [])

  const login = useCallback(async (email, password) => {
    const auth = getGenesisFirebaseAuth()
    if (!auth) return { ok: false, reason: 'no_firebase' }
    try {
      const cred = await signInWithEmailAndPassword(auth, String(email).trim(), password)
      const allowed = await refreshConsoleAccessFromUser(cred.user)
      if (!allowed) {
        await signOut(auth)
        return { ok: false, reason: 'forbidden_role' }
      }
      setOk(true)
      return { ok: true }
    } catch {
      return { ok: false, reason: 'firebase_auth' }
    }
  }, [])

  const logout = useCallback(async () => {
    const auth = getGenesisFirebaseAuth()
    if (auth?.currentUser) {
      await signOut(auth)
    }
    setOk(false)
  }, [])

  const value = useMemo(() => ({ isAuthenticated: ok, login, logout }), [ok, login, logout])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
