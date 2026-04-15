import type { Query } from '@tanstack/react-query'

/** Agent Activity / chat-style surfaces (SDD §3). */
export const POLL_MS_INTERACTIVE = 3000

/** Dashboard and lower-churn lists (SDD §3). */
export const POLL_MS_DASHBOARD = 30_000

/**
 * Pauses polling when the tab is hidden; applies exponential backoff after failures
 * so Cloud Run + flaky networks do not hammer the API.
 */
export function refetchIntervalWithVisibilityAndBackoff(baseMs: number) {
  return (query: Query) => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false
    const failures = query.state.fetchFailureCount
    if (failures <= 0) return baseMs
    return Math.min(baseMs * 2 ** Math.min(failures, 6), 120_000)
  }
}
