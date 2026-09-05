import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { crawlWebsiteForLeads, normalizeTargetUrl } from './server/crawler.js';
import { auditWebsite } from './server/seoAuditor.js';
import { generateSEOInsightsAndPitch } from './server/gemini.js';
import { ScrapingJob } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', engine: 'LeadPulse AI v2.4', timestamp: new Date().toISOString() });
  });

  // Dashboard Stats
  app.get('/api/stats', (req, res) => {
    try {
      const stats = db.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Leads Collection (Search, Filter, List)
  app.get('/api/leads', (req, res) => {
    try {
      const { q, filter } = req.query;
      const leads = db.getAllLeads(q as string, filter as string);
      res.json({ leads, total: leads.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Single Lead Detail
  app.get('/api/leads/:id', (req, res) => {
    try {
      const lead = db.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      res.json(lead);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Lead
  app.put('/api/leads/:id', (req, res) => {
    try {
      const existing = db.getLeadById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      const updated = db.saveLead({ ...existing, ...req.body });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Lead
  app.delete('/api/leads/:id', (req, res) => {
    try {
      const success = db.deleteLead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Batch Delete Leads
  app.post('/api/leads/batch-delete', (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids array required' });
      }
      const deletedCount = db.deleteBatchLeads(ids);
      res.json({ success: true, count: deletedCount });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Single Extraction Endpoint (Crawl Website)
  app.post('/api/crawl', async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Valid website URL is required.' });
    }

    // Check credits balance (1 credit required)
    const creditAccount = db.getCreditAccount();
    if (creditAccount.balance < 1) {
      return res.status(402).json({
        error: 'Insufficient credits. You need at least 1 credit to crawl a website. Please refill your credits.',
        code: 'INSUFFICIENT_CREDITS',
        account: creditAccount,
      });
    }

    const settings = db.getSettings();
    const { cleanDomain, rootUrl } = normalizeTargetUrl(url);

    // Create a job entry
    const jobId = `${Date.now()}`;
    const job: ScrapingJob = {
      id: jobId,
      url: rootUrl,
      domain: cleanDomain,
      status: 'processing',
      pages_crawled: 0,
      max_pages: settings.max_pages_per_website,
      crawl_depth: settings.max_crawl_depth,
      progress_percent: 10,
      current_subpath: '/',
      duration_seconds: 0,
      started_at: new Date().toISOString(),
      discovered_counts: { emails: 0, phones: 0, socials: 0 },
    };
    db.addJob(job);

    try {
      const result = await crawlWebsiteForLeads(url, settings, (step, percent, subpath) => {
        db.updateJob(jobId, {
          progress_percent: percent,
          current_subpath: subpath,
        });
      });

      const savedLead = db.saveLead(result.lead);

      let emailsCount = 0;
      if (savedLead.email && savedLead.email !== 'Not Found') emailsCount++;
      let phonesCount = 0;
      if (savedLead.phone && savedLead.phone !== 'Not Found') phonesCount++;
      const socialsCount = [
        savedLead.linkedin,
        savedLead.twitter,
        savedLead.facebook,
        savedLead.instagram,
        savedLead.youtube,
      ].filter((s) => s && s !== 'Not Found').length;

      db.updateJob(jobId, {
        status: result.error ? 'failed' : 'completed',
        pages_crawled: savedLead.pages_crawled,
        progress_percent: 100,
        duration_seconds: result.durationSeconds,
        completed_at: new Date().toISOString(),
        error_message: result.error,
        lead_id: savedLead.id,
        discovered_counts: {
          emails: emailsCount,
          phones: phonesCount,
          socials: socialsCount,
        },
      });

      // Deduct 1 credit for lead extraction
      db.deductCredits(1, `Extracted verified lead: ${savedLead.business_name || cleanDomain}`, cleanDomain);

      res.json({
        success: true,
        lead: savedLead,
        durationSeconds: result.durationSeconds,
        error: result.error,
        credits: db.getCreditAccount(),
      });
    } catch (err: any) {
      db.updateJob(jobId, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: err.message || 'Scraping engine timeout',
      });
      res.status(500).json({ error: err.message || 'Failed to crawl website.' });
    }
  });

  // Re-check single lead
  app.post('/api/leads/:id/recheck', async (req, res) => {
    try {
      const existing = db.getLeadById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      // Check credits balance (1 credit required)
      const creditAccount = db.getCreditAccount();
      if (creditAccount.balance < 1) {
        return res.status(402).json({
          error: 'Insufficient credits to re-verify lead. Please refill your balance.',
          code: 'INSUFFICIENT_CREDITS',
          account: creditAccount,
        });
      }

      const settings = db.getSettings();
      const result = await crawlWebsiteForLeads(existing.website, settings);

      // Preserve ID and creation date
      const updatedLead = db.saveLead({
        ...result.lead,
        id: existing.id,
        created_at: existing.created_at,
        updated_at: new Date().toISOString(),
      });

      // Deduct 1 credit for re-check
      db.deductCredits(1, `Live lead re-verification: ${updatedLead.business_name}`, updatedLead.website);

      res.json({
        success: true,
        lead: updatedLead,
        durationSeconds: result.durationSeconds,
        message: 'Lead re-verification complete',
        credits: db.getCreditAccount(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to re-check lead.' });
    }
  });

  // Bulk Extraction Endpoint
  app.post('/api/crawl/bulk', async (req, res) => {
    const { urls, max_depth, max_pages, respect_robots } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Array of URLs is required.' });
    }

    const validUrls = urls.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean);
    const requiredCredits = validUrls.length;

    // Check credits balance for bulk batch
    const creditAccount = db.getCreditAccount();
    if (creditAccount.balance < requiredCredits) {
      return res.status(402).json({
        error: `Insufficient credits. Bulk crawling ${requiredCredits} URLs requires ${requiredCredits} credits, but you have ${creditAccount.balance}. Please refill your credits.`,
        code: 'INSUFFICIENT_CREDITS',
        account: creditAccount,
      });
    }

    // Deduct credits for bulk batch
    db.deductCredits(requiredCredits, `Bulk crawl queue initiated for ${requiredCredits} domains`);

    const settings = {
      ...db.getSettings(),
      ...(max_depth ? { max_crawl_depth: Number(max_depth) } : {}),
      ...(max_pages ? { max_pages_per_website: Number(max_pages) } : {}),
      ...(respect_robots !== undefined ? { respect_robots_txt: Boolean(respect_robots) } : {}),
    };

    const queuedJobs: ScrapingJob[] = [];

    for (let i = 0; i < urls.length; i++) {
      const raw = urls[i].trim();
      if (!raw) continue;
      const { cleanDomain, rootUrl } = normalizeTargetUrl(raw);
      const jobId = `${Date.now() + i}`;

      const job: ScrapingJob = {
        id: jobId,
        url: rootUrl,
        domain: cleanDomain,
        status: i === 0 ? 'processing' : 'pending',
        pages_crawled: 0,
        max_pages: settings.max_pages_per_website,
        crawl_depth: settings.max_crawl_depth,
        progress_percent: 0,
        current_subpath: '/',
        duration_seconds: 0,
        started_at: new Date().toISOString(),
        discovered_counts: { emails: 0, phones: 0, socials: 0 },
      };
      db.addJob(job);
      queuedJobs.push(job);
    }

    // Process queued domains asynchronously in polite queue
    (async () => {
      for (const job of queuedJobs) {
        db.updateJob(job.id, { status: 'processing', progress_percent: 25 });
        try {
          const result = await crawlWebsiteForLeads(job.url, settings);
          const savedLead = db.saveLead(result.lead);
          let emailsCount = 0;
          if (savedLead.email && savedLead.email !== 'Not Found') emailsCount++;
          let phonesCount = 0;
          if (savedLead.phone && savedLead.phone !== 'Not Found') phonesCount++;
          const socialsCount = [
            savedLead.linkedin,
            savedLead.twitter,
            savedLead.facebook,
            savedLead.instagram,
          ].filter((s) => s && s !== 'Not Found').length;

          db.updateJob(job.id, {
            status: result.error ? 'failed' : 'completed',
            pages_crawled: savedLead.pages_crawled,
            progress_percent: 100,
            duration_seconds: result.durationSeconds,
            completed_at: new Date().toISOString(),
            error_message: result.error,
            lead_id: savedLead.id,
            discovered_counts: {
              emails: emailsCount,
              phones: phonesCount,
              socials: socialsCount,
            },
          });
        } catch (err: any) {
          db.updateJob(job.id, {
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: err.message || 'Worker access restricted',
          });
        }
        // Polite worker delay between domains
        await new Promise((r) => setTimeout(r, settings.request_delay_ms || 500));
      }
    })();

    res.json({
      success: true,
      message: `Queued ${queuedJobs.length} domains for extraction.`,
      jobs: queuedJobs,
    });
  });

  // Get Scraping Jobs
  app.get('/api/jobs', (req, res) => {
    res.json(db.getJobs());
  });

  // Retry Job
  app.post('/api/jobs/:id/retry', async (req, res) => {
    const jobs = db.getJobs();
    const target = jobs.find((j) => j.id === req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'Job not found' });
    }

    db.updateJob(target.id, {
      status: 'processing',
      progress_percent: 20,
      error_message: undefined,
    });

    try {
      const settings = db.getSettings();
      const result = await crawlWebsiteForLeads(target.url, settings);
      const savedLead = db.saveLead(result.lead);

      db.updateJob(target.id, {
        status: result.error ? 'failed' : 'completed',
        pages_crawled: savedLead.pages_crawled,
        progress_percent: 100,
        duration_seconds: result.durationSeconds,
        completed_at: new Date().toISOString(),
        error_message: result.error,
        lead_id: savedLead.id,
      });

      res.json({ success: true, job: target, lead: savedLead });
    } catch (err: any) {
      db.updateJob(target.id, {
        status: 'failed',
        error_message: err.message,
      });
      res.status(500).json({ error: err.message });
    }
  });

  // Clear Finished Jobs
  app.post('/api/jobs/clear', (req, res) => {
    db.clearCompletedJobs();
    res.json({ success: true });
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    res.json(db.getSettings());
  });

  app.post('/api/settings', (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // CSV Export Route
  app.get('/api/export/csv', (req, res) => {
    try {
      const { ids } = req.query;
      let leads = db.getAllLeads();
      if (ids && typeof ids === 'string') {
        const idSet = new Set(ids.split(','));
        leads = leads.filter((l) => idSet.has(l.id));
      }

      const headers = [
        'Business Name',
        'Category',
        'Website',
        'Email',
        'Email Status',
        'Phone',
        'Phone Status',
        'Address',
        'City',
        'State',
        'Country',
        'Postal Code',
        'Contact Person',
        'Facebook',
        'Instagram',
        'LinkedIn',
        'YouTube',
        'X/Twitter',
        'TikTok',
        'Verification Status',
        'Confidence Score',
        'Pages Crawled',
        'Last Checked',
      ];

      const rows = leads.map((l) => [
        `"${(l.business_name || '').replace(/"/g, '""')}"`,
        `"${(l.category || '').replace(/"/g, '""')}"`,
        `"${(l.website || '').replace(/"/g, '""')}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${l.email_status || ''}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${l.phone_status || ''}"`,
        `"${(l.address || '').replace(/"/g, '""')}"`,
        `"${(l.city || '').replace(/"/g, '""')}"`,
        `"${(l.state || '').replace(/"/g, '""')}"`,
        `"${(l.country || '').replace(/"/g, '""')}"`,
        `"${(l.postal_code || '').replace(/"/g, '""')}"`,
        `"${(l.contact_person || '').replace(/"/g, '""')}"`,
        `"${(l.facebook || '').replace(/"/g, '""')}"`,
        `"${(l.instagram || '').replace(/"/g, '""')}"`,
        `"${(l.linkedin || '').replace(/"/g, '""')}"`,
        `"${(l.youtube || '').replace(/"/g, '""')}"`,
        `"${(l.twitter || '').replace(/"/g, '""')}"`,
        `"${(l.tiktok || '').replace(/"/g, '""')}"`,
        `"${l.verification_status || ''}"`,
        l.confidence_score,
        l.pages_crawled,
        `"${l.last_checked || ''}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="LeadPulse_Leads_${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csvContent);
    } catch (err: any) {
      res.status(500).send('Export failed');
    }
  });

  // Excel Export Route (Formatted TSV for native spreadsheet import with UTF-8 BOM)
  app.get('/api/export/excel', (req, res) => {
    try {
      const { ids } = req.query;
      let leads = db.getAllLeads();
      if (ids && typeof ids === 'string') {
        const idSet = new Set(ids.split(','));
        leads = leads.filter((l) => idSet.has(l.id));
      }

      const headers = [
        'Business Name',
        'Category',
        'Website',
        'Email',
        'Email Status',
        'Phone',
        'Address',
        'City',
        'Country',
        'Contact Person',
        'LinkedIn',
        'X/Twitter',
        'Verification Status',
        'Confidence Score',
        'Pages Crawled',
        'Last Checked',
      ];

      const rows = leads.map((l) => [
        (l.business_name || '').replace(/\t/g, ' '),
        (l.category || '').replace(/\t/g, ' '),
        (l.website || '').replace(/\t/g, ' '),
        (l.email || '').replace(/\t/g, ' '),
        (l.email_status || '').replace(/\t/g, ' '),
        (l.phone || '').replace(/\t/g, ' '),
        (l.address || '').replace(/\t/g, ' '),
        (l.city || '').replace(/\t/g, ' '),
        (l.country || '').replace(/\t/g, ' '),
        (l.contact_person || '').replace(/\t/g, ' '),
        (l.linkedin || '').replace(/\t/g, ' '),
        (l.twitter || '').replace(/\t/g, ' '),
        (l.verification_status || '').replace(/\t/g, ' '),
        l.confidence_score ?? '',
        l.pages_crawled ?? '',
        (l.last_checked || '').replace(/\t/g, ' '),
      ]);

      const tsvContent = '\uFEFF' + [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\r\n');

      res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="LeadPulse_Leads_${new Date().toISOString().slice(0, 10)}.xls"`
      );
      res.send(tsvContent);
    } catch (err: any) {
      res.status(500).send('Excel export failed');
    }
  });

  // JSON Export Route
  app.get('/api/export/json', (req, res) => {
    try {
      const { ids } = req.query;
      let leads = db.getAllLeads();
      if (ids && typeof ids === 'string') {
        const idSet = new Set(ids.split(','));
        leads = leads.filter((l) => idSet.has(l.id));
      }

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="LeadPulse_Leads_${new Date().toISOString().slice(0, 10)}.json"`
      );
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ error: 'JSON export failed' });
    }
  });

  // Audit Log Export Route
  app.get('/api/export/audit-log', (req, res) => {
    try {
      const jobs = db.getJobs();
      const headers = [
        'Job ID',
        'Domain',
        'Target URL',
        'Status',
        'Pages Crawled',
        'Max Pages',
        'Crawl Depth',
        'Duration (Seconds)',
        'Emails Found',
        'Phones Found',
        'Socials Found',
        'Started At',
        'Completed At',
        'Error Note',
      ];
      const rows = jobs.map((j) => [
        `"${j.id}"`,
        `"${(j.domain || '').replace(/"/g, '""')}"`,
        `"${(j.url || '').replace(/"/g, '""')}"`,
        `"${j.status}"`,
        j.pages_crawled,
        j.max_pages,
        j.crawl_depth,
        j.duration_seconds,
        j.discovered_counts?.emails ?? 0,
        j.discovered_counts?.phones ?? 0,
        j.discovered_counts?.socials ?? 0,
        `"${j.started_at || ''}"`,
        `"${j.completed_at || ''}"`,
        `"${(j.error_message || j.compliance_note || '').replace(/"/g, '""')}"`,
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="LeadPulse_AuditLog_${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csvContent);
    } catch (err: any) {
      res.status(500).send('Audit log export failed');
    }
  });

  // --- Technical SEO Optimizer & Site Audit Endpoints ---

  // Trigger SEO Site Audit
  app.post('/api/audit', async (req, res) => {
    try {
      const { url, leadId, businessName, email, tone } = req.body;
      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({ error: 'Valid website URL is required for site audit.' });
      }

      // Check credits balance for SEO site audit (2 credits required)
      const creditAccount = db.getCreditAccount();
      if (creditAccount.balance < 2) {
        return res.status(402).json({
          error: 'Insufficient credits. Running an in-depth technical SEO site audit requires 2 credits. Please refill your balance.',
          code: 'INSUFFICIENT_CREDITS',
          account: creditAccount,
        });
      }

      // If leadId was passed, enrich target meta from database
      let targetMeta = {
        leadId,
        businessName,
        email,
      };

      if (leadId) {
        const lead = db.getLeadById(leadId);
        if (lead) {
          targetMeta = {
            leadId: lead.id,
            businessName: lead.business_name || businessName,
            email: lead.email && lead.email !== 'Not Found' ? lead.email : email,
          };
        }
      } else {
        const lead = db.getLeadByWebsite(url);
        if (lead) {
          targetMeta = {
            leadId: lead.id,
            businessName: lead.business_name,
            email: lead.email && lead.email !== 'Not Found' ? lead.email : email,
          };
        }
      }

      const audit = await auditWebsite(url.trim(), targetMeta);

      // Persist audit in database
      db.saveAudit(audit);

      // Deduct 2 credits for full SEO audit
      db.deductCredits(2, `Technical SEO site audit for ${audit.domain}`, audit.domain);

      res.json({
        success: true,
        audit,
        credits: db.getCreditAccount(),
      });
    } catch (err: any) {
      console.error('[API /api/audit error]:', err);
      res.status(500).json({ error: err.message || 'Site audit failed' });
    }
  });

  // Get SEO Audit by domain or leadId
  app.get('/api/audit', (req, res) => {
    try {
      const { domain, leadId, url } = req.query;
      const key = (leadId || domain || url) as string;

      if (key) {
        const audit = db.getAudit(key);
        if (!audit) {
          return res.status(404).json({ error: 'No audit report found for target.' });
        }
        return res.json({ success: true, audit });
      }

      const allAudits = db.getAllAudits();
      res.json({ success: true, audits: allAudits });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Generate / Regenerate AI SEO Outreach Pitch Email
  app.post('/api/audit/pitch', async (req, res) => {
    try {
      const { domain, businessName, overallScore, grade, mistakes, tone } = req.body;
      if (!domain) {
        return res.status(400).json({ error: 'Domain is required to generate pitch.' });
      }

      const aiPitch = await generateSEOInsightsAndPitch({
        domain,
        businessName: businessName || domain,
        overallScore: overallScore || 70,
        grade: grade || 'B',
        mistakes: mistakes || [],
        tone: tone || 'professional',
      });

      if (aiPitch) {
        return res.json({ success: true, pitch: aiPitch });
      }

      // Fallback
      res.json({
        success: true,
        pitch: {
          recommendations: [
            'Fix high-impact critical meta and header mistakes to preserve rank.',
            'Incorporate structured schema data for rich search features.',
            'Optimize mobile viewport and page speed metrics.',
          ],
          emailSubject: `SEO Opportunity Notice for ${domain}: Critical Fixes Recommended`,
          emailBody: `Hi ${businessName || domain} Team,\n\nWe ran an automated SEO optimizer scan on ${domain} and detected several key mistakes impacting your Google search ranking.\n\nKey issues detected:\n${(mistakes || []).slice(0, 3).map((m: any) => `• ${m.title}: ${m.recommendedFix}`).join('\n')}\n\nLet's schedule a brief 10-minute walkthrough to review how fixing these can increase your organic search inquiries.\n\nBest regards,\nSEO Growth Team`,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Credits & Billing API Endpoints ---
  app.get('/api/credits', (req, res) => {
    try {
      const account = db.getCreditAccount();
      res.json({ success: true, account });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/credits/refill', (req, res) => {
    try {
      const { amount, reason, plan_tier } = req.body;
      const num = Number(amount) || 100;
      const account = db.addCredits(
        num,
        reason || `Credit Refill (+${num} Credits)`,
        plan_tier
      );
      res.json({ success: true, account, message: `Successfully added ${num} credits!` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/credits/daily-bonus', (req, res) => {
    try {
      const result = db.claimDailyBonus();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/credits/deduct', (req, res) => {
    try {
      const { amount, reason, target } = req.body;
      const result = db.deductCredits(Number(amount) || 1, reason || 'Manual operation', target);
      if (!result.success) {
        return res.status(402).json({ error: result.message, code: 'INSUFFICIENT_CREDITS', account: result.account });
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Admin Security & Auth Gate ---
  // The secret passcode for master admin access
  let currentAdminPasscode = 'admin123';

  app.post('/api/admin/auth/verify', (req, res) => {
    try {
      const { passcode } = req.body;
      if (!passcode) {
        return res.status(400).json({ error: 'Passcode is required.' });
      }
      if (passcode.trim() === currentAdminPasscode) {
        return res.json({
          success: true,
          token: `adm-token-${Date.now()}`,
          message: 'Admin access authorized.',
        });
      }
      return res.status(401).json({ error: 'Invalid admin credentials or passcode.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/auth/change-passcode', (req, res) => {
    try {
      const { currentCode, newCode } = req.body;
      if (currentCode !== currentAdminPasscode) {
        return res.status(401).json({ error: 'Current passcode is incorrect.' });
      }
      if (!newCode || newCode.length < 4) {
        return res.status(400).json({ error: 'New passcode must be at least 4 characters.' });
      }
      currentAdminPasscode = newCode.trim();
      res.json({ success: true, message: 'Admin passcode updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Payment Methods API ---
  app.get('/api/payment-methods', (req, res) => {
    try {
      // Returns active payment methods for regular users
      const methods = db.getPaymentMethods(true);
      res.json({ success: true, methods });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/payment-methods', (req, res) => {
    try {
      // Admin gets all methods including inactive ones
      const methods = db.getPaymentMethods(false);
      res.json({ success: true, methods });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/payment-methods', (req, res) => {
    try {
      const { name, account_title, account_number, instructions, is_active } = req.body;
      if (!name || !account_number) {
        return res.status(400).json({ error: 'Method name and account number are required.' });
      }
      const created = db.addPaymentMethod({
        name: name.trim(),
        account_title: (account_title || '').trim(),
        account_number: account_number.trim(),
        instructions: (instructions || '').trim(),
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      });
      res.json({ success: true, method: created });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/payment-methods/:id', (req, res) => {
    try {
      const updated = db.updatePaymentMethod(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Payment method not found.' });
      }
      res.json({ success: true, method: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/payment-methods/:id', (req, res) => {
    try {
      const deleted = db.deletePaymentMethod(req.params.id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Credit Purchase Requests (User Orders & Admin Approval) ---
  app.post('/api/credits/order', (req, res) => {
    try {
      const {
        user_name,
        user_email,
        amount_credits,
        payment_method_id,
        payment_method_name,
        transaction_id,
        sender_account,
        notes,
        amount_paid,
      } = req.body;

      if (!user_name || !user_email || !amount_credits || !transaction_id) {
        return res.status(400).json({
          error: 'Please provide user name, email, credits package, and transaction/payment reference ID.',
        });
      }

      const order = db.createPurchaseRequest({
        user_id: req.body.user_id || 'user-client-1',
        user_name: user_name.trim(),
        user_email: user_email.trim(),
        amount_credits: Number(amount_credits) || 100,
        payment_method_id: payment_method_id || 'manual',
        payment_method_name: payment_method_name || 'Bank/Mobile Transfer',
        transaction_id: transaction_id.trim(),
        sender_account: sender_account?.trim(),
        notes: notes?.trim(),
        amount_paid: amount_paid || 'Pending Verification',
      });

      res.json({
        success: true,
        order,
        message: 'Your payment proof has been submitted! Admin will verify and assign your credits promptly.',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/credits/my-orders', (req, res) => {
    try {
      const email = (req.query.email as string) || 'client@leadpulse.ai';
      const orders = db.getUserPurchaseRequests(email);
      res.json({ success: true, orders });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/orders', (req, res) => {
    try {
      const orders = db.getPurchaseRequests();
      res.json({ success: true, orders });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/orders/:id/approve', (req, res) => {
    try {
      const { credits_granted, admin_notes } = req.body;
      const result = db.approvePurchaseRequest(
        req.params.id,
        Number(credits_granted),
        admin_notes
      );
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/orders/:id/reject', (req, res) => {
    try {
      const { admin_notes } = req.body;
      const result = db.rejectPurchaseRequest(req.params.id, admin_notes);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Admin Users & Direct Credit Control ---
  app.get('/api/admin/users', (req, res) => {
    try {
      const users = db.getUsers();
      res.json({ success: true, users });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/users/:id/credits', (req, res) => {
    try {
      const { credits, reason, mode } = req.body;
      if (mode === 'adjust') {
        const delta = Number(credits) || 0;
        const result = db.adjustUserCredits(
          req.params.id,
          delta,
          reason || 'Admin manual adjustment'
        );
        return res.json(result);
      } else {
        const setAmount = Math.max(0, Number(credits) || 0);
        const result = db.setUserCredits(
          req.params.id,
          setAmount,
          reason || 'Admin set balance'
        );
        return res.json(result);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/users/:id/status', (req, res) => {
    try {
      const { status } = req.body;
      const ok = db.updateUserStatus(req.params.id, status === 'suspended' ? 'suspended' : 'active');
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- CMS Blog Posts & Categories API ---
  app.get('/api/categories', (req, res) => {
    try {
      const categories = db.getCategories();
      res.json({ success: true, categories });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/categories', (req, res) => {
    try {
      const { name, slug, description, color } = req.body;
      if (!name) return res.status(400).json({ error: 'Category name is required.' });
      const created = db.addCategory({ name, slug, description, color });
      res.json({ success: true, category: created });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/categories/:id', (req, res) => {
    try {
      const updated = db.updateCategory(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Category not found.' });
      res.json({ success: true, category: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/categories/:id', (req, res) => {
    try {
      const ok = db.deleteCategory(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/blogs', (req, res) => {
    try {
      const all = req.query.all === 'true';
      const posts = db.getBlogPosts(!all);
      res.json({ success: true, posts });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/blogs/:slug', (req, res) => {
    try {
      const post = db.getBlogPostBySlug(req.params.slug);
      if (!post) return res.status(404).json({ error: 'Blog post not found.' });
      db.incrementBlogPostViews(req.params.slug);
      res.json({ success: true, post });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/blogs', (req, res) => {
    try {
      const { title, slug, category_id, category_name, excerpt, content, featured_image, author, read_time, status } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
      }
      const created = db.addBlogPost({
        title: title.trim(),
        slug: slug?.trim(),
        category_id: category_id || 'cat-1',
        category_name: category_name || 'General SEO',
        excerpt: excerpt?.trim() || title.slice(0, 140),
        content: content.trim(),
        featured_image: featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        author: author?.trim() || 'LeadPulse Editorial',
        read_time: read_time || '5 min read',
        status: status || 'published',
      });
      res.json({ success: true, post: created });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/blogs/:id', (req, res) => {
    try {
      const updated = db.updateBlogPost(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Post not found.' });
      res.json({ success: true, post: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/blogs/:id', (req, res) => {
    try {
      const ok = db.deleteBlogPost(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- CMS Custom Pages API ---
  app.get('/api/pages', (req, res) => {
    try {
      const all = req.query.all === 'true';
      const pages = db.getPages(!all);
      res.json({ success: true, pages });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/pages/:slug', (req, res) => {
    try {
      const page = db.getPageBySlug(req.params.slug);
      if (!page) return res.status(404).json({ error: 'Page not found.' });
      res.json({ success: true, page });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/pages', (req, res) => {
    try {
      const { title, slug, content, meta_description, is_published } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
      }
      const created = db.addPage({
        title: title.trim(),
        slug: slug?.trim(),
        content: content.trim(),
        meta_description: meta_description?.trim() || '',
        is_published: is_published !== undefined ? Boolean(is_published) : true,
      });
      res.json({ success: true, page: created });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/pages/:id', (req, res) => {
    try {
      const updated = db.updatePage(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Page not found.' });
      res.json({ success: true, page: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/pages/:id', (req, res) => {
    try {
      const ok = db.deletePage(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeadPulse Engine running on port ${PORT}`);
  });
}

startServer();
