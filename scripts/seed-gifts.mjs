#!/usr/bin/env node
// One-off seed of gifts/{giftId} from src/data/gifts.ts (CLAUDE.md, Step 4).
//
// Idempotent: creates missing gifts and refreshes the static fields (name, blurb, hours,
// materials, boughtParts) of existing ones. Never touches status, wonBy, wonMonth or photos,
// so it is safe to re-run after the season has started.
//
//   node scripts/seed-gifts.mjs --emulator      # against the local emulator (npm run dev running)
//   node scripts/seed-gifts.mjs                 # against production; needs the service-account JSON
//                                               # in GOOGLE_APPLICATION_CREDENTIALS (never commit it)
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { gifts } from '../src/data/gifts.ts'

const projectId = 'fpl-workshop'
const emulator = process.argv.includes('--emulator')
if (emulator) {
  process.env.FIRESTORE_EMULATOR_HOST ??= 'localhost:8080'
} else if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    'Refusing to run against production without GOOGLE_APPLICATION_CREDENTIALS.\n' +
      'Download the service-account JSON from Project settings → Service accounts, keep it outside\n' +
      'the repo, and point the variable at it. For the emulator pass --emulator.',
  )
  process.exit(1)
}

initializeApp(emulator ? { projectId } : { projectId, credential: applicationDefault() })
const db = getFirestore()
console.log(
  `Seeding ${gifts.length} gifts into ${emulator ? process.env.FIRESTORE_EMULATOR_HOST : projectId}`,
)

let created = 0
let refreshed = 0
const batch = db.batch()
const existing = await db.collection('gifts').get()
const have = new Set(existing.docs.map((d) => d.id))
for (const g of gifts) {
  const ref = db.collection('gifts').doc(g.id)
  const staticFields = {
    name: g.name,
    blurb: g.blurb,
    hours: g.hours,
    materials: g.materials,
    boughtParts: g.boughtParts,
  }
  if (have.has(g.id)) {
    batch.set(ref, staticFields, { merge: true })
    refreshed++
  } else {
    batch.set(ref, {
      ...staticFields,
      status: 'available',
      wonBy: null,
      wonMonth: null,
      photos: g.photos,
    })
    created++
  }
}
await batch.commit()
console.log(`Done: ${created} created, ${refreshed} refreshed.`)
