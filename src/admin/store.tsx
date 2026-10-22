import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SiteContent } from '../lib/types'
import { normalize } from '../lib/content'
import { createApi, type Api, type GhUser } from './api'

const DRAFT_KEY = 'jl-admin-draft'
export const PREVIEW_KEY = 'jl-preview'

interface Store {
  api: Api
  user: GhUser
  draft: SiteContent
  published: SiteContent
  dirty: boolean
  conflict: boolean
  update: (fn: (d: SiteContent) => void) => void
  discard: () => void
  publish: (message: string, force?: boolean) => Promise<string>
  reload: () => Promise<void>
}

const Ctx = createContext<Store | null>(null)
export const useAdmin = () => {
  const s = useContext(Ctx)
  if (!s) throw new Error('useAdmin fuera de AdminProvider')
  return s
}

const readDraft = (): { draft: SiteContent; baseSha: string } | null => {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') } catch { return null }
}

export function AdminProvider({ token, user, initial, initialSha, children }: {
  token: string; user: GhUser; initial: SiteContent; initialSha: string; children: ReactNode
}) {
  const api = useMemo(() => createApi(token), [token])
  const [published, setPublished] = useState(initial)
  const [sha, setSha] = useState(initialSha)
  const saved = readDraft()
  const [draft, setDraft] = useState<SiteContent>(saved?.draft ? normalize(saved.draft) : initial)
  const [baseSha, setBaseSha] = useState(saved?.baseSha ?? initialSha)

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(published), [draft, published])
  const conflict = dirty && baseSha !== sha

  useEffect(() => {
    try {
      if (dirty) localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, baseSha }))
      else localStorage.removeItem(DRAFT_KEY)
      // La vista previa de la web pública lee este borrador (ver main.tsx).
      if (localStorage.getItem(PREVIEW_KEY)) localStorage.setItem(PREVIEW_KEY, JSON.stringify(draft))
    } catch { /* storage lleno o bloqueado */ }
  }, [draft, dirty, baseSha])

  const update = useCallback((fn: (d: SiteContent) => void) => {
    setDraft((d) => {
      const next = structuredClone(d)
      fn(next)
      return next
    })
  }, [])

  const discard = useCallback(() => { setDraft(published); setBaseSha(sha) }, [published, sha])

  const reload = useCallback(async () => {
    const r = await api.loadContent()
    setPublished(r.content)
    setSha(r.sha)
    if (!dirty) { setDraft(r.content); setBaseSha(r.sha) }
  }, [api, dirty])

  const publish = useCallback(async (message: string, force = false) => {
    const latest = await api.loadContent()
    if (latest.sha !== baseSha && !force) {
      setSha(latest.sha)
      setPublished(latest.content)
      throw new Error('CONFLICT')
    }
    const r = await api.saveContent(draft, latest.sha, message)
    setPublished(draft)
    setSha(r.sha)
    setBaseSha(r.sha)
    return r.commit.html_url
  }, [api, draft, baseSha])

  return (
    <Ctx.Provider value={{ api, user, draft, published, dirty, conflict, update, discard, publish, reload }}>
      {children}
    </Ctx.Provider>
  )
}
