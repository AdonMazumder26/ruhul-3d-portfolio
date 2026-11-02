import { useEffect } from 'react'

const SITE = 'RUHUL.DEV'

export function useDocumentMeta({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} — ${SITE}` : `${SITE} — Ruhul Ma Ani Mazumder, Aspiring Full-Stack Developer`

    const meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content') ?? ''
    if (meta && description) meta.setAttribute('content', description)

    return () => {
      document.title = previousTitle
      if (meta) meta.setAttribute('content', previousDescription)
    }
  }, [title, description])
}
