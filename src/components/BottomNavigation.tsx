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
      className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border-t border-zinc-200/90 px-3 pt-1.5 pb-safe pb-3 shrink-0"
    >
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* Home */}
        <button
          id="nav-tab-home"
          type="button"
          onClick={() => handleSelect('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
            currentTab === 'home'
              ? 'text-orange-600 font-bold'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all ${
              currentTab === 'home' ? 'bg-orange-50 text-orange-600' : ''
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] font-semibold mt-0.5 tracking-tight">Home</span>
        </button>

        {/* Collection */}
        <button
          id="nav-tab-collection"
          type="button"
          onClick={() => handleSelect('collection')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl relative transition-all duration-150 active:scale-90 ${
            currentTab === 'collection'
              ? 'text-orange-600 font-bold'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl relative transition-all ${
              currentTab === 'collection' ? 'bg-orange-50 text-orange-600' : ''
            }`}
          >
            <Layers className="w-5 h-5 stroke-[2.2]" />
            {lowStockCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </div>
          <span className="text-[11px] font-semibold mt-0.5 tracking-tight">Collection</span>
        </button>

        {/* Centered Add Button - seamlessly elevated without disjointed floating overlay */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-5">
          <button
            id="nav-tab-add"
            type="button"
            onClick={() => handleSelect('add')}
            className={`w-13 h-13 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-90 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 border-4 border-white transition-all duration-150 ${
              currentTab === 'add' ? 'ring-4 ring-orange-200' : ''
            }`}
            aria-label="Add New Item"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[10px] font-extrabold text-orange-600 mt-0.5">Add</span>
        </div>

        {/* Locations */}
        <button
          id="nav-tab-locations"
          type="button"
          onClick={() => handleSelect('locations')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
            currentTab === 'locations'
              ? 'text-orange-600 font-bold'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all ${
              currentTab === 'locations' ? 'bg-orange-50 text-orange-600' : ''
            }`}
          >
            <MapPin className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] font-semibold mt-0.5 tracking-tight">Locations</span>
        </button>

        {/* Settings */}
        <button
          id="nav-tab-settings"
          type="button"
          onClick={() => handleSelect('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
            currentTab === 'settings'
              ? 'text-orange-600 font-bold'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all ${
              currentTab === 'settings' ? 'bg-orange-50 text-orange-600' : ''
            }`}
          >
            <Settings className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] font-semibold mt-0.5 tracking-tight">Settings</span>
        </button>
      </div>
    </nav>
  );
};
