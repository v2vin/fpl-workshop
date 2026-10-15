import { useEffect, useState } from 'react'
import { watchClaims, type Claim } from './claims'

/** All claims, live, keyed by entry id. `undefined` while loading or signed out (rules). */
export function useClaims(signedIn: boolean): Map<number, Claim> | undefined {
  const [claims, setClaims] = useState<Map<number, Claim> | undefined>(undefined)
  useEffect(() => {
    if (!signedIn) return
    return watchClaims(setClaims)
  }, [signedIn])
  return signedIn ? claims : undefined
}
