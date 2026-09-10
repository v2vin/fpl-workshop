import type { GiftStatus } from '../data/gifts'

/** Display label and badge colours for each build status (design kit "Status" sheet). */
export const GIFT_STATUS_STYLES: Record<GiftStatus, { label: string; className: string }> = {
  available: { label: 'Up for grabs', className: 'bg-stone-100 text-stone-600' },
  drawn: { label: 'Drawn', className: 'bg-pine-100 text-pine-800' },
  cut: { label: 'Cut', className: 'bg-sky-100 text-sky-900' },
  glued: { label: 'Glued up', className: 'bg-violet-100 text-violet-900' },
  finished: { label: 'Finished', className: 'bg-pitch-100 text-pitch-700' },
  delivered: { label: 'Delivered', className: 'bg-pitch-800 text-pine-100' },
}

export const statusLabel = (status: GiftStatus): string => GIFT_STATUS_STYLES[status].label
