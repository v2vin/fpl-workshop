import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function SignInButton({ compact = false }: { compact?: boolean }) {
  const { signIn } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    setBusy(true)
    setError(null)
    try {
      await signIn()
    } catch (err) {
      console.error(err)
      setError('Sign-in did not complete. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={compact ? '' : 'space-y-2'}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={`inline-flex items-center gap-2 rounded-full bg-white font-medium text-stone-800 shadow-sm ring-1 ring-stone-300 hover:bg-stone-50 disabled:opacity-60 ${
          compact ? 'px-3 py-1 text-sm' : 'px-4 py-2'
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"
          />
          <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z" />
          <path
            fill="#EA4335"
            d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10c.8-2.3 3-4 5.6-4z"
          />
        </svg>
        {busy ? 'Signing in' : compact ? 'Sign in' : 'Sign in with Google'}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
