import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, status, metadata } = body

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database connection not available" }, { status: 500 })
    }

    // Update order status based on webhook data
    const paymentStatus = status === "COMPLETED" ? "completed" : status === "PENDING" ? "pending" : "failed"

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata?.order_id)

    if (updateError) {
      console.error("Webhook order update error:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
