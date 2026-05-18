import { QueryClient } from '@tanstack/react-query'
import { attachReactQueryDevDiagnostics } from './lib/devErrorReporting'

export const genesisQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      /**
       * Default `staleTime` is 0, so every remount looks "stale" and can trigger
       * another fetch before the in-flight one is deduped (especially visible under
       * React Strict Mode + multiple observers). A short freshness window coalesces
       * duplicate GETs for the same query key without slowing intentional polling
       * (`refetchInterval` still runs on its timer).
       */
      staleTime: 10_000,
    },
  },
})

attachReactQueryDevDiagnostics(genesisQueryClient)
