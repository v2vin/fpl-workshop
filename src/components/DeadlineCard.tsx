import type { Standings } from '../lib/fpl'
import { formatCountdown, formatDeadline } from '../lib/format'

export default function DeadlineCard({ standings, now }: { standings: Standings; now: Date }) {
  if (!standings.nextDeadline) {
    return (
      <div className="border-pine-200 rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm text-stone-600">No more deadlines. The season is done.</p>
      </div>
    )
  }
  const left = formatCountdown(standings.nextDeadline, now)
  return (
    <div className="border-pine-200 flex items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm">
      <div>
        <p className="text-pine-700 text-xs font-semibold tracking-wide uppercase">
          Gameweek {standings.nextGameweek ?? '?'} deadline
        </p>
        <p className="text-pitch-900 mt-0.5 font-semibold">
          {formatDeadline(standings.nextDeadline)}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
          left ? 'bg-pitch-700 text-white' : 'bg-stone-200 text-stone-600'
        }`}
      >
        {left ? `in ${left}` : 'Passed'}
      </span>
    </div>
  )
}
