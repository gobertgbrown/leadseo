import React from 'react';
import { ActiveTab } from '../types.js';
import { APP_ASSETS } from '../assets.js';
import { Coins, Plus, Zap } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  isScraping: boolean;
  creditBalance?: number;
  onOpenCredits?: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  isScraping,
  creditBalance = 250,
  onOpenCredits,
  onNavigateTab,
}) => {
  const getTabLabel = () => {
    switch (activeTab) {
      case 'landing':
        return 'Home';
      case 'dashboard':
        return 'Dashboard';
      case 'leads':
        return 'Leads';
      case 'bulk':
        return 'Bulk';
      case 'audit':
        return 'Site Audit (SEO)';
      case 'history':
        return 'History';
      case 'settings':
        return 'Settings';
      case 'blog':
        return 'Blog & Insights';
      case 'page':
        return 'Information';
      case 'admin':
        return 'Admin Portal';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-[#faf8ff]/85 backdrop-blur-xl border-b border-[#eaedff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onNavigateTab('landing')}
          id="header-brand"
        >
          <img
            alt="LeadPulse AI Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
            src={APP_ASSETS.logo}
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base text-[#131b2e] tracking-tight">LeadPulse AI</span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-[#777587] px-1.5 py-0.5 bg-[#eaedff] rounded font-medium">
                v2.5
              </span>
            </div>
            <span className="text-xs text-[#464555] font-medium truncate">{getTabLabel()}</span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#eaedff]/60 p-1 rounded-xl border border-[#c7c4d8]/40">
          <button
            onClick={() => onNavigateTab('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'landing'
                ? 'bg-white text-[#3525cd] shadow-sm font-bold'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigateTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-[#3525cd] shadow-sm font-bold'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigateTab('leads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
              activeTab === 'leads'
                ? 'bg-white text-[#3525cd] shadow-sm font-bold'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            <span>Leads</span>
            <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#3525cd] text-white rounded-full">
              Live
            </span>
          </button>
          <button
            onClick={() => onNavigateTab('bulk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'bulk'
                ? 'bg-white text-[#3525cd] shadow-sm font-bold'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            Bulk Scraper
          </button>
          <button
            onClick={() => onNavigateTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-white text-[#3525cd] shadow-sm font-bold'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            <span>Site Audit</span>
            <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#006e4b] text-white rounded-full">
              SEO
            </span>
          </button>
          <button
            onClick={() => onNavigateTab('blog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'blog'
                ? 'bg-white text-[#3525cd] shadow-sm font-bold'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            Blog
          </button>
          <button
            onClick={() => onNavigateTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'history'
                ? 'bg-white text-[#3525cd] shadow-sm font-bold'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            History
          </button>
          <button
            onClick={() => onNavigateTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-[#3525cd] shadow-sm font-bold'
                : 'text-[#464555] hover:text-[#131b2e]'
            }`}
          >
            Settings
          </button>
        </div>


        {/* Right: Engine Status Pill, Credits Badge & Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Interactive Credits Balance Badge */}
          <button
            type="button"
            onClick={onOpenCredits}
            id="header-credits-btn"
            title="Manage LeadPulse Credits & Refill"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-gradient-to-r from-[#eef2ff] to-[#f5f3ff] hover:from-[#e0e7ff] hover:to-[#ede9fe] border border-[#c7c4d8]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-xs transition-all active:scale-95 group cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-[#3525cd] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Coins className="w-2.5 h-2.5" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold text-[#3525cd] text-xs">
                {creditBalance}
              </span>
              <span className="hidden sm:inline text-[11px] font-medium text-[#464555]">
                Credits
              </span>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-white group-hover:bg-[#3525cd] group-hover:text-white text-[#3525cd] flex items-center justify-center transition-colors">
              <Plus className="w-2.5 h-2.5" />
            </div>
          </button>

          <div
            id="engine-status-pill"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#c7c4d8]/40 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          >
            {isScraping ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#006e4b] animate-ping" />
                <span className="font-mono text-[11px] text-[#006e4b] uppercase tracking-wider font-semibold">
                  Crawling...
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#005338] animate-pulse" />
                <span className="font-mono text-[11px] text-[#005338] uppercase tracking-wider font-semibold">
                  Ready / Idle
                </span>
              </>
            )}
          </div>

          <button
            aria-label="User Profile"
            className="w-9 h-9 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 transition-transform active:scale-95"
            type="button"
            onClick={() => onNavigateTab('settings')}
          >
            <img
              alt="User profile avatar"
              className="w-8 h-8 rounded-full object-cover shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-white"
              src={APP_ASSETS.profileAvatar}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
