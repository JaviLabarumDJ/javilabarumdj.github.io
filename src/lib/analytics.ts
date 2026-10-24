/**
 * Estadísticas con Umami (sin cookies). El script se carga en index.html con auto-track desactivado
 * para no contar /admin; aquí se cuentan las páginas y los clics en elementos con data-track.
 *
 *   <a data-track="contact-instagram" data-track-where="booking">…</a>
 *   → evento "contact-instagram" con { where: "booking" }
 */
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

type Umami = { track: (event?: string, data?: Record<string, string>) => void }
declare global { interface Window { umami?: Umami } }

const DISABLED_KEY = 'umami.disabled'
const queue: (() => void)[] = []

function withUmami(fn: (u: Umami) => void) {
  if (window.umami) return fn(window.umami)
  if (queue.push(() => window.umami && fn(window.umami)) > 1) return
  const script = document.querySelector<HTMLScriptElement>('script[data-website-id]')
  const flush = () => queue.splice(0).forEach((f) => f())
  if (script) script.addEventListener('load', flush, { once: true })
}

const isAdmin = () => location.pathname.startsWith('/admin')

export function track(event: string, data?: Record<string, string>) {
  if (isAdmin()) return
  withUmami((u) => u.track(event, data))
}

/** Cuenta una página vista en cada cambio de ruta (excepto el panel). */
export function usePageviews() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (isAdmin()) return
    // Deja que useMeta actualice el título antes de enviar la visita.
    const id = setTimeout(() => withUmami((u) => u.track()), 0)
    return () => clearTimeout(id)
  }, [pathname])
}

/** Escucha global de clics en [data-track]. */
export function initClickTracking() {
  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]')
    if (!el) return
    const data: Record<string, string> = {}
    for (const [k, v] of Object.entries(el.dataset)) {
      if (k.startsWith('track') && k !== 'track' && v) data[k.slice(5).toLowerCase()] = v
    }
    track(el.dataset.track!, Object.keys(data).length ? data : undefined)
  }, { capture: true })
}

export const ownVisits = {
  excluded: () => { try { return !!localStorage.getItem(DISABLED_KEY) } catch { return false } },
  set: (exclude: boolean) => { try { exclude ? localStorage.setItem(DISABLED_KEY, '1') : localStorage.removeItem(DISABLED_KEY) } catch { /* ignore */ } },
}
