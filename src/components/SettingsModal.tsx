import { useEffect, useCallback, useRef, useState } from 'react'
import { useTheme } from './ThemeProvider'
import { THEMES } from '../themes'
import { version } from '../../package.json'

const GITHUB_REPOSITORY_URL = 'https://github.com/arctwind/Arwint'
const QQ_GROUP_NAME = '摸鱼小屋'
const QQ_GROUP_URL = 'https://qm.qq.com/q/68zS0YdfpY'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const TAB_ITEMS = [
  { id: 'general', label: '常规' },
  { id: 'appearance', label: '外观' },
  { id: 'shortcuts', label: '快捷键' },
  { id: 'about', label: '关于' },
]

const ACTIVE_TAB_KEY = 'activeTab'
const OPEN_IN_NEW_TAB_KEY = 'openInNewTab'

function getOpenInNewTab(): boolean {
  return localStorage.getItem(OPEN_IN_NEW_TAB_KEY) === 'true'
}

function getInitialTab(): string {
  const saved = localStorage.getItem(ACTIVE_TAB_KEY)
  if (saved && TAB_ITEMS.some((t) => t.id === saved)) return saved
  return 'general'
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.21.66.79.55A10.53 10.53 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  )
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState(getInitialTab)
  const [openInNewTab, setOpenInNewTab] = useState(getOpenInNewTab)
  const { themeId, setThemeId } = useTheme()
  const closeRef = useRef<HTMLButtonElement>(null)

  const switchTab = useCallback((id: string) => {
    setActiveTab(id)
    localStorage.setItem(ACTIVE_TAB_KEY, id)
  }, [])

  const toggleOpenInNewTab = useCallback(() => {
    setOpenInNewTab((prev) => {
      const next = !prev
      localStorage.setItem(OPEN_IN_NEW_TAB_KEY, String(next))
      return next
    })
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      closeRef.current?.focus()
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-topbar">
          <h2 className="settings-title">Settings</h2>
          <button
            ref={closeRef}
            type="button"
            className="settings-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="settings-body">
          <nav className="settings-nav">
            {TAB_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`settings-nav-item${activeTab === item.id ? ' active' : ''}`}
                onClick={() => switchTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="settings-content">
            {activeTab === 'general' && (
              <div className="settings-toggle-item">
                <span className="settings-toggle-label">新标签页打开搜索结果</span>
                <button
                  type="button"
                  className={`settings-toggle${openInNewTab ? ' active' : ''}`}
                  onClick={toggleOpenInNewTab}
                  role="switch"
                  aria-checked={openInNewTab}
                  aria-label="新标签页打开搜索结果"
                >
                  <span className="settings-toggle-thumb" />
                </button>
              </div>
            )}
            {activeTab === 'appearance' && (
              <div className="settings-themes">
                {THEMES.map((theme) => (
                  <label
                    key={theme.id}
                    className={`settings-theme-option${themeId === theme.id ? ' active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme.id}
                      checked={themeId === theme.id}
                      onChange={() => setThemeId(theme.id)}
                      className="settings-theme-radio"
                    />
                    {theme.name}
                  </label>
                ))}
              </div>
            )}
            {activeTab === 'shortcuts' && (
              <div className="settings-shortcuts">
                <div className="settings-shortcut-item">
                  <span className="settings-shortcut-label">切换搜索引擎</span>
                  <span className="settings-shortcut-keys">
                    <kbd>Ctrl</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd>
                  </span>
                </div>
              </div>
            )}
            {activeTab === 'about' && (
              <div className="settings-about">
                <div className="settings-about-header">
                  <span className="settings-about-name">Arwint</span>
                  <span className="settings-about-version">v{version}</span>
                </div>
                <p className="settings-about-intro">Arwint 是一个简约的浏览器起始页。</p>
                <div className="settings-about-links">
                  <a
                    className="settings-about-link"
                    href={GITHUB_REPOSITORY_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GithubIcon />
                    GitHub
                  </a>
                  <a
                    className="settings-about-link"
                    href={QQ_GROUP_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ChatIcon />
                    {QQ_GROUP_NAME}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
