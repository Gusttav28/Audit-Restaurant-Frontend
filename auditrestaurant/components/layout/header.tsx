'use client'

import React from 'react'
import { Bell, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-30">
      <div className="flex justify-end items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings size={20} />
        </Button>
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center cursor-pointer">
          <User size={20} className="text-accent-foreground" />
        </div>
      </div>
    </header>
  )
}
