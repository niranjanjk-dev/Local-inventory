import React, { useState, useRef } from 'react';
import { VaultItem, Category, StorageLocation } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { VaultyMascot } from './CuteIllustrations';
import { AddCategoryModal } from './AddCategoryModal';
import { haptic } from '../utils/haptics';
import { ThemeConfig } from '../utils/theme';
import { usePWAInstall } from '../utils/usePWAInstall';
import {
  getOpenRouterApiKey,
  saveOpenRouterApiKey,
  clearOpenRouterApiKey,
  getSelectedModelId,
  saveSelectedModelId,
  VISION_MODELS,
  DEFAULT_MODEL_ID,
} from '../utils/apiKey';
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
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
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

  // AI Key & Model state
  const [aiKeyInput, setAiKeyInput] = useState('');
  const [showAiKeyValue, setShowAiKeyValue] = useState(false);
  const [aiKeySaved, setAiKeySaved] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(getSelectedModelId());
  const [hasAiKey, setHasAiKey] = useState(Boolean(getOpenRouterApiKey()));

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
        <p className="text-xs text-zinc-500 font-medium">Statistics, appearance &amp; local data management</p>
      </div>


      {/* ✨ AI Scan Settings */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl p-5 border border-violet-200 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-violet-900">AI Scan Settings</h3>
            <p className="text-[11px] text-violet-600 font-medium">Auto-fill item details from photos using AI</p>
          </div>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <p className="text-[11px] font-extrabold text-violet-800 uppercase tracking-wider">OpenRouter API Key</p>
          {hasAiKey ? (
            <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 border border-violet-200">
              <KeyRound className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-emerald-700 flex-1">API Key Active ✓</span>
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  clearOpenRouterApiKey();
                  setHasAiKey(false);
                  setAiKeyInput('');
                }}
                className="text-[11px] font-bold text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input
                    type={showAiKeyValue ? 'text' : 'password'}
                    value={aiKeyInput}
                    onChange={(e) => setAiKeyInput(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full bg-white border border-violet-200 rounded-xl pl-9 pr-10 py-2.5 text-xs font-semibold outline-none focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAiKeyValue(!showAiKeyValue)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400"
                  >
                    {showAiKeyValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={!aiKeyInput.trim()}
                  onClick={() => {
                    haptic.success();
                    saveOpenRouterApiKey(aiKeyInput.trim());
                    setHasAiKey(true);
                    setAiKeyInput('');
                  }}
                  className="px-4 py-2.5 rounded-xl font-extrabold text-xs bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40 transition-all"
                >
                  Save
                </button>
              </div>
              <p className="text-[11px] text-violet-600 font-medium">
                Get a free key at{' '}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline font-bold">
                  openrouter.ai/keys
                </a>. Stored locally on your device.
              </p>
            </div>
          )}
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <p className="text-[11px] font-extrabold text-violet-800 uppercase tracking-wider">Vision Model</p>
          <div className="space-y-1.5">
            {VISION_MODELS.map((model) => {
              const isSelected = selectedModelId === model.id;
              const badgeColors: Record<string, string> = {
                Free: 'bg-emerald-100 text-emerald-700',
                Fast: 'bg-sky-100 text-sky-700',
                Best: 'bg-violet-100 text-violet-700',
                Smart: 'bg-amber-100 text-amber-700',
              };
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    setSelectedModelId(model.id);
                    saveSelectedModelId(model.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-white border-violet-100 hover:border-violet-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold truncate ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                        {model.name}
                      </span>
                      {model.badge && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : badgeColors[model.badge] || ''
                        }`}>
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] font-medium truncate mt-0.5 ${isSelected ? 'text-violet-200' : 'text-zinc-400'}`}>
                      {model.provider} · {model.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-violet-500 font-medium px-1">
            All models listed support vision (image) input.
          </p>
        </div>
      </div>

      {/* Basic Collection Statistics Card */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-black flex items-center justify-center">
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
            <span className="text-xl font-black text-black">{totalUnits}</span>
          </div>
          <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 text-center">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">Est. Value</span>
            <span className="text-xl font-black text-black">
              ${totalValue > 999 ? (totalValue / 1000).toFixed(1) + 'k' : totalValue.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Category Breakdown Progress */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
            Category Distribution
          </span>
          <div className="h-10 w-full bg-zinc-100 border border-zinc-200 flex overflow-hidden rounded-xl">
            {categories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat.id).length;
              if (count === 0 || totalItems === 0) return null;
              const pct = (count / totalItems) * 100;
              return (
                <div
                  key={cat.id}
                  style={{ width: `${pct}%` }}
                  className={`h-full ${cat.color}`}
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
                <span key={cat.id} className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded-md border border-zinc-200 ${cat.color}`} />
                  {cat.name} ({count})
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* UI Aesthetics */}
      {theme && onUpdateTheme && (
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900">Border Outlines</h3>
              <p className="text-[11px] text-zinc-500">Show structural container borders</p>
            </div>
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                onUpdateTheme({ ...theme, hideBorders: !theme.hideBorders });
              }}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                !theme.hideBorders ? 'bg-black' : 'bg-zinc-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${
                  !theme.hideBorders ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Customizable Categories Section */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200 space-y-4">
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
            className="px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-2xl border border-zinc-200 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2]" /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            const parentCat = cat.parentId ? categories.find((c) => c.id === cat.parentId) : null;
            return (
              <div
                key={cat.id}
                className="p-3 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-2xl border border-zinc-200 flex items-center justify-center shrink-0 ${cat.color}`}
                  >
                    <CategoryIcon name={cat.icon} className="w-4 h-4" />
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
                    className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-xl transition-colors shrink-0"
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



      {/* Local Backup & Data Management (Offline IndexedDB / Export / Import) */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 text-black flex items-center justify-center">
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
          accept=".zip,application/zip,application/x-zip-compressed"
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
            <Download className="w-5 h-5 text-zinc-400 mb-0.5" />
            <span>Export Backup</span>
            <span className="text-[10px] text-zinc-400 font-normal">Save .zip file</span>
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
            <div className="bg-zinc-100 p-3 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <span className="text-xs text-black font-bold">Reset to starter demo collection?</span>
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
                  className="px-2.5 py-1 bg-black text-white text-xs font-bold rounded-lg"
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
            <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <span className="text-xs text-black font-bold">Delete all items and storage data?</span>
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
                  className="px-2.5 py-1 bg-black text-white text-xs font-bold rounded-lg"
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
              className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-black bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
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
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-black flex items-center justify-center shrink-0">
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-black hover:bg-zinc-800 transition-colors"
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
