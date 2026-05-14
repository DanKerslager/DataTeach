import { useCallback, useEffect, useMemo, useState } from 'react'
import { topicsService } from '../services/topicsService'
import type { Topic, TopicNode, UUID } from '../types/models'

function buildTopicTree(items: Topic[], parentId: UUID | null = null): TopicNode[] {
  return items
    .filter((item) => item.parent_id === parentId && !item.is_archived)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ ...item, children: buildTopicTree(items, item.id) }))
}

function getSiblingSortOrder(topics: Topic[], parentId: UUID | null): number {
  const siblings = topics.filter((topic) => topic.parent_id === parentId)
  if (siblings.length === 0) return 1
  return Math.max(...siblings.map((topic) => topic.sort_order)) + 1
}

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  const loadTopics = useCallback(async () => {
    setLoading(true)
    try {
      const data = await topicsService.list()
      setTopics(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTopics()
  }, [loadTopics])

  const tree = useMemo(() => buildTopicTree(topics), [topics])

  const addTopic = async (title: string, parentId: UUID | null) => {
    const sortOrder = getSiblingSortOrder(topics, parentId)
    const created = await topicsService.create(title, parentId, sortOrder)
    setTopics((prev) => [...prev, created])
  }

  const renameTopic = async (id: UUID, title: string) => {
    const updated = await topicsService.update(id, { title })
    setTopics((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  const archiveTopic = async (id: UUID) => {
    await topicsService.update(id, { is_archived: true })
    setTopics((prev) => prev.filter((item) => item.id !== id))
  }

  const reorderTopic = async (id: UUID, direction: -1 | 1) => {
    const current = topics.find((item) => item.id === id)
    if (!current) return

    const siblings = topics
      .filter((item) => item.parent_id === current.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order)

    const index = siblings.findIndex((item) => item.id === id)
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= siblings.length) return

    const target = siblings[targetIndex]

    await Promise.all([
      topicsService.update(current.id, { sort_order: target.sort_order }),
      topicsService.update(target.id, { sort_order: current.sort_order }),
    ])

    setTopics((prev) =>
      prev.map((item) => {
        if (item.id === current.id) return { ...item, sort_order: target.sort_order }
        if (item.id === target.id) return { ...item, sort_order: current.sort_order }
        return item
      }),
    )
  }

  return {
    topics,
    tree,
    loading,
    addTopic,
    renameTopic,
    archiveTopic,
    reorderTopic,
    reloadTopics: loadTopics,
  }
}
