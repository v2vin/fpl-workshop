import type { GiftStatus } from '../data/gifts'

/** Display label and badge colours for each build status. */
export const GIFT_STATUS_STYLES: Record<GiftStatus, { label: string; className: string }> = {
  available: { label: 'Up for grabs', className: 'bg-stone-100 text-stone-700 ring-stone-300' },
  drawn: { label: 'Drawn', className: 'bg-pine-100 text-pine-800 ring-pine-300' },
  cut: { label: 'Cut', className: 'bg-sky-100 text-sky-800 ring-sky-300' },
  glued: { label: 'Glued up', className: 'bg-violet-100 text-violet-800 ring-violet-300' },
  finished: { label: 'Finished', className: 'bg-pitch-100 text-pitch-800 ring-pitch-300' },
  delivered: { label: 'Delivered', className: 'bg-pitch-700 text-pine-100 ring-pitch-800' },
}

export const statusLabel = (status: GiftStatus): string => GIFT_STATUS_STYLES[status].label
