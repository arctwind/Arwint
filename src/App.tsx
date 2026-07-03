import { useCallback, useEffect, useRef, useState } from 'react'
import './index.css'
import { ColorSchemeToggle } from './components/ColorSchemeToggle'
import { SettingsModal } from './components/SettingsModal'
import { version } from '../package.json'

const BUILT_IN_ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
  { id: 'baidu', name: 'Baidu', url: 'https://www.baidu.com/s?wd=%s' },
]

const GITHUB_REPOSITORY_URL = 'https://github.com/arctwind/Arwint'

const PLACEHOLDER_BUTTON_LABEL = '···'

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return { hours, minutes }
}

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const engine = BUILT_IN_ENGINES.find((e) => e.id === engineId) ?? BUILT_IN_ENGINES[0]
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

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    window.location.href = engine.url.replace('%s', encodeURIComponent(trimmed))
  }

  const closeSettings = useCallback(() => setSettingsOpen(false), [])

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

      <form className="search-form" onSubmit={handleSearch}>
        <SearchIcon />
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search with ${engine.name}`}
        />
        <div className="engine-select" ref={menuRef}>
          <button
            type="button"
            className="engine-button"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {engine.name}
          </button>
          <ul className={`engine-menu ${menuOpen ? 'open' : ''}`}>
            {BUILT_IN_ENGINES.map((e) => (
              <li
                key={e.id}
                className={e.id === engineId ? 'active' : ''}
                onClick={() => {
                  setEngineId(e.id)
                  setMenuOpen(false)
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
