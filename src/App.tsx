import { useEffect, useRef, useState } from 'react'
import './index.css'

const BUILT_IN_ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
  { id: 'baidu', name: 'Baidu', url: 'https://www.baidu.com/s?wd=%s' },
]

const DEFAULT_LINKS = [
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'Bilibili', url: 'https://www.bilibili.com' },
]

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

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function App() {
  const [time, setTime] = useState(new Date())
  const [query, setQuery] = useState('')
  const [engineId, setEngineId] = useState('google')
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const engine = BUILT_IN_ENGINES.find((e) => e.id === engineId) ?? BUILT_IN_ENGINES[0]
  const { hours, minutes } = formatTime(time)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = savedTheme ?? (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
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

  const applyTheme = (next: 'light' | 'dark') => {
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const next = theme === 'light' ? 'dark' : 'light'

    const root = document.documentElement
    root.style.setProperty('--theme-origin-x', `${x}px`)
    root.style.setProperty('--theme-origin-y', `${y}px`)

    const doc = document as Document & {
      startViewTransition?: (callback: () => void | Promise<void>) => {
        ready: Promise<void>
        finished: Promise<void>
      }
    }

    if (!doc.startViewTransition) {
      applyTheme(next)
      return
    }

    root.classList.add('no-theme-transition')
    const transition = doc.startViewTransition(() => {
      applyTheme(next)
    })

    transition.ready
      .then(() => {
        root.classList.remove('no-theme-transition')
      })
      .catch(() => {
        root.classList.remove('no-theme-transition')
      })
  }

  return (
    <div className="start-page">
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

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

      <nav className="quick-links">
        {DEFAULT_LINKS.map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
            {link.name}
          </a>
        ))}
      </nav>
    </div>
  )
}

export default App
