import type { ReactNode } from 'react'

interface Props {
  title: string
  intro?: string
  children?: ReactNode
}

export default function Page({ title, intro, children }: Props) {
  return (
    <section>
      <h1 className="text-pitch-900 text-2xl font-bold tracking-tight">{title}</h1>
      {intro && <p className="mt-1 text-stone-600">{intro}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}
