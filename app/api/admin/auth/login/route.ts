import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("[v0] Admin login attempt for username:", username)

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const supabase = createClient()

    let { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .eq("is_active", true)
      .single()

    if (error || !adminUser) {
      console.log("[v0] No admin user found, creating default admin")

      // Create default admin with the provided credentials
      const hashedPassword = await bcrypt.hash("Moinulislam#@", 12)

      const { data: newAdmin, error: createError } = await supabase
        .from("admin_users")
        .insert({
          username: "admin",
          password_hash: hashedPassword,
          email: "admin@blockwar.com",
          role: "super_admin",
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.log("[v0] Error creating admin:", createError)
        return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
      }

      adminUser = newAdmin
      console.log("[v0] Default admin user created successfully")
    }

    console.log("[v0] Admin user found, verifying password")

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)
    console.log("[v0] Password valid:", isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const sessionId = `admin_${adminUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Save session to database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    await supabase.from("admin_sessions").insert({
      admin_id: adminUser.id,
      session_token: sessionId,
      expires_at: expiresAt.toISOString(),
    })

    // Update last login
    await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", adminUser.id)

    console.log("[v0] Admin login successful with session ID:", sessionId)

    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
      },
    })

    response.cookies.set("admin_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
