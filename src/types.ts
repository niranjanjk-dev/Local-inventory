export interface VaultItem {
  id: string;
  name: string;
  images: string[]; // Base64 data URLs or SVG URIs
  categoryId: string;
  subcategory?: string;
  quantity: number;
  minQuantity?: number;
  condition?: 'Mint / New' | 'Like New' | 'Good' | 'Fair' | 'Parts Only';
  brand?: string;
  modelNumber?: string;
  tags: string[];
  locationId?: string;
  locationPath?: string; // e.g. "Workshop → Shelf A → Drawer A3"
  purchaseDate?: string;
  purchasePrice?: number;
  notes?: string;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class or hex
  isCustom?: boolean;
  description?: string;
  parentId?: string | null; // For sub-collections
}

export interface StorageLocation {
  id: string;
  name: string;
  parentId?: string | null;
  path: string; // e.g. "Workshop → Shelf A → Drawer A3"
  description?: string;
  icon?: string;
  createdAt: number;
}

export interface QuantityLog {
  id: string;
  itemId: string;
  itemName: string;
  timestamp: number;
  previousQuantity: number;
  newQuantity: number;
  change: number; // e.g. +1, -1, +5
  reason?: string;
}

export interface VaultBackup {
  version: string;
  exportedAt: string;
  items: VaultItem[];
  categories: Category[];
  locations: StorageLocation[];
  quantityLogs?: unknown[];
}

export type NavigationTab = 'home' | 'collection' | 'add' | 'locations' | 'settings';

export type SortOption = 
  | 'newest' 
  | 'oldest' 
  | 'name_asc' 
  | 'name_desc' 
  | 'qty_desc' 
  | 'qty_asc' 
  | 'price_desc';
