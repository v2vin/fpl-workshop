import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../lib/auth'
import { LEAGUE_NAME } from '../lib/config'
import { useManager } from '../lib/useManager'
import EntryIdPrompt from './EntryIdPrompt'
import Icon, { type IconName } from './Icon'
import InstallHint from './InstallHint'
import SignInButton from './SignInButton'

const tabs: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Table', icon: 'table' },
  { to: '/draw', label: 'Draw', icon: 'draw' },
  { to: '/gifts', label: 'Gifts', icon: 'gifts' },
  { to: '/cabinet', label: 'Cabinet', icon: 'cabinet' },
  { to: '/about', label: 'About', icon: 'about' },
]

/** Avatar in the header; tapping it opens a small account menu with sign-out. */
function AccountMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      if (e instanceof MouseEvent && ref.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  if (!user) return null
  const initial = (user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Your account"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-pine-100 text-sm font-bold text-pitch-800"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-9 w-9" />
        ) : (
          initial
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="card absolute top-11 right-0 z-20 w-56 p-3 text-sm text-stone-900"
        >
          <p className="truncate font-semibold">{user.displayName ?? 'Manager'}</p>
          {user.email && <p className="truncate text-xs text-stone-600">{user.email}</p>}
          <NavLink
            to="/cabinet"
            onClick={() => setOpen(false)}
            className="btn btn-text mt-2 block text-left"
          >
            Your shelf →
          </NavLink>
          <button
            type="button"
            role="menuitem"
            onClick={() => void signOut()}
            className="btn btn-text block text-left"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { user, loading, isOwner } = useAuth()
  const manager = useManager(user?.uid)
  const needsEntryId = user !== null && manager != null && manager.fplEntryId === null

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b-[3px] border-pine-300 bg-pitch-800 text-pine-100">
        <div className="mx-auto flex h-16 max-w-md items-center gap-2 px-3">
          <NavLink to="/" className="flex items-center gap-2">
            <img src="/brand/mark-reversed.svg" alt="" className="h-8 w-8" />
            <span className="display text-base font-bold tracking-[-0.7px] whitespace-nowrap">
              {LEAGUE_NAME}
            </span>
          </NavLink>
          <span className="flex-1" />
          {loading ? null : user ? (
            <>
              {isOwner && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      isActive
                        ? 'border-pine-300 bg-pine-300 text-pitch-900'
                        : 'border-pitch-500 text-pine-100 hover:bg-pitch-700'
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
              <AccountMenu />
            </>
          ) : (
            <SignInButton variant="header" />
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-6 pb-28">
        <InstallHint />
        {needsEntryId && user && <EntryIdPrompt uid={user.uid} />}
        <Outlet />
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-pine-200 bg-white pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto grid h-[70px] max-w-md grid-cols-5 px-2">
          {tabs.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  `flex h-full flex-col items-center gap-1 border-t-[3px] pt-2.5 text-xs font-semibold ${
                    isActive
                      ? 'border-pitch-700 text-pitch-700'
                      : 'border-transparent text-stone-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      name={t.icon}
                      className="h-[22px] w-[22px]"
                      strokeWidth={isActive ? 2.3 : 1.7}
                    />
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
