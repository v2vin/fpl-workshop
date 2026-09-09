import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../lib/auth'
import { LEAGUE_NAME } from '../lib/config'
import { useManager } from '../lib/useManager'
import EntryIdPrompt from './EntryIdPrompt'
import Icon, { type IconName } from './Icon'
import SignInButton from './SignInButton'
import UserMenu from './UserMenu'

const tabs: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Table', icon: 'table' },
  { to: '/draw', label: 'Draw', icon: 'draw' },
  { to: '/gifts', label: 'Gifts', icon: 'gifts' },
  { to: '/cabinet', label: 'Cabinet', icon: 'cabinet' },
  { to: '/about', label: 'About', icon: 'about' },
]

export default function Layout() {
  const { user, loading, isOwner } = useAuth()
  const manager = useManager(user?.uid)
  const needsEntryId = user !== null && manager != null && manager.fplEntryId === null

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-pitch-800 text-pine-100 sticky top-0 z-10 shadow-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="bg-pine-300 inline-block h-3 w-8 rounded-sm" aria-hidden="true" />
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">
              {LEAGUE_NAME}
            </span>
          </NavLink>
          {loading ? null : user ? (
            <div className="flex items-center gap-2">
              {isOwner && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                      isActive ? 'bg-pine-300 text-pitch-900' : 'text-pine-200 hover:bg-pitch-700'
                    }`
                  }
                >
                  <Icon name="admin" className="h-4 w-4" />
                  Admin
                </NavLink>
              )}
              <UserMenu />
            </div>
          ) : (
            <SignInButton compact />
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-5 pb-28">
        {needsEntryId && user && <EntryIdPrompt uid={user.uid} />}
        <Outlet />
      </main>

      <nav
        aria-label="Main"
        className="border-pine-200 fixed inset-x-0 bottom-0 z-10 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {tabs.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                    isActive ? 'text-pitch-700' : 'text-stone-500 hover:text-stone-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`rounded-full px-3 py-0.5 ${isActive ? 'bg-pine-200' : ''}`}>
                      <Icon name={t.icon} className="h-5 w-5" />
                    </span>
                    {t.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
