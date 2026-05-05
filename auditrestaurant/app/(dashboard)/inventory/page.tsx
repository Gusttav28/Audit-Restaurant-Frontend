"use client"

import { useEffect, useMemo, useState } from "react"
import { Package, Plus, Settings, Store, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/layout/header"
import Sidebar from "@/components/layout/sidebar"
import AddItemModal from "@/components/inventory/add-item-modal"
import EditItemModal from "@/components/inventory/edit-item-modal"
import InventoryFilters from "@/components/inventory/inventory-filters"
import InventoryTable from "@/components/inventory/inventory-table"
import ManageTypesModal from "@/components/inventory/manage-types-modal"
import { useAppContext } from "@/components/app-context"
import { type InventoryItem } from "@/components/inventory/multi-restaurant-data"

export default function InventoryPage() {
  const {
    selectedRestaurant,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addInventoryType,
    updateInventoryType,
    deleteInventoryType,
    addCustomUnit,
    deleteCustomUnit,
    formatCurrency,
    t,
  } = useAppContext()
  const [selectedTypeId, setSelectedTypeId] = useState(selectedRestaurant.inventoryTypes[0]?.id ?? 0)
  const [focusedView, setFocusedView] = useState<"inventory" | "all" | "low" | "expiring">("inventory")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [registeredSuppliersByRestaurant, setRegisteredSuppliersByRestaurant] = useState<Record<number, string[]>>({})

  const activeTypes = selectedRestaurant?.inventoryTypes.filter((type) => type.active) ?? []
  const selectedType = activeTypes.find((type) => type.id === selectedTypeId) ?? activeTypes[0]
  const allRestaurantItems = activeTypes.flatMap((type) => type.items)
  const registeredSuppliers = useMemo(() => {
    const fromItems = allRestaurantItems.map((item) => item.supplier).filter(Boolean)
    const fromRegistry = registeredSuppliersByRestaurant[selectedRestaurant.id] ?? []
    return Array.from(new Set([...fromItems, ...fromRegistry])).sort((a, b) => a.localeCompare(b))
  }, [allRestaurantItems, registeredSuppliersByRestaurant, selectedRestaurant.id])

  useEffect(() => {
    const view = new URLSearchParams(window.location.search).get("view")
    if (view === "low" || view === "expiring") {
      setFocusedView(view)
    }
  }, [])

  useEffect(() => {
    setSelectedTypeId(activeTypes[0]?.id ?? 0)
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedStatus("all")
  }, [selectedRestaurant.id])

  useEffect(() => {
    if (selectedType || activeTypes.length === 0) return
    setSelectedTypeId(activeTypes[0].id)
  }, [activeTypes, selectedType])

  const filteredItems = useMemo(() => {
    const sourceItems = focusedView === "inventory" ? selectedType?.items ?? [] : allRestaurantItems

    return sourceItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
      const matchesFocus =
        focusedView === "low"
          ? item.status === "low" || item.status === "critical"
          : focusedView === "expiring"
            ? Boolean(item.daysUntilExpiry && item.daysUntilExpiry <= 7)
            : true
      return matchesSearch && matchesCategory && matchesStatus && matchesFocus
    })
  }, [searchTerm, selectedCategory, selectedStatus, selectedType, focusedView, allRestaurantItems])

  const typeStats = activeTypes.map((type) => ({
    ...type,
    totalItems: type.items.length,
    lowStock: type.items.filter((item) => item.status === "low" || item.status === "critical").length,
    value: type.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
  }))

  const handleAddItem = (newItem: Omit<InventoryItem, "id" | "restaurantId" | "typeId">) => {
    const targetType = activeTypes.find((type) => type.name === newItem.type) ?? selectedType
    if (!targetType) return
    addInventoryItem(targetType.id, newItem)
    setSelectedTypeId(targetType.id)
    setIsAddModalOpen(false)
  }

  const handleSaveEdit = (id: number, data: Partial<InventoryItem>) => {
    updateInventoryItem(id, data)
    setIsEditModalOpen(false)
    setEditingItem(null)
  }

  const handleDeleteItem = (id: number) => {
    deleteInventoryItem(id)
  }

  const handleDeleteType = (id: number) => {
    const remainingTypes = activeTypes.filter((type) => type.id !== id)
    setSelectedTypeId(remainingTypes[0]?.id ?? 0)
    deleteInventoryType(id)
  }

  const handleRegisterSupplier = (supplier: string) => {
    const trimmedSupplier = supplier.trim()
    if (!trimmedSupplier) return
    setRegisteredSuppliersByRestaurant((current) => ({
      ...current,
      [selectedRestaurant.id]: Array.from(new Set([...(current[selectedRestaurant.id] ?? []), trimmedSupplier])),
    }))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="p-4 space-y-6 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store size={16} className="text-primary" />
                <span>{selectedRestaurant?.location}</span>
              </div>
              <h1 className="mt-1 text-3xl font-bold text-foreground">{t("inventoryManagement")}</h1>
              <p className="text-muted-foreground mt-1">
                {t("manageInventoryFor")} {selectedRestaurant?.name}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => setIsTypesModalOpen(true)} variant="outline" className="gap-2">
                <Settings size={20} />
                {t("manageTypes")}
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                disabled={!selectedType}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Plus size={20} />
                {t("addItem")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <Card
              className={`bg-card border-border cursor-pointer transition-colors hover:border-accent/50 ${focusedView === "all" ? "border-accent/60" : ""}`}
              onClick={() => {
                setFocusedView("all")
                setSelectedStatus("all")
                setSelectedCategory("all")
                setSearchTerm("")
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t("restaurantItems")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{allRestaurantItems.length}</p>
                <p className="text-xs text-accent mt-1">{activeTypes.length} inventory types</p>
              </CardContent>
            </Card>
            <Card
              className={`bg-card border-border cursor-pointer transition-colors hover:border-destructive/50 ${focusedView === "low" ? "border-destructive/60" : ""}`}
              onClick={() => setFocusedView(focusedView === "low" ? "all" : "low")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t("lowStock")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">
                  {allRestaurantItems.filter((item) => item.status === "low" || item.status === "critical").length}
                </p>
                <p className="text-xs text-accent mt-1">{t("needsAttention")}</p>
              </CardContent>
            </Card>
            <Card
              className={`bg-card border-border cursor-pointer transition-colors hover:border-primary/50 ${focusedView === "expiring" ? "border-primary/60" : ""}`}
              onClick={() => setFocusedView(focusedView === "expiring" ? "all" : "expiring")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t("expiringSoon")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {allRestaurantItems.filter((item) => item.daysUntilExpiry && item.daysUntilExpiry <= 7).length}
                </p>
                <p className="text-xs text-accent mt-1">{t("within7Days")}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t("inventoryValue")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="min-w-0 break-words text-xl font-bold leading-tight text-foreground sm:text-2xl">
                  {formatCurrency(allRestaurantItems.reduce((sum, item) => sum + item.quantity * item.price, 0))}
                </p>
                <p className="text-xs text-accent mt-1">{t("currentStockValue")}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            {typeStats.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedTypeId(type.id)
                  setFocusedView("inventory")
                }}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  selectedType?.id === type.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: type.color }} />
                    <span className="truncate font-semibold text-foreground">{type.name}</span>
                  </div>
                  <Package size={18} className="text-muted-foreground" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>
                    <strong className="block text-lg text-foreground">{type.totalItems}</strong>
                    {t("items")}
                  </span>
                  <span>
                    <strong className="block text-lg text-destructive">{type.lowStock}</strong>
                    {t("alerts")}
                  </span>
                  <span>
                    <strong className="block break-words text-base leading-tight text-foreground sm:text-lg">{formatCurrency(type.value)}</strong>
                    {t("value")}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedType ? (
                      <>
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedType.color }} />
                        {focusedView === "low" ? t("lowStock") : focusedView === "expiring" ? t("expiringSoon") : focusedView === "all" ? t("restaurantItems") : `${selectedType.name} Inventory`}
                      </>
                    ) : (
                      "Inventory"
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedType
                      ? focusedView === "inventory" ? `Items assigned to ${selectedType.name} at ${selectedRestaurant?.name}` : `Items across all inventories at ${selectedRestaurant?.name}`
                      : "Create an inventory type to start adding items"}
                  </CardDescription>
                </div>
                <span className="w-fit rounded-full bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  {filteredItems.length} items
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedType ? (
                <>
                  <InventoryFilters
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                    selectedStatus={selectedStatus}
                    selectedType={selectedType.name}
                    inventoryTypes={activeTypes}
                    onSearchChange={setSearchTerm}
                    onCategoryChange={setSelectedCategory}
                    onStatusChange={setSelectedStatus}
                    onTypeChange={() => undefined}
                    showTypeFilter={false}
                  />
                  <InventoryTable
                    items={filteredItems}
                    onUpdateItem={() => undefined}
                    onDeleteItem={handleDeleteItem}
                    onEditItem={(item) => {
                      setEditingItem(item as InventoryItem)
                      setIsEditModalOpen(true)
                    }}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
                  <TriangleAlert size={28} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No inventory types exist for this restaurant yet.</p>
                  <Button onClick={() => setIsTypesModalOpen(true)} variant="outline" className="gap-2">
                    <Plus size={18} />
                    Add Inventory Type
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

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

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
        inventoryTypes={activeTypes}
        customUnits={selectedRestaurant?.customUnits ?? []}
        onAddUnit={addCustomUnit}
        onDeleteUnit={deleteCustomUnit}
        selectedTypeName={selectedType?.name}
        suppliers={registeredSuppliers}
        onRegisterSupplier={handleRegisterSupplier}
      />

      <ManageTypesModal
        isOpen={isTypesModalOpen}
        onClose={() => setIsTypesModalOpen(false)}
        inventoryTypes={activeTypes}
        onAddType={addInventoryType}
        onUpdateType={updateInventoryType}
        onDeleteType={handleDeleteType}
      />
    </div>
  )
}
