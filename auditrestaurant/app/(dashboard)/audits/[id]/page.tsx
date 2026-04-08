'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { 
  ArrowLeft, Download, CheckCircle, Clock, AlertCircle, Package, 
  Search, Filter, Flag, Save, Check, X as XIcon, MessageSquare, Plus, Send, User
} from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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

interface AuditComment {
  id: number
  author: string
  content: string
  timestamp: string
  type: 'general' | 'discrepancy' | 'issue'
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
  comments: AuditComment[]
}

// Sample audit data
const sampleAudit: Audit = {
  id: 'AUD-0002',
  inventoryId: 2,
  inventoryName: 'Bar',
  inventoryColor: '#8b5cf6',
  auditor: 'Sarah Johnson',
  createdDate: '2024-01-12',
  startedDate: '2024-01-12',
  completedDate: null,
  status: 'in-progress',
  items: [
    { itemId: 9, itemName: 'Vodka', category: 'Spirits', expectedQuantity: 15, availableQuantity: 12, countedQuantity: 14, countedAvailable: 11, unit: 'bottles', unitPrice: 28.0, discrepancy: -1, discrepancyValue: -28.0, status: 'counted', notes: '' },
    { itemId: 10, itemName: 'Tonic Water', category: 'Mixers', expectedQuantity: 24, availableQuantity: 18, countedQuantity: 22, countedAvailable: 16, unit: 'bottles', unitPrice: 2.5, discrepancy: -2, discrepancyValue: -5.0, status: 'counted', notes: 'Some bottles damaged' },
    { itemId: 11, itemName: 'Fresh Mint', category: 'Garnishes', expectedQuantity: 8, availableQuantity: 3, countedQuantity: 6, countedAvailable: 2, unit: 'bundles', unitPrice: 2.5, discrepancy: -2, discrepancyValue: -5.0, status: 'flagged', notes: 'Significant shortage - investigate' },
    { itemId: 12, itemName: 'Lemons', category: 'Garnishes', expectedQuantity: 10, availableQuantity: 8, countedQuantity: 10, countedAvailable: 8, unit: 'kg', unitPrice: 3.0, discrepancy: 0, discrepancyValue: 0, status: 'counted', notes: '' },
    { itemId: 13, itemName: 'Red Wine', category: 'Wine', expectedQuantity: 20, availableQuantity: 15, countedQuantity: 19, countedAvailable: 14, unit: 'bottles', unitPrice: 35.0, discrepancy: -1, discrepancyValue: -35.0, status: 'counted', notes: '' },
    { itemId: 14, itemName: 'Whiskey', category: 'Spirits', expectedQuantity: 10, availableQuantity: 8, countedQuantity: null, countedAvailable: null, unit: 'bottles', unitPrice: 45.0, discrepancy: null, discrepancyValue: null, status: 'pending', notes: '' },
    { itemId: 15, itemName: 'Beer (Lager)', category: 'Beer', expectedQuantity: 48, availableQuantity: 36, countedQuantity: null, countedAvailable: null, unit: 'bottles', unitPrice: 3.5, discrepancy: null, discrepancyValue: null, status: 'pending', notes: '' },
    { itemId: 16, itemName: 'Orange Juice', category: 'Mixers', expectedQuantity: 12, availableQuantity: 10, countedQuantity: null, countedAvailable: null, unit: 'L', unitPrice: 4.0, discrepancy: null, discrepancyValue: null, status: 'pending', notes: '' },
  ],
  totalItems: 8,
  countedItems: 5,
  flaggedItems: 1,
  totalDiscrepancy: -73.0,
  notes: 'Bar audit in progress',
  comments: [
    { id: 1, author: 'Sarah Johnson', content: 'Started bar inventory audit. Will focus on spirits and mixers first.', timestamp: '2024-01-12 09:00', type: 'general' },
    { id: 2, author: 'Sarah Johnson', content: 'Found discrepancy in Fresh Mint - appears some bundles spoiled and were discarded without logging.', timestamp: '2024-01-12 10:30', type: 'discrepancy' },
    { id: 3, author: 'Manager', content: 'Please verify vodka count - we had a delivery yesterday that may not be logged.', timestamp: '2024-01-12 11:15', type: 'issue' },
  ]
}

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [audit, setAudit] = useState<Audit>(sampleAudit)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'counted' | 'flagged'>('all')
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [tempValues, setTempValues] = useState<{ countedQuantity: string; countedAvailable: string; notes: string }>({
    countedQuantity: '',
    countedAvailable: '',
    notes: ''
  })
  const [showAddComment, setShowAddComment] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<'general' | 'discrepancy' | 'issue'>('general')

  const filteredItems = useMemo(() => {
    return audit.items.filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [audit.items, searchTerm, filterStatus])

  const stats = useMemo(() => {
    const counted = audit.items.filter(i => i.status === 'counted' || i.status === 'flagged').length
    const flagged = audit.items.filter(i => i.status === 'flagged').length
    const pending = audit.items.filter(i => i.status === 'pending').length
    const totalDiscrepancy = audit.items.reduce((sum, item) => sum + (item.discrepancyValue || 0), 0)
    const totalExpectedValue = audit.items.reduce((sum, item) => sum + (item.expectedQuantity * item.unitPrice), 0)
    const totalCountedValue = audit.items.reduce((sum, item) => {
      if (item.countedQuantity !== null) {
        return sum + (item.countedQuantity * item.unitPrice)
      }
      return sum
    }, 0)
    
    return { counted, flagged, pending, totalDiscrepancy, totalExpectedValue, totalCountedValue }
  }, [audit.items])

  const progress = Math.round((stats.counted / audit.totalItems) * 100)

  const handleStartEdit = (item: AuditItem) => {
    setEditingItem(item.itemId)
    setTempValues({
      countedQuantity: item.countedQuantity?.toString() || '',
      countedAvailable: item.countedAvailable?.toString() || '',
      notes: item.notes
    })
  }

  const handleSaveItem = (itemId: number) => {
    const countedQty = parseFloat(tempValues.countedQuantity) || 0
    const countedAvail = parseFloat(tempValues.countedAvailable) || 0
    
    setAudit(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.itemId === itemId) {
          const discrepancy = countedQty - item.expectedQuantity
          const discrepancyValue = discrepancy * item.unitPrice
          const isFlagged = Math.abs(discrepancy) > (item.expectedQuantity * 0.1) // Flag if >10% discrepancy
          
          return {
            ...item,
            countedQuantity: countedQty,
            countedAvailable: countedAvail,
            discrepancy,
            discrepancyValue,
            status: isFlagged ? 'flagged' : 'counted' as const,
            notes: tempValues.notes
          }
        }
        return item
      })
      
      const countedCount = updatedItems.filter(i => i.status === 'counted' || i.status === 'flagged').length
      const flaggedCount = updatedItems.filter(i => i.status === 'flagged').length
      const totalDisc = updatedItems.reduce((sum, i) => sum + (i.discrepancyValue || 0), 0)
      
      return {
        ...prev,
        items: updatedItems,
        countedItems: countedCount,
        flaggedItems: flaggedCount,
        totalDiscrepancy: totalDisc
      }
    })
    
    setEditingItem(null)
    setTempValues({ countedQuantity: '', countedAvailable: '', notes: '' })
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setTempValues({ countedQuantity: '', countedAvailable: '', notes: '' })
  }

  const handleFlagItem = (itemId: number) => {
    setAudit(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.itemId === itemId 
          ? { ...item, status: item.status === 'flagged' ? 'counted' : 'flagged' as const }
          : item
      ),
      flaggedItems: prev.items.filter(i => i.status === 'flagged').length
    }))
  }

  const handleCompleteAudit = () => {
    const pendingItems = audit.items.filter(i => i.status === 'pending')
    if (pendingItems.length > 0) {
      alert('Please count all items before completing the audit.')
      return
    }
    
    setAudit(prev => ({
      ...prev,
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0]
    }))
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    const now = new Date()
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`
    
    const comment: AuditComment = {
      id: audit.comments.length + 1,
      author: audit.auditor,
      content: newComment.trim(),
      timestamp,
      type: commentType
    }
    
    setAudit(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }))
    
    setNewComment('')
    setCommentType('general')
    setShowAddComment(false)
  }

  const categoryData = useMemo(() => {
    const categories = [...new Set(audit.items.map(i => i.category))]
    return categories.map(cat => {
      const items = audit.items.filter(i => i.category === cat)
      return {
        category: cat,
        expected: items.reduce((sum, i) => sum + i.expectedQuantity, 0),
        counted: items.reduce((sum, i) => sum + (i.countedQuantity || 0), 0),
        discrepancy: items.reduce((sum, i) => sum + (i.discrepancy || 0), 0)
      }
    })
  }, [audit.items])

  const statusDistribution = [
    { name: 'Counted', value: stats.counted - stats.flagged, color: 'var(--accent)' },
    { name: 'Flagged', value: stats.flagged, color: 'var(--destructive)' },
    { name: 'Pending', value: stats.pending, color: 'var(--muted-foreground)' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'counted':
        return <CheckCircle className="text-accent" size={18} />
      case 'flagged':
        return <AlertCircle className="text-destructive" size={18} />
      case 'pending':
        return <Clock className="text-muted-foreground" size={18} />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Back Button */}
          <Link href="/audits">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground bg-transparent">
              <ArrowLeft size={18} />
              Back to Audits
            </Button>
          </Link>

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-start gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${audit.inventoryColor}20` }}
              >
                <Package size={28} style={{ color: audit.inventoryColor }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{audit.inventoryName} Audit</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    audit.status === 'completed' ? 'bg-accent/20 text-accent' :
                    audit.status === 'in-progress' ? 'bg-primary/20 text-primary' :
                    'bg-muted/20 text-muted-foreground'
                  }`}>
                    {audit.status === 'not-started' ? 'Not Started' : 
                     audit.status === 'in-progress' ? 'In Progress' : 'Completed'}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  <span className="font-mono text-accent">{audit.id}</span> • 
                  Auditor: {audit.auditor} • 
                  Created: {audit.createdDate}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {audit.status === 'in-progress' && (
                <Button 
                  onClick={handleCompleteAudit}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  disabled={stats.pending > 0}
                >
                  <CheckCircle size={18} />
                  Complete Audit
                </Button>
              )}
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download size={18} />
                Export
              </Button>
            </div>
          </div>

          {/* Progress and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Progress Card */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Audit Progress</p>
                    <p className="text-3xl font-bold text-foreground">{progress}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Items Counted</p>
                    <p className="text-xl font-bold text-foreground">{stats.counted} / {audit.totalItems}</p>
                  </div>
                </div>
                <div className="w-full h-3 bg-secondary/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span>{stats.pending} pending</span>
                  <span>{stats.flagged} flagged</span>
                </div>
              </CardContent>
            </Card>

            {/* Discrepancy Card */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Total Discrepancy</p>
                <p className={`text-2xl font-bold ${stats.totalDiscrepancy < 0 ? 'text-destructive' : stats.totalDiscrepancy > 0 ? 'text-accent' : 'text-foreground'}`}>
                  ${stats.totalDiscrepancy.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Expected: ${stats.totalExpectedValue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            {/* Flagged Items Card */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Flagged Items</p>
                <p className="text-2xl font-bold text-destructive">{stats.flagged}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Category Comparison</CardTitle>
                <CardDescription>Expected vs Counted quantities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="expected" fill="var(--muted-foreground)" name="Expected" />
                    <Bar dataKey="counted" fill="var(--primary)" name="Counted" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Items by audit status</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
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

          {/* Audit Items Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <CardTitle>Audit Items</CardTitle>
                  <CardDescription>Record actual quantities for each item</CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent text-sm w-48"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="all" className="bg-secondary">All Status</option>
                    <option value="pending" className="bg-secondary">Pending</option>
                    <option value="counted" className="bg-secondary">Counted</option>
                    <option value="flagged" className="bg-secondary">Flagged</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Item</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Category</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Expected (Stock)</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Expected (Available)</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Counted (Stock)</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Counted (Available)</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Discrepancy</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.itemId} className={`border-b border-border transition-colors ${
                        item.status === 'flagged' ? 'bg-destructive/5' : 'hover:bg-secondary/20'
                      }`}>
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{item.itemName}</p>
                          <p className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)} / {item.unit}</p>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                        <td className="py-3 px-4 text-center text-foreground font-medium">
                          {item.expectedQuantity} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground">
                          {item.availableQuantity} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {editingItem === item.itemId ? (
                            <input
                              type="number"
                              value={tempValues.countedQuantity}
                              onChange={(e) => setTempValues(prev => ({ ...prev, countedQuantity: e.target.value }))}
                              className="w-20 px-2 py-1 bg-background border border-accent rounded text-center text-foreground focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            <span className={item.countedQuantity !== null ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                              {item.countedQuantity !== null ? `${item.countedQuantity} ${item.unit}` : '-'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {editingItem === item.itemId ? (
                            <input
                              type="number"
                              value={tempValues.countedAvailable}
                              onChange={(e) => setTempValues(prev => ({ ...prev, countedAvailable: e.target.value }))}
                              className="w-20 px-2 py-1 bg-background border border-border rounded text-center text-foreground focus:outline-none"
                            />
                          ) : (
                            <span className={item.countedAvailable !== null ? 'text-muted-foreground' : 'text-muted-foreground'}>
                              {item.countedAvailable !== null ? `${item.countedAvailable} ${item.unit}` : '-'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.discrepancy !== null ? (
                            <span className={`font-medium ${
                              item.discrepancy < 0 ? 'text-destructive' : 
                              item.discrepancy > 0 ? 'text-accent' : 'text-foreground'
                            }`}>
                              {item.discrepancy > 0 ? '+' : ''}{item.discrepancy}
                              <span className="text-xs text-muted-foreground ml-1">
                                (${item.discrepancyValue?.toFixed(2)})
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getStatusIcon(item.status)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {editingItem === item.itemId ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSaveItem(item.itemId)}
                                  className="text-accent hover:text-accent hover:bg-accent/10"
                                >
                                  <Check size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                >
                                  <XIcon size={16} />
                                </Button>
                              </>
                            ) : (
                              <>
                                {audit.status !== 'completed' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStartEdit(item)}
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    title="Count Item"
                                  >
                                    <Save size={16} />
                                  </Button>
                                )}
                                {item.status !== 'pending' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFlagItem(item.itemId)}
                                    className={`${item.status === 'flagged' ? 'text-destructive' : 'text-muted-foreground'} hover:text-destructive hover:bg-destructive/10`}
                                    title={item.status === 'flagged' ? 'Unflag Item' : 'Flag Item'}
                                  >
                                    <Flag size={16} />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredItems.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No items match your search criteria.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare size={20} className="text-primary" />
                  <div>
                    <CardTitle>Audit Comments</CardTitle>
                    <CardDescription>{audit.comments.length} comment{audit.comments.length !== 1 ? 's' : ''}</CardDescription>
                  </div>
                </div>
                {audit.status !== 'completed' && (
                  <Button
                    onClick={() => setShowAddComment(!showAddComment)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  >
                    <Plus size={16} />
                    Add Comment
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment Form */}
              {showAddComment && (
                <div className="p-4 bg-secondary/20 border border-border rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={commentType}
                      onChange={(e) => setCommentType(e.target.value as 'general' | 'discrepancy' | 'issue')}
                      className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="general" className="bg-secondary">General</option>
                      <option value="discrepancy" className="bg-secondary">Discrepancy</option>
                      <option value="issue" className="bg-secondary">Issue</option>
                    </select>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your observation, issue, or explanation..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddComment(false)
                        setNewComment('')
                        setCommentType('general')
                      }}
                      className="bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                      <Send size={16} />
                      Submit
                    </Button>
                  </div>
                </div>
              )}

              {/* Comments List */}
              {audit.comments.length > 0 ? (
                <div className="space-y-3">
                  {audit.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-lg border ${
                        comment.type === 'discrepancy' ? 'bg-primary/5 border-primary/30' :
                        comment.type === 'issue' ? 'bg-destructive/5 border-destructive/30' :
                        'bg-secondary/20 border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground">{comment.author}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              comment.type === 'discrepancy' ? 'bg-primary/20 text-primary' :
                              comment.type === 'issue' ? 'bg-destructive/20 text-destructive' :
                              'bg-muted/30 text-muted-foreground'
                            }`}>
                              {comment.type.charAt(0).toUpperCase() + comment.type.slice(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                          </div>
                          <p className="text-muted-foreground mt-1">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Add a comment to document observations or issues.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          {audit.notes && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Audit Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{audit.notes}</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
