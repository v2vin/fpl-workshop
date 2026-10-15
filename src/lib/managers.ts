import type { User } from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  type FirestoreDataConverter,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

/** `managers/{uid}` — see CLAUDE.md, "Firestore data model". */
export interface Manager {
  displayName: string
  /**
   * FPL "entry" id of the manager's team. Null until they claim one; changes only together with
   * `claims/{entryId}` (src/lib/claims.ts).
   */
  fplEntryId: number | null
  photoURL: string | null
  /** ISO string, UTC: first sign-in, not joining the FPL league. */
  joinedAt: string
  /** Leave my name out of the results video and the public wall of winners (rule 5.3). */
  hideName: boolean
}

const converter: FirestoreDataConverter<Manager> = {
  toFirestore: (m) => m,
  fromFirestore: (snap) => {
    const d = snap.data()
    return {
      displayName: typeof d.displayName === 'string' ? d.displayName : 'Manager',
      fplEntryId: typeof d.fplEntryId === 'number' ? d.fplEntryId : null,
      photoURL: typeof d.photoURL === 'string' ? d.photoURL : null,
      joinedAt: typeof d.joinedAt === 'string' ? d.joinedAt : '',
      hideName: d.hideName === true,
    }
  },
}

export const managerRef = (uid: string) => doc(db, 'managers', uid).withConverter(converter)

/**
 * Creates `managers/{uid}` on first sign-in; a no-op afterwards.
 * Rule: `managers/{uid}` — create only by that uid.
 */
export async function ensureManager(user: User): Promise<void> {
  const ref = managerRef(user.uid)
  if ((await getDoc(ref)).exists()) return
  await setDoc(ref, {
    displayName: user.displayName ?? 'Manager',
    fplEntryId: null,
    photoURL: user.photoURL ?? null,
    joinedAt: new Date().toISOString(),
    hideName: false,
  })
}

/** Rule: `managers/{uid}` — update only by that uid. Read by the owner at draw time. */
export function setHideName(uid: string, hideName: boolean): Promise<void> {
  return updateDoc(managerRef(uid), { hideName })
}

/** Live view of one manager document; `null` while the document does not exist. */
export function watchManager(uid: string, onChange: (m: Manager | null) => void): Unsubscribe {
  return onSnapshot(managerRef(uid), (snap) => onChange(snap.exists() ? snap.data() : null))
}

export interface ManagerWithUid extends Manager {
  uid: string
}

/** Live list of all managers, sorted by name. Rule: `managers/*` read by any signed-in user. */
export function watchManagers(onChange: (managers: ManagerWithUid[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'managers').withConverter(converter),
    (snap) => {
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
      list.sort((a, b) => a.displayName.localeCompare(b.displayName))
      onChange(list)
    },
    (err) => console.error('managers snapshot failed', err),
  )
}
