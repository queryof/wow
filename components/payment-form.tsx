"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLanguage } from "@/contexts/language-context"

interface PaymentFormProps {
  orderId: string
  amount: number
  onPaymentInitiated: (paymentId: string) => void
  onError: (error: string) => void
}

export function PaymentForm({ orderId, amount, onPaymentInitiated, onError }: PaymentFormProps) {
  const { t } = useLanguage()
  const [paymentMethod, setPaymentMethod] = useState("bkash")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount,
          paymentMethod,
          phoneNumber,
          transactionId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onPaymentInitiated(data.paymentId)
      } else {
        onError(data.error || "Payment failed")
      }
    } catch (error) {
      onError("Network error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4">{t("payment.selectMethod")}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-white mb-3 block">Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bkash" id="bkash" />
              <Label htmlFor="bkash" className="text-white">
                bKash
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nagad" id="nagad" />
              <Label htmlFor="nagad" className="text-white">
                Nagad
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rocket" id="rocket" />
              <Label htmlFor="rocket" className="text-white">
                Rocket
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank" id="bank" />
              <Label htmlFor="bank" className="text-white">
                Bank Transfer
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="phone" className="text-white">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            required
          />
        </div>

        <div>
          <Label htmlFor="transactionId" className="text-white">
            Transaction ID
          </Label>
          <Input
            id="transactionId"
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction ID"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            required
          />
        </div>

        <div className="bg-white/5 p-4 rounded-lg">
          <p className="text-white/80 text-sm">
            Amount to Pay: <span className="text-green-400 font-semibold">৳{amount} BDT</span>
          </p>
        </div>

        <Button type="submit" disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white">
          {isProcessing ? "Processing..." : "Confirm Payment"}
        </Button>
      </form>
    </div>
  )
}
