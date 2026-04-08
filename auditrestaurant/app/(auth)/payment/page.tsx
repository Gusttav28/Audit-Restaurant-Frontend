"use client"

import React from "react"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, CreditCard, Lock, Loader2, Check, ArrowLeft, Shield } from "lucide-react"

const plans: Record<string, { name: string; price: number; period: string }> = {
  professional: {
    name: "Professional",
    price: 29,
    period: "/month"
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    period: "/month"
  }
}

function PaymentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan") || "professional"
  const plan = plans[planId] || plans.professional

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardName: "",
    country: "United States",
    zip: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    // Format card number with spaces
    if (name === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19)
    }

    // Format expiry as MM/YY
    if (name === "expiry") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4)
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2)
      }
    }

    // Limit CVC to 4 digits
    if (name === "cvc") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4)
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }))
    setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "Please enter a valid card number"
    }
    if (!formData.expiry || formData.expiry.length < 5) {
      newErrors.expiry = "Please enter expiry date"
    }
    if (!formData.cvc || formData.cvc.length < 3) {
      newErrors.cvc = "Please enter CVC"
    }
    if (!formData.cardName.trim()) {
      newErrors.cardName = "Please enter cardholder name"
    }
    if (!formData.zip.trim()) {
      newErrors.zip = "Please enter ZIP code"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update user subscription
    const userData = localStorage.getItem("auditflow_user")
    if (userData) {
      const user = JSON.parse(userData)
      user.subscription = {
        plan: planId,
        status: "active",
        startDate: new Date().toISOString(),
        billingCycle: "monthly",
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      localStorage.setItem("auditflow_user", JSON.stringify(user))
    }

    setIsProcessing(false)
    setPaymentSuccess(true)

    // Redirect after success
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-4">
            Your {plan.name} plan is now active. Redirecting to dashboard...
          </p>
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardCheck size={18} className="text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">AuditFlow</span>
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Step 2 of 2</span>
              <div className="flex gap-1">
                <div className="w-8 h-1 rounded-full bg-primary" />
                <div className="w-8 h-1 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Payment Form */}
          <div className="lg:col-span-3">
            <Link href="/subscription" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft size={16} />
              Back to plans
            </Link>

            <h1 className="text-2xl font-bold text-foreground mb-2">Payment details</h1>
            <p className="text-muted-foreground mb-8">
              Enter your card information to complete your subscription.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Number */}
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-foreground mb-2">
                  Card number
                </label>
                <div className="relative">
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-4 py-3 pl-12 bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                      errors.cardNumber ? "border-destructive" : "border-border"
                    }`}
                  />
                  <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-destructive">{errors.cardNumber}</p>
                )}
              </div>

              {/* Expiry and CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-foreground mb-2">
                    Expiry date
                  </label>
                  <input
                    id="expiry"
                    name="expiry"
                    type="text"
                    value={formData.expiry}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    className={`w-full px-4 py-3 bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                      errors.expiry ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.expiry && (
                    <p className="mt-1 text-sm text-destructive">{errors.expiry}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-foreground mb-2">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    name="cvc"
                    type="text"
                    value={formData.cvc}
                    onChange={handleChange}
                    placeholder="123"
                    className={`w-full px-4 py-3 bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                      errors.cvc ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.cvc && (
                    <p className="mt-1 text-sm text-destructive">{errors.cvc}</p>
                  )}
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-foreground mb-2">
                  Cardholder name
                </label>
                <input
                  id="cardName"
                  name="cardName"
                  type="text"
                  value={formData.cardName}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className={`w-full px-4 py-3 bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                    errors.cardName ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.cardName && (
                  <p className="mt-1 text-sm text-destructive">{errors.cardName}</p>
                )}
              </div>

              {/* Billing Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-foreground mb-2">
                    ZIP / Postal code
                  </label>
                  <input
                    id="zip"
                    name="zip"
                    type="text"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="12345"
                    className={`w-full px-4 py-3 bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                      errors.zip ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.zip && (
                    <p className="mt-1 text-sm text-destructive">{errors.zip}</p>
                  )}
                </div>
              </div>

              {/* Security Note */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock size={14} />
                <span>Your payment info is secured with 256-bit SSL encryption</span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-base"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${plan.price}${plan.period}`
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order summary</h2>

              <div className="pb-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{plan.name} Plan</span>
                  <span className="text-foreground">${plan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">Billed monthly</p>
              </div>

              <div className="py-4 border-b border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${plan.price}.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">$0.00</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">${plan.price}.00</span>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">30-day money-back guarantee</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Not satisfied? Get a full refund within 30 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentForm />
    </Suspense>
  )
}
