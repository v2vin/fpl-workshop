// Firestore rules tests. Run with `npm test`, which starts the Firestore emulator around vitest.
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const rules = readFileSync('firestore.rules', 'utf8')
// Keep the tests in step with whatever uid is hardcoded in the rules.
const OWNER = /function ownerUid\(\) \{ return '([^']+)'; \}/.exec(rules)?.[1] ?? 'OWNER_UID_TODO'
const WINNER = 'winner-uid'
const OTHER = 'other-uid'
const CODE = 'FPLW-SEP26-7F3K'
const TEAM = 8350948
const OTHER_TEAM = 4242

let env: RulesTestEnvironment

const db = (uid?: string) =>
  uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore()
type ClientDb = ReturnType<typeof db>

/** Writes fixtures with rules disabled. */
async function seed() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const f = ctx.firestore()
    await setDoc(doc(f, 'gifts', 'phone-stand'), { name: 'Phone stand', status: 'available' })
    await setDoc(doc(f, 'codes', CODE), {
      month: '2026-09',
      winnerUid: WINNER,
      giftId: 'phone-stand',
      issuedAt: '2026-10-01T09:00:00.000Z',
      redeemed: false,
      redeemedAt: null,
    })
    await setDoc(doc(f, 'standings', 'current'), { gameweek: 3, rows: [] })
    await setDoc(doc(f, 'managers', OTHER), {
      displayName: 'Other',
      fplEntryId: OTHER_TEAM,
      photoURL: null,
      joinedAt: '2026-08-01T00:00:00.000Z',
    })
    await setDoc(doc(f, 'claims', String(OTHER_TEAM)), {
      uid: OTHER,
      claimedAt: '2026-10-15T09:00:00.000Z',
      verified: false,
    })
    await setDoc(doc(f, 'managers', WINNER), {
      displayName: 'Winner',
      fplEntryId: null,
      photoURL: null,
      joinedAt: '2026-08-01T00:00:00.000Z',
    })
    await setDoc(doc(f, 'entries', String(TEAM)), {
      playerName: 'Chawezi S',
      teamName: 'Jesus is King!',
      joinedOn: null,
      firstSeenAt: '2026-10-15T09:00:00.000Z',
      lastSeenAt: '2026-10-15T09:00:00.000Z',
      seasonForfeit: false,
      forfeitMonths: [],
    })
  })
}

/** The app's claim: claims/{entryId} and managers/{uid}.fplEntryId in one batch. */
function claim(f: ClientDb, uid: string, entryId: number, verified = false) {
  const b = writeBatch(f)
  b.set(doc(f, 'claims', String(entryId)), {
    uid,
    claimedAt: '2026-10-15T10:00:00.000Z',
    verified,
  })
  b.update(doc(f, 'managers', uid), { fplEntryId: entryId })
  return b.commit()
}

/** The reverse, by the manager or by the owner. */
function unclaim(f: ClientDb, uid: string, entryId: number) {
  const b = writeBatch(f)
  b.delete(doc(f, 'claims', String(entryId)))
  b.update(doc(f, 'managers', uid), { fplEntryId: null })
  return b.commit()
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'fpl-workshop',
    firestore: { rules, host: 'localhost', port: 8080 },
  })
})
beforeEach(async () => {
  await env.clearFirestore()
  await seed()
})
afterAll(() => env.cleanup())

describe('managers', () => {
  const fresh = {
    displayName: 'New',
    fplEntryId: null,
    photoURL: null,
    joinedAt: '2026-09-09T00:00:00.000Z',
  }

  it('signed-in users can read, signed-out cannot', async () => {
    await assertSucceeds(getDoc(doc(db(WINNER), 'managers', OTHER)))
    await assertFails(getDoc(doc(db(), 'managers', OTHER)))
  })
  it('a user can create only their own document, with no team linked', async () => {
    await assertSucceeds(setDoc(doc(db('new-uid'), 'managers', 'new-uid'), fresh))
    await assertFails(setDoc(doc(db('new-uid'), 'managers', 'someone-else'), fresh))
    await assertFails(
      setDoc(doc(db('newer-uid'), 'managers', 'newer-uid'), { ...fresh, fplEntryId: TEAM }),
    )
  })
  it('a manager can hide their name and edit their own document only', async () => {
    await assertSucceeds(updateDoc(doc(db(WINNER), 'managers', WINNER), { hideName: true }))
    await assertFails(updateDoc(doc(db(OTHER), 'managers', WINNER), { displayName: 'Hijack' }))
    await assertFails(updateDoc(doc(db(WINNER), 'managers', WINNER), { isAdmin: true }))
  })
  it('fplEntryId cannot be set without claiming the team in the same write', async () => {
    await assertFails(updateDoc(doc(db(WINNER), 'managers', WINNER), { fplEntryId: TEAM }))
  })
})

describe('claims (rules 1.4 and 4.2)', () => {
  it('signed-in users can see which teams are taken', async () => {
    await assertSucceeds(getDocs(collection(db(WINNER), 'claims')))
    await assertFails(getDocs(collection(db(), 'claims')))
  })
  it('a manager claims a free team together with their link', async () => {
    await assertSucceeds(claim(db(WINNER), WINNER, TEAM))
  })
  it('a claim cannot be self-verified or made for someone else', async () => {
    await assertFails(claim(db(WINNER), WINNER, TEAM, true))
    const f = db(WINNER)
    const b = writeBatch(f)
    b.set(doc(f, 'claims', String(TEAM)), { uid: OTHER, claimedAt: 'x', verified: false })
    await assertFails(b.commit())
  })
  it('a team already claimed cannot be claimed again', async () => {
    await assertFails(claim(db(WINNER), WINNER, OTHER_TEAM))
  })
  it('an account cannot claim a second team', async () => {
    await claim(db(WINNER), WINNER, TEAM)
    await assertFails(claim(db(WINNER), WINNER, 777))
  })
  it('a manager can take back an unconfirmed pick, but not once confirmed', async () => {
    await claim(db(WINNER), WINNER, TEAM)
    await assertSucceeds(unclaim(db(WINNER), WINNER, TEAM))
    await claim(db(WINNER), WINNER, TEAM)
    await updateDoc(doc(db(OWNER), 'claims', String(TEAM)), { verified: true })
    await assertFails(unclaim(db(WINNER), WINNER, TEAM))
  })
  it('nobody else can take back or confirm a claim', async () => {
    await assertFails(unclaim(db(WINNER), OTHER, OTHER_TEAM))
    await assertFails(updateDoc(doc(db(OTHER), 'claims', String(OTHER_TEAM)), { verified: true }))
  })
  it('the owner confirms and releases claims', async () => {
    await assertSucceeds(
      updateDoc(doc(db(OWNER), 'claims', String(OTHER_TEAM)), { verified: true }),
    )
    await assertFails(updateDoc(doc(db(OWNER), 'claims', String(OTHER_TEAM)), { uid: WINNER }))
    await assertSucceeds(unclaim(db(OWNER), OTHER, OTHER_TEAM))
  })
  it('the owner can adopt a link made before claims existed', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), 'managers', WINNER), { fplEntryId: TEAM })
    })
    const claimDoc = { uid: WINNER, claimedAt: '2026-10-15T10:00:00.000Z', verified: true }
    await assertFails(setDoc(doc(db(WINNER), 'claims', String(TEAM)), claimDoc))
    await assertFails(setDoc(doc(db(OWNER), 'claims', '999'), claimDoc))
    await assertSucceeds(setDoc(doc(db(OWNER), 'claims', String(TEAM)), claimDoc))
  })
})

describe('entries (rules 1.1, 1.4, 5.1, 5.2)', () => {
  it('anyone can read', async () => {
    await assertSucceeds(getDoc(doc(db(), 'entries', String(TEAM))))
  })
  it('only the owner edits, and only the eligibility fields', async () => {
    const ref = (uid: string) => doc(db(uid), 'entries', String(TEAM))
    await assertSucceeds(updateDoc(ref(OWNER), { joinedOn: '2026-10-03' }))
    await assertSucceeds(updateDoc(ref(OWNER), { seasonForfeit: true, forfeitMonths: ['2026-11'] }))
    await assertFails(updateDoc(ref(OWNER), { playerName: 'Someone else' }))
    await assertFails(updateDoc(ref(OWNER), { seasonForfeit: 'yes' }))
    await assertFails(updateDoc(ref(WINNER), { joinedOn: '2026-09-01' }))
    await assertFails(setDoc(doc(db(OWNER), 'entries', '123'), { playerName: 'New' }))
    await assertFails(deleteDoc(ref(OWNER)))
  })
})

describe('gifts', () => {
  it('anyone can read, even signed out', async () => {
    await assertSucceeds(getDoc(doc(db(), 'gifts', 'phone-stand')))
  })
  it('only the owner writes', async () => {
    await assertSucceeds(updateDoc(doc(db(OWNER), 'gifts', 'phone-stand'), { status: 'cut' }))
    await assertFails(updateDoc(doc(db(WINNER), 'gifts', 'phone-stand'), { status: 'cut' }))
    await assertFails(updateDoc(doc(db(), 'gifts', 'phone-stand'), { status: 'cut' }))
  })
})

describe('codes', () => {
  it('a manager cannot list codes; the owner can', async () => {
    await assertFails(getDocs(collection(db(WINNER), 'codes')))
    await assertFails(getDocs(collection(db(), 'codes')))
    await assertSucceeds(getDocs(collection(db(OWNER), 'codes')))
  })
  it('only the winner (and owner) can get a code', async () => {
    await assertSucceeds(getDoc(doc(db(WINNER), 'codes', CODE)))
    await assertSucceeds(getDoc(doc(db(OWNER), 'codes', CODE)))
    await assertFails(getDoc(doc(db(OTHER), 'codes', CODE)))
    await assertFails(getDoc(doc(db(), 'codes', CODE)))
  })
  it('the winner can redeem their own code exactly once', async () => {
    const redeem = { redeemed: true, redeemedAt: '2026-10-02T18:00:00.000Z' }
    await assertFails(updateDoc(doc(db(OTHER), 'codes', CODE), redeem))
    await assertSucceeds(updateDoc(doc(db(WINNER), 'codes', CODE), redeem))
    await assertFails(updateDoc(doc(db(WINNER), 'codes', CODE), redeem))
  })
  it('the winner cannot change anything except redeemed and redeemedAt', async () => {
    await assertFails(updateDoc(doc(db(WINNER), 'codes', CODE), { giftId: 'wall-clock' }))
    await assertFails(
      updateDoc(doc(db(WINNER), 'codes', CODE), {
        redeemed: true,
        redeemedAt: 'x',
        giftId: 'wall-clock',
      }),
    )
    await assertFails(updateDoc(doc(db(WINNER), 'codes', CODE), { redeemed: true }))
  })
  it('only the owner returns an unclaimed prize to the pool, once', async () => {
    const back = { returnedAt: '2026-12-01T09:00:00.000Z' }
    await assertFails(updateDoc(doc(db(WINNER), 'codes', CODE), back))
    await assertFails(updateDoc(doc(db(OWNER), 'codes', CODE), { ...back, giftId: 'wall-clock' }))
    await assertSucceeds(updateDoc(doc(db(OWNER), 'codes', CODE), back))
    await assertFails(updateDoc(doc(db(OWNER), 'codes', CODE), { returnedAt: 'again' }))
  })
  it('only the owner creates and deletes codes', async () => {
    const fresh = {
      month: '2026-10',
      winnerUid: OTHER,
      entryId: OTHER_TEAM,
      giftId: 'mug-tree',
      issuedAt: '2026-11-01T09:00:00.000Z',
      redeemed: false,
      redeemedAt: null,
      pool: ['mug-tree', 'wall-clock'],
      decidedBy: 'points',
      tied: [],
      returnedAt: null,
    }
    await assertFails(setDoc(doc(db(OTHER), 'codes', 'FPLW-OCT26-AAAA'), fresh))
    await assertSucceeds(setDoc(doc(db(OWNER), 'codes', 'FPLW-OCT26-AAAA'), fresh))
    await assertFails(
      setDoc(doc(db(OWNER), 'codes', 'FPLW-OCT26-BBBB'), { ...fresh, redeemed: true }),
    )
    await assertFails(deleteDoc(doc(db(WINNER), 'codes', CODE)))
    await assertSucceeds(deleteDoc(doc(db(OWNER), 'codes', CODE)))
  })
})

describe('standings, months, gameweeks', () => {
  it('anyone can read, nobody can write from the client', async () => {
    await assertSucceeds(getDoc(doc(db(), 'standings', 'current')))
    await assertFails(setDoc(doc(db(OWNER), 'standings', 'current'), { gameweek: 4 }))
    await assertFails(setDoc(doc(db(WINNER), 'months', '2026-09'), { closed: true }))
    await assertFails(setDoc(doc(db(OWNER), 'gameweeks', '1'), { finished: true }))
  })
})
