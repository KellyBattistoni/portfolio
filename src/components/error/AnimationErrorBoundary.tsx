import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

function AnimationFallback({ error }: FallbackProps) {
  console.error(
    '[AnimationErrorBoundary] Caught error:',
    error instanceof Error ? error.message : error
  )

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 60%, rgba(255, 69, 0, 0.35) 0%, #050505 65%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    />
  )
}

interface AnimationErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, info: React.ErrorInfo) => void
}

export function AnimationErrorBoundary({ children, onError }: AnimationErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={AnimationFallback}
      onError={(error, info) => {
        console.error('[AnimationErrorBoundary] onError:', error, info)
        onError?.(error instanceof Error ? error : new Error(String(error)), info)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
