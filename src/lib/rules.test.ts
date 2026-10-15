// The prize rules engine. Plain unit tests: no emulator needed, though `npm test` runs them too.
import { describe, expect, it } from 'vitest'
import type { Entry } from './entries'
import type { Month } from './fpl'
import { holdUntil, ineligibility, leagueDate, resolveMonth } from './rules'

const entry = (entryId: number, patch: Partial<Entry> = {}): Entry => ({
  entryId,
  playerName: `Player ${entryId}`,
  teamName: `Team ${entryId}`,
  joinedOn: null,
  seasonForfeit: false,
  forfeitMonths: [],
  ...patch,
})

const month = (rows: [entryId: number, gwPoints: number[]][], closed = true): Month => ({
  gameweeks: rows[0]?.[1].map((_, i) => 6 + i) ?? [],
  rows: rows.map(([entryId, gwPoints]) => ({
    entryId,
    playerName: `Player ${entryId}`,
    teamName: `Team ${entryId}`,
    points: gwPoints.reduce((a, b) => a + b, 0),
    gwPoints,
  })),
  closed,
})

describe('leagueDate', () => {
  it('reads instants as Malawi calendar dates (UTC+2)', () => {
    expect(leagueDate('2026-09-30T21:59:00Z')).toBe('2026-09-30')
    expect(leagueDate('2026-09-30T22:00:00Z')).toBe('2026-10-01')
  })
})

describe('eligibility (rules 1.1–1.4, 5.1, 5.2)', () => {
  it('has no prize before October 2026', () => {
    expect(ineligibility(entry(1), '2026-09')).toBe('no-prize')
  })
  it('counts teams from before tracking, and unregistered teams, as eligible', () => {
    expect(ineligibility(entry(1), '2026-10')).toBeNull()
    expect(ineligibility(undefined, '2026-10')).toBeNull()
  })
  it('needs the team to have joined before the month began', () => {
    expect(ineligibility(entry(1, { joinedOn: '2026-09-30' }), '2026-10')).toBeNull()
    expect(ineligibility(entry(1, { joinedOn: '2026-10-01' }), '2026-10')).toBe('joined-in-month')
    expect(ineligibility(entry(1, { joinedOn: '2026-10-01' }), '2026-11')).toBeNull()
  })
  it('shuts out anyone joining after 22 October for good', () => {
    expect(ineligibility(entry(1, { joinedOn: '2026-10-22' }), '2026-11')).toBeNull()
    expect(ineligibility(entry(1, { joinedOn: '2026-10-23' }), '2026-11')).toBe('late-entry')
    expect(ineligibility(entry(1, { joinedOn: '2026-10-23' }), '2027-03')).toBe('late-entry')
  })
  it('applies season and single-month forfeits', () => {
    expect(ineligibility(entry(1, { seasonForfeit: true }), '2026-12')).toBe('season-forfeit')
    const e = entry(1, { forfeitMonths: ['2026-11'] })
    expect(ineligibility(e, '2026-11')).toBe('month-forfeit')
    expect(ineligibility(e, '2026-12')).toBeNull()
  })
})

describe('monthly winner (rules 2.1–2.3)', () => {
  it('goes to the most points', () => {
    const r = resolveMonth(
      '2026-10',
      month([
        [1, [50, 60]],
        [2, [70, 45]],
        [3, [40, 40]],
      ]),
      undefined,
    )
    expect(r.decision).toEqual({ by: 'points', entryId: 2 })
    expect(r.rows.map((x) => x.entryId)).toEqual([2, 1, 3])
    expect(r.final).toBe(true)
  })
  it('skips an ineligible top scorer', () => {
    const entries = new Map([[2, entry(2, { joinedOn: '2026-10-05' })]])
    const r = resolveMonth(
      '2026-10',
      month([
        [1, [50, 60]],
        [2, [70, 45]],
      ]),
      entries,
    )
    expect(r.decision).toEqual({ by: 'points', entryId: 1 })
    expect(r.rows[0]).toMatchObject({ entryId: 2, ineligible: 'joined-in-month' })
  })
  it('breaks a points tie on the best single gameweek', () => {
    const r = resolveMonth(
      '2026-10',
      month([
        [1, [55, 55]],
        [2, [80, 30]],
        [3, [10, 10]],
      ]),
      undefined,
    )
    expect(r.decision).toEqual({ by: 'best-gameweek', entryId: 2, tied: [2, 1] })
  })
  it('leaves a dead heat to a draw by lot', () => {
    const r = resolveMonth(
      '2026-10',
      month([
        [1, [80, 30]],
        [2, [30, 80]],
        [3, [80, 20]],
      ]),
      undefined,
    )
    expect(r.decision).toEqual({ by: 'lot', tied: [1, 2] })
  })
  it('has no winner when nobody is eligible', () => {
    const r = resolveMonth('2026-09', month([[1, [80, 30]]]), undefined)
    expect(r.decision).toEqual({ by: 'none' })
  })
  it('is provisional until FPL has processed the month', () => {
    expect(resolveMonth('2026-10', month([[1, [80]]], false), undefined).final).toBe(false)
  })
})

describe('prize hold (rule 4.3)', () => {
  it('lasts 60 days from the announcement', () => {
    expect(holdUntil('2026-11-02T10:00:00.000Z')).toBe('2027-01-01T10:00:00.000Z')
  })
})
