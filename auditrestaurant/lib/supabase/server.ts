import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/database.types"
import { assertSupabaseBrowserEnv } from "@/lib/supabase/config"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const { supabaseUrl, supabasePublishableKey } = assertSupabaseBrowserEnv()

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot always set cookies. Middleware handles session refresh.
        }
      },
    },
  })
}
