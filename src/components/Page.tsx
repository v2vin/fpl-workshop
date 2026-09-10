import type { ReactNode } from 'react'

interface Props {
  /** Small tracked kicker above the title, e.g. "17 friends / one workshop". */
  eyebrow?: ReactNode
  title: ReactNode
  intro?: ReactNode
  children?: ReactNode
}

export default function Page({ eyebrow, title, intro, children }: Props) {
  return (
    <section>
      {eyebrow && <p className="eyebrow mb-2.5">{eyebrow}</p>}
      <h1 className="display text-[30px] leading-[1.04] tracking-[-1.25px] text-pitch-900">
        {title}
      </h1>
      {intro && <p className="mt-2 text-sm text-stone-600">{intro}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}
