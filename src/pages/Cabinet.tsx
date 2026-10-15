import { useState } from 'react'
import { Link } from 'react-router'
import Badge from '../components/Badge'
import GiftCard from '../components/GiftCard'
import Icon from '../components/Icon'
import Notice from '../components/Notice'
import Page from '../components/Page'
import SignInButton from '../components/SignInButton'
import StatusBadge from '../components/StatusBadge'
import TeamPicker from '../components/TeamPicker'
import { useAuth } from '../lib/auth'
import { releaseTeam } from '../lib/claims'
import { WORKSHOP_NAME } from '../lib/config'
import { formatMonth } from '../lib/format'
import { setHideName, type Manager } from '../lib/managers'
import { useClaims } from '../lib/useClaims'
import { useEntries } from '../lib/useEntries'
import { useGifts } from '../lib/useGifts'
import { useManager } from '../lib/useManager'

/** "Your account": the linked team and its confirmation (rules 1.4, 4.2), and naming (5.3). */
function Account({ uid, manager }: { uid: string; manager: Manager }) {
  const claims = useClaims(true)
  const entries = useEntries()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const id = manager.fplEntryId
  const claim = id !== null ? claims?.get(id) : undefined
  const mine = claim?.uid === uid ? claim : undefined
  const entry = id !== null ? entries?.get(id) : undefined

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      console.error(err)
      setError('That did not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div>
        <dt className="text-xs text-stone-600">Your team</dt>
        <dd>
          {id === null ? (
            'Not picked yet. Choose it at the top of the page.'
          ) : entry ? (
            <>
              <b>{entry.playerName}</b> · {entry.teamName}
            </>
          ) : (
            <span className="font-mono">Team {id}</span>
          )}{' '}
          {id !== null &&
            (mine?.verified ? (
              <Badge tone="live">Confirmed</Badge>
            ) : (
              <Badge>Waiting for {WORKSHOP_NAME} to confirm</Badge>
            ))}
        </dd>
        {id !== null && !mine?.verified && claims && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => releaseTeam(uid, id, mine !== undefined))}
            className="btn btn-text text-sm"
          >
            Not your team? Pick again
          </button>
        )}
      </div>
      <label className="flex items-start gap-2.5">
        <input
          type="checkbox"
          className="mt-1"
          checked={manager.hideName}
          disabled={busy}
          onChange={(e) => void run(() => setHideName(uid, e.target.checked))}
        />
        <span>
          Leave my name out of the results video, social posts and the wall of winners
          <small className="block text-xs text-stone-600">
            Set it before the month’s draw (rule 5.3).
          </small>
        </span>
      </label>
      {error && <Notice error>{error}</Notice>}
    </>
  )
}

export default function Cabinet() {
  const { user, loading, signOut } = useAuth()
  const manager = useManager(user?.uid)
  const { gifts } = useGifts()

  const mine = user ? gifts.filter((g) => g.wonBy === user.uid) : []
  const wall = gifts
    .filter((g) => g.wonMonth !== null)
    .sort(
      (a, b) => (b.wonMonth ?? '').localeCompare(a.wonMonth ?? '') || a.name.localeCompare(b.name),
    )

  const winners = (
    <section>
      <h2 className="display mt-6 mb-3 text-[23px]">Wall of winners</h2>
      {wall.length === 0 ? (
        <div className="card p-4 text-sm text-stone-600">
          No winners yet. The first month is still being played.
        </div>
      ) : (
        <ul className="space-y-3">
          {wall.map((g) => (
            <li key={g.id} className="card p-4">
              <p className="eyebrow mb-2">{formatMonth(g.wonMonth ?? '')}</p>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="display truncate text-base">{g.wonByName ?? 'A manager'}</h3>
                  <span className="text-sm text-stone-600">{g.name}</span>
                </div>
                <StatusBadge status={g.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )

  if (loading) return <Page title="Your shelf." />

  if (!user) {
    return (
      <Page title="Wall of winners" intro="Good months, made solid.">
        <div className="card p-4">
          <h2 className="display text-xl">Your shelf is waiting</h2>
          <p className="mt-1 mb-4 text-sm text-stone-600">Sign in to see the gifts you’ve won.</p>
          <SignInButton variant="card" />
        </div>
        {winners}
      </Page>
    )
  }

  return (
    <Page title="Your shelf." intro="The points fade. The pine stays.">
      {manager?.fplEntryId === null && <TeamPicker uid={user.uid} allowLater={false} />}
      {mine.length === 0 ? (
        <div className="card px-4 py-10 text-center">
          <Icon name="cabinet" className="mx-auto mb-5 h-10 w-10 text-pine-600" />
          <h2 className="display text-xl">Nothing on your shelf yet.</h2>
          <p className="mt-2 mb-5 text-sm text-stone-600">Win a month.</p>
          <Link to="/" className="btn">
            Back to the table
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {mine.map((g) => (
            <li key={g.id} className="border-b-4 border-pine-300 pb-5">
              <GiftCard gift={g} />
            </li>
          ))}
        </ul>
      )}

      {winners}

      <section>
        <h2 className="display mt-6 mb-3 text-[23px]">Your account</h2>
        <div className="card p-4 text-sm">
          <dl className="space-y-3.5">
            <div>
              <dt className="text-xs text-stone-600">Signed in as</dt>
              <dd>{manager?.displayName ?? user.displayName ?? 'Manager'}</dd>
            </div>
            {manager && <Account uid={user.uid} manager={manager} />}
            <div>
              <dt className="text-xs text-stone-600">User id</dt>
              <dd className="font-mono text-xs break-all select-all">{user.uid}</dd>
            </div>
          </dl>
          <button type="button" onClick={() => void signOut()} className="btn btn-text mt-3">
            Sign out
          </button>
        </div>
      </section>
    </Page>
  )
}
