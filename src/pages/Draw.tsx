import { useCallback, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import GiftCard from '../components/GiftCard'
import Notice from '../components/Notice'
import Page from '../components/Page'
import ShareButton from '../components/ShareButton'
import Shuffle from '../components/Shuffle'
import SignInButton from '../components/SignInButton'
import { giftById, type Gift } from '../data/gifts'
import { useAuth } from '../lib/auth'
import { DrawError, lookupCode, redeemCode, shareText, type Code } from '../lib/draw'
import { formatMonth } from '../lib/format'
import { useGifts } from '../lib/useGifts'

type Phase = 'idle' | 'looking' | 'shuffle' | 'reveal' | 'already'

/** Pine ground with the workshop stamp, standing in until real photography exists. */
function WorkshopObject() {
  return (
    <div className="relative -mx-4 mt-5 bg-pine-100">
      <div className="grid aspect-[4/3] w-full place-items-center">
        <img src="/brand/mark.svg" alt="" className="h-28 w-28 opacity-90" />
      </div>
      <span className="absolute right-3.5 bottom-3.5 rotate-[-4deg] border border-pine-600 bg-pine-50 px-2.5 py-1.5 text-[9px] leading-[1.7] tracking-[1px] text-pine-800">
        MADE BY HAND
        <br />
        <b>VMS WOODWORK</b>
      </span>
    </div>
  )
}

export default function Draw() {
  const { user, loading } = useAuth()
  const { gifts } = useGifts()
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [code, setCode] = useState<Code | null>(null)
  const [shuffleGifts, setShuffleGifts] = useState<Gift[]>([])
  const [error, setError] = useState<string | null>(null)
  const [redeemNote, setRedeemNote] = useState<string | null>(null)

  const gift = code ? (gifts.find((g) => g.id === code.giftId) ?? giftById(code.giftId)) : undefined

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPhase('looking')
    try {
      const found = await lookupCode(input)
      setCode(found)
      if (found.redeemed) {
        setPhase('already')
      } else {
        setShuffleGifts(gifts) // frozen copy so a live update cannot restart the shuffle
        setPhase('shuffle')
      }
    } catch (err) {
      if (!(err instanceof DrawError)) console.error(err)
      setError(err instanceof DrawError ? err.message : 'Something went wrong. Try again.')
      setPhase('idle')
    }
  }

  const onShuffleDone = useCallback(() => {
    setPhase('reveal')
    if (!code) return
    redeemCode(code.code).catch((err: unknown) => {
      if (err instanceof DrawError && err.kind === 'already-redeemed') return
      console.error(err)
      setRedeemNote('The gift is yours, but the code could not be marked as used. Tell Vitumbiko.')
    })
  }, [code])

  function reset() {
    setInput('')
    setCode(null)
    setError(null)
    setRedeemNote(null)
    setPhase('idle')
  }

  if (loading) return <Page title="Now for the good wood." />

  if (!user) {
    return (
      <Page title="Won the month?" intro="There’s something on the bench for you.">
        <WorkshopObject />
        <div className="card p-4">
          <h2 className="display text-xl">Your gift starts here</h2>
          <p className="mt-1 mb-4 text-sm text-stone-600">
            Sign in with the Google account you gave Vitumbiko, then enter your winner’s code.
          </p>
          <SignInButton variant="card" />
        </div>
        <p className="text-xs text-stone-600">Only the manager named on the code can reveal it.</p>
      </Page>
    )
  }

  if (phase === 'shuffle' && code) {
    return (
      <section>
        <Shuffle gifts={shuffleGifts} finalGiftId={code.giftId} onDone={onShuffleDone} />
      </section>
    )
  }

  if ((phase === 'reveal' || phase === 'already') && code && gift) {
    const firstName = (user.displayName ?? 'you').split(' ')[0]
    return (
      <section className="space-y-4">
        {phase === 'already' && (
          <Notice>You’ve already revealed this gift. It’s still yours.</Notice>
        )}
        <div>
          <span className="mt-1 mb-5 inline-block rotate-[-2deg] bg-pine-200 px-2 py-1 text-[10px] font-bold tracking-[1.2px] text-pine-800">
            A MONTH WELL PLAYED
          </span>
          <p className="eyebrow text-[10px]">{formatMonth(code.month)} winner</p>
          <h1 className="display mt-2 text-[36px] leading-[1.04] tracking-[-1.7px] text-pitch-900">
            Nice one, {firstName}.
          </h1>
          <p className="mt-3 text-sm text-stone-600">A little something for your shelf.</p>
        </div>
        <GiftCard gift={gift} framed />
        <ShareButton text={shareText(gift, code.month)} className="w-full" />
        <Link to="/cabinet" className="btn btn-text w-full">
          See your cabinet →
        </Link>
        {redeemNote && <Notice error>{redeemNote}</Notice>}
        {phase === 'already' && (
          <button type="button" onClick={reset} className="btn btn-text w-full">
            Enter another code
          </button>
        )}
      </section>
    )
  }

  const checking = phase === 'looking'
  return (
    <Page
      eyebrow="The month is yours"
      title={
        <>
          Now for the
          <br />
          good wood.
        </>
      }
      intro="One code. Something to keep."
    >
      <WorkshopObject />
      <form onSubmit={onSubmit} className="pt-2">
        <h2 className="display text-2xl">Got your code?</h2>
        <p className="mt-1 text-sm text-stone-600">
          Vitumbiko sends it to the monthly winner on WhatsApp.
        </p>
        <label htmlFor="code" className="label">
          Your winner’s code
        </label>
        <input
          id="code"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="FPLW-SEP26-7F3K"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="input border-b-[3px] border-pine-600 font-mono text-lg tracking-wider uppercase"
        />
        {error && <Notice error>{error}</Notice>}
        <button
          type="submit"
          disabled={checking || input.trim().length < 14}
          className="btn btn-primary mt-5 w-full"
        >
          {checking ? 'Checking your code…' : 'Reveal my gift →'}
        </button>
        <p className="mt-4 text-xs text-stone-600">
          Your gift is already chosen. The shuffle is for show.
        </p>
      </form>
    </Page>
  )
}
