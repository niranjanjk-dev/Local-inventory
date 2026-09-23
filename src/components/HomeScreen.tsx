import React from 'react';
import { VaultItem, Category, NavigationTab } from '../types';
import { VaultyMascot, EmptyBoxIllustration } from './CuteIllustrations';
import { CategoryIcon } from './CategoryIcon';
import { Plus, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';
import { getPhotoUrl } from '../utils/fileSystem';
import { haptic } from '../utils/haptics';

interface HomeScreenProps {
  items: VaultItem[];
  categories: Category[];
  onSelectItem: (item: VaultItem) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onSelectCategory: (categoryId: string) => void;
  onUpdateQuantity: (item: VaultItem, delta: number) => void;
  onOpenAddCategory: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  items,
  categories,
  onSelectItem,
  onNavigateTab,
  onSelectCategory,
  onUpdateQuantity,
  onOpenAddCategory,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculations
  const totalItemsCount = items.length;
  const totalUnits = items.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const lowStockItems = items.filter(
    (item) => item.minQuantity !== undefined && item.quantity <= item.minQuantity
  );
  const recentlyAddedItems = [...items].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  return (
    <div className="px-5 pt-3 pb-8 space-y-6">
      {/* Top Bar Minimal */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight font-display">LocalInventory</h1>
          <p className="text-xs text-zinc-500 font-medium">Inventory Manager</p>
        </div>

        <button
          type="button"
          onClick={() => {
            haptic.light();
            onNavigateTab('settings');
          }}
          className="text-xs font-semibold text-zinc-600 hover:text-black transition-colors"
        >
          Settings
        </button>
      </div>

      {/* Hero Stats Minimal */}
      <div className="py-4">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[11px] uppercase font-bold tracking-widest text-zinc-400 mb-2">
            Total Items
          </span>
          <div className="text-[7rem] leading-none font-medium tracking-tighter text-zinc-950 font-display">
            {totalItemsCount.toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-zinc-500 font-medium mt-4">
            {totalUnits} pieces currently in stock
          </p>
        </div>

        {/* Low Stock Warning Pill inside banner if any */}
        {lowStockItems.length > 0 && (
          <div className="mt-8 bg-zinc-950 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <div>
                <p className="text-sm font-medium text-white">
                  {lowStockItems.length} {lowStockItems.length === 1 ? 'item needs' : 'items need'} restocking
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                onNavigateTab('collection');
              }}
              className="text-xs font-semibold text-white/70 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full"
            >
              Review
            </button>
          </div>
        )}
      </div>

      {/* Category Shortcuts Section - with "+ Add Category" button */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">
              Categories
            </h2>
            <span className="text-xs font-bold text-zinc-400">({categories.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                onOpenAddCategory();
              }}
              className="text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {categories.map((cat, idx) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            // Alternate between dark and light cards to match the reference look
            const isDark = idx % 2 !== 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  haptic.selection();
                  onSelectCategory(cat.id);
                  onNavigateTab('collection');
                }}
                className={`group p-4 rounded-2xl transition-all flex flex-col items-start justify-between min-h-[110px] active:scale-95 border border-zinc-200 ${
                  isDark 
                    ? 'bg-black text-white' 
                    : 'bg-white text-zinc-900'
                }`}
              >
                <div className="w-full flex justify-between items-start mb-2">
                  <span className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {cat.name}
                  </span>
                  <span className={`text-[10px] font-medium tracking-wide uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-auto">
                  <CategoryIcon name={cat.icon} className={`w-5 h-5 ${isDark ? 'text-white' : 'text-zinc-900'}`} color={isDark ? '#fff' : '#000'} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Low Stock Items Section (if any) */}
      {lowStockItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-black" />
              <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">
                Low Stock Alerts
              </h2>
            </div>
            <span className="text-xs font-bold text-black bg-zinc-50 px-2 py-0.5 rounded-full border border-zinc-200">
              {lowStockItems.length} low
            </span>
          </div>

          <div className="space-y-2.5">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 border border-zinc-200 flex items-center gap-3.5 transition-all cursor-pointer"
              >
                {/* Image */}
                <div
                  onClick={() => {
                    haptic.light();
                    onSelectItem(item);
                  }}
                  className="w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 cursor-pointer border border-zinc-200"
                >
                  <img
                    src={getPhotoUrl(item.images[0]) || ''}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div
                  onClick={() => {
                    haptic.light();
                    onSelectItem(item);
                  }}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <h4 className="text-sm font-bold text-zinc-900 truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-extrabold text-black bg-zinc-100/70 px-2 py-0.5 rounded-md">
                      Qty: {item.quantity} (Min: {item.minQuantity})
                    </span>
                  </div>
                  {item.locationPath && (
                    <p className="text-[10px] text-zinc-500 font-medium truncate mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                      {item.locationPath}
                    </p>
                  )}
                </div>

                {/* Quick Restock Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    onUpdateQuantity(item, +1);
                  }}
                  className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-black active:scale-95 text-white font-medium text-xs flex items-center gap-1.5 transition-all shrink-0"
                  title="Restock +1 item"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Restock</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Added Section - Clean Image Cards without Star Logs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">
            Recently Added
          </h2>
            <button
            type="button"
            onClick={() => {
              haptic.selection();
              onNavigateTab('collection');
            }}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            View all
          </button>
        </div>

        {recentlyAddedItems.length === 0 ? (
          <div className="py-12 flex items-center justify-center text-zinc-400 text-sm font-medium">
            No items yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentlyAddedItems.map((item) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    haptic.light();
                    onSelectItem(item);
                  }}
                  className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden transition-all cursor-pointer flex flex-col active:scale-95"
                >
                  {/* Large Image Header */}
                  <div className="relative aspect-4/3 w-full bg-zinc-100 overflow-hidden">
                    <img
                      src={getPhotoUrl(item.images[0]) || ''}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Quantity pill */}
                    <div className="absolute bottom-2 left-2 bg-white px-2 py-0.5 rounded-2xl text-[11px] font-extrabold text-zinc-900 border border-zinc-200">
                      x{item.quantity}
                    </div>
                  </div>

                  {/* Item Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span
                        className="text-[10px] font-medium uppercase tracking-widest block truncate mb-1 text-zinc-500"
                      >
                        {cat?.name || 'Item'}
                      </span>
                      <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1">
                        {item.name}
                      </h4>
                    </div>

                    {item.locationPath && (
                      <p className="text-[10px] text-zinc-500 font-medium truncate mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                        {item.locationPath.split('→').pop()?.trim()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fast Action Banner to Add */}
      <div className="bg-zinc-950 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight font-display">New addition?</h3>
          <p className="text-sm text-zinc-400 mt-1">Keep your inventory up to date.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            haptic.medium();
            onNavigateTab('add');
          }}
          className="px-5 py-3 w-full sm:w-auto bg-white hover:bg-zinc-100 active:scale-95 text-black font-semibold text-sm rounded-full flex justify-center items-center gap-2 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>
    </div>
  );
};
