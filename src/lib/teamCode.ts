// The team-name check (rule 4.2): a manager proves they control the FPL team they picked by adding
// "-FPL-<3 digits>" to its name on the FPL site, which only the account owner can do. Used by the
// app and by scripts/verify-teams.mjs, so it imports nothing.

/** FPL caps team names at 20 characters. */
export const TEAM_NAME_MAX = 20

/** "-FPL-433" */
export const teamTag = (code: string): string => `-FPL-${code}`

/** A random three-digit code, 100–999, so there is no leading zero to drop. */
export function newTeamCode(): string {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return String(100 + (buf[0] % 900))
}

const squash = (s: string) => s.replace(/\s+/g, '').toLowerCase()

/** True when the team name carries the code: anywhere, any case, spaces ignored. */
export function hasTeamTag(teamName: string, code: string): boolean {
  if (!/^[0-9]{3}$/.test(code)) return false
  // Not followed by another digit, so "-FPL-4330" is not code 433.
  return new RegExp(`${squash(teamTag(code))}(?![0-9])`).test(squash(teamName))
}

/** "Soya Pieces-FPL-433": the current name with the tag, shortened to fit FPL's limit. */
export function suggestedTeamName(teamName: string, code: string): string {
  const tag = teamTag(code)
  return teamName.slice(0, TEAM_NAME_MAX - tag.length).trimEnd() + tag
}
