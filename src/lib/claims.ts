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
import { newTeamCode } from './teamCode'

/** How a claim was confirmed: the code turned up in the FPL team name, or the owner ticked it. */
export type VerifiedBy = 'team-name' | 'owner'

/**
 * `claims/{entryId}` — the account that plays an FPL team. The id makes each team claimable once
 * and `managers/{uid}.fplEntryId` makes each account claim one team (rule 1.4). `verified` means
 * the manager has shown they control the team (rule 4.2): scripts/verify-teams.mjs sets it when
 * the team name carries `verifyCode` (src/lib/teamCode.ts), or the owner ticks it.
 */
export interface Claim {
  entryId: number
  uid: string
  /** ISO string, UTC. */
  claimedAt: string
  verified: boolean
  /** Three digits for the team name, as "-FPL-433". Null on claims the owner adopted. */
  verifyCode: string | null
  verifiedBy: VerifiedBy | null
  /** ISO string, UTC. */
  verifiedAt: string | null
  /** FPL reports the team cannot be renamed right now, so the code check cannot work. */
  nameChangeBlocked: boolean
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
      verifyCode: typeof d.verifyCode === 'string' ? d.verifyCode : null,
      verifiedBy: d.verifiedBy === 'team-name' || d.verifiedBy === 'owner' ? d.verifiedBy : null,
      verifiedAt: typeof d.verifiedAt === 'string' ? d.verifiedAt : null,
      nameChangeBlocked: d.nameChangeBlocked === true,
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
 * Links the signed-in manager to a team, with a fresh code for the team-name check. Rules: the
 * claim and `fplEntryId` must be written together, the team must be unclaimed and the account
 * must not have a team yet.
 */
export function claimTeam(uid: string, entryId: number): Promise<void> {
  const batch = writeBatch(db)
  batch.set(claimRef(entryId), {
    entryId,
    uid,
    claimedAt: new Date().toISOString(),
    verified: false,
    verifyCode: newTeamCode(),
    verifiedBy: null,
    verifiedAt: null,
    nameChangeBlocked: false,
  })
  batch.update(managerRef(uid), { fplEntryId: entryId })
  return batch.commit()
}

/** A code for a claim made before the team-name check existed. Rule: claimant, unconfirmed. */
export function giveTeamCode(entryId: number): Promise<void> {
  return updateDoc(claimRef(entryId), { verifyCode: newTeamCode() })
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
  return updateDoc(claimRef(entryId), {
    verified,
    verifiedBy: verified ? 'owner' : null,
    verifiedAt: verified ? new Date().toISOString() : null,
  })
}

/** Owner only: turns a link made before claims existed into a confirmed claim. */
export function adoptLink(uid: string, entryId: number): Promise<void> {
  const now = new Date().toISOString()
  return setDoc(claimRef(entryId), {
    entryId,
    uid,
    claimedAt: now,
    verified: true,
    verifyCode: null,
    verifiedBy: 'owner',
    verifiedAt: now,
    nameChangeBlocked: false,
  })
}
