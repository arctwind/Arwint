export interface ThemeMeta {
  id: string
  name: string
}

export const DEFAULT_THEME_ID = 'default'

export const THEMES: ThemeMeta[] = [
  { id: 'default', name: '默认' },
]
