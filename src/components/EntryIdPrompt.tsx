import { useState, type FormEvent } from 'react'
import { setFplEntryId } from '../lib/managers'

const LATER_KEY = 'fplw-entry-id-later'

/** Shown after first sign-in until the manager links their FPL team, or taps Later for this visit. */
export default function EntryIdPrompt({ uid }: { uid: string }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [later, setLater] = useState(() => {
    try {
      return sessionStorage.getItem(LATER_KEY) === '1'
    } catch {
      return false
    }
  })
  const trimmed = value.trim()
  const valid = /^[0-9]{1,9}$/.test(trimmed) && Number(trimmed) > 0

  if (later) return null

  function dismiss() {
    try {
      sessionStorage.setItem(LATER_KEY, '1')
    } catch {
      // Private mode: the prompt simply returns next visit.
    }
    setLater(true)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return
    setBusy(true)
    setError(null)
    try {
      await setFplEntryId(uid, Number(trimmed))
    } catch (err) {
      console.error(err)
      setError('Could not save. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mb-5 p-4">
      <h2 className="display text-xl">Link your FPL team</h2>
      <p className="mt-1 text-sm text-stone-600">Find your row and keep your wins together.</p>
      <label htmlFor="fpl-team-id" className="label">
        FPL team id
      </label>
      <input
        id="fpl-team-id"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. 483921"
        className="input"
      />
      <p className="mt-1.5 text-xs text-stone-600">
        The number in your FPL team’s points-page address. It cannot be changed later.
      </p>
      {error && <p className="mt-2 text-sm text-pine-800">{error}</p>}
      <button type="submit" disabled={!valid || busy} className="btn btn-primary mt-4 w-full">
        {busy ? 'Linking…' : 'Link my team'}
      </button>
      <button type="button" onClick={dismiss} className="btn btn-text mt-1 w-full">
        Later
      </button>
    </form>
  )
}
