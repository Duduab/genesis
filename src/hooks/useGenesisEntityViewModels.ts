import { useCallback, useEffect, useMemo, useState } from 'react'
import { useActiveOrganization } from '../context/ActiveOrganizationContext'
import { businessBelongsToOrganizationScope } from '../lib/orgAccess'
import {
  GENESIS_BUSINESSES_UPDATED_EVENT,
  GENESIS_SAVED_BUSINESSES_STORAGE_KEY,
  loadPersistedGenesisBusinesses,
} from '../dashboard/genesisBusinessStorage'
import {
  mapPersistedBusinessToEntityView,
  type GenesisEntityViewModel,
} from '../dashboard/mapPersistedBusinessToEntityView'
import { useOrganizationsQuery } from '../hooks/useOrganizationsQuery'
import { businessDetailHref } from '../lib/businessPaths'

export function useGenesisEntityViewModels(locale: string): GenesisEntityViewModel[] {
  const [tick, setTick] = useState(0)
  const bump = useCallback(() => setTick((n) => n + 1), [])
  const { activeOrganizationId, legacyFallbackOrganizationId } = useActiveOrganization()
  const orgsQ = useOrganizationsQuery({ enabled: true })
  const organizations = orgsQ.data ?? []

  useEffect(() => {
    const onCustom = () => bump()
    const onStorage = (e: StorageEvent) => {
      if (e.key === GENESIS_SAVED_BUSINESSES_STORAGE_KEY) bump()
    }
    window.addEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [bump])

  return useMemo(() => {
    void tick
    return loadPersistedGenesisBusinesses()
      .filter((r) =>
        businessBelongsToOrganizationScope(
          r.api.organization_id,
          activeOrganizationId,
          legacyFallbackOrganizationId,
        ),
      )
      .map((r) => {
        const vm = mapPersistedBusinessToEntityView(r, locale)
        const org = organizations.find((o) => o.organization_id === vm.organizationId)
        return {
          ...vm,
          detailHref: businessDetailHref({
            orgSlug: org?.slug ?? undefined,
            businessNumber: r.api.business_number,
            businessId: vm.key,
          }),
        }
      })
  }, [locale, tick, activeOrganizationId, legacyFallbackOrganizationId, organizations])
}
