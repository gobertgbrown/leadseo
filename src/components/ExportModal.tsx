import React, { useState, useMemo } from 'react';
import { Lead } from '../types.js';
import {
  X,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  FileText,
  Code,
  CheckCircle2,
  Table,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  generateLeadsCsv,
  generateLeadsTsv,
  generateLeadsJson,
  exportSingleLeadPdf,
  exportLeadsTablePdf,
  downloadFile,
  copyToClipboard,
} from '../utils/exportUtils.js';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  preselectedIds?: string[];
  defaultFormat?: 'csv' | 'excel' | 'pdf' | 'json';
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  leads,
  preselectedIds = [],
  defaultFormat = 'csv',
  onShowToast,
}) => {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>(defaultFormat);
  const [scope, setScope] = useState<'all' | 'selected' | 'verified'>(
    preselectedIds.length > 0 ? 'selected' : 'all'
  );
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Compute targeted leads
  const targetLeads = useMemo(() => {
    if (scope === 'selected' && preselectedIds.length > 0) {
      const set = new Set(preselectedIds);
      return leads.filter((l) => set.has(l.id));
    }
    if (scope === 'verified') {
      return leads.filter((l) => l.verification_status === 'Verified');
    }
    return leads;
  }, [leads, scope, preselectedIds]);

  // Lead metrics
  const metrics = useMemo(() => {
    let emails = 0;
    let phones = 0;
    let socials = 0;
    targetLeads.forEach((l) => {
      if (l.email && l.email !== 'Not Found') emails++;
      if (l.phone && l.phone !== 'Not Found') phones++;
      const s = [l.linkedin, l.twitter, l.facebook, l.instagram, l.youtube, l.github].filter(
        (val) => val && val !== 'Not Found'
      ).length;
      socials += s;
    });
    return {
      total: targetLeads.length,
      emails,
      phones,
      socials,
    };
  }, [targetLeads]);

  // Generated content based on current format
  const exportPayload = useMemo(() => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (format === 'csv') {
      return {
        content: generateLeadsCsv(targetLeads),
        filename: `LeadPulse_Leads_${timestamp}.csv`,
        mimeType: 'text/csv;charset=utf-8',
      };
    }
    if (format === 'excel') {
      return {
        content: generateLeadsTsv(targetLeads),
        filename: `LeadPulse_Leads_${timestamp}.xls`,
        mimeType: 'application/vnd.ms-excel;charset=utf-8',
      };
    }
    if (format === 'pdf') {
      return {
        content: `PDF Document (${targetLeads.length} leads configured with styling, tables & audit data)`,
        filename:
          targetLeads.length === 1
            ? `LeadDossier_${(targetLeads[0].business_name || 'lead').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
            : `LeadPulse_Leads_Report_${timestamp}.pdf`,
        mimeType: 'application/pdf',
      };
    }
    return {
      content: generateLeadsJson(targetLeads),
      filename: `LeadPulse_Leads_${timestamp}.json`,
      mimeType: 'application/json;charset=utf-8',
    };
  }, [targetLeads, format]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (targetLeads.length === 0) {
      onShowToast('No leads available to export in current selection.', 'error');
      return;
    }

    if (format === 'pdf') {
      let success = false;
      if (targetLeads.length === 1) {
        success = exportSingleLeadPdf(targetLeads[0]);
      } else {
        success = exportLeadsTablePdf(targetLeads, 'LeadPulse Verified Business Directory');
      }

      if (success) {
        setDownloadSuccess(true);
        onShowToast(`Generated & downloaded PDF document (${exportPayload.filename})!`, 'success');
        setTimeout(() => setDownloadSuccess(false), 3000);
      } else {
        onShowToast('Could not compile PDF report.', 'error');
      }
      return;
    }

    const success = downloadFile(exportPayload.content, exportPayload.filename, exportPayload.mimeType);
    if (success) {
      setDownloadSuccess(true);
      onShowToast(`Exported ${targetLeads.length} leads as ${exportPayload.filename}`, 'success');
      setTimeout(() => setDownloadSuccess(false), 3000);
    } else {
      // Fallback
      const idsParam =
        scope === 'selected' && preselectedIds.length > 0 ? `?ids=${preselectedIds.join(',')}` : '';
      const fallbackUrl =
        format === 'csv'
          ? `/api/export/csv${idsParam}`
          : format === 'excel'
          ? `/api/export/excel${idsParam}`
          : `/api/export/json${idsParam}`;

      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.target = '_blank';
      link.download = exportPayload.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('Started download via backend endpoint.', 'info');
    }
  };

  const handleCopy = async () => {
    if (targetLeads.length === 0) {
      onShowToast('No leads available to copy.', 'error');
      return;
    }

    let textToCopy = exportPayload.content;
    if (format === 'excel') {
      textToCopy = exportPayload.content.replace(/^\uFEFF/, '');
    } else if (format === 'pdf') {
      // Copy formatted text summary for PDF
      textToCopy = targetLeads
        .map(
          (l, idx) =>
            `${idx + 1}. ${l.business_name} | Category: ${l.category} | Email: ${l.email} | Phone: ${l.phone} | Status: ${l.verification_status} (${l.confidence_score}%)`
        )
        .join('\n');
    }

    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopied(true);
      onShowToast(
        `Copied ${targetLeads.length} leads! Ready to paste into Excel or Google Sheets.`,
        'success'
      );
      setTimeout(() => setCopied(false), 2500);
    } else {
      onShowToast('Failed to copy to clipboard.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#131b2e]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#eaedff] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eaedff] flex items-center justify-between bg-[#faf8ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#131b2e]">Export Business Leads</h2>
              <p className="text-xs text-[#464555]">
                Download .CSV, .XLS (Excel), .PDF report or .JSON with complete A-to-Z data.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#777587] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Format Selection - 4 Columns */}
          <div className="space-y-2">
            <label className="font-semibold text-xs text-[#131b2e] flex items-center justify-between">
              <span>Select File Format</span>
              <span className="font-mono text-[10px] text-[#777587] uppercase font-normal">
                UTF-8 Encoded • Full A-Z Data
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* CSV */}
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  format === 'csv'
                    ? 'border-[#3525cd] bg-[#f2f3ff] shadow-sm ring-1 ring-[#3525cd]'
                    : 'border-[#c7c4d8]/60 bg-white hover:bg-[#f2f3ff]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileText className={`w-4 h-4 ${format === 'csv' ? 'text-[#3525cd]' : 'text-[#777587]'}`} />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white text-[#131b2e] font-bold border border-[#c7c4d8]/40">
                    .CSV
                  </span>
                </div>
                <span className="font-bold text-xs text-[#131b2e]">CSV File</span>
                <span className="text-[10px] text-[#464555] leading-tight">Universal tabular</span>
              </button>

              {/* Excel */}
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  format === 'excel'
                    ? 'border-[#006e4b] bg-[#e6fbf2] shadow-sm ring-1 ring-[#006e4b]'
                    : 'border-[#c7c4d8]/60 bg-white hover:bg-[#f2f3ff]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileSpreadsheet
                    className={`w-4 h-4 ${format === 'excel' ? 'text-[#006e4b]' : 'text-[#777587]'}`}
                  />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white text-[#131b2e] font-bold border border-[#c7c4d8]/40">
                    .XLS
                  </span>
                </div>
                <span className="font-bold text-xs text-[#131b2e]">Excel</span>
                <span className="text-[10px] text-[#464555] leading-tight">Native spreadsheet</span>
              </button>

              {/* PDF */}
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  format === 'pdf'
                    ? 'border-[#b3261e] bg-[#fdf2f2] shadow-sm ring-1 ring-[#b3261e]'
                    : 'border-[#c7c4d8]/60 bg-white hover:bg-[#f2f3ff]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileText
                    className={`w-4 h-4 ${format === 'pdf' ? 'text-[#b3261e]' : 'text-[#777587]'}`}
                  />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white text-[#131b2e] font-bold border border-[#c7c4d8]/40">
                    .PDF
                  </span>
                </div>
                <span className="font-bold text-xs text-[#131b2e]">PDF Report</span>
                <span className="text-[10px] text-[#464555] leading-tight">Printable dossier</span>
              </button>

              {/* JSON */}
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  format === 'json'
                    ? 'border-[#3525cd] bg-[#f2f3ff] shadow-sm ring-1 ring-[#3525cd]'
                    : 'border-[#c7c4d8]/60 bg-white hover:bg-[#f2f3ff]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Code className={`w-4 h-4 ${format === 'json' ? 'text-[#3525cd]' : 'text-[#777587]'}`} />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white text-[#131b2e] font-bold border border-[#c7c4d8]/40">
                    .JSON
                  </span>
                </div>
                <span className="font-bold text-xs text-[#131b2e]">JSON</span>
                <span className="text-[10px] text-[#464555] leading-tight">API & telemetry</span>
              </button>
            </div>
          </div>

          {/* Export Scope */}
          <div className="space-y-2">
            <label className="font-semibold text-xs text-[#131b2e]">Export Scope</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  scope === 'all'
                    ? 'bg-[#131b2e] text-white border-[#131b2e] shadow-sm'
                    : 'bg-white text-[#464555] border-[#c7c4d8]/60 hover:bg-[#f2f3ff]'
                }`}
              >
                All Leads ({leads.length})
              </button>

              <button
                type="button"
                onClick={() => setScope('selected')}
                disabled={preselectedIds.length === 0}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  preselectedIds.length === 0
                    ? 'opacity-40 cursor-not-allowed border-[#c7c4d8]/40 bg-[#f2f3ff]'
                    : scope === 'selected'
                    ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-sm'
                    : 'bg-white text-[#464555] border-[#c7c4d8]/60 hover:bg-[#f2f3ff]'
                }`}
              >
                Selected ({preselectedIds.length})
              </button>

              <button
                type="button"
                onClick={() => setScope('verified')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  scope === 'verified'
                    ? 'bg-[#006e4b] text-white border-[#006e4b] shadow-sm'
                    : 'bg-white text-[#464555] border-[#c7c4d8]/60 hover:bg-[#f2f3ff]'
                }`}
              >
                Verified Only ({leads.filter((l) => l.verification_status === 'Verified').length})
              </button>
            </div>
          </div>

          {/* Dataset Metrics Strip */}
          <div className="grid grid-cols-4 gap-2 bg-[#f2f3ff] p-3 rounded-xl text-center">
            <div>
              <span className="text-[10px] font-mono text-[#777587] uppercase block">Leads</span>
              <span className="font-bold text-sm text-[#131b2e]">{metrics.total}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#777587] uppercase block">Emails</span>
              <span className="font-bold text-sm text-[#006e4b]">{metrics.emails}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#777587] uppercase block">Phones</span>
              <span className="font-bold text-sm text-[#3525cd]">{metrics.phones}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#777587] uppercase block">Socials</span>
              <span className="font-bold text-sm text-[#131b2e]">{metrics.socials}</span>
            </div>
          </div>

          {/* Data Preview Toggle (only for text formats) */}
          {format !== 'pdf' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-xs text-[#3525cd] font-semibold hover:underline"
              >
                <Table className="w-3.5 h-3.5" />
                <span>{showPreview ? 'Hide Raw Data Preview' : 'Show Raw Data Preview'}</span>
              </button>

              {showPreview && (
                <div className="p-3 bg-[#131b2e] rounded-xl text-white font-mono text-[11px] max-h-36 overflow-auto leading-relaxed select-all">
                  <pre>{exportPayload.content.slice(0, 800)}...</pre>
                </div>
              )}
            </div>
          )}

          {/* Information Notice */}
          <div className="p-3 rounded-xl bg-[#eaedff] border border-[#c7c4d8]/50 flex items-start gap-2 text-xs text-[#131b2e]">
            <Info className="w-4 h-4 text-[#3525cd] flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[#3525cd] block">
                {format === 'pdf'
                  ? 'High-Definition Printable PDF Dossier'
                  : 'Direct Download & Clipboard Synchronization'}
              </span>
              <p className="text-[#464555] text-[11px] leading-relaxed">
                {format === 'pdf'
                  ? 'Generates an executive PDF report with full company profiles, contact channels, geolocation, and crawl audit trails.'
                  : 'Click Download to save the file. You can also use Copy to Clipboard to paste directly into Google Sheets or Microsoft Excel with Ctrl + V.'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-[#eaedff] bg-[#faf8ff] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#c7c4d8]/70 bg-white text-xs font-bold text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span className="text-[#006e4b]">Copied Data!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#3525cd]" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            {format !== 'pdf' && (
              <a
                href={`/api/export/${format === 'excel' ? 'excel' : format === 'json' ? 'json' : 'csv'}${
                  scope === 'selected' && preselectedIds.length > 0 ? `?ids=${preselectedIds.join(',')}` : ''
                }`}
                target="_blank"
                rel="noopener noreferrer"
                download={exportPayload.filename}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#3525cd] hover:bg-[#eaedff] transition-colors flex items-center gap-1"
                title="Open direct download link in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Direct Link</span>
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={targetLeads.length === 0}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md active:scale-95 transition-all ${
              targetLeads.length === 0
                ? 'bg-[#c7c4d8] cursor-not-allowed'
                : downloadSuccess
                ? 'bg-[#006e4b]'
                : format === 'pdf'
                ? 'bg-[#b3261e] hover:bg-[#c62828]'
                : format === 'excel'
                ? 'bg-[#006e4b] hover:bg-[#00875a]'
                : 'bg-[#3525cd] hover:bg-[#4338ca]'
            }`}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
