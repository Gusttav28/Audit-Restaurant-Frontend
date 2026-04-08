'use client'

import React, { useState } from 'react'
import { X, Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InventoryType {
  id: number
  name: string
  color: string
  items: Array<{
    id: number
    name: string
    category: string
    expectedQuantity: number
    availableQuantity: number
    unit: string
    unitPrice: number
  }>
}

interface CreateAuditModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (audit: { inventoryId: number; auditor: string; notes: string }) => void
  inventoryTypes: InventoryType[]
  onAddInventoryType: (type: { name: string; color: string }) => void
}

const auditors = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson', 'David Brown']

const colorOptions = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
]

export default function CreateAuditModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  inventoryTypes,
  onAddInventoryType 
}: CreateAuditModalProps) {
  const [formData, setFormData] = useState({
    inventoryId: inventoryTypes[0]?.id || 0,
    auditor: '',
    notes: '',
  })
  const [showAddInventory, setShowAddInventory] = useState(false)
  const [newInventory, setNewInventory] = useState({ name: '', color: '#3b82f6' })

  const selectedInventory = inventoryTypes.find(inv => inv.id === formData.inventoryId)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'inventoryId' ? parseInt(value) : value 
    }))
  }

  const handleAddInventory = () => {
    if (newInventory.name.trim()) {
      onAddInventoryType(newInventory)
      setNewInventory({ name: '', color: '#3b82f6' })
      setShowAddInventory(false)
    }
  }

  const handleSubmit = () => {
    if (formData.inventoryId && formData.auditor) {
      onCreate(formData)
      setFormData({
        inventoryId: inventoryTypes[0]?.id || 0,
        auditor: '',
        notes: '',
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold text-foreground">Create New Audit</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form className="p-6 space-y-5">
          {/* Select Inventory */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-foreground">Select Inventory *</label>
              <button
                type="button"
                onClick={() => setShowAddInventory(!showAddInventory)}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <Plus size={14} />
                Add New Inventory
              </button>
            </div>
            
            {/* Inventory Cards */}
            <div className="grid grid-cols-1 gap-3">
              {inventoryTypes.map(inv => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, inventoryId: inv.id }))}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all text-left ${
                    formData.inventoryId === inv.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-secondary/20 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${inv.color}20` }}
                    >
                      <Package size={20} style={{ color: inv.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{inv.name}</p>
                      <p className="text-xs text-muted-foreground">{inv.items.length} items to audit</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.inventoryId === inv.id ? 'border-primary' : 'border-border'
                  }`}>
                    {formData.inventoryId === inv.id && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Add New Inventory Form */}
            {showAddInventory && (
              <div className="mt-3 p-4 bg-secondary/30 border border-border rounded-lg space-y-3">
                <p className="text-sm font-medium text-foreground">Create New Inventory Type</p>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Inventory Name</label>
                  <input
                    type="text"
                    value={newInventory.name}
                    onChange={(e) => setNewInventory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Cold Storage, Dry Goods..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Color</label>
                  <div className="flex gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewInventory(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          newInventory.color === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-card ring-primary' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddInventory(false)}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddInventory}
                    disabled={!newInventory.name.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Add Inventory
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Selected Inventory Preview */}
          {selectedInventory && (
            <div className="p-4 bg-secondary/30 border border-border rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">Items to be Audited</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedInventory.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.expectedQuantity} / {item.availableQuantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
              {selectedInventory.items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">No items in this inventory yet</p>
              )}
            </div>
          )}

          {/* Auditor */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Auditor *</label>
            <select
              name="auditor"
              value={formData.auditor}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
              required
            >
              <option value="" className="bg-secondary">Select an auditor...</option>
              {auditors.map(a => (
                <option key={a} value={a} className="bg-secondary">{a}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this audit..."
              rows={3}
              className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Status Info */}
          <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Audit will be created with status <span className="font-medium text-foreground">Not Started</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.inventoryId || !formData.auditor}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Create Audit
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
