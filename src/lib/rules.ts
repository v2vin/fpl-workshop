// The prize rules (src/data/rules.ts) as pure functions: who is eligible for a month, who wins it,
// and how long a prize is held. No Firebase here, so test/prize-rules.test.ts runs without the
// emulator.
import { ENTRIES_CLOSE, FIRST_PRIZE_MONTH, LEAGUE_TIME_ZONE, PRIZE_HOLD_DAYS } from './config'
import type { Entry } from './entries'
import type { Month, MonthRow } from './fpl'

/** "YYYY-MM-DD" of an instant, as a calendar date in Malawi. */
export function leagueDate(at: string | Date): string {
  const d = typeof at === 'string' ? new Date(at) : at
  // en-CA formats dates as YYYY-MM-DD.
  return d.toLocaleDateString('en-CA', { timeZone: LEAGUE_TIME_ZONE })
}

export const isPrizeMonth = (month: string): boolean => month >= FIRST_PRIZE_MONTH

/** Why a team cannot win a given month. */
export type Ineligible =
  | 'no-prize' // before the first prize month
  | 'late-entry' // joined after entries closed (rule 1.3)
  | 'season-forfeit' // rule 1.4 or 5.1
  | 'joined-in-month' // joined on or after the 1st of the month (rule 1.1)
  | 'month-forfeit' // rule 5.2

export const INELIGIBLE_LABELS: Record<Ineligible, string> = {
  'no-prize': 'No prize this month',
  'late-entry': 'Joined after entries closed',
  'season-forfeit': 'Out of contention this season',
  'joined-in-month': 'Joined after the month began',
  'month-forfeit': 'Out of contention this month',
}

/**
 * Null when the team can win `month`. A team the sync has not registered yet counts as joined
 * before tracking began, like `joinedOn: null`.
 */
export function ineligibility(entry: Entry | undefined, month: string): Ineligible | null {
  if (!isPrizeMonth(month)) return 'no-prize'
  const joined = entry?.joinedOn ?? null
  if (joined !== null && joined > ENTRIES_CLOSE) return 'late-entry'
  if (entry?.seasonForfeit) return 'season-forfeit'
  if (joined !== null && joined >= `${month}-01`) return 'joined-in-month'
  if (entry?.forfeitMonths.includes(month)) return 'month-forfeit'
  return null
}

export interface RankedRow extends MonthRow {
  /** Highest single-gameweek score this month, for the tie-break. */
  bestGw: number
  ineligible: Ineligible | null
}

export type Decision =
  /** Nobody eligible, or no points yet. */
  | { by: 'none' }
  /** Clear on points (rule 2.1). */
  | { by: 'points'; entryId: number }
  /** Level on points, separated by the best single gameweek (rule 2.3). */
  | { by: 'best-gameweek'; entryId: number; tied: number[] }
  /** Still level: the owner draws lots between `tied` (rule 2.3). */
  | { by: 'lot'; tied: number[] }

export interface MonthResult {
  /** Every team: points, then best gameweek, then name. */
  rows: RankedRow[]
  /** The leader (or the winner, once `final`). */
  decision: Decision
  /** FPL has processed every gameweek, so the decision stands (rule 2.2). */
  final: boolean
}

const best = (gwPoints: number[]) => (gwPoints.length ? Math.max(...gwPoints) : 0)

export function resolveMonth(
  monthId: string,
  month: Month,
  entries: ReadonlyMap<number, Entry> | undefined,
): MonthResult {
  const rows: RankedRow[] = month.rows
    .map((r) => ({
      ...r,
      bestGw: best(r.gwPoints),
      ineligible: ineligibility(entries?.get(r.entryId), monthId),
    }))
    .sort(
      (a, b) =>
        b.points - a.points || b.bestGw - a.bestGw || a.playerName.localeCompare(b.playerName),
    )

  const eligible = rows.filter((r) => r.ineligible === null)
  let decision: Decision = { by: 'none' }
  if (eligible.length > 0 && month.gameweeks.length > 0) {
    const top = eligible[0].points
    const level = eligible.filter((r) => r.points === top)
    if (level.length === 1) {
      decision = { by: 'points', entryId: level[0].entryId }
    } else {
      const tied = level.map((r) => r.entryId)
      const topGw = level[0].bestGw
      const stillLevel = level.filter((r) => r.bestGw === topGw)
      decision =
        stillLevel.length === 1
          ? { by: 'best-gameweek', entryId: stillLevel[0].entryId, tied }
          : { by: 'lot', tied: stillLevel.map((r) => r.entryId) }
    }
  }
  return { rows, decision, final: month.closed }
}

/** The single leader or winner, if there is one without drawing lots. */
export function decidedEntry(decision: Decision): number | null {
  return decision.by === 'points' || decision.by === 'best-gameweek' ? decision.entryId : null
}

const DAY_MS = 86_400_000

/** ISO instant a prize stops being held: the announcement plus 60 days (rule 4.3). */
export function holdUntil(announcedAt: string): string {
  return new Date(new Date(announcedAt).getTime() + PRIZE_HOLD_DAYS * DAY_MS).toISOString()
}

/** Entries are still open on `now`'s date in Malawi (rule 1.3). */
export const entriesOpen = (now: Date = new Date()): boolean => leagueDate(now) <= ENTRIES_CLOSE
