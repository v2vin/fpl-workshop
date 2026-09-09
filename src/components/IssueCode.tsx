import { useState } from 'react'
import type { Gift } from '../data/gifts'
import { DrawError, issueCode, winnerMessage, type Code } from '../lib/draw'
import { formatMonth } from '../lib/format'
import { useMonth } from '../lib/useFpl'
import { useManagers } from '../lib/useManagers'
import ShareButton from './ShareButton'

/** Draws happen after a month closes, so default to last month. */
function previousMonth(): string {
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() - 1)
  return d.toISOString().slice(0, 7)
}

export default function IssueCode({ gifts }: { gifts: Gift[] }) {
  const managers = useManagers()
  const [month, setMonth] = useState(previousMonth)
  const [winnerUid, setWinnerUid] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [issued, setIssued] = useState<{ code: Code; winnerName: string } | null>(null)

  const available = gifts.filter((g) => g.status === 'available').length
  const winner = managers?.find((m) => m.uid === winnerUid)
  // Close-month view: who the sync says leads the chosen month, and whether it is finished.
  const summary = useMonth(/^[0-9]{4}-[0-9]{2}$/.test(month) ? month : null)
  const leader = summary?.rows[0]
  const leaderManager = leader ? managers?.find((m) => m.fplEntryId === leader.entryId) : undefined
  const issuedGift = issued ? gifts.find((g) => g.id === issued.code.giftId) : undefined

  async function onIssue() {
    if (!winner || !/^[0-9]{4}-[0-9]{2}$/.test(month)) return
    setBusy(true)
    setError(null)
    try {
      const code = await issueCode({
        month,
        winnerUid: winner.uid,
        winnerName: winner.displayName,
        gifts,
      })
      setIssued({ code, winnerName: winner.displayName })
    } catch (err) {
      console.error(err)
      setError(err instanceof DrawError ? err.message : 'That did not work. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="border-pine-200 rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="font-semibold">Issue a code</h2>
      <p className="mt-1 text-sm text-stone-600">
        The gift is drawn the moment you tap Issue. The shuffle the winner sees later is just for
        show.
      </p>
      <div className="mt-3 grid gap-3">
        <label className="text-sm">
          <span className="block text-stone-600">Month</span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </label>
        {summary === null && (
          <p className="text-sm text-stone-500">No gameweek in that month has been played yet.</p>
        )}
        {summary && leader && (
          <div className="bg-pine-50 rounded-lg p-3 text-sm">
            <p>
              <span
                className={
                  summary.closed ? 'text-pitch-800 font-semibold' : 'font-semibold text-amber-700'
                }
              >
                {summary.closed ? 'Month closed.' : 'Month still open.'}
              </span>{' '}
              Leader: <strong>{leader.playerName}</strong> on {leader.points} points
              {summary.rows[1]
                ? ` (next: ${summary.rows[1].playerName}, ${summary.rows[1].points})`
                : ''}
              .
            </p>
            {leaderManager ? (
              <button
                type="button"
                onClick={() => setWinnerUid(leaderManager.uid)}
                className="text-pitch-700 mt-2 text-sm font-medium underline"
              >
                Pick {leaderManager.displayName} as the winner
              </button>
            ) : (
              <p className="mt-1 text-xs text-stone-500">
                Nobody signed in has linked team {leader.entryId} yet, so pick the winner by hand.
              </p>
            )}
          </div>
        )}
        <label className="text-sm">
          <span className="block text-stone-600">Winner</span>
          <select
            value={winnerUid}
            onChange={(e) => setWinnerUid(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
          >
            <option value="">Choose a manager</option>
            {(managers ?? []).map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.displayName}
                {m.fplEntryId ? ` (team ${m.fplEntryId})` : ' (no team linked)'}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void onIssue()}
          disabled={!winner || busy || available === 0}
          className="bg-pitch-700 rounded-lg px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {busy ? 'Drawing' : `Issue code (${available} gifts left)`}
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>

      {issued && issuedGift && (
        <div className="bg-pine-100 mt-4 rounded-lg p-3 text-sm">
          <p>
            Code for <strong>{issued.winnerName}</strong>, {formatMonth(issued.code.month)}:
          </p>
          <p className="mt-1 font-mono text-lg font-bold tracking-wider select-all">
            {issued.code.code}
          </p>
          <p className="mt-1 text-stone-700">
            They will reveal a <strong>{issuedGift.name}</strong>. Keep that to yourself.
          </p>
          <div className="mt-3">
            <ShareButton text={winnerMessage(issued.code)} label="Send code on WhatsApp" />
          </div>
        </div>
      )}
    </section>
  )
}
