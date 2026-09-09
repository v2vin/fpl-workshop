import Notice from '../components/Notice'
import Page from '../components/Page'
import SignInButton from '../components/SignInButton'
import { useAuth } from '../lib/auth'
import { useManager } from '../lib/useManager'

export default function Cabinet() {
  const { user, loading } = useAuth()
  const manager = useManager(user?.uid)

  return (
    <Page title="Trophy cabinet" intro="Every gift won so far, and the wall of monthly winners.">
      <Notice>Nothing on the shelf yet. The first draw fills it.</Notice>

      {!loading && !user && (
        <Notice>
          <p className="mb-3">Sign in to see your own cabinet.</p>
          <SignInButton />
        </Notice>
      )}

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
