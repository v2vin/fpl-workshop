import { useState } from 'react'
import Badge from './Badge'
import Notice from './Notice'
import type { Gift } from '../data/gifts'
import { returnToPool, type Code } from '../lib/draw'
import { formatDate, formatMonth } from '../lib/format'
import { holdUntil } from '../lib/rules'
import { useClaims } from '../lib/useClaims'
import { useCodes } from '../lib/useCodes'
import { useEntries } from '../lib/useEntries'
import { useManagers } from '../lib/useManagers'
import { useNow } from '../lib/useFpl'

/** Owner only: every code issued so far, its 60-day hold (rule 4.3) and handover checks. */
export default function CodesList({ gifts }: { gifts: Gift[] }) {
  const codes = useCodes()
  const managers = useManagers()
  const claims = useClaims(true)
  const entries = useEntries()
  const now = useNow(60_000)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  if (!codes) return null

  async function onReturn(code: Code) {
    if (!window.confirm(`Return ${code.code}'s gift to the pool? The winner loses it.`)) return
    setBusy(code.code)
    setError(null)
    try {
      await returnToPool(code)
    } catch (err) {
      console.error(err)
      setError('That did not save. Try again.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section>
      <h2 className="display mt-6 mb-3 text-[23px]">Issued codes</h2>
      {error && <Notice error>{error}</Notice>}
      {codes.length === 0 ? (
        <div className="card p-4 text-sm text-stone-600">
          None yet. The first prize month is still being played.
        </div>
      ) : (
        <ul className="space-y-3">
          {codes.map((c) => {
            const gift = gifts.find((g) => g.id === c.giftId)
            const name =
              (c.entryId !== null ? entries?.get(c.entryId)?.playerName : undefined) ??
              managers?.find((m) => m.uid === c.winnerUid)?.displayName ??
              gift?.wonByName ??
              c.winnerUid
            const team = c.entryId !== null ? entries?.get(c.entryId)?.teamName : undefined
            const verified = c.entryId !== null ? claims?.get(c.entryId)?.verified : undefined
            const until = holdUntil(c.issuedAt)
            const delivered = gift?.status === 'delivered' && gift.wonMonth === c.month
            const lapsed = !c.returnedAt && !delivered && now.toISOString() > until
            return (
              <li key={c.code} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <b className="font-mono">{c.code}</b>
                  {c.returnedAt ? (
                    <Badge>Returned to pool</Badge>
                  ) : (
                    <Badge tone={c.redeemed ? 'live' : 'pine'}>
                      {c.redeemed ? 'Revealed' : 'Waiting'}
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-sm text-stone-600">
                  {formatMonth(c.month)} · {name}
                  {team ? ` · ${team}` : ''}
                  {c.decidedBy === 'lot' ? ' · by lot' : ''}
                  <br />
                  {gift?.name ?? c.giftId}
                  {c.pool.length > 0 ? `, drawn from ${c.pool.length}` : ''}
                </p>
                {!c.returnedAt && !delivered && (
                  <p className="mt-2 text-xs text-stone-600">
                    Held until {formatDate(until)} ·{' '}
                    {verified ? 'team control checked' : 'team control not checked yet'}
                  </p>
                )}
                {c.returnedAt && (
                  <p className="mt-2 text-xs text-stone-600">
                    Unclaimed; back in the pool since {formatDate(c.returnedAt)}.
                  </p>
                )}
                {lapsed && (
                  <button
                    type="button"
                    disabled={busy === c.code}
                    onClick={() => void onReturn(c)}
                    className="btn mt-3 w-full"
                  >
                    {busy === c.code ? 'Returning…' : 'Hold over: return gift to pool'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
