import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { createContext, useContext } from 'react'
import { auth } from './firebase'

export interface AuthState {
  user: User | null
  /** True until Firebase has reported the initial auth state. */
  loading: boolean
  isOwner: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

/** Google sign-in. Popup first; some mobile browsers block it, so fall back to a redirect. */
export async function signInWithGoogle(): Promise<void> {
  try {
    await signInWithPopup(auth, provider)
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      await signInWithRedirect(auth, provider)
      return
    }
    throw err
  }
}

export function signOut(): Promise<void> {
  return firebaseSignOut(auth)
}
