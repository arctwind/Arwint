import { useEffect, useState } from 'react'

type ColorScheme = 'light' | 'dark'

const LOCAL_STORAGE_KEY = 'colorScheme'

function getInitialColorScheme(): ColorScheme {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
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

export function ColorSchemeToggle() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(getInitialColorScheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', colorScheme)
    // colorScheme is the initial value set by getInitialColorScheme during first render.
    // Subsequent changes are applied synchronously in the toggle handler to support View Transition API.
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const next: ColorScheme = colorScheme === 'light' ? 'dark' : 'light'

    const root = document.documentElement
    root.style.setProperty('--color-scheme-origin-x', `${x}px`)
    root.style.setProperty('--color-scheme-origin-y', `${y}px`)

    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => {
        ready: Promise<void>
        finished: Promise<void>
      }
    }

    if (!doc.startViewTransition) {
      root.setAttribute('data-color-scheme', next)
      localStorage.setItem(LOCAL_STORAGE_KEY, next)
      setColorScheme(next)
      return
    }

    root.classList.add('no-color-scheme-transition')
    const transition = doc.startViewTransition(() => {
      root.setAttribute('data-color-scheme', next)
      localStorage.setItem(LOCAL_STORAGE_KEY, next)
      setColorScheme(next)
    })

    transition.ready
      .then(() => {
        root.classList.remove('no-color-scheme-transition')
      })
      .catch(() => {
        root.classList.remove('no-color-scheme-transition')
      })
  }

  return (
    <button
      type="button"
      className="color-scheme-toggle"
      onClick={toggle}
      aria-label="Toggle color scheme"
    >
      {colorScheme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
