import { useEffect, useState } from 'react'
import { watchEntries, type Entry } from './entries'

/** All entries, live, keyed by FPL entry id. `undefined` while loading. */
export function useEntries(): Map<number, Entry> | undefined {
  const [entries, setEntries] = useState<Map<number, Entry> | undefined>(undefined)
  useEffect(() => watchEntries(setEntries), [])
  return entries
}
