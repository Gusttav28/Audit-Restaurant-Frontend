"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuditFlowLogo from "@/components/layout/audit-flow-logo"
import {
  type CustomUnit,
  type AppPermissions,
  type InventoryItem,
  type RestaurantAudit,
  type RestaurantAuditComment,
  type RestaurantAuditItem,
  type RestaurantInventory,
  type TeamMember,
  initialRestaurants,
} from "@/components/inventory/multi-restaurant-data"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

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
    creatingAudit: "Creating new audit...",
    requestErrorTitle: "Request error",
    requestErrorBody: "There was an error sending the request to our servers. Please check if you are connected to the internet.",
    reload: "Reload",
    refresh: "Refresh",
    auditPermission: "Audit",
    assignedAuditTasks: "Assigned audit tasks",
    assignedToYou: "Assigned to you",
    assignedWork: "Assigned work",
    assignedWorkSubtitle: "Audit tasks assigned by administrators",
    filterByCollaborator: "Filter by collaborator",
    allCollaborators: "All collaborators",
    editAssignedWork: "Edit assigned work",
    deleteAssignedWork: "Delete assigned work",
    deleteAssignedWorkBody: "This removes the assigned audit task. Type delete and the audit ID to confirm.",
    assignedUser: "Assigned user",
    taskType: "Task type",
    assignedDate: "Assigned date",
    noAssignedAuditTasks: "No assigned audit tasks.",
    openAuditTask: "Open audit",
    helper: "Helper",
    helperType: "Helper type",
    teamMember: "Team member",
    none: "None",
    temporaryCollaborator: "Temporary collaborator",
    assignAudit: "Assign audit",
    dueDate: "Due date",
    currency: "Currency",
    exchangeRate: "Exchange rate",
    convert: "Convert",
    language: "Language",
    theme: "Theme",
    lightMode: "Light mode",
    darkMode: "Dark mode",
    toggleSidebar: "Toggle sidebar",
    notifications: "Notifications",
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
    country: "Country",
    detectLocation: "Detect location",
    addressSuggestions: "Address suggestions",
    defaultCurrency: "Default currency",
    lastEdited: "Last edited",
    manageCategories: "Manage categories",
    editCategory: "Edit category",
    deleteCategory: "Delete category",
    reportSections: "Report sections",
    reportDetails: "Detailed view",
    reportHelp: "Section help",
    responsiblePerson: "Responsible person",
    allPeople: "All people",
    allInventories: "All inventories",
    auditStatus: "Audit status",
    allStatuses: "All statuses",
    inventoryIssueFilter: "Inventory issues",
    allIssues: "All issues",
    allCategories: "All categories",
    resetFilters: "Reset filters",
    itemsCount: "Items count",
    categoryValue: "Category value",
    percentageOfIssues: "Percentage of issues",
    avgIssuesHelp: "Average number of currently filtered inventory issues per filtered audit.",
    complianceRateHelp: "Average compliance percentage across completed audits that match the active filters.",
    avgAuditTimeHelp: "Estimated average audit duration based on completed audits and issue volume.",
    totalAuditsHelp: "Total audits matching the active responsible person, inventory, status, and date filters.",
    auditTrendHelp: "Shows completed audits over time so you can see whether audit cadence is improving.",
    issuesByCategoryHelp: "Groups low, critical, and expiring inventory items by category to show where attention is needed.",
    complianceByInventoryHelp: "Compares audit compliance across inventory areas for the selected restaurant.",
    issueSeverityHelp: "Shows the balance of critical, low, expiring, and stable inventory items.",
    auditDurationHelp: "Compares estimated audit duration against the number of issues found.",
    weeklyPerformanceHelp: "Summarizes recent completed audits, compliance, and issues found.",
    mermaQuantity: "Merma quantity",
    productionQuantity: "Production quantity",
    warning: "Warning",
    pricePerUnit: "Price per unit",
    priceCurrency: "Price currency",
    totalValue: "Total Value",
    supplier: "Supplier",
    providerDeleted: "Provider deleted",
    deleteProvider: "Delete provider",
    itemPhase: "Item Phase",
    noProductionStock: "No production stock",
    productionStock: "Production stock",
    mermaStock: "Merma Stock",
    createCategory: "Create category",
    categoryName: "Category name",
    noCategories: "No categories yet. Create one to continue.",
    previousStockView: "Previous stock",
    newStock: "New stock",
    completedOn: "Completed on",
    auditCompletedForInventory: "Audit completed for this inventory",
    auditHistory: "Audit History",
    auditHistorySubtitle: "Completed audits for the selected inventory",
    noAuditHistory: "No completed audits for this inventory yet.",
    open: "Open",
    viewAudit: "View audit",
    done: "Done",
    previewingAudit: "Previewing audit",
    creatingRestaurant: "Creating new restaurant...",
    restaurantCreationFailed: "Unable to create the restaurant. Your current restaurant was kept active. Please try again.",
    completingAudit: "Completing audit...",
    manageUnits: "Manage Units",
    createRestaurant: "Create new restaurant",
    createRestaurantTitle: "Create New Restaurant",
    location: "Location",
    restaurantItems: "Restaurant Items",
    inventoryTypes: "Inventory types",
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
    password: "Password",
    permissions: "Permissions",
    read: "Read",
    create: "Create",
    delete: "Delete",
    accessDenied: "Access denied",
    accessDeniedBody: "You do not have permission to access this page for the selected restaurant.",
    loadingData: "Loading data",
    multiplePhases: "Multiple phases",
    phaseDetails: "Phase details",
    noPermission: "No permission",
    logout: "Log out",
    loggingOut: "Logging out...",
    deleteItemTitle: "Delete item?",
    deleteItemBody: "This permanently removes the item from the selected restaurant inventory. Type delete and the item ID to confirm.",
    typeItemId: "Type item ID",
    requiredItemId: "Required item ID",
    assignedRestaurants: "Assigned restaurants",
    managedRestaurants: "Managed restaurants",
    managedRestaurantsDescription: "All restaurants connected to your admin account",
    editTeamMember: "Edit team member",
    deleteTeamMember: "Delete team member",
    deleteTeamMemberBody: "This removes the team member and revokes their access. Type delete and the member email to confirm.",
    passwordRequirements: "Password must be at least 8 characters and include one uppercase letter.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    assignedRestaurant: "Assigned restaurant",
    selectAtLeastOneRestaurant: "Select at least one restaurant.",
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
    creatingAudit: "Creando nueva auditoría...",
    requestErrorTitle: "Error de solicitud",
    requestErrorBody: "Hubo un error al enviar la solicitud a nuestros servidores. Por favor verifica si estás conectado a internet.",
    reload: "Recargar",
    refresh: "Actualizar",
    auditPermission: "Auditar",
    assignedAuditTasks: "Tareas de auditoría asignadas",
    assignedToYou: "Asignada a ti",
    assignedWork: "Trabajo asignado",
    assignedWorkSubtitle: "Tareas de auditoría asignadas por administradores",
    filterByCollaborator: "Filtrar por colaborador",
    allCollaborators: "Todos los colaboradores",
    editAssignedWork: "Editar trabajo asignado",
    deleteAssignedWork: "Eliminar trabajo asignado",
    deleteAssignedWorkBody: "Esto elimina la tarea de auditoría asignada. Escribe delete y el ID de auditoría para confirmar.",
    assignedUser: "Usuario asignado",
    taskType: "Tipo de tarea",
    assignedDate: "Fecha asignada",
    noAssignedAuditTasks: "No tienes auditorías asignadas.",
    openAuditTask: "Abrir auditoría",
    helper: "Ayudante",
    helperType: "Tipo de ayudante",
    teamMember: "Miembro del equipo",
    none: "Ninguno",
    temporaryCollaborator: "Colaborador temporal",
    assignAudit: "Asignar auditoría",
    dueDate: "Fecha límite",
    currency: "Moneda",
    exchangeRate: "Tipo de cambio",
    convert: "Convertir",
    language: "Idioma",
    theme: "Tema",
    lightMode: "Modo claro",
    darkMode: "Modo oscuro",
    toggleSidebar: "Alternar barra lateral",
    notifications: "Notificaciones",
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
    country: "País",
    detectLocation: "Detectar ubicación",
    addressSuggestions: "Sugerencias de dirección",
    defaultCurrency: "Moneda predeterminada",
    lastEdited: "Última edición",
    manageCategories: "Gestionar categorías",
    editCategory: "Editar categoría",
    deleteCategory: "Eliminar categoría",
    reportSections: "Secciones del reporte",
    reportDetails: "Vista detallada",
    reportHelp: "Ayuda de sección",
    responsiblePerson: "Responsable",
    allPeople: "Todas las personas",
    allInventories: "Todos los inventarios",
    auditStatus: "Estado de auditoría",
    allStatuses: "Todos los estados",
    inventoryIssueFilter: "Problemas de inventario",
    allIssues: "Todos los problemas",
    allCategories: "Todas las categorías",
    resetFilters: "Restablecer filtros",
    itemsCount: "Cantidad de artículos",
    categoryValue: "Valor de categoría",
    percentageOfIssues: "Porcentaje de problemas",
    avgIssuesHelp: "Promedio de problemas de inventario filtrados por cada auditoría filtrada.",
    complianceRateHelp: "Porcentaje promedio de cumplimiento en auditorías completadas que coinciden con los filtros activos.",
    avgAuditTimeHelp: "Duración promedio estimada de auditoría según auditorías completadas y volumen de problemas.",
    totalAuditsHelp: "Auditorías totales que coinciden con los filtros activos de responsable, inventario, estado y fecha.",
    auditTrendHelp: "Muestra auditorías completadas en el tiempo para entender si la cadencia de auditoría mejora.",
    issuesByCategoryHelp: "Agrupa artículos con stock bajo, crítico o próximos a vencer por categoría para ver dónde hay que actuar.",
    complianceByInventoryHelp: "Compara el cumplimiento de auditorías entre áreas de inventario del restaurante seleccionado.",
    issueSeverityHelp: "Muestra el balance entre artículos críticos, bajos, próximos a vencer y estables.",
    auditDurationHelp: "Compara la duración estimada de auditoría contra la cantidad de problemas encontrados.",
    weeklyPerformanceHelp: "Resume auditorías recientes completadas, cumplimiento y problemas encontrados.",
    mermaQuantity: "Cantidad Merma",
    productionQuantity: "Cantidad de producción",
    warning: "Advertencia",
    pricePerUnit: "Precio por unidad",
    priceCurrency: "Moneda del precio",
    totalValue: "Valor Total",
    supplier: "Proveedor",
    providerDeleted: "Proveedor eliminado",
    deleteProvider: "Eliminar proveedor",
    itemPhase: "Fase del Artículo",
    noProductionStock: "Sin stock de producción",
    productionStock: "Stock de producción",
    mermaStock: "Merma Stock",
    createCategory: "Crear categoría",
    categoryName: "Nombre de categoría",
    noCategories: "Aún no hay categorías. Crea una para continuar.",
    previousStockView: "Stock anterior",
    newStock: "Nuevo stock",
    completedOn: "Completado el",
    auditCompletedForInventory: "Auditoría completada para este inventario",
    auditHistory: "Historial de Auditorías",
    auditHistorySubtitle: "Auditorías completadas del inventario seleccionado",
    noAuditHistory: "Aún no hay auditorías completadas para este inventario.",
    open: "Abrir",
    viewAudit: "Ver auditoría",
    done: "Listo",
    previewingAudit: "Vista de auditoría",
    creatingRestaurant: "Creando nuevo restaurante...",
    restaurantCreationFailed: "No se pudo crear el restaurante. Tu restaurante actual se mantuvo activo. Inténtalo de nuevo.",
    completingAudit: "Completando auditoría...",
    manageUnits: "Gestionar Unidades",
    createRestaurant: "Crear nuevo restaurante",
    createRestaurantTitle: "Crear Nuevo Restaurante",
    location: "Ubicación",
    restaurantItems: "Artículos del Restaurante",
    inventoryTypes: "Tipos de inventario",
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
    password: "Contraseña",
    permissions: "Permisos",
    read: "Leer",
    create: "Crear",
    delete: "Eliminar",
    accessDenied: "Acceso denegado",
    accessDeniedBody: "No tienes permiso para acceder a esta página para el restaurante seleccionado.",
    loadingData: "Cargando datos",
    multiplePhases: "Múltiples fases",
    phaseDetails: "Detalles de fase",
    noPermission: "Sin permiso",
    logout: "Cerrar sesión",
    loggingOut: "Cerrando sesión...",
    deleteItemTitle: "¿Eliminar artículo?",
    deleteItemBody: "Esto elimina permanentemente el artículo del inventario del restaurante seleccionado. Escribe delete y el ID del artículo para confirmar.",
    typeItemId: "Escribe el ID del artículo",
    requiredItemId: "ID de artículo requerido",
    assignedRestaurants: "Restaurantes asignados",
    managedRestaurants: "Restaurantes administrados",
    managedRestaurantsDescription: "Todos los restaurantes conectados a tu cuenta administradora",
    editTeamMember: "Editar miembro",
    deleteTeamMember: "Eliminar miembro",
    deleteTeamMemberBody: "Esto elimina al miembro y revoca su acceso. Escribe delete y el correo del miembro para confirmar.",
    passwordRequirements: "La contraseña debe tener al menos 8 caracteres e incluir una letra mayúscula.",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    assignedRestaurant: "Restaurante asignado",
    selectAtLeastOneRestaurant: "Selecciona al menos un restaurante.",
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
  currentUserName: string
  currentUserEmail: string
  assignedAuditTasks: RestaurantAudit[]
  assignedAuditWork: RestaurantAudit[]
  currentPermissions: AppPermissions
  isAdmin: boolean
  isPrimaryAdmin: boolean
  isRouteLoading: boolean
  isAppLoading: boolean
  t: (key: TranslationKey) => string
  can: (permission: keyof AppPermissions) => boolean
  formatCurrency: (amountUsd: number) => string
  setCurrency: (currency: CurrencyCode) => void
  setLanguage: (language: LanguageCode) => void
  setExchangeRate: (rate: number) => void
  setConverterAmount: (amount: number) => void
  setSelectedInventoryId: (inventoryId: number | null) => void
  startRouteLoading: () => void
  clearRequestLoading: () => void
  refreshAssignedWork: () => Promise<void>
  requestRestaurantSwitch: (restaurantId: number) => void
  createRestaurant: (restaurant: { name: string; location?: string; country?: string; email: string; phone: string; address: string }) => Promise<string | null>
  updateSelectedRestaurant: (updater: (restaurant: RestaurantInventory) => RestaurantInventory) => void
  addInventoryItem: (typeId: number, item: Omit<InventoryItem, "id" | "restaurantId" | "typeId">) => void
  updateInventoryItem: (itemId: number, data: Partial<InventoryItem>) => void
  deleteInventoryItem: (itemId: number) => Promise<{ ok: boolean; error?: string }>
  addInventoryType: (type: { name: string; color: string }) => void
  updateInventoryType: (id: number, data: { name?: string; color?: string; active?: boolean }) => void
  deleteInventoryType: (id: number) => void
  addItemCategory: (inventoryTypeId: number, category: string) => void
  renameItemCategory: (inventoryTypeId: number, oldCategory: string, nextCategory: string) => void
  deleteItemCategory: (inventoryTypeId: number, category: string) => void
  addSupplier: (supplier: string) => void
  deleteSupplier: (supplier: string) => void
  addCustomUnit: (unit: Omit<CustomUnit, "id">) => void
  deleteCustomUnit: (id: number) => void
  createAudit: (audit: { inventoryId: number; auditor: string; auditorId?: string; notes: string; auditDate: string; helperName?: string; temporaryHelperName?: string }, options?: { keepLoading?: boolean }) => Promise<string | null>
  updateAuditItem: (auditId: string, itemId: number, currentStock: number, notes?: string) => void
  completeAudit: (auditId: string) => void
  reopenAudit: (auditId: string) => void
  deleteAudit: (auditId: string) => void
  addAuditComment: (auditId: string, comment: { author: string; content: string }) => void
  addTeamMember: (member: { name: string; email: string; password: string; role: TeamMember["role"]; permissions: AppPermissions; restaurantId?: string; restaurantIds?: string[] }) => Promise<{ ok: boolean; error?: string }>
  updateTeamMember: (member: { id?: string; userId?: string; name: string; email: string; role: TeamMember["role"]; permissions: AppPermissions; restaurantId?: string; restaurantIds?: string[] }) => Promise<{ ok: boolean; error?: string }>
  deleteTeamMember: (member: { id?: string; userId?: string; restaurantId?: string }) => Promise<{ ok: boolean; error?: string }>
}

const AppContext = createContext<AppContextValue | null>(null)

const countryCurrency: Record<string, { currency: CurrencyCode; exchangeRateToUsd: number }> = {
  "Costa Rica": { currency: "CRC", exchangeRateToUsd: 1 / DEFAULT_USD_CRC_RATE },
  "United States": { currency: "USD", exchangeRateToUsd: 1 },
  "United States of America": { currency: "USD", exchangeRateToUsd: 1 },
  Mexico: { currency: "USD", exchangeRateToUsd: 1 },
  Spain: { currency: "USD", exchangeRateToUsd: 1 },
}

type RestaurantRow = Database["public"]["Tables"]["restaurants"]["Row"]
type RestaurantMemberRow = Database["public"]["Tables"]["restaurant_members"]["Row"]
type InventoryTypeRow = Database["public"]["Tables"]["inventory_types"]["Row"]
type InventoryItemRow = Database["public"]["Tables"]["inventory_items"]["Row"]
type CategoryRow = Database["public"]["Tables"]["item_categories"]["Row"]
type SupplierRow = Database["public"]["Tables"]["suppliers"]["Row"]
type CustomUnitRow = Database["public"]["Tables"]["custom_units"]["Row"]
type AuditRow = Database["public"]["Tables"]["audits"]["Row"]
type StockHistoryRow = Database["public"]["Tables"]["stock_history"]["Row"]
type AuditItemRow = {
  id: string
  audit_id: string
  inventory_item_id: string | null
  item_name: string
  category: string
  previous_stock: number
  current_stock: number | null
  unit: string
  unit_price: number
  phase: "none" | "production" | "merma" | null
  merma_quantity: number | null
  production_quantity: number | null
  difference: number | null
  result: "pending" | "sold" | "discrepancy" | "matched"
  notes: string
}
type AuditCommentRow = Database["public"]["Tables"]["audit_comments"]["Row"] & {
  audit_id: string
  author_name: string
  content: string
  created_at: string
}

const fullPermissions: AppPermissions = { read: true, audit: true, create: true, edit: true, delete: true }
const readOnlyPermissions: AppPermissions = { read: true, audit: false, create: false, edit: false, delete: false }

const normalizePermissions = (permissions: unknown, role?: string): AppPermissions => {
  if (role === "owner" || role === "admin") return fullPermissions
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return readOnlyPermissions
  const value = permissions as Partial<AppPermissions>
  return {
    read: value.read ?? true,
    audit: value.audit ?? value.create ?? false,
    create: value.create ?? false,
    edit: value.edit ?? false,
    delete: value.delete ?? false,
  }
}

const roleToTeamRole = (role: RestaurantMemberRow["role"]): TeamMember["role"] => {
  if (role === "owner" || role === "admin") return "Admin"
  if (role === "auditor") return "Auditor"
  return "Collaborator"
}

const teamRoleToDbRole = (role: TeamMember["role"]): RestaurantMemberRow["role"] => {
  if (role === "Admin") return "admin"
  if (role === "Auditor") return "auditor"
  return "collaborator"
}

const createAuditCode = (restaurantId: number, auditDate: string, existingAudits: RestaurantAudit[]) => {
  const datePart = (auditDate || new Date().toISOString().slice(0, 10)).replaceAll("-", "")
  const prefix = `AUD-${restaurantId}-${datePart}-`
  const nextSequence =
    existingAudits.reduce((highest, audit) => {
      if (!audit.id.startsWith(prefix)) return highest
      const sequence = Number.parseInt(audit.id.slice(prefix.length), 10)
      return Number.isFinite(sequence) ? Math.max(highest, sequence) : highest
    }, 0) + 1

  return `${prefix}${String(nextSequence).padStart(3, "0")}`
}

const defaultRestaurantSettings = {
  auditNotifications: true,
  inventoryAlerts: true,
  weeklyReports: true,
  lowStockThreshold: 5,
}

const normalizeSettings = (settings: unknown): RestaurantInventory["settings"] => {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return defaultRestaurantSettings
  const value = settings as Partial<RestaurantInventory["settings"]>
  return {
    auditNotifications: value.auditNotifications ?? true,
    inventoryAlerts: value.inventoryAlerts ?? true,
    weeklyReports: value.weeklyReports ?? true,
    lowStockThreshold: value.lowStockThreshold ?? 5,
  }
}

type SupabaseDataClient = Omit<ReturnType<typeof createSupabaseBrowserClient>, "from"> & {
  from: (table: string) => any
}

const createSupabaseDataClient = () => createSupabaseBrowserClient() as unknown as SupabaseDataClient
const assignmentMarkerPattern = /\n?\[AuditFlowAssignment:([^:]+):([^\]]+)\]/
const helperLinePattern = /(?:^|\n)Helper: ([^\n]+)/
const temporaryHelperLinePattern = /(?:^|\n)Temporary collaborator: ([^\n]+)|(?:^|\n)Colaborador temporal: ([^\n]+)/
const APP_DATA_CACHE_TTL = 60_000
const APP_DATA_CACHE_STORAGE_PREFIX = "auditflow-app-data-cache:v1:"

type CachedAppData = {
  restaurants: RestaurantInventory[]
  selectedRestaurantRemoteId?: string
  selectedInventoryRemoteId?: string
  currency: CurrencyCode
  currentUserEmail: string
  currentUserName: string
  fetchedAt: number
}

const appDataCache = new Map<string, CachedAppData>()

const readPersistentAppDataCache = (cacheKey: string): CachedAppData | null => {
  if (typeof window === "undefined") return null
  try {
    const rawValue = window.localStorage.getItem(`${APP_DATA_CACHE_STORAGE_PREFIX}${cacheKey}`)
    if (!rawValue) return null
    const parsed = JSON.parse(rawValue) as Partial<CachedAppData>
    if (!Array.isArray(parsed.restaurants) || typeof parsed.fetchedAt !== "number") return null
    const cached = parsed as CachedAppData
    appDataCache.set(cacheKey, cached)
    return cached
  } catch (error) {
    console.warn("Failed to read AuditNett app data cache", error)
    return null
  }
}

const writePersistentAppDataCache = (cacheKey: string, cached: CachedAppData) => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(`${APP_DATA_CACHE_STORAGE_PREFIX}${cacheKey}`, JSON.stringify(cached))
  } catch (error) {
    console.warn("Failed to write AuditNett app data cache", error)
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const shouldLoadAppData = ["/dashboard", "/inventory", "/audits", "/reports", "/assigned-work", "/team", "/settings", "/profile"].some((route) =>
    pathname.startsWith(route),
  )
  const hasAuthTransition = typeof window !== "undefined" && window.sessionStorage.getItem("auditflow-auth-transition") === "login"
  const [restaurants, setRestaurants] = useState<RestaurantInventory[]>(initialRestaurants)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(initialRestaurants[0].id)
  const [pendingRestaurantId, setPendingRestaurantId] = useState<number | null>(null)
  const [loadingRestaurantId, setLoadingRestaurantId] = useState<number | null>(null)
  const [creatingRestaurantName, setCreatingRestaurantName] = useState<string | null>(null)
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [language, setLanguage] = useState<LanguageCode>("en")
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_CRC_RATE)
  const [converterAmount, setConverterAmount] = useState(1)
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(initialRestaurants[0].inventoryTypes[0]?.id ?? null)
  const [isLoadingSupabaseData, setIsLoadingSupabaseData] = useState(hasAuthTransition && shouldLoadAppData)
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const [routeLoadingStartPath, setRouteLoadingStartPath] = useState<string | null>(null)
  const [requestLoadingMessage, setRequestLoadingMessage] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<{ title: string; body: string } | null>(null)
  const [currentUserName, setCurrentUserName] = useState("Admin")
  const [currentUserEmail, setCurrentUserEmail] = useState("")
  const [authUserId, setAuthUserId] = useState<string | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [hasLoadedSupabaseData, setHasLoadedSupabaseData] = useState(false)

  const selectedRestaurant =
    restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? restaurants[0] ?? initialRestaurants[0]
  const pendingRestaurant = restaurants.find((restaurant) => restaurant.id === pendingRestaurantId)
  const loadingRestaurant = restaurants.find((restaurant) => restaurant.id === loadingRestaurantId)
  const currentPermissions = selectedRestaurant.currentUserPermissions ?? readOnlyPermissions
  const isAdmin = selectedRestaurant.currentUserRole === "owner" || selectedRestaurant.currentUserRole === "admin" || currentPermissions.delete
  const isPrimaryAdmin = selectedRestaurant.currentUserRole === "owner"
  const can = (permission: keyof AppPermissions) => isAdmin || Boolean(currentPermissions[permission])
  const assignedAuditTasks = selectedRestaurant.audits.filter(
    (audit) =>
      audit.status !== "completed" &&
      Boolean(audit.assignedByAdminId) &&
      audit.auditorId === authUserId,
  )
  const assignedAuditWork = isAdmin
    ? selectedRestaurant.audits.filter((audit) => audit.assignedByAdminId === authUserId)
    : []
  const isAppLoading = Boolean(isRouteLoading || (shouldLoadAppData && !isAuthReady) || loadingRestaurant || creatingRestaurantName || isLoadingSupabaseData || requestLoadingMessage)
  const shouldUseFullScreenLoading = shouldLoadAppData && !hasAuthTransition && !hasLoadedSupabaseData && !isRouteLoading && !loadingRestaurant && !creatingRestaurantName && !requestLoadingMessage
  const selectedInventoryRemoteId = selectedRestaurant.inventoryTypes.find((type) => type.id === selectedInventoryId)?.remoteId

  const startRouteLoading = () => {
    setRouteLoadingStartPath(pathname)
    setIsRouteLoading(true)
  }

  const clearRequestLoading = () => {
    setRequestLoadingMessage(null)
  }

  const refreshAssignedWork = async () => {
    if (!selectedRestaurant.remoteId) return
    const supabase = createSupabaseDataClient()
    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("restaurant_id", selectedRestaurant.remoteId)
      .order("created_at", { ascending: false })

    if (error) {
      syncError("assigned work refresh", error)
      return
    }

    const refreshedRows = (data ?? []) as AuditRow[]
    setRestaurants((currentRestaurants) =>
      currentRestaurants.map((restaurant) => {
        if (restaurant.id !== selectedRestaurantId) return restaurant
        const refreshedAudits = refreshedRows.map((auditRow) => {
          const existingAudit = restaurant.audits.find((audit) => audit.remoteId === auditRow.id || audit.id === auditRow.audit_code)
          const inventoryType = restaurant.inventoryTypes.find((type) => type.remoteId === auditRow.inventory_type_id)
          const assignmentMatch = auditRow.notes.match(assignmentMarkerPattern)
          const helperMatch = auditRow.notes.match(helperLinePattern)
          const temporaryHelperMatch = auditRow.notes.match(temporaryHelperLinePattern)
          const cleanNotes = auditRow.notes.replace(assignmentMarkerPattern, "").replace(helperLinePattern, "").replace(temporaryHelperLinePattern, "").trim()

          return {
            ...(existingAudit ?? {}),
            id: auditRow.audit_code,
            remoteId: auditRow.id,
            inventoryId: inventoryType?.id ?? existingAudit?.inventoryId ?? 0,
            inventoryName: inventoryType?.name ?? existingAudit?.inventoryName ?? "Inventory",
            inventoryColor: inventoryType?.color ?? existingAudit?.inventoryColor ?? "#3b82f6",
            auditor: auditRow.auditor_name,
            auditorId: auditRow.auditor_id ?? undefined,
            assignedByAdminId: assignmentMatch?.[1],
            assignedByAdminName: assignmentMatch?.[2],
            assignedDate: assignmentMatch ? auditRow.created_date : undefined,
            helperName: helperMatch?.[1],
            temporaryHelperName: temporaryHelperMatch?.[1] ?? temporaryHelperMatch?.[2],
            dueDate: auditRow.created_date,
            createdDate: auditRow.created_date,
            startedDate: auditRow.started_date,
            completedDate: auditRow.completed_date,
            status: auditRow.status,
            totalItems: auditRow.total_items,
            countedItems: auditRow.counted_items,
            flaggedItems: auditRow.flagged_items,
            totalDiscrepancy: Number(auditRow.total_discrepancy),
            compliance: auditRow.compliance,
            notes: cleanNotes,
            items: existingAudit?.items ?? [],
            comments: existingAudit?.comments ?? [],
          } satisfies RestaurantAudit
        })

        return { ...restaurant, audits: refreshedAudits }
      }),
    )
  }

  useEffect(() => {
    if (!isRouteLoading) return
    if (routeLoadingStartPath === pathname) return
    const destinationDataReady = !shouldLoadAppData || (isAuthReady && !isLoadingSupabaseData)
    if (!destinationDataReady) return

    const frame = window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        setIsRouteLoading(false)
        setRouteLoadingStartPath(null)
      }, 120)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isAuthReady, isLoadingSupabaseData, isRouteLoading, pathname, routeLoadingStartPath, shouldLoadAppData])

  useEffect(() => {
    if (!loadingRestaurantId || selectedRestaurantId !== loadingRestaurantId) return

    const frame = window.requestAnimationFrame(() => {
      window.setTimeout(() => setLoadingRestaurantId(null), 120)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [loadingRestaurantId, selectedRestaurantId, selectedInventoryId])

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

  useEffect(() => {
    const supabase = createSupabaseDataClient()
    let isMounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setAuthUserId(data.user?.id ?? null)
        setIsAuthReady(true)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUserId(session?.user?.id ?? null)
      setIsAuthReady(true)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const cacheKey = authUserId ? `app:${authUserId}` : null

    const applyCachedData = (cached: CachedAppData) => {
      const cachedSelectedRestaurant =
        cached.restaurants.find((restaurant) => restaurant.remoteId === cached.selectedRestaurantRemoteId) ??
        cached.restaurants[0]
      const cachedSelectedInventory =
        cachedSelectedRestaurant?.inventoryTypes.find((type) => type.remoteId === cached.selectedInventoryRemoteId) ??
        cachedSelectedRestaurant?.inventoryTypes[0]

      setRestaurants(cached.restaurants)
      setSelectedRestaurantId(cachedSelectedRestaurant?.id ?? cached.restaurants[0]?.id ?? 0)
      setSelectedInventoryId(cachedSelectedInventory?.id ?? null)
      setCurrency(cached.currency)
      setCurrentUserEmail(cached.currentUserEmail)
      setCurrentUserName(cached.currentUserName)
      setHasLoadedSupabaseData(true)
    }

    const loadSupabaseData = async () => {
      if (!shouldLoadAppData) {
        setIsLoadingSupabaseData(false)
        window.sessionStorage.removeItem("auditflow-auth-transition")
        return
      }
      if (!isAuthReady) {
        setIsLoadingSupabaseData(true)
        return
      }
      if (!authUserId) {
        setRestaurants([])
        setSelectedRestaurantId(0)
        setSelectedInventoryId(null)
        setCurrentUserEmail("")
        setCurrentUserName("")
        setHasLoadedSupabaseData(false)
        setIsLoadingSupabaseData(false)
        window.sessionStorage.removeItem("auditflow-auth-transition")
        return
      }
      const cached = cacheKey ? appDataCache.get(cacheKey) ?? readPersistentAppDataCache(cacheKey) ?? undefined : undefined
      const shouldRevalidateCachedData = cached ? Date.now() - cached.fetchedAt > APP_DATA_CACHE_TTL : false
      if (cached && isMounted) {
        applyCachedData(cached)
        setIsLoadingSupabaseData(false)
        window.sessionStorage.removeItem("auditflow-auth-transition")
        if (!shouldRevalidateCachedData) return
      } else {
        setIsLoadingSupabaseData(!hasLoadedSupabaseData)
      }

      try {
        const supabase = createSupabaseDataClient()
        const { data: authData } = await supabase.auth.getUser()

        if (!authData.user || authData.user.id !== authUserId) {
          if (isMounted) {
            setCurrentUserEmail("")
            setCurrentUserName("")
            setHasLoadedSupabaseData(false)
            setIsLoadingSupabaseData(false)
            window.sessionStorage.removeItem("auditflow-auth-transition")
          }
          return
        }

        const authUserName =
          (authData.user.user_metadata?.full_name as string | undefined) ??
          (authData.user.email ? authData.user.email.split("@")[0] : "Admin")
        if (isMounted) {
          setCurrentUserEmail(authData.user.email ?? "")
          setCurrentUserName(authUserName)
        }

        const { data: restaurantRows, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .order("created_at", { ascending: true })

        if (restaurantError) throw restaurantError
        if (!restaurantRows?.length) {
          if (isMounted) {
            if (!cached && restaurants.length === 0) {
              setRestaurants([])
              setSelectedRestaurantId(0)
              setSelectedInventoryId(null)
            }
            setIsLoadingSupabaseData(false)
            window.sessionStorage.removeItem("auditflow-auth-transition")
          }
          return
        }

        const restaurantData = restaurantRows as RestaurantRow[]
        const allRestaurantIds = restaurantData.map((restaurant) => restaurant.id)

        const [
          inventoryTypesResult,
          inventoryItemsResult,
          categoriesResult,
          suppliersResult,
          customUnitsResult,
          auditsResult,
          stockHistoryResult,
          membersResult,
        ] = await Promise.all([
          supabase.from("inventory_types").select("*").in("restaurant_id", allRestaurantIds).order("sort_order", { ascending: true }),
          supabase.from("inventory_items").select("*").in("restaurant_id", allRestaurantIds).order("created_at", { ascending: true }),
          supabase.from("item_categories").select("*").in("restaurant_id", allRestaurantIds).order("name", { ascending: true }),
          supabase.from("suppliers").select("*").in("restaurant_id", allRestaurantIds).order("name", { ascending: true }),
          supabase.from("custom_units").select("*").in("restaurant_id", allRestaurantIds).order("created_at", { ascending: true }),
          supabase.from("audits").select("*").in("restaurant_id", allRestaurantIds).order("created_at", { ascending: false }),
          supabase.from("stock_history").select("*").in("restaurant_id", allRestaurantIds).order("completed_date", { ascending: false }),
          supabase.from("restaurant_members").select("*").in("restaurant_id", allRestaurantIds),
        ])

        if (inventoryTypesResult.error) throw inventoryTypesResult.error
        if (inventoryItemsResult.error) throw inventoryItemsResult.error
        if (categoriesResult.error) throw categoriesResult.error
        if (suppliersResult.error) throw suppliersResult.error
        if (customUnitsResult.error) throw customUnitsResult.error
        if (auditsResult.error) throw auditsResult.error
        if (stockHistoryResult.error) throw stockHistoryResult.error
        if (membersResult.error) throw membersResult.error

        const memberRows = (membersResult.data ?? []) as RestaurantMemberRow[]
        const memberUserIds = Array.from(new Set(memberRows.map((member) => member.user_id)))
        const profilesResult = memberUserIds.length
          ? await supabase.from("profiles").select("id,email,full_name").in("id", memberUserIds)
          : { data: [], error: null }
        if (profilesResult.error) throw profilesResult.error
        const profileById = new Map(
          ((profilesResult.data ?? []) as Array<{ id: string; email: string; full_name: string }>).map((profile) => [profile.id, profile]),
        )
        const accessibleRestaurantData = restaurantData.filter((restaurant) =>
          restaurant.created_by === authData.user.id ||
          memberRows.some((member) => member.restaurant_id === restaurant.id && member.user_id === authData.user.id),
        )

        const auditData = (auditsResult.data ?? []) as AuditRow[]
        const auditIds = auditData.map((audit) => audit.id)
        const [auditItemsResult, auditCommentsResult] = auditIds.length
          ? await Promise.all([
              supabase.from("audit_items").select("*").in("audit_id", auditIds),
              supabase.from("audit_comments").select("*").in("audit_id", auditIds).order("created_at", { ascending: true }),
            ])
          : [{ data: [], error: null }, { data: [], error: null }]

        if (auditItemsResult.error) throw auditItemsResult.error
        if (auditCommentsResult.error) throw auditCommentsResult.error

        const inventoryTypeIdMap = new Map<string, number>()
        const inventoryItemIdMap = new Map<string, number>()

        const mappedRestaurants = accessibleRestaurantData.map((restaurant, restaurantIndex) => {
          const localRestaurantId = restaurantIndex + 1
          const restaurantInventoryTypes = ((inventoryTypesResult.data ?? []) as InventoryTypeRow[])
            .filter((type) => type.restaurant_id === restaurant.id)
            .map((type, typeIndex) => {
              const localTypeId = typeIndex + 1
              inventoryTypeIdMap.set(type.id, localTypeId)
              return {
                id: localTypeId,
                remoteId: type.id,
                name: type.name,
                color: type.color,
                active: type.active,
                items: [],
              }
            })

          const restaurantItems = ((inventoryItemsResult.data ?? []) as InventoryItemRow[]).filter((item) => item.restaurant_id === restaurant.id)
          const restaurantMembers = memberRows.filter((member) => member.restaurant_id === restaurant.id)
          const currentMember = restaurantMembers.find((member) => member.user_id === authData.user.id)
          const effectiveCurrentRole = currentMember?.role ?? (restaurant.created_by === authData.user.id ? "owner" : "collaborator")
          const effectiveCurrentPermissions = normalizePermissions(currentMember?.permissions, effectiveCurrentRole)
          const restaurantStockHistory = ((stockHistoryResult.data ?? []) as StockHistoryRow[]).filter((history) => history.restaurant_id === restaurant.id)
          restaurantItems.forEach((item, itemIndex) => {
            inventoryItemIdMap.set(item.id, itemIndex + 1)
          })

          const inventoryTypesWithItems = restaurantInventoryTypes.map((type) => ({
            ...type,
            items: restaurantItems
              .filter((item) => inventoryTypeIdMap.get(item.inventory_type_id) === type.id)
              .map((item) => ({
                id: inventoryItemIdMap.get(item.id) ?? 0,
                remoteId: item.id,
                restaurantId: localRestaurantId,
                typeId: type.id,
                name: item.name,
                type: type.name,
                category: item.category_name,
                quantity: Number(item.quantity),
                unit: item.unit,
                minStock: Number(item.min_stock),
                status: item.status,
                price: Number(item.price_usd),
                priceCurrency: item.price_currency,
                phase: item.phase ?? undefined,
                mermaQuantity: item.merma_quantity ?? undefined,
                productionQuantity: item.production_quantity ?? undefined,
                lastUpdated: item.last_updated,
                supplier: item.supplier_name,
                daysUntilExpiry: item.days_until_expiry,
                stockHistory: restaurantStockHistory
                  .filter((history) => history.inventory_item_id === item.id)
                  .map((history) => ({
                    auditId: auditData.find((audit) => audit.id === history.audit_id)?.audit_code ?? history.audit_id ?? "",
                    completedDate: history.completed_date,
                    previousStock: Number(history.previous_stock),
                    newStock: Number(history.new_stock),
                  })),
              })),
          }))

          const restaurantAudits = auditData
            .filter((audit) => audit.restaurant_id === restaurant.id)
            .map((audit) => {
              const inventoryType = restaurantInventoryTypes.find((type) => type.id === inventoryTypeIdMap.get(audit.inventory_type_id))
              const assignmentMatch = audit.notes.match(assignmentMarkerPattern)
              const helperMatch = audit.notes.match(helperLinePattern)
              const temporaryHelperMatch = audit.notes.match(temporaryHelperLinePattern)
              const cleanNotes = audit.notes.replace(assignmentMarkerPattern, "").replace(helperLinePattern, "").replace(temporaryHelperLinePattern, "").trim()
              const auditItems = ((auditItemsResult.data ?? []) as AuditItemRow[])
                .filter((item) => item.audit_id === audit.id)
                .map((item) => ({
                  itemId: item.inventory_item_id ? inventoryItemIdMap.get(item.inventory_item_id) ?? 0 : 0,
                  remoteId: item.id,
                  inventoryItemRemoteId: item.inventory_item_id ?? undefined,
                  itemName: item.item_name,
                  category: item.category,
                  previousStock: Number(item.previous_stock),
                  currentStock: item.current_stock === null ? null : Number(item.current_stock),
                  unit: item.unit,
                  unitPrice: Number(item.unit_price),
                  phase: item.phase ?? undefined,
                  mermaQuantity: item.merma_quantity ?? undefined,
                  productionQuantity: item.production_quantity ?? undefined,
                  difference: item.difference === null ? null : Number(item.difference),
                  result: item.result,
                  notes: item.notes,
                }))
              const auditComments = ((auditCommentsResult.data ?? []) as AuditCommentRow[])
                .filter((comment) => comment.audit_id === audit.id)
                .map((comment, commentIndex) => ({
                  id: commentIndex + 1,
                  remoteId: comment.id,
                  author: comment.author_name,
                  date: comment.created_at.split("T")[0],
                  content: comment.content,
                }))

              return {
                id: audit.audit_code,
                remoteId: audit.id,
                inventoryId: inventoryTypeIdMap.get(audit.inventory_type_id) ?? 0,
                inventoryName: inventoryType?.name ?? "Inventory",
                inventoryColor: inventoryType?.color ?? "#3b82f6",
                auditor: audit.auditor_name,
                auditorId: audit.auditor_id ?? undefined,
                assignedByAdminId: assignmentMatch?.[1],
                assignedByAdminName: assignmentMatch?.[2],
                assignedDate: assignmentMatch ? audit.created_date : undefined,
                helperName: helperMatch?.[1],
                temporaryHelperName: temporaryHelperMatch?.[1] ?? temporaryHelperMatch?.[2],
                createdDate: audit.created_date,
                startedDate: audit.started_date,
                completedDate: audit.completed_date,
                status: audit.status,
                totalItems: audit.total_items,
                countedItems: audit.counted_items,
                flaggedItems: audit.flagged_items,
                totalDiscrepancy: Number(audit.total_discrepancy),
                compliance: audit.compliance,
                notes: cleanNotes,
                items: auditItems,
                comments: auditComments,
              }
            })

          const mappedRestaurant: RestaurantInventory = {
            id: localRestaurantId,
            remoteId: restaurant.id,
            name: restaurant.name,
            location: restaurant.location,
            country: restaurant.country,
            defaultCurrency: restaurant.default_currency,
            exchangeRateToUsd: Number(restaurant.exchange_rate_to_usd),
            email: restaurant.email,
            phone: restaurant.phone,
            address: restaurant.address,
            settings: normalizeSettings(restaurant.settings),
            inventoryTypes: inventoryTypesWithItems,
            customUnits: ((customUnitsResult.data ?? []) as CustomUnitRow[])
              .filter((unit) => unit.restaurant_id === restaurant.id)
              .map((unit, unitIndex) => ({
                id: unitIndex + 1,
                remoteId: unit.id,
                name: unit.name,
                abbreviation: unit.abbreviation,
                baseUnit: unit.base_unit,
                conversionFactor: Number(unit.conversion_factor),
                category: ["weight", "volume", "quantity", "custom"].includes(unit.category)
                  ? unit.category as CustomUnit["category"]
                  : "custom",
              })),
            itemCategories: ((categoriesResult.data ?? []) as CategoryRow[])
              .filter((category) => category.restaurant_id === restaurant.id)
              .reduce<Record<number, string[]>>((acc, category) => {
                const localTypeId = category.inventory_type_id ? inventoryTypeIdMap.get(category.inventory_type_id) : undefined
                if (!localTypeId) return acc
                acc[localTypeId] ??= []
                acc[localTypeId].push(category.name)
                return acc
              }, {}),
            suppliers: ((suppliersResult.data ?? []) as SupplierRow[])
              .filter((supplier) => supplier.restaurant_id === restaurant.id)
              .map((supplier) => supplier.name),
            inventoryLastEdited: restaurant.inventory_last_edited ?? undefined,
            currentUserRole: effectiveCurrentRole,
            currentUserPermissions: effectiveCurrentPermissions,
            teamMembers: [
              ...restaurantMembers,
              ...(currentMember || restaurant.created_by !== authData.user.id
                ? []
                : [{
                    id: `owner-${restaurant.id}`,
                    restaurant_id: restaurant.id,
                    user_id: authData.user.id,
                    role: "owner" as const,
                    permissions: fullPermissions,
                    created_at: restaurant.created_at,
                  }]),
            ].map((member) => ({
              id: member.id,
              userId: member.user_id,
              name: profileById.get(member.user_id)?.full_name || (member.user_id === authData.user.id ? authUserName : roleToTeamRole(member.role)),
              email: profileById.get(member.user_id)?.email || (member.user_id === authData.user.id ? authData.user.email ?? "" : ""),
              role: roleToTeamRole(member.role),
              permissions: normalizePermissions(member.permissions, member.role),
              restaurantIds: memberRows
                .filter((userMember) => userMember.user_id === member.user_id)
                .map((userMember) => userMember.restaurant_id),
            })),
            audits: restaurantAudits,
          }

          return mappedRestaurant
        })

        if (!isMounted || mappedRestaurants.length === 0) return

        const nextSelectedRestaurant =
          mappedRestaurants.find((restaurant) => restaurant.remoteId === selectedRestaurant.remoteId) ??
          mappedRestaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ??
          mappedRestaurants[0]
        const nextSelectedInventory =
          nextSelectedRestaurant.inventoryTypes.find((type) => type.remoteId === selectedInventoryRemoteId) ??
          nextSelectedRestaurant.inventoryTypes[0]
        const nextCurrency = nextSelectedRestaurant.defaultCurrency ?? "USD"

        if (cacheKey) {
          const nextCachedData = {
            restaurants: mappedRestaurants,
            selectedRestaurantRemoteId: nextSelectedRestaurant.remoteId,
            selectedInventoryRemoteId: nextSelectedInventory?.remoteId,
            currency: nextCurrency,
            currentUserEmail: authData.user.email ?? "",
            currentUserName: authUserName,
            fetchedAt: Date.now(),
          }
          appDataCache.set(cacheKey, nextCachedData)
          writePersistentAppDataCache(cacheKey, nextCachedData)
        }

        setRestaurants(mappedRestaurants)
        setSelectedRestaurantId(nextSelectedRestaurant.id)
        setSelectedInventoryId(nextSelectedInventory?.id ?? null)
        setCurrency(nextCurrency)
        setHasLoadedSupabaseData(true)
      } catch (error) {
        console.error("Failed to load Supabase data", error)
      } finally {
        if (isMounted) {
          setIsLoadingSupabaseData(false)
          window.sessionStorage.removeItem("auditflow-auth-transition")
        }
      }
    }

    loadSupabaseData()

    return () => {
      isMounted = false
    }
  }, [authUserId, shouldLoadAppData, isAuthReady])

  useEffect(() => {
    if (!authUserId || !hasLoadedSupabaseData || !shouldLoadAppData || restaurants.length === 0) return

    const cacheKey = `app:${authUserId}`
    const cached: CachedAppData = {
      restaurants,
      selectedRestaurantRemoteId: selectedRestaurant.remoteId,
      selectedInventoryRemoteId,
      currency,
      currentUserEmail,
      currentUserName,
      fetchedAt: Date.now(),
    }
    appDataCache.set(cacheKey, cached)
    writePersistentAppDataCache(cacheKey, cached)
  }, [
    authUserId,
    currency,
    currentUserEmail,
    currentUserName,
    hasLoadedSupabaseData,
    restaurants,
    selectedInventoryRemoteId,
    selectedRestaurant.remoteId,
    shouldLoadAppData,
  ])

  const t = (key: TranslationKey) => dictionary[language][key] ?? dictionary.en[key]

  const formatCurrency = (amountUsd: number) => {
    const amount = currency === "CRC" ? amountUsd * exchangeRate : amountUsd
    return new Intl.NumberFormat(language === "es" ? "es-CR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "CRC" ? 0 : 2,
    }).format(amount)
  }

  const isConnectivityError = (error: unknown) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return true

    const message = error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : String(error ?? "")

    return /failed to fetch|fetch failed|networkerror|network error|load failed|internet|offline|timeout|timed out|connection|abort/i.test(message)
  }

  const syncError = (scope: string, error: unknown) => {
    console.error(`Failed to sync ${scope} with Supabase`, error)
    if (isConnectivityError(error)) {
      setRequestError({ title: dictionary[language].requestErrorTitle, body: dictionary[language].requestErrorBody })
    }
  }

  const getInventoryStatus = (quantity: number, minStock: number): InventoryItem["status"] => {
    if (quantity <= 0) return "critical"
    if (quantity <= minStock) return "low"
    if (quantity <= minStock * 1.5) return "warning"
    return "good"
  }

  const getRemoteAudit = async (audit: RestaurantAudit) => {
    if (audit.remoteId) return audit.remoteId
    if (!selectedRestaurant.remoteId) return null

    const supabase = createSupabaseDataClient()
    const { data, error } = await supabase
      .from("audits")
      .select("id")
      .eq("restaurant_id", selectedRestaurant.remoteId)
      .eq("audit_code", audit.id)
      .single()

    if (error) {
      syncError("audit lookup", error)
      return null
    }

    return data.id
  }

  const touchRemoteInventory = async (restaurantRemoteId?: string, editedAt = new Date().toISOString()) => {
    if (!restaurantRemoteId) return
    const supabase = createSupabaseDataClient()
    const { error } = await supabase
      .from("restaurants")
      .update({ inventory_last_edited: editedAt })
      .eq("id", restaurantRemoteId)
    if (error) syncError("inventory last edited date", error)
  }

  const requestRestaurantSwitch = (restaurantId: number) => {
    if (restaurantId === selectedRestaurantId) return
    if (!restaurants.some((restaurant) => restaurant.id === restaurantId)) return
    setPendingRestaurantId(restaurantId)
  }

  const confirmRestaurantSwitch = () => {
    if (!pendingRestaurantId) return
    const targetRestaurantId = pendingRestaurantId
    setLoadingRestaurantId(targetRestaurantId)
    setPendingRestaurantId(null)

    window.setTimeout(() => {
      const nextRestaurant = restaurants.find((restaurant) => restaurant.id === targetRestaurantId)
      setSelectedRestaurantId(targetRestaurantId)
      setSelectedInventoryId(nextRestaurant?.inventoryTypes[0]?.id ?? null)
      setCurrency(nextRestaurant?.defaultCurrency ?? "USD")
      if (authUserId && nextRestaurant) {
        const cacheKey = `app:${authUserId}`
        const cached = appDataCache.get(cacheKey)
        if (cached) {
          const nextCachedData = {
            ...cached,
            selectedRestaurantRemoteId: nextRestaurant.remoteId,
            selectedInventoryRemoteId: nextRestaurant.inventoryTypes[0]?.remoteId,
            currency: nextRestaurant.defaultCurrency ?? "USD",
          }
          appDataCache.set(cacheKey, nextCachedData)
          writePersistentAppDataCache(cacheKey, nextCachedData)
        }
      }
    }, 900)
  }

  const createRestaurant = async (restaurant: { name: string; location?: string; country?: string; email: string; phone: string; address: string }) => {
    if (!isPrimaryAdmin) return null
    const nextId = Math.max(0, ...restaurants.map((existingRestaurant) => existingRestaurant.id)) + 1
    setCreatingRestaurantName(restaurant.name)
    const country = restaurant.country || restaurant.location || "United States"
    const currencyInfo = countryCurrency[country] ?? { currency: "USD" as CurrencyCode, exchangeRateToUsd: 1 }

    try {
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: restaurant.name,
          country,
          location: restaurant.location || restaurant.address || country,
          address: restaurant.address,
          email: restaurant.email,
          phone: restaurant.phone,
          defaultCurrency: currencyInfo.currency,
          exchangeRateToUsd: currencyInfo.exchangeRateToUsd,
        }),
      })

      const payload = await response.json().catch(() => null) as {
        restaurant?: RestaurantRow
        member?: RestaurantMemberRow
        inventoryType?: InventoryTypeRow
        error?: string
      } | null

      if (!response.ok || !payload?.restaurant || !payload.member || !payload.inventoryType) {
        throw new Error(payload?.error ?? "Restaurant creation failed")
      }

      const createdRestaurant = payload.restaurant
      const createdMember = payload.member
      const createdInventoryType = payload.inventoryType

      if (createdMember.role !== "owner") {
        throw new Error("Owner access could not be verified")
      }

      const remoteRestaurant: RestaurantInventory = {
        id: nextId,
        remoteId: createdRestaurant.id,
        name: createdRestaurant.name,
        location: createdRestaurant.location || country,
        country: createdRestaurant.country || country,
        defaultCurrency: createdRestaurant.default_currency,
        exchangeRateToUsd: createdRestaurant.exchange_rate_to_usd,
        email: createdRestaurant.email,
        phone: createdRestaurant.phone,
        address: createdRestaurant.address,
        settings: normalizeSettings(createdRestaurant.settings),
        currentUserRole: "owner",
        currentUserPermissions: fullPermissions,
        inventoryTypes: [
          {
            id: 1,
            remoteId: createdInventoryType.id,
            name: createdInventoryType.name,
            color: createdInventoryType.color,
            active: createdInventoryType.active,
            items: [],
          },
        ],
        customUnits: [],
        itemCategories: [],
        suppliers: [],
        audits: [],
        teamMembers: [{
          id: createdMember.id,
          userId: createdMember.user_id,
          name: currentUserName,
          email: currentUserEmail,
          role: "Admin",
          permissions: fullPermissions,
        }],
      }

      setRestaurants((currentRestaurants) => {
        const withoutDuplicate = currentRestaurants.filter((existingRestaurant) => existingRestaurant.remoteId !== remoteRestaurant.remoteId)
        return [...withoutDuplicate, remoteRestaurant]
      })
      setSelectedRestaurantId(remoteRestaurant.id)
      setSelectedInventoryId(remoteRestaurant.inventoryTypes[0]?.id ?? null)
      const nextCurrency = remoteRestaurant.defaultCurrency ?? currencyInfo.currency
      setCurrency(nextCurrency)

      if (authUserId) {
        const cacheKey = `app:${authUserId}`
        const cached = appDataCache.get(cacheKey)
        const nextCachedData: CachedAppData = {
          restaurants: [...(cached?.restaurants ?? restaurants).filter((existingRestaurant) => existingRestaurant.remoteId !== remoteRestaurant.remoteId), remoteRestaurant],
          selectedRestaurantRemoteId: remoteRestaurant.remoteId,
          selectedInventoryRemoteId: remoteRestaurant.inventoryTypes[0]?.remoteId,
          currency: nextCurrency,
          currentUserEmail,
          currentUserName,
          fetchedAt: Date.now(),
        }
        appDataCache.set(cacheKey, nextCachedData)
        writePersistentAppDataCache(cacheKey, nextCachedData)
      }

      return remoteRestaurant.remoteId ?? `restaurant-${nextId}`
    } catch (error) {
      console.error("Failed to create restaurant with Supabase", error)
      setRequestError({ title: dictionary[language].requestErrorTitle, body: dictionary[language].restaurantCreationFailed })
      return null
    } finally {
      setCreatingRestaurantName(null)
    }
  }

  const updateSelectedRestaurant = (updater: (restaurant: RestaurantInventory) => RestaurantInventory) => {
    if (!can("edit")) return
    setRestaurants((currentRestaurants) =>
      currentRestaurants.map((restaurant) =>
        restaurant.id === selectedRestaurantId ? updater(restaurant) : restaurant,
      ),
    )
  }

  const addInventoryItem = (typeId: number, item: Omit<InventoryItem, "id" | "restaurantId" | "typeId">) => {
    if (!can("create")) return
    const targetType = selectedRestaurant.inventoryTypes.find((type) => type.id === typeId)
    const nextId =
      Math.max(0, ...selectedRestaurant.inventoryTypes.flatMap((type) => type.items.map((existingItem) => existingItem.id))) + 1
    const editedAt = new Date().toISOString()

    updateSelectedRestaurant((restaurant) => {
      return {
        ...restaurant,
        inventoryLastEdited: editedAt,
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

    if (!selectedRestaurant.remoteId || !targetType?.remoteId) return

    void (async () => {
      const supabase = createSupabaseDataClient()
      const { data, error } = await supabase
        .from("inventory_items")
        .insert({
          restaurant_id: selectedRestaurant.remoteId,
          inventory_type_id: targetType.remoteId,
          name: item.name,
          category_name: item.category,
          supplier_name: item.supplier,
          quantity: item.quantity,
          unit: item.unit,
          min_stock: item.minStock,
          status: getInventoryStatus(item.quantity, item.minStock),
          price_usd: item.price,
          price_currency: item.priceCurrency ?? selectedRestaurant.defaultCurrency ?? currency,
          phase: item.phase ?? null,
          merma_quantity: item.mermaQuantity ?? null,
          production_quantity: item.productionQuantity ?? null,
          days_until_expiry: item.daysUntilExpiry,
          last_updated: editedAt.split("T")[0],
        })
        .select("*")
        .single()

      if (error) {
        syncError("inventory item creation", error)
        return
      }

      await touchRemoteInventory(selectedRestaurant.remoteId, editedAt)
      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((restaurant) =>
          restaurant.id === selectedRestaurantId
            ? {
                ...restaurant,
                inventoryTypes: restaurant.inventoryTypes.map((type) =>
                  type.id === typeId
                    ? {
                        ...type,
                        items: type.items.map((existingItem) =>
                          existingItem.id === nextId ? { ...existingItem, remoteId: data.id } : existingItem,
                        ),
                      }
                    : type,
                ),
              }
            : restaurant,
        ),
      )
    })()
  }

  const updateInventoryItem = (itemId: number, data: Partial<InventoryItem>) => {
    if (!can("edit")) return
    const currentType = selectedRestaurant.inventoryTypes.find((type) => type.items.some((item) => item.id === itemId))
    const currentItem = currentType?.items.find((item) => item.id === itemId)
    const destinationType =
      selectedRestaurant.inventoryTypes.find((type) => type.name === data.type) ??
      currentType
    const editedAt = new Date().toISOString()

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
          status: data.status ?? getInventoryStatus(data.quantity ?? currentItem.quantity, data.minStock ?? currentItem.minStock),
        }

        return { ...type, items: type.items.filter((item) => item.id !== itemId) }
      })

      if (!updatedItem) return restaurant

      return {
        ...restaurant,
        inventoryLastEdited: editedAt,
        inventoryTypes: inventoryTypes.map((type) =>
          type.id === destinationType.id ? { ...type, items: [...type.items, updatedItem as InventoryItem] } : type,
        ),
      }
    })

    if (!currentItem?.remoteId || !destinationType?.remoteId) return

    const nextQuantity = data.quantity ?? currentItem.quantity
    const nextMinStock = data.minStock ?? currentItem.minStock
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { error } = await supabase
        .from("inventory_items")
        .update({
          inventory_type_id: destinationType.remoteId,
          name: data.name ?? currentItem.name,
          category_name: data.category ?? currentItem.category,
          supplier_name: data.supplier ?? currentItem.supplier,
          quantity: nextQuantity,
          unit: data.unit ?? currentItem.unit,
          min_stock: nextMinStock,
          status: getInventoryStatus(nextQuantity, nextMinStock),
          price_usd: data.price ?? currentItem.price,
          price_currency: data.priceCurrency ?? currentItem.priceCurrency ?? selectedRestaurant.defaultCurrency ?? currency,
          phase: data.phase ?? currentItem.phase ?? null,
          merma_quantity: data.mermaQuantity ?? currentItem.mermaQuantity ?? null,
          production_quantity: data.productionQuantity ?? currentItem.productionQuantity ?? null,
          days_until_expiry: data.daysUntilExpiry ?? currentItem.daysUntilExpiry,
          last_updated: editedAt.split("T")[0],
        })
        .eq("id", currentItem.remoteId)

      if (error) syncError("inventory item update", error)
      await touchRemoteInventory(selectedRestaurant.remoteId, editedAt)
    })()
  }

  const deleteInventoryItem = async (itemId: number) => {
    if (!can("delete")) return { ok: false, error: "Not allowed" }
    const currentItem = selectedRestaurant.inventoryTypes
      .flatMap((type) => type.items)
      .find((item) => item.id === itemId)
    const editedAt = new Date().toISOString()

    setRequestLoadingMessage(t("loadingData"))
    try {
      if (currentItem?.remoteId) {
        const supabase = createSupabaseDataClient()
        const { error } = await supabase.from("inventory_items").delete().eq("id", currentItem.remoteId)
        if (error) throw error
        await touchRemoteInventory(selectedRestaurant.remoteId, editedAt)
      }

    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      inventoryLastEdited: editedAt,
      inventoryTypes: restaurant.inventoryTypes.map((type) => ({
        ...type,
        items: type.items.filter((item) => item.id !== itemId),
      })),
    }))
      return { ok: true }
    } catch (error) {
      syncError("inventory item deletion", error)
      return { ok: false, error: "Could not delete inventory item" }
    } finally {
      setRequestLoadingMessage(null)
    }
  }

  const addInventoryType = (type: { name: string; color: string }) => {
    if (!isPrimaryAdmin) return
    const nextId = Math.max(0, ...selectedRestaurant.inventoryTypes.map((existingType) => existingType.id)) + 1
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      inventoryTypes: [
        ...restaurant.inventoryTypes,
        {
          id: nextId,
          name: type.name,
          color: type.color,
          active: true,
          items: [],
        },
      ],
    }))

    if (!selectedRestaurant.remoteId) return
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { data, error } = await supabase
        .from("inventory_types")
        .insert({
          restaurant_id: selectedRestaurant.remoteId,
          name: type.name,
          color: type.color,
          active: true,
          sort_order: nextId,
        })
        .select("*")
        .single()

      if (error) {
        syncError("inventory type creation", error)
        return
      }

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((restaurant) =>
          restaurant.id === selectedRestaurantId
            ? {
                ...restaurant,
                inventoryTypes: restaurant.inventoryTypes.map((existingType) =>
                  existingType.id === nextId ? { ...existingType, remoteId: data.id } : existingType,
                ),
              }
            : restaurant,
        ),
      )
    })()
  }

  const updateInventoryType = (id: number, data: { name?: string; color?: string; active?: boolean }) => {
    if (!can("edit")) return
    const currentType = selectedRestaurant.inventoryTypes.find((type) => type.id === id)

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

    if (!currentType?.remoteId) return
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { error } = await supabase
        .from("inventory_types")
        .update({
          name: data.name ?? currentType.name,
          color: data.color ?? currentType.color,
          active: data.active ?? currentType.active,
        })
        .eq("id", currentType.remoteId)
      if (error) syncError("inventory type update", error)
    })()
  }

  const deleteInventoryType = (id: number) => {
    if (!isPrimaryAdmin) return
    const currentType = selectedRestaurant.inventoryTypes.find((type) => type.id === id)

    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      inventoryTypes: restaurant.inventoryTypes.filter((type) => type.id !== id),
    }))

    if (!currentType?.remoteId) return
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { error } = await supabase.from("inventory_types").delete().eq("id", currentType.remoteId)
      if (error) syncError("inventory type deletion", error)
    })()
  }

  const addItemCategory = (inventoryTypeId: number, category: string) => {
    const trimmedCategory = category.trim()
    const inventoryType = selectedRestaurant.inventoryTypes.find((type) => type.id === inventoryTypeId)
    if (!trimmedCategory || !inventoryType || !can("create")) return
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      itemCategories: {
        ...(typeof restaurant.itemCategories === "object" && !Array.isArray(restaurant.itemCategories) ? restaurant.itemCategories : {}),
        [inventoryTypeId]: Array.from(new Set([
          ...(
            Array.isArray(restaurant.itemCategories)
              ? restaurant.itemCategories
              : restaurant.itemCategories?.[inventoryTypeId] ?? []
          ),
          trimmedCategory,
        ])),
      },
    }))

    if (!selectedRestaurant.remoteId || !inventoryType.remoteId) return
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { error, data } = await supabase
        .from("item_categories")
        .upsert(
          { restaurant_id: selectedRestaurant.remoteId, inventory_type_id: inventoryType.remoteId, name: trimmedCategory },
          { onConflict: "restaurant_id,inventory_type_id,name" },
        )
        .select("id,name,inventory_type_id")
      if (error) syncError("category creation", { message: error.message, details: error.details, hint: error.hint, code: error.code, payload: { restaurantId: selectedRestaurant.remoteId, inventoryTypeId: inventoryType.remoteId, name: trimmedCategory } })
      if (!error && !data) syncError("category creation", { message: "No row returned from category upsert" })
    })()
  }

  const renameItemCategory = (inventoryTypeId: number, oldCategory: string, nextCategory: string) => {
    const trimmedCategory = nextCategory.trim()
    const inventoryType = selectedRestaurant.inventoryTypes.find((type) => type.id === inventoryTypeId)
    if (!trimmedCategory || !inventoryType || !can("edit")) return
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      inventoryLastEdited: new Date().toISOString(),
      itemCategories: {
        ...(typeof restaurant.itemCategories === "object" && !Array.isArray(restaurant.itemCategories) ? restaurant.itemCategories : {}),
        [inventoryTypeId]: Array.from(new Set((
          Array.isArray(restaurant.itemCategories)
            ? restaurant.itemCategories
            : restaurant.itemCategories?.[inventoryTypeId] ?? []
        ).map((category) => category === oldCategory ? trimmedCategory : category))),
      },
      inventoryTypes: restaurant.inventoryTypes.map((type) => ({
        ...type,
        items: type.id === inventoryTypeId
          ? type.items.map((item) => item.category === oldCategory ? { ...item, category: trimmedCategory } : item)
          : type.items,
      })),
    }))

    if (!selectedRestaurant.remoteId || !inventoryType.remoteId) return
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { error } = await supabase
        .from("item_categories")
        .update({ name: trimmedCategory })
        .eq("restaurant_id", selectedRestaurant.remoteId)
        .eq("inventory_type_id", inventoryType.remoteId)
        .eq("name", oldCategory)
      if (error) syncError("category rename", { message: error.message, details: error.details, hint: error.hint, code: error.code })
    })()
  }

  const deleteItemCategory = (inventoryTypeId: number, category: string) => {
    const inventoryType = selectedRestaurant.inventoryTypes.find((type) => type.id === inventoryTypeId)
    if (!inventoryType || !can("delete")) return
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      inventoryLastEdited: new Date().toISOString(),
      itemCategories: {
        ...(typeof restaurant.itemCategories === "object" && !Array.isArray(restaurant.itemCategories) ? restaurant.itemCategories : {}),
        [inventoryTypeId]: (
          Array.isArray(restaurant.itemCategories)
            ? restaurant.itemCategories
            : restaurant.itemCategories?.[inventoryTypeId] ?? []
        ).filter((existingCategory) => existingCategory !== category),
      },
      inventoryTypes: restaurant.inventoryTypes.map((type) => ({
        ...type,
        items: type.id === inventoryTypeId
          ? type.items.map((item) => item.category === category ? { ...item, category: "" } : item)
          : type.items,
      })),
    }))

    if (!selectedRestaurant.remoteId || !inventoryType.remoteId) return
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { error } = await supabase
        .from("item_categories")
        .delete()
        .eq("restaurant_id", selectedRestaurant.remoteId)
        .eq("inventory_type_id", inventoryType.remoteId)
        .eq("name", category)
      if (error) syncError("category deletion", { message: error.message, details: error.details, hint: error.hint, code: error.code })
    })()
  }

  const addSupplier = (supplier: string) => {
    if (!can("create")) return
    const trimmedSupplier = supplier.trim()
    if (!trimmedSupplier) return
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      suppliers: Array.from(new Set([...(restaurant.suppliers ?? []), trimmedSupplier])),
    }))

    if (!selectedRestaurant.remoteId) return
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { error } = await supabase
        .from("suppliers")
        .upsert({ restaurant_id: selectedRestaurant.remoteId, name: trimmedSupplier }, { onConflict: "restaurant_id,name" })
      if (error) syncError("supplier creation", error)
    })()
  }

  const deleteSupplier = (supplier: string) => {
    if (!can("delete")) return
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      suppliers: (restaurant.suppliers ?? []).filter((existingSupplier) => existingSupplier !== supplier),
      inventoryTypes: restaurant.inventoryTypes.map((type) => ({
        ...type,
        items: type.items.map((item) => item.supplier === supplier ? { ...item, supplier: "" } : item),
      })),
    }))

    if (!selectedRestaurant.remoteId) return
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("restaurant_id", selectedRestaurant.remoteId)
        .eq("name", supplier)
      if (error) syncError("supplier deletion", error)
    })()
  }

  const addCustomUnit = (unit: Omit<CustomUnit, "id">) => {
    if (!can("create")) return
    const nextId = Math.max(0, ...selectedRestaurant.customUnits.map((customUnit) => customUnit.id)) + 1
    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      customUnits: [
        ...restaurant.customUnits,
        { ...unit, id: nextId },
      ],
    }))

    if (!selectedRestaurant.remoteId) return
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { data, error } = await supabase
        .from("custom_units")
        .insert({
          restaurant_id: selectedRestaurant.remoteId,
          name: unit.name,
          abbreviation: unit.abbreviation,
          base_unit: unit.baseUnit,
          conversion_factor: unit.conversionFactor,
          category: unit.category,
        })
        .select("*")
        .single()

      if (error) {
        syncError("custom unit creation", error)
        return
      }

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((restaurant) =>
          restaurant.id === selectedRestaurantId
            ? {
                ...restaurant,
                customUnits: restaurant.customUnits.map((customUnit) =>
                  customUnit.id === nextId ? { ...customUnit, remoteId: data.id } : customUnit,
                ),
              }
            : restaurant,
        ),
      )
    })()
  }

  const deleteCustomUnit = (id: number) => {
    if (!can("delete")) return
    const currentUnit = selectedRestaurant.customUnits.find((unit) => unit.id === id)

    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      customUnits: restaurant.customUnits.filter((unit) => unit.id !== id),
    }))

    if (!currentUnit?.remoteId) return
    void (async () => {
      const supabase = createSupabaseDataClient()
      const { error } = await supabase.from("custom_units").delete().eq("id", currentUnit.remoteId)
      if (error) syncError("custom unit deletion", error)
    })()
  }

  const createAuditItems = (inventoryId: number): RestaurantAuditItem[] => {
    const inventory = selectedRestaurant.inventoryTypes.find((type) => type.id === inventoryId)
    return (inventory?.items ?? []).map((item) => ({
      itemId: item.id,
      inventoryItemRemoteId: item.remoteId,
      itemName: item.name,
      category: item.category,
      previousStock: item.quantity,
      currentStock: null,
      unit: item.unit,
      unitPrice: item.price,
      phase: item.phase,
      mermaQuantity: item.mermaQuantity,
      productionQuantity: item.productionQuantity,
      difference: null,
      result: "pending",
      notes: "",
    }))
  }

  const createAudit = async (
    audit: { inventoryId: number; auditor: string; auditorId?: string; notes: string; auditDate: string; helperName?: string; temporaryHelperName?: string },
    options?: { keepLoading?: boolean },
  ) => {
    if (!can("audit")) return null
    const inventory = selectedRestaurant.inventoryTypes.find((type) => type.id === audit.inventoryId)
    if (!inventory) return null
    setRequestLoadingMessage(t("creatingAudit"))

    const items = createAuditItems(audit.inventoryId)
    const selectedAuditorId = audit.auditorId?.trim() || undefined
    const isAdminAssigned = isAdmin && Boolean(selectedAuditorId) && selectedAuditorId !== authUserId
    const assignmentNotes = [
      audit.notes,
      audit.helperName ? `${t("helper")}: ${audit.helperName}` : "",
      audit.temporaryHelperName ? `${t("temporaryCollaborator")}: ${audit.temporaryHelperName}` : "",
    ].filter(Boolean).join("\n")
    const persistedNotes = `${assignmentNotes}${isAdminAssigned ? `\n[AuditFlowAssignment:${authUserId}:${currentUserName}]` : ""}`.trim()
    const newAudit: RestaurantAudit = {
      id: createAuditCode(selectedRestaurant.id, audit.auditDate, selectedRestaurant.audits),
      inventoryId: inventory.id,
      inventoryName: inventory.name,
      inventoryColor: inventory.color,
      auditor: audit.auditor,
      auditorId: selectedAuditorId,
      assignedByAdminId: isAdminAssigned ? authUserId ?? undefined : undefined,
      assignedByAdminName: isAdminAssigned ? currentUserName : undefined,
      assignedDate: isAdminAssigned ? audit.auditDate : undefined,
      helperName: audit.helperName,
      temporaryHelperName: audit.temporaryHelperName,
      dueDate: audit.auditDate,
      createdDate: audit.auditDate,
      startedDate: audit.auditDate,
      completedDate: null,
      status: "in-progress",
      totalItems: items.length,
      countedItems: 0,
      flaggedItems: 0,
      totalDiscrepancy: 0,
      compliance: 0,
      notes: assignmentNotes,
      items,
      comments: assignmentNotes.trim()
        ? [
            {
              id: 1,
              author: audit.auditor,
              date: audit.auditDate,
              content: assignmentNotes.trim(),
            },
          ]
        : [],
    }

    try {
      if (selectedRestaurant.remoteId && inventory.remoteId) {
          const response = await fetch("/api/audits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restaurantId: selectedRestaurant.remoteId,
              inventoryTypeId: inventory.remoteId,
              auditCode: newAudit.id,
              auditorId: selectedAuditorId,
              auditorName: audit.auditor,
              auditDate: audit.auditDate,
              notes: persistedNotes,
              helperName: audit.helperName,
              temporaryHelperName: audit.temporaryHelperName,
              items,
            }),
          })
          const result = await response.json().catch(() => ({}))
          if (!response.ok) {
            throw new Error(result.error ?? "Could not create audit")
          }

          const auditRow = result.audit as AuditRow
          const auditItemRows = (result.auditItems ?? []) as AuditItemRow[]
          const commentRow = (result.comment ?? null) as AuditCommentRow | null

          setRestaurants((currentRestaurants) =>
            currentRestaurants.map((restaurant) =>
              restaurant.id === selectedRestaurantId
                ? {
                    ...restaurant,
                    audits: [newAudit, ...restaurant.audits].map((existingAudit) =>
                      existingAudit.id === newAudit.id
                        ? {
                            ...existingAudit,
                            remoteId: auditRow.id,
                            items: existingAudit.items?.map((existingItem) => {
                              const remoteItem = auditItemRows.find(
                                (row) =>
                                  row.inventory_item_id === existingItem.inventoryItemRemoteId ||
                                  row.item_name === existingItem.itemName,
                              )
                              return remoteItem ? { ...existingItem, remoteId: remoteItem.id } : existingItem
                            }),
                            comments: existingAudit.comments?.map((existingComment) =>
                              commentRow && existingComment.id === 1
                                ? { ...existingComment, remoteId: commentRow.id }
                                : existingComment,
                            ),
                          }
                        : existingAudit,
                    ),
                  }
                : restaurant,
            ),
          )
      } else {
        updateSelectedRestaurant((restaurant) => ({
          ...restaurant,
          audits: [newAudit, ...restaurant.audits],
        }))
      }
      setSelectedInventoryId(inventory.id)
      return newAudit.id
    } catch (error) {
      syncError("audit creation", error)
      return null
    } finally {
      if (!options?.keepLoading) {
        setRequestLoadingMessage(null)
      }
    }
  }

  const updateAuditItem = (auditId: string, itemId: number, currentStock: number, notes = "") => {
    if (!can("audit")) return
    const currentAudit = selectedRestaurant.audits.find((audit) => audit.id === auditId)
    const currentAuditItem = (currentAudit?.items?.length ? currentAudit.items : createAuditItems(currentAudit?.inventoryId ?? 0))
      .find((item) => item.itemId === itemId)
    const difference = currentAuditItem ? currentAuditItem.previousStock - currentStock : null
    const result: RestaurantAuditItem["result"] =
      difference === null ? "pending" : difference > 0 ? "sold" : difference < 0 ? "discrepancy" : "matched"
    const nextItems = (currentAudit?.items?.length ? currentAudit.items : createAuditItems(currentAudit?.inventoryId ?? 0)).map((item) =>
      item.itemId === itemId ? { ...item, currentStock, difference, result, notes } : item,
    )
    const countedItems = nextItems.filter((item) => item.result !== "pending").length
    const flaggedItems = nextItems.filter((item) => item.result === "discrepancy").length
    const totalDiscrepancy = nextItems.reduce((sum, item) => sum + (item.difference && item.difference < 0 ? item.difference * item.unitPrice : 0), 0)
    const compliance = Math.round(((nextItems.length - flaggedItems) / Math.max(nextItems.length, 1)) * 100)

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

    if (!currentAudit || !currentAuditItem) return
    void (async () => {
      const remoteAuditId = await getRemoteAudit(currentAudit)
      if (!remoteAuditId) return

      const supabase = createSupabaseDataClient()
      const updateQuery = supabase
        .from("audit_items")
        .update({
          current_stock: currentStock,
          difference,
          result,
          notes,
        })

      if (currentAuditItem.remoteId || currentAuditItem.inventoryItemRemoteId) {
        const { error: itemError } = currentAuditItem.remoteId
          ? await updateQuery.eq("id", currentAuditItem.remoteId)
          : await updateQuery
              .eq("audit_id", remoteAuditId)
              .eq("inventory_item_id", currentAuditItem.inventoryItemRemoteId as string)

        if (itemError) syncError("audit item update", itemError)
      }

      const { error: auditError } = await supabase
        .from("audits")
        .update({
          counted_items: countedItems,
          flagged_items: flaggedItems,
          total_discrepancy: totalDiscrepancy,
          compliance,
          status: currentAudit.status === "completed" ? "completed" : "in-progress",
        })
        .eq("id", remoteAuditId)
      if (auditError) syncError("audit progress update", auditError)
    })()
  }

  const completeAudit = (auditId: string) => {
    if (!can("audit")) return
    const currentAudit = selectedRestaurant.audits.find((audit) => audit.id === auditId)
    const completedDate = new Date().toISOString().split("T")[0]

    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      inventoryLastEdited: new Date().toISOString(),
      audits: restaurant.audits.map((audit) => {
        if (audit.id !== auditId) return audit
        return { ...audit, status: "completed", completedDate: new Date().toISOString().split("T")[0] }
      }),
      inventoryTypes: restaurant.inventoryTypes.map((type) => {
        const completedAudit = restaurant.audits.find((audit) => audit.id === auditId)
        if (!completedAudit || completedAudit.inventoryId !== type.id) return type
        return {
          ...type,
          items: type.items.map((item) => {
            const auditedItem = completedAudit.items?.find((auditItem) => auditItem.itemId === item.id)
            if (!auditedItem || auditedItem.currentStock === null) return item
            return {
              ...item,
              quantity: auditedItem.currentStock,
              status: auditedItem.currentStock <= 0 ? "critical" : auditedItem.currentStock <= item.minStock ? "low" : "good",
              lastUpdated: completedDate,
              stockHistory: [
                ...(item.stockHistory ?? []),
                {
                  auditId,
                  completedDate,
                  previousStock: auditedItem.previousStock,
                  newStock: auditedItem.currentStock,
                },
              ],
            }
          }),
        }
      }),
    }))

    if (!currentAudit || !selectedRestaurant.remoteId) return
    void (async () => {
      const remoteAuditId = await getRemoteAudit(currentAudit)
      if (!remoteAuditId) return

      const supabase = createSupabaseDataClient()
      const auditItems = currentAudit.items ?? []
      const flaggedItems = auditItems.filter((item) => item.result === "discrepancy").length
      const totalDiscrepancy = auditItems.reduce((sum, item) => sum + (item.difference && item.difference < 0 ? item.difference * item.unitPrice : 0), 0)
      const { error: auditError } = await supabase
        .from("audits")
        .update({
          status: "completed",
          completed_date: completedDate,
          counted_items: auditItems.filter((item) => item.result !== "pending").length,
          flagged_items: flaggedItems,
          total_discrepancy: totalDiscrepancy,
          compliance: Math.round(((auditItems.length - flaggedItems) / Math.max(auditItems.length, 1)) * 100),
        })
        .eq("id", remoteAuditId)
      if (auditError) syncError("audit completion", auditError)

      await Promise.all(
        auditItems
          .filter((item) => item.currentStock !== null && item.inventoryItemRemoteId)
          .map(async (item) => {
            const inventoryItem = selectedRestaurant.inventoryTypes
              .flatMap((type) => type.items)
              .find((existingItem) => existingItem.remoteId === item.inventoryItemRemoteId)
            const { error: itemError } = await supabase
              .from("inventory_items")
              .update({
                quantity: item.currentStock as number,
                status: getInventoryStatus(item.currentStock as number, inventoryItem?.minStock ?? 0),
                last_updated: completedDate,
              })
              .eq("id", item.inventoryItemRemoteId as string)
            if (itemError) syncError("post-audit inventory update", itemError)

            const { error: historyError } = await supabase.from("stock_history").insert({
              restaurant_id: selectedRestaurant.remoteId as string,
              inventory_item_id: item.inventoryItemRemoteId as string,
              audit_id: remoteAuditId,
              completed_date: completedDate,
              previous_stock: item.previousStock,
              new_stock: item.currentStock as number,
            })
            if (historyError) syncError("stock history creation", historyError)
          }),
      )

      await touchRemoteInventory(selectedRestaurant.remoteId, new Date().toISOString())
    })()
  }

  const reopenAudit = (auditId: string) => {
    if (!isAdmin && !can("audit")) return
    const currentAudit = selectedRestaurant.audits.find((audit) => audit.id === auditId)

    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      audits: restaurant.audits.map((audit) =>
        audit.id === auditId
          ? { ...audit, status: "in-progress", completedDate: null }
        : audit,
      ),
    }))

    if (!currentAudit) return
    void (async () => {
      const remoteAuditId = await getRemoteAudit(currentAudit)
      if (!remoteAuditId) return
      const supabase = createSupabaseDataClient()
      const { error } = await supabase
        .from("audits")
        .update({ status: "in-progress", completed_date: null })
        .eq("id", remoteAuditId)
      if (error) syncError("audit reopen", error)
    })()
  }

  const deleteAudit = (auditId: string) => {
    if (!can("delete")) return
    const currentAudit = selectedRestaurant.audits.find((audit) => audit.id === auditId)

    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      audits: restaurant.audits.filter((audit) => audit.id !== auditId),
    }))

    if (!currentAudit) return
    void (async () => {
      const remoteAuditId = await getRemoteAudit(currentAudit)
      if (!remoteAuditId) return
      const supabase = createSupabaseDataClient()
      const { error } = await supabase.from("audits").delete().eq("id", remoteAuditId)
      if (error) syncError("audit deletion", error)
    })()
  }

  const addAuditComment = (auditId: string, comment: { author: string; content: string }) => {
    if (!comment.content.trim()) return
    const currentAudit = selectedRestaurant.audits.find((audit) => audit.id === auditId)
    const newCommentId = Math.max(0, ...(currentAudit?.comments ?? []).map((existingComment) => existingComment.id)) + 1

    updateSelectedRestaurant((restaurant) => ({
      ...restaurant,
      audits: restaurant.audits.map((audit) => {
        if (audit.id !== auditId) return audit
        const comments = audit.comments ?? []
        const newComment: RestaurantAuditComment = {
          id: newCommentId,
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

    if (!currentAudit) return
    void (async () => {
      const remoteAuditId = await getRemoteAudit(currentAudit)
      if (!remoteAuditId) return
      const supabase = createSupabaseDataClient()
      const { data: userData } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from("audit_comments")
        .insert({
          audit_id: remoteAuditId,
          author_id: userData.user?.id ?? null,
          author_name: comment.author.trim() || currentAudit.auditor,
          content: comment.content.trim(),
        })
        .select("*")
        .single()

      if (error) {
        syncError("audit comment creation", error)
        return
      }

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((restaurant) =>
          restaurant.id === selectedRestaurantId
            ? {
                ...restaurant,
                audits: restaurant.audits.map((audit) =>
                  audit.id === auditId
                    ? {
                        ...audit,
                        comments: audit.comments?.map((existingComment) =>
                          existingComment.id === newCommentId ? { ...existingComment, remoteId: data.id } : existingComment,
                        ),
                      }
                    : audit,
                ),
              }
            : restaurant,
        ),
      )
    })()
  }

  const addTeamMember = async (member: { name: string; email: string; password: string; role: TeamMember["role"]; permissions: AppPermissions; restaurantId?: string; restaurantIds?: string[] }) => {
    if (!isPrimaryAdmin || !selectedRestaurant.remoteId) return { ok: false, error: "Not allowed" }
    const restaurantIds = member.restaurantIds?.length ? member.restaurantIds : [member.restaurantId ?? selectedRestaurant.remoteId]
    try {
      const response = await fetch("/api/team-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...member,
          restaurantId: member.restaurantId ?? selectedRestaurant.remoteId,
          restaurantIds,
          dbRole: teamRoleToDbRole(member.role),
        }),
      })
      const result = await response.json()
      if (!response.ok) return { ok: false, error: result.error ?? "Could not create team member" }

      const createdMembers = Array.isArray(result.members) ? result.members : result.member ? [result.member] : []
      const nextMember: TeamMember = {
        id: createdMembers.find((createdMember: RestaurantMemberRow) => createdMember.restaurant_id === selectedRestaurant.remoteId)?.id ?? createdMembers[0]?.id,
        userId: createdMembers[0]?.user_id,
        restaurantIds,
        name: member.name,
        email: member.email,
        role: member.role,
        permissions: member.role === "Admin" ? fullPermissions : member.permissions,
      }

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((restaurant) =>
          restaurant.remoteId && restaurantIds.includes(restaurant.remoteId)
            ? {
                ...restaurant,
                teamMembers: [
                  ...(restaurant.teamMembers ?? []).filter((existingMember) => existingMember.userId !== nextMember.userId && existingMember.email.toLowerCase() !== nextMember.email.toLowerCase()),
                  {
                    ...nextMember,
                    id: createdMembers.find((createdMember: RestaurantMemberRow) => createdMember.restaurant_id === restaurant.remoteId)?.id ?? nextMember.id,
                  },
                ],
              }
            : restaurant,
        ),
      )

      return { ok: true }
    } catch (error) {
      syncError("team member creation", error)
      return { ok: false, error: "Could not create team member" }
    }
  }

  const updateTeamMember = async (member: { id?: string; userId?: string; name: string; email: string; role: TeamMember["role"]; permissions: AppPermissions; restaurantId?: string; restaurantIds?: string[] }) => {
    if (!isPrimaryAdmin || !selectedRestaurant.remoteId) return { ok: false, error: "Not allowed" }
    const restaurantIds = member.restaurantIds?.length ? member.restaurantIds : [member.restaurantId ?? selectedRestaurant.remoteId]
    try {
      const response = await fetch("/api/team-members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          userId: member.userId,
          name: member.name,
          email: member.email,
          permissions: member.permissions,
          restaurantId: member.restaurantId ?? selectedRestaurant.remoteId,
          restaurantIds,
          dbRole: teamRoleToDbRole(member.role),
        }),
      })
      const result = await response.json()
      if (!response.ok) return { ok: false, error: result.error ?? "Could not update team member" }

      const nextPermissions = member.role === "Admin" ? fullPermissions : member.permissions
      const updatedMembers = Array.isArray(result.members) ? result.members : result.member ? [result.member] : []

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((restaurant) =>
          restaurant.remoteId && restaurantIds.includes(restaurant.remoteId)
            ? {
                ...restaurant,
                teamMembers: [
                  ...(restaurant.teamMembers ?? []).filter((existingMember) =>
                    !((member.id && existingMember.id === member.id) || (member.userId && existingMember.userId === member.userId)),
                  ),
                  {
                    id: updatedMembers.find((updatedMember: RestaurantMemberRow) => updatedMember.restaurant_id === restaurant.remoteId)?.id ?? member.id,
                    userId: updatedMembers[0]?.user_id ?? member.userId,
                    restaurantIds,
                    name: result.profile?.full_name ?? member.name,
                    email: result.profile?.email ?? member.email,
                    role: member.role,
                    permissions: nextPermissions,
                  },
                ],
              }
            : {
                ...restaurant,
                teamMembers: (restaurant.teamMembers ?? []).filter((existingMember) =>
                  !((member.id && existingMember.id === member.id) || (member.userId && existingMember.userId === member.userId)),
                ),
              },
        ),
      )

      return { ok: true }
    } catch (error) {
      syncError("team member update", error)
      return { ok: false, error: "Could not update team member" }
    }
  }

  const deleteTeamMember = async (member: { id?: string; userId?: string; restaurantId?: string }) => {
    if (!isPrimaryAdmin || !selectedRestaurant.remoteId) return { ok: false, error: "Not allowed" }
    try {
      const response = await fetch("/api/team-members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          userId: member.userId,
          restaurantId: member.restaurantId ?? selectedRestaurant.remoteId,
        }),
      })
      const result = await response.json()
      if (!response.ok) return { ok: false, error: result.error ?? "Could not delete team member" }

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((restaurant) =>
          ({
            ...restaurant,
            teamMembers: (restaurant.teamMembers ?? []).filter(
              (existingMember) =>
                !((member.id && existingMember.id === member.id) || (member.userId && existingMember.userId === member.userId)),
            ),
          }),
        ),
      )

      return { ok: true }
    } catch (error) {
      syncError("team member delete", error)
      return { ok: false, error: "Could not delete team member" }
    }
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
      currentUserName,
      currentUserEmail,
      assignedAuditTasks,
      assignedAuditWork,
      currentPermissions,
      isAdmin,
      isPrimaryAdmin,
      isRouteLoading,
      isAppLoading,
      t,
      can,
      formatCurrency,
      setCurrency,
      setLanguage,
      setExchangeRate,
      setConverterAmount,
      setSelectedInventoryId,
      startRouteLoading,
      clearRequestLoading,
      refreshAssignedWork,
      requestRestaurantSwitch,
      createRestaurant,
      updateSelectedRestaurant,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addInventoryType,
      updateInventoryType,
      deleteInventoryType,
      addItemCategory,
      renameItemCategory,
      deleteItemCategory,
      addSupplier,
      deleteSupplier,
      addCustomUnit,
      deleteCustomUnit,
      createAudit,
      updateAuditItem,
      completeAudit,
      reopenAudit,
      deleteAudit,
      addAuditComment,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
    }),
    [restaurants, selectedRestaurant, selectedRestaurantId, currency, language, exchangeRate, converterAmount, selectedInventoryId, currentUserName, currentUserEmail, assignedAuditTasks, assignedAuditWork, currentPermissions, isAdmin, isPrimaryAdmin, isRouteLoading, isAppLoading, pathname],
  )

  return (
    <AppContext.Provider value={value}>
      {children}

      {pendingRestaurant && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={() => setPendingRestaurantId(null)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
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

      {isAppLoading && (
        <div className={`fixed bottom-0 right-0 top-0 z-[80] flex items-center justify-center bg-background/35 p-4 backdrop-blur-sm ${shouldUseFullScreenLoading ? "left-0" : "left-0 lg:left-[var(--auditflow-sidebar-width,16rem)]"}`}>
          <div className="text-center">
            <AuditFlowLogo collapsed className="mx-auto mb-4 animate-pulse justify-center" imageClassName="h-16 w-16 rounded-2xl" />
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              {requestLoadingMessage ?? (isRouteLoading ? t("loadingData") : creatingRestaurantName ? t("creatingRestaurant") : t("loadingRestaurant"))}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">
              {creatingRestaurantName ?? loadingRestaurant?.name ?? "AuditNett"}
            </h2>
          </div>
        </div>
      )}
      {requestError && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">{requestError.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{requestError.body}</p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setRequestError(null)}>
                {t("cancel")}
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => window.location.reload()}>
                {t("reload")}
              </Button>
            </div>
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
