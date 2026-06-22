"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, CircleDollarSign, FileUp, Loader2, Package, Plus, Settings, Store, TriangleAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/layout/header"
import Sidebar from "@/components/layout/sidebar"
import AuditFlowLogo from "@/components/layout/audit-flow-logo"
import AddItemModal from "@/components/inventory/add-item-modal"
import EditItemModal from "@/components/inventory/edit-item-modal"
import InventoryFilters from "@/components/inventory/inventory-filters"
import InventoryTable from "@/components/inventory/inventory-table"
import ManageTypesModal from "@/components/inventory/manage-types-modal"
import { useAppContext } from "@/components/app-context"
import { type InventoryItem } from "@/components/inventory/multi-restaurant-data"
import { extractElectronicBillFromPdf, type ParsedBillItem } from "@/lib/electronic-bill-parser"

type BillImportRow = ParsedBillItem & {
  id: string
  selected: boolean
  typeId: number
  category: string
  minStock: number
  supplier: string
  currency: "CRC" | "USD"
  invoiceNumber: string
}

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
    addProviderBill,
    deleteSupplier,
    exchangeRate,
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
  const [isBillImportOpen, setIsBillImportOpen] = useState(false)
  const [isReadingBill, setIsReadingBill] = useState(false)
  const [billImportError, setBillImportError] = useState("")
  const [billSupplier, setBillSupplier] = useState("")
  const [billCurrency, setBillCurrency] = useState<"CRC" | "USD">("CRC")
  const [billInvoiceNumber, setBillInvoiceNumber] = useState("")
  const [billRows, setBillRows] = useState<BillImportRow[]>([])
  const billFileInputRef = useRef<HTMLInputElement | null>(null)
  const billCopy = {
    en: {
      uploadBill: "Upload bill",
      readingBill: "Reading bill...",
      uploadingFiles: "Uploading files...",
      billImportTitle: "Import electronic bill",
      billImportDescription: "Review the detected bill lines before loading them into inventory.",
      supplier: "Provider",
      suppliers: "Providers",
      invoice: "Invoice",
      files: "Files",
      noItems: "No inventory items were detected in this bill.",
      importSelected: "Import selected",
      item: "Item",
      quantity: "Quantity",
      unitPrice: "Unit price",
      currency: "Currency",
      minStock: "Min stock",
      targetInventory: "Inventory",
      select: "Select",
      unsupported: "Upload a PDF electronic bill.",
      readError: "I could not read inventory lines from this PDF. Try another electronic bill or add the item manually.",
    },
    es: {
      uploadBill: "Subir factura",
      readingBill: "Leyendo factura...",
      uploadingFiles: "Cargando archivos...",
      billImportTitle: "Importar factura electronica",
      billImportDescription: "Revisa las lineas detectadas antes de cargarlas al inventario.",
      supplier: "Proveedor",
      suppliers: "Proveedores",
      invoice: "Factura",
      files: "Archivos",
      noItems: "No se detectaron articulos de inventario en esta factura.",
      importSelected: "Importar seleccionados",
      item: "Articulo",
      quantity: "Cantidad",
      unitPrice: "Precio unitario",
      currency: "Moneda",
      minStock: "Stock minimo",
      targetInventory: "Inventario",
      select: "Seleccionar",
      unsupported: "Sube una factura electronica en PDF.",
      readError: "No pude leer lineas de inventario desde este PDF. Prueba otra factura electronica o agrega el articulo manualmente.",
    },
  }[language]

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

  const handleBillFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (!files.length) return
    if (files.some((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
      setBillImportError(billCopy.unsupported)
      setIsBillImportOpen(true)
      return
    }

    setIsReadingBill(true)
    setBillImportError("")
    try {
      const bills = await Promise.all(files.map((file) => extractElectronicBillFromPdf(file)))
      const defaultTypeId = selectedType?.id ?? activeTypes[0]?.id ?? 0
      const rows = bills.flatMap((bill, billIndex) =>
        bill.items.map((item, itemIndex) => ({
          ...item,
          id: `${bill.invoiceNumber ?? files[billIndex]?.name ?? "bill"}-${item.name}-${itemIndex}`,
          selected: true,
          typeId: defaultTypeId,
          category: item.category,
          minStock: 1,
          supplier: bill.supplier,
          currency: bill.currency,
          invoiceNumber: bill.invoiceNumber ?? files[billIndex]?.name ?? "",
        })),
      )
      const suppliers = Array.from(new Set(bills.map((bill) => bill.supplier).filter(Boolean)))
      const currencies = Array.from(new Set(bills.map((bill) => bill.currency)))
      setBillSupplier(suppliers.join(", "))
      setBillCurrency(currencies[0] ?? "CRC")
      setBillInvoiceNumber(files.length === 1 ? bills[0]?.invoiceNumber ?? files[0].name : `${files.length} ${billCopy.files}`)
      setBillRows(rows)
      setBillImportError(rows.length ? "" : billCopy.noItems)
      setIsBillImportOpen(true)
    } catch {
      setBillRows([])
      setBillSupplier("")
      setBillInvoiceNumber(files.length === 1 ? files[0].name : `${files.length} ${billCopy.files}`)
      setBillImportError(billCopy.readError)
      setIsBillImportOpen(true)
    } finally {
      setIsReadingBill(false)
    }
  }

  const updateBillRow = (rowId: string, data: Partial<BillImportRow>) => {
    setBillRows((current) => current.map((row) => row.id === rowId ? { ...row, ...data } : row))
  }

  const normalizeProductName = (name: string) =>
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\b(de|del|la|el|los|las)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim()

  const handleImportBillRows = () => {
    const selectedRows = billRows.filter((row) => row.selected)
    selectedRows.forEach((row) => {
      const targetType = activeTypes.find((type) => type.id === row.typeId) ?? selectedType ?? activeTypes[0]
      if (!targetType) return
      if (row.supplier) addSupplier(row.supplier)
      if (row.category) addItemCategory(targetType.id, row.category)
      const importedUnitPrice = row.currency === "CRC" ? row.unitPrice / exchangeRate : row.unitPrice
      const matchingItem = targetType.items.find((item) => normalizeProductName(item.name) === normalizeProductName(row.name))

      if (matchingItem) {
        updateInventoryItem(matchingItem.id, {
          quantity: matchingItem.quantity + row.quantity,
          price: matchingItem.price + importedUnitPrice,
          lastUpdated: new Date().toISOString().split("T")[0],
        })
      } else {
        addInventoryItem(targetType.id, {
          name: row.name,
          type: targetType.name,
          category: row.category || "General",
          quantity: row.quantity,
          unit: row.unit,
          minStock: row.minStock,
          status: "good",
          price: importedUnitPrice,
          priceCurrency: row.currency,
          phase: "none",
          lastUpdated: new Date().toISOString().split("T")[0],
          supplier: row.supplier,
          daysUntilExpiry: null,
        })
      }
      setSelectedTypeId(targetType.id)
    })

    const billsByProvider = selectedRows.reduce<Record<string, typeof selectedRows>>((acc, row) => {
      const key = `${row.supplier || "Unknown supplier"}||${row.invoiceNumber || "manual"}||${row.currency}`
      acc[key] ??= []
      acc[key].push(row)
      return acc
    }, {})

    Object.entries(billsByProvider).forEach(([key, rows]) => {
      const [supplier, invoiceNumber, currency] = key.split("||") as [string, string, "CRC" | "USD"]
      addProviderBill({
        supplier,
        invoiceNumber,
        currency,
        source: "bill-upload",
        items: rows.map((row) => {
          const targetType = activeTypes.find((type) => type.id === row.typeId) ?? selectedType ?? activeTypes[0]
          return {
            name: row.name,
            quantity: row.quantity,
            unit: row.unit,
            unitPrice: row.unitPrice,
            priceCurrency: row.currency,
            category: row.category || "General",
            inventoryTypeName: targetType?.name ?? "",
          }
        }),
      })
    })
    setIsBillImportOpen(false)
    setBillRows([])
    setBillImportError("")
  }

  return (
    <div className="flex min-h-screen max-w-full overflow-x-hidden bg-background">
      <Sidebar />
      <div className="min-w-0 max-w-full flex-1 overflow-x-hidden">
        <Header />
        <main className="max-w-full space-y-6 overflow-x-hidden p-4 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store size={16} className="text-primary" />
                <span className="min-w-0 truncate">{selectedRestaurant?.location}</span>
              </div>
              <h1 className="mt-1 break-words text-3xl font-bold text-foreground">{t("inventoryManagement")}</h1>
              <p className="mt-1 break-words text-muted-foreground">
                {t("manageInventoryFor")} {selectedRestaurant?.name}
              </p>
            </div>
            <div className="grid w-full min-w-0 gap-2 sm:w-auto sm:grid-flow-col sm:auto-cols-max">
              <Button onClick={() => setIsTypesModalOpen(true)} variant="outline" className="gap-2">
                <Settings size={20} />
                {t("manageTypes")}
              </Button>
              <input
                ref={billFileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="hidden"
                onChange={handleBillFileChange}
              />
              <Button
                type="button"
                onClick={() => billFileInputRef.current?.click()}
                disabled={!selectedType || Boolean(selectedAuditPreview) || !can("create") || isReadingBill}
                variant="outline"
                className="gap-2"
              >
                {isReadingBill ? <Loader2 size={20} className="animate-spin" /> : <FileUp size={20} />}
                {isReadingBill ? billCopy.uploadingFiles : billCopy.uploadBill}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package size={16} />
                  {t("restaurantItems")}
                </CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TriangleAlert size={16} className="text-destructive" />
                  {t("lowStock")}
                </CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle size={16} className="text-primary" />
                  {t("expiringSoon")}
                </CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CircleDollarSign size={16} />
                  {t("inventoryValue")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="min-w-0 break-words text-xl font-bold leading-tight text-foreground sm:text-2xl">
                  {formatCurrency(allRestaurantItems.reduce((sum, item) => sum + item.quantity * item.price, 0))}
                </p>
                <p className="text-xs text-accent mt-1">{t("currentStockValue")}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {typeStats.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedTypeId(type.id)
                  setFocusedView("inventory")
                }}
                className={`rounded-lg border p-6 text-left transition-colors ${
                  selectedType?.id === type.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary/30"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: type.color }} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{type.name}</p>
                      <p className="text-xs text-muted-foreground">{type.totalItems} {t("items")}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-foreground">{type.lowStock} {t("alerts")}</p>
                    <p className="text-xs text-accent">{formatCurrency(type.value)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2">
                    {selectedType ? (
                      <>
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedType.color }} />
                        <span className="min-w-0 break-words">{focusedView === "low" ? t("lowStock") : focusedView === "expiring" ? t("expiringSoon") : focusedView === "all" ? t("restaurantItems") : `${selectedType.name} Inventory`}</span>
                      </>
                    ) : (
                      "Inventory"
                    )}
                  </CardTitle>
                  <CardDescription className="break-words">
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
                        className="max-w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground transition-colors cursor-pointer focus:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
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

      {isReadingBill && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/35 p-4 backdrop-blur-sm">
          <div className="text-center">
            <AuditFlowLogo collapsed className="mx-auto mb-4 animate-pulse justify-center" imageClassName="h-16 w-16 rounded-2xl" />
            <p className="text-sm uppercase tracking-widest text-muted-foreground">{billCopy.uploadingFiles}</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">AuditNett</h2>
          </div>
        </div>
      )}

      {isBillImportOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-2 sm:p-4" onClick={() => setIsBillImportOpen(false)}>
          <div className="flex w-[calc(100vw-1rem)] max-h-[calc(100dvh-1rem)] max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-card sm:w-[calc(100vw-2rem)] sm:max-h-[calc(100dvh-2rem)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-border p-4 sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{billCopy.billImportTitle}</h2>
                <p className="text-sm text-muted-foreground">{billCopy.billImportDescription}</p>
              </div>
              <button onClick={() => setIsBillImportOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={22} />
              </button>
            </div>
            <div className="auditflow-thin-scrollbar flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{billCopy.suppliers}</p>
                  <p className="mt-2 break-words text-sm font-semibold text-foreground">{billSupplier || "-"}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{billCopy.invoice}</p>
                  <p className="mt-2 break-all text-sm font-semibold text-foreground">{billInvoiceNumber || "-"}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">{t("currency")}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{billCurrency}</p>
                </div>
              </div>

              {billImportError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  {billImportError}
                </div>
              )}

              {billRows.length > 0 && (
                <div className="auditflow-thin-scrollbar overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-[980px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/20">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{billCopy.select}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{billCopy.item}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{billCopy.supplier}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{billCopy.targetInventory}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("category")}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{billCopy.quantity}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("unit")}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{billCopy.currency}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{billCopy.unitPrice}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{billCopy.minStock}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billRows.map((row) => (
                        <tr key={row.id} className="border-b border-border">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              onChange={(event) => updateBillRow(row.id, { selected: event.target.checked })}
                              className="h-4 w-4 accent-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={row.name}
                              onChange={(event) => updateBillRow(row.id, { name: event.target.value })}
                              className="w-56 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={row.supplier}
                              onChange={(event) => updateBillRow(row.id, { supplier: event.target.value })}
                              className="w-44 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={row.typeId}
                              onChange={(event) => updateBillRow(row.id, { typeId: Number(event.target.value) })}
                              className="w-36 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                            >
                              {activeTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={row.category}
                              onChange={(event) => updateBillRow(row.id, { category: event.target.value })}
                              className="w-32 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.001"
                              value={row.quantity}
                              onChange={(event) => updateBillRow(row.id, { quantity: Number(event.target.value) })}
                              className="w-24 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={row.unit}
                              onChange={(event) => updateBillRow(row.id, { unit: event.target.value })}
                              className="w-20 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={row.currency}
                              onChange={(event) => updateBillRow(row.id, { currency: event.target.value as "CRC" | "USD" })}
                              className="w-20 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                            >
                              <option value="CRC">CRC</option>
                              <option value="USD">USD</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={row.unitPrice}
                              onChange={(event) => updateBillRow(row.id, { unitPrice: Number(event.target.value) })}
                              className="w-28 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={row.minStock}
                              onChange={(event) => updateBillRow(row.id, { minStock: Number(event.target.value) })}
                              className="w-24 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-border p-4 sm:flex-row sm:justify-end sm:p-6">
              <Button variant="outline" className="bg-transparent" onClick={() => setIsBillImportOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleImportBillRows}
                disabled={!billRows.some((row) => row.selected)}
              >
                <FileUp size={16} />
                {billCopy.importSelected}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
