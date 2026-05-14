import { hasSupabaseConfig, supabase } from '../lib/supabase'

export const authService = {
  async signInWithMagicLink(email: string): Promise<void> {
    if (!hasSupabaseConfig || !supabase) return

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
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
