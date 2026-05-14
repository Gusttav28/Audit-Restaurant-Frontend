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
import InteractiveFeaturePreview from "./interactive-feature-preview"

export type FeatureKey =
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
  docs: {
    summary: string
    sections: Array<{
      title: string
      description: string
      points: string[]
    }>
  }
}

function FeaturePreview({ featureKey, feature }: { featureKey: FeatureKey; feature: FeatureContent }) {
  if (featureKey === "inventory-database") {
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Restaurant selector</p>
            <h2 className="text-xl font-semibold text-foreground">Inventory table management</h2>
          </div>
          <span className="auditflow-video-pulse rounded-full border border-border bg-background px-3 py-1 text-xs text-primary">3 audits available</span>
        </div>
        <div className="auditflow-video-pulse mb-4 flex items-center justify-between rounded-xl border border-border bg-background/70 px-4 py-3">
          <span className="text-sm font-medium text-foreground">GoFlow Restaurant</span>
          <span className="text-xs text-muted-foreground">Bar inventory</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          {[
            ["Premium coffee", "Beverages", "24 kg", "$192"],
            ["Prep containers", "Storage", "38 units", "$304"],
            ["Production sauce", "Kitchen", "12 L", "$96"],
          ].map(([item, category, stock, value], index) => (
            <div key={item} className={`auditflow-video-row ${index === 1 ? "auditflow-video-row-delay-1" : index === 2 ? "auditflow-video-row-delay-2" : ""} grid grid-cols-[1.2fr_0.9fr_0.7fr_0.6fr] gap-3 border-b border-border bg-background/60 px-4 py-3 text-sm last:border-b-0`}>
              <span className="font-medium text-foreground">{item}</span>
              <span className="text-muted-foreground">{category}</span>
              <span className="text-muted-foreground">{stock}</span>
              <span className="text-right font-mono text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (featureKey === "authentication") {
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-sm text-muted-foreground">Secure login</p>
            <div className="mt-4 space-y-3">
              <div className="auditflow-video-row h-10 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">user@goflow.example</div>
              <div className="auditflow-video-row auditflow-video-row-delay-1 h-10 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-muted-foreground">••••••••</div>
              <div className="auditflow-video-pulse rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">Sign in</div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-sm text-muted-foreground">Team access list</p>
            <div className="mt-4 space-y-3">
              {[
                ["Owner account", "Full admin"],
                ["Audit user", "Read + Audit"],
                ["Viewer account", "Read only"],
              ].map(([name, role], index) => (
                <div key={name} className={`auditflow-video-row ${index === 1 ? "auditflow-video-row-delay-1" : index === 2 ? "auditflow-video-row-delay-2" : ""} flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm`}>
                  <span className="font-medium text-foreground">{name}</span>
                  <span className="text-muted-foreground">{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (featureKey === "audit-functions") {
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Inventory audit</p>
            <h2 className="text-xl font-semibold text-foreground">Previous vs current stock</h2>
          </div>
          <span className="auditflow-video-pulse rounded-full border border-yellow-500/20 bg-yellow-500/15 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-300">In progress</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          {[
            ["Premium gin", "12", "9", "-3"],
            ["Tonic water", "8", "7", "-1"],
            ["Lime juice", "5 L", "4 L", "Merma"],
          ].map(([item, previous, current, diff], index) => (
            <div key={item} className={`auditflow-video-row ${index === 1 ? "auditflow-video-row-delay-1" : index === 2 ? "auditflow-video-row-delay-2" : ""} grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr] gap-3 border-b border-border bg-background/60 px-4 py-3 text-sm last:border-b-0`}>
              <span className="font-medium text-foreground">{item}</span>
              <span className="text-muted-foreground">Prev {previous}</span>
              <span className="text-muted-foreground">Now {current}</span>
              <span className="text-right font-medium text-accent">{diff}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (featureKey === "authorized-area") {
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <p className="text-sm text-muted-foreground">Permission-based UI</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">Protected sections</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Inventory", "Visible", "Read access"],
            ["Audits", "Allowed", "Read + Audit"],
            ["Settings", "Locked", "Admin only"],
          ].map(([section, state, rule], index) => (
            <div key={section} className={`auditflow-video-pulse rounded-xl border border-border bg-background/70 p-4 ${index === 1 ? "auditflow-video-row-delay-1" : index === 2 ? "auditflow-video-row-delay-2" : ""}`}>
              <p className="font-medium text-foreground">{section}</p>
              <p className={state === "Locked" ? "mt-4 text-sm text-destructive" : "mt-4 text-sm text-primary"}>{state}</p>
              <p className="mt-1 text-xs text-muted-foreground">{rule}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (featureKey === "real-time-tasks") {
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Admin assignment</p>
            <h2 className="text-xl font-semibold text-foreground">Audit task queue</h2>
          </div>
          <span className="auditflow-video-pulse rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">2 new</span>
        </div>
        <div className="space-y-3">
          {[
            ["Bar count", "Assigned to Audit User", "Due today"],
            ["Kitchen review", "Helper: Team member", "Tomorrow"],
            ["Storage audit", "Temporary collaborator", "Pending"],
          ].map(([task, user, due], index) => (
            <div key={task} className={`auditflow-video-row ${index === 1 ? "auditflow-video-row-delay-1" : index === 2 ? "auditflow-video-row-delay-2" : ""} flex items-center justify-between rounded-xl border border-border bg-background/70 px-4 py-3 text-sm`}>
              <div>
                <p className="font-medium text-foreground">{task}</p>
                <p className="text-muted-foreground">{user}</p>
              </div>
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">{due}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (featureKey === "analytics-api" || featureKey === "reports") {
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{featureKey === "reports" ? "Report view" : "Analytics view"}</p>
            <h2 className="text-xl font-semibold text-foreground">Metrics, charts, and tables</h2>
          </div>
          <span className="auditflow-video-pulse rounded-full border border-border bg-background px-3 py-1 text-xs text-primary">Export ready</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["$8.4k value", "18 audits", "7 issues"].map((metric, index) => (
            <div key={metric} className={`auditflow-video-row ${index === 1 ? "auditflow-video-row-delay-1" : index === 2 ? "auditflow-video-row-delay-2" : ""} rounded-xl border border-border bg-background/70 p-4 text-center font-semibold text-foreground`}>{metric}</div>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-border bg-background/70 p-4">
          <div className="flex h-32 items-end gap-3">
            {[64, 42, 82, 55, 74, 48].map((height, index) => (
              <div key={index} className="auditflow-video-bar flex-1 rounded-t-lg bg-primary/70" style={{ height: `${height}%`, animationDelay: `${index * 0.18}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auditflow-feature-video overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Remote workspace</p>
          <h2 className="text-xl font-semibold text-foreground">Multi-location access</h2>
        </div>
        <span className="auditflow-video-pulse rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Online</span>
      </div>
      <div className="relative h-72 rounded-xl border border-border bg-background/70">
        <div className="absolute left-8 top-8 h-56 w-56 rounded-full border border-primary/30" />
        <div className="absolute left-20 top-14 h-48 w-48 rounded-full border border-accent/30" />
        <div className="absolute left-12 top-28 h-px w-72 origin-left rotate-[-18deg] bg-border" />
        <div className="absolute left-28 top-12 h-px w-72 origin-left rotate-[22deg] bg-border" />
        {[
          { label: "HQ", style: { left: "4rem", top: "8rem" } },
          { label: "Bar", style: { left: "13rem", top: "5rem" } },
          { label: "Kitchen", style: { right: "4rem", bottom: "4rem" } },
        ].map((location) => (
          <div key={location.label} style={location.style} className={`auditflow-video-marker absolute flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground ${location.label === "Bar" ? "auditflow-video-marker-delay-1" : location.label === "Kitchen" ? "auditflow-video-marker-delay-2" : ""}`}>
            <span className="h-2 w-2 rounded-full bg-primary" />
            {location.label}
          </div>
        ))}
      </div>
    </div>
  )
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
    docs: {
      summary: "Inventory Database keeps restaurant stock records structured before, during, and after audits.",
      sections: [
        {
          title: "How users interact with it",
          description: "Managers select a restaurant and inventory area, then maintain item rows with stock, price, category, unit, supplier, and phase details.",
          points: ["Use the restaurant selector to switch workspaces.", "Open inventory types such as bar, kitchen, or storage.", "Add, edit, or delete items based on permissions."],
        },
        {
          title: "What information is shown",
          description: "The inventory table shows the current operational source of truth for each item.",
          points: ["Current quantity and calculated value.", "Category, unit, supplier, and status.", "Previous stock history from completed audits."],
        },
        {
          title: "How it connects to audits",
          description: "Audit creation starts from the selected restaurant and inventory. Completed audits can update the live current stock values.",
          points: ["Audit counts use the current item list.", "Completed audit rows become stock snapshots.", "Previous and new quantities remain reviewable."],
        },
      ],
    },
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
    docs: {
      summary: "Authentication controls who can log in and which restaurants, pages, and actions they can use.",
      sections: [
        {
          title: "How users interact with it",
          description: "Users sign in with their own email and password. Admins manage team members from Settings.",
          points: ["Create team members with assigned restaurant access.", "Update roles, permissions, and login email when allowed.", "Log out from the sidebar profile area."],
        },
        {
          title: "What information is shown",
          description: "The system loads the authenticated profile, restaurant memberships, and permissions before showing the dashboard.",
          points: ["User name and email.", "Role or permission set.", "Assigned restaurant list."],
        },
        {
          title: "How it connects to workflow",
          description: "Permissions decide whether the user can view, audit, edit, delete, or manage settings.",
          points: ["Read-only users can review allowed data.", "Read + Audit users can perform audits.", "Primary admins can manage restaurants and team access."],
        },
      ],
    },
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
    docs: {
      summary: "Audit Functions guide users from audit creation through row saving, completion, export, and inventory updates.",
      sections: [
        {
          title: "How users interact with it",
          description: "Users create an audit for a selected inventory, enter current stock values, and save rows individually or in bulk.",
          points: ["Create audit tasks from the audit modal.", "Save one row or Save All modified rows.", "Complete only after required items are audited."],
        },
        {
          title: "What information is shown",
          description: "The audit table compares expected inventory data with counted values and resulting differences.",
          points: ["Previous stock and current stock.", "Discrepancies, sold values, merma, and production quantities.", "Completion progress and export summary."],
        },
        {
          title: "How it connects to workflow",
          description: "Completed audits lock the final count, update live inventory stock, and generate exportable records.",
          points: ["CSV and PDF exports match the final audit state.", "Audit history becomes available from inventory.", "Assigned task notifications clear after completion."],
        },
      ],
    },
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
    docs: {
      summary: "Authorized Area protects dashboard routes, action buttons, and Supabase mutations with restaurant-specific permissions.",
      sections: [
        {
          title: "How users interact with it",
          description: "Users see only the pages and actions allowed by their current restaurant membership.",
          points: ["Settings is hidden from non-admin users.", "Edit and delete actions appear only when permitted.", "Sidebar navigation respects access rules."],
        },
        {
          title: "What information is shown",
          description: "The protected area shows restaurant-scoped operational data after session and permissions are ready.",
          points: ["Selected restaurant context.", "Permission-aware navigation.", "Action availability by user type."],
        },
        {
          title: "How it connects to workflow",
          description: "Access checks keep users from changing inventory, audits, or team records outside their allowed scope.",
          points: ["Direct URL access is guarded.", "Unauthorized mutations are blocked.", "Loading gates prevent stale user context."],
        },
      ],
    },
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
    docs: {
      summary: "Real-Time Tasks turn assigned audits into visible work notifications for the right user.",
      sections: [
        {
          title: "How users interact with it",
          description: "Admins assign audits to users with due dates and optional helpers. Assigned users open tasks from the notification bell.",
          points: ["Assign responsible auditor and helper.", "Use the bell to open assigned audit work.", "Refresh assigned work from Settings as an admin."],
        },
        {
          title: "What information is shown",
          description: "Task notifications and assigned work tables show who owns the work and its current status.",
          points: ["Assigned user and helper details.", "Restaurant and inventory target.", "Due date and task status."],
        },
        {
          title: "How it connects to workflow",
          description: "Task notifications point users directly to the audit page and update when the audit is completed.",
          points: ["Tasks are scoped to the logged-in user.", "Admins can monitor assigned work.", "Completed audits remove or complete notifications."],
        },
      ],
    },
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
    docs: {
      summary: "Analytics API explains how Audit Co-Flow turns audit and inventory records into useful metrics.",
      sections: [
        {
          title: "How users interact with it",
          description: "Users review charts, apply filters, hover metrics for explanations, and export filtered summaries.",
          points: ["Filter by inventory, category, status, person, or date.", "Open help tooltips for section explanations.", "Review charts and metric cards."],
        },
        {
          title: "What information is shown",
          description: "Analytics combines inventory value, completed audits, issue severity, and trends.",
          points: ["Inventory value and category distribution.", "Audit completion and discrepancy patterns.", "Readable chart hover information."],
        },
        {
          title: "How it connects to workflow",
          description: "Analytics helps managers decide where to focus audits, training, purchasing, and stock controls.",
          points: ["Spot repeated issues.", "Track operational changes over time.", "Export insights for business review."],
        },
      ],
    },
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
    docs: {
      summary: "Reports package restaurant-scoped audit and inventory data into clear summaries and exports.",
      sections: [
        {
          title: "How users interact with it",
          description: "Users choose filters, review detailed sections, and export the current report view.",
          points: ["Apply or reset report filters.", "Open detailed sections for selected metrics.", "Export CSV or PDF summaries."],
        },
        {
          title: "What information is shown",
          description: "Reports show business-ready data from completed audits and live inventory records.",
          points: ["Audit results and issue trends.", "Inventory performance and value.", "Export-ready summary state."],
        },
        {
          title: "How it connects to workflow",
          description: "Reports give managers a final review layer after audits update stock and issues are identified.",
          points: ["Review stock movement.", "Understand discrepancy impact.", "Share operational summaries."],
        },
      ],
    },
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
    docs: {
      summary: "Remote Access lets authorized users work from different locations while keeping data scoped to their account.",
      sections: [
        {
          title: "How users interact with it",
          description: "Users log in from supported devices and switch between only the restaurants assigned to them.",
          points: ["Use one account across assigned locations.", "Open inventory and audits remotely.", "Keep mobile navigation accessible."],
        },
        {
          title: "What information is shown",
          description: "The app shows restaurant-specific data based on the selected accessible location.",
          points: ["Assigned restaurant dropdown.", "Permission-aware operational pages.", "Remote task notifications."],
        },
        {
          title: "How it connects to workflow",
          description: "Remote access supports multi-location managers, auditors, and collaborators without exposing unrelated restaurants.",
          points: ["Switch restaurant context safely.", "Perform assigned audits from anywhere.", "Review reports without mixing data."],
        },
      ],
    },
  },
}

export const featureKeys = Object.keys(featurePages) as FeatureKey[]

export function isFeatureKey(value: string): value is FeatureKey {
  return featureKeys.includes(value as FeatureKey)
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
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="inline-flex">
                  <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    {feature.cta}
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href={`/feature-docs/${featureKey}`} className="inline-flex">
                  <Button size="lg" variant="outline" className="gap-2 bg-background/40">
                    Go to documentation
                    <FileText size={18} />
                  </Button>
                </Link>
              </div>
            </div>

            <InteractiveFeaturePreview featureKey={featureKey} />
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

export function FeatureDocumentationPage({ featureKey }: { featureKey: FeatureKey }) {
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
            <Link href={`/features/${featureKey}`} className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              Feature page
            </Link>
            <Link href="/signup">
              <Button className="bg-foreground text-background hover:bg-foreground/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="px-4 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap gap-4">
            <Link href={`/features/${featureKey}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft size={16} />
              Back to {feature.title}
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              Back to website
            </Link>
          </div>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Icon size={28} className="text-primary" />
            </div>
            <p className="mt-6 text-sm font-medium text-primary">Feature documentation</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {feature.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{feature.docs.summary}</p>
          </section>

          <section className="grid gap-5 py-12">
            {feature.docs.sections.map((section, index) => (
              <article key={section.title} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                    <p className="mt-3 text-base leading-7 text-muted-foreground">{section.description}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {section.points.map((point) => (
                        <div key={point} className="rounded-xl border border-border bg-background/60 p-4 text-sm leading-6 text-foreground">
                          <Check size={16} className="mb-3 text-primary" />
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  )
}
