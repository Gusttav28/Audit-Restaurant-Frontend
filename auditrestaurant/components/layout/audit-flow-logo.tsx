"use client"

import { CheckCircle2, Waves } from "lucide-react"

interface AuditFlowLogoProps {
  collapsed?: boolean
}

export default function AuditFlowLogo({ collapsed = false }: AuditFlowLogoProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/15">
        <Waves size={22} className="text-accent" />
        <CheckCircle2 size={13} className="absolute -right-1 -top-1 rounded-full bg-sidebar text-primary" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-sidebar-foreground">Audit Flow</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Inventory audits</p>
        </div>
      )}
    </div>
  )
}
