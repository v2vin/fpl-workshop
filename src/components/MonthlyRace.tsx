import type { ReactNode } from 'react'
import { Link } from 'react-router'
import Badge from './Badge'
import { FIRST_PRIZE_MONTH } from '../lib/config'
import type { Entry } from '../lib/entries'
import type { Month } from '../lib/fpl'
import { formatMonth } from '../lib/format'
import { INELIGIBLE_LABELS, decidedEntry, isPrizeMonth, resolveMonth } from '../lib/rules'

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

/** "A, B and C" */
function list(names: string[]): string {
  return names.length < 2
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

/**
 * The dark "monthly race" card: the eligible leader in lights, the chasing pack, and your gap to
 * the top. Eligibility and tie-breaks follow the prize rules (src/lib/rules.ts).
 */
export default function MonthlyRace({
  monthId,
  month,
  entries,
  myEntry,
  teamOf,
}: {
  monthId: string | null
  month: Month | null | undefined
  entries: Map<number, Entry> | undefined
  myEntry: number | null
  teamOf: (entryId: number) => string | undefined
}) {
  const prize = monthId !== null && isPrizeMonth(monthId)
  const result = monthId && month ? resolveMonth(monthId, month, entries) : null
  const rows = result?.rows ?? []
  const decision = result?.decision ?? { by: 'none' as const }
  const final = result?.final ?? false
  const nameOf = (id: number) => rows.find((r) => r.entryId === id)?.playerName ?? 'Unknown'

  const leaderId =
    decidedEntry(decision) ??
    (decision.by === 'lot' ? decision.tied[0] : undefined) ??
    rows.find((r) => r.ineligible === null)?.entryId ??
    rows[0]?.entryId
  const leader = rows.find((r) => r.entryId === leaderId)
  const chasers = rows.filter((r) => r.entryId !== leaderId).slice(0, 4)
  const mine = myEntry === null ? undefined : rows.find((r) => r.entryId === myEntry)

  let foot: ReactNode
  if (!prize) foot = `No prize this month. Prizes start in ${formatMonth(FIRST_PRIZE_MONTH)}.`
  else if (decision.by === 'none') foot = 'Nobody eligible has scored yet.'
  else if (final && decision.by === 'lot')
    foot = `Dead heat on points and best gameweek. The prize is drawn by lot between ${list(decision.tied.map(nameOf))}.`
  else if (final)
    foot = `Month closed. ${leader?.playerName} wins${decision.by === 'best-gameweek' ? ' on the best single gameweek' : ''}.`
  else if (decision.by === 'lot')
    foot = 'Level on points and best single gameweek. As it stands, lots would decide it.'
  else if (decision.by === 'best-gameweek')
    foot = `Level on points. ${leader?.playerName} leads on the best single gameweek (${leader?.bestGw}).`
  else if (myEntry === null) foot = 'Pick your FPL team to see your gap to the top.'
  else if (!mine) foot = 'Your row appears after your first gameweek.'
  else if (mine.ineligible)
    foot = `You’re playing, but not for this month’s prize: ${INELIGIBLE_LABELS[mine.ineligible].toLowerCase()}.`
  else if (mine.entryId === leaderId) foot = 'You’re setting the pace.'
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
        {month && <Badge tone="dark">{final ? 'Closed' : 'Live'}</Badge>}
      </div>
      <p className="mt-1.5 px-4 text-xs text-pine-200">
        {month
          ? `${gameweekRange(month.gameweeks)} · ${prize ? 'A handmade gift on the line' : 'Warm-up month'}`
          : ''}
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
                {decision.by === 'lot' ? '★ LEVEL AT THE TOP' : '★ SETTING THE PACE'}
              </span>
              <h3 className="display max-w-[190px] text-[22px] leading-tight tracking-[-0.6px]">
                {leader.playerName}
              </h3>
              <span className="block truncate text-xs text-pine-200">
                {leader.teamName || teamOf(leader.entryId) || ''}
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
            {chasers.map((r) => (
              <li
                key={r.entryId}
                className="flex items-center gap-2.5 border-b border-pitch-700 py-2 text-sm last:border-0"
              >
                <span className="w-5 font-mono text-xs text-pine-300">{rows.indexOf(r) + 1}</span>
                <span className="min-w-0 flex-1 truncate">
                  {r.playerName}
                  {r.entryId === myEntry && <small className="ml-1 text-pine-200">you</small>}
                  {prize && r.ineligible && (
                    <small className="ml-1.5 text-pine-300" title={INELIGIBLE_LABELS[r.ineligible]}>
                      not eligible
                    </small>
                  )}
                </span>
                <strong className="font-mono text-base">{r.points}</strong>
              </li>
            ))}
          </ol>
          <div className="bg-pine-200 px-4 py-2.5 text-xs text-pitch-900">
            {foot}{' '}
            {prize && (
              <Link to="/rules" className="underline underline-offset-2">
                Rules
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  )
}
