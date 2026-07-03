import { useEffect, useCallback, useRef, useState } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const TAB_ITEMS = [
  { id: 'general', label: '常规' },
  { id: 'shortcuts', label: '快捷键' },
]

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('general')
  const closeRef = useRef<HTMLButtonElement>(null)

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
      setActiveTab('general')
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
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="settings-content">
            {activeTab === 'general' && <p className="settings-placeholder">常规设置</p>}
            {activeTab === 'shortcuts' && <p className="settings-placeholder">快捷键设置</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
