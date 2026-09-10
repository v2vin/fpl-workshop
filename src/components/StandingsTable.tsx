import type { StandingsRow } from '../lib/fpl'

function Movement({ row }: { row: StandingsRow }) {
  const delta = row.lastRank - row.rank
  if (delta > 0) return <small className="block text-xs text-pitch-600">▲{delta}</small>
  if (delta < 0) return <small className="block text-xs text-pine-700">▼{-delta}</small>
  return <small className="block text-xs text-stone-400">•</small>
}

export default function StandingsTable({
  rows,
  myEntry,
}: {
  rows: StandingsRow[]
  myEntry: number | null
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-pine-200 text-left text-xs font-medium text-stone-600">
          <th className="px-1.5 py-3">#</th>
          <th className="px-1.5 py-3">Manager / team</th>
          <th className="px-1.5 py-3 text-right">GW</th>
          <th className="px-1.5 py-3 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const own = r.entryId === myEntry
          return (
            <tr key={r.entryId} className={`border-b border-pine-100 ${own ? 'bg-pitch-50' : ''}`}>
              <td
                className={`px-1.5 py-3.5 align-top ${own ? 'shadow-[inset_3px_0_var(--color-pitch-700)]' : ''}`}
              >
                <span className="font-semibold">{r.rank}</span>
                <Movement row={r} />
              </td>
              <td className="min-w-0 px-1.5 py-3.5">
                <span className="block truncate font-semibold">
                  {r.playerName}
                  {own && <span className="font-normal text-stone-600"> · you</span>}
                </span>
                <small className="block truncate text-xs text-stone-600">{r.teamName}</small>
              </td>
              <td className="px-1.5 py-3.5 text-right font-mono">{r.eventPoints}</td>
              <td className="px-1.5 py-3.5 text-right font-mono font-semibold">{r.totalPoints}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
