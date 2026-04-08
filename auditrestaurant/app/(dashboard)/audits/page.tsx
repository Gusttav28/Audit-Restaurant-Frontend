'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import AuditsTable from '@/components/audits/audits-table'
import CreateAuditModal from '@/components/audits/create-audit-modal'
import { Plus, Search, ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedInventory, setSelectedInventory] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [audits, setAudits] = useState<Audit[]>(initialAudits)
  const [inventoryTypes, setInventoryTypes] = useState<InventoryType[]>(sampleInventoryTypes)

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

  const handleCreateAudit = (newAuditData: { inventoryId: number; auditor: string; notes: string }) => {
    const selectedInventory = inventoryTypes.find(inv => inv.id === newAuditData.inventoryId)
    if (!selectedInventory) return

    const audit: Audit = {
      id: `AUD-${String(audits.length + 1).padStart(4, '0')}`,
      inventoryId: selectedInventory.id,
      inventoryName: selectedInventory.name,
      inventoryColor: selectedInventory.color,
      auditor: newAuditData.auditor,
      createdDate: new Date().toISOString().split('T')[0],
      startedDate: null,
      completedDate: null,
      status: 'not-started',
      items: selectedInventory.items.map(item => ({
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
      totalItems: selectedInventory.items.length,
      countedItems: 0,
      flaggedItems: 0,
      totalDiscrepancy: 0,
      notes: newAuditData.notes
    }
    setAudits([audit, ...audits])
    setIsCreateModalOpen(false)
  }

  const handleUpdateAudit = (id: string, updatedData: Partial<Audit>) => {
    setAudits(audits.map(audit => audit.id === id ? { ...audit, ...updatedData } : audit))
  }

  const handleDeleteAudit = (id: string) => {
    setAudits(audits.filter(audit => audit.id !== id))
  }

  const handleAddInventoryType = (newType: { name: string; color: string }) => {
    const newInventory: InventoryType = {
      id: inventoryTypes.length + 1,
      name: newType.name,
      color: newType.color,
      items: []
    }
    setInventoryTypes([...inventoryTypes, newInventory])
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
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventory Audits</h1>
              <p className="text-muted-foreground mt-1">Create and manage audits for your inventories</p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus size={20} />
              New Audit
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <ClipboardList size={16} />
                  Total Audits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle size={16} className="text-accent" />
                  Completed
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
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground mt-1">Active audits</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle size={16} />
                  Not Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-muted-foreground">{stats.notStarted}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Type Quick View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryTypes.map(inv => (
              <Card key={inv.id} className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
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
            ))}
          </div>

          {/* Audits Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Audit List</CardTitle>
                  <CardDescription>View and manage your inventory audits</CardDescription>
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
        onAddInventoryType={handleAddInventoryType}
      />
    </div>
  )
}
