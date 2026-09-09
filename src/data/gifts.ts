// The 18 gifts. Seed data: mirrors the `gifts/{giftId}` documents in Firestore (see CLAUDE.md).
// All solid Raiply pine, matt clear finish unless noted. Dimensions in mm, T × W × L.

export type GiftStatus = 'available' | 'drawn' | 'cut' | 'glued' | 'finished' | 'delivered'

export interface Gift {
  /** Document id in Firestore and folder name under /public/gifts/. */
  id: string
  name: string
  /** One line, shown on the card. */
  blurb: string
  /** Build estimate in hours. */
  hours: number
  materials: string
  boughtParts: string | null
  status: GiftStatus
  /** Firebase Auth uid of the winner, once drawn. */
  wonBy: string | null
  /** Winner's display name at issue time, so the wall of winners works signed out. */
  wonByName: string | null
  /** "YYYY-MM" of the month the gift was won, once drawn. */
  wonMonth: string | null
  /** Paths under /gifts/{giftId}/; the first is the hero image. */
  photos: string[]
}

export const GIFT_STATUSES: readonly GiftStatus[] = [
  'available',
  'drawn',
  'cut',
  'glued',
  'finished',
  'delivered',
] as const

interface GiftSeed {
  id: string
  name: string
  blurb: string
  hours: number
  materials: string
  boughtParts?: string
}

const seeds: GiftSeed[] = [
  {
    id: 'phone-stand',
    name: 'Phone stand',
    blurb: 'Props your phone up for the deadline-day scramble.',
    hours: 1,
    materials: '20×90 base and back, 20×20 lip',
  },
  {
    id: 'headphone-stand',
    name: 'Headphone stand',
    blurb: 'Somewhere to hang the cans between podcasts.',
    hours: 1.5,
    materials: '44×70 base and cap, 20×90 post',
  },
  {
    id: 'pen-block',
    name: 'Pen block',
    blurb: 'Six pens, one block, no more rummaging in the drawer.',
    hours: 1,
    materials: '44×70×150, Ø12 holes',
  },
  {
    id: 'name-plate',
    name: "Manager's name plate",
    blurb: 'Your name on the desk, as befits a champion.',
    hours: 1,
    materials: '44×70×220',
  },
  {
    id: 'bookends',
    name: 'Bookends (pair)',
    blurb: 'Keeps the tactics books upright and the shelf tidy.',
    hours: 1.5,
    materials: '44×70, Ø10 dowels',
  },
  {
    id: 'coaster-set',
    name: 'Coaster set + holder',
    blurb: 'Coasters and a holder, so the brew never marks the table.',
    hours: 1.5,
    materials: '20×90 strip, 44×70 holder',
  },
  {
    id: 'bottle-opener',
    name: 'Wall bottle opener + cap catcher',
    blurb: 'Wall-mounted opener with a box to catch the caps.',
    hours: 1.5,
    materials: '20×90 back, 20 mm box',
    boughtParts: 'steel opener plate',
  },
  {
    id: 'drinks-caddy',
    name: 'Six-bottle drinks caddy',
    blurb: 'Carries six bottles from the fridge to the sofa in one trip.',
    hours: 3,
    materials: '20 mm ends/base, 20×40 slats, 44×44 handle',
  },
  {
    id: 'wine-holder',
    name: 'Wine bottle balance holder',
    blurb: 'Balances a full bottle in mid-air. Physics, not magic.',
    hours: 1,
    materials: '20×90×260',
    boughtParts: 'Ø35 spade bit (tool)',
  },
  {
    id: 'remote-caddy',
    name: 'Remote caddy',
    blurb: 'One home for every remote in the house.',
    hours: 1.5,
    materials: '20 mm box, Ø8 dowels',
  },
  {
    id: 'armrest-tray',
    name: 'Sofa armrest tray',
    blurb: 'Sits flat on the sofa arm to hold a drink through the match.',
    hours: 2,
    materials: '20 mm from 1×8, glue-only',
  },
  {
    id: 'kitchen-roll-stand',
    name: 'Kitchen roll stand',
    blurb: 'A weighted base and a tall post for the kitchen roll.',
    hours: 1.5,
    materials: 'laminated 1×8 base, 20×20 post',
  },
  {
    id: 'mug-tree',
    name: 'Mug tree',
    blurb: 'Six pegs for six mugs on a solid pine base.',
    hours: 2,
    materials: '190×190 base, 44×44 post, Ø10 pegs',
  },
  {
    id: 'hook-rail',
    name: 'Key and hook rail',
    blurb: 'Keys, leads and lanyards, hung by the door.',
    hours: 1,
    materials: '20×90×300, Ø10 pegs',
  },
  {
    id: 'tea-light-holder',
    name: 'Tea-light holder',
    blurb: 'A row of candles along a single pine bar.',
    hours: 1,
    materials: '44×70×300, Ø40 recesses',
    boughtParts: 'Ø40 spade bit (tool)',
  },
  {
    id: 'snack-board',
    name: 'Snack/bread board',
    blurb: 'Serving board for the half-time spread, finished in oil.',
    hours: 1,
    materials: '20×190×380, oil finish',
  },
  {
    id: 'chalkboard',
    name: 'Team-sheet chalkboard',
    blurb: 'Chalk up the team sheet before every deadline.',
    hours: 2,
    materials: '20×40 mitred frame, hardboard',
    boughtParts: 'blackboard paint, hardboard',
  },
  {
    id: 'wall-clock',
    name: 'Octagonal wall clock',
    blurb: 'Eight sides, twelve dowel markers and a quiet quartz movement.',
    hours: 2,
    materials: '190×190 from 1×8, Ø8 dowel markers',
    boughtParts: 'quartz movement',
  },
]

export const gifts: Gift[] = seeds.map((s) => ({
  id: s.id,
  name: s.name,
  blurb: s.blurb,
  hours: s.hours,
  materials: s.materials,
  boughtParts: s.boughtParts ?? null,
  status: 'available',
  wonBy: null,
  wonByName: null,
  wonMonth: null,
  photos: [`/gifts/${s.id}/hero.svg`],
}))

export const giftById = (id: string): Gift | undefined => gifts.find((g) => g.id === id)
