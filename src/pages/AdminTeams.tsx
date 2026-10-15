import { useState } from 'react'
import { Link } from 'react-router'
import Badge from '../components/Badge'
import Notice from '../components/Notice'
import Page from '../components/Page'
import { adoptLink, releaseTeam, setClaimVerified, type Claim } from '../lib/claims'
import { FIRST_PRIZE_MONTH } from '../lib/config'
import { updateEntry, type Entry, type EntryPatch } from '../lib/entries'
import type { StandingsRow } from '../lib/fpl'
import { formatMonth } from '../lib/format'
import type { ManagerWithUid } from '../lib/managers'
import { INELIGIBLE_LABELS, ineligibility, isPrizeMonth } from '../lib/rules'
import { useClaims } from '../lib/useClaims'
import { useEntries } from '../lib/useEntries'
import { useStandings } from '../lib/useFpl'
import { useManagers } from '../lib/useManagers'

/** Runs one owner write at a time per card, with a shared error line. */
function useRun() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      console.error(err)
      setError('That did not save. Are you signed in as the owner?')
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, run }
}

function TeamCard({
  row,
  entry,
  claim,
  manager,
  month,
}: {
  row: StandingsRow
  entry: Entry | undefined
  claim: Claim | undefined
  manager: ManagerWithUid | undefined
  month: string
}) {
  const { busy, error, run } = useRun()
  const status = ineligibility(entry, month)
  const save = (patch: EntryPatch) => run(() => updateEntry(row.entryId, patch))
  const monthOut = entry?.forfeitMonths.includes(month) ?? false
  const id = row.entryId

  return (
    <li className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="display truncate text-lg">{row.playerName}</h2>
          <p className="truncate text-sm text-stone-600">{row.teamName}</p>
        </div>
        <Badge tone={status ? 'pine' : 'live'}>
          {status ? INELIGIBLE_LABELS[status] : `Eligible, ${formatMonth(month)}`}
        </Badge>
      </div>

      <div className="mt-3 border-t border-pine-200 pt-3 text-sm">
        {claim ? (
          <>
            <p>
              Picked by <b>{manager?.displayName ?? 'an unknown account'}</b>
              {manager?.hideName && <span className="text-stone-600"> · not to be named</span>}
            </p>
            <label className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={claim.verified}
                disabled={busy}
                onChange={(e) => void run(() => setClaimVerified(id, e.target.checked))}
              />
              Confirmed: they showed they control this team (rule 4.2)
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Unlink ${row.playerName}'s team from this account?`))
                  void run(() => releaseTeam(claim.uid, id))
              }}
              className="btn btn-text text-sm"
            >
              Release this team
            </button>
          </>
        ) : (
          <p className="text-stone-600">Nobody has picked this team in the app yet.</p>
        )}
      </div>

      {entry ? (
        <div className="mt-2 border-t border-pine-200 pt-1 text-sm">
          <label htmlFor={`joined-${id}`} className="label">
            Joined the league (rule 1.1)
          </label>
          <input
            id={`joined-${id}`}
            type="date"
            value={entry.joinedOn ?? ''}
            disabled={busy}
            onChange={(e) => void save({ joinedOn: e.target.value || null })}
            className="input"
          />
          <p className="mt-1 text-xs text-stone-600">
            {entry.joinedOn
              ? 'Clear it if they were already in the league before October.'
              : 'Blank: already in the league before join dates were tracked, so eligible from October.'}
          </p>
          <label className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={entry.seasonForfeit}
              disabled={busy}
              onChange={(e) => void save({ seasonForfeit: e.target.checked })}
            />
            Out for the season: duplicate or shared entry, or an FPL sanction (rules 1.4, 5.1)
          </label>
          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={monthOut}
              disabled={busy}
              onChange={(e) =>
                void save({
                  forfeitMonths: e.target.checked
                    ? [...(entry.forfeitMonths ?? []), month]
                    : entry.forfeitMonths.filter((m) => m !== month),
                })
              }
            />
            Out for {formatMonth(month)}: conduct (rule 5.2)
          </label>
          {entry.forfeitMonths.filter((m) => m !== month).length > 0 && (
            <p className="mt-1 text-xs text-stone-600">
              Also out for:{' '}
              {entry.forfeitMonths
                .filter((m) => m !== month)
                .map(formatMonth)
                .join(', ')}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-stone-600">
          Not in the team register yet; it appears after the next FPL sync.
        </p>
      )}
      {error && <Notice error>{error}</Notice>}
    </li>
  )
}

/** Accounts linked to a team by typing its id, before team claims existed. */
function LegacyLinks({
  managers,
  claims,
  rows,
}: {
  managers: ManagerWithUid[]
  claims: Map<number, Claim>
  rows: StandingsRow[]
}) {
  const { busy, error, run } = useRun()
  const legacy = managers.filter(
    (m) => m.fplEntryId !== null && claims.get(m.fplEntryId)?.uid !== m.uid,
  )
  if (legacy.length === 0) return null
  return (
    <section className="card p-4">
      <h2 className="display text-xl">Links to check</h2>
      <p className="mt-1 text-sm text-stone-600">
        These accounts typed a team id before team picking existed. Confirm the ones you know are
        right; clear the rest and they can pick again.
      </p>
      <ul className="mt-3 space-y-3 text-sm">
        {legacy.map((m) => {
          const id = m.fplEntryId as number
          const row = rows.find((r) => r.entryId === id)
          const rival = claims.get(id)
          const rivalName = rival ? managers.find((x) => x.uid === rival.uid)?.displayName : null
          return (
            <li key={m.uid} className="border-t border-pine-200 pt-3">
              <b>{m.displayName}</b> → {row ? `${row.playerName} · ${row.teamName}` : `team ${id}`}
              {!row && <span className="text-pine-800"> (not in the league)</span>}
              {rival && (
                <span className="text-pine-800">
                  {' '}
                  (also picked by {rivalName ?? 'another account'})
                </span>
              )}
              <div className="mt-2 flex gap-2">
                {row && !rival && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void run(() => adoptLink(m.uid, id))}
                    className="btn btn-primary min-h-9 px-3 py-1 text-sm"
                  >
                    Confirm link
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run(() => releaseTeam(m.uid, id, false))}
                  className="btn min-h-9 px-3 py-1 text-sm"
                >
                  Clear link
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      {error && <Notice error>{error}</Notice>}
    </section>
  )
}

// Reached only through <RequireOwner>.
export default function AdminTeams() {
  const standings = useStandings()
  const entries = useEntries()
  const claims = useClaims(true)
  const managers = useManagers()

  const current = standings?.currentMonth ?? FIRST_PRIZE_MONTH
  const month = isPrizeMonth(current) ? current : FIRST_PRIZE_MONTH
  const rows = [...(standings?.rows ?? [])].sort((a, b) => a.playerName.localeCompare(b.playerName))
  const linked = rows.filter((r) => claims?.has(r.entryId)).length
  const confirmed = rows.filter((r) => claims?.get(r.entryId)?.verified).length

  return (
    <Page title="Teams" intro="Who plays which team, and who can win.">
      {!standings || !entries || !claims || !managers ? (
        <p className="text-sm text-stone-600">Loading…</p>
      ) : (
        <>
          <Notice>
            {linked} of {rows.length} teams picked in the app, {confirmed} confirmed. Eligibility is
            shown for {formatMonth(month)}.
          </Notice>
          <LegacyLinks managers={managers} claims={claims} rows={rows} />
          <ul className="space-y-4">
            {rows.map((r) => {
              const claim = claims.get(r.entryId)
              return (
                <TeamCard
                  key={r.entryId}
                  row={r}
                  entry={entries.get(r.entryId)}
                  claim={claim}
                  manager={claim ? managers.find((m) => m.uid === claim.uid) : undefined}
                  month={month}
                />
              )
            })}
          </ul>
        </>
      )}
      <Link to="/admin" className="btn btn-text">
        ← Back to the desk
      </Link>
    </Page>
  )
}
