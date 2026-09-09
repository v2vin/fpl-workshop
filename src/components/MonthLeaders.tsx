import type { Month } from '../lib/fpl'
import { formatMonth } from '../lib/format'

function gameweekRange(gws: number[]): string {
  if (gws.length === 0) return ''
  const sorted = [...gws].sort((a, b) => a - b)
  return sorted.length === 1 ? `GW ${sorted[0]}` : `GW ${sorted[0]}–${sorted[sorted.length - 1]}`
}

export default function MonthLeaders({
  monthId,
  month,
  myEntry,
}: {
  monthId: string | null
  month: Month | null | undefined
  myEntry: number | null
}) {
  const title = monthId ? formatMonth(monthId) : 'This month'
  const top = month?.rows.slice(0, 5) ?? []
  const tie = top.length > 1 && top[0].points === top[1].points
  return (
    <section className="border-pine-200 rounded-xl border bg-white shadow-sm">
      <div className="border-pine-100 flex items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <h2 className="text-pitch-900 font-semibold">{title}</h2>
          {month && <p className="text-xs text-stone-500">{gameweekRange(month.gameweeks)}</p>}
        </div>
        {month && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              month.closed ? 'bg-pine-200 text-pine-900' : 'bg-pitch-100 text-pitch-800'
            }`}
          >
            {month.closed ? 'Closed, code time' : 'Live'}
          </span>
        )}
      </div>
      {month === undefined ? null : month === null ? (
        <p className="px-4 py-3 text-sm text-stone-600">No gameweek has started this month yet.</p>
      ) : (
        <ol className="divide-pine-100 divide-y">
          {top.map((r, i) => (
            <li
              key={r.entryId}
              className={`flex items-center gap-3 px-4 py-2 text-sm ${
                r.entryId === myEntry ? 'bg-pine-50' : ''
              }`}
            >
              <span
                className={`w-5 text-center font-bold ${i === 0 ? 'text-pine-600' : 'text-stone-400'}`}
              >
                {i === 0 ? '★' : i + 1}
              </span>
              <span className="flex-1 truncate font-medium">{r.playerName}</span>
              <span className="font-mono font-semibold">{r.points}</span>
            </li>
          ))}
        </ol>
      )}
      {tie && (
        <p className="border-pine-100 border-t px-4 py-2 text-xs text-stone-500">
          Level on points at the top. Higher season total takes it.
        </p>
      )}
    </section>
  )
}
