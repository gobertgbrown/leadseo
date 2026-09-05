import React, { useState } from 'react';
import { ScraperSettings, CreditAccount } from '../types.js';
import { Settings, Shield, Sliders, Database, Save, CheckCircle, Coins, Plus, Sparkles, Gift, Zap } from 'lucide-react';

interface SettingsViewProps {
  settings: ScraperSettings;
  creditAccount?: CreditAccount | null;
  onSaveSettings: (newSettings: ScraperSettings) => Promise<void>;
  onOpenCredits?: () => void;
  onRefillCredits?: (amount: number, reason: string, plan_tier?: CreditAccount['plan_tier']) => Promise<void>;
  onClaimDailyBonus?: () => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  creditAccount,
  onSaveSettings,
  onOpenCredits,
  onRefillCredits,
  onClaimDailyBonus,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<ScraperSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  const balance = creditAccount?.balance ?? 250;
  const spent = creditAccount?.total_spent ?? 42;
  const tier = creditAccount?.plan_tier ?? 'Pro Growth';
  const bonusAvailable = creditAccount?.daily_bonus_available ?? true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings(formData);
      onShowToast('Crawler configuration updated successfully.');
    } catch {
      onShowToast('Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <div className="border-b border-[#eaedff] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e] tracking-tight">
          System &amp; Credits Configuration
        </h1>
        <p className="text-xs text-[#464555] mt-0.5">
          Manage your crawler rates, compliance safeguards, and account credit balance for scraping and SEO audits.
        </p>
      </div>

      {/* Credits & Usage Plan Card */}
      <div className="bg-gradient-to-br from-[#131b2e] to-[#1e293b] rounded-2xl p-5 sm:p-6 text-white border border-[#283044] shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#3525cd]/30 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#3525cd] flex items-center justify-center text-white shadow-sm">
                <Coins className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold">Credits &amp; Subscription Tier</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8fbf3] text-[#006e4b] uppercase tracking-wider">
                {tier}
              </span>
            </div>
            <p className="text-xs text-[#c7c4d8]">
              Used for automated multi-page scraping, phone/email verification, and full SEO technical audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCredits}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#3525cd] hover:bg-[#2c1fb0] text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Top-Up Credits</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="relative z-10 mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#c7c4d8] block">Available Credits</span>
            <div className="text-2xl font-black text-[#57dffe] font-mono mt-0.5">
              {balance}
            </div>
          </div>
          <div className="sm:border-l sm:border-white/10 sm:pl-3">
            <span className="text-[10px] font-bold uppercase text-[#c7c4d8] block">Credits Spent</span>
            <div className="text-xl font-bold text-white font-mono mt-0.5">
              {spent}
            </div>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l sm:border-white/10 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-[10px] font-bold uppercase text-[#c7c4d8] block">Extraction Cost</span>
            <div className="text-xs font-bold text-[#a0e9c9] mt-1 font-mono">
              1 Credit / Website
            </div>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l sm:border-white/10 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-[10px] font-bold uppercase text-[#c7c4d8] block">SEO Site Audit Cost</span>
            <div className="text-xs font-bold text-[#fde68a] mt-1 font-mono">
              2 Credits / Site
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Crawl Limits */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#eaedff] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#3525cd]" />
            <h2 className="font-bold text-base text-[#131b2e]">Crawl Architecture &amp; Bounds</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#131b2e]">
                Max Pages per Website: {formData.max_pages_per_website}
              </label>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={formData.max_pages_per_website}
                onChange={(e) =>
                  setFormData({ ...formData, max_pages_per_website: Number(e.target.value) })
                }
                className="w-full accent-[#3525cd]"
              />
              <span className="text-[11px] text-[#777587]">
                Controls breadth of prioritized subpages to crawl (/about, /contact, /team).
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#131b2e]">
                Max Crawl Depth: {formData.max_crawl_depth}
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={1}
                value={formData.max_crawl_depth}
                onChange={(e) =>
                  setFormData({ ...formData, max_crawl_depth: Number(e.target.value) })
                }
                className="w-full accent-[#3525cd]"
              />
              <span className="text-[11px] text-[#777587]">
                Depth level 2 is optimal for discovering contact pages without overloading servers.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#131b2e]">
                Request Delay: {formData.request_delay_ms} ms
              </label>
              <input
                type="range"
                min={200}
                max={2000}
                step={100}
                value={formData.request_delay_ms}
                onChange={(e) =>
                  setFormData({ ...formData, request_delay_ms: Number(e.target.value) })
                }
                className="w-full accent-[#3525cd]"
              />
              <span className="text-[11px] text-[#777587]">
                Polite interval between consecutive HTTP requests.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#131b2e]">
                Socket Timeout: {formData.timeout_seconds} seconds
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={formData.timeout_seconds}
                onChange={(e) =>
                  setFormData({ ...formData, timeout_seconds: Number(e.target.value) })
                }
                className="w-full accent-[#3525cd]"
              />
              <span className="text-[11px] text-[#777587]">
                Abort threshold per subpage before moving to next target.
              </span>
            </div>
          </div>
        </div>

        {/* Heuristics & Verification */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#eaedff] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#006e4b]" />
            <h2 className="font-bold text-base text-[#131b2e]">Heuristic AI &amp; Accuracy Mandate</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#131b2e]">AI Semantic Refinement Mode</label>
              <select
                value={formData.ai_validation}
                onChange={(e) =>
                  setFormData({ ...formData, ai_validation: e.target.value as any })
                }
                className="w-full p-2.5 rounded-xl border border-[#c7c4d8]/60 bg-[#f2f3ff] text-xs font-semibold text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#3525cd]"
              >
                <option value="Strict">Strict (Zero hallucination, Not Found fallback)</option>
                <option value="Standard">Standard (Heuristic categorization)</option>
                <option value="Off">Off (Deterministic Regex only)</option>
              </select>
              <span className="text-[11px] text-[#777587]">
                Powered by Gemini 3.8 Flash model on genuine HTML extracts.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#131b2e]">Duplicate Handling Strategy</label>
              <select
                value={formData.duplicate_handling}
                onChange={(e) =>
                  setFormData({ ...formData, duplicate_handling: e.target.value as any })
                }
                className="w-full p-2.5 rounded-xl border border-[#c7c4d8]/60 bg-[#f2f3ff] text-xs font-semibold text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#3525cd]"
              >
                <option value="update">Update existing lead if domain matches</option>
                <option value="skip">Skip if already indexed</option>
                <option value="keep_both">Keep separate snapshots</option>
              </select>
              <span className="text-[11px] text-[#777587]">
                Automatically normalizes canonical domain names to prevent redundancy.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.respect_robots_txt}
                onChange={(e) =>
                  setFormData({ ...formData, respect_robots_txt: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#3525cd] focus:ring-[#3525cd]"
              />
              <div>
                <span className="text-xs font-semibold text-[#131b2e] block">
                  Strictly respect robots.txt rules
                </span>
                <span className="text-[11px] text-[#777587]">
                  Automatically aborts crawling subpaths disallowed by site administrators.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3525cd] text-white font-bold text-xs shadow-md hover:bg-[#4338ca] active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
