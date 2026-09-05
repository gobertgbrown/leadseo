import React, { useState } from 'react';
import { ScrapingJob } from '../types.js';
import { History, Search, Download, RotateCw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface HistoryViewProps {
  jobs: ScrapingJob[];
  onRetryJob: (jobId: string) => Promise<void>;
  onExportCsv: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  jobs,
  onRetryJob,
  onExportCsv,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all');

  const filtered = jobs.filter((j) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      if (!j.domain.toLowerCase().includes(q) && !j.url.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== 'all' && j.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaedff] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e] tracking-tight">
            Extraction History &amp; Audit Log
          </h1>
          <p className="text-xs text-[#464555] mt-0.5">
            Immutable timeline of website crawls, compliance telemetry, and parsed endpoints.
          </p>
        </div>

        <button
          type="button"
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8]/60 text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] transition-colors self-start sm:self-auto shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-[#3525cd]" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777587]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domain or URL in history..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c7c4d8]/60 bg-white text-xs font-mono text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#3525cd]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-[#3525cd] text-white font-bold'
                : 'bg-white border border-[#c7c4d8]/50 text-[#464555]'
            }`}
          >
            All Logs ({jobs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-2 rounded-xl font-medium transition-all ${
              statusFilter === 'completed'
                ? 'bg-[#3525cd] text-white font-bold'
                : 'bg-white border border-[#c7c4d8]/50 text-[#464555]'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('failed')}
            className={`px-3 py-2 rounded-xl font-medium transition-all ${
              statusFilter === 'failed'
                ? 'bg-[#3525cd] text-white font-bold'
                : 'bg-white border border-[#c7c4d8]/50 text-[#464555]'
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#eaedff]">
            <History className="w-8 h-8 text-[#777587] mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[#131b2e]">No historical crawl sessions</h3>
            <p className="text-xs text-[#464555]">
              Initiate a crawl from the Dashboard or Bulk Scraper to generate activity.
            </p>
          </div>
        ) : (
          filtered.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#eaedff] shadow-sm space-y-2 hover:border-[#c7c4d8] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#777587]">#{job.id}</span>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-sm text-[#131b2e] hover:text-[#3525cd] font-mono"
                  >
                    {job.domain}
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  {job.status === 'completed' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe]/40 text-[#002113] font-mono text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#006e4b]" />
                      COMPLETED
                    </span>
                  )}
                  {job.status === 'failed' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-mono text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-[#ba1a1a]" />
                      FAILED
                    </span>
                  )}
                  {job.status === 'processing' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#acedff] text-[#001f28] font-mono text-[10px] font-bold">
                      IN PROGRESS
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#464555] bg-[#f2f3ff] p-2.5 rounded-xl">
                <span>Pages: {job.pages_crawled} / {job.max_pages}</span>
                <span>Depth: {job.crawl_depth}</span>
                <span>Duration: {job.duration_seconds}s</span>
                <span>Started: {new Date(job.started_at).toLocaleString()}</span>
              </div>

              {job.error_message && (
                <div className="p-2.5 bg-[#ffdad6]/40 rounded-xl border border-[#ba1a1a]/20 text-xs font-mono text-[#93000a]">
                  {job.error_message}
                </div>
              )}

              {job.status === 'failed' && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onRetryJob(job.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#eaedff] text-[#3525cd] font-semibold text-xs hover:bg-[#d9e0ff] transition-colors"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Retry Extraction</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
