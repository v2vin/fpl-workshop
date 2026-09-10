import { useEffect, useState } from 'react'
import type { Gift } from '../data/gifts'
import { shuffleDelay, shuffleSequence } from '../lib/draw'

/**
 * The shuffle is theatre: the gift was chosen when the owner issued the code. Tiles light up at
 * random, slow down and land on the one already drawn, then onDone fires. With reduced motion
 * preferred it lands straight away.
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
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const seq = reduce ? [finalIndex] : shuffleSequence(gifts.length, finalIndex)
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
      <h1 className="display text-[30px] leading-[1.04] tracking-[-1.25px] text-pitch-900">
        From the workshop…
      </h1>
      <p className="mt-2 text-sm text-stone-600">Let’s see what’s heading to your shelf.</p>
      <ul className="mt-5 grid grid-cols-3 gap-[7px]">
        {gifts.map((g, i) => (
          <li
            key={g.id}
            className={`grid min-h-[66px] place-items-center rounded-lg border border-b-[3px] border-pine-200 px-1.5 py-1.5 text-center text-[11px] leading-tight transition-colors duration-100 ${
              i === active
                ? 'bg-pine-300 text-pitch-900 outline-2 outline-pitch-700'
                : 'bg-white text-stone-700'
            }`}
          >
            <span>
              <span className="mx-auto mb-1.5 block h-[5px] w-[17px] bg-pine-300" />
              {g.name}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-stone-600">
        Your gift is already chosen. This is the fun bit.
      </p>
    </div>
  )
}
