import React from 'react';
import { ActiveTab } from '../types.js';
import { Sliders, Users, Layers, SearchCheck, History, Settings } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  totalLeadsCount: number;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, totalLeadsCount, onSelectTab }) => {
  return (
    <nav
      id="bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#faf8ff]/95 backdrop-blur-xl border-t border-[#eaedff] shadow-[0_-1px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="h-16 px-2 flex items-center justify-around">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] px-2 transition-colors ${
            activeTab === 'dashboard' ? 'text-[#3525cd] font-semibold' : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] tracking-tight uppercase font-medium">Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('leads')}
          className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] px-2 transition-colors ${
            activeTab === 'leads' ? 'text-[#3525cd] font-semibold' : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-3 px-1 py-0.2 bg-[#3525cd] text-white font-mono text-[9px] leading-tight rounded-full">
              {totalLeadsCount > 999 ? `${(totalLeadsCount / 1000).toFixed(1)}k` : totalLeadsCount}
            </span>
          </div>
          <span className="text-[10px] tracking-tight uppercase font-medium">Leads</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('bulk')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] px-2 transition-colors ${
            activeTab === 'bulk' ? 'text-[#3525cd] font-semibold' : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] tracking-tight uppercase font-medium">Bulk</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('audit')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] px-2 transition-colors ${
            activeTab === 'audit' ? 'text-[#3525cd] font-semibold' : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <SearchCheck className="w-5 h-5" />
          <span className="text-[10px] tracking-tight uppercase font-medium">Audit</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] px-2 transition-colors ${
            activeTab === 'history' ? 'text-[#3525cd] font-semibold' : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] tracking-tight uppercase font-medium">History</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] px-2 transition-colors ${
            activeTab === 'settings' ? 'text-[#3525cd] font-semibold' : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight uppercase font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
};
