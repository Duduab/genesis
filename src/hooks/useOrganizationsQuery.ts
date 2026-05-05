import { useQuery } from '@tanstack/react-query'
import { fetchOrganizationsList } from '../api/genesis/organizationsApi'

export const ORGANIZATIONS_QUERY_KEY = ['organizations'] as const

export function useOrganizationsQuery(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEY,
    queryFn: async () => {
      const { items } = await fetchOrganizationsList()
      return items
    },
    enabled,
    staleTime: 60_000,
  })
}
