import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import type { AppEntry } from '../lib/types'
import { accentVars, asset } from '../lib/content'
import { pickAsset, stableReleases, totalDownloads, useReleases, useRepo, type Release } from '../lib/github'
import { formatBytes, formatDate, formatNumber, timeAgo } from '../lib/format'
import { md } from '../lib/markdown'
import { Icon } from './Icon'
import { copyText, useToast } from './Toast'

export const accentStyle = (a: AppEntry) =>
  ({ '--accent': accentVars[a.accent]?.c ?? accentVars.cyan.c, '--accent-soft': accentVars[a.accent]?.soft }) as CSSProperties

/** Datos en vivo de la última release (con valores de respaldo del contenido). */
export function useLiveApp(app: AppEntry) {
  const releases = useReleases(app.repo)
  const repo = useRepo(app.repo)
  const stable = stableReleases(releases.data)
  const latest = stable[0]
  const file = pickAsset(latest, app.assetPattern)
  const version = latest ? latest.tag_name.replace(/-android$/, '') : app.fallback.version
  return {
    loading: releases.loading,
    releases: stable,
    latest,
    version,
    size: file ? formatBytes(file.size) : app.fallback.size,
    downloadUrl: file?.browser_download_url ?? app.fallback.url,
    fileName: file?.name,
    downloads: totalDownloads(stable),
    stars: repo.data?.stargazers_count,
    updated: latest?.published_at ?? repo.data?.pushed_at,
  }
}

export function primaryHref(app: AppEntry, live: ReturnType<typeof useLiveApp>) {
  if (app.primaryCta.type === 'release') return live.downloadUrl
  if (app.primaryCta.type === 'url' && app.primaryCta.url) return app.primaryCta.url
  return `https://github.com/${app.repo}`
}

export function DownloadHero({ app }: { app: AppEntry }) {
  const live = useLiveApp(app)
  const toast = useToast()
  const isRelease = app.primaryCta.type === 'release'
  const href = primaryHref(app, live)

  const share = async () => {
    const url = location.href
    if (navigator.share) {
      try { await navigator.share({ title: app.name, text: app.summary, url }); return } catch { /* cancelado */ }
    }
    if (await copyText(url)) toast('Enlace copiado al portapapeles')
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto">
      <a
        href={href}
        data-track={isRelease ? 'download' : 'open-repo'}
        data-track-app={app.slug}
        data-track-version={live.version}
        data-track-where="hero"
        {...(isRelease ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 pr-6 text-bg shadow-[0_20px_60px_-15px_var(--accent)] transition hover:brightness-110 active:scale-[.99] sm:min-w-[360px]"
        style={{ background: 'linear-gradient(120deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #fff))' }}
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-bg/15">
          <Icon name={isRelease ? 'download' : 'github'} size={24} className={isRelease ? 'transition group-hover:translate-y-0.5' : ''} />
        </span>
        <span className="min-w-0 text-left">
          <span className="block font-display text-lg font-extrabold uppercase tracking-wide">{app.primaryCta.label}</span>
          <span className="block truncate font-mono text-xs font-bold opacity-75">
            {isRelease
              ? [live.version, live.size, 'Gratis'].filter(Boolean).join(' · ')
              : `${app.repo} · ${app.license}`}
          </span>
        </span>
        <span className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/30 transition-all duration-700 group-hover:left-[120%]" />
      </a>
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost flex-1 !py-2.5" data-track="share" data-track-app={app.slug} onClick={share}><Icon name="share" size={16} /> Compartir</button>
        {live.latest ? (
          <a className="btn-ghost flex-1 !py-2.5" href="#novedades"><Icon name="tag" size={16} /> Novedades</a>
        ) : (
          <a className="btn-ghost flex-1 !py-2.5" href={`https://github.com/${app.repo}`} target="_blank" rel="noopener noreferrer"><Icon name="github" size={16} /> Código</a>
        )}
      </div>
    </div>
  )
}

export function LiveStats({ app }: { app: AppEntry }) {
  const live = useLiveApp(app)
  const stats = [
    live.version && { k: 'Versión', v: live.version },
    live.downloads > 0 && { k: 'Descargas', v: formatNumber(live.downloads) },
    live.stars !== undefined && { k: 'Estrellas', v: formatNumber(live.stars) },
    live.updated && { k: 'Actualizado', v: timeAgo(live.updated) },
    { k: 'Licencia', v: app.license },
  ].filter(Boolean) as { k: string; v: string }[]
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <div key={s.k} className="bg-surface/90 px-4 py-4 sm:px-5">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">{s.k}</dt>
          <dd className="mt-1 font-display text-xl font-bold first-letter:uppercase sm:text-2xl">{s.v}</dd>
        </div>
      ))}
      {live.loading && <div className="skeleton col-span-full h-2" />}
    </dl>
  )
}

export function Gallery({ app }: { app: AppEntry }) {
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState(false)
  const shots = app.screenshots
  const go = useCallback((d: number) => setI((x) => (x + d + shots.length) % shots.length), [shots.length])

  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [zoom, go])

  if (!shots.length) return null
  const s = shots[i]

  return (
    <div className="w-full">
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0" role="tablist">
        {shots.map((sh, idx) => (
          <button
            key={sh.src}
            role="tab"
            aria-selected={idx === i}
            onClick={() => setI(idx)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              idx === i ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-ink' : 'border-line text-ink-2 hover:border-line-strong hover:text-ink'
            }`}
          >
            <span>{sh.icon}</span>{sh.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_40px_120px_-40px_var(--accent)]">
        <div className="flex items-center gap-3 border-b border-line bg-bg-2 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" /><span className="size-2.5 rounded-full bg-[#febc2e]" /><span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <p className="min-w-0 flex-1 truncate text-center font-mono text-[11px] text-ink-3">{app.shortName} · {s.title}</p>
          <span className="hidden rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--accent)] sm:inline">LIVE</span>
        </div>
        <motion.div
          className="relative cursor-zoom-in touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 60) go(info.offset.x < 0 ? 1 : -1) }}
          onClick={() => setZoom(true)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={s.src}
              src={asset(s.src)}
              alt={s.title}
              draggable={false}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="block aspect-[16/10] w-full select-none bg-bg object-contain"
            />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
            <div className="max-w-[80%] rounded-xl border border-white/10 bg-bg/80 px-3 py-2 backdrop-blur sm:px-4 sm:py-3">
              <p className="text-xs font-bold text-[var(--accent)] sm:text-sm">{s.title}</p>
              <p className="hidden text-xs text-ink-2 sm:block">{s.caption}</p>
            </div>
            <span className="rounded-full bg-bg/70 px-2.5 py-1 font-mono text-[10px] text-ink-2 backdrop-blur">{i + 1}/{shots.length}</span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {zoom && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-2 backdrop-blur sm:p-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
            role="dialog" aria-modal="true" aria-label={s.title}
          >
            <img src={asset(s.src)} alt={s.title} className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
            <button className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10" aria-label="Cerrar"><Icon name="close" /></button>
            <button className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 sm:left-6" aria-label="Anterior" onClick={(e) => { e.stopPropagation(); go(-1) }}><Icon name="left" /></button>
            <button className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 sm:right-6" aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); go(1) }}><Icon name="right" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Changelog({ app }: { app: AppEntry }) {
  const releases = useReleases(app.repo)
  const list = stableReleases(releases.data)
  const [showAll, setShowAll] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  useEffect(() => { if (list[0] && open === null) setOpen(list[0].tag_name) }, [list, open])
  if (releases.loading) return <div className="space-y-3">{[0, 1, 2].map((k) => <div key={k} className="skeleton h-16" />)}</div>
  if (!list.length) return null
  const shown = showAll ? list : list.slice(0, 4)

  return (
    <ol className="relative space-y-3 border-l border-line pl-6 sm:pl-8">
      {shown.map((r: Release, idx) => {
        const isOpen = open === r.tag_name
        const file = pickAsset(r, app.assetPattern)
        const dl = r.assets.reduce((s, a) => s + a.download_count, 0)
        return (
          <li key={r.tag_name} className="relative">
            <span className={`absolute -left-[31px] top-5 size-3 rounded-full border-2 border-bg sm:-left-[39px] ${idx === 0 ? 'bg-[var(--accent)] animate-pulse-dot text-[var(--accent)]' : 'bg-ink-3'}`} />
            <div className="card overflow-hidden">
              <button className="flex w-full items-center gap-3 p-4 text-left sm:p-5" onClick={() => setOpen(isOpen ? '' : r.tag_name)} aria-expanded={isOpen}>
                <span className="font-mono text-sm font-bold text-[var(--accent)]">{r.tag_name.replace(/-android$/, '')}</span>
                {idx === 0 && <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--accent)]">Última</span>}
                <span className="min-w-0 flex-1 truncate text-sm text-ink-2">{r.name && r.name !== r.tag_name ? r.name : ''}</span>
                <span className="hidden text-xs text-ink-3 sm:inline">{formatDate(r.published_at)}</span>
                <Icon name="chevron" size={16} className={`shrink-0 text-ink-3 transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="border-t border-line px-4 pb-5 pt-3 sm:px-5">
                      {r.body ? <div className="prose-dj text-sm" dangerouslySetInnerHTML={{ __html: md(r.body) }} /> : <p className="text-sm text-ink-3">Sin notas para esta versión.</p>}
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-3">
                        <span className="sm:hidden">{formatDate(r.published_at)} ·</span>
                        {dl > 0 && <span>{formatNumber(dl)} descargas</span>}
                        <span className="flex-1" />
                        {file && <a href={file.browser_download_url} data-track="download" data-track-app={app.slug} data-track-version={r.tag_name.replace(/-android$/, '')} data-track-where="changelog" className="btn-ghost !px-3 !py-1.5 !text-xs"><Icon name="download" size={14} /> {formatBytes(file.size)}</a>}
                        <a href={r.html_url} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3 !py-1.5 !text-xs">GitHub <Icon name="external" size={12} /></a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </li>
        )
      })}
      {list.length > 4 && (
        <li><button className="btn-ghost !py-2 text-xs" onClick={() => setShowAll((s) => !s)}>{showAll ? 'Ver menos' : `Ver las ${list.length} versiones`}</button></li>
      )}
    </ol>
  )
}

export function AppCard({ app, index = 0 }: { app: AppEntry; index?: number }) {
  const live = useLiveApp(app)
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={accentStyle(app)}
      className="group card relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] hover:shadow-[0_30px_80px_-30px_var(--accent)]"
    >
      <Link to={`/${app.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-bg" tabIndex={-1} aria-hidden="true">
        <img src={asset(app.cover)} alt="" loading="lazy" className="size-full object-cover object-top transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        {live.version && (
          <span className="absolute left-4 top-4 rounded-full border border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-bg/80 px-3 py-1 font-mono text-[11px] font-bold text-[var(--accent)] backdrop-blur">
            {live.version}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <img src={asset(app.icon)} alt="" className="size-11 rounded-xl" />
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold sm:text-2xl">
              <Link to={`/${app.slug}`} className="after:absolute after:inset-0">{app.name}</Link>
            </h3>
            <p className="text-sm text-[var(--accent)]">{app.tagline}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-ink-2 sm:text-[15px]">{app.summary}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {app.tags.map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
        <div className="relative z-10 mt-auto flex flex-wrap items-center gap-3 pt-6">
          <Link to={`/${app.slug}`} className="btn-primary">Ver app <Icon name="arrow" size={16} /></Link>
          <a href={primaryHref(app, live)} className="btn-ghost" data-track={app.primaryCta.type === 'release' ? 'download' : 'open-repo'} data-track-app={app.slug} data-track-version={live.version} data-track-where="card" {...(app.primaryCta.type === 'release' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
            <Icon name={app.primaryCta.type === 'release' ? 'download' : 'github'} size={16} />
            {app.primaryCta.type === 'release' ? live.size || 'Descargar' : 'GitHub'}
          </a>
          {live.downloads > 0 && <span className="ml-auto font-mono text-xs text-ink-3">{formatNumber(live.downloads)} descargas</span>}
        </div>
      </div>
    </motion.article>
  )
}
