import React from 'react';
import { SEOAuditData } from '../../types.js';
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Check,
} from 'lucide-react';

interface SEOSocialSectionProps {
  auditData: SEOAuditData;
}

export const SEOSocialSection: React.FC<SEOSocialSectionProps> = ({ auditData }) => {
  const { metrics, social_analysis, domain } = auditData;

  const hasOG = metrics.has_open_graph;
  const hasTwitter = metrics.has_twitter_card;

  const ogTitle = social_analysis?.og_title || metrics.title.value;
  const ogDesc = social_analysis?.og_description || metrics.meta_description.value;
  const ogImage = social_analysis?.og_image || '';

  const profiles = social_analysis?.detected_profiles || {};

  const socialNetworks = [
    { name: 'Facebook', url: profiles.facebook, icon: 'Facebook' },
    { name: 'Instagram', url: profiles.instagram, icon: 'Instagram' },
    { name: 'Twitter / X', url: profiles.twitter, icon: 'Twitter' },
    { name: 'LinkedIn', url: profiles.linkedin, icon: 'LinkedIn' },
    { name: 'YouTube', url: profiles.youtube, icon: 'YouTube' },
    { name: 'TikTok', url: profiles.tiktok, icon: 'TikTok' },
  ];

  return (
    <div id="seoptimer-social-section" className="space-y-6">
      {/* 1. Header & Social Card Previews */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Social Media Signals &amp; Card Previews</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Open Graph tags control how links appear when shared on Facebook, LinkedIn, Twitter/X, and WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                hasOG
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              {hasOG ? 'OG Tags Active' : 'Missing OG Tags'}
            </span>
          </div>
        </div>

        {/* Social Card Preview Previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Facebook Feed Card Preview */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center justify-between">
              <span>Facebook Share Preview</span>
              <span className="text-[11px] font-mono text-zinc-400">og:image &amp; og:title</span>
            </h4>

            {/* Realistic Facebook Post Card */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
              {ogImage ? (
                <div className="w-full h-44 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={ogImage}
                    alt="Social Card Banner"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center text-white p-4 text-center">
                  <Share2 className="w-8 h-8 opacity-60 mb-2" />
                  <span className="text-xs font-bold">{domain}</span>
                </div>
              )}

              <div className="p-3">
                <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-0.5">
                  {domain}
                </span>
                <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1 mb-1">
                  {ogTitle}
                </h5>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {ogDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Twitter / X Feed Card Preview */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center justify-between">
              <span>Twitter / X Card Preview</span>
              <span className="text-[11px] font-mono text-zinc-400">twitter:card</span>
            </h4>

            {/* Realistic Twitter Card */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
              {ogImage ? (
                <div className="w-full h-44 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={ogImage}
                    alt="Twitter Card"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-zinc-800 to-zinc-900 flex flex-col items-center justify-center text-white p-4 text-center">
                  <span className="text-lg font-black tracking-widest">𝕏</span>
                  <span className="text-xs font-medium text-zinc-400 mt-1">{domain}</span>
                </div>
              )}

              <div className="p-3">
                <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1 mb-1">
                  {ogTitle}
                </h5>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-1.5">
                  {ogDesc}
                </p>
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                  🔗 {domain}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Connected Social Media Accounts Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Detected Social Media Profiles
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Links detected on your landing page pointing to company social media accounts.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {socialNetworks.map((net, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between ${
                net.url
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 opacity-70'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                {net.name[0]}
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {net.name}
                </span>
                <span
                  className={`text-[10px] font-medium block mt-0.5 ${
                    net.url ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                  }`}
                >
                  {net.url ? 'Connected' : 'Missing'}
                </span>
              </div>

              {net.url && (
                <a
                  href={net.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Visit</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
