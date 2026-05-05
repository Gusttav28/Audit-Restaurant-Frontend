'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import AuditsTable from '@/components/audits/audits-table'
import CreateAuditModal from '@/components/audits/create-audit-modal'
import { Plus, Search, ClipboardList, CheckCircle, Clock, AlertCircle, Trash2, X } from 'lucide-react'
import { useAppContext } from '@/components/app-context'
import Link from 'next/link'

// Shared types for the audit system
export interface InventoryItem {
  id: number
  name: string
  category: string
  expectedQuantity: number
  availableQuantity: number
  unit: string
  unitPrice: number
}

export interface InventoryType {
  id: number
  name: string
  color: string
  items: InventoryItem[]
}

export interface AuditItem {
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

export interface Audit {
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

// Sample inventory types with items
const sampleInventoryTypes: InventoryType[] = [
  {
    id: 1,
    name: 'Kitchen',
    color: '#3b82f6',
    items: [
      { id: 1, name: 'Olive Oil', category: 'Oils & Vinegars', expectedQuantity: 10, availableQuantity: 8, unit: 'L', unitPrice: 28.5 },
      { id: 2, name: 'Fresh Basil', category: 'Herbs & Spices', expectedQuantity: 6, availableQuantity: 2, unit: 'bundles', unitPrice: 3.5 },
      { id: 3, name: 'Pasta (Penne)', category: 'Grains & Pasta', expectedQuantity: 20, availableQuantity: 15, unit: 'boxes', unitPrice: 2.2 },
      { id: 4, name: 'Cheddar Cheese', category: 'Dairy', expectedQuantity: 8, availableQuantity: 3, unit: 'kg', unitPrice: 12.0 },
      { id: 5, name: 'Tomatoes', category: 'Produce', expectedQuantity: 15, availableQuantity: 12, unit: 'kg', unitPrice: 4.5 },
      { id: 6, name: 'Chicken Breast', category: 'Meat', expectedQuantity: 10, availableQuantity: 6, unit: 'kg', unitPrice: 15.0 },
      { id: 7, name: 'Garlic', category: 'Produce', expectedQuantity: 3, availableQuantity: 1, unit: 'kg', unitPrice: 8.0 },
      { id: 8, name: 'Butter', category: 'Dairy', expectedQuantity: 5, availableQuantity: 4, unit: 'kg', unitPrice: 10.0 },
    ]
  },
  {
    id: 2,
    name: 'Bar',
    color: '#8b5cf6',
    items: [
      { id: 9, name: 'Vodka', category: 'Spirits', expectedQuantity: 15, availableQuantity: 12, unit: 'bottles', unitPrice: 28.0 },
      { id: 10, name: 'Tonic Water', category: 'Mixers', expectedQuantity: 24, availableQuantity: 18, unit: 'bottles', unitPrice: 2.5 },
      { id: 11, name: 'Fresh Mint', category: 'Garnishes', expectedQuantity: 8, availableQuantity: 3, unit: 'bundles', unitPrice: 2.5 },
      { id: 12, name: 'Lemons', category: 'Garnishes', expectedQuantity: 10, availableQuantity: 8, unit: 'kg', unitPrice: 3.0 },
      { id: 13, name: 'Red Wine', category: 'Wine', expectedQuantity: 20, availableQuantity: 15, unit: 'bottles', unitPrice: 35.0 },
      { id: 14, name: 'Whiskey', category: 'Spirits', expectedQuantity: 10, availableQuantity: 8, unit: 'bottles', unitPrice: 45.0 },
      { id: 15, name: 'Beer (Lager)', category: 'Beer', expectedQuantity: 48, availableQuantity: 36, unit: 'bottles', unitPrice: 3.5 },
      { id: 16, name: 'Orange Juice', category: 'Mixers', expectedQuantity: 12, availableQuantity: 10, unit: 'L', unitPrice: 4.0 },
    ]
  },
  {
    id: 3,
    name: 'Storage',
    color: '#10b981',
    items: [
      { id: 17, name: 'Rice', category: 'Grains', expectedQuantity: 50, availableQuantity: 45, unit: 'kg', unitPrice: 2.0 },
      { id: 18, name: 'Flour', category: 'Grains', expectedQuantity: 30, availableQuantity: 28, unit: 'kg', unitPrice: 1.5 },
      { id: 19, name: 'Sugar', category: 'Baking', expectedQuantity: 25, availableQuantity: 20, unit: 'kg', unitPrice: 1.8 },
      { id: 20, name: 'Canned Tomatoes', category: 'Canned Goods', expectedQuantity: 40, availableQuantity: 35, unit: 'cans', unitPrice: 2.0 },
    ]
  }
]

// Sample audits
const initialAudits: Audit[] = [
  {
    id: 'AUD-0001',
    inventoryId: 1,
    inventoryName: 'Kitchen',
    inventoryColor: '#3b82f6',
    auditor: 'John Smith',
    createdDate: '2024-01-10',
    startedDate: '2024-01-10',
    completedDate: '2024-01-15',
    status: 'completed',
    items: sampleInventoryTypes[0].items.map(item => ({
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      expectedQuantity: item.expectedQuantity,
      availableQuantity: item.availableQuantity,
      countedQuantity: item.expectedQuantity - Math.floor(Math.random() * 3),
      countedAvailable: item.availableQuantity - Math.floor(Math.random() * 2),
      unit: item.unit,
      unitPrice: item.unitPrice,
      discrepancy: Math.floor(Math.random() * 3) - 1,
      discrepancyValue: (Math.floor(Math.random() * 3) - 1) * item.unitPrice,
      status: 'counted',
      notes: ''
    })),
    totalItems: 8,
    countedItems: 8,
    flaggedItems: 2,
    totalDiscrepancy: -45.50,
    notes: 'Monthly kitchen audit completed. Minor discrepancies noted.'
  },
  {
    id: 'AUD-0002',
    inventoryId: 2,
    inventoryName: 'Bar',
    inventoryColor: '#8b5cf6',
    auditor: 'Sarah Johnson',
    createdDate: '2024-01-12',
    startedDate: '2024-01-12',
    completedDate: null,
    status: 'in-progress',
    items: sampleInventoryTypes[1].items.map((item, idx) => ({
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      expectedQuantity: item.expectedQuantity,
      availableQuantity: item.availableQuantity,
      countedQuantity: idx < 5 ? item.expectedQuantity - Math.floor(Math.random() * 2) : null,
      countedAvailable: idx < 5 ? item.availableQuantity - Math.floor(Math.random() * 2) : null,
      unit: item.unit,
      unitPrice: item.unitPrice,
      discrepancy: idx < 5 ? Math.floor(Math.random() * 2) - 1 : null,
      discrepancyValue: idx < 5 ? (Math.floor(Math.random() * 2) - 1) * item.unitPrice : null,
      status: idx < 5 ? 'counted' : 'pending',
      notes: ''
    })),
    totalItems: 8,
    countedItems: 5,
    flaggedItems: 1,
    totalDiscrepancy: -28.00,
    notes: 'Bar audit in progress'
  },
  {
    id: 'AUD-0003',
    inventoryId: 1,
    inventoryName: 'Kitchen',
    inventoryColor: '#3b82f6',
    auditor: 'Michael Chen',
    createdDate: '2024-01-16',
    startedDate: null,
    completedDate: null,
    status: 'not-started',
    items: sampleInventoryTypes[0].items.map(item => ({
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      expectedQuantity: item.expectedQuantity,
      availableQuantity: item.availableQuantity,
      countedQuantity: null,
      countedAvailable: null,
      unit: item.unit,
      unitPrice: item.unitPrice,
      discrepancy: null,
      discrepancyValue: null,
      status: 'pending',
      notes: ''
    })),
    totalItems: 8,
    countedItems: 0,
    flaggedItems: 0,
    totalDiscrepancy: 0,
    notes: ''
  }
]

export default function AuditsPage() {
  const { selectedRestaurant, t, createAudit, deleteAudit, setSelectedInventoryId } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedInventory, setSelectedInventory] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteWord, setDeleteWord] = useState('')
  const [deleteAuditIdInput, setDeleteAuditIdInput] = useState('')
  const inventoryTypes = useMemo<InventoryType[]>(() => selectedRestaurant.inventoryTypes.map((type) => ({
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
  })), [selectedRestaurant])
  const audits = useMemo<Audit[]>(() => {
    return selectedRestaurant.audits.map((audit) => {
      const inventory = inventoryTypes.find((type) => type.id === audit.inventoryId)
      const mappedItems = audit.items?.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        category: item.category,
        expectedQuantity: item.previousStock,
        availableQuantity: item.previousStock,
        countedQuantity: item.currentStock,
        countedAvailable: item.currentStock,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discrepancy: item.difference,
        discrepancyValue: item.difference === null ? null : item.difference * item.unitPrice,
        status: item.result === 'pending' ? 'pending' as const : item.result === 'discrepancy' ? 'flagged' as const : 'counted' as const,
        notes: item.notes,
      })) ?? (inventory?.items ?? []).map((item) => ({
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        expectedQuantity: item.availableQuantity,
        availableQuantity: item.availableQuantity,
        countedQuantity: audit.status === 'completed' ? item.availableQuantity : null,
        countedAvailable: audit.status === 'completed' ? item.availableQuantity : null,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discrepancy: audit.status === 'completed' ? 0 : null,
        discrepancyValue: audit.status === 'completed' ? 0 : null,
        status: audit.status === 'completed' ? 'counted' as const : 'pending' as const,
        notes: '',
      }))
      const countedItems = mappedItems.filter((item) => item.status !== 'pending').length

      return {
        ...audit,
        items: mappedItems,
        totalItems: mappedItems.length,
        countedItems,
        status: audit.status === 'completed' ? 'completed' : countedItems > 0 ? 'in-progress' : audit.status,
      }
    })
  }, [selectedRestaurant, inventoryTypes])

  React.useEffect(() => {
    setSelectedInventory('all')
    setSelectedStatus('all')
    setSearchTerm('')
  }, [selectedRestaurant.id])

  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      const matchesSearch = audit.inventoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          audit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          audit.auditor.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || audit.status === selectedStatus
      const matchesInventory = selectedInventory === 'all' || audit.inventoryId.toString() === selectedInventory
      return matchesSearch && matchesStatus && matchesInventory
    })
  }, [searchTerm, selectedStatus, selectedInventory, audits])

  const handleCreateAudit = (newAuditData: { inventoryId: number; auditor: string; notes: string; auditDate: string }) => {
    createAudit(newAuditData)
    setIsCreateModalOpen(false)
  }

  const handleUpdateAudit = (id: string, updatedData: Partial<Audit>) => {
    console.log('Audit updates are handled from the audit detail screen:', id, updatedData)
  }

  const handleDeleteAudit = (id: string) => {
    setDeleteTargetId(id)
    setDeleteWord('')
    setDeleteAuditIdInput('')
  }

  const confirmDeleteAudit = () => {
    if (!deleteTargetId || deleteWord !== 'delete' || deleteAuditIdInput !== deleteTargetId) return
    deleteAudit(deleteTargetId)
    setDeleteTargetId(null)
    setDeleteWord('')
    setDeleteAuditIdInput('')
  }

  const stats = {
    total: audits.length,
    completed: audits.filter(a => a.status === 'completed').length,
    inProgress: audits.filter(a => a.status === 'in-progress').length,
    notStarted: audits.filter(a => a.status === 'not-started').length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="p-4 space-y-6 sm:p-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('inventoryAudits')}</h1>
              <p className="text-muted-foreground mt-1">{t('auditsSubtitle')} {selectedRestaurant.name}</p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 sm:w-auto"
            >
              <Plus size={20} />
              {t('newAudit')}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <ClipboardList size={16} />
                  {t('totalAudits')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('allTime')}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle size={16} className="text-accent" />
                  {t('completed')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-accent">{stats.completed}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% complete rate</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  {t('inProgress')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('activeAudits')}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle size={16} />
                  {t('notStarted')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-muted-foreground">{stats.notStarted}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('awaitingAction')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Type Quick View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryTypes.map(inv => (
              <Link key={inv.id} href={`/audits?inventory=${inv.id}`} onClick={() => {
                setSelectedInventory(inv.id.toString())
                setSelectedInventoryId(inv.id)
              }}>
              <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: inv.color }} />
                      <div>
                        <p className="font-semibold text-foreground">{inv.name}</p>
                        <p className="text-xs text-muted-foreground">{inv.items.length} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {audits.filter(a => a.inventoryId === inv.id).length} audits
                      </p>
                      <p className="text-xs text-accent">
                        {audits.filter(a => a.inventoryId === inv.id && a.status === 'completed').length} completed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>

          {/* Audits Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{t('auditList')}</CardTitle>
                  <CardDescription>{t('auditListSubtitle')}</CardDescription>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                  {filteredAudits.length} audits
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search by inventory, audit ID, or auditor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  <option value="all" className="bg-secondary">All Status</option>
                  <option value="completed" className="bg-secondary">Completed</option>
                  <option value="in-progress" className="bg-secondary">In Progress</option>
                  <option value="not-started" className="bg-secondary">Not Started</option>
                </select>

                {/* Inventory Filter */}
                <select
                  value={selectedInventory}
                  onChange={(e) => setSelectedInventory(e.target.value)}
                  className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  <option value="all" className="bg-secondary">All Inventories</option>
                  {inventoryTypes.map(inv => (
                    <option key={inv.id} value={inv.id.toString()} className="bg-secondary">{inv.name}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <AuditsTable 
                audits={filteredAudits}
                onUpdateAudit={handleUpdateAudit}
                onDeleteAudit={handleDeleteAudit}
              />
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Create Audit Modal */}
      <CreateAuditModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateAudit}
        inventoryTypes={inventoryTypes}
      />
      {deleteTargetId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <Trash2 size={20} className="text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{t('deleteAuditTitle')}</h2>
                  <p className="text-sm text-muted-foreground">{deleteTargetId}</p>
                </div>
              </div>
              <button onClick={() => setDeleteTargetId(null)} className="text-muted-foreground hover:text-foreground">
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">{t('deleteAuditBody')}</p>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t('typeDelete')}</label>
                <input
                  value={deleteWord}
                  onChange={(event) => setDeleteWord(event.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t('typeAuditId')}</label>
                <input
                  value={deleteAuditIdInput}
                  onChange={(event) => setDeleteAuditIdInput(event.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-border p-6 sm:flex-row">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setDeleteTargetId(null)}>
                {t('cancel')}
              </Button>
              <Button
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteWord !== 'delete' || deleteAuditIdInput !== deleteTargetId}
                onClick={confirmDeleteAudit}
              >
                {t('deleteAudit')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
