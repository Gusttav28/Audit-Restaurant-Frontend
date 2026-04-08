"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ClipboardCheck, Package, BarChart3, History, Users, Shield,
  ArrowRight, Check, Menu, X, ChevronRight
} from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Inventory Management",
    description: "Create and manage multiple inventories for kitchen, bar, storage, or any custom category with detailed item tracking.",
    href: "/features/inventory"
  },
  {
    icon: ClipboardCheck,
    title: "Real-time Auditing",
    description: "Perform accurate stock counts with live discrepancy detection. Track quantities in production, storage, and on sale.",
    href: "/features/audits"
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Generate comprehensive audit reports with visual analytics. Track trends, identify issues, and optimize inventory flow.",
    href: "/features/analytics"
  },
  {
    icon: History,
    title: "Audit History",
    description: "Maintain complete audit records with snapshots. Review past audits, compare results, and track improvements over time.",
    href: "/features/history"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Add team members, assign audit roles, and leave comments. Keep everyone aligned with shared audit visibility.",
    href: "/features/collaboration"
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Enterprise-grade security with encrypted data storage. Role-based access control and complete audit trails.",
    href: null
  }
]

const plans = [
  {
    name: "Basic",
    price: "$0",
    period: "/month",
    description: "For individuals getting started with inventory management.",
    features: [
      "Up to 2 inventories",
      "50 items per inventory",
      "30-day audit history",
      "Basic reporting",
      "Email support"
    ],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Professional",
    price: "$29",
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
    cta: "Get Started",
    popular: true
  },
  {
    name: "Enterprise",
    price: "$99",
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
    cta: "Contact Sales",
    popular: false
  }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardCheck size={18} className="text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">AuditFlow</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
              <Link href="/signup">
                <Button className="bg-foreground text-background hover:bg-foreground/90">
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-muted-foreground hover:text-foreground">Features</a>
              <a href="#pricing" className="block text-muted-foreground hover:text-foreground">Pricing</a>
              <Link href="/docs" className="block text-muted-foreground hover:text-foreground">Docs</Link>
              <Link href="/login" className="block text-muted-foreground hover:text-foreground">Log In</Link>
              <Link href="/signup" className="block">
                <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Now with real-time collaboration
            <ChevronRight size={14} />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance mb-6">
            Inventory Auditing<br />for Modern Teams
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Streamline your inventory management with powerful auditing tools. 
            Track stock, identify discrepancies, and maintain complete audit history across all your inventories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-base gap-2">
                Get Started Free
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="bg-transparent h-12 px-8 text-base">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Audits Completed" },
              { value: "99.9%", label: "Accuracy Rate" },
              { value: "2,500+", label: "Active Teams" },
              { value: "4.9/5", label: "Customer Rating" }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need for inventory control
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From basic stock tracking to advanced analytics, AuditFlow provides all the tools your team needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const CardWrapper = feature.href ? Link : 'div'
              return (
                <CardWrapper
                  key={feature.title} 
                  href={feature.href || ''}
                  className={`p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors group ${feature.href ? 'cursor-pointer' : ''}`}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    {feature.title}
                    {feature.href && <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardWrapper>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Plans and Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started immediately for free. Upgrade for more inventories, history, and collaboration.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative p-8 rounded-xl border ${
                  plan.popular 
                    ? 'bg-card border-primary shadow-lg shadow-primary/10' 
                    : 'bg-card border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={18} className="text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.name === "Enterprise" ? "/contact" : "/signup"}>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-foreground text-background hover:bg-foreground/90' 
                        : 'bg-transparent border border-border hover:bg-secondary'
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to streamline your audits?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of teams already using AuditFlow to manage their inventory with precision.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-base gap-2">
              Start Your Free Trial
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardCheck size={18} className="text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">AuditFlow</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 AuditFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
