// Firestore rules tests. Run with `npm test`, which starts the Firestore emulator around vitest.
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const rules = readFileSync('firestore.rules', 'utf8')
// Keep the tests in step with whatever uid is hardcoded in the rules.
const OWNER = /function ownerUid\(\) \{ return '([^']+)'; \}/.exec(rules)?.[1] ?? 'OWNER_UID_TODO'
const WINNER = 'winner-uid'
const OTHER = 'other-uid'
const CODE = 'FPLW-SEP26-7F3K'

let env: RulesTestEnvironment

const db = (uid?: string) =>
  uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore()

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
      fplEntryId: 4242,
      photoURL: null,
      joinedAt: '2026-08-01T00:00:00.000Z',
    })
  })
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
  it('a user can create only their own document', async () => {
    await assertSucceeds(setDoc(doc(db(WINNER), 'managers', WINNER), fresh))
    await assertFails(setDoc(doc(db(WINNER), 'managers', 'someone-else'), fresh))
  })
  it('fplEntryId can be set once and never changed', async () => {
    await setDoc(doc(db(WINNER), 'managers', WINNER), fresh)
    await assertSucceeds(updateDoc(doc(db(WINNER), 'managers', WINNER), { fplEntryId: 1234567 }))
    await assertFails(updateDoc(doc(db(WINNER), 'managers', WINNER), { fplEntryId: 999 }))
    await assertFails(updateDoc(doc(db(OTHER), 'managers', WINNER), { displayName: 'Hijack' }))
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
  it('only the owner creates and deletes codes', async () => {
    const fresh = {
      month: '2026-10',
      winnerUid: OTHER,
      giftId: 'mug-tree',
      issuedAt: '2026-11-01T09:00:00.000Z',
      redeemed: false,
      redeemedAt: null,
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
