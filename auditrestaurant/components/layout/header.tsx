'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Bell, Building2, ChevronDown, Check, Moon, Plus, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppContext } from '@/components/app-context'
import { withShortcut } from '@/components/layout/shortcut-utils'

const countryOptions = ['Costa Rica', 'United States', 'Mexico', 'Spain']

export default function Header() {
  const { theme, setTheme } = useTheme()
  const {
    restaurants,
    selectedRestaurant,
    selectedRestaurantId,
    requestRestaurantSwitch,
    createRestaurant,
    assignedAuditTasks,
    refreshAssignedWork,
    isPrimaryAdmin,
    t,
  } = useAppContext()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isRestaurantMenuOpen, setIsRestaurantMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [newRestaurant, setNewRestaurant] = useState({ name: '', country: 'Costa Rica', email: '', phone: '', address: '' })
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const isLightMode = theme === 'light'
  const canOpenRestaurantMenu = isPrimaryAdmin || restaurants.length > 1

  React.useEffect(() => {
    const openRestaurantMenu = () => {
      if (canOpenRestaurantMenu) setIsRestaurantMenuOpen(true)
    }
    const openNotifications = () => {
      setIsNotificationsOpen(true)
      void refreshAssignedWork()
    }

    window.addEventListener('auditflow:open-restaurant-menu', openRestaurantMenu)
    window.addEventListener('auditflow:open-notifications', openNotifications)
    return () => {
      window.removeEventListener('auditflow:open-restaurant-menu', openRestaurantMenu)
      window.removeEventListener('auditflow:open-notifications', openNotifications)
    }
  }, [canOpenRestaurantMenu, refreshAssignedWork])

  const handleCreateRestaurant = async () => {
    if (!newRestaurant.name.trim() || !newRestaurant.country.trim()) return
    const createdRestaurantId = await createRestaurant(newRestaurant)
    if (!createdRestaurantId) return
    setNewRestaurant({ name: '', country: 'Costa Rica', email: '', phone: '', address: '' })
    setIsCreateOpen(false)
  }

  const detectCountry = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
        const data = await response.json()
        const country = data?.address?.country
        if (country) {
          setNewRestaurant((prev) => ({ ...prev, country }))
        }
      } catch {
        // Location detection is optional.
      }
    })
  }

  const fetchAddressSuggestions = async (address: string) => {
    setNewRestaurant((prev) => ({ ...prev, address }))
    if (address.trim().length < 3) {
      setAddressSuggestions([])
      return
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=4&country=${encodeURIComponent(newRestaurant.country)}&q=${encodeURIComponent(address)}`)
      const data = await response.json()
      setAddressSuggestions((Array.isArray(data) ? data : []).map((item) => item.display_name).filter(Boolean))
    } catch {
      setAddressSuggestions([])
    }
  }

  return (
    <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-30 sm:px-6">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div />
        <DropdownMenu open={isRestaurantMenuOpen} onOpenChange={setIsRestaurantMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={!canOpenRestaurantMenu}
              title={t('switchRestaurant')}
              className="w-full max-w-sm justify-between gap-3 bg-secondary/20 disabled:cursor-default disabled:opacity-100 sm:w-auto sm:min-w-72"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Building2 size={18} className="shrink-0 text-primary" />
                <span className="truncate text-left">
                  <span className="block text-sm font-semibold text-foreground">{selectedRestaurant.name}</span>
                  <span className="block text-xs text-muted-foreground">{selectedRestaurant.location}</span>
                </span>
              </span>
              <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          {canOpenRestaurantMenu && <DropdownMenuContent align="start" className="w-64 border-border bg-popover">
            <DropdownMenuLabel className="text-muted-foreground">{t('switchRestaurant')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {restaurants.map((restaurant) => (
              <DropdownMenuItem
                key={restaurant.id}
                onClick={() => requestRestaurantSwitch(restaurant.id)}
                className="cursor-pointer"
              >
                <Building2 size={16} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{restaurant.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{restaurant.location}</span>
                </span>
                {restaurant.id === selectedRestaurantId && <Check size={16} className="text-primary" />}
              </DropdownMenuItem>
            ))}
            {isPrimaryAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsCreateOpen(true)} className="cursor-pointer text-primary">
                  <Plus size={16} />
                  {t('createRestaurant')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>}
        </DropdownMenu>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            title={withShortcut(isLightMode ? t('darkMode') : t('lightMode'), 'theme')}
            aria-label={withShortcut(isLightMode ? t('darkMode') : t('lightMode'), 'theme')}
            className="bg-secondary/20"
            onClick={() => setTheme(isLightMode ? 'dark' : 'light')}
          >
            {isLightMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
          </Button>
          <DropdownMenu
            open={isNotificationsOpen}
            onOpenChange={(open) => {
              setIsNotificationsOpen(open)
              if (open) void refreshAssignedWork()
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title={withShortcut(t('notifications'), 'notifications')}
                aria-label={withShortcut(t('notifications'), 'notifications')}
                className="relative bg-secondary/20"
              >
                <Bell size={18} className="text-primary" />
                {assignedAuditTasks.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow-lg shadow-destructive/30">
                    {assignedAuditTasks.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-border bg-popover p-2">
              <DropdownMenuLabel className="text-muted-foreground">{t('assignedAuditTasks')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {assignedAuditTasks.length ? assignedAuditTasks.map((audit) => (
                <DropdownMenuItem key={audit.id} asChild>
                  <Link href={`/audits/${audit.id}`} className="flex cursor-pointer flex-col items-start gap-1 rounded-md p-3">
                    <span className="font-medium text-foreground">{audit.id} · {audit.inventoryName}</span>
                    <span className="text-xs text-muted-foreground">{t('dueDate')}: {audit.dueDate ?? audit.createdDate}</span>
                    <span className="text-xs text-muted-foreground">{t('assignedDate')}: {audit.assignedDate ?? audit.createdDate}</span>
                  </Link>
                </DropdownMenuItem>
              )) : (
                <div className="px-3 py-4 text-sm text-muted-foreground">{t('noAssignedAuditTasks')}</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isCreateOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 p-4" onClick={() => setIsCreateOpen(false)}>
          <div className="w-full max-w-lg rounded-lg border border-border bg-card" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="text-lg font-bold text-foreground">{t('createRestaurantTitle')}</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={22} />
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {[
                ['name', t('restaurantName'), true],
                ['country', t('country'), true],
                ['email', t('email'), false],
                ['phone', t('phone'), false],
                ['address', t('address'), false],
              ].map(([key, label, required]) => (
                <div key={key as string} className={key === 'address' ? 'sm:col-span-2' : ''}>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    {label}{required ? ' *' : ''}
                  </label>
                  {key === 'country' ? (
                    <select
                      value={newRestaurant.country}
                      onFocus={detectCountry}
                      onChange={(event) => setNewRestaurant((prev) => ({ ...prev, country: event.target.value }))}
                      className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                    >
                      {countryOptions.map((country) => <option key={country} value={country}>{country}</option>)}
                    </select>
                  ) : (
                    <input
                      value={newRestaurant[key as keyof typeof newRestaurant]}
                      onChange={(event) => key === 'address' ? fetchAddressSuggestions(event.target.value) : setNewRestaurant((prev) => ({ ...prev, [key as string]: event.target.value }))}
                      className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                    />
                  )}
                  {key === 'address' && addressSuggestions.length > 0 && (
                    <div className="mt-2 rounded-lg border border-border bg-secondary/20">
                      {addressSuggestions.map((suggestion) => (
                        <button key={suggestion} type="button" onClick={() => {
                          setNewRestaurant((prev) => ({ ...prev, address: suggestion }))
                          setAddressSuggestions([])
                        }} className="block w-full px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground">
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 border-t border-border p-6">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsCreateOpen(false)}>
                {t('cancel')}
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreateRestaurant}>
                {t('createRestaurant')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
