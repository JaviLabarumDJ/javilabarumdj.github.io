import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import { asset } from '../lib/content'
import { useMeta } from '../lib/useMeta'
import type { SiteContent } from '../lib/types'
import { createApi, GhError, REPO, tokenStore, type GhUser } from './api'
import { AdminProvider, PREVIEW_KEY, useAdmin } from './store'
import Dashboard from './Dashboard'
import { AppEditor, AppsList } from './Apps'
import { EventsView, JsonView, MixesView, ProfileView, SocialsView } from './Content'

type Session = { token: string; user: GhUser; content: SiteContent; sha: string }

async function openSession(token: string): Promise<Session> {
  const api = createApi(token)
  const user = await api.user()
  if (!(await api.canPush())) throw new Error(`La cuenta ${user.login} no tiene permiso de escritura en ${REPO}.`)
  const { content, sha } = await api.loadContent()
  return { token, user, content, sha }
}

function Login({ onLogin }: { onLogin: (s: Session) => void }) {
  const [token, setToken] = useState('')
  const [remember, setRemember] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [show, setShow] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const s = await openSession(token.trim())
      tokenStore.set(s.token, remember)
      onLogin(s)
    } catch (e) {
      setErr(e instanceof GhError && e.status === 401 ? 'Token no válido o caducado.' : (e as Error).message)
    } finally { setBusy(false) }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-1/3 size-[500px] -translate-x-1/2 rounded-full bg-cyan/10 blur-[140px]" />
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="card relative w-full max-w-md p-6 sm:p-8">
        <img src={asset('assets/logo.svg')} alt="" className="mb-5 size-14" />
        <h1 className="text-2xl font-black">Panel de administración</h1>
        <p className="mt-1.5 text-sm text-ink-2">Accede con un token personal de GitHub con permiso de escritura en <code className="font-mono text-xs text-ink">{REPO}</code>.</p>
        <label htmlFor="tok" className="mb-1.5 mt-6 block text-xs font-semibold text-ink-2">Token de GitHub</label>
        <div className="relative">
          <input
            id="tok" type={show ? 'text' : 'password'} required autoComplete="off" spellCheck={false} value={token} onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_…"
            className="w-full rounded-lg border border-line bg-bg py-3 pl-3 pr-11 font-mono text-sm outline-none focus:border-cyan/60"
          />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar' : 'Mostrar'} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-ink-3 hover:text-ink">
            <Icon name={show ? 'eyeOff' : 'eye'} size={16} />
          </button>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-cyan" />
          Recordar en este dispositivo
        </label>
        {err && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
        <button className="btn-primary mt-6 w-full !py-3" disabled={busy || !token}>{busy ? 'Comprobando…' : 'Entrar'}</button>
        <details className="mt-6 text-xs text-ink-3">
          <summary className="cursor-pointer text-ink-2">¿Cómo creo el token?</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>Abre <a className="text-cyan underline" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">GitHub → Fine-grained tokens</a>.</li>
            <li>Repositorios: <b>javilabarumdj.github.io</b> (y tus repos de apps si quieres ver estadísticas de visitas).</li>
            <li>Permisos: <b>Contents: Read and write</b>, <b>Actions: Read</b> y, opcional, <b>Administration: Read</b> (visitas).</li>
          </ol>
          <p className="mt-2">El token solo se guarda en este navegador y se usa para hablar directamente con la API de GitHub.</p>
        </details>
        <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink"><Icon name="back" size={14} /> Volver a la web</Link>
      </motion.form>
    </div>
  )
}

const nav = [
  { to: '/admin', label: 'Resumen', icon: 'chart', end: true },
  { to: '/admin/apps', label: 'Apps', icon: 'grid' },
  { to: '/admin/perfil', label: 'Perfil', icon: 'user' },
  { to: '/admin/redes', label: 'Redes', icon: 'link' },
  { to: '/admin/mixes', label: 'Mixes', icon: 'music' },
  { to: '/admin/agenda', label: 'Agenda', icon: 'calendar' },
  { to: '/admin/json', label: 'JSON', icon: 'code' },
]

function changedSections(a: SiteContent, b: SiteContent) {
  const names: Record<string, string> = { profile: 'Perfil', socials: 'Redes', events: 'Agenda', mixes: 'Mixes' }
  const out = Object.keys(names).filter((k) => JSON.stringify(a[k as keyof SiteContent]) !== JSON.stringify(b[k as keyof SiteContent])).map((k) => names[k])
  const before = new Map(b.apps.map((x) => [x.slug, JSON.stringify(x)]))
  a.apps.forEach((x) => { if (before.get(x.slug) !== JSON.stringify(x)) out.push(`App: ${x.shortName}`) })
  b.apps.forEach((x) => { if (!a.apps.some((y) => y.slug === x.slug)) out.push(`App eliminada: ${x.shortName}`) })
  if (a.apps.map((x) => x.slug).join() !== b.apps.map((x) => x.slug).join() && !out.some((o) => o.startsWith('App'))) out.push('Orden de apps')
  return out
}

function PublishDialog({ onClose }: { onClose: () => void }) {
  const { draft, published, publish, conflict } = useAdmin()
  const toast = useToast()
  const changes = changedSections(draft, published)
  const [msg, setMsg] = useState(`content: actualiza ${changes.slice(0, 3).join(', ').toLowerCase() || 'contenido'}`)
  const [busy, setBusy] = useState(false)
  const [needForce, setNeedForce] = useState(conflict)

  const go = async (force = false) => {
    setBusy(true)
    try {
      await publish(msg, force)
      toast('Publicado. La web se actualizará en ~1 minuto.')
      onClose()
    } catch (e) {
      if ((e as Error).message === 'CONFLICT') setNeedForce(true)
      else toast(`Error al publicar: ${(e as Error).message}`, 'error')
    } finally { setBusy(false) }
  }

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        role="dialog" aria-modal="true" aria-labelledby="pubt"
        initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-2xl border border-line-strong bg-surface p-5 sm:rounded-2xl sm:p-6"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <h2 id="pubt" className="text-xl font-bold">Publicar cambios</h2>
        <p className="mt-1 text-sm text-ink-2">Se hará un commit en <code className="font-mono text-xs">main</code> y GitHub Actions desplegará la web.</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">{changes.map((c) => <li key={c} className="chip">{c}</li>)}</ul>
        <label htmlFor="cm" className="mb-1.5 mt-5 block text-xs font-semibold text-ink-2">Mensaje del commit</label>
        <input id="cm" value={msg} onChange={(e) => setMsg(e.target.value)} className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-cyan/60" />
        {needForce && (
          <p className="mt-4 rounded-lg border border-orange/30 bg-orange/10 px-3 py-2 text-sm text-orange">
            El contenido publicado ha cambiado desde que empezaste a editar (otro dispositivo o un commit). Si publicas, tu borrador lo sobrescribirá.
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={busy || !msg.trim()} onClick={() => go(needForce)}>
            <Icon name="rocket" size={16} /> {busy ? 'Publicando…' : needForce ? 'Sobrescribir y publicar' : 'Publicar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Shell({ onLogout }: { onLogout: () => void }) {
  const { user, dirty, discard, draft } = useAdmin()
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault() }
    addEventListener('beforeunload', warn)
    return () => removeEventListener('beforeunload', warn)
  }, [dirty])

  const preview = () => {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(draft))
    open('/', '_blank')
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/[.07] text-ink' : 'text-ink-2 hover:bg-white/[.04] hover:text-ink'}`

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-bg-2 p-4 lg:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <img src={asset('assets/logo.svg')} alt="" className="size-8" />
          <span className="font-display font-extrabold">Panel<span className="text-cyan">DJ</span></span>
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}><Icon name={n.icon} size={17} />{n.label}</NavLink>)}
        </nav>
        <div className="mt-auto flex items-center gap-2 rounded-xl border border-line p-2">
          <img src={user.avatar_url} alt="" className="size-8 rounded-full" />
          <span className="min-w-0 flex-1 truncate text-sm">{user.login}</span>
          <button onClick={onLogout} className="grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-white/5 hover:text-ink" aria-label="Cerrar sesión" title="Cerrar sesión"><Icon name="logout" size={16} /></button>
        </div>
      </aside>

      <div className="min-w-0 pb-24 lg:pb-0">
        <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
            <Link to="/" className="lg:hidden"><img src={asset('assets/logo.svg')} alt="Inicio" className="size-8" /></Link>
            <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
              <span className={`size-2 shrink-0 rounded-full ${dirty ? 'bg-orange text-orange animate-pulse-dot' : 'bg-ok'}`} />
              <span className="truncate text-ink-2">{dirty ? 'Cambios sin publicar' : 'Todo publicado'}</span>
            </div>
            <button className="btn-ghost !px-3 !py-2 text-xs" onClick={preview} title="Ver la web con tu borrador"><Icon name="eye" size={15} /><span className="hidden sm:inline">Vista previa</span></button>
            {dirty && <button className="btn-ghost !px-3 !py-2 text-xs" onClick={() => confirm('¿Descartar todos los cambios sin publicar?') && discard()} title="Descartar"><Icon name="undo" size={15} /><span className="hidden sm:inline">Descartar</span></button>}
            <button className="btn-primary !px-3 !py-2 text-xs sm:!px-4" disabled={!dirty} onClick={() => setPublishing(true)}><Icon name="rocket" size={15} /> Publicar</button>
            <button onClick={onLogout} className="grid size-9 place-items-center rounded-lg text-ink-3 lg:hidden" aria-label="Cerrar sesión"><Icon name="logout" size={16} /></button>
          </div>
        </header>
        <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="apps" element={<AppsList />} />
            <Route path="apps/:slug" element={<AppEditor />} />
            <Route path="perfil" element={<ProfileView />} />
            <Route path="redes" element={<SocialsView />} />
            <Route path="mixes" element={<MixesView />} />
            <Route path="agenda" element={<EventsView />} />
            <Route path="json" element={<JsonView />} />
          </Routes>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {nav.slice(0, 6).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${isActive ? 'text-cyan' : 'text-ink-3'}`}>
            <Icon name={n.icon} size={19} />{n.label}
          </NavLink>
        ))}
      </nav>

      <AnimatePresence>{publishing && <PublishDialog onClose={() => setPublishing(false)} />}</AnimatePresence>
    </div>
  )
}

export default function AdminApp() {
  useMeta('Panel · JaviLabarumDJ')
  const [session, setSession] = useState<Session | null>(null)
  const [booting, setBooting] = useState(() => !!tokenStore.get())

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'robots'); document.head.appendChild(meta) }
    meta.setAttribute('content', 'noindex')
    const t = tokenStore.get()
    if (!t) return
    openSession(t).then(setSession).catch(() => tokenStore.clear()).finally(() => setBooting(false))
  }, [])

  const logout = () => { tokenStore.clear(); setSession(null) }

  if (booting) return <div className="grid min-h-dvh place-items-center bg-bg"><img src={asset('assets/logo.svg')} alt="Cargando" className="size-16 animate-spin-slow" /></div>
  if (!session) return <Login onLogin={setSession} />
  return (
    <AdminProvider token={session.token} user={session.user} initial={session.content} initialSha={session.sha}>
      <Shell onLogout={logout} />
    </AdminProvider>
  )
}
