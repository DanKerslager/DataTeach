import { hasSupabaseConfig, supabase } from '../lib/supabase'

function normalizeSiteUrl(rawUrl: string | undefined): string | undefined {
  const trimmed = rawUrl?.trim()
  return trimmed && trimmed.length > 0 ? trimmed.replace(/\/+$/, '') : undefined
}

const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL) ?? window.location.origin

export const authService = {
  async getUserId(): Promise<string | null> {
    if (!hasSupabaseConfig || !supabase) return 'demo-local-user'

    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user?.id ?? null
  },

  async signInWithMagicLink(email: string): Promise<void> {
    if (!hasSupabaseConfig || !supabase) return

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: siteUrl,
      },
    })

    if (error) throw error
  },

  async signOut(): Promise<void> {
    if (!hasSupabaseConfig || !supabase) return

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getUserEmail(): Promise<string | null> {
    if (!hasSupabaseConfig || !supabase) return 'demo@local'

    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user?.email ?? null
  },
}
