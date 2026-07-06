import { useCallback, useEffect, useRef, useState } from 'react'

interface QuickLink {
  id: string
  name: string
  url: string
}

const STORAGE_KEY = 'quickLinks'

function loadLinks(): QuickLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => item && item.id && item.name && item.url)
  } catch {
    return []
  }
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function faviconOf(url: string): string {
  try {
    return `${new URL(url).origin}/favicon.ico`
  } catch {
    return ''
  }
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function EditDot() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function LinkTile({ link, onEdit }: { link: QuickLink; onEdit: () => void }) {
  const [iconFailed, setIconFailed] = useState(false)
  const favicon = faviconOf(link.url)

  return (
    <div className="quick-link">
      <a className="quick-link__target" href={link.url} title={link.name}>
        <span className="quick-link__icon">
          {favicon && !iconFailed ? (
            <img src={favicon} alt="" onError={() => setIconFailed(true)} />
          ) : (
            <span className="quick-link__letter">{link.name.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <span className="quick-link__name">{link.name}</span>
      </a>
      <button
        type="button"
        className="quick-link__edit"
        onClick={onEdit}
        aria-label={`编辑 ${link.name}`}
      >
        <EditDot />
      </button>
    </div>
  )
}

interface EditorState {
  id: string | null
  name: string
  url: string
}

function LinkEditor({
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  initial: EditorState
  onSave: (name: string, url: string) => void
  onDelete: (() => void) | null
  onClose: () => void
}) {
  const [name, setName] = useState(initial.name)
  const [url, setUrl] = useState(initial.url)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const finalUrl = normalizeUrl(url)
    if (!finalUrl) return
    const finalName = name.trim() || hostnameOf(finalUrl)
    if (!finalName) return
    onSave(finalName, finalUrl)
  }

  return (
    <div className="quick-editor-overlay" onClick={onClose}>
      <form className="quick-editor" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <label className="quick-editor__field">
          <span className="quick-editor__label">名称</span>
          <input
            ref={nameRef}
            className="quick-editor__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="知乎"
          />
        </label>
        <label className="quick-editor__field">
          <span className="quick-editor__label">网址</span>
          <input
            className="quick-editor__input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="zhihu.com"
          />
        </label>
        <div className="quick-editor__actions">
          {onDelete && (
            <button type="button" className="quick-editor__delete" onClick={onDelete}>
              删除
            </button>
          )}
          <span className="quick-editor__spacer" />
          <button type="button" className="quick-editor__cancel" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="quick-editor__save">
            保存
          </button>
        </div>
      </form>
    </div>
  )
}

export function QuickLinks() {
  const [links, setLinks] = useState<QuickLink[]>(loadLinks)
  const [editor, setEditor] = useState<EditorState | null>(null)

  const persist = useCallback((next: QuickLink[]) => {
    setLinks(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const openAdd = useCallback(() => setEditor({ id: null, name: '', url: '' }), [])
  const openEdit = useCallback(
    (link: QuickLink) => setEditor({ id: link.id, name: link.name, url: link.url }),
    [],
  )
  const closeEditor = useCallback(() => setEditor(null), [])

  const handleSave = useCallback(
    (name: string, url: string) => {
      if (editor?.id) {
        persist(links.map((link) => (link.id === editor.id ? { ...link, name, url } : link)))
      } else {
        persist([...links, { id: crypto.randomUUID(), name, url }])
      }
      setEditor(null)
    },
    [editor, links, persist],
  )

  const handleDelete = useCallback(() => {
    if (!editor?.id) return
    persist(links.filter((link) => link.id !== editor.id))
    setEditor(null)
  }, [editor, links, persist])

  return (
    <nav className="quick-actions">
      {links.map((link) => (
        <LinkTile key={link.id} link={link} onEdit={() => openEdit(link)} />
      ))}
      <button type="button" className="quick-add" onClick={openAdd} aria-label="添加快捷链接">
        <PlusIcon />
      </button>
      {editor && (
        <LinkEditor
          initial={editor}
          onSave={handleSave}
          onDelete={editor.id ? handleDelete : null}
          onClose={closeEditor}
        />
      )}
    </nav>
  )
}
