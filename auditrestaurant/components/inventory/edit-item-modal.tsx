"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/components/app-context"

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
  priceCurrency?: "USD" | "CRC"
  phase?: "none" | "production" | "merma"
  mermaQuantity?: number
  productionQuantity?: number
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
  suppliers?: string[]
  onRegisterSupplier?: (supplier: string) => void
  onDeleteSupplier?: (supplier: string) => void
}

const units = ["boxes", "kg", "g", "L", "ml", "bundles", "pieces", "bottles", "lbs", "oz"]

const statusOptions = ["good", "low", "critical"]

export default function EditItemModal({
  isOpen,
  item,
  onClose,
  onSave,
  inventoryTypes,
  suppliers = [],
  onRegisterSupplier,
  onDeleteSupplier,
}: EditItemModalProps) {
  const { selectedRestaurant, exchangeRate, t } = useAppContext()
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "",
    quantity: "",
    unit: "",
    minStock: "",
    price: "",
    priceCurrency: "USD" as "USD" | "CRC",
    phase: "" as "" | "none" | "production" | "merma",
    mermaQuantity: "",
    productionQuantity: "",
    supplier: "",
    status: "",
    daysUntilExpiry: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [supplierToRegister, setSupplierToRegister] = useState("")
  const [shouldSaveSupplier, setShouldSaveSupplier] = useState(true)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        type: item.type,
        category: item.category,
        quantity: item.quantity.toString(),
        unit: item.unit,
        minStock: item.minStock.toString(),
        price: item.priceCurrency === "CRC" ? (item.price * exchangeRate).toFixed(0) : item.price.toString(),
        priceCurrency: item.priceCurrency ?? "USD",
        phase: item.phase ?? "",
        mermaQuantity: item.mermaQuantity?.toString() ?? "",
        productionQuantity: item.productionQuantity?.toString() ?? "",
        supplier: item.supplier,
        status: item.status,
        daysUntilExpiry: item.daysUntilExpiry?.toString() || "",
      })
      setErrors({})
    }
  }, [item, exchangeRate])

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
      price: formData.priceCurrency === "CRC" ? Number.parseFloat(formData.price) / exchangeRate : Number.parseFloat(formData.price),
      priceCurrency: formData.priceCurrency,
      phase: formData.phase || undefined,
      mermaQuantity: formData.phase === "merma" ? Number.parseFloat(formData.mermaQuantity) || 0 : undefined,
      productionQuantity: formData.phase === "production" ? Number.parseFloat(formData.productionQuantity) || 0 : undefined,
      supplier: formData.supplier,
      status,
      daysUntilExpiry: formData.daysUntilExpiry ? Number.parseInt(formData.daysUntilExpiry) : null,
      lastUpdated: new Date().toISOString().split("T")[0],
    })
    onClose()
  }

  const handleRegisterSupplier = () => {
    const supplier = supplierToRegister.trim()
    if (!supplier) return
    setFormData((prev) => ({ ...prev, supplier }))
    if (shouldSaveSupplier && onRegisterSupplier) {
      onRegisterSupplier(supplier)
    }
    setSupplierToRegister("")
    setShouldSaveSupplier(true)
    setShowSupplierForm(false)
  }

  const handleRegisterSupplierKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return
    event.preventDefault()
    handleRegisterSupplier()
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="auditflow-thin-scrollbar bg-card border border-border rounded-xl w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-lg max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border sticky top-0 z-10 bg-card">
          <div>
            <h2 className="text-xl font-bold text-foreground">Edit Item</h2>
            <p className="text-sm text-muted-foreground">Update item information</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 sm:p-6">
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
              <label className="block text-sm font-medium text-foreground mb-1">{t("category")}</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                {Array.from(new Set([
                  ...(
                    Array.isArray(selectedRestaurant.itemCategories)
                      ? selectedRestaurant.itemCategories
                      : selectedRestaurant.itemCategories?.[inventoryTypes.find((type) => type.name === item.type)?.id ?? 0] ?? []
                  ),
                  item.category,
                ])).map((c) => (
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("pricePerUnit")} *</label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
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
                <select name="priceCurrency" value={formData.priceCurrency} onChange={handleChange} className="rounded-lg border border-border bg-secondary/30 px-2 py-2 text-sm text-foreground focus:outline-none focus:border-accent">
                  <option value="USD">USD</option>
                  <option value="CRC">CRC</option>
                </select>
              </div>
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("itemPhase")}</label>
              <select name="phase" value={formData.phase} onChange={handleChange} className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer">
                <option value="">-</option>
                <option value="none">{t("noProductionStock")}</option>
                <option value="production">{t("productionStock")}</option>
                <option value="merma">{t("mermaStock")}</option>
              </select>
            </div>
          </div>

          {formData.phase === "merma" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("mermaQuantity")}</label>
              <input
                type="number"
                name="mermaQuantity"
                value={formData.mermaQuantity}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          )}

          {formData.phase === "production" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("productionQuantity")}</label>
              <input
                type="number"
                name="productionQuantity"
                value={formData.productionQuantity}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          )}

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("supplier")}</label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                type="text"
                name="supplier"
                list="edit-registered-suppliers"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
              <Button
                type="button"
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  setSupplierToRegister(formData.supplier)
                  setShowSupplierForm((current) => !current)
                }}
              >
                {t("registerSupplier")}
              </Button>
            </div>
            <datalist id="edit-registered-suppliers">
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier} />
              ))}
            </datalist>
            {suppliers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {suppliers.map((supplier) => (
                  <span key={supplier} className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/20 px-3 py-1 text-xs text-muted-foreground">
                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, supplier }))} className="hover:text-foreground">
                      {supplier}
                    </button>
                    {onDeleteSupplier && (
                      <button type="button" onClick={() => onDeleteSupplier(supplier)} className="text-destructive hover:text-destructive/80" aria-label={t("deleteProvider")}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
            {showSupplierForm && (
              <div className="mt-3 rounded-lg border border-border bg-secondary/20 p-3 space-y-3">
                <label className="block text-xs font-medium text-muted-foreground">{t("supplierName")}</label>
                <input
                  value={supplierToRegister}
                  onChange={(event) => setSupplierToRegister(event.target.value)}
                  onKeyDown={handleRegisterSupplierKeyDown}
                  className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={shouldSaveSupplier}
                    onChange={(event) => setShouldSaveSupplier(event.target.checked)}
                    className="h-4 w-4 accent-current"
                  />
                  {shouldSaveSupplier ? t("saveSupplier") : t("dontSaveSupplier")}
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setShowSupplierForm(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="button" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleRegisterSupplier}>
                    {t("useSupplier")}
                  </Button>
                </div>
              </div>
            )}
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
