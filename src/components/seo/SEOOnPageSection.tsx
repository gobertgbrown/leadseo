import React, { useState } from 'react';
import { SEOAuditData, SEOKeywordItem } from '../../types.js';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Smartphone,
  FileCode,
  Layers,
  FileCheck,
  Search,
} from 'lucide-react';

interface SEOOnPageSectionProps {
  auditData: SEOAuditData;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SEOOnPageSection: React.FC<SEOOnPageSectionProps> = ({
  auditData,
  onShowToast,
}) => {
  const [serpView, setSerpView] = useState<'desktop' | 'mobile'>('desktop');
  const [hasCopiedTitle, setHasCopiedTitle] = useState(false);
  const [hasCopiedMeta, setHasCopiedMeta] = useState(false);

  const { metrics, keywords_analysis, domain, url } = auditData;

  const handleCopy = (text: string, type: 'title' | 'meta') => {
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setHasCopiedTitle(true);
      setTimeout(() => setHasCopiedTitle(false), 2000);
    } else {
      setHasCopiedMeta(true);
      setTimeout(() => setHasCopiedMeta(false), 2000);
    }
    onShowToast(`Copied ${type === 'title' ? 'Title' : 'Meta Description'} to clipboard`, 'success');
  };

  const getStatusBadge = (status: 'good' | 'warning' | 'critical') => {
    if (status === 'good') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Optimal
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-3.5 h-3.5" />
          Needs Work
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
        <AlertCircle className="w-3.5 h-3.5" />
        Critical Issue
      </span>
    );
  };

  // Real extracted keywords from content analysis
  const keywords: SEOKeywordItem[] = keywords_analysis && keywords_analysis.length > 0 ? keywords_analysis : [];

  return (
    <div id="seoptimer-on-page-section" className="space-y-6">
      {/* 1. Google SERP Snippet Preview (Desktop / Mobile Toggle) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Google Search Result Snippet Preview</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live simulation of how your page appears on Google search engine result pages (SERPs).
            </p>
          </div>

          {/* Device Toggle Buttons */}
          <div className="flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 self-start">
            <button
              id="serp-toggle-desktop"
              onClick={() => setSerpView('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                serpView === 'desktop'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              id="serp-toggle-mobile"
              onClick={() => setSerpView('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                serpView === 'mobile'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>
        </div>

        {/* Realistic Google Search Card */}
        <div
          className={`p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 transition-all ${
            serpView === 'mobile' ? 'max-w-md mx-auto shadow-sm' : 'w-full'
          }`}
        >
          {/* Breadcrumb & Favicon */}
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
              alt="Site Favicon"
              className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex items-center text-xs text-[#202124] dark:text-zinc-300 font-normal leading-none overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="font-medium">{domain}</span>
              <span className="text-zinc-400 mx-1">›</span>
              <span className="text-zinc-500 dark:text-zinc-400">home</span>
            </div>
          </div>

          {/* Clickable Blue Headline */}
          <h4 className="text-[17px] sm:text-[19px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline font-normal cursor-pointer leading-snug line-clamp-2 mb-1">
            {metrics.title.value !== 'Missing'
              ? metrics.title.value
              : `${domain} | Official Website & Business Overview`}
          </h4>

          {/* Snippet Description */}
          <p className="text-[13px] text-[#4d5156] dark:text-zinc-400 leading-relaxed line-clamp-2">
            {metrics.meta_description.value !== 'Missing'
              ? metrics.meta_description.value
              : 'Discover top-rated services, enterprise solutions, and comprehensive customer offerings. Visit our official website for full details and contact information.'}
          </p>
        </div>
      </div>

      {/* 2. Title Tag & Meta Description Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title Tag Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Title Tag (&lt;title&gt;)
              </h4>
              {getStatusBadge(metrics.title.status)}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              {metrics.title.message}
            </p>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 mb-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono text-zinc-800 dark:text-zinc-200 break-words leading-relaxed">
                  {metrics.title.value}
                </span>
                <button
                  onClick={() => handleCopy(metrics.title.value, 'title')}
                  className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0"
                  title="Copy Title"
                >
                  {hasCopiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Character Counter Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1 font-mono">
              <span>Length: {metrics.title.length} characters</span>
              <span className="text-zinc-400">Target: 50 – 60 chars</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  metrics.title.length >= 45 && metrics.title.length <= 65
                    ? 'bg-emerald-500'
                    : metrics.title.length > 65
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (metrics.title.length / 65) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meta Description Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Meta Description Tag
              </h4>
              {getStatusBadge(metrics.meta_description.status)}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              {metrics.meta_description.message}
            </p>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 mb-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono text-zinc-800 dark:text-zinc-200 break-words leading-relaxed">
                  {metrics.meta_description.value}
                </span>
                <button
                  onClick={() => handleCopy(metrics.meta_description.value, 'meta')}
                  className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0"
                  title="Copy Meta Description"
                >
                  {hasCopiedMeta ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Character Counter Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1 font-mono">
              <span>Length: {metrics.meta_description.length} characters</span>
              <span className="text-zinc-400">Target: 120 – 160 chars</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  metrics.meta_description.length >= 110 && metrics.meta_description.length <= 165
                    ? 'bg-emerald-500'
                    : metrics.meta_description.length > 165
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (metrics.meta_description.length / 165) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Heading Structure (H1, H2, H3, H4) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <span>Headings Structure (H1 – H6)</span>
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Headings outline page structure and tell search engine bots what content is most important.
            </p>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              metrics.h1_count === 1
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
            }`}
          >
            {metrics.h1_count === 1 ? 'Optimal H1 Tag' : metrics.h1_count === 0 ? 'Missing H1 Tag' : 'Multiple H1 Tags'}
          </span>
        </div>

        {/* Counts Grid */}
        <div className={`grid grid-cols-2 ${metrics.h4_count !== undefined ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-3 mb-4`}>
          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-center">
            <span className="text-xs text-zinc-500 font-medium">H1 Tag</span>
            <span className={`block text-xl font-bold mt-0.5 ${metrics.h1_count === 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {metrics.h1_count}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-center">
            <span className="text-xs text-zinc-500 font-medium">H2 Headings</span>
            <span className="block text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {metrics.h2_count}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-center">
            <span className="text-xs text-zinc-500 font-medium">H3 Headings</span>
            <span className="block text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {metrics.h3_count}
            </span>
          </div>
          {metrics.h4_count !== undefined && (
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-center">
              <span className="text-xs text-zinc-500 font-medium">H4 Headings</span>
              <span className="block text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {metrics.h4_count}
              </span>
            </div>
          )}
          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-center">
            <span className="text-xs text-zinc-500 font-medium">Word Count</span>
            <span className="block text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {metrics.word_count.toLocaleString()}
            </span>
          </div>
        </div>

        {/* H1 Samples */}
        {metrics.h1_samples && metrics.h1_samples.length > 0 && (
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Detected H1 Headline:
            </span>
            <ul className="space-y-1 font-mono text-zinc-800 dark:text-zinc-200">
              {metrics.h1_samples.map((h1, i) => (
                <li key={i} className="truncate">
                  • "{h1}"
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 4. Keyword Consistency Table (SEOptimer Signature Feature) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Keyword Consistency
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Key search phrases found in content, checking if they are properly emphasized across critical on-page tags.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                <th className="pb-3 font-semibold">Keyword</th>
                <th className="pb-3 font-semibold text-center">Frequency</th>
                <th className="pb-3 font-semibold text-center">In Title</th>
                <th className="pb-3 font-semibold text-center">In Meta Desc</th>
                <th className="pb-3 font-semibold text-center">In Headings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {keywords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-400">
                    No repeated high-density keywords discovered in the page content.
                  </td>
                </tr>
              ) : (
                keywords.map((kw, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="py-2.5 font-semibold text-zinc-800 dark:text-zinc-200">
                      {kw.keyword}
                    </td>
                    <td className="py-2.5 text-center font-mono text-zinc-600 dark:text-zinc-400">
                      {kw.count}
                    </td>
                    <td className="py-2.5 text-center">
                      {kw.inTitle ? (
                        <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      {kw.inMetaDesc ? (
                        <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      {kw.inHeadings ? (
                        <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Image Alt Attributes, Robots.txt & Sitemap Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Images Alt Tag Check */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Image Alt Attributes
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  metrics.images_missing_alt === 0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                }`}
              >
                {metrics.images_missing_alt === 0 ? 'All Set' : `${metrics.images_missing_alt} Missing`}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              {metrics.images_count} total images discovered on page.
            </p>
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            {metrics.images_missing_alt > 0
              ? 'Add descriptive alt text to all images to rank in Google Images.'
              : 'All evaluated images have descriptive alternative text.'}
          </div>
        </div>

        {/* Robots.txt Status */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Robots.txt File
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  metrics.has_robots_txt
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {metrics.has_robots_txt ? 'Valid Robots.txt' : 'Not Found'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Directs web crawlers on which paths to index or skip.
            </p>
          </div>
          <a
            href={`${url.replace(/\/$/, '')}/robots.txt`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-zinc-100 dark:border-zinc-800"
          >
            <span>Inspect /robots.txt</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* XML Sitemap Status */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                XML Sitemap
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  metrics.has_sitemap
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {metrics.has_sitemap ? 'Valid Sitemap' : 'Missing / Unverified'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Enables Google to discover all URLs on your website.
            </p>
          </div>
          <a
            href={`${url.replace(/\/$/, '')}/sitemap.xml`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-zinc-100 dark:border-zinc-800"
          >
            <span>Inspect /sitemap.xml</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Google Analytics / GTM */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Analytics & Tag Manager
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  metrics.has_google_analytics || metrics.has_gtm
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {metrics.has_gtm
                  ? 'GTM Active'
                  : metrics.has_google_analytics
                  ? 'GA Active'
                  : 'Not Detected'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              {metrics.has_gtm || metrics.has_google_analytics
                ? 'Tracking script active for traffic and conversion measurement.'
                : 'Install GA4 or Google Tag Manager to track organic search visitors.'}
            </p>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            {metrics.has_gtm ? 'Google Tag Manager Container' : metrics.has_google_analytics ? 'Google Analytics 4 / Universal' : 'Recommended: GA4'}
          </div>
        </div>

        {/* Search Indexing Status (Noindex check) */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Google Indexing
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  metrics.has_noindex
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                }`}
              >
                {metrics.has_noindex ? 'Blocked (Noindex)' : 'Indexable'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              {metrics.has_noindex
                ? 'CRITICAL: A noindex directive is instructing Google NOT to index this page.'
                : 'No blocking directives found. Search engines are permitted to index and rank.'}
            </p>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            Robots Meta Tag: {metrics.has_noindex ? 'noindex' : 'index, follow'}
          </div>
        </div>
      </div>
    </div>
  );
};
