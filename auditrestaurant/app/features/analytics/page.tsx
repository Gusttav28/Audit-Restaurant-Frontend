"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, ArrowRight, ArrowLeft, Check, TrendingUp,
  PieChart, Activity, FileText, ClipboardCheck
} from "lucide-react"

const benefits = [
  {
    title: "Visual Dashboards",
    description: "Interactive charts showing audit trends, discrepancy patterns, and inventory health."
  },
  {
    title: "Trend Analysis",
    description: "Track improvements over time and identify recurring issues across audits."
  },
  {
    title: "Custom Reports",
    description: "Generate detailed reports filtered by date, inventory, category, or team member."
  },
  {
    title: "Export Options",
    description: "Download reports in PDF, CSV, or Excel formats for external analysis."
  }
]

const steps = [
  {
    step: "01",
    title: "View Dashboard",
    description: "Access the Reports section to see real-time analytics dashboards with key metrics."
  },
  {
    step: "02",
    title: "Explore Charts",
    description: "Interact with charts showing audit frequency, discrepancy trends, and inventory distribution."
  },
  {
    step: "03",
    title: "Filter Data",
    description: "Narrow down analysis by date range, inventory type, or specific categories."
  },
  {
    step: "04",
    title: "Generate Reports",
    description: "Create and download custom reports for stakeholders, compliance, or internal review."
  }
]

export default function AnalyticsFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardCheck size={18} className="text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">AuditFlow</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
              <Link href="/signup">
                <Button className="bg-foreground text-background hover:bg-foreground/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/#features" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft size={16} />
            Back to Features
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart3 size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Analytics & Reports
              </h1>
              <p className="text-muted-foreground mt-1">Visual insights and comprehensive reporting tools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Analytics & Reports transforms your audit data into actionable insights. The Reports dashboard 
            provides visual representations of audit performance, discrepancy trends, and inventory health 
            metrics. See at a glance how your inventory accuracy is improving over time.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Generate custom reports filtered by any criteria: date ranges, specific inventories, item categories, 
            or team members. Reports can be exported in multiple formats for sharing with management, 
            accountants, or compliance auditors. Professional and Enterprise plans unlock advanced analytics 
            including predictive insights and anomaly detection.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Key Benefits</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="p-6 bg-card border border-border rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">How It Works</h2>
          <div className="space-y-8">
            {steps.map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary">{item.step}</span>
                </div>
                <div className="flex-1 pb-8 border-b border-border last:border-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Example */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Interface Preview</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Audits", value: "156", change: "+12%", icon: FileText },
                { label: "Avg Accuracy", value: "96.8%", change: "+2.4%", icon: Activity },
                { label: "Items Tracked", value: "1,240", change: "+8%", icon: BarChart3 },
              ].map((stat) => (
                <div key={stat.label} className="p-4 bg-secondary/20 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon size={18} className="text-primary" />
                    <span className="text-xs text-primary">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Mock Chart 1 */}
              <div className="p-4 bg-secondary/10 border border-border rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-4">Audit Trends</h4>
                <div className="h-32 flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Jan</span>
                  <span>Jun</span>
                  <span>Dec</span>
                </div>
              </div>
              
              {/* Mock Chart 2 */}
              <div className="p-4 bg-secondary/10 border border-border rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-4">Discrepancy by Category</h4>
                <div className="space-y-3">
                  {[
                    { category: "Spirits", pct: 45, color: "bg-primary" },
                    { category: "Produce", pct: 28, color: "bg-primary/70" },
                    { category: "Dairy", pct: 18, color: "bg-primary/50" },
                    { category: "Other", pct: 9, color: "bg-primary/30" },
                  ].map((item) => (
                    <div key={item.category} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16">{item.category}</span>
                      <div className="flex-1 h-2 bg-secondary/30 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                      </div>
                      <span className="text-xs text-foreground w-8">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Turn data into decisions
          </h2>
          <p className="text-muted-foreground mb-8">
            Visualize trends, identify issues, and optimize your inventory management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="bg-foreground text-background hover:bg-foreground/90 gap-2">
                Get Started Free
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/docs/reports">
              <Button variant="outline" className="bg-transparent">
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>2024 AuditFlow</span>
          <div className="flex gap-6">
            <Link href="/features/inventory" className="hover:text-foreground">Inventory Management</Link>
            <Link href="/features/audits" className="hover:text-foreground">Real-Time Audits</Link>
            <Link href="/features/collaboration" className="hover:text-foreground">Team Collaboration</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
