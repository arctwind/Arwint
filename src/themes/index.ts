import { defaultTheme, DEFAULT_THEME_ID } from './default'
import { geometricTheme } from './geometric'

export { DEFAULT_THEME_ID }

export interface ThemeMeta {
  id: string
  name: string
}

export const THEMES: ThemeMeta[] = [
  defaultTheme,
  geometricTheme,
]
