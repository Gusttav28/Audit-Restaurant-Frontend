"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Package, ArrowRight, ArrowLeft, Check, Plus, Edit2, Trash2,
  Filter, Search, Tags, Layers, BarChart3, ClipboardCheck
} from "lucide-react"

const benefits = [
  {
    title: "Organized Categories",
    description: "Group items by kitchen, bar, storage, or custom categories for logical organization."
  },
  {
    title: "Custom Units",
    description: "Define your own measurement units with conversion factors for precise tracking."
  },
  {
    title: "Real-time Updates",
    description: "See changes instantly as your team updates quantities across locations."
  },
  {
    title: "Low Stock Alerts",
    description: "Get notified when items fall below minimum thresholds you define."
  }
]

const steps = [
  {
    step: "01",
    title: "Create an Inventory",
    description: "Start by creating an inventory type (Kitchen, Bar, Storage) with a name and color for easy identification."
  },
  {
    step: "02",
    title: "Add Items",
    description: "Add items with details like name, quantity, unit, category, price, and supplier information."
  },
  {
    step: "03",
    title: "Track & Update",
    description: "Monitor stock levels, edit items as needed, and keep your inventory data current."
  },
  {
    step: "04",
    title: "Review & Audit",
    description: "Use your inventories as the basis for audits to track discrepancies and maintain accuracy."
  }
]

export default function InventoryFeaturePage() {
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
              <Package size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Inventory Management
              </h1>
              <p className="text-muted-foreground mt-1">Organize, track, and manage all your stock in one place</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            AuditFlow's Inventory Management system allows you to create multiple inventories tailored to your business needs. 
            Whether you manage a restaurant with separate kitchen and bar inventories, a warehouse with multiple storage zones, 
            or any business with diverse stock categories, our flexible system adapts to your workflow.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Each inventory contains items with detailed tracking fields including quantities in stock, quantities on sale, 
            custom units, categories, pricing, supplier information, and expiration dates. The system provides real-time 
            visibility into your stock levels and serves as the foundation for accurate auditing.
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
            {steps.map((item, index) => (
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
          <div className="bg-card border border-border rounded-xl p-6 overflow-hidden">
            {/* Mock Inventory Interface */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">Kitchen Inventory</h3>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">24 items</span>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-lg border border-border">
                  <Search size={14} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Search items...</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-lg border border-border">
                  <Filter size={14} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filter</span>
                </div>
              </div>
            </div>
            
            {/* Mock Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-6 gap-4 p-3 bg-secondary/20 text-xs font-medium text-muted-foreground border-b border-border">
                <span>Item Name</span>
                <span>Category</span>
                <span>Quantity</span>
                <span>Unit</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {[
                { name: "Olive Oil", category: "Oils", qty: 12, unit: "L", status: "good" },
                { name: "Fresh Basil", category: "Herbs", qty: 3, unit: "bundles", status: "low" },
                { name: "Parmesan", category: "Dairy", qty: 8, unit: "kg", status: "good" },
              ].map((item) => (
                <div key={item.name} className="grid grid-cols-6 gap-4 p-3 text-sm border-b border-border last:border-0">
                  <span className="text-foreground font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.category}</span>
                  <span className="text-foreground">{item.qty}</span>
                  <span className="text-muted-foreground">{item.unit}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs ${
                    item.status === 'good' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.status === 'good' ? 'In Stock' : 'Low Stock'}
                  </span>
                  <div className="flex gap-2">
                    <Edit2 size={14} className="text-muted-foreground cursor-pointer hover:text-foreground" />
                    <Trash2 size={14} className="text-muted-foreground cursor-pointer hover:text-destructive" />
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
            Ready to organize your inventory?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start managing your stock with precision. Create your free account today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="bg-foreground text-background hover:bg-foreground/90 gap-2">
                Get Started Free
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/docs/inventory">
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
            <Link href="/features/audits" className="hover:text-foreground">Real-Time Audits</Link>
            <Link href="/features/history" className="hover:text-foreground">Audit History</Link>
            <Link href="/features/analytics" className="hover:text-foreground">Analytics</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
