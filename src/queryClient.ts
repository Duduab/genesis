import { QueryClient } from '@tanstack/react-query'

export const genesisQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
})
