import React, { useState, useRef, useEffect } from 'react';
import { VaultItem, Category, StorageLocation } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { AddCategoryModal } from './AddCategoryModal';
import { SAMPLE_IMAGES } from '../data/sampleData';
import { savePhotoToFileSystem } from '../utils/fileSystem';
import { haptic } from '../utils/haptics';
import { scanItemWithAI } from '../services/aiScan';
import { getOpenRouterApiKey, saveOpenRouterApiKey } from '../utils/apiKey';
import {
  Camera,
  Upload,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  MapPin,
  Sparkles,
  Loader2,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface AddItemModalProps {
  categories: Category[];
  locations: StorageLocation[];
  initialItem?: VaultItem | null;
  onSave: (item: VaultItem) => void;
  onClose: () => void;
  onAddCategory?: (category: Category) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  categories,
  locations,
  initialItem,
  onSave,
  onClose,
  onAddCategory,
}) => {
  const isEditing = Boolean(initialItem);

  // Core required & primary fields
  const [name, setName] = useState(initialItem?.name || '');
  const [categoryId, setCategoryId] = useState(initialItem?.categoryId || categories[0]?.id || '');
  const [quantity, setQuantity] = useState(initialItem?.quantity ?? 1);
  const [locationId, setLocationId] = useState(initialItem?.locationId || '');
  const [images, setImages] = useState<string[]>(initialItem?.images || []);

  // Category creation popup state
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [subParentIdForAddModal, setSubParentIdForAddModal] = useState<string | undefined>(undefined);

  // Top level categories and current subcategories
  const topLevelCategories = categories.filter((c) => !c.parentId);
  const currentSubcategories = categories.filter((c) => c.parentId === categoryId);

  // Expandable secondary fields
  const [showMoreDetails, setShowMoreDetails] = useState(
    Boolean(
      initialItem?.subcategory ||
        initialItem?.minQuantity ||
        initialItem?.brand ||
        initialItem?.modelNumber ||
        initialItem?.condition ||
        initialItem?.purchasePrice ||
        initialItem?.notes ||
        (initialItem?.tags && initialItem.tags.length > 0)
    )
  );

  const [subcategory, setSubcategory] = useState(initialItem?.subcategory || '');
  const [minQuantity, setMinQuantity] = useState<number | undefined>(initialItem?.minQuantity);
  const [condition, setCondition] = useState<VaultItem['condition']>(
    initialItem?.condition || 'Mint / New'
  );
  const [brand, setBrand] = useState(initialItem?.brand || '');
  const [modelNumber, setModelNumber] = useState(initialItem?.modelNumber || '');
  const [tags, setTags] = useState<string[]>(initialItem?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    initialItem?.purchaseDate || new Date().toISOString().split('T')[0]
  );
  const [purchasePrice, setPurchasePrice] = useState<string>(
    initialItem?.purchasePrice !== undefined ? String(initialItem.purchasePrice) : ''
  );
  const [notes, setNotes] = useState(initialItem?.notes || '');

  // Camera & Image Upload
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Scan State
  const [aiScanLoading, setAiScanLoading] = useState(false);
  const [aiScanError, setAiScanError] = useState<string | null>(null);
  const [aiScanSuccess, setAiScanSuccess] = useState(false);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [pendingCategoriesToCreate, setPendingCategoriesToCreate] = useState<Category[]>([]);

  useEffect(() => {
    if (!isEditing && images.length === 0) {
      setImages([SAMPLE_IMAGES.arduino]);
    }
  }, []);

  const startCamera = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      if (image.dataUrl) {
        setImages((prev) => [image.dataUrl as string, ...prev]);
      }
    } catch (err) {
      console.error('Camera error', err);
    }
  };

  const stopCamera = () => {
    // No-op for Capacitor Camera as it handles its own UI
  };

  const capturePhoto = () => {
    // Handled by Capacitor Camera directly
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    haptic.light();
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      haptic.medium();
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    haptic.light();
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // ─── AI SCAN ───────────────────────────────────────────────────────────────
  const handleAiScan = async () => {
    setAiScanError(null);
    setAiScanSuccess(false);

    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      setShowApiKeyPrompt(true);
      return;
    }

    // Pick the first real (non-SVG) image, or the first image overall
    const imageToScan =
      images.find((img) => img.startsWith('data:image/') && !img.startsWith('data:image/svg')) ||
      images[0];

    if (!imageToScan) {
      setAiScanError('Please add a photo first, then tap AI Scan!');
      return;
    }

    setAiScanLoading(true);
    haptic.medium();

    try {
      const result = await scanItemWithAI(imageToScan, categories, apiKey);

      // ── Apply fields ──
      setName(result.name);
      if (result.brand) setBrand(result.brand);
      if (result.modelNumber) setModelNumber(result.modelNumber);
      if (result.condition) setCondition(result.condition);
      if (result.tags && result.tags.length > 0) setTags(result.tags);
      if (result.notes) setNotes(result.notes);
      if (result.quantity) setQuantity(result.quantity);
      setShowMoreDetails(true);

      // ── Category matching / creation ──
      const normalise = (s: string) => s.toLowerCase().trim();
      const existingTopCat = topLevelCategories.find(
        (c) => normalise(c.name) === normalise(result.categoryName)
      );

      let resolvedCategoryId = categoryId;

      if (existingTopCat) {
        resolvedCategoryId = existingTopCat.id;
        setCategoryId(existingTopCat.id);
      } else if (result.isNewCategory) {
        // Create new top-level category inline
        const newCat: Category = {
          id: `cat_ai_${Date.now()}`,
          name: result.categoryName,
          icon: result.categoryIcon || 'Package',
          color: 'pattern-solid-zinc-600',
          isCustom: true,
          description: `AI-created category for ${result.categoryName}`,
        };
        if (onAddCategory) onAddCategory(newCat);
        resolvedCategoryId = newCat.id;
        setCategoryId(newCat.id);
        setPendingCategoriesToCreate((prev) => [...prev, newCat]);
      }

      // ── Sub-collection matching / creation ──
      if (result.subcategoryName) {
        const existingSub = categories.find(
          (c) =>
            c.parentId === resolvedCategoryId &&
            normalise(c.name) === normalise(result.subcategoryName!)
        );

        if (existingSub) {
          setSubcategory(existingSub.name);
        } else if (result.isNewSubcategory && result.subcategoryName) {
          // Create new subcategory inline
          const parentCat = topLevelCategories.find((c) => c.id === resolvedCategoryId) ||
            categories.find((c) => c.id === resolvedCategoryId);
          const newSub: Category = {
            id: `cat_ai_sub_${Date.now()}`,
            name: result.subcategoryName,
            parentId: resolvedCategoryId,
            icon: parentCat?.icon || 'Package',
            color: parentCat?.color || 'pattern-solid-zinc-400',
            isCustom: true,
          };
          if (onAddCategory) onAddCategory(newSub);
          setSubcategory(result.subcategoryName);
          setPendingCategoriesToCreate((prev) => [...prev, newSub]);
        } else if (result.subcategoryName) {
          setSubcategory(result.subcategoryName);
        }
      }

      setAiScanSuccess(true);
      haptic.success();
      setTimeout(() => setAiScanSuccess(false), 3000);
    } catch (err: any) {
      console.error('AI scan error:', err);
      setAiScanError(err.message || 'AI scan failed. Please try again.');
      haptic.light();
    } finally {
      setAiScanLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      saveOpenRouterApiKey(apiKeyInput.trim());
      setShowApiKeyPrompt(false);
      setApiKeyInput('');
      // Auto-trigger scan
      setTimeout(() => handleAiScan(), 100);
    }
  };
  // ──────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedLoc = locations.find((l) => l.id === locationId);
    const now = Date.now();

    // Process images: save base64 to filesystem and keep URIs
    let processedImages = [SAMPLE_IMAGES.arduino];
    if (images.length > 0) {
      processedImages = [];
      for (const img of images) {
        try {
          const uri = await savePhotoToFileSystem(img);
          processedImages.push(uri);
        } catch (err) {
          console.error('Failed to save image to filesystem', err);
          processedImages.push(img); // Fallback
        }
      }
    }

    const itemData: VaultItem = {
      id: initialItem?.id || `item_${now}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      images: processedImages,
      categoryId: categoryId || categories[0]?.id || 'cat_misc',
      subcategory: subcategory.trim() || undefined,
      quantity: Math.max(0, quantity),
      minQuantity: minQuantity !== undefined ? Math.max(0, minQuantity) : undefined,
      condition,
      brand: brand.trim() || undefined,
      modelNumber: modelNumber.trim() || undefined,
      tags,
      locationId: locationId || undefined,
      locationPath: selectedLoc?.path || undefined,
      purchaseDate: purchaseDate || undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      notes: notes.trim() || undefined,
      isFavorite: initialItem?.isFavorite || false,
      createdAt: initialItem?.createdAt || now,
      updatedAt: now,
    };

    haptic.success();
    onSave(itemData);
  };

  return (
    <div
      id="add-item-modal-container"
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-2 border-zinc-200 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-black flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 tracking-tight">
                {isEditing ? 'Edit Item' : 'Add to Vault'}
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                Only name and category are required
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Photos Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5 gap-2">
              <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider shrink-0">
                Item Photos {images.length > 0 && <span className="text-zinc-500">({images.length})</span>}
              </label>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    startCamera();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap"
                  title="Take photo with camera"
                >
                  <Camera className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span>Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap"
                  title="Upload from device"
                >
                  <Upload className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {cameraError && (
              <p className="text-xs text-black font-semibold mb-2">{cameraError}</p>
            )}

            {/* Image Preview Carousel */}
            {images.length > 0 ? (
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 group"
                  >
                    <img src={img} alt="item preview" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                        COVER
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light();
                        removeImage(idx);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center opacity-80 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100 flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-[10px] font-bold mt-1">Add Photo</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 hover:border-zinc-400 rounded-2xl p-6 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-zinc-400 mb-1" />
                <span className="text-xs font-bold text-zinc-700">Add or snap photo</span>
                <span className="text-[11px] text-zinc-400 mt-0.5">Stored 100% locally on your device</span>
              </div>
            )}

            {/* ✨ AI Scan Button */}
            <div className="mt-3">
              {!showApiKeyPrompt ? (
                <button
                  type="button"
                  onClick={handleAiScan}
                  disabled={aiScanLoading || images.length === 0}
                  className={`w-full py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-98
                    ${aiScanSuccess
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                >
                  {aiScanLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analysing photo...</span>
                    </>
                  ) : aiScanSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Fields filled by AI ✓</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>✨ AI Scan &amp; Fill Fields</span>
                    </>
                  )}
                </button>
              ) : (
                /* API Key entry inline panel */
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
                    <p className="text-xs font-extrabold text-indigo-900">Enter your OpenRouter API Key</p>
                  </div>
                  <p className="text-[11px] text-indigo-700 leading-relaxed">
                    Get a free key at{' '}
                    <span className="font-bold underline">openrouter.ai/keys</span>. 
                    It is saved locally on this device only.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                      placeholder="sk-or-..."
                      className="flex-1 bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveApiKey}
                      disabled={!apiKeyInput.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                    >
                      Save &amp; Scan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApiKeyPrompt(false)}
                      className="px-3 py-2 bg-zinc-100 text-zinc-700 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* AI Error */}
              {aiScanError && (
                <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-700 font-semibold">{aiScanError}</p>
                </div>
              )}

              {/* Hint when no photo yet */}
              {images.length === 0 && !showApiKeyPrompt && (
                <p className="text-center text-[11px] text-zinc-400 mt-1.5 font-medium">
                  Add a photo first to enable AI scanning
                </p>
              )}
            </div>
          </div>

          {/* 1. Item Name (Required) */}
          <div>
            <label
              htmlFor="item-name-input"
              className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider block mb-1.5"
            >
              Item Name <span className="text-zinc-900">*</span>
            </label>
            <input
              id="item-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arduino Mega 2560 or LEGO Pilot..."
              className="w-full bg-zinc-100 focus:bg-white text-zinc-900 text-sm font-bold px-4 py-3 rounded-2xl border border-zinc-200 focus:border-zinc-900 outline-none transition-all"
            />
          </div>

            {/* 2. Category Selector with "+ Add Category" button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                Category <span className="text-zinc-900">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  haptic.medium();
                  setSubParentIdForAddModal(undefined);
                  setShowAddCatModal(true);
                }}
                className="text-xs font-bold text-zinc-900 hover:text-black flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2]" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1.5 border border-zinc-200 rounded-2xl bg-zinc-50">
              {topLevelCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      haptic.selection();
                      setCategoryId(cat.id);
                      setSubcategory('');
                    }}
                    className={`p-2 rounded-xl text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-black text-white font-bold'
                        : 'bg-white text-zinc-700 hover:bg-zinc-100 font-semibold border border-zinc-100'
                    }`}
                  >
                    <CategoryIcon
                      name={cat.icon}
                      className="w-4 h-4 shrink-0"
                      color={isSelected ? '#FFFFFF' : cat.color}
                    />
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}

              {/* Inline button to add custom category */}
              <button
                type="button"
                onClick={() => {
                  haptic.medium();
                  setSubParentIdForAddModal(undefined);
                  setShowAddCatModal(true);
                }}
                className="p-2 rounded-xl text-left flex items-center gap-1.5 border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-extrabold text-xs transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2] shrink-0" />
                <span className="truncate">+ New</span>
              </button>
            </div>

            {/* Sub-collection selector if active category has subcategories or user adds one */}
            <div className="mt-2.5 pt-2.5 border-t border-zinc-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wider">
                  Sub-collection
                </span>
                <button
                  type="button"
                  onClick={() => {
                    haptic.medium();
                    setSubParentIdForAddModal(categoryId);
                    setShowAddCatModal(true);
                  }}
                  className="text-[11px] font-bold text-zinc-900 hover:text-black flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3 stroke-[2]" /> Add Sub-collection
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    setSubcategory('');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    !subcategory
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  Main / General
                </button>
                {currentSubcategories.map((sub) => {
                  const isSubSelected = subcategory === sub.name;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        haptic.selection();
                        setSubcategory(sub.name);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isSubSelected
                          ? 'bg-black text-white'
                          : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      <CategoryIcon
                        name={sub.icon}
                        className="w-3 h-3"
                        color={isSubSelected ? '#FFFFFF' : sub.color}
                      />
                      <span>{sub.name}</span>
                    </button>
                  );
                })}

                {/* Show AI-suggested subcategory as a pill if not in list yet */}
                {subcategory &&
                  !currentSubcategories.some((s) => s.name === subcategory) && (
                    <button
                      type="button"
                      onClick={() => setSubcategory(subcategory)}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-violet-600 text-white"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{subcategory}</span>
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* 3. Quantity Controls (Unified single stepper, no browser spinner arrows) */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <label className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider block">
                Quantity in Stock
              </label>
              <p className="text-[11px] text-zinc-500 font-medium">How many units do you own?</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  setQuantity(Math.max(0, quantity - 1));
                }}
                className="w-10 h-10 rounded-xl bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100 active:scale-95 flex items-center justify-center font-bold transition-transform"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 text-center bg-white border border-zinc-300 rounded-xl py-2 text-base font-black text-zinc-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  setQuantity(quantity + 1);
                }}
                className="w-10 h-10 rounded-xl bg-black text-white hover:bg-zinc-800 active:scale-95 flex items-center justify-center font-bold transition-transform"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* 4. Storage Location (Optional) */}
          <div>
            <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider block mb-1.5">
              Storage Location (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <MapPin className="w-4 h-4 text-zinc-500" />
              </div>
              <select
                value={locationId}
                onChange={(e) => {
                  haptic.selection();
                  setLocationId(e.target.value);
                }}
                className="w-full bg-zinc-100 focus:bg-white text-zinc-900 text-sm font-semibold pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 focus:border-zinc-900 outline-none cursor-pointer"
              >
                <option value="">No location assigned</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.path}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expandable "More Details" Accordion */}
          <div className="pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => {
                haptic.light();
                setShowMoreDetails(!showMoreDetails);
              }}
              className="w-full py-2 flex items-center justify-between text-xs font-extrabold text-zinc-700 hover:text-black transition-colors"
            >
              <span>{showMoreDetails ? 'Hide Extra Details' : 'More Details (Condition, Price, Notes, Tags...)'}</span>
              {showMoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMoreDetails && (
              <div className="space-y-4 pt-3">
                {/* Subcategory & Min Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g. Sensors, Minifig"
                      className="w-full bg-zinc-100 px-3 py-2 rounded-xl text-xs font-semibold outline-none border border-zinc-200 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Min Qty (Low stock alert)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minQuantity ?? ''}
                      onChange={(e) =>
                        setMinQuantity(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      placeholder="e.g. 2"
                      className="w-full bg-zinc-100 px-3 py-2 rounded-xl text-xs font-semibold outline-none border border-zinc-200 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Condition & Brand */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Condition</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as VaultItem['condition'])}
                      className="w-full bg-zinc-100 px-3 py-2 rounded-xl text-xs font-semibold outline-none border border-zinc-200 focus:bg-white"
                    >
                      <option value="Mint / New">Mint / New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Parts Only">Parts Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Brand / Maker</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Pololu, LEGO, Bosch"
                      className="w-full bg-zinc-100 px-3 py-2 rounded-xl text-xs font-semibold outline-none border border-zinc-200 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Model Number & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Model / Part #
                    </label>
                    <input
                      type="text"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      placeholder="e.g. ESP32-WROOM-32D"
                      className="w-full bg-zinc-100 px-3 py-2 rounded-xl text-xs font-semibold outline-none border border-zinc-200 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-100 px-3 py-2 rounded-xl text-xs font-semibold outline-none border border-zinc-200 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-zinc-100 px-3 py-2 rounded-xl text-xs font-semibold outline-none border border-zinc-200 focus:bg-white"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Type tag & press enter"
                      className="flex-1 bg-zinc-100 px-3 py-2 rounded-xl text-xs font-semibold outline-none border border-zinc-200 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 rounded-xl bg-zinc-800 text-white font-bold text-xs"
                    >
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-zinc-200 text-zinc-800 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-black"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                    Personal Notes / Specs
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Datasheet links, pinout notes, storage conditions, or build ideas..."
                    className="w-full bg-zinc-100 p-3 rounded-xl text-xs font-medium outline-none border border-zinc-200 focus:bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              id="save-item-submit-button"
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Check className="w-5 h-5 stroke-[2]" />
              <span>{isEditing ? 'Save Changes' : 'Save to Vault'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Embedded Add Category Modal */}
      {showAddCatModal && (
        <AddCategoryModal
          categories={categories}
          defaultParentId={subParentIdForAddModal}
          onSave={(newCat) => {
            if (onAddCategory) {
              onAddCategory(newCat);
            }
            if (newCat.parentId) {
              setCategoryId(newCat.parentId);
              setSubcategory(newCat.name);
            } else {
              setCategoryId(newCat.id);
              setSubcategory('');
            }
            setShowAddCatModal(false);
          }}
          onClose={() => setShowAddCatModal(false)}
        />
      )}
    </div>
  );
};
