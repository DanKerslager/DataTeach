import type { TopicNode, UUID } from '../types/models'

interface TopicTreeProps {
  nodes: TopicNode[]
  depth?: number
  onAdd: (parentId: UUID | null) => void
  onRename: (id: UUID, title: string) => void
  onArchive: (id: UUID) => void
  onReorder: (id: UUID, direction: -1 | 1) => void
}

export function TopicTree({
  nodes,
  depth = 0,
  onAdd,
  onRename,
  onArchive,
  onReorder,
}: TopicTreeProps) {
  return (
    <ul className="space-y-2">
      {nodes.map((node) => (
        <li key={node.id} className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 8 }}>
            <span className="grow text-sm text-slate-800 dark:text-slate-100">{node.title}</span>
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
              onClick={() => onReorder(node.id, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
              onClick={() => onReorder(node.id, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
              onClick={() => {
                const title = window.prompt('Rename topic', node.title)?.trim()
                if (title) onRename(node.id, title)
              }}
            >
              Rename
            </button>
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
              onClick={() => onAdd(node.id)}
            >
              + Child
            </button>
            <button
              type="button"
              className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:text-rose-300"
              onClick={() => onArchive(node.id)}
            >
              Hide
            </button>
          </div>

          {node.children.length > 0 && (
            <div className="mt-2">
              <TopicTree
                nodes={node.children}
                depth={depth + 1}
                onAdd={onAdd}
                onRename={onRename}
                onArchive={onArchive}
                onReorder={onReorder}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
