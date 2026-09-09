import type { ReactNode } from 'react'

/** A quiet card for placeholder and status text. */
export default function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="border-pine-200 rounded-xl border bg-white p-4 text-sm text-stone-700 shadow-sm">
      {children}
    </div>
  )
}
