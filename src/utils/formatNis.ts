/** Full ILS formatting for wizard copy (e.g. ₪150,000). */
export function formatNisFull(amount: number, locale: string): string {
  const tag = locale === 'he' ? 'he-IL' : 'en-IL'
  return new Intl.NumberFormat(tag, {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount)
}
