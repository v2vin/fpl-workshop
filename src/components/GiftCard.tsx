import type { Gift } from '../data/gifts'
import { formatMonth } from '../lib/format'
import StatusBadge from './StatusBadge'

/**
 * A gift as the kit draws it: the photo uncropped on a pine ground with the status over it,
 * a "WORKSHOP / 01" label, name, one line, then progress photos and build notes.
 */
export default function GiftCard({
  gift,
  number,
  framed = false,
}: {
  gift: Gift
  /** Position in the catalogue, 1–18. Omit to hide the label. */
  number?: number
  /** White card with padding (reveal, cabinet) instead of the open catalogue style. */
  framed?: boolean
}) {
  const hero = gift.photos[0] ?? `/gifts/${gift.id}/hero.svg`
  const strip = gift.photos.slice(1)
  return (
    <article className={framed ? 'card overflow-hidden' : ''}>
      <div
        className={`relative overflow-hidden bg-pine-100 ${framed ? '' : 'rounded-xl border border-pine-200'}`}
      >
        <img
          src={hero}
          alt={gift.name}
          loading="lazy"
          className="aspect-[4/3] w-full object-contain"
        />
        <span className="absolute top-2 left-2">
          <StatusBadge status={gift.status} />
        </span>
      </div>
      <div className={framed ? 'p-4' : 'pt-3'}>
        {number !== undefined && (
          <p className="mb-1.5 font-mono text-[10px] tracking-[1px] text-pine-700">
            WORKSHOP / {String(number).padStart(2, '0')}
          </p>
        )}
        <h3
          className={`display leading-[1.13] tracking-[-0.55px] ${framed ? 'text-[22px]' : 'text-[17px]'}`}
        >
          {gift.name}
        </h3>
        <p className="mt-1 text-[13px] text-stone-700">{gift.blurb}</p>
        {gift.wonMonth && (
          <p className="mt-2 border-l-2 border-pine-400 pl-2 text-xs text-stone-600">
            Won {formatMonth(gift.wonMonth)}
            {gift.wonByName ? ` by ${gift.wonByName}` : ''}
          </p>
        )}
        {strip.length > 0 && (
          <ul
            className="mt-2.5 flex gap-1.5 overflow-x-auto"
            aria-label={`Build photos of ${gift.name}`}
          >
            {strip.map((p) => (
              <li key={p} className="shrink-0">
                <img
                  src={p}
                  alt=""
                  loading="lazy"
                  className="h-12 w-16 rounded bg-pine-100 object-contain"
                />
              </li>
            ))}
          </ul>
        )}
        <details className="mt-3 border-t border-pine-200 pt-2.5 text-xs text-stone-700">
          <summary className="flex min-h-8 cursor-pointer items-center font-semibold">
            Build notes
          </summary>
          <p className="mt-1.5 leading-relaxed">
            Solid pine · {gift.materials}
            <br />
            About {gift.hours} h · matt clear finish
            <br />
            Bought-in parts: {gift.boughtParts ?? 'none'}
          </p>
        </details>
      </div>
    </article>
  )
}
