"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  const transactionId = searchParams.get("transactionId")
  const paymentAmount = searchParams.get("paymentAmount")
  const paymentMethod = searchParams.get("paymentMethod")
  const status = searchParams.get("status")

  useEffect(() => {
    if (transactionId) {
      verifyPayment()
    }
  }, [transactionId])

  const verifyPayment = async () => {
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionId }),
      })

      const result = await response.json()
      setVerificationResult(result)
    } catch (error) {
      console.error("Payment verification failed:", error)
      setVerificationResult({ success: false, error: "Verification failed" })
    } finally {
      setIsVerifying(false)
    }
  }

  const getStatusIcon = () => {
    if (status === "success" || verificationResult?.payment_status === "success") {
      return <CheckCircle className="h-16 w-16 text-green-600" />
    } else if (status === "pending" || verificationResult?.payment_status === "pending") {
      return <Loader2 className="h-16 w-16 text-yellow-600" />
    } else {
      return <CheckCircle className="h-16 w-16 text-red-600" />
    }
  }

  const getStatusTitle = () => {
    if (status === "success" || verificationResult?.payment_status === "success") {
      return "Payment Successful!"
    } else if (status === "pending" || verificationResult?.payment_status === "pending") {
      return "Payment Pending"
    } else {
      return "Payment Declined"
    }
  }

  const getStatusDescription = () => {
    if (status === "success" || verificationResult?.payment_status === "success") {
      return "Your payment has been processed successfully."
    } else if (status === "pending" || verificationResult?.payment_status === "pending") {
      return "Your payment is being processed. Please wait for confirmation."
    } else {
      return "Your payment was declined or cancelled."
    }
  }

  const getStatusColor = () => {
    if (status === "success" || verificationResult?.payment_status === "success") {
      return "text-green-600"
    } else if (status === "pending" || verificationResult?.payment_status === "pending") {
      return "text-yellow-600"
    } else {
      return "text-red-600"
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-center text-gray-600">Verifying your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">{getStatusIcon()}</div>
          <CardTitle className={`text-2xl ${getStatusColor()}`}>{getStatusTitle()}</CardTitle>
          <CardDescription>{getStatusDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactionId && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Transaction ID:</strong> {transactionId}
              </p>
              {paymentAmount && (
                <p className="text-sm">
                  <strong>Amount:</strong> ৳{paymentAmount}
                </p>
              )}
              {paymentMethod && (
                <p className="text-sm">
                  <strong>Method:</strong> {paymentMethod}
                </p>
              )}
              <p className="text-sm">
                <strong>Status:</strong> {status || verificationResult?.payment_status || "Unknown"}
              </p>
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <Button onClick={() => router.push("/")} className="w-full">
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => router.push("/orders")} className="w-full">
              View Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
