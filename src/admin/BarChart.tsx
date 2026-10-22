import { useState } from 'react'
import { formatNumber } from '../lib/format'

const BAR = '#1a9fb8' // validado para superficie oscura (dataviz/validate_palette)

/** Columnas de una sola serie con tooltip al pasar/tocar y vista de tabla. */
export function BarChart({ data, title, unit }: { data: { label: string; value: number }[]; title: string; unit: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const [table, setTable] = useState(false)
  const max = Math.max(1, ...data.map((d) => d.value))
  const nice = (() => { const p = 10 ** Math.floor(Math.log10(max)); return Math.ceil(max / p) * p })()
  const ticks = [0, nice / 2, nice]
  const every = Math.ceil(data.length / 7)

  return (
    <figure>
      <figcaption className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <button className="text-xs text-ink-3 underline-offset-2 hover:text-ink hover:underline" onClick={() => setTable((t) => !t)}>
          {table ? 'Ver gráfico' : 'Ver tabla'}
        </button>
      </figcaption>
      {table ? (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-ink-3"><th className="py-1 font-medium">Elemento</th><th className="py-1 text-right font-medium">{unit}</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.label} className="border-t border-line"><td className="py-1.5 text-ink-2">{d.label}</td><td className="py-1.5 text-right font-mono">{formatNumber(d.value)}</td></tr>)}</tbody>
        </table>
      ) : (
        <div className="relative flex h-44 gap-2 pl-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 bottom-5">
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${(t / nice) * 100}%` }}>
                <span className="w-6 text-right font-mono text-[10px] text-ink-3">{t >= 1000 ? `${t / 1000}k` : t}</span>
                <span className="h-px flex-1 bg-line" />
              </div>
            ))}
          </div>
          <div className="relative flex flex-1 items-end gap-[2px] pb-5">
            {data.map((d, i) => (
              <div
                key={d.label}
                className="relative flex h-full flex-1 cursor-default flex-col items-center justify-end"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onClick={() => setHover(hover === i ? null : i)}
              >
                <div
                  className="w-full max-w-6 rounded-t-[4px] transition-opacity"
                  style={{ height: `${(d.value / nice) * 100}%`, minHeight: d.value ? 2 : 0, background: BAR, opacity: hover === null || hover === i ? 1 : 0.45 }}
                />
                {(i % every === 0 || i === data.length - 1) && <span className="absolute -bottom-5 whitespace-nowrap text-center font-mono text-[9px] text-ink-3">{d.label}</span>}
                {hover === i && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-md border border-line-strong bg-surface-2 px-2 py-1 text-xs shadow-xl">
                    <span className="text-ink-3">{d.label}: </span><span className="font-mono font-bold text-ink">{formatNumber(d.value)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </figure>
  )
}
