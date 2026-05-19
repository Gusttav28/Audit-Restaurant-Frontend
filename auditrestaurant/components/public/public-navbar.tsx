"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Building,
  Building2,
  Check,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Database,
  FileText,
  GitFork,
  HelpCircle,
  MapPinned,
  Menu,
  Moon,
  Package,
  Rocket,
  Store,
  Sun,
  TrendingUp,
  User,
  UsersRound,
  Workflow,
  X,
} from "lucide-react"
import AuditFlowLogo from "@/components/layout/audit-flow-logo"
import { Button } from "@/components/ui/button"
import { isMacPlatform, shouldIgnoreShortcut, withShortcut } from "@/components/layout/shortcut-utils"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

const platformDropdownFeatures = [
  { icon: Database, title: "Inventory Database", href: "/features/inventory-database" },
  { icon: Workflow, title: "Audit Functions", href: "/features/audit-functions" },
  { icon: Bell, title: "Real-Time Tasks", href: "/features/real-time-tasks" },
  { icon: BarChart3, title: "Analytics and Reports", href: "/features/reports" },
]

const workflowDropdownItems = [
  { icon: Database, title: "Create Inventory", href: "/features/inventory-database" },
  { icon: Workflow, title: "Run Audit", href: "/features/audit-functions" },
  { icon: FileText, title: "Review Reports", href: "/features/reports" },
  { icon: Bell, title: "Assign Tasks", href: "/features/real-time-tasks" },
  { icon: ClipboardCheck, title: "Complete Audit", href: "/features/audit-functions" },
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

const pricingDropdownItems = [
  { icon: Package, title: "Plans", href: "/subscription" },
  { icon: Check, title: "Compare Features", href: "/#features" },
  { icon: CreditCard, title: "Subscription", href: "/subscription" },
  { icon: HelpCircle, title: "FAQ", href: "/docs" },
]

function rememberFeatureReturn() {
  window.sessionStorage.setItem("auditnett-return-section", "features")
}

function DropdownItem({
  item,
  onClick,
}: {
  item: { icon: typeof Database; title: string; href: string }
  onClick?: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent hover:text-white focus-visible:bg-accent focus-visible:text-white focus-visible:outline-none"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary transition-colors group-hover/item:border-white/20 group-hover/item:bg-white/10 group-hover/item:text-white">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground transition-colors group-hover/item:text-white">
        {item.title}
      </span>
      <ArrowRight size={14} className="shrink-0 -translate-x-1 opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
    </Link>
  )
}

function MobileDropdownItem({
  item,
  closeMenu,
  onClick,
}: {
  item: { icon: typeof Database; title: string; href: string }
  closeMenu: () => void
  onClick?: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={() => {
        onClick?.()
        closeMenu()
      }}
      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-white"
    >
      <Icon size={16} />
      {item.title}
    </Link>
  )
}

export default function PublicNavbar() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const isLightMode = theme === "light"
  const appHref = isLoggedIn ? "/dashboard" : "/signup"
  const appCta = isLoggedIn ? "Open dashboard" : "Start your workspace"

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
      const modifierPressed = isMacPlatform() ? event.metaKey : event.ctrlKey
      if (!modifierPressed || event.key.toLowerCase() !== "b") return
      event.preventDefault()
      setTheme(isLightMode ? "dark" : "light")
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isLightMode, setTheme])

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-7">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <AuditFlowLogo imageClassName="h-8 w-8 rounded-md" textClassName="text-foreground" />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <div className="group relative">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:bg-accent group-hover:text-white"
              >
                Platform
                <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 w-[38rem] max-w-[calc(100vw-2rem)] translate-y-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-2 group-focus-within:opacity-100">
                <div className="grid gap-2 rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl shadow-black/20 sm:grid-cols-2">
                  <div>
                    <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Platform</p>
                    {platformDropdownFeatures.map((item) => (
                      <DropdownItem key={`platform-${item.title}`} item={item} onClick={rememberFeatureReturn} />
                    ))}
                  </div>
                  <div>
                    <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Workflow</p>
                    {workflowDropdownItems.map((item) => (
                      <DropdownItem
                        key={`workflow-${item.title}`}
                        item={item}
                        onClick={item.href.startsWith("/features/") ? rememberFeatureReturn : undefined}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:bg-accent group-hover:text-white"
              >
                Solutions
                <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 w-[34rem] max-w-[calc(100vw-2rem)] translate-y-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-2 group-focus-within:opacity-100">
                <div className="grid gap-2 rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl shadow-black/20 sm:grid-cols-2">
                  {solutionDropdownColumns.map((column, columnIndex) => (
                    <div key={`solutions-column-${columnIndex}`}>
                      <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        {columnIndex === 0 ? "Teams" : "Organizations"}
                      </p>
                      {column.map((item) => (
                        <DropdownItem key={`solutions-${item.title}`} item={item} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="group relative">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:bg-accent group-hover:text-white"
              >
                Pricing
                <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 w-72 max-w-[calc(100vw-2rem)] translate-y-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-2 group-focus-within:opacity-100">
                <div className="rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl shadow-black/20">
                  {pricingDropdownItems.map((item) => (
                    <DropdownItem key={`pricing-${item.title}`} item={item} />
                  ))}
                </div>
              </div>
            </div>

            <Link href="/docs" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-white">
              Docs
            </Link>
            <Link href="/blog" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-white">
              Blog
            </Link>
          </div>
        </div>

        <div className="hidden items-center justify-end gap-4 md:flex">
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
              <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Sign in
              </Link>
              <Link href="/signup">
                <Button className="bg-foreground text-background hover:bg-foreground/90">Start your workspace</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="justify-self-end rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Open menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <div className="space-y-3">
            <details className="rounded-lg border border-border bg-card/50 px-3 py-2">
              <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                <span className="inline-flex w-full items-center justify-between">
                  Platform
                  <ChevronDown size={14} className="text-muted-foreground" />
                </span>
              </summary>
              <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="px-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Platform</p>
                  {platformDropdownFeatures.map((item) => (
                    <MobileDropdownItem key={`mobile-platform-${item.title}`} item={item} closeMenu={() => setMobileMenuOpen(false)} onClick={rememberFeatureReturn} />
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="px-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Workflow</p>
                  {workflowDropdownItems.map((item) => (
                    <MobileDropdownItem
                      key={`mobile-workflow-${item.title}`}
                      item={item}
                      closeMenu={() => setMobileMenuOpen(false)}
                      onClick={item.href.startsWith("/features/") ? rememberFeatureReturn : undefined}
                    />
                  ))}
                </div>
              </div>
            </details>

            <details className="rounded-lg border border-border bg-card/50 px-3 py-2">
              <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                <span className="inline-flex w-full items-center justify-between">
                  Solutions
                  <ChevronDown size={14} className="text-muted-foreground" />
                </span>
              </summary>
              <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
                {solutionDropdownColumns.map((column, columnIndex) => (
                  <div key={`mobile-solutions-column-${columnIndex}`} className="space-y-1">
                    <p className="px-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {columnIndex === 0 ? "Teams" : "Organizations"}
                    </p>
                    {column.map((item) => (
                      <MobileDropdownItem key={`mobile-solutions-${item.title}`} item={item} closeMenu={() => setMobileMenuOpen(false)} />
                    ))}
                  </div>
                ))}
              </div>
            </details>

            <details className="rounded-lg border border-border bg-card/50 px-3 py-2">
              <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                <span className="inline-flex w-full items-center justify-between">
                  Pricing
                  <ChevronDown size={14} className="text-muted-foreground" />
                </span>
              </summary>
              <div className="mt-3 space-y-1 border-t border-border pt-3">
                {pricingDropdownItems.map((item) => (
                  <MobileDropdownItem key={`mobile-pricing-${item.title}`} item={item} closeMenu={() => setMobileMenuOpen(false)} />
                ))}
              </div>
            </details>

            <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg border border-border bg-card/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-white">
              Docs
            </Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg border border-border bg-card/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-white">
              Blog
            </Link>
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
  )
}
