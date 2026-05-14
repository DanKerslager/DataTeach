import { useCallback, useEffect, useState } from 'react'
import type { ClassTopicStatus, StatusPatch, UUID } from '../types/models'
import { progressService } from '../services/progressService'

const keyOf = (classId: UUID, topicId: UUID) => `${classId}:${topicId}`

export function useClassProgress(selectedClassId: UUID | null) {
  const [statusMap, setStatusMap] = useState<Record<string, ClassTopicStatus>>({})
  const [loading, setLoading] = useState(false)

  const loadProgress = useCallback(async () => {
    if (!selectedClassId) {
      setStatusMap({})
      return
    }

    setLoading(true)
    try {
      const statuses = await progressService.listForClass(selectedClassId)
      const map = Object.fromEntries(
        statuses.map((status) => [keyOf(status.class_id, status.topic_id), status]),
      )
      setStatusMap(map)
    } finally {
      setLoading(false)
    }
  }, [selectedClassId])

  useEffect(() => {
    void loadProgress()
  }, [loadProgress])

  const updateStatus = async (topicId: UUID, patch: StatusPatch) => {
    if (!selectedClassId) return

    const key = keyOf(selectedClassId, topicId)
    const previous = statusMap[key]

    const optimistic: ClassTopicStatus = {
      id: previous?.id ?? key,
      class_id: selectedClassId,
      topic_id: topicId,
      taught: patch.taught ?? previous?.taught ?? false,
      notes: patch.notes ?? previous?.notes ?? '',
      teaching_date: patch.teaching_date ?? previous?.teaching_date ?? null,
      updated_at: new Date().toISOString(),
    }

    setStatusMap((prev) => ({ ...prev, [key]: optimistic }))

    try {
      const saved = await progressService.upsert(selectedClassId, topicId, optimistic)
      setStatusMap((prev) => ({ ...prev, [key]: saved }))
    } catch (error) {
      setStatusMap((prev) => {
        if (!previous) {
          const next = { ...prev }
          delete next[key]
          return next
        }

        return { ...prev, [key]: previous }
      })
      throw error
    }
  }

  const getStatus = (topicId: UUID) => {
    if (!selectedClassId) return undefined
    return statusMap[keyOf(selectedClassId, topicId)]
  }

  return {
    statusMap,
    loading,
    getStatus,
    updateStatus,
    reloadProgress: loadProgress,
  }
}
