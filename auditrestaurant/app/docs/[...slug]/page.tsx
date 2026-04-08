"use client"

import React from "react"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ClipboardCheck, ChevronRight, ArrowLeft, Book, Package, 
  FileText, BarChart3, Users, CreditCard, Check, AlertCircle,
  ArrowRight, Lightbulb
} from "lucide-react"

const docsContent: Record<string, { title: string; category: string; content: React.ReactNode }> = {
  "getting-started/introduction": {
    title: "Introduction to AuditFlow",
    category: "Getting Started",
    content: (
      <div className="prose-content">
        <p className="lead">
          AuditFlow is a comprehensive inventory audit management system designed for restaurants, 
          warehouses, and any business that needs to track stock accurately.
        </p>
        
        <h2>What is AuditFlow?</h2>
        <p>
          AuditFlow helps you manage multiple inventories, perform accurate stock counts, detect 
          discrepancies, and maintain complete audit history. Whether you're managing a single 
          location or multiple sites, AuditFlow provides the tools you need for precise inventory control.
        </p>
        
        <h2>Key Concepts</h2>
        <ul>
          <li><strong>Inventories</strong> - Separate containers for different stock types (Kitchen, Bar, Storage)</li>
          <li><strong>Items</strong> - Individual products tracked within each inventory</li>
          <li><strong>Audits</strong> - Formal stock counts performed against an inventory</li>
          <li><strong>Discrepancies</strong> - Differences between expected and actual stock levels</li>
        </ul>
        
        <h2>Getting Started</h2>
        <p>
          To begin using AuditFlow, you'll need to create an account and set up your first inventory. 
          Follow our Quick Start Guide to get up and running in minutes.
        </p>
      </div>
    )
  },
  "getting-started/quick-start": {
    title: "Quick Start Guide",
    category: "Getting Started",
    content: (
      <div className="prose-content">
        <p className="lead">
          Get up and running with AuditFlow in just a few minutes. This guide walks you through 
          the essential steps to start managing your inventory.
        </p>
        
        <div className="step-list">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Your Account</h3>
              <p>Sign up with your email address and create a secure password. Verify your email to activate your account.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Create Your First Inventory</h3>
              <p>Go to the Inventory section and click "Add Inventory Type". Name it (e.g., "Kitchen") and choose a color for identification.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Add Items</h3>
              <p>Click "Add Item" to start building your inventory. Enter the item name, quantity, unit, category, and other details.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Start Your First Audit</h3>
              <p>Navigate to Audits and click "Create Audit". Select the inventory you want to audit and begin counting items.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Review Results</h3>
              <p>Once you complete the audit, review discrepancies in the Reports section and take action on any issues found.</p>
            </div>
          </div>
        </div>
        
        <div className="tip-box">
          <Lightbulb size={18} />
          <div>
            <strong>Tip:</strong> Start with a small inventory to learn the system, then expand as you become comfortable.
          </div>
        </div>
      </div>
    )
  },
  "inventory/creating-inventories": {
    title: "Creating Inventories",
    category: "Inventory Management",
    content: (
      <div className="prose-content">
        <p className="lead">
          Inventories are the foundation of AuditFlow. Learn how to create and organize 
          different inventory types for your business.
        </p>
        
        <h2>What is an Inventory?</h2>
        <p>
          An inventory in AuditFlow represents a logical grouping of items, typically based on 
          location or category. For example, a restaurant might have separate inventories for:
        </p>
        <ul>
          <li><strong>Kitchen</strong> - Food ingredients, cooking supplies</li>
          <li><strong>Bar</strong> - Beverages, spirits, garnishes</li>
          <li><strong>Storage</strong> - Backup stock, bulk items</li>
        </ul>
        
        <h2>Creating a New Inventory</h2>
        <div className="step-list">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <p>Navigate to the <strong>Inventory</strong> page from the sidebar.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <p>Click the <strong>Manage Types</strong> button in the header.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <p>Click <strong>Add New Type</strong> and enter a name for your inventory.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <p>Select a color to help visually distinguish this inventory from others.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <p>Click <strong>Add</strong> to create the inventory type.</p>
            </div>
          </div>
        </div>
        
        <div className="warning-box">
          <AlertCircle size={18} />
          <div>
            <strong>Note:</strong> Deleting an inventory type will remove all items within it. This action cannot be undone.
          </div>
        </div>
      </div>
    )
  },
  "inventory/managing-items": {
    title: "Adding & Editing Items",
    category: "Inventory Management",
    content: (
      <div className="prose-content">
        <p className="lead">
          Items are the individual products you track within each inventory. Learn how to add, 
          edit, and manage your inventory items effectively.
        </p>
        
        <h2>Adding a New Item</h2>
        <div className="step-list">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <p>From the Inventory page, click the <strong>Add Item</strong> button.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <p>Fill in the required fields:</p>
              <ul>
                <li><strong>Name</strong> - The item's display name</li>
                <li><strong>Inventory Type</strong> - Which inventory this belongs to</li>
                <li><strong>Category</strong> - Grouping for organization</li>
                <li><strong>Quantity</strong> - Current stock level</li>
                <li><strong>Unit</strong> - Measurement unit (kg, L, pieces, etc.)</li>
                <li><strong>Minimum Stock</strong> - Threshold for low stock alerts</li>
              </ul>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <p>Optionally add price, supplier, and expiration date information.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <p>Click <strong>Add Item</strong> to save.</p>
            </div>
          </div>
        </div>
        
        <h2>Editing an Item</h2>
        <p>
          To edit an existing item, click the <strong>pencil icon</strong> in the Actions column of the 
          inventory table. This opens a modal with all item fields pre-populated. Make your changes 
          and click <strong>Save Changes</strong> to update.
        </p>
        
        <h2>Item Statuses</h2>
        <p>Items automatically receive status badges based on their stock levels:</p>
        <ul>
          <li><strong>In Stock</strong> - Quantity is above minimum threshold</li>
          <li><strong>Low Stock</strong> - Quantity is at or below minimum threshold</li>
          <li><strong>Out of Stock</strong> - Quantity is zero</li>
          <li><strong>Expiring Soon</strong> - Within 7 days of expiration date</li>
        </ul>
      </div>
    )
  },
  "audits/starting-audits": {
    title: "Starting an Audit",
    category: "Audits",
    content: (
      <div className="prose-content">
        <p className="lead">
          Audits are the core feature of AuditFlow. Learn how to create and start an audit 
          for any of your inventories.
        </p>
        
        <h2>What is an Audit?</h2>
        <p>
          An audit is a formal process of counting all items in an inventory and comparing 
          the counted values to expected values. This helps identify discrepancies, losses, 
          or data entry errors.
        </p>
        
        <h2>Creating a New Audit</h2>
        <div className="step-list">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <p>Navigate to the <strong>Audits</strong> page from the sidebar.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <p>Click the <strong>Create Audit</strong> button.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <p>Select the <strong>Inventory</strong> you want to audit from the dropdown.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <p>Assign an <strong>Auditor</strong> (or yourself) to perform the audit.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <p>Add optional <strong>Notes</strong> about the audit scope or purpose.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">6</div>
            <div className="step-content">
              <p>Click <strong>Create Audit</strong> to save. The audit will be in "Not Started" status.</p>
            </div>
          </div>
        </div>
        
        <h2>Audit Statuses</h2>
        <ul>
          <li><strong>Not Started</strong> - Audit created but no items counted yet</li>
          <li><strong>In Progress</strong> - Counting has begun but not all items are complete</li>
          <li><strong>Completed</strong> - All items counted and audit finalized</li>
        </ul>
        
        <div className="tip-box">
          <Lightbulb size={18} />
          <div>
            <strong>Tip:</strong> Schedule regular audits (weekly or monthly) to maintain accurate inventory records.
          </div>
        </div>
      </div>
    )
  },
  "audits/counting-items": {
    title: "Counting Items",
    category: "Audits",
    content: (
      <div className="prose-content">
        <p className="lead">
          Learn how to efficiently count items during an audit and record accurate values.
        </p>
        
        <h2>Opening an Audit</h2>
        <p>
          From the Audits page, click on any audit to open its detail view. You'll see a table 
          of all items from the selected inventory with columns for expected values and input 
          fields for counted values.
        </p>
        
        <h2>Recording Counts</h2>
        <p>For each item, you'll enter:</p>
        <ul>
          <li><strong>Counted Quantity</strong> - The actual amount in stock/storage</li>
          <li><strong>Counted Available</strong> - The amount currently on sale or in use</li>
          <li><strong>Notes</strong> - Optional observations about the item</li>
        </ul>
        
        <div className="step-list">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <p>Click on an item row or the <strong>Count</strong> button to start entering values.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <p>Enter the <strong>Counted Quantity</strong> (total in stock).</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <p>Enter the <strong>Counted Available</strong> (on sale or in use).</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <p>Click <strong>Save</strong> to record the count. The item status changes to "Counted".</p>
            </div>
          </div>
        </div>
        
        <h2>Discrepancy Calculation</h2>
        <p>
          Discrepancies are calculated automatically: <code>Expected - Counted = Discrepancy</code>
        </p>
        <ul>
          <li><strong>Negative discrepancy</strong> - Less stock than expected (potential loss)</li>
          <li><strong>Positive discrepancy</strong> - More stock than expected (data entry error)</li>
          <li><strong>Zero discrepancy</strong> - Counts match expected values</li>
        </ul>
      </div>
    )
  },
  "audits/audit-comments": {
    title: "Adding Comments",
    category: "Audits",
    content: (
      <div className="prose-content">
        <p className="lead">
          Comments provide context and documentation for audit findings. Learn how to use 
          the comments system effectively.
        </p>
        
        <h2>Why Use Comments?</h2>
        <p>Comments help you:</p>
        <ul>
          <li>Document observations during the audit</li>
          <li>Explain discrepancies for future reference</li>
          <li>Flag issues that need follow-up</li>
          <li>Communicate with team members</li>
        </ul>
        
        <h2>Adding a Comment</h2>
        <div className="step-list">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <p>Scroll to the <strong>Comments</strong> section at the bottom of the audit page.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <p>Click the <strong>Add Comment</strong> button.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <p>Select a <strong>Comment Type</strong>:</p>
              <ul>
                <li><strong>General</strong> - Standard observations</li>
                <li><strong>Discrepancy</strong> - Explanations for count differences</li>
                <li><strong>Issue</strong> - Problems that need attention</li>
              </ul>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <p>Write your comment in the text field.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <p>Click <strong>Submit</strong> to save the comment with your name and timestamp.</p>
            </div>
          </div>
        </div>
        
        <div className="tip-box">
          <Lightbulb size={18} />
          <div>
            <strong>Best Practice:</strong> Add comments as you discover issues during the audit, not at the end. 
            This ensures details are fresh and accurate.
          </div>
        </div>
      </div>
    )
  },
  "team/roles-permissions": {
    title: "Roles & Permissions",
    category: "Team & Collaboration",
    content: (
      <div className="prose-content">
        <p className="lead">
          AuditFlow uses role-based access control to manage what team members can see and do.
        </p>
        
        <h2>Available Roles</h2>
        
        <div className="role-card">
          <h3>Admin</h3>
          <p>Full access to all features including:</p>
          <ul>
            <li>Manage team members and roles</li>
            <li>Access billing and subscription settings</li>
            <li>Configure organization settings</li>
            <li>All auditor permissions</li>
          </ul>
        </div>
        
        <div className="role-card">
          <h3>Auditor</h3>
          <p>Can perform core audit functions:</p>
          <ul>
            <li>Create and perform audits</li>
            <li>Manage inventory items</li>
            <li>Add comments and flag items</li>
            <li>View and export reports</li>
          </ul>
        </div>
        
        <div className="role-card">
          <h3>Viewer</h3>
          <p>Read-only access for oversight:</p>
          <ul>
            <li>View audits and audit history</li>
            <li>View inventory (cannot edit)</li>
            <li>View reports and analytics</li>
            <li>Add comments to audits</li>
          </ul>
        </div>
        
        <h2>Changing Roles</h2>
        <p>
          Only Admins can change team member roles. Go to <strong>Settings &gt; Team</strong> and 
          click on a team member to edit their role.
        </p>
        
        <div className="warning-box">
          <AlertCircle size={18} />
          <div>
            <strong>Important:</strong> There must always be at least one Admin on the account. 
            You cannot remove or demote the last Admin.
          </div>
        </div>
      </div>
    )
  },
  "billing-subscriptions/plans": {
    title: "Subscription Plans",
    category: "Billing & Subscriptions",
    content: (
      <div className="prose-content">
        <p className="lead">
          AuditFlow offers three subscription tiers to match your business needs.
        </p>
        
        <h2>Plan Comparison</h2>
        
        <div className="plan-card">
          <h3>Basic - Free</h3>
          <p>Perfect for individuals and small teams getting started.</p>
          <ul>
            <li>Up to 2 inventories</li>
            <li>50 items per inventory</li>
            <li>30-day audit history</li>
            <li>Basic reporting</li>
            <li>Email support</li>
          </ul>
        </div>
        
        <div className="plan-card featured">
          <h3>Professional - $29/month</h3>
          <p>For growing businesses that need more capacity and features.</p>
          <ul>
            <li>Unlimited inventories</li>
            <li>Unlimited items</li>
            <li>1-year audit history</li>
            <li>Advanced analytics</li>
            <li>Custom units & categories</li>
            <li>Team collaboration (5 users)</li>
            <li>Priority support</li>
          </ul>
        </div>
        
        <div className="plan-card">
          <h3>Enterprise - $99/month</h3>
          <p>For organizations requiring full control and dedicated support.</p>
          <ul>
            <li>Everything in Professional</li>
            <li>Unlimited audit history</li>
            <li>Unlimited team members</li>
            <li>API access</li>
            <li>Custom integrations</li>
            <li>Dedicated account manager</li>
            <li>24/7 phone support</li>
            <li>SLA guarantee</li>
          </ul>
        </div>
        
        <h2>Changing Plans</h2>
        <p>
          You can upgrade or downgrade your plan at any time from <strong>Settings &gt; Subscription</strong>. 
          Changes take effect immediately, and billing is prorated.
        </p>
      </div>
    )
  },
}

const categoryIcons: Record<string, typeof Book> = {
  "Getting Started": Book,
  "Inventory Management": Package,
  "Audits": FileText,
  "Reports & Analytics": BarChart3,
  "Team & Collaboration": Users,
  "Billing & Subscriptions": CreditCard,
}

export default function DocPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug || ''
  
  const doc = docsContent[slug]
  
  if (!doc) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ClipboardCheck size={18} className="text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">AuditFlow</span>
              </Link>
            </div>
          </div>
        </nav>
        
        <div className="pt-32 pb-16 px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The documentation page you're looking for doesn't exist.</p>
          <Link href="/docs">
            <Button className="bg-foreground text-background hover:bg-foreground/90">
              Back to Documentation
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  
  const CategoryIcon = categoryIcons[doc.category] || Book

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
                All Docs
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

      {/* Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/docs" className="hover:text-foreground">Docs</Link>
            <ChevronRight size={14} />
            <span className="flex items-center gap-1">
              <CategoryIcon size={14} />
              {doc.category}
            </span>
            <ChevronRight size={14} />
            <span className="text-foreground">{doc.title}</span>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">{doc.title}</h1>
          
          {/* Content */}
          <div className="docs-content">
            {doc.content}
          </div>
          
          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-border">
            <Link href="/docs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} />
              Back to Documentation
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>2024 AuditFlow</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/docs" className="hover:text-foreground">Documentation</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
      
      <style jsx global>{`
        .docs-content {
          color: var(--muted-foreground);
          line-height: 1.7;
        }
        
        .docs-content .lead {
          font-size: 1.125rem;
          color: var(--foreground);
          margin-bottom: 2rem;
        }
        
        .docs-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--foreground);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .docs-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--foreground);
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .docs-content p {
          margin-bottom: 1rem;
        }
        
        .docs-content ul {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .docs-content li {
          margin-bottom: 0.5rem;
        }
        
        .docs-content strong {
          color: var(--foreground);
          font-weight: 500;
        }
        
        .docs-content code {
          background: var(--secondary);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .step-list {
          margin: 1.5rem 0;
        }
        
        .step {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .step-number {
          width: 2rem;
          height: 2rem;
          background: var(--primary);
          color: var(--primary-foreground);
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        
        .step-content {
          flex: 1;
          padding-top: 0.25rem;
        }
        
        .step-content p {
          margin-bottom: 0.5rem;
        }
        
        .step-content ul {
          margin-top: 0.5rem;
        }
        
        .tip-box, .warning-box {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        
        .tip-box {
          background: hsl(var(--primary) / 0.1);
          border: 1px solid hsl(var(--primary) / 0.2);
          color: var(--primary);
        }
        
        .tip-box div {
          color: var(--muted-foreground);
        }
        
        .warning-box {
          background: hsl(var(--destructive) / 0.1);
          border: 1px solid hsl(var(--destructive) / 0.2);
          color: var(--destructive);
        }
        
        .warning-box div {
          color: var(--muted-foreground);
        }
        
        .role-card, .plan-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .plan-card.featured {
          border-color: var(--primary);
          background: hsl(var(--primary) / 0.05);
        }
        
        .role-card h3, .plan-card h3 {
          margin-top: 0;
        }
      `}</style>
    </div>
  )
}
