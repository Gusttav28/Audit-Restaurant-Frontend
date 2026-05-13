"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  ClipboardCheck,
  Database,
  Download,
  FileText,
  Globe2,
  KeyRound,
  Layers,
  LineChart,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  Smartphone,
  Tags,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import AuditFlowLogo from "@/components/layout/audit-flow-logo"

type FeatureKey =
  | "inventory-database"
  | "authentication"
  | "audit-functions"
  | "authorized-area"
  | "real-time-tasks"
  | "analytics-api"
  | "reports"
  | "remote-access"

interface FeatureContent {
  title: string
  eyebrow: string
  subtitle: string
  overview: string[]
  icon: LucideIcon
  highlights: Array<{
    icon: LucideIcon
    title: string
    description: string
  }>
  steps: Array<{
    title: string
    description: string
  }>
  preview: {
    label: string
    title: string
    metrics: Array<[string, string]>
    rows: Array<[string, string, string]>
  }
  cta: string
}

export const featurePages: Record<FeatureKey, FeatureContent> = {
  "inventory-database": {
    title: "Inventory Database",
    eyebrow: "Structured inventory records",
    subtitle: "Keep items, suppliers, units, categories, phases, and stock snapshots organized by restaurant and inventory area.",
    overview: [
      "Inventory Database is the foundation for every audit workflow in Audit Co-Flow. It keeps each item connected to its inventory type, category, supplier, unit, price, phase, current quantity, and stock history.",
      "Teams can separate bar, kitchen, production, storage, and custom areas without mixing data across restaurants. This gives managers a clear source of truth before any audit starts.",
    ],
    icon: Database,
    highlights: [
      { icon: Package, title: "Item organization", description: "Store product details, units, price per unit, supplier, and active stock values in one structured place." },
      { icon: Layers, title: "Multi-inventory structure", description: "Separate inventories such as bar, kitchen, storage, production, or any custom area your operation needs." },
      { icon: Tags, title: "Category control", description: "Create and manage categories scoped to the selected inventory so teams can filter and count faster." },
      { icon: TrendingUp, title: "Stock visibility", description: "Track current quantity, previous stock snapshots, merma, production stock, and total value over time." },
    ],
    steps: [
      { title: "Create inventory areas", description: "Define the areas your restaurant counts separately, such as bar, kitchen, storage, or production." },
      { title: "Add structured items", description: "Register each item with category, unit, supplier, price, phase, and quantity information." },
      { title: "Edit from the table", description: "Update stock, phase, production, merma, and supplier values while preserving the last-edited record." },
      { title: "Use it for audits", description: "Launch inventory audits from the current item list and update stock only when the audit is completed." },
    ],
    preview: {
      label: "GoFlow Restaurant · Inventory database",
      title: "Current stock structure",
      metrics: [["Inventory areas", "4"], ["Tracked items", "128"], ["Last update", "09:42"]],
      rows: [["Bar inventory", "52 items", "Categories synced"], ["Kitchen inventory", "61 items", "Suppliers linked"], ["Production stock", "15 items", "Phases tracked"]],
    },
    cta: "Build inventory database",
  },
  authentication: {
    title: "Authentication",
    eyebrow: "Secure user access",
    subtitle: "Manage secure login, primary admin ownership, user permissions, and multi-restaurant access with Supabase-backed authentication.",
    overview: [
      "Authentication controls who can enter the system and what each user can do after login. It supports owner access, admin permissions, read-only accounts, and Read + Audit users.",
      "Each user signs in with their own account, receives their assigned restaurants, and sees only the actions allowed by their permissions.",
    ],
    icon: LockKeyhole,
    highlights: [
      { icon: KeyRound, title: "Secure login", description: "Users authenticate with their own credentials instead of sharing one account across the team." },
      { icon: ShieldCheck, title: "Primary admin access", description: "Owners keep full access to restaurants they create, including settings and team management." },
      { icon: Users, title: "Permission types", description: "Support read-only, Read + Audit, create, edit, delete, and full admin access patterns." },
      { icon: Building2, title: "Multi-restaurant login", description: "Users assigned to multiple restaurants can switch only between the locations they belong to." },
    ],
    steps: [
      { title: "Create or invite a user", description: "Admins add a team member with name, email, password guidance, and assigned restaurant access." },
      { title: "Assign permissions", description: "Choose read, audit, create, edit, delete, or full admin permissions based on the user’s responsibilities." },
      { title: "Load the correct session", description: "After login, Audit Co-Flow loads the user profile, restaurants, and permissions tied to that account." },
      { title: "Restrict actions", description: "The UI hides or blocks settings, deletion, editing, or audit actions when a user is not allowed to perform them." },
    ],
    preview: {
      label: "GoFlow Team · Authentication",
      title: "Permission matrix",
      metrics: [["Owner", "Full"], ["Auditor", "Read + Audit"], ["Viewer", "Read only"]],
      rows: [["Owner account", "Settings + all actions", "Allowed"], ["Audit user", "Create and complete audits", "Allowed"], ["Viewer account", "Inventory review only", "Restricted"]],
    },
    cta: "Set up secure access",
  },
  "audit-functions": {
    title: "Audit Functions",
    eyebrow: "Inventory verification workflow",
    subtitle: "Create, assign, save, complete, export, and convert audit results into updated inventory stock.",
    overview: [
      "Audit Functions turn an inventory list into a guided count. Users enter current stock, save individual rows or groups of rows, track discrepancies, and complete the audit when every item has been reviewed.",
      "Once completed, the audit becomes a stock snapshot and can update inventory quantities, show previous stock history, and export CSV or PDF reports.",
    ],
    icon: Workflow,
    highlights: [
      { icon: ClipboardCheck, title: "Audit workflows", description: "Create audits for a selected restaurant and inventory, then navigate directly into the audit table." },
      { icon: Package, title: "Stock comparison", description: "Compare previous stock, current counted stock, sold values, and discrepancies row by row." },
      { icon: FileText, title: "Completion flow", description: "Complete only when every item is audited, then review a detailed summary modal." },
      { icon: Download, title: "Export reports", description: "Export the exact completed audit state to CSV or PDF with restaurant, inventory, audit ID, and date in the file name." },
    ],
    steps: [
      { title: "Create an audit", description: "Select inventory, responsible auditor, helper, and due date before the audit task is created." },
      { title: "Enter counts", description: "Auditors fill current stock values, save rows, and track changes while read-only users remain blocked." },
      { title: "Resolve results", description: "The audit table highlights sold quantities, matched counts, discrepancies, merma, and production values." },
      { title: "Complete and update stock", description: "Completion locks the audit, exports results, and updates inventory stock from the final counted values." },
    ],
    preview: {
      label: "GoFlow Restaurant · Audit functions",
      title: "Active inventory audit",
      metrics: [["Progress", "12 / 12"], ["Discrepancy", "3"], ["Export", "CSV/PDF"]],
      rows: [["Premium gin", "Previous 12 · Current 9", "Sold 3"], ["Tonic water", "Previous 8 · Current 7", "Sold 1"], ["Lime juice", "Previous 5 L · Current 4 L", "Merma"]],
    },
    cta: "Create audit workflow",
  },
  "authorized-area": {
    title: "Authorized Area",
    eyebrow: "Protected operational workspace",
    subtitle: "Keep dashboard, inventory, audits, reports, settings, and profile routes protected by account and restaurant permissions.",
    overview: [
      "Authorized Area is the protected side of Audit Co-Flow. It controls access to operational pages after login and keeps users inside the restaurants and actions they are allowed to use.",
      "This protects restaurant-specific data, blocks direct URL access when needed, and keeps collaborators from seeing admin-only settings.",
    ],
    icon: ShieldCheck,
    highlights: [
      { icon: LockKeyhole, title: "Protected dashboard access", description: "Authenticated pages wait for session, profile, permissions, and restaurant data before rendering." },
      { icon: Building2, title: "Restaurant-specific permissions", description: "Actions and pages use the current restaurant membership instead of global mock access." },
      { icon: Users, title: "Team restrictions", description: "Non-admin users cannot access Settings, admin management, or unauthorized mutations." },
      { icon: Smartphone, title: "Responsive navigation safety", description: "Sidebar navigation, profile actions, and loading states stay permission-aware on desktop and mobile." },
    ],
    steps: [
      { title: "Authenticate the user", description: "The system verifies Supabase session and profile data before dashboard content appears." },
      { title: "Load assigned restaurants", description: "Only restaurants connected to the user’s membership are available in the selector." },
      { title: "Apply route permissions", description: "Settings and admin-only screens are hidden and blocked for users without access." },
      { title: "Guard mutations", description: "Create, edit, delete, and audit actions check permissions before writing to Supabase." },
    ],
    preview: {
      label: "GoFlow Workspace · Authorized area",
      title: "Protected access state",
      metrics: [["Session", "Active"], ["Restaurants", "Assigned"], ["Settings", "Admin only"]],
      rows: [["Inventory page", "Read access", "Visible"], ["Audit save", "Read + Audit", "Allowed"], ["Team settings", "Primary admin", "Restricted"]],
    },
    cta: "Protect operational area",
  },
  "real-time-tasks": {
    title: "Real-Time Tasks",
    eyebrow: "Assigned work and notifications",
    subtitle: "Turn assigned audits into visible task notifications so users know what needs to be counted and when.",
    overview: [
      "Real-Time Tasks keep audit work visible. Admins can assign audits to users, add helpers or temporary collaborators, set due dates, and monitor task progress.",
      "Assigned users see task notifications in the header, open the audit directly, and complete the task without searching through the audit list.",
    ],
    icon: Bell,
    highlights: [
      { icon: ClipboardCheck, title: "Assigned audits", description: "Admins assign audit work to a specific user and inventory with due dates and helper details." },
      { icon: Bell, title: "Notification count", description: "Users see a clear task count and can open assigned audits from the notification list." },
      { icon: Users, title: "Helper coordination", description: "Add existing team helpers or temporary collaborators directly to an audit assignment." },
      { icon: TrendingUp, title: "Task progress", description: "Assigned work can move from in progress to completed, and admins can refresh the task table." },
    ],
    steps: [
      { title: "Assign the audit", description: "Admin selects responsible user, inventory, date, and optional helper information." },
      { title: "Notify the user", description: "The user sees the task in their notification bell, scoped to their login account." },
      { title: "Open the task", description: "Clicking the notification opens the correct audit page for immediate counting." },
      { title: "Complete the work", description: "When the audit is completed, the task status updates and the notification is removed or marked complete." },
    ],
    preview: {
      label: "GoFlow Team · Real-time tasks",
      title: "Assigned audit queue",
      metrics: [["Open tasks", "4"], ["Due today", "2"], ["Completed", "9"]],
      rows: [["Audit Bar Inventory", "Assigned to audit.user@goflow.example", "In progress"], ["Kitchen Count", "Helper: Team member", "Due today"], ["Storage Review", "Temporary collaborator", "Pending"]],
    },
    cta: "Assign audit tasks",
  },
  "analytics-api": {
    title: "Analytics API",
    eyebrow: "Metrics and operating signals",
    subtitle: "Transform completed audits and inventory records into filtered metrics, charts, issue severity, and trend analysis.",
    overview: [
      "Analytics API explains the reporting logic behind the visual dashboard. It combines restaurant-scoped inventory values, completed audits, categories, and issue data into focused metrics.",
      "Teams can filter by inventory, status, issue type, category, responsible person, or date range to understand what is changing inside the operation.",
    ],
    icon: BarChart3,
    highlights: [
      { icon: LineChart, title: "Trend analysis", description: "Review audit frequency, completed work, discrepancies, and inventory value movement over time." },
      { icon: BarChart3, title: "Section metrics", description: "Use charts and summary cards to understand inventory health, issue severity, and audit outcomes." },
      { icon: FileText, title: "Filter details", description: "Apply filters and view detailed sections for only the matching restaurant-scoped data." },
      { icon: Download, title: "Export context", description: "Export report data that reflects the current filtered analytics state." },
    ],
    steps: [
      { title: "Collect restaurant data", description: "Read inventory items, completed audits, audit rows, categories, and stock history for the selected restaurant." },
      { title: "Calculate metrics", description: "Compute totals, issue counts, severity distribution, category values, and audit completion trends." },
      { title: "Apply filters", description: "Use selected filters together so all sections update from the same matching data set." },
      { title: "Explain the chart", description: "Help tooltips and chart hover states explain what the metric means and how to interpret it." },
    ],
    preview: {
      label: "GoFlow Restaurant · Analytics API",
      title: "Filtered operating metrics",
      metrics: [["Accuracy", "96.8%"], ["Issues", "7"], ["Value", "$8.4k"]],
      rows: [["Issue severity", "Low · Medium · High", "Readable tooltip"], ["Category value", "Beverages · Produce", "Filtered"], ["Audit trend", "Week over week", "Updated"]],
    },
    cta: "Explore analytics",
  },
  reports: {
    title: "Reports",
    eyebrow: "Exportable business summaries",
    subtitle: "Review inventory performance, audit results, issue trends, and export useful business insights from the current report view.",
    overview: [
      "Reports turn filtered audit and inventory data into summaries that managers can review, share, and export. Each report stays scoped to the selected restaurant and reflects the current filters.",
      "Use Reports to understand inventory performance, completed audit outcomes, recurring problems, and the monetary impact of stock movement.",
    ],
    icon: FileText,
    highlights: [
      { icon: BarChart3, title: "Inventory performance", description: "See value, quantity, category, and issue metrics for the selected restaurant and inventory scope." },
      { icon: ClipboardCheck, title: "Audit results", description: "Review completed audits, discrepancies, sold values, and row-level audit outcomes." },
      { icon: TrendingUp, title: "Issues and trends", description: "Track repeated problems, issue severity, and operational changes over time." },
      { icon: Download, title: "Export insights", description: "Export CSV or PDF summaries that match the report data currently shown in the UI." },
    ],
    steps: [
      { title: "Open Reports", description: "Start from the selected restaurant so reports never mix data from another workspace." },
      { title: "Choose filters", description: "Filter by inventory, user, status, issue type, category, or date range." },
      { title: "Review details", description: "Open detailed report sections to understand what each metric means." },
      { title: "Export the view", description: "Generate a shareable CSV or PDF from the exact report state on screen." },
    ],
    preview: {
      label: "GoFlow Restaurant · Reports",
      title: "Export-ready summary",
      metrics: [["Completed audits", "18"], ["Issues found", "7"], ["Export", "PDF"]],
      rows: [["Inventory performance", "Current value and quantity", "Ready"], ["Audit results", "Sold and discrepancy totals", "Ready"], ["Trend review", "Issue movement", "Ready"]],
    },
    cta: "Generate reports",
  },
  "remote-access": {
    title: "Remote Access",
    eyebrow: "Work from any assigned location",
    subtitle: "Let users access the system remotely while keeping restaurants, inventory, audits, and actions limited by their permissions.",
    overview: [
      "Remote Access makes Audit Co-Flow usable from the restaurant, office, or another location without exposing the wrong data. Each user sees only the restaurants assigned to their account.",
      "This supports multi-location operators, external auditors, and managers who need to review tasks and inventory from different places.",
    ],
    icon: Globe2,
    highlights: [
      { icon: Globe2, title: "Anywhere access", description: "Open the system from any supported browser while keeping the active Supabase session tied to the current user." },
      { icon: Building2, title: "Assigned restaurants", description: "Users with multiple memberships can switch between only the restaurants they are allowed to access." },
      { icon: LockKeyhole, title: "Permission boundaries", description: "Remote users still follow read-only, Read + Audit, edit, delete, or admin restrictions." },
      { icon: Smartphone, title: "Mobile workflows", description: "Responsive navigation keeps inventory review, audit tasks, notifications, and profile actions usable on smaller screens." },
    ],
    steps: [
      { title: "Assign restaurant access", description: "Admin gives a user access to one or more restaurants in the same workspace." },
      { title: "Sign in remotely", description: "The user logs in with their own email and receives only their assigned restaurants." },
      { title: "Work by permission", description: "The user can audit, view, or manage records only when their membership allows it." },
      { title: "Keep context safe", description: "Switching restaurants refreshes the operational data while preserving permission rules." },
    ],
    preview: {
      label: "GoFlow Workspace · Remote access",
      title: "Assigned restaurant access",
      metrics: [["Restaurants", "3"], ["User type", "Read + Audit"], ["Device", "Mobile ready"]],
      rows: [["GoFlow Restaurant", "Owner access", "Available"], ["GoFlow Bar Template", "Read + Audit", "Available"], ["GoFlow Kitchen Template", "Read only", "Available"]],
    },
    cta: "Enable remote access",
  },
}

export function FeatureDetailPage({ featureKey }: { featureKey: FeatureKey }) {
  const feature = featurePages[featureKey]
  const Icon = feature.icon

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <AuditFlowLogo imageClassName="h-8 w-8 rounded-md" textClassName="text-foreground" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              Documentation
            </Link>
            <Link href="/signup">
              <Button className="bg-foreground text-background hover:bg-foreground/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="px-4 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/#platform" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft size={16} />
            Back to website
          </Link>

          <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={28} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-primary">{feature.eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {feature.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">{feature.subtitle}</p>
              <Link href="/signup" className="mt-8 inline-flex">
                <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  {feature.cta}
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{feature.preview.label}</p>
                  <h2 className="text-xl font-semibold text-foreground">{feature.preview.title}</h2>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Demo</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {feature.preview.metrics.map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-border bg-background/70 p-4 transition-colors hover:border-primary/40">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-border">
                {feature.preview.rows.map(([name, detail, status]) => (
                  <div key={name} className="grid gap-3 border-b border-border bg-background/60 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1.1fr_1fr_auto]">
                    <span className="font-medium text-foreground">{name}</span>
                    <span className="text-muted-foreground">{detail}</span>
                    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-y border-border bg-card/30 py-16 mt-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold text-foreground">What this feature does</h2>
              <div className="mt-5 space-y-5">
                {feature.overview.map((paragraph) => (
                  <p key={paragraph} className="text-lg leading-8 text-muted-foreground">{paragraph}</p>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20">
            <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">Feature highlights</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {feature.highlights.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-24 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">How it works inside Audit Co-Flow</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {feature.steps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-xl border border-border bg-background/60 p-4 transition-colors hover:border-primary/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

