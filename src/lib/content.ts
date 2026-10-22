import raw from '../content/site.json'
import type { SiteContent } from './types'

/** Rellena campos que falten (contenido o borradores de versiones anteriores). */
export function normalize(c: SiteContent): SiteContent {
  c.events ??= []
  c.mixes ??= []
  const p = c.profile
  p.location ??= ''
  p.since ??= ''
  p.words ??= []
  p.genres ??= []
  p.story ??= ''
  p.timeline ??= []
  p.gear ??= []
  p.influences ??= []
  p.booking ??= { enabled: false, text: '', phone: '', whatsapp: false, email: '' }
  return c
}

export const site = normalize(raw as SiteContent)

export const publishedApps = () => site.apps.filter((a) => a.published)
export const findApp = (slug: string) => publishedApps().find((a) => a.slug === slug)

/** Rutas de contenido son relativas a la raíz pública ("assets/x.png"). */
export const asset = (path: string) =>
  /^(https?:|data:|blob:)/.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export const accentVars: Record<string, { c: string; soft: string }> = {
  cyan: { c: '#00e5ff', soft: 'rgba(0,229,255,.12)' },
  teal: { c: '#00d4c5', soft: 'rgba(0,212,197,.12)' },
  orange: { c: '#ff6a3d', soft: 'rgba(255,106,61,.12)' },
  purple: { c: '#9b7bff', soft: 'rgba(155,123,255,.14)' },
  pink: { c: '#ff4fa3', soft: 'rgba(255,79,163,.12)' },
  green: { c: '#3ee08f', soft: 'rgba(62,224,143,.12)' },
}
