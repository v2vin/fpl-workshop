import { useEffect, useState } from 'react'
import { watchManagers, type ManagerWithUid } from './managers'

/** All managers, live. `undefined` while loading. Needs a signed-in user (rules). */
export function useManagers(): ManagerWithUid[] | undefined {
  const [list, setList] = useState<ManagerWithUid[] | undefined>(undefined)
  useEffect(() => watchManagers(setList), [])
  return list
}
