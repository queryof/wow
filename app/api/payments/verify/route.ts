import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId } = body

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 })
    }

    const nagorikPayResponse = await fetch("https://secure-pay.nagorikpay.com/api/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": "L6XRNgC3tM1KmfUM3rcwqau5r9n9EWTZ69vlWvqkEifzSM6vJO",
      },
      body: JSON.stringify({
        transaction_id: transactionId,
      }),
    })

    const nagorikPayData = await nagorikPayResponse.json()

    if (!nagorikPayData.status || nagorikPayData.status === "ERROR") {
      return NextResponse.json(
        {
          success: false,
          error: nagorikPayData.message || "Payment verification failed",
        },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database connection not available" }, { status: 500 })
    }

    let paymentStatus: string
    let deliveryStatus: string

    if (nagorikPayData.status === "COMPLETED" || nagorikPayData.status === "SUCCESS") {
      paymentStatus = "completed"
      deliveryStatus = "processing"
    } else if (nagorikPayData.status === "PENDING") {
      paymentStatus = "pending"
      deliveryStatus = "pending"
    } else {
      paymentStatus = "failed"
      deliveryStatus = "declined"
    }

    // Find order by metadata if available, otherwise by transaction_id
    const orderId = nagorikPayData.metadata?.order_id

    if (orderId) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: paymentStatus,
          delivery_status: deliveryStatus,
          transaction_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        console.error("Order update error:", updateError)
        return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      status: nagorikPayData.status,
      payment_status: paymentStatus,
      delivery_status: deliveryStatus,
      customer_name: nagorikPayData.cus_name,
      customer_email: nagorikPayData.cus_email,
      amount: nagorikPayData.amount,
      payment_method: nagorikPayData.payment_method,
      transaction_id: nagorikPayData.transaction_id,
      message: "Payment verified successfully",
    })
  } catch (error) {
    console.error("Payment verification API Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
