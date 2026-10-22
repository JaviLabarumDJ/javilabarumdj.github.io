export const formatBytes = (n: number) => {
  if (!n) return ''
  const mb = n / 1024 / 1024
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`
}

export const formatNumber = (n: number) => new Intl.NumberFormat('es-ES').format(n)

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  iso ? new Intl.DateTimeFormat('es-ES', opts).format(new Date(iso)) : ''

export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month'], [Infinity, 'year'],
  ]
  let v = s
  for (const [step, unit] of units) {
    if (Math.abs(v) < step) return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(-Math.round(v), unit)
    v /= step
  }
  return ''
}
