import Badge from './Badge'
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
    <section>
      <h2 className="display mt-6 mb-3 text-[23px]">Issued codes</h2>
      {codes.length === 0 ? (
        <div className="card p-4 text-sm text-stone-600">
          None yet. The first month is still being played.
        </div>
      ) : (
        <ul className="space-y-3">
          {codes.map((c) => {
            const gift = gifts.find((g) => g.id === c.giftId)
            const name =
              managers?.find((m) => m.uid === c.winnerUid)?.displayName ??
              gift?.wonByName ??
              c.winnerUid
            return (
              <li key={c.code} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <b className="font-mono">{c.code}</b>
                  <Badge tone={c.redeemed ? 'live' : 'pine'}>
                    {c.redeemed ? 'Revealed' : 'Waiting'}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-stone-600">
                  {formatMonth(c.month)} · {name}
                  <br />
                  {gift?.name ?? c.giftId}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
