#!/usr/bin/env node
// Pulls the mini league from the FPL API and writes `standings/current` and `months/{YYYY-MM}`
// (CLAUDE.md, "FPL data feed"). Run by .github/workflows/fpl-sync.yml every six hours; never from
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

const FPL = 'https://fantasy.premierleague.com/api'
const PROJECT_ID = 'fpl-workshop'
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

async function getJson(path, attempt = 1) {
  const url = `${FPL}${path}`
  try {
    const res = await fetch(url, {
      headers: {
        // FPL answers 403 to some default agents; a browser-like one is reliable.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36',
        Accept: 'application/json',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    if (attempt >= 3) fail(`${url} failed after ${attempt} attempts: ${err.message}`)
    await new Promise((r) => setTimeout(r, 1500 * attempt))
    return getJson(path, attempt + 1)
  }
}

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
    isCurrent: e.is_current === true,
  }
})
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
// A gameweek belongs to the calendar month (UTC) of its deadline. A month lists every gameweek
// due in it, played or not, so `closed` only turns true once the last one has finished; months
// with no gameweek started yet are skipped.
const monthOf = (deadline) => deadline.slice(0, 7)
const monthGameweeks = new Map()
for (const e of events) {
  const m = monthOf(e.deadline)
  if (!monthGameweeks.has(m)) monthGameweeks.set(m, [])
  monthGameweeks.get(m).push(e.id)
}
for (const [m, gws] of monthGameweeks) {
  if (!gws.some((gw) => started.some((e) => e.id === gw))) monthGameweeks.delete(m)
}

const pointsByEntry = new Map() // entryId -> Map(gameweek -> net points)
for (const row of rows) {
  const history = await getJson(`/entry/${row.entryId}/history/`)
  expect(Array.isArray(history?.current), `history for entry ${row.entryId}: no current[]`)
  const byGw = new Map()
  for (const gw of history.current) {
    expect(isNum(gw.event) && isNum(gw.points), `bad history row for entry ${row.entryId}`)
    byGw.set(gw.event, gw.points) // already net of transfer costs, as FPL reports it
  }
  pointsByEntry.set(row.entryId, byGw)
}

const seasonTotal = new Map(rows.map((r) => [r.entryId, r.totalPoints]))
const months = [...monthGameweeks.entries()].map(([month, gameweeks]) => {
  const monthRows = rows.map((r) => ({
    entryId: r.entryId,
    playerName: r.playerName,
    points: gameweeks.reduce((sum, gw) => sum + (pointsByEntry.get(r.entryId)?.get(gw) ?? 0), 0),
  }))
  // Tie-break: higher season total wins (CLAUDE.md). A dead heat after that is for the owner.
  monthRows.sort(
    (a, b) => b.points - a.points || seasonTotal.get(b.entryId) - seasonTotal.get(a.entryId),
  )
  const closed = gameweeks.every((gw) => events.find((e) => e.id === gw)?.finished === true)
  return { month, doc: { gameweeks, rows: monthRows, closed } }
})

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
const batch = db.batch()
batch.set(db.doc('standings/current'), standings)
for (const { month, doc } of months) batch.set(db.doc(`months/${month}`), doc)
await batch.commit()
console.log(`wrote standings/current and ${months.length} month document(s)`)
