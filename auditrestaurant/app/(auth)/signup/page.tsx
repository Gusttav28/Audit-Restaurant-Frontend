"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import AuditFlowLogo from "@/components/layout/audit-flow-logo"
import { ClipboardCheck, Eye, EyeOff, Loader2, Check } from "lucide-react"
import { clearSupabaseBrowserState, createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: ""
  })

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(formData.password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) }
  ]

  const allRequirementsMet = passwordRequirements.every(req => req.met)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!allRequirementsMet) {
      setError("Please meet all password requirements")
      return
    }

    setIsLoading(true)
    setError("")

    if (formData.name && formData.email && formData.password) {
      await createSupabaseBrowserClient().auth.signOut({ scope: "global" })
      clearSupabaseBrowserState()
      const response = await fetch("/api/signup-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const workspaceResult = await response.json().catch(() => null)

      if (!response.ok) {
        setError(workspaceResult?.error ?? "Unable to create your workspace. Please try again.")
        setIsLoading(false)
        return
      }

      const supabase = createSupabaseBrowserClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        setError("Account created. Please confirm your email if required, then sign in.")
        setIsLoading(false)
        return
      }

      if (data.user) {
        localStorage.setItem("auditflow_user", JSON.stringify({
          email: data.user.email ?? formData.email,
          name: formData.name,
          company: formData.company,
          subscription: null,
          createdAt: new Date().toISOString()
        }))
        sessionStorage.setItem("auditflow-auth-transition", "login")
        window.location.assign("/dashboard")
      } else {
        setError("Account created. Please sign in to continue.")
        setIsLoading(false)
      }
    } else {
      setError("Please fill in all required fields")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-card border-r border-border items-center justify-center p-12">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
            <ClipboardCheck size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Start managing your inventory today
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Create unlimited inventories, perform precise audits, and gain insights 
            into your stock flow. Audit Coflow helps teams stay organized and accountable.
          </p>
          
          <div className="space-y-4">
            {[
              "Create multiple inventories (kitchen, bar, storage)",
              "Track stock quantities and discrepancies",
              "Maintain complete audit history",
              "Collaborate with your team"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check size={12} className="text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12">
            <AuditFlowLogo imageClassName="h-10 w-10 rounded-lg" textClassName="text-foreground" />
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              Start your free trial. No credit card required.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                Company name <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Acme Inc."
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        req.met ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        {req.met && <Check size={10} className="text-primary" />}
                      </div>
                      <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !allRequirementsMet}
              className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
