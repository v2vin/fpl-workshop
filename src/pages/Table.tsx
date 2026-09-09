import DeadlineCard from '../components/DeadlineCard'
import MonthLeaders from '../components/MonthLeaders'
import Notice from '../components/Notice'
import Page from '../components/Page'
import StandingsTable from '../components/StandingsTable'
import { useAuth } from '../lib/auth'
import { formatRelative } from '../lib/format'
import { useMonth, useNow, useStandings } from '../lib/useFpl'
import { useManager } from '../lib/useManager'

export default function Table() {
  const standings = useStandings()
  const month = useMonth(standings?.currentMonth ?? null)
  const now = useNow()
  const { user } = useAuth()
  const manager = useManager(user?.uid)
  const myEntry = manager?.fplEntryId ?? null

  if (standings === undefined) return <Page title="League table" />
  if (standings === null) {
    return (
      <Page title="League table" intro="Standings, this month’s leaders and the next deadline.">
        <Notice>The table appears here once the first sync from FPL has run.</Notice>
      </Page>
    )
  }

  return (
    <Page
      title={standings.leagueName}
      intro={`Gameweek ${standings.gameweek} · updated ${formatRelative(standings.updatedAt, now)}`}
    >
      <DeadlineCard standings={standings} now={now} />
      <MonthLeaders monthId={standings.currentMonth} month={month} myEntry={myEntry} />
      <h2 className="text-pitch-900 pt-1 text-lg font-bold">Season</h2>
      <StandingsTable rows={standings.rows} myEntry={myEntry} />
      {user && myEntry === null && (
        <p className="text-xs text-stone-500">
          Link your FPL team above and your row gets highlighted.
        </p>
      )}
    </Page>
  )
}
