"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InventoryItem {
  id: number
  name: string
  type: string
  category: string
  quantity: number
  unit: string
  minStock: number
  status: string
  price: number
  lastUpdated: string
  supplier: string
  daysUntilExpiry: number | null
}

interface EditItemModalProps {
  isOpen: boolean
  item: InventoryItem | null
  onClose: () => void
  onSave: (id: number, data: Partial<InventoryItem>) => void
  inventoryTypes: Array<{ id: number; name: string; color: string; active: boolean }>
}

const categories = [
  "Oils & Vinegars",
  "Herbs & Spices",
  "Grains & Pasta",
  "Dairy",
  "Produce",
  "Meat",
  "Spirits",
  "Mixers",
  "Garnishes",
  "Wine",
  "Beer",
]

const units = ["boxes", "kg", "g", "L", "ml", "bundles", "pieces", "bottles", "lbs", "oz"]

const statusOptions = ["good", "low", "critical"]

export default function EditItemModal({ isOpen, item, onClose, onSave, inventoryTypes }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "",
    quantity: "",
    unit: "",
    minStock: "",
    price: "",
    supplier: "",
    status: "",
    daysUntilExpiry: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        type: item.type,
        category: item.category,
        quantity: item.quantity.toString(),
        unit: item.unit,
        minStock: item.minStock.toString(),
        price: item.price.toString(),
        supplier: item.supplier,
        status: item.status,
        daysUntilExpiry: item.daysUntilExpiry?.toString() || "",
      })
      setErrors({})
    }
  }, [item])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.quantity || Number(formData.quantity) < 0) newErrors.quantity = "Valid quantity required"
    if (!formData.minStock || Number(formData.minStock) < 0) newErrors.minStock = "Valid min stock required"
    if (!formData.price || Number(formData.price) < 0) newErrors.price = "Valid price required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || !validateForm()) return

    const quantity = Number.parseFloat(formData.quantity)
    const minStock = Number.parseFloat(formData.minStock)
    
    let status = formData.status
    if (quantity <= 0) {
      status = "critical"
    } else if (quantity <= minStock) {
      status = "low"
    } else if (status === "critical" || status === "low") {
      status = "good"
    }

    onSave(item.id, {
      name: formData.name,
      type: formData.type,
      category: formData.category,
      quantity,
      unit: formData.unit,
      minStock,
      price: Number.parseFloat(formData.price),
      supplier: formData.supplier,
      status,
      daysUntilExpiry: formData.daysUntilExpiry ? Number.parseInt(formData.daysUntilExpiry) : null,
      lastUpdated: new Date().toISOString().split("T")[0],
    })
    onClose()
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-card">
          <div>
            <h2 className="text-xl font-bold text-foreground">Edit Item</h2>
            <p className="text-sm text-muted-foreground">Update item information</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Item Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-secondary/30 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent ${
                errors.name ? "border-destructive" : "border-border"
              }`}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Inventory Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                {inventoryTypes.map((t) => (
                  <option key={t.id} value={t.name} className="bg-secondary">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-secondary">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 bg-secondary/30 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent ${
                  errors.quantity ? "border-destructive" : "border-border"
                }`}
              />
              {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u} value={u} className="bg-secondary">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Min Stock & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Min Stock *</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 bg-secondary/30 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent ${
                  errors.minStock ? "border-destructive" : "border-border"
                }`}
              />
              {errors.minStock && <p className="text-xs text-destructive mt-1">{errors.minStock}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s} className="bg-secondary">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 bg-secondary/30 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent ${
                  errors.price ? "border-destructive" : "border-border"
                }`}
              />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Days Until Expiry</label>
              <input
                type="number"
                name="daysUntilExpiry"
                value={formData.daysUntilExpiry}
                onChange={handleChange}
                min="0"
                placeholder="No expiry"
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Supplier</label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
