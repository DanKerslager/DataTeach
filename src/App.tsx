import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ClassSelector } from './components/ClassSelector'
import { ProgressPanel } from './components/ProgressPanel'
import { TopicTree } from './components/TopicTree'
import { useClassProgress } from './hooks/useClassProgress'
import { useClasses } from './hooks/useClasses'
import { useTopics } from './hooks/useTopics'
import { authService } from './services/authService'
import { hasSupabaseConfig } from './lib/supabase'
import type { Classroom, UUID } from './types/models'

function App() {
  const { classes, createClass, renameClass, archiveClass, loading: classesLoading } = useClasses()
  const { tree, addTopic, renameTopic, archiveTopic, reorderTopic, loading: topicsLoading } = useTopics()

  const [selectedClassId, setSelectedClassId] = useState<UUID | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [emailInput, setEmailInput] = useState('')
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [sendingMagicLink, setSendingMagicLink] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(true)

  const effectiveSelectedClassId = selectedClassId ?? classes[0]?.id ?? null
  const { getStatus, updateStatus, loading: progressLoading } = useClassProgress(effectiveSelectedClassId)

  useEffect(() => {
    void authService.getUserEmail().then(setUserEmail)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const selectedClassName = useMemo(
    () => classes.find((item) => item.id === effectiveSelectedClassId)?.name ?? null,
    [classes, effectiveSelectedClassId],
  )

  const withErrorHandling = async (action: () => Promise<void>) => {
    setError(null)
    setAuthMessage(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    }
  }

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const email = emailInput.trim()
    if (!email || sendingMagicLink) return

    setSendingMagicLink(true)
    void withErrorHandling(async () => {
      try {
        await authService.signInWithMagicLink(email)
        setAuthMessage('Check your email for a sign-in link.')
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        const status = typeof err === 'object' && err && 'status' in err ? (err as { status?: number }).status : undefined

        if (status === 429 || message.includes('Too Many Requests')) {
          setAuthMessage('Supabase rate-limited the request. Wait a minute before trying again.')
          return
        }

        throw err
      }
    }).finally(() => {
      setSendingMagicLink(false)
    })
  }

  const handleSignOut = () => {
    void withErrorHandling(async () => {
      await authService.signOut()
      setUserEmail(null)
      setAuthMessage('Signed out.')
    })
  }

  const handleCreateClass = () => {
    const name = window.prompt('New class name (e.g. 7.A)')?.trim()
    if (!name) return

    void withErrorHandling(async () => {
      const classroom = await createClass(name)
      setSelectedClassId(classroom.id)
    })
  }

  const handleRenameClass = (classroom: Classroom) => {
    const name = window.prompt('Rename class', classroom.name)?.trim()
    if (!name) return

    void withErrorHandling(async () => {
      await renameClass(classroom.id, name)
    })
  }

  const handleArchiveClass = (classroom: Classroom) => {
    const approved = window.confirm(`Archive class ${classroom.name}?`)
    if (!approved) return

    void withErrorHandling(async () => {
      await archiveClass(classroom.id)
      if (effectiveSelectedClassId === classroom.id) {
        setSelectedClassId(null)
      }
    })
  }

  const handleAddTopic = (parentId: UUID | null) => {
    const title = window.prompt('Topic name')?.trim()
    if (!title) return

    void withErrorHandling(async () => {
      await addTopic(title, parentId)
    })
  }

  const handleRenameTopic = (topicId: UUID, title: string) => {
    void withErrorHandling(async () => {
      await renameTopic(topicId, title)
    })
  }

  const handleArchiveTopic = (topicId: UUID) => {
    if (!window.confirm('Hide this topic?')) return

    void withErrorHandling(async () => {
      await archiveTopic(topicId)
    })
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">DataTeach</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curriculum progress tracking for classes
            </p>
          </div>

          <ClassSelector
            classes={classes}
            selectedClassId={effectiveSelectedClassId}
            onSelect={setSelectedClassId}
            onCreate={handleCreateClass}
            onRename={handleRenameClass}
            onArchive={handleArchiveClass}
          />

          <div className="flex flex-col items-end gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              {hasSupabaseConfig ? (
                userEmail ? (
                  <>
                    <span>{userEmail}</span>
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <form className="flex items-center gap-2" onSubmit={handleSignIn}>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={emailInput}
                      onChange={(event) => setEmailInput(event.target.value)}
                      className="w-44 rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={sendingMagicLink}
                      className="rounded bg-indigo-600 px-2 py-1 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sendingMagicLink ? 'Sending…' : 'Send magic link'}
                    </button>
                  </form>
                )
              ) : (
                <span>Demo mode</span>
              )}

              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
                onClick={() => setDarkMode((prev) => !prev)}
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>

            {authMessage && <span className="text-emerald-600 dark:text-emerald-400">{authMessage}</span>}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-[360px_1fr]">
        <aside className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Curriculum
            </h2>
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
              onClick={() => handleAddTopic(null)}
            >
              + Root topic
            </button>
          </div>

          <TopicTree
            nodes={tree}
            onAdd={handleAddTopic}
            onRename={handleRenameTopic}
            onArchive={handleArchiveTopic}
            onReorder={(topicId, direction) => {
              void withErrorHandling(async () => {
                await reorderTopic(topicId, direction)
              })
            }}
          />
        </aside>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {selectedClassName ? `Progress · ${selectedClassName}` : 'Progress'}
            </h2>
            {(classesLoading || topicsLoading || progressLoading) && (
              <span className="text-xs text-slate-400">Loading…</span>
            )}
          </div>

          <ProgressPanel
            selectedClassName={selectedClassName}
            topics={tree}
            getStatus={getStatus}
            onStatusChange={(topicId, patch) => {
              void withErrorHandling(async () => {
                await updateStatus(topicId, patch)
              })
            }}
          />

          {error && (
            <p className="mt-3 rounded-lg border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
              {error}
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
