import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../lib/auth'

/** Wraps owner-only routes. Anyone else is sent back to the table. */
export default function RequireOwner({ children }: { children: ReactNode }) {
  const { loading, isOwner } = useAuth()
  if (loading) return null
  if (!isOwner) return <Navigate to="/" replace />
  return children
}
