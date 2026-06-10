export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
export const hasSupabaseBrowserEnv = Boolean(supabaseUrl && supabasePublishableKey)

export function assertSupabaseBrowserEnv(): { supabaseUrl: string; supabasePublishableKey: string } {
  if (!hasSupabaseBrowserEnv) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  }
  return {
    supabaseUrl: supabaseUrl as string,
    supabasePublishableKey: supabasePublishableKey as string,
  }
}
