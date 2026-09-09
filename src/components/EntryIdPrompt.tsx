import { useState, type FormEvent } from 'react'
import { setFplEntryId } from '../lib/managers'

/** Shown once, after first sign-in, until the manager links their FPL team. */
export default function EntryIdPrompt({ uid }: { uid: string }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const trimmed = value.trim()
  const valid = /^[0-9]{1,9}$/.test(trimmed) && Number(trimmed) > 0

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
    <form
      onSubmit={onSubmit}
      className="border-pine-300 bg-pine-100 mb-5 rounded-xl border p-4 shadow-sm"
    >
      <h2 className="text-pitch-900 font-semibold">Link your FPL team</h2>
      <p className="mt-1 text-sm text-stone-700">
        A one-off. On fantasy.premierleague.com open Points: the number after{' '}
        <code className="rounded bg-white px-1">/entry/</code> in the address bar is your team id.
        It cannot be changed later, so check it twice.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 1234567"
          aria-label="FPL team id"
          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-base"
        />
        <button
          type="submit"
          disabled={!valid || busy}
          className="bg-pitch-700 rounded-lg px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {busy ? 'Saving' : 'Save'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </form>
  )
}
