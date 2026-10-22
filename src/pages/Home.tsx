import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { asset, publishedApps, site } from '../lib/content'
import { formatDate } from '../lib/format'
import { useMeta } from '../lib/useMeta'
import { Icon } from '../components/Icon'
import { Visualizer } from '../components/Visualizer'
import { Reveal, SectionHeader } from '../components/Reveal'
import { AppCard } from '../components/AppBits'

const youtubeId = (url: string) => url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1]

function Hero() {
  const p = site.profile
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden pt-24 pb-24 sm:pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-10 size-[520px] rounded-full bg-cyan/20 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-40 size-[520px] rounded-full bg-orange/15 blur-[140px]" />
      <Visualizer />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-white/[.03] py-1.5 pl-1.5 pr-4 text-xs backdrop-blur">
            <img src={asset(p.avatar)} alt="" className="size-7 rounded-full object-cover" />
            <span className="font-mono font-bold uppercase tracking-wider text-ink-2">{p.handle} · {p.role}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.6rem] font-black leading-[1.02] sm:text-6xl lg:text-7xl"
          >
            {p.heroTitle}{' '}
            <span className="gradient-text block">{p.heroHighlight}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-6 max-w-xl text-base text-ink-2 sm:text-lg">
            {p.heroSubtitle}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-8 flex flex-wrap gap-3">
            <a href="#apps" className="btn-primary !px-6 !py-3.5">Explorar apps <Icon name="arrow" size={16} /></a>
            <a href="#sobre-mi" className="btn-ghost !px-6 !py-3.5">Conóceme</a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-10 flex flex-wrap gap-2">
            {site.socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="chip !py-1.5 transition hover:border-line-strong hover:text-ink">
                <Icon name={s.id} size={14} /> {s.label}
              </a>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto hidden w-full max-w-sm lg:block"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan/40 via-purple/30 to-orange/40 opacity-60 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-line-strong">
            <img src={asset(p.avatar)} alt={`${p.name} en cabina`} className="aspect-[3/4] w-full object-cover" />
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-2 rounded-full border border-white/10 bg-bg/70 px-4 py-2 font-mono text-[11px] font-bold backdrop-blur">
              <span className="size-2 rounded-full bg-danger text-danger animate-pulse-dot" /> {p.handle.toUpperCase()} · EN CABINA
            </div>
          </div>
          <img src={asset('assets/logo.svg')} alt="" className="absolute -right-8 -top-8 size-24 animate-spin-slow drop-shadow-2xl" />
        </motion.div>
      </div>
      <a href="#apps" aria-label="Bajar" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-ink-3 transition hover:text-ink sm:block">
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="block"><Icon name="chevron" size={24} /></motion.span>
      </a>
    </section>
  )
}

function Apps() {
  const apps = publishedApps()
  return (
    <section id="apps" className="scroll-mt-16 border-t border-line bg-bg-2/60 py-20 sm:py-28">
      <div className="container-x">
        <SectionHeader kicker="Catálogo de proyectos" title="Elige tu aplicación" intro="Cada app tiene su página con descargas oficiales, guía paso a paso, historial de versiones en vivo y código abierto." />
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {apps.map((a, i) => <AppCard key={a.slug} app={a} index={i} />)}
        </div>
      </div>
    </section>
  )
}

function Mixes() {
  if (!site.mixes.length) return null
  return (
    <section id="mixes" className="scroll-mt-16 py-20 sm:py-28">
      <div className="container-x">
        <SectionHeader kicker="Sesiones" title="Últimos mixes" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {site.mixes.map((m, i) => {
            const id = youtubeId(m.url)
            return (
              <Reveal key={m.url + i} delay={i * 0.06} className="card overflow-hidden">
                {id ? (
                  <iframe className="aspect-video w-full" src={`https://www.youtube-nocookie.com/embed/${id}`} title={m.title} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen />
                ) : (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="grid aspect-video place-items-center bg-surface-2 text-ink-2"><Icon name="play" size={40} /></a>
                )}
                <div className="p-4">
                  <p className="font-semibold">{m.title}</p>
                  {m.date && <p className="text-xs text-ink-3">{formatDate(m.date)}</p>}
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Events() {
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = site.events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  if (!upcoming.length) return null
  return (
    <section id="eventos" className="scroll-mt-16 border-t border-line py-20 sm:py-28">
      <div className="container-x max-w-4xl">
        <SectionHeader kicker="Agenda" title="Próximas fechas" />
        <ul className="space-y-3">
          {upcoming.map((e, i) => {
            const d = new Date(e.date + 'T12:00:00')
            return (
              <Reveal key={e.date + e.title} delay={i * 0.05}>
                <li className="card flex items-center gap-4 p-4 sm:gap-6 sm:p-5">
                  <div className="w-14 shrink-0 text-center">
                    <p className="font-display text-3xl font-black leading-none">{d.getDate()}</p>
                    <p className="font-mono text-[11px] uppercase text-cyan">{d.toLocaleDateString('es-ES', { month: 'short' })}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold sm:text-lg">{e.title}</p>
                    <p className="flex items-center gap-1 truncate text-sm text-ink-2"><Icon name="pin" size={14} /> {[e.venue, e.city].filter(Boolean).join(' · ')}</p>
                  </div>
                  {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3 !py-2 text-xs">Info <Icon name="external" size={12} /></a>}
                </li>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function About() {
  const p = site.profile
  const ig = site.socials.find((s) => s.id === 'instagram')
  return (
    <section id="sobre-mi" className="scroll-mt-16 border-t border-line py-20 sm:py-28">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-orange/30 to-cyan/30 blur-2xl" />
          <img src={asset(p.avatar)} alt={p.name} loading="lazy" className="relative aspect-[4/5] w-full rounded-[1.75rem] border border-line-strong object-cover" />
        </Reveal>
        <div>
          <Reveal>
            <p className="kicker mb-3">Detrás del proyecto</p>
            <h2 className="text-3xl font-extrabold sm:text-5xl">{p.aboutTitle}</h2>
            <p className="mt-2 font-mono text-sm text-orange">{p.aboutTagline}</p>
            <p className="mt-6 text-base leading-relaxed text-ink-2 sm:text-lg">{p.bio}</p>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {p.highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.06} className="card flex items-center gap-3 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/5 text-xl">{h.icon}</span>
                <span>
                  <span className="block text-sm font-semibold">{h.title}</span>
                  <span className="block text-xs text-ink-3">{h.text}</span>
                </span>
              </Reveal>
            ))}
          </div>
          {p.contactCta && (
            <Reveal className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-gradient-to-r from-cyan/10 to-orange/10 p-5 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm text-ink-2">{p.contactCta}</p>
              {ig && <a href={ig.url} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0"><Icon name="instagram" size={16} /> Escríbeme</a>}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  useMeta(`${site.profile.name} · Apps y herramientas DJ`)
  return (
    <>
      <Hero />
      <Apps />
      <Mixes />
      <Events />
      <About />
    </>
  )
}

export function NotFound() {
  useMeta('Página no encontrada · JaviLabarumDJ')
  return (
    <section className="grid min-h-[80svh] place-items-center px-4 pt-20 text-center">
      <div>
        <img src={asset('assets/logo.svg')} alt="" className="mx-auto mb-6 size-24 animate-spin-slow" />
        <p className="kicker mb-2">Error 404</p>
        <h1 className="text-4xl font-black sm:text-5xl">Este tema no está en la playlist</h1>
        <p className="mt-3 text-ink-2">La página que buscas no existe o ha cambiado de sitio.</p>
        <Link to="/" className="btn-primary mt-8">Volver al inicio</Link>
      </div>
    </section>
  )
}
