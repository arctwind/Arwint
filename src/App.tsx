import { useCallback, useEffect, useRef, useState } from 'react'
import './index.css'
import { ColorSchemeToggle } from './components/ColorSchemeToggle'
import { SettingsModal } from './components/SettingsModal'
import { version } from '../package.json'

const BUILT_IN_ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=%s' },
]

const GITHUB_REPOSITORY_URL = 'https://github.com/arctwind/Arwint'

const PLACEHOLDER_BUTTON_LABEL = '···'

const CROSSFADE_DURATION_MS = 600

const OPEN_IN_NEW_TAB_KEY = 'openInNewTab'

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return { hours, minutes }
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function App() {
  const [time, setTime] = useState(new Date())
  const [query, setQuery] = useState('')
  const [engineId, setEngineId] = useState('google')
  const [prevEngineId, setPrevEngineId] = useState<string | null>(null)
  const [isCrossfading, setIsCrossfading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const isFocusedRef = useRef(false)
  const engineIdRef = useRef(engineId)
  engineIdRef.current = engineId

  const engine = BUILT_IN_ENGINES.find((e) => e.id === engineId) ?? BUILT_IN_ENGINES[0]
  const prevEngine = BUILT_IN_ENGINES.find((e) => e.id === prevEngineId)
  const { hours, minutes } = formatTime(time)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const ENGINE_COUNT = BUILT_IN_ENGINES.length
    const handleShortcut = (event: KeyboardEvent) => {
      if (!isFocusedRef.current) return
      if (!(event.ctrlKey || event.metaKey)) return
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
      event.preventDefault()
      const currentId = engineIdRef.current
      const currentIndex = BUILT_IN_ENGINES.findIndex((e) => e.id === currentId)
      const delta = event.key === 'ArrowUp' ? -1 : 1
      const nextIndex = (currentIndex + delta + ENGINE_COUNT) % ENGINE_COUNT
      const nextId = BUILT_IN_ENGINES[nextIndex].id
      if (nextId === currentId) return
      setPrevEngineId(currentId)
      setEngineId(nextId)
      setIsCrossfading(true)
    }
    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (!isCrossfading) return
    const timer = setTimeout(() => {
      setIsCrossfading(false)
      setPrevEngineId(null)
    }, CROSSFADE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [isCrossfading, prevEngineId])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    const url = engine.url.replace('%s', encodeURIComponent(trimmed))
    if (localStorage.getItem(OPEN_IN_NEW_TAB_KEY) === 'true') {
      window.open(url, '_blank')
    } else {
      window.location.href = url
    }
  }

  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    isFocusedRef.current = true
  }, [])

  const handleBlur = useCallback(() => {
    requestAnimationFrame(() => {
      if (formRef.current && !formRef.current.contains(document.activeElement)) {
        setIsFocused(false)
        isFocusedRef.current = false
      }
    })
  }, [])

  const switchEngine = useCallback((id: string) => {
    if (id === engineId) return
    setPrevEngineId(engineId)
    setEngineId(id)
    setIsCrossfading(true)
  }, [engineId])

  return (
    <div className="start-page">
      <button
        type="button"
        className="settings-button"
        onClick={() => setSettingsOpen(true)}
        aria-label="Open settings"
      >
        <GearIcon />
      </button>
      <ColorSchemeToggle />

      <section className="clock-section">
        <div className="time">
          {hours}
          <span className="colon">:</span>
          {minutes}
        </div>
      </section>

      <form ref={formRef} className={`search-form${isFocused ? ' focused' : ''}`} onSubmit={handleSearch}>
        <input
          ref={inputRef}
          className={`search-input${isCrossfading ? ' engine-fade' : ''}`}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={`Search with ${engine.name}`}
        />
        <div className="engine-select" ref={menuRef}>
          <button
            type="button"
            className="engine-button"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="engine-name-stack">
              {isCrossfading && prevEngine && (
                <span className="engine-name engine-fade-out">{prevEngine.name}</span>
              )}
              <span className={`engine-name${isCrossfading ? ' engine-fade-in' : ''}`}>
                {engine.name}
              </span>
            </span>
          </button>
          <ul className={`engine-menu ${menuOpen ? 'open' : ''}`}>
            {BUILT_IN_ENGINES.map((e) => (
              <li
                key={e.id}
                className={e.id === engineId ? 'active' : ''}
                onClick={() => {
                  switchEngine(e.id)
                  setMenuOpen(false)
                  inputRef.current?.focus()
                }}
              >
                {e.name}
              </li>
            ))}
          </ul>
        </div>
      </form>

      <nav className="quick-actions">
        <button type="button" className="quick-actions__placeholder">
          {PLACEHOLDER_BUTTON_LABEL}
        </button>
      </nav>

      <footer className="page-footer">
        <a
          className="page-footer__link"
          href={GITHUB_REPOSITORY_URL}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <span className="page-footer__divider" aria-hidden="true">·</span>
        <span className="page-footer__copyright">
          © 2026 Alvinte (Arctwind)
        </span>
        <span className="page-footer__divider" aria-hidden="true">·</span>
        <span className="page-footer__version">{version}</span>
      </footer>
      <SettingsModal isOpen={settingsOpen} onClose={closeSettings} />
    </div>
  )
}

export default App
