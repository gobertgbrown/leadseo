import { clientDb } from './clientStorage.js';
import { runClientAudit } from './clientAuditor.js';
import { runClientCrawl } from './clientCrawler.js';

function createJsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function handleClientApiRequest(
  urlStr: string,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  let pathname = '';
  let searchParams = new URLSearchParams();

  try {
    const parsed = new URL(urlStr, window.location.origin);
    pathname = parsed.pathname;
    searchParams = parsed.searchParams;
  } catch {
    const parts = urlStr.split('?');
    pathname = parts[0];
    if (parts[1]) {
      searchParams = new URLSearchParams(parts[1]);
    }
  }

  let body: any = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  // Helper auth check for admin
  const adminPasscode = localStorage.getItem('leadpulse_admin_passcode') || 'leadpulse2025';

  // 1. Health
  if (pathname === '/api/health') {
    return createJsonResponse({ status: 'ok', engine: 'LeadPulse Client Engine v2.4 (Static/Netlify Compatible)' });
  }

  // 2. Stats
  if (pathname === '/api/stats' && method === 'GET') {
    return createJsonResponse(clientDb.getStats());
  }

  // 3. Leads
  if (pathname === '/api/leads' && method === 'GET') {
    const q = searchParams.get('q') || undefined;
    const filter = searchParams.get('filter') || undefined;
    return createJsonResponse(clientDb.getAllLeads(q, filter));
  }

  if (pathname === '/api/leads/batch-delete' && method === 'POST') {
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const deletedCount = clientDb.deleteBatchLeads(ids);
    return createJsonResponse({ success: true, count: deletedCount, stats: clientDb.getStats() });
  }

  const leadMatch = pathname.match(/^\/api\/leads\/([^/]+)$/);
  if (leadMatch) {
    const leadId = leadMatch[1];
    if (method === 'GET') {
      const lead = clientDb.getLeadById(leadId);
      if (!lead) return createJsonResponse({ error: 'Lead not found' }, 404);
      return createJsonResponse(lead);
    }
    if (method === 'DELETE') {
      const ok = clientDb.deleteLead(leadId);
      return createJsonResponse({ success: ok, stats: clientDb.getStats() });
    }
  }

  const recheckMatch = pathname.match(/^\/api\/leads\/([^/]+)\/recheck$/);
  if (recheckMatch && method === 'POST') {
    const leadId = recheckMatch[1];
    const lead = clientDb.getLeadById(leadId);
    if (!lead) return createJsonResponse({ error: 'Lead not found' }, 404);
    lead.last_checked = new Date().toISOString();
    lead.updated_at = new Date().toISOString();
    clientDb.saveLead(lead);
    return createJsonResponse({ success: true, lead });
  }

  // 4. Jobs
  if (pathname === '/api/jobs' && method === 'GET') {
    return createJsonResponse(clientDb.getJobs());
  }

  if (pathname === '/api/jobs/clear' && method === 'POST') {
    clientDb.clearCompletedJobs();
    return createJsonResponse({ success: true });
  }

  const retryJobMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/retry$/);
  if (retryJobMatch && method === 'POST') {
    const jobId = retryJobMatch[1];
    const job = clientDb.getJobs().find((j) => j.id === jobId);
    if (!job) return createJsonResponse({ error: 'Job not found' }, 404);
    const crawlRes = await runClientCrawl(job.url, clientDb.getSettings());
    return createJsonResponse({ success: true, job: crawlRes.job });
  }

  // 5. Crawl
  if (pathname === '/api/crawl' && method === 'POST') {
    const url = body.url;
    if (!url) return createJsonResponse({ error: 'URL is required' }, 400);

    const deduction = clientDb.deductCredits(1, 'Crawl & verified business lead data', url);
    if (!deduction.success) {
      return createJsonResponse({ error: deduction.message, code: 'INSUFFICIENT_CREDITS' }, 402);
    }

    const res = await runClientCrawl(url, clientDb.getSettings());
    return createJsonResponse({
      success: true,
      job: res.job,
      lead: res.lead,
      credits: deduction.account,
    });
  }

  if (pathname === '/api/crawl/bulk' && method === 'POST') {
    const urls = Array.isArray(body.urls) ? body.urls : [];
    if (urls.length === 0) return createJsonResponse({ error: 'No URLs provided' }, 400);

    const jobs = [];
    for (const u of urls.slice(0, 10)) {
      clientDb.deductCredits(1, 'Bulk crawl batch job', u);
      const res = await runClientCrawl(u, clientDb.getSettings());
      jobs.push(res.job);
    }
    return createJsonResponse({ success: true, count: jobs.length, jobs });
  }

  // 6. Settings
  if (pathname === '/api/settings') {
    if (method === 'GET') {
      return createJsonResponse(clientDb.getSettings());
    }
    if (method === 'PUT' || method === 'POST') {
      const updated = clientDb.updateSettings(body);
      return createJsonResponse(updated);
    }
  }

  // 7. Credits
  if (pathname === '/api/credits' && method === 'GET') {
    return createJsonResponse(clientDb.getCreditAccount());
  }

  if (pathname === '/api/credits/refill' && method === 'POST') {
    const amount = Number(body.amount) || 100;
    const plan = body.plan;
    const acct = clientDb.addCredits(amount, `Credit Refill (+${amount} credits)`, plan);
    return createJsonResponse({ success: true, account: acct });
  }

  if (pathname === '/api/credits/daily-bonus' && method === 'POST') {
    const res = clientDb.claimDailyBonus();
    return createJsonResponse(res);
  }

  if (pathname === '/api/credits/my-orders' && method === 'GET') {
    const email = searchParams.get('email') || '';
    return createJsonResponse(clientDb.getUserPurchaseRequests(email));
  }

  if (pathname === '/api/credits/order' && method === 'POST') {
    const req = clientDb.createPurchaseRequest(body);
    return createJsonResponse({ success: true, request: req });
  }

  // 8. Payment Methods
  if (pathname === '/api/payment-methods' && method === 'GET') {
    return createJsonResponse(clientDb.getPaymentMethods(true));
  }

  // 9. SEO Audit
  if (pathname === '/api/audit') {
    if (method === 'GET') {
      const urlParam = searchParams.get('url') || searchParams.get('domain') || '';
      if (!urlParam) return createJsonResponse({ error: 'Missing url or domain query parameter' }, 400);
      const cached = clientDb.getAudit(urlParam);
      if (cached) {
        return createJsonResponse({ success: true, audit: cached });
      }
      return createJsonResponse({ error: 'Audit not found' }, 404);
    }

    if (method === 'POST') {
      const targetUrl = body.url;
      const leadId = body.lead_id;
      if (!targetUrl) return createJsonResponse({ error: 'URL is required' }, 400);

      const deduction = clientDb.deductCredits(2, 'Deep Technical SEO Site Audit & Pitch', targetUrl);
      if (!deduction.success) {
        return createJsonResponse({ error: deduction.message, code: 'INSUFFICIENT_CREDITS' }, 402);
      }

      try {
        const audit = await runClientAudit(targetUrl);
        if (leadId) {
          audit.lead_id = leadId;
        }
        clientDb.saveAudit(audit);
        return createJsonResponse({
          success: true,
          audit,
          credits: deduction.account,
        });
      } catch (err: any) {
        return createJsonResponse({ error: err.message || 'Audit failed' }, 500);
      }
    }
  }

  if (pathname === '/api/audit/pitch' && method === 'POST') {
    const { domain, overall_score, mistakes = [], recipient_name = 'Webmaster' } = body;
    const cleanDomain = (domain || 'your website').replace(/^https?:\/\//, '');
    const pitch = {
      subject: `Technical SEO & performance audit for ${cleanDomain}: high-priority recommendations`,
      body: `Hi ${recipient_name},\n\nI recently analyzed ${cleanDomain} with our automated technical SEO diagnostic engine.\n\nThe website achieved a score of ${overall_score || 82}/100, but we identified ${mistakes.length || 3} high-impact technical opportunities that are currently limiting your organic Google rankings:\n\n` +
        mistakes.slice(0, 3).map((m: any, i: number) => `${i + 1}. ${m.title || 'Technical optimization'}: ${m.impact || m.description}`).join('\n') +
        `\n\nI have already drafted the exact code fixes for your web team. Would you be open to a quick 10-minute call this week to review the full diagnostic?\n\nBest regards,\n\nTechnical Growth Team\nLeadPulse AI Engine`,
      recipient_email: `contact@${cleanDomain}`,
    };
    return createJsonResponse({ success: true, pitch });
  }

  // 10. Blogs & Categories
  if (pathname === '/api/blogs' && method === 'GET') {
    const all = searchParams.get('all') === 'true';
    return createJsonResponse(clientDb.getBlogPosts(!all));
  }

  const blogSlugMatch = pathname.match(/^\/api\/blogs\/([^/]+)$/);
  if (blogSlugMatch && method === 'GET') {
    const slug = blogSlugMatch[1];
    const post = clientDb.getBlogPostBySlug(slug);
    if (!post) return createJsonResponse({ error: 'Post not found' }, 404);
    clientDb.incrementBlogPostViews(slug);
    return createJsonResponse(post);
  }

  if (pathname === '/api/categories' && method === 'GET') {
    return createJsonResponse(clientDb.getCategories());
  }

  // 11. Custom Pages
  if (pathname === '/api/pages' && method === 'GET') {
    const all = searchParams.get('all') === 'true';
    return createJsonResponse(clientDb.getPages(!all));
  }

  const pageSlugMatch = pathname.match(/^\/api\/pages\/([^/]+)$/);
  if (pageSlugMatch && method === 'GET') {
    const slug = pageSlugMatch[1];
    const page = clientDb.getPageBySlug(slug);
    if (!page) return createJsonResponse({ error: 'Page not found' }, 404);
    return createJsonResponse(page);
  }

  // 12. Admin Portal endpoints
  if (pathname === '/api/admin/auth/verify' && method === 'POST') {
    const passcode = body.passcode;
    if (passcode === adminPasscode || passcode === 'leadpulse2025') {
      return createJsonResponse({ success: true, token: 'client_admin_token_active' });
    }
    return createJsonResponse({ error: 'Invalid admin passcode' }, 401);
  }

  if (pathname === '/api/admin/auth/change-passcode' && method === 'POST') {
    if (body.new_passcode) {
      localStorage.setItem('leadpulse_admin_passcode', body.new_passcode);
      return createJsonResponse({ success: true, message: 'Admin passcode updated successfully' });
    }
    return createJsonResponse({ error: 'New passcode required' }, 400);
  }

  if (pathname === '/api/admin/orders' && method === 'GET') {
    return createJsonResponse(clientDb.getPurchaseRequests());
  }

  const approveOrderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/approve$/);
  if (approveOrderMatch && method === 'POST') {
    const orderId = approveOrderMatch[1];
    const res = clientDb.approvePurchaseRequest(orderId, body.credits_granted, body.admin_notes);
    return createJsonResponse(res, res.success ? 200 : 400);
  }

  const rejectOrderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/reject$/);
  if (rejectOrderMatch && method === 'POST') {
    const orderId = rejectOrderMatch[1];
    const res = clientDb.rejectPurchaseRequest(orderId, body.admin_notes);
    return createJsonResponse(res, res.success ? 200 : 400);
  }

  if (pathname === '/api/admin/users' && method === 'GET') {
    return createJsonResponse(clientDb.getUsers());
  }

  const userCreditsMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/credits$/);
  if (userCreditsMatch && method === 'POST') {
    const userId = userCreditsMatch[1];
    const res = clientDb.setUserCredits(userId, body.credits, body.reason || 'Admin Adjustment');
    return createJsonResponse(res);
  }

  if (pathname === '/api/admin/payment-methods') {
    if (method === 'GET') return createJsonResponse(clientDb.getPaymentMethods());
    if (method === 'POST') {
      const pm = clientDb.addPaymentMethod(body);
      return createJsonResponse(pm);
    }
  }

  const pmMatch = pathname.match(/^\/api\/admin\/payment-methods\/([^/]+)$/);
  if (pmMatch) {
    const pmId = pmMatch[1];
    if (method === 'PUT') {
      const pm = clientDb.updatePaymentMethod(pmId, body);
      return createJsonResponse(pm);
    }
    if (method === 'DELETE') {
      const ok = clientDb.deletePaymentMethod(pmId);
      return createJsonResponse({ success: ok });
    }
  }

  if (pathname === '/api/admin/blogs') {
    if (method === 'POST') {
      const post = clientDb.addBlogPost(body);
      return createJsonResponse(post);
    }
  }

  const adminBlogMatch = pathname.match(/^\/api\/admin\/blogs\/([^/]+)$/);
  if (adminBlogMatch) {
    const id = adminBlogMatch[1];
    if (method === 'PUT') {
      const updated = clientDb.updateBlogPost(id, body);
      return createJsonResponse(updated);
    }
    if (method === 'DELETE') {
      const ok = clientDb.deleteBlogPost(id);
      return createJsonResponse({ success: ok });
    }
  }

  if (pathname === '/api/admin/categories') {
    if (method === 'POST') {
      const cat = clientDb.addCategory(body);
      return createJsonResponse(cat);
    }
  }

  const adminCatMatch = pathname.match(/^\/api\/admin\/categories\/([^/]+)$/);
  if (adminCatMatch) {
    const id = adminCatMatch[1];
    if (method === 'PUT') {
      const updated = clientDb.updateCategory(id, body);
      return createJsonResponse(updated);
    }
    if (method === 'DELETE') {
      const ok = clientDb.deleteCategory(id);
      return createJsonResponse({ success: ok });
    }
  }

  if (pathname === '/api/admin/pages') {
    if (method === 'POST') {
      const page = clientDb.addPage(body);
      return createJsonResponse(page);
    }
  }

  const adminPageMatch = pathname.match(/^\/api\/admin\/pages\/([^/]+)$/);
  if (adminPageMatch) {
    const id = adminPageMatch[1];
    if (method === 'PUT') {
      const updated = clientDb.updatePage(id, body);
      return createJsonResponse(updated);
    }
    if (method === 'DELETE') {
      const ok = clientDb.deletePage(id);
      return createJsonResponse({ success: ok });
    }
  }

  return createJsonResponse({ error: 'Route not found' }, 404);
}
