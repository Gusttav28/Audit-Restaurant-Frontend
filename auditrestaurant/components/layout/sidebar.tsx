'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Package, FileText, Settings, Menu, X, Coins, Languages, User, Users, PanelLeftClose, PanelLeftOpen, ChevronDown, LogOut, ClipboardCheck } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useAppContext } from '@/components/app-context'
import { clearSupabaseBrowserState, createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AuditFlowLogo from '@/components/layout/audit-flow-logo'
import { formatShortcut, isMacPlatform, shouldIgnoreShortcut, withShortcut, type ShortcutAction } from '@/components/layout/shortcut-utils'

const RESPONSIVE_SIDEBAR_QUERY = '(max-width: 1279px)'

function isResponsiveSidebarViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(RESPONSIVE_SIDEBAR_QUERY).matches
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    if (isResponsiveSidebarViewport()) {
      document.documentElement.style.setProperty('--auditflow-sidebar-width', '0rem')
      return false
    }
    if (window.sessionStorage.getItem('auditflow-auth-transition') === 'login') {
      window.localStorage.setItem('auditflow-sidebar-open', 'true')
      document.documentElement.style.setProperty('--auditflow-sidebar-width', '16rem')
      return true
    }
    const storedPreference = window.localStorage.getItem('auditflow-sidebar-open')
    return storedPreference === null ? true : storedPreference === 'true'
  })
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
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
    currentUserName,
    isAdmin,
    isPrimaryAdmin,
    isAppLoading,
    startRouteLoading,
  } = useAppContext()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isResponsiveSidebar, setIsResponsiveSidebar] = useState(false)
  const [suppressCollapsedLogoToggle, setSuppressCollapsedLogoToggle] = useState(false)
  const isCollapsed = !isOpen
  const canRevealCollapsedLogoToggle = isCollapsed && !suppressCollapsedLogoToggle

  const menuItems = [
    { icon: BarChart3, label: t('dashboard'), href: '/dashboard', shortcut: undefined },
    { icon: Package, label: t('inventory'), href: '/inventory', shortcut: 'inventory' as const },
    { icon: FileText, label: t('audits'), href: '/audits', shortcut: 'audits' as const },
    { icon: BarChart3, label: t('reports'), href: '/reports', shortcut: 'reports' as const },
    ...(isAdmin ? [
      { icon: ClipboardCheck, label: t('assignedWork'), href: '/assigned-work', shortcut: 'assignedWork' as const },
    ] : []),
    ...(isPrimaryAdmin ? [
      { icon: Users, label: t('teamMembers'), href: '/team', shortcut: 'team' as const },
    ] : []),
    ...(isAdmin ? [
      { icon: Settings, label: t('settings'), href: '/settings', shortcut: 'settings' as const },
    ] : []),
  ]

  useEffect(() => {
    const media = window.matchMedia(RESPONSIVE_SIDEBAR_QUERY)
    const syncResponsiveState = () => {
      const isResponsive = media.matches
      setIsResponsiveSidebar(isResponsive)
      if (isResponsive) {
        setIsOpen(false)
      } else {
        const storedPreference = window.localStorage.getItem('auditflow-sidebar-open')
        setIsOpen(storedPreference === null ? true : storedPreference === 'true')
      }
    }

    syncResponsiveState()
    media.addEventListener('change', syncResponsiveState)
    return () => media.removeEventListener('change', syncResponsiveState)
  }, [])

  useEffect(() => {
    if (!isResponsiveSidebar) {
      window.localStorage.setItem('auditflow-sidebar-open', String(isOpen))
    }
  }, [isOpen, isResponsiveSidebar])

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--auditflow-sidebar-width',
      isResponsiveSidebar ? (isOpen ? '16rem' : '0rem') : (isOpen ? '16rem' : '5rem'),
    )
  }, [isOpen, isResponsiveSidebar])

  const closeResponsiveSidebar = () => {
    if (isResponsiveSidebarViewport()) {
      setIsOpen(false)
    }
  }

  const handleLogout = async () => {
    if (isAppLoading) return
    setIsLoggingOut(true)
    await createSupabaseBrowserClient().auth.signOut({ scope: 'global' })
    clearSupabaseBrowserState()
    window.setTimeout(() => window.location.assign('/login'), 550)
  }

  useEffect(() => {
    const navigateWithShortcut = (href: string) => {
      const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
      if (isActive) return
      startRouteLoading()
      router.push(href)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAppLoading || shouldIgnoreShortcut(event)) return

      const usesMacModifier = isMacPlatform()
      const hasModifier = usesMacModifier ? event.metaKey : event.ctrlKey
      const hasNotificationModifier = usesMacModifier
        ? event.metaKey && event.ctrlKey && !event.altKey
        : event.ctrlKey && event.altKey
      if (!hasModifier && !hasNotificationModifier) return

      const key = event.key.toLowerCase()

      if (key === 'n' && hasNotificationModifier && !event.shiftKey) {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent('auditflow:open-notifications'))
        return
      }

      if (!hasModifier || event.altKey) return

      if (event.shiftKey && event.code === 'Space') {
        event.preventDefault()
        void handleLogout()
        return
      }

      if (key === '\\') {
        if (event.shiftKey) return
        event.preventDefault()
        setIsOpen((open) => !open)
        return
      }

      if (key === 'b' && !event.shiftKey) {
        event.preventDefault()
        setTheme(theme === 'light' ? 'dark' : 'light')
        return
      }

      if (key === 'j' && !event.shiftKey) {
        event.preventDefault()
        if (isAdmin) navigateWithShortcut('/assigned-work')
        return
      }

      if (key === 't' && !event.shiftKey && typeof event.getModifierState === 'function' && event.getModifierState('Fn')) {
        event.preventDefault()
        if (isPrimaryAdmin) navigateWithShortcut('/team')
        return
      }

      if (!event.shiftKey) return

      if (key === 'i') {
        event.preventDefault()
        navigateWithShortcut('/inventory')
        return
      }

      if (key === 'a') {
        event.preventDefault()
        navigateWithShortcut('/audits')
        return
      }

      if (key === 'r') {
        event.preventDefault()
        navigateWithShortcut('/reports')
        return
      }

      if (key === 's') {
        event.preventDefault()
        if (isAdmin) navigateWithShortcut('/settings')
        return
      }

      if (key === 'p') {
        event.preventDefault()
        navigateWithShortcut('/profile')
        return
      }

    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAdmin, isAppLoading, isOpen, isPrimaryAdmin, pathname, router, setTheme, startRouteLoading, theme])

  const actionLabel = (label: string, action?: ShortcutAction) => action ? withShortcut(label, action) : label
  const shortcutText = (action?: ShortcutAction) => action ? formatShortcut(action) : null

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => {
          if (!isAppLoading) setIsOpen(!isOpen)
        }}
        disabled={isAppLoading}
        className="fixed left-4 top-4 z-40 p-2 rounded-lg bg-sidebar hover:bg-sidebar-accent disabled:cursor-wait xl:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-300 ease-out z-50 xl:sticky xl:top-0 xl:z-auto
          ${isOpen ? 'w-64 overflow-hidden' : 'w-0 overflow-hidden xl:w-20 xl:overflow-visible'}`}
      >
        <div
          className="group/sidebar-logo border-b border-sidebar-border p-4"
          onMouseLeave={() => setSuppressCollapsedLogoToggle(false)}
          tabIndex={isCollapsed ? 0 : -1}
        >
          <div className={`relative flex h-10 items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
            <div className={`${isCollapsed ? `absolute left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center transition-opacity duration-150 ${canRevealCollapsedLogoToggle ? 'group-hover/sidebar-logo:opacity-0 group-focus/sidebar-logo:opacity-0' : 'opacity-100'}` : 'min-w-10'}`}>
              <AuditFlowLogo
                collapsed={isCollapsed}
                className={isCollapsed ? "justify-center" : ""}
                imageClassName={isCollapsed ? "h-10 w-10 rounded-xl" : "h-9 w-9 rounded-lg"}
              />
            </div>
            <button
              type="button"
              onClick={(event) => {
                if (isAppLoading) return
                event.currentTarget.blur()
                setIsOpen((open) => {
                  if (open) setSuppressCollapsedLogoToggle(true)
                  return !open
                })
              }}
              disabled={isAppLoading}
              className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground transition-opacity duration-200 hover:bg-sidebar-accent disabled:cursor-wait xl:inline-flex ${isCollapsed ? `absolute left-1/2 -translate-x-1/2 opacity-0 ${canRevealCollapsedLogoToggle ? 'group-hover/sidebar-logo:opacity-100 group-focus/sidebar-logo:opacity-100' : ''}` : 'opacity-100'}`}
              aria-label={withShortcut(t('toggleSidebar'), 'sidebar')}
              title={withShortcut(t('toggleSidebar'), 'sidebar')}
            >
              {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
          </div>
        </div>

        <nav className="space-y-2 p-3">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={index}
                href={item.href}
                title={isCollapsed ? actionLabel(item.label, item.shortcut) : item.label}
                className={`group/nav-item relative flex h-11 items-center rounded-lg transition-colors
                  ${isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-[var(--accent)] hover:text-white dark:hover:bg-sidebar-primary dark:hover:text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-[var(--accent)] hover:text-white dark:hover:bg-sidebar-accent dark:hover:text-white'
                  } ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
                onClick={(event) => {
                  if (isAppLoading) {
                    event.preventDefault()
                    return
                  }
                  if (isActive) {
                    closeResponsiveSidebar()
                    return
                  }
                  startRouteLoading()
                  closeResponsiveSidebar()
                }}
              >
                <item.icon size={20} className={`shrink-0 transition-colors ${isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground group-hover/nav-item:text-primary'}`} />
                <span className={`min-w-0 whitespace-nowrap font-medium transition-[color,opacity,transform,width] duration-200 ${isCollapsed ? 'pointer-events-none w-0 -translate-x-1 overflow-hidden opacity-0' : 'flex w-auto translate-x-0 items-center gap-2 opacity-100 group-hover/nav-item:text-white'}`}>
                  <span>{item.label}</span>
                </span>
                {isCollapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-[70] ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover/nav-item:opacity-100 group-focus-visible/nav-item:opacity-100 xl:block">
                    <span>{item.label}</span>
                    {shortcutText(item.shortcut) && <span className="ml-2 text-muted-foreground">{shortcutText(item.shortcut)}</span>}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                title={isCollapsed ? t('currency') : undefined}
                disabled={isAppLoading}
                className="group w-full justify-start gap-2 bg-secondary/20 px-3 hover:bg-accent hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Coins size={17} className="text-primary transition-colors group-hover:text-white" />
                  <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{currency}</span>
                </span>
                <ChevronDown size={14} className={`ml-auto text-muted-foreground transition-[color,opacity] duration-200 group-hover:text-white ${isCollapsed ? 'opacity-0' : 'opacity-100'}`} />
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
            className="group w-full justify-start gap-2 bg-secondary/20 px-3 hover:bg-accent hover:text-white"
            onClick={() => {
              if (!isAppLoading) setLanguage(language === 'en' ? 'es' : 'en')
            }}
            disabled={isAppLoading}
          >
            <Languages size={17} className="text-primary transition-colors group-hover:text-white" />
            <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{language === 'en' ? 'EN' : 'ES'}</span>
          </Button>

          <Link
            href="/profile"
            title={isCollapsed ? withShortcut(t('profile'), 'profile') : t('profile')}
            className="group/profile relative block"
            onClick={(event) => {
              if (isAppLoading) {
                event.preventDefault()
                return
              }
              if (pathname.startsWith('/profile')) {
                closeResponsiveSidebar()
                return
              }
              startRouteLoading()
              closeResponsiveSidebar()
            }}
          >
            <Button
              variant="ghost"
              className={`group h-11 w-full justify-start gap-3 px-3 text-sidebar-foreground hover:bg-primary hover:text-white ${pathname.startsWith('/profile') ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-primary hover:text-white' : ''}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15">
                <User size={17} className="text-accent transition-colors duration-200 group-hover:text-accent" />
              </span>
              <span className={`min-w-0 truncate transition-colors duration-200 ${isCollapsed ? 'opacity-0' : 'flex opacity-100'} group-hover:text-white`}>
                <span className="truncate">{currentUserName || t('profile')}</span>
              </span>
            </Button>
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 z-[70] ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover/profile:opacity-100 group-focus-within/profile:opacity-100 xl:block">
                <span>{t('profile')}</span>
                <span className="ml-2 text-muted-foreground">{formatShortcut('profile')}</span>
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isAppLoading || isLoggingOut}
            title={isCollapsed ? withShortcut(t('logout'), 'logout') : t('logout')}
            className="group/logout relative h-11 w-full justify-start gap-3 px-3 text-sidebar-foreground hover:bg-primary hover:text-white"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 transition-colors duration-200">
              <LogOut size={17} className="text-accent transition-colors duration-200 group-hover/logout:text-accent" />
            </span>
            <span className={`min-w-0 truncate transition-colors duration-200 ${isCollapsed ? 'opacity-0' : 'flex opacity-100'} group-hover/logout:text-white`}>
              <span>{t('logout')}</span>
            </span>
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 z-[70] ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover/logout:opacity-100 group-focus-visible/logout:opacity-100 xl:block">
                <span>{t('logout')}</span>
                <span className="ml-2 text-muted-foreground">{formatShortcut('logout')}</span>
              </span>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => {
            if (!isAppLoading) setIsOpen(false)
          }}
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
        />
      )}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background">
          <div className="text-center">
            <AuditFlowLogo collapsed className="mx-auto mb-4 animate-pulse justify-center" imageClassName="h-16 w-16 rounded-2xl" />
            <p className="text-sm uppercase tracking-widest text-muted-foreground">{t('loggingOut')}</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">AuditNett</h2>
          </div>
        </div>
      )}
    </>
  )
}
