import { useEffect, useState } from 'react'
import { watchMonth, watchStandings, type Month, type Standings } from './fpl'

/** `standings/current`, live. `undefined` while loading, `null` before the first sync. */
export function useStandings(): Standings | null | undefined {
  const [state, setState] = useState<{ value: Standings | null } | null>(null)
  useEffect(() => watchStandings((value) => setState({ value })), [])
  return state ? state.value : undefined
}

/** `months/{month}`, live. `undefined` while loading or with no month, `null` if it does not exist. */
export function useMonth(month: string | null): Month | null | undefined {
  const [snap, setSnap] = useState<{ month: string; value: Month | null } | null>(null)
  useEffect(() => {
    if (!month) return
    return watchMonth(month, (value) => setSnap({ month, value }))
  }, [month])
  if (!month || !snap || snap.month !== month) return undefined
  return snap.value
}

/** The current time, refreshed every `everyMs`, for countdowns and "updated x ago". */
export function useNow(everyMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), everyMs)
    return () => clearInterval(id)
  }, [everyMs])
  return now
}
