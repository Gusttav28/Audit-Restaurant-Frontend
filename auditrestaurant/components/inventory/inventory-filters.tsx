"use client"
import { Search, Filter } from "lucide-react"

interface InventoryFiltersProps {
  searchTerm: string
  selectedCategory: string
  selectedStatus: string
  selectedType: string
  inventoryTypes: Array<{ id: number; name: string; color: string; active: boolean }>
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onStatusChange: (value: string) => void
  onTypeChange: (value: string) => void
}

export default function InventoryFilters({
  searchTerm,
  selectedCategory,
  selectedStatus,
  selectedType,
  inventoryTypes,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onTypeChange,
}: InventoryFiltersProps) {
  const categories = [
    "all",
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
  const statuses = ["all", "good", "low", "critical"]

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search items by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>

        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
        >
          <option value="all" className="bg-secondary">
            All Types
          </option>
          {inventoryTypes.map((type) => (
            <option key={type.id} value={type.name} className="bg-secondary">
              {type.name}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-secondary">
              {cat === "all" ? "All Categories" : cat}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
        >
          <option value="all" className="bg-secondary">
            All Status
          </option>
          <option value="good" className="bg-secondary">
            Good Stock
          </option>
          <option value="low" className="bg-secondary">
            Low Stock
          </option>
          <option value="critical" className="bg-secondary">
            Critical
          </option>
        </select>
      </div>
    </div>
  )
}
