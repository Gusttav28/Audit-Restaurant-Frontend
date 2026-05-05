export interface CustomUnit {
  id: number
  name: string
  abbreviation: string
  baseUnit: string
  conversionFactor: number
  category: "weight" | "volume" | "quantity" | "custom"
}

export interface InventoryItem {
  id: number
  restaurantId: number
  typeId: number
  name: string
  type: string
  category: string
  quantity: number
  unit: string
  minStock: number
  status: string
  price: number
  lastUpdated: string
  supplier: string
  daysUntilExpiry: number | null
}

export interface InventoryType {
  id: number
  name: string
  color: string
  active: boolean
  items: InventoryItem[]
}

export interface RestaurantInventory {
  id: number
  name: string
  location: string
  email: string
  phone: string
  address: string
  settings: {
    auditNotifications: boolean
    inventoryAlerts: boolean
    weeklyReports: boolean
    lowStockThreshold: number
  }
  inventoryTypes: InventoryType[]
  customUnits: CustomUnit[]
  audits: RestaurantAudit[]
}

export interface RestaurantAudit {
  id: string
  inventoryId: number
  inventoryName: string
  inventoryColor: string
  auditor: string
  createdDate: string
  startedDate: string | null
  completedDate: string | null
  status: "not-started" | "in-progress" | "completed"
  totalItems: number
  countedItems: number
  flaggedItems: number
  totalDiscrepancy: number
  compliance: number
  notes: string
  items?: RestaurantAuditItem[]
  comments?: RestaurantAuditComment[]
}

export interface RestaurantAuditComment {
  id: number
  author: string
  date: string
  content: string
}

export interface RestaurantAuditItem {
  itemId: number
  itemName: string
  category: string
  previousStock: number
  currentStock: number | null
  unit: string
  unitPrice: number
  difference: number | null
  result: "pending" | "sold" | "discrepancy" | "matched"
  notes: string
}

export const initialRestaurants: RestaurantInventory[] = [
  {
    id: 1,
    name: "Downtown Bistro",
    location: "Central District",
    email: "admin@downtownbistro.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street",
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
        items: [
          {
            id: 1,
            restaurantId: 1,
            typeId: 1,
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
            restaurantId: 1,
            typeId: 1,
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
            restaurantId: 1,
            typeId: 1,
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
        ],
      },
      {
        id: 2,
        name: "Bar",
        color: "#8b5cf6",
        active: true,
        items: [
          {
            id: 4,
            restaurantId: 1,
            typeId: 2,
            name: "Vodka",
            type: "Bar",
            category: "Spirits",
            quantity: 12,
            unit: "bottles",
            minStock: 8,
            status: "good",
            price: 28,
            lastUpdated: "2024-01-15",
            supplier: "Liquor Wholesale",
            daysUntilExpiry: null,
          },
          {
            id: 5,
            restaurantId: 1,
            typeId: 2,
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
        ],
      },
    ],
    customUnits: [
      { id: 1, name: "Case", abbreviation: "cs", baseUnit: "pieces", conversionFactor: 24, category: "quantity" },
      { id: 2, name: "Carton", abbreviation: "ctn", baseUnit: "kg", conversionFactor: 10, category: "weight" },
    ],
    audits: [
      {
        id: "AUD-DB-0001",
        inventoryId: 1,
        inventoryName: "Kitchen",
        inventoryColor: "#3b82f6",
        auditor: "John Smith",
        createdDate: "2024-01-08",
        startedDate: "2024-01-08",
        completedDate: "2024-01-10",
        status: "completed",
        totalItems: 22,
        countedItems: 22,
        flaggedItems: 3,
        totalDiscrepancy: -45.5,
        compliance: 86,
        notes: "Kitchen count completed with minor produce discrepancies.",
      },
      {
        id: "AUD-DB-0002",
        inventoryId: 2,
        inventoryName: "Bar",
        inventoryColor: "#8b5cf6",
        auditor: "Sarah Johnson",
        createdDate: "2024-01-12",
        startedDate: "2024-01-12",
        completedDate: "2024-01-15",
        status: "completed",
        totalItems: 18,
        countedItems: 18,
        flaggedItems: 1,
        totalDiscrepancy: -28,
        compliance: 94,
        notes: "Bar audit finished with one shortage.",
      },
      {
        id: "AUD-DB-0003",
        inventoryId: 1,
        inventoryName: "Kitchen",
        inventoryColor: "#3b82f6",
        auditor: "Michael Chen",
        createdDate: "2024-01-18",
        startedDate: "2024-01-18",
        completedDate: null,
        status: "in-progress",
        totalItems: 24,
        countedItems: 12,
        flaggedItems: 0,
        totalDiscrepancy: 0,
        compliance: 50,
        notes: "Mid-month kitchen audit in progress.",
      },
    ],
  },
  {
    id: 2,
    name: "Harbor Grill",
    location: "Waterfront",
    email: "ops@harborgrill.com",
    phone: "+1 (555) 867-5309",
    address: "45 Marina Way",
    settings: {
      auditNotifications: true,
      inventoryAlerts: true,
      weeklyReports: false,
      lowStockThreshold: 8,
    },
    inventoryTypes: [
      {
        id: 1,
        name: "Kitchen",
        color: "#10b981",
        active: true,
        items: [
          {
            id: 1,
            restaurantId: 2,
            typeId: 1,
            name: "Salmon Fillets",
            type: "Kitchen",
            category: "Meat",
            quantity: 6,
            unit: "kg",
            minStock: 8,
            status: "low",
            price: 18.75,
            lastUpdated: "2024-01-14",
            supplier: "Coastal Seafood",
            daysUntilExpiry: 2,
          },
          {
            id: 2,
            restaurantId: 2,
            typeId: 1,
            name: "Lemons",
            type: "Kitchen",
            category: "Produce",
            quantity: 14,
            unit: "kg",
            minStock: 5,
            status: "good",
            price: 3,
            lastUpdated: "2024-01-15",
            supplier: "Fresh Market",
            daysUntilExpiry: 7,
          },
        ],
      },
      {
        id: 2,
        name: "Storage",
        color: "#f59e0b",
        active: true,
        items: [
          {
            id: 3,
            restaurantId: 2,
            typeId: 2,
            name: "Takeout Boxes",
            type: "Storage",
            category: "Packaging",
            quantity: 400,
            unit: "pieces",
            minStock: 250,
            status: "good",
            price: 0.18,
            lastUpdated: "2024-01-12",
            supplier: "Restaurant Supply Co",
            daysUntilExpiry: null,
          },
        ],
      },
    ],
    customUnits: [{ id: 1, name: "Tray", abbreviation: "tray", baseUnit: "pieces", conversionFactor: 12, category: "quantity" }],
    audits: [
      {
        id: "AUD-HG-0001",
        inventoryId: 1,
        inventoryName: "Kitchen",
        inventoryColor: "#10b981",
        auditor: "Elena Rivera",
        createdDate: "2024-01-09",
        startedDate: "2024-01-09",
        completedDate: "2024-01-11",
        status: "completed",
        totalItems: 16,
        countedItems: 16,
        flaggedItems: 2,
        totalDiscrepancy: -64.25,
        compliance: 88,
        notes: "Seafood storage reviewed and logged.",
      },
      {
        id: "AUD-HG-0002",
        inventoryId: 2,
        inventoryName: "Storage",
        inventoryColor: "#f59e0b",
        auditor: "Noah Patel",
        createdDate: "2024-01-17",
        startedDate: null,
        completedDate: null,
        status: "not-started",
        totalItems: 11,
        countedItems: 0,
        flaggedItems: 0,
        totalDiscrepancy: 0,
        compliance: 0,
        notes: "Packaging audit queued.",
      },
    ],
  },
]
