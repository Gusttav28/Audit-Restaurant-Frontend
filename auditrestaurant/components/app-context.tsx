"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  type CustomUnit,
  type InventoryItem,
  type RestaurantAudit,
  type RestaurantAuditComment,
  type RestaurantAuditItem,
  type RestaurantInventory,
  initialRestaurants,
} from "@/components/inventory/multi-restaurant-data"

export type CurrencyCode = "USD" | "CRC"
export type LanguageCode = "en" | "es"

const DEFAULT_USD_CRC_RATE = 506
const EXCHANGE_RATE_URL = "https://open.er-api.com/v6/latest/USD"

const dictionary = {
  en: {
    switchRestaurant: "Switch restaurant",
    confirmSwitchTitle: "Switch restaurant?",
    confirmSwitchBody: "The dashboard, inventory, audits, reports, and settings will update to this restaurant.",
    cancel: "Cancel",
    confirm: "Switch",
    loadingRestaurant: "Loading restaurant",
    currency: "Currency",
    exchangeRate: "Exchange rate",
    convert: "Convert",
    language: "Language",
    english: "English",
    spanish: "Spanish",
    dashboard: "Dashboard",
    inventory: "Inventory",
    audits: "Audits",
    dashboardSubtitle: "Restaurant-specific audit and inventory overview",
    inventoryIssues: "Inventory Issues",
    inventoryIssuesSubtitle: "Items requiring attention",
    recentAudits: "Recent Audits",
    recentAuditsSubtitle: "Latest audit activity",
    auditTrend: "Audit Performance Trend",
    auditTrendSubtitle: "Completed audits over time",
    statusDistribution: "Open Audit Status",
    statusDistributionSubtitle: "Audits not completed yet",
    totalAudits: "Total Audits",
    completed: "Completed",
    inProgress: "In Progress",
    notStarted: "Not Started",
    issuesFound: "Issues Found",
    fromLastWeek: "from last week",
    noIssues: "No inventory issues for this restaurant.",
    noOpenAudits: "No open audits for this restaurant.",
    inventoryManagement: "Inventory Management",
    manageInventoryFor: "Manage inventory independently for",
    manageTypes: "Manage Types",
    addItem: "Add Item",
    addNewItem: "Add New Item",
    currentRestaurant: "Current restaurant",
    itemName: "Item Name",
    category: "Category",
    quantity: "Quantity",
    unit: "Unit",
    minStock: "Min Stock",
    price: "Price",
    supplier: "Supplier",
    manageUnits: "Manage Units",
    createRestaurant: "Create new restaurant",
    createRestaurantTitle: "Create New Restaurant",
    location: "Location",
    restaurantItems: "Restaurant Items",
    lowStock: "Low Stock",
    expiringSoon: "Expiring Soon",
    inventoryValue: "Inventory Value",
    items: "items",
    alerts: "Alerts",
    value: "Value",
    needsAttention: "Needs attention",
    currentStockValue: "Current stock value",
    within7Days: "Within 7 days",
    reports: "Reports & Analytics",
    reportsSubtitle: "Track audit performance and inventory insights for",
    exportReport: "Export Report",
    settings: "Settings",
    settingsSubtitle: "Manage selected restaurant configuration",
    restaurantInfo: "Restaurant Information",
    updateRestaurantDetails: "Update details for the selected restaurant",
    restaurantName: "Restaurant Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    inventoryPreferences: "Inventory Preferences",
    lowStockThreshold: "Low Stock Threshold",
    saveChanges: "Save Changes",
    inventoryAudits: "Inventory Audits",
    auditsSubtitle: "Create and manage audits for",
    newAudit: "New Audit",
    createAudit: "Create Audit",
    createNewAudit: "Create New Audit",
    selectInventory: "Select Inventory",
    auditDate: "Audit Date",
    auditor: "Auditor",
    notes: "Notes",
    previousStock: "Previous Stock",
    currentStock: "Current Stock",
    difference: "Difference",
    result: "Result",
    sold: "Sold",
    discrepancy: "Discrepancy",
    matched: "Matched",
    comments: "Comments",
    addComment: "Add Comment",
    initialComment: "Initial Comment",
    analytics: "Analytics",
    financialResults: "Financial Results",
    salesImpact: "Sales Impact",
    save: "Save",
    edit: "Edit",
    saving: "Saving...",
    exporting: "Exporting...",
    export: "Export",
    actions: "Actions",
    pending: "Pending",
    status: "Status",
    backToAudits: "Back to audits",
    auditNotFound: "Audit not found",
    auditResults: "Audit Results",
    netMovement: "Net movement",
    completedAudit: "Completed audit",
    editAudit: "Edit audit",
    writeComment: "Write a comment...",
    saveComment: "Save Comment",
    noComments: "No comments yet.",
    reportSummary: "Report Summary",
    period: "Period",
    restaurant: "Restaurant",
    applyFilters: "Apply Filters",
    lastWeek: "Last Week",
    lastMonth: "Last Month",
    lastQuarter: "Last Quarter",
    lastYear: "Last Year",
    avgIssuesPerAudit: "Avg Issues per Audit",
    complianceRate: "Compliance Rate",
    avgAuditTime: "Avg Audit Time",
    auditCompletionTrend: "Audit Completion Trend",
    issuesByCategory: "Issues by Category",
    complianceByInventory: "Compliance by Inventory",
    issueSeverity: "Issue Severity",
    auditDurationIssues: "Audit Duration vs Issues Found",
    weeklyPerformance: "Weekly Performance Metrics",
    teamManagement: "Team Management",
    teamMembers: "Team Members",
    teamDescription: "Manage team members and permissions",
    addTeamMember: "Add Team Member",
    memberName: "Member Name",
    role: "Role",
    admin: "Admin",
    auditorRole: "Auditor",
    collaborator: "Collaborator",
    profile: "Profile",
    accountDetails: "Account Details",
    currentRole: "Current Role",
    deleteAudit: "Delete Audit",
    deleteAuditTitle: "Delete audit?",
    deleteAuditBody: "This removes the audit from the selected restaurant. Type delete and the audit ID to confirm.",
    typeDelete: "Type delete",
    typeAuditId: "Type audit ID",
    saveAll: "Save All",
    suppliers: "Suppliers",
    registerSupplier: "Register supplier",
    supplierName: "Supplier name",
    saveSupplier: "Save supplier",
    useSupplier: "Use supplier",
    dontSaveSupplier: "Do not save supplier",
    critical: "Critical",
    stable: "Stable",
    allTime: "All time",
    activeAudits: "Active audits",
    awaitingAction: "Awaiting action",
    auditList: "Audit List",
    auditListSubtitle: "View and manage your inventory audits",
  },
  es: {
    switchRestaurant: "Cambiar restaurante",
    confirmSwitchTitle: "¿Cambiar restaurante?",
    confirmSwitchBody: "El panel, inventario, auditorías, reportes y configuración se actualizarán para este restaurante.",
    cancel: "Cancelar",
    confirm: "Cambiar",
    loadingRestaurant: "Cargando restaurante",
    currency: "Moneda",
    exchangeRate: "Tipo de cambio",
    convert: "Convertir",
    language: "Idioma",
    english: "Inglés",
    spanish: "Español",
    dashboard: "Panel",
    inventory: "Inventario",
    audits: "Auditorías",
    dashboardSubtitle: "Resumen de auditorías e inventario por restaurante",
    inventoryIssues: "Problemas de Inventario",
    inventoryIssuesSubtitle: "Artículos que requieren atención",
    recentAudits: "Auditorías Recientes",
    recentAuditsSubtitle: "Actividad reciente de auditoría",
    auditTrend: "Tendencia de Auditorías",
    auditTrendSubtitle: "Auditorías completadas en el tiempo",
    statusDistribution: "Estado de Auditorías Abiertas",
    statusDistributionSubtitle: "Auditorías pendientes de completar",
    totalAudits: "Auditorías Totales",
    completed: "Completadas",
    inProgress: "En Progreso",
    notStarted: "Sin Iniciar",
    issuesFound: "Problemas Encontrados",
    fromLastWeek: "desde la semana pasada",
    noIssues: "No hay problemas de inventario para este restaurante.",
    noOpenAudits: "No hay auditorías abiertas para este restaurante.",
    inventoryManagement: "Gestión de Inventario",
    manageInventoryFor: "Gestiona inventario independientemente para",
    manageTypes: "Gestionar Tipos",
    addItem: "Agregar Artículo",
    addNewItem: "Agregar Nuevo Artículo",
    currentRestaurant: "Restaurante actual",
    itemName: "Nombre del Artículo",
    category: "Categoría",
    quantity: "Cantidad",
    unit: "Unidad",
    minStock: "Stock Mínimo",
    price: "Precio",
    supplier: "Proveedor",
    manageUnits: "Gestionar Unidades",
    createRestaurant: "Crear nuevo restaurante",
    createRestaurantTitle: "Crear Nuevo Restaurante",
    location: "Ubicación",
    restaurantItems: "Artículos del Restaurante",
    lowStock: "Stock Bajo",
    expiringSoon: "Próximos a Vencer",
    inventoryValue: "Valor de Inventario",
    items: "artículos",
    alerts: "Alertas",
    value: "Valor",
    needsAttention: "Requiere atención",
    currentStockValue: "Valor actual del stock",
    within7Days: "Dentro de 7 días",
    reports: "Reportes y Analítica",
    reportsSubtitle: "Sigue rendimiento de auditorías e inventario para",
    exportReport: "Exportar Reporte",
    settings: "Configuración",
    settingsSubtitle: "Gestiona la configuración del restaurante seleccionado",
    restaurantInfo: "Información del Restaurante",
    updateRestaurantDetails: "Actualiza detalles del restaurante seleccionado",
    restaurantName: "Nombre del Restaurante",
    email: "Correo",
    phone: "Teléfono",
    address: "Dirección",
    inventoryPreferences: "Preferencias de Inventario",
    lowStockThreshold: "Umbral de Stock Bajo",
    saveChanges: "Guardar Cambios",
    inventoryAudits: "Auditorías de Inventario",
    auditsSubtitle: "Crea y gestiona auditorías para",
    newAudit: "Nueva Auditoría",
    createAudit: "Crear Auditoría",
    createNewAudit: "Crear Nueva Auditoría",
    selectInventory: "Seleccionar Inventario",
    auditDate: "Fecha de Auditoría",
    auditor: "Auditor",
    notes: "Notas",
    previousStock: "Stock Anterior",
    currentStock: "Stock Actual",
    difference: "Diferencia",
    result: "Resultado",
    sold: "Vendido",
    discrepancy: "Discrepancia",
    matched: "Coincide",
    comments: "Comentarios",
    addComment: "Agregar Comentario",
    initialComment: "Comentario Inicial",
    analytics: "Analítica",
    financialResults: "Resultados Financieros",
    salesImpact: "Impacto de Ventas",
    save: "Guardar",
    edit: "Editar",
    saving: "Guardando...",
    exporting: "Exportando...",
    export: "Exportar",
    actions: "Acciones",
    pending: "Pendiente",
    status: "Estado",
    backToAudits: "Volver a auditorías",
    auditNotFound: "Auditoría no encontrada",
    auditResults: "Resultados de Auditoría",
    netMovement: "Movimiento neto",
    completedAudit: "Auditoría completada",
    editAudit: "Editar auditoría",
    writeComment: "Escribe un comentario...",
    saveComment: "Guardar Comentario",
    noComments: "Aún no hay comentarios.",
    reportSummary: "Resumen del Reporte",
    period: "Periodo",
    restaurant: "Restaurante",
    applyFilters: "Aplicar Filtros",
    lastWeek: "Semana Pasada",
    lastMonth: "Mes Pasado",
    lastQuarter: "Trimestre Pasado",
    lastYear: "Año Pasado",
    avgIssuesPerAudit: "Promedio de Problemas por Auditoría",
    complianceRate: "Tasa de Cumplimiento",
    avgAuditTime: "Tiempo Promedio de Auditoría",
    auditCompletionTrend: "Tendencia de Auditorías Completadas",
    issuesByCategory: "Problemas por Categoría",
    complianceByInventory: "Cumplimiento por Inventario",
    issueSeverity: "Severidad de Problemas",
    auditDurationIssues: "Duración de Auditoría vs Problemas",
    weeklyPerformance: "Métricas Semanales",
    teamManagement: "Gestión del Equipo",
    teamMembers: "Miembros del Equipo",
    teamDescription: "Gestiona miembros del equipo y permisos",
    addTeamMember: "Agregar Miembro",
    memberName: "Nombre del Miembro",
    role: "Rol",
    admin: "Administrador",
    auditorRole: "Auditor",
    collaborator: "Colaborador",
    profile: "Perfil",
    accountDetails: "Detalles de Cuenta",
    currentRole: "Rol Actual",
    deleteAudit: "Eliminar Auditoría",
    deleteAuditTitle: "¿Eliminar auditoría?",
    deleteAuditBody: "Esto elimina la auditoría del restaurante seleccionado. Escribe delete y el ID de auditoría para confirmar.",
    typeDelete: "Escribe delete",
    typeAuditId: "Escribe el ID de auditoría",
    saveAll: "Guardar Todo",
    suppliers: "Proveedores",
    registerSupplier: "Registrar proveedor",
    supplierName: "Nombre del proveedor",
    saveSupplier: "Guardar proveedor",
    useSupplier: "Usar proveedor",
    dontSaveSupplier: "No guardar proveedor",
    critical: "Crítico",
    stable: "Estable",
    allTime: "Todo el tiempo",
    activeAudits: "Auditorías activas",
    awaitingAction: "Esperando acción",
    auditList: "Lista de Auditorías",
    auditListSubtitle: "Consulta y gestiona tus auditorías de inventario",
  },
} as const

type TranslationKey = keyof typeof dictionary.en

interface AppContextValue {
  restaurants: RestaurantInventory[]
  selectedRestaurant: RestaurantInventory
  selectedRestaurantId: number
  currency: CurrencyCode
  language: LanguageCode
  exchangeRate: number
  converterAmount: number
  convertedAmount: number
  selectedInventoryId: number | null
  t: (key: TranslationKey) => string
  formatCurrency: (amountUsd: number) => string
  setCurrency: (currency: CurrencyCode) => void
  setLanguage: (language: LanguageCode) => void
  setExchangeRate: (rate: number) => void
  setConverterAmount: (amount: number) => void
  setSelectedInventoryId: (inventoryId: number | null) => void
  requestRestaurantSwitch: (restaurantId: number) => void
  createRestaurant: (restaurant: { name: string; location: string; email: string; phone: string; address: string }) => void
  updateSelectedRestaurant: (updater: (restaurant: RestaurantInventory) => RestaurantInventory) => void
  addInventoryItem: (typeId: number, item: Omit<InventoryItem, "id" | "restaurantId" | "typeId">) => void
  updateInventoryItem: (itemId: number, data: Partial<InventoryItem>) => void
  deleteInventoryItem: (itemId: number) => void
  addInventoryType: (type: { name: string; color: string }) => void
  updateInventoryType: (id: number, data: { name?: string; color?: string; active?: boolean }) => void
  deleteInventoryType: (id: number) => void
  addCustomUnit: (unit: Omit<CustomUnit, "id">) => void
  deleteCustomUnit: (id: number) => void
  createAudit: (audit: { inventoryId: number; auditor: string; notes: string; auditDate: string }) => void
  updateAuditItem: (auditId: string, itemId: number, currentStock: number, notes?: string) => void
  completeAudit: (auditId: string) => void
  reopenAudit: (auditId: string) => void
  deleteAudit: (auditId: string) => void
  addAuditComment: (auditId: string, comment: { author: string; content: string }) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<RestaurantInventory[]>(initialRestaurants)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(initialRestaurants[0].id)
  const [pendingRestaurantId, setPendingRestaurantId] = useState<number | null>(null)
  const [loadingRestaurantId, setLoadingRestaurantId] = useState<number | null>(null)
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [language, setLanguage] = useState<LanguageCode>("en")
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_CRC_RATE)
  const [converterAmount, setConverterAmount] = useState(1)
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(initialRestaurants[0].inventoryTypes[0]?.id ?? null)

  const selectedRestaurant =
    restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? restaurants[0]
  const pendingRestaurant = restaurants.find((restaurant) => restaurant.id === pendingRestaurantId)
  const loadingRestaurant = restaurants.find((restaurant) => restaurant.id === loadingRestaurantId)

  useEffect(() => {
    let isMounted = true

    fetch(EXCHANGE_RATE_URL)
      .then((response) => response.json())
      .then((data) => {
        const rate = Number(data?.rates?.CRC)
        if (isMounted && Number.isFinite(rate) && rate > 0) {
          setExchangeRate(rate)
        }
      })
      .catch(() => {
        if (isMounted) setExchangeRate(DEFAULT_USD_CRC_RATE)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const t = (key: TranslationKey) => dictionary[language][key] ?? dictionary.en[key]

  const formatCurrency = (amountUsd: number) => {
    const amount = currency === "CRC" ? amountUsd * exchangeRate : amountUsd
    return new Intl.NumberFormat(language === "es" ? "es-CR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "CRC" ? 0 : 2,
    }).format(amount)
  }

  const requestRestaurantSwitch = (restaurantId: number) => {
    if (restaurantId === selectedRestaurantId) return
    setPendingRestaurantId(restaurantId)
  }

  const confirmRestaurantSwitch = () => {
    if (!pendingRestaurantId) return
    setLoadingRestaurantId(pendingRestaurantId)
    setPendingRestaurantId(null)

    window.setTimeout(() => {
      const nextRestaurant = restaurants.find((restaurant) => restaurant.id === pendingRestaurantId)
      setSelectedRestaurantId(pendingRestaurantId)
      setSelectedInventoryId(nextRestaurant?.inventoryTypes[0]?.id ?? null)
      setLoadingRestaurantId(null)
    }, 900)
  }

  const createRestaurant = (restaurant: { name: string; location: string; email: string; phone: string; address: string }) => {
    const nextId = Math.max(0, ...restaurants.map((existingRestaurant) => existingRestaurant.id)) + 1
    const newRestaurant: RestaurantInventory = {
      id: nextId,
      name: restaurant.name,
      location: restaurant.location,
      email: restaurant.email,
      phone: restaurant.phone,
      address: restaurant.address,
      settings: {
        auditNotifications: true,
        inventoryAlerts: true,
        weeklyReports: true,
        lowStockThreshold: 5,
      },
      inventoryTypes: [
        {
          id: 1,
          name: "Kitchen",
          color: "#3b82f6",
          active: true,
          items: [],
        },
      ],
      customUnits: [],
      audits: [],
    }

    setRestaurants((currentRestaurants) => [...currentRestaurants, newRestaurant])
    setSelectedRestaurantId(nextId)
    setSelectedInventoryId(1)
  }

  const updateSelectedRestaurant = (updater: (restaurant: RestaurantInventory) => RestaurantInventory) => {
    setRestaurants((currentRestaurants) =>
      currentRestaurants.map((restaurant) =>
        restaurant.id === selectedRestaurantId ? updater(restaurant) : restaurant,
      ),
    )
  }

  const addInventoryItem = (typeId: number, item: Omit<InventoryItem, "id" | "restaurantId" | "typeId">) => {
    updateSelectedRestaurant((restaurant) => {
      const nextId =
        Math.max(0, ...restaurant.inventoryTypes.flatMap((type) => type.items.map((existingItem) => existingItem.id))) + 1

      return {
        ...restaurant,
        inventoryTypes: restaurant.inventoryTypes.map((type) =>
          type.id === typeId
            ? {
                ...type,
                items: [
                  ...type.items,
                  { ...item, id: nextId, restaurantId: restaurant.id, typeId: type.id, type: type.name },
                ],
              }
            : type,
        ),
      }
    })
  }

  const updateInventoryItem = (itemId: number, data: Partial<InventoryItem>) => {
    updateSelectedRestaurant((restaurant) => {
      const destinationType =
        restaurant.inventoryTypes.find((type) => type.name === data.type) ??
        restaurant.inventoryTypes.find((type) => type.items.some((item) => item.id === itemId))

      if (!destinationType) return restaurant

      let updatedItem: InventoryItem | null = null

      const inventoryTypes = restaurant.inventoryTypes.map((type) => {
        const currentItem = type.items.find((item) => item.id === itemId)
        if (!currentItem) return type

        updatedItem = {
          ...currentItem,
          ...data,
          restaurantId: restaurant.id,
          typeId: destinationType.id,
          type: destinationType.name,
        }

        return { ...type, items: type.items.filter((item) => item.id !== itemId) }
      })

      if (!updatedItem) return restaurant

      return {
        ...restaurant,
        inventoryTypes: inventoryTypes.map((type) =>
          type.id === destinationType.id ? { ...type, items: [...type.items, updatedItem as InventoryItem] } : type,
        ),
      }
    })
  }

  const deleteInventoryItem = (itemId: number) => {
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      inventoryTypes: restaurant.inventoryTypes.map((type) => ({
        ...type,
        items: type.items.filter((item) => item.id !== itemId),
      })),
    }))
  }

  const addInventoryType = (type: { name: string; color: string }) => {
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      inventoryTypes: [
        ...restaurant.inventoryTypes,
        {
          id: Math.max(0, ...restaurant.inventoryTypes.map((existingType) => existingType.id)) + 1,
          name: type.name,
          color: type.color,
          active: true,
          items: [],
        },
      ],
    }))
  }

  const updateInventoryType = (id: number, data: { name?: string; color?: string; active?: boolean }) => {
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      inventoryTypes: restaurant.inventoryTypes.map((type) => {
        if (type.id !== id) return type
        const nextName = data.name ?? type.name
        return {
          ...type,
          ...data,
          items: type.items.map((item) => ({ ...item, type: nextName })),
        }
      }),
    }))
  }

  const deleteInventoryType = (id: number) => {
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      inventoryTypes: restaurant.inventoryTypes.filter((type) => type.id !== id),
    }))
  }

  const addCustomUnit = (unit: Omit<CustomUnit, "id">) => {
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      customUnits: [
        ...restaurant.customUnits,
        { ...unit, id: Math.max(0, ...restaurant.customUnits.map((customUnit) => customUnit.id)) + 1 },
      ],
    }))
  }

  const deleteCustomUnit = (id: number) => {
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      customUnits: restaurant.customUnits.filter((unit) => unit.id !== id),
    }))
  }

  const createAuditItems = (inventoryId: number): RestaurantAuditItem[] => {
    const inventory = selectedRestaurant.inventoryTypes.find((type) => type.id === inventoryId)
    return (inventory?.items ?? []).map((item) => ({
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      previousStock: item.quantity,
      currentStock: null,
      unit: item.unit,
      unitPrice: item.price,
      difference: null,
      result: "pending",
      notes: "",
    }))
  }

  const createAudit = (audit: { inventoryId: number; auditor: string; notes: string; auditDate: string }) => {
    const inventory = selectedRestaurant.inventoryTypes.find((type) => type.id === audit.inventoryId)
    if (!inventory) return

    const items = createAuditItems(audit.inventoryId)
    const nextNumber = selectedRestaurant.audits.length + 1
    const newAudit: RestaurantAudit = {
      id: `AUD-${selectedRestaurant.id}-${String(nextNumber).padStart(4, "0")}`,
      inventoryId: inventory.id,
      inventoryName: inventory.name,
      inventoryColor: inventory.color,
      auditor: audit.auditor,
      createdDate: audit.auditDate,
      startedDate: audit.auditDate,
      completedDate: null,
      status: "in-progress",
      totalItems: items.length,
      countedItems: 0,
      flaggedItems: 0,
      totalDiscrepancy: 0,
      compliance: 0,
      notes: audit.notes,
      items,
      comments: audit.notes.trim()
        ? [
            {
              id: 1,
              author: audit.auditor,
              date: audit.auditDate,
              content: audit.notes.trim(),
            },
          ]
        : [],
    }

    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      audits: [newAudit, ...restaurant.audits],
    }))
    setSelectedInventoryId(inventory.id)
  }

  const updateAuditItem = (auditId: string, itemId: number, currentStock: number, notes = "") => {
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      audits: restaurant.audits.map((audit) => {
        if (audit.id !== auditId) return audit

        const sourceItems = audit.items?.length ? audit.items : createAuditItems(audit.inventoryId)
        const items: RestaurantAuditItem[] = sourceItems.map((item) => {
          if (item.itemId !== itemId) return item
          const difference = item.previousStock - currentStock
          const result: RestaurantAuditItem["result"] = difference > 0 ? "sold" : difference < 0 ? "discrepancy" : "matched"
          return { ...item, currentStock, difference, result, notes }
        })
        const countedItems = items.filter((item) => item.result !== "pending").length
        const flaggedItems = items.filter((item) => item.result === "discrepancy").length
        const totalDiscrepancy = items.reduce((sum, item) => sum + (item.difference && item.difference < 0 ? item.difference * item.unitPrice : 0), 0)

        return {
          ...audit,
          items,
          countedItems,
          flaggedItems,
          totalDiscrepancy,
          status: audit.status === "completed" ? "completed" : "in-progress",
          completedDate: audit.completedDate,
          compliance: Math.round(((items.length - flaggedItems) / Math.max(items.length, 1)) * 100),
        }
      }),
    }))
  }

  const completeAudit = (auditId: string) => {
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      audits: restaurant.audits.map((audit) =>
        audit.id === auditId
          ? { ...audit, status: "completed", completedDate: new Date().toISOString().split("T")[0] }
          : audit,
      ),
    }))
  }

  const reopenAudit = (auditId: string) => {
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      audits: restaurant.audits.map((audit) =>
        audit.id === auditId
          ? { ...audit, status: "in-progress", completedDate: null }
          : audit,
      ),
    }))
  }

  const deleteAudit = (auditId: string) => {
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      audits: restaurant.audits.filter((audit) => audit.id !== auditId),
    }))
  }

  const addAuditComment = (auditId: string, comment: { author: string; content: string }) => {
    if (!comment.content.trim()) return

    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      audits: restaurant.audits.map((audit) => {
        if (audit.id !== auditId) return audit
        const comments = audit.comments ?? []
        const newComment: RestaurantAuditComment = {
          id: Math.max(0, ...comments.map((existingComment) => existingComment.id)) + 1,
          author: comment.author.trim() || audit.auditor,
          date: new Date().toISOString().split("T")[0],
          content: comment.content.trim(),
        }

        return {
          ...audit,
          comments: [...comments, newComment],
        }
      }),
    }))
  }

  const value = useMemo<AppContextValue>(
    () => ({
      restaurants,
      selectedRestaurant,
      selectedRestaurantId,
      currency,
      language,
      exchangeRate,
      converterAmount,
      convertedAmount: currency === "USD" ? converterAmount * exchangeRate : converterAmount / exchangeRate,
      selectedInventoryId,
      t,
      formatCurrency,
      setCurrency,
      setLanguage,
      setExchangeRate,
      setConverterAmount,
      setSelectedInventoryId,
      requestRestaurantSwitch,
      createRestaurant,
      updateSelectedRestaurant,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addInventoryType,
      updateInventoryType,
      deleteInventoryType,
      addCustomUnit,
      deleteCustomUnit,
      createAudit,
      updateAuditItem,
      completeAudit,
      reopenAudit,
      deleteAudit,
      addAuditComment,
    }),
    [restaurants, selectedRestaurant, selectedRestaurantId, currency, language, exchangeRate, converterAmount, selectedInventoryId],
  )

  return (
    <AppContext.Provider value={value}>
      {children}

      {pendingRestaurant && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ChefHat size={22} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{t("confirmSwitchTitle")}</h2>
                <p className="text-sm text-muted-foreground">{pendingRestaurant.name}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("confirmSwitchBody")}</p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setPendingRestaurantId(null)}>
                {t("cancel")}
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={confirmRestaurantSwitch}>
                {t("confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {loadingRestaurant && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-primary/15">
              <ChefHat size={34} className="text-primary" />
            </div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">{t("loadingRestaurant")}</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">{loadingRestaurant.name}</h2>
          </div>
        </div>
      )}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider")
  }
  return context
}
