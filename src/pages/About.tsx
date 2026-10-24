import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { asset, site } from '../lib/content'
import { md } from '../lib/markdown'
import { useMeta } from '../lib/useMeta'
import { Icon } from '../components/Icon'
import { Reveal, SectionHeader } from '../components/Reveal'
import { Visualizer } from '../components/Visualizer'

const social = (id: string) => site.socials.find((s) => s.id === id)
const formatPhone = (p: string) => p.replace(/^(\+\d{2})(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5')

export function BookingCard({ compact = false }: { compact?: boolean }) {
  const where = compact ? 'home' : 'about'
  const b = site.profile.booking
  const ig = social('instagram')
  if (!b?.enabled) return null
  const handle = ig?.url.match(/instagram\.com\/([^/?#]+)/)?.[1]
  const dm = handle ? `https://ig.me/m/${handle}` : ig?.url
  const digits = b.phone.replace(/[^\d]/g, '')
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-line-strong bg-gradient-to-br from-cyan/10 via-surface to-orange/10 ${compact ? 'p-6' : 'p-6 sm:p-10'}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-orange/20 blur-3xl" />
      <div className="relative">
        <p className="kicker mb-3">Contrataciones</p>
        <h2 className={`font-extrabold ${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}>¿Pongo música en tu evento?</h2>
        <p className="mt-3 max-w-2xl text-ink-2 sm:text-lg">{b.text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {dm && <a href={dm} data-track="contact-instagram" data-track-where={where} target="_blank" rel="noopener noreferrer" className="btn-primary"><Icon name="instagram" size={16} /> Escríbeme por Instagram</a>}
          {b.phone && <a href={`tel:${b.phone.replace(/\s/g, '')}`} data-track="contact-phone" data-track-where={where} className="btn-ghost"><Icon name="phone" size={16} /> {formatPhone(b.phone.replace(/\s/g, ''))}</a>}
          {b.phone && b.whatsapp && <a href={`https://wa.me/${digits}`} data-track="contact-whatsapp" data-track-where={where} target="_blank" rel="noopener noreferrer" className="btn-ghost"><Icon name="whatsapp" size={16} /> WhatsApp</a>}
          {b.email && <a href={`mailto:${b.email}`} data-track="contact-email" data-track-where={where} className="btn-ghost"><Icon name="mail" size={16} /> {b.email}</a>}
        </div>
        <p className="mt-4 text-xs text-ink-3">Prefiero Instagram, pero también puedes llamarme.</p>
      </div>
    </div>
  )
}

export function YoutubeCta() {
  const yt = social('youtube')
  if (!yt) return null
  return (
    <a href={yt.url} data-track="youtube-sessions" target="_blank" rel="noopener noreferrer" className="group card flex items-center gap-4 p-5 transition hover:border-[#ff0033]/40 sm:p-6">
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#ff0033]/15 text-[#ff4d6a] transition group-hover:scale-105"><Icon name="youtube" size={28} /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-bold">Escucha mis sesiones grabadas</span>
        <span className="block text-sm text-ink-2">Sets completos en YouTube · {yt.handle}</span>
      </span>
      <Icon name="arrow" size={20} className="shrink-0 text-ink-3 transition group-hover:translate-x-1 group-hover:text-ink" />
    </a>
  )
}

export default function About() {
  const p = site.profile
  useMeta(`Sobre mí · ${p.name}`, p.bio)
  const years = p.since ? new Date().getFullYear() - Number(p.since) : 0
  const stats = [
    years > 0 && { v: `${years}`, k: 'años pinchando' },
    p.genres.length > 0 && { v: `${p.genres.length}`, k: 'estilos favoritos' },
    { v: `${site.apps.filter((a) => a.published).length}`, k: 'apps creadas' },
  ].filter(Boolean) as { v: string; k: string }[]

  return (
    <>
      {/* Cabecera */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 size-[520px] rounded-full bg-cyan/15 blur-[140px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-40 size-[520px] rounded-full bg-orange/15 blur-[140px]" />
        <Visualizer className="!h-[22%] opacity-50" />
        <div className="container-x relative grid items-center gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="kicker mb-4 flex items-center gap-2">
              <Icon name="pin" size={14} /> {p.location}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="text-5xl font-black leading-[0.95] sm:text-7xl">
              Javi<span className="gradient-text">Labarum</span>DJ
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-3 font-mono text-sm text-orange">{p.aboutTagline}</motion.p>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{p.bio}</motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-6 flex flex-wrap gap-2">
              {p.genres.map((g) => <span key={g} className="rounded-full border border-cyan/30 bg-cyan/10 px-3.5 py-1.5 text-sm font-semibold text-ink">{g}</span>)}
            </motion.div>
            <motion.dl initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.k}>
                  <dd className="font-display text-4xl font-black sm:text-5xl">{s.v}</dd>
                  <dt className="mt-1 text-xs text-ink-3">{s.k}</dt>
                </div>
              ))}
            </motion.dl>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.8 }} className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan/40 via-purple/30 to-orange/40 opacity-50 blur-2xl" />
            <img src={asset(p.avatar)} alt={`${p.name} en cabina`} className="relative aspect-[4/5] w-full rounded-[1.75rem] border border-line-strong object-cover" />
            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full border border-line-strong bg-bg/90 p-1.5 backdrop-blur">
              {p.words.map((w) => <span key={w} className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-bold">{w}</span>)}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Historia */}
      <section className="border-t border-line bg-bg-2/60 py-20 sm:py-28">
        <div className="container-x grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <Reveal>
            <p className="kicker mb-3">Mi historia</p>
            <h2 className="text-3xl font-extrabold sm:text-5xl">De una controladora de segunda mano a la cabina</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div dangerouslySetInnerHTML={{ __html: md(p.story) }} className="prose-dj text-base sm:text-lg [&_p]:mb-5 [&_p]:mt-0" />
          </Reveal>
        </div>
      </section>

      {/* Trayectoria */}
      {p.timeline.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-x max-w-4xl">
            <SectionHeader kicker="Trayectoria" title="El camino hasta aquí" />
            <ol className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-cyan before:via-purple before:to-orange sm:before:left-1/2">
              {p.timeline.map((m, i) => (
                <motion.li
                  key={m.title + i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative pl-8 sm:w-1/2 sm:pl-0 ${i % 2 ? 'sm:ml-auto sm:pl-10' : 'sm:pr-10 sm:text-right'}`}
                >
                  <span className={`absolute top-1.5 size-[15px] rounded-full border-[3px] border-bg ${i === p.timeline.length - 1 ? 'bg-orange' : 'bg-cyan'} left-0 ${i % 2 ? 'sm:-left-[7.5px]' : 'sm:left-auto sm:-right-[7.5px]'}`} />
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan">{m.label}</p>
                  <h3 className="mt-1 text-xl font-bold">{m.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-2 sm:text-[15px]">{m.text}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Sonido, influencias y equipo */}
      <section className="border-t border-line bg-bg-2/60 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader kicker="En cabina" title="Sonido, referentes y equipo" intro="Pincho lo que pida la pista, pero así suena JaviLabarumDJ cuando puede elegir." />
          <div className="grid gap-5 lg:grid-cols-3">
            <Reveal className="card p-6 sm:p-7">
              <p className="mb-4 flex items-center gap-2 font-semibold"><Icon name="music" size={18} className="text-cyan" /> Estilos</p>
              <ul className="space-y-2.5">
                {p.genres.map((g, i) => (
                  <li key={g} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-display text-xl font-bold">{g}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.06} className="card p-6 sm:p-7">
              <p className="mb-4 flex items-center gap-2 font-semibold"><Icon name="star" size={18} className="text-orange" /> Referentes</p>
              <ul className="space-y-4">
                {p.influences.map((f) => (
                  <li key={f.name}>
                    <p className="font-display text-xl font-bold">{f.name} <span className="ml-1 align-middle font-mono text-[10px] font-bold uppercase tracking-widest text-ink-3">{f.role}</span></p>
                    <p className="text-sm text-ink-2">{f.note}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.12} className="card p-6 sm:p-7">
              <p className="mb-4 flex items-center gap-2 font-semibold"><Icon name="grid" size={18} className="text-purple" /> Equipo</p>
              <ul className="space-y-4">
                {p.gear.map((g) => (
                  <li key={g.title} className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/5 text-lg">{g.icon}</span>
                    <span>
                      <span className="block font-semibold">{g.title}</span>
                      <span className="block text-sm text-ink-2">{g.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Sesiones + contratación */}
      <section className="py-20 sm:py-28">
        <div className="container-x max-w-5xl space-y-6">
          <Reveal><YoutubeCta /></Reveal>
          <Reveal delay={0.05}><BookingCard /></Reveal>
          <Reveal delay={0.1} className="flex flex-wrap items-center justify-center gap-3 pt-6 text-sm text-ink-2">
            ¿Te interesa la parte técnica?
            <Link to="/apps" className="font-semibold text-cyan hover:underline">Descubre mis apps →</Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
