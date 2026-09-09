import { useEffect, useState } from 'react'
import { watchCodes, type Code } from './draw'

/** Every issued code, live. Owner only (rules). `undefined` while loading. */
export function useCodes(): Code[] | undefined {
  const [list, setList] = useState<Code[] | undefined>(undefined)
  useEffect(() => watchCodes(setList), [])
  return list
}
