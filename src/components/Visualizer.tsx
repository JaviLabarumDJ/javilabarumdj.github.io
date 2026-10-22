import { useEffect, useRef } from 'react'

/** Espectro animado de fondo. Se pausa fuera de pantalla y respeta prefers-reduced-motion. */
export function Visualizer({ colors = ['0,229,255', '255,106,61'], className = '' }: { colors?: [string, string] | string[]; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0, t = 0, visible = true
    let pointer = 0.5, target = 0.5
    const dpr = Math.min(devicePixelRatio || 1, 2)

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width; h = r.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const onMove = (e: PointerEvent) => { target = e.clientX / innerWidth }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      pointer += (target - pointer) * 0.06
      const gap = w < 640 ? 3 : 4
      const bars = Math.floor(w / (w < 640 ? 10 : 14))
      const bw = w / bars - gap
      for (let i = 0; i < bars; i++) {
        const p = i / bars
        const a = Math.sin(p * 10 + t * 2) * 0.5 + Math.cos(p * 18 - t * 1.5) * 0.3 + Math.sin(p * 31 + t * 3.4) * 0.2
        const boost = Math.max(0, 1 - Math.abs(p - pointer) * 2.6) * 0.45
        const bh = (Math.abs(a) + boost) * h * 0.42 + 6
        const x = i * (bw + gap)
        const y = h - bh
        const c = colors[i % colors.length]
        const g = ctx.createLinearGradient(0, y, 0, h)
        g.addColorStop(0, `rgba(${c},.55)`)
        g.addColorStop(1, `rgba(${c},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.roundRect(x, y, bw, bh, [3, 3, 0, 0])
        ctx.fill()
      }
      t += 0.022
      if (visible && !reduce) raf = requestAnimationFrame(draw)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) raf = requestAnimationFrame(draw)
    })
    resize()
    io.observe(canvas)
    addEventListener('resize', resize)
    addEventListener('pointermove', onMove, { passive: true })
    draw()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
    }
  }, [colors.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 h-[28%] w-full sm:h-[45%] ${className}`} />
}
