import React, { useState, useEffect } from 'react';
import { Lead, SEOAuditData, SEOMistake, CreditAccount } from '../types.js';
import {
  Search,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Send,
  Copy,
  ExternalLink,
  Sparkles,
  Globe,
  FileText,
  ShieldCheck,
  Smartphone,
  Zap,
  Tag,
  Code,
  Check,
  Download,
  Coins,
  Plus,
  Link2,
  Share2,
  Printer,
  FileCheck,
} from 'lucide-react';

import { SEOScoreHero } from './seo/SEOScoreHero.js';
import { SEORecommendationsList } from './seo/SEORecommendationsList.js';
import { SEOOnPageSection } from './seo/SEOOnPageSection.js';
import { SEOLinksSection } from './seo/SEOLinksSection.js';
import { SEOUsabilitySection } from './seo/SEOUsabilitySection.js';
import { SEOPerformanceSection } from './seo/SEOPerformanceSection.js';
import { SEOSocialSection } from './seo/SEOSocialSection.js';
import { SEOPitchEmailSection } from './seo/SEOPitchEmailSection.js';

interface SiteAuditViewProps {
  leads: Lead[];
  initialAuditUrl?: string;
  initialLead?: Lead | null;
  creditBalance?: number;
  onOpenCredits?: () => void;
  onCreditsUpdated?: (account: CreditAccount) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type AuditSubTab =
  | 'recommendations'
  | 'on_page'
  | 'links'
  | 'usability'
  | 'performance'
  | 'social'
  | 'email';

export const SiteAuditView: React.FC<SiteAuditViewProps> = ({
  leads,
  initialAuditUrl,
  initialLead,
  creditBalance = 250,
  onOpenCredits,
  onCreditsUpdated,
  onShowToast,
}) => {
  const [targetUrl, setTargetUrl] = useState(
    initialAuditUrl || (initialLead ? initialLead.website : leads[0]?.website || 'https://veritasdynamics.ai')
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLead?.id || leads[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [auditData, setAuditData] = useState<SEOAuditData | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<AuditSubTab>('recommendations');

  // Pitch Email Form State
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTone, setEmailTone] = useState<'professional' | 'consultative' | 'concise'>('professional');
  const [isRegeneratingPitch, setIsRegeneratingPitch] = useState(false);
  const [hasCopiedEmail, setHasCopiedEmail] = useState(false);

  // Sync state when audit completes or changes
  useEffect(() => {
    if (auditData) {
      const defaultEmail = auditData.lead_email || auditData.suggested_pitch_email?.recipient_email || '';
      setEmailRecipient(defaultEmail);
      setEmailSubject(
        auditData.suggested_pitch_email?.subject ||
          `Urgent SEO Audit for ${auditData.domain}: Critical Ranking Mistakes Detected`
      );
      setEmailBody(auditData.suggested_pitch_email?.body || '');
    }
  }, [auditData]);

  // Initial audit run or fetch on mount
  useEffect(() => {
    const runInitial = async () => {
      const defaultUrl = targetUrl || 'https://veritasdynamics.ai';
      try {
        const domain = defaultUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
        const cachedRes = await fetch(`/api/audit?domain=${encodeURIComponent(domain)}`);
        if (cachedRes.ok) {
          const cachedData = await cachedRes.json();
          if (cachedData.audit) {
            setAuditData(cachedData.audit);
            return;
          }
        }
      } catch (e) {
        // Fallback to fresh run
      }
      handleRunAudit(defaultUrl, selectedLeadId);
    };
    runInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunAudit = async (urlToAudit: string, leadIdToAttach?: string) => {
    if (!urlToAudit || !urlToAudit.trim()) {
      onShowToast('Please enter a website URL to audit', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const associatedLead = leads.find((l) => l.id === leadIdToAttach || l.website === urlToAudit);
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToAudit.trim(),
          leadId: leadIdToAttach || associatedLead?.id,
          businessName: associatedLead?.business_name,
          email: associatedLead?.email && associatedLead.email !== 'Not Found' ? associatedLead.email : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402 || data.code === 'INSUFFICIENT_CREDITS') {
          onOpenCredits?.();
        }
        throw new Error(data.error || 'Failed to complete site audit');
      }

      if (data.credits) {
        onCreditsUpdated?.(data.credits);
      }

      setAuditData(data.audit);
      onShowToast(
        `SEO Audit Complete: ${data.audit.domain} scored ${data.audit.overall_score}/100 (Grade ${data.audit.grade})`,
        'success'
      );
    } catch (err: any) {
      onShowToast(err.message || 'Error occurred while running audit', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePitch = async (newTone: 'professional' | 'consultative' | 'concise') => {
    if (!auditData) return;
    setIsRegeneratingPitch(true);
    setEmailTone(newTone);

    try {
      const res = await fetch('/api/audit/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: auditData.domain,
          businessName: auditData.lead_name || auditData.domain,
          overallScore: auditData.overall_score,
          grade: auditData.grade,
          mistakes: auditData.mistakes,
          tone: newTone,
        }),
      });

      const data = await res.json();
      if (res.ok && data.pitch) {
        setEmailSubject(data.pitch.emailSubject);
        setEmailBody(data.pitch.emailBody);
        onShowToast(`Refined email pitch using ${newTone} tone`, 'info');
      }
    } catch (err) {
      onShowToast('Failed to regenerate pitch', 'error');
    } finally {
      setIsRegeneratingPitch(false);
    }
  };

  // 1. Direct Native Email Send (mailto:)
  const handleSendNativeEmail = () => {
    if (!emailRecipient || !emailRecipient.includes('@')) {
      onShowToast('Please provide a valid recipient email address', 'error');
      return;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(emailRecipient)}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
    onShowToast(`Opening mail client for ${emailRecipient}`, 'success');
  };

  // 2. Open in Gmail Webmail
  const handleOpenGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      emailRecipient
    )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    onShowToast('Opened Gmail composer in new tab', 'info');
  };

  // 3. Open in Outlook Webmail
  const handleOpenOutlook = () => {
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(
      emailRecipient
    )}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(outlookUrl, '_blank', 'noopener,noreferrer');
    onShowToast('Opened Outlook composer in new tab', 'info');
  };

  // 4. Copy Email to Clipboard
  const handleCopyEmail = () => {
    const fullText = `To: ${emailRecipient}\nSubject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setHasCopiedEmail(true);
      onShowToast('Audit pitch email copied to clipboard!', 'success');
      setTimeout(() => setHasCopiedEmail(false), 2500);
    });
  };

  // 5. Download Audit Report as Text
  const handleDownloadReport = () => {
    if (!auditData) return;
    const content = `=====================================================
TECHNICAL SEO AUDIT REPORT: ${auditData.domain.toUpperCase()}
Overall Grade: ${auditData.grade} | Overall Score: ${auditData.overall_score} / 100
Evaluated: ${new Date(auditData.audited_at).toLocaleString()}
Target URL: ${auditData.url}
=====================================================

CATEGORY BREAKDOWN:
- On-Page SEO: Grade ${auditData.categories?.on_page?.grade || 'N/A'} (Score: ${auditData.categories?.on_page?.score || 'N/A'}%)
- Links Analysis: Grade ${auditData.categories?.links?.grade || 'N/A'} (Score: ${auditData.categories?.links?.score || 'N/A'}%)
- Usability & Mobile: Grade ${auditData.categories?.usability?.grade || 'N/A'} (Score: ${auditData.categories?.usability?.score || 'N/A'}%)
- Performance: Grade ${auditData.categories?.performance?.grade || 'N/A'} (Score: ${auditData.categories?.performance?.score || 'N/A'}%)
- Social Media: Grade ${auditData.categories?.social?.grade || 'N/A'} (Score: ${auditData.categories?.social?.score || 'N/A'}%)

EXECUTIVE SUMMARY:
${auditData.executive_summary}

KEY TECHNICAL METRICS:
- Title Tag: ${auditData.metrics.title.value} (${auditData.metrics.title.length} chars) - ${auditData.metrics.title.status.toUpperCase()}
- Meta Description: ${auditData.metrics.meta_description.value} (${auditData.metrics.meta_description.length} chars) - ${auditData.metrics.meta_description.status.toUpperCase()}
- H1 Count: ${auditData.metrics.h1_count}
- H2 Count: ${auditData.metrics.h2_count}
- Word Count: ${auditData.metrics.word_count} words
- Images Without Alt: ${auditData.metrics.images_missing_alt} / ${auditData.metrics.images_count}
- Server Response Time: ${auditData.metrics.response_time_ms} ms
- Document Size: ${auditData.metrics.page_size_kb} KB
- Mobile Viewport: ${auditData.metrics.has_viewport ? 'Present' : 'MISSING'}
- Open Graph Tags: ${auditData.metrics.has_open_graph ? 'Configured' : 'MISSING'}
- SSL / HTTPS: ${auditData.metrics.is_https ? 'Active' : 'INSECURE'}
- Robots.txt: ${auditData.metrics.has_robots_txt ? 'Present' : 'Missing'}
- XML Sitemap: ${auditData.metrics.has_sitemap ? 'Present' : 'Missing'}

DETECTED RANKING MISTAKES (${auditData.mistakes.length}):
${auditData.mistakes
  .map(
    (m, i) => `
[${i + 1}] ${m.title.toUpperCase()} (Severity: ${m.severity.toUpperCase()})
- Description: ${m.description}
- Ranking Impact: ${m.impact}
- Recommended Fix: ${m.recommendedFix}
${m.codeSample ? `- Code Sample:\n${m.codeSample}\n` : ''}`
  )
  .join('\n')}

CLIENT OUTREACH PITCH PROPOSAL:
Subject: ${emailSubject}
Recipient: ${emailRecipient}
-----------------------------------------------------
${emailBody}
-----------------------------------------------------
Generated by AI Site Auditor Engine.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seo-audit-${auditData.domain}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Audit report downloaded successfully', 'success');
  };

  // Jump to pitch specific issue
  const handlePitchSpecificIssue = (mistake: SEOMistake) => {
    setActiveSubTab('email');
    setEmailSubject(`Urgent SEO Fix for ${auditData?.domain}: ${mistake.title}`);
    const note = `Hi team,\n\nWe recently ran an in-depth audit on ${auditData?.domain} and detected an issue requiring immediate action:\n\n• ${mistake.title}\n${mistake.description}\nImpact: ${mistake.impact}\nRecommended Fix: ${mistake.recommendedFix}\n\nLet us know if you would like our assistance implementing this update.\n\nBest regards,`;
    setEmailBody(note);
    onShowToast(`Outreach pitch customized for: "${mistake.title}"`, 'info');
  };

  const handleSelectLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leadId = e.target.value;
    setSelectedLeadId(leadId);
    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.website) {
      setTargetUrl(lead.website);
    }
  };

  interface TabItem {
    id: AuditSubTab;
    label: string;
    count?: number;
    grade?: string;
    isSpecial?: boolean;
  }

  const tabs: TabItem[] = [
    { id: 'recommendations', label: 'Recommendations', count: auditData?.mistakes.length },
    { id: 'on_page', label: 'On-Page SEO', grade: auditData?.categories?.on_page?.grade },
    { id: 'links', label: 'Links', grade: auditData?.categories?.links?.grade },
    { id: 'usability', label: 'Usability', grade: auditData?.categories?.usability?.grade },
    { id: 'performance', label: 'Performance', grade: auditData?.categories?.performance?.grade },
    { id: 'social', label: 'Social', grade: auditData?.categories?.social?.grade },
    { id: 'email', label: 'Email Pitch', isSpecial: true },
  ];

  return (
    <div id="site-audit-view-root" className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Top Audit Control Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Title & Credits */}
          <div className="flex items-center justify-between lg:justify-start gap-4">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Website SEO &amp; Audit Engine</span>
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Comprehensive technical SEO audit, Google ranking signals &amp; cold outreach pitch generator.
              </p>
            </div>

            {/* Credit Balance Badge */}
            <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>{creditBalance} Credits</span>
              </div>
              {onOpenCredits && (
                <button
                  onClick={onOpenCredits}
                  className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Add Credits"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Audit URL Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAudit(targetUrl, selectedLeadId);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-2xl lg:ml-4"
          >
            {/* Quick Leads Dropdown */}
            {leads.length > 0 && (
              <select
                value={selectedLeadId}
                onChange={handleSelectLeadChange}
                className="px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[180px] truncate"
              >
                <option value="">Select Lead...</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.business_name}
                  </option>
                ))}
              </select>
            )}

            {/* Target URL Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              id="run-site-audit-btn"
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Audit Website (2 Credits)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 2. When Audit Data is Available */}
      {auditData && (
        <div className="space-y-6">
          {/* Audit Header Bar (Domain, Date, Quick Actions) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={`https://www.google.com/s2/favicons?domain=${auditData.domain}&sz=64`}
                alt="Favicon"
                className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-200 dark:border-zinc-700"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {auditData.domain}
                  </h2>
                  <a
                    href={auditData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    title="Visit website in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Audit Complete
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Last evaluated on {new Date(auditData.audited_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleRunAudit(targetUrl, selectedLeadId)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 transition-all"
                title="Re-run site audit (2 Credits)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span>Re-audit</span>
              </button>

              <button
                onClick={handleDownloadReport}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 transition-all"
                title="Download full report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Dossier</span>
              </button>

              <button
                onClick={() => setActiveSubTab('email')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Pitch Client</span>
              </button>
            </div>
          </div>

          {/* 3. SEOptimer Executive Scoreboard (Circular Grade + 5 Category Cards) */}
          <SEOScoreHero
            auditData={auditData}
            activeTab={activeSubTab}
            onSelectTab={(tab) => setActiveSubTab(tab as AuditSubTab)}
          />

          {/* 4. Sticky Secondary Navigation Tabs */}
          <div className="sticky top-0 z-10 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md py-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {tabs.map((t) => {
                const isActive = activeSubTab === t.id;
                return (
                  <button
                    key={t.id}
                    id={`tab-btn-${t.id}`}
                    onClick={() => setActiveSubTab(t.id as AuditSubTab)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <span>{t.label}</span>
                    {t.count !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          isActive
                            ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {t.count}
                      </span>
                    )}
                    {t.grade && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          t.grade.startsWith('A')
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : t.grade.startsWith('B')
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {t.grade}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Tab Content Sections */}
          <div>
            {activeSubTab === 'recommendations' && (
              <SEORecommendationsList
                mistakes={auditData.mistakes}
                passedChecks={auditData.passed_checks}
                onPitchIssue={handlePitchSpecificIssue}
                onShowToast={onShowToast}
              />
            )}

            {activeSubTab === 'on_page' && (
              <SEOOnPageSection auditData={auditData} onShowToast={onShowToast} />
            )}

            {activeSubTab === 'links' && <SEOLinksSection auditData={auditData} />}

            {activeSubTab === 'usability' && <SEOUsabilitySection auditData={auditData} />}

            {activeSubTab === 'performance' && <SEOPerformanceSection auditData={auditData} />}

            {activeSubTab === 'social' && <SEOSocialSection auditData={auditData} />}

            {activeSubTab === 'email' && (
              <SEOPitchEmailSection
                auditData={auditData}
                emailRecipient={emailRecipient}
                setEmailRecipient={setEmailRecipient}
                emailSubject={emailSubject}
                setEmailSubject={setEmailSubject}
                emailBody={emailBody}
                setEmailBody={setEmailBody}
                emailTone={emailTone}
                isRegeneratingPitch={isRegeneratingPitch}
                hasCopiedEmail={hasCopiedEmail}
                onRegeneratePitch={handleRegeneratePitch}
                onSendNativeEmail={handleSendNativeEmail}
                onOpenGmail={handleOpenGmail}
                onOpenOutlook={handleOpenOutlook}
                onCopyEmail={handleCopyEmail}
                onDownloadReport={handleDownloadReport}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
