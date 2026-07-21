import type { BaseRecord } from '@hanzo/base/react'

/**
 * The three org-scoped Base collections behind Sprint Retro (see schema.sql).
 * Base adds id/created/updated/owner/org; these are the domain columns the app
 * reads and writes. A `retro` id links cards and actions to their sprint.
 */
export interface Retro extends BaseRecord {
  sprint: string
}
export interface Card extends BaseRecord {
  retro: string
  column: string
  text: string
  votes: number
}
export interface Action extends BaseRecord {
  retro: string
  text: string
  owner: string
  done: boolean
}

/** The three columns of a retrospective board. */
export type ColumnKey = 'well' | 'improve' | 'action'

export interface Column {
  key: ColumnKey
  title: string
  kicker: string
  /** Strong hue — dots, counts, the sticky's top edge. */
  accent: string
  /** Readable ink for text on the pastel fill. */
  ink: string
  /** The sticky-note fill. */
  sticky: string
  /** A faint wash for the column body. */
  tint: string
  /** The column header band. */
  head: string
}

/** Calm pastel columns — sage · apricot · periwinkle. */
export const COLUMNS: readonly Column[] = [
  { key: 'well',    title: 'Went Well',    kicker: 'Keep doing this',     accent: '#3a9d78', ink: '#245c44', sticky: '#dcefe2', tint: '#eef6f0', head: '#e2f0e8' },
  { key: 'improve', title: 'To Improve',   kicker: 'Do this differently', accent: '#d98a3d', ink: '#8a501b', sticky: '#fbe6cf', tint: '#f8efe3', head: '#f8e7d2' },
  { key: 'action',  title: 'Action Items', kicker: 'Commit to a change',  accent: '#5b6ce0', ink: '#3a44a6', sticky: '#e1e5fb', tint: '#eef0fb', head: '#e6e9fb' },
]

/** Warm-paper canvas + ink scale, so the pastel board is deterministic. */
export const PAPER = '#f7f4ee'
export const PANEL = '#fffdf9'
export const INK = '#33323b'
export const MUTE = '#8b8792'
export const LINE = '#e7e1d6'
export const SHADOW = '#0000001a'

/** The column definition for a key (falls back to the first column). */
export function columnOf(key: string): Column {
  return COLUMNS.find((c) => c.key === key) ?? COLUMNS[0]
}

const recent = (a: BaseRecord, b: BaseRecord) =>
  String(b.created ?? '').localeCompare(String(a.created ?? ''))

/** Cards in one column of a retro, most-voted first then newest. */
export function cardsIn(cards: Card[], retroId: string, key: ColumnKey): Card[] {
  return cards
    .filter((c) => c.retro === retroId && c.column === key)
    .sort((a, b) => (Number(b.votes) || 0) - (Number(a.votes) || 0) || recent(a, b))
}

/** A truthy read of a Base boolean, whatever wire shape it comes back as. */
export function isDone(a: Action): boolean {
  const v = a.done as unknown
  return v === true || v === 1 || v === '1' || v === 'true'
}

/** Actions for a retro — open first, done last, each group newest-first. */
export function actionsIn(actions: Action[], retroId: string): Action[] {
  return actions
    .filter((a) => a.retro === retroId)
    .sort((a, b) => Number(isDone(a)) - Number(isDone(b)) || recent(a, b))
}

export interface Progress {
  done: number
  total: number
  pct: number
}

/** How much of a retro's action list is complete. */
export function progressIn(actions: Action[], retroId: string): Progress {
  const mine = actions.filter((a) => a.retro === retroId)
  const done = mine.filter(isDone).length
  const total = mine.length
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

/** Total votes cast across a retro's cards — a light engagement signal. */
export function votesIn(cards: Card[], retroId: string): number {
  return cards
    .filter((c) => c.retro === retroId)
    .reduce((n, c) => n + (Number(c.votes) || 0), 0)
}
