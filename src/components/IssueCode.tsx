import { useState } from 'react'
import type { Gift } from '../data/gifts'
import { DrawError, issueCode, winnerMessage, type Code } from '../lib/draw'
import { formatMonth } from '../lib/format'
import { useMonth } from '../lib/useFpl'
import { useManagers } from '../lib/useManagers'
import Notice from './Notice'
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
  const runnerUp = summary?.rows[1]
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
    <>
      <section className="card p-4">
        <h2 className="display text-xl">Issue a code</h2>
        <p className="mt-1 text-sm text-stone-600">
          The gift is drawn the moment you tap Issue. The shuffle the winner sees later is just for
          show.
        </p>

        <label htmlFor="issue-month" className="label">
          Month
        </label>
        <input
          id="issue-month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="input"
        />

        {summary === null && (
          <p className="mt-2 text-sm text-stone-600">
            No gameweek in that month has been played yet.
          </p>
        )}
        {summary && leader && (
          <>
            <Notice>
              <b className={summary.closed ? 'text-pitch-800' : 'text-pine-800'}>
                {summary.closed ? 'Month closed.' : 'Month still open.'}
              </b>{' '}
              Leader: {leader.playerName} on {leader.points} points
              {runnerUp ? ` (next: ${runnerUp.playerName}, ${runnerUp.points})` : ''}
            </Notice>
            {leaderManager ? (
              <button
                type="button"
                onClick={() => setWinnerUid(leaderManager.uid)}
                className="btn w-full"
              >
                Pick the leader
              </button>
            ) : (
              <p className="text-xs text-stone-600">
                Nobody signed in has linked team {leader.entryId} yet, so pick the winner by hand.
              </p>
            )}
          </>
        )}

        <label htmlFor="issue-winner" className="label">
          Winner
        </label>
        <select
          id="issue-winner"
          value={winnerUid}
          onChange={(e) => setWinnerUid(e.target.value)}
          className="input"
        >
          <option value="">Choose a manager</option>
          {(managers ?? []).map((m) => (
            <option key={m.uid} value={m.uid}>
              {m.displayName}
              {m.fplEntryId ? ` (team ${m.fplEntryId})` : ' (no team linked)'}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => void onIssue()}
          disabled={!winner || busy || available === 0}
          className="btn btn-primary mt-5 w-full"
        >
          {busy ? 'Drawing…' : `Issue code (${available} gifts left)`}
        </button>
        {error && <Notice error>{error}</Notice>}
      </section>

      {issued && issuedGift && (
        <section className="card p-4">
          <p className="eyebrow">Code ready</p>
          <p className="mt-2 font-mono text-lg font-bold tracking-[0.5px] select-all">
            {issued.code.code}
          </p>
          <p className="mt-4 text-sm text-stone-600">
            {formatMonth(issued.code.month)} · {issued.winnerName}
          </p>
          <h3 className="display mt-1 text-base">{issuedGift.name}</h3>
          <p className="text-xs text-stone-600">Keep that to yourself.</p>
          <ShareButton
            text={winnerMessage(issued.code)}
            label="Send code on WhatsApp ↗"
            className="mt-4 w-full"
          />
        </section>
      )}
    </>
  )
}
