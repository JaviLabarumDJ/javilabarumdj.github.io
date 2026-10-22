import { useState } from 'react'
import { Icon, socialIds } from '../components/Icon'
import { useToast } from '../components/Toast'
import type { SiteContent } from '../lib/types'
import { useAdmin } from './store'
import { Area, Field, Grid, ImageField, ListEditor, Panel, Select, TagsField, Toggle } from './ui'

export function ProfileView() {
  const { draft, update } = useAdmin()
  const p = draft.profile
  const set = (patch: Partial<typeof p>) => update((d) => { Object.assign(d.profile, patch) })
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black sm:text-3xl">Perfil y portada</h1>
      <Panel title="Identidad">
        <div className="space-y-3">
          <Grid>
            <Field label="Nombre" value={p.name} onChange={(v) => set({ name: v })} />
            <Field label="Usuario" value={p.handle} onChange={(v) => set({ handle: v })} />
            <Field label="Rol" value={p.role} onChange={(v) => set({ role: v })} />
          </Grid>
          <ImageField label="Foto" value={p.avatar} onChange={(v) => set({ avatar: v })} />
        </div>
      </Panel>
      <Panel title="Portada (hero)">
        <div className="space-y-3">
          <Grid>
            <Field label="Título" value={p.heroTitle} onChange={(v) => set({ heroTitle: v })} />
            <Field label="Título destacado (degradado)" value={p.heroHighlight} onChange={(v) => set({ heroHighlight: v })} />
          </Grid>
          <Area label="Subtítulo" value={p.heroSubtitle} onChange={(v) => set({ heroSubtitle: v })} />
        </div>
      </Panel>
      <Panel title="Sobre mí" desc="Se muestra en la portada y en la página /sobre-mi.">
        <div className="space-y-3">
          <Grid>
            <Field label="Título" value={p.aboutTitle} onChange={(v) => set({ aboutTitle: v })} />
            <Field label="Subtítulo" value={p.aboutTagline} onChange={(v) => set({ aboutTagline: v })} />
            <Field label="Ubicación" value={p.location} onChange={(v) => set({ location: v })} />
            <Field label="Pinchando desde (año)" value={p.since} onChange={(v) => set({ since: v.replace(/\D/g, '').slice(0, 4) })} />
          </Grid>
          <TagsField label="Tres palabras que te definen" value={p.words} onChange={(v) => set({ words: v })} />
          <TagsField label="Estilos / géneros" value={p.genres} onChange={(v) => set({ genres: v })} />
          <Area label="Bio corta" hint="Resumen de 2-3 frases para la portada." rows={4} value={p.bio} onChange={(v) => set({ bio: v })} />
          <Area label="Historia completa" hint="Admite Markdown. Separa párrafos con una línea en blanco." rows={12} value={p.story} onChange={(v) => set({ story: v })} />
          <Area label="Llamada a contacto" rows={2} value={p.contactCta} onChange={(v) => set({ contactCta: v })} />
          <p className="pt-2 text-xs font-semibold text-ink-2">Destacados</p>
          <ListEditor
            items={p.highlights}
            onChange={(v) => set({ highlights: v })}
            title={(h) => `${h.icon} ${h.title}`}
            create={() => ({ icon: '⭐', title: '', text: '' })}
            render={(h, upd) => (
              <Grid>
                <Field label="Título" value={h.title} onChange={(v) => upd({ title: v })} />
                <Field label="Emoji" value={h.icon} onChange={(v) => upd({ icon: v })} />
                <Field label="Texto" value={h.text} onChange={(v) => upd({ text: v })} className="sm:col-span-2" />
              </Grid>
            )}
          />
        </div>
      </Panel>
      <Panel title="Trayectoria" desc="Hitos de la línea temporal. La etiqueta puede ser un año o un texto corto.">
        <ListEditor
          items={p.timeline}
          onChange={(v) => set({ timeline: v })}
          title={(m) => `${m.label} · ${m.title}`}
          create={() => ({ label: String(new Date().getFullYear()), title: '', text: '' })}
          addLabel="Añadir hito"
          render={(m, upd) => (
            <>
              <Grid>
                <Field label="Etiqueta" value={m.label} onChange={(v) => upd({ label: v })} />
                <Field label="Título" value={m.title} onChange={(v) => upd({ title: v })} />
              </Grid>
              <Area label="Texto" rows={2} value={m.text} onChange={(v) => upd({ text: v })} />
            </>
          )}
        />
      </Panel>
      <Panel title="Referentes">
        <ListEditor
          items={p.influences}
          onChange={(v) => set({ influences: v })}
          title={(f) => `${f.name} · ${f.role}`}
          create={() => ({ name: '', role: 'DJ', note: '' })}
          addLabel="Añadir referente"
          render={(f, upd) => (
            <Grid>
              <Field label="Nombre" value={f.name} onChange={(v) => upd({ name: v })} />
              <Field label="Rol" value={f.role} onChange={(v) => upd({ role: v })} />
              <Field label="Por qué" value={f.note} onChange={(v) => upd({ note: v })} className="sm:col-span-2" />
            </Grid>
          )}
        />
      </Panel>
      <Panel title="Equipo">
        <ListEditor
          items={p.gear}
          onChange={(v) => set({ gear: v })}
          title={(g) => `${g.icon} ${g.title}`}
          create={() => ({ icon: '🎛️', title: '', text: '' })}
          addLabel="Añadir equipo"
          render={(g, upd) => (
            <Grid>
              <Field label="Nombre" value={g.title} onChange={(v) => upd({ title: v })} />
              <Field label="Emoji" value={g.icon} onChange={(v) => upd({ icon: v })} />
              <Field label="Descripción" value={g.text} onChange={(v) => upd({ text: v })} className="sm:col-span-2" />
            </Grid>
          )}
        />
      </Panel>
      <Panel title="Contrataciones" desc="Tarjeta de contacto en la portada y en /sobre-mi. Instagram siempre es la opción principal.">
        <div className="space-y-4">
          <Toggle label={p.booking.enabled ? 'Visible' : 'Oculta'} checked={p.booking.enabled} onChange={(v) => set({ booking: { ...p.booking, enabled: v } })} />
          <Area label="Texto" rows={2} value={p.booking.text} onChange={(v) => set({ booking: { ...p.booking, text: v } })} />
          <Grid>
            <Field label="Teléfono" hint="Con prefijo, p. ej. +34600000000. Vacío para ocultarlo." value={p.booking.phone} onChange={(v) => set({ booking: { ...p.booking, phone: v } })} />
            <Field label="Email (opcional)" type="email" value={p.booking.email} onChange={(v) => set({ booking: { ...p.booking, email: v } })} />
          </Grid>
          <Toggle label="Mostrar botón de WhatsApp" checked={p.booking.whatsapp} onChange={(v) => set({ booking: { ...p.booking, whatsapp: v } })} />
        </div>
      </Panel>
    </div>
  )
}

export function SocialsView() {
  const { draft, update } = useAdmin()
  const options = socialIds.map((id) => ({ value: id, label: id }))
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black sm:text-3xl">Redes sociales</h1>
      <Panel title="Enlaces" desc="Aparecen en la cabecera, la portada y el pie.">
        <ListEditor
          items={draft.socials}
          onChange={(v) => update((d) => { d.socials = v })}
          title={(s) => `${s.label} ${s.handle}`}
          create={() => ({ id: 'web', label: 'Web', handle: '', url: 'https://' })}
          addLabel="Añadir red"
          render={(s, upd) => (
            <Grid>
              <Select label="Icono" value={s.id} onChange={(v) => upd({ id: v })} options={options} />
              <Field label="Nombre" value={s.label} onChange={(v) => upd({ label: v })} />
              <Field label="Usuario" value={s.handle} onChange={(v) => upd({ handle: v })} />
              <Field label="URL" mono value={s.url} onChange={(v) => upd({ url: v })} />
            </Grid>
          )}
        />
      </Panel>
    </div>
  )
}

export function MixesView() {
  const { draft, update } = useAdmin()
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black sm:text-3xl">Mixes y sesiones</h1>
      <Panel title="Sesiones" desc="Los enlaces de YouTube se incrustan con reproductor. La sección se oculta si está vacía.">
        <ListEditor
          items={draft.mixes}
          onChange={(v) => update((d) => { d.mixes = v })}
          title={(m) => m.title}
          create={() => ({ title: '', url: '', date: new Date().toISOString().slice(0, 10) })}
          addLabel="Añadir mix"
          render={(m, upd) => (
            <Grid>
              <Field label="Título" value={m.title} onChange={(v) => upd({ title: v })} />
              <Field label="Fecha" type="date" value={m.date} onChange={(v) => upd({ date: v })} />
              <Field label="URL (YouTube, SoundCloud…)" mono value={m.url} onChange={(v) => upd({ url: v })} className="sm:col-span-2" />
            </Grid>
          )}
        />
      </Panel>
    </div>
  )
}

export function EventsView() {
  const { draft, update } = useAdmin()
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black sm:text-3xl">Agenda</h1>
      <Panel title="Próximas fechas" desc="Las fechas pasadas se ocultan solas en la web.">
        <ListEditor
          items={draft.events}
          onChange={(v) => update((d) => { d.events = v })}
          title={(e) => `${e.date} · ${e.title}`}
          create={() => ({ date: new Date().toISOString().slice(0, 10), title: '', venue: '', city: '', url: '' })}
          addLabel="Añadir fecha"
          render={(e, upd) => (
            <Grid>
              <Field label="Fecha" type="date" value={e.date} onChange={(v) => upd({ date: v })} />
              <Field label="Evento" value={e.title} onChange={(v) => upd({ title: v })} />
              <Field label="Sala / lugar" value={e.venue} onChange={(v) => upd({ venue: v })} />
              <Field label="Ciudad" value={e.city} onChange={(v) => upd({ city: v })} />
              <Field label="Enlace (entradas, info)" mono value={e.url} onChange={(v) => upd({ url: v })} className="sm:col-span-2" />
            </Grid>
          )}
        />
      </Panel>
    </div>
  )
}

export function JsonView() {
  const { draft, update } = useAdmin()
  const toast = useToast()
  const [text, setText] = useState(() => JSON.stringify(draft, null, 2))
  const [err, setErr] = useState('')
  const apply = () => {
    try {
      const v = JSON.parse(text) as SiteContent
      if (!v.profile || !Array.isArray(v.apps) || !Array.isArray(v.socials)) throw new Error('Faltan profile, apps o socials')
      update((d) => { Object.assign(d, v); d.events ??= []; d.mixes ??= [] })
      setErr('')
      toast('JSON aplicado al borrador')
    } catch (e) { setErr((e as Error).message) }
  }
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black sm:text-3xl">Editor JSON</h1>
      <Panel title="Contenido completo" desc="Para usuarios avanzados. Los cambios se aplican al borrador, no se publican hasta que pulses Publicar." actions={<button className="btn-primary !py-2" onClick={apply}><Icon name="check" size={16} /> Aplicar</button>}>
        {err && <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
        <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} className="h-[60vh] w-full rounded-lg border border-line bg-bg p-3 font-mono text-xs leading-relaxed outline-none focus:border-cyan/60" />
      </Panel>
    </div>
  )
}
