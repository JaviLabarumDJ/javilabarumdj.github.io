import { useEffect, useState } from 'react'

export interface ReleaseAsset { name: string; size: number; download_count: number; browser_download_url: string }
export interface Release {
  tag_name: string
  name: string
  body: string
  html_url: string
  published_at: string
  prerelease: boolean
  draft: boolean
  assets: ReleaseAsset[]
}
export interface Repo {
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  pushed_at: string
  html_url: string
  description: string
}

const TTL = 10 * 60 * 1000

/** GET a la API pública de GitHub con caché en sessionStorage (límite: 60 req/h sin token). */
export async function ghPublic<T>(path: string): Promise<T> {
  const key = `gh:${path}`
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) ?? 'null')
    if (hit && Date.now() - hit.t < TTL) return hit.v as T
  } catch { /* storage no disponible */ }
  const res = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json' } })
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  const v = (await res.json()) as T
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })) } catch { /* ignore */ }
  return v
}

function useGh<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!path) return
    let alive = true
    ghPublic<T>(path).then((d) => alive && setData(d)).catch((e) => alive && setError(String(e.message ?? e)))
    return () => { alive = false }
  }, [path])
  return { data, error, loading: !!path && !data && !error }
}

export const useReleases = (repo: string | undefined) =>
  useGh<Release[]>(repo ? `/repos/${repo}/releases?per_page=30` : null)

export const useRepo = (repo: string | undefined) => useGh<Repo>(repo ? `/repos/${repo}` : null)

export const stableReleases = (rs: Release[] | null) => (rs ?? []).filter((r) => !r.draft && !r.prerelease)

export function pickAsset(r: Release | undefined, pattern: string) {
  if (!r || !pattern) return undefined
  const re = new RegExp(pattern, 'i')
  return r.assets.find((a) => re.test(a.name))
}

export const totalDownloads = (rs: Release[] | null) =>
  (rs ?? []).reduce((sum, r) => sum + r.assets.reduce((s, a) => s + a.download_count, 0), 0)
