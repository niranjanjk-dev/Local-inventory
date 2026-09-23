import React, { useState, useMemo } from 'react';
import { VaultItem, Category, StorageLocation, SortOption } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { EmptyBoxIllustration } from './CuteIllustrations';
import { AddCategoryModal } from './AddCategoryModal';
import { getPhotoUrl } from '../utils/fileSystem';
import { haptic } from '../utils/haptics';
import {
  Search,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Plus,
  Minus,
  MapPin,
  AlertTriangle,
  ArrowUpDown,
  Trash2,
  FolderPlus,
} from 'lucide-react';

interface CollectionScreenProps {
  items: VaultItem[];
  categories: Category[];
  locations: StorageLocation[];
  selectedCategoryId?: string;
  onSelectItem: (item: VaultItem, listContext?: VaultItem[]) => void;
  onUpdateQuantity: (item: VaultItem, delta: number) => void;
  onAddNew: () => void;
  onOpenAddCategory?: () => void;
  onDeleteCategory?: (id: string) => void;
  onAddCategory?: (category: Category) => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  items,
  categories,
  locations,
  selectedCategoryId: initialCategory,
  onSelectItem,
  onUpdateQuantity,
  onAddNew,
  onOpenAddCategory,
  onDeleteCategory,
  onAddCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [showSubModal, setShowSubModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [filterLocationId, setFilterLocationId] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');

  const topLevelCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const activeCategoryObj = useMemo(
    () => categories.find((c) => c.id === activeCategory),
    [categories, activeCategory]
  );

  const currentSubcategories = useMemo(
    () => (activeCategory !== 'all' ? categories.filter((c) => c.parentId === activeCategory) : []),
    [categories, activeCategory]
  );

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.modelNumber?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q) ||
          item.locationPath?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter((item) => item.categoryId === activeCategory);
      if (selectedSubcategory !== 'all') {
        result = result.filter((item) => item.subcategory === selectedSubcategory);
      }
    }

    // Low stock filter
    if (filterLowStockOnly) {
      result = result.filter(
        (item) => item.minQuantity !== undefined && item.quantity <= item.minQuantity
      );
    }

    // Location filter
    if (filterLocationId !== 'all') {
      result = result.filter((item) => item.locationId === filterLocationId);
    }

    // Condition filter
    if (filterCondition !== 'all') {
      result = result.filter((item) => item.condition === filterCondition);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'qty_desc':
          return b.quantity - a.quantity;
        case 'qty_asc':
          return a.quantity - b.quantity;
        case 'price_desc':
          return (b.purchasePrice || 0) - (a.purchasePrice || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [
    items,
    searchQuery,
    activeCategory,
    filterLowStockOnly,
    filterLocationId,
    filterCondition,
    sortBy,
  ]);

  const activeFiltersCount =
    (filterLowStockOnly ? 1 : 0) +
    (filterLocationId !== 'all' ? 1 : 0) +
    (filterCondition !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setFilterLowStockOnly(false);
    setFilterLocationId('all');
    setFilterCondition('all');
    setActiveCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="px-5 pt-3 pb-8 space-y-4">
      {/* Title & View Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Collection</h1>
          <p className="text-xs text-zinc-500 font-medium">
            {filteredItems.length} of {items.length} items
          </p>
        </div>

        {/* View Mode & Filter buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
          <button
            type="button"
            onClick={() => {
              haptic.selection();
              setViewMode('grid');
            }}
            className={`p-1.5 rounded-xl transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-zinc-900 font-bold border border-zinc-200'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              haptic.selection();
              setViewMode('list');
            }}
            className={`p-1.5 rounded-xl transition-all ${
              viewMode === 'list'
                ? 'bg-white text-zinc-900 font-bold border border-zinc-200'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar with clear button */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="collection-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search name, tag, brand, model..."
          className="w-full bg-zinc-100 hover:bg-zinc-100 focus:bg-white text-zinc-900 placeholder-zinc-400 text-sm font-medium pl-10 pr-10 py-3 rounded-2xl border border-zinc-200 focus:border-zinc-900 outline-none transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              haptic.light();
              setSearchQuery('');
            }}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter and Sort bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Toggle Filters Button */}
        <button
          type="button"
          onClick={() => {
            haptic.light();
            setShowFilters(!showFilters);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
            showFilters || activeFiltersCount > 0
              ? 'bg-black text-white border-black'
              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-white text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => {
              haptic.selection();
              setSortBy(e.target.value as SortOption);
            }}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold py-1.5 pl-2 pr-6 rounded-xl border border-zinc-200 outline-none cursor-pointer"
          >
            <option value="newest">Recently Added</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="qty_desc">Qty (High-Low)</option>
            <option value="qty_asc">Qty (Low-High)</option>
            <option value="price_desc">Price (High-Low)</option>
          </select>
        </div>
      </div>

      {/* Expanded Filter Drawer */}
      {showFilters && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-600">
              Filter Options
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  clearAllFilters();
                }}
                className="text-xs font-bold text-zinc-900 hover:underline"
              >
                Reset all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                setFilterLowStockOnly(!filterLowStockOnly);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterLowStockOnly
                  ? 'bg-black text-white'
                  : 'bg-white text-zinc-700 border border-zinc-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning
            </button>
          </div>

          {/* Location Filter */}
          {locations.length > 0 && (
            <div>
              <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                Filter by Location
              </label>
              <select
                value={filterLocationId}
                onChange={(e) => {
                  haptic.selection();
                  setFilterLocationId(e.target.value);
                }}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 outline-none"
              >
                <option value="all">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.path}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Condition Filter */}
          <div>
            <label className="text-[11px] font-bold text-zinc-500 block mb-1">
              Filter by Condition
            </label>
            <select
              value={filterCondition}
              onChange={(e) => {
                haptic.selection();
                setFilterCondition(e.target.value);
              }}
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 outline-none"
            >
              <option value="all">All Conditions</option>
              <option value="Mint / New">Mint / New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Parts Only">Parts Only</option>
            </select>
          </div>
        </div>
      )}

      {/* Horizontal Category Filter Pills with "+ Add Category" button */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-5 px-5">
        <button
          type="button"
          onClick={() => {
            haptic.selection();
            setActiveCategory('all');
            setSelectedSubcategory('all');
          }}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
            activeCategory === 'all'
              ? 'bg-zinc-900 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          All ({items.length})
        </button>

        {topLevelCategories.map((cat) => {
          const count = items.filter((i) => i.categoryId === cat.id).length;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                haptic.selection();
                setActiveCategory(cat.id);
                setSelectedSubcategory('all');
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-black text-white'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <CategoryIcon
                name={cat.icon}
                className="w-3.5 h-3.5"
                color={isSelected ? '#FFFFFF' : cat.color}
              />
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        {/* Quick Add Category Pill */}
        {onOpenAddCategory && (
          <button
            type="button"
            onClick={() => {
              haptic.medium();
              onOpenAddCategory();
            }}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 border-2 border-dashed border-zinc-300 text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Collection</span>
          </button>
        )}
      </div>

      {/* Active Collection Header & Sub-collections Bar */}
      {activeCategoryObj && (
        <div className="bg-white border-2 border-zinc-200 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-200 ${activeCategoryObj.color}`}
              >
                <CategoryIcon
                  name={activeCategoryObj.icon}
                  className="w-5 h-5"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-zinc-900 truncate">
                    {activeCategoryObj.name}
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 shrink-0">
                    {items.filter((i) => i.categoryId === activeCategoryObj.id).length} items
                  </span>
                </div>
                {activeCategoryObj.description && (
                  <p className="text-xs text-zinc-500 truncate">{activeCategoryObj.description}</p>
                )}
              </div>
            </div>

            {/* Collection Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  haptic.medium();
                  setShowSubModal(true);
                }}
                className="px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                title="Create Sub-collection"
              >
                <FolderPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden xs:inline">Sub-collection</span>
              </button>

              {onDeleteCategory && (
                <button
                  type="button"
                  onClick={() => {
                    haptic.warning();
                    setCategoryToDelete(activeCategoryObj);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-xl transition-colors"
                  title="Remove this Collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sub-collection filter chips */}
          <div className="pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Sub-collections
              </span>
              <button
                type="button"
                onClick={() => {
                  haptic.medium();
                  setShowSubModal(true);
                }}
                className="text-[11px] font-bold text-zinc-700 hover:text-black flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3 stroke-[3]" /> Add
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <button
                type="button"
                onClick={() => {
                  haptic.selection();
                  setSelectedSubcategory('all');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedSubcategory === 'all'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                All
              </button>

              {currentSubcategories.map((sub) => {
                const isSelected = selectedSubcategory === sub.name;
                const subCount = items.filter(
                  (i) => i.categoryId === activeCategory && i.subcategory === sub.name
                ).length;
                return (
                  <div key={sub.id} className="inline-flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        haptic.selection();
                        setSelectedSubcategory(sub.name);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <CategoryIcon
                        name={sub.icon}
                        className="w-3 h-3"
                        color={isSelected ? '#FFFFFF' : sub.color}
                      />
                      <span>{sub.name}</span>
                      <span className="text-[10px] opacity-80">({subCount})</span>
                    </button>
                    {onDeleteCategory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          haptic.warning();
                          setCategoryToDelete(sub);
                        }}
                        className="ml-1 p-1 text-zinc-300 hover:text-black"
                        title={`Remove ${sub.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {currentSubcategories.length === 0 && (
                <span className="text-[11px] text-zinc-400 italic py-0.5">
                  No sub-collections yet. Tap "+ Add" to create one.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Embedded Add Sub-category Modal */}
      {showSubModal && activeCategoryObj && (
        <AddCategoryModal
          categories={categories}
          defaultParentId={activeCategoryObj.id}
          onSave={(newCat) => {
            if (onAddCategory) {
              onAddCategory(newCat);
            }
            setSelectedSubcategory(newCat.name);
            setShowSubModal(false);
          }}
          onClose={() => setShowSubModal(false)}
        />
      )}

      {/* Delete Collection Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-5 border-2 border-zinc-200 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-black flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">
                  Remove Collection?
                </h3>
                <p className="text-xs text-zinc-500">"{categoryToDelete.name}"</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 font-medium leading-relaxed bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
              Items in this collection will not be deleted. They will remain safely in your vault and move to Miscellaneous.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  haptic.heavy();
                  if (onDeleteCategory) {
                    onDeleteCategory(categoryToDelete.id);
                  }
                  if (activeCategory === categoryToDelete.id) {
                    setActiveCategory('all');
                    setSelectedSubcategory('all');
                  }
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-black hover:bg-zinc-800 transition-colors"
              >
                Delete Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Section: Grid or List */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-3xl border border-zinc-200 p-6 space-y-3">
          <EmptyBoxIllustration text="No items matched your search or filters." size={80} />
          <div>
            <h3 className="text-sm font-bold text-zinc-800">No items found</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Try clearing filters or add a new item.</p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            {activeFiltersCount > 0 || searchQuery ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-2xl bg-zinc-100 text-zinc-700 font-bold text-xs hover:bg-zinc-200"
              >
                Clear all filters
              </button>
            ) : (
              <button
                type="button"
                onClick={onAddNew}
                className="px-4 py-2 rounded-2xl bg-black text-white font-bold text-xs hover:bg-zinc-800 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2]" /> Add First Item
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Image-First Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            const isLow = item.minQuantity !== undefined && item.quantity <= item.minQuantity;

            return (
              <div
                key={item.id}
                onClick={() => {
                  haptic.light();
                  onSelectItem(item, filteredItems);
                }}
                className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden transition-all cursor-pointer flex flex-col active:scale-95 relative"
              >
                {/* Hero Image */}
                <div className="relative aspect-square w-full bg-zinc-50 overflow-hidden">
                  <img
                    src={getPhotoUrl(item.images[0]) || ''}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Low Stock Badge */}
                  {isLow && (
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 stroke-[3]" /> LOW
                      </span>
                    </div>
                  )}

                  {/* Quantity Indicator Pill */}
                  <div className="absolute bottom-2 left-2 bg-white px-2.5 py-0.5 rounded-2xl text-xs font-black text-zinc-900 border border-zinc-200">
                    x{item.quantity}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider truncate px-1 border border-zinc-200 rounded text-zinc-600 bg-zinc-100"
                      >
                        {cat?.name || 'Item'}
                      </span>
                      {item.condition && (
                        <span className="text-[9px] text-zinc-400 font-semibold truncate">
                          • {item.condition}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-black transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  {/* Location & Quick +/- buttons */}
                  <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between gap-1">
                    <p className="text-[10px] text-zinc-500 font-medium truncate flex items-center gap-1 min-w-0">
                      {item.locationPath ? (
                        <>
                          <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate">{item.locationPath.split('→').pop()?.trim()}</span>
                        </>
                      ) : (
                        <span className="text-zinc-400 italic">No location</span>
                      )}
                    </p>

                    {/* Quick + / - Qty Controls */}
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          haptic.light();
                          onUpdateQuantity(item, -1);
                        }}
                        className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:scale-90 text-zinc-700 flex items-center justify-center transition-all"
                        title="Decrease quantity by 1"
                      >
                        <Minus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          haptic.light();
                          onUpdateQuantity(item, +1);
                        }}
                        className="w-6 h-6 rounded-lg bg-black hover:bg-zinc-800 active:scale-90 text-white flex items-center justify-center transition-all"
                        title="Increase quantity by 1"
                      >
                        <Plus className="w-3 h-3 stroke-[2]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            const isLow = item.minQuantity !== undefined && item.quantity <= item.minQuantity;

            return (
              <div
                key={item.id}
                onClick={() => {
                  haptic.light();
                  onSelectItem(item, filteredItems);
                }}
                className="bg-white rounded-2xl p-3 border border-zinc-200 transition-all cursor-pointer flex items-center gap-3.5 active:scale-99"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                  <img src={getPhotoUrl(item.images[0]) || ''} alt={item.name} className="w-full h-full object-cover" />
                  {isLow && (
                    <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-black rounded-full ring-2 ring-white" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-zinc-600 bg-zinc-100 border border-zinc-200"
                    >
                      {cat?.name}
                    </span>
                    {item.subcategory && (
                      <span className="text-[10px] text-zinc-400">/ {item.subcategory}</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 truncate">{item.name}</h3>

                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 font-medium">
                    {item.locationPath && (
                      <span className="truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                        {item.locationPath.split('→').pop()?.trim()}
                      </span>
                    )}
                    {item.purchasePrice ? (
                      <span>• ${item.purchasePrice.toFixed(2)}</span>
                    ) : null}
                  </div>
                </div>

                {/* Qty Controls */}
                <div
                  className="flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light();
                        onUpdateQuantity(item, -1);
                      }}
                      className="w-6 h-6 rounded-lg bg-white hover:bg-zinc-200 active:scale-90 text-zinc-700 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                    <span
                      className={`text-xs font-black min-w-6 text-center ${
                        isLow ? 'text-black' : 'text-zinc-900'
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light();
                        onUpdateQuantity(item, +1);
                      }}
                      className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-black active:scale-90 text-white flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3 h-3 stroke-[2]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
