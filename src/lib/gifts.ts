import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  type FirestoreDataConverter,
  type Unsubscribe,
} from 'firebase/firestore'
import { GIFT_STATUSES, gifts as seedGifts, type Gift, type GiftStatus } from '../data/gifts'
import { db } from './firebase'

const isStatus = (v: unknown): v is GiftStatus => GIFT_STATUSES.includes(v as GiftStatus)
const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback)

/** `gifts/{giftId}` — see CLAUDE.md, "Firestore data model". Unknown fields fall back to seed data. */
const converter: FirestoreDataConverter<Gift> = {
  // Only ever used for typed updates; the client never writes whole gift documents.
  toFirestore: (g) => {
    const data: Record<string, unknown> = { ...g }
    delete data.id
    return data
  },
  fromFirestore: (snap) => {
    const d = snap.data()
    const seed = seedGifts.find((g) => g.id === snap.id)
    return {
      id: snap.id,
      name: str(d.name, seed?.name ?? snap.id),
      blurb: str(d.blurb, seed?.blurb ?? ''),
      hours: typeof d.hours === 'number' ? d.hours : (seed?.hours ?? 0),
      materials: str(d.materials, seed?.materials ?? ''),
      boughtParts: typeof d.boughtParts === 'string' ? d.boughtParts : null,
      status: isStatus(d.status) ? d.status : 'available',
      wonBy: typeof d.wonBy === 'string' ? d.wonBy : null,
      wonByName: typeof d.wonByName === 'string' ? d.wonByName : null,
      wonMonth: typeof d.wonMonth === 'string' ? d.wonMonth : null,
      photos: Array.isArray(d.photos)
        ? d.photos.filter((p): p is string => typeof p === 'string')
        : [],
    }
  },
}

export const giftsRef = () => collection(db, 'gifts').withConverter(converter)
export const giftRef = (giftId: string) => doc(db, 'gifts', giftId).withConverter(converter)

/** Path of a photo file inside /public/gifts/{giftId}/. */
export const giftPhotoPath = (giftId: string, file: string) => `/gifts/${giftId}/${file}`

/**
 * Live list of gifts in seed order. `live` is false while the collection has not been seeded,
 * in which case the seed data is shown so the gallery still renders.
 */
export function watchGifts(onChange: (gifts: Gift[], live: boolean) => void): Unsubscribe {
  return onSnapshot(
    giftsRef(),
    (snap) => {
      if (snap.empty) {
        onChange(seedGifts, false)
        return
      }
      const byId = new Map(snap.docs.map((d) => [d.id, d.data()]))
      const ordered = seedGifts.flatMap((s) => byId.get(s.id) ?? [])
      const extras = snap.docs
        .filter((d) => !seedGifts.some((s) => s.id === d.id))
        .map((d) => d.data())
      onChange([...ordered, ...extras], true)
    },
    (err) => console.error('gifts snapshot failed', err),
  )
}

/** Rule: `gifts/*` — write only by the owner. */
export function setGiftStatus(giftId: string, status: GiftStatus): Promise<void> {
  return updateDoc(giftRef(giftId), { status })
}

/** Rule: `gifts/*` — write only by the owner. */
export function addGiftPhoto(giftId: string, file: string): Promise<void> {
  return updateDoc(giftRef(giftId), { photos: arrayUnion(giftPhotoPath(giftId, file)) })
}

/** Rule: `gifts/*` — write only by the owner. */
export function removeGiftPhoto(giftId: string, path: string): Promise<void> {
  return updateDoc(giftRef(giftId), { photos: arrayRemove(path) })
}

/** Moves a photo to the front so it becomes the hero. Rule: `gifts/*` — write only by the owner. */
export function setGiftHero(gift: Gift, path: string): Promise<void> {
  return updateDoc(giftRef(gift.id), { photos: [path, ...gift.photos.filter((p) => p !== path)] })
}
