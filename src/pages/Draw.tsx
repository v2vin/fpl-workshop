import { useCallback, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
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
      setRedeemNote('The gift is yours, but the code could not be marked as used. Tell the owner.')
    })
  }, [code])

  function reset() {
    setInput('')
    setCode(null)
    setError(null)
    setRedeemNote(null)
    setPhase('idle')
  }

  const intro = 'Won the month? Enter your code and see what is coming out of the workshop.'
  if (loading) return <Page title="The draw" intro={intro} />
  if (!user) {
    return (
      <Page title="The draw" intro={intro}>
        <Notice>
          <p className="mb-3">Sign in with the account you gave the owner to enter your code.</p>
          <SignInButton />
        </Notice>
      </Page>
    )
  }

  if (phase === 'shuffle' && code) {
    return (
      <Page title="The draw">
        <Shuffle gifts={shuffleGifts} finalGiftId={code.giftId} onDone={onShuffleDone} />
      </Page>
    )
  }

  if ((phase === 'reveal' || phase === 'already') && code && gift) {
    return (
      <Page title={phase === 'reveal' ? 'It’s yours' : 'Already revealed'}>
        {phase === 'already' && (
          <Notice>This code has been used already. Here is what it won.</Notice>
        )}
        <div className="border-pine-400 overflow-hidden rounded-2xl border-2 bg-white shadow-md">
          <img
            src={gift.photos[0] ?? `/gifts/${gift.id}/hero.svg`}
            alt={gift.name}
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="p-4">
            <p className="text-pine-700 text-xs font-semibold tracking-wide uppercase">
              {formatMonth(code.month)} winner
            </p>
            <h2 className="text-pitch-900 mt-1 text-2xl font-bold">{gift.name}</h2>
            <p className="mt-1 text-stone-700">{gift.blurb}</p>
            <p className="mt-2 text-xs text-stone-500">
              {gift.materials}. About {gift.hours} h in the workshop. Watch it being built on the
              Gifts page.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ShareButton text={shareText(gift, code.month)} />
              <Link to="/cabinet" className="text-pitch-700 text-sm font-medium underline">
                See your cabinet
              </Link>
            </div>
            {redeemNote && <p className="mt-3 text-sm text-red-700">{redeemNote}</p>}
          </div>
        </div>
        {phase === 'already' && (
          <button type="button" onClick={reset} className="text-pitch-700 text-sm underline">
            Enter another code
          </button>
        )}
      </Page>
    )
  }

  return (
    <Page title="The draw" intro={intro}>
      <form
        onSubmit={onSubmit}
        className="border-pine-200 rounded-xl border bg-white p-4 shadow-sm"
      >
        <label htmlFor="code" className="block text-sm font-medium text-stone-700">
          Your code
        </label>
        <input
          id="code"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="FPLW-SEP26-7F3K"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-lg tracking-wider"
        />
        <button
          type="submit"
          disabled={phase === 'looking' || input.trim().length < 14}
          className="bg-pitch-700 mt-3 w-full rounded-lg px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {phase === 'looking' ? 'Checking' : 'Reveal my gift'}
        </button>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </form>
    </Page>
  )
}
