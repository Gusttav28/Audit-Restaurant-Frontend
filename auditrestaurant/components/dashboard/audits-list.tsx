'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function AuditsList() {
  const audits = [
    { id: 1, restaurant: 'Downtown Bistro', date: '2024-01-15', status: 'completed', items: 45 },
    { id: 2, restaurant: 'Sunset Grill', date: '2024-01-14', status: 'in-progress', items: 38 },
    { id: 3, restaurant: 'Harbor Seafood', date: '2024-01-13', status: 'pending', items: 52 },
    { id: 4, restaurant: 'Valley Restaurant', date: '2024-01-12', status: 'completed', items: 41 },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-accent" />
      case 'in-progress':
        return <Clock size={16} className="text-primary" />
      case 'pending':
        return <AlertCircle size={16} className="text-muted-foreground" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent/20 text-accent'
      case 'in-progress':
        return 'bg-primary/20 text-primary'
      case 'pending':
        return 'bg-muted/20 text-muted-foreground'
      default:
        return ''
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Recent Audits</CardTitle>
        <CardDescription>Latest audit activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {audits.map((audit) => (
            <div key={audit.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(audit.status)}
                <div>
                  <p className="font-medium text-foreground text-sm">{audit.restaurant}</p>
                  <p className="text-xs text-muted-foreground">{audit.date} • {audit.items} items</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(audit.status)} border-0`}>
                {audit.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
