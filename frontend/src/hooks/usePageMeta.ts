import { useEffect } from 'react'

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)
    return () => {
      document.title = 'justSign - Digitale Signatur Schweiz | PDF online signieren'
    }
  }, [title, description])
}
