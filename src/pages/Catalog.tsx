import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { publishedApps, site } from '../lib/content'
import { useMeta } from '../lib/useMeta'
import { Icon } from '../components/Icon'
import { AppCard } from '../components/AppBits'
import { Reveal } from '../components/Reveal'

const categoryLabel: Record<string, string> = { dj: 'DJ', audio: 'Audio', tools: 'Herramientas' }

export default function Catalog() {
  useMeta(`Catálogo de apps · ${site.profile.name}`)
  const apps = publishedApps()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const cats = useMemo(() => ['all', ...new Set(apps.map((a) => a.category))], [apps])
  const filtered = apps.filter((a) => {
    const text = `${a.name} ${a.summary} ${a.tags.join(' ')}`.toLowerCase()
    return (cat === 'all' || a.category === cat) && text.includes(q.trim().toLowerCase())
  })

  return (
    <section className="min-h-[80svh] pt-28 pb-24 sm:pt-36">
      <div className="container-x">
        <Reveal className="mb-10 max-w-2xl">
          <p className="kicker mb-3">Catálogo</p>
          <h1 className="text-4xl font-black sm:text-6xl">Todas las aplicaciones</h1>
          <p className="mt-4 text-ink-2 sm:text-lg">Software libre hecho por y para DJs. Gratis, sin anuncios y con el código a la vista.</p>
        </Reveal>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1 sm:max-w-sm">
            <span className="sr-only">Buscar</span>
            <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar apps, funciones…"
              className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-ink-3 focus:border-cyan/60"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${cat === c ? 'border-cyan bg-cyan/10 text-ink' : 'border-line text-ink-2 hover:text-ink'}`}
              >
                {c === 'all' ? 'Todas' : categoryLabel[c] ?? c}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid gap-6 md:grid-cols-2 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((a, i) => (
              <motion.div key={a.slug} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
                <AppCard app={a} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.a
            layout
            href={site.socials.find((s) => s.id === 'instagram')?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-line-strong p-8 text-center transition hover:border-cyan/50 hover:bg-white/[.02]"
          >
            <div>
              <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-white/5 text-ink-2"><Icon name="plus" size={26} /></span>
              <p className="font-display text-xl font-bold">¿Tienes una idea para una app?</p>
              <p className="mt-2 text-sm text-ink-2">Cuéntamela por Instagram y quizá sea la próxima.</p>
            </div>
          </motion.a>
        </motion.div>
        {!filtered.length && <p className="mt-6 text-center text-ink-3">No hay apps que coincidan con «{q}».</p>}
      </div>
    </section>
  )
}
