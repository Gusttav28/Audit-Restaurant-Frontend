'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import CreateAuditModal from '@/components/audits/create-audit-modal'
import { AlertCircle, CheckCircle, Clock, FileText, Package, Plus, TrendingUp } from 'lucide-react'
import { useAppContext } from '@/components/app-context'

export default function Dashboard() {
  const { selectedRestaurant, t, formatCurrency, createAudit } = useAppContext()
  const [isCreateAuditOpen, setIsCreateAuditOpen] = useState(false)
  const allItems = selectedRestaurant.inventoryTypes.flatMap((type) => type.items)
  const audits = selectedRestaurant.audits
  const completedAudits = audits.filter((audit) => audit.status === 'completed')
  const openAudits = audits.filter((audit) => audit.status !== 'completed')

  const inventoryIssues = allItems
    .filter((item) => item.status === 'low' || item.status === 'critical' || (item.daysUntilExpiry && item.daysUntilExpiry <= 7))
    .map((item) => ({
      item: item.name,
      issue: item.status === 'critical'
        ? 'Critical stock level'
        : item.status === 'low'
          ? 'Stock below threshold'
          : `Expires in ${item.daysUntilExpiry} days`,
      severity: item.status === 'critical' ? 'high' : item.status === 'low' ? 'medium' : 'low',
      value: item.quantity * item.price,
      href: item.status === 'low' || item.status === 'critical' ? '/inventory?view=low' : '/inventory?view=expiring',
    }))

  const auditTrendData = completedAudits.map((audit, index) => ({
    label: audit.completedDate ?? audit.createdDate,
    score: audit.compliance,
    completed: index + 1,
    auditor: audit.auditor,
    status: audit.status,
    date: audit.completedDate ?? audit.createdDate,
  }))

  const statusDistribution = useMemo(() => {
    const statusMap = [
      { name: t('inProgress'), status: 'in-progress', color: 'var(--primary)' },
      { name: t('notStarted'), status: 'not-started', color: 'var(--muted-foreground)' },
    ]

    return statusMap
      .map((entry) => ({
        ...entry,
        value: audits.filter((audit) => audit.status === entry.status).length,
        auditors: audits.filter((audit) => audit.status === entry.status).map((audit) => audit.auditor).join(', '),
      }))
      .filter((entry) => entry.value > 0)
  }, [audits, t])

  const stats = [
    { title: t('totalAudits'), value: audits.length, helper: selectedRestaurant.name, icon: TrendingUp, color: 'accent' },
    { title: t('completed'), value: completedAudits.length, helper: `${Math.round((completedAudits.length / Math.max(audits.length, 1)) * 100)}%`, icon: CheckCircle, color: 'primary' },
    { title: t('inProgress'), value: audits.filter((audit) => audit.status === 'in-progress').length, helper: t('activeAudits'), icon: Clock, color: 'accent' },
    { title: t('issuesFound'), value: inventoryIssues.length, helper: t('needsAttention'), icon: AlertCircle, color: 'destructive' },
  ]
  const inventoryTypes = selectedRestaurant.inventoryTypes.map((type) => ({
    id: type.id,
    name: type.name,
    color: type.color,
    items: type.items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      expectedQuantity: item.minStock,
      availableQuantity: item.quantity,
      unit: item.unit,
      unitPrice: item.price,
    })),
  }))

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="p-4 space-y-6 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('dashboard')}</h1>
              <p className="text-muted-foreground mt-1">{t('dashboardSubtitle')} · {selectedRestaurant.name}</p>
            </div>
            <Button onClick={() => setIsCreateAuditOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus size={20} />
              {t('newAudit')}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="bg-card border-border hover:border-accent/50 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon size={20} style={{ color: `var(--${stat.color})` }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-accent mt-1">{stat.helper}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card border-border">
              <CardHeader>
                <CardTitle>{t('auditTrend')}</CardTitle>
                <CardDescription>{t('auditTrendSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={auditTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
                    <Tooltip content={<AuditTrendTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--accent)', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{t('statusDistribution')}</CardTitle>
                <CardDescription>{t('statusDistributionSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                        {statusDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<StatusTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">{t('noOpenAudits')}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{t('inventoryIssues')}</CardTitle>
                <CardDescription>{t('inventoryIssuesSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventoryIssues.length > 0 ? inventoryIssues.map((issue) => (
                    <Link key={`${issue.item}-${issue.issue}`} href={issue.href} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border transition-colors hover:border-primary/50 hover:bg-secondary/40">
                      <div className="flex items-center gap-3">
                        <Package size={18} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{issue.item}</p>
                          <p className="text-xs text-muted-foreground">{issue.issue} · {formatCurrency(issue.value)}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${issue.severity === 'high' ? 'bg-destructive/20 text-destructive' : issue.severity === 'medium' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                        {issue.severity}
                      </span>
                    </Link>
                  )) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">{t('noIssues')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{t('recentAudits')}</CardTitle>
                <CardDescription>{t('recentAuditsSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audits.slice(0, 5).map((audit) => (
                    <Link key={audit.id} href={`/audits/${audit.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{audit.id}</p>
                          <p className="text-xs text-muted-foreground">{audit.inventoryName} · {audit.auditor}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${audit.status === 'completed' ? 'bg-accent/20 text-accent' : audit.status === 'in-progress' ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'}`}>
                        {audit.status}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <CreateAuditModal
        isOpen={isCreateAuditOpen}
        onClose={() => setIsCreateAuditOpen(false)}
        onCreate={(audit) => {
          createAudit(audit)
          setIsCreateAuditOpen(false)
        }}
        inventoryTypes={inventoryTypes}
      />
    </div>
  )
}

function AuditTrendTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const audit = payload[0].payload

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm shadow-lg">
      <p className="font-medium text-foreground">{audit.date}</p>
      <p className="text-muted-foreground">Responsible: {audit.auditor}</p>
      <p className="text-accent">Compliance: {audit.score}%</p>
    </div>
  )
}

function StatusTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const status = payload[0].payload

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm shadow-lg">
      <p className="font-medium text-foreground">{status.name}: {status.value}</p>
      <p className="text-muted-foreground">Responsible: {status.auditors || 'N/A'}</p>
    </div>
  )
}
