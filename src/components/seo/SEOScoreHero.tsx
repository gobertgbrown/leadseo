import React from 'react';
import { SEOAuditData, SEOCategoryGrade } from '../../types.js';
import {
  FileText,
  Link2,
  Smartphone,
  Zap,
  Share2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface SEOScoreHeroProps {
  auditData: SEOAuditData;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const SEOScoreHero: React.FC<SEOScoreHeroProps> = ({
  auditData,
  activeTab,
  onSelectTab,
}) => {
  const { overall_score, grade, categories, domain, url } = auditData;

  // Grade color scheme
  const getGradeTheme = (g: string) => {
    if (g.startsWith('A')) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        badge: 'bg-emerald-600 text-white',
        ring: '#10b981',
      };
    }
    if (g.startsWith('B')) {
      return {
        bg: 'bg-teal-50 dark:bg-teal-950/30',
        text: 'text-teal-700 dark:text-teal-400',
        border: 'border-teal-200 dark:border-teal-800',
        badge: 'bg-teal-600 text-white',
        ring: '#0d9488',
      };
    }
    if (g.startsWith('C')) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        badge: 'bg-amber-600 text-white',
        ring: '#f59e0b',
      };
    }
    if (g.startsWith('D')) {
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        badge: 'bg-orange-600 text-white',
        ring: '#ea580c',
      };
    }
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800',
      badge: 'bg-rose-600 text-white',
      ring: '#e11d48',
    };
  };

  const mainTheme = getGradeTheme(grade);

  // SVGs for circular progress
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  // Render category cards directly from backend calculated auditData.categories
  const categoryCards: Array<{
    id: 'on_page' | 'links' | 'usability' | 'performance' | 'social';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    data: SEOCategoryGrade;
  }> = [
    {
      id: 'on_page',
      label: categories?.on_page?.name || 'On-Page SEO',
      icon: FileText,
      data: categories?.on_page || {
        name: 'On-Page SEO',
        grade: grade,
        score: overall_score,
        passed: auditData.summary.passed_checks,
        warnings: auditData.summary.warnings,
        errors: auditData.summary.critical_errors,
        summary: 'Page tags, headings & content signals',
      },
    },
    {
      id: 'links',
      label: categories?.links?.name || 'Links',
      icon: Link2,
      data: categories?.links || {
        name: 'Links',
        grade: grade,
        score: overall_score,
        passed: 0,
        warnings: 0,
        errors: 0,
        summary: 'Internal & external backlink topology',
      },
    },
    {
      id: 'usability',
      label: categories?.usability?.name || 'Usability',
      icon: Smartphone,
      data: categories?.usability || {
        name: 'Usability',
        grade: grade,
        score: overall_score,
        passed: 0,
        warnings: 0,
        errors: 0,
        summary: 'Mobile responsiveness & viewport metrics',
      },
    },
    {
      id: 'performance',
      label: categories?.performance?.name || 'Performance',
      icon: Zap,
      data: categories?.performance || {
        name: 'Performance',
        grade: grade,
        score: overall_score,
        passed: 0,
        warnings: 0,
        errors: 0,
        summary: 'TTFB response & asset payload size',
      },
    },
    {
      id: 'social',
      label: categories?.social?.name || 'Social',
      icon: Share2,
      data: categories?.social || {
        name: 'Social',
        grade: grade,
        score: overall_score,
        passed: 0,
        warnings: 0,
        errors: 0,
        summary: 'Open Graph tags & social network cards',
      },
    },
  ];

  return (
    <div
      id="seoptimer-executive-scoreboard"
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Circular Grade Meter */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-center gap-4">
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            {/* Background ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={mainTheme.ring}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold tracking-tight ${mainTheme.text}`}>
                {grade}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                {overall_score} / 100
              </span>
            </div>
          </div>

          <div className="text-left sm:text-left lg:text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: mainTheme.ring }}
              />
              Overall SEO Score
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
              {overall_score >= 80
                ? 'Website shows good overall technical health with optimization room on secondary search signals.'
                : overall_score >= 60
                ? 'Moderate performance with high-priority action items needed on core search ranking tags.'
                : 'Significant search penalty risks detected. Immediate resolution required to protect search ranking.'}
            </p>
          </div>
        </div>

        {/* Right Column: 5 SEOptimer Sub-Category Score Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {categoryCards.map((cat) => {
            const theme = getGradeTheme(cat.data.grade);
            const IconComponent = cat.icon;
            const isSelected = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                id={`score-card-${cat.id}`}
                onClick={() => onSelectTab(cat.id)}
                className={`relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40'
                }`}
              >
                {/* Header with Icon & Grade Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-bold border ${theme.border} ${theme.bg} ${theme.text}`}
                  >
                    {cat.data.grade}
                  </span>
                </div>

                {/* Title and Score Progress */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    {cat.label}
                  </h4>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.data.score}%`,
                        backgroundColor: theme.ring,
                      }}
                    />
                  </div>
                </div>

                {/* Checks Count Summary */}
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {cat.data.passed}
                  </span>
                  {cat.data.warnings > 0 && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      {cat.data.warnings}
                    </span>
                  )}
                  {cat.data.errors > 0 && (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {cat.data.errors}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
