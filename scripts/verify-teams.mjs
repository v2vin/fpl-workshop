#!/usr/bin/env node
// Confirms team claims by team name (rule 4.2). A manager who picks a team in the app gets a code
// and adds "-FPL-<code>" to the team's name on the FPL site, which only the account owner can do.
// This looks up every unconfirmed claim's team and confirms the ones whose name carries the code.
// Run by .github/workflows/verify-teams.yml every ten minutes.
//
//   GOOGLE_APPLICATION_CREDENTIALS=key.json node scripts/verify-teams.mjs
//   node scripts/verify-teams.mjs --emulator   # against the local emulator (npm run dev running)
//
// Logs are public on a public repo, so they name entries by id and never print codes.
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { hasTeamTag } from '../src/lib/teamCode.ts'
import { fplGet } from './fpl-api.mjs'

const PROJECT_ID = 'fpl-workshop'
const emulator = process.argv.includes('--emulator')

if (emulator) {
  process.env.FIRESTORE_EMULATOR_HOST ??= 'localhost:8080'
} else if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('verify-teams: GOOGLE_APPLICATION_CREDENTIALS is not set; refusing to guess')
  process.exit(1)
}
initializeApp(
  emulator
    ? { projectId: PROJECT_ID }
    : { projectId: PROJECT_ID, credential: applicationDefault() },
)
const db = getFirestore()

const pending = (await db.collection('claims').where('verified', '==', false).get()).docs.filter(
  (d) => typeof d.get('verifyCode') === 'string',
)
if (pending.length === 0) {
  console.log('no team claims waiting')
  process.exit(0)
}

let confirmed = 0
let failed = 0
for (const claim of pending) {
  const entryId = claim.id
  try {
    const entry = await fplGet(`/entry/${entryId}/`)
    if (typeof entry?.name !== 'string') throw new Error('no team name in the FPL response')
    // lastUpdateTime: skip the write if the claim was released or changed since it was read.
    const unchanged = { lastUpdateTime: claim.updateTime }
    if (hasTeamTag(entry.name, claim.get('verifyCode'))) {
      await claim.ref.update(
        {
          verified: true,
          verifiedBy: 'team-name',
          verifiedAt: new Date().toISOString(),
          nameChangeBlocked: false,
        },
        unchanged,
      )
      confirmed++
      console.log(`entry ${entryId}: confirmed by team name`)
    } else {
      const blocked = entry.name_change_blocked === true
      if (blocked !== (claim.get('nameChangeBlocked') === true)) {
        await claim.ref.update({ nameChangeBlocked: blocked }, unchanged)
      }
      console.log(`entry ${entryId}: waiting${blocked ? ' (FPL is blocking name changes)' : ''}`)
    }
  } catch (err) {
    failed++
    console.error(`entry ${entryId}: ${err.message}`)
  }
}
console.log(`${pending.length} waiting, ${confirmed} confirmed, ${failed} failed`)
// One team failing is logged and retried next run; every lookup failing means something is wrong.
if (failed === pending.length) process.exit(1)
