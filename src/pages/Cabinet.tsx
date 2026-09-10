import { Link } from 'react-router'
import Badge from '../components/Badge'
import GiftCard from '../components/GiftCard'
import Icon from '../components/Icon'
import Page from '../components/Page'
import SignInButton from '../components/SignInButton'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../lib/auth'
import { formatMonth } from '../lib/format'
import { useGifts } from '../lib/useGifts'
import { useManager } from '../lib/useManager'

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
          <dl className="grid grid-cols-2 gap-3.5">
            <div>
              <dt className="text-xs text-stone-600">Name</dt>
              <dd>{manager?.displayName ?? user.displayName ?? 'Manager'}</dd>
            </div>
            <div>
              <dt className="text-xs text-stone-600">FPL team id</dt>
              <dd className="font-mono">{manager?.fplEntryId ?? <Badge>not linked yet</Badge>}</dd>
            </div>
            <div className="col-span-2">
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
