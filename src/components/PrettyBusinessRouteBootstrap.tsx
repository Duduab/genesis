import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { useRouter } from '../router'
import { fetchGenesisBusinessByOrgSlugAndNumber } from '../api/genesis/businessesApi'
import {
  loadPersistedGenesisBusinesses,
  upsertPersistedGenesisBusiness,
} from '../dashboard/genesisBusinessStorage'
import { MY_ENTITIES_QUERY_KEY } from '../hooks/useMyEntitiesFromApi'
import { ORGANIZATIONS_QUERY_KEY } from '../hooks/useOrganizationsQuery'
import { useActiveOrganization } from '../context/ActiveOrganizationContext'
import { writeActiveBusinessId } from '../dashboard/activeBusinessStorage'
import type { LicenseTypeId } from '../types/business'

const PRETTY_ORG_BUSINESS_QUERY_KEY = 'org-slug-business' as const

/**
 * When the URL is `/orgs/:slug/businesses/:number`, fetches the canonical business once,
 * merges into persisted businesses, sets active org + business UUIDs for existing API paths.
 * Pretty URL stays in the address bar; `/api/v1/businesses/{uuid}/...` calls are unchanged.
 */
export default function PrettyBusinessRouteBootstrap() {
  const { isAuthenticated } = useAuth()
  const { prettyBusiness } = useRouter()
  const { setActiveOrganizationId } = useActiveOrganization()
  const qc = useQueryClient()
  const appliedKeyRef = useRef<string | null>(null)

  const slug = prettyBusiness?.orgSlug?.trim() ?? ''
  const num = prettyBusiness?.businessNumber?.trim() ?? ''

  const q = useQuery({
    queryKey: [PRETTY_ORG_BUSINESS_QUERY_KEY, slug, num],
    queryFn: () => fetchGenesisBusinessByOrgSlugAndNumber(slug, num),
    enabled: Boolean(isAuthenticated && slug && num),
    staleTime: 60_000,
    gcTime: 300_000,
  })

  useEffect(() => {
    if (!prettyBusiness || !slug || !num) {
      appliedKeyRef.current = null
      return
    }
    if (!q.isSuccess || !q.data?.business_id) return

    const dedupeKey = `${slug}:${num}:${q.data.business_id}`
    if (appliedKeyRef.current === dedupeKey) return
    appliedKeyRef.current = dedupeKey

    const api = q.data
    const prev = loadPersistedGenesisBusinesses().find((b) => b.businessId === api.business_id)
    const licenseType = (prev?.licenseType ?? 'ltd') as LicenseTypeId

    upsertPersistedGenesisBusiness(api, licenseType)

    const oid = api.organization_id?.trim()
    if (oid) setActiveOrganizationId(oid)

    writeActiveBusinessId(api.business_id)

    void qc.invalidateQueries({ queryKey: MY_ENTITIES_QUERY_KEY })
    void qc.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY })
  }, [prettyBusiness, slug, num, q.isSuccess, q.data, setActiveOrganizationId, qc])

  return null
}
