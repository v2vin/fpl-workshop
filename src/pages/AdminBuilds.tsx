import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import Notice from '../components/Notice'
import Page from '../components/Page'
import { GIFT_STATUSES, type Gift, type GiftStatus } from '../data/gifts'
import { statusLabel } from '../lib/giftStatus'
import { addGiftPhoto, removeGiftPhoto, setGiftHero, setGiftStatus } from '../lib/gifts'
import { useGifts } from '../lib/useGifts'

const FILE_NAME = /^[a-z0-9_-]+\.(jpe?g|png|webp|svg)$/i

function BuildCard({ gift, disabled }: { gift: Gift; disabled: boolean }) {
  const [file, setFile] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const validFile = FILE_NAME.test(file.trim())
  const off = disabled || busy

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

  const statusId = `status-${gift.id}`
  const fileId = `file-${gift.id}`
  return (
    <li className="card p-4">
      <h2 className="display text-xl">{gift.name}</h2>

      <label htmlFor={statusId} className="label">
        Build status
      </label>
      <select
        id={statusId}
        value={gift.status}
        disabled={off}
        onChange={(e) => void run(() => setGiftStatus(gift.id, e.target.value as GiftStatus))}
        className="input"
      >
        {GIFT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabel(s)}
          </option>
        ))}
      </select>

      {gift.photos.length > 0 && (
        <ul className="mt-4 space-y-2">
          {gift.photos.map((p, i) => (
            <li key={p} className="flex items-center gap-3">
              <img
                src={p}
                alt=""
                className="h-12 w-16 shrink-0 rounded bg-pine-100 object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-stone-600">{p.split('/').pop()}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {i === 0 ? (
                    <span className="rounded-full bg-pine-100 px-2 py-1 text-xs font-semibold text-pine-800">
                      ★ Hero photo
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={off}
                      onClick={() => void run(() => setGiftHero(gift, p))}
                      className="btn min-h-9 px-2.5 py-1 text-xs"
                    >
                      Make hero
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={off}
                    onClick={() => void run(() => removeGiftPhoto(gift.id, p))}
                    className="btn min-h-9 px-2.5 py-1 text-xs"
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onAddPhoto}>
        <label htmlFor={fileId} className="label">
          Add photo by file name
        </label>
        <div className="flex gap-2">
          <input
            id={fileId}
            value={file}
            onChange={(e) => setFile(e.target.value)}
            placeholder="cut-1.jpg"
            className="input min-w-0 flex-1"
          />
          <button type="submit" disabled={!validFile || off} className="btn btn-primary shrink-0">
            Add
          </button>
        </div>
        <p className="mt-1.5 text-xs text-stone-600">
          Commit the file to <code>public/gifts/{gift.id}/</code> first, then add its name here.
        </p>
      </form>
      {error && <Notice error>{error}</Notice>}
    </li>
  )
}

// Reached only through <RequireOwner>.
export default function AdminBuilds() {
  const { gifts, live, loading } = useGifts()
  return (
    <Page title="On the bench" intro="Build photos and progress">
      {!loading && !live && (
        <Notice>
          The gifts collection is empty, so nothing can be changed yet. Run the seed script first.
        </Notice>
      )}
      <ul className="space-y-4">
        {gifts.map((g) => (
          <BuildCard key={g.id} gift={g} disabled={!live} />
        ))}
      </ul>
      <Link to="/admin" className="btn btn-text">
        ← Back to the desk
      </Link>
    </Page>
  )
}
