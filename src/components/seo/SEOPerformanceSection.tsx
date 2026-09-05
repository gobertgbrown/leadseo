import React from 'react';
import { SEOAuditData } from '../../types.js';
import {
  Zap,
  Clock,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Gauge,
} from 'lucide-react';

interface SEOPerformanceSectionProps {
  auditData: SEOAuditData;
}

export const SEOPerformanceSection: React.FC<SEOPerformanceSectionProps> = ({ auditData }) => {
  const { metrics } = auditData;
  const { response_time_ms, page_size_kb, is_https } = metrics;

  // Speed rating
  const isFast = response_time_ms < 800;
  const isModerate = response_time_ms >= 800 && response_time_ms <= 1500;
  const speedRating = isFast ? 'Fast' : isModerate ? 'Moderate' : 'Slow';

  // Size rating
  const isLight = page_size_kb < 600;
  const sizeRating = isLight ? 'Lightweight' : page_size_kb < 1500 ? 'Moderate' : 'Heavy';

  return (
    <div id="seoptimer-performance-section" className="space-y-6">
      {/* 1. Main Performance Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Response Time (TTFB) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Server Response (TTFB)
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isFast
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : isModerate
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                }`}
              >
                {speedRating}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {response_time_ms}
              </span>
              <span className="text-xs font-semibold text-zinc-500">ms</span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              Time elapsed before the target web server returned the initial byte of the HTML response.
            </p>
          </div>

          {/* Benchmark Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span>0ms</span>
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Target &lt; 800ms</span>
              <span>3000ms</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFast ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (response_time_ms / 2000) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Page Transfer Size */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
                HTML Document Size
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isLight
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {sizeRating}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {page_size_kb}
              </span>
              <span className="text-xs font-semibold text-zinc-500">KB</span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              Total uncompressed text payload transfer. Lighter documents execute faster on mobile cellular networks.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span>0 KB</span>
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Benchmark &lt; 500 KB</span>
              <span>2000 KB</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isLight ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (page_size_kb / 1500) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* HTTPS / SSL Security */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                SSL / HTTPS Encryption
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  is_https
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                }`}
              >
                {is_https ? 'Secure SSL' : 'Insecure HTTP'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {is_https ? 'Active' : 'Missing'}
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              Google uses HTTPS as a confirmed ranking signal. Encrypted connection protects user passwords and cookies.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-1">
            <div className="flex justify-between">
              <span>Protocol:</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{is_https ? 'HTTPS/2 or TLS 1.3' : 'Insecure Plaintext'}</span>
            </div>
            {metrics.has_hsts !== undefined && (
              <div className="flex justify-between">
                <span>HSTS Header:</span>
                <span className={`font-medium ${metrics.has_hsts ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                  {metrics.has_hsts ? 'Enforced' : 'Not Enforced'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Optimization Recommendations for Speed */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Core Web Vitals &amp; Performance Checklist</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-1">
              Gzip / Brotli Compression
            </span>
            <p className="text-zinc-600 dark:text-zinc-400">
              Modern compression algorithms reduce transferred bandwidth by up to 70%, accelerating page loads on high-latency mobile networks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-1">
              CDN Edge Caching (Cloudflare / Fastly)
            </span>
            <p className="text-zinc-600 dark:text-zinc-400">
              Serve static HTML and assets from edge servers located closest to the visitor to reduce TTFB latency below 300ms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
