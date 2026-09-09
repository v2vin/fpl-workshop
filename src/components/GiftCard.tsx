import type { Gift } from '../data/gifts'
import { formatMonth } from '../lib/format'
import StatusBadge from './StatusBadge'

export default function GiftCard({ gift }: { gift: Gift }) {
  const hero = gift.photos[0] ?? `/gifts/${gift.id}/hero.svg`
  const strip = gift.photos.slice(1)
  return (
    <li className="border-pine-200 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="relative">
        <img
          src={hero}
          alt={gift.name}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
        <span className="absolute top-2 left-2">
          <StatusBadge status={gift.status} />
        </span>
      </div>
      <div className="p-3">
        <h2 className="text-sm leading-tight font-semibold">{gift.name}</h2>
        <p className="mt-1 text-xs text-stone-600">{gift.blurb}</p>
        {gift.wonMonth && (
          <p className="text-pine-700 mt-1 text-xs font-medium">
            Won {formatMonth(gift.wonMonth)}
            {gift.wonByName ? ` by ${gift.wonByName}` : ''}
          </p>
        )}
        {strip.length > 0 && (
          <ul
            className="mt-2 flex gap-1 overflow-x-auto"
            aria-label={`Build photos of ${gift.name}`}
          >
            {strip.map((p) => (
              <li key={p} className="shrink-0">
                <img src={p} alt="" loading="lazy" className="h-12 w-16 rounded object-cover" />
              </li>
            ))}
          </ul>
        )}
        <details className="mt-2 text-xs text-stone-600">
          <summary className="text-pitch-700 cursor-pointer font-medium">Build notes</summary>
          <p className="mt-1">
            {gift.materials}. About {gift.hours} h in the workshop.
            {gift.boughtParts ? ` Bought in: ${gift.boughtParts}.` : ''}
          </p>
        </details>
      </div>
    </li>
  )
}
