import { useState } from 'react'
import { useAuth } from '../lib/auth'

/** Google sign-in. `header` is the small outlined pill in the app bar; `card` fills its container. */
export default function SignInButton({ variant = 'card' }: { variant?: 'header' | 'card' }) {
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

  if (variant === 'header') {
    return (
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy}
        className="rounded-full border border-pitch-500 px-3 py-1.5 text-xs font-semibold text-pine-100 hover:bg-pitch-700 disabled:opacity-60"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy}
        className="btn btn-primary w-full"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            fill="#fff"
            d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"
          />
          <path
            fill="#c9e7d3"
            d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"
          />
          <path fill="#e8d3a8" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z" />
          <path
            fill="#fbf7ee"
            d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10c.8-2.3 3-4 5.6-4z"
          />
        </svg>
        {busy ? 'Signing in…' : 'Continue with Google'}
      </button>
      {error && <p className="mt-2 text-sm text-pine-800">{error}</p>}
    </div>
  )
}
