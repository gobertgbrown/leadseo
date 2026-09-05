import React from 'react';
import { SEOAuditData } from '../../types.js';
import {
  Mail,
  Send,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Download,
  Printer,
  Sparkles,
  FileText,
} from 'lucide-react';

interface SEOPitchEmailSectionProps {
  auditData: SEOAuditData;
  emailRecipient: string;
  setEmailRecipient: (val: string) => void;
  emailSubject: string;
  setEmailSubject: (val: string) => void;
  emailBody: string;
  setEmailBody: (val: string) => void;
  emailTone: 'professional' | 'consultative' | 'concise';
  isRegeneratingPitch: boolean;
  hasCopiedEmail: boolean;
  onRegeneratePitch: (tone: 'professional' | 'consultative' | 'concise') => void;
  onSendNativeEmail: () => void;
  onOpenGmail: () => void;
  onOpenOutlook: () => void;
  onCopyEmail: () => void;
  onDownloadReport: () => void;
}

export const SEOPitchEmailSection: React.FC<SEOPitchEmailSectionProps> = ({
  auditData,
  emailRecipient,
  setEmailRecipient,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  emailTone,
  isRegeneratingPitch,
  hasCopiedEmail,
  onRegeneratePitch,
  onSendNativeEmail,
  onOpenGmail,
  onOpenOutlook,
  onCopyEmail,
  onDownloadReport,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="seoptimer-pitch-email-section" className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        {/* Header with AI Tone Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>AI Client Pitch &amp; Audit Outreach Composer</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Personalized cold outreach pitch tailored with the exact technical mistakes discovered on {auditData.domain}.
            </p>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 self-start">
            <span className="text-[11px] font-medium text-zinc-500 px-2">Tone:</span>
            {(['professional', 'consultative', 'concise'] as const).map((tone) => (
              <button
                key={tone}
                id={`pitch-tone-${tone}`}
                disabled={isRegeneratingPitch}
                onClick={() => onRegeneratePitch(tone)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                  emailTone === tone
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {tone}
              </button>
            ))}
            {isRegeneratingPitch && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin mx-1" />}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Recipient Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="e.g. founder@domain.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Subject Line
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email Pitch Body (Editable)
            </label>
            <textarea
              rows={12}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Native Send */}
            <button
              id="send-email-mailto-btn"
              onClick={onSendNativeEmail}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in Mail App</span>
            </button>

            {/* Gmail Webmail */}
            <button
              id="send-email-gmail-btn"
              onClick={onOpenGmail}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-500" />
              <span>Gmail Web</span>
            </button>

            {/* Outlook Webmail */}
            <button
              id="send-email-outlook-btn"
              onClick={onOpenOutlook}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
              <span>Outlook Web</span>
            </button>

            {/* Copy Email */}
            <button
              id="copy-pitch-btn"
              onClick={onCopyEmail}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 transition-all"
            >
              {hasCopiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Pitch</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Report */}
            <button
              id="download-dossier-btn"
              onClick={onDownloadReport}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 transition-all"
              title="Download full report as text dossier"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Dossier</span>
            </button>

            {/* Print */}
            <button
              id="print-audit-btn"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 transition-all"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
