import { useState, type FormEvent } from 'react'
import CodesList from '../components/CodesList'
import IssueCode from '../components/IssueCode'
import Notice from '../components/Notice'
import Page from '../components/Page'
import StatusBadge from '../components/StatusBadge'
import { GIFT_STATUSES, type Gift, type GiftStatus } from '../data/gifts'
import { addGiftPhoto, removeGiftPhoto, setGiftHero, setGiftStatus } from '../lib/gifts'
import { statusLabel } from '../lib/giftStatus'
import { useGifts } from '../lib/useGifts'

const FILE_NAME = /^[a-z0-9_-]+\.(jpe?g|png|webp|svg)$/i

function GiftRow({ gift, disabled }: { gift: Gift; disabled: boolean }) {
  const [file, setFile] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const validFile = FILE_NAME.test(file.trim())

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      console.error(err)
      setError('That did not save. Are you signed in as the owner?')
    } finally {
      setBusy(false)
    }
  }

  function onAddPhoto(e: FormEvent) {
    e.preventDefault()
    if (!validFile) return
    void run(async () => {
      await addGiftPhoto(gift.id, file.trim())
      setFile('')
    })
  }

  const off = disabled || busy
  return (
    <li className="border-pine-200 rounded-xl border bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src={gift.photos[0] ?? `/gifts/${gift.id}/hero.svg`}
          alt=""
          className="h-12 w-16 shrink-0 rounded object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{gift.name}</h2>
          <StatusBadge status={gift.status} />
        </div>
        <select
          aria-label={`Status of ${gift.name}`}
          value={gift.status}
          disabled={off}
          onChange={(e) => void run(() => setGiftStatus(gift.id, e.target.value as GiftStatus))}
          className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm"
        >
          {GIFT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={onAddPhoto} className="mt-2 flex gap-2">
        <input
          value={file}
          onChange={(e) => setFile(e.target.value)}
          placeholder="cut-1.jpg"
          aria-label={`New photo file for ${gift.name}, inside public/gifts/${gift.id}/`}
          className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={!validFile || off}
          className="bg-pitch-700 rounded-lg px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
        >
          Add photo
        </button>
      </form>

      {gift.photos.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {gift.photos.map((p, i) => (
            <li
              key={p}
              className="bg-pine-100 text-pine-900 flex items-center gap-1 rounded px-2 py-0.5 text-xs"
            >
              <span className="max-w-36 truncate">{p.split('/').pop()}</span>
              {i === 0 ? (
                <span className="text-pine-600">hero</span>
              ) : (
                <button
                  type="button"
                  disabled={off}
                  onClick={() => void run(() => setGiftHero(gift, p))}
                  className="text-pitch-700 underline"
                >
                  make hero
                </button>
              )}
              <button
                type="button"
                aria-label={`Remove ${p}`}
                disabled={off}
                onClick={() => void run(() => removeGiftPhoto(gift.id, p))}
                className="px-1 text-stone-500 hover:text-red-700"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </li>
  )
}

// Reached only through <RequireOwner>.
export default function Admin() {
  const { gifts, live, loading } = useGifts()
  return (
    <Page title="Admin" intro="Issue the month’s code, then keep each build up to date.">
      {!loading && !live && (
        <Notice>
          The gifts collection is empty, so nothing can be changed yet. Run{' '}
          <code className="bg-pine-100 rounded px-1">npm run seed:gifts</code> once.
        </Notice>
      )}
      {live && <IssueCode gifts={gifts} />}
      {live && <CodesList gifts={gifts} />}
      <h2 className="text-pitch-900 pt-2 text-lg font-bold">Builds</h2>
      <p className="-mt-3 text-sm text-stone-600">
        Photos go into the repo first; add the file name here.
      </p>
      <ul className="space-y-3">
        {gifts.map((g) => (
          <GiftRow key={g.id} gift={g} disabled={!live} />
        ))}
      </ul>
    </Page>
  )
}
