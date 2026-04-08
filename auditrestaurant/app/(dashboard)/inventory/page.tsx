"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"
import InventoryTable from "@/components/inventory/inventory-table"
import InventoryFilters from "@/components/inventory/inventory-filters"
import AddItemModal from "@/components/inventory/add-item-modal"
import EditItemModal from "@/components/inventory/edit-item-modal"
import ManageTypesModal from "@/components/inventory/manage-types-modal"
import { Plus, Settings } from "lucide-react"

interface CustomUnit {
  id: number
  name: string
  abbreviation: string
  baseUnit: string
  conversionFactor: number
  category: "weight" | "volume" | "quantity" | "custom"
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<typeof initialInventoryItems[0] | null>(null)
  const [items, setItems] = useState(initialInventoryItems)
  const [testDBItems, settestDBItems] = useState()
  const [inventoryTypes, setInventoryTypes] = useState([
    { id: 1, name: "Kitchen", color: "#3b82f6", active: true },
    { id: 2, name: "Bar", color: "#8b5cf6", active: true },
  ])
  const [customUnits, setCustomUnits] = useState<CustomUnit[]>([
    { id: 1, name: "Case", abbreviation: "cs", baseUnit: "pieces", conversionFactor: 24, category: "quantity" },
    { id: 2, name: "Carton", abbreviation: "ctn", baseUnit: "kg", conversionFactor: 10, category: "weight" },
  ])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
      const matchesType = selectedType === "all" || item.type === selectedType
      return matchesSearch && matchesCategory && matchesStatus && matchesType
    })
  }, [searchTerm, selectedCategory, selectedStatus, selectedType, items])

  const handleAddItem = (newItem: any) => {
    setItems([...items, { ...newItem, id: items.length + 1 }])
    setIsModalOpen(false)
  }

  const handleUpdateItem = (id: number, updatedData: any) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updatedData } : item)))
  }

  const handleEditItem = (item: typeof initialInventoryItems[0]) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = (id: number, data: Partial<typeof initialInventoryItems[0]>) => {
    handleUpdateItem(id, data)
    setIsEditModalOpen(false)
    setEditingItem(null)
  }

  const handleDeleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleAddType = (newType: { name: string; color: string }) => {
    setInventoryTypes([...inventoryTypes, { ...newType, id: inventoryTypes.length + 1, active: true }])
  }

  const handleUpdateType = (id: number, updatedData: any) => {
    setInventoryTypes(inventoryTypes.map((type) => (type.id === id ? { ...type, ...updatedData } : type)))
  }

  const handleDeleteType = (id: number) => {
    setInventoryTypes(inventoryTypes.filter((type) => type.id !== id))
    setItems(items.filter((item) => item.type !== inventoryTypes.find((t) => t.id === id)?.name))
  }

  const handleAddUnit = (newUnit: Omit<CustomUnit, "id">) => {
    setCustomUnits([...customUnits, { ...newUnit, id: customUnits.length + 1 }])
  }

  const handleDeleteUnit = (id: number) => {
    setCustomUnits(customUnits.filter((unit) => unit.id !== id))
  }

  const activeTypes = inventoryTypes.filter((t) => t.active)
  const typeStats = activeTypes.map((type) => ({
    name: type.name,
    color: type.color,
    count: items.filter((i) => i.type === type.name).length,
    lowStock: items.filter((i) => i.type === type.name && i.status === "low").length,
  }))

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
              <p className="text-muted-foreground mt-1">Track and manage all restaurant inventory items</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsTypesModalOpen(true)} variant="outline" className="gap-2">
                <Settings size={20} />
                Manage Types
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Plus size={20} />
                Add Item
              </Button>
            </div>
          </div>

          {/* Inventory Type Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {typeStats.map((stat) => (
              <Card key={stat.name} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                    <CardTitle className="text-sm text-muted-foreground">{stat.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                  <p className="text-xs text-destructive mt-1">{stat.lowStock} low stock</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{items.length}</p>
                <p className="text-xs text-accent mt-1">+2 this week</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Low Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">{items.filter((i) => i.status === "low").length}</p>
                <p className="text-xs text-accent mt-1">Need restocking</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-xs text-accent mt-1">Item types</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {items.filter((i) => i.daysUntilExpiry && i.daysUntilExpiry <= 7).length}
                </p>
                <p className="text-xs text-accent mt-1">Within 7 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Inventory List</CardTitle>
                  <CardDescription>Manage your restaurant inventory</CardDescription>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                  {filteredItems.length} items
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <InventoryFilters
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                selectedType={selectedType}
                inventoryTypes={activeTypes}
                onSearchChange={setSearchTerm}
                onCategoryChange={setSelectedCategory}
                onStatusChange={setSelectedStatus}
                onTypeChange={setSelectedType}
              />
              <InventoryTable items={filteredItems} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onEditItem={handleEditItem} />
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={isEditModalOpen}
        item={editingItem}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSaveEdit}
        inventoryTypes={activeTypes}
      />

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddItem}
        inventoryTypes={activeTypes}
        customUnits={customUnits}
        onAddUnit={handleAddUnit}
        onDeleteUnit={handleDeleteUnit}
      />

      {/* Manage Inventory Types Modal */}
      <ManageTypesModal
        isOpen={isTypesModalOpen}
        onClose={() => setIsTypesModalOpen(false)}
        inventoryTypes={inventoryTypes}
        onAddType={handleAddType}
        onUpdateType={handleUpdateType}
        onDeleteType={handleDeleteType}
      />
    </div>
  )
}

const initialInventoryItems = 
[
  {
    id: 1,
    name: "Olive Oil",
    type: "Kitchen",
    category: "Oils & Vinegars",
    quantity: 8,
    unit: "L",
    minStock: 5,
    status: "good",
    price: 28.5,
    lastUpdated: "2024-01-15",
    supplier: "Fresh Imports",
    daysUntilExpiry: 120,
  },
  {
    id: 2,
    name: "Fresh Basil",
    type: "Kitchen",
    category: "Herbs & Spices",
    quantity: 2,
    unit: "bundles",
    minStock: 4,
    status: "low",
    price: 3.5,
    lastUpdated: "2024-01-14",
    supplier: "Local Farm",
    daysUntilExpiry: 3,
  },
  {
    id: 3,
    name: "Pasta (Penne)",
    type: "Kitchen",
    category: "Grains & Pasta",
    quantity: 15,
    unit: "boxes",
    minStock: 10,
    status: "good",
    price: 2.2,
    lastUpdated: "2024-01-15",
    supplier: "Italian Imports",
    daysUntilExpiry: null,
  },
  {
    id: 4,
    name: "Cheddar Cheese",
    type: "Kitchen",
    category: "Dairy",
    quantity: 3,
    unit: "kg",
    minStock: 5,
    status: "low",
    price: 12.0,
    lastUpdated: "2024-01-13",
    supplier: "Dairy Plus",
    daysUntilExpiry: 15,
  },
  {
    id: 5,
    name: "Tomatoes",
    type: "Kitchen",
    category: "Produce",
    quantity: 12,
    unit: "kg",
    minStock: 8,
    status: "good",
    price: 4.5,
    lastUpdated: "2024-01-15",
    supplier: "Fresh Market",
    daysUntilExpiry: 4,
  },
  {
    id: 6,
    name: "Vodka",
    type: "Bar",
    category: "Spirits",
    quantity: 12,
    unit: "bottles",
    minStock: 8,
    status: "good",
    price: 28.0,
    lastUpdated: "2024-01-15",
    supplier: "Liquor Wholesale",
    daysUntilExpiry: null,
  },
  {
    id: 7,
    name: "Tonic Water",
    type: "Bar",
    category: "Mixers",
    quantity: 5,
    unit: "L",
    minStock: 10,
    status: "low",
    price: 4.5,
    lastUpdated: "2024-01-14",
    supplier: "Beverage Co",
    daysUntilExpiry: 90,
  },
  {
    id: 8,
    name: "Fresh Mint",
    type: "Bar",
    category: "Garnishes",
    quantity: 3,
    unit: "bundles",
    minStock: 5,
    status: "low",
    price: 2.5,
    lastUpdated: "2024-01-15",
    supplier: "Local Farm",
    daysUntilExpiry: 5,
  },
  {
    id: 9,
    name: "Lemons",
    type: "Bar",
    category: "Garnishes",
    quantity: 8,
    unit: "kg",
    minStock: 5,
    status: "good",
    price: 3.0,
    lastUpdated: "2024-01-15",
    supplier: "Fresh Market",
    daysUntilExpiry: 7,
  },
  {
    id: 10,
    name: "Red Wine",
    type: "Bar",
    category: "Wine",
    quantity: 15,
    unit: "bottles",
    minStock: 10,
    status: "good",
    price: 35.0,
    lastUpdated: "2024-01-14",
    supplier: "Wine Imports",
    daysUntilExpiry: null,
  },
]


