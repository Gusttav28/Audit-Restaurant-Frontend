'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Package, FileText, Settings, Menu, X, Coins, Languages, User, PanelLeftClose, PanelLeftOpen, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAppContext } from '@/components/app-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AuditFlowLogo from '@/components/layout/audit-flow-logo'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('auditflow-sidebar-open') === 'true'
  })
  const pathname = usePathname()
  const {
    currency,
    setCurrency,
    language,
    setLanguage,
    exchangeRate,
    setExchangeRate,
    converterAmount,
    setConverterAmount,
    convertedAmount,
    t,
  } = useAppContext()
  const isCollapsed = !isOpen

  const menuItems = [
    { icon: BarChart3, label: t('dashboard'), href: '/dashboard' },
    { icon: Package, label: t('inventory'), href: '/inventory' },
    { icon: FileText, label: t('audits'), href: '/audits' },
    { icon: BarChart3, label: t('reports'), href: '/reports' },
    { icon: Settings, label: t('settings'), href: '/settings' },
  ]

  useEffect(() => {
    window.localStorage.setItem('auditflow-sidebar-open', String(isOpen))
  }, [isOpen])

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
        className={`fixed left-0 top-0 flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 lg:sticky lg:top-0 lg:z-auto
          ${isOpen ? 'w-64' : 'w-0 lg:w-20'} overflow-hidden lg:overflow-visible`}
      >
        <div
          className={`group/sidebar-logo border-b border-sidebar-border ${isCollapsed ? 'p-4' : 'p-6'}`}
          tabIndex={isCollapsed ? 0 : -1}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
            {isCollapsed ? (
              <>
                <div className="flex h-9 w-9 items-center justify-center transition-opacity duration-150 group-hover/sidebar-logo:hidden group-focus/sidebar-logo:hidden">
                  <AuditFlowLogo collapsed />
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="hidden h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent group-hover/sidebar-logo:flex group-focus/sidebar-logo:flex"
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen size={18} />
                </button>
              </>
            ) : (
              <>
                <AuditFlowLogo />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="hidden rounded-lg p-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent lg:inline-flex"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        <nav className={`p-4 space-y-2 ${isCollapsed ? 'px-3' : ''}`}>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={index}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-lg transition-colors ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'}
                  ${isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
              >
                <item.icon size={20} className="shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className={`mt-auto border-t border-sidebar-border p-4 space-y-3 ${isCollapsed ? 'px-3' : ''}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                title={isCollapsed ? t('currency') : undefined}
                className={`w-full bg-secondary/20 ${isCollapsed ? 'justify-center px-0' : 'justify-between gap-2'}`}
              >
                <span className="flex items-center gap-2">
                  <Coins size={17} className="text-primary" />
                  {!isCollapsed && <span>{currency}</span>}
                </span>
                {!isCollapsed && <ChevronDown size={14} className="text-muted-foreground" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 border-border bg-popover p-3">
              <DropdownMenuLabel className="px-0 text-muted-foreground">{t('currency')}</DropdownMenuLabel>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(['USD', 'CRC'] as const).map((option) => (
                  <Button
                    key={option}
                    variant={currency === option ? 'default' : 'outline'}
                    className={currency === option ? 'bg-primary text-primary-foreground' : 'bg-transparent'}
                    onClick={() => setCurrency(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <DropdownMenuSeparator />
              <div className="space-y-3">
                <label className="block text-xs font-medium text-muted-foreground">{t('exchangeRate')} USD - CRC</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(event) => setExchangeRate(Number(event.target.value) || exchangeRate)}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                />
                <label className="block text-xs font-medium text-muted-foreground">{t('convert')}</label>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={converterAmount}
                    onChange={(event) => setConverterAmount(Number(event.target.value) || 0)}
                    className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                  <span className="text-xs text-muted-foreground">-</span>
                  <div className="rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm text-foreground">
                    {convertedAmount.toFixed(currency === 'USD' ? 0 : 2)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currency === 'USD' ? 'USD - CRC' : 'CRC - USD'}
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            title={isCollapsed ? t('language') : undefined}
            className={`w-full bg-secondary/20 ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-2'}`}
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          >
            <Languages size={17} className="text-primary" />
            {!isCollapsed && <span>{language === 'en' ? 'EN' : 'ES'}</span>}
          </Button>

          <Link href="/profile" title={isCollapsed ? t('profile') : undefined}>
            <Button
              variant="ghost"
              className={`w-full text-sidebar-foreground hover:bg-sidebar-accent ${pathname.startsWith('/profile') ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary' : ''} ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                <User size={17} className="text-accent-foreground" />
              </span>
              {!isCollapsed && <span>{t('profile')}</span>}
            </Button>
          </Link>
        </div>
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
