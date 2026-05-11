"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { X, Plus, ChevronDown, ChevronUp, Trash2, Loader2, Edit2 } from "lucide-react"
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
  onDeleteSupplier?: (supplier: string) => void
  categories?: string[]
  onAddCategory?: (category: string) => void
  onRenameCategory?: (oldCategory: string, nextCategory: string) => void
  onDeleteCategory?: (category: string) => void
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
  onDeleteSupplier,
  categories = [],
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: AddItemModalProps) {
  const { selectedRestaurant, exchangeRate, t } = useAppContext()
  const [formData, setFormData] = useState({
    name: "",
    type: selectedTypeName || inventoryTypes[0]?.name || "Kitchen",
    category: "",
    quantity: "",
    unit: "boxes",
    minStock: "",
    price: "",
    priceCurrency: "USD" as "USD" | "CRC",
    phase: "" as "" | "none" | "production" | "merma",
    mermaQuantity: "",
    productionQuantity: "",
    supplier: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [supplierToRegister, setSupplierToRegister] = useState("")
  const [shouldSaveSupplier, setShouldSaveSupplier] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryToCreate, setCategoryToCreate] = useState("")
  const [categoryEdits, setCategoryEdits] = useState<Record<string, string>>({})
  const [editingCategory, setEditingCategory] = useState("")

  useEffect(() => {
    if (!isOpen) return

    setFormData((prev) => ({
      ...prev,
      type: selectedTypeName || inventoryTypes[0]?.name || "Kitchen",
      priceCurrency: prev.name || prev.price ? prev.priceCurrency : selectedRestaurant.defaultCurrency ?? "USD",
    }))
  }, [isOpen, inventoryTypes, selectedRestaurant.defaultCurrency, selectedTypeName])


  const [showCustomUnitForm, setShowCustomUnitForm] = useState(false)
  const [showUnitManager, setShowUnitManager] = useState(false)
  const [newUnit, setNewUnit] = useState({
    name: "",
    abbreviation: "",
    baseUnit: "g",
    conversionFactor: 1,
    category: "weight" as "weight" | "volume" | "quantity" | "custom",
  })

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

  const handleRegisterSupplierKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return
    event.preventDefault()
    handleRegisterSupplier()
  }

  const handleAddCategory = () => {
    const category = categoryToCreate.trim()
    if (!category) return
    onAddCategory?.(category)
    setFormData((prev) => ({ ...prev, category }))
    setCategoryToCreate("")
    setShowCategoryForm(false)
  }

  const handleCategoryKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return
    event.preventDefault()
    handleAddCategory()
  }

  const handleRenameCategory = (category: string) => {
    onRenameCategory?.(category, categoryEdits[category] ?? category)
    setEditingCategory("")
  }

  const handleRenameCategoryKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, category: string) => {
    if (event.key !== "Enter") return
    event.preventDefault()
    handleRenameCategory(category)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.category && formData.quantity && formData.minStock && formData.price) {
      const selectedCustomUnit = customUnits.find(u => u.abbreviation === formData.unit)
      const price = Number.parseFloat(formData.price)
      setIsSaving(true)
      window.setTimeout(() => {
        onAdd({
          ...formData,
          quantity: Number.parseFloat(formData.quantity),
          minStock: Number.parseFloat(formData.minStock),
          price: formData.priceCurrency === "CRC" ? price / exchangeRate : price,
          priceCurrency: formData.priceCurrency,
          phase: formData.phase || undefined,
          mermaQuantity: formData.phase === "merma" || formData.phase === "production" ? Number.parseFloat(formData.mermaQuantity) || 0 : undefined,
          productionQuantity: formData.phase === "production" ? Number.parseFloat(formData.productionQuantity) || 0 : undefined,
          status: "good",
          lastUpdated: new Date().toISOString().split("T")[0],
          daysUntilExpiry: null,
          unitDetails: selectedCustomUnit || null,
        })
        setFormData({
          name: "",
          type: selectedTypeName || inventoryTypes[0]?.name || "Kitchen",
          category: "",
          quantity: "",
          unit: "boxes",
          minStock: "",
          price: "",
          priceCurrency: selectedRestaurant.defaultCurrency ?? "USD",
          phase: "",
          mermaQuantity: "",
          productionQuantity: "",
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[92vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("category")} *</label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="" className="bg-secondary">{categories.length ? t("category") : t("noCategories")}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-secondary">
                    {cat}
                  </option>
                ))}
              </select>
              <Button type="button" variant="outline" className="bg-transparent" onClick={() => setShowCategoryForm((open) => !open)}>
                {categories.length ? t("manageCategories") : t("createCategory")}
              </Button>
            </div>
            {showCategoryForm && (
              <div className="mt-3 rounded-lg border border-border bg-secondary/20 p-3 space-y-3">
                <label className="block text-xs font-medium text-muted-foreground">{t("categoryName")}</label>
                <input
                  value={categoryToCreate}
                  onChange={(event) => setCategoryToCreate(event.target.value)}
                  onKeyDown={handleCategoryKeyDown}
                  className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCategoryForm(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="button" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddCategory}>
                    {t("createCategory")}
                  </Button>
                </div>
                {categories.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <p className="text-xs font-medium text-muted-foreground">{t("manageCategories")}</p>
                    {categories.map((category) => (
                      <div key={category} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        {editingCategory === category ? (
                          <input
                            value={categoryEdits[category] ?? category}
                            onChange={(event) => setCategoryEdits((prev) => ({ ...prev, [category]: event.target.value }))}
                            onKeyDown={(event) => handleRenameCategoryKeyDown(event, category)}
                            className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                          />
                        ) : (
                          <span className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground">
                            {category}
                          </span>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 bg-transparent p-0 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                            onClick={() => {
                              if (editingCategory === category) {
                                handleRenameCategory(category)
                              } else {
                                setCategoryEdits((prev) => ({ ...prev, [category]: prev[category] ?? category }))
                                setEditingCategory(category)
                              }
                            }}
                            title={editingCategory === category ? t("save") : t("edit")}
                            aria-label={editingCategory === category ? t("save") : t("edit")}
                          >
                            <Edit2 size={14} />
                          </Button>
                          {onDeleteCategory && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 bg-transparent p-0 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive/40"
                              onClick={() => onDeleteCategory(category)}
                              title={t("deleteCategory")}
                              aria-label={t("deleteCategory")}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                          onClick={() => {
                            setNewUnit({
                              name: "",
                              abbreviation: "",
                              baseUnit: "g",
                              conversionFactor: 1,
                              category: "weight",
                            })
                            setShowCustomUnitForm(false)
                          }}
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
              <label className="block text-sm font-medium text-foreground mb-1">{t("pricePerUnit")} *</label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
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
                <select
                  name="priceCurrency"
                  value={formData.priceCurrency}
                  onChange={handleChange}
                  className="rounded-lg border border-border bg-secondary/30 px-2 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="USD">USD</option>
                  <option value="CRC">CRC</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("itemPhase")}</label>
            <select
              name="phase"
              value={formData.phase}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="" className="bg-secondary">-</option>
              <option value="none" className="bg-secondary">{t("noProductionStock")}</option>
              <option value="production" className="bg-secondary">{t("productionStock")}</option>
              <option value="merma" className="bg-secondary">{t("mermaStock")}</option>
            </select>
          </div>

          {(formData.phase === "merma" || formData.phase === "production") && (
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
