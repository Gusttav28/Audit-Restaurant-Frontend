'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChefHat, BarChart3, Package, FileText, Settings, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Package, label: 'Inventory', href: '/inventory' },
    { icon: FileText, label: 'Audits', href: '/audits' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-40 p-2 rounded-lg bg-sidebar hover:bg-sidebar-accent lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 lg:static lg:z-auto
          ${isOpen ? 'w-64' : 'w-0 lg:w-64'} overflow-hidden lg:overflow-visible`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <ChefHat className="text-accent-foreground" size={20} />
            </div>
            {isOpen && (
              <h1 className="text-xl font-bold text-sidebar-foreground">AuditRestaurant</h1>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
              >
                <item.icon size={20} />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}
    </>
  )
}
