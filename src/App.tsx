import React, { useState, useEffect, useCallback } from 'react';
import { Lead, ScrapingJob, ScraperSettings, DashboardStats, ActiveTab, CreditAccount } from './types.js';
import { Header } from './components/Header.js';
import { Navbar } from './components/Navbar.js';
import { Toast } from './components/Toast.js';
import { DashboardView } from './components/DashboardView.js';
import { LeadsView } from './components/LeadsView.js';
import { BulkScraperView } from './components/BulkScraperView.js';
import { HistoryView } from './components/HistoryView.js';
import { SettingsView } from './components/SettingsView.js';
import { LeadDetailModal } from './components/LeadDetailModal.js';
import { ExportModal } from './components/ExportModal.js';
import { SiteAuditView } from './components/SiteAuditView.js';
import { CreditsModal } from './components/CreditsModal.js';
import { LandingPage } from './components/LandingPage.js';
import { BlogView } from './components/BlogView.js';
import { CustomPageView } from './components/CustomPageView.js';
import { AdminPortal } from './components/AdminPortal.js';
import { BuyCreditsModal } from './components/BuyCreditsModal.js';
import {
  generateLeadsCsv,
  generateLeadsTsv,
  generateAuditLogCsv,
  exportSingleLeadPdf,
  exportLeadsTablePdf,
  downloadFile,
} from './utils/exportUtils.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [activePageSlug, setActivePageSlug] = useState<string>('about-us');
  const [auditTargetDomain, setAuditTargetDomain] = useState<string | undefined>(undefined);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_leads: 0,
    emails_found: 0,
    phone_lines_found: 0,
    social_profiles_found: 0,
    average_confidence: 0,
    verified_percentage: 0,
    recent_leads_growth: '+12% this week',
  });
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [settings, setSettings] = useState<ScraperSettings>({
    max_pages_per_website: 25,
    max_crawl_depth: 2,
    request_delay_ms: 600,
    timeout_seconds: 12,
    respect_robots_txt: true,
    ai_validation: 'Strict',
    export_preferences: {
      default_format: 'csv',
      include_audit_trail: true,
    },
    duplicate_handling: 'update',
    confidence_threshold: 70,
  });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [auditTargetLead, setAuditTargetLead] = useState<Lead | null>(null);
  const [creditAccount, setCreditAccount] = useState<CreditAccount | null>(null);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState({
    percent: 0,
    step: '',
    subpath: '',
    pages: 0,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [leadsRes, statsRes, jobsRes, settingsRes, creditsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/stats'),
        fetch('/api/jobs'),
        fetch('/api/settings'),
        fetch('/api/credits'),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data || []);
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
      }
      if (creditsRes.ok) {
        const data = await creditsRes.json();
        setCreditAccount(data.account || null);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  // Refill credits handler
  const handleRefillCredits = async (
    amount: number,
    reason: string,
    plan_tier?: CreditAccount['plan_tier']
  ) => {
    try {
      const res = await fetch('/api/credits/refill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason, plan_tier }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to refill credits');
      }
      setCreditAccount(data.account);
      showToast(`Added ${amount} credits! Balance: ${data.account.balance}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error refilling credits', 'error');
      throw err;
    }
  };

  // Claim daily bonus handler
  const handleClaimDailyBonus = async () => {
    try {
      const res = await fetch('/api/credits/daily-bonus', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Daily bonus already claimed today');
      }
      setCreditAccount(data.account);
      showToast(data.message || 'Daily free bonus credits claimed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Daily bonus not available', 'info');
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Periodic polling for active background jobs
  useEffect(() => {
    const hasActiveJob = jobs.some((j) => j.status === 'processing' || j.status === 'pending');
    if (!hasActiveJob) return;

    const interval = setInterval(async () => {
      try {
        const [jobsRes, leadsRes, statsRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/leads'),
          fetch('/api/stats'),
        ]);
        if (jobsRes.ok) {
          const data = await jobsRes.json();
          setJobs(data || []);
        }
        if (leadsRes.ok) {
          const data = await leadsRes.json();
          setLeads(data.leads || []);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
      } catch (e) {
        // silent background poll error
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs]);

  // Handle single website extraction
  const handleExtractLead = async (url: string) => {
    setIsScraping(true);
    setScrapingProgress({
      percent: 15,
      step: 'Initializing polite crawler & RFC handshake...',
      subpath: '/',
      pages: 1,
    });

    // Simulated progress tick while backend processes
    const tickInterval = setInterval(() => {
      setScrapingProgress((prev) => {
        if (prev.percent >= 85) return prev;
        const next = prev.percent + Math.floor(Math.random() * 12) + 5;
        const step =
          next < 35
            ? 'Crawling /about and /contact routes...'
            : next < 60
            ? 'Extracting mailto anchors and telephone lines...'
            : next < 80
            ? 'Scanning social profiles & deduplicating...'
            : 'AI heuristic confidence evaluation...';
        const subpath = next < 35 ? '/about' : next < 60 ? '/contact' : '/team';
        return {
          percent: Math.min(85, next),
          step,
          subpath,
          pages: Math.min(18, Math.floor(next / 4)),
        };
      });
    }, 600);

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      clearInterval(tickInterval);
      setScrapingProgress({
        percent: 100,
        step: 'Lead verification complete.',
        subpath: '/done',
        pages: 18,
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402 || data.code === 'INSUFFICIENT_CREDITS') {
          setCreditsModalOpen(true);
        }
        throw new Error(data.error || 'Failed to crawl website');
      }

      if (data.credits) {
        setCreditAccount(data.credits);
      }

      if (data.lead) {
        // Update local state
        setLeads((prev) => {
          const filtered = prev.filter((l) => l.id !== data.lead.id);
          return [data.lead, ...filtered];
        });
        showToast(
          data.error
            ? `Extraction finished: ${data.error}`
            : `Extracted ${data.lead.business_name} (${data.lead.confidence_score}% Confidence)`,
          data.error ? 'info' : 'success'
        );
      }

      // Refresh telemetry stats and jobs
      fetchData();
    } catch (err: any) {
      clearInterval(tickInterval);
      showToast(err.message || 'Error occurred during extraction', 'error');
    } finally {
      setTimeout(() => {
        setIsScraping(false);
      }, 700);
    }
  };

  // Handle re-checking lead
  const handleRecheckLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/recheck`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402 || data.code === 'INSUFFICIENT_CREDITS') {
          setCreditsModalOpen(true);
        }
        throw new Error(data.error || 'Re-check failed');
      }
      if (data.credits) {
        setCreditAccount(data.credits);
      }
      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
        if (selectedLead?.id === leadId) {
          setSelectedLead(data.lead);
        }
        fetchData();
      }
    } catch (err) {
      console.error('Re-check failed:', err);
      throw err;
    }
  };

  // Delete lead
  const handleDeleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (selectedLead?.id === id) {
          setSelectedLead(null);
        }
        showToast('Lead removed from directory');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to delete lead', 'error');
    }
  };

  // Batch delete leads
  const handleBatchDelete = async (ids: string[]) => {
    try {
      const res = await fetch('/api/leads/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
        fetchData();
      }
    } catch (err) {
      showToast('Batch delete failed', 'error');
    }
  };

  // Queue bulk extraction
  const handleQueueBulk = async (
    urls: string[],
    depth: number,
    pages: number,
    respectRobots: boolean
  ) => {
    const res = await fetch('/api/crawl/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urls,
        max_depth: depth,
        max_pages: pages,
        respect_robots: respectRobots,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 402 || data.code === 'INSUFFICIENT_CREDITS') {
        setCreditsModalOpen(true);
      }
      throw new Error(data.error || 'Bulk queue failed');
    }
    if (data.credits) {
      setCreditAccount(data.credits);
    }
    if (data.jobs) {
      setJobs((prev) => [...data.jobs, ...prev]);
    }
  };

  // Retry single job
  const handleRetryJob = async (jobId: string) => {
    try {
      showToast('Retrying worker extraction with residential proxy...');
      const res = await fetch(`/api/jobs/${jobId}/retry`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Retried job #${jobId} successfully`);
        fetchData();
      }
    } catch {
      showToast('Retry request failed', 'error');
    }
  };

  // Clear completed jobs
  const handleClearJobs = async () => {
    try {
      const res = await fetch('/api/jobs/clear', { method: 'POST' });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.status === 'processing' || j.status === 'pending'));
        showToast('Cleared completed and failed history jobs.');
      }
    } catch {
      showToast('Failed to clear jobs', 'error');
    }
  };

  // Save settings
  const handleSaveSettings = async (newSettings: ScraperSettings) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    if (!res.ok) {
      throw new Error('Failed to save settings');
    }
    const data = await res.json();
    setSettings(data.settings);
  };

  // Universal Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportPreselectedIds, setExportPreselectedIds] = useState<string[]>([]);
  const [exportDefaultFormat, setExportDefaultFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('csv');

  const handleOpenExportModal = (ids?: string[], format: 'csv' | 'excel' | 'pdf' | 'json' = 'csv') => {
    setExportPreselectedIds(ids || []);
    setExportDefaultFormat(format);
    setExportModalOpen(true);
  };

  // Direct CSV Export
  const handleExportCsv = (ids?: string[]) => {
    let targetLeads = leads;
    if (ids && ids.length > 0) {
      const set = new Set(ids);
      targetLeads = leads.filter((l) => set.has(l.id));
    }

    if (targetLeads.length === 0) {
      showToast('No leads available to export.', 'info');
      return;
    }

    const csvData = generateLeadsCsv(targetLeads);
    const filename = `LeadPulse_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
    const success = downloadFile(csvData, filename, 'text/csv;charset=utf-8');

    if (success) {
      showToast(`Exported ${targetLeads.length} leads as CSV (${filename})!`, 'success');
    } else {
      handleOpenExportModal(ids, 'csv');
      showToast('Export drawer opened with clipboard copy and download options.', 'info');
    }
  };

  // Direct Excel Export
  const handleExportExcel = (ids?: string[]) => {
    let targetLeads = leads;
    if (ids && ids.length > 0) {
      const set = new Set(ids);
      targetLeads = leads.filter((l) => set.has(l.id));
    }

    if (targetLeads.length === 0) {
      showToast('No leads available to export.', 'info');
      return;
    }

    const tsvData = generateLeadsTsv(targetLeads);
    const filename = `LeadPulse_Leads_${new Date().toISOString().slice(0, 10)}.xls`;
    const success = downloadFile(tsvData, filename, 'application/vnd.ms-excel;charset=utf-8');

    if (success) {
      showToast(`Exported ${targetLeads.length} leads as Excel spreadsheet (${filename})!`, 'success');
    } else {
      handleOpenExportModal(ids, 'excel');
      showToast('Export drawer opened with clipboard copy and download options.', 'info');
    }
  };

  // Direct PDF Export
  const handleExportPdf = (ids?: string[]) => {
    let targetLeads = leads;
    if (ids && ids.length > 0) {
      const set = new Set(ids);
      targetLeads = leads.filter((l) => set.has(l.id));
    }

    if (targetLeads.length === 0) {
      showToast('No leads available to export.', 'info');
      return;
    }

    if (targetLeads.length === 1) {
      exportSingleLeadPdf(targetLeads[0]);
    } else {
      exportLeadsTablePdf(targetLeads, 'LeadPulse Business Directory');
    }
    showToast(`Exported ${targetLeads.length} leads as Executive PDF Report!`, 'success');
  };

  // Direct Audit Log Export (for History View)
  const handleExportAuditLog = () => {
    if (jobs.length === 0) {
      showToast('No crawl jobs in audit history to export.', 'info');
      return;
    }
    const csvData = generateAuditLogCsv(jobs);
    const filename = `LeadPulse_AuditLog_${new Date().toISOString().slice(0, 10)}.csv`;
    const success = downloadFile(csvData, filename, 'text/csv;charset=utf-8');
    if (success) {
      showToast(`Exported ${jobs.length} audit log entries as CSV!`, 'success');
    } else {
      showToast('Failed to trigger audit log download.', 'error');
    }
  };

  // Export single lead dossier (PDF priority)
  const handleExportSingleLead = (lead: Lead) => {
    const success = exportSingleLeadPdf(lead);
    if (success) {
      showToast(`Exported executive PDF dossier for ${lead.business_name}.`, 'success');
    } else {
      handleOpenExportModal([lead.id], 'pdf');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] font-sans antialiased flex flex-col selection:bg-[#eaedff] selection:text-[#3525cd]">
      {/* Interactive Toast Notifications */}
      <Toast message={toastMessage} type={toastType} />

      {activeTab === 'landing' ? (
        <LandingPage
          onLaunchApp={() => setActiveTab('dashboard')}
          onRunInstantAudit={(domain) => {
            setAuditTargetDomain(domain);
            setActiveTab('audit');
          }}
          onOpenCreditsModal={() => setCreditsModalOpen(true)}
          onNavigateBlog={() => setActiveTab('blog')}
          onNavigatePage={(slug) => {
            setActivePageSlug(slug);
            setActiveTab('page');
          }}
          onOpenAdminGate={() => setActiveTab('admin')}
        />
      ) : activeTab === 'admin' ? (
        <AdminPortal
          onExitAdmin={() => setActiveTab('dashboard')}
          onShowToast={showToast}
        />
      ) : (
        <>
          {/* Global Application Header */}
          <Header
            activeTab={activeTab}
            isScraping={isScraping}
            creditBalance={creditAccount?.balance ?? 250}
            onOpenCredits={() => setCreditsModalOpen(true)}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setSelectedLead(null);
            }}
          />

          {activeTab === 'blog' ? (
            <BlogView
              onNavigateAudit={() => setActiveTab('audit')}
              onNavigateLanding={() => setActiveTab('landing')}
            />
          ) : activeTab === 'page' ? (
            <CustomPageView
              slug={activePageSlug}
              onNavigateHome={() => setActiveTab('landing')}
            />
          ) : (
            /* Main Content Area */
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-20">
              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  latestLead={leads[0] || null}
                  creditBalance={creditAccount?.balance ?? 250}
                  onOpenCredits={() => setCreditsModalOpen(true)}
                  isScraping={isScraping}
                  scrapingProgress={scrapingProgress}
                  onExtractLead={handleExtractLead}
                  onSelectLead={(l) => setSelectedLead(l)}
                  onExportCsv={() => handleExportCsv()}
                  onExportExcel={() => handleExportExcel()}
                  onExportPdf={() => handleExportPdf()}
                  onOpenExportModal={() => handleOpenExportModal()}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'leads' && (
                <LeadsView
                  leads={leads}
                  onSelectLead={(l) => setSelectedLead(l)}
                  onAuditLead={(l) => {
                    setAuditTargetLead(l);
                    setActiveTab('audit');
                  }}
                  onDeleteLead={handleDeleteLead}
                  onBatchDelete={handleBatchDelete}
                  onExportCsv={handleExportCsv}
                  onExportExcel={handleExportExcel}
                  onExportPdf={handleExportPdf}
                  onOpenExportModal={handleOpenExportModal}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'bulk' && (
                <BulkScraperView
                  jobs={jobs}
                  settings={settings}
                  creditBalance={creditAccount?.balance ?? 250}
                  onOpenCredits={() => setCreditsModalOpen(true)}
                  onQueueBulk={handleQueueBulk}
                  onRetryJob={handleRetryJob}
                  onClearJobs={handleClearJobs}
                  onExportCompletedCsv={() => handleOpenExportModal(undefined, 'csv')}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'audit' && (
                <SiteAuditView
                  leads={leads}
                  initialLead={auditTargetLead}
                  initialAuditUrl={auditTargetDomain || auditTargetLead?.website}
                  creditBalance={creditAccount?.balance ?? 250}
                  onOpenCredits={() => setCreditsModalOpen(true)}
                  onCreditsUpdated={(acc) => setCreditAccount(acc)}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'history' && (
                <HistoryView
                  jobs={jobs}
                  onRetryJob={handleRetryJob}
                  onExportCsv={handleExportAuditLog}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  creditAccount={creditAccount}
                  onSaveSettings={handleSaveSettings}
                  onOpenCredits={() => setCreditsModalOpen(true)}
                  onRefillCredits={handleRefillCredits}
                  onClaimDailyBonus={handleClaimDailyBonus}
                  onShowToast={showToast}
                />
              )}
            </main>
          )}

          {/* Responsive Bottom Navigation Bar for Mobile */}
          <Navbar
            activeTab={activeTab}
            totalLeadsCount={leads.length}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setSelectedLead(null);
            }}
          />
        </>
      )}

      {/* Full Dossier Modal View */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onRecheckLead={handleRecheckLead}
          onExportLead={handleExportSingleLead}
          onOpenSiteAudit={(l) => {
            setAuditTargetLead(l);
            setActiveTab('audit');
          }}
          onShowToast={showToast}
        />
      )}

      {/* Universal Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        leads={leads}
        preselectedIds={exportPreselectedIds}
        defaultFormat={exportDefaultFormat}
        onShowToast={showToast}
      />

      {/* Dynamic Payment & User Credit Request Portal */}
      <BuyCreditsModal
        isOpen={creditsModalOpen}
        onClose={() => setCreditsModalOpen(false)}
        creditAccount={creditAccount}
        onClaimDailyBonus={handleClaimDailyBonus}
        onCreditsUpdated={(acc) => setCreditAccount(acc)}
        onShowToast={showToast}
      />
    </div>
  );
}
