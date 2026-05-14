import { hasSupabaseConfig, supabase } from '../lib/supabase'
import { mockStore } from './mockData'
import type { ClassTopicStatus, StatusPatch, UUID } from '../types/models'

const table = 'class_topic_status'

export const progressService = {
  async listForClass(classId: UUID): Promise<ClassTopicStatus[]> {
    if (!hasSupabaseConfig || !supabase) {
      return mockStore.getClassStatuses(classId)
    }

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('class_id', classId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data as ClassTopicStatus[]
  },

  async upsert(classId: UUID, topicId: UUID, patch: StatusPatch): Promise<ClassTopicStatus> {
    if (!hasSupabaseConfig || !supabase) {
      return mockStore.upsertClassStatus(classId, topicId, patch)
    }

    const payload = {
      class_id: classId,
      topic_id: topicId,
      taught: patch.taught ?? false,
      notes: patch.notes ?? '',
      teaching_date: patch.teaching_date ?? null,
    }

    const { data, error } = await supabase
      .from(table)
      .upsert(payload, { onConflict: 'class_id,topic_id' })
      .select('*')
      .single()

    if (error) throw error
    return data as ClassTopicStatus
  },
}
