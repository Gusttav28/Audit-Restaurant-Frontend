"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Users, ArrowRight, ArrowLeft, Check, UserPlus, Shield,
  MessageSquare, Bell, Eye, ClipboardCheck
} from "lucide-react"

const benefits = [
  {
    title: "Role-Based Access",
    description: "Assign roles like Admin, Auditor, or Viewer with appropriate permissions for each."
  },
  {
    title: "Real-Time Comments",
    description: "Add comments to audits for observations, explanations, or follow-up tasks."
  },
  {
    title: "Activity Notifications",
    description: "Get notified when audits are started, completed, or when comments are added."
  },
  {
    title: "Shared Visibility",
    description: "Everyone on the team sees the same data, ensuring alignment and accountability."
  }
]

const steps = [
  {
    step: "01",
    title: "Invite Team Members",
    description: "Add team members by email and assign them appropriate roles based on their responsibilities."
  },
  {
    step: "02",
    title: "Set Permissions",
    description: "Configure what each role can access: create audits, edit inventory, view reports, or admin settings."
  },
  {
    step: "03",
    title: "Collaborate in Audits",
    description: "Multiple team members can work on audits, leave comments, and flag items for review."
  },
  {
    step: "04",
    title: "Stay Informed",
    description: "Receive notifications for important events and review team activity in the dashboard."
  }
]

const roles = [
  {
    name: "Admin",
    description: "Full access to all features including team management and billing",
    permissions: ["Manage team members", "Configure settings", "View billing", "All auditor permissions"]
  },
  {
    name: "Auditor",
    description: "Can create and perform audits, manage inventory items",
    permissions: ["Create audits", "Edit inventory", "Add comments", "View reports"]
  },
  {
    name: "Viewer",
    description: "Read-only access to view audits and reports",
    permissions: ["View audits", "View inventory", "View reports", "Add comments"]
  }
]

export default function CollaborationFeaturePage() {
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
              <Users size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Team Collaboration
              </h1>
              <p className="text-muted-foreground mt-1">Work together with role-based access and real-time updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Team Collaboration enables multiple users to work together on inventory management and auditing. 
            Invite team members, assign roles with appropriate permissions, and maintain visibility across 
            all audit activities. Whether you have a small team or a large organization, AuditFlow scales 
            to meet your collaboration needs.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The comments system allows team members to document observations, flag issues, and communicate 
            directly within audit records. Notifications keep everyone informed of important changes, and 
            the activity feed provides a real-time view of who's doing what across your inventories.
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

      {/* Roles Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Team Roles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.name} className="p-6 bg-card border border-border rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{role.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                <ul className="space-y-2">
                  {role.permissions.map((perm) => (
                    <li key={perm} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={12} className="text-primary" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
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

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Bring your team together
          </h2>
          <p className="text-muted-foreground mb-8">
            Collaborate seamlessly with role-based access and real-time communication.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="bg-foreground text-background hover:bg-foreground/90 gap-2">
                Get Started Free
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/docs/team">
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
