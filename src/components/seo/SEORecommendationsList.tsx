import React, { useState } from 'react';
import { SEOMistake, IssueSeverity } from '../../types.js';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Mail,
  ArrowRight,
  Code2,
  Copy,
  Check,
} from 'lucide-react';

interface SEORecommendationsListProps {
  mistakes: SEOMistake[];
  passedChecks?: { title: string; detail: string }[];
  onPitchIssue?: (mistake: SEOMistake) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SEORecommendationsList: React.FC<SEORecommendationsListProps> = ({
  mistakes,
  passedChecks = [],
  onPitchIssue,
  onShowToast,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'passed'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const highPriority = mistakes.filter((m) => m.priority === 'high' || m.severity === 'critical');
  const mediumPriority = mistakes.filter(
    (m) => (m.priority === 'medium' || m.severity === 'warning') && m.priority !== 'high' && m.severity !== 'critical'
  );
  const lowPriority = mistakes.filter(
    (m) => m.priority === 'low' || (!['critical', 'warning'].includes(m.severity) && m.priority !== 'high' && m.priority !== 'medium')
  );

  const filteredMistakes =
    priorityFilter === 'high'
      ? highPriority
      : priorityFilter === 'medium'
      ? mediumPriority
      : priorityFilter === 'low'
      ? lowPriority
      : mistakes;

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    onShowToast('Snippet copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'meta_tags':
        return 'On-Page SEO';
      case 'content_headings':
        return 'Content & Headings';
      case 'performance_technical':
        return 'Performance';
      case 'social_graph':
        return 'Social';
      default:
        return 'Technical SEO';
    }
  };

  return (
    <div id="seoptimer-recommendations-container" className="space-y-6">
      {/* Header & Filter Pills */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Recommendations</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {mistakes.length}
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Priority action plan generated to improve search ranking visibility and user conversions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="filter-recs-all"
              onClick={() => setPriorityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                priorityFilter === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              All ({mistakes.length})
            </button>
            <button
              id="filter-recs-high"
              onClick={() => setPriorityFilter('high')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                priorityFilter === 'high'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              High Priority ({highPriority.length})
            </button>
            <button
              id="filter-recs-medium"
              onClick={() => setPriorityFilter('medium')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                priorityFilter === 'medium'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Medium Priority ({mediumPriority.length})
            </button>
            {passedChecks.length > 0 && (
              <button
                id="filter-recs-passed"
                onClick={() => setPriorityFilter('passed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  priorityFilter === 'passed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Passed Checks ({passedChecks.length})
              </button>
            )}
          </div>
        </div>

        {/* Passed Checks View */}
        {priorityFilter === 'passed' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {passedChecks.map((check, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {check.title}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {check.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Priority Recommendations List */
          <div className="space-y-4">
            {filteredMistakes.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  No issues found in this category
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  All checks for this priority filter passed successfully.
                </p>
              </div>
            ) : (
              filteredMistakes.map((mistake) => {
                const isCritical = mistake.priority === 'high' || mistake.severity === 'critical';
                const isWarning = !isCritical && (mistake.priority === 'medium' || mistake.severity === 'warning');

                return (
                  <div
                    key={mistake.id}
                    id={`recommendation-item-${mistake.id}`}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      {/* Left: Badges + Title */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {isCritical ? (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              High Priority
                            </span>
                          ) : isWarning ? (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Medium Priority
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Low Priority
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {getCategoryLabel(mistake.category)}
                          </span>

                          {mistake.currentValue && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                              Current: {mistake.currentValue}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {mistake.title}
                        </h4>
                      </div>

                      {/* Right: Pitch to Client Action Button */}
                      {onPitchIssue && (
                        <button
                          id={`pitch-btn-${mistake.id}`}
                          onClick={() => onPitchIssue(mistake)}
                          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-blue-50 text-zinc-700 hover:text-blue-700 dark:bg-zinc-800 dark:hover:bg-blue-950/50 dark:text-zinc-300 dark:hover:text-blue-400 border border-zinc-200 hover:border-blue-300 dark:border-zinc-700 dark:hover:border-blue-800 flex items-center gap-1.5 transition-all"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Pitch This Fix</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Details: Issue & Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                      <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/80">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                          Why It Matters:
                        </span>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {mistake.description}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/80">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                          Ranking Impact:
                        </span>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {mistake.impact}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Resolution */}
                    <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                        Recommended Action:
                      </span>
                      <p className="text-emerald-950 dark:text-emerald-200/90 leading-relaxed">
                        {mistake.recommendedFix}
                      </p>

                      {/* Code sample if available */}
                      {mistake.codeSample && (
                        <div className="mt-2.5 pt-2 border-t border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between gap-2">
                          <code className="text-[11px] font-mono bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-900/50 text-zinc-800 dark:text-zinc-200 overflow-x-auto block w-full">
                            {mistake.codeSample}
                          </code>
                          <button
                            onClick={() => handleCopyCode(mistake.codeSample!, mistake.id)}
                            className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shrink-0"
                            title="Copy code"
                          >
                            {copiedId === mistake.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
