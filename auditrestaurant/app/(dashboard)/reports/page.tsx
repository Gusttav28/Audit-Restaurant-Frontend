'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { Button } from '@/components/ui/button'
import { Download, FileText, Filter, Loader2, X } from 'lucide-react'
import { useAppContext } from '@/components/app-context'

export default function ReportsPage() {
  const { selectedRestaurant, restaurants, formatCurrency, t } = useAppContext()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const allItems = selectedRestaurant.inventoryTypes.flatMap((type) => type.items)
  const completedAudits = selectedRestaurant.audits.filter((audit) => audit.status === 'completed')
  const complianceRate =
    completedAudits.reduce((sum, audit) => sum + audit.compliance, 0) / Math.max(completedAudits.length, 1)
  const issuesCount = allItems.filter((item) => item.status === 'low' || item.status === 'critical').length
  const inventoryValue = allItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const avgIssuesPerAudit = issuesCount / Math.max(selectedRestaurant.audits.length, 1)
  const avgAuditTime = Math.round(
    completedAudits.reduce((sum, audit) => sum + 35 + audit.flaggedItems * 4 + Math.ceil(audit.totalItems / 2), 0) /
      Math.max(completedAudits.length, 1),
  )

  const auditTrendData = useMemo(() => {
    return completedAudits
      .slice()
      .sort((a, b) => a.createdDate.localeCompare(b.createdDate))
      .map((audit, index) => ({
        day: audit.completedDate ?? audit.createdDate,
        completed: index + 1,
        compliance: audit.compliance,
      }))
  }, [completedAudits])

  const issuesByCategoryData = useMemo(() => {
    return Object.values(
      allItems.reduce<Record<string, { category: string; issues: number }>>((acc, item) => {
        acc[item.category] ??= { category: item.category, issues: 0 }
        if (item.status === 'low' || item.status === 'critical' || (item.daysUntilExpiry && item.daysUntilExpiry <= 7)) {
          acc[item.category].issues += 1
        }
        return acc
      }, {}),
    ).filter((entry) => entry.issues > 0)
  }, [allItems])

  const complianceData = useMemo(() => {
    return selectedRestaurant.inventoryTypes.map((inventory) => {
      const inventoryAudits = selectedRestaurant.audits.filter((audit) => audit.inventoryId === inventory.id)
      return {
        name: inventory.name,
        compliance:
          inventoryAudits.reduce((sum, audit) => sum + audit.compliance, 0) / Math.max(inventoryAudits.length, 1),
      }
    })
  }, [selectedRestaurant])

  const severityData = useMemo(() => {
    const critical = allItems.filter((item) => item.status === 'critical').length
    const low = allItems.filter((item) => item.status === 'low').length
    const expiring = allItems.filter((item) => item.daysUntilExpiry && item.daysUntilExpiry <= 7).length
    const stable = Math.max(allItems.length - critical - low - expiring, 0)
    return [
      { name: t('critical'), value: critical, color: 'var(--destructive)' },
      { name: t('lowStock'), value: low, color: 'var(--primary)' },
      { name: t('expiringSoon'), value: expiring, color: 'var(--accent)' },
      { name: t('stable'), value: stable, color: 'var(--muted-foreground)' },
    ].filter((entry) => entry.value > 0)
  }, [allItems, t])

  const scatterData = useMemo(() => {
    return completedAudits.map((audit) => ({
      duration: 35 + audit.flaggedItems * 4 + Math.ceil(audit.totalItems / 2),
      issues: audit.flaggedItems,
    }))
  }, [completedAudits])

  const weeklyData = useMemo(() => {
    const buckets = completedAudits.slice(0, 5).map((audit, index) => ({
      week: `${t('completed')} ${index + 1}`,
      auditsCompleted: index + 1,
      avgComplianceRate: audit.compliance,
      issuesFound: audit.flaggedItems,
    }))
    return buckets.length ? buckets : [{ week: t('completed'), auditsCompleted: 0, avgComplianceRate: 0, issuesFound: issuesCount }]
  }, [completedAudits, issuesCount, t])

  const exportReport = () => {
    setIsExporting(true)
    window.setTimeout(() => {
      const rows = [
        ['Restaurant', selectedRestaurant.name],
        ['Period', selectedPeriod],
        ['Inventory Value', inventoryValue],
        ['Total Audits', selectedRestaurant.audits.length],
        ['Completed Audits', completedAudits.length],
        ['Compliance Rate', complianceRate.toFixed(1)],
        ['Inventory Issues', issuesCount],
      ]
      const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedRestaurant.name.replace(/\s+/g, '-').toLowerCase()}-report.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setIsExporting(false)
    }, 400)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('reports')}</h1>
              <p className="text-muted-foreground mt-1">{t('reportsSubtitle')} {selectedRestaurant.name}</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => setIsExportOpen(true)}>
              <Download size={20} />
              {t('exportReport')}
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6 flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">{t('period')}</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="week">{t('lastWeek')}</option>
                  <option value="month">{t('lastMonth')}</option>
                  <option value="quarter">{t('lastQuarter')}</option>
                  <option value="year">{t('lastYear')}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">{t('restaurant')}</label>
                <select
                  value={selectedRestaurant.id}
                  disabled
                  className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                >
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id} className="bg-secondary">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="gap-2">
                  <Filter size={16} />
                  {t('applyFilters')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('avgIssuesPerAudit')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{avgIssuesPerAudit.toFixed(1)}</p>
                <p className="text-xs text-destructive mt-1">↑ 5% from last period</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('complianceRate')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-accent">{complianceRate.toFixed(1)}%</p>
                <p className="text-xs text-accent mt-1">↑ 2.1% from last period</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('avgAuditTime')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{avgAuditTime} min</p>
                <p className="text-xs text-accent mt-1">↓ 8% faster than last period</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('totalAudits')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{selectedRestaurant.audits.length}</p>
                <p className="text-xs text-accent mt-1">↑ 12 from last period</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audit Completion Trend */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{t('auditCompletionTrend')}</CardTitle>
                <CardDescription>{selectedRestaurant.name}</CardDescription>
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
                <CardTitle>{t('issuesByCategory')}</CardTitle>
                <CardDescription>{selectedRestaurant.name}</CardDescription>
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
                <CardTitle>{t('complianceByInventory')}</CardTitle>
                <CardDescription>{selectedRestaurant.name}</CardDescription>
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
                <CardTitle>{t('issueSeverity')}</CardTitle>
                <CardDescription>{selectedRestaurant.name}</CardDescription>
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
                <CardTitle>{t('auditDurationIssues')}</CardTitle>
                <CardDescription>{selectedRestaurant.name}</CardDescription>
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
                <CardTitle>{t('weeklyPerformance')}</CardTitle>
                <CardDescription>{selectedRestaurant.name}</CardDescription>
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
      {isExportOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{t('reportSummary')}</h2>
                <p className="text-sm text-muted-foreground">{selectedRestaurant.name}</p>
              </div>
              <button onClick={() => setIsExportOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={22} />
              </button>
            </div>
            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t('inventoryValue')}</p>
                  <p className="mt-1 break-words text-xl font-bold text-foreground">{formatCurrency(inventoryValue)}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t('completed')}</p>
                  <p className="mt-1 text-2xl font-bold text-accent">{completedAudits.length}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t('inventoryIssues')}</p>
                  <p className="mt-1 text-2xl font-bold text-destructive">{issuesCount}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t('complianceRate')}</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{complianceRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <p className="text-sm text-muted-foreground">
                  {t('totalAudits')}: <span className="font-semibold text-foreground">{selectedRestaurant.audits.length}</span> · {t('avgAuditTime')}: <span className="font-semibold text-foreground">{avgAuditTime} min</span> · {t('period')}: <span className="font-semibold text-foreground">{selectedPeriod}</span>
                </p>
              </div>
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button variant="outline" className="bg-transparent" onClick={() => setIsExportOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={exportReport} disabled={isExporting} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  {isExporting ? t('exporting') : t('export')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
