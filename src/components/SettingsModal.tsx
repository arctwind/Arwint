import { useEffect, useCallback, useRef } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
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
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          className="settings-close"
          onClick={onClose}
          aria-label="Close settings"
        >
          <CloseIcon />
        </button>
        <h2 className="settings-title">Settings</h2>
      </div>
    </div>
  )
}
