import type { Gift } from '../data/gifts'
import { formatMonth } from '../lib/format'
import { useCodes } from '../lib/useCodes'
import { useManagers } from '../lib/useManagers'

/** Owner only: every code issued so far and whether it has been revealed. */
export default function CodesList({ gifts }: { gifts: Gift[] }) {
  const codes = useCodes()
  const managers = useManagers()
  if (!codes) return null
  return (
    <section className="border-pine-200 rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="font-semibold">Issued codes</h2>
      {codes.length === 0 ? (
        <p className="mt-1 text-sm text-stone-600">
          None yet. The first month is still being played.
        </p>
      ) : (
        <ul className="divide-pine-100 mt-2 divide-y text-sm">
          {codes.map((c) => {
            const gift = gifts.find((g) => g.id === c.giftId)
            const name =
              managers?.find((m) => m.uid === c.winnerUid)?.displayName ??
              gift?.wonByName ??
              c.winnerUid
            return (
              <li key={c.code} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="font-mono font-semibold">{c.code}</p>
                  <p className="truncate text-xs text-stone-600">
                    {formatMonth(c.month)} · {name} · {gift?.name ?? c.giftId}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.redeemed ? 'bg-pitch-100 text-pitch-800' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {c.redeemed ? 'Revealed' : 'Waiting'}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
