'use client'

import React, { useState } from 'react'
import { Building2, ChevronDown, Check, Plus, X } from 'lucide-react'
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

export default function Header() {
  const {
    restaurants,
    selectedRestaurant,
    selectedRestaurantId,
    requestRestaurantSwitch,
    createRestaurant,
    t,
  } = useAppContext()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newRestaurant, setNewRestaurant] = useState({ name: '', location: '', email: '', phone: '', address: '' })

  const handleCreateRestaurant = () => {
    if (!newRestaurant.name.trim() || !newRestaurant.location.trim()) return
    createRestaurant(newRestaurant)
    setNewRestaurant({ name: '', location: '', email: '', phone: '', address: '' })
    setIsCreateOpen(false)
  }

  return (
    <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-30 sm:px-6">
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full max-w-sm justify-between gap-3 bg-secondary/20 sm:w-auto sm:min-w-72">
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
          <DropdownMenuContent align="start" className="w-64 border-border bg-popover">
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsCreateOpen(true)} className="cursor-pointer text-primary">
              <Plus size={16} />
              {t('createRestaurant')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isCreateOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="text-lg font-bold text-foreground">{t('createRestaurantTitle')}</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={22} />
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {[
                ['name', t('restaurantName'), true],
                ['location', t('location'), true],
                ['email', t('email'), false],
                ['phone', t('phone'), false],
                ['address', t('address'), false],
              ].map(([key, label, required]) => (
                <div key={key as string} className={key === 'address' ? 'sm:col-span-2' : ''}>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    {label}{required ? ' *' : ''}
                  </label>
                  <input
                    value={newRestaurant[key as keyof typeof newRestaurant]}
                    onChange={(event) => setNewRestaurant((prev) => ({ ...prev, [key as string]: event.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                  />
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
