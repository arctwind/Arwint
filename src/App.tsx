import { useEffect, useRef, useState } from 'react'
import './index.css'
import { ColorSchemeToggle } from './components/ColorSchemeToggle'

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

function App() {
  const [time, setTime] = useState(new Date())
  const [query, setQuery] = useState('')
  const [engineId, setEngineId] = useState('google')
  const [menuOpen, setMenuOpen] = useState(false)
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

  return (
    <div className="start-page">
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
      </footer>
    </div>
  )
}

export default App
