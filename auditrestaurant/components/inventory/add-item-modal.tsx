"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { X, Plus, ChevronDown, ChevronUp, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/components/app-context"

interface CustomUnit {
  id: number
  name: string
  abbreviation: string
  baseUnit: string
  conversionFactor: number
  category: "weight" | "volume" | "quantity" | "custom"
}

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: any) => void
  inventoryTypes: Array<{ id: number; name: string; color: string; active: boolean }>
  customUnits?: CustomUnit[]
  onAddUnit?: (unit: Omit<CustomUnit, "id">) => void
  onDeleteUnit?: (id: number) => void
  selectedTypeName?: string
  lockInventoryType?: boolean
  suppliers?: string[]
  onRegisterSupplier?: (supplier: string) => void
}

const defaultUnits = [
  { name: "Boxes", value: "boxes", category: "quantity" },
  { name: "Kilograms", value: "kg", category: "weight" },
  { name: "Grams", value: "g", category: "weight" },
  { name: "Liters", value: "L", category: "volume" },
  { name: "Milliliters", value: "ml", category: "volume" },
  { name: "Bundles", value: "bundles", category: "quantity" },
  { name: "Pieces", value: "pieces", category: "quantity" },
  { name: "Bottles", value: "bottles", category: "quantity" },
  { name: "Pounds", value: "lbs", category: "weight" },
  { name: "Ounces", value: "oz", category: "weight" },
]

const baseUnitOptions = [
  { label: "Grams (g)", value: "g", category: "weight" },
  { label: "Kilograms (kg)", value: "kg", category: "weight" },
  { label: "Milliliters (ml)", value: "ml", category: "volume" },
  { label: "Liters (L)", value: "L", category: "volume" },
  { label: "Pieces", value: "pieces", category: "quantity" },
]



export default function AddItemModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  inventoryTypes,
  customUnits = [],
  onAddUnit,
  onDeleteUnit,
  selectedTypeName,
  lockInventoryType = false,
  suppliers = [],
  onRegisterSupplier,
}: AddItemModalProps) {
  const { selectedRestaurant, t } = useAppContext()
  const [formData, setFormData] = useState({
    name: "",
    type: selectedTypeName || inventoryTypes[0]?.name || "Kitchen",
    category: "Herbs & Spices",
    quantity: "",
    unit: "boxes",
    minStock: "",
    price: "",
    supplier: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [supplierToRegister, setSupplierToRegister] = useState("")
  const [shouldSaveSupplier, setShouldSaveSupplier] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    setFormData((prev) => ({
      ...prev,
      type: selectedTypeName || inventoryTypes[0]?.name || "Kitchen",
    }))
  }, [isOpen, inventoryTypes, selectedTypeName])


  const [showCustomUnitForm, setShowCustomUnitForm] = useState(false)
  const [showUnitManager, setShowUnitManager] = useState(false)
  const [newUnit, setNewUnit] = useState({
    name: "",
    abbreviation: "",
    baseUnit: "g",
    conversionFactor: 1,
    category: "weight" as "weight" | "volume" | "quantity" | "custom",
  })

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
  ]
  
  const allUnits = [
    ...defaultUnits,
    ...customUnits.map(u => ({ name: u.name, value: u.abbreviation, category: u.category }))
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewUnitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "baseUnit") {
      const selectedBase = baseUnitOptions.find(b => b.value === value)
      setNewUnit((prev) => ({ 
        ...prev, 
        [name]: value,
        category: selectedBase?.category as "weight" | "volume" | "quantity" | "custom" || "custom"
      }))
    } else {
      setNewUnit((prev) => ({ ...prev, [name]: name === "conversionFactor" ? Number(value) : value }))
    }
  }

  const handleAddCustomUnit = () => {
    if (newUnit.name && newUnit.abbreviation && onAddUnit) {
      onAddUnit(newUnit)
      setNewUnit({
        name: "",
        abbreviation: "",
        baseUnit: "g",
        conversionFactor: 1,
        category: "weight",
      })
      setShowCustomUnitForm(false)
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.quantity && formData.minStock && formData.price) {
      const selectedCustomUnit = customUnits.find(u => u.abbreviation === formData.unit)
      setIsSaving(true)
      window.setTimeout(() => {
        onAdd({
          ...formData,
          quantity: Number.parseFloat(formData.quantity),
          minStock: Number.parseFloat(formData.minStock),
          price: Number.parseFloat(formData.price),
          status: "good",
          lastUpdated: new Date().toISOString().split("T")[0],
          daysUntilExpiry: null,
          unitDetails: selectedCustomUnit || null,
        })
        setFormData({
          name: "",
          type: selectedTypeName || inventoryTypes[0]?.name || "Kitchen",
          category: "Herbs & Spices",
          quantity: "",
          unit: "boxes",
          minStock: "",
          price: "",
          supplier: "",
        })
        setShowSupplierForm(false)
        setSupplierToRegister("")
        setShouldSaveSupplier(true)
        setIsSaving(false)
      }, 250)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">{t("addNewItem")}</h2>
            <p className="text-xs text-muted-foreground">{t("currentRestaurant")}: {selectedRestaurant.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("selectInventory")} *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={lockInventoryType}
              className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
            >
              {inventoryTypes.map((type) => (
                <option key={type.id} value={type.name} className="bg-secondary">
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Name */}
          <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("itemName")} *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Olive Oil"
              className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("category")} *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-secondary">
                  {cat}
                </option>
              ))}
            </select>
          </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("quantity")} *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                step="0.1"
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-foreground">{t("unit")} *</label>
                <button
                  type="button"
                  onClick={() => setShowUnitManager(!showUnitManager)}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  {t("manageUnits")}
                  {showUnitManager ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                <optgroup label="Standard Units">
                  {defaultUnits.map((u) => (
                    <option key={u.value} value={u.value} className="bg-secondary">
                      {u.name} ({u.value})
                    </option>
                  ))}
                </optgroup>
                {customUnits.length > 0 && (
                  <optgroup label="Custom Units">
                    {customUnits.map((u) => (
                      <option key={u.id} value={u.abbreviation} className="bg-secondary">
                        {u.name} ({u.abbreviation}) - 1 = {u.conversionFactor} {u.baseUnit}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              
              {/* Unit Manager Panel */}
              {showUnitManager && (
                <div className="mt-3 p-3 bg-secondary/20 border border-border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Custom Units</span>
                    <button
                      type="button"
                      onClick={() => setShowCustomUnitForm(!showCustomUnitForm)}
                      className="text-xs bg-primary/20 text-primary px-2 py-1 rounded flex items-center gap-1 hover:bg-primary/30 transition-colors"
                    >
                      <Plus size={12} />
                      Add New
                    </button>
                  </div>
                  
                  {/* Add Custom Unit Form */}
                  {showCustomUnitForm && (
                    <div className="p-3 bg-background border border-border rounded-lg space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Create a custom unit with conversion specifications for precise audit calculations.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Unit Name</label>
                          <input
                            type="text"
                            name="name"
                            value={newUnit.name}
                            onChange={handleNewUnitChange}
                            placeholder="e.g., Case"
                            className="w-full px-2 py-1.5 text-sm bg-secondary/30 border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Abbreviation</label>
                          <input
                            type="text"
                            name="abbreviation"
                            value={newUnit.abbreviation}
                            onChange={handleNewUnitChange}
                            placeholder="e.g., cs"
                            className="w-full px-2 py-1.5 text-sm bg-secondary/30 border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Base Unit</label>
                          <select
                            name="baseUnit"
                            value={newUnit.baseUnit}
                            onChange={handleNewUnitChange}
                            className="w-full px-2 py-1.5 text-sm bg-secondary/30 border border-border rounded text-foreground focus:outline-none focus:border-accent cursor-pointer"
                          >
                            {baseUnitOptions.map((base) => (
                              <option key={base.value} value={base.value} className="bg-secondary">
                                {base.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Conversion Factor</label>
                          <input
                            type="number"
                            name="conversionFactor"
                            value={newUnit.conversionFactor}
                            onChange={handleNewUnitChange}
                            placeholder="1"
                            step="0.01"
                            className="w-full px-2 py-1.5 text-sm bg-secondary/30 border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground bg-accent/10 p-2 rounded">
                        1 {newUnit.abbreviation || "[abbr]"} = {newUnit.conversionFactor} {newUnit.baseUnit}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => setShowCustomUnitForm(false)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs bg-transparent"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAddCustomUnit}
                          size="sm"
                          className="flex-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={!newUnit.name || !newUnit.abbreviation}
                        >
                          Add Unit
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* List of Custom Units */}
                  {customUnits.length > 0 ? (
                    <div className="space-y-2">
                      {customUnits.map((unit) => (
                        <div
                          key={unit.id}
                          className="flex justify-between items-center p-2 bg-background border border-border rounded text-sm"
                        >
                          <div>
                            <span className="font-medium text-foreground">{unit.name}</span>
                            <span className="text-muted-foreground ml-2">({unit.abbreviation})</span>
                            <p className="text-xs text-muted-foreground">
                              1 {unit.abbreviation} = {unit.conversionFactor} {unit.baseUnit}
                            </p>
                          </div>
                          {onDeleteUnit && (
                            <button
                              type="button"
                              onClick={() => onDeleteUnit(unit.id)}
                              className="text-destructive hover:text-destructive/80 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    !showCustomUnitForm && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No custom units yet. Add one to get started.
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Min Stock & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("minStock")} *</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                placeholder="0"
                step="0.1"
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("price")} *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                required
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("supplier")}</label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                type="text"
                name="supplier"
                list="registered-suppliers"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="e.g., Fresh Imports"
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
              <Button type="button" variant="outline" className="bg-transparent" onClick={() => {
                setSupplierToRegister(formData.supplier)
                setShowSupplierForm((current) => !current)
              }}>
                {t("registerSupplier")}
              </Button>
            </div>
            <datalist id="registered-suppliers">
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier} />
              ))}
            </datalist>
            {suppliers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {suppliers.map((supplier) => (
                  <button
                    type="button"
                    key={supplier}
                    onClick={() => setFormData((prev) => ({ ...prev, supplier }))}
                    className="rounded-full border border-border bg-secondary/20 px-3 py-1 text-xs text-muted-foreground hover:border-accent hover:text-foreground"
                  >
                    {supplier}
                  </button>
                ))}
              </div>
            )}
            {showSupplierForm && (
              <div className="mt-3 rounded-lg border border-border bg-secondary/20 p-3 space-y-3">
                <label className="block text-xs font-medium text-muted-foreground">{t("supplierName")}</label>
                <input
                  value={supplierToRegister}
                  onChange={(event) => setSupplierToRegister(event.target.value)}
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
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-transparent cursor-pointer">
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isSaving ? t("saving") : t("addItem")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
