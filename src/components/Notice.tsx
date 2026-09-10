import type { ReactNode } from 'react'

/** A quiet pine slip for placeholder, status and error text. */
export default function Notice({
  children,
  error = false,
}: {
  children: ReactNode
  error?: boolean
}) {
  return (
    <div className={`notice ${error ? 'notice-error' : ''}`} role={error ? 'alert' : undefined}>
      {children}
    </div>
  )
}
