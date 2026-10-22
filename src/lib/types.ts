export type Accent = 'cyan' | 'teal' | 'orange' | 'purple' | 'pink' | 'green'

export interface Highlight { icon: string; title: string; text: string }
export interface Social { id: string; label: string; handle: string; url: string }
export interface Screenshot { src: string; label: string; icon: string; title: string; caption: string }
export interface Feature { icon: string; title: string; text: string; pill: string }
export interface Step { title: string; text: string; code?: string }
export interface Spec { icon: string; component: string; min: string; rec: string; recDetail: string }
export interface Faq { q: string; a: string }

export interface EventItem { date: string; title: string; venue: string; city: string; url: string }
export interface Mix { title: string; url: string; date: string }

export interface AppEntry {
  slug: string
  published: boolean
  name: string
  shortName: string
  accent: Accent
  category: string
  icon: string
  cover: string
  tagline: string
  summary: string
  description: string
  tags: string[]
  license: string
  repo: string
  assetPattern: string
  primaryCta: { label: string; type: 'release' | 'repo' | 'url'; url?: string }
  fallback: { version: string; url: string; size: string }
  badges: string[]
  screenshots: Screenshot[]
  featuresTitle: string
  featuresIntro: string
  features: Feature[]
  stepsTitle: string
  steps: Step[]
  specs: Spec[]
  tip: string
  faq: Faq[]
}

export interface Profile {
  name: string
  handle: string
  role: string
  avatar: string
  heroKicker: string
  heroTitle: string
  heroHighlight: string
  heroSubtitle: string
  aboutTitle: string
  aboutTagline: string
  bio: string
  highlights: Highlight[]
  contactCta: string
}

export interface SiteContent {
  profile: Profile
  socials: Social[]
  events: EventItem[]
  mixes: Mix[]
  apps: AppEntry[]
}
