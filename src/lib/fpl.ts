import { doc, onSnapshot, type FirestoreDataConverter, type Unsubscribe } from 'firebase/firestore'
import { db } from './firebase'

// Documents written by scripts/fetch-fpl.mjs (CLAUDE.md, "Firestore data model"). Read-only in
// the browser: the GitHub Action is the only writer, so every field is parsed defensively.

export interface StandingsRow {
  entryId: number
  playerName: string
  teamName: string
  eventPoints: number
  totalPoints: number
  rank: number
  lastRank: number
}

/** `standings/current` */
export interface Standings {
  /** ISO string, UTC. */
  updatedAt: string
  /** Latest gameweek whose deadline has passed; 0 before the season starts. */
  gameweek: number
  nextGameweek: number | null
  /** ISO string, UTC; null once the season is over. */
  nextDeadline: string | null
  /** "YYYY-MM" of the latest started gameweek; the month document to show. */
  currentMonth: string | null
  leagueName: string
  rows: StandingsRow[]
}

export interface MonthRow {
  entryId: number
  playerName: string
  /** Net points across the month's gameweeks, after transfer costs. */
  points: number
}

/** `months/{YYYY-MM}` — rows sorted by points, then season total. */
export interface Month {
  gameweeks: number[]
  rows: MonthRow[]
  /** True once every gameweek in the month is finished. */
  closed: boolean
}

const num = (v: unknown, fallback = 0) =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback
const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)
const nullableNum = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const nullableStr = (v: unknown) => (typeof v === 'string' ? v : null)
const rec = (v: unknown) =>
  typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {}

const standingsConverter: FirestoreDataConverter<Standings> = {
  toFirestore: (s) => ({ ...s }),
  fromFirestore: (snap) => {
    const d = snap.data()
    return {
      updatedAt: str(d.updatedAt),
      gameweek: num(d.gameweek),
      nextGameweek: nullableNum(d.nextGameweek),
      nextDeadline: nullableStr(d.nextDeadline),
      currentMonth: nullableStr(d.currentMonth),
      leagueName: str(d.leagueName, 'League table'),
      rows: Array.isArray(d.rows)
        ? d.rows.map((r) => {
            const o = rec(r)
            return {
              entryId: num(o.entryId),
              playerName: str(o.playerName, 'Unknown'),
              teamName: str(o.teamName),
              eventPoints: num(o.eventPoints),
              totalPoints: num(o.totalPoints),
              rank: num(o.rank),
              lastRank: num(o.lastRank, num(o.rank)),
            }
          })
        : [],
    }
  },
}

const monthConverter: FirestoreDataConverter<Month> = {
  toFirestore: (m) => ({ ...m }),
  fromFirestore: (snap) => {
    const d = snap.data()
    return {
      gameweeks: Array.isArray(d.gameweeks)
        ? d.gameweeks.filter((g): g is number => typeof g === 'number')
        : [],
      rows: Array.isArray(d.rows)
        ? d.rows.map((r) => {
            const o = rec(r)
            return {
              entryId: num(o.entryId),
              playerName: str(o.playerName, 'Unknown'),
              points: num(o.points),
            }
          })
        : [],
      closed: d.closed === true,
    }
  },
}

/** Live `standings/current`; `null` until the first sync has run. */
export function watchStandings(
  onChange: (s: Standings | null) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'standings', 'current').withConverter(standingsConverter),
    (snap) => onChange(snap.exists() ? snap.data() : null),
    (err) => {
      console.error('standings snapshot failed', err)
      onError?.(err)
    },
  )
}

/** Live `months/{YYYY-MM}`; `null` if that month has no started gameweek. */
export function watchMonth(month: string, onChange: (m: Month | null) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'months', month).withConverter(monthConverter),
    (snap) => onChange(snap.exists() ? snap.data() : null),
    (err) => console.error('month snapshot failed', err),
  )
}
