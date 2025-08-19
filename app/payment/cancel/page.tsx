"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Cancelled</CardTitle>
          <CardDescription>Your payment was cancelled. You can try again or continue shopping.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button onClick={() => router.push("/checkout")} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
