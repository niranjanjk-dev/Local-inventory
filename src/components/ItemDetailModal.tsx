import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VaultItem, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { haptic } from '../utils/haptics';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Minus,
  MapPin,
  AlertTriangle,
  Calendar,
  DollarSign,
  Tag as TagIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ItemDetailModalProps {
  item: VaultItem;
  allItems?: VaultItem[];
  onNavigateItem?: (item: VaultItem) => void;
  categories: Category[];
  onClose: () => void;
  onEdit: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => void;
  onUpdateQuantity: (item: VaultItem, delta: number) => void;
  onSelectLocation?: (locationPath: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  allItems = [],
  onNavigateItem,
  categories,
  onClose,
  onEdit,
  onDelete,
  onUpdateQuantity,
  onSelectLocation,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [dragProgress, setDragProgress] = useState<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // When active item changes, reset active image index and state
  useEffect(() => {
    setActiveImageIndex(0);
    setShowDeleteConfirm(false);
    setDragProgress(0);
  }, [item.id]);

  const cat = categories.find((c) => c.id === item.categoryId);
  const isLowStock = item.minQuantity !== undefined && item.quantity <= item.minQuantity;

  // Navigation indices for swiping between items
  const currentIndex = allItems.findIndex((i) => i.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allItems.length - 1;

  const goToPrev = () => {
    if (hasPrev && onNavigateItem) {
      setSlideDirection('right');
      haptic.selection();
      onNavigateItem(allItems[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (hasNext && onNavigateItem) {
      setSlideDirection('left');
      haptic.selection();
      onNavigateItem(allItems[currentIndex + 1]);
    }
  };

  // Touch gesture listener (swipe left for next, swipe right for prev)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    // Only track if mostly horizontal to avoid interfering with vertical scroll
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      setDragProgress(dx);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) {
      setDragProgress(0);
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;
    setDragProgress(0);

    // Must be predominantly horizontal
    if (Math.abs(dx) > Math.abs(dy) * 1.15) {
      const isQuickSwipe = dt < 350 && Math.abs(dx) > 35;
      const isLongSwipe = Math.abs(dx) > 55;
      if (isQuickSwipe || isLongSwipe) {
        if (dx < 0 && hasNext) {
          goToNext();
        } else if (dx > 0 && hasPrev) {
          goToPrev();
        }
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allItems]);

  return (
    <div
      id="item-detail-modal-container"
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Desktop / Tablet Floating Side Arrows */}
      {hasPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-60 w-12 h-12 rounded-full bg-white/95 hover:bg-white text-zinc-800 shadow-2xl border border-zinc-200 items-center justify-center transition-all hover:scale-110 active:scale-95"
          title={`Previous: ${allItems[currentIndex - 1]?.name}`}
          aria-label="Previous item"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-60 w-12 h-12 rounded-full bg-white/95 hover:bg-white text-zinc-800 shadow-2xl border border-zinc-200 items-center justify-center transition-all hover:scale-110 active:scale-95"
          title={`Next: ${allItems[currentIndex + 1]?.name}`}
          aria-label="Next item"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-2 border-zinc-200 flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden relative shadow-2xl touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Dynamic Drag Direction Feedback Banner */}
        {dragProgress < -25 && hasNext && (
          <div className="absolute top-16 right-4 z-40 bg-zinc-900 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none animate-pulse">
            <span>Next: {allItems[currentIndex + 1]?.name}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        )}
        {dragProgress > 25 && hasPrev && (
          <div className="absolute top-16 left-4 z-40 bg-zinc-900 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none animate-pulse">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev: {allItems[currentIndex - 1]?.name}</span>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white z-20">
          <button
            type="button"
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Swipe / Item Position Navigator */}
          {allItems.length > 1 && (
            <div className="flex items-center gap-1 bg-zinc-100 rounded-full px-2 py-0.5 border border-zinc-200">
              <button
                type="button"
                onClick={goToPrev}
                disabled={!hasPrev}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-700 hover:bg-white disabled:opacity-25 transition-all"
                title="Previous item (or swipe right)"
                aria-label="Previous item"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-extrabold text-zinc-800 px-1 tracking-tight">
                {currentIndex + 1} / {allItems.length}
              </span>
              <button
                type="button"
                onClick={goToNext}
                disabled={!hasNext}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-700 hover:bg-white disabled:opacity-25 transition-all"
                title="Next item (or swipe left)"
                aria-label="Next item"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="hidden xs:inline-block text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/50">
                Swipe ↔
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                onEdit(item);
              }}
              className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
              title="Edit Item"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                haptic.warning();
                setShowDeleteConfirm(true);
              }}
              className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Item Content with Horizontal Motion Transitions */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            initial={{
              opacity: 0,
              x: slideDirection === 'left' ? 60 : slideDirection === 'right' ? -60 : 0,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: slideDirection === 'left' ? -60 : 60,
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="flex-1 flex flex-col overflow-y-auto"
          >
            {/* Scrollable Content */}
            <div className="p-5 space-y-5 flex-1">
              {/* Delete Confirmation Box */}
              {showDeleteConfirm && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <h4 className="text-sm font-extrabold">Remove this item from your Vault?</h4>
                  </div>
                  <p className="text-xs text-rose-600">
                    "{item.name}" will be permanently deleted from your local storage.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light();
                        setShowDeleteConfirm(false);
                      }}
                      className="px-3.5 py-1.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        haptic.heavy();
                        onDelete(item);
                      }}
                      className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
                    >
                      Delete Item
                    </button>
                  </div>
                </div>
              )}

              {/* Hero Image Showcase with Next / Prev Overlay Controls */}
              <div className="space-y-2">
                <motion.div
                  drag={allItems.length > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDrag={(_e, info) => setDragProgress(info.offset.x)}
                  onDragEnd={(_e, info) => {
                    setDragProgress(0);
                    if (info.offset.x < -40 || info.velocity.x < -200) {
                      if (hasNext) goToNext();
                    } else if (info.offset.x > 40 || info.velocity.x > 200) {
                      if (hasPrev) goToPrev();
                    }
                  }}
                  className="relative aspect-4/3 w-full rounded-3xl bg-zinc-100 overflow-hidden border border-zinc-200 select-none cursor-grab active:cursor-grabbing"
                >
                  <img
                    src={item.images[activeImageIndex] || item.images[0] || ''}
                    alt={item.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  {/* Low stock warning pill overlay */}
                  {isLowStock && (
                    <div className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 border border-white">
                      <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>LOW STOCK ({item.quantity}/{item.minQuantity})</span>
                    </div>
                  )}

                  {/* Prev / Next On-image Arrows */}
                  {hasPrev && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-800 shadow-md flex items-center justify-center transition-transform active:scale-90"
                      title="Previous item"
                      aria-label="Previous item"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {hasNext && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-800 shadow-md flex items-center justify-center transition-transform active:scale-90"
                      title="Next item"
                      aria-label="Next item"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Swipe Guide Pill */}
                  {allItems.length > 1 && (
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full pointer-events-none flex items-center gap-1">
                      <span>Swipe ← → to browse</span>
                    </div>
                  )}
                </motion.div>

                {/* Thumbnail selector if multiple images */}
                {item.images.length > 1 && (
                  <div className="flex gap-2 justify-center py-1">
                    {item.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          haptic.selection();
                          setActiveImageIndex(i);
                        }}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImageIndex === i
                            ? 'border-orange-500 scale-105'
                            : 'border-zinc-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Category Badge */}
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5"
                    style={{ backgroundColor: `${cat?.color || '#FF5C00'}15`, color: cat?.color || '#FF5C00' }}
                  >
                    <CategoryIcon name={cat?.icon || 'Package'} className="w-3.5 h-3.5" color={cat?.color} />
                    <span>{cat?.name || 'Category'}</span>
                  </span>

                  {item.subcategory && (
                    <span className="text-xs font-bold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
                      {item.subcategory}
                    </span>
                  )}

                  {item.condition && (
                    <span className="text-xs font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full ml-auto">
                      {item.condition}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-tight">
                  {item.name}
                </h1>

                {/* Location Pill */}
                {item.locationPath && (
                  <div
                    onClick={() => {
                      haptic.light();
                      if (onSelectLocation) onSelectLocation(item.locationPath!);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span>{item.locationPath}</span>
                  </div>
                )}
              </div>

              {/* Direct Inventory Stock Control Card */}
              <div className="bg-zinc-900 text-white rounded-3xl p-5 border-2 border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 block">
                      Current Stock
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-black text-white">{item.quantity}</span>
                      <span className="text-xs font-bold text-zinc-400">units in inventory</span>
                    </div>
                  </div>

                  {/* Instant +/- Quick Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light();
                        onUpdateQuantity(item, -1);
                      }}
                      className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-white flex items-center justify-center font-bold transition-all border border-zinc-700"
                      title="Remove 1 unit"
                    >
                      <Minus className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light();
                        onUpdateQuantity(item, +1);
                      }}
                      className="w-12 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-90 text-white flex items-center justify-center font-bold transition-all"
                      title="Add 1 unit"
                    >
                      <Plus className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                  <span>
                    Minimum Threshold: <strong className="text-white">{item.minQuantity ?? 0} units</strong>
                  </span>
                </div>
              </div>

              {/* Hardware & Specification Details */}
              {(item.brand || item.modelNumber || item.purchasePrice || item.purchaseDate) && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-4 space-y-2.5">
                  <h3 className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">
                    Item Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {item.brand && (
                      <div>
                        <span className="text-zinc-400 font-semibold block text-[11px]">Brand / Maker</span>
                        <strong className="text-zinc-800 font-bold">{item.brand}</strong>
                      </div>
                    )}
                    {item.modelNumber && (
                      <div>
                        <span className="text-zinc-400 font-semibold block text-[11px]">Model / Part #</span>
                        <strong className="text-zinc-800 font-bold">{item.modelNumber}</strong>
                      </div>
                    )}
                    {item.purchasePrice !== undefined && (
                      <div>
                        <span className="text-zinc-400 font-semibold block text-[11px]">Purchase Price</span>
                        <strong className="text-zinc-800 font-bold flex items-center gap-0.5">
                          <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                          {item.purchasePrice.toFixed(2)}
                        </strong>
                      </div>
                    )}
                    {item.purchaseDate && (
                      <div>
                        <span className="text-zinc-400 font-semibold block text-[11px]">Purchased</span>
                        <strong className="text-zinc-800 font-bold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {item.purchaseDate}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {item.notes && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-4 space-y-1.5">
                  <h3 className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">
                    Personal Notes & Pinouts
                  </h3>
                  <p className="text-xs text-zinc-700 whitespace-pre-wrap leading-relaxed font-medium">
                    {item.notes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div>
                  <span className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider block mb-2">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold px-2.5 py-1 rounded-xl"
                      >
                        <TagIcon className="w-3 h-3 text-zinc-400" />
                        <span>#{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

