import React from 'react';
import { SEOAuditData } from '../../types.js';
import {
  Link2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

interface SEOLinksSectionProps {
  auditData: SEOAuditData;
}

export const SEOLinksSection: React.FC<SEOLinksSectionProps> = ({ auditData }) => {
  const { links_analysis, domain } = auditData;

  const total = links_analysis?.total_links ?? 0;
  const internal = links_analysis?.internal_links ?? 0;
  const external = links_analysis?.external_links ?? 0;
  const dofollow = links_analysis?.dofollow_links ?? 0;
  const nofollow = links_analysis?.nofollow_links ?? 0;

  const sampleInternal = links_analysis?.sample_internal || [];
  const sampleExternal = links_analysis?.sample_external || [];

  return (
    <div id="seoptimer-links-section" className="space-y-6">
      {/* 1. Stat Cards Overview */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Backlink &amp; Link Profile Analysis</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Internal link structure establishes site architecture; external links pass trust and authority.
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold self-start ${
              total === 0
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                : total < 5
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
            }`}
          >
            {total === 0 ? 'No Links Detected' : total < 5 ? 'Sparse Link Topology' : 'Healthy Link Topology'}
          </span>
        </div>

        {/* 5-Card Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[11px] text-zinc-500 font-medium">Total Links</span>
            <span className="block text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {total}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[11px] text-zinc-500 font-medium">Internal Links</span>
            <span className="block text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {internal}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[11px] text-zinc-500 font-medium">External Links</span>
            <span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {external}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[11px] text-zinc-500 font-medium">Dofollow Links</span>
            <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {dofollow}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[11px] text-zinc-500 font-medium">Nofollow Links</span>
            <span className="block text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {nofollow}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sample Links Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sample Internal Links */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Internal Site Links
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Navigation pathways for Googlebot crawling your domain.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <th className="pb-2 font-semibold">Anchor Text</th>
                  <th className="pb-2 font-semibold">Destination URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {sampleInternal.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-zinc-400">
                      No internal links detected on page.
                    </td>
                  </tr>
                ) : (
                  sampleInternal.map((link, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-2 font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">
                        {link.text || 'Link'}
                      </td>
                      <td className="py-2 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] truncate max-w-[160px]">
                        {link.href}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sample External Links */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            External Outbound Links
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Links pointing to third-party domains and references.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <th className="pb-2 font-semibold">Anchor Text</th>
                  <th className="pb-2 font-semibold">Destination URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {sampleExternal.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-zinc-400">
                      No external links detected on page.
                    </td>
                  </tr>
                ) : (
                  sampleExternal.map((link, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-2 font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">
                        {link.text || 'External link'}
                      </td>
                      <td className="py-2 text-blue-600 dark:text-blue-400 font-mono text-[11px] truncate max-w-[160px]">
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span className="truncate">{link.href}</span>
                          <ArrowUpRight className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
