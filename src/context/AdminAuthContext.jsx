import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ADMIN_PANEL_PASSWORD, ADMIN_PANEL_USERNAME } from '../config/adminPanelCredentials'

const AdminAuthContext = createContext(null)

const STORAGE_KEY = 'genesis_admin_panel_authenticated'

export function AdminAuthProvider({ children }) {
  const [ok, setOk] = useState(() => (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) === '1' : false))

  useEffect(() => {
    setOk(sessionStorage.getItem(STORAGE_KEY) === '1')
  }, [])

  const login = useCallback((username, password) => {
    if (username === ADMIN_PANEL_USERNAME && password === ADMIN_PANEL_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setOk(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
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
