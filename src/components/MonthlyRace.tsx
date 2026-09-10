import Badge from './Badge'
import type { Month } from '../lib/fpl'

/** "September ’26" */
function shortMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number)
  if (!y || !m) return yyyyMm
  const name = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  })
  return `${name} ’${String(y).slice(-2)}`
}

function gameweekRange(gws: number[]): string {
  if (gws.length === 0) return ''
  const s = [...gws].sort((a, b) => a - b)
  return s.length === 1 ? `GW ${s[0]}` : `GW ${s[0]}–${s[s.length - 1]}`
}

/** The dark "monthly race" card: leader in lights, the chasing pack, and your gap to the top. */
export default function MonthlyRace({
  monthId,
  month,
  myEntry,
  teamOf,
}: {
  monthId: string | null
  month: Month | null | undefined
  myEntry: number | null
  teamOf: (entryId: number) => string | undefined
}) {
  const rows = month?.rows ?? []
  const leader = rows[0]
  const mine = myEntry === null ? undefined : rows.find((r) => r.entryId === myEntry)
  const tie = rows.length > 1 && rows[0].points === rows[1].points

  let foot: React.ReactNode
  if (tie) foot = 'Level on points at the top. Higher season total takes it.'
  else if (month?.closed && leader) foot = `Month closed. ${leader.playerName} takes the gift.`
  else if (myEntry === null) foot = 'Link your FPL team to see your gap to the top.'
  else if (!mine) foot = 'Your row appears after your first gameweek.'
  else if (mine.entryId === leader?.entryId) foot = 'You’re setting the pace.'
  else
    foot = (
      <>
        <span className="font-mono font-extrabold">{(leader?.points ?? 0) - mine.points} pts</span>{' '}
        between you and the top.
      </>
    )

  return (
    <section className="mt-5 overflow-hidden rounded-xl bg-pitch-800 text-pine-100">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <div>
          <p className="eyebrow mb-1 text-pine-300">This month</p>
          <h2 className="display text-[23px] leading-none tracking-[-0.8px]">
            {monthId ? shortMonth(monthId) : 'This month'}
          </h2>
        </div>
        {month && <Badge tone="dark">{month.closed ? 'Closed' : 'Live'}</Badge>}
      </div>
      <p className="mt-1.5 px-4 text-xs text-pine-200">
        {month ? `${gameweekRange(month.gameweeks)} · A handmade gift on the line` : ''}
      </p>

      {month === undefined && <div className="h-24" />}
      {month === null && (
        <p className="px-4 pt-4 pb-5 text-sm text-pine-200">
          No gameweek has started this month yet.
        </p>
      )}

      {month && leader && (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-pitch-600 px-4 pt-5 pb-4">
            <div className="min-w-0">
              <span className="mb-1.5 block text-[10px] tracking-[1px] text-pine-300">
                ★ SETTING THE PACE
              </span>
              <h3 className="display max-w-[190px] text-[22px] leading-tight tracking-[-0.6px]">
                {leader.playerName}
              </h3>
              <span className="block truncate text-xs text-pine-200">
                {teamOf(leader.entryId) ?? ''}
              </span>
            </div>
            <div className="shrink-0 text-right">
              <span className="block font-mono text-[49px] leading-[0.95] font-bold tracking-[-3px]">
                {leader.points}
              </span>
              <span className="mt-1.5 block text-[9px] font-semibold tracking-[2px] text-pine-300">
                POINTS
              </span>
            </div>
          </div>
          <ol className="px-4 pb-1.5">
            {rows.slice(1, 5).map((r, i) => (
              <li
                key={r.entryId}
                className="flex items-center gap-2.5 border-b border-pitch-700 py-2 text-sm last:border-0"
              >
                <span className="w-5 font-mono text-xs text-pine-300">{i + 2}</span>
                <span className="flex-1 truncate">
                  {r.playerName}
                  {r.entryId === myEntry && <small className="ml-1 text-pine-200">you</small>}
                </span>
                <strong className="font-mono text-base">{r.points}</strong>
              </li>
            ))}
          </ol>
          <div className="bg-pine-200 px-4 py-2.5 text-xs text-pitch-900">{foot}</div>
        </>
      )}
    </section>
  )
}
