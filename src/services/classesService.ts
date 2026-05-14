import { hasSupabaseConfig, supabase } from '../lib/supabase'
import { mockStore } from './mockData'
import type { Classroom, UUID } from '../types/models'

const table = 'classes'

export const classesService = {
  async list(includeArchived = false): Promise<Classroom[]> {
    if (!hasSupabaseConfig || !supabase) {
      const classes = await mockStore.getClasses()
      return includeArchived ? classes : classes.filter((item) => !item.is_archived)
    }

    let query = supabase.from(table).select('*').order('name', { ascending: true })
    if (!includeArchived) {
      query = query.eq('is_archived', false)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Classroom[]
  },

  async create(name: string): Promise<Classroom> {
    if (!hasSupabaseConfig || !supabase) {
      return mockStore.createClass(name)
    }

    const { data, error } = await supabase.from(table).insert({ name }).select('*').single()
    if (error) throw error
    return data as Classroom
  },

  async update(id: UUID, patch: Partial<Pick<Classroom, 'name' | 'is_archived'>>): Promise<Classroom> {
    if (!hasSupabaseConfig || !supabase) {
      return mockStore.updateClass(id, patch)
    }

    const { data, error } = await supabase.from(table).update(patch).eq('id', id).select('*').single()
    if (error) throw error
    return data as Classroom
  },
}
