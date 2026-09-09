/** "2026-09" → "September 2026". */
export function formatMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number)
  if (!y || !m) return yyyyMm
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** "just now", "5 min ago", "3 hours ago", "2 days ago". */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'some time ago'
  const mins = Math.max(0, Math.round((now.getTime() - then) / 60_000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

/** "2d 14h", "3h 12m", "45m", or null once the moment has passed. */
export function formatCountdown(iso: string, now: Date = new Date()): string | null {
  const ms = new Date(iso).getTime() - now.getTime()
  if (Number.isNaN(ms) || ms <= 0) return null
  const mins = Math.floor(ms / 60_000)
  const days = Math.floor(mins / 1440)
  const hours = Math.floor((mins % 1440) / 60)
  const rest = mins % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${rest}m`
  return `${Math.max(1, rest)}m`
}

/** "Sat 12 Sep, 14:30" in the reader's local time. */
export function formatDeadline(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
