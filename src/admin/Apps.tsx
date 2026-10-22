import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { asset } from '../lib/content'
import type { Accent, AppEntry, Step } from '../lib/types'
import { useAdmin } from './store'
import { Area, Field, Grid, IconBtn, ImageField, ListEditor, Panel, Select, TagsField, Toggle } from './ui'

const accents: { value: Accent; label: string }[] = [
  { value: 'cyan', label: 'Cian' }, { value: 'teal', label: 'Turquesa' }, { value: 'orange', label: 'Naranja' },
  { value: 'purple', label: 'Violeta' }, { value: 'pink', label: 'Rosa' }, { value: 'green', label: 'Verde' },
]

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const RESERVED = ['apps', 'admin', 'assets', 'uploads', 'sobre-mi', 'static']

const blankApp = (name: string, slug: string): AppEntry => ({
  slug, published: false, name, shortName: name, accent: 'purple', category: 'dj', icon: 'assets/logo.svg', cover: '',
  tagline: '', summary: '', description: '', tags: [], license: 'MIT', repo: '', assetPattern: '',
  primaryCta: { label: 'Ver en GitHub', type: 'repo' }, fallback: { version: '', url: '', size: '' }, badges: [],
  screenshots: [], featuresTitle: 'Características', featuresIntro: '', features: [], stepsTitle: 'Cómo empezar', steps: [],
  specs: [], tip: '', faq: [],
})

export function AppsList() {
  const { draft, update } = useAdmin()
  const nav = useNavigate()
  const create = () => {
    const name = prompt('Nombre de la nueva app')?.trim()
    if (!name) return
    let slug = slugify(name)
    if (RESERVED.includes(slug)) slug += '-app'
    while (draft.apps.some((a) => a.slug === slug)) slug += '-2'
    update((d) => { d.apps.push(blankApp(name, slug)) })
    nav(`/admin/apps/${slug}`)
  }
  const move = (i: number, dir: number) => update((d) => {
    const j = i + dir
    if (j < 0 || j >= d.apps.length) return
    ;[d.apps[i], d.apps[j]] = [d.apps[j], d.apps[i]]
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Aplicaciones</h1>
          <p className="mt-1 text-sm text-ink-2">El orden de esta lista es el orden en la web.</p>
        </div>
        <button className="btn-primary" onClick={create}><Icon name="plus" size={16} /> Nueva app</button>
      </div>
      <ul className="space-y-3">
        {draft.apps.map((a, i) => (
          <li key={a.slug} className="card flex items-center gap-3 p-3 sm:p-4">
            <img src={asset(a.icon)} alt="" className="size-12 shrink-0 rounded-xl bg-bg" />
            <Link to={`/admin/apps/${a.slug}`} className="min-w-0 flex-1">
              <p className="truncate font-semibold">{a.name}</p>
              <p className="truncate text-xs text-ink-3">/{a.slug} · {a.tagline || 'Sin eslogan'}</p>
            </Link>
            <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline ${a.published ? 'bg-ok/15 text-ok' : 'bg-white/5 text-ink-3'}`}>
              {a.published ? 'Publicada' : 'Borrador'}
            </span>
            <IconBtn icon="up" label="Subir" onClick={() => move(i, -1)} disabled={i === 0} />
            <IconBtn icon="down" label="Bajar" onClick={() => move(i, 1)} disabled={i === draft.apps.length - 1} />
            <Link to={`/admin/apps/${a.slug}`} className="btn-ghost !px-3 !py-2 text-xs">Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const tabs = ['General', 'Descarga', 'Capturas', 'Funciones', 'Instalación', 'Requisitos', 'FAQ'] as const

export function AppEditor() {
  const { slug } = useParams()
  const { draft, update } = useAdmin()
  const nav = useNavigate()
  const [tab, setTab] = useState<(typeof tabs)[number]>('General')
  const idx = draft.apps.findIndex((a) => a.slug === slug)
  const app = draft.apps[idx]
  if (!app) return <p className="text-ink-2">App no encontrada. <Link className="text-cyan" to="/admin/apps">Volver</Link></p>

  const set = (patch: Partial<AppEntry>) => update((d) => { Object.assign(d.apps[idx], patch) })
  const remove = () => {
    if (!confirm(`¿Eliminar «${app.name}» del sitio? (Se aplica al publicar)`)) return
    update((d) => { d.apps.splice(idx, 1) })
    nav('/admin/apps')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/admin/apps" className="grid size-10 place-items-center rounded-lg border border-line text-ink-2 hover:text-ink" aria-label="Volver"><Icon name="back" /></Link>
        <img src={asset(app.icon)} alt="" className="size-10 rounded-lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black sm:text-2xl">{app.name}</h1>
          <a href={`/${app.slug}`} target="_blank" rel="noopener" className="text-xs text-ink-3 hover:text-cyan">/{app.slug} <Icon name="external" size={10} className="inline" /></a>
        </div>
        <Toggle label={app.published ? 'Publicada' : 'Oculta'} checked={app.published} onChange={(v) => set({ published: v })} />
      </div>

      <div className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition ${tab === t ? 'border-cyan text-ink' : 'border-transparent text-ink-3 hover:text-ink'}`}>{t}</button>
        ))}
      </div>

      {tab === 'General' && (
        <div className="space-y-5">
          <Panel title="Identidad">
            <div className="space-y-3">
              <Grid>
                <Field label="Nombre" value={app.name} onChange={(v) => set({ name: v })} />
                <Field label="Nombre corto" value={app.shortName} onChange={(v) => set({ shortName: v })} />
                <Field label="Eslogan" value={app.tagline} onChange={(v) => set({ tagline: v })} />
                <Field label="Categoría" hint="dj, audio, tools…" value={app.category} onChange={(v) => set({ category: v })} />
                <Select label="Color de acento" value={app.accent} onChange={(v) => set({ accent: v })} options={accents} />
                <Field label="Licencia" value={app.license} onChange={(v) => set({ license: v })} />
              </Grid>
              <div>
                <label htmlFor="slug" className="mb-1.5 block text-xs font-semibold text-ink-2">URL (slug)</label>
                <input
                  id="slug" key={app.slug} defaultValue={app.slug}
                  className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 font-mono text-xs outline-none focus:border-cyan/60"
                  onBlur={(e) => {
                    const s = slugify(e.target.value)
                    if (s === app.slug) return
                    if (!s || RESERVED.includes(s) || draft.apps.some((a, k) => k !== idx && a.slug === s)) { e.target.value = app.slug; return }
                    set({ slug: s })
                    nav(`/admin/apps/${s}`, { replace: true })
                  }}
                />
                <p className="mt-1 text-[11px] text-ink-3">Se aplica al salir del campo. Cambiarlo rompe los enlaces existentes.</p>
              </div>
              <Area label="Resumen (tarjeta)" value={app.summary} onChange={(v) => set({ summary: v })} />
              <Area label="Descripción (cabecera)" hint="Admite **negrita**, *cursiva* y [enlaces](https://…)." value={app.description} onChange={(v) => set({ description: v })} />
              <TagsField label="Etiquetas" value={app.tags} onChange={(v) => set({ tags: v })} />
              <TagsField label="Sellos de confianza" value={app.badges} onChange={(v) => set({ badges: v })} />
            </div>
          </Panel>
          <Panel title="Imágenes">
            <Grid>
              <ImageField label="Icono" value={app.icon} onChange={(v) => set({ icon: v })} />
              <ImageField label="Portada (tarjeta)" value={app.cover} onChange={(v) => set({ cover: v })} />
            </Grid>
          </Panel>
          <Panel title="Zona peligrosa">
            <button className="btn !border !border-danger/40 !text-danger hover:!bg-danger/10" onClick={remove}><Icon name="trash" size={16} /> Eliminar app</button>
          </Panel>
        </div>
      )}

      {tab === 'Descarga' && (
        <Panel title="Botón principal y releases" desc="La versión, el tamaño, las descargas y el changelog se leen en vivo desde las releases de GitHub.">
          <div className="space-y-3">
            <Grid>
              <Field label="Repositorio GitHub" mono placeholder="usuario/repo" value={app.repo} onChange={(v) => set({ repo: v.trim() })} />
              <Field label="Patrón del archivo descargable" mono hint="Regex sobre el nombre del asset. Ej: \.apk$" value={app.assetPattern} onChange={(v) => set({ assetPattern: v })} />
              <Select
                label="Tipo de botón"
                value={app.primaryCta.type}
                onChange={(v) => set({ primaryCta: { ...app.primaryCta, type: v } })}
                options={[{ value: 'release', label: 'Descargar última release' }, { value: 'repo', label: 'Abrir repositorio' }, { value: 'url', label: 'URL personalizada' }]}
              />
              <Field label="Texto del botón" value={app.primaryCta.label} onChange={(v) => set({ primaryCta: { ...app.primaryCta, label: v } })} />
              {app.primaryCta.type === 'url' && <Field label="URL del botón" mono value={app.primaryCta.url ?? ''} onChange={(v) => set({ primaryCta: { ...app.primaryCta, url: v } })} />}
            </Grid>
            <p className="pt-2 text-xs font-semibold text-ink-2">Valores de respaldo (si la API de GitHub no responde)</p>
            <Grid>
              <Field label="Versión" value={app.fallback.version} onChange={(v) => set({ fallback: { ...app.fallback, version: v } })} />
              <Field label="Tamaño" value={app.fallback.size} onChange={(v) => set({ fallback: { ...app.fallback, size: v } })} />
            </Grid>
            <Field label="URL de descarga" mono value={app.fallback.url} onChange={(v) => set({ fallback: { ...app.fallback, url: v } })} />
          </div>
        </Panel>
      )}

      {tab === 'Capturas' && (
        <Panel title="Galería de capturas">
          <ListEditor
            items={app.screenshots}
            onChange={(v) => set({ screenshots: v })}
            title={(s) => `${s.icon} ${s.label}`}
            create={() => ({ src: '', label: 'Nueva captura', icon: '🖼️', title: '', caption: '' })}
            addLabel="Añadir captura"
            render={(s, upd) => (
              <>
                <ImageField label="Imagen" value={s.src} onChange={(v) => upd({ src: v })} />
                <Grid>
                  <Field label="Pestaña" value={s.label} onChange={(v) => upd({ label: v })} />
                  <Field label="Emoji" value={s.icon} onChange={(v) => upd({ icon: v })} />
                  <Field label="Título" value={s.title} onChange={(v) => upd({ title: v })} />
                  <Field label="Pie" value={s.caption} onChange={(v) => upd({ caption: v })} />
                </Grid>
              </>
            )}
          />
        </Panel>
      )}

      {tab === 'Funciones' && (
        <Panel title="Características">
          <div className="mb-4 space-y-3">
            <Field label="Título de la sección" value={app.featuresTitle} onChange={(v) => set({ featuresTitle: v })} />
            <Area label="Introducción" value={app.featuresIntro} onChange={(v) => set({ featuresIntro: v })} rows={2} />
          </div>
          <ListEditor
            items={app.features}
            onChange={(v) => set({ features: v })}
            title={(f) => `${f.icon} ${f.title}`}
            create={() => ({ icon: '✨', title: '', text: '', pill: '' })}
            addLabel="Añadir característica"
            render={(f, upd) => (
              <>
                <Grid>
                  <Field label="Título" value={f.title} onChange={(v) => upd({ title: v })} />
                  <Field label="Emoji" value={f.icon} onChange={(v) => upd({ icon: v })} />
                </Grid>
                <Area label="Texto" value={f.text} onChange={(v) => upd({ text: v })} />
                <Field label="Etiqueta" value={f.pill} onChange={(v) => upd({ pill: v })} />
              </>
            )}
          />
        </Panel>
      )}

      {tab === 'Instalación' && (
        <Panel title="Pasos de instalación">
          <Field className="mb-4" label="Título de la sección" value={app.stepsTitle} onChange={(v) => set({ stepsTitle: v })} />
          <ListEditor
            items={app.steps}
            onChange={(v) => set({ steps: v })}
            title={(s, i) => `${i + 1}. ${s.title}`}
            create={(): Step => ({ title: '', text: '' })}
            addLabel="Añadir paso"
            render={(s, upd) => (
              <>
                <Field label="Título" value={s.title} onChange={(v) => upd({ title: v })} />
                <Area label="Texto" value={s.text} onChange={(v) => upd({ text: v })} rows={2} />
                <Field label="Comando (opcional, con botón copiar)" mono value={s.code ?? ''} onChange={(v) => upd({ code: v || undefined })} />
              </>
            )}
          />
        </Panel>
      )}

      {tab === 'Requisitos' && (
        <Panel title="Requisitos de hardware" desc="Déjalo vacío para ocultar la sección.">
          <ListEditor
            items={app.specs}
            onChange={(v) => set({ specs: v })}
            title={(s) => `${s.icon} ${s.component}`}
            create={() => ({ icon: '⚙️', component: '', min: '', rec: '', recDetail: '' })}
            addLabel="Añadir requisito"
            render={(s, upd) => (
              <Grid>
                <Field label="Componente" value={s.component} onChange={(v) => upd({ component: v })} />
                <Field label="Emoji" value={s.icon} onChange={(v) => upd({ icon: v })} />
                <Field label="Mínimo" value={s.min} onChange={(v) => upd({ min: v })} />
                <Field label="Recomendado" value={s.rec} onChange={(v) => upd({ rec: v })} />
                <Field label="Detalle recomendado" value={s.recDetail} onChange={(v) => upd({ recDetail: v })} className="sm:col-span-2" />
              </Grid>
            )}
          />
          <Area className="mt-4" label="Consejo destacado" hint="Admite Markdown." value={app.tip} onChange={(v) => set({ tip: v })} />
        </Panel>
      )}

      {tab === 'FAQ' && (
        <Panel title="Preguntas frecuentes">
          <ListEditor
            items={app.faq}
            onChange={(v) => set({ faq: v })}
            title={(f) => f.q}
            create={() => ({ q: '', a: '' })}
            addLabel="Añadir pregunta"
            render={(f, upd) => (
              <>
                <Field label="Pregunta" value={f.q} onChange={(v) => upd({ q: v })} />
                <Area label="Respuesta" hint="Admite Markdown." value={f.a} onChange={(v) => upd({ a: v })} />
              </>
            )}
          />
        </Panel>
      )}
    </div>
  )
}
