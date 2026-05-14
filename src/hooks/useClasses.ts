import { useCallback, useEffect, useState } from 'react'
import type { Classroom, UUID } from '../types/models'
import { classesService } from '../services/classesService'

export function useClasses() {
  const [classes, setClasses] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)

  const loadClasses = useCallback(async () => {
    setLoading(true)
    try {
      const data = await classesService.list()
      setClasses(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadClasses()
  }, [loadClasses])

  const createClass = async (name: string) => {
    const classroom = await classesService.create(name)
    setClasses((prev) => [...prev, classroom].sort((a, b) => a.name.localeCompare(b.name)))
    return classroom
  }

  const renameClass = async (id: UUID, name: string) => {
    const updated = await classesService.update(id, { name })
    setClasses((prev) =>
      prev.map((item) => (item.id === id ? updated : item)).sort((a, b) => a.name.localeCompare(b.name)),
    )
  }

  const archiveClass = async (id: UUID) => {
    await classesService.update(id, { is_archived: true })
    setClasses((prev) => prev.filter((item) => item.id !== id))
  }

  return {
    classes,
    loading,
    createClass,
    renameClass,
    archiveClass,
    reloadClasses: loadClasses,
  }
}
