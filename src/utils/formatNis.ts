/** Full ILS formatting for wizard copy (e.g. ₪150,000). Defaults to Hebrew number formatting per product SDD. */
export function formatNisFull(amount: number, locale?: string): string {
  const tag = locale === 'en' ? 'en-IL' : 'he-IL'
  return new Intl.NumberFormat(tag, {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount)
}
