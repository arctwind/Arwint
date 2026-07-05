import { defaultTheme, DEFAULT_THEME_ID } from './default'
import { geometricTheme } from './geometric'

export { DEFAULT_THEME_ID }
export { CanvasLayer } from './canvas/CanvasLayer'
import type { ThemeCanvasEffect } from './canvas/types'
export type { ThemeCanvasEffect }

export interface ThemeMeta {
  id: string
  name: string
  effect?: ThemeCanvasEffect
}

export const THEMES: ThemeMeta[] = [
  defaultTheme,
  geometricTheme,
]
