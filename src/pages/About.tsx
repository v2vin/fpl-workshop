import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { WORKSHOP_NAME } from '../lib/config'
import { useStandings } from '../lib/useFpl'

function Section({
  no,
  title,
  children,
  sub,
}: {
  no: string
  title: string
  children: ReactNode
  sub?: ReactNode
}) {
  return (
    <section className="grid grid-cols-[27px_1fr] gap-2.5 border-b border-pine-200 py-6">
      <span className="pt-1 font-mono text-[13px] text-pine-600">{no}</span>
      <div>
        <h2 className="display text-[23px] tracking-[-0.5px]">{title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed">{children}</p>
        {sub && <p className="mt-2 text-sm text-stone-600">{sub}</p>}
      </div>
    </section>
  )
}

export default function About() {
  const standings = useStandings()
  const friends = standings?.rows.length ? `${standings.rows.length} friends.` : 'A few friends.'
  return (
    <div>
      <div className="border-b-[3px] border-pitch-800 pb-4">
        <p className="eyebrow">Lilongwe / Malawi</p>
        <h1 className="display my-4 text-[34px] leading-[1.04] tracking-[-1.6px] text-pitch-900">
          A league with
          <br />a sawdust habit.
        </h1>
        <p className="text-[15px] text-stone-600">
          {friends} A monthly winner.
          <br />
          Something made by Vitumbiko.
        </p>
      </div>

      <Section
        no="01"
        title="The league"
        sub="Level on points at the top? Higher season total takes it. Still level, and both win."
      >
        Most points across the month’s gameweeks wins a handmade pine gift. A gameweek belongs to
        the month its deadline falls in, and points count after transfer costs, as FPL reports them.
      </Section>

      <Section
        no="02"
        title="The draw"
        sub="One manager. One use. Reloading, retrying or a friend’s phone cannot change the pick. Your revealed gift stays in your cabinet."
      >
        Your gift is chosen at random, from the pieces still available, at the moment Vitumbiko
        issues your code. The shuffle you see afterwards is for show.
      </Section>

      <Section
        no="03"
        title="The workshop"
        sub="Follow your gift from the first cut to your shelf."
      >
        {WORKSHOP_NAME} is Vitumbiko’s one-man workshop. Solid pine, visible grain, useful little
        things, photographed as they are cut, glued and finished.
      </Section>

      <Link to="/gifts" className="btn btn-text mt-4">
        Look around →
      </Link>
    </div>
  )
}
