"use client"

import { useEffect, useState, type MouseEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Building,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileText,
  GitFork,
  Globe2,
  LockKeyhole,
  MapPinned,
  Menu,
  Moon,
  Package,
  Rocket,
  Shield,
  Sparkles,
  Store,
  Sun,
  TrendingUp,
  User,
  UsersRound,
  Workflow,
  CreditCard,
  HelpCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import AuditFlowLogo from "@/components/layout/audit-flow-logo"
import PublicNavbar from "@/components/public/public-navbar"
import { BlurFadeIn, TextBlurFadeIn } from "@/components/ui/text-blur-fade-in"
import WorldMap from "@/components/ui/world-map"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

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
    copy: "Organize items by restaurant and inventory type, structure products with categories and units, track quantities and values, and let completed audits update current stock.",
    bullets: ["Inventory type scoped", "Categories + units", "Quantity and value tracking", "Audit-updated stock"],
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

const landingPlatformTiles = platformTiles.filter((tile) => tile.title !== "Analytics API")

const platformDropdownFeatures = [
  {
    icon: Database,
    title: "Inventory Database",
    href: "/features/inventory-database",
  },
  {
    icon: Workflow,
    title: "Audit Functions",
    href: "/features/audit-functions",
  },
  {
    icon: Bell,
    title: "Real-Time Tasks",
    href: "/features/real-time-tasks",
  },
  {
    icon: BarChart3,
    title: "Analytics and Reports",
    href: "/features/reports",
  },
]

const workflowDropdownItems = [
  { icon: Database, title: "Create Inventory", href: "/features/inventory-database" },
  { icon: Workflow, title: "Run Audit", href: "/features/audit-functions" },
  { icon: FileText, title: "Review Reports", href: "/features/reports" },
  { icon: Bell, title: "Assign Tasks", href: "/features/real-time-tasks" },
  { icon: ClipboardCheck, title: "Complete Audit", href: "/features/audit-functions" },
]

const pricingDropdownItems = [
  { icon: Package, title: "Plans", href: "/subscription" },
  { icon: Check, title: "Compare Features", href: "/#features" },
  { icon: CreditCard, title: "Subscription", href: "/subscription" },
  { icon: HelpCircle, title: "FAQ", href: "/docs" },
]

const solutionDropdownColumns = [
  [
    { icon: User, title: "Individuals", href: "/solutions/individuals" },
    { icon: Briefcase, title: "Entrepreneurs", href: "/solutions/entrepreneurs" },
    { icon: Store, title: "Small Restaurants", href: "/solutions/small-restaurants" },
    { icon: Building2, title: "Restaurant Groups", href: "/solutions/restaurant-groups" },
    { icon: Rocket, title: "Startups", href: "/solutions/startups" },
  ],
  [
    { icon: TrendingUp, title: "Growing Businesses", href: "/solutions/growing-businesses" },
    { icon: Building, title: "Large Companies", href: "/solutions/large-companies" },
    { icon: GitFork, title: "Franchises", href: "/solutions/franchises" },
    { icon: MapPinned, title: "Remote Teams", href: "/solutions/remote-teams" },
    { icon: UsersRound, title: "Operations Teams", href: "/solutions/operations-teams" },
  ],
]

const solutionCarouselItems = solutionDropdownColumns.flat()

const technologies = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Supabase",
  "Recharts",
  "shadcn/Radix UI",
  "Aceternity UI",
]

function TechnologyLogo({ name }: { name: string }) {
  if (name === "Next.js") {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.12" />
        <path d="M19 45V19h5.2l18.6 26h-5.6L24.2 27v18H19Z" fill="currentColor" />
        <path d="M41 19h4v26h-4V19Z" fill="currentColor" opacity="0.7" />
      </svg>
    )
  }

  if (name === "React") {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
        <circle cx="32" cy="32" r="5" fill="currentColor" />
        <ellipse cx="32" cy="32" rx="24" ry="9" fill="none" stroke="currentColor" strokeWidth="3" />
        <ellipse cx="32" cy="32" rx="24" ry="9" fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(60 32 32)" />
        <ellipse cx="32" cy="32" rx="24" ry="9" fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(120 32 32)" />
      </svg>
    )
  }

  if (name === "TypeScript") {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
        <rect x="8" y="8" width="48" height="48" rx="8" fill="currentColor" opacity="0.14" />
        <path d="M18 24h24v5h-9v20h-6V29h-9v-5Zm25.5 24.8c-3.1 0-5.7-.8-7.7-2.3v-5.8c2.1 1.8 4.6 2.8 7.5 2.8 2.2 0 3.3-.7 3.3-2 0-.7-.3-1.2-1-1.6-.7-.4-1.9-.9-3.7-1.5-4.2-1.4-6.2-3.8-6.2-7.2 0-2.3.9-4.1 2.6-5.4 1.7-1.3 4-2 6.9-2 2.7 0 5 .6 6.8 1.8V31c-1.9-1.4-4-2-6.4-2-2 0-3 .6-3 1.8 0 .6.3 1.1.9 1.5.6.4 1.8.8 3.4 1.4 2.3.8 4 1.8 5 3 1 1.2 1.5 2.6 1.5 4.3 0 2.4-.9 4.3-2.7 5.7-1.8 1.4-4.2 2.1-7.2 2.1Z" fill="currentColor" />
      </svg>
    )
  }

  if (name === "Tailwind CSS") {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
        <path d="M32 18c-6.4 0-10.4 3.2-12 9.6 2.4-3.2 5.2-4.4 8.4-3.6 1.8.5 3.1 1.8 4.6 3.3 2.5 2.6 5.4 5.7 11.8 5.7s10.4-3.2 12-9.6c-2.4 3.2-5.2 4.4-8.4 3.6-1.8-.5-3.1-1.8-4.6-3.3C41.3 21.1 38.4 18 32 18ZM19.2 31c-6.4 0-10.4 3.2-12 9.6 2.4-3.2 5.2-4.4 8.4-3.6 1.8.5 3.1 1.8 4.6 3.3 2.5 2.6 5.4 5.7 11.8 5.7s10.4-3.2 12-9.6c-2.4 3.2-5.2 4.4-8.4 3.6-1.8-.5-3.1-1.8-4.6-3.3C28.5 34.1 25.6 31 19.2 31Z" fill="currentColor" />
      </svg>
    )
  }

  if (name === "Supabase") {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
        <path d="M35 6 13 35h19l-3 23 22-30H32l3-22Z" fill="currentColor" />
      </svg>
    )
  }

  if (name === "Recharts") {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
        <rect x="12" y="34" width="8" height="16" rx="2" fill="currentColor" opacity="0.45" />
        <rect x="28" y="24" width="8" height="26" rx="2" fill="currentColor" opacity="0.7" />
        <rect x="44" y="14" width="8" height="36" rx="2" fill="currentColor" />
        <path d="M11 26c7-10 14-10 21 0s14 10 21 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === "shadcn/Radix UI") {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
        <rect x="14" y="14" width="16" height="16" rx="4" fill="currentColor" />
        <rect x="34" y="14" width="16" height="16" rx="4" fill="currentColor" opacity="0.55" />
        <rect x="14" y="34" width="16" height="16" rx="4" fill="currentColor" opacity="0.55" />
        <rect x="34" y="34" width="16" height="16" rx="4" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
      <path d="M32 8 56 52H44l-4-8H24l-4 8H8L32 8Zm-4 27h8l-4-9-4 9Z" fill="currentColor" />
      <path d="M18 52h28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}

const previewHoverLabels: Record<string, string[]> = {
  "Inventory Database": ["Stock updated", "Category tracked", "Inventory value"],
  Authentication: ["Owner access", "Read + Audit", "Secure login"],
  "Audit Functions": ["Stock checked", "Discrepancy found", "Audit completed"],
  "Authorized Area": ["Access granted", "Permission checked", "Protected section"],
  "Real-Time Tasks": ["Audit user", "Audit ready", "Audit progress"],
  Reports: ["Metric updated", "Trend visible", "Export ready"],
  "Remote Access": ["Remote session", "Restaurant selected", "Online access"],
}

const remoteAccessDots = [
  {
    start: { lat: 9.93, lng: -84.08, label: "AuditNett" },
    end: { lat: 25.76, lng: -80.19, label: "Maya Chen" },
  },
  {
    start: { lat: 9.93, lng: -84.08, label: "AuditNett" },
    end: { lat: 40.42, lng: -3.7, label: "Gustavo Camacho" },
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

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTile, setActiveTile] = useState(0)
  const [previewHover, setPreviewHover] = useState<{ title: string; label: string; x: number; y: number } | null>(null)
  const [workflowStep, setWorkflowStep] = useState(0)
  const [activeTechnology, setActiveTechnology] = useState("Next.js")
  const handlePreviewMove = (title: string, event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const labels = previewHoverLabels[title] ?? [title]
    const labelIndex = Math.min(labels.length - 1, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * labels.length)))
    setPreviewHover({
      title,
      label: labels[labelIndex],
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }
  const renderPreviewLabel = (title: string) =>
    previewHover?.title === title ? (
      <span
        className="pointer-events-none absolute z-20 rounded-full border border-border bg-popover px-3 py-1 text-xs font-medium text-foreground shadow-lg shadow-black/15"
        style={{ left: previewHover.x + 12, top: previewHover.y + 12 }}
      >
        {previewHover.label}
      </span>
    ) : null

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
    const timer = window.setInterval(() => {
      setWorkflowStep((step) => (step + 1) % workflowSteps.length)
    }, 2600)
    return () => window.clearInterval(timer)
  }, [])

  const appHref = isLoggedIn ? "/dashboard" : "/signup"
  const appCta = isLoggedIn ? "Open dashboard" : "Start your workspace"

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <PublicNavbar />

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
                AuditNett connects restaurants, inventories, team permissions, and audit history into a fast operational workspace for modern hospitality teams.
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

            <BlurFadeIn className="relative mx-auto mt-12 max-w-6xl overflow-hidden" delay={0.16}>
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
              <div className="auditnett-infinite-solutions flex w-max gap-4 py-2 hover:[animation-play-state:paused]">
                {[...solutionCarouselItems, ...solutionCarouselItems].map((solution, index) => {
                  const Icon = solution.icon
                  return (
                    <Link
                      key={`${solution.title}-${index}`}
                      href={solution.href}
                      className="group flex h-28 w-64 shrink-0 items-center gap-4 rounded-2xl border border-border bg-card/80 p-5 text-left shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Icon size={26} className="text-primary transition-transform group-hover:scale-110" />
                      </span>
                      <span className="text-lg font-semibold text-foreground">{solution.title}</span>
                    </Link>
                  )
                })}
              </div>
            </BlurFadeIn>

            <div id="features" className="mx-auto mt-16 grid max-w-7xl scroll-mt-24 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {landingPlatformTiles.map((tile, index) => {
                const Icon = tile.icon
                const isActive = activeTile === index
                return (
                  <Link
                    key={tile.title}
                    href={tile.href}
                    onMouseEnter={() => setActiveTile(index)}
                    onFocus={() => setActiveTile(index)}
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === 0
                      ? "min-h-[28rem] pb-44 md:col-span-2 lg:min-h-[28rem]"
                      : "min-h-[24rem] pb-40 sm:min-h-[25rem] lg:min-h-[28rem]"
                      } ${isActive ? "border-primary/50" : "border-border"}`}
                  >
                    <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                      <div className="mb-7 flex items-center gap-3">
                        <Icon size={22} className={tile.accent === "accent" ? "text-accent" : "text-primary"} />
                        <h3 className="text-xl font-semibold text-foreground">{tile.title}</h3>
                      </div>
                      <p className={`${index === 0 ? "max-w-3xl text-base leading-7 sm:text-lg sm:leading-8" : "text-base leading-7"} text-muted-foreground`}>
                        {tile.copy}
                      </p>
                      <div className={`space-y-2 ${index === 0 ? "mt-auto pt-6" : tile.title === "Authorized Area" ? "mt-6 text-sm" : "mt-9 text-sm"}`}>
                        {tile.bullets.map((bullet) => (
                          <div key={bullet} className="flex items-center gap-2 text-foreground">
                            <Check size={16} className={tile.accent === "accent" ? "text-accent" : "text-primary"} />
                            {bullet}
                          </div>
                        ))}
                      </div>
                    </div>
                    {tile.title === "Inventory Database" && (
                      <div
                        className="absolute bottom-24 right-8 hidden h-40 w-40 rounded-[2.25rem] border border-primary/35 bg-background/80 shadow-lg shadow-primary/10 transition-opacity group-hover:opacity-100 sm:block lg:bottom-20 lg:h-44 lg:w-44"
                        onMouseMove={(event) => handlePreviewMove(tile.title, event)}
                        onMouseLeave={() => setPreviewHover(null)}
                      >
                        {renderPreviewLabel(tile.title)}
                        <div className="absolute inset-5 rounded-[2.4rem] border border-accent/25" />
                        <div className="absolute left-1/2 top-6 h-24 w-1 -translate-x-1/2 rounded-full bg-primary/50 lg:h-28" />
                        <div className="absolute bottom-8 left-8 h-14 w-24 rounded-full border-4 border-accent/40 lg:h-16 lg:w-28" />
                        <div className="absolute right-8 top-12 h-5 w-5 rounded-full border border-primary/60" />
                      </div>
                    )}
                    {tile.title === "Authentication" && (
                      <div
                        className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-3 border-t border-border bg-background/35 p-4 opacity-70 transition-opacity group-hover:opacity-100"
                        onMouseMove={(event) => handlePreviewMove(tile.title, event)}
                        onMouseLeave={() => setPreviewHover(null)}
                      >
                        {renderPreviewLabel(tile.title)}
                        {["owner@goflow.example", "audit@goflow.example", "••••••••", "assigned"].map((cell) => (
                          <span key={cell} className="truncate rounded-lg border border-border bg-card/90 px-3 py-3 font-mono text-xs text-muted-foreground">{cell}</span>
                        ))}
                      </div>
                    )}
                    {tile.title === "Audit Functions" && (
                      <div
                        className="absolute bottom-7 right-5 h-44 w-64 opacity-70 transition-opacity group-hover:opacity-100"
                        onMouseMove={(event) => handlePreviewMove(tile.title, event)}
                        onMouseLeave={() => setPreviewHover(null)}
                      >
                        {renderPreviewLabel(tile.title)}
                        <div className="absolute inset-0 rounded-full border border-primary/30" />
                        <div className="absolute inset-8 rounded-full border border-accent/30" />
                        <div className="absolute left-1/2 top-1/2 h-px w-28 origin-left rotate-45 bg-primary/60" />
                        <div className="absolute left-8 top-20 h-2 w-2 rounded-full bg-primary" />
                        <div className="absolute right-10 bottom-8 h-2 w-2 rounded-full bg-accent" />
                      </div>
                    )}
                    {tile.title === "Authorized Area" && (
                      <div
                        className="absolute bottom-6 left-8 right-8 grid grid-cols-3 gap-3 opacity-70 transition-opacity group-hover:opacity-100"
                        onMouseMove={(event) => handlePreviewMove(tile.title, event)}
                        onMouseLeave={() => setPreviewHover(null)}
                      >
                        {renderPreviewLabel(tile.title)}
                        {
                          Array.from({ length: 6 }).map((_, itemIndex) => (
                            <div key={itemIndex} className="h-10 rounded-lg border border-border bg-card/85 sm:h-20 lg:h-24" />
                          ))
                        }
                      </div>
                    )}
                    {tile.title === "Real-Time Tasks" && (
                      <div
                        className="absolute bottom-6 left-6 right-6 h-36 rounded-lg border border-border bg-card/80 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:20px_20px] opacity-85 transition-opacity group-hover:opacity-100"
                        onMouseMove={(event) => handlePreviewMove(tile.title, event)}
                        onMouseLeave={() => setPreviewHover(null)}
                      >
                        {renderPreviewLabel(tile.title)}
                        <div className="absolute bottom-7 left-20 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">Audit ready</div>
                        <div className="absolute right-7 top-7 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">Audit User</div>
                      </div>
                    )}
                    {tile.title === "Reports" && (
                      <div
                        className="absolute bottom-6 left-6 right-6 space-y-2 opacity-75 transition-opacity group-hover:opacity-100"
                        onMouseMove={(event) => handlePreviewMove(tile.title, event)}
                        onMouseLeave={() => setPreviewHover(null)}
                      >
                        {renderPreviewLabel(tile.title)}
                        {["Inventory value", "Audit results", "Issue trend"].map((row, rowIndex) => (
                          <div key={row} className="rounded-lg -mb-1 border border-border bg-card/90 p-2.5">
                            <div className="mb-2 flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{row}</span>
                              <span className="font-mono text-foreground">{rowIndex === 0 ? "$8.4k" : rowIndex === 1 ? "18" : "+7%"}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${72 - rowIndex * 16}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {tile.title === "Remote Access" && (
                      <div
                        className="absolute bottom-6 left-6 right-6 opacity-75 transition-opacity group-hover:opacity-100"
                        onMouseMove={(event) => handlePreviewMove(tile.title, event)}
                        onMouseLeave={() => setPreviewHover(null)}
                      >
                        {renderPreviewLabel(tile.title)}
                        <div className="relative h-40 overflow-hidden rounded-lg border border-border bg-card/80">
                          <div className="absolute inset-x-1 top-5">
                            <WorldMap dots={remoteAccessDots} lineColor="#0f6cb4" />
                          </div>
                          {[
                            { name: "Maya Chen", task: "Bar audit", className: "left-[8%] top-[42%]" },
                            { name: "Gustavo Camacho", task: "Kitchen inventory", className: "right-[5%] bottom-[18%]" },
                          ].map((location) => (
                            <span key={location.name} className={`absolute flex max-w-[9rem] items-start gap-1.5 rounded-2xl border border-border bg-card/95 px-2.5 py-1.5 text-[11px] text-foreground shadow-sm ${location.className}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="min-w-0 leading-tight">
                                <span className="block truncate font-medium">{location.name}</span>
                                <span className="block truncate text-muted-foreground">{location.task}</span>
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 rounded-2xl border border-border bg-card/50 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-medium text-primary">Technology foundation</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Built with modern tools for fast restaurant operations.
                </h2>
                <div className="mt-6 min-h-12">
                  <TextBlurFadeIn
                    key={activeTechnology}
                    text={activeTechnology}
                    className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
                    stagger={0.02}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {technologies.map((technology) => (
                  <button
                    key={technology}
                    type="button"
                    aria-label={technology}
                    title={technology}
                    onMouseEnter={() => setActiveTechnology(technology)}
                    onFocus={() => setActiveTechnology(technology)}
                    className="group flex min-h-32 items-center justify-center rounded-xl border border-border bg-background/70 p-4 text-primary transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <TechnologyLogo name={technology} />
                    </span>
                  </button>
                ))}
              </div>
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
                AuditNett keeps live restaurant context, permissions, audit tasks, and inventory updates connected through Supabase.
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
                        className={`mb-2 w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${workflowStep === index ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
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
                          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${workflowStep === index
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

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:p-12">
            <Shield size={28} className="mx-auto text-primary" />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">Ready to make every count traceable?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Create an AuditNett workspace and give your restaurant team a cleaner way to manage inventory, audits, and accountability.
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
            <a href="#features" className="hover:text-foreground">Platform</a>
            <Link href="/blog" className="hover:text-foreground">Blog</Link>
          </div>
          <p className="text-sm text-muted-foreground">2026 AuditNett. All rights reserved.</p>
        </div>
      </footer>
      <style jsx global>{`
        @keyframes auditnett-solutions-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.5rem));
          }
        }

        .auditnett-infinite-solutions {
          animation: auditnett-solutions-scroll 34s linear infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .auditnett-infinite-solutions {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
