'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { Button } from '@/components/ui/button'
import { Download, Filter } from 'lucide-react'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedRestaurant, setSelectedRestaurant] = useState('all')

  const restaurants = ['all', 'Downtown Bistro', 'Sunset Grill', 'Harbor Seafood', 'Valley Restaurant', 'Garden Cafe']

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-1">Track audit performance and inventory insights</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Download size={20} />
              Export Report
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6 flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Restaurant</label>
                <select
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                >
                  {restaurants.map(r => (
                    <option key={r} value={r} className="bg-secondary">
                      {r === 'all' ? 'All Restaurants' : r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="gap-2">
                  <Filter size={16} />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Avg Issues per Audit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">3.4</p>
                <p className="text-xs text-destructive mt-1">↑ 5% from last period</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-accent">92.3%</p>
                <p className="text-xs text-accent mt-1">↑ 2.1% from last period</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Avg Audit Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">45 min</p>
                <p className="text-xs text-accent mt-1">↓ 8% faster than last period</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Audits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">156</p>
                <p className="text-xs text-accent mt-1">↑ 12 from last period</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audit Completion Trend */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Audit Completion Trend</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={auditTrendData}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="var(--accent)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCompleted)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Issues by Category */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>Most common problem areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={issuesByCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="issues" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compliance by Restaurant */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Compliance by Restaurant</CardTitle>
                <CardDescription>Performance comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" />
                    <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="compliance" fill="var(--accent)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Issue Severity Distribution */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Issue Severity</CardTitle>
                <CardDescription>Distribution overview</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
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

            {/* Audit Duration vs Issues */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle>Audit Duration vs Issues Found</CardTitle>
                <CardDescription>Correlation analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="duration" stroke="var(--muted-foreground)" name="Duration (min)" />
                    <YAxis dataKey="issues" stroke="var(--muted-foreground)" name="Issues Found" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Scatter name="Audits" data={scatterData} fill="var(--accent)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Performance */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle>Weekly Performance Metrics</CardTitle>
                <CardDescription>Multi-metric comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="auditsCompleted" 
                      stroke="var(--accent)" 
                      strokeWidth={2}
                      dot={{ fill: 'var(--accent)', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgComplianceRate" 
                      stroke="var(--primary)" 
                      strokeWidth={2}
                      dot={{ fill: 'var(--primary)', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="issuesFound" 
                      stroke="var(--destructive)" 
                      strokeWidth={2}
                      dot={{ fill: 'var(--destructive)', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

// Sample Data
const auditTrendData = [
  { day: 'Day 1', completed: 5 },
  { day: 'Day 2', completed: 8 },
  { day: 'Day 3', completed: 6 },
  { day: 'Day 4', completed: 12 },
  { day: 'Day 5', completed: 10 },
  { day: 'Day 6', completed: 14 },
  { day: 'Day 7', completed: 16 },
  { day: 'Day 8', completed: 13 },
  { day: 'Day 9', completed: 18 },
  { day: 'Day 10', completed: 20 },
]

const issuesByCategoryData = [
  { category: 'Produce', issues: 12 },
  { category: 'Dairy', issues: 8 },
  { category: 'Meat', issues: 15 },
  { category: 'Grains', issues: 5 },
  { category: 'Oils', issues: 3 },
]

const complianceData = [
  { name: 'Downtown Bistro', compliance: 95 },
  { name: 'Sunset Grill', compliance: 88 },
  { name: 'Harbor Seafood', compliance: 92 },
  { name: 'Valley Restaurant', compliance: 90 },
  { name: 'Garden Cafe', compliance: 87 },
]

const severityData = [
  { name: 'Critical', value: 8, color: 'var(--destructive)' },
  { name: 'High', value: 22, color: 'var(--primary)' },
  { name: 'Medium', value: 35, color: 'var(--accent)' },
  { name: 'Low', value: 45, color: 'var(--muted-foreground)' },
]

const scatterData = [
  { duration: 30, issues: 2 },
  { duration: 35, issues: 3 },
  { duration: 40, issues: 4 },
  { duration: 45, issues: 5 },
  { duration: 50, issues: 6 },
  { duration: 55, issues: 7 },
  { duration: 60, issues: 8 },
  { duration: 65, issues: 9 },
  { duration: 70, issues: 10 },
  { duration: 75, issues: 11 },
]

const weeklyData = [
  { week: 'Week 1', auditsCompleted: 12, avgComplianceRate: 88, issuesFound: 8 },
  { week: 'Week 2', auditsCompleted: 15, avgComplianceRate: 90, issuesFound: 10 },
  { week: 'Week 3', auditsCompleted: 18, avgComplianceRate: 92, issuesFound: 12 },
  { week: 'Week 4', auditsCompleted: 22, avgComplianceRate: 91, issuesFound: 14 },
  { week: 'Week 5', auditsCompleted: 25, avgComplianceRate: 93, issuesFound: 16 },
]
