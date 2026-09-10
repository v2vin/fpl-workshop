import type { GiftStatus } from '../data/gifts'
import { GIFT_STATUS_STYLES } from '../lib/giftStatus'

export default function StatusBadge({ status }: { status: GiftStatus }) {
  const s = GIFT_STATUS_STYLES[status]
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${s.className}`}
    >
      {s.label}
    </span>
  )
}
