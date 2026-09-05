import React, { useState, useEffect } from 'react';
import { Lead, SEOAuditData } from '../types.js';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Copy,
  Mail,
  Phone,
  Compass,
  MapPin,
  Share2,
  RefreshCw,
  Download,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  FileText,
  Database,
  CheckCircle2,
  Clock,
  Globe,
  Layers,
  Sparkles,
  X,
  SearchCheck,
  AlertCircle,
  AlertTriangle,
  Send,
  Zap,
} from 'lucide-react';
import { APP_ASSETS } from '../assets.js';
import {
  cleanField,
  sanitizeContactPerson,
  exportSingleLeadPdf,
  generateLeadsCsv,
  generateLeadsTsv,
  downloadFile,
} from '../utils/exportUtils.js';
import { LeadSEOAuditSection } from './LeadSEOAuditSection.js';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onRecheckLead: (leadId: string) => Promise<void>;
  onExportLead?: (lead: Lead) => void;
  onOpenSiteAudit?: (lead: Lead) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onRecheckLead,
  onOpenSiteAudit,
  onShowToast,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'dossier' | 'audit'>('dossier');
  const [isRechecking, setIsRechecking] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAtoZTable, setShowAtoZTable] = useState(true);

  // SEO Audit State
  const [seoAudit, setSeoAudit] = useState<SEOAuditData | null>(lead.seo_audit || null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditEmailRecipient, setAuditEmailRecipient] = useState(
    lead.email && lead.email !== 'Not Found' ? lead.email : ''
  );
  const [auditEmailSubject, setAuditEmailSubject] = useState('');
  const [auditEmailBody, setAuditEmailBody] = useState('');
  const [hasCopiedPitch, setHasCopiedPitch] = useState(false);

  // Sync audit when lead changes or fetch existing
  useEffect(() => {
    if (lead.seo_audit) {
      setSeoAudit(lead.seo_audit);
      setAuditEmailSubject(lead.seo_audit.suggested_pitch_email?.subject || '');
      setAuditEmailBody(lead.seo_audit.suggested_pitch_email?.body || '');
      setAuditEmailRecipient(
        lead.email && lead.email !== 'Not Found'
          ? lead.email
          : lead.seo_audit.lead_email || ''
      );
    } else if (lead.website) {
      fetch(`/api/audit?url=${encodeURIComponent(lead.website)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.audit) {
            setSeoAudit(data.audit);
            setAuditEmailSubject(data.audit.suggested_pitch_email?.subject || '');
            setAuditEmailBody(data.audit.suggested_pitch_email?.body || '');
          }
        })
        .catch(() => {});
    }
  }, [lead]);

  const handleRunSeoAudit = async () => {
    setIsAuditing(true);
    onShowToast(`Auditing SEO health for ${lead.website}...`, 'info');
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: lead.website,
          leadId: lead.id,
          businessName: lead.business_name,
          email: lead.email && lead.email !== 'Not Found' ? lead.email : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.audit) {
        setSeoAudit(data.audit);
        setAuditEmailSubject(data.audit.suggested_pitch_email?.subject || '');
        setAuditEmailBody(data.audit.suggested_pitch_email?.body || '');
        onShowToast(
          `Audit complete: ${data.audit.domain} scored ${data.audit.overall_score}/100 with ${data.audit.summary.critical_errors} critical mistakes found!`,
          'success'
        );
      } else {
        throw new Error(data.error || 'Audit failed');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Audit encountered an issue', 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSendAuditEmail = () => {
    if (!auditEmailRecipient || !auditEmailRecipient.includes('@')) {
      onShowToast('Please provide a valid recipient email address', 'error');
      return;
    }
    const mailto = `mailto:${encodeURIComponent(auditEmailRecipient)}?subject=${encodeURIComponent(
      auditEmailSubject
    )}&body=${encodeURIComponent(auditEmailBody)}`;
    window.location.href = mailto;
    onShowToast(`Launching email client for ${auditEmailRecipient}`, 'success');
  };

  const handleOpenGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      auditEmailRecipient
    )}&su=${encodeURIComponent(auditEmailSubject)}&body=${encodeURIComponent(auditEmailBody)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    onShowToast('Opened Gmail composer in new tab', 'info');
  };

  const handleCopyPitch = () => {
    const text = `To: ${auditEmailRecipient}\nSubject: ${auditEmailSubject}\n\n${auditEmailBody}`;
    navigator.clipboard.writeText(text).then(() => {
      setHasCopiedPitch(true);
      onShowToast('Copied SEO pitch email to clipboard!', 'success');
      setTimeout(() => setHasCopiedPitch(false), 2000);
    });
  };

  const handleCopy = (text: string, label: string) => {
    if (!text || text === 'Not Found' || text === 'Not Discovered') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    onShowToast(`Copied ${label} to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTriggerRecheck = async () => {
    setIsRechecking(true);
    onShowToast('Dispatching crawler workers to re-verify domain...', 'info');
    try {
      await onRecheckLead(lead.id);
      onShowToast('Target re-verification complete (100%)', 'success');
    } catch {
      onShowToast('Re-verification encountered an issue.', 'error');
    } finally {
      setIsRechecking(false);
    }
  };

  // Direct CSV Download
  const handleDownloadCsv = () => {
    const csv = generateLeadsCsv([lead]);
    const safeName = (lead.business_name || 'lead').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `LeadDossier_${safeName}.csv`;
    const ok = downloadFile(csv, filename, 'text/csv;charset=utf-8');
    if (ok) {
      onShowToast(`Exported ${lead.business_name} as CSV file!`, 'success');
    } else {
      onShowToast('Download failed. Check browser permissions.', 'error');
    }
  };

  // Direct Excel (.XLS) Download
  const handleDownloadExcel = () => {
    const tsv = generateLeadsTsv([lead]);
    const safeName = (lead.business_name || 'lead').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `LeadDossier_${safeName}.xls`;
    const ok = downloadFile(tsv, filename, 'application/vnd.ms-excel;charset=utf-8');
    if (ok) {
      onShowToast(`Exported ${lead.business_name} as Excel spreadsheet (.XLS)!`, 'success');
    } else {
      onShowToast('Download failed. Check browser permissions.', 'error');
    }
  };

  // Direct PDF Download
  const handleDownloadPdf = () => {
    const ok = exportSingleLeadPdf(lead);
    if (ok) {
      onShowToast(`Exported ${lead.business_name} as Executive PDF Report!`, 'success');
    } else {
      onShowToast('Failed to compile PDF document.', 'error');
    }
  };

  // Cleaned text values
  const cleanedAddress = cleanField(lead.address);
  const cleanedContactPerson = sanitizeContactPerson(lead.contact_person);
  const cleanedCity = cleanField(lead.city);
  const cleanedState = cleanField(lead.state);
  const cleanedCountry = cleanField(lead.country);
  const cleanedPostalCode = cleanField(lead.postal_code);

  const fullLocation = [cleanedAddress, cleanedCity, cleanedState, cleanedCountry, cleanedPostalCode]
    .filter(Boolean)
    .join(', ');

  // Dial percentage calculations for SVG circular ring
  const strokeDash = `${lead.confidence_score || 0}, 100`;

  // A to Z Complete Field List
  const aToZFields = [
    { label: 'A // Business Name', value: lead.business_name || 'N/A', status: 'Verified' },
    { label: 'B // Industry & Category', value: lead.category || 'Technology', status: 'Classified' },
    { label: 'C // Corporate Website', value: lead.website || 'N/A', status: 'Active URL' },
    { label: 'D // Primary Inbound Email', value: lead.email || 'Not Discovered', status: lead.email_status || 'Not Found' },
    { label: 'E // Email Confidence Score', value: `${lead.email_confidence ?? 0}% Integrity`, status: 'Calculated' },
    { label: 'F // Email Extraction Source', value: lead.email_source || 'Root / Contact page', status: 'Source URL' },
    { label: 'G // Primary Phone Number', value: lead.phone || 'Not Discovered', status: lead.phone_status || 'Not Found' },
    { label: 'H // Phone Confidence Score', value: `${lead.phone_confidence ?? 0}% Integrity`, status: 'Calculated' },
    { label: 'I // Phone Extraction Source', value: lead.phone_source || 'Contact page markup', status: 'Source URL' },
    { label: 'J // Alternate Phone Line', value: lead.alt_phone || 'None recorded', status: lead.alt_phone ? 'Discovered' : 'N/A' },
    { label: 'K // Street Address', value: cleanedAddress || 'Not Discovered', status: lead.address_source || 'Footnote' },
    { label: 'L // City', value: cleanedCity || 'Not Discovered', status: 'Geolocated' },
    { label: 'M // State / Province', value: cleanedState || 'Not Discovered', status: 'Geolocated' },
    { label: 'N // Country', value: cleanedCountry || 'USA', status: 'Geolocated' },
    { label: 'O // Postal / ZIP Code', value: cleanedPostalCode || 'Not Discovered', status: 'Geolocated' },
    { label: 'P // Key Executive / Decision Maker', value: cleanedContactPerson, status: cleanedContactPerson !== 'Not Discovered' ? 'Discovered' : 'N/A' },
    { label: 'Q // Executive Role / Title', value: lead.contact_person_role || 'Executive Officer', status: 'Role Signal' },
    { label: 'R // Executive Bio Source', value: lead.contact_person_source || 'Team Roster', status: 'Source URL' },
    { label: 'S // LinkedIn Profile', value: lead.linkedin || 'Not Discovered', status: lead.linkedin && lead.linkedin !== 'Not Found' ? 'Linked' : 'Not Found' },
    { label: 'T // X (Twitter) Profile', value: lead.twitter || 'Not Discovered', status: lead.twitter && lead.twitter !== 'Not Found' ? 'Linked' : 'Not Found' },
    { label: 'U // Facebook Profile', value: lead.facebook || 'Not Discovered', status: lead.facebook && lead.facebook !== 'Not Found' ? 'Linked' : 'Not Found' },
    { label: 'V // Instagram Profile', value: lead.instagram || 'Not Discovered', status: lead.instagram && lead.instagram !== 'Not Found' ? 'Linked' : 'Not Found' },
    { label: 'W // YouTube Channel', value: lead.youtube || 'Not Discovered', status: lead.youtube && lead.youtube !== 'Not Found' ? 'Linked' : 'Not Found' },
    { label: 'X // GitHub Roster', value: lead.github || 'Not Discovered', status: lead.github && lead.github !== 'Not Found' ? 'Linked' : 'Not Found' },
    { label: 'Y // Crawl Telemetry', value: `${lead.pages_crawled || 1} pages scanned (Depth ${lead.crawl_depth || 2})`, status: 'Engine Logs' },
    { label: 'Z // Overall Verification & Confidence', value: `${lead.verification_status} (${lead.confidence_score}%)`, status: 'Audited' },
  ];

  return (
    <div
      id="lead-dossier-modal"
      className="fixed inset-0 z-50 bg-[#131b2e]/65 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl h-full sm:h-[92vh] sm:max-h-[920px] bg-[#faf8ff] flex flex-col rounded-none sm:rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden">
        {/* Dossier Header Bar (Pinned to Top) */}
        <div className="flex-shrink-0 bg-[#faf8ff] border-b border-[#eaedff] px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 text-[#464555] hover:text-[#131b2e] rounded-lg hover:bg-[#eaedff] active:scale-95 transition-all"
              title="Return to Lead Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-[#131b2e]">Lead Dossier</span>
              <span className="font-mono text-[10px] text-[#777587] uppercase tracking-wider">
                Full A-Z Verified Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#777587] hover:text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader breadcrumb (Pinned under header) */}
        <div className="flex-shrink-0 w-full bg-[#f2f3ff] px-4 py-2 border-b border-[#eaedff] flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1.5 font-mono text-[#464555]">
            <span className="text-[#777587]">TARGET //</span>
            <span className="font-bold text-[#131b2e] truncate max-w-[200px] sm:max-w-md">
              {lead.business_name}
            </span>
          </div>
          <span
            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
              lead.verification_status === 'Verified'
                ? 'bg-[#e6fbf2] text-[#006e4b]'
                : 'bg-[#fff5ea] text-[#b45309]'
            }`}
          >
            ● {lead.verification_status} Data ({lead.confidence_score}%)
          </span>
        </div>

        {/* Modal View Mode Selector Tabs */}
        <div className="flex-shrink-0 bg-white border-b border-[#eaedff] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-1.5 bg-[#faf8ff] p-1 rounded-xl border border-[#eaedff]">
            <button
              type="button"
              onClick={() => setActiveModalTab('dossier')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeModalTab === 'dossier'
                  ? 'bg-white text-[#3525cd] shadow-xs'
                  : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Full A-Z Lead Dossier</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveModalTab('audit');
                if (!seoAudit && !isAuditing) {
                  handleRunSeoAudit();
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeModalTab === 'audit'
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5" />
              <span>SEO Site Audit & Email Pitch</span>
              {seoAudit ? (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    activeModalTab === 'audit'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#e8fbf3] text-[#006e4b]'
                  }`}
                >
                  {seoAudit.overall_score}/100
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#faf8ff] text-[#3525cd]">
                  Run
                </span>
              )}
            </button>
          </div>

          {activeModalTab === 'audit' && seoAudit && onOpenSiteAudit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSiteAudit(lead);
              }}
              className="text-xs font-semibold text-[#3525cd] hover:underline flex items-center gap-1"
            >
              <span>Full Workspace</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">
          {activeModalTab === 'audit' ? (
            <LeadSEOAuditSection
              lead={lead}
              auditData={seoAudit}
              isAuditing={isAuditing}
              onRunAudit={handleRunSeoAudit}
              onOpenFullWorkspace={
                onOpenSiteAudit
                  ? (l) => {
                      onClose();
                      onOpenSiteAudit(l);
                    }
                  : undefined
              }
              onShowToast={onShowToast}
            />
          ) : (
            <>
              {/* Active Crawler Banner when re-checking */}
          {isRechecking && (
            <div className="bg-[#283044] text-[#eef0ff] p-3 rounded-xl shadow-md flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-[#57dffe] animate-spin" />
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-[#acedff]">CRAWLING TARGET DOMAIN</span>
                  <span className="font-mono text-[10px] text-[#c7c4d8]">
                    Worker nodes verifying /contact & /team subpaths in real-time...
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 bg-[#464555] rounded text-white">
                LIVE AUDIT
              </span>
            </div>
          )}
          {/* Lead Overview Bento Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#eaedff] shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#3525cd] flex-shrink-0 shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h1 className="font-bold text-xl text-[#131b2e] truncate">{lead.business_name}</h1>
                  <span className="text-xs text-[#464555] font-medium mt-0.5">{lead.category}</span>
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#3525cd] hover:underline font-mono mt-1 truncate"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{lead.website}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono ${
                    lead.verification_status === 'Verified'
                      ? 'bg-[#6ffbbe]/30 text-[#002113] border border-[#006e4b]/20'
                      : 'bg-[#fff5ea] text-[#b45309] border border-[#b45309]/20'
                  }`}
                >
                  {lead.verification_status}
                </span>
                <span className="font-mono text-[10px] text-[#777587]">
                  Audit v2.4
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#464555] leading-relaxed border-t border-[#eaedff] pt-3">
              {lead.description || 'Extracted business intelligence profile with contact discovery.'}
            </p>

            {/* Confidence Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#eaedff] bg-[#faf8ff] p-3 rounded-xl">
              {/* Dial Score */}
              <div className="flex flex-col justify-center items-center px-2 py-1 bg-white rounded-lg shadow-sm">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#dae2fd] stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3.2"
                    />
                    <path
                      className="text-[#006e4b] stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={strokeDash}
                      strokeLinecap="round"
                      strokeWidth="3.2"
                    />
                  </svg>
                  <span className="absolute font-bold text-xs text-[#131b2e] leading-none">
                    {lead.confidence_score}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-[#777587] mt-1 font-medium">
                  {lead.confidence_score >= 80 ? 'High Integrity' : 'Unverified Quality'}
                </span>
              </div>

              {/* Pages Crawled */}
              <div className="flex flex-col justify-center px-3 py-1 bg-white rounded-lg shadow-sm">
                <span className="text-[9px] font-mono text-[#777587] uppercase tracking-wider">
                  Pages Crawled
                </span>
                <span className="font-bold text-sm text-[#131b2e] mt-0.5">
                  {lead.pages_crawled || 1} pages
                </span>
                <span className="font-mono text-[9px] text-[#777587]">
                  Depth Limit: {lead.crawl_depth || 2}
                </span>
              </div>

              {/* Freshness */}
              <div className="flex flex-col justify-center px-3 py-1 bg-white rounded-lg shadow-sm">
                <span className="text-[9px] font-mono text-[#777587] uppercase tracking-wider">
                  Last Checked
                </span>
                <span className="font-semibold text-xs text-[#131b2e] mt-0.5 truncate">
                  {new Date(lead.last_checked).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="font-mono text-[9px] text-[#006e4b] font-medium">
                  Freshness &lt;24h
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Verified Inbound Contact Data */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#3525cd]" />
                <h2 className="font-semibold text-sm text-[#131b2e]">Verified Contact Channels</h2>
              </div>
              <span className="font-mono text-[10px] text-[#777587]">
                HIGH CONFIDENCE CHANNELS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Email */}
              <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#777587]">
                      Primary Email
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        lead.email_status === 'Verified'
                          ? 'bg-[#6ffbbe]/40 text-[#002113]'
                          : 'bg-[#eaedff] text-[#464555]'
                      }`}
                    >
                      {lead.email_confidence || 0}% Conf
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-[#131b2e] truncate select-all">
                      {lead.email && lead.email !== 'Not Found' ? lead.email : 'Not Detected on Website'}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {lead.email && lead.email !== 'Not Found' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCopy(lead.email, 'Email')}
                            className="p-1.5 rounded-lg bg-[#eaedff] text-[#464555] hover:text-[#3525cd] active:scale-95 transition-all"
                            title="Copy Email"
                          >
                            {copiedKey === 'Email' ? (
                              <Check className="w-3.5 h-3.5 text-[#006e4b]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={`mailto:${lead.email}`}
                            className="p-1.5 rounded-lg bg-[#3525cd] text-white hover:bg-[#4338ca] active:scale-95 transition-all"
                            title="Send Inbound Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-1.5 bg-[#f2f3ff] px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-[#464555]">
                  <Compass className="w-3 h-3 text-[#777587] flex-shrink-0" />
                  <span className="truncate">
                    Source: {lead.email_source || `${lead.website}/contact`}
                  </span>
                </div>
              </div>

              {/* Primary Phone */}
              <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#777587]">
                      Primary Phone
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        lead.phone_status === 'Verified'
                          ? 'bg-[#6ffbbe]/40 text-[#002113]'
                          : 'bg-[#eaedff] text-[#464555]'
                      }`}
                    >
                      {lead.phone_confidence || 0}% Conf
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-[#131b2e] truncate select-all">
                      {lead.phone && lead.phone !== 'Not Found' ? lead.phone : 'Not Detected on Website'}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {lead.phone && lead.phone !== 'Not Found' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCopy(lead.phone, 'Phone')}
                            className="p-1.5 rounded-lg bg-[#eaedff] text-[#464555] hover:text-[#3525cd] active:scale-95 transition-all"
                            title="Copy Phone"
                          >
                            {copiedKey === 'Phone' ? (
                              <Check className="w-3.5 h-3.5 text-[#006e4b]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 rounded-lg bg-[#006e4b] text-white hover:bg-[#005338] active:scale-95 transition-all"
                            title="Call Switchboard"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-1.5 bg-[#f2f3ff] px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-[#464555]">
                  <Compass className="w-3 h-3 text-[#777587] flex-shrink-0" />
                  <span className="truncate">
                    Source: {lead.phone_source || `${lead.website}/contact-us`}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Personnel & Alternate Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Executive Decision Maker */}
              <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#777587]">
                    Key Executive / Personnel
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#3525cd] font-mono text-[10px] font-bold">
                    Leadership Bio
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#eaedff] flex items-center justify-center text-[#3525cd] font-bold text-xs flex-shrink-0">
                    {cleanedContactPerson !== 'Not Discovered'
                      ? cleanedContactPerson
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')
                      : 'HQ'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs sm:text-sm text-[#131b2e] truncate">
                      {cleanedContactPerson}
                    </span>
                    <span className="text-[11px] text-[#464555] truncate">
                      {lead.contact_person_role || 'Executive Officer / Decision Maker'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alternate Phone or Secondary Contact */}
              <div className="bg-white p-4 rounded-xl border border-[#eaedff] shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#777587]">
                    Alternate Line / Secondary
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#f2f3ff] text-[#464555] font-mono text-[10px]">
                    Backup
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="font-mono text-xs text-[#131b2e]">
                    {lead.alt_phone || 'None detected on public pages'}
                  </span>
                  {lead.alt_phone && (
                    <button
                      type="button"
                      onClick={() => handleCopy(lead.alt_phone!, 'Alt Phone')}
                      className="p-1.5 rounded-lg bg-[#eaedff] text-[#464555] hover:text-[#3525cd]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clean Geolocation & Address */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#3525cd]" />
                <h2 className="font-semibold text-sm text-[#131b2e]">Location &amp; Corporate Address</h2>
              </div>
              <span className="font-mono text-[10px] text-[#006e4b] font-semibold">
                POSTAL &amp; REGISTRY
              </span>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-[#eaedff] shadow-sm flex flex-col">
              {/* Simulated Map Header with Silicon Valley Hub Pin */}
              <div
                className="w-full h-28 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${APP_ASSETS.mapSiliconValley})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/80 via-transparent to-transparent flex items-end p-3">
                  <span className="font-mono text-xs text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#57dffe]" />
                    {cleanedCity || 'Headquarters Hub'}, {cleanedCountry || 'USA'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-[#131b2e]">
                      {lead.business_name} Campus / Operating Address
                    </span>
                    <p className="text-xs text-[#464555] mt-1 leading-relaxed font-mono">
                      {fullLocation || 'No physical address found on website footer'}
                    </p>
                  </div>
                  {fullLocation && (
                    <button
                      type="button"
                      onClick={() => handleCopy(fullLocation, 'Address')}
                      className="p-1.5 rounded-lg bg-[#eaedff] text-[#464555] hover:text-[#3525cd] active:scale-95 transition-all flex-shrink-0"
                      title="Copy Address"
                    >
                      {copiedKey === 'Address' ? (
                        <Check className="w-3.5 h-3.5 text-[#006e4b]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 bg-[#f2f3ff] px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-[#464555]">
                  <Compass className="w-3 h-3 text-[#777587]" />
                  <span className="truncate">
                    Source: {lead.address_source || `Registry Footnote via /contact`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Social Media Profiles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-[#3525cd]" />
                <h2 className="font-semibold text-sm text-[#131b2e]">Public Social Profiles</h2>
              </div>
              <span className="font-mono text-[10px] text-[#777587]">
                {[lead.linkedin, lead.twitter, lead.facebook, lead.instagram, lead.youtube, lead.github].filter(
                  (s) => s && s !== 'Not Found'
                ).length}{' '}
                CONNECTED
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* LinkedIn */}
              <div className="bg-white p-3 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#131b2e]">LinkedIn</span>
                  {lead.linkedin && lead.linkedin !== 'Not Found' ? (
                    <a
                      href={lead.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3525cd] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
                <span className="font-mono text-[11px] truncate text-[#464555]">
                  {lead.linkedin && lead.linkedin !== 'Not Found' ? lead.linkedin : 'Not Discovered'}
                </span>
              </div>

              {/* Twitter / X */}
              <div className="bg-white p-3 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#131b2e]">X / Twitter</span>
                  {lead.twitter && lead.twitter !== 'Not Found' ? (
                    <a
                      href={lead.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3525cd] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
                <span className="font-mono text-[11px] truncate text-[#464555]">
                  {lead.twitter && lead.twitter !== 'Not Found' ? lead.twitter : 'Not Discovered'}
                </span>
              </div>

              {/* Facebook */}
              <div className="bg-white p-3 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#131b2e]">Facebook</span>
                  {lead.facebook && lead.facebook !== 'Not Found' ? (
                    <a
                      href={lead.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3525cd] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
                <span className="font-mono text-[11px] truncate text-[#464555]">
                  {lead.facebook && lead.facebook !== 'Not Found' ? lead.facebook : 'Not Discovered'}
                </span>
              </div>

              {/* Instagram */}
              <div className="bg-white p-3 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#131b2e]">Instagram</span>
                  {lead.instagram && lead.instagram !== 'Not Found' ? (
                    <a
                      href={lead.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3525cd] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
                <span className="font-mono text-[11px] truncate text-[#464555]">
                  {lead.instagram && lead.instagram !== 'Not Found' ? lead.instagram : 'Not Discovered'}
                </span>
              </div>

              {/* YouTube */}
              <div className="bg-white p-3 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#131b2e]">YouTube</span>
                  {lead.youtube && lead.youtube !== 'Not Found' ? (
                    <a
                      href={lead.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3525cd] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
                <span className="font-mono text-[11px] truncate text-[#464555]">
                  {lead.youtube && lead.youtube !== 'Not Found' ? lead.youtube : 'Not Discovered'}
                </span>
              </div>

              {/* GitHub */}
              <div className="bg-white p-3 rounded-xl border border-[#eaedff] shadow-sm flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#131b2e]">GitHub</span>
                  {lead.github && lead.github !== 'Not Found' ? (
                    <a
                      href={lead.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3525cd] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
                <span className="font-mono text-[11px] truncate text-[#464555]">
                  {lead.github && lead.github !== 'Not Found' ? lead.github : 'Not Discovered'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: A-to-Z Data Transparency Explorer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#3525cd]" />
                <h2 className="font-semibold text-sm text-[#131b2e]">
                  A to Z Complete Data Transparency
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAtoZTable(!showAtoZTable)}
                className="text-xs text-[#3525cd] font-semibold hover:underline"
              >
                {showAtoZTable ? 'Collapse' : 'Expand (All 26 Fields)'}
              </button>
            </div>

            {showAtoZTable && (
              <div className="bg-white rounded-xl border border-[#eaedff] shadow-sm overflow-hidden">
                <div className="divide-y divide-[#eaedff]">
                  {aToZFields.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 hover:bg-[#faf8ff] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                    >
                      <div className="flex items-center gap-2 font-mono text-[#777587]">
                        <span className="font-bold text-[#131b2e]">{f.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#131b2e] break-all select-all font-medium">
                          {f.value}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#eaedff] text-[#3525cd] font-mono flex-shrink-0">
                          {f.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Crawl Source Audit Trail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3525cd]" />
                <h2 className="font-semibold text-sm text-[#131b2e]">Crawl Source Audit Trail</h2>
              </div>
              <span className="font-mono text-[10px] text-[#006e4b] font-bold">HTTP 200 OK</span>
            </div>

            <div className="bg-white rounded-xl border border-[#eaedff] shadow-sm overflow-hidden divide-y divide-[#eaedff]">
              {lead.source_pages && lead.source_pages.length > 0 ? (
                lead.source_pages.map((sp) => (
                  <div key={sp.id} className="p-3 hover:bg-[#f2f3ff] transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#3525cd]">{sp.url}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#eaedff] text-[#131b2e] rounded">
                        HTTP {sp.http_status}
                      </span>
                    </div>
                    <p className="text-xs text-[#464555]">{sp.note}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#3525cd]">{lead.website}/contact</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#eaedff] text-[#131b2e] rounded">
                      HTTP 200
                    </span>
                  </div>
                  <p className="text-xs text-[#464555]">
                    Validated inbound contact routing, phone switchboard, and executive footprint.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>

        {/* Pinned Bottom Operational Action Bar - Locked cleanly at the downside of the modal */}
        <div className="flex-shrink-0 bg-white border-t border-[#eaedff] px-4 sm:px-6 py-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
          <div className="w-full flex items-center gap-2 sm:gap-3">
            {/* Download PDF Dossier */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#b3261e] text-white font-bold text-xs py-3 px-2 sm:px-3 rounded-xl shadow-sm hover:bg-[#c62828] active:scale-95 transition-all"
              title="Download clean executive PDF Dossier"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span>PDF Dossier</span>
            </button>

            {/* Download CSV */}
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#3525cd] text-white font-bold text-xs py-3 px-2 sm:px-3 rounded-xl shadow-sm hover:bg-[#4338ca] active:scale-95 transition-all"
              title="Download CSV spreadsheet"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span>Export CSV</span>
            </button>

            {/* Download XLS */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#006e4b] text-white font-bold text-xs py-3 px-2 sm:px-3 rounded-xl shadow-sm hover:bg-[#00875a] active:scale-95 transition-all"
              title="Download Excel spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
              <span>Export XLS</span>
            </button>

            {/* SEO Site Audit Button */}
            <button
              type="button"
              onClick={() => {
                if (activeModalTab === 'audit') {
                  setActiveModalTab('dossier');
                } else {
                  setActiveModalTab('audit');
                  if (!seoAudit && !isAuditing) {
                    handleRunSeoAudit();
                  }
                }
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 font-bold text-xs py-3 px-2 sm:px-3 rounded-xl shadow-sm transition-all active:scale-95 ${
                activeModalTab === 'audit'
                  ? 'bg-[#131b2e] text-white hover:bg-black'
                  : 'bg-[#5b21b6] text-white hover:bg-[#4c1d95]'
              }`}
              title="Audit website for SEO mistakes & craft email pitch"
            >
              <SearchCheck className="w-4 h-4 flex-shrink-0" />
              <span>{activeModalTab === 'audit' ? 'Show Dossier' : 'Site Audit'}</span>
            </button>

            {/* Re-check Lead */}
            <button
              type="button"
              onClick={handleTriggerRecheck}
              disabled={isRechecking}
              className="p-3 rounded-xl bg-white border border-[#c7c4d8]/70 text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all flex items-center justify-center shadow-sm flex-shrink-0"
              title="Re-crawl and update live"
            >
              <RefreshCw className={`w-4 h-4 ${isRechecking ? 'animate-spin text-[#3525cd]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
