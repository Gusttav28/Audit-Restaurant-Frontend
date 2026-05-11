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
    addItemCategory,
    renameItemCategory,
    deleteItemCategory,
    addSupplier,
    deleteSupplier,
    language,
    formatCurrency,
    t,
    can,
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
  const [selectedAuditPreviewId, setSelectedAuditPreviewId] = useState("")

  const activeTypes = selectedRestaurant?.inventoryTypes.filter((type) => type.active) ?? []
  const selectedType = activeTypes.find((type) => type.id === selectedTypeId) ?? activeTypes[0]
  const allRestaurantItems = activeTypes.flatMap((type) => type.items)
  const registeredSuppliers = useMemo(() => {
    const fromItems = allRestaurantItems.map((item) => item.supplier).filter(Boolean)
    const fromRegistry = selectedRestaurant.suppliers ?? []
    return Array.from(new Set([...fromItems, ...fromRegistry])).sort((a, b) => a.localeCompare(b))
  }, [allRestaurantItems, selectedRestaurant.suppliers])
  const itemCategories = useMemo(() => {
    const typeItems = selectedType?.items ?? []
    const fromItems = typeItems.map((item) => item.category).filter(Boolean)
    const scopedCategories = Array.isArray(selectedRestaurant.itemCategories)
      ? selectedRestaurant.itemCategories
      : selectedRestaurant.itemCategories?.[selectedType?.id ?? 0] ?? []
    const fromRegistry = scopedCategories
    return Array.from(new Set([...fromRegistry, ...fromItems])).sort((a, b) => a.localeCompare(b))
  }, [selectedRestaurant.itemCategories, selectedType])
  const completedInventoryAudits = selectedType
    ? selectedRestaurant.audits.filter((audit) => audit.inventoryId === selectedType.id && audit.status === "completed")
    : []
  const selectedAuditPreview = completedInventoryAudits.find((audit) => audit.id === selectedAuditPreviewId)
  const formattedLastEdited = selectedRestaurant.inventoryLastEdited
    ? new Intl.DateTimeFormat(language === "es" ? "es-CR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(selectedRestaurant.inventoryLastEdited),
      )
    : null

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
    setSelectedAuditPreviewId("")
  }, [selectedRestaurant.id])

  useEffect(() => {
    if (selectedType || activeTypes.length === 0) return
    setSelectedTypeId(activeTypes[0].id)
  }, [activeTypes, selectedType])

  useEffect(() => {
    setSelectedAuditPreviewId("")
  }, [selectedTypeId])

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
  const auditPreviewItems = useMemo(() => {
    if (!selectedAuditPreview || !selectedType) return []
    return (selectedAuditPreview.items ?? []).map((auditItem) => {
      const liveItem = selectedType.items.find((item) => item.id === auditItem.itemId)
      return {
        id: auditItem.itemId,
        restaurantId: selectedRestaurant.id,
        typeId: selectedAuditPreview.inventoryId,
        name: auditItem.itemName,
        type: selectedAuditPreview.inventoryName,
        category: auditItem.category,
        quantity: auditItem.currentStock ?? auditItem.previousStock,
        unit: auditItem.unit,
        minStock: liveItem?.minStock ?? 0,
        status: auditItem.result === "discrepancy" ? "critical" : auditItem.result === "sold" ? "low" : "good",
        price: auditItem.unitPrice,
        priceCurrency: liveItem?.priceCurrency,
        phase: liveItem?.phase,
        lastUpdated: selectedAuditPreview.completedDate ?? selectedAuditPreview.createdDate,
        supplier: liveItem?.supplier ?? "",
        daysUntilExpiry: null,
        stockHistory: liveItem?.stockHistory,
        auditPreviousStock: auditItem.previousStock,
        auditCurrentStock: auditItem.currentStock,
        auditDifference: auditItem.difference,
        auditResult: auditItem.result,
      } satisfies InventoryItem & {
        auditPreviousStock: number
        auditCurrentStock: number | null
        auditDifference: number | null
        auditResult: typeof auditItem.result
      }
    })
  }, [selectedAuditPreview, selectedRestaurant.id, selectedType])

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

  const handleDeleteItem = async (id: number) => {
    return deleteInventoryItem(id)
  }

  const handleDeleteType = (id: number) => {
    const remainingTypes = activeTypes.filter((type) => type.id !== id)
    setSelectedTypeId(remainingTypes[0]?.id ?? 0)
    deleteInventoryType(id)
  }

  const handleRegisterSupplier = (supplier: string) => {
    addSupplier(supplier)
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
                disabled={!selectedType || Boolean(selectedAuditPreview) || !can("create")}
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
                {formattedLastEdited && (
                  <span className="w-fit rounded-full bg-secondary/30 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {t("lastEdited")}: {formattedLastEdited}
                  </span>
                )}
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
                    categories={itemCategories}
                    extraControls={
                      <select
                        value={selectedAuditPreviewId}
                        onChange={(event) => setSelectedAuditPreviewId(event.target.value)}
                        disabled={focusedView !== "inventory" || completedInventoryAudits.length === 0 || Boolean(selectedAuditPreview)}
                        className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="" className="bg-secondary">
                          {completedInventoryAudits.length ? t("auditHistory") : t("noAuditHistory")}
                        </option>
                        {completedInventoryAudits.map((audit) => (
                          <option key={audit.id} value={audit.id} className="bg-secondary">
                            {audit.id} - {audit.inventoryName} - {audit.completedDate ?? audit.createdDate} - {audit.status}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  {selectedAuditPreview && (
                    <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-muted-foreground">
                      {t("previewingAudit")}: <span className="font-mono font-semibold text-foreground">{selectedAuditPreview.id}</span> · {selectedAuditPreview.inventoryName} · {selectedAuditPreview.completedDate}
                    </div>
                  )}
                  <InventoryTable
                    items={selectedAuditPreview ? auditPreviewItems : filteredItems}
        onUpdateItem={updateInventoryItem}
        onDeleteItem={handleDeleteItem}
                    onEditItem={(item) => {
                      setEditingItem(item as InventoryItem)
                      setIsEditModalOpen(true)
                    }}
                    readOnly={Boolean(selectedAuditPreview)}
                  />
                  {selectedAuditPreview && (
                    <div className="flex justify-center border-t border-border pt-5">
                      <Button
                        type="button"
                        className="w-full max-w-xs bg-primary text-white hover:bg-primary/90 sm:w-auto"
                        onClick={() => setSelectedAuditPreviewId("")}
                      >
                        {t("done")}
                      </Button>
                    </div>
                  )}
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
        suppliers={registeredSuppliers}
        onRegisterSupplier={handleRegisterSupplier}
        onDeleteSupplier={deleteSupplier}
      />

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
        inventoryTypes={activeTypes}
        categories={itemCategories}
        onAddCategory={(category) => selectedType && addItemCategory(selectedType.id, category)}
        onRenameCategory={(oldCategory, nextCategory) => selectedType && renameItemCategory(selectedType.id, oldCategory, nextCategory)}
        onDeleteCategory={(category) => selectedType && deleteItemCategory(selectedType.id, category)}
        customUnits={selectedRestaurant?.customUnits ?? []}
        onAddUnit={addCustomUnit}
        onDeleteUnit={deleteCustomUnit}
        selectedTypeName={selectedType?.name}
        suppliers={registeredSuppliers}
        onRegisterSupplier={handleRegisterSupplier}
        onDeleteSupplier={deleteSupplier}
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
