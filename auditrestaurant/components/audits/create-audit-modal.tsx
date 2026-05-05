'use client'

import React, { useEffect, useState } from 'react'
import { X, Package, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/components/app-context'

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
  onCreate: (audit: { inventoryId: number; auditor: string; notes: string; auditDate: string }) => void
  inventoryTypes: InventoryType[]
}

const auditors = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson', 'David Brown']

export default function CreateAuditModal({ isOpen, onClose, onCreate, inventoryTypes }: CreateAuditModalProps) {
  const { selectedInventoryId, t } = useAppContext()
  const [formData, setFormData] = useState({
    inventoryId: selectedInventoryId || inventoryTypes[0]?.id || 0,
    auditor: '',
    notes: '',
    auditDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (!isOpen) return
    setFormData((prev) => ({
      ...prev,
      inventoryId: selectedInventoryId || inventoryTypes[0]?.id || 0,
      auditDate: new Date().toISOString().split('T')[0],
    }))
  }, [isOpen, selectedInventoryId, inventoryTypes])

  const selectedInventory = inventoryTypes.find(inv => inv.id === formData.inventoryId)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'inventoryId' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = () => {
    if (!formData.inventoryId || !formData.auditor || !formData.auditDate) return
    onCreate(formData)
    setFormData({
      inventoryId: selectedInventoryId || inventoryTypes[0]?.id || 0,
      auditor: '',
      notes: '',
      auditDate: new Date().toISOString().split('T')[0],
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold text-foreground">{t('createNewAudit')}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('selectInventory')} *</label>
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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${inv.color}20` }}>
                      <Package size={20} style={{ color: inv.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{inv.name}</p>
                      <p className="text-xs text-muted-foreground">{inv.items.length} items</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.inventoryId === inv.id ? 'border-primary' : 'border-border'}`}>
                    {formData.inventoryId === inv.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedInventory && (
            <div className="p-4 bg-secondary/30 border border-border rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">{t('items')}</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedInventory.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-muted-foreground">{item.availableQuantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('auditor')} *</label>
              <select name="auditor" value={formData.auditor} onChange={handleChange} className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer" required>
                <option value="" className="bg-secondary">Select...</option>
                {auditors.map(a => <option key={a} value={a} className="bg-secondary">{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('auditDate')} *</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                <input type="date" name="auditDate" value={formData.auditDate} onChange={handleChange} className="w-full pl-10 pr-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('notes')}</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-transparent">{t('cancel')}</Button>
            <Button type="button" onClick={handleSubmit} disabled={!formData.inventoryId || !formData.auditor || !formData.auditDate} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">{t('createAudit')}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
