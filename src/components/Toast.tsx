import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from './Icon'

type Kind = 'ok' | 'error' | 'info'
interface ToastMsg { id: number; text: string; kind: Kind }

const Ctx = createContext<(text: string, kind?: Kind) => void>(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMsg[]>([])
  const seq = useRef(0)
  const push = useCallback((text: string, kind: Kind = 'ok') => {
    const id = ++seq.current
    setItems((xs) => [...xs.slice(-2), { id, text, kind }])
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3500)
  }, [])
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border border-line-strong bg-surface-2/95 px-4 py-3 text-sm shadow-2xl backdrop-blur"
            >
              <span className={t.kind === 'error' ? 'text-danger' : t.kind === 'info' ? 'text-cyan' : 'text-ok'}>
                <Icon name={t.kind === 'error' ? 'close' : 'check'} size={16} />
              </span>
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}
