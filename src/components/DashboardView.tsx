import React, { useState } from 'react';
import { Lead, DashboardStats } from '../types.js';
import {
  Globe,
  Radio,
  Building2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Users,
  Share2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { APP_ASSETS } from '../assets.js';
import { cleanField, sanitizeContactPerson } from '../utils/exportUtils.js';
import { Coins, Plus } from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats;
  latestLead: Lead | null;
  creditBalance?: number;
  isScraping: boolean;
  scrapingProgress: { percent: number; step: string; subpath: string; pages: number };
  onExtractLead: (url: string) => Promise<void>;
  onSelectLead: (lead: Lead) => void;
  onOpenCredits?: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  onExportPdf?: () => void;
  onOpenExportModal?: (format?: 'csv' | 'excel' | 'pdf' | 'json') => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  latestLead,
  creditBalance = 250,
  isScraping,
  scrapingProgress,
  onExtractLead,
  onSelectLead,
  onOpenCredits,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  onOpenExportModal,
  onShowToast,
}) => {
  const [targetUrl, setTargetUrl] = useState('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTargetUrl(text.trim());
        onShowToast('Pasted URL from clipboard');
      }
    } catch {
      onShowToast('Unable to read clipboard. Please paste manually.', 'info');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) {
      onShowToast('Please enter a valid website URL or domain.', 'error');
      return;
    }
    onExtractLead(targetUrl.trim());
  };

  const setSampleUrl = (url: string) => {
    setTargetUrl(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Mission Subtitle Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eaedff] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e] tracking-tight">
            AI Lead Scraper &amp; Business Data Extractor
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
            Automated lead extraction from publicly accessible websites. Zero hallucination guarantee.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 bg-[#eaedff] text-[#3525cd] rounded-full text-[11px] font-mono font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3525cd]" />
          <span>RFC 9309 Robots Compliant</span>
        </div>
      </div>

      {/* AI Lead Scraper Main Extraction Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#eaedff] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#eaedff] text-[#3525cd]">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#131b2e]">Target Website Crawler</h2>
              <p className="text-xs text-[#464555]">
                Extracts validated inbound emails, verified phone numbers, addresses, and team contacts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onOpenCredits}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] border border-[#c7c4d8]/40 text-xs transition-colors"
            >
              <Coins className="w-3.5 h-3.5 text-[#3525cd]" />
              <span className="text-[11px] font-semibold text-[#464555]">
                Cost: <span className="font-mono text-[#3525cd] font-bold">1 Credit</span>
              </span>
              <span className="text-[#c7c4d8]">|</span>
              <span className="font-mono text-[11px] font-bold text-[#131b2e]">
                {creditBalance} left
              </span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative flex items-center">
            <Globe className="absolute left-4 w-5 h-5 text-[#777587]" />
            <input
              type="text"
              id="target-url-input"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="e.g. https://apexbio.io or datadoghq.com"
              disabled={isScraping}
              className="w-full pl-12 pr-24 py-3.5 rounded-xl border border-[#c7c4d8]/60 bg-[#f2f3ff]/40 text-sm font-mono text-[#131b2e] placeholder-[#777587] focus:outline-none focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={handlePaste}
              disabled={isScraping}
              className="absolute right-3 px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8]/50 text-xs font-mono font-semibold text-[#464555] hover:text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all"
            >
              Paste
            </button>
          </div>

          {/* Sample URL Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#777587] font-medium text-[11px]">Quick Samples:</span>
            {['apexbio.io', 'datadoghq.com', 'veritasdynamics.ai', 'synthetichealth.io'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setSampleUrl(sample)}
                disabled={isScraping}
                className="px-2.5 py-1 rounded-md bg-[#eaedff] hover:bg-[#d9e0ff] text-[#3525cd] font-mono text-[11px] font-medium transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Extract Leads Button */}
          <button
            type="submit"
            disabled={isScraping}
            id="extract-leads-button"
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
              isScraping
                ? 'bg-[#eaedff] text-[#777587] cursor-not-allowed'
                : 'bg-[#3525cd] text-white hover:bg-[#4338ca] shadow-[#3525cd]/20'
            }`}
          >
            {isScraping ? (
              <>
                <Radio className="w-5 h-5 animate-pulse text-[#3525cd]" />
                <span>Crawling Website Routes...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Extract Leads</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-mono font-normal">
                  1 Credit
                </span>
              </>
            )}
          </button>
        </form>

        {/* Active Crawling Progress Visualizer */}
        {isScraping && (
          <div className="mt-4 p-4 rounded-xl bg-[#283044] text-[#eef0ff] space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#57dffe] font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#57dffe] animate-ping" />
                {scrapingProgress.step || 'Crawling subpages...'}
              </span>
              <span className="font-mono text-white font-bold">{scrapingProgress.percent}%</span>
            </div>

            {/* Glowing progress track */}
            <div className="w-full h-2 bg-[#131b2e] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3525cd] via-[#57dffe] to-[#6ffbbe] transition-all duration-300 rounded-full"
                style={{ width: `${scrapingProgress.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-[#c7c4d8]">
              <span>
                Pages crawled: <strong className="text-white">{scrapingProgress.pages} / 25</strong>
              </span>
              <span className="truncate max-w-[200px]">Subpath: {scrapingProgress.subpath || '/'}</span>
            </div>

            {/* 4 Pipeline Step Micro-tags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              <span className="px-2 py-1 bg-[#131b2e] rounded text-[10px] font-mono text-[#acedff] text-center">
                1. Crawl Routes ✓
              </span>
              <span className="px-2 py-1 bg-[#131b2e] rounded text-[10px] font-mono text-[#acedff] text-center">
                2. Extract Contacts ✓
              </span>
              <span className="px-2 py-1 bg-[#131b2e] rounded text-[10px] font-mono text-[#acedff] text-center">
                3. Dedupe &amp; Mailto ✓
              </span>
              <span className="px-2 py-1 bg-[#131b2e] rounded text-[10px] font-mono text-[#6ffbbe] text-center font-bold">
                4. Confidence Score
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Extraction Insights (4 Stats Cards + Avg Confidence Score) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="font-bold text-sm text-[#131b2e]">Extraction Insights</h3>
            <span className="text-xs font-mono text-[#777587]">All Time Telemetry</span>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c7c4d8]/60 text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] rounded-lg shadow-sm transition-all active:scale-95"
              title="Quick export all leads as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#3525cd]" />
              <span className="font-bold">CSV</span>
            </button>
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c7c4d8]/60 text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] rounded-lg shadow-sm transition-all active:scale-95"
              title="Quick export all leads as Excel (.XLS)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#006e4b]" />
              <span className="font-bold">XLS</span>
            </button>
            {onExportPdf && (
              <button
                type="button"
                onClick={onExportPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fdf2f2] border border-[#f9d2d2] text-xs font-semibold text-[#b3261e] hover:bg-[#fae2e2] rounded-lg shadow-sm transition-all active:scale-95"
                title="Quick export all leads as PDF Dossier Report"
              >
                <FileText className="w-3.5 h-3.5 text-[#b3261e]" />
                <span className="font-bold">PDF</span>
              </button>
            )}
            {onOpenExportModal && (
              <button
                type="button"
                onClick={() => onOpenExportModal()}
                className="px-2.5 py-1.5 bg-[#eaedff] text-[#3525cd] text-xs font-bold rounded-lg hover:bg-[#d9e0ff] transition-all active:scale-95"
                title="Open Export Modal (CSV, XLS, PDF, JSON, Clipboard)"
              >
                Export Options...
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Leads */}
          <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm space-y-1">
            <span className="text-[11px] font-mono text-[#777587] uppercase tracking-wider block">
              Total Leads
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#131b2e]">{stats.total_leads}</span>
              <span className="text-[10px] font-mono font-semibold text-[#006e4b]">
                {stats.recent_leads_growth}
              </span>
            </div>
            <span className="text-[11px] text-[#464555] block">Indexed &amp; verified</span>
          </div>

          {/* Emails Found */}
          <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm space-y-1">
            <span className="text-[11px] font-mono text-[#777587] uppercase tracking-wider block">
              Emails Found
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#131b2e]">{stats.emails_found}</span>
              <span className="text-[10px] font-mono font-semibold text-[#006e4b]">98% Valid</span>
            </div>
            <span className="text-[11px] text-[#464555] block">Mailto validated</span>
          </div>

          {/* Phone Lines */}
          <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm space-y-1">
            <span className="text-[11px] font-mono text-[#777587] uppercase tracking-wider block">
              Phone Lines
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#131b2e]">{stats.phone_lines_found}</span>
              <span className="text-[10px] font-mono font-semibold text-[#3525cd]">E.164 Clean</span>
            </div>
            <span className="text-[11px] text-[#464555] block">Switchboards detected</span>
          </div>

          {/* Socials */}
          <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm space-y-1">
            <span className="text-[11px] font-mono text-[#777587] uppercase tracking-wider block">
              Social Profiles
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#131b2e]">{stats.social_profiles_found}</span>
              <span className="text-[10px] font-mono font-semibold text-[#006e4b]">Live Links</span>
            </div>
            <span className="text-[11px] text-[#464555] block">LinkedIn, X, GitHub</span>
          </div>
        </div>

        {/* Avg Confidence Score Banner */}
        <div className="bg-[#eaedff] p-4 rounded-xl border border-[#c7c4d8]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg text-[#3525cd] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#131b2e] block">
                Verification &amp; Confidence Rating
              </span>
              <span className="text-xs text-[#464555]">
                Strict heuristic validation with zero hallucinated contacts.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex flex-col items-end">
              <span className="text-xl font-extrabold font-mono text-[#131b2e]">
                {stats.average_confidence}%
              </span>
              <span className="text-[10px] font-mono text-[#006e4b] font-semibold">High Confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Extracted Result Card (matching Image 5 with Apex Biosystems) */}
      {latestLead && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#eaedff] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eaedff] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#3525cd] shadow-inner font-bold text-sm">
                {latestLead.business_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#131b2e]">{latestLead.business_name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe]/40 text-[#002113] font-mono text-[10px] font-bold">
                    {latestLead.verification_status} ({latestLead.confidence_score}%)
                  </span>
                </div>
                <span className="text-xs text-[#464555]">{latestLead.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportCsv}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8]/60 text-xs font-semibold text-[#464555] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#3525cd]" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={onExportExcel}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8]/60 text-xs font-semibold text-[#464555] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#006e4b]" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Quick attribute overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#f2f3ff] space-y-1">
              <span className="font-mono text-[10px] text-[#777587] uppercase">Primary Email</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#131b2e] truncate">
                  {latestLead.email}
                </span>
                <span className="text-[10px] font-mono text-[#006e4b] font-medium">
                  {latestLead.email_status}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f2f3ff] space-y-1">
              <span className="font-mono text-[10px] text-[#777587] uppercase">Primary Phone</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#131b2e] truncate">
                  {latestLead.phone}
                </span>
                <span className="text-[10px] font-mono text-[#006e4b] font-medium">
                  {latestLead.phone_status}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f2f3ff] space-y-1">
              <span className="font-mono text-[10px] text-[#777587] uppercase">Headquarters</span>
              <span className="font-mono font-semibold text-[#131b2e] block truncate">
                {cleanField(latestLead.address) ||
                  `${cleanField(latestLead.city) || 'HQ Hub'}, ${
                    cleanField(latestLead.state) || cleanField(latestLead.country) || 'USA'
                  }`}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#f2f3ff] space-y-1">
              <span className="font-mono text-[10px] text-[#777587] uppercase">Key Contact</span>
              <span className="font-mono font-semibold text-[#131b2e] block truncate">
                {sanitizeContactPerson(latestLead.contact_person) !== 'Not Discovered'
                  ? `${sanitizeContactPerson(latestLead.contact_person)} (${
                      latestLead.contact_person_role || 'Executive'
                    })`
                  : 'No Executive Listed'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#777587]">
              <span>Discovered Socials:</span>
              <div className="flex items-center gap-1 text-[#3525cd]">
                {latestLead.linkedin && latestLead.linkedin !== 'Not Found' && (
                  <span className="px-1.5 py-0.5 bg-[#eaedff] rounded font-mono text-[10px]">
                    LinkedIn
                  </span>
                )}
                {latestLead.twitter && latestLead.twitter !== 'Not Found' && (
                  <span className="px-1.5 py-0.5 bg-[#eaedff] rounded font-mono text-[10px]">
                    X Corp
                  </span>
                )}
                {latestLead.github && latestLead.github !== 'Not Found' && (
                  <span className="px-1.5 py-0.5 bg-[#eaedff] rounded font-mono text-[10px]">
                    GitHub
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectLead(latestLead)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3525cd] text-white rounded-xl text-xs font-bold hover:bg-[#4338ca] active:scale-95 transition-all shadow-sm"
            >
              <span>View Full Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
