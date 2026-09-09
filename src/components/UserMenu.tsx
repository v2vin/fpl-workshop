import { useAuth } from '../lib/auth'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  if (!user) return null
  const initial = (user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()
  return (
    <div className="flex items-center gap-2">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt=""
          referrerPolicy="no-referrer"
          className="ring-pine-300 h-7 w-7 rounded-full ring-2"
        />
      ) : (
        <span className="bg-pine-300 text-pitch-900 grid h-7 w-7 place-items-center rounded-full text-sm font-bold">
          {initial}
        </span>
      )}
      <button
        type="button"
        onClick={() => void signOut()}
        aria-label="Sign out"
        title="Sign out"
        className="text-pine-200 hover:bg-pitch-700 grid h-7 w-7 place-items-center rounded-full"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l5 4-5 4M20 12H9" />
        </svg>
      </button>
    </div>
  )
}
