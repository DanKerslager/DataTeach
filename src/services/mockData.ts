import type { ClassTopicStatus, Classroom, Topic, UUID } from '../types/models'

const now = new Date().toISOString()
const userId = '00000000-0000-0000-0000-000000000001'

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const topics: Topic[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    user_id: userId,
    title: 'Algebra',
    parent_id: null,
    sort_order: 1,
    is_archived: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    user_id: userId,
    title: 'Linear equations',
    parent_id: '10000000-0000-0000-0000-000000000001',
    sort_order: 1,
    is_archived: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    user_id: userId,
    title: 'Geometry',
    parent_id: null,
    sort_order: 2,
    is_archived: false,
    created_at: now,
    updated_at: now,
  },
]

const classes: Classroom[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    user_id: userId,
    name: '7.A',
    is_archived: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    user_id: userId,
    name: '7.B',
    is_archived: false,
    created_at: now,
    updated_at: now,
  },
]

const classTopicStatuses: ClassTopicStatus[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    class_id: '20000000-0000-0000-0000-000000000001',
    topic_id: '10000000-0000-0000-0000-000000000002',
    taught: true,
    notes: 'Covered with practical examples.',
    teaching_date: '2026-03-15',
    updated_at: now,
  },
]

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockStore = {
  async getTopics() {
    await delay()
    return [...topics].sort((a, b) => a.sort_order - b.sort_order)
  },
  async createTopic(payload: Pick<Topic, 'title' | 'parent_id' | 'sort_order'>) {
    await delay()
    const topic: Topic = {
      id: makeId(),
      user_id: userId,
      title: payload.title,
      parent_id: payload.parent_id,
      sort_order: payload.sort_order,
      is_archived: false,
      created_at: now,
      updated_at: now,
    }
    topics.push(topic)
    return topic
  },
  async updateTopic(id: UUID, patch: Partial<Pick<Topic, 'title' | 'parent_id' | 'sort_order' | 'is_archived'>>) {
    await delay()
    const topic = topics.find((item) => item.id === id)
    if (!topic) throw new Error('Topic not found')
    Object.assign(topic, patch, { updated_at: new Date().toISOString() })
    return topic
  },
  async getClasses() {
    await delay()
    return [...classes].sort((a, b) => a.name.localeCompare(b.name))
  },
  async createClass(name: string) {
    await delay()
    const classroom: Classroom = {
      id: makeId(),
      user_id: userId,
      name,
      is_archived: false,
      created_at: now,
      updated_at: now,
    }
    classes.push(classroom)
    return classroom
  },
  async updateClass(id: UUID, patch: Partial<Pick<Classroom, 'name' | 'is_archived'>>) {
    await delay()
    const classroom = classes.find((item) => item.id === id)
    if (!classroom) throw new Error('Class not found')
    Object.assign(classroom, patch, { updated_at: new Date().toISOString() })
    return classroom
  },
  async getClassStatuses(classId: UUID) {
    await delay()
    return classTopicStatuses.filter((item) => item.class_id === classId)
  },
  async upsertClassStatus(classId: UUID, topicId: UUID, patch: Partial<ClassTopicStatus>) {
    await delay()
    const existing = classTopicStatuses.find(
      (item) => item.class_id === classId && item.topic_id === topicId,
    )
    if (existing) {
      Object.assign(existing, patch, { updated_at: new Date().toISOString() })
      return existing
    }

    const status: ClassTopicStatus = {
      id: makeId(),
      class_id: classId,
      topic_id: topicId,
      taught: patch.taught ?? false,
      notes: patch.notes ?? '',
      teaching_date: patch.teaching_date ?? null,
      updated_at: new Date().toISOString(),
    }
    classTopicStatuses.push(status)
    return status
  },
}
