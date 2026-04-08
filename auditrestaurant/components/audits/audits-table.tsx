'use client'

import React from 'react'
import { Edit2, Trash2, Play, Eye, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AuditItem {
  itemId: number
  itemName: string
  category: string
  expectedQuantity: number
  availableQuantity: number
  countedQuantity: number | null
  countedAvailable: number | null
  unit: string
  unitPrice: number
  discrepancy: number | null
  discrepancyValue: number | null
  status: 'pending' | 'counted' | 'flagged'
  notes: string
}

interface Audit {
  id: string
  inventoryId: number
  inventoryName: string
  inventoryColor: string
  auditor: string
  createdDate: string
  startedDate: string | null
  completedDate: string | null
  status: 'not-started' | 'in-progress' | 'completed'
  items: AuditItem[]
  totalItems: number
  countedItems: number
  flaggedItems: number
  totalDiscrepancy: number
  notes: string
}

interface AuditsTableProps {
  audits: Audit[]
  onUpdateAudit: (id: string, data: Partial<Audit>) => void
  onDeleteAudit: (id: string) => void
}

export default function AuditsTable({ audits, onUpdateAudit, onDeleteAudit }: AuditsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent/20 text-accent'
      case 'in-progress':
        return 'bg-primary/20 text-primary'
      case 'not-started':
        return 'bg-muted/20 text-muted-foreground'
      default:
        return 'bg-muted/20 text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'Not Started'
      case 'in-progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      default:
        return status
    }
  }

  const handleStartAudit = (id: string) => {
    onUpdateAudit(id, { 
      status: 'in-progress', 
      startedDate: new Date().toISOString().split('T')[0] 
    })
  }

  const getProgress = (audit: Audit) => {
    if (audit.totalItems === 0) return 0
    return Math.round((audit.countedItems / audit.totalItems) * 100)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Audit ID</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Inventory</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Auditor</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Progress</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Discrepancy</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {audits.length > 0 ? (
            audits.map((audit) => (
              <tr key={audit.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                <td className="py-3 px-4 font-mono text-xs font-bold text-accent">{audit.id}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${audit.inventoryColor}20` }}
                    >
                      <Package size={16} style={{ color: audit.inventoryColor }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{audit.inventoryName}</p>
                      <p className="text-xs text-muted-foreground">{audit.totalItems} items</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground text-sm">{audit.auditor}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                    {getStatusLabel(audit.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${audit.status === 'completed' ? 'bg-accent' : 'bg-primary'}`}
                        style={{ width: `${getProgress(audit)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium w-12">
                      {audit.countedItems}/{audit.totalItems}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {audit.status === 'completed' || audit.status === 'in-progress' ? (
                    <span className={`font-medium ${audit.totalDiscrepancy < 0 ? 'text-destructive' : audit.totalDiscrepancy > 0 ? 'text-accent' : 'text-foreground'}`}>
                      {audit.totalDiscrepancy > 0 ? '+' : ''}{audit.totalDiscrepancy.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {audit.status === 'not-started' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1"
                        onClick={() => handleStartAudit(audit.id)}
                        title="Start Audit"
                      >
                        <Play size={16} />
                      </Button>
                    )}
                    <Link href={`/audits/${audit.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-accent hover:bg-accent/10"
                        title="View Audit"
                      >
                        <Eye size={16} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDeleteAudit(audit.id)}
                      title="Delete Audit"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="py-8 text-center text-muted-foreground">
                No audits found. Create a new audit to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
