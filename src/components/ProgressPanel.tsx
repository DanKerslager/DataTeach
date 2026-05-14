import type { TopicNode } from '../types/models'
import type { ClassTopicStatus } from '../types/models'

interface ProgressPanelProps {
  selectedClassName: string | null
  topics: TopicNode[]
  getStatus: (topicId: string) => ClassTopicStatus | undefined
  onStatusChange: (topicId: string, patch: Partial<ClassTopicStatus>) => void
}

function flattenTopics(nodes: TopicNode[]): TopicNode[] {
  return nodes.flatMap((node) => [node, ...flattenTopics(node.children)])
}

export function ProgressPanel({
  selectedClassName,
  topics,
  getStatus,
  onStatusChange,
}: ProgressPanelProps) {
  if (!selectedClassName) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Select a class to track curriculum progress.
      </div>
    )
  }

  const flatTopics = flattenTopics(topics)

  return (
    <div className="space-y-3">
      {flatTopics.map((topic) => {
        const status = getStatus(topic.id)

        return (
          <article
            key={topic.id}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{topic.title}</h3>
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={status?.taught ?? false}
                  className="h-4 w-4"
                  onChange={(event) => onStatusChange(topic.id, { taught: event.target.checked })}
                />
                Taught
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_160px]">
              <textarea
                className="min-h-20 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Add lesson notes"
                value={status?.notes ?? ''}
                onChange={(event) => onStatusChange(topic.id, { notes: event.target.value })}
              />

              <input
                type="date"
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                value={status?.teaching_date ?? ''}
                onChange={(event) =>
                  onStatusChange(topic.id, {
                    teaching_date: event.target.value ? event.target.value : null,
                  })
                }
              />
            </div>
          </article>
        )
      })}

      {flatTopics.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Add topics in the curriculum tree to begin.
        </div>
      )}
    </div>
  )
}
