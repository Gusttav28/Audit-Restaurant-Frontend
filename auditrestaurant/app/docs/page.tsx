"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ClipboardCheck, Search, Book, Package, FileText, BarChart3, 
  Users, CreditCard, Settings, ChevronRight, ArrowRight
} from "lucide-react"

const categories = [
  {
    title: "Getting Started",
    icon: Book,
    description: "Learn the basics and set up your account",
    articles: [
      { title: "Introduction to AuditFlow", slug: "introduction" },
      { title: "Creating Your Account", slug: "creating-account" },
      { title: "Navigating the Dashboard", slug: "dashboard-overview" },
      { title: "Quick Start Guide", slug: "quick-start" },
    ]
  },
  {
    title: "Inventory Management",
    icon: Package,
    description: "Create and manage your inventories",
    articles: [
      { title: "Creating Inventories", slug: "creating-inventories" },
      { title: "Adding & Editing Items", slug: "managing-items" },
      { title: "Custom Units", slug: "custom-units" },
      { title: "Categories & Organization", slug: "categories" },
      { title: "Low Stock Alerts", slug: "stock-alerts" },
    ]
  },
  {
    title: "Audits",
    icon: FileText,
    description: "Perform and manage inventory audits",
    articles: [
      { title: "Starting an Audit", slug: "starting-audits" },
      { title: "Counting Items", slug: "counting-items" },
      { title: "Handling Discrepancies", slug: "discrepancies" },
      { title: "Adding Comments", slug: "audit-comments" },
      { title: "Completing Audits", slug: "completing-audits" },
    ]
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    description: "Understand your data and generate reports",
    articles: [
      { title: "Dashboard Overview", slug: "reports-dashboard" },
      { title: "Understanding Charts", slug: "understanding-charts" },
      { title: "Generating Reports", slug: "generating-reports" },
      { title: "Exporting Data", slug: "exporting-data" },
    ]
  },
  {
    title: "Team & Collaboration",
    icon: Users,
    description: "Work together with your team",
    articles: [
      { title: "Inviting Team Members", slug: "inviting-members" },
      { title: "Roles & Permissions", slug: "roles-permissions" },
      { title: "Activity Feed", slug: "activity-feed" },
      { title: "Notifications", slug: "notifications" },
    ]
  },
  {
    title: "Billing & Subscriptions",
    icon: CreditCard,
    description: "Manage your plan and payments",
    articles: [
      { title: "Subscription Plans", slug: "plans" },
      { title: "Upgrading Your Plan", slug: "upgrading" },
      { title: "Payment Methods", slug: "payment-methods" },
      { title: "Billing History", slug: "billing-history" },
    ]
  },
]

const popularArticles = [
  { title: "Quick Start Guide", category: "Getting Started", slug: "getting-started/quick-start" },
  { title: "Starting an Audit", category: "Audits", slug: "audits/starting-audits" },
  { title: "Creating Inventories", category: "Inventory", slug: "inventory/creating-inventories" },
  { title: "Roles & Permissions", category: "Team", slug: "team/roles-permissions" },
]

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = searchQuery
    ? categories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.articles.length > 0)
    : categories

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
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
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
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Documentation</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Everything you need to know about using AuditFlow effectively.
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      {!searchQuery && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg font-semibold text-foreground mb-4">Popular Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/docs/${article.slug}`}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors group"
                >
                  <p className="text-xs text-primary mb-1">{article.category}</p>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    {article.title}
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category) => (
              <div key={category.title} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <category.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{category.title}</h3>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-1 pl-13">
                  {category.articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/docs/${category.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}/${article.slug}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 py-1"
                      >
                        {article.title}
                        <ChevronRight size={12} className="opacity-0 hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Need more help?
          </h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button className="bg-foreground text-background hover:bg-foreground/90 gap-2">
                Contact Support
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="bg-transparent">
                Start Free Trial
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
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/#features" className="hover:text-foreground">Features</Link>
            <Link href="/#pricing" className="hover:text-foreground">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
