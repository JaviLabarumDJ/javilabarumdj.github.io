import type { SiteContent } from '../lib/types'
import { normalize } from '../lib/content'

export const REPO = 'JaviLabarumDJ/javilabarumdj.github.io'
export const BRANCH = 'main'
export const CONTENT_PATH = 'src/content/site.json'
export const UPLOAD_DIR = 'public/uploads'

const TOKEN_KEY = 'jl-admin-token'

export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY),
  set: (t: string, remember: boolean) => {
    sessionStorage.setItem(TOKEN_KEY, t)
    if (remember) localStorage.setItem(TOKEN_KEY, t)
  },
  clear: () => { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY) },
}

export class GhError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

async function gh<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new GhError(res.status, body.message ?? `GitHub ${res.status}`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

const b64encode = (s: string) => {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}
const b64decode = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, '')), (c) => c.charCodeAt(0)))

export interface GhUser { login: string; avatar_url: string; name: string | null }
export interface WorkflowRun { id: number; status: string; conclusion: string | null; created_at: string; updated_at: string; html_url: string; head_commit: { message: string } | null; display_title: string }
export interface Traffic { count: number; uniques: number; views: { timestamp: string; count: number; uniques: number }[] }

export function createApi(token: string) {
  return {
    user: () => gh<GhUser>(token, '/user'),
    canPush: async () => (await gh<{ permissions?: { push: boolean } }>(token, `/repos/${REPO}`)).permissions?.push ?? false,

    async loadContent(): Promise<{ content: SiteContent; sha: string }> {
      const f = await gh<{ content: string; sha: string }>(token, `/repos/${REPO}/contents/${CONTENT_PATH}?ref=${BRANCH}&t=${Date.now()}`)
      return { content: normalize(JSON.parse(b64decode(f.content))), sha: f.sha }
    },

    async saveContent(content: SiteContent, sha: string, message: string) {
      const r = await gh<{ content: { sha: string }; commit: { sha: string; html_url: string } }>(token, `/repos/${REPO}/contents/${CONTENT_PATH}`, {
        method: 'PUT',
        body: JSON.stringify({ message, sha, branch: BRANCH, content: b64encode(JSON.stringify(content, null, 2) + '\n') }),
      })
      return { sha: r.content.sha, commit: r.commit }
    },

    /** Sube un archivo binario a public/uploads y devuelve la ruta pública relativa. */
    async upload(file: File) {
      const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-').replace(/-+/g, '-')
      const name = `${Date.now().toString(36)}-${safe}`
      const data = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = () => resolve(String(fr.result).split(',')[1])
        fr.onerror = reject
        fr.readAsDataURL(file)
      })
      await gh(token, `/repos/${REPO}/contents/${UPLOAD_DIR}/${name}`, {
        method: 'PUT',
        body: JSON.stringify({ message: `upload: ${name}`, branch: BRANCH, content: data }),
      })
      return `uploads/${name}`
    },

    runs: () => gh<{ workflow_runs: WorkflowRun[] }>(token, `/repos/${REPO}/actions/runs?per_page=6&branch=${BRANCH}`).then((r) => r.workflow_runs),
    traffic: (repo: string) => gh<Traffic>(token, `/repos/${repo}/traffic/views`),
  }
}

export type Api = ReturnType<typeof createApi>

/** URL directa al archivo en el repo: sirve para previsualizar imágenes recién subidas antes del despliegue. */
export const rawUrl = (path: string) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/${path.replace(/^\//, '')}`
