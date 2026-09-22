import React, { useState, useRef } from 'react';
import { VaultItem, Category, StorageLocation } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { VaultyMascot } from './CuteIllustrations';
import { AddCategoryModal } from './AddCategoryModal';
import { haptic } from '../utils/haptics';
import { ThemeConfig, COLOR_OPTIONS, DEFAULT_THEME } from '../utils/theme';
import { usePWAInstall } from '../utils/usePWAInstall';
import {
  Download,
  Upload,
  Plus,
  Trash2,
  PieChart,
  HardDrive,
  ShieldCheck,
  RotateCcw,
  Palette,
  Check,
  Smartphone,
  ExternalLink,
  Copy,
  Sparkles,
} from 'lucide-react';

interface SettingsScreenProps {
  items: VaultItem[];
  categories: Category[];
  locations: StorageLocation[];
  theme?: ThemeConfig;
  onUpdateTheme?: (theme: ThemeConfig) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  items,
  categories,
  locations,
  theme,
  onUpdateTheme,
  onAddCategory,
  onDeleteCategory,
  onExportBackup,
  onImportBackup,
  onResetSampleData,
  onClearAllData,
}) => {
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const pwa = usePWAInstall();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stats
  const totalItems = items.length;
  const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = items.reduce(
    (sum, item) => sum + (item.purchasePrice ? item.purchasePrice * item.quantity : 0),
    0
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
  };

  return (
    <div className="px-5 pt-3 pb-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Vault Settings</h1>
        <p className="text-xs text-zinc-500 font-medium">Statistics, appearance & local data management</p>
      </div>


      {/* Basic Collection Statistics Card */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-zinc-900">Collection Statistics</h3>
          </div>
          <span className="text-[11px] font-bold text-zinc-400">{locations.length} Locations</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 text-center">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">Items</span>
            <span className="text-xl font-black text-zinc-900">{totalItems}</span>
          </div>
          <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 text-center">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">Pieces</span>
            <span className="text-xl font-black text-orange-600">{totalUnits}</span>
          </div>
          <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 text-center">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">Est. Value</span>
            <span className="text-xl font-black text-emerald-600">
              ${totalValue > 999 ? (totalValue / 1000).toFixed(1) + 'k' : totalValue.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Category Breakdown Progress */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
            Category Distribution
          </span>
          <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden flex">
            {categories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat.id).length;
              if (count === 0 || totalItems === 0) return null;
              const pct = (count / totalItems) * 100;
              return (
                <div
                  key={cat.id}
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  title={`${cat.name}: ${count} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px] font-semibold text-zinc-600">
            {categories.slice(0, 5).map((cat) => {
              const count = items.filter((i) => i.categoryId === cat.id).length;
              if (count === 0) return null;
              return (
                <span key={cat.id} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name} ({count})
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customizable Categories Section */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900">Categories ({categories.length})</h3>
            <p className="text-[11px] text-zinc-500">Create custom categories for your physical collection</p>
          </div>
          <button
            type="button"
            onClick={() => {
              haptic.medium();
              setShowAddCatModal(true);
            }}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            const parentCat = cat.parentId ? categories.find((c) => c.id === cat.parentId) : null;
            return (
              <div
                key={cat.id}
                className="p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} className="w-4 h-4" color={cat.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-zinc-900 block break-words leading-tight">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium block mt-0.5">
                      {parentCat ? `Sub-collection of ${parentCat.name}` : `${count} ${count === 1 ? 'item' : 'items'}`}
                    </span>
                  </div>
                </div>

                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      haptic.warning();
                      setCategoryToDelete(cat);
                    }}
                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                    title={`Delete collection "${cat.name}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Theme & Customization Card */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900">Appearance & Theme</h3>
              <p className="text-[11px] text-zinc-500 font-medium">Select your vault accent color</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-200/50">
            Active
          </span>
        </div>

        {/* Accent Color Palette Swatches */}
        <div>
          <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider block mb-2.5">
            Accent Color
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COLOR_OPTIONS.map((c) => {
              const isSelected = (theme?.accent || DEFAULT_THEME.accent) === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    onUpdateTheme?.({
                      accent: c.id,
                      radius: 'compact',
                    });
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center ring-2 ring-white/40 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold block truncate leading-tight">{c.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Local Backup & Data Management (Offline IndexedDB / Export / Import) */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900">Local Device Backup</h3>
            <p className="text-[11px] text-zinc-400 font-medium">Export/restore database & images completely offline</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Export Button */}
          <button
            type="button"
            onClick={() => {
              haptic.success();
              onExportBackup();
            }}
            className="p-3.5 rounded-2xl bg-zinc-900 hover:bg-black text-white font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-98 transition-transform text-center"
          >
            <Download className="w-5 h-5 text-orange-400 mb-0.5" />
            <span>Export Backup</span>
            <span className="text-[10px] text-zinc-400 font-normal">Save .json file</span>
          </button>

          {/* Import Button */}
          <button
            type="button"
            onClick={() => {
              haptic.medium();
              fileInputRef.current?.click();
            }}
            className="p-3.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-98 transition-transform text-center border border-zinc-200"
          >
            <Upload className="w-5 h-5 text-zinc-600 mb-0.5" />
            <span>Restore Backup</span>
            <span className="text-[10px] text-zinc-400 font-normal">Load from file</span>
          </button>
        </div>

        {/* Reset & Clear Database Controls */}
        <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
          {showResetConfirm ? (
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex items-center justify-between">
              <span className="text-xs text-amber-800 font-bold">Reset to starter demo collection?</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptic.heavy();
                    onResetSampleData();
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                haptic.warning();
                setShowResetConfirm(true);
              }}
              className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Load Starter Demo Collection</span>
            </button>
          )}

          {showClearConfirm ? (
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 flex items-center justify-between">
              <span className="text-xs text-rose-800 font-bold">Delete all items and storage data?</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    setShowClearConfirm(false);
                  }}
                  className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptic.heavy();
                    onClearAllData();
                    setShowClearConfirm(false);
                  }}
                  className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                haptic.error();
                setShowClearConfirm(true);
              }}
              className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Vault Data</span>
            </button>
          )}
        </div>
      </div>


      {/* Add Custom Category Modal */}
      {showAddCatModal && (
        <AddCategoryModal
          categories={categories}
          onSave={(newCat) => {
            onAddCategory(newCat);
            setShowAddCatModal(false);
          }}
          onClose={() => setShowAddCatModal(false)}
        />
      )}

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-5 border-2 border-zinc-200 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">
                  Delete Collection?
                </h3>
                <p className="text-xs text-zinc-500">"{categoryToDelete.name}"</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 font-medium leading-relaxed bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
              Any items currently in "{categoryToDelete.name}" will not be lost; they will be reassigned to Miscellaneous.
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
                  onDeleteCategory(categoryToDelete.id);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
