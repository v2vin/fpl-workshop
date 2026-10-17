// FPL Workshop Mini-League – Prize Rules, as published to the league on 15 October 2026.
// The app enforces what it can (src/lib/rules.ts); the rest is shown on /rules. Rule numbers are
// quoted in code comments as "rule 1.3" and so on, so keep the numbering when the text changes.

export const RULES_DATE: string = '2026-10-15'

/**
 * Last change to the wording; the same as RULES_DATE until the rules are amended (rule 6.2).
 * 2026-10-16: rule 4.2 drops video calls; proof is the app's team-name code or a screenshot.
 */
export const RULES_UPDATED: string = '2026-10-16'

export interface RuleSection {
  title: string
  items: string[]
}

export const RULES: RuleSection[] = [
  {
    title: 'Eligibility and joining',
    items: [
      'A manager is eligible for a month’s prize only if they joined the league before that month began.',
      'For October 2026, only managers who joined on or before 30 September 2026 are eligible. Anyone joining between 1 and 22 October 2026 becomes eligible from November.',
      'The league closes to new entries on Thursday 22 October 2026. No late entries.',
      'One manager, one team. Duplicate, shared or multi-account entries forfeit eligibility for the whole season.',
    ],
  },
  {
    title: 'Monthly winner',
    items: [
      'The monthly winner is the eligible manager with the most points across all gameweeks whose deadlines fall in that calendar month.',
      'Points are taken from the official FPL site once the month’s final gameweek has been processed.',
      'Tie-break: the manager with the higher single-gameweek score that month wins. If still tied, the prize is drawn by lot between the tied managers.',
      'The winner is announced in the FPL Workshop results video and in the league group.',
    ],
  },
  {
    title: 'Prizes',
    items: [
      'Each month’s prize is a handmade wooden item made by FPL Workshop.',
      'The prize item is drawn at random from the available items using the FPL Workshop web app. The draw is recorded and shown in the results video.',
      'Prizes are handmade and will vary from any video or photo in colour, grain and finish. No returns or replacements for cosmetic differences.',
      'If a prize is damaged before handover or cannot be completed on time, FPL Workshop may substitute an item of similar size and effort.',
      'The winner accepts the prize as a handmade item and uses it at their own risk. FPL Workshop is not liable for damage or injury after handover.',
      'Prizes have no cash value and cannot be exchanged for money or another item.',
    ],
  },
  {
    title: 'Collection and delivery',
    items: [
      'Collection or delivery is arranged and paid for by the winner.',
      'Before handover, the winner must show they control the winning FPL team, either by adding the code from the FPL Workshop app to their FPL team name or with a screenshot from their logged-in FPL account.',
      'FPL Workshop holds a prize for 60 days from the announcement. An unclaimed prize goes back into the pool for a future draw.',
      'Prizes are delivered within Malawi only, unless agreed in writing with FPL Workshop beforehand.',
    ],
  },
  {
    title: 'Fair play and conduct',
    items: [
      'Managers must follow the official Fantasy Premier League rules. Any FPL sanction on a team also removes it from prize contention.',
      'Abuse of other managers or of FPL Workshop in the league group or on social media forfeits that month’s prize. Repeat offenders may be removed from the league.',
      'Winners agree to be named, with their team name, in the results video and on FPL Workshop social media. A manager who does not want this must say so before the month’s draw.',
    ],
  },
  {
    title: 'Running the competition',
    items: [
      'The league is free to join. No entry fee is charged.',
      'FPL Workshop may amend these rules with notice posted in the league group. Changes do not apply to a month already in progress.',
      'FPL Workshop may pause or end the competition at any time (for example illness, travel or lack of materials) with notice in the league group. No prize is owed for an unfinished month.',
      'The competition is run independently by FPL Workshop and is not affiliated with or endorsed by the Premier League or Fantasy Premier League.',
      'FPL Workshop’s decision on any dispute is final.',
    ],
  },
]
