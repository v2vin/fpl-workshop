import { Link } from 'react-router'
import DeadlineCard from '../components/DeadlineCard'
import Icon from '../components/Icon'
import MonthlyRace from '../components/MonthlyRace'
import Notice from '../components/Notice'
import Page from '../components/Page'
import StandingsTable from '../components/StandingsTable'
import { useAuth } from '../lib/auth'
import { formatRelative } from '../lib/format'
import { useMonth, useNow, useStandingsState } from '../lib/useFpl'
import { useManager } from '../lib/useManager'

const TITLE = (
  <>
    The workshop
    <br />
    league<span className="text-pine-600">.</span>
  </>
)

export default function Table() {
  const { standings, error } = useStandingsState()
  const month = useMonth(standings?.currentMonth ?? null)
  const now = useNow()
  const { user } = useAuth()
  const manager = useManager(user?.uid)
  const myEntry = manager?.fplEntryId ?? null

  if (standings === undefined) {
    return (
      <Page title={TITLE} intro="Loading the latest points…">
        <div aria-busy="true" aria-label="Loading table">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`skeleton ${i % 3 === 0 ? 'w-2/3' : ''}`} />
          ))}
        </div>
      </Page>
    )
  }

  if (standings === null) {
    return (
      <Page title={TITLE} intro="A new season on the bench.">
        <div className="card px-4 py-10 text-center">
          <Icon name="table" className="mx-auto mb-5 h-10 w-10 text-pine-600" />
          <h2 className="display text-xl">Waiting for kick-off</h2>
          <p className="mt-2 text-sm text-stone-600">
            The league table will appear after the first FPL sync.
          </p>
          <p className="text-sm text-stone-600">Your points and monthly race will be right here.</p>
        </div>
      </Page>
    )
  }

  const teamOf = (entryId: number) => standings.rows.find((r) => r.entryId === entryId)?.teamName

  return (
    <Page
      eyebrow={`${standings.leagueName} · ${standings.rows.length} friends`}
      title={TITLE}
      intro={`Gameweek ${standings.gameweek} · updated ${formatRelative(standings.updatedAt, now)}`}
    >
      {error && <Notice error>Couldn’t refresh the points. Showing the last update.</Notice>}
      <DeadlineCard standings={standings} now={now} />
      <MonthlyRace
        monthId={standings.currentMonth}
        month={month}
        myEntry={myEntry}
        teamOf={teamOf}
      />

      <div className="section-heading">
        <h2 className="display text-[23px]">The long game</h2>
        <small className="text-xs text-stone-600">Season table</small>
      </div>
      <StandingsTable rows={standings.rows} myEntry={myEntry} />

      <div className="mt-6 grid grid-cols-[64px_1fr] items-center gap-4 border-t-2 border-pine-300 pt-5">
        <img src="/brand/mark.svg" alt="" className="h-16 w-16" />
        <div>
          <p className="eyebrow text-[10px]">VMS Woodwork</p>
          <h3 className="display mt-1 text-base">On the bench</h3>
          <p className="text-xs text-stone-600">Solid pine. Made by Vitumbiko.</p>
          <Link to="/gifts" className="btn btn-text text-sm">
            See the gifts →
          </Link>
        </div>
      </div>
    </Page>
  )
}
