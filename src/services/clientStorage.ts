import {
  Lead,
  ScrapingJob,
  ScraperSettings,
  CreditAccount,
  CreditTransaction,
  PaymentMethod,
  CreditPurchaseRequest,
  AppUser,
  BlogCategory,
  BlogPost,
  CustomPage,
  SEOAuditData,
  DashboardStats,
} from '../types.js';
import {
  initialLeads,
  initialJobs,
  initialSettings,
  initialCreditAccount,
  initialPaymentMethods,
  initialUsers,
  initialBlogCategories,
  initialBlogPosts,
  initialCustomPages,
  initialPurchaseRequests,
  veritasAudit,
} from '../data/initialData.js';

const STORAGE_KEYS = {
  LEADS: 'leadpulse_leads_v2',
  JOBS: 'leadpulse_jobs_v2',
  SETTINGS: 'leadpulse_settings_v2',
  CREDITS: 'leadpulse_credits_v2',
  AUDITS: 'leadpulse_audits_v2',
  PAYMENT_METHODS: 'leadpulse_payment_methods_v2',
  USERS: 'leadpulse_users_v2',
  CATEGORIES: 'leadpulse_categories_v2',
  BLOGS: 'leadpulse_blogs_v2',
  PAGES: 'leadpulse_pages_v2',
  PURCHASES: 'leadpulse_purchases_v2',
};

function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
    const stored = window.localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // quota exceeded or private mode
  }
}

export class ClientDatabase {
  private leads: Lead[];
  private jobs: ScrapingJob[];
  private settings: ScraperSettings;
  private credits: CreditAccount;
  private audits: Record<string, SEOAuditData>;
  private paymentMethods: PaymentMethod[];
  private users: AppUser[];
  private categories: BlogCategory[];
  private blogPosts: BlogPost[];
  private pages: CustomPage[];
  private purchaseRequests: CreditPurchaseRequest[];

  constructor() {
    this.leads = safeGetItem<Lead[]>(STORAGE_KEYS.LEADS, initialLeads);
    this.jobs = safeGetItem<ScrapingJob[]>(STORAGE_KEYS.JOBS, initialJobs);
    this.settings = safeGetItem<ScraperSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
    this.credits = safeGetItem<CreditAccount>(STORAGE_KEYS.CREDITS, initialCreditAccount);
    this.audits = safeGetItem<Record<string, SEOAuditData>>(STORAGE_KEYS.AUDITS, {
      'veritasdynamics.ai': veritasAudit,
    });
    this.paymentMethods = safeGetItem<PaymentMethod[]>(STORAGE_KEYS.PAYMENT_METHODS, initialPaymentMethods);
    this.users = safeGetItem<AppUser[]>(STORAGE_KEYS.USERS, initialUsers);
    this.categories = safeGetItem<BlogCategory[]>(STORAGE_KEYS.CATEGORIES, initialBlogCategories);
    this.blogPosts = safeGetItem<BlogPost[]>(STORAGE_KEYS.BLOGS, initialBlogPosts);
    this.pages = safeGetItem<CustomPage[]>(STORAGE_KEYS.PAGES, initialCustomPages);
    this.purchaseRequests = safeGetItem<CreditPurchaseRequest[]>(STORAGE_KEYS.PURCHASES, initialPurchaseRequests);
  }

  // Persist helpers
  private saveLeads() { safeSetItem(STORAGE_KEYS.LEADS, this.leads); }
  private saveJobs() { safeSetItem(STORAGE_KEYS.JOBS, this.jobs); }
  private saveSettingsState() { safeSetItem(STORAGE_KEYS.SETTINGS, this.settings); }
  private saveCreditsState() { safeSetItem(STORAGE_KEYS.CREDITS, this.credits); }
  private saveAuditsState() { safeSetItem(STORAGE_KEYS.AUDITS, this.audits); }
  private savePaymentMethodsState() { safeSetItem(STORAGE_KEYS.PAYMENT_METHODS, this.paymentMethods); }
  private saveUsersState() { safeSetItem(STORAGE_KEYS.USERS, this.users); }
  private saveCategoriesState() { safeSetItem(STORAGE_KEYS.CATEGORIES, this.categories); }
  private saveBlogsState() { safeSetItem(STORAGE_KEYS.BLOGS, this.blogPosts); }
  private savePagesState() { safeSetItem(STORAGE_KEYS.PAGES, this.pages); }
  private savePurchasesState() { safeSetItem(STORAGE_KEYS.PURCHASES, this.purchaseRequests); }

  // Leads
  public getAllLeads(query?: string, filter?: string): Lead[] {
    let result = [...this.leads];
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (lead) =>
          lead.business_name.toLowerCase().includes(q) ||
          lead.website.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          lead.phone.toLowerCase().includes(q) ||
          lead.city.toLowerCase().includes(q) ||
          lead.category.toLowerCase().includes(q)
      );
    }
    if (filter) {
      if (filter === 'verified') {
        result = result.filter((l) => l.verification_status === 'Verified');
      } else if (filter === 'has_email') {
        result = result.filter((l) => l.email && l.email !== 'Not Found');
      } else if (filter === 'has_phone') {
        result = result.filter((l) => l.phone && l.phone !== 'Not Found');
      } else if (filter === 'high_confidence') {
        result = result.filter((l) => l.confidence_score >= 90);
      }
    }
    result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return result;
  }

  public getLeadById(id: string): Lead | undefined {
    return this.leads.find((lead) => lead.id === id);
  }

  public getLeadByWebsite(website: string): Lead | undefined {
    const clean = website.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    return this.leads.find(
      (l) => l.website.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase() === clean
    );
  }

  public saveLead(lead: Lead): Lead {
    const idx = this.leads.findIndex((l) => l.id === lead.id);
    if (idx >= 0) {
      this.leads[idx] = { ...this.leads[idx], ...lead, updated_at: new Date().toISOString() };
    } else {
      this.leads.unshift(lead);
    }
    this.saveLeads();
    return lead;
  }

  public deleteLead(id: string): boolean {
    const prev = this.leads.length;
    this.leads = this.leads.filter((l) => l.id !== id);
    this.saveLeads();
    return this.leads.length < prev;
  }

  public deleteBatchLeads(ids: string[]): number {
    const set = new Set(ids);
    const prev = this.leads.length;
    this.leads = this.leads.filter((l) => !set.has(l.id));
    this.saveLeads();
    return prev - this.leads.length;
  }

  // Jobs
  public getJobs(): ScrapingJob[] {
    return [...this.jobs];
  }

  public addJob(job: ScrapingJob): ScrapingJob {
    this.jobs.unshift(job);
    this.saveJobs();
    return job;
  }

  public updateJob(id: string, updates: Partial<ScrapingJob>): ScrapingJob | undefined {
    const job = this.jobs.find((j) => j.id === id);
    if (job) {
      Object.assign(job, updates);
      this.saveJobs();
      return job;
    }
    return undefined;
  }

  public clearCompletedJobs(): void {
    this.jobs = this.jobs.filter((j) => j.status === 'processing' || j.status === 'pending');
    this.saveJobs();
  }

  // Settings
  public getSettings(): ScraperSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<ScraperSettings>): ScraperSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettingsState();
    return { ...this.settings };
  }

  // Stats
  public getStats(): DashboardStats {
    let emails = 0;
    let phones = 0;
    let socials = 0;
    let totalScore = 0;
    let verifiedCount = 0;

    for (const lead of this.leads) {
      if (lead.email && lead.email !== 'Not Found') emails++;
      if (lead.phone && lead.phone !== 'Not Found') phones++;
      if (lead.linkedin && lead.linkedin !== 'Not Found') socials++;
      if (lead.twitter && lead.twitter !== 'Not Found') socials++;
      if (lead.facebook && lead.facebook !== 'Not Found') socials++;
      if (lead.instagram && lead.instagram !== 'Not Found') socials++;
      if (lead.youtube && lead.youtube !== 'Not Found') socials++;
      if (lead.tiktok && lead.tiktok !== 'Not Found') socials++;
      if (lead.github && lead.github !== 'Not Found') socials++;

      totalScore += lead.confidence_score;
      if (lead.verification_status === 'Verified') verifiedCount++;
    }

    const count = this.leads.length || 1;
    const avgConfidence = Math.round((totalScore / count) * 10) / 10;
    const verifiedPercent = Math.round((verifiedCount / count) * 100);

    return {
      total_leads: this.leads.length,
      emails_found: emails,
      phone_lines_found: phones,
      social_profiles_found: socials,
      average_confidence: avgConfidence,
      verified_percentage: verifiedPercent,
      recent_leads_growth: '+12% this week',
    };
  }

  // SEO Audits
  public saveAudit(audit: SEOAuditData): SEOAuditData {
    const key = audit.domain.toLowerCase();
    this.audits[key] = audit;
    if (audit.lead_id) {
      this.audits[audit.lead_id] = audit;
      const lead = this.getLeadById(audit.lead_id);
      if (lead) {
        lead.seo_audit = audit;
        this.saveLead(lead);
      }
    }
    this.saveAuditsState();
    return audit;
  }

  public getAudit(domainOrLeadId: string): SEOAuditData | undefined {
    const cleanKey = domainOrLeadId.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    if (this.audits[cleanKey]) return this.audits[cleanKey];
    for (const audit of Object.values(this.audits)) {
      if (audit.lead_id === domainOrLeadId || audit.domain.toLowerCase() === cleanKey) {
        return audit;
      }
    }
    const lead = this.getLeadById(domainOrLeadId) || this.getLeadByWebsite(domainOrLeadId);
    if (lead && lead.seo_audit) return lead.seo_audit;
    return undefined;
  }

  public getAllAudits(): SEOAuditData[] {
    return Object.values(this.audits);
  }

  // Credits
  public getCreditAccount(): CreditAccount {
    if (this.credits.last_daily_bonus) {
      const last = new Date(this.credits.last_daily_bonus).getTime();
      const now = Date.now();
      if (now - last >= 1000 * 60 * 60 * 24) {
        this.credits.daily_bonus_available = true;
      }
    } else {
      this.credits.daily_bonus_available = true;
    }
    return {
      ...this.credits,
      transactions: [...this.credits.transactions],
    };
  }

  public deductCredits(
    amount: number,
    reason: string,
    target?: string
  ): { success: boolean; account: CreditAccount; message?: string } {
    const cost = Math.abs(amount);
    if (this.credits.balance < cost) {
      return {
        success: false,
        account: this.getCreditAccount(),
        message: `Insufficient credits. You need ${cost} credits, but currently have ${this.credits.balance}. Please top up your balance.`,
      };
    }

    this.credits.balance -= cost;
    this.credits.total_spent += cost;

    const tx: CreditTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'deduction',
      amount: -cost,
      reason,
      target,
      timestamp: new Date().toISOString(),
      balance_after: this.credits.balance,
    };

    this.credits.transactions.unshift(tx);
    if (this.credits.transactions.length > 50) {
      this.credits.transactions = this.credits.transactions.slice(0, 50);
    }
    this.saveCreditsState();

    return {
      success: true,
      account: this.getCreditAccount(),
    };
  }

  public addCredits(
    amount: number,
    reason: string,
    plan_tier?: CreditAccount['plan_tier']
  ): CreditAccount {
    const added = Math.max(1, Math.abs(amount));
    this.credits.balance += added;
    this.credits.total_earned += added;
    if (plan_tier) {
      this.credits.plan_tier = plan_tier;
    }

    const tx: CreditTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'addition',
      amount: added,
      reason,
      timestamp: new Date().toISOString(),
      balance_after: this.credits.balance,
    };

    this.credits.transactions.unshift(tx);
    if (this.credits.transactions.length > 50) {
      this.credits.transactions = this.credits.transactions.slice(0, 50);
    }
    this.saveCreditsState();

    return this.getCreditAccount();
  }

  public claimDailyBonus(): { success: boolean; bonus: number; account: CreditAccount; message: string } {
    const bonus = 25;
    this.credits.balance += bonus;
    this.credits.total_earned += bonus;
    this.credits.daily_bonus_available = false;
    this.credits.last_daily_bonus = new Date().toISOString();

    const tx: CreditTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'bonus',
      amount: bonus,
      reason: 'Daily Free Bonus Refill Claimed (+25 Credits)',
      timestamp: new Date().toISOString(),
      balance_after: this.credits.balance,
    };

    this.credits.transactions.unshift(tx);
    this.saveCreditsState();

    return {
      success: true,
      bonus,
      account: this.getCreditAccount(),
      message: `Successfully claimed +${bonus} Free Daily Credits! Your new balance is ${this.credits.balance}.`,
    };
  }

  // Payment methods
  public getPaymentMethods(activeOnly: boolean = false): PaymentMethod[] {
    if (activeOnly) {
      return this.paymentMethods.filter((pm) => pm.is_active);
    }
    return [...this.paymentMethods];
  }

  public addPaymentMethod(method: Omit<PaymentMethod, 'id' | 'created_at'>): PaymentMethod {
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.paymentMethods.push(newMethod);
    this.savePaymentMethodsState();
    return newMethod;
  }

  public updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): PaymentMethod | null {
    const idx = this.paymentMethods.findIndex((pm) => pm.id === id);
    if (idx === -1) return null;
    this.paymentMethods[idx] = { ...this.paymentMethods[idx], ...updates };
    this.savePaymentMethodsState();
    return this.paymentMethods[idx];
  }

  public deletePaymentMethod(id: string): boolean {
    const prev = this.paymentMethods.length;
    this.paymentMethods = this.paymentMethods.filter((pm) => pm.id !== id);
    this.savePaymentMethodsState();
    return this.paymentMethods.length < prev;
  }

  // Purchase orders
  public getPurchaseRequests(): CreditPurchaseRequest[] {
    return [...this.purchaseRequests].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getUserPurchaseRequests(email: string): CreditPurchaseRequest[] {
    const em = email.toLowerCase().trim();
    return this.purchaseRequests
      .filter((r) => r.user_email.toLowerCase().trim() === em)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createPurchaseRequest(
    data: Omit<CreditPurchaseRequest, 'id' | 'created_at' | 'status'>
  ): CreditPurchaseRequest {
    const newReq: CreditPurchaseRequest = {
      ...data,
      id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.purchaseRequests.unshift(newReq);
    this.savePurchasesState();
    return newReq;
  }

  public approvePurchaseRequest(
    id: string,
    creditsGranted: number,
    adminNotes?: string
  ): { success: boolean; request?: CreditPurchaseRequest; message: string } {
    const req = this.purchaseRequests.find((r) => r.id === id);
    if (!req) return { success: false, message: 'Purchase request not found' };
    if (req.status === 'approved') {
      return { success: false, message: 'Request is already approved' };
    }

    const grantAmount = Math.max(1, creditsGranted || req.amount_credits);
    req.status = 'approved';
    req.credits_granted = grantAmount;
    req.admin_notes = adminNotes || `Approved by Admin. Granted ${grantAmount} credits.`;
    req.reviewed_at = new Date().toISOString();

    const user = this.users.find(
      (u) => u.id === req.user_id || u.email.toLowerCase() === req.user_email.toLowerCase()
    );
    if (user) {
      user.credits += grantAmount;
      this.saveUsersState();
    }

    this.addCredits(
      grantAmount,
      `Credit Order Approved (${req.payment_method_name} - Ref: ${req.transaction_id})`
    );
    this.savePurchasesState();

    return {
      success: true,
      request: req,
      message: `Successfully approved request! Granted ${grantAmount} credits to ${req.user_name}.`,
    };
  }

  public rejectPurchaseRequest(
    id: string,
    adminNotes?: string
  ): { success: boolean; request?: CreditPurchaseRequest; message: string } {
    const req = this.purchaseRequests.find((r) => r.id === id);
    if (!req) return { success: false, message: 'Purchase request not found' };

    req.status = 'rejected';
    req.admin_notes = adminNotes || 'Payment verification could not be confirmed. Please check reference ID.';
    req.reviewed_at = new Date().toISOString();
    this.savePurchasesState();

    return {
      success: true,
      request: req,
      message: 'Purchase request has been marked as rejected.',
    };
  }

  // Users
  public getUsers(): AppUser[] {
    return [...this.users];
  }

  public getUserById(id: string): AppUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): AppUser | undefined {
    const em = email.toLowerCase().trim();
    return this.users.find((u) => u.email.toLowerCase().trim() === em);
  }

  public setUserCredits(
    id: string,
    credits: number,
    reason: string
  ): { success: boolean; user?: AppUser; message: string } {
    const user = this.users.find((u) => u.id === id);
    if (!user) return { success: false, message: 'User not found' };

    const oldCredits = user.credits;
    user.credits = Math.max(0, credits);
    const delta = user.credits - oldCredits;

    if (delta > 0) {
      this.addCredits(delta, `Admin manual grant to ${user.name}: ${reason}`);
    } else if (delta < 0) {
      this.deductCredits(Math.abs(delta), `Admin manual adjustment for ${user.name}: ${reason}`);
    }
    this.saveUsersState();

    return {
      success: true,
      user,
      message: `Updated ${user.name}'s credits from ${oldCredits} to ${user.credits}.`,
    };
  }

  public adjustUserCredits(
    id: string,
    delta: number,
    reason: string
  ): { success: boolean; user?: AppUser; message: string } {
    const user = this.users.find((u) => u.id === id);
    if (!user) return { success: false, message: 'User not found' };

    user.credits = Math.max(0, user.credits + delta);
    if (delta > 0) {
      this.addCredits(delta, `Admin credit bonus to ${user.name}: ${reason}`);
    } else if (delta < 0) {
      this.deductCredits(Math.abs(delta), `Admin credit deduction from ${user.name}: ${reason}`);
    }
    this.saveUsersState();

    return {
      success: true,
      user,
      message: `Adjusted ${user.name}'s credits by ${delta > 0 ? '+' : ''}${delta}. Current balance: ${user.credits}.`,
    };
  }

  // Blog categories & posts
  public getCategories(): BlogCategory[] {
    return [...this.categories];
  }

  public addCategory(cat: Omit<BlogCategory, 'id'>): BlogCategory {
    const newCat: BlogCategory = {
      ...cat,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };
    this.categories.push(newCat);
    this.saveCategoriesState();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<BlogCategory>): BlogCategory | null {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.categories[idx] = { ...this.categories[idx], ...updates };
    this.saveCategoriesState();
    return this.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const prev = this.categories.length;
    this.categories = this.categories.filter((c) => c.id !== id);
    this.saveCategoriesState();
    return this.categories.length < prev;
  }

  public getBlogPosts(publishedOnly: boolean = true): BlogPost[] {
    let posts = [...this.blogPosts];
    if (publishedOnly) {
      posts = posts.filter((p) => p.status === 'published');
    }
    return posts.sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  public getBlogPostBySlug(slug: string): BlogPost | undefined {
    return this.blogPosts.find((p) => p.slug === slug);
  }

  public addBlogPost(post: Omit<BlogPost, 'id' | 'published_at' | 'views'>): BlogPost {
    const newPost: BlogPost = {
      ...post,
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      published_at: new Date().toISOString(),
      views: 1,
      slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };
    this.blogPosts.unshift(newPost);
    this.saveBlogsState();
    return newPost;
  }

  public updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | null {
    const idx = this.blogPosts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.blogPosts[idx] = { ...this.blogPosts[idx], ...updates };
    this.saveBlogsState();
    return this.blogPosts[idx];
  }

  public deleteBlogPost(id: string): boolean {
    const prev = this.blogPosts.length;
    this.blogPosts = this.blogPosts.filter((p) => p.id !== id);
    this.saveBlogsState();
    return this.blogPosts.length < prev;
  }

  public incrementBlogPostViews(slug: string): void {
    const post = this.blogPosts.find((p) => p.slug === slug);
    if (post) {
      post.views = (post.views || 0) + 1;
      this.saveBlogsState();
    }
  }

  // Pages
  public getPages(publishedOnly: boolean = true): CustomPage[] {
    let pages = [...this.pages];
    if (publishedOnly) {
      pages = pages.filter((p) => p.is_published);
    }
    return pages;
  }

  public getPageBySlug(slug: string): CustomPage | undefined {
    return this.pages.find((p) => p.slug === slug);
  }

  public addPage(page: Omit<CustomPage, 'id' | 'updated_at'>): CustomPage {
    const newPage: CustomPage = {
      ...page,
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      updated_at: new Date().toISOString(),
      slug: page.slug || page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };
    this.pages.push(newPage);
    this.savePagesState();
    return newPage;
  }

  public updatePage(id: string, updates: Partial<CustomPage>): CustomPage | null {
    const idx = this.pages.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.pages[idx] = { ...this.pages[idx], ...updates, updated_at: new Date().toISOString() };
    this.savePagesState();
    return this.pages[idx];
  }

  public deletePage(id: string): boolean {
    const prev = this.pages.length;
    this.pages = this.pages.filter((p) => p.id !== id);
    this.savePagesState();
    return this.pages.length < prev;
  }
}

export const clientDb = new ClientDatabase();
