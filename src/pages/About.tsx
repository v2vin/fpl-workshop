import type { ReactNode } from 'react'
import Page from '../components/Page'
import { WORKSHOP_NAME } from '../lib/config'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-pine-200 rounded-xl border bg-white p-4 text-sm text-stone-700 shadow-sm">
      <h2 className="text-pitch-900 font-semibold">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  )
}

export default function About() {
  return (
    <Page title="About" intro="How the league and the draw work.">
      <Section title="The league">
        <p>
          A private Fantasy Premier League mini league. Each calendar month has a winner: the
          manager with the most points across the gameweeks whose deadline falls in that month,
          after transfer costs, as FPL reports them.
        </p>
        <p>If two managers tie, the higher season total wins. If that is level too, both win.</p>
      </Section>
      <Section title="The draw">
        <p>
          The month’s winner gets a small piece of solid pine. Which piece is decided by a random
          pick among the gifts still available, made on the owner’s phone at the moment the code is
          issued. The code is then sent to the winner on WhatsApp.
        </p>
        <p>
          When the winner enters the code, the cards shuffle and land on the gift. That shuffle is
          for show: the pick has already happened, so reloading the page, entering the code again or
          trying a friend’s phone cannot change it. Each code works once, and only for the account
          it was issued to.
        </p>
      </Section>
      <Section title="The workshop">
        <p>
          Every gift is made by hand at {WORKSHOP_NAME} in Malawi, from solid pine with a matt clear
          finish, and photographed as it is cut, glued and finished. Follow each build on the Gifts
          page.
        </p>
      </Section>
    </Page>
  )
}
