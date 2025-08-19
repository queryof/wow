import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { data: rooms, error } = await supabase
      .from("chat_rooms")
      .select(`
        *,
        chat_participants!inner(count)
      `)
      .eq("is_active", true)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch chat rooms" }, { status: 500 })
    }

    // Transform the data to include participant counts
    const roomsWithCounts =
      rooms?.map((room) => ({
        ...room,
        participant_count: room.chat_participants?.length || 0,
        last_message: "Sample message", // This would come from actual last message
        last_activity: room.updated_at,
      })) || []

    return NextResponse.json({ rooms: roomsWithCounts })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
