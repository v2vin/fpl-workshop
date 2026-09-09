import { useEffect, useState } from 'react'
import { gifts as seedGifts, type Gift } from '../data/gifts'
import { watchGifts } from './gifts'

interface GiftsState {
  gifts: Gift[]
  /** False until the Firestore collection has been seeded; seed data is shown meanwhile. */
  live: boolean
  loading: boolean
}

export function useGifts(): GiftsState {
  const [state, setState] = useState<Omit<GiftsState, 'loading'> | null>(null)
  useEffect(() => watchGifts((gifts, live) => setState({ gifts, live })), [])
  return state ? { ...state, loading: false } : { gifts: seedGifts, live: false, loading: true }
}
