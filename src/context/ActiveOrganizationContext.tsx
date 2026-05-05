import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../auth/AuthContext'
import { useOrganizationsQuery } from '../hooks/useOrganizationsQuery'
import type { OrganizationSummary } from '../types/organization'
import { primaryOrganizationId, sortOrganizationsByNewest } from '../lib/orgAccess'
import {
  GENESIS_ACTIVE_ORGANIZATION_CHANGED_EVENT,
  GENESIS_ACTIVE_ORGANIZATION_ID_KEY,
  readActiveOrganizationId,
  writeActiveOrganizationId,
} from '../dashboard/activeOrganizationStorage'

type ActiveOrganizationContextValue = {
  organizations: OrganizationSummary[]
  sortedOrganizations: OrganizationSummary[]
  /** Primary org for attributing legacy businesses without `organization_id`. */
  legacyFallbackOrganizationId: string | null
  activeOrganizationId: string | null
  activeOrganization: OrganizationSummary | null
  setActiveOrganizationId: (organizationId: string | null) => void
  organizationsLoading: boolean
}

const ActiveOrganizationContext = createContext<ActiveOrganizationContextValue | null>(null)

export function ActiveOrganizationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const orgsQ = useOrganizationsQuery({ enabled: isAuthenticated })
  const organizations = orgsQ.data ?? []

  const sortedOrganizations = useMemo(() => sortOrganizationsByNewest(organizations), [organizations])

  const legacyFallbackOrganizationId = useMemo(
    () => primaryOrganizationId(organizations),
    [organizations],
  )

  const [activeOrganizationId, setActiveOrganizationIdState] = useState<string | null>(() =>
    readActiveOrganizationId(),
  )

  useEffect(() => {
    const onCustom = () => setActiveOrganizationIdState(readActiveOrganizationId())
    const onStorage = (e: StorageEvent) => {
      if (e.key === GENESIS_ACTIVE_ORGANIZATION_ID_KEY) onCustom()
    }
    window.addEventListener(GENESIS_ACTIVE_ORGANIZATION_CHANGED_EVENT, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(GENESIS_ACTIVE_ORGANIZATION_CHANGED_EVENT, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      writeActiveOrganizationId(null)
      setActiveOrganizationIdState(null)
      return
    }
    if (!orgsQ.isSuccess) return

    if (sortedOrganizations.length === 0) {
      writeActiveOrganizationId(null)
      setActiveOrganizationIdState(null)
      return
    }

    const ids = new Set(sortedOrganizations.map((o) => o.organization_id))
    const stored = readActiveOrganizationId()
    const next = stored && ids.has(stored) ? stored : sortedOrganizations[0].organization_id

    setActiveOrganizationIdState((prev) => {
      if (prev === next) return prev
      writeActiveOrganizationId(next)
      return next
    })
  }, [isAuthenticated, orgsQ.isSuccess, sortedOrganizations])

  const setActiveOrganizationId = useCallback((organizationId: string | null) => {
    writeActiveOrganizationId(organizationId)
    setActiveOrganizationIdState(organizationId?.trim() || null)
  }, [])

  const activeOrganization = useMemo(() => {
    if (!activeOrganizationId) return null
    return sortedOrganizations.find((o) => o.organization_id === activeOrganizationId) ?? null
  }, [sortedOrganizations, activeOrganizationId])

  const value = useMemo(
    () => ({
      organizations,
      sortedOrganizations,
      legacyFallbackOrganizationId,
      activeOrganizationId,
      activeOrganization,
      setActiveOrganizationId,
      organizationsLoading: orgsQ.isLoading,
    }),
    [
      organizations,
      sortedOrganizations,
      legacyFallbackOrganizationId,
      activeOrganizationId,
      activeOrganization,
      setActiveOrganizationId,
      orgsQ.isLoading,
    ],
  )

  return (
    <ActiveOrganizationContext.Provider value={value}>{children}</ActiveOrganizationContext.Provider>
  )
}

export function useActiveOrganization(): ActiveOrganizationContextValue {
  const ctx = useContext(ActiveOrganizationContext)
  if (!ctx) throw new Error('useActiveOrganization must be used within ActiveOrganizationProvider')
  return ctx
}
