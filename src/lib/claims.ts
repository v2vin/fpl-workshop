import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  type FirestoreDataConverter,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { managerRef } from './managers'

/**
 * `claims/{entryId}` — the account that plays an FPL team. The id makes each team claimable once
 * and `managers/{uid}.fplEntryId` makes each account claim one team (rule 1.4). The owner sets
 * `verified` once the manager has shown they control the team (rule 4.2).
 */
export interface Claim {
  entryId: number
  uid: string
  /** ISO string, UTC. */
  claimedAt: string
  verified: boolean
}

const converter: FirestoreDataConverter<Claim> = {
  toFirestore: (c) => {
    const data: Record<string, unknown> = { ...c }
    delete data.entryId
    return data
  },
  fromFirestore: (snap) => {
    const d = snap.data()
    return {
      entryId: Number(snap.id),
      uid: typeof d.uid === 'string' ? d.uid : '',
      claimedAt: typeof d.claimedAt === 'string' ? d.claimedAt : '',
      verified: d.verified === true,
    }
  },
}

const claimRef = (entryId: number) => doc(db, 'claims', String(entryId)).withConverter(converter)

/** Every claim, live, keyed by entry id. Rule: `claims/*` read by any signed-in user. */
export function watchClaims(onChange: (claims: Map<number, Claim>) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'claims').withConverter(converter),
    (snap) => onChange(new Map(snap.docs.map((d) => [Number(d.id), d.data()]))),
    (err) => console.error('claims snapshot failed', err),
  )
}

/**
 * Links the signed-in manager to a team. Rules: the claim and `fplEntryId` must be written
 * together, the team must be unclaimed and the account must not have a team yet.
 */
export function claimTeam(uid: string, entryId: number): Promise<void> {
  const batch = writeBatch(db)
  batch.set(claimRef(entryId), {
    entryId,
    uid,
    claimedAt: new Date().toISOString(),
    verified: false,
  })
  batch.update(managerRef(uid), { fplEntryId: entryId })
  return batch.commit()
}

/**
 * Undoes a link: by the manager while the owner has not confirmed it, or by the owner at any
 * time. Also clears a link made before claims existed, which has no claim document.
 */
export function releaseTeam(uid: string, entryId: number, hasClaim = true): Promise<void> {
  const batch = writeBatch(db)
  if (hasClaim) batch.delete(claimRef(entryId))
  batch.update(managerRef(uid), { fplEntryId: null })
  return batch.commit()
}

/** Owner only: the manager has shown they control the team (rule 4.2), or not. */
export function setClaimVerified(entryId: number, verified: boolean): Promise<void> {
  return updateDoc(claimRef(entryId), { verified })
}

/** Owner only: turns a link made before claims existed into a confirmed claim. */
export function adoptLink(uid: string, entryId: number): Promise<void> {
  return setDoc(claimRef(entryId), {
    entryId,
    uid,
    claimedAt: new Date().toISOString(),
    verified: true,
  })
}
