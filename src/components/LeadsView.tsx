import React, { useState, useMemo } from 'react';
import { Lead } from '../types.js';
import {
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  Copy,
  ChevronRight,
  Mail,
  Phone,
  Globe,
  MapPin,
  Trash2,
  Check,
  CheckCircle2,
  ExternalLink,
  SearchCheck,
} from 'lucide-react';
import { cleanField, sanitizeContactPerson, exportSingleLeadPdf, generateLeadsCsv, generateLeadsTsv, downloadFile } from '../utils/exportUtils.js';

interface LeadsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onAuditLead?: (lead: Lead) => void;
  onDeleteLead: (id: string) => Promise<void>;
  onBatchDelete: (ids: string[]) => Promise<void>;
  onExportCsv: (ids?: string[]) => void;
  onExportExcel: (ids?: string[]) => void;
  onExportPdf?: (ids?: string[]) => void;
  onOpenExportModal?: (ids?: string[], format?: 'csv' | 'excel' | 'pdf' | 'json') => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onSelectLead,
  onAuditLead,
  onDeleteLead,
  onBatchDelete,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  onOpenExportModal,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'has_email' | 'has_phone' | 'high_conf'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter and search logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          lead.business_name.toLowerCase().includes(q) ||
          lead.website.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          lead.phone.toLowerCase().includes(q) ||
          lead.category.toLowerCase().includes(q) ||
          lead.city.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Filter
      if (activeFilter === 'verified') {
        return lead.verification_status === 'Verified';
      }
      if (activeFilter === 'has_email') {
        return lead.email && lead.email !== 'Not Found';
      }
      if (activeFilter === 'has_phone') {
        return lead.phone && lead.phone !== 'Not Found';
      }
      if (activeFilter === 'high_conf') {
        return lead.confidence_score >= 90;
      }
      return true;
    });
  }, [leads, searchQuery, activeFilter]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCopy = (text: string, label: string) => {
    if (!text || text === 'Not Found') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    onShowToast(`Copied ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopySelectedEmails = () => {
    const selectedLeads = leads.filter((l) => selectedIds.includes(l.id));
    const emails = selectedLeads
      .map((l) => l.email)
      .filter((e) => e && e !== 'Not Found');

    if (emails.length === 0) {
      onShowToast('No emails found in selected leads.', 'error');
      return;
    }

    navigator.clipboard.writeText(emails.join(', '));
    onShowToast(`Copied ${emails.length} emails to clipboard!`);
  };

  const handleBatchDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    await onBatchDelete(selectedIds);
    setSelectedIds([]);
    onShowToast(`Deleted ${selectedIds.length} leads.`);
  };

  // Quick single export helpers
  const handleQuickLeadPdf = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    exportSingleLeadPdf(lead);
    onShowToast(`Exported PDF for ${lead.business_name}`, 'success');
  };

  const handleQuickLeadCsv = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    const csv = generateLeadsCsv([lead]);
    const safe = lead.business_name.replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadFile(csv, `Lead_${safe}.csv`, 'text/csv;charset=utf-8');
    onShowToast(`Exported CSV for ${lead.business_name}`, 'success');
  };

  const handleQuickLeadExcel = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    const tsv = generateLeadsTsv([lead]);
    const safe = lead.business_name.replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadFile(tsv, `Lead_${safe}.xls`, 'application/vnd.ms-excel;charset=utf-8');
    onShowToast(`Exported Excel (.XLS) for ${lead.business_name}`, 'success');
  };

  const counts = useMemo(() => {
    return {
      all: leads.length,
      verified: leads.filter((l) => l.verification_status === 'Verified').length,
      has_email: leads.filter((l) => l.email && l.email !== 'Not Found').length,
      has_phone: leads.filter((l) => l.phone && l.phone !== 'Not Found').length,
      high_conf: leads.filter((l) => l.confidence_score >= 90).length,
    };
  }, [leads]);

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-300">
      {/* Directory Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaedff] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e] tracking-tight">
              Lead Directory Live
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe]/40 text-[#002113] font-mono text-xs font-bold">
              {leads.length} Discovered
            </span>
          </div>
          <p className="text-xs text-[#464555] mt-0.5">
            Real-time verified business intelligence • Clean A-to-Z Data Exports
          </p>
        </div>

        {/* Action Buttons: CSV, Excel, PDF, Options */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => onExportCsv(selectedIds.length > 0 ? selectedIds : undefined)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8]/60 text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all shadow-sm"
            title="Download CSV file"
          >
            <Download className="w-3.5 h-3.5 text-[#3525cd]" />
            <span className="font-bold">CSV</span>
          </button>

          <button
            type="button"
            onClick={() => onExportExcel(selectedIds.length > 0 ? selectedIds : undefined)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8]/60 text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all shadow-sm"
            title="Download Excel spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#006e4b]" />
            <span className="font-bold">XLS</span>
          </button>

          {onExportPdf && (
            <button
              type="button"
              onClick={() => onExportPdf(selectedIds.length > 0 ? selectedIds : undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fdf2f2] border border-[#f9d2d2] text-xs font-semibold text-[#b3261e] hover:bg-[#fae2e2] active:scale-95 transition-all shadow-sm"
              title="Download Executive PDF Dossier Report"
            >
              <FileText className="w-3.5 h-3.5 text-[#b3261e]" />
              <span className="font-bold">PDF</span>
            </button>
          )}

          {onOpenExportModal && (
            <button
              type="button"
              onClick={() => onOpenExportModal(selectedIds.length > 0 ? selectedIds : undefined)}
              className="px-2.5 py-1.5 rounded-lg bg-[#eaedff] text-[#3525cd] text-xs font-bold hover:bg-[#d9e0ff] active:scale-95 transition-all"
              title="Open Export Modal (CSV, XLS, PDF, JSON, Clipboard)"
            >
              Export Options...
            </button>
          )}
        </div>
      </div>

      {/* Search Input & Filter Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777587]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business, email, domain, location, category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c7c4d8]/60 bg-white text-xs font-mono text-[#131b2e] placeholder-[#777587] focus:outline-none focus:ring-2 focus:ring-[#3525cd] shadow-sm"
          />
        </div>

        {/* Filter Pills Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-[#3525cd] text-white font-bold shadow-sm'
                : 'bg-white border border-[#c7c4d8]/50 text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            All Leads ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('verified')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeFilter === 'verified'
                ? 'bg-[#3525cd] text-white font-bold shadow-sm'
                : 'bg-white border border-[#c7c4d8]/50 text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            Verified Only ({counts.verified})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('has_email')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeFilter === 'has_email'
                ? 'bg-[#3525cd] text-white font-bold shadow-sm'
                : 'bg-white border border-[#c7c4d8]/50 text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            Has Email ({counts.has_email})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('has_phone')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeFilter === 'has_phone'
                ? 'bg-[#3525cd] text-white font-bold shadow-sm'
                : 'bg-white border border-[#c7c4d8]/50 text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            Has Phone ({counts.has_phone})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('high_conf')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeFilter === 'high_conf'
                ? 'bg-[#3525cd] text-white font-bold shadow-sm'
                : 'bg-white border border-[#c7c4d8]/50 text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            Confidence &gt;90% ({counts.high_conf})
          </button>
        </div>
      </div>

      {/* Sticky Bulk Selection Toolbar when items selected */}
      {selectedIds.length > 0 && (
        <div className="bg-[#283044] text-[#eef0ff] px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#acedff]">
              {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopySelectedEmails}
              className="px-2.5 py-1 rounded bg-[#464555] hover:bg-[#525061] text-white font-medium flex items-center gap-1 active:scale-95 transition-all"
            >
              <Copy className="w-3 h-3" />
              <span>Copy Emails</span>
            </button>
            <button
              type="button"
              onClick={() => onExportCsv(selectedIds)}
              className="px-2.5 py-1 rounded bg-[#3525cd] hover:bg-[#4338ca] text-white font-medium flex items-center gap-1 active:scale-95 transition-all"
              title="Download selected as CSV"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => onExportExcel(selectedIds)}
              className="px-2.5 py-1 rounded bg-[#006e4b] hover:bg-[#00875a] text-white font-medium flex items-center gap-1 active:scale-95 transition-all"
              title="Download selected as Excel (.XLS)"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Excel (.XLS)</span>
            </button>
            {onExportPdf && (
              <button
                type="button"
                onClick={() => onExportPdf(selectedIds)}
                className="px-2.5 py-1 rounded bg-[#b3261e] hover:bg-[#c62828] text-white font-medium flex items-center gap-1 active:scale-95 transition-all"
                title="Download selected as PDF Directory Report"
              >
                <FileText className="w-3 h-3" />
                <span>PDF Report</span>
              </button>
            )}
            {onOpenExportModal && (
              <button
                type="button"
                onClick={() => onOpenExportModal(selectedIds)}
                className="px-2 py-1 rounded bg-[#525061] hover:bg-[#605d70] text-white text-[11px] font-bold active:scale-95 transition-all"
              >
                More...
              </button>
            )}
            <button
              type="button"
              onClick={handleBatchDeleteSelected}
              className="p-1 rounded text-[#ffb4ab] hover:bg-[#ba1a1a]/40 active:scale-95 transition-all"
              title="Delete selected leads"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Select All Toggle Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-[#777587]">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
            onChange={handleToggleSelectAll}
            className="w-4 h-4 rounded text-[#3525cd] focus:ring-[#3525cd] border-[#c7c4d8] cursor-pointer"
          />
          <span className="font-medium text-[#131b2e]">Select All ({filteredLeads.length})</span>
        </label>

        <span className="font-mono text-[11px]">Click any company to inspect full dossier</span>
      </div>

      {/* Leads Cards Grid */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#eaedff] space-y-3">
            <p className="text-sm text-[#464555]">No leads found matching current filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="text-xs text-[#3525cd] font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isSelected = selectedIds.includes(lead.id);
            const cleanedCity = cleanField(lead.city);
            const cleanedContact = sanitizeContactPerson(lead.contact_person);

            return (
              <div
                key={lead.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-[#3525cd] ring-1 ring-[#3525cd] bg-[#faf8ff]'
                    : 'border-[#eaedff]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Checkbox + Name + Industry */}
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(lead.id)}
                      className="mt-1 w-4 h-4 rounded text-[#3525cd] focus:ring-[#3525cd] border-[#c7c4d8] cursor-pointer"
                    />

                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          onClick={() => onSelectLead(lead)}
                          className="font-bold text-base text-[#131b2e] hover:text-[#3525cd] cursor-pointer truncate"
                        >
                          {lead.business_name}
                        </h2>
                        <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#3525cd] text-[10px] font-mono font-medium truncate">
                          {lead.category}
                        </span>
                        {cleanedContact !== 'Not Discovered' && (
                          <span className="px-2 py-0.5 rounded bg-[#f2f3ff] text-[#464555] text-[10px] font-mono truncate">
                            👤 {cleanedContact}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#464555] mt-1 font-mono flex-wrap">
                        {cleanedCity && (
                          <span className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-[#777587]" />
                            {cleanedCity}, {cleanField(lead.state) || cleanField(lead.country) || 'USA'}
                          </span>
                        )}
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#3525cd] hover:underline text-[11px] truncate"
                        >
                          <Globe className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Pill & Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        lead.verification_status === 'Verified'
                          ? 'bg-[#6ffbbe]/40 text-[#002113]'
                          : 'bg-[#fff5ea] text-[#b45309]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          lead.verification_status === 'Verified'
                            ? 'bg-[#006e4b]'
                            : 'bg-[#b45309]'
                        }`}
                      />
                      <span>{lead.verification_status}</span>
                      <span className="font-mono text-[10px] opacity-75 font-normal">
                        ({lead.confidence_score}%)
                      </span>
                    </div>

                    {/* Quick Single Export Buttons on card */}
                    <div className="flex items-center gap-1 border-l border-[#eaedff] pl-2 ml-1">
                      <button
                        type="button"
                        onClick={(e) => handleQuickLeadPdf(e, lead)}
                        className="p-1.5 text-[#b3261e] hover:bg-[#fdf2f2] rounded-lg transition-colors"
                        title="Download PDF report for this company"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleQuickLeadCsv(e, lead)}
                        className="p-1.5 text-[#3525cd] hover:bg-[#eaedff] rounded-lg transition-colors"
                        title="Download CSV for this company"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleQuickLeadExcel(e, lead)}
                        className="p-1.5 text-[#006e4b] hover:bg-[#e6fbf2] rounded-lg transition-colors"
                        title="Download Excel (.XLS) for this company"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </button>
                      {onAuditLead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAuditLead(lead);
                          }}
                          className="p-1.5 text-[#5b21b6] hover:bg-[#ede9fe] rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                          title="Run SEO Site Audit & Pitch"
                        >
                          <SearchCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">SEO Audit</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteLead(lead.id)}
                      className="p-1.5 text-[#777587] hover:text-[#ba1a1a] rounded-lg hover:bg-[#ffdad6]/30 transition-colors ml-1"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Extracted Contact Channels Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#eaedff] text-xs">
                  {/* Email */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f2f3ff] min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-[#3525cd] flex-shrink-0" />
                      <span className="font-mono text-xs text-[#131b2e] truncate select-all">
                        {lead.email}
                      </span>
                    </div>
                    {lead.email !== 'Not Found' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(lead.email, `email-${lead.id}`)}
                        className="p-1 text-[#777587] hover:text-[#3525cd] transition-colors flex-shrink-0"
                        title="Copy Email"
                      >
                        {copiedKey === `email-${lead.id}` ? (
                          <Check className="w-3 h-3 text-[#006e4b]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f2f3ff] min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-[#006e4b] flex-shrink-0" />
                      <span className="font-mono text-xs text-[#131b2e] truncate select-all">
                        {lead.phone}
                      </span>
                    </div>
                    {lead.phone !== 'Not Found' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(lead.phone, `phone-${lead.id}`)}
                        className="p-1 text-[#777587] hover:text-[#3525cd] transition-colors flex-shrink-0"
                        title="Copy Phone"
                      >
                        {copiedKey === `phone-${lead.id}` ? (
                          <Check className="w-3 h-3 text-[#006e4b]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Action & Social links */}
                <div className="flex items-center justify-between mt-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-[#777587]">
                    {lead.linkedin && lead.linkedin !== 'Not Found' && (
                      <a
                        href={lead.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3525cd] hover:underline font-mono text-[10px]"
                      >
                        LinkedIn
                      </a>
                    )}
                    {lead.twitter && lead.twitter !== 'Not Found' && (
                      <a
                        href={lead.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3525cd] hover:underline font-mono text-[10px]"
                      >
                        X Corp
                      </a>
                    )}
                    {lead.github && lead.github !== 'Not Found' && (
                      <a
                        href={lead.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3525cd] hover:underline font-mono text-[10px]"
                      >
                        GitHub
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectLead(lead)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3525cd] hover:text-[#4338ca] transition-colors group"
                  >
                    <span>View Full Details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-[#eaedff] text-xs text-[#464555]">
        <span>
          Showing 1–{filteredLeads.length} of {leads.length} leads
        </span>
        <span className="font-mono text-[11px] text-[#006e4b] font-medium">
          ● 100% Raw Scraped Integrity • A-to-Z Data Coverage
        </span>
      </div>
    </div>
  );
};
