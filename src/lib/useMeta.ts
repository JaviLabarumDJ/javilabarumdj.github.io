import { useEffect } from 'react'

export function useMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
