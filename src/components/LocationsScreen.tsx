import React, { useState } from 'react';
import { StorageLocation, VaultItem, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { haptic } from '../utils/haptics';
import {
  MapPin,
  Plus,
  FolderTree,
  ChevronRight,
  Trash2,
  Package,
  Layers,
  Search,
  X,
  Boxes,
  ArrowRight,
} from 'lucide-react';

interface LocationsScreenProps {
  locations: StorageLocation[];
  items: VaultItem[];
  categories: Category[];
  onAddLocation: (name: string, parentId?: string, description?: string) => void;
  onDeleteLocation: (id: string) => void;
  onSelectItem: (item: VaultItem) => void;
  onNavigateToCollection: (locationId: string) => void;
}

export const LocationsScreen: React.FC<LocationsScreenProps> = ({
  locations,
  items,
  categories,
  onAddLocation,
  onDeleteLocation,
  onSelectItem,
  onNavigateToCollection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocParentId, setNewLocParentId] = useState('');
  const [newLocDescription, setNewLocDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);

  // Group locations or calculate items per location
  const filteredLocations = locations.filter((loc) =>
    loc.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    haptic.success();
    onAddLocation(
      newLocName.trim(),
      newLocParentId || undefined,
      newLocDescription.trim() || undefined
    );

    setNewLocName('');
    setNewLocParentId('');
    setNewLocDescription('');
    setShowAddModal(false);
  };

  const getItemsForLocation = (locationId: string) => {
    return items.filter((item) => item.locationId === locationId);
  };

  return (
    <div className="px-5 pt-3 pb-8 space-y-5">
      {/* Title & Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Locations</h1>
          <p className="text-xs text-zinc-500 font-medium">Physical storage bins, shelves & drawers</p>
        </div>

        <button
          type="button"
          onClick={() => {
            haptic.medium();
            setShowAddModal(true);
          }}
          className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Location
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter storage locations..."
          className="w-full bg-zinc-100/80 focus:bg-white text-zinc-900 text-sm font-medium pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200/80 focus:border-orange-500 outline-none"
        />
      </div>

      {/* Locations List / Tree */}
      <div className="space-y-3">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 rounded-3xl border border-zinc-200/60 p-6">
            <Boxes className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-700">No storage locations found</p>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Organize your workshop shelves, cabinets, and component drawers.
            </p>
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl"
            >
              Create First Location
            </button>
          </div>
        ) : (
          filteredLocations.map((loc) => {
            const locItems = getItemsForLocation(loc.id);
            const isSelected = selectedLocation?.id === loc.id;
            const segments = loc.path.split('→').map((s) => s.trim());

            return (
              <div
                key={loc.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-200 shadow-md'
                    : 'border-zinc-200/90 shadow-xs hover:border-zinc-300'
                }`}
              >
                <div
                  onClick={() => {
                    haptic.selection();
                    setSelectedLocation(isSelected ? null : loc);
                  }}
                  className="p-4 cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      {/* Breadcrumb path */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 flex-wrap">
                        {segments.map((seg, idx) => (
                          <React.Fragment key={idx}>
                            <span
                              className={
                                idx === segments.length - 1
                                  ? 'font-bold text-zinc-800'
                                  : 'text-zinc-500'
                              }
                            >
                              {seg}
                            </span>
                            {idx < segments.length - 1 && (
                              <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <h3 className="text-base font-extrabold text-zinc-900 truncate mt-0.5">
                        {loc.name}
                      </h3>

                      {loc.description && (
                        <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                          {loc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-orange-600 bg-orange-100/70 px-2.5 py-1 rounded-full">
                      {locItems.length} {locItems.length === 1 ? 'item' : 'items'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        haptic.warning();
                        if (confirm(`Delete storage location "${loc.name}"?`)) {
                          onDeleteLocation(loc.id);
                        }
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 transition-colors"
                      title="Delete Location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded items preview inside this location */}
                {isSelected && (
                  <div className="px-4 pb-4 pt-1 border-t border-zinc-100 bg-zinc-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-600">
                        Stored in {loc.name} ({locItems.length})
                      </span>
                      {locItems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            haptic.light();
                            onNavigateToCollection(loc.id);
                          }}
                          className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-0.5"
                        >
                          View in Collection <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {locItems.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic py-2">
                        No items assigned to this storage spot yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {locItems.map((item) => {
                          const cat = categories.find((c) => c.id === item.categoryId);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                haptic.light();
                                onSelectItem(item);
                              }}
                              className="bg-white p-2 rounded-2xl border border-zinc-200/80 flex items-center gap-2 cursor-pointer hover:border-orange-300 transition-all shadow-xs"
                            >
                              <div className="w-10 h-10 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-100">
                                <img
                                  src={item.images[0] || ''}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-zinc-900 truncate">
                                  {item.name}
                                </h4>
                                <span className="text-[10px] text-zinc-400 font-semibold block">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-zinc-900">Add Storage Location</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Location Name <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  placeholder="e.g. Drawer A3, Box 2, Top Shelf"
                  className="w-full bg-zinc-100 focus:bg-white text-zinc-900 px-3.5 py-2.5 rounded-xl text-sm font-semibold outline-none border border-zinc-200 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Parent Location (for nesting)
                </label>
                <select
                  value={newLocParentId}
                  onChange={(e) => setNewLocParentId(e.target.value)}
                  className="w-full bg-zinc-100 focus:bg-white text-zinc-900 px-3 py-2.5 rounded-xl text-xs font-semibold outline-none border border-zinc-200 focus:border-orange-500"
                >
                  <option value="">None (Top Level e.g. Workshop, Bedroom)</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.path}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Nest this location inside an existing room, shelf, or cabinet.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Optional Description
                </label>
                <input
                  type="text"
                  value={newLocDescription}
                  onChange={(e) => setNewLocDescription(e.target.value)}
                  placeholder="e.g. For electronic sensors & IC chips"
                  className="w-full bg-zinc-100 focus:bg-white text-zinc-900 px-3.5 py-2.5 rounded-xl text-xs font-medium outline-none border border-zinc-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newLocName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 shadow-xs"
                >
                  Create Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
