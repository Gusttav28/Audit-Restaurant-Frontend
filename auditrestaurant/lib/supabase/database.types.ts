export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          email?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          country: string
          location: string
          address: string
          email: string
          phone: string
          default_currency: 'USD' | 'CRC'
          exchange_rate_to_usd: number
          settings: Json
          inventory_last_edited: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          country?: string
          location?: string
          address?: string
          email?: string
          phone?: string
          default_currency?: 'USD' | 'CRC'
          exchange_rate_to_usd?: number
          settings?: Json
          inventory_last_edited?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>
      }
      restaurant_members: {
        Row: {
          id: string
          restaurant_id: string
          user_id: string
          role: 'owner' | 'admin' | 'auditor' | 'collaborator'
          permissions: Json
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'auditor' | 'collaborator'
          permissions?: Json
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['restaurant_members']['Insert']>
      }
      inventory_types: {
        Row: {
          id: string
          restaurant_id: string
          inventory_type_id: string | null
          name: string
          color: string
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          inventory_type_id?: string | null
          name: string
          color?: string
          active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['inventory_types']['Insert']>
      }
      item_categories: {
        Row: {
          id: string
          restaurant_id: string
          inventory_type_id: string | null
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          inventory_type_id?: string | null
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['item_categories']['Insert']>
      }
      suppliers: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>
      }
      custom_units: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          abbreviation: string
          base_unit: string
          conversion_factor: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          abbreviation: string
          base_unit: string
          conversion_factor?: number
          category?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['custom_units']['Insert']>
      }
      inventory_items: {
        Row: {
          id: string
          restaurant_id: string
          inventory_type_id: string
          category_id: string | null
          supplier_id: string | null
          name: string
          category_name: string
          supplier_name: string
          quantity: number
          unit: string
          min_stock: number
          status: 'good' | 'warning' | 'low' | 'critical'
          price_usd: number
          price_currency: 'USD' | 'CRC'
          phase: 'none' | 'production' | 'merma' | null
          merma_quantity: number | null
          production_quantity: number | null
          days_until_expiry: number | null
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          inventory_type_id: string
          category_id?: string | null
          supplier_id?: string | null
          name: string
          category_name?: string
          supplier_name?: string
          quantity?: number
          unit?: string
          min_stock?: number
          status?: 'good' | 'warning' | 'low' | 'critical'
          price_usd?: number
          price_currency?: 'USD' | 'CRC'
          phase?: 'none' | 'production' | 'merma' | null
          merma_quantity?: number | null
          production_quantity?: number | null
          days_until_expiry?: number | null
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['inventory_items']['Insert']>
      }
      audits: {
        Row: {
          id: string
          restaurant_id: string
          inventory_type_id: string
          audit_code: string
          auditor_id: string | null
          auditor_name: string
          created_date: string
          started_date: string | null
          completed_date: string | null
          status: 'not-started' | 'in-progress' | 'completed'
          total_items: number
          counted_items: number
          flagged_items: number
          total_discrepancy: number
          compliance: number
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          inventory_type_id: string
          audit_code: string
          auditor_id?: string | null
          auditor_name?: string
          created_date?: string
          started_date?: string | null
          completed_date?: string | null
          status?: 'not-started' | 'in-progress' | 'completed'
          total_items?: number
          counted_items?: number
          flagged_items?: number
          total_discrepancy?: number
          compliance?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['audits']['Insert']>
      }
      audit_items: {
        Row: {
          id: string
          audit_id: string
          inventory_item_id: string | null
          item_name: string
          category: string
          previous_stock: number
          current_stock: number | null
          unit: string
          unit_price: number
          phase: 'none' | 'production' | 'merma' | null
          merma_quantity: number | null
          production_quantity: number | null
          difference: number | null
          result: 'pending' | 'sold' | 'discrepancy' | 'matched'
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          audit_id: string
          inventory_item_id?: string | null
          item_name: string
          category?: string
          previous_stock?: number
          current_stock?: number | null
          unit?: string
          unit_price?: number
          phase?: 'none' | 'production' | 'merma' | null
          merma_quantity?: number | null
          production_quantity?: number | null
          difference?: number | null
          result?: 'pending' | 'sold' | 'discrepancy' | 'matched'
          notes?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_items']['Insert']>
      }
      audit_comments: {
        Row: {
          id: string
          audit_id: string
          author_id: string | null
          author_name: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          audit_id: string
          author_id?: string | null
          author_name?: string
          content: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_comments']['Insert']>
      }
      stock_history: {
        Row: {
          id: string
          restaurant_id: string
          inventory_item_id: string
          audit_id: string | null
          completed_date: string
          previous_stock: number
          new_stock: number
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          inventory_item_id: string
          audit_id?: string | null
          completed_date?: string
          previous_stock: number
          new_stock: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['stock_history']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: {
      is_restaurant_member: {
        Args: { target_restaurant_id: string }
        Returns: boolean
      }
      is_restaurant_admin: {
        Args: { target_restaurant_id: string }
        Returns: boolean
      }
    }
    Enums: {
      restaurant_role: 'owner' | 'admin' | 'auditor' | 'collaborator'
      audit_status: 'not-started' | 'in-progress' | 'completed'
      audit_item_result: 'pending' | 'sold' | 'discrepancy' | 'matched'
      inventory_status: 'good' | 'warning' | 'low' | 'critical'
      currency_code: 'USD' | 'CRC'
      item_phase: 'none' | 'production' | 'merma'
    }
  }
}
