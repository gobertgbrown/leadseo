import React, { useState } from 'react';
import { Lead, SEOAuditData, SEOMistake } from '../types.js';
import {
  Sparkles,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Send,
  Copy,
  ExternalLink,
  RefreshCw,
  Search,
  ShieldCheck,
  Check,
  Globe,
  Zap,
} from 'lucide-react';

interface LeadSEOAuditSectionProps {
  lead: Lead;
  auditData: SEOAuditData | null;
  isAuditing: boolean;
  onRunAudit: () => Promise<void>;
  onOpenFullWorkspace?: (lead: Lead) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LeadSEOAuditSection: React.FC<LeadSEOAuditSectionProps> = ({
  lead,
  auditData,
  isAuditing,
  onRunAudit,
  onOpenFullWorkspace,
  onShowToast,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(
    lead.email && lead.email !== 'Not Found' ? lead.email : auditData?.suggested_pitch_email?.recipient_email || ''
  );
  const [emailSubject, setEmailSubject] = useState(
    auditData?.suggested_pitch_email?.subject ||
      `Urgent SEO Audit for ${lead.website.replace(/^https?:\/\//, '')}: Critical Ranking Mistakes Detected`
  );
  const [emailBody, setEmailBody] = useState(auditData?.suggested_pitch_email?.body || '');
  const [hasCopied, setHasCopied] = useState(false);

  // Direct native mailto send
  const handleSendNativeMail = () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      onShowToast('Please provide a valid recipient email address', 'error');
      return;
    }
    const mailto = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailto;
    onShowToast(`Opening mail client for ${recipientEmail}`, 'success');
  };

  // Open in Gmail Webmail
  const handleOpenGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipientEmail
    )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    onShowToast('Opened Gmail composer in new tab', 'info');
  };

  // Copy Email Message
  const handleCopyMessage = () => {
    const full = `To: ${recipientEmail}\nSubject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(full).then(() => {
      setHasCopied(true);
      onShowToast('Copied SEO pitch email to clipboard!', 'success');
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-[#e8fbf3] text-[#006e4b] border-[#a0e9c9]';
      case 'B':
        return 'bg-[#eef2ff] text-[#3525cd] border-[#c7c4d8]';
      case 'C':
        return 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
      case 'D':
      case 'F':
      default:
        return 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Loading State */}
      {isAuditing && (
        <div className="bg-[#283044] text-[#eef0ff] p-5 rounded-2xl shadow-md border border-[#3c4660] space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-[#57dffe] animate-spin flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-[#acedff]">Auditing SEO Health for {lead.website}</h3>
              <p className="text-xs text-[#c7c4d8] mt-0.5">
                Scanning on-page metadata, headings, image alt attributes, robots.txt, and calculating Google ranking penalties...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. No Audit Yet Prompt */}
      {!auditData && !isAuditing && (
        <div className="bg-white rounded-2xl border border-[#eaedff] p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#eef2ff] text-[#3525cd] flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#131b2e]">
              No SEO Audit Data for {lead.business_name}
            </h3>
            <p className="text-xs text-[#464555] mt-1 leading-relaxed">
              Run a deep SEO health check on <strong className="text-[#131b2e]">{lead.website}</strong> to discover missing title tags, broken heading structures, missing image alt texts, and indexability issues. Generate a direct email pitch to offer your SEO services.
            </p>
          </div>
          <button
            type="button"
            onClick={onRunAudit}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#3525cd] hover:bg-[#2c1fb0] text-white shadow-sm inline-flex items-center gap-2 transition-transform active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span>Run SEO Optimizer Audit Now</span>
          </button>
        </div>
      )}

      {/* 3. Audit Results Display */}
      {auditData && !isAuditing && (
        <div className="space-y-6">
          {/* Executive Overview Card */}
          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Score Gauge */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center rounded-2xl bg-[#faf8ff] border border-[#eaedff] p-2">
                  <div className="flex flex-col items-center justify-center text-center">
                    <span
                      className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                        auditData.overall_score >= 80
                          ? 'text-[#006e4b]'
                          : auditData.overall_score >= 60
                          ? 'text-[#3525cd]'
                          : 'text-[#b91c1c]'
                      }`}
                    >
                      {auditData.overall_score}
                    </span>
                    <span className="text-[10px] text-[#777587] font-semibold uppercase">/ 100</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-[#131b2e]">
                      {auditData.domain}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getGradeBadge(
                        auditData.grade
                      )}`}
                    >
                      Grade {auditData.grade}
                    </span>
                  </div>

                  <p className="text-xs text-[#464555]">
                    Audited {new Date(auditData.audited_at).toLocaleTimeString()} • Response Time:{' '}
                    <span className="font-mono font-semibold text-[#131b2e]">
                      {auditData.metrics.response_time_ms}ms
                    </span>{' '}
                    • {auditData.metrics.is_https ? 'HTTPS Encrypted' : 'Insecure HTTP'}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={auditData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#3525cd] hover:underline font-semibold"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Visit Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {onOpenFullWorkspace && (
                      <button
                        type="button"
                        onClick={() => onOpenFullWorkspace(lead)}
                        className="inline-flex items-center gap-1 text-xs text-[#464555] hover:text-[#131b2e] font-semibold"
                      >
                        <Zap className="w-3 h-3 text-[#3525cd]" />
                        <span>Full Workspace Diagnostics →</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Re-audit Button */}
              <button
                type="button"
                onClick={onRunAudit}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#faf8ff] text-[#464555] border border-[#c7c4d8] hover:text-[#131b2e] hover:bg-white flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#3525cd]" />
                <span>Re-Audit Site</span>
              </button>
            </div>

            {/* Quick Metrics Chips */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#eaedff]">
              <div className="p-2.5 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-center">
                <span className="text-lg font-bold text-[#b91c1c] block">
                  {auditData.summary.critical_errors}
                </span>
                <span className="text-[10px] text-[#b91c1c] font-semibold uppercase">
                  Critical Mistakes
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-center">
                <span className="text-lg font-bold text-[#b45309] block">
                  {auditData.summary.warnings}
                </span>
                <span className="text-[10px] text-[#b45309] font-semibold uppercase">Warnings</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#e8fbf3] border border-[#a0e9c9] text-center">
                <span className="text-lg font-bold text-[#006e4b] block">
                  {auditData.summary.passed_checks}
                </span>
                <span className="text-[10px] text-[#006e4b] font-semibold uppercase">
                  Passed Checks
                </span>
              </div>
            </div>
          </div>

          {/* Mistakes & Issues Found */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#131b2e] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#b91c1c]" />
                <span>Identified SEO Mistakes ({auditData.mistakes.length})</span>
              </h3>
              <span className="text-xs text-[#777587]">Actionable Ranking Opportunities</span>
            </div>

            {auditData.mistakes.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-[#eaedff] p-4 space-y-2.5 hover:border-[#c7c4d8] transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {m.severity === 'critical' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
                        CRITICAL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                        WARNING
                      </span>
                    )}
                    <h4 className="text-xs sm:text-sm font-bold text-[#131b2e]">{m.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#777587] uppercase">
                    {m.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Issue & Impact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#faf8ff] border border-[#eaedff]">
                    <span className="font-semibold text-[#464555] block text-[11px] mb-0.5">
                      Issue Identified:
                    </span>
                    <p className="text-[#131b2e] leading-snug">{m.description}</p>
                    {m.currentValue && (
                      <span className="text-[10px] font-mono text-[#777587] block mt-1 truncate">
                        Current: {m.currentValue}
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#fffcf5] border border-[#fed7aa]/50">
                    <span className="font-semibold text-[#b45309] block text-[11px] mb-0.5">
                      Ranking Impact:
                    </span>
                    <p className="text-[#7c2d12] leading-snug">{m.impact}</p>
                  </div>
                </div>

                {/* Recommended Fix */}
                <div className="p-2.5 rounded-xl bg-[#eef2ff]/70 border border-[#c7c4d8]/40 text-xs space-y-1">
                  <span className="font-bold text-[#3525cd] flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Fix:
                  </span>
                  <p className="text-[#131b2e] leading-snug">{m.recommendedFix}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Direct Email Pitch Composer */}
          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[#eaedff]">
              <div className="w-8 h-8 rounded-lg bg-[#eef2ff] text-[#3525cd] flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#131b2e]">
                  Direct Client Outreach Email Pitch
                </h3>
                <p className="text-[11px] text-[#464555]">
                  Auto-populated with the mistakes found on {auditData.domain} to pitch your optimization service.
                </p>
              </div>
            </div>

            {/* Recipient & Subject Fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-[11px] font-bold text-[#131b2e] block">
                    Recipient Email:
                  </label>
                  <input
                    type="email"
                    placeholder="contact@lead.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#faf8ff] border border-[#c7c4d8] rounded-xl text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-[#131b2e] block">
                    Subject Line:
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#faf8ff] border border-[#c7c4d8] rounded-xl text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20"
                  />
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#131b2e] block">
                  Pitch Message Content:
                </label>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-3 text-xs leading-relaxed font-sans bg-[#faf8ff] border border-[#c7c4d8] rounded-xl text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20"
                />
              </div>
            </div>

            {/* Outreach Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#eaedff]">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Send Native Mailto */}
                <button
                  type="button"
                  onClick={handleSendNativeMail}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#3525cd] hover:bg-[#2c1fb0] text-white shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct Email (Mail Client)</span>
                </button>

                {/* Open in Gmail */}
                <button
                  type="button"
                  onClick={handleOpenGmail}
                  className="px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-white text-[#464555] hover:text-[#131b2e] border border-[#c7c4d8] hover:border-[#131b2e] flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#ea4335]" />
                  <span>Send via Gmail</span>
                </button>
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopyMessage}
                className="px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-[#faf8ff] text-[#131b2e] border border-[#c7c4d8] hover:bg-white flex items-center gap-1.5 transition-colors"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#006e4b]" />
                    <span className="text-[#006e4b] font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#777587]" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
