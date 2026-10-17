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
    blurb: 'A little home for your matchday screen.',
    hours: 1,
    materials: '20×90 base and back, 44×70 wedge block, 20 mm rails and lips (charges standing)',
  },
  {
    id: 'headphone-stand',
    name: 'Headphone stand',
    blurb: 'Give your headphones a proper resting place.',
    hours: 1.5,
    materials: '44×70 base, post and cap, four Ø10 dowels',
  },
  {
    id: 'hexagon-shelf',
    name: 'Hexagon shelf',
    blurb: 'Six sides of pine for your prized bits and pieces.',
    hours: 1.5,
    materials: 'six 20×90×250 sides bevelled 30°, glued mitres, hardboard back screwed on',
    boughtParts: 'hardboard, sawtooth hanger',
  },
  {
    id: 'pen-block',
    name: 'Pen block',
    blurb: 'Keep your desk in formation.',
    hours: 1,
    materials: '44×70×150, seven Ø12 holes',
    boughtParts: 'Ø12 bit (tool)',
  },
  {
    id: 'name-plate',
    name: "Manager's name plate",
    blurb: 'Your name. Your place in the league.',
    hours: 1,
    materials: '44×70×220, ends bevelled 15°, lettered front',
    boughtParts: 'paint pen',
  },
  {
    id: 'laptop-stand',
    name: 'Laptop stand',
    blurb: 'Lifts the screen for long nights on the transfer market.',
    hours: 1.5,
    materials:
      'two 20×190×380 top boards on 20×40 cleats, two 15° wedges from one 20×90 strip, 20×20 lip',
  },
  {
    id: 'coaster-set',
    name: 'Coaster set + holder',
    blurb: 'Four spots for the matchday drinks.',
    hours: 1.5,
    materials: 'four 20×90×90 coasters, 134×134×50 doweled tray',
  },
  {
    id: 'drinks-caddy',
    name: 'Six-bottle drinks caddy',
    blurb: 'Carry the drinks in one trip.',
    hours: 3,
    materials: '1×8 ends and base, 20×90 divider, 20×40 slats, 44×44 handle',
  },
  {
    id: 'desk-organizer',
    name: 'Desktop organizer',
    blurb: 'Pens, notes and phone, all in position.',
    hours: 1.5,
    materials: '20×90 base, back and ends, 20×40 dividers, 18 mm phone slot',
  },
  {
    id: 'remote-caddy',
    name: 'Remote caddy',
    blurb: 'All the remotes, one home.',
    hours: 1.5,
    materials: '20×90 box with Ø8 corner dowels, 20×40 divider',
  },
  {
    id: 'serving-board',
    name: 'Serving board',
    blurb: 'A handled board for passing round the spread.',
    hours: 1,
    materials: '20×190×380 from 1×8, hand-sawn handle, Ø10 hang hole',
    boughtParts: 'food-safe oil',
  },
  {
    id: 'mug-tree',
    name: 'Mug tree',
    blurb: 'A branch for every favourite mug.',
    hours: 2,
    materials: '190×190 base, 44×44 post, six Ø10 pegs',
  },
  {
    id: 'snack-board',
    name: 'Snack/bread board',
    blurb: 'Bring the half-time snacks.',
    hours: 1,
    materials: '20×190×380, lifting chamfers, Ø15 hang hole',
    boughtParts: 'food-safe oil',
  },
  {
    id: 'wall-clock',
    name: 'Octagonal wall clock',
    blurb: 'Keep an eye on kick-off.',
    hours: 2,
    materials: '190×190 from 1×8, Ø8 dowel markers',
    boughtParts: 'long-shaft quartz movement, sawtooth hanger',
  },
  {
    id: 'serving-tray',
    name: 'Serving tray',
    blurb: 'Brings the tea in at half-time.',
    hours: 1.5,
    materials: '20×90 sides with Ø8 corner dowels, hardboard base, 470×300',
    boughtParts: 'hardboard, tray handles (pair)',
  },
  {
    id: 'small-stool',
    name: 'Small stool',
    blurb: 'A sturdy seat close to the action.',
    hours: 2,
    materials: '44×44 legs and stepped rails, two 1×8 top boards, 390×340×300',
  },
  {
    id: 'step-stool',
    name: 'Step stool',
    blurb: 'Two steps up for the top shelf, or the top of the table.',
    hours: 2.5,
    materials: 'two stepped 44×44 side frames, three cross rails, 1×8 treads, 400×380×440',
  },
  {
    id: 'plant-stand',
    name: 'Plant stand',
    blurb: 'Gives your plants a seat in the stand.',
    hours: 1.5,
    materials: '44×44 legs, stepped rails, 20×90 slatted top and shelf, 300×300×450',
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
