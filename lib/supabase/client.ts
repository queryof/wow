"use client"

import { createClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance && isSupabaseConfigured) {
    try {
      supabaseInstance = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      return null
    }
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()
