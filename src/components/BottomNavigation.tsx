import React from 'react';
import { Home, Layers, Plus, MapPin, Settings } from 'lucide-react';
import { NavigationTab } from '../types';
import { haptic } from '../utils/haptics';

interface BottomNavigationProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  lowStockCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  lowStockCount = 0,
}) => {
  const handleSelect = (tab: NavigationTab) => {
    if (tab === 'add') {
      haptic.medium();
    } else {
      haptic.selection();
    }
    onTabChange(tab);
  };

  return (
    <nav
      id="bottom-navigation-bar"
      className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border-t border-zinc-200/90 px-3 pt-1.5 pb-safe pb-3 shrink-0 rounded-t-3xl shadow-lg"
    >
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* Home */}
        <button
          id="nav-tab-home"
          type="button"
          onClick={() => handleSelect('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
            currentTab === 'home'
              ? 'text-black font-semibold'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all ${
              currentTab === 'home' ? 'bg-zinc-100 text-black' : ''
            }`}
          >
            <Home className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* Collection */}
        <button
          id="nav-tab-collection"
          type="button"
          onClick={() => handleSelect('collection')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl relative transition-all duration-150 active:scale-90 ${
            currentTab === 'collection'
              ? 'text-black font-semibold'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl relative transition-all ${
              currentTab === 'collection' ? 'bg-zinc-100 text-black' : ''
            }`}
          >
            <Layers className="w-5 h-5 stroke-[2]" />
            {lowStockCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-zinc-900 rounded-full ring-2 ring-white" />
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Collection</span>
        </button>

        {/* Centered Add Button - seamlessly elevated without disjointed floating overlay */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-5">
          <button
            id="nav-tab-add"
            type="button"
            onClick={() => handleSelect('add')}
            className={`w-13 h-13 rounded-full bg-black hover:bg-zinc-800 active:scale-90 text-white flex items-center justify-center shadow-lg shadow-black/20 border-4 border-white transition-all duration-150 ${
              currentTab === 'add' ? 'ring-4 ring-zinc-200' : ''
            }`}
            aria-label="Add New Item"
          >
            <Plus className="w-6 h-6 stroke-[2]" />
          </button>
          <span className="text-[10px] font-semibold text-black mt-0.5">Add</span>
        </div>

        {/* Locations */}
        <button
          id="nav-tab-locations"
          type="button"
          onClick={() => handleSelect('locations')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
            currentTab === 'locations'
              ? 'text-black font-semibold'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all ${
              currentTab === 'locations' ? 'bg-zinc-100 text-black' : ''
            }`}
          >
            <MapPin className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Locations</span>
        </button>

        {/* Settings */}
        <button
          id="nav-tab-settings"
          type="button"
          onClick={() => handleSelect('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
            currentTab === 'settings'
              ? 'text-black font-semibold'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all ${
              currentTab === 'settings' ? 'bg-zinc-100 text-black' : ''
            }`}
          >
            <Settings className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Settings</span>
        </button>
      </div>
    </nav>
  );
};
