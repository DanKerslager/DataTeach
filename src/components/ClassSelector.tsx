import type { Classroom, UUID } from '../types/models'

interface ClassSelectorProps {
  classes: Classroom[]
  selectedClassId: UUID | null
  onSelect: (classId: UUID) => void
  onCreate: () => void
  onRename: (classroom: Classroom) => void
  onArchive: (classroom: Classroom) => void
}

export function ClassSelector({
  classes,
  selectedClassId,
  onSelect,
  onCreate,
  onRename,
  onArchive,
}: ClassSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        value={selectedClassId ?? ''}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="" disabled>
          Select class
        </option>
        {classes.map((classroom) => (
          <option key={classroom.id} value={classroom.id}>
            {classroom.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        onClick={onCreate}
      >
        + Class
      </button>

      {selectedClassId && (
        <>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
            onClick={() => {
              const classroom = classes.find((item) => item.id === selectedClassId)
              if (classroom) onRename(classroom)
            }}
          >
            Rename
          </button>
          <button
            type="button"
            className="rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:text-rose-300"
            onClick={() => {
              const classroom = classes.find((item) => item.id === selectedClassId)
              if (classroom) onArchive(classroom)
            }}
          >
            Archive
          </button>
        </>
      )}
    </div>
  )
}
