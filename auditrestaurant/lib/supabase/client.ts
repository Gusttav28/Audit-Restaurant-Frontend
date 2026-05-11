"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/database.types"
import { assertSupabaseBrowserEnv } from "@/lib/supabase/config"

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabasePublishableKey } = assertSupabaseBrowserEnv()
  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey)
}

export function clearSupabaseBrowserState() {
  if (typeof window === "undefined") return

  const shouldClear = (key: string) => key.startsWith("sb-") || key.includes("supabase") || key.includes("auditflow_user")

  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index)
    if (key && shouldClear(key)) window.localStorage.removeItem(key)
  }

  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index)
    if (key && shouldClear(key)) window.sessionStorage.removeItem(key)
  }

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim()
    if (!name || !shouldClear(name)) return
    document.cookie = `${name}=; Max-Age=0; path=/`
  })
}
