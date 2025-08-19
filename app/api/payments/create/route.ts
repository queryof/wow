import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, customerName, customerEmail, amount } = body

    if (!orderId || !customerName || !customerEmail || !amount) {
      return NextResponse.json(
        { success: false, error: "Customer name, email, and amount are required" },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database connection not available" }, { status: 500 })
    }

    const nagorikPayResponse = await fetch("https://secure-pay.nagorikpay.com/api/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": "L6XRNgC3tM1KmfUM3rcwqau5r9n9EWTZ69vlWvqkEifzSM6vJO",
      },
      body: JSON.stringify({
        cus_name: customerName,
        cus_email: customerEmail,
        amount: amount.toString(),
        success_url: `https://v0-fork-of-minecraft-server-websto.vercel.app/payment/success`,
        cancel_url: `https://v0-fork-of-minecraft-server-websto.vercel.app/payment/cancel`,
        webhook_url: `https://v0-fork-of-minecraft-server-websto.vercel.app/api/payments/webhook`,
        metadata: {
          order_id: orderId,
        },
      }),
    })

    const nagorikPayData = await nagorikPayResponse.json()

    if (!nagorikPayData.status) {
      return NextResponse.json(
        {
          success: false,
          error: nagorikPayData.message || "Failed to create payment URL",
        },
        { status: 400 },
      )
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_method: "nagorikpay",
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Order update error:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      payment_url: nagorikPayData.payment_url,
      message: "Payment URL created successfully",
    })
  } catch (error) {
    console.error("Payment API Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
