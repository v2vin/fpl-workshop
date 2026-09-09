import { useEffect, useState } from 'react'
import { watchManager, type Manager } from './managers'

interface Snapshot {
  uid: string
  manager: Manager | null
}

/**
 * The signed-in user's manager document.
 * `undefined` while loading or signed out, `null` if the document does not exist yet.
 */
export function useManager(uid: string | undefined): Manager | null | undefined {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)

  useEffect(() => {
    if (!uid) return
    return watchManager(uid, (manager) => setSnapshot({ uid, manager }))
  }, [uid])

  // A snapshot for a different (or no) user is stale; report "loading" instead of resetting state.
  if (!uid || snapshot === null || snapshot.uid !== uid) return undefined
  return snapshot.manager
}
