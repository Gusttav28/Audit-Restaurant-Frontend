import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Building,
  Building2,
  Check,
  ClipboardCheck,
  Database,
  FileText,
  GitFork,
  Globe2,
  LockKeyhole,
  MapPinned,
  Rocket,
  ShieldCheck,
  Store,
  TrendingUp,
  User,
  UsersRound,
  Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import PublicNavbar from "@/components/public/public-navbar"

export type SolutionKey =
  | "individuals"
  | "entrepreneurs"
  | "small-restaurants"
  | "restaurant-groups"
  | "startups"
  | "growing-businesses"
  | "large-companies"
  | "franchises"
  | "remote-teams"
  | "operations-teams"

interface SolutionContent {
  title: string
  eyebrow: string
  subtitle: string
  icon: LucideIcon
  who: string
  problems: string[]
  help: string[]
  features: Array<{
    icon: LucideIcon
    title: string
    description: string
  }>
}

export const solutionKeys: SolutionKey[] = [
  "individuals",
  "entrepreneurs",
  "small-restaurants",
  "restaurant-groups",
  "startups",
  "growing-businesses",
  "large-companies",
  "franchises",
  "remote-teams",
  "operations-teams",
]

export function isSolutionKey(value: string): value is SolutionKey {
  return solutionKeys.includes(value as SolutionKey)
}

const solutionPages: Record<SolutionKey, SolutionContent> = {
  individuals: {
    title: "Individuals",
    eyebrow: "Personal operating control",
    subtitle: "A focused workspace for owners, managers, or consultants who need reliable inventory audits without a heavy setup.",
    icon: User,
    who: "Individuals who manage counts, review inventory, or support a restaurant operation directly.",
    problems: ["Stock notes spread across spreadsheets", "No clear previous-count history", "Manual export naming and audit follow-up"],
    help: ["Create one structured restaurant workspace", "Track inventory by area, category, unit, and supplier", "Export completed audit records when work is finished"],
    features: [
      { icon: Database, title: "Inventory source of truth", description: "Keep items, units, categories, suppliers, phases, and stock values in one place." },
      { icon: ClipboardCheck, title: "Guided audits", description: "Run counts from the current item list and save rows as you work." },
      { icon: FileText, title: "Clean exports", description: "Download audit files with restaurant, inventory, audit ID, and date context." },
    ],
  },
  entrepreneurs: {
    title: "Entrepreneurs",
    eyebrow: "Start lean, operate clearly",
    subtitle: "A practical system for founders building a hospitality concept and needing discipline around stock from day one.",
    icon: Briefcase,
    who: "Entrepreneurs opening, testing, or managing new food and beverage operations.",
    problems: ["Early inventory processes are informal", "New team members need simple access rules", "Audit records are hard to compare over time"],
    help: ["Launch a workspace with owner-level control", "Invite collaborators with read or audit access", "Build repeatable audit habits before the operation scales"],
    features: [
      { icon: ShieldCheck, title: "Owner permissions", description: "Keep admin control while giving collaborators the access they need." },
      { icon: Workflow, title: "Repeatable workflow", description: "Create inventory, run audits, review reports, and update stock in one flow." },
      { icon: TrendingUp, title: "Growth visibility", description: "Review issue trends and inventory values as the business becomes more complex." },
    ],
  },
  "small-restaurants": {
    title: "Small Restaurants",
    eyebrow: "Daily restaurant visibility",
    subtitle: "A compact inventory and audit workflow for restaurants that need fast counts, clear accountability, and usable reports.",
    icon: Store,
    who: "Single-location restaurants, bars, cafes, kitchens, and small hospitality teams.",
    problems: ["Counts happen without consistent structure", "Bar and kitchen records get mixed", "Managers need faster discrepancy review"],
    help: ["Separate inventory areas like bar, kitchen, and storage", "Save audit rows individually or in bulk", "Use reports to understand recurring issues"],
    features: [
      { icon: Database, title: "Area-based inventory", description: "Keep products scoped to the right inventory type and restaurant." },
      { icon: Bell, title: "Assigned audit work", description: "Notify the right person when an audit is ready to perform." },
      { icon: BarChart3, title: "Report summaries", description: "Review completed audits, issue trends, and inventory performance." },
    ],
  },
  "restaurant-groups": {
    title: "Restaurant Groups",
    eyebrow: "Multi-location consistency",
    subtitle: "A shared audit system for restaurant groups that need consistent standards across different locations and teams.",
    icon: Building2,
    who: "Groups operating multiple restaurants, concepts, bars, kitchens, or service locations.",
    problems: ["Locations use different audit habits", "Admins need restaurant-specific access", "Group leaders need comparable reports"],
    help: ["Assign users to one or multiple restaurants", "Switch between owned or assigned locations", "Keep permissions and inventory scoped per restaurant"],
    features: [
      { icon: Globe2, title: "Multi-restaurant access", description: "Users see only the restaurants assigned to their account." },
      { icon: ShieldCheck, title: "Scoped permissions", description: "Control read, audit, edit, delete, and admin behavior per restaurant." },
      { icon: BarChart3, title: "Comparable insights", description: "Use restaurant-scoped reports without mixing data across locations." },
    ],
  },
  startups: {
    title: "Startups",
    eyebrow: "Operational platform foundation",
    subtitle: "A structured inventory audit base for teams building restaurant technology, managed services, or new operational models.",
    icon: Rocket,
    who: "Startups serving restaurants, launching managed audit services, or building operating discipline into a new product offering.",
    problems: ["Operational data needs structure early", "Access rules must support different user types", "Reports need to be useful without custom spreadsheets"],
    help: ["Use Supabase-backed authentication and restaurant scoping", "Create clear audit tasks and notifications", "Export and review data through standard workflows"],
    features: [
      { icon: LockKeyhole, title: "Secure access model", description: "Support owner, read-only, audit, and collaborator access patterns." },
      { icon: Bell, title: "Task notifications", description: "Assign audit work and guide users directly into the right inventory audit." },
      { icon: Database, title: "Structured records", description: "Keep inventory and audit data predictable as usage grows." },
    ],
  },
  "growing-businesses": {
    title: "Growing Businesses",
    eyebrow: "Scale without losing control",
    subtitle: "A flexible workflow for teams adding locations, employees, inventory areas, and audit responsibilities.",
    icon: TrendingUp,
    who: "Businesses moving from informal controls into repeatable, role-based operations.",
    problems: ["More users make access harder to manage", "New inventory areas create inconsistent categories", "Managers need quick performance checks"],
    help: ["Assign restaurant access as the team grows", "Keep inventory categories scoped correctly", "Review reports by selected restaurant and inventory"],
    features: [
      { icon: UsersRound, title: "Team growth", description: "Add users with permissions that match their responsibilities." },
      { icon: Database, title: "Inventory expansion", description: "Create more inventory types while preserving clean categories and units." },
      { icon: BarChart3, title: "Trend review", description: "Track issues, completed audits, and inventory value over time." },
    ],
  },
  "large-companies": {
    title: "Large Companies",
    eyebrow: "Controlled access at scale",
    subtitle: "A permission-aware audit workspace for larger organizations that need clear boundaries, accountability, and reporting.",
    icon: Building,
    who: "Companies with multiple teams, operational layers, and location-specific responsibilities.",
    problems: ["Not every user should access every section", "Audit history needs traceable ownership", "Reports must stay scoped and reliable"],
    help: ["Protect Settings and admin actions", "Track assigned work and completion status", "Keep restaurant and inventory records separated"],
    features: [
      { icon: ShieldCheck, title: "Access control", description: "Restrict pages and actions based on current user permissions." },
      { icon: ClipboardCheck, title: "Traceable audits", description: "Keep completed counts, exports, and stock updates connected." },
      { icon: BarChart3, title: "Management reports", description: "Review filtered metrics without exposing unrelated data." },
    ],
  },
  franchises: {
    title: "Franchises",
    eyebrow: "Repeatable standards",
    subtitle: "A consistent inventory audit pattern for franchises that need shared processes with location-level data separation.",
    icon: GitFork,
    who: "Franchise operators standardizing counts, reporting, and team access across locations.",
    problems: ["Locations follow different count processes", "Templates need to stay consistent", "Access needs to match franchise structure"],
    help: ["Use repeatable inventory and audit workflows", "Keep each location’s records separated", "Assign users only to the restaurants they support"],
    features: [
      { icon: Workflow, title: "Standard workflow", description: "Use the same create, assign, audit, export, and update flow everywhere." },
      { icon: Database, title: "Location separation", description: "Keep inventory records scoped to each restaurant." },
      { icon: ShieldCheck, title: "Franchise access", description: "Give users access to one or many locations without exposing the rest." },
    ],
  },
  "remote-teams": {
    title: "Remote Teams",
    eyebrow: "Work from anywhere",
    subtitle: "A remote-friendly audit system for users who coordinate inventory work across locations without being on-site.",
    icon: MapPinned,
    who: "Remote managers, advisors, coordinators, and distributed audit teams.",
    problems: ["Remote users need current operational context", "Assignments must be easy to find", "Permissions need to travel with the account"],
    help: ["Show assigned restaurants in the dropdown", "Send audit tasks to the right user", "Let users open work from notifications"],
    features: [
      { icon: Globe2, title: "Remote access", description: "Users can work from assigned restaurants and locations with their own login." },
      { icon: Bell, title: "Task visibility", description: "Assigned audits appear as notifications until the work is completed." },
      { icon: ShieldCheck, title: "Scoped account data", description: "Remote users only see the restaurants and actions they are allowed to use." },
    ],
  },
  "operations-teams": {
    title: "Operations Teams",
    eyebrow: "Team accountability",
    subtitle: "A shared operating layer for teams responsible for audits, inventory accuracy, issue review, and follow-up.",
    icon: UsersRound,
    who: "Operations managers, inventory teams, audit leads, and supervisors coordinating daily or weekly controls.",
    problems: ["Audit ownership is unclear", "Follow-up work is hard to track", "Reports need to connect back to completed counts"],
    help: ["Assign work with due dates and helpers", "Review assigned-work status from Settings", "Use reports to understand results and recurring issues"],
    features: [
      { icon: Bell, title: "Assigned work", description: "Give each audit a responsible user, helper, due date, and status." },
      { icon: ClipboardCheck, title: "Completion control", description: "Track in-progress and completed work from the system." },
      { icon: BarChart3, title: "Operational insight", description: "Turn completed audits into metrics, reports, and issue trends." },
    ],
  },
}

export function SolutionDetailPage({ solutionKey }: { solutionKey: SolutionKey }) {
  const solution = solutionPages[solutionKey]
  const Icon = solution.icon

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <Link href="/#features" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} />
          Back to website
        </Link>

        <section className="grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Icon size={30} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-primary">{solution.eyebrow}</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">{solution.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{solution.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Create account
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline">
                  Back to landing page
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/10">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Solution dashboard</p>
                  <h2 className="mt-1 text-2xl font-semibold text-foreground">{solution.title} workspace</h2>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Demo</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["Inventory", "Audits", "Reports"].map((label, index) => (
                  <div key={label} className="rounded-xl border border-border bg-background/70 p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{index === 0 ? "Live" : index === 1 ? "Ready" : "Clear"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                {solution.help.map((item, index) => (
                  <div key={item} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border bg-background/70 px-4 py-4 text-sm last:border-b-0">
                    <Check size={16} className="text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{index === 0 ? "Setup" : index === 1 ? "Operate" : "Review"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-medium text-primary">Who it is for</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Built for the way this audience works</h2>
              <p className="mt-5 text-muted-foreground">{solution.who}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {solution.problems.map((problem) => (
                <div key={problem} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-medium text-foreground">{problem}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-medium text-primary">Main benefits</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Clear controls without operational noise</h2>
                <p className="mt-4 text-muted-foreground">
                  AuditNett keeps the workflow narrow enough for daily use while still giving {solution.title.toLowerCase()} the structure needed for accountability.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {solution.help.map((benefit) => (
                  <div key={benefit} className="rounded-xl border border-border bg-background/60 p-4 text-sm leading-6 text-foreground">
                    <Check size={16} className="mb-3 text-primary" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Most useful features</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">AuditNett tools that fit this solution</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {solution.features.map((feature) => {
              const FeatureIcon = feature.icon
              return (
                <div key={feature.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <FeatureIcon size={22} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 text-center sm:p-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Ready to shape this workspace?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Create an AuditNett account and start with a clean restaurant, inventory, audit, and permission structure.
          </p>
          <Link href="/signup" className="mt-8 inline-flex">
            <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
              Create account
              <ArrowRight size={18} />
            </Button>
          </Link>
        </section>
      </main>
    </div>
  )
}
