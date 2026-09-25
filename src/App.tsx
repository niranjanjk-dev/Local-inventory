import React, { useState, useEffect, useCallback } from 'react';
import { VaultItem, Category, StorageLocation, NavigationTab } from './types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import {
  getAllItems,
  saveItem,
  deleteItem,
  getAllCategories,
  saveCategory,
  deleteCategory,
  getAllLocations,
  saveLocation,
  deleteLocation,
  exportVaultData,
  importVaultData,
  resetToSampleData,
  clearAllData,
} from './services/storage';

import { AndroidFrame } from './components/AndroidFrame';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './components/HomeScreen';
import { CollectionScreen } from './components/CollectionScreen';
import { AddItemModal } from './components/AddItemModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { LocationsScreen } from './components/LocationsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AddCategoryModal } from './components/AddCategoryModal';
import { VaultyMascot } from './components/CuteIllustrations';
import { ThemeConfig, getSavedTheme, saveTheme, applyThemeToDOM } from './utils/theme';
import { scanItemWithAI } from './services/aiScan';
import { getOpenRouterApiKey } from './utils/apiKey';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeConfig>(getSavedTheme);

  // Apply theme immediately on load and on change
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const handleUpdateTheme = (newTheme: ThemeConfig) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  // Navigation & Modal State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [modalItemsContext, setModalItemsContext] = useState<VaultItem[] | null>(null);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [collectionFilterCategory, setCollectionFilterCategory] = useState<string | undefined>();

  const handleSelectItem = (item: VaultItem, list?: VaultItem[]) => {
    setSelectedItem(item);
    setModalItemsContext(list || null);
  };

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Reload data from IndexedDB
  const reloadData = useCallback(async () => {
    try {
      const [fetchedItems, fetchedCategories, fetchedLocations] = await Promise.all([
        getAllItems(),
        getAllCategories(),
        getAllLocations(),
      ]);
      setItems(fetchedItems);
      setCategories(fetchedCategories);
      setLocations(fetchedLocations);
    } catch (err) {
      console.error('Error loading vault data from IndexedDB:', err);
      showToast('Error loading local storage data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Handle Bottom Nav click
  const handleTabChange = (tab: NavigationTab) => {
    if (tab === 'add') {
      setEditingItem(null);
      setIsAddModalOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  // Item CRUD
  const handleSaveItem = async (itemToSave: VaultItem, backgroundScanImage?: string) => {
    try {
      await saveItem(itemToSave);
      await reloadData();
      setIsAddModalOpen(false);
      setEditingItem(null);
      if (selectedItem?.id === itemToSave.id) {
        setSelectedItem(itemToSave);
      }
      showToast(editingItem ? 'Item updated successfully!' : (backgroundScanImage ? 'Item saved! AI scanning in background...' : 'Added to your Vault!'));

      if (backgroundScanImage && itemToSave.isProcessingAI) {
        // Run AI Scan in background
        const apiKey = getOpenRouterApiKey();
        if (apiKey) {
          // Use a non-blocking IIFE to perform the background work
          (async () => {
            try {
              // Ensure we have latest categories
              const currentCats = await getAllCategories();
              const result = await scanItemWithAI(backgroundScanImage, currentCats, apiKey);
              
              const updatedItem: VaultItem = {
                ...itemToSave,
                name: result.name,
                brand: result.brand || itemToSave.brand,
                modelNumber: result.modelNumber || itemToSave.modelNumber,
                condition: result.condition || itemToSave.condition,
                tags: result.tags?.length ? Array.from(new Set([...itemToSave.tags, ...result.tags])) : itemToSave.tags,
                notes: result.notes || itemToSave.notes,
                quantity: result.quantity !== undefined ? result.quantity : itemToSave.quantity,
                isProcessingAI: false,
              };

              // Category mapping/creation
              let resolvedCategoryId = itemToSave.categoryId;
              const topLevelCategories = currentCats.filter((c) => !c.parentId);
              const normalise = (s: string) => s.toLowerCase().trim();
              const existingTopCat = topLevelCategories.find((c) => normalise(c.name) === normalise(result.categoryName));

              if (existingTopCat) {
                resolvedCategoryId = existingTopCat.id;
              } else if (result.isNewCategory) {
                const newCat: Category = {
                  id: `cat_ai_${Date.now()}`,
                  name: result.categoryName,
                  icon: result.categoryIcon || 'Package',
                  color: 'pattern-solid-zinc-600',
                  isCustom: true,
                  description: `AI-created category for ${result.categoryName}`,
                };
                await saveCategory(newCat);
                resolvedCategoryId = newCat.id;
              }
              updatedItem.categoryId = resolvedCategoryId;

              // Subcategory mapping/creation
              if (result.subcategoryName) {
                const existingSub = currentCats.find(
                  (c) => c.parentId === resolvedCategoryId && normalise(c.name) === normalise(result.subcategoryName!)
                );
                if (existingSub) {
                  updatedItem.subcategory = existingSub.name;
                } else if (result.isNewSubcategory) {
                  const parentCat = currentCats.find((c) => c.id === resolvedCategoryId);
                  const newSub: Category = {
                    id: `cat_ai_sub_${Date.now()}`,
                    name: result.subcategoryName,
                    parentId: resolvedCategoryId,
                    icon: parentCat?.icon || 'Package',
                    color: parentCat?.color || 'pattern-solid-zinc-400',
                    isCustom: true,
                  };
                  await saveCategory(newSub);
                  updatedItem.subcategory = newSub.name;
                } else {
                  updatedItem.subcategory = result.subcategoryName;
                }
              }

              await saveItem(updatedItem);
              await reloadData();
              showToast(`AI finished filling details for "${updatedItem.name}"`);
            } catch (err: any) {
              console.error('Background AI scan failed:', err);
              // Save the item without the processing flag so it doesn't spin forever
              await saveItem({ ...itemToSave, isProcessingAI: false });
              await reloadData();
              showToast(`Background scan failed: ${err.message}`, 'error');
            }
          })();
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save item locally', 'error');
    }
  };

  const handleDeleteItem = async (itemToDelete: VaultItem) => {
    try {
      await deleteItem(itemToDelete.id);
      await reloadData();
      setSelectedItem(null);
      showToast(`Removed "${itemToDelete.name}"`);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete item', 'error');
    }
  };

  const handleUpdateQuantity = async (item: VaultItem, delta: number) => {
    const prevQty = item.quantity;
    const newQty = Math.max(0, prevQty + delta);
    if (newQty === prevQty) return;

    const updatedItem: VaultItem = {
      ...item,
      quantity: newQty,
      updatedAt: Date.now(),
      lastUsedAt: delta < 0 ? Date.now() : item.lastUsedAt,
    };

    try {
      await saveItem(updatedItem);
      await reloadData();
      if (selectedItem?.id === item.id) {
        setSelectedItem(updatedItem);
      }
      showToast(
        delta > 0
          ? `Stock increased to ${newQty} (+${delta})`
          : `Stock decreased to ${newQty} (${delta})`
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to update quantity', 'error');
    }
  };

  // Category CRUD
  const handleAddCategory = async (newCategory: Category) => {
    try {
      await saveCategory(newCategory);
      await reloadData();
      showToast(`Category "${newCategory.name}" created!`);
    } catch (err) {
      console.error(err);
      showToast('Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await deleteCategory(catId);
      await reloadData();
      showToast('Category deleted');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete category', 'error');
    }
  };

  // Location CRUD
  const handleAddLocation = async (name: string, parentId?: string, description?: string) => {
    try {
      const parentLoc = parentId ? locations.find((l) => l.id === parentId) : null;
      const path = parentLoc ? `${parentLoc.path} → ${name}` : name;
      const newLoc: StorageLocation = {
        id: `loc_${Date.now()}`,
        name,
        parentId: parentId || null,
        path,
        description,
        createdAt: Date.now(),
      };
      await saveLocation(newLoc);
      await reloadData();
      showToast(`Location "${newLoc.name}" saved!`);
    } catch (err) {
      console.error(err);
      showToast('Failed to save location', 'error');
    }
  };

  const handleDeleteLocation = async (locId: string) => {
    try {
      await deleteLocation(locId);
      await reloadData();
      showToast('Location removed');
    } catch (err) {
      console.error(err);
      showToast('Failed to remove location', 'error');
    }
  };

  // Backup & Restore
  const handleExportBackup = async () => {
    try {
      const { blob, base64 } = await exportVaultData();
      const fileName = `myvault-backup-${new Date().toISOString().split('T')[0]}.zip`;

      if (Capacitor.isNativePlatform()) {
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache
        });
        await Share.share({
          title: 'Export Backup',
          url: savedFile.uri,
          dialogTitle: 'Share or Save Backup'
        });
        showToast('Backup exported successfully!');
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Backup downloaded successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to export backup', 'error');
    }
  };

  const handleImportBackup = async (file: File) => {
    try {
      const res = await importVaultData(file);
      await reloadData();
      showToast(`Restored ${res.itemsCount} items from backup!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to restore backup file', 'error');
    }
  };

  const handleResetSampleData = async () => {
    try {
      await resetToSampleData();
      await reloadData();
      showToast('Sample items restored!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAllData();
      await reloadData();
      showToast('All vault items cleared');
    } catch (err) {
      console.error(err);
    }
  };

  // Quick navigation from Location view or Home
  const handleNavigateToCollectionWithLocation = (locId: string) => {
    setCurrentTab('collection');
  };

  const lowStockCount = items.filter(
    (i) => i.minQuantity !== undefined && i.quantity <= i.minQuantity
  ).length;

  return (
    <AndroidFrame>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="toast-notification-banner"
          className={`fixed top-12 inset-x-4 max-w-sm mx-auto z-50 px-4 py-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-zinc-900 text-white border-zinc-700'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Tab Views */}
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] space-y-3">
          <VaultyMascot size={72} className="animate-bounce" />
          <p className="text-sm font-bold text-zinc-600">Opening your local vault...</p>
        </div>
      ) : (
        <main className="flex-1 w-full">
          {currentTab === 'home' && (
            <HomeScreen
              items={items}
              categories={categories}
              onSelectItem={handleSelectItem}
              onNavigateTab={handleTabChange}
              onSelectCategory={(catId) => {
                setCollectionFilterCategory(catId);
                setCurrentTab('collection');
              }}
              onUpdateQuantity={handleUpdateQuantity}
              onOpenAddCategory={() => setIsAddCategoryModalOpen(true)}
            />
          )}

          {currentTab === 'collection' && (
            <CollectionScreen
              items={items}
              categories={categories}
              locations={locations}
              selectedCategoryId={collectionFilterCategory}
              onSelectItem={handleSelectItem}
              onUpdateQuantity={handleUpdateQuantity}
              onAddNew={() => {
                setEditingItem(null);
                setIsAddModalOpen(true);
              }}
              onOpenAddCategory={() => setIsAddCategoryModalOpen(true)}
              onDeleteCategory={handleDeleteCategory}
              onAddCategory={handleAddCategory}
            />
          )}

          {currentTab === 'locations' && (
            <LocationsScreen
              locations={locations}
              items={items}
              categories={categories}
              onAddLocation={handleAddLocation}
              onDeleteLocation={handleDeleteLocation}
              onSelectItem={handleSelectItem}
              onNavigateToCollection={handleNavigateToCollectionWithLocation}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen
              items={items}
              categories={categories}
              locations={locations}
              theme={theme}
              onUpdateTheme={handleUpdateTheme}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetSampleData={handleResetSampleData}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
        lowStockCount={lowStockCount}
      />

      {/* Add / Edit Item Modal */}
      {(isAddModalOpen || editingItem) && (
        <AddItemModal
          categories={categories}
          locations={locations}
          initialItem={editingItem}
          onSave={handleSaveItem}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
          onAddCategory={handleAddCategory}
        />
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          allItems={modalItemsContext && modalItemsContext.length > 0 ? modalItemsContext : items}
          onNavigateItem={(newItem) => setSelectedItem(newItem)}
          categories={categories}
          onClose={() => {
            setSelectedItem(null);
            setModalItemsContext(null);
          }}
          onEdit={(item) => {
            setSelectedItem(null);
            setModalItemsContext(null);
            setEditingItem(item);
          }}
          onDelete={handleDeleteItem}
          onUpdateQuantity={handleUpdateQuantity}
          onSelectLocation={() => {
            setSelectedItem(null);
            setModalItemsContext(null);
            setCurrentTab('locations');
          }}
        />
      )}

      {/* Global Add Category Modal */}
      {isAddCategoryModalOpen && (
        <AddCategoryModal
          categories={categories}
          onSave={(newCat) => {
            handleAddCategory(newCat);
            setIsAddCategoryModalOpen(false);
          }}
          onClose={() => setIsAddCategoryModalOpen(false)}
        />
      )}
    </AndroidFrame>
  );
}
