import { createClient as _createClient } from "@supabase/supabase-js"
import { cache } from "react"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.SUPABASE_SERVICE_ROLE_KEY === "string" &&
  process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0

// Create a cached version of the Supabase client for Server Components
export const createServerClient = cache(() => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set.")
    return null
  }

  return _createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
})

export const createClient = createServerClient
