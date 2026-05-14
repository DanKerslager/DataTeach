import { createClient } from '@supabase/supabase-js'

function normalizeEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

function normalizeSupabaseUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return rawUrl

  // Users often paste the REST endpoint (.../rest/v1). Supabase client expects the project URL.
  return rawUrl.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
}

const supabaseUrl = normalizeSupabaseUrl(normalizeEnvValue(import.meta.env.VITE_SUPABASE_URL))
const supabaseAnonKey = normalizeEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY)
const isTestMode = import.meta.env.MODE === 'test'
const useSupabaseInTests = import.meta.env.VITE_USE_SUPABASE_IN_TESTS === 'true'

export const hasSupabaseConfig =
  Boolean(supabaseUrl && supabaseAnonKey) && (!isTestMode || useSupabaseInTests)

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null
