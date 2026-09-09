// Non-secret configuration. See CLAUDE.md, "Configuration the owner must supply".

/** Firebase Auth uid of the owner (Vitumbiko). Must match ownerUid() in firestore.rules. */
export const OWNER_UID = 'ixlVRwiaMsRS2DTweHSzXOMcgh52'

/** FPL classic mini-league id, from the league URL on fantasy.premierleague.com. */
export const FPL_LEAGUE_ID = 1955077

export const SEASON = '2026-27'

export const LEAGUE_NAME = 'FPL Workshop'

export const WORKSHOP_NAME = 'VMS Woodwork'

/** Hosting URL shared with the league. Also the authDomain; see src/lib/firebase.ts. */
export const SITE_URL = 'https://fpl-workshop.web.app'
