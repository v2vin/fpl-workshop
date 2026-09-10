import type { ReactNode } from 'react'

/** Generic pill: Live, Closed, Waiting, Revealed. */
export default function Badge({
  children,
  tone = 'pine',
}: {
  children: ReactNode
  tone?: 'pine' | 'live' | 'dark'
}) {
  const cls = {
    pine: 'bg-pine-100 text-pine-800',
    live: 'bg-pitch-100 text-pitch-700',
    dark: 'border border-pitch-400 bg-pitch-700 text-pine-100',
  }[tone]
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${cls}`}
    >
      {children}
    </span>
  )
}
