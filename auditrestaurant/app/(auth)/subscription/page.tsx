"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, Check, ArrowRight, ArrowLeft } from "lucide-react"

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "/month",
    description: "For individuals getting started with inventory management.",
    features: [
      "Up to 2 inventories",
      "50 items per inventory",
      "30-day audit history",
      "Basic reporting",
      "Email support"
    ],
    popular: false
  },
  {
    id: "professional",
    name: "Professional",
    price: 29,
    period: "/month",
    description: "For growing businesses that need advanced features.",
    features: [
      "Unlimited inventories",
      "Unlimited items",
      "1-year audit history",
      "Advanced analytics",
      "Custom units & categories",
      "Team collaboration (5 users)",
      "Priority support"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    period: "/month",
    description: "For large organizations requiring full control.",
    features: [
      "Everything in Professional",
      "Unlimited audit history",
      "Unlimited team members",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "SLA guarantee"
    ],
    popular: false
  }
]

export default function SubscriptionPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("auditflow_user")
    if (userData) {
      const user = JSON.parse(userData)
      setUserName(user.name || "there")
    }
  }, [])

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleContinue = () => {
    if (selectedPlan === "basic") {
      // Free plan - activate immediately
      const userData = localStorage.getItem("auditflow_user")
      if (userData) {
        const user = JSON.parse(userData)
        user.subscription = {
          plan: "basic",
          status: "active",
          startDate: new Date().toISOString()
        }
        localStorage.setItem("auditflow_user", JSON.stringify(user))
      }
      router.push("/")
    } else {
      // Paid plans - go to payment
      router.push(`/payment?plan=${selectedPlan}`)
    }
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
              <span>Step 1 of 2</span>
              <div className="flex gap-1">
                <div className="w-8 h-1 rounded-full bg-primary" />
                <div className="w-8 h-1 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Welcome, {userName}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that best fits your needs. You can upgrade or downgrade anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => handleSelectPlan(plan.id)}
              className={`relative p-6 rounded-xl border text-left transition-all ${
                selectedPlan === plan.id
                  ? "bg-card border-primary ring-2 ring-primary/20"
                  : "bg-card border-border hover:border-muted-foreground/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Recommended
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold text-foreground">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                }`}>
                  {selectedPlan === plan.id && (
                    <Check size={12} className="text-primary-foreground" />
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground gap-2">
              <ArrowLeft size={18} />
              Back
            </Button>
          </Link>
          <Button
            onClick={handleContinue}
            disabled={!selectedPlan}
            className="bg-foreground text-background hover:bg-foreground/90 h-11 px-6 gap-2"
          >
            {selectedPlan === "basic" ? "Start Free" : "Continue to Payment"}
            <ArrowRight size={18} />
          </Button>
        </div>
      </main>
    </div>
  )
}
