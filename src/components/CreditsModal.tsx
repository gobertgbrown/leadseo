import React, { useState } from 'react';
import { CreditAccount, CreditTransaction } from '../types.js';
import {
  Coins,
  Sparkles,
  Zap,
  Gift,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  X,
  CreditCard,
  Plus,
  RefreshCw,
  HelpCircle,
  TrendingDown,
  Layers,
  Search,
  FileSpreadsheet,
} from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  creditAccount: CreditAccount | null;
  onClose: () => void;
  onRefill: (amount: number, reason: string, plan_tier?: CreditAccount['plan_tier']) => Promise<void>;
  onClaimDailyBonus: () => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({
  isOpen,
  creditAccount,
  onClose,
  onRefill,
  onClaimDailyBonus,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'history' | 'rates'>('packs');
  const [isProcessing, setIsProcessing] = useState(false);
  const [claimingBonus, setClaimingBonus] = useState(false);

  if (!isOpen) return null;

  const balance = creditAccount?.balance ?? 0;
  const spent = creditAccount?.total_spent ?? 0;
  const earned = creditAccount?.total_earned ?? 0;
  const tier = creditAccount?.plan_tier ?? 'Pro Growth';
  const bonusAvailable = creditAccount?.daily_bonus_available ?? true;
  const transactions = creditAccount?.transactions ?? [];

  const handleQuickRefill = async (amount: number, packName: string, tierName?: CreditAccount['plan_tier']) => {
    setIsProcessing(true);
    try {
      await onRefill(amount, `Refilled via ${packName} (+${amount} Credits)`, tierName);
      onShowToast(`Successfully added +${amount} credits to your account!`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to refill credits', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBonusClaim = async () => {
    if (!bonusAvailable) {
      onShowToast('Daily bonus already claimed today! Check back tomorrow.', 'info');
      return;
    }
    setClaimingBonus(true);
    try {
      await onClaimDailyBonus();
    } catch (err: any) {
      onShowToast(err.message || 'Could not claim daily bonus', 'error');
    } finally {
      setClaimingBonus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#eaedff] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-[#131b2e] text-white p-5 sm:p-6 relative overflow-hidden">
          {/* Subtle decorative background circles */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#3525cd]/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-32 -bottom-10 w-36 h-36 bg-[#006e4b]/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3525cd] flex items-center justify-center text-white shadow-md">
                  <Coins className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold tracking-tight">Credits & Usage Hub</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8fbf3] text-[#006e4b] uppercase tracking-wider">
                  {tier}
                </span>
              </div>
              <p className="text-xs text-[#c7c4d8]">
                Power multi-page crawling, phone/email discovery, and deep SEO technical site audits.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Balance Overview Strip */}
          <div className="relative z-10 mt-5 grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#c7c4d8] block">Available Balance</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-[#57dffe] font-mono tracking-tight">
                  {balance}
                </span>
                <span className="text-xs font-semibold text-[#acedff]">Credits</span>
              </div>
            </div>

            <div className="border-l border-white/10 pl-3">
              <span className="text-[10px] uppercase font-bold text-[#c7c4d8] block">Total Spent</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-bold text-white font-mono">{spent}</span>
                <span className="text-[11px] text-[#777587]">used</span>
              </div>
            </div>

            <div className="border-l border-white/10 pl-3">
              <span className="text-[10px] uppercase font-bold text-[#c7c4d8] block">Lifetime Earned</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-bold text-[#a0e9c9] font-mono">+{earned}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Bonus Banner */}
        <div className="bg-[#f0fdf4] border-b border-[#bbf7d0] px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#006e4b] text-white flex items-center justify-center flex-shrink-0">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-[#005338] block">Free Daily Loyalty Bonus (+25 Credits)</span>
              <span className="text-[11px] text-[#006e4b]/80">
                {bonusAvailable
                  ? 'Ready to claim! Free recharge for active lead generation.'
                  : 'Claimed today. Resets every 24 hours automatically.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBonusClaim}
            disabled={!bonusAvailable || claimingBonus}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
              bonusAvailable && !claimingBonus
                ? 'bg-[#006e4b] hover:bg-[#005338] text-white active:scale-95'
                : 'bg-[#dcfce7] text-[#006e4b]/50 cursor-not-allowed'
            }`}
          >
            {claimingBonus ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Claiming...</span>
              </>
            ) : bonusAvailable ? (
              <>
                <Sparkles className="w-3 h-3 text-[#a0e9c9]" />
                <span>Claim +25 Free</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-[#006e4b]" />
                <span>Claimed for Today</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-[#faf8ff] px-5 pt-3 border-b border-[#eaedff] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('packs')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'packs'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#777587] hover:text-[#131b2e]'
            }`}
          >
            Top-Up Credit Packs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'rates'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#777587] hover:text-[#131b2e]'
            }`}
          >
            Credit Rates & Costs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#777587] hover:text-[#131b2e]'
            }`}
          >
            <span>Activity Ledger</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[#eaedff] text-[#3525cd]">
              {transactions.length}
            </span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 overscroll-contain">
          {/* TAB 1: TOP-UP PACKS */}
          {activeTab === 'packs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Pack 1: Starter Refill */}
                <div className="p-4 rounded-2xl border border-[#c7c4d8] bg-white flex flex-col justify-between space-y-3 hover:border-[#3525cd] transition-all group">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#777587] uppercase tracking-wider">
                      Quick Refill
                    </span>
                    <h3 className="text-sm font-bold text-[#131b2e]">Starter Boost</h3>
                    <div className="text-2xl font-black text-[#3525cd] font-mono pt-1">
                      +100 <span className="text-xs font-semibold text-[#464555]">Credits</span>
                    </div>
                    <p className="text-[11px] text-[#777587] pt-1 leading-snug">
                      Ideal for scraping up to 100 single domains or 50 deep SEO site audits.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleQuickRefill(100, 'Starter Boost Pack')}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#faf8ff] text-[#3525cd] border border-[#c7c4d8] hover:bg-[#3525cd] hover:text-white transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Instant Refill (+100)</span>
                  </button>
                </div>

                {/* Pack 2: Pro Growth (Featured) */}
                <div className="p-4 rounded-2xl border-2 border-[#3525cd] bg-[#f8f9ff] flex flex-col justify-between space-y-3 relative shadow-md">
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#3525cd] text-white text-[9px] font-black uppercase tracking-wider">
                    Most Popular
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#3525cd] uppercase tracking-wider">
                      Agency Tier
                    </span>
                    <h3 className="text-sm font-bold text-[#131b2e]">Pro Growth Pack</h3>
                    <div className="text-2xl font-black text-[#3525cd] font-mono pt-1">
                      +500 <span className="text-xs font-semibold text-[#464555]">Credits</span>
                    </div>
                    <p className="text-[11px] text-[#464555] pt-1 leading-snug">
                      High volume crawling with bulk queue prioritization and deep SEO audit reports.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleQuickRefill(500, 'Pro Growth Pack', 'Pro Growth')}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#3525cd] hover:bg-[#2c1fb0] text-white transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#57dffe]" />
                    <span>Recharge +500 Credits</span>
                  </button>
                </div>

                {/* Pack 3: Enterprise Scale */}
                <div className="p-4 rounded-2xl border border-[#c7c4d8] bg-white flex flex-col justify-between space-y-3 hover:border-[#006e4b] transition-all group">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#006e4b] uppercase tracking-wider">
                      Enterprise
                    </span>
                    <h3 className="text-sm font-bold text-[#131b2e]">Agency Scale</h3>
                    <div className="text-2xl font-black text-[#006e4b] font-mono pt-1">
                      +2,500 <span className="text-xs font-semibold text-[#464555]">Credits</span>
                    </div>
                    <p className="text-[11px] text-[#777587] pt-1 leading-snug">
                      Uncapped automated lead pipelines, thousands of verified records & cold email pitches.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleQuickRefill(2500, 'Agency Scale Pack', 'Agency Scale')}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#e8fbf3] text-[#006e4b] border border-[#a0e9c9] hover:bg-[#006e4b] hover:text-white transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Recharge +2,500</span>
                  </button>
                </div>
              </div>

              {/* Instant Sandbox Bonus Note */}
              <div className="p-3.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#006e4b]" />
                  <span className="text-[#464555]">
                    All recharges are instantaneous. Zero credit expiration.
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-[#3525cd]">100% Active</span>
              </div>
            </div>
          )}

          {/* TAB 2: CREDIT RATES & COSTS */}
          {activeTab === 'rates' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Rate 1 */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#eaedff] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#eef2ff] text-[#3525cd] flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#131b2e]">Single Lead Crawl</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#eef2ff] text-[#3525cd]">
                        1 Credit
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777587]">
                      Multi-page traversal across `/about`, `/contact`, `/team` to extract verified emails, phone lines & social channels.
                    </p>
                  </div>
                </div>

                {/* Rate 2 */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#eaedff] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#faf5ff] text-[#7c3aed] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#131b2e]">Deep SEO Site Audit</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#faf5ff] text-[#7c3aed]">
                        2 Credits
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777587]">
                      Full on-page technical diagnostics (metadata, headings, missing alt texts, mobile performance) + automated email pitch generation.
                    </p>
                  </div>
                </div>

                {/* Rate 3 */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#eaedff] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] text-[#006e4b] flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#131b2e]">Live Lead Re-Verification</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#e8fbf3] text-[#006e4b]">
                        1 Credit
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777587]">
                      Re-crawls an existing lead in your dossier to discover newly added staff contacts, changed phones or address shifts.
                    </p>
                  </div>
                </div>

                {/* Rate 4 */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#eaedff] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#131b2e]">Bulk Scraping Queue</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#fff7ed] text-[#ea580c]">
                        1 Credit / URL
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777587]">
                      Processes high volume domain lists with polite crawl throttling and automated duplicate detection.
                    </p>
                  </div>
                </div>

                {/* Rate 5 - Free */}
                <div className="p-3.5 rounded-2xl bg-[#faf8ff] border border-[#eaedff] sm:col-span-2 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#e8fbf3] text-[#006e4b] flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#006e4b]">Exporting CSV, Excel & PDF Dossiers</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#006e4b] text-white">
                        FREE (0 Credits)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#464555]">
                      Unlimited data exports! You own your extracted leads without extra download fees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTION LEDGER */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#777587]">
                  No credit transactions recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => {
                    const isAddition = tx.type === 'addition' || tx.type === 'bonus';
                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl bg-white border border-[#eaedff] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isAddition
                                ? 'bg-[#e8fbf3] text-[#006e4b]'
                                : 'bg-[#fef2f2] text-[#b91c1c]'
                            }`}
                          >
                            {isAddition ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="font-bold text-[#131b2e] block truncate">
                              {tx.reason}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-[#777587]">
                              <span>{new Date(tx.timestamp).toLocaleString()}</span>
                              {tx.target && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-[#3525cd]">{tx.target}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span
                            className={`font-mono font-bold text-sm block ${
                              isAddition ? 'text-[#006e4b]' : 'text-[#b91c1c]'
                            }`}
                          >
                            {isAddition ? `+${tx.amount}` : tx.amount}
                          </span>
                          <span className="text-[10px] text-[#777587] font-mono">
                            Bal: {tx.balance_after}
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

        {/* Modal Footer */}
        <div className="bg-[#faf8ff] border-t border-[#eaedff] p-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#777587]">
            <Clock className="w-3.5 h-3.5" />
            <span>Balance auto-refreshed live</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#131b2e] text-white hover:bg-black transition-colors"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};
