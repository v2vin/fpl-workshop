import { useCallback, useState } from 'react'
import type { Gift } from '../data/gifts'
import { FIRST_PRIZE_MONTH } from '../lib/config'
import {
  DrawError,
  issueCode,
  pickAtRandom,
  winnerMessage,
  type Code,
  type DecidedBy,
} from '../lib/draw'
import { formatDate, formatMonth } from '../lib/format'
import { holdUntil, isPrizeMonth, resolveMonth, type RankedRow } from '../lib/rules'
import { useClaims } from '../lib/useClaims'
import { useCodes } from '../lib/useCodes'
import { useEntries } from '../lib/useEntries'
import { useMonth } from '../lib/useFpl'
import { useManagers } from '../lib/useManagers'
import Notice from './Notice'
import ShareButton from './ShareButton'
import Shuffle from './Shuffle'

const MONTH = /^[0-9]{4}-[0-9]{2}$/

/** Draws happen after a month closes, so default to last month, never before the first prize. */
function defaultMonth(): string {
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() - 1)
  const previous = d.toISOString().slice(0, 7)
  return previous < FIRST_PRIZE_MONTH ? FIRST_PRIZE_MONTH : previous
}

/** "A, B and C" */
function list(names: string[]): string {
  return names.length < 2
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

interface Issued {
  code: Code
  /** The gifts that were available, for the recorded shuffle. */
  pool: Gift[]
  winner: RankedRow
}

/**
 * The owner's draw. The winner comes from the prize rules (src/lib/rules.ts), never a free choice:
 * the month must be processed by FPL, the winner eligible and linked to an account, and each month
 * is drawn once. The gift is drawn the moment the owner taps, then the shuffle plays so the draw
 * can be screen-recorded for the results video (rule 3.2).
 */
export default function IssueCode({ gifts }: { gifts: Gift[] }) {
  const [month, setMonth] = useState(defaultMonth)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [issued, setIssued] = useState<Issued | null>(null)
  const [revealed, setRevealed] = useState(false)

  const valid = MONTH.test(month)
  const summary = useMonth(valid ? month : null)
  const entries = useEntries()
  const claims = useClaims(true)
  const managers = useManagers()
  const codes = useCodes()

  const available = gifts.filter((g) => g.status === 'available')
  const result = valid && summary ? resolveMonth(month, summary, entries) : null
  const decision = result?.decision
  const existing = codes?.find((c) => c.month === month && c.returnedAt === null)
  const rowOf = (id: number) => result?.rows.find((r) => r.entryId === id)
  const nameOf = (id: number) => rowOf(id)?.playerName ?? `team ${id}`
  const managerOf = (id: number) => {
    const claim = claims?.get(id)
    return claim ? managers?.find((m) => m.uid === claim.uid) : undefined
  }

  // The candidates to draw for: the winner, or every team still level for a draw by lot.
  const candidates =
    decision?.by === 'points' || decision?.by === 'best-gameweek'
      ? [decision.entryId]
      : decision?.by === 'lot'
        ? decision.tied
        : []
  const unlinked = candidates.filter((id) => !managerOf(id))
  const tied = decision && 'tied' in decision ? decision.tied : []

  const onShuffleDone = useCallback(() => setRevealed(true), [])

  async function onDraw() {
    if (!decision || decision.by === 'none' || !result?.final || existing) return
    const entryId = decision.by === 'lot' ? pickAtRandom(decision.tied) : decision.entryId
    const winner = entryId === undefined ? undefined : rowOf(entryId)
    const manager = entryId === undefined ? undefined : managerOf(entryId)
    if (!winner || !manager) return
    const decidedBy: DecidedBy = decision.by
    setBusy(true)
    setError(null)
    try {
      const code = await issueCode({
        month,
        winnerUid: manager.uid,
        entryId: winner.entryId,
        publicName: manager.hideName ? null : winner.playerName,
        decidedBy,
        tied,
        gifts,
      })
      setRevealed(false)
      setIssued({ code, pool: available, winner })
    } catch (err) {
      console.error(err)
      setError(err instanceof DrawError ? err.message : 'That did not work. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (issued && !revealed) {
    return (
      <section className="card p-4">
        <Shuffle gifts={issued.pool} finalGiftId={issued.code.giftId} onDone={onShuffleDone} />
      </section>
    )
  }

  let blocker: string | null = null
  if (!valid) blocker = 'Choose a month.'
  else if (!isPrizeMonth(month))
    blocker = `There is no prize for ${formatMonth(month)}. Prizes start in ${formatMonth(FIRST_PRIZE_MONTH)}.`
  else if (summary === null) blocker = 'No gameweek in that month has been played yet.'
  else if (existing) {
    const gift = gifts.find((g) => g.id === existing.giftId)
    blocker = `Already drawn: ${existing.code}, ${gift?.name ?? existing.giftId}.`
  } else if (result && !result.final)
    blocker = `Still open. FPL has not processed every gameweek in ${formatMonth(month)} yet, so the result can still change.`
  else if (decision?.by === 'none') blocker = 'Nobody eligible scored in that month.'
  else if (unlinked.length > 0)
    blocker = `${list(unlinked.map(nameOf))} ${unlinked.length === 1 ? 'has' : 'have'} not picked their team in the app yet. Ask them to sign in and choose it, then come back.`
  else if (available.length === 0) blocker = 'No gifts left to draw.'

  const winnerRow =
    decision?.by === 'points' || decision?.by === 'best-gameweek'
      ? rowOf(decision.entryId)
      : undefined
  const unverified = candidates.filter((id) => claims?.get(id)?.verified === false)
  const hidden = candidates.filter((id) => managerOf(id)?.hideName)
  const ready = blocker === null && result !== null && decision !== undefined
  const issuedGift = issued ? gifts.find((g) => g.id === issued.code.giftId) : undefined

  return (
    <>
      <section className="card p-4">
        <h2 className="display text-xl">Run the draw</h2>
        <p className="mt-1 text-sm text-stone-600">
          The winner comes from the rules. The gift is drawn at random from those still available
          the moment you tap, then the shuffle plays: screen-record it for the results video.
        </p>

        <label htmlFor="issue-month" className="label">
          Month
        </label>
        <input
          id="issue-month"
          type="month"
          min={FIRST_PRIZE_MONTH}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="input"
        />

        {valid && summary === undefined && isPrizeMonth(month) && (
          <p className="mt-3 text-sm text-stone-600">Loading the month…</p>
        )}
        {blocker && summary !== undefined && <Notice>{blocker}</Notice>}

        {ready && winnerRow && (
          <Notice>
            <b className="text-pitch-800">{winnerRow.playerName}</b> · {winnerRow.teamName}
            <br />
            {winnerRow.points} points
            {decision?.by === 'best-gameweek'
              ? `, level with ${list(tied.filter((t) => t !== winnerRow.entryId).map(nameOf))}; wins on best single gameweek (${winnerRow.bestGw}).`
              : ', most points.'}
          </Notice>
        )}
        {ready && decision?.by === 'lot' && (
          <Notice>
            <b className="text-pitch-800">Dead heat.</b> {list(decision.tied.map(nameOf))} are level
            on points and best gameweek. Tapping below draws lots between them, then the gift.
          </Notice>
        )}
        {ready && unverified.length > 0 && (
          <p className="text-xs text-pine-800">
            Not yet confirmed as controlling their team: {list(unverified.map(nameOf))}. Check
            before handover (rule 4.2), on the Teams page.
          </p>
        )}
        {ready && hidden.length > 0 && (
          <p className="mt-1 text-xs text-pine-800">
            Asked not to be named (rule 5.3): {list(hidden.map(nameOf))}. Leave them out of the
            video and social posts.
          </p>
        )}

        <button
          type="button"
          onClick={() => void onDraw()}
          disabled={!ready || busy}
          className="btn btn-primary mt-5 w-full"
        >
          {busy
            ? 'Drawing…'
            : decision?.by === 'lot'
              ? `Draw lots, then the gift (${available.length} left)`
              : `Draw the gift (${available.length} left)`}
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
            {formatMonth(issued.code.month)} · {issued.winner.playerName} · {issued.winner.teamName}
            {issued.code.decidedBy === 'lot' ? ' · won the draw by lot' : ''}
          </p>
          <h3 className="display mt-1 text-base">{issuedGift.name}</h3>
          <p className="text-xs text-stone-600">
            Held until {formatDate(holdUntil(issued.code.issuedAt))}. Keep the code to yourself.
          </p>
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
