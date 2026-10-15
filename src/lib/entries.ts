import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  type FirestoreDataConverter,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * `entries/{entryId}` — one per FPL team in the league. scripts/fetch-fpl.mjs creates it the first
 * time it sees the team and keeps the names current; the owner edits the eligibility fields.
 * Read by anyone, so the public table can tell who is playing for the prize.
 */
export interface Entry {
  entryId: number
  playerName: string
  teamName: string
  /**
   * "YYYY-MM-DD" in Malawi the team joined the league (rule 1.1), or null for a team that was
   * already in it when join dates started being tracked on 15 October 2026. The sync logs show
   * all 17 of those had joined by 9 September, so null counts as joined before October.
   */
  joinedOn: string | null
  /** Out for the whole season: a duplicate or shared entry (rule 1.4) or an FPL sanction (5.1). */
  seasonForfeit: boolean
  /** "YYYY-MM" months forfeited for conduct (rule 5.2). */
  forfeitMonths: string[]
}

export type EntryPatch = Partial<Pick<Entry, 'joinedOn' | 'seasonForfeit' | 'forfeitMonths'>>

const DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
const MONTH = /^[0-9]{4}-[0-9]{2}$/

const converter: FirestoreDataConverter<Entry> = {
  toFirestore: (e) => {
    const data: Record<string, unknown> = { ...e }
    delete data.entryId
    return data
  },
  fromFirestore: (snap) => {
    const d = snap.data()
    return {
      entryId: Number(snap.id),
      playerName: typeof d.playerName === 'string' ? d.playerName : 'Unknown',
      teamName: typeof d.teamName === 'string' ? d.teamName : '',
      joinedOn: typeof d.joinedOn === 'string' && DATE.test(d.joinedOn) ? d.joinedOn : null,
      seasonForfeit: d.seasonForfeit === true,
      forfeitMonths: Array.isArray(d.forfeitMonths)
        ? d.forfeitMonths.filter((m): m is string => typeof m === 'string' && MONTH.test(m))
        : [],
    }
  },
}

const entryRef = (entryId: number) => doc(db, 'entries', String(entryId)).withConverter(converter)

/** Every entry, live, keyed by FPL entry id. Rule: `entries/*` read by anyone. */
export function watchEntries(onChange: (entries: Map<number, Entry>) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'entries').withConverter(converter),
    (snap) => onChange(new Map(snap.docs.map((d) => [Number(d.id), d.data()]))),
    (err) => console.error('entries snapshot failed', err),
  )
}

/**
 * Owner edits to eligibility. Rule: `entries/*` update only by the owner, and only `joinedOn`,
 * `seasonForfeit` and `forfeitMonths`.
 */
export function updateEntry(entryId: number, patch: EntryPatch): Promise<void> {
  return updateDoc(entryRef(entryId), patch)
}
