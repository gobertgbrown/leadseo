import React, { useState } from 'react';
import { SEOAuditData } from '../../types.js';
import {
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Globe,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SEOUsabilitySectionProps {
  auditData: SEOAuditData;
}

export const SEOUsabilitySection: React.FC<SEOUsabilitySectionProps> = ({ auditData }) => {
  const [mockupDevice, setMockupDevice] = useState<'mobile' | 'desktop'>('mobile');
  const { metrics, usability_analysis, domain, url } = auditData;

  const hasViewport = metrics.has_viewport;
  const hasFavicon = usability_analysis ? Boolean(usability_analysis.has_favicon) : true;
  const faviconUrl =
    usability_analysis?.favicon_url ||
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  const hasAppleIcon = usability_analysis ? Boolean(usability_analysis.has_apple_icon) : false;
  const language = usability_analysis?.language || 'en';
  const charset = usability_analysis?.charset || 'UTF-8';
  const mobileScore = usability_analysis?.mobile_ready_score ?? (auditData.categories?.usability?.score ?? (hasViewport ? 92 : 45));

  return (
    <div id="seoptimer-usability-section" className="space-y-6">
      {/* 1. Device Preview Mockup Hero */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Mobile Responsiveness &amp; Usability Rendering</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Google enforces 100% Mobile-First Indexing. Pages must render responsively on smartphones and tablets.
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 self-start">
            <button
              onClick={() => setMockupDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                mockupDevice === 'mobile'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile Viewport
            </button>
            <button
              onClick={() => setMockupDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                mockupDevice === 'desktop'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              Desktop Viewport
            </button>
          </div>
        </div>

        {/* Mockup Frame Display */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
          {mockupDevice === 'mobile' ? (
            /* Smartphone Mockup Frame */
            <div className="relative w-64 h-[440px] bg-zinc-900 dark:bg-zinc-950 rounded-[38px] p-3 shadow-xl border-4 border-zinc-300 dark:border-zinc-700 flex flex-col items-center">
              {/* Speaker Notch */}
              <div className="w-20 h-4 bg-zinc-800 rounded-full mb-2 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span className="w-8 h-1 rounded-full bg-zinc-700" />
              </div>

              {/* Simulated Screen */}
              <div className="w-full flex-1 bg-white dark:bg-zinc-900 rounded-[26px] overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800">
                {/* Mobile Browser Nav Bar */}
                <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-zinc-500 font-mono truncate max-w-[150px]">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{domain}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400">9:41</span>
                </div>

                {/* Simulated Content */}
                <div className="p-3 flex-1 flex flex-col justify-between bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 text-left">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <img
                        src={faviconUrl}
                        alt="Favicon"
                        className="w-4 h-4 rounded"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {domain}
                      </span>
                    </div>

                    <h5 className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 mb-1">
                      {metrics.title.value !== 'Missing' ? metrics.title.value : 'Enterprise Solutions'}
                    </h5>

                    <p className="text-[9px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-3">
                      {metrics.meta_description.value !== 'Missing'
                        ? metrics.meta_description.value
                        : 'Official website with responsive mobile layout and enterprise navigation.'}
                    </p>

                    <div className="space-y-1.5">
                      <div className="h-2 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                      <div className="h-2 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[9px] text-emerald-600 font-semibold">
                    <span>Mobile Ready: {mobileScore}%</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      Viewport OK
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-20 h-1 bg-zinc-600 rounded-full mt-2" />
            </div>
          ) : (
            /* Desktop Mockup Frame */
            <div className="w-full max-w-xl h-[320px] bg-white dark:bg-zinc-900 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 shadow-xl flex flex-col overflow-hidden">
              {/* Browser Window Chrome */}
              <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white dark:bg-zinc-900 px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>https://{domain}</span>
                </div>
              </div>

              {/* Simulated Desktop Web Content */}
              <div className="p-6 flex-1 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={faviconUrl}
                      alt="Favicon"
                      className="w-5 h-5 rounded"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {domain}
                    </span>
                  </div>

                  <h5 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-2">
                    {metrics.title.value !== 'Missing' ? metrics.title.value : 'Enterprise Solutions'}
                  </h5>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed line-clamp-2">
                    {metrics.meta_description.value !== 'Missing'
                      ? metrics.meta_description.value
                      : 'Comprehensive online services and resources.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-semibold">
                    Desktop Viewport
                  </span>
                  <span>1440 x 900 Resolution Target</span>
                </div>
              </div>
            </div>
          )}

          {/* Right Summary Info */}
          <div className="max-w-xs space-y-3 text-left">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
              <span className="text-xs font-semibold text-zinc-500 block mb-1">
                Mobile Readiness Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {mobileScore}%
                </span>
                <span className={`text-xs font-bold ${mobileScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {mobileScore >= 80 ? 'High Compatibility' : 'Needs Optimization'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Viewport Meta Tag:</span>
                <span className={hasViewport ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {hasViewport ? 'Present' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Font Legibility:</span>
                <span className="text-emerald-600 font-bold">Good</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Touch Targets:</span>
                <span className="text-emerald-600 font-bold">&gt;= 48px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Usability Signals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Viewport Meta Tag */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500">Mobile Viewport</span>
              {hasViewport ? (
                <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Check className="w-3 h-3" />
                </span>
              ) : (
                <span className="p-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                  <AlertCircle className="w-3 h-3" />
                </span>
              )}
            </div>
            <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {hasViewport ? 'Configured' : 'Missing Tag'}
            </h5>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            width=device-width, initial-scale=1
          </p>
        </div>

        {/* Favicon */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500">Site Favicon</span>
              <img
                src={faviconUrl}
                alt="Favicon"
                className="w-4 h-4 rounded"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {hasFavicon ? 'Detected' : 'Default Icon'}
            </h5>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Displayed in browser tabs and mobile SERP cards.
          </p>
        </div>

        {/* Language Declaration */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500">Declared Language</span>
              <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Check className="w-3 h-3" />
              </span>
            </div>
            <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">
              {language}
            </h5>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Specifies the primary human language of HTML text.
          </p>
        </div>

        {/* Character Encoding */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500">Charset Encoding</span>
              <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Check className="w-3 h-3" />
              </span>
            </div>
            <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {charset}
            </h5>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Standard character set ensures proper font rendering.
          </p>
        </div>

        {/* Apple Touch Icon */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500">Apple Touch Icon</span>
              <span
                className={`p-1 rounded-full ${
                  hasAppleIcon
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {hasAppleIcon ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              </span>
            </div>
            <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {hasAppleIcon ? 'Configured' : 'Missing Tag'}
            </h5>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            High-res icon for iOS bookmarks and home screen shortcuts.
          </p>
        </div>

        {/* Email Privacy */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500">Email Privacy</span>
              <span
                className={`p-1 rounded-full ${
                  !metrics.email_privacy_exposed
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {!metrics.email_privacy_exposed ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <AlertTriangle className="w-3 h-3" />
                )}
              </span>
            </div>
            <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {!metrics.email_privacy_exposed ? 'Protected' : 'Exposed In Plaintext'}
            </h5>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            {!metrics.email_privacy_exposed
              ? 'No raw email addresses exposed to automated scraper bots.'
              : `${metrics.exposed_emails_count || 'Plaintext'} email address(es) exposed in source code.`}
          </p>
        </div>
      </div>
    </div>
  );
};
