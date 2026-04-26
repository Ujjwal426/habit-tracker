interface AppLoaderProps {
  label?: string
  variant?: 'page' | 'section' | 'inline' | 'button'
  className?: string
}

export default function AppLoader({
  label = 'Loading...',
  variant = 'section',
  className = '',
}: AppLoaderProps) {
  if (variant === 'button') {
    return (
      <span className={`inline-flex items-center justify-center gap-2 ${className}`}>
        <span className="habit-loader habit-loader-sm" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span>{label}</span>
      </span>
    )
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-2 text-sm font-medium text-blue-700 ${className}`} role="status" aria-live="polite">
        <span className="habit-loader habit-loader-sm" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span>{label}</span>
      </span>
    )
  }

  const isPage = variant === 'page'

  return (
    <div
      className={`flex ${isPage ? 'min-h-screen' : 'min-h-[16rem]'} items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-lg border border-blue-100 bg-white px-8 py-7 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <span className="habit-loader" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
        <p className="text-base font-semibold text-gray-900">{label}</p>
        <p className="mt-1 text-sm text-gray-500">Please wait a moment.</p>
      </div>
    </div>
  )
}
