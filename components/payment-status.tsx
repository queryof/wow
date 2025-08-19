"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

interface PaymentStatusProps {
  paymentId: string
  orderId: string
  onStatusChange: (status: string) => void
}

export function PaymentStatus({ paymentId, orderId, onStatusChange }: PaymentStatusProps) {
  const { t } = useLanguage()
  const [status, setStatus] = useState("pending")
  const [isChecking, setIsChecking] = useState(false)

  const checkPaymentStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch(`/api/payments/verify?paymentId=${paymentId}`)
      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
        onStatusChange(data.status)
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Auto-check status every 10 seconds
    const interval = setInterval(checkPaymentStatus, 10000)
    return () => clearInterval(interval)
  }, [paymentId])

  const getStatusColor = () => {
    switch (status) {
      case "verified":
        return "text-green-400"
      case "failed":
        return "text-red-400"
      case "pending":
      default:
        return "text-yellow-400"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "verified":
        return "Payment Verified ✓"
      case "failed":
        return "Payment Failed ✗"
      case "pending":
      default:
        return "Payment Pending..."
    }
  }

  return (
    <div className="glass-card p-6 rounded-xl text-center">
      <div className="mb-4">
        <div className={`text-2xl font-semibold ${getStatusColor()}`}>{getStatusText()}</div>
        <p className="text-white/70 mt-2">Payment ID: {paymentId}</p>
      </div>

      {status === "pending" && (
        <div className="space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-white/80">Verifying your payment... This may take a few minutes.</p>
          <Button
            onClick={checkPaymentStatus}
            disabled={isChecking}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            {isChecking ? "Checking..." : "Check Status"}
          </Button>
        </div>
      )}

      {status === "verified" && (
        <div className="space-y-4">
          <div className="text-green-400 text-4xl">✓</div>
          <p className="text-white">Your payment has been verified! Your order is now being processed.</p>
        </div>
      )}

      {status === "failed" && (
        <div className="space-y-4">
          <div className="text-red-400 text-4xl">✗</div>
          <p className="text-white">Payment verification failed. Please contact support or try again.</p>
          <Button onClick={checkPaymentStatus} className="bg-red-600 hover:bg-red-700 text-white">
            Retry Verification
          </Button>
        </div>
      )}
    </div>
  )
}
