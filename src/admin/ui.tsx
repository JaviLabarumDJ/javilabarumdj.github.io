import { useId, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import { asset } from '../lib/content'
import { rawUrl } from './api'
import { useAdmin } from './store'

const inputCls =
  'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-cyan/60 focus:ring-2 focus:ring-cyan/15'

export function Field({ label, hint, value, onChange, placeholder, type = 'text', mono = false, className = '' }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; mono?: boolean; className?: string
}) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-2">{label}</label>
      <input id={id} type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${mono ? 'font-mono text-xs' : ''}`} />
      {hint && <p className="mt-1 text-[11px] text-ink-3">{hint}</p>}
    </div>
  )
}

export function Area({ label, hint, value, onChange, rows = 3, className = '' }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number; className?: string
}) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-2">{label}</label>
      <textarea id={id} rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-y leading-relaxed`} />
      {hint && <p className="mt-1 text-[11px] text-ink-3">{hint}</p>}
    </div>
  )
}

export function Select<T extends string>({ label, value, onChange, options, className = '' }: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string
}) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-2">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={inputCls}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-center gap-3 text-sm">
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-ok' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  )
}

export function Panel({ title, desc, actions, children }: { title: string; desc?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="card p-4 sm:p-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {desc && <p className="mt-0.5 text-sm text-ink-3">{desc}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}

export function TagsField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState('')
  const add = () => { const t = text.trim(); if (t && !value.includes(t)) onChange([...value, t]); setText('') }
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-ink-2">{label}</p>
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-line bg-bg p-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-md bg-white/[.06] py-1 pl-2.5 pr-1 text-xs">
            {t}
            <button type="button" aria-label={`Quitar ${t}`} className="grid size-5 place-items-center rounded text-ink-3 hover:bg-white/10 hover:text-ink" onClick={() => onChange(value.filter((x) => x !== t))}>
              <Icon name="close" size={12} />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
          onBlur={add}
          placeholder="Escribe y pulsa Enter"
          className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-ink-3"
        />
      </div>
    </div>
  )
}

export function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { api } = useAdmin()
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [broken, setBroken] = useState(false)

  const onFile = async (f: File | undefined) => {
    if (!f) return
    if (f.size > 8 * 1024 * 1024) return toast('La imagen supera 8 MB', 'error')
    setBusy(true)
    try {
      const path = await api.upload(f)
      setBroken(false)
      onChange(path)
      toast('Imagen subida al repositorio')
    } catch (e) {
      toast(`Error al subir: ${(e as Error).message}`, 'error')
    } finally { setBusy(false) }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-ink-2">{label}</p>
      <div className="flex gap-3">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-bg">
          {value ? (
            <img
              key={value + broken}
              src={broken ? rawUrl(value) : asset(value)}
              onError={() => !broken && setBroken(true)}
              alt=""
              className="size-full object-cover"
            />
          ) : <Icon name="upload" className="text-ink-3" />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="assets/imagen.png o https://…" className={`${inputCls} font-mono text-xs`} />
          <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => input.current?.click()}>
            <Icon name="upload" size={14} /> {busy ? 'Subiendo…' : 'Subir imagen'}
          </button>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
        </div>
      </div>
    </div>
  )
}

/** Lista editable con añadir, borrar, reordenar y plegar. */
export function ListEditor<T>({ items, onChange, render, title, create, addLabel = 'Añadir' }: {
  items: T[]
  onChange: (items: T[]) => void
  render: (item: T, set: (patch: Partial<T>) => void, index: number) => ReactNode
  title: (item: T, index: number) => string
  create: () => T
  addLabel?: string
}) {
  const [open, setOpen] = useState<number | null>(null)
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
    if (open === i) setOpen(j)
  }
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-line bg-bg/50">
          <div className="flex items-center gap-1 pl-3 pr-1.5">
            <button type="button" className="flex min-w-0 flex-1 items-center gap-2 py-3 text-left text-sm font-medium" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              <Icon name="chevron" size={14} className={`shrink-0 text-ink-3 transition ${open === i ? '' : '-rotate-90'}`} />
              <span className="truncate">{title(it, i) || <em className="text-ink-3">Sin título</em>}</span>
            </button>
            <IconBtn icon="up" label="Subir" onClick={() => move(i, -1)} disabled={i === 0} />
            <IconBtn icon="down" label="Bajar" onClick={() => move(i, 1)} disabled={i === items.length - 1} />
            <IconBtn icon="trash" label="Eliminar" danger onClick={() => { if (confirm('¿Eliminar este elemento?')) { onChange(items.filter((_, k) => k !== i)); setOpen(null) } }} />
          </div>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="space-y-3 border-t border-line p-3 sm:p-4">
                  {render(it, (patch) => onChange(items.map((x, k) => (k === i ? { ...x, ...patch } : x))), i)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <button type="button" className="btn-ghost w-full !border-dashed !py-2.5 text-xs" onClick={() => { onChange([...items, create()]); setOpen(items.length) }}>
        <Icon name="plus" size={14} /> {addLabel}
      </button>
    </div>
  )
}

export function IconBtn({ icon, label, onClick, disabled, danger }: { icon: string; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      className={`grid size-9 place-items-center rounded-lg text-ink-3 transition hover:bg-white/5 disabled:opacity-25 ${danger ? 'hover:text-danger' : 'hover:text-ink'}`}>
      <Icon name={icon} size={15} />
    </button>
  )
}

export const Grid = ({ children }: { children: ReactNode }) => <div className="grid gap-3 sm:grid-cols-2">{children}</div>
