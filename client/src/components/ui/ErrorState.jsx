import { FiAlertTriangle } from 'react-icons/fi'
import { Button } from './Button.jsx'

export function ErrorState({ title = 'Something went wrong', message, onRetry, children }) {
  return (
    <div role="alert" className="card border-orange/30 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-orange/10 text-orange">
          <FiAlertTriangle aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg">{title}</h3>
          {message ? <p className="mt-1 text-muted">{message}</p> : null}
          {children}
          {onRetry ? (
            <Button variant="secondary" className="mt-5" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
