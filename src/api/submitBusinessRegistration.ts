import type { BusinessRegistrationPayload } from '../types/business'

/**
 * POST full registration payload. Set `VITE_BUSINESS_REGISTRATION_URL` to your API endpoint.
 * If unset, resolves after a short delay (dev mock — logs payload in DEV).
 */
export async function submitBusinessRegistration(payload: BusinessRegistrationPayload): Promise<void> {
  const url = import.meta.env.VITE_BUSINESS_REGISTRATION_URL as string | undefined

  if (!url?.trim()) {
    await new Promise((r) => setTimeout(r, 900))
    if (import.meta.env.DEV) {
      console.info('[submitBusinessRegistration] mock success', payload)
    }
    return
  }

  const res = await fetch(url.trim(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const j = (await res.json()) as { message?: string; error?: string }
      detail = j.message || j.error || ''
    } catch {
      detail = await res.text().catch(() => '')
    }
    throw new Error(detail || `HTTP ${res.status}`)
  }
}
