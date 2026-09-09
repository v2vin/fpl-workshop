// Types for the documents written by scripts/fetch-fpl.mjs (CLAUDE.md, "Firestore data model").
// Read-only in the browser: the GitHub Action is the only writer.

export interface StandingsRow {
  entryId: number
  playerName: string
  teamName: string
  eventPoints: number
  totalPoints: number
  rank: number
  lastRank: number
}

/** `standings/current` */
export interface Standings {
  /** ISO string, UTC. */
  updatedAt: string
  /** Latest gameweek whose deadline has passed; 0 before the season starts. */
  gameweek: number
  nextGameweek: number | null
  /** ISO string, UTC; null once the season is over. */
  nextDeadline: string | null
  leagueName: string
  rows: StandingsRow[]
}

export interface MonthRow {
  entryId: number
  playerName: string
  /** Net points across the month's gameweeks, after transfer costs. */
  points: number
}

/** `months/{YYYY-MM}` — rows sorted by points, then season total. */
export interface Month {
  gameweeks: number[]
  rows: MonthRow[]
  /** True once every gameweek in the month is finished. */
  closed: boolean
}
