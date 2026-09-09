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
        className="text-pine-200 hover:bg-pitch-700 rounded-full px-2 py-1 text-xs"
      >
        Sign out
      </button>
    </div>
  )
}
