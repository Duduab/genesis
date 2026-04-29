import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  GENESIS_BUSINESSES_UPDATED_EVENT,
  loadPersistedGenesisBusinesses,
  type PersistedGenesisBusiness,
} from '../dashboard/genesisBusinessStorage'
import {
  GENESIS_ACTIVE_BUSINESS_CHANGED_EVENT,
  GENESIS_ACTIVE_BUSINESS_ID_KEY,
  readActiveBusinessId,
  writeActiveBusinessId,
} from '../dashboard/activeBusinessStorage'
import { useRouter } from '../router'
import {
  mapPersistedBusinessToEntityView,
  type GenesisEntityViewModel,
} from '../dashboard/mapPersistedBusinessToEntityView'

type ActiveBusinessContextValue = {
  activeBusinessId: string | null
  /** Persisted row + API snapshot for the active business, if any. */
  activeBusiness: PersistedGenesisBusiness | null
  activeViewModel: GenesisEntityViewModel | null
  enterBusiness: (businessId: string) => void
  clearActiveBusiness: () => void
}

const ActiveBusinessContext = createContext<ActiveBusinessContextValue | null>(null)

function resolveRow(
  id: string | null,
  list: PersistedGenesisBusiness[],
): PersistedGenesisBusiness | null {
  if (!id) return null
  return list.find((b) => b.businessId === id) ?? null
}

export function ActiveBusinessProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n()
  const { pathBusinessId } = useRouter()
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(() => readActiveBusinessId())
  const [listTick, setListTick] = useState(0)

  const bumpList = useCallback(() => setListTick((n) => n + 1), [])

  useEffect(() => {
    if (!pathBusinessId) return
    const trimmed = pathBusinessId.trim()
    if (!trimmed) return
    if (trimmed !== readActiveBusinessId()) {
      writeActiveBusinessId(trimmed)
      setActiveBusinessId(trimmed)
    }
  }, [pathBusinessId])

  useEffect(() => {
    const onCustom = () => bumpList()
    const onActive = () => setActiveBusinessId(readActiveBusinessId())
    const onStorage = (e: StorageEvent) => {
      if (e.key === GENESIS_ACTIVE_BUSINESS_ID_KEY) onActive()
    }
    window.addEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onCustom)
    window.addEventListener(GENESIS_ACTIVE_BUSINESS_CHANGED_EVENT, onActive)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onCustom)
      window.removeEventListener(GENESIS_ACTIVE_BUSINESS_CHANGED_EVENT, onActive)
      window.removeEventListener('storage', onStorage)
    }
  }, [bumpList])

  const persistedList = useMemo(() => {
    void listTick
    return loadPersistedGenesisBusinesses()
  }, [listTick])

  useEffect(() => {
    if (persistedList.length === 0) {
      if (readActiveBusinessId() != null) {
        writeActiveBusinessId(null)
        setActiveBusinessId(null)
      }
      return
    }

    const stored = readActiveBusinessId()
    if (stored && !persistedList.some((b) => b.businessId === stored)) {
      writeActiveBusinessId(null)
      setActiveBusinessId(null)
    }

    if (!readActiveBusinessId()) {
      const firstId = persistedList[0]?.businessId?.trim()
      if (firstId) {
        writeActiveBusinessId(firstId)
        setActiveBusinessId(firstId)
      }
    }
  }, [persistedList])

  const activeBusiness = useMemo(
    () => resolveRow(activeBusinessId, persistedList),
    [activeBusinessId, persistedList],
  )

  const activeViewModel = useMemo(() => {
    if (!activeBusiness) return null
    return mapPersistedBusinessToEntityView(activeBusiness, locale)
  }, [activeBusiness, locale])

  const enterBusiness = useCallback((businessId: string) => {
    const id = businessId.trim()
    if (!id) return
    writeActiveBusinessId(id)
    setActiveBusinessId(id)
  }, [])

  const clearActiveBusiness = useCallback(() => {
    writeActiveBusinessId(null)
    setActiveBusinessId(null)
  }, [])

  const value = useMemo(
    () => ({
      activeBusinessId,
      activeBusiness,
      activeViewModel,
      enterBusiness,
      clearActiveBusiness,
    }),
    [activeBusinessId, activeBusiness, activeViewModel, enterBusiness, clearActiveBusiness],
  )

  return <ActiveBusinessContext.Provider value={value}>{children}</ActiveBusinessContext.Provider>
}

export function useActiveBusiness(): ActiveBusinessContextValue {
  const ctx = useContext(ActiveBusinessContext)
  if (!ctx) throw new Error('useActiveBusiness must be used within ActiveBusinessProvider')
  return ctx
}
