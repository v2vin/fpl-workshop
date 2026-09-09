import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, signInWithGoogle, signOut, type AuthState } from '../lib/auth'
import { OWNER_UID } from '../lib/config'
import { auth } from '../lib/firebase'
import { ensureManager } from '../lib/managers'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
        if (u) ensureManager(u).catch((err) => console.error('Could not create manager', err))
      }),
    [],
  )

  const value: AuthState = {
    user,
    loading,
    isOwner: user !== null && OWNER_UID !== '' && user.uid === OWNER_UID,
    signIn: signInWithGoogle,
    signOut,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
