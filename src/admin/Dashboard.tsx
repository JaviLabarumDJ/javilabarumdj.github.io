import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { formatNumber, timeAgo } from '../lib/format'
import { stableReleases, totalDownloads, useReleases, useRepo } from '../lib/github'
import type { AppEntry } from '../lib/types'
import type { Traffic, WorkflowRun } from './api'
import { BarChart } from './BarChart'
import { useAdmin } from './store'
import { Panel } from './ui'

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold sm:text-3xl">{value}</p>
      {sub && <p className="mt-0.5 truncate text-xs text-ink-3">{sub}</p>}
    </div>
  )
}

function AppStats({ app }: { app: AppEntry }) {
  const { api } = useAdmin()
  const rel = useReleases(app.repo)
  const repo = useRepo(app.repo)
  const [traffic, setTraffic] = useState<Traffic | null>(null)
  useEffect(() => { api.traffic(app.repo).then(setTraffic).catch(() => setTraffic(null)) }, [api, app.repo])
  const list = stableReleases(rel.data)
  const perRelease = list.slice(0, 10).reverse().map((r) => ({
    label: r.tag_name.replace(/-android$/, ''),
    value: r.assets.reduce((s, a) => s + a.download_count, 0),
  }))
  const perDay = (traffic?.views ?? []).map((v) => ({ label: new Date(v.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' }), value: v.count }))

  return (
    <Panel title={app.name} desc={app.repo} actions={<Link to={`/admin/apps/${app.slug}`} className="btn-ghost !px-3 !py-1.5 text-xs">Editar</Link>}>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Descargas" value={rel.loading ? '…' : formatNumber(totalDownloads(list))} sub="Todas las releases" />
        <Stat label="Última versión" value={list[0]?.tag_name.replace(/-android$/, '') ?? '—'} sub={list[0] ? timeAgo(list[0].published_at) : ''} />
        <Stat label="Estrellas" value={repo.data ? formatNumber(repo.data.stargazers_count) : '…'} sub={repo.data ? `${repo.data.forks_count} forks` : ''} />
        <Stat label="Visitas GitHub" value={traffic ? formatNumber(traffic.count) : '—'} sub={traffic ? `${traffic.uniques} únicas · 14 días` : 'Sin permisos de tráfico'} />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {perRelease.some((d) => d.value) && <BarChart title="Descargas por versión" unit="Descargas" data={perRelease} />}
        {perDay.length > 0 && <BarChart title="Visitas diarias al repositorio" unit="Visitas" data={perDay} />}
      </div>
    </Panel>
  )
}

function Deploys() {
  const { api } = useAdmin()
  const [runs, setRuns] = useState<WorkflowRun[] | null>(null)
  useEffect(() => {
    let alive = true
    const load = () => api.runs().then((r) => alive && setRuns(r)).catch(() => alive && setRuns([]))
    load()
    const id = setInterval(load, 15000)
    return () => { alive = false; clearInterval(id) }
  }, [api])
  const badge = (r: WorkflowRun) =>
    r.status !== 'completed' ? ['En curso', 'text-cyan', 'refresh'] : r.conclusion === 'success' ? ['Publicado', 'text-ok', 'check'] : ['Fallido', 'text-danger', 'close']
  return (
    <Panel title="Despliegues" desc="Cada publicación reconstruye la web en GitHub Actions (≈1 min).">
      {!runs ? <div className="skeleton h-24" /> : !runs.length ? <p className="text-sm text-ink-3">Aún no hay despliegues.</p> : (
        <ul className="divide-y divide-line">
          {runs.map((r) => {
            const [label, cls, icon] = badge(r)
            return (
              <li key={r.id} className="flex items-center gap-3 py-2.5">
                <span className={`flex w-24 shrink-0 items-center gap-1.5 text-xs font-semibold ${cls}`}>
                  <Icon name={icon} size={14} className={r.status !== 'completed' ? 'animate-spin' : ''} /> {label}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{r.display_title}</span>
                <span className="hidden shrink-0 text-xs text-ink-3 sm:inline">{timeAgo(r.created_at)}</span>
                <a href={r.html_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-ink-3 hover:text-ink" aria-label="Ver en GitHub"><Icon name="external" size={14} /></a>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

export default function Dashboard() {
  const { draft, user } = useAdmin()
  const apps = draft.apps.filter((a) => a.repo)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Hola, {user.name?.split(' ')[0] ?? user.login} 👋</h1>
        <p className="mt-1 text-sm text-ink-2">Resumen en vivo de tus apps y de la web.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Apps publicadas" value={String(draft.apps.filter((a) => a.published).length)} sub={`${draft.apps.length} en total`} />
        <Stat label="Redes" value={String(draft.socials.length)} />
        <Stat label="Mixes" value={String(draft.mixes.length)} />
        <Stat label="Próximas fechas" value={String(draft.events.filter((e) => e.date >= new Date().toISOString().slice(0, 10)).length)} />
      </div>
      <Deploys />
      {apps.map((a) => <AppStats key={a.slug} app={a} />)}
    </div>
  )
}
