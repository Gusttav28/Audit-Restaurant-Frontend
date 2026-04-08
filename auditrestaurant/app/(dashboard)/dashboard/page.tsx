'use client'

import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import StatsOverview from '@/components/dashboard/stats-overview'
import AuditsList from '@/components/dashboard/audits-list'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Title */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back! Here's your audit overview</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              + New Audit
            </Button>
          </div>

          {/* Stats Overview */}
          <StatsOverview />

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Audit Trends */}
            <Card className="lg:col-span-2 bg-card border-border">
              <CardHeader>
                <CardTitle>Audit Trends</CardTitle>
                <CardDescription>Last 30 days performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={auditTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="var(--accent)" 
                      strokeWidth={2}
                      dot={{ fill: 'var(--accent)', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pending" 
                      stroke="var(--muted-foreground)" 
                      strokeWidth={2}
                      dot={{ fill: 'var(--muted)', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Audit Status Distribution */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current audits</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Issues & Recent Audits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Issues */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Inventory Issues</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventoryIssues.map((issue, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                      <div>
                        <p className="font-medium text-foreground text-sm">{issue.item}</p>
                        <p className="text-xs text-muted-foreground">{issue.issue}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${issue.severity === 'high' ? 'bg-destructive/20 text-destructive' : issue.severity === 'medium' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                        {issue.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Audits */}
            <AuditsList />
          </div>
        </main>
      </div>
    </div>
  )
}

// Sample Data
const auditTrendData = [
  { month: 'Week 1', completed: 12, pending: 4 },
  { month: 'Week 2', completed: 15, pending: 3 },
  { month: 'Week 3', completed: 18, pending: 5 },
  { month: 'Week 4', completed: 22, pending: 2 },
  { month: 'Week 5', completed: 25, pending: 4 },
]

const statusDistribution = [
  { name: 'Completed', value: 45, color: 'var(--accent)' },
  { name: 'In Progress', value: 30, color: 'var(--primary)' },
  { name: 'Pending', value: 15, color: 'var(--muted-foreground)' },
]

const inventoryIssues = [
  { item: 'Olive Oil', issue: 'Stock below threshold', severity: 'high' },
  { item: 'Fresh Herbs', issue: 'Expiry in 3 days', severity: 'medium' },
  { item: 'Pasta', issue: 'Expired items found', severity: 'high' },
  { item: 'Cheese', issue: 'Temperature variance', severity: 'medium' },
]
