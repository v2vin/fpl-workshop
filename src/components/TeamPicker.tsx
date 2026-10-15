import { useState } from 'react'
import { Link } from 'react-router'
import { WORKSHOP_NAME } from '../lib/config'
import { claimTeam } from '../lib/claims'
import { entriesOpen } from '../lib/rules'
import { useClaims } from '../lib/useClaims'
import { useStandings } from '../lib/useFpl'

const LATER_KEY = 'fplw-team-later'

/**
 * Shown after sign-in until the manager says which league team is theirs, or taps Later for this
 * visit. Teams someone else has claimed are greyed out: one team per person (rule 1.4).
 */
export default function TeamPicker({
  uid,
  allowLater = true,
}: {
  uid: string
  allowLater?: boolean
}) {
  const standings = useStandings()
  const claims = useClaims(true)
  const [entryId, setEntryId] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [later, setLater] = useState(() => {
    try {
      return sessionStorage.getItem(LATER_KEY) === '1'
    } catch {
      return false
    }
  })

  if ((later && allowLater) || !standings || !claims) return null

  const teams = [...standings.rows].sort((a, b) => a.playerName.localeCompare(b.playerName))
  const chosen = teams.find((t) => String(t.entryId) === entryId)

  function dismiss() {
    try {
      sessionStorage.setItem(LATER_KEY, '1')
    } catch {
      // Private mode: the prompt simply returns next visit.
    }
    setLater(true)
  }

  async function onConfirm() {
    if (!chosen) return
    setBusy(true)
    setError(null)
    try {
      await claimTeam(uid, chosen.entryId)
    } catch (err) {
      console.error(err)
      setError('Someone may have just picked that team. Check the list and try again.')
      setConfirming(false)
    } finally {
      setBusy(false)
    }
  }

  if (confirming && chosen) {
    return (
      <section className="card mb-5 p-4">
        <p className="eyebrow">Is this you?</p>
        <h2 className="display mt-2 text-xl">{chosen.playerName}</h2>
        <p className="text-sm text-stone-600">{chosen.teamName}</p>
        <p className="mt-3 text-sm text-stone-600">
          {WORKSHOP_NAME} will check it’s really you before any prize is handed over, so pick only
          your own team.
        </p>
        {error && <p className="mt-2 text-sm text-pine-800">{error}</p>}
        <button
          type="button"
          onClick={() => void onConfirm()}
          disabled={busy}
          className="btn btn-primary mt-4 w-full"
        >
          {busy ? 'Linking…' : 'Yes, that’s my team'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="btn btn-text mt-1 w-full"
        >
          Back
        </button>
      </section>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (chosen) setConfirming(true)
      }}
      className="card mb-5 p-4"
    >
      <h2 className="display text-xl">Which team is yours?</h2>
      <p className="mt-1 text-sm text-stone-600">
        Pick your FPL team so the app knows which row is you. One team per person.
      </p>
      <label htmlFor="team-pick" className="label">
        Your team
      </label>
      <select
        id="team-pick"
        value={entryId}
        onChange={(e) => setEntryId(e.target.value)}
        className="input"
      >
        <option value="">Choose your name</option>
        {teams.map((t) => {
          const taken = claims.has(t.entryId)
          return (
            <option key={t.entryId} value={t.entryId} disabled={taken}>
              {t.playerName} · {t.teamName}
              {taken ? ' (taken)' : ''}
            </option>
          )
        })}
      </select>
      <p className="mt-1.5 text-xs text-stone-600">
        Not listed?{' '}
        {entriesOpen()
          ? 'Join the league on the FPL site first. Entries close Thursday 22 October.'
          : 'Entries closed on 22 October.'}{' '}
        Taken by someone else? Tell {WORKSHOP_NAME}.{' '}
        <Link to="/rules" className="underline underline-offset-2">
          Rules
        </Link>
      </p>
      {error && <p className="mt-2 text-sm text-pine-800">{error}</p>}
      <button type="submit" disabled={!chosen} className="btn btn-primary mt-4 w-full">
        That’s me
      </button>
      {allowLater && (
        <button type="button" onClick={dismiss} className="btn btn-text mt-1 w-full">
          Later
        </button>
      )}
    </form>
  )
}
