import React, { useState } from 'react';
import { Category } from '../types';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from './CategoryIcon';
import { X, Check } from 'lucide-react';
import { haptic } from '../utils/haptics';

interface AddCategoryModalProps {
  categories?: Category[];
  defaultParentId?: string;
  onSave: (category: Category) => void;
  onClose: () => void;
}

const PRESET_PATTERNS = [
  'pattern-solid-black',
  'pattern-solid-zinc-800',
  'pattern-solid-zinc-600',
  'pattern-solid-zinc-400',
  'pattern-solid-zinc-200',
  'pattern-stripes',
  'pattern-stripes-light',
  'pattern-dots',
  'pattern-dots-dark',
  'pattern-checks',
  'pattern-crosshatch',
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  categories = [],
  defaultParentId = '',
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>(defaultParentId);
  const [icon, setIcon] = useState('Package');
  const [color, setColor] = useState(() => {
    if (defaultParentId) {
      const parent = categories.find((c) => c.id === defaultParentId);
      if (parent) return parent.color;
    }
    return 'pattern-solid-black';
  });
  const [description, setDescription] = useState('');

  // Top level categories to nest under
  const topLevelCategories = categories.filter((c) => !c.parentId);
  const parentCategory = categories.find((c) => c.id === parentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCategory: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      parentId: parentId || null,
      icon,
      color,
      isCustom: true,
      description: description.trim() || undefined,
    };

    haptic.success();
    onSave(newCategory);
  };

  return (
    <div
      id="add-category-modal"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 border border-zinc-200 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-2xl flex items-center justify-center border border-zinc-200 ${color}`}
            >
              <CategoryIcon name={icon} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">
                {parentId ? 'Add Sub-collection' : 'New Collection'}
              </h3>
              {parentCategory && (
                <p className="text-[11px] text-zinc-400 font-semibold">
                  Inside: <strong className="text-zinc-700">{parentCategory.name}</strong>
                </p>
              )}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Parent Selection / Sub-collection selector */}
          <div>
            <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider block mb-1">
              Collection Hierarchy
            </label>
            <div className="relative">
              <select
                value={parentId}
                onChange={(e) => {
                  haptic.selection();
                  const newParentId = e.target.value;
                  setParentId(newParentId);
                  if (newParentId) {
                    const chosen = categories.find((c) => c.id === newParentId);
                    if (chosen) {
                      setColor(chosen.color);
                      setIcon(chosen.icon);
                    }
                  }
                }}
                className="w-full bg-zinc-100 focus:bg-white text-zinc-900 px-3.5 py-2.5 rounded-2xl text-xs font-bold outline-none border border-zinc-200 focus:border-zinc-900 transition-all cursor-pointer"
              >
                <option value="">Top-Level Collection (Primary)</option>
                {topLevelCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    Sub-collection of: {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider block mb-1">
              {parentId ? 'Sub-collection Name' : 'Collection Name'}{' '}
              <span className="text-zinc-900">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                parentId
                  ? 'e.g. Sensors, Microcontrollers, Cables...'
                  : 'e.g. 3D Printing, Mineral Samples, LEGO...'
              }
              className="w-full bg-zinc-100 focus:bg-white text-zinc-900 px-3.5 py-2.5 rounded-2xl text-sm font-bold outline-none border border-zinc-200 focus:border-zinc-900 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider block mb-1.5">
              Select Icon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-28 overflow-y-auto p-2 bg-zinc-50 rounded-2xl border border-zinc-200">
              {AVAILABLE_CATEGORY_ICONS.map((iconKey) => (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    setIcon(iconKey);
                  }}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    icon === iconKey
                      ? 'bg-black text-white font-bold'
                      : 'bg-white text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <CategoryIcon name={iconKey} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider block mb-1.5">
              Shading Pattern
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_PATTERNS.map((pattern) => (
                <button
                  key={pattern}
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    setColor(pattern);
                  }}
                  className={`w-8 h-8 transition-transform border border-zinc-200 ${pattern} ${
                    color === pattern ? 'ring-2 ring-zinc-900 ring-offset-2 scale-110' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider block mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Parts, accessories and specialty tools"
              className="w-full bg-zinc-100 focus:bg-white text-zinc-900 px-3.5 py-2 rounded-2xl text-xs font-medium outline-none border border-zinc-200"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                haptic.light();
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-black hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2]" />
              <span>{parentId ? 'Save Sub-collection' : 'Save Collection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
