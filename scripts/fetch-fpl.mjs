#!/usr/bin/env node
// Pulls the mini league from the FPL API and writes `standings/current`, `months/{YYYY-MM}` and
// `entries/{entryId}` (CLAUDE.md, "FPL data feed"; prize rules in src/data/rules.ts). Run by .github/workflows/fpl-sync.yml every six hours; never from
// the browser, which the FPL endpoints block.
//
//   FPL_LEAGUE_ID=1955077 GOOGLE_APPLICATION_CREDENTIALS=key.json node scripts/fetch-fpl.mjs
//   node scripts/fetch-fpl.mjs --emulator   # FPL fetched live, written to the local emulator
//   node scripts/fetch-fpl.mjs --dry-run    # fetch and compute, print the result, write nothing
//
// The endpoints are unofficial, so every field is checked and the run fails loudly, writing
// nothing, rather than storing a partial table.
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { fplGet } from './fpl-api.mjs'

const PROJECT_ID = 'fpl-workshop'
// Prize rules read dates in Malawi time; keep in step with LEAGUE_TIME_ZONE in src/lib/config.ts.
const TIME_ZONE = 'Africa/Blantyre'
/** "YYYY-MM-DD" of an instant as a calendar date in Malawi (en-CA formats as YYYY-MM-DD). */
const leagueDate = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: TIME_ZONE })
const dryRun = process.argv.includes('--dry-run')
const emulator = process.argv.includes('--emulator')
const leagueId = Number(process.env.FPL_LEAGUE_ID ?? (emulator || dryRun ? '1955077' : ''))

function fail(message) {
  console.error(`fetch-fpl: ${message}`)
  process.exit(1)
}
function expect(condition, message) {
  if (!condition) fail(message)
}
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const isStr = (v) => typeof v === 'string' && v.length > 0

expect(Number.isInteger(leagueId) && leagueId > 0, 'FPL_LEAGUE_ID must be a positive integer')
if (!dryRun && !emulator) {
  expect(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    'GOOGLE_APPLICATION_CREDENTIALS is not set; refusing to guess where to write',
  )
}

const getJson = (path) => fplGet(path).catch((err) => fail(err.message))

// 1. Gameweeks -------------------------------------------------------------------------------
const bootstrap = await getJson('/bootstrap-static/')
expect(
  Array.isArray(bootstrap?.events) && bootstrap.events.length > 0,
  'bootstrap-static: no events',
)
const events = bootstrap.events.map((e) => {
  expect(
    isNum(e.id) && isStr(e.deadline_time) && typeof e.finished === 'boolean',
    `bad event ${e?.id}`,
  )
  return {
    id: e.id,
    deadline: e.deadline_time,
    finished: e.finished,
    // FPL sets data_checked once bonus points and corrections are final ("processed", rule 2.2).
    processed: e.finished && e.data_checked === true,
    isCurrent: e.is_current === true,
  }
})
// FPL's monthly tables ("phases"); "Overall" spans the season and is not a month.
const phases = (Array.isArray(bootstrap.phases) ? bootstrap.phases : [])
  .filter((p) => isNum(p.id) && isNum(p.start_event) && isNum(p.stop_event))
  .filter((p) => !(p.start_event === 1 && p.stop_event === events.length))
const now = new Date().toISOString()
const started = events.filter((e) => e.deadline <= now)
const gameweek = started.length ? Math.max(...started.map((e) => e.id)) : 0
const next = events.find((e) => e.deadline > now) ?? null

// 2. League standings -------------------------------------------------------------------------
const rows = []
let leagueName = ''
for (let page = 1; page <= 20; page++) {
  const data = await getJson(`/leagues-classic/${leagueId}/standings/?page_standings=${page}`)
  expect(Array.isArray(data?.standings?.results), `standings page ${page}: no results`)
  if (page === 1) leagueName = isStr(data?.league?.name) ? data.league.name : `League ${leagueId}`
  for (const r of data.standings.results) {
    expect(
      isNum(r.entry) && isStr(r.player_name) && isStr(r.entry_name),
      `bad standings row ${r?.entry}`,
    )
    expect(
      isNum(r.event_total) && isNum(r.total) && isNum(r.rank),
      `bad totals for entry ${r.entry}`,
    )
    rows.push({
      entryId: r.entry,
      playerName: r.player_name,
      teamName: r.entry_name,
      eventPoints: r.event_total,
      totalPoints: r.total,
      rank: r.rank,
      lastRank: isNum(r.last_rank) ? r.last_rank : r.rank,
    })
  }
  if (!data.standings.has_next) break
}
expect(rows.length > 0, 'league has no entries')
rows.sort((a, b) => a.rank - b.rank)

// 3. Per-entry history → monthly points ------------------------------------------------------
// A gameweek belongs to the calendar month, in Malawi, of its deadline (rule 2.1). A month lists
// every gameweek due in it, played or not, so `closed` only turns true once FPL has processed the
// last one (rule 2.2); months with no gameweek started yet are skipped.
const monthOf = (deadline) => leagueDate(deadline).slice(0, 7)
const monthGameweeks = new Map()
for (const e of events) {
  const m = monthOf(e.deadline)
  if (!monthGameweeks.has(m)) monthGameweeks.set(m, [])
  monthGameweeks.get(m).push(e.id)
}
for (const [m, gws] of monthGameweeks) {
  if (!gws.some((gw) => started.some((e) => e.id === gw))) monthGameweeks.delete(m)
}

const historyByEntry = new Map() // entryId -> Map(gameweek -> { points, cost })
for (const row of rows) {
  const history = await getJson(`/entry/${row.entryId}/history/`)
  expect(Array.isArray(history?.current), `history for entry ${row.entryId}: no current[]`)
  const byGw = new Map()
  for (const gw of history.current) {
    expect(
      isNum(gw.event) && isNum(gw.points) && isNum(gw.event_transfers_cost),
      `bad history row for entry ${row.entryId}`,
    )
    // `points` is before transfer hits.
    byGw.set(gw.event, { points: gw.points, cost: gw.event_transfers_cost })
  }
  historyByEntry.set(row.entryId, byGw)
}

// Rule 2.2 takes points from the official FPL site, so a month's points match FPL's monthly
// league table: gameweek scores after transfer hits, except that FPL does not take off hits for
// the first gameweek of the month (checked against FPL's September and October 2026 tables).
const monthGwPoints = (entryId, gameweeks) =>
  gameweeks.map((gw, i) => {
    const h = historyByEntry.get(entryId)?.get(gw)
    return h ? h.points - (i === 0 ? 0 : h.cost) : 0
  })

/** FPL's own monthly table for these gameweeks, entryId -> total, or null if FPL has none. */
async function officialMonth(gameweeks) {
  const phase = phases.find(
    (p) => p.start_event === gameweeks[0] && p.stop_event === gameweeks[gameweeks.length - 1],
  )
  if (!phase) return null
  const totals = new Map()
  for (let page = 1; page <= 20; page++) {
    const data = await getJson(
      `/leagues-classic/${leagueId}/standings/?phase=${phase.id}&page_standings=${page}`,
    )
    expect(Array.isArray(data?.standings?.results), `phase ${phase.id} page ${page}: no results`)
    for (const r of data.standings.results) {
      expect(isNum(r.entry) && isNum(r.total), `bad phase ${phase.id} row ${r?.entry}`)
      totals.set(r.entry, r.total)
    }
    if (!data.standings.has_next) break
  }
  return totals
}

const best = (gwPoints) => (gwPoints.length ? Math.max(...gwPoints) : 0)
const months = []
for (const [month, gameweeks] of monthGameweeks) {
  const official = await officialMonth(gameweeks)
  if (!official) console.warn(`  ${month}: FPL has no monthly table for these gameweeks`)
  const monthRows = rows.map((r) => {
    const gwPoints = monthGwPoints(r.entryId, gameweeks)
    const computed = gwPoints.reduce((sum, p) => sum + p, 0)
    const points = official?.get(r.entryId) ?? computed
    if (points !== computed) {
      // FPL's table wins (rule 2.2); flag it so the per-gameweek rule above can be revisited.
      console.warn(
        `::warning::${month} ${r.playerName}: FPL monthly total ${points}, computed ${computed}`,
      )
    }
    return {
      entryId: r.entryId,
      playerName: r.playerName,
      teamName: r.teamName,
      points,
      gwPoints,
    }
  })
  // Display order only: points, then best single gameweek (rule 2.3). Eligibility and the winner
  // are worked out in the browser (src/lib/rules.ts) from these rows and `entries/*`.
  monthRows.sort(
    (a, b) =>
      b.points - a.points ||
      best(b.gwPoints) - best(a.gwPoints) ||
      a.playerName.localeCompare(b.playerName),
  )
  const closed = gameweeks.every((gw) => events.find((e) => e.id === gw)?.processed === true)
  months.push({ month, doc: { gameweeks, rows: monthRows, closed } })
}

const standings = {
  updatedAt: now,
  gameweek,
  nextGameweek: next?.id ?? null,
  nextDeadline: next?.deadline ?? null,
  // The month whose document the Table page should show: that of the latest started gameweek.
  currentMonth: started.length ? monthOf(events.find((e) => e.id === gameweek).deadline) : null,
  leagueName,
  rows,
}

// 4. Write --------------------------------------------------------------------------------------
console.log(
  `${leagueName}: ${rows.length} entries, gameweek ${gameweek}, next deadline ${standings.nextDeadline ?? 'none'}`,
)
for (const { month, doc } of months) {
  const leader = doc.rows[0]
  console.log(
    `  ${month}: GW ${doc.gameweeks.join(',')}${doc.closed ? ' (closed)' : ''} — leader ${leader.playerName} ${leader.points}`,
  )
}
if (dryRun) {
  console.log('dry run, nothing written')
  process.exit(0)
}

if (emulator) process.env.FIRESTORE_EMULATOR_HOST ??= 'localhost:8080'
initializeApp(
  emulator
    ? { projectId: PROJECT_ID }
    : { projectId: PROJECT_ID, credential: applicationDefault() },
)
const db = getFirestore()

// `entries/{entryId}` records when each team was first seen, which the FPL API does not provide
// and rule 1.1 needs. The owner can correct `joinedOn` and the forfeit flags in the app; the sync
// only ever creates the document and refreshes the names. On the very first run the register is
// empty and every team present was already in the league (17 since 9 September 2026, per the
// sync logs), so they get joinedOn: null, "joined before tracking".
const known = new Set((await db.collection('entries').select().get()).docs.map((d) => d.id))
const firstRegister = known.size === 0
const today = leagueDate(now)

const batch = db.batch()
batch.set(db.doc('standings/current'), standings)
for (const { month, doc } of months) batch.set(db.doc(`months/${month}`), doc)
const added = []
for (const r of rows) {
  const ref = db.doc(`entries/${r.entryId}`)
  if (known.has(String(r.entryId))) {
    batch.update(ref, { playerName: r.playerName, teamName: r.teamName, lastSeenAt: now })
  } else {
    added.push(r)
    batch.create(ref, {
      playerName: r.playerName,
      teamName: r.teamName,
      joinedOn: firstRegister ? null : today,
      firstSeenAt: now,
      lastSeenAt: now,
      seasonForfeit: false,
      forfeitMonths: [],
    })
  }
}
await batch.commit()
console.log(`wrote standings/current and ${months.length} month document(s)`)
if (firstRegister) {
  console.log(`started the entries register with ${added.length} team(s), joined before tracking`)
} else {
  for (const r of added) console.log(`new entry: ${r.playerName} (${r.teamName}), joined ${today}`)
}
