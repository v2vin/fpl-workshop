import { useEffect, useState } from 'react'
import type { Gift } from '../data/gifts'
import { shuffleDelay, shuffleSequence } from '../lib/draw'

/**
 * The shuffle is theatre: the gift was chosen when the owner issued the code. This lights up
 * cards at random, slows down and lands on the one already drawn, then calls onDone.
 */
export default function Shuffle({
  gifts,
  finalGiftId,
  onDone,
}: {
  gifts: Gift[]
  finalGiftId: string
  onDone: () => void
}) {
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const finalIndex = Math.max(
      0,
      gifts.findIndex((g) => g.id === finalGiftId),
    )
    const seq = shuffleSequence(gifts.length, finalIndex)
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const step = () => {
      setActive(seq[i])
      i += 1
      timer =
        i < seq.length ? setTimeout(step, shuffleDelay(i, seq.length)) : setTimeout(onDone, 900)
    }
    timer = setTimeout(step, 400)
    return () => clearTimeout(timer)
  }, [gifts, finalGiftId, onDone])

  return (
    <div aria-live="polite">
      <p className="text-pitch-800 mb-3 text-center text-sm font-medium">Drawing…</p>
      <ul className="grid grid-cols-3 gap-2">
        {gifts.map((g, i) => (
          <li
            key={g.id}
            className={`overflow-hidden rounded-lg border transition-all duration-150 ${
              i === active
                ? 'border-pine-500 ring-pine-300 scale-105 ring-4'
                : 'border-pine-200 opacity-60'
            }`}
          >
            <img
              src={g.photos[0] ?? `/gifts/${g.id}/hero.svg`}
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
