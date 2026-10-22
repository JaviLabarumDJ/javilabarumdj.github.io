import { motion, type HTMLMotionProps } from 'motion/react'

export function Reveal({ delay = 0, y = 24, ...p }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...p}
    />
  )
}

export function SectionHeader({ kicker, title, intro, center = true }: { kicker: string; title: string; intro?: string; center?: boolean }) {
  return (
    <Reveal className={`mb-10 max-w-2xl sm:mb-14 ${center ? 'mx-auto text-center' : ''}`}>
      <p className="kicker mb-3">{kicker}</p>
      <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-base text-ink-2 sm:text-lg">{intro}</p>}
    </Reveal>
  )
}
