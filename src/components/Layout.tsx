import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { asset, publishedApps, site } from '../lib/content'
import { Icon } from './Icon'

function Brand({ sub = 'Apps & Music Hub' }: { sub?: string }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Inicio">
      <img src={asset('assets/logo.svg')} alt="" width={36} height={36} className="transition-transform duration-700 group-hover:rotate-180" />
      <span className="leading-none">
        <span className="block font-display text-[15px] font-extrabold tracking-wide">
          JAVILABARUM<span className="text-cyan">DJ</span>
        </span>
        <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">{sub}</span>
      </span>
    </Link>
  )
}

export function SocialLinks({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {site.socials.map((s) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${s.label} ${s.handle}`}
          title={`${s.label} ${s.handle}`}
          className="grid size-9 place-items-center rounded-lg text-ink-2 transition hover:bg-white/5 hover:text-ink"
        >
          <Icon name={s.id} size={size} />
        </a>
      ))}
    </div>
  )
}

function useNavItems() {
  const items = [{ to: '/', label: 'Inicio' }, { to: '/apps', label: 'Apps' }]
  if (site.mixes.length) items.push({ to: '/#mixes', label: 'Mixes' })
  if (site.events.length) items.push({ to: '/#eventos', label: 'Fechas' })
  items.push({ to: '/sobre-mi', label: 'Sobre mí' })
  return items
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [appsOpen, setAppsOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const items = useNavItems()
  const apps = publishedApps()

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 12)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { setOpen(false); setAppsOpen(false) }, [pathname, hash])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {items.map((it) =>
            it.to === '/apps' ? (
              <div key={it.to} className="relative" onMouseEnter={() => setAppsOpen(true)} onMouseLeave={() => setAppsOpen(false)}>
                <NavLink
                  to="/apps"
                  className={({ isActive }) => `flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition hover:text-ink ${isActive || pathname.startsWith('/app/') ? 'text-ink' : 'text-ink-2'}`}
                  aria-haspopup="true"
                  aria-expanded={appsOpen}
                  onFocus={() => setAppsOpen(true)}
                >
                  Apps <Icon name="chevron" size={14} className={`transition ${appsOpen ? 'rotate-180' : ''}`} />
                </NavLink>
                <AnimatePresence>
                  {appsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-2"
                    >
                      <div className="card overflow-hidden bg-surface/95 p-2 shadow-2xl">
                        {apps.map((a) => (
                          <Link key={a.slug} to={`/${a.slug}`} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/5" onBlur={() => setAppsOpen(false)}>
                            <img src={asset(a.icon)} alt="" className="size-9 rounded-lg" />
                            <span>
                              <span className="block text-sm font-semibold">{a.name}</span>
                              <span className="block text-xs text-ink-3">{a.tagline}</span>
                            </span>
                          </Link>
                        ))}
                        <Link to="/apps" className="mt-1 flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-cyan hover:bg-white/5">
                          Ver catálogo completo <Icon name="arrow" size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link key={it.to} to={it.to} className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:text-ink ${pathname.replace(/\/$/, '') === it.to.replace(/\/$/, '') && !hash ? 'text-ink' : 'text-ink-2'}`}>
                {it.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <SocialLinks className="hidden lg:flex" />
          <Link to="/apps" className="btn-primary hidden !px-4 !py-2 sm:inline-flex">Descargas</Link>
          <button
            className="grid size-10 place-items-center rounded-lg border border-line text-ink md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100dvh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-y-auto border-t border-line bg-bg md:hidden"
          >
            <nav className="container-x flex flex-col gap-1 py-6 pb-32" aria-label="Móvil">
              {items.filter((i) => i.to !== '/apps').map((it, i) => (
                <motion.div key={it.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link to={it.to} className="block rounded-xl px-3 py-3 font-display text-2xl font-bold">{it.label}</Link>
                </motion.div>
              ))}
              <p className="kicker mt-6 mb-2 px-3">Aplicaciones</p>
              {apps.map((a) => (
                <Link key={a.slug} to={`/${a.slug}`} className="flex items-center gap-3 rounded-xl p-3 active:bg-white/5">
                  <img src={asset(a.icon)} alt="" className="size-10 rounded-lg" />
                  <span>
                    <span className="block font-semibold">{a.name}</span>
                    <span className="block text-sm text-ink-3">{a.tagline}</span>
                  </span>
                </Link>
              ))}
              <Link to="/apps" className="mt-1 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-cyan">
                Ver catálogo completo <Icon name="arrow" size={16} />
              </Link>
              <SocialLinks size={22} className="mt-8 justify-center gap-3" />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function Footer() {
  const apps = publishedApps()
  return (
    <footer className="relative z-10 border-t border-line bg-bg-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Brand />
          <p className="mt-4 max-w-sm text-sm text-ink-2">Software libre, música y tecnología para DJs y amantes del sonido de alta fidelidad.</p>
          <SocialLinks className="-ml-2 mt-4" />
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold">Aplicaciones</h4>
          <ul className="space-y-2.5 text-sm text-ink-2">
            {apps.map((a) => (
              <li key={a.slug}><Link className="hover:text-ink" to={`/${a.slug}`}>{a.name}</Link></li>
            ))}
            <li><Link className="hover:text-ink" to="/apps">Todas las apps</Link></li>
            <li><Link className="hover:text-ink" to="/sobre-mi">Sobre mí y contrataciones</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold">Redes</h4>
          <ul className="space-y-2.5 text-sm text-ink-2">
            {site.socials.map((s) => (
              <li key={s.id}><a className="hover:text-ink" href={s.url} target="_blank" rel="noopener noreferrer">{s.label} <span className="text-ink-3">{s.handle}</span></a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-3 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.profile.name} ({site.profile.handle}). Software libre para la comunidad DJ.</p>
          <Link to="/admin" className="hover:text-ink-2">Panel</Link>
        </div>
      </div>
    </footer>
  )
}

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) { setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50); return }
    }
    scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
}

export default function Layout() {
  return (
    <div className="noise relative min-h-dvh overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">Saltar al contenido</a>
      <ScrollManager />
      <Navbar />
      <main id="main" className="relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
