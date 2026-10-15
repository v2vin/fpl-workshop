// Non-secret configuration. See CLAUDE.md, "Configuration the owner must supply".

/** Firebase Auth uid of the owner (Vitumbiko). Must match ownerUid() in firestore.rules. */
export const OWNER_UID: string = 'ixlVRwiaMsRS2DTweHSzXOMcgh52'

/** FPL classic mini-league id, from the league URL on fantasy.premierleague.com. */
export const FPL_LEAGUE_ID = 1955077

export const SEASON = '2026-27'

export const LEAGUE_NAME = 'FPL Workshop'

/** Who makes the prizes and runs the competition, as the prize rules name it. */
export const WORKSHOP_NAME = 'FPL Workshop'

/** Hosting URL shared with the league. Also the authDomain; see src/lib/firebase.ts. */
export const SITE_URL = 'https://fpl-workshop.web.app'

// Prize rules (src/data/rules.ts). Dates are calendar dates in Malawi.

/** Every date in the rules is read in Malawi time (CAT, UTC+2, no daylight saving). */
export const LEAGUE_TIME_ZONE = 'Africa/Blantyre'

/** "YYYY-MM" of the first month with a prize. Earlier months are shown but win nothing. */
export const FIRST_PRIZE_MONTH = '2026-10'

/** Last day a new entry is accepted (rule 1.3). Anyone joining later is never eligible. */
export const ENTRIES_CLOSE = '2026-10-22'

/** Days a prize is held from the announcement before it goes back into the pool (rule 4.3). */
export const PRIZE_HOLD_DAYS = 60
