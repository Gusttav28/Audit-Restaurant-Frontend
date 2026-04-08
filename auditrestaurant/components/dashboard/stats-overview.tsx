'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function StatsOverview() {
  const stats = [
    { title: 'Total Audits', value: '156', change: '+12%', icon: TrendingUp, color: 'accent' },
    { title: 'Completed', value: '128', change: '+8%', icon: CheckCircle, color: 'primary' },
    { title: 'In Progress', value: '18', change: '+2%', icon: Clock, color: 'accent' },
    { title: 'Issues Found', value: '34', change: '+5%', icon: AlertCircle, color: 'destructive' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-card border-border hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon size={20} className={`text-${stat.color}`} style={{ color: `var(--${stat.color})` }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-accent">{stat.change} from last week</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
