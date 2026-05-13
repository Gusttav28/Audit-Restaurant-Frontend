"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileText,
  Globe2,
  History,
  LockKeyhole,
  Menu,
  Moon,
  Package,
  Shield,
  Sparkles,
  Sun,
  Users,
  Workflow,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import AuditFlowLogo from "@/components/layout/audit-flow-logo"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { isMacPlatform, shouldIgnoreShortcut, withShortcut } from "@/components/layout/shortcut-utils"

const productModules = [
  {
    icon: Database,
    title: "Inventory Database",
    description: "Every location keeps its own items, suppliers, units, phases, and stock history.",
    href: "/features/inventory-database",
  },
  {
    icon: ClipboardCheck,
    title: "Audit Functions",
    description: "Assign counts, capture current stock, resolve discrepancies, and complete audit reports.",
    href: "/features/audit-functions",
  },
  {
    icon: LockKeyhole,
    title: "Authentication",
    description: "Give admins, auditors, and collaborators exactly the access they need per restaurant.",
    href: "/features/authentication",
  },
  {
    icon: BarChart3,
    title: "Analytics API",
    description: "Track audit trends, issue severity, inventory value, and completed work by restaurant.",
    href: "/features/analytics-api",
  },
  {
    icon: FileText,
    title: "Reports",
    description: "Review audit results, track issue trends, and export business-ready inventory insights.",
    href: "/features/reports",
  },
  {
    icon: Globe2,
    title: "Remote Access",
    description: "Manage audits and inventory from any restaurant or location your account can access.",
    href: "/features/remote-access",
  },
]

const capabilities = [
  "Multi-restaurant switching",
  "Supabase-backed auth",
  "Audit assignment tasks",
  "CSV and PDF exports",
  "Spanish and English UI",
  "Dark and light mode",
]

const platformTiles = [
  {
    icon: Database,
    title: "Inventory Database",
    copy: "Portable restaurant data for products, units, suppliers, categories, and stock snapshots.",
    bullets: ["Restaurant scoped", "Stock history", "Supplier records"],
    accent: "primary",
    href: "/features/inventory-database",
  },
  {
    icon: LockKeyhole,
    title: "Authentication",
    copy: "Sign in users, assign restaurants, and keep permissions per location.",
    bullets: ["Owner access", "Read + Audit", "Multi-location"],
    accent: "accent",
    href: "/features/authentication",
  },
  {
    icon: Workflow,
    title: "Audit Functions",
    copy: "Create audit tasks, save rows, complete counts, and update inventory quantities.",
    bullets: ["Row saves", "Save all", "Exports"],
    accent: "primary",
    href: "/features/audit-functions",
  },
  {
    icon: Shield,
    title: "Authorized Area",
    copy: "Protect dashboard routes, restaurant data, settings, and actions by user permissions.",
    bullets: ["Protected routes", "User restrictions", "Team access"],
    accent: "accent",
    href: "/features/authorized-area",
  },
  {
    icon: Bell,
    title: "Real-Time Tasks",
    copy: "Assigned audit work appears as actionable notifications for the right user.",
    bullets: ["Due dates", "Helpers", "Status"],
    accent: "primary",
    href: "/features/real-time-tasks",
  },
  {
    icon: BarChart3,
    title: "Analytics API",
    copy: "Turn completed audits into issue, value, discrepancy, and trend reports.",
    bullets: ["Metrics", "Charts", "CSV / PDF"],
    accent: "accent",
    href: "/features/analytics-api",
  },
  {
    icon: FileText,
    title: "Reports",
    copy: "Review audit results, issue trends, inventory performance, and export business summaries.",
    bullets: ["Audit results", "Trends", "Exports"],
    accent: "primary",
    href: "/features/reports",
  },
  {
    icon: Globe2,
    title: "Remote Access",
    copy: "Work from assigned restaurants and locations while preserving account permissions.",
    bullets: ["Anywhere access", "Scoped data", "Mobile ready"],
    accent: "accent",
    href: "/features/remote-access",
  },
]

const workflowSteps = [
  {
    title: "Create audit",
    eyebrow: "Step 01",
    description: "Admin selects the restaurant, inventory, date, responsible auditor, and optional helper.",
    metric: "2 min",
  },
  {
    title: "Count stock",
    eyebrow: "Step 02",
    description: "Auditors enter current stock, save rows, and see sold or discrepancy values instantly.",
    metric: "12 / 15",
  },
  {
    title: "Complete report",
    eyebrow: "Step 03",
    description: "The completed audit exports to CSV/PDF and becomes the inventory’s new stock snapshot.",
    metric: "100%",
  },
]

const plans = [
  {
    name: "Launch",
    price: "$0",
    description: "For a single restaurant validating the flow.",
    features: ["2 inventory areas", "50 products", "30-day audit history", "Basic reports"],
  },
  {
    name: "Operate",
    price: "$29",
    description: "For teams running daily inventory controls.",
    features: ["Unlimited inventory areas", "Team permissions", "Audit assignments", "Advanced reports"],
    popular: true,
  },
  {
    name: "Scale",
    price: "$99",
    description: "For groups managing multiple restaurants.",
    features: ["Multi-location access", "Unlimited members", "Full audit history", "Priority support"],
  },
]

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTile, setActiveTile] = useState(0)
  const [workflowStep, setWorkflowStep] = useState(0)
  const isLightMode = theme === "light"

  useEffect(() => {
    let mounted = true
    createSupabaseBrowserClient().auth.getSession().then(({ data }) => {
      if (mounted) setIsLoggedIn(Boolean(data.session))
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreShortcut(event)) return
      const hasModifier = isMacPlatform() ? event.metaKey : event.ctrlKey
      if (!hasModifier || event.altKey || event.shiftKey || event.key.toLowerCase() !== "b") return
      event.preventDefault()
      setTheme(isLightMode ? "dark" : "light")
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isLightMode, setTheme])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWorkflowStep((step) => (step + 1) % workflowSteps.length)
    }, 2600)
    return () => window.clearInterval(timer)
  }, [])

  const appHref = isLoggedIn ? "/dashboard" : "/signup"
  const appCta = isLoggedIn ? "Open dashboard" : "Start your workspace"

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <AuditFlowLogo imageClassName="h-8 w-8 rounded-md" textClassName="text-foreground" />
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a href="#platform" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Platform</a>
            <a href="#workflow" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Workflow</a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
            <Link href="/docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Docs</Link>
            <Button
              variant="outline"
              size="icon"
              className="bg-secondary/20"
              aria-label={withShortcut(isLightMode ? "Dark mode" : "Light mode", "theme")}
              title={withShortcut(isLightMode ? "Dark mode" : "Light mode", "theme")}
              onClick={() => setTheme(isLightMode ? "dark" : "light")}
            >
              {isLightMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
            </Button>
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="bg-foreground text-background hover:bg-foreground/90">{appCta}</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Sign in</Link>
                <Link href="/signup">
                  <Button className="bg-foreground text-background hover:bg-foreground/90">Start your workspace</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden">
            <div className="space-y-4">
              <a href="#platform" className="block text-muted-foreground hover:text-foreground">Platform</a>
              <a href="#workflow" className="block text-muted-foreground hover:text-foreground">Workflow</a>
              <a href="#pricing" className="block text-muted-foreground hover:text-foreground">Pricing</a>
              <Link href="/docs" className="block text-muted-foreground hover:text-foreground">Docs</Link>
              <Button variant="outline" className="w-full justify-start gap-2 bg-secondary/20" onClick={() => setTheme(isLightMode ? "dark" : "light")}>
                {isLightMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
                {withShortcut(isLightMode ? "Dark mode" : "Light mode", "theme")}
              </Button>
              <Link href={appHref} className="block">
                <Button className="w-full bg-foreground text-background hover:bg-foreground/90">{appCta}</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main>
        <section className="relative px-4 pt-28 sm:px-6 lg:px-8">
          <div className="absolute inset-x-0 top-16 -z-10 h-[680px] bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.24),transparent_32%),linear-gradient(180deg,rgba(89,20,48,0.20),transparent_58%)]" />
          <div className="mx-auto max-w-7xl">
            <Link href="/docs" className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground">
              <Sparkles size={15} className="text-primary" />
              Supabase-backed workspaces are live
              <ChevronRight size={14} />
            </Link>

            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Run every inventory audit from one source of truth
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
                Audit Co-Flow connects restaurants, inventories, team permissions, and audit history into a fast operational workspace for modern hospitality teams.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href={appHref}>
                  <Button size="lg" className="h-12 gap-2 bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                    {appCta}
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="#workflow">
                  <Button size="lg" variant="outline" className="h-12 bg-background/40 px-6 backdrop-blur">
                    See the workflow
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mx-auto mt-16 grid max-w-7xl gap-4 lg:grid-cols-4">
              {platformTiles.map((tile, index) => {
                const Icon = tile.icon
                const isActive = activeTile === index
                return (
                  <Link
                    key={tile.title}
                    href={tile.href}
                    onMouseEnter={() => setActiveTile(index)}
                    onFocus={() => setActiveTile(index)}
                    className={`group relative min-h-72 cursor-pointer overflow-hidden rounded-2xl border bg-card p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                    } ${isActive ? "border-primary/50" : "border-border"}`}
                  >
                    <div className="relative z-10">
                      <div className="mb-8 flex items-center gap-3">
                        <Icon size={22} className={tile.accent === "accent" ? "text-accent" : "text-primary"} />
                        <h3 className="text-xl font-semibold text-foreground">{tile.title}</h3>
                      </div>
                      <p className={`${index === 0 ? "max-w-sm text-lg leading-8" : "text-base leading-7"} text-muted-foreground`}>
                        {tile.copy}
                      </p>
                      <div className={`mt-10 space-y-2 ${index === 0 ? "" : "text-sm"}`}>
                        {tile.bullets.map((bullet) => (
                          <div key={bullet} className="flex items-center gap-2 text-foreground">
                            <Check size={16} className={tile.accent === "accent" ? "text-accent" : "text-primary"} />
                            {bullet}
                          </div>
                        ))}
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="absolute bottom-8 right-8 hidden h-56 w-56 rounded-[3rem] border border-primary/25 bg-primary/5 lg:block">
                        <div className="absolute inset-5 rounded-[2.4rem] border border-accent/25" />
                        <div className="absolute left-1/2 top-7 h-32 w-1 -translate-x-1/2 rounded-full bg-primary/50" />
                        <div className="absolute bottom-12 left-12 h-20 w-32 rounded-full border-4 border-accent/40" />
                        <div className="absolute right-11 top-16 h-6 w-6 rounded-full border border-primary/60" />
                      </div>
                    )}
                    {index === 1 && (
                      <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-3 border-t border-border p-4 opacity-50 transition-opacity group-hover:opacity-90">
                        {["owner@goflow.example", "audit@goflow.example", "••••••••", "assigned"].map((cell) => (
                          <span key={cell} className="truncate rounded-lg border border-border bg-background/60 px-3 py-3 font-mono text-xs text-muted-foreground">{cell}</span>
                        ))}
                      </div>
                    )}
                    {index === 2 && (
                      <div className="absolute bottom-7 right-5 h-40 w-64 opacity-50 transition-opacity group-hover:opacity-90">
                        <div className="absolute inset-0 rounded-full border border-primary/30" />
                        <div className="absolute inset-8 rounded-full border border-accent/30" />
                        <div className="absolute left-1/2 top-1/2 h-px w-28 origin-left rotate-45 bg-primary/60" />
                        <div className="absolute left-8 top-20 h-2 w-2 rounded-full bg-primary" />
                        <div className="absolute right-10 bottom-8 h-2 w-2 rounded-full bg-accent" />
                      </div>
                    )}
                    {index === 3 && (
                      <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3 opacity-45 transition-opacity group-hover:opacity-90">
                        {Array.from({ length: 6 }).map((_, itemIndex) => (
                          <div key={itemIndex} className="aspect-square rounded-lg border border-border bg-background/60" />
                        ))}
                      </div>
                    )}
                    {index === 4 && (
                      <div className="absolute bottom-6 left-6 right-6 h-32 rounded-lg border border-border bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:20px_20px] opacity-70">
                        <div className="absolute bottom-7 left-20 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">Audit ready</div>
                        <div className="absolute right-7 top-7 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">Audit User</div>
                      </div>
                    )}
                    {index === 5 && (
                      <div className="absolute bottom-6 left-6 right-6 space-y-3 opacity-55 transition-opacity group-hover:opacity-90">
                        {["/v1/audits", "/v1/items", "/v1/reports"].map((endpoint) => (
                          <div key={endpoint} className="flex items-center justify-between rounded-full border border-border bg-background/60 px-4 py-2 text-xs">
                            <span className="text-muted-foreground">GET</span>
                            <span className="font-mono text-foreground">{endpoint}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card/30 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-6 text-center text-sm text-muted-foreground">Built for restaurant groups, bars, kitchens, and audit teams</p>
            <div className="grid grid-cols-2 gap-3 text-center text-sm font-medium text-muted-foreground sm:grid-cols-4 lg:grid-cols-6">
              {["GoFlow Restaurant", "GoFlow Bar Template", "GoFlow Kitchen Template", "GoFlow Group", "GoFlow Stock Room", "GoFlow Audit Ops"].map((name) => (
                <div key={name} className="cursor-default rounded-lg border border-border bg-background/40 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground">{name}</div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-3xl">
              <p className="text-sm font-medium text-primary">Use one module or the whole platform</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Best-of-breed controls, integrated around restaurant operations.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {productModules.map((module) => (
                <Link key={module.title} href={module.href} className="group rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <module.icon size={20} className="text-primary transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Learn more
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-card/30 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-medium text-primary">Stay productive inside the dashboard</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Create, assign, audit, export, and update stock without leaving the flow.
              </h2>
              <p className="mt-5 text-muted-foreground">
                Audit Co-Flow keeps live restaurant context, permissions, audit tasks, and inventory updates connected through Supabase.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {capabilities.map((capability) => (
                  <div key={capability} className="flex cursor-default items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5">
                    <Check size={16} className="text-primary" />
                    {capability}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-2 shadow-xl">
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-destructive" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="rounded-md border border-border bg-secondary/30 px-3 py-1 text-xs text-muted-foreground">
                    Workflow video
                  </div>
                </div>
                <div className="grid gap-0 xl:grid-cols-[220px_1fr]">
                  <aside className="hidden border-r border-border bg-background/50 p-4 xl:block">
                    <div className="mb-5 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15">
                        <Building2 size={17} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">GoFlow Restaurant</p>
                        <p className="text-xs text-muted-foreground">Bar · Audit</p>
                      </div>
                    </div>
                    {workflowSteps.map((step, index) => (
                      <button
                        key={step.title}
                        type="button"
                        onClick={() => setWorkflowStep(index)}
                        className={`mb-2 w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          workflowStep === index ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        }`}
                      >
                        {step.title}
                      </button>
                    ))}
                  </aside>
                  <div className="p-4 sm:p-6">
                    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm font-medium text-primary">{workflowSteps[workflowStep].eyebrow}</p>
                        <h3 className="mt-1 text-2xl font-semibold text-foreground">{workflowSteps[workflowStep].title}</h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{workflowSteps[workflowStep].description}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background/60 px-4 py-3 text-right">
                        <p className="text-xs text-muted-foreground">Live state</p>
                        <p className="text-2xl font-semibold text-foreground">{workflowSteps[workflowStep].metric}</p>
                      </div>
                    </div>
                    <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${((workflowStep + 1) / workflowSteps.length) * 100}%` }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {[
                        ["Restaurant", "GoFlow Restaurant", "Costa Rica · CRC"],
                        ["Inventory", workflowStep === 0 ? "Choose Bar" : "Bar", workflowStep === 2 ? "Stock updated" : "15 products"],
                        ["Responsible", workflowStep === 0 ? "Assign Audit User" : "Audit User", workflowStep === 2 ? "Completed" : "In progress"],
                      ].map(([label, value, hint]) => (
                        <div key={label} className="cursor-default rounded-lg border border-border bg-background/60 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 overflow-hidden rounded-lg border border-border">
                      {[
                        ["Gin premium", workflowStep === 0 ? "Previous 12" : workflowStep === 1 ? "Current 9" : "New stock 9", "Sold 3"],
                        ["Tonic water", workflowStep === 0 ? "Previous 8" : workflowStep === 1 ? "Current 7" : "New stock 7", "Sold 1"],
                        ["Lime juice", workflowStep === 0 ? "Previous 5 L" : workflowStep === 1 ? "Current 4 L" : "New stock 4 L", workflowStep === 2 ? "Exported" : "Merma"],
                      ].map(([name, qty, result], index) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setWorkflowStep((index + workflowStep) % workflowSteps.length)}
                          className="grid w-full grid-cols-[1.3fr_1fr_auto] gap-3 border-b border-border bg-background px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-secondary/40"
                        >
                          <span className="font-medium text-foreground">{name}</span>
                          <span className="text-muted-foreground">{qty}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs text-white ${workflowStep === 2 ? "bg-emerald-600" : index === 2 ? "bg-yellow-600" : "bg-primary"}`}>{result}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {workflowSteps.map((step, index) => (
                        <button
                          key={step.title}
                          type="button"
                          onClick={() => setWorkflowStep(index)}
                          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                            workflowStep === index
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {step.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Simple plans for every operating rhythm</h2>
              <p className="mt-4 text-muted-foreground">Start small, then add restaurants, users, and deeper audit history as the team grows.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.name} className={`relative rounded-xl border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 ${plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"}`}>
                  {plan.popular && (
                    <span className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Recommended</span>
                  )}
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <p className="mt-2 min-h-12 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-4xl font-semibold text-foreground">{plan.price}</span>
                    <span className="pb-1 text-sm text-muted-foreground">/month</span>
                  </div>
                  <ul className="mt-7 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm text-muted-foreground">
                        <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="mt-7 block">
                    <Button className={`w-full ${plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-transparent"}`} variant={plan.popular ? "default" : "outline"}>
                      Start with {plan.name}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:p-12">
            <Shield size={28} className="mx-auto text-primary" />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">Ready to make every count traceable?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Create an Audit Co-Flow workspace and give your restaurant team a cleaner way to manage inventory, audits, and accountability.
            </p>
            <Link href={appHref} className="mt-8 inline-flex">
              <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                {appCta}
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <div className="flex items-center gap-2">
            <AuditFlowLogo imageClassName="h-8 w-8 rounded-md" textClassName="text-foreground" />
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground">Docs</Link>
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </div>
          <p className="text-sm text-muted-foreground">2026 Audit Co-Flow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
