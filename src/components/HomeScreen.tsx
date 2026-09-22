import React from 'react';
import { VaultItem, Category, NavigationTab } from '../types';
import { VaultyMascot, EmptyBoxIllustration } from './CuteIllustrations';
import { CategoryIcon } from './CategoryIcon';
import { Plus, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';
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
      {/* Top Bar with Mascot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <VaultyMascot size={38} mood={lowStockItems.length > 0 ? 'winking' : 'happy'} />
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">MyVault</h1>
            <p className="text-[11px] text-zinc-500 font-semibold">Inventory Manager</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            haptic.light();
            onNavigateTab('settings');
          }}
          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 transition-colors"
          title="Open Vault Settings"
        >
          Settings
        </button>
      </div>

      {/* Hero Stats Card - Clean, solid flat design, NO gradients, NO blur */}
      <div className="bg-zinc-900 text-white rounded-3xl p-5 border-2 border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">
            Cabinet Inventory
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/90 rounded-2xl p-3.5 border border-zinc-700">
            <span className="text-xs text-zinc-400 font-semibold block mb-0.5">Unique Items</span>
            <div className="text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1.5">
              {totalItemsCount}
              <span className="text-xs text-zinc-400 font-normal">items</span>
            </div>
          </div>

          <div className="bg-zinc-800/90 rounded-2xl p-3.5 border border-zinc-700">
            <span className="text-xs text-zinc-400 font-semibold block mb-0.5">Total Pieces</span>
            <div className="text-3xl font-extrabold tracking-tight text-orange-400 flex items-baseline gap-1.5">
              {totalUnits}
              <span className="text-xs text-zinc-400 font-normal">in stock</span>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Pill inside banner if any */}
        {lowStockItems.length > 0 ? (
          <div className="mt-4 bg-orange-950/60 border border-orange-500/50 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-200">
                  {lowStockItems.length} {lowStockItems.length === 1 ? 'item needs' : 'items need'} restocking!
                </p>
                <p className="text-[11px] text-zinc-400">Below minimum configured quantity</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                onNavigateTab('collection');
              }}
              className="text-xs font-bold text-orange-400 hover:text-white flex items-center gap-0.5 transition-colors"
            >
              Review <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 pt-1">
            <span>All items well stocked</span>
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                onNavigateTab('add');
              }}
              className="text-orange-400 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New
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
              className="text-xs font-extrabold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Category
            </button>
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                onNavigateTab('collection');
              }}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-800 flex items-center gap-0.5"
            >
              See all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  haptic.selection();
                  onSelectCategory(cat.id);
                  onNavigateTab('collection');
                }}
                className="group bg-white hover:bg-zinc-50 p-3 rounded-2xl border border-zinc-200 transition-all flex flex-col items-center text-center active:scale-95"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-5 h-5" color={cat.color} />
                </div>
                <span className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug break-words min-h-[1.75rem] flex items-center justify-center">
                  {cat.name}
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 mt-0.5">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </button>
            );
          })}

          {/* Inline Add Category Card */}
          <button
            type="button"
            onClick={() => {
              haptic.medium();
              onOpenAddCategory();
            }}
            className="p-3 rounded-2xl border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/40 hover:bg-orange-50 transition-all flex flex-col items-center justify-center text-center active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-100 group-hover:bg-orange-200 text-orange-600 flex items-center justify-center mb-1.5">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-extrabold text-orange-600">
              New Cat
            </span>
            <span className="text-[10px] font-semibold text-orange-400 mt-0.5">
              + Custom
            </span>
          </button>
        </div>
      </div>

      {/* Low Stock Items Section (if any) */}
      {lowStockItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">
                Low Stock Alerts
              </h2>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {lowStockItems.length} low
            </span>
          </div>

          <div className="space-y-2.5">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 border border-rose-200 flex items-center gap-3.5"
              >
                {/* Image */}
                <div
                  onClick={() => {
                    haptic.light();
                    onSelectItem(item);
                  }}
                  className="w-16 h-16 rounded-xl bg-zinc-100 overflow-hidden shrink-0 cursor-pointer border border-zinc-200"
                >
                  <img
                    src={item.images[0] || ''}
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
                    <span className="text-[11px] font-extrabold text-rose-600 bg-rose-100/70 px-2 py-0.5 rounded-md">
                      Qty: {item.quantity} (Min: {item.minQuantity})
                    </span>
                  </div>
                  {item.locationPath && (
                    <p className="text-[10px] text-zinc-500 font-medium truncate mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
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
                  className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-orange-500/20 transition-all shrink-0"
                  title="Restock +1 item"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
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
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentlyAddedItems.length === 0 ? (
          <EmptyBoxIllustration text="No items added yet. Click '+' to add one!" size={90} />
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
                  className="group bg-white rounded-3xl border border-zinc-200 overflow-hidden hover:border-orange-400 transition-all cursor-pointer flex flex-col active:scale-98"
                >
                  {/* Large Image Header */}
                  <div className="relative aspect-4/3 w-full bg-zinc-100 overflow-hidden">
                    <img
                      src={item.images[0] || ''}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Quantity pill */}
                    <div className="absolute bottom-2 left-2 bg-white px-2 py-0.5 rounded-full text-[11px] font-extrabold text-zinc-900 border border-zinc-200">
                      x{item.quantity}
                    </div>
                  </div>

                  {/* Item Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider block truncate mb-0.5"
                        style={{ color: cat?.color || '#FF5C00' }}
                      >
                        {cat?.name || 'Item'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1">
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
      <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-3xl p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-zinc-900">Found something new?</h3>
          <p className="text-xs text-zinc-600 mt-0.5">Snap a photo and store it in your vault</p>
        </div>
        <button
          type="button"
          onClick={() => {
            haptic.medium();
            onNavigateTab('add');
          }}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 transition-transform"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Item
        </button>
      </div>
    </div>
  );
};
