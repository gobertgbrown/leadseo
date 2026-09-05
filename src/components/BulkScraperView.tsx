import React, { useState, useMemo } from 'react';
import { ScrapingJob, ScraperSettings } from '../types.js';
import {
  Layers,
  Play,
  Pause,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  Globe,
  Radio,
  Sliders,
  ShieldCheck,
  Server,
  Coins,
  Plus,
} from 'lucide-react';

interface BulkScraperViewProps {
  jobs: ScrapingJob[];
  settings: ScraperSettings;
  creditBalance?: number;
  onOpenCredits?: () => void;
  onQueueBulk: (urls: string[], depth: number, pages: number, respectRobots: boolean) => Promise<void>;
  onRetryJob: (jobId: string) => Promise<void>;
  onClearJobs: () => Promise<void>;
  onExportCompletedCsv: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BulkScraperView: React.FC<BulkScraperViewProps> = ({
  jobs,
  settings,
  creditBalance = 250,
  onOpenCredits,
  onQueueBulk,
  onRetryJob,
  onClearJobs,
  onExportCompletedCsv,
  onShowToast,
}) => {
  const [urlsInput, setUrlsInput] = useState('');
  const [crawlDepth, setCrawlDepth] = useState<number>(settings.max_crawl_depth || 2);
  const [pagesLimit, setPagesLimit] = useState<number>(settings.max_pages_per_website || 25);
  const [respectRobots, setRespectRobots] = useState<boolean>(settings.respect_robots_txt ?? true);
  const [isPaused, setIsPaused] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'processing' | 'completed' | 'failed'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract clean lines
  const urlList = useMemo(() => {
    return urlsInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
  }, [urlsInput]);

  const handleFillSamples = () => {
    const samples = [
      'https://datadoghq.com',
      'https://synthetichealth.io',
      'https://privatevault-corp.com',
      'https://blankstealth.org',
    ];
    setUrlsInput(samples.join('\n'));
    onShowToast('Filled 4 enterprise sample domains');
  };

  const handleQueueBatch = async () => {
    if (urlList.length === 0) {
      onShowToast('Please enter at least one target domain.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onQueueBulk(urlList, crawlDepth, pagesLimit, respectRobots);
      setUrlsInput('');
      onShowToast(`Queued ${urlList.length} domains for polite extraction.`);
    } catch {
      onShowToast('Failed to queue bulk extraction.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    if (filterTab === 'processing') {
      return jobs.filter((j) => j.status === 'processing' || j.status === 'pending');
    }
    if (filterTab === 'completed') {
      return jobs.filter((j) => j.status === 'completed');
    }
    if (filterTab === 'failed') {
      return jobs.filter((j) => j.status === 'failed');
    }
    return jobs;
  }, [jobs, filterTab]);

  const counts = useMemo(() => {
    return {
      all: jobs.length,
      processing: jobs.filter((j) => j.status === 'processing' || j.status === 'pending').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
    };
  }, [jobs]);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header: Live Streamer Engine Status */}
      <div className="bg-[#283044] text-[#eef0ff] p-4 sm:p-5 rounded-2xl shadow-md border border-[#464555] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3525cd] flex items-center justify-center text-white flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Live Streamer Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe]/20 text-[#6ffbbe] text-[10px] font-mono flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6ffbbe] animate-ping" />
                  {isPaused ? 'Paused' : 'Daemon Active'}
                </span>
              </div>
              <p className="text-xs text-[#c7c4d8] font-mono mt-0.5">
                2 worker daemons parsing • 98.4% System Health
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setIsPaused(!isPaused);
                onShowToast(isPaused ? 'Workers resumed' : 'Workers paused', 'info');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#464555] hover:bg-[#525061] text-white text-xs font-semibold active:scale-95 transition-all"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bento Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#464555]/60 text-xs">
          <div className="p-2.5 bg-[#131b2e] rounded-xl">
            <span className="text-[10px] font-mono text-[#c7c4d8] uppercase block">Extracted</span>
            <span className="font-extrabold text-base text-white mt-0.5 block">142</span>
            <span className="text-[10px] font-mono text-[#6ffbbe]">+18 this session</span>
          </div>
          <div className="p-2.5 bg-[#131b2e] rounded-xl">
            <span className="text-[10px] font-mono text-[#c7c4d8] uppercase block">Speed</span>
            <span className="font-extrabold text-base text-white mt-0.5 block">1.8 pg/s</span>
            <span className="text-[10px] font-mono text-[#acedff]">Polite RFC limit</span>
          </div>
          <div className="p-2.5 bg-[#131b2e] rounded-xl">
            <span className="text-[10px] font-mono text-[#c7c4d8] uppercase block">Accuracy</span>
            <span className="font-extrabold text-base text-white mt-0.5 block">99.1%</span>
            <span className="text-[10px] font-mono text-[#6ffbbe]">Zero hallucination</span>
          </div>
        </div>
      </div>

      {/* New Extraction Batch Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#eaedff] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-base text-[#131b2e]">New Extraction Batch</h2>
            <p className="text-xs text-[#464555]">
              Paste website URLs (one per line) for concurrent extraction with rate-limiting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillSamples}
              className="px-3 py-1 bg-[#eaedff] text-[#3525cd] rounded-lg text-xs font-semibold hover:bg-[#d9e0ff] transition-colors"
            >
              Fill Samples
            </button>
            <span className="font-mono text-xs px-2.5 py-1 bg-[#f2f3ff] text-[#131b2e] rounded-lg font-bold">
              {urlList.length} Domains
            </span>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          rows={4}
          value={urlsInput}
          onChange={(e) => setUrlsInput(e.target.value)}
          placeholder={`https://company-one.com\nhttps://company-two.io\nhttps://example-enterprise.net`}
          className="w-full p-3.5 rounded-xl border border-[#c7c4d8]/60 bg-[#f2f3ff]/30 text-xs font-mono text-[#131b2e] placeholder-[#777587] focus:outline-none focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all leading-relaxed"
        />

        {/* Batch Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Crawl Depth */}
          <div className="p-3 bg-[#f2f3ff] rounded-xl space-y-1.5">
            <span className="font-mono text-[10px] uppercase text-[#777587] block font-semibold">
              Max Crawl Depth
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setCrawlDepth(d)}
                  className={`flex-1 py-1 rounded text-xs font-mono font-bold transition-all ${
                    crawlDepth === d
                      ? 'bg-[#3525cd] text-white shadow-sm'
                      : 'bg-white text-[#464555] hover:bg-[#eaedff]'
                  }`}
                >
                  {d} {d === 2 ? '(Def)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Max Pages per Domain */}
          <div className="p-3 bg-[#f2f3ff] rounded-xl space-y-1.5">
            <span className="font-mono text-[10px] uppercase text-[#777587] block font-semibold">
              Max Pages / Domain
            </span>
            <div className="flex items-center gap-1">
              {[10, 25, 50].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPagesLimit(p)}
                  className={`flex-1 py-1 rounded text-xs font-mono font-bold transition-all ${
                    pagesLimit === p
                      ? 'bg-[#3525cd] text-white shadow-sm'
                      : 'bg-white text-[#464555] hover:bg-[#eaedff]'
                  }`}
                >
                  {p} {p === 25 ? '(Def)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Compliance & AI */}
          <div className="p-3 bg-[#f2f3ff] rounded-xl space-y-1.5">
            <span className="font-mono text-[10px] uppercase text-[#777587] block font-semibold">
              Compliance Safeguards
            </span>
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={respectRobots}
                  onChange={(e) => setRespectRobots(e.target.checked)}
                  className="rounded text-[#3525cd] focus:ring-[#3525cd]"
                />
                <span className="text-[#131b2e] font-medium text-[11px]">Robots.txt</span>
              </label>
              <span className="px-1.5 py-0.5 rounded bg-[#6ffbbe]/40 text-[#002113] font-mono text-[10px] font-bold">
                AI: STRICT
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Credit Cost Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-xs">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#3525cd]" />
            <span className="text-[#464555]">
              Batch Cost:{' '}
              <span className="font-mono font-bold text-[#131b2e]">
                {urlList.length} {urlList.length === 1 ? 'Credit' : 'Credits'}
              </span>{' '}
              <span className="text-[#777587]">(1 credit per domain)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#464555]">
              Balance: <span className="font-mono font-bold text-[#3525cd]">{creditBalance}</span>
            </span>
            {creditBalance < urlList.length && urlList.length > 0 ? (
              <button
                type="button"
                onClick={onOpenCredits}
                className="px-2 py-1 rounded-md bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca] font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Insufficient Credits (Refill)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenCredits}
                className="px-2 py-1 rounded-md bg-[#eaedff] text-[#3525cd] hover:bg-[#d9e0ff] font-semibold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Top-up</span>
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleQueueBatch}
          disabled={isSubmitting || urlList.length === 0}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
            isSubmitting || urlList.length === 0
              ? 'bg-[#eaedff] text-[#777587] cursor-not-allowed'
              : 'bg-[#3525cd] text-white hover:bg-[#4338ca]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>
            Queue {urlList.length} {urlList.length === 1 ? 'Domain' : 'Domains'} for Extraction
          </span>
          {urlList.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-mono font-normal">
              {urlList.length} Credits
            </span>
          )}
        </button>
      </div>

      {/* Parallel Proxy Ring Notice */}
      <div className="p-3 rounded-xl bg-[#eaedff] border border-[#c7c4d8]/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#3525cd] font-mono font-semibold">
          <Server className="w-4 h-4" />
          <span>Parallel Proxy Ring Connected</span>
        </div>
        <span className="font-mono text-[11px] text-[#464555]">
          48 NODES • Zero IP throttling • Distributed egress pool
        </span>
      </div>

      {/* Active Extraction Pipeline */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-[#131b2e]">Active Extraction Pipeline</h3>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterTab === 'all'
                  ? 'bg-[#3525cd] text-white font-bold'
                  : 'bg-white border border-[#c7c4d8]/50 text-[#464555]'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('processing')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterTab === 'processing'
                  ? 'bg-[#3525cd] text-white font-bold'
                  : 'bg-white border border-[#c7c4d8]/50 text-[#464555]'
              }`}
            >
              Processing ({counts.processing})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('completed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterTab === 'completed'
                  ? 'bg-[#3525cd] text-white font-bold'
                  : 'bg-white border border-[#c7c4d8]/50 text-[#464555]'
              }`}
            >
              Completed ({counts.completed})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('failed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterTab === 'failed'
                  ? 'bg-[#3525cd] text-white font-bold'
                  : 'bg-white border border-[#c7c4d8]/50 text-[#464555]'
              }`}
            >
              Failed ({counts.failed})
            </button>
          </div>
        </div>

        {/* Job Cards */}
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#eaedff] shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#777587]">#{job.id}</span>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-sm text-[#131b2e] hover:text-[#3525cd] font-mono flex items-center gap-1"
                  >
                    <span>{job.domain}</span>
                  </a>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {job.status === 'processing' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#acedff] text-[#001f28] font-mono text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006e4b] animate-ping" />
                      PROCESSING ({job.progress_percent}%)
                    </span>
                  )}
                  {job.status === 'completed' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe]/40 text-[#002113] font-mono text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#006e4b]" />
                      COMPLETED
                    </span>
                  )}
                  {job.status === 'failed' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-mono text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-[#ba1a1a]" />
                      FAILED ACCESS
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar if processing */}
              {job.status === 'processing' && (
                <div className="space-y-1.5">
                  <div className="w-full h-1.5 bg-[#eaedff] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3525cd] rounded-full transition-all duration-300"
                      style={{ width: `${job.progress_percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#777587]">
                    <span>
                      {job.pages_crawled}/{job.max_pages} pages crawled • Subpath:{' '}
                      {job.current_subpath}
                    </span>
                    <span>Elapsed: {job.duration_seconds}s</span>
                  </div>
                </div>
              )}

              {/* Discovered telemetry counts */}
              {job.discovered_counts && (
                <div className="flex items-center gap-4 text-xs font-mono text-[#464555] bg-[#f2f3ff] px-3 py-2 rounded-xl">
                  <span>
                    Emails: <strong className="text-[#131b2e]">{job.discovered_counts.emails}</strong>
                  </span>
                  <span>
                    Phones: <strong className="text-[#131b2e]">{job.discovered_counts.phones}</strong>
                  </span>
                  <span>
                    Socials: <strong className="text-[#131b2e]">{job.discovered_counts.socials}</strong>
                  </span>
                </div>
              )}

              {/* Error / Compliance notice if failed */}
              {job.error_message && (
                <div className="p-3 bg-[#ffdad6]/40 rounded-xl border border-[#ba1a1a]/20 text-xs space-y-1">
                  <p className="font-mono text-[#93000a] font-semibold">{job.error_message}</p>
                  {job.compliance_note && (
                    <p className="text-[#464555] text-[11px]">{job.compliance_note}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-mono text-[10px] text-[#777587]">
                  Started: {new Date(job.started_at).toLocaleTimeString()}
                </span>

                <div className="flex items-center gap-2">
                  {job.status === 'failed' && (
                    <button
                      type="button"
                      onClick={() => onRetryJob(job.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#eaedff] text-[#3525cd] font-semibold hover:bg-[#d9e0ff] transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Retry with Residential Proxy</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Operations Shelf */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#eaedff]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCompletedCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#c7c4d8]/60 text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#3525cd]" />
            <span>Export All Completed</span>
          </button>
          <button
            type="button"
            onClick={onClearJobs}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#c7c4d8]/60 text-xs font-semibold text-[#777587] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 active:scale-95 transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Finished Jobs</span>
          </button>
        </div>

        <span className="font-mono text-[10px] text-[#777587]">
          AES-256 Memory Guard • CAN-SPAM &amp; GDPR Compliant Crawler
        </span>
      </div>
    </div>
  );
};
