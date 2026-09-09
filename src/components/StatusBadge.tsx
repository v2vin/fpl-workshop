import type { GiftStatus } from '../data/gifts'
import { GIFT_STATUS_STYLES } from '../lib/giftStatus'

export default function StatusBadge({ status }: { status: GiftStatus }) {
  const s = GIFT_STATUS_STYLES[status]
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${s.className}`}
    >
      {s.label}
    </span>
  )
}
