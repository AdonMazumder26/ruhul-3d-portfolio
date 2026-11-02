import { PageContainer } from '../../components/layout/PageContainer.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'

export function NotFoundPage() {
  useDocumentMeta({ title: 'Page not found', description: 'The page you were looking for does not exist.' })
  return (
    <PageContainer className="flex min-h-[70svh] flex-col items-start justify-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Lost in orbit</h1>
      <p className="mt-4 max-w-md text-muted">This page does not exist or has moved. Let's get you back to familiar ground.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button to="/">Back to home</Button>
        <Button to="/projects" variant="secondary">
          Browse projects
        </Button>
      </div>
    </PageContainer>
  )
}
