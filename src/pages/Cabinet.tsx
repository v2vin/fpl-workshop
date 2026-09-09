import GiftCard from '../components/GiftCard'
import Notice from '../components/Notice'
import Page from '../components/Page'
import SignInButton from '../components/SignInButton'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../lib/auth'
import { formatMonth } from '../lib/format'
import { useGifts } from '../lib/useGifts'
import { useManager } from '../lib/useManager'

export default function Cabinet() {
  const { user, loading } = useAuth()
  const manager = useManager(user?.uid)
  const { gifts } = useGifts()

  const mine = user ? gifts.filter((g) => g.wonBy === user.uid) : []
  const wall = gifts
    .filter((g) => g.wonMonth !== null)
    .sort(
      (a, b) => (b.wonMonth ?? '').localeCompare(a.wonMonth ?? '') || a.name.localeCompare(b.name),
    )

  return (
    <Page title="Trophy cabinet" intro="Every gift won so far, and the wall of monthly winners.">
      {!loading && !user && (
        <Notice>
          <p className="mb-3">Sign in to see your own shelf.</p>
          <SignInButton />
        </Notice>
      )}

      {user && (
        <section>
          <h2 className="text-pitch-900 text-lg font-bold">Your shelf</h2>
          {mine.length === 0 ? (
            <Notice>Nothing on your shelf yet. Win a month.</Notice>
          ) : (
            <ul className="mt-2 grid grid-cols-2 gap-3">
              {mine.map((g) => (
                <GiftCard key={g.id} gift={g} />
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <h2 className="text-pitch-900 text-lg font-bold">Wall of winners</h2>
        {wall.length === 0 ? (
          <Notice>No winners yet. The first month is still being played.</Notice>
        ) : (
          <ul className="divide-pine-100 border-pine-200 mt-2 divide-y rounded-xl border bg-white shadow-sm">
            {wall.map((g) => (
              <li key={g.id} className="flex items-center gap-3 p-3">
                <img
                  src={g.photos[0] ?? `/gifts/${g.id}/hero.svg`}
                  alt=""
                  className="h-12 w-16 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-pine-700 text-xs font-semibold tracking-wide uppercase">
                    {formatMonth(g.wonMonth ?? '')}
                  </p>
                  <p className="truncate text-sm font-semibold">{g.wonByName ?? 'A manager'}</p>
                  <p className="truncate text-xs text-stone-600">{g.name}</p>
                </div>
                <StatusBadge status={g.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {user && (
        <section className="border-pine-200 rounded-xl border bg-white p-4 text-sm shadow-sm">
          <h2 className="font-semibold">Your account</h2>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-stone-700">
            <dt className="text-stone-500">Name</dt>
            <dd>{manager?.displayName ?? user.displayName ?? 'Manager'}</dd>
            <dt className="text-stone-500">FPL team id</dt>
            <dd>{manager?.fplEntryId ?? 'not linked yet'}</dd>
            <dt className="text-stone-500">User id</dt>
            <dd className="font-mono text-xs break-all select-all">{user.uid}</dd>
          </dl>
        </section>
      )}
    </Page>
  )
}
