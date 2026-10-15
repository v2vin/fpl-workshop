import { useState } from 'react'
import Notice from './Notice'
import { giveTeamCode, type Claim } from '../lib/claims'
import { WORKSHOP_NAME } from '../lib/config'
import { TEAM_NAME_MAX, suggestedTeamName, teamTag } from '../lib/teamCode'

const LATER_KEY = 'fplw-verify-later'

/**
 * Asks a manager whose claim is not confirmed yet to prove the team is theirs (rule 4.2): put
 * their code in the team's FPL name. scripts/verify-teams.mjs spots it and confirms the claim.
 */
export default function VerifyTeam({
  claim,
  teamName,
  allowLater = true,
}: {
  claim: Claim
  teamName: string
  allowLater?: boolean
}) {
  const [later, setLater] = useState(() => {
    try {
      return sessionStorage.getItem(LATER_KEY) === '1'
    } catch {
      return false
    }
  })
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (claim.verified || (later && allowLater)) return null

  function dismiss() {
    try {
      sessionStorage.setItem(LATER_KEY, '1')
    } catch {
      // Private mode: the card simply returns next visit.
    }
    setLater(true)
  }

  const laterButton = allowLater && (
    <button type="button" onClick={dismiss} className="btn btn-text mt-1 w-full">
      Later
    </button>
  )

  if (!claim.verifyCode) {
    return (
      <section className="card mb-5 p-4">
        <p className="eyebrow">Prove it’s your team</p>
        <p className="mt-2 text-sm text-stone-600">
          Get a short code to add to your FPL team name. The app confirms you as soon as it sees it.
        </p>
        {error && <p className="mt-2 text-sm text-pine-800">{error}</p>}
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true)
            setError(null)
            giveTeamCode(claim.entryId)
              .catch((err: unknown) => {
                console.error(err)
                setError('That did not work. Try again.')
              })
              .finally(() => setBusy(false))
          }}
          className="btn btn-primary mt-4 w-full"
        >
          {busy ? 'Getting your code…' : 'Get my code'}
        </button>
        {laterButton}
      </section>
    )
  }

  const tag = teamTag(claim.verifyCode)
  const suggestion = suggestedTeamName(teamName, claim.verifyCode)
  const shortened = teamName !== '' && !suggestion.startsWith(teamName)

  function copy() {
    navigator.clipboard
      ?.writeText(suggestion)
      .then(() => setCopied(true))
      .catch(() => {
        // No clipboard access: the name is selectable as well.
      })
  }

  return (
    <section className="card mb-5 p-4">
      <p className="eyebrow">Prove it’s your team</p>
      <h2 className="display mt-2 text-xl">Add {tag} to your team name</h2>
      <p className="mt-1 text-sm text-stone-600">
        In the FPL app or on the FPL site, rename your team to:
      </p>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-pine-300 bg-pine-50 py-2 pr-2 pl-3">
        <code className="min-w-0 flex-1 truncate font-mono text-base font-bold select-all">
          {suggestion}
        </code>
        <button type="button" onClick={copy} className="btn min-h-9 shrink-0 px-3 py-1 text-sm">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {shortened && (
        <p className="mt-1.5 text-xs text-stone-600">
          FPL allows {TEAM_NAME_MAX} characters, so this is shortened. Any name with {tag} in it
          works.
        </p>
      )}
      <p className="mt-3 text-sm text-stone-600">
        The app checks about every 10 minutes and confirms you on its own. Once you’re confirmed,
        change the name back.
      </p>
      {claim.nameChangeBlocked ? (
        <Notice>
          FPL isn’t letting this team change its name at the moment. Send {WORKSHOP_NAME} a
          screenshot from your logged-in FPL account instead.
        </Notice>
      ) : (
        <p className="mt-2 text-xs text-stone-600">
          Can’t rename it? A screenshot from your logged-in FPL account to {WORKSHOP_NAME} works
          too.
        </p>
      )}
      {laterButton}
    </section>
  )
}
