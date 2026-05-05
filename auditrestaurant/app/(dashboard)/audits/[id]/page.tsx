'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowLeft, CheckCircle, Clock, Download, Edit2, FileText, Loader2, MessageSquare, Save, Search, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { useAppContext } from '@/components/app-context'

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { selectedRestaurant, updateAuditItem, completeAudit, reopenAudit, addAuditComment, formatCurrency, t } = useAppContext()
  const audit = selectedRestaurant.audits.find((candidate) => candidate.id === id)
  const [searchTerm, setSearchTerm] = useState('')
  const [draftValues, setDraftValues] = useState<Record<number, string>>({})
  const [editingRows, setEditingRows] = useState<Record<number, boolean>>({})
  const [savingRows, setSavingRows] = useState<Record<number, boolean>>({})
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [isExporting, setIsExporting] = useState<null | 'csv' | 'pdf'>(null)
  const [commentText, setCommentText] = useState('')

  const auditItems = useMemo(() => {
    if (!audit) return []
    return audit.items?.length
      ? audit.items
      : selectedRestaurant.inventoryTypes
          .find((type) => type.id === audit.inventoryId)
          ?.items.map((item) => ({
            itemId: item.id,
            itemName: item.name,
            category: item.category,
            previousStock: item.quantity,
            currentStock: null,
            unit: item.unit,
            unitPrice: item.price,
            difference: null,
            result: 'pending' as const,
            notes: '',
          })) ?? []
  }, [audit, selectedRestaurant.inventoryTypes])

  const items = useMemo(() => {
    return auditItems.filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [auditItems, searchTerm])

  if (!audit) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="p-6">
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <TriangleAlert size={34} className="text-muted-foreground" />
                <p className="text-muted-foreground">{t('auditNotFound')} for {selectedRestaurant.name}.</p>
                <Link href="/audits">
                  <Button variant="outline" className="bg-transparent">{t('backToAudits')}</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const totalInventoryItems = auditItems.length
  const countedItems = auditItems.filter((item) => item.result !== 'pending').length
  const progress = Math.round((countedItems / Math.max(totalInventoryItems, 1)) * 100)
  const canComplete = totalInventoryItems > 0 && countedItems === totalInventoryItems
  const isCompleted = audit.status === 'completed'
  const displayStatus = audit.status === 'completed' ? 'completed' : 'in-progress'
  const soldUnits = auditItems.reduce((sum, item) => sum + Math.max(item.difference ?? 0, 0), 0)
  const salesImpact = auditItems.reduce((sum, item) => sum + Math.max(item.difference ?? 0, 0) * item.unitPrice, 0)
  const discrepancyImpact = auditItems.reduce((sum, item) => sum + Math.abs(Math.min(item.difference ?? 0, 0)) * item.unitPrice, 0)
  const countedValue = auditItems.reduce((sum, item) => sum + (item.currentStock ?? 0) * item.unitPrice, 0)
  const previousValue = auditItems.reduce((sum, item) => sum + item.previousStock * item.unitPrice, 0)
  const resultData = [
    { name: t('sold'), value: auditItems.filter((item) => item.result === 'sold').length, color: 'var(--accent)' },
    { name: t('discrepancy'), value: auditItems.filter((item) => item.result === 'discrepancy').length, color: 'var(--destructive)' },
    { name: t('matched'), value: auditItems.filter((item) => item.result === 'matched').length, color: 'var(--primary)' },
    { name: t('pending'), value: auditItems.filter((item) => item.result === 'pending').length, color: 'var(--muted-foreground)' },
  ].filter((entry) => entry.value > 0)
  const categoryData = Object.values(auditItems.reduce<Record<string, { category: string; sold: number; discrepancy: number }>>((acc, item) => {
    acc[item.category] ??= { category: item.category, sold: 0, discrepancy: 0 }
    acc[item.category].sold += Math.max(item.difference ?? 0, 0)
    acc[item.category].discrepancy += Math.abs(Math.min(item.difference ?? 0, 0))
    return acc
  }, {}))
  const comments = audit.comments ?? []

  const handleSaveItem = (itemId: number) => {
    const item = items.find((candidate) => candidate.itemId === itemId)
    if (!item) return
    const rawValue = draftValues[itemId] ?? item.currentStock?.toString() ?? ''
    const currentStock = Number.parseFloat(rawValue)
    if (!Number.isFinite(currentStock)) return
    setSavingRows((prev) => ({ ...prev, [itemId]: true }))
    updateAuditItem(audit.id, itemId, currentStock)
    window.setTimeout(() => {
      setSavingRows((prev) => ({ ...prev, [itemId]: false }))
      setEditingRows((prev) => ({ ...prev, [itemId]: false }))
    }, 250)
  }

  const handleSaveAll = () => {
    const changedItems = auditItems.filter((item) => {
      const rawValue = draftValues[item.itemId]
      if (rawValue === undefined || rawValue === '') return false
      const currentStock = Number.parseFloat(rawValue)
      return Number.isFinite(currentStock) && currentStock !== item.currentStock
    })

    changedItems.forEach((item) => {
      const currentStock = Number.parseFloat(draftValues[item.itemId])
      setSavingRows((prev) => ({ ...prev, [item.itemId]: true }))
      updateAuditItem(audit.id, item.itemId, currentStock)
    })

    window.setTimeout(() => {
      setSavingRows((prev) => {
        const next = { ...prev }
        changedItems.forEach((item) => {
          next[item.itemId] = false
        })
        return next
      })
      setEditingRows((prev) => {
        const next = { ...prev }
        changedItems.forEach((item) => {
          next[item.itemId] = false
        })
        return next
      })
    }, 300)
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return
    setIsSavingComment(true)
    addAuditComment(audit.id, {
      author: audit.auditor,
      content: commentText,
    })
    window.setTimeout(() => {
      setCommentText('')
      setIsAddingComment(false)
      setIsSavingComment(false)
    }, 250)
  }

  const handleExport = (type: 'csv' | 'pdf') => {
    setIsExporting(type)
    window.setTimeout(() => {
      if (type === 'csv') exportCsv()
      if (type === 'pdf') exportPdf()
      setIsExporting(null)
    }, 300)
  }

  const auditRows = auditItems.map((item) => ({
    item: item.itemName,
    category: item.category,
    previousStock: item.previousStock,
    currentStock: item.currentStock ?? '',
    unit: item.unit,
    difference: item.difference ?? '',
    result: item.result,
    unitPrice: item.unitPrice,
    salesImpact: Math.max(item.difference ?? 0, 0) * item.unitPrice,
    discrepancyImpact: Math.abs(Math.min(item.difference ?? 0, 0)) * item.unitPrice,
  }))

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportCsv = () => {
    const headers = ['Item', 'Category', 'Previous Stock', 'Current Stock', 'Unit', 'Difference', 'Result', 'Unit Price', 'Sales Impact', 'Discrepancy Impact']
    const rows = auditRows.map((row) => [
      row.item,
      row.category,
      row.previousStock,
      row.currentStock,
      row.unit,
      row.difference,
      row.result,
      row.unitPrice,
      row.salesImpact,
      row.discrepancyImpact,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${audit.id}.csv`)
  }

  const exportPdf = () => {
    const lines = [
      `${audit.id} - ${audit.inventoryName}`,
      `Date: ${audit.createdDate}`,
      `Auditor: ${audit.auditor}`,
      `Items audited: ${countedItems}/${totalInventoryItems}`,
      `Sold value: ${formatCurrency(salesImpact)}`,
      `Discrepancy value: ${formatCurrency(discrepancyImpact)}`,
      '',
      ...auditRows.map((row) =>
        `${row.item} | previous ${row.previousStock} ${row.unit} | current ${row.currentStock} ${row.unit} | difference ${row.difference} | ${row.result} | sold ${formatCurrency(row.salesImpact)} | discrepancy ${formatCurrency(row.discrepancyImpact)}`,
      ),
    ]
    const escaped = lines.join('\n').replace(/[()\\]/g, '\\$&')
    const stream = `BT /F1 10 Tf 40 780 Td 12 TL (${escaped.replace(/\n/g, ') Tj T* (')}) Tj ET`
    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    ]
    let pdf = '%PDF-1.4\n'
    const offsets = [0]
    objects.forEach((object) => {
      offsets.push(pdf.length)
      pdf += `${object}\n`
    })
    const xrefStart = pdf.length
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
    })
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
    downloadBlob(new Blob([pdf], { type: 'application/pdf' }), `${audit.id}.pdf`)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="p-4 space-y-6 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/audits" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3">
                <ArrowLeft size={16} />
                {t('backToAudits')}
              </Link>
              <h1 className="text-3xl font-bold text-foreground">{audit.id}</h1>
              <p className="text-muted-foreground mt-1">
                {audit.inventoryName} · {t('auditDate')}: {audit.createdDate} · {t('auditor')}: {audit.auditor}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  if (isCompleted) {
                    reopenAudit(audit.id)
                    setEditingRows({})
                    return
                  }
                  setShowCompletionModal(true)
                }}
                disabled={!isCompleted && !canComplete}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                {isCompleted ? <Edit2 size={18} /> : <CheckCircle size={18} />}
                {isCompleted ? t('edit') : t('completed')}
              </Button>
              {isCompleted && (
                <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowCompletionModal(true)}>
                  <Download size={18} />
                  {t('export')}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm text-muted-foreground">
                  {t('items')}
                  {isCompleted && <CheckCircle size={16} className="text-accent" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{countedItems}/{totalInventoryItems}</p>
                <p className="text-xs text-accent mt-1">{progress}% {t('completed')}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm text-muted-foreground">
                  {t('discrepancy')}
                  {isCompleted && <CheckCircle size={16} className="text-accent" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">{audit.flaggedItems}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(Math.abs(audit.totalDiscrepancy))}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm text-muted-foreground">
                  {t('status')}
                  {isCompleted && <CheckCircle size={16} className="text-accent" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-2 text-2xl font-bold text-foreground">
                  <Clock size={20} className="text-primary" />
                  {displayStatus}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('salesImpact')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-accent">{formatCurrency(salesImpact)}</p>
                <p className="text-xs text-muted-foreground mt-1">{soldUnits} units</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('discrepancy')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(discrepancyImpact)}</p>
                <p className="text-xs text-muted-foreground mt-1">{audit.flaggedItems} items</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('previousStock')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(previousValue)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t('currentStock')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(countedValue)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t('analytics')}
                  {isCompleted && <CheckCircle size={18} className="text-accent" />}
                </CardTitle>
                <CardDescription>{t('result')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={resultData} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={2}>
                      {resultData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t('financialResults')}
                  {isCompleted && <CheckCircle size={18} className="text-accent" />}
                </CardTitle>
                <CardDescription>{t('salesImpact')} / {t('discrepancy')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="category" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Bar dataKey="sold" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="discrepancy" fill="var(--destructive)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{audit.inventoryName}</CardTitle>
              <CardDescription>{t('previousStock')} → {t('currentStock')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t('itemName')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t('previousStock')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t('currentStock')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t('difference')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t('salesImpact')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t('result')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const draft = draftValues[item.itemId] ?? item.currentStock?.toString() ?? ''
                      const difference = item.difference
                      const isSaved = item.result !== 'pending'
                      const isRowEditing = Boolean(editingRows[item.itemId])
                      const isSaving = Boolean(savingRows[item.itemId])
                      const resultClass =
                        item.result === 'sold'
                          ? 'text-accent'
                          : item.result === 'discrepancy'
                            ? 'text-destructive'
                            : 'text-muted-foreground'

                      return (
                        <tr key={item.itemId} className="border-b border-border hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-foreground">{item.itemName}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </td>
                          <td className="py-3 px-4 text-foreground">{item.previousStock} {item.unit}</td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              step="0.01"
                              value={draft}
                              onFocus={() => {
                                if (!isCompleted && !isSaved) {
                                  setEditingRows((prev) => ({ ...prev, [item.itemId]: true }))
                                }
                              }}
                              onChange={(event) => setDraftValues((prev) => ({ ...prev, [item.itemId]: event.target.value }))}
                              disabled={isCompleted || (isSaved && !isRowEditing)}
                              className="w-28 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-70"
                            />
                          </td>
                          <td className={`py-3 px-4 font-semibold ${difference === null ? 'text-muted-foreground' : difference >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            {difference === null ? '-' : `${difference > 0 ? '+' : ''}${difference} ${item.unit}`}
                          </td>
                          <td className="py-3 px-4 font-semibold text-accent">
                            {formatCurrency(Math.max(difference ?? 0, 0) * item.unitPrice)}
                          </td>
                          <td className={`py-3 px-4 font-semibold ${resultClass}`}>
                            {item.result === 'sold' ? t('sold') : item.result === 'discrepancy' ? t('discrepancy') : item.result === 'matched' ? t('matched') : t('pending')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-accent">
                                  <CheckCircle size={15} />
                                  {t('completed')}
                                </span>
                              ) : isSaved && !isRowEditing ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  onClick={() => {
                                    setDraftValues((prev) => ({ ...prev, [item.itemId]: item.currentStock?.toString() ?? item.previousStock.toString() }))
                                    setEditingRows((prev) => ({ ...prev, [item.itemId]: true }))
                                  }}
                                >
                                  <Edit2 size={16} />
                                  {t('edit')}
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground hover:text-accent hover:bg-accent/10" onClick={() => handleSaveItem(item.itemId)} disabled={isSaving}>
                                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                  {isSaving ? t('saving') : t('save')}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {!isCompleted && (
                <div className="flex justify-end border-t border-border pt-4">
                  <Button
                    variant="outline"
                    className="w-full gap-2 bg-transparent sm:w-auto"
                    onClick={handleSaveAll}
                    disabled={!auditItems.some((item) => {
                      const rawValue = draftValues[item.itemId]
                      if (rawValue === undefined || rawValue === '') return false
                      const currentStock = Number.parseFloat(rawValue)
                      return Number.isFinite(currentStock) && currentStock !== item.currentStock
                    })}
                  >
                    <Save size={16} />
                    {t('saveAll')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>{t('comments')}</CardTitle>
                    <CardDescription>{audit.id}</CardDescription>
                  </div>
                  {!isAddingComment && (
                    <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsAddingComment(true)}>
                      <MessageSquare size={16} />
                      {t('addComment')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAddingComment && (
                  <div className="rounded-lg border border-border bg-secondary/20 p-4">
                    <textarea
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      rows={4}
                      placeholder={t('writeComment')}
                      className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                    />
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button variant="outline" className="bg-transparent" onClick={() => {
                        setCommentText('')
                        setIsAddingComment(false)
                      }}>
                        {t('cancel')}
                      </Button>
                      <Button onClick={handleAddComment} disabled={isSavingComment || !commentText.trim()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        {isSavingComment ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isSavingComment ? t('saving') : t('saveComment')}
                      </Button>
                    </div>
                  </div>
                )}
                {comments.length > 0 ? comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-border bg-secondary/20 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">{comment.author}</p>
                      <p className="text-xs text-muted-foreground">{comment.date}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                )) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">{t('noComments')}</p>
                )}
                {audit.notes && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase text-primary">{t('initialComment')}</p>
                    <p className="text-sm text-muted-foreground">{audit.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      {showCompletionModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{t('auditResults')}</h2>
                <p className="text-sm text-muted-foreground">{audit.id} · {audit.inventoryName}</p>
              </div>
              <button onClick={() => setShowCompletionModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t('items')}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{countedItems}/{totalInventoryItems}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t('sold')}</p>
                  <p className="mt-1 text-2xl font-bold text-accent">{soldUnits}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(salesImpact)}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t('discrepancy')}</p>
                  <p className="mt-1 text-2xl font-bold text-destructive">{audit.flaggedItems}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(discrepancyImpact)}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t('netMovement')}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{formatCurrency(salesImpact - discrepancyImpact)}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-[820px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('itemName')}</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('previousStock')}</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('currentStock')}</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('difference')}</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('salesImpact')}</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('discrepancy')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditRows.map((row) => (
                      <tr key={row.item} className="border-b border-border">
                        <td className="px-4 py-3 text-foreground">{row.item}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.previousStock} {row.unit}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.currentStock} {row.unit}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.difference} {row.unit}</td>
                        <td className="px-4 py-3 font-medium text-accent">{formatCurrency(row.salesImpact)}</td>
                        <td className="px-4 py-3 font-medium text-destructive">{formatCurrency(row.discrepancyImpact)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2 bg-transparent" onClick={() => handleExport('csv')} disabled={Boolean(isExporting)}>
                    {isExporting === 'csv' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isExporting === 'csv' ? t('exporting') : 'CSV'}
                  </Button>
                  <Button variant="outline" className="gap-2 bg-transparent" onClick={() => handleExport('pdf')} disabled={Boolean(isExporting)}>
                    {isExporting === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                    {isExporting === 'pdf' ? t('exporting') : 'PDF'}
                  </Button>
                </div>
                {!isCompleted && (
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      completeAudit(audit.id)
                      setShowCompletionModal(false)
                    }}
                  >
                    {t('completed')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
