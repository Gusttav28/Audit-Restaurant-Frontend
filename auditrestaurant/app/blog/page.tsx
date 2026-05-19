import Link from "next/link"
import { ArrowRight, BarChart3, ClipboardCheck, Database } from "lucide-react"
import PublicNavbar from "@/components/public/public-navbar"

const posts = [
  {
    icon: Database,
    title: "Inventory tips for cleaner restaurant counts",
    description: "How categories, units, and stock history make recurring audits easier to trust.",
  },
  {
    icon: ClipboardCheck,
    title: "Audit best practices for small teams",
    description: "A simple workflow for assigning counts, saving rows, and reviewing discrepancies.",
  },
  {
    icon: BarChart3,
    title: "Using reports to spot operational patterns",
    description: "Turn completed audits into issue trends, inventory value context, and better decisions.",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />
      <main className="px-4 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">AuditNett Blog</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Ideas for cleaner inventory operations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Practical notes for restaurants, bars, kitchens, and operations teams building better audit habits.
          </p>
        </section>

        <section className="mx-auto grid max-w-5xl gap-5 py-16 md:grid-cols-3">
          {posts.map((post) => {
            const Icon = post.icon
            return (
              <article key={post.title} className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon size={24} className="text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{post.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.description}</p>
                <Link href="/docs" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Read more
                  <ArrowRight size={15} />
                </Link>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
