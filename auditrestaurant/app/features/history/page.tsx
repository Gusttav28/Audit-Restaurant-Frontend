"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  History, ArrowRight, ArrowLeft, Check, Calendar, FileText,
  Download, Eye, TrendingUp, ClipboardCheck
} from "lucide-react"

const benefits = [
  {
    title: "Complete Snapshots",
    description: "Every completed audit saves a full snapshot of inventory values at that moment in time."
  },
  {
    title: "Compare Over Time",
    description: "View side-by-side comparisons of audits to track improvements or identify recurring issues."
  },
  {
    title: "Exportable Records",
    description: "Download audit reports in various formats for compliance, accounting, or analysis."
  },
  {
    title: "Searchable Archive",
    description: "Quickly find past audits by date, inventory, auditor, or specific items."
  }
]

const steps = [
  {
    step: "01",
    title: "Access History",
    description: "Navigate to the Audits section and view all completed audits organized by date and inventory."
  },
  {
    step: "02",
    title: "View Details",
    description: "Open any past audit to see the complete snapshot including all item counts and discrepancies."
  },
  {
    step: "03",
    title: "Compare Results",
    description: "Select multiple audits to compare results and identify trends or recurring issues."
  },
  {
    step: "04",
    title: "Export Reports",
    description: "Download detailed reports for record-keeping, compliance, or sharing with stakeholders."
  }
]

export default function HistoryFeaturePage() {
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
              <History size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Audit History
              </h1>
              <p className="text-muted-foreground mt-1">Complete records of every audit with searchable archives</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Audit History provides a permanent record of all completed audits. When an audit is marked complete, 
            AuditFlow saves a snapshot of every item's counted values, discrepancies, comments, and flags. This 
            creates an immutable record that can be referenced for compliance, analysis, or dispute resolution.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The history retention period depends on your plan: Basic plans retain 30 days, Professional plans 
            retain 1 year, and Enterprise plans have unlimited history. You can filter, search, and compare 
            historical audits to identify patterns and track inventory accuracy improvements over time.
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Audit History</h3>
              <div className="flex gap-2">
                <select className="px-3 py-1.5 text-sm bg-secondary/30 border border-border rounded-lg text-foreground">
                  <option>All Inventories</option>
                  <option>Kitchen</option>
                  <option>Bar</option>
                </select>
                <select className="px-3 py-1.5 text-sm bg-secondary/30 border border-border rounded-lg text-foreground">
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>Last Year</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { date: "Jan 15, 2024", inventory: "Kitchen", auditor: "Mike Chen", items: 24, discrepancy: "-$45.00", status: "completed" },
                { date: "Jan 12, 2024", inventory: "Bar", auditor: "Sarah Johnson", items: 18, discrepancy: "-$73.00", status: "completed" },
                { date: "Jan 08, 2024", inventory: "Storage", auditor: "Mike Chen", items: 32, discrepancy: "$0.00", status: "completed" },
                { date: "Jan 01, 2024", inventory: "Kitchen", auditor: "Sarah Johnson", items: 24, discrepancy: "-$12.50", status: "completed" },
              ].map((audit, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-secondary/10 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{audit.inventory} Audit</p>
                      <p className="text-sm text-muted-foreground">{audit.date} by {audit.auditor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-foreground">{audit.items} items</p>
                      <p className={`text-sm ${audit.discrepancy.startsWith('-') ? 'text-destructive' : 'text-primary'}`}>
                        {audit.discrepancy}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-secondary/30 rounded-lg transition-colors">
                        <Eye size={16} className="text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-secondary/30 rounded-lg transition-colors">
                        <Download size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Keep complete audit records
          </h2>
          <p className="text-muted-foreground mb-8">
            Never lose track of past audits. Maintain searchable history for compliance and analysis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="bg-foreground text-background hover:bg-foreground/90 gap-2">
                Get Started Free
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/docs/history">
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
            <Link href="/features/analytics" className="hover:text-foreground">Analytics</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
