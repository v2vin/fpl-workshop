import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  writeBatch,
  type FirestoreDataConverter,
  type Unsubscribe,
} from 'firebase/firestore'
import type { Gift } from '../data/gifts'
import { SITE_URL, WORKSHOP_NAME } from './config'
import { db } from './firebase'
import { formatDate, formatMonth } from './format'
import { giftRef } from './gifts'
import { holdUntil } from './rules'

/** How the month's winner was decided (rules 2.1 and 2.3). */
export type DecidedBy = 'points' | 'best-gameweek' | 'lot'

/**
 * `codes/{code}` — the document id is the code. See CLAUDE.md, "Firestore data model". Together
 * with `pool` it is the record of the draw (rule 3.2). Codes issued before the prize rules lack
 * the newer fields.
 */
export interface Code {
  code: string
  month: string
  winnerUid: string
  /** The winning FPL team. */
  entryId: number | null
  giftId: string
  /** ISO string, UTC. Counts as the announcement for the 60-day hold (rule 4.3). */
  issuedAt: string
  redeemed: boolean
  redeemedAt: string | null
  /** Ids of every gift still available at the moment of the draw. */
  pool: string[]
  decidedBy: DecidedBy | null
  /** Teams level on points before the tie-break, when there were any. */
  tied: number[]
  /** Set when an unclaimed prize went back into the pool (rule 4.3). */
  returnedAt: string | null
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const DECIDED_BY: readonly DecidedBy[] = ['points', 'best-gameweek', 'lot']

const converter: FirestoreDataConverter<Code> = {
  toFirestore: (c) => {
    const data: Record<string, unknown> = { ...c }
    delete data.code
    return data
  },
  fromFirestore: (snap) => {
    const d = snap.data()
    return {
      code: snap.id,
      month: str(d.month),
      winnerUid: str(d.winnerUid),
      giftId: str(d.giftId),
      issuedAt: str(d.issuedAt),
      redeemed: d.redeemed === true,
      redeemedAt: typeof d.redeemedAt === 'string' ? d.redeemedAt : null,
      entryId: typeof d.entryId === 'number' ? d.entryId : null,
      pool: Array.isArray(d.pool) ? d.pool.filter((g): g is string => typeof g === 'string') : [],
      decidedBy: DECIDED_BY.includes(d.decidedBy) ? (d.decidedBy as DecidedBy) : null,
      tied: Array.isArray(d.tied) ? d.tied.filter((t): t is number => typeof t === 'number') : [],
      returnedAt: typeof d.returnedAt === 'string' ? d.returnedAt : null,
    }
  },
}

export const codeRef = (code: string) => doc(db, 'codes', code).withConverter(converter)
export const codesRef = () => collection(db, 'codes').withConverter(converter)

export type DrawErrorKind =
  'no-gifts' | 'gift-taken' | 'code-exists' | 'not-found' | 'not-yours' | 'already-redeemed'

export class DrawError extends Error {
  readonly kind: DrawErrorKind
  constructor(kind: DrawErrorKind, message: string) {
    super(message)
    this.name = 'DrawError'
    this.kind = kind
  }
}

// No 0/O or 1/I, so a code read out over a WhatsApp voice note cannot be misheard.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export const CODE_PATTERN = /^FPLW-[A-Z]{3}[0-9]{2}-[A-Z0-9]{4}$/

export const normaliseCode = (input: string) =>
  input
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9-]/g, '')

function randomInt(max: number): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] % max
}

/** A fair pick from a list, from the browser's crypto source. Used for the draw and for lots. */
export function pickAtRandom<T>(items: readonly T[]): T | undefined {
  return items.length ? items[randomInt(items.length)] : undefined
}

/** `FPLW-<MON><YY>-<4 chars>`, e.g. FPLW-SEP26-7F3K. */
export function generateCode(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const mon = MONTHS[(m ?? 1) - 1] ?? 'XXX'
  const yy = String(y ?? 0)
    .slice(-2)
    .padStart(2, '0')
  let tail = ''
  for (let i = 0; i < 4; i++) tail += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return `FPLW-${mon}${yy}-${tail}`
}

/**
 * Issues a code for a month's winner. The draw itself (rule 3.2): a random pick among the gifts
 * still available, on the owner's device. Writes `codes/{code}` with the pool it drew from and
 * marks the gift drawn in one transaction, so two taps cannot draw the same gift.
 * Rules: `codes/{code}` create only by the owner; `gifts/*` write only by the owner.
 */
export async function issueCode(params: {
  month: string
  winnerUid: string
  entryId: number
  /** Shown on the public wall of winners; null when the winner asked not to be named (rule 5.3). */
  publicName: string | null
  decidedBy: DecidedBy
  tied: number[]
  gifts: Gift[]
}): Promise<Code> {
  const pool = params.gifts.filter((g) => g.status === 'available')
  const picked = pickAtRandom(pool)
  if (!picked) throw new DrawError('no-gifts', 'No gifts left to draw.')
  const issued: Code = {
    code: generateCode(params.month),
    month: params.month,
    winnerUid: params.winnerUid,
    entryId: params.entryId,
    giftId: picked.id,
    issuedAt: new Date().toISOString(),
    redeemed: false,
    redeemedAt: null,
    pool: pool.map((g) => g.id),
    decidedBy: params.decidedBy,
    tied: params.tied,
    returnedAt: null,
  }
  return runTransaction(db, async (tx) => {
    const [giftSnap, codeSnap] = await Promise.all([
      tx.get(giftRef(picked.id)),
      tx.get(codeRef(issued.code)),
    ])
    if (codeSnap.exists())
      throw new DrawError('code-exists', 'Code clash, of all things. Tap again.')
    if (!giftSnap.exists() || giftSnap.data().status !== 'available') {
      throw new DrawError('gift-taken', 'That gift was drawn a moment ago. Tap again.')
    }
    tx.set(codeRef(issued.code), issued)
    tx.update(giftRef(picked.id), {
      status: 'drawn',
      wonBy: params.winnerUid,
      wonByName: params.publicName,
      wonMonth: params.month,
    })
    return issued
  })
}

/**
 * An unclaimed prize goes back into the pool after the hold (rule 4.3): the code is marked
 * returned and the gift is available again. Rules: `codes/{code}` owner may set `returnedAt`
 * once; `gifts/*` write only by the owner.
 */
export function returnToPool(code: Code): Promise<void> {
  const batch = writeBatch(db)
  batch.update(codeRef(code.code), { returnedAt: new Date().toISOString() })
  batch.update(giftRef(code.giftId), {
    status: 'available',
    wonBy: null,
    wonByName: null,
    wonMonth: null,
  })
  return batch.commit()
}

/**
 * Fetches a code by its exact id. Rule: `codes/{code}` get only by the winner (and the owner);
 * anyone else, and any unknown code, comes back as permission denied.
 */
export async function lookupCode(input: string): Promise<Code> {
  const code = normaliseCode(input)
  if (!CODE_PATTERN.test(code)) throw new DrawError('not-found', 'That does not look like a code.')
  try {
    const snap = await getDoc(codeRef(code))
    if (!snap.exists()) throw new DrawError('not-found', 'That code does not exist.')
    return snap.data()
  } catch (err) {
    if (err instanceof DrawError) throw err
    if ((err as { code?: string }).code === 'permission-denied') {
      throw new DrawError('not-yours', 'That code is not yours, or does not exist.')
    }
    throw err
  }
}

/**
 * Marks a code redeemed, once. Rule: `codes/{code}` update only by the winner, and only
 * `redeemed` false → true together with `redeemedAt`.
 */
export async function redeemCode(code: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(codeRef(code))
    if (!snap.exists()) throw new DrawError('not-found', 'That code does not exist.')
    if (snap.data().redeemed) throw new DrawError('already-redeemed', 'Already redeemed.')
    tx.update(codeRef(code), { redeemed: true, redeemedAt: new Date().toISOString() })
  })
}

/** Every issued code, newest first. Rule: `codes` list only by the owner. */
export function watchCodes(onChange: (codes: Code[]) => void): Unsubscribe {
  return onSnapshot(
    query(codesRef(), orderBy('issuedAt', 'desc')),
    (snap) => onChange(snap.docs.map((d) => d.data())),
    (err) => console.error('codes snapshot failed', err),
  )
}

/** Shuffle theatre: card indices to light up in turn, ending on the gift already drawn. */
export function shuffleSequence(count: number, finalIndex: number, steps = 20): number[] {
  const seq: number[] = []
  let prev = -1
  for (let i = 0; i < steps - 1; i++) {
    let n = randomInt(count)
    if (count > 1 && n === prev) n = (n + 1) % count
    seq.push(n)
    prev = n
  }
  seq.push(finalIndex)
  return seq
}

/** Pause before step `i` in ms: brisk at first, slowing into the reveal. */
export function shuffleDelay(i: number, steps: number): number {
  const t = i / Math.max(1, steps - 1)
  return 90 + Math.round(600 * t * t)
}

export function winnerMessage(code: Code): string {
  return `You won ${formatMonth(code.month)} in FPL Workshop. Your code is ${code.code}. Sign in at ${SITE_URL}/draw and enter it to reveal your gift. We hold it for you until ${formatDate(holdUntil(code.issuedAt))}; before handover, show us you control your FPL team.`
}

export function shareText(gift: Gift, month: string): string {
  return `I won ${formatMonth(month)} in FPL Workshop: a ${gift.name.toLowerCase()}, handmade by ${WORKSHOP_NAME}. ${SITE_URL}/gifts`
}
