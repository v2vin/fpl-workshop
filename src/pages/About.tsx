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
          Something handmade by {WORKSHOP_NAME}.
        </p>
      </div>

      <Section
        no="01"
        title="The league"
        sub="Level on points? The higher single-gameweek score that month wins. Still level, and it’s drawn by lot. To play for a month’s prize you need to have joined before it began."
      >
        The eligible manager with the most points across the month’s gameweeks wins a handmade
        wooden gift. A gameweek belongs to the month its deadline falls in, and the points are the
        ones in FPL’s own monthly table.
      </Section>

      <Section
        no="02"
        title="The draw"
        sub="One manager, one team, one code. Collect within 60 days, and show you control your FPL team before handover."
      >
        Your gift is drawn at random, from the pieces still available, when the month’s draw is run.
        The draw is recorded for the results video; the shuffle you see when you enter your code is
        for show.
      </Section>

      <Section
        no="03"
        title="The workshop"
        sub="Handmade means each piece varies a little in colour, grain and finish."
      >
        {WORKSHOP_NAME} makes every prize by hand: visible grain, useful little things, photographed
        as they are cut, glued and finished.
      </Section>

      <div className="mt-4 flex flex-col items-start">
        <Link to="/rules" className="btn btn-text">
          Read the prize rules →
        </Link>
        <Link to="/gifts" className="btn btn-text">
          Look around →
        </Link>
      </div>

      <p className="mt-6 border-t border-pine-200 pt-4 text-xs leading-relaxed text-stone-600">
        Free to join. Run independently by {WORKSHOP_NAME}; not affiliated with or endorsed by the
        Premier League or Fantasy Premier League.
      </p>
    </div>
  )
}
