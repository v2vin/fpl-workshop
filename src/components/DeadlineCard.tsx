import type { Standings } from '../lib/fpl'
import { formatCountdown, formatDeadline } from '../lib/format'

/** The next deadline as a ruled line: label left, big monospace countdown right. */
export default function DeadlineCard({ standings, now }: { standings: Standings; now: Date }) {
  if (!standings.nextDeadline) {
    return (
      <div className="my-4 border-y border-pine-300 py-2.5 text-sm text-stone-600">
        No more deadlines. The season is done.
      </div>
    )
  }
  const left = formatCountdown(standings.nextDeadline, now)
  return (
    <div className="my-4 flex items-start justify-between gap-3 border-y border-pine-300 py-2.5">
      <p className="pt-1 text-[13px] font-semibold text-pitch-800">
        Gameweek {standings.nextGameweek ?? '?'} deadline
      </p>
      <div className="text-right">
        <p className="font-mono text-[21px] leading-tight font-bold text-pitch-800">
          {left ? left.replace(' ', ' ') : 'Passed'}
        </p>
        <p className="text-[11px] text-stone-600">{formatDeadline(standings.nextDeadline)}</p>
      </div>
    </div>
  )
}
