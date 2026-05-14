export type UUID = string

export interface Topic {
  id: UUID
  user_id: UUID
  title: string
  parent_id: UUID | null
  sort_order: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Classroom {
  id: UUID
  user_id: UUID
  name: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface ClassTopicStatus {
  id: UUID
  class_id: UUID
  topic_id: UUID
  taught: boolean
  notes: string
  teaching_date: string | null
  updated_at: string
}

export interface TopicNode extends Topic {
  children: TopicNode[]
}

export interface StatusPatch {
  taught?: boolean
  notes?: string
  teaching_date?: string | null
}
