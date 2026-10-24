import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { accentVars, asset, findApp, publishedApps } from '../lib/content'
import { md, mdInline } from '../lib/markdown'
import { useMeta } from '../lib/useMeta'
import type { AppEntry } from '../lib/types'
import { Icon } from '../components/Icon'
import { Visualizer } from '../components/Visualizer'
import { Reveal, SectionHeader } from '../components/Reveal'
import { accentStyle, Changelog, DownloadHero, Gallery, LiveStats, AppCard, useLiveApp } from '../components/AppBits'
import { copyText, useToast } from '../components/Toast'
import { NotFound } from './Home'

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

function SubNav({ app }: { app: AppEntry }) {
  const links = [
    ['Capturas', 'capturas', app.screenshots.length],
    ['Funciones', 'funciones', app.features.length],
    ['Instalación', 'instalacion', app.steps.length],
    ['Requisitos', 'requisitos', app.specs.length],
    ['Novedades', 'novedades', app.repo],
    ['FAQ', 'faq', app.faq.length],
  ].filter(([, , show]) => show) as [string, string][]
  return (
    <nav className="sticky top-16 z-30 border-y border-line bg-bg/85 backdrop-blur-xl" aria-label="Secciones">
      <div className="container-x flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
        {links.map(([label, id]) => (
          <a key={id} href={`#${id}`} className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-ink-2 transition hover:bg-white/5 hover:text-ink">{label}</a>
        ))}
      </div>
    </nav>
  )
}

function CodeLine({ code }: { code: string }) {
  const toast = useToast()
  const [done, setDone] = useState(false)
  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-ink [scrollbar-width:thin]">{code}</code>
      <button
        className="grid size-8 shrink-0 place-items-center rounded-md text-ink-2 hover:bg-white/5 hover:text-ink"
        aria-label="Copiar comando"
        onClick={async () => {
          if (await copyText(code)) { setDone(true); toast('Comando copiado'); setTimeout(() => setDone(false), 1500) }
        }}
      >
        <Icon name={done ? 'check' : 'copy'} size={15} />
      </button>
    </div>
  )
}

function StickyMobileCta({ app }: { app: AppEntry }) {
  const live = useLiveApp(app)
  if (app.primaryCta.type !== 'release') return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 p-3 backdrop-blur-xl sm:hidden" style={{ paddingBottom: 'calc(.75rem + env(safe-area-inset-bottom))' }}>
      <a href={live.downloadUrl} data-track="download" data-track-app={app.slug} data-track-version={live.version} data-track-where="sticky" className="btn-primary w-full !py-3.5">
        <Icon name="download" size={18} /> {app.primaryCta.label} {live.size && <span className="font-mono text-xs opacity-75">· {live.size}</span>}
      </a>
    </div>
  )
}

export default function AppPage() {
  const { slug = '' } = useParams()
  const app = findApp(slug)
  useMeta(app ? `${app.name} · ${app.tagline} | JaviLabarumDJ` : 'JaviLabarumDJ', app?.summary)
  if (!app) return <NotFound />
  const others = publishedApps().filter((a) => a.slug !== app.slug)
  const rgb = hexToRgb(accentVars[app.accent]?.c ?? '#00e5ff')

  return (
    <div style={accentStyle(app)} className="pb-20 sm:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 sm:pt-32">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 size-[700px] -translate-x-1/2 rounded-full opacity-25 blur-[160px]" style={{ background: 'var(--accent)' }} />
        <Visualizer colors={[rgb, '155,123,255']} className="!h-[30%] opacity-60" />
        <div className="container-x relative">
          <Link to="/apps" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-3 transition hover:text-ink"><Icon name="back" size={16} /> Todas las apps</Link>
          <div className="grid items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center gap-3">
                <img src={asset(app.icon)} alt="" className="size-14 rounded-2xl shadow-[0_10px_40px_-10px_var(--accent)]" />
                <div className="flex flex-wrap gap-1.5">{app.tags.slice(0, 3).map((t) => <span key={t} className="chip">{t}</span>)}</div>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="text-4xl font-black leading-[1.02] sm:text-6xl xl:text-7xl">
                {app.name}
                <span className="mt-2 block bg-gradient-to-r from-[var(--accent)] to-orange bg-clip-text text-transparent">{app.tagline}</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="prose-dj mt-6 max-w-2xl text-base sm:text-lg" dangerouslySetInnerHTML={{ __html: mdInline(app.description) }} />
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:justify-self-end">
              <DownloadHero app={app} />
            </motion.div>
          </div>
          {app.badges.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {app.badges.map((b) => <span key={b} className="chip"><Icon name="check" size={12} className="text-[var(--accent)]" /> {b}</span>)}
            </div>
          )}
          <Reveal className="mt-10"><LiveStats app={app} /></Reveal>
          <div id="capturas" className="mx-auto max-w-5xl scroll-mt-32 py-14 sm:py-20"><Reveal><Gallery app={app} /></Reveal></div>
        </div>
      </section>

      <SubNav app={app} />

      {app.features.length > 0 && (
        <section id="funciones" className="scroll-mt-28 bg-bg-2/60 py-20 sm:py-28">
          <div className="container-x">
            <SectionHeader kicker="Características" title={app.featuresTitle} intro={app.featuresIntro} />
            <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
              {app.features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.06} className="card group relative overflow-hidden p-6 transition hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)] sm:p-8">
                  <div className="absolute -right-10 -top-10 size-40 rounded-full bg-[var(--accent)] opacity-0 blur-3xl transition duration-500 group-hover:opacity-15" />
                  <span className="mb-5 grid size-12 place-items-center rounded-xl bg-[var(--accent-soft)] text-2xl">{f.icon}</span>
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2 sm:text-[15px]">{f.text}</p>
                  {f.pill && <span className="mt-5 inline-block rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono text-[11px] font-bold text-[var(--accent)]">{f.pill}</span>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {app.steps.length > 0 && (
        <section id="instalacion" className="scroll-mt-28 py-20 sm:py-28">
          <div className="container-x">
            <SectionHeader kicker="Guía rápida" title={app.stepsTitle} />
            <ol className="grid gap-4 md:grid-cols-3 lg:gap-6">
              {app.steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.08} className="card relative min-w-0 p-6 sm:p-7">
                  <span className="font-display text-5xl font-black text-transparent" style={{ WebkitTextStroke: '1.5px var(--accent)' }}>{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-2">{s.text}</p>
                  {s.code && <CodeLine code={s.code} />}
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {app.specs.length > 0 && (
        <section id="requisitos" className="scroll-mt-28 border-t border-line bg-bg-2/60 py-20 sm:py-28">
          <div className="container-x max-w-5xl">
            <SectionHeader kicker="Especificaciones" title="Requisitos de hardware" />
            <Reveal className="card overflow-hidden">
              <div className="hidden grid-cols-[1fr_1fr_1.3fr] border-b border-line bg-white/[.02] px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-ink-3 sm:grid">
                <span>Componente</span><span>Mínimo</span><span className="text-[var(--accent)]">Recomendado</span>
              </div>
              {app.specs.map((s) => (
                <div key={s.component} className="grid gap-2 border-b border-line px-5 py-4 last:border-0 sm:grid-cols-[1fr_1fr_1.3fr] sm:items-center sm:gap-4 sm:px-6">
                  <p className="flex items-center gap-2.5 font-semibold"><span className="text-lg">{s.icon}</span>{s.component}</p>
                  <p className="text-sm text-ink-2"><span className="mr-2 font-mono text-[10px] uppercase text-ink-3 sm:hidden">Mín.</span>{s.min}</p>
                  <div className="text-sm">
                    <p className="font-semibold"><span className="mr-2 font-mono text-[10px] uppercase text-[var(--accent)] sm:hidden">Rec.</span>{s.rec}</p>
                    {s.recDetail && <p className="text-xs text-ink-3">{s.recDetail}</p>}
                  </div>
                </div>
              ))}
            </Reveal>
            {app.tip && (
              <Reveal className="mt-6 flex gap-4 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--accent-soft)] p-5">
                <span className="text-2xl">💡</span>
                <div className="prose-dj text-sm" dangerouslySetInnerHTML={{ __html: md(app.tip) }} />
              </Reveal>
            )}
          </div>
        </section>
      )}

      {app.repo && (
        <section id="novedades" className="scroll-mt-28 border-t border-line py-20 sm:py-28">
          <div className="container-x max-w-3xl">
            <SectionHeader kicker="Changelog en vivo" title="Novedades" intro="Sincronizado automáticamente con las releases de GitHub." />
            <Changelog app={app} />
          </div>
        </section>
      )}

      {app.faq.length > 0 && (
        <section id="faq" className="scroll-mt-28 border-t border-line bg-bg-2/60 py-20 sm:py-28">
          <div className="container-x max-w-3xl">
            <SectionHeader kicker="Dudas habituales" title="Preguntas frecuentes" />
            <div className="space-y-3">
              {app.faq.map((f, i) => (
                <Reveal key={f.q} delay={i * 0.04}>
                  <details className="card group p-0 [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold">
                      {f.q}
                      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-[var(--accent)] transition group-open:rotate-45"><Icon name="plus" size={14} /></span>
                    </summary>
                    <div className="prose-dj px-5 pb-5 text-sm" dangerouslySetInnerHTML={{ __html: md(f.a) }} />
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="border-t border-line py-20 sm:py-28">
          <div className="container-x">
            <SectionHeader kicker="Más proyectos" title="También te puede interesar" />
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
              {others.slice(0, 2).map((a, i) => <AppCard key={a.slug} app={a} index={i} />)}
            </div>
          </div>
        </section>
      )}

      <StickyMobileCta app={app} />
    </div>
  )
}
