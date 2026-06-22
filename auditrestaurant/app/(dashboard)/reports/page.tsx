'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { Button } from '@/components/ui/button'
import { Download, FileText, Filter, HelpCircle, Loader2, X } from 'lucide-react'
import { useAppContext } from '@/components/app-context'
import { exportDocumentPdf, exportDocumentXlsx, slugifyFilePart, type ExportDocument } from '@/lib/document-export'

type ReportSection = 'trend' | 'category' | 'compliance' | 'severity' | 'duration' | 'weekly'
type ReportFilters = {
  period: string
  auditor: string
  inventoryId: string
  auditStatus: string
  issueType: string
  category: string
}

const defaultFilters: ReportFilters = {
  period: 'all',
  auditor: 'all',
  inventoryId: 'all',
  auditStatus: 'all',
  issueType: 'all',
  category: 'all',
}

export default function ReportsPage() {
  const { selectedRestaurant, restaurants, formatCurrency, t, language } = useAppContext()
  const [selectedPeriod, setSelectedPeriod] = useState(defaultFilters.period)
  const [selectedSections, setSelectedSections] = useState<ReportSection[]>([])
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(defaultFilters)
  const [activeHelp, setActiveHelp] = useState<null | { label: string; help: string }>(null)
  const [pinnedHelp, setPinnedHelp] = useState<null | { label: string; help: string }>(null)
  const [areFiltersOpen, setAreFiltersOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isExporting, setIsExporting] = useState<null | 'xlsx' | 'pdf'>(null)
  const rawItems = selectedRestaurant.inventoryTypes.flatMap((type) => type.items)
  const rawAudits = selectedRestaurant.audits
  const auditorOptions = Array.from(new Set(rawAudits.map((audit) => audit.auditor).filter(Boolean))).sort()
  const categoryOptions = Array.from(new Set(rawItems.map((item) => item.category).filter(Boolean))).sort()

  const isWithinPeriod = (dateString: string | null | undefined, period: string) => {
    if (!dateString || period === 'all') return true
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return true
    const now = new Date()
    const days =
      period === 'week' ? 7 :
      period === 'quarter' ? 90 :
      period === 'year' ? 365 :
      30
    return now.getTime() - date.getTime() <= days * 24 * 60 * 60 * 1000
  }

  const filteredAudits = rawAudits.filter((audit) => {
    const matchesPeriod = isWithinPeriod(audit.completedDate ?? audit.createdDate, appliedFilters.period)
    const matchesAuditor = appliedFilters.auditor === 'all' || audit.auditor === appliedFilters.auditor
    const matchesInventory = appliedFilters.inventoryId === 'all' || audit.inventoryId === Number(appliedFilters.inventoryId)
    const matchesStatus = appliedFilters.auditStatus === 'all' || audit.status === appliedFilters.auditStatus
    return matchesPeriod && matchesAuditor && matchesInventory && matchesStatus
  })
  const completedAudits = filteredAudits.filter((audit) => audit.status === 'completed')
  const allItems = rawItems.filter((item) => {
    const matchesInventory = appliedFilters.inventoryId === 'all' || item.typeId === Number(appliedFilters.inventoryId)
    const matchesCategory = appliedFilters.category === 'all' || item.category === appliedFilters.category
    const matchesIssue =
      appliedFilters.issueType === 'all' ||
      (appliedFilters.issueType === 'low' && item.status === 'low') ||
      (appliedFilters.issueType === 'critical' && item.status === 'critical') ||
      (appliedFilters.issueType === 'expiring' && Boolean(item.daysUntilExpiry && item.daysUntilExpiry <= 7)) ||
      (appliedFilters.issueType === 'stable' && item.status === 'good' && (!item.daysUntilExpiry || item.daysUntilExpiry > 7))
    return matchesInventory && matchesCategory && matchesIssue
  })
  const complianceRate =
    completedAudits.reduce((sum, audit) => sum + audit.compliance, 0) / Math.max(completedAudits.length, 1)
  const issuesCount = allItems.filter((item) => item.status === 'low' || item.status === 'critical').length
  const inventoryValue = allItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const mermaItems = allItems.filter((item) => item.phase === 'merma')
  const productionItems = allItems.filter((item) => item.phase === 'production')
  const mermaQuantity = mermaItems.reduce((sum, item) => sum + (item.mermaQuantity ?? 0), 0)
  const productionQuantity = productionItems.reduce((sum, item) => sum + (item.productionQuantity ?? 0), 0)
  const completedAuditMermaQuantity = completedAudits.reduce(
    (sum, audit) => sum + (audit.items ?? []).reduce((itemSum, item) => itemSum + (item.mermaQuantity ?? 0), 0),
    0,
  )
  const completedAuditProductionQuantity = completedAudits.reduce(
    (sum, audit) => sum + (audit.items ?? []).reduce((itemSum, item) => itemSum + (item.productionQuantity ?? 0), 0),
    0,
  )
  const avgIssuesPerAudit = issuesCount / Math.max(filteredAudits.length, 1)
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
    const totalIssues = Math.max(issuesCount, 1)
    return Object.values(
      allItems.reduce<Record<string, { category: string; issues: number; items: number; value: number }>>((acc, item) => {
        acc[item.category] ??= { category: item.category, issues: 0, items: 0, value: 0 }
        acc[item.category].items += 1
        acc[item.category].value += item.quantity * item.price
        if (item.status === 'low' || item.status === 'critical' || (item.daysUntilExpiry && item.daysUntilExpiry <= 7)) {
          acc[item.category].issues += 1
        }
        return acc
      }, {}),
    )
      .map((entry) => ({ ...entry, percentage: (entry.issues / totalIssues) * 100 }))
      .filter((entry) => entry.issues > 0)
  }, [allItems, issuesCount])

  const complianceData = useMemo(() => {
    return selectedRestaurant.inventoryTypes
    .filter((inventory) => appliedFilters.inventoryId === 'all' || inventory.id === Number(appliedFilters.inventoryId))
    .map((inventory) => {
      const inventoryAudits = filteredAudits.filter((audit) => audit.inventoryId === inventory.id)
      return {
        name: inventory.name,
        compliance:
          inventoryAudits.reduce((sum, audit) => sum + audit.compliance, 0) / Math.max(inventoryAudits.length, 1),
      }
    })
  }, [appliedFilters.inventoryId, filteredAudits, selectedRestaurant.inventoryTypes])

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

  const reportSections: Array<{ id: ReportSection; label: string; help: string }> = [
    { id: 'trend', label: t('auditCompletionTrend'), help: t('auditTrendHelp') },
    { id: 'category', label: t('issuesByCategory'), help: t('issuesByCategoryHelp') },
    { id: 'compliance', label: t('complianceByInventory'), help: t('complianceByInventoryHelp') },
    { id: 'severity', label: t('issueSeverity'), help: t('issueSeverityHelp') },
    { id: 'duration', label: t('auditDurationIssues'), help: t('auditDurationHelp') },
    { id: 'weekly', label: t('weeklyPerformance'), help: t('weeklyPerformanceHelp') },
  ]

  const shouldShowSection = (section: ReportSection) => selectedSections.length === 0 || selectedSections.includes(section)

  const toggleSection = (section: ReportSection) => {
    setSelectedSections((current) =>
      current.includes(section) ? current.filter((entry) => entry !== section) : [...current, section],
    )
  }

  const SectionTitle = ({ label, help }: { label: string; help: string }) => (
    <div className="relative flex items-center gap-2">
      <span>{label}</span>
      <button
        type="button"
        aria-label={`${t('reportHelp')}: ${label}`}
        onMouseEnter={() => setActiveHelp({ label, help })}
        onMouseLeave={() => setActiveHelp((current) => current?.label === label ? null : current)}
        onClick={() => setPinnedHelp((current) => current?.label === label ? null : { label, help })}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
      >
        <HelpCircle size={14} />
      </button>
      {(activeHelp?.label === label || pinnedHelp?.label === label) && (
        <div className="absolute left-0 top-8 z-30 w-72 rounded-lg border border-border bg-card p-3 text-sm font-normal text-muted-foreground shadow-xl">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="font-semibold text-foreground">{label}</p>
            {pinnedHelp?.label === label && (
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setPinnedHelp(null)}>
                <X size={14} />
              </button>
            )}
          </div>
          <p>{help}</p>
        </div>
      )}
    </div>
  )

  const CategoryTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { items: number; value: number; percentage: number; issues: number } }>; label?: string }) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-card p-3 text-sm shadow-xl">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-muted-foreground">{t('itemsCount')}: <span className="text-foreground">{data.items}</span></p>
        <p className="text-muted-foreground">{t('inventoryIssues')}: <span className="text-foreground">{data.issues}</span></p>
        <p className="text-muted-foreground">{t('categoryValue')}: <span className="text-foreground">{formatCurrency(data.value)}</span></p>
        <p className="text-muted-foreground">{t('percentageOfIssues')}: <span className="text-foreground">{data.percentage.toFixed(1)}%</span></p>
      </div>
    )
  }

  const SeverityTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; payload: { name: string; value: number } }> }) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    const total = severityData.reduce((sum, entry) => sum + entry.value, 0)
    const percentage = total > 0 ? (data.value / total) * 100 : 0
    return (
      <div className="rounded-lg border border-border bg-card p-3 text-sm shadow-xl">
        <p className="font-semibold text-foreground">{data.name}</p>
        <p className="text-muted-foreground">{t('itemsCount')}: <span className="text-foreground">{data.value}</span></p>
        <p className="text-muted-foreground">{t('percentageOfIssues')}: <span className="text-foreground">{percentage.toFixed(1)}%</span></p>
      </div>
    )
  }

  const pendingFilters = { ...draftFilters, period: selectedPeriod }
  const hasPendingFilterChanges = JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters)
  const exportCopy = {
    en: {
      title: 'Operations report',
      organizationSubtitle: 'Restaurant inventory operations',
      report: 'Report',
      issued: 'Issued',
      sheetName: 'Report',
      metric: 'Metric',
      value: 'Value',
      auditorFilter: 'Auditor filter',
      inventoryFilter: 'Inventory filter',
      statusFilter: 'Status filter',
      issueFilter: 'Issue filter',
      categoryFilter: 'Category filter',
      sections: 'Sections',
      all: 'All',
      allValue: 'all',
      inventoryValue: 'Inventory value',
      totalAudits: 'Total audits',
      completedAudits: 'Completed audits',
      inventoryIssues: 'Inventory issues',
      mermaItems: 'Merma items',
      productionItems: 'Production items',
      completedAuditMermaQuantity: 'Completed audit merma quantity',
      completedAuditProductionQuantity: 'Completed audit production quantity',
      exportNote: 'Export note',
      exportNoteBody: 'This report reflects the filters and sections selected when the export was generated.',
    },
    es: {
      title: 'Reporte de operaciones',
      organizationSubtitle: 'Operaciones de inventario de restaurantes',
      report: 'Reporte',
      issued: 'Emitido',
      sheetName: 'Reporte',
      metric: 'Metrica',
      value: 'Valor',
      auditorFilter: 'Filtro de auditor',
      inventoryFilter: 'Filtro de inventario',
      statusFilter: 'Filtro de estado',
      issueFilter: 'Filtro de problema',
      categoryFilter: 'Filtro de categoria',
      sections: 'Secciones',
      all: 'Todas',
      allValue: 'todos',
      inventoryValue: 'Valor de inventario',
      totalAudits: 'Total de auditorias',
      completedAudits: 'Auditorias completadas',
      inventoryIssues: 'Problemas de inventario',
      mermaItems: 'Articulos de merma',
      productionItems: 'Articulos de produccion',
      completedAuditMermaQuantity: 'Cantidad de merma en auditorias completadas',
      completedAuditProductionQuantity: 'Cantidad de produccion en auditorias completadas',
      exportNote: 'Nota de exportacion',
      exportNoteBody: 'Este reporte refleja los filtros y secciones seleccionadas al momento de generar el archivo.',
    },
  }[language]

  const periodLabel = (period: string) => {
    if (period === 'week') return t('lastWeek')
    if (period === 'month') return t('lastMonth')
    if (period === 'quarter') return t('lastQuarter')
    if (period === 'year') return t('lastYear')
    return t('allTime')
  }

  const filterValueLabel = (value: string) => value === 'all' ? exportCopy.allValue : value

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters)
    setSelectedPeriod(appliedFilters.period)
    setAreFiltersOpen(true)
  }

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters)
    setAreFiltersOpen(false)
  }

  const handleCancelFilters = () => {
    setDraftFilters(appliedFilters)
    setSelectedPeriod(appliedFilters.period)
    setAreFiltersOpen(false)
  }

  const handleResetFilters = () => {
    setSelectedPeriod(defaultFilters.period)
    setDraftFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setSelectedSections([])
    setAreFiltersOpen(false)
  }

  const getSectionMetric = (section: ReportSection) => {
    switch (section) {
      case 'trend':
        return `${completedAudits.length} ${t('completed')}`
      case 'category':
        return `${issuesCount} ${t('issuesFound')}`
      case 'compliance':
        return `${complianceRate.toFixed(1)}%`
      case 'severity':
        return `${severityData.length} ${t('status')}`
      case 'duration':
        return `${avgAuditTime} min`
      case 'weekly':
        return `${weeklyData.length} ${t('items')}`
    }
  }

  const reportExportRows = [
    { metric: t('restaurant'), value: selectedRestaurant.name },
    { metric: t('period'), value: periodLabel(appliedFilters.period) },
    { metric: exportCopy.inventoryValue, value: formatCurrency(inventoryValue) },
    { metric: exportCopy.totalAudits, value: filteredAudits.length },
    { metric: exportCopy.completedAudits, value: completedAudits.length },
    { metric: t('complianceRate'), value: `${complianceRate.toFixed(1)}%` },
    { metric: exportCopy.inventoryIssues, value: issuesCount },
    { metric: exportCopy.mermaItems, value: mermaItems.length },
    { metric: t('mermaQuantity'), value: mermaQuantity },
    { metric: exportCopy.completedAuditMermaQuantity, value: completedAuditMermaQuantity },
    { metric: exportCopy.productionItems, value: productionItems.length },
    { metric: t('productionQuantity'), value: productionQuantity },
    { metric: exportCopy.completedAuditProductionQuantity, value: completedAuditProductionQuantity },
    { metric: t('avgIssuesPerAudit'), value: avgIssuesPerAudit.toFixed(1) },
    { metric: t('avgAuditTime'), value: `${avgAuditTime} min` },
  ]

  const buildReportExportDocument = (): ExportDocument<typeof reportExportRows[number]> => ({
    title: exportCopy.title,
    subtitle: `${selectedRestaurant.name} - ${periodLabel(appliedFilters.period)}`,
    organizationName: 'AuditNett',
    organizationSubtitle: exportCopy.organizationSubtitle,
    referenceLabel: exportCopy.report,
    referenceValue: slugifyFilePart(selectedRestaurant.name) || 'restaurant',
    issuedAt: new Date().toISOString().slice(0, 10),
    issuedLabel: exportCopy.issued,
    footerLabel: exportCopy.title,
    sheetName: exportCopy.sheetName,
    details: [
      { label: t('restaurant'), value: selectedRestaurant.name },
      { label: t('period'), value: periodLabel(appliedFilters.period) },
      { label: exportCopy.auditorFilter, value: filterValueLabel(appliedFilters.auditor) },
      { label: exportCopy.inventoryFilter, value: filterValueLabel(appliedFilters.inventoryId) },
      { label: exportCopy.statusFilter, value: filterValueLabel(appliedFilters.auditStatus) },
      { label: exportCopy.issueFilter, value: filterValueLabel(appliedFilters.issueType) },
      { label: exportCopy.categoryFilter, value: filterValueLabel(appliedFilters.category) },
      { label: exportCopy.sections, value: selectedSections.length ? selectedSections.map((sectionId) => reportSections.find((section) => section.id === sectionId)?.label ?? sectionId).join(', ') : exportCopy.all },
    ],
    metrics: [
      { label: exportCopy.inventoryValue, value: formatCurrency(inventoryValue) },
      { label: t('completed'), value: completedAudits.length },
      { label: t('issuesFound'), value: issuesCount },
      { label: t('complianceRate'), value: `${complianceRate.toFixed(1)}%` },
    ],
    columns: [
      { key: 'metric', header: exportCopy.metric, width: 34 },
      { key: 'value', header: exportCopy.value, width: 24, align: 'right' },
    ],
    rows: reportExportRows,
    summary: [
      { label: exportCopy.inventoryValue, value: formatCurrency(inventoryValue) },
      { label: exportCopy.totalAudits, value: filteredAudits.length },
      { label: exportCopy.completedAudits, value: completedAudits.length },
      { label: t('complianceRate'), value: `${complianceRate.toFixed(1)}%`, emphasis: true },
    ],
    note: {
      title: exportCopy.exportNote,
      body: exportCopy.exportNoteBody,
    },
  })

  const exportReport = (format: 'xlsx' | 'pdf') => {
    setIsExporting(format)
    window.setTimeout(() => {
      const document = buildReportExportDocument()
      const filename = `${slugifyFilePart(selectedRestaurant.name)}-report.${format}`
      if (format === 'xlsx') exportDocumentXlsx(document, filename)
      if (format === 'pdf') exportDocumentPdf(document, filename)
      setIsExporting(null)
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
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleOpenFilters}
                >
                  <Filter size={16} />
                  {t('applyFilters')}
                </Button>
              </div>
              {areFiltersOpen && (
                <div className="grid gap-4 rounded-lg border border-border bg-secondary/10 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('period')}</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => {
                        setSelectedPeriod(e.target.value)
                        setDraftFilters((current) => ({ ...current, period: e.target.value }))
                      }}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="all">{t('allTime')}</option>
                      <option value="week">{t('lastWeek')}</option>
                      <option value="month">{t('lastMonth')}</option>
                      <option value="quarter">{t('lastQuarter')}</option>
                      <option value="year">{t('lastYear')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('responsiblePerson')}</label>
                    <select
                      value={draftFilters.auditor}
                      onChange={(event) => setDraftFilters((current) => ({ ...current, auditor: event.target.value }))}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="all">{t('allPeople')}</option>
                      {auditorOptions.map((auditor) => (
                        <option key={auditor} value={auditor} className="bg-secondary">{auditor}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('inventory')}</label>
                    <select
                      value={draftFilters.inventoryId}
                      onChange={(event) => setDraftFilters((current) => ({ ...current, inventoryId: event.target.value }))}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="all">{t('allInventories')}</option>
                      {selectedRestaurant.inventoryTypes.map((inventory) => (
                        <option key={inventory.id} value={inventory.id} className="bg-secondary">{inventory.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('auditStatus')}</label>
                    <select
                      value={draftFilters.auditStatus}
                      onChange={(event) => setDraftFilters((current) => ({ ...current, auditStatus: event.target.value }))}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="all">{t('allStatuses')}</option>
                      <option value="completed">{t('completed')}</option>
                      <option value="in-progress">{t('inProgress')}</option>
                      <option value="not-started">{t('notStarted')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('inventoryIssueFilter')}</label>
                    <select
                      value={draftFilters.issueType}
                      onChange={(event) => setDraftFilters((current) => ({ ...current, issueType: event.target.value }))}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="all">{t('allIssues')}</option>
                      <option value="critical">{t('critical')}</option>
                      <option value="low">{t('lowStock')}</option>
                      <option value="expiring">{t('expiringSoon')}</option>
                      <option value="stable">{t('stable')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('category')}</label>
                    <select
                      value={draftFilters.category}
                      onChange={(event) => setDraftFilters((current) => ({ ...current, category: event.target.value }))}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="all">{t('allCategories')}</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category} className="bg-secondary">{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{t('restaurant')}</label>
                    <select
                      value={selectedRestaurant.id}
                      disabled
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                    >
                      {restaurants.map(r => (
                        <option key={r.id} value={r.id} className="bg-secondary">
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full bg-transparent" onClick={handleResetFilters}>
                      {t('resetFilters')}
                    </Button>
                  </div>
                  {hasPendingFilterChanges && (
                    <div className="flex flex-col gap-2 border-t border-border pt-4 sm:col-span-2 sm:flex-row lg:col-span-3 xl:col-span-4">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto" onClick={handleApplyFilters}>
                        {t('applyFilters')}
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent sm:w-auto" onClick={handleCancelFilters}>
                        {t('cancel')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <div className="basis-full">
                <label className="mb-2 block text-sm font-medium text-foreground">{t('reportSections')}</label>
                <div className="flex flex-wrap gap-2">
                  {reportSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selectedSections.includes(section.id)
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border bg-secondary/20 text-muted-foreground hover:text-foreground'
                      }`}
                      title={section.help}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  <SectionTitle label={t('avgIssuesPerAudit')} help={t('avgIssuesHelp')} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{avgIssuesPerAudit.toFixed(1)}</p>
                <p className="text-xs text-destructive mt-1">↑ 5% from last period</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  <SectionTitle label={t('complianceRate')} help={t('complianceRateHelp')} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-accent">{complianceRate.toFixed(1)}%</p>
                <p className="text-xs text-accent mt-1">↑ 2.1% from last period</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  <SectionTitle label={t('avgAuditTime')} help={t('avgAuditTimeHelp')} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{avgAuditTime} min</p>
                <p className="text-xs text-accent mt-1">↓ 8% faster than last period</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  <SectionTitle label={t('totalAudits')} help={t('totalAuditsHelp')} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{filteredAudits.length}</p>
                <p className="text-xs text-accent mt-1">↑ 12 from last period</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audit Completion Trend */}
            {shouldShowSection('trend') && <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle><SectionTitle label={t('auditCompletionTrend')} help={t('auditTrendHelp')} /></CardTitle>
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
            </Card>}

            {/* Issues by Category */}
            {shouldShowSection('category') && <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle><SectionTitle label={t('issuesByCategory')} help={t('issuesByCategoryHelp')} /></CardTitle>
                <CardDescription>{selectedRestaurant.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={issuesByCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip content={<CategoryTooltip />} />
                    <Bar dataKey="issues" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>}

            {/* Compliance by Restaurant */}
            {shouldShowSection('compliance') && <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle><SectionTitle label={t('complianceByInventory')} help={t('complianceByInventoryHelp')} /></CardTitle>
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
            </Card>}

            {/* Issue Severity Distribution */}
            {shouldShowSection('severity') && <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle><SectionTitle label={t('issueSeverity')} help={t('issueSeverityHelp')} /></CardTitle>
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
                    <Tooltip content={<SeverityTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>}

            {/* Audit Duration vs Issues */}
            {shouldShowSection('duration') && <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle><SectionTitle label={t('auditDurationIssues')} help={t('auditDurationHelp')} /></CardTitle>
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
            </Card>}

            {/* Weekly Performance */}
            {shouldShowSection('weekly') && <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle><SectionTitle label={t('weeklyPerformance')} help={t('weeklyPerformanceHelp')} /></CardTitle>
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
            </Card>}
          </div>
          {selectedSections.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {selectedSections.map((sectionId) => {
                const section = reportSections.find((entry) => entry.id === sectionId)
                if (!section) return null
                return (
                  <Card key={section.id} className="bg-card border-border">
                    <CardHeader>
                      <CardTitle><SectionTitle label={`${t('reportDetails')}: ${section.label}`} help={section.help} /></CardTitle>
                      <CardDescription>{selectedRestaurant.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-2xl font-bold text-foreground">{getSectionMetric(section.id)}</p>
                      <p className="text-sm text-muted-foreground">{section.help}</p>
                      <div className="rounded-lg border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">
                        {t('inventoryValue')}: <span className="font-semibold text-foreground">{formatCurrency(inventoryValue)}</span> · {t('completed')}: <span className="font-semibold text-foreground">{completedAudits.length}</span> · {t('inventoryIssues')}: <span className="font-semibold text-foreground">{issuesCount}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>
      {isExportOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-2 sm:p-4" onClick={() => setIsExportOpen(false)}>
          <div className="flex w-[calc(100vw-1rem)] max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-lg border border-border bg-card sm:w-[calc(100vw-2rem)] sm:max-h-[calc(100dvh-2rem)] md:max-w-3xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-border p-4 sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{t('reportSummary')}</h2>
                <p className="text-sm text-muted-foreground">{selectedRestaurant.name}</p>
              </div>
              <button onClick={() => setIsExportOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={22} />
              </button>
            </div>
            <div className="auditflow-thin-scrollbar flex-1 space-y-5 overflow-y-auto p-4 sm:space-y-6 sm:p-6">
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
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t('mermaStock')}</p>
                  <p className="mt-1 text-2xl font-bold text-destructive">{mermaQuantity}</p>
                  <p className="text-xs text-muted-foreground">{mermaItems.length} {t('items')}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t('productionStock')}</p>
                  <p className="mt-1 text-2xl font-bold text-accent">{productionQuantity}</p>
                  <p className="text-xs text-muted-foreground">{productionItems.length} {t('items')}</p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <p className="text-sm text-muted-foreground">
                  {t('totalAudits')}: <span className="font-semibold text-foreground">{filteredAudits.length}</span> · {t('avgAuditTime')}: <span className="font-semibold text-foreground">{avgAuditTime} min</span> · {t('period')}: <span className="font-semibold text-foreground">{appliedFilters.period}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('mermaQuantity')}: <span className="font-semibold text-foreground">{completedAuditMermaQuantity}</span> · {t('productionQuantity')}: <span className="font-semibold text-foreground">{completedAuditProductionQuantity}</span>
                </p>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <Button variant="outline" className="bg-transparent" onClick={() => setIsExportOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button variant="outline" onClick={() => exportReport('xlsx')} disabled={Boolean(isExporting)} className="gap-2 bg-transparent">
                  {isExporting === 'xlsx' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {isExporting === 'xlsx' ? t('exporting') : 'XLSX'}
                </Button>
                <Button onClick={() => exportReport('pdf')} disabled={Boolean(isExporting)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  {isExporting === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  {isExporting === 'pdf' ? t('exporting') : 'PDF'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
