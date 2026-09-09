import type { StandingsRow } from '../lib/fpl'

function Movement({ row }: { row: StandingsRow }) {
  const delta = row.lastRank - row.rank
  if (delta > 0) return <span className="text-pitch-600 text-xs font-bold">▲{delta}</span>
  if (delta < 0) return <span className="text-xs font-bold text-red-600">▼{-delta}</span>
  return <span className="text-xs text-stone-400">•</span>
}

export default function StandingsTable({
  rows,
  myEntry,
}: {
  rows: StandingsRow[]
  myEntry: number | null
}) {
  return (
    <section className="border-pine-200 overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-pine-50 text-xs text-stone-500 uppercase">
          <tr>
            <th className="w-10 px-2 py-2 text-left">#</th>
            <th className="px-2 py-2 text-left">Manager</th>
            <th className="w-12 px-2 py-2 text-right">GW</th>
            <th className="w-16 px-2 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-pine-100 divide-y">
          {rows.map((r) => (
            <tr key={r.entryId} className={r.entryId === myEntry ? 'bg-pine-50' : ''}>
              <td className="px-2 py-2 align-top">
                <div className="flex items-center gap-1">
                  <span className="text-pitch-900 font-bold">{r.rank}</span>
                  <Movement row={r} />
                </div>
              </td>
              <td className="min-w-0 px-2 py-2">
                <p className="truncate font-medium">{r.playerName}</p>
                <p className="truncate text-xs text-stone-500">{r.teamName}</p>
              </td>
              <td className="px-2 py-2 text-right font-mono">{r.eventPoints}</td>
              <td className="px-2 py-2 text-right font-mono font-semibold">{r.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
