/**
 * Human-friendly business URL when org slug + per-org business number exist; otherwise UUID path (legacy).
 */
export function businessDetailHref(params: {
  orgSlug?: string | null | undefined
  businessNumber?: string | number | null | undefined
  businessId: string
}): string {
  const slug = typeof params.orgSlug === 'string' ? params.orgSlug.trim() : ''
  const numRaw = params.businessNumber
  const num =
    numRaw != null && String(numRaw).trim() !== '' ? String(numRaw).trim() : ''
  const id = params.businessId.trim()
  if (slug && num) {
    return `/orgs/${encodeURIComponent(slug)}/businesses/${encodeURIComponent(num)}`
  }
  if (id) return `/businesses/${encodeURIComponent(id)}`
  return '/businesses'
}
