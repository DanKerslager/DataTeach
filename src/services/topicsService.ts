import { hasSupabaseConfig, supabase } from '../lib/supabase'
import { mockStore } from './mockData'
import type { Topic, UUID } from '../types/models'

const table = 'topics'

export const topicsService = {
  async list(includeArchived = false): Promise<Topic[]> {
    if (!hasSupabaseConfig || !supabase) {
      const topics = await mockStore.getTopics()
      return includeArchived ? topics : topics.filter((topic) => !topic.is_archived)
    }

    let query = supabase.from(table).select('*').order('sort_order', { ascending: true })

    if (!includeArchived) {
      query = query.eq('is_archived', false)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Topic[]
  },

  async create(title: string, parentId: UUID | null, sortOrder: number): Promise<Topic> {
    if (!hasSupabaseConfig || !supabase) {
      return mockStore.createTopic({ title, parent_id: parentId, sort_order: sortOrder })
    }

    const { data, error } = await supabase
      .from(table)
      .insert({ title, parent_id: parentId, sort_order: sortOrder })
      .select('*')
      .single()

    if (error) throw error
    return data as Topic
  },

  async update(
    id: UUID,
    patch: Partial<Pick<Topic, 'title' | 'parent_id' | 'sort_order' | 'is_archived'>>,
  ): Promise<Topic> {
    if (!hasSupabaseConfig || !supabase) {
      return mockStore.updateTopic(id, patch)
    }

    const { data, error } = await supabase.from(table).update(patch).eq('id', id).select('*').single()

    if (error) throw error
    return data as Topic
  },
}
