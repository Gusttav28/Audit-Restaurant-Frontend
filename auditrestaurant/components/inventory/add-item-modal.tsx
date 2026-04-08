"use client"

import type React from "react"
import { useState } from "react"
import { X, Plus, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InventoryItem } from "@/app/(dashboard)/audits/page"

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
  onDeleteUnit
}: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: inventoryTypes[0]?.name || "Kitchen",
    category: "Herbs & Spices",
    quantity: "",
    unit: "boxes",
    minStock: "",
    price: "",
    supplier: "",
  })


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

  const units = allUnits.map(unit => unit.value);

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
  interface InventoryItem {
  id: number;
  item_name: string;
  item_category: string;
  item_quantity: number;
  item_unit: string;
}

  const [listt, setlistt] = useState([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.quantity && formData.minStock && formData.price) {
      const selectedCustomUnit = customUnits.find(u => u.abbreviation === formData.unit)
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
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}barinventory/`, {
          method:'POST',
          headers: {
            'Content-type':'application/json'
          },
          body: JSON.stringify({
            item_name:formData.name,
            item_category: formData.category,
            item_quantity:formData.quantity,
            item_unit:formData.unit,
            item_min_stock:formData.minStock,
            item_price:formData.price,
            item_supplier:formData.supplier
          }),
        });
        if (!response.ok) { 
          throw new Error("Something went wrong, please try again.");
          
        }
        window.alert("You item have been added")
        const result = await response.json();
        console.log(result)
      } catch (error) {
        console.log("There's an error: ", error)
      }
      setFormData({
        name: "",
        type: inventoryTypes[0]?.name || "Kitchen",
        category: "Herbs & Spices",
        quantity: "",
        unit: "boxes",
        minStock: "",
        price: "",
        supplier: "",
      })
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}barinventory/`)
        // const task = await response.json()
        const task: InventoryItem[] = await response.json()
        console.log(task.map(itemss => itemss))
        return task
      } catch (error) {
        console.log(error)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Add Inventory Item</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Inventory Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Item Name *</label>
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
            <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
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

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Quantity *</label>
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
                <label className="block text-sm font-medium text-foreground">Unit *</label>
                <button
                  type="button"
                  onClick={() => setShowUnitManager(!showUnitManager)}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  Manage Units
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
              <label className="block text-sm font-medium text-foreground mb-1">Min Stock *</label>
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
              <label className="block text-sm font-medium text-foreground mb-1">Price ($) *</label>
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
            <label className="block text-sm font-medium text-foreground mb-1">Supplier</label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="e.g., Fresh Imports"
              className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-transparent cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
              Add Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
