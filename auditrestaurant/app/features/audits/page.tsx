"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ClipboardCheck, ArrowRight, ArrowLeft, Check, Play, Pause,
  CheckCircle, AlertTriangle, MessageSquare, Clock
} from "lucide-react"

const benefits = [
  {
    title: "Live Counting",
    description: "Record quantities in real-time as you count. See discrepancies calculated instantly."
  },
  {
    title: "Discrepancy Detection",
    description: "Automatic detection of differences between expected and actual stock levels."
  },
  {
    title: "Item Flagging",
    description: "Flag items that need investigation or have significant variance for follow-up."
  },
  {
    title: "Progress Tracking",
    description: "Track audit progress with status updates from Not Started to Completed."
  }
]

const steps = [
  {
    step: "01",
    title: "Create an Audit",
    description: "Select an inventory to audit, assign an auditor, and add any initial notes about the audit scope."
  },
  {
    step: "02",
    title: "Start Counting",
    description: "Open the audit and begin recording actual quantities for each item. The system shows expected values for comparison."
  },
  {
    step: "03",
    title: "Flag & Comment",
    description: "Flag items with issues and add comments to document observations, explanations, or concerns."
  },
  {
    step: "04",
    title: "Complete Audit",
    description: "Once all items are counted, complete the audit to save a snapshot and calculate final discrepancies."
  }
]

export default function AuditsFeaturePage() {
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
              <ClipboardCheck size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Real-Time Auditing
              </h1>
              <p className="text-muted-foreground mt-1">Perform accurate stock counts with live discrepancy detection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            The Real-Time Auditing feature is the core of AuditFlow. When you create an audit for an inventory, 
            the system loads all items with their expected quantities (based on current inventory data) and provides 
            fields for you to enter actual counted values.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            As you count, discrepancies are calculated automatically, showing you exactly where stock levels don't match. 
            Items with significant variance (over 10%) are automatically flagged, and you can manually flag any item 
            that needs attention. The audit tracks progress through three statuses: Not Started, In Progress, and Completed.
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
            {/* Mock Audit Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">Bar Inventory Audit</h3>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">In Progress</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Started Jan 12, 2024 by Sarah Johnson</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">5/8</p>
                  <p className="text-xs text-muted-foreground">Items Counted</p>
                </div>
                <div className="w-20 h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div className="w-[62%] h-full bg-primary rounded-full" />
                </div>
              </div>
            </div>
            
            {/* Mock Audit Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 gap-4 p-3 bg-secondary/20 text-xs font-medium text-muted-foreground border-b border-border">
                <span>Item</span>
                <span>Expected</span>
                <span>Counted</span>
                <span>Discrepancy</span>
                <span>Value</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {[
                { name: "Vodka Premium", expected: 24, counted: 22, value: -40, status: "counted" },
                { name: "Fresh Mint", expected: 15, counted: 10, value: -12.50, status: "flagged" },
                { name: "Tonic Water", expected: 48, counted: 48, value: 0, status: "counted" },
                { name: "Lime Juice", expected: 8, counted: null, value: null, status: "pending" },
              ].map((item) => (
                <div key={item.name} className="grid grid-cols-7 gap-4 p-3 text-sm border-b border-border last:border-0 items-center">
                  <span className="text-foreground font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.expected}</span>
                  <span className={item.counted !== null ? "text-foreground" : "text-muted-foreground"}>
                    {item.counted !== null ? item.counted : "-"}
                  </span>
                  <span className={`font-medium ${
                    item.value === null ? 'text-muted-foreground' :
                    item.value < 0 ? 'text-destructive' : 
                    item.value === 0 ? 'text-primary' : 'text-foreground'
                  }`}>
                    {item.counted !== null ? (item.expected - item.counted) : "-"}
                  </span>
                  <span className={`${item.value && item.value < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {item.value !== null ? `$${item.value.toFixed(2)}` : "-"}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                    item.status === 'counted' ? 'bg-primary/20 text-primary' :
                    item.status === 'flagged' ? 'bg-destructive/20 text-destructive' :
                    'bg-secondary/30 text-muted-foreground'
                  }`}>
                    {item.status === 'counted' && <CheckCircle size={10} />}
                    {item.status === 'flagged' && <AlertTriangle size={10} />}
                    {item.status === 'pending' && <Clock size={10} />}
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  <div className="flex gap-2">
                    <MessageSquare size={14} className="text-muted-foreground cursor-pointer hover:text-foreground" />
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
            Start auditing with precision
          </h2>
          <p className="text-muted-foreground mb-8">
            Detect discrepancies instantly and maintain accurate stock records.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="bg-foreground text-background hover:bg-foreground/90 gap-2">
                Get Started Free
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/docs/audits">
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
            <Link href="/features/history" className="hover:text-foreground">Audit History</Link>
            <Link href="/features/analytics" className="hover:text-foreground">Analytics</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
