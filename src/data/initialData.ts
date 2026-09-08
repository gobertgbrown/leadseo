import {
  Lead,
  ScrapingJob,
  ScraperSettings,
  CreditAccount,
  PaymentMethod,
  CreditPurchaseRequest,
  AppUser,
  BlogCategory,
  BlogPost,
  CustomPage,
  SEOAuditData,
} from '../types.js';

export const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    business_name: 'Veritas Dynamics Inc.',
    category: 'Enterprise AI & Data Infrastructure',
    description: 'Enterprise AI & distributed streaming data infrastructure systems for high-throughput compliance workloads.',
    website: 'https://veritasdynamics.ai',
    email: 'hello@veritasdynamics.ai',
    email_status: 'Verified',
    email_confidence: 98,
    email_source: 'https://veritasdynamics.ai/contact',
    phone: '+1 (650) 412-9900',
    phone_status: 'Verified',
    phone_confidence: 96,
    phone_source: 'https://veritasdynamics.ai/contact-us',
    alt_phone: '+1 (650) 412-9908',
    contact_person: 'Sarah Jenkins',
    contact_person_role: 'VP Growth & Strategic Partnerships',
    contact_person_source: 'https://veritasdynamics.ai/team',
    contact_page_url: 'https://veritasdynamics.ai/contact',
    address: '340 University Ave, Suite 400',
    address_source: 'Registry Footnote via /contact',
    city: 'Palo Alto',
    state: 'CA',
    country: 'USA',
    postal_code: '94301',
    facebook: 'Not Found',
    instagram: 'Not Found',
    linkedin: 'https://linkedin.com/company/veritas-ai',
    youtube: 'Not Found',
    twitter: 'https://x.com/veritasdynamics',
    tiktok: 'Not Found',
    github: 'https://github.com/veritasdynamics',
    verification_status: 'Verified',
    confidence_score: 96,
    pages_crawled: 18,
    crawl_depth: 2,
    last_checked: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    source_pages: [
      {
        id: 'sp-1',
        lead_id: 'lead-1',
        url: 'https://veritasdynamics.ai/',
        page_type: 'index',
        http_status: 200,
        extracted_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        note: 'Extracted 2 emails, 3 socials from navigation tree and metadata header.'
      },
      {
        id: 'sp-2',
        lead_id: 'lead-1',
        url: 'https://veritasdynamics.ai/about-us',
        page_type: 'about',
        http_status: 200,
        extracted_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        note: 'Parsed core business taxonomy and founding executive entity signals.'
      },
      {
        id: 'sp-3',
        lead_id: 'lead-1',
        url: 'https://veritasdynamics.ai/contact',
        page_type: 'contact',
        http_status: 200,
        extracted_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        note: 'Validated primary telephone, verified support routes, HQ geo-location address.'
      },
      {
        id: 'sp-4',
        lead_id: 'lead-1',
        url: 'https://veritasdynamics.ai/team',
        page_type: 'team',
        http_status: 200,
        extracted_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        note: 'Discovered 1 decision-maker bio card (VP Growth, Sarah Jenkins).'
      }
    ],
    extracted_fields: [
      {
        id: 'ef-1',
        lead_id: 'lead-1',
        field_name: 'Primary Inbound Email',
        field_value: 'hello@veritasdynamics.ai',
        source_url: 'https://veritasdynamics.ai/contact',
        confidence_score: 98,
        verification_status: 'Verified',
        note: 'Direct mailto anchor with matched domain'
      },
      {
        id: 'ef-2',
        lead_id: 'lead-1',
        field_name: 'Support Desk Email',
        field_value: 'support@veritasdynamics.ai',
        source_url: 'https://veritasdynamics.ai/support',
        confidence_score: 94,
        verification_status: 'Verified',
        note: 'Found in helpcenter footer markup'
      },
      {
        id: 'ef-3',
        lead_id: 'lead-1',
        field_name: 'HQ Switchboard',
        field_value: '+1 (650) 412-9900',
        source_url: 'https://veritasdynamics.ai/contact-us',
        confidence_score: 96,
        verification_status: 'Verified',
        note: 'Normalized E.164 USA format with tel: protocol'
      },
      {
        id: 'ef-4',
        lead_id: 'lead-1',
        field_name: 'Key Personnel',
        field_value: 'Sarah Jenkins (VP Growth & Strategic Partnerships)',
        source_url: 'https://veritasdynamics.ai/team',
        confidence_score: 92,
        verification_status: 'Verified',
        note: 'Validated from team roster schema'
      }
    ]
  },
  {
    id: 'lead-2',
    business_name: 'Apex Biosystems, Inc.',
    category: 'Biotech / SaaS',
    description: 'Precision genomic sequencing platform and cloud bioinformatics pipeline accelerating diagnostic therapies.',
    website: 'https://apexbio.io',
    email: 'contact@apexbio.io',
    email_status: 'Verified',
    email_confidence: 98,
    email_source: 'https://apexbio.io/contact',
    phone: '+1 (415) 890-2341',
    phone_status: 'Verified',
    phone_confidence: 95,
    phone_source: 'https://apexbio.io/about',
    alt_phone: '+1 (415) 890-2300',
    contact_person: 'Dr. Elena Vance',
    contact_person_role: 'Chief Scientist',
    contact_person_source: 'https://apexbio.io/leadership',
    contact_page_url: 'https://apexbio.io/contact',
    address: '500 Howard St, Suite 700',
    address_source: 'https://apexbio.io/contact',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    postal_code: '94105',
    facebook: 'Not Found',
    instagram: 'Not Found',
    linkedin: 'https://linkedin.com/company/apex-biosystems',
    youtube: 'Not Found',
    twitter: 'https://x.com/apexbio_labs',
    tiktok: 'Not Found',
    github: 'https://github.com/apex-bio',
    verification_status: 'Verified',
    confidence_score: 98,
    pages_crawled: 14,
    crawl_depth: 2,
    last_checked: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    source_pages: [
      {
        id: 'sp-21',
        lead_id: 'lead-2',
        url: 'https://apexbio.io/',
        page_type: 'index',
        http_status: 200,
        extracted_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        note: 'Header contact anchor and bio pipeline overview'
      },
      {
        id: 'sp-22',
        lead_id: 'lead-2',
        url: 'https://apexbio.io/contact',
        page_type: 'contact',
        http_status: 200,
        extracted_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        note: 'HQ address and validated inbound contact routes'
      }
    ],
    extracted_fields: [
      {
        id: 'ef-21',
        lead_id: 'lead-2',
        field_name: 'Contact Email',
        field_value: 'contact@apexbio.io',
        source_url: 'https://apexbio.io/contact',
        confidence_score: 98,
        verification_status: 'Verified'
      },
      {
        id: 'ef-22',
        lead_id: 'lead-2',
        field_name: 'Primary Phone',
        field_value: '+1 (415) 890-2341',
        source_url: 'https://apexbio.io/contact',
        confidence_score: 95,
        verification_status: 'Verified'
      }
    ]
  },
  {
    id: 'lead-3',
    business_name: 'Nexus Cloud Studio',
    category: 'Creative Tools & Generative Media',
    description: 'Collaborative real-time 3D and visual effects workspace built for distributed creative studios.',
    website: 'https://nexuscloud.design',
    email: 'partners@nexuscloud.design',
    email_status: 'Verified',
    email_confidence: 94,
    email_source: 'https://nexuscloud.design/contact',
    phone: '+44 20 7946 0912',
    phone_status: 'Verified',
    phone_confidence: 94,
    phone_source: 'https://nexuscloud.design/about',
    contact_person: 'Marcus Sterling',
    contact_person_role: 'Design Director',
    contact_person_source: 'https://nexuscloud.design/team',
    contact_page_url: 'https://nexuscloud.design/contact',
    address: '14 Clerkenwell Close',
    address_source: 'https://nexuscloud.design/contact',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    postal_code: 'EC1R 0AA',
    facebook: 'Not Found',
    instagram: 'https://instagram.com/nexuscloudstudio',
    linkedin: 'https://linkedin.com/company/nexus-cloud-studio',
    youtube: 'https://youtube.com/@nexuscloudstudio',
    twitter: 'https://x.com/nexuscloud',
    tiktok: 'Not Found',
    github: 'Not Found',
    verification_status: 'Verified',
    confidence_score: 94,
    pages_crawled: 12,
    crawl_depth: 2,
    last_checked: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    source_pages: [],
    extracted_fields: []
  },
  {
    id: 'lead-4',
    business_name: 'Cobalt Logistics',
    category: 'Supply Chain & Freight Routing',
    description: 'Third-party logistics coordination, multimodal cold-chain tracking, and automated dispatch management.',
    website: 'https://cobaltfreight.net',
    email: 'info@cobaltfreight.net',
    email_status: 'Unverified',
    email_confidence: 68,
    email_source: 'https://cobaltfreight.net/ (Footer markup)',
    phone: 'Not Found',
    phone_status: 'Not Found',
    phone_confidence: 0,
    contact_person: 'Not Found',
    contact_page_url: 'https://cobaltfreight.net/contact',
    address: '222 W Adams St',
    address_source: 'Footer disclaimer',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    postal_code: '60606',
    facebook: 'Not Found',
    instagram: 'Not Found',
    linkedin: 'https://linkedin.com/company/cobalt-logistics',
    youtube: 'Not Found',
    twitter: 'Not Found',
    tiktok: 'Not Found',
    verification_status: 'Unverified',
    confidence_score: 68,
    pages_crawled: 8,
    crawl_depth: 1,
    last_checked: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    source_pages: [],
    extracted_fields: []
  },
  {
    id: 'lead-5',
    business_name: 'Quantum Sol Tech',
    category: 'Renewable Energy & Storage',
    description: 'AI-driven grid balancing and commercial solar array battery management systems.',
    website: 'https://quantumsol.tech',
    email: 'sales@quantumsol.tech',
    email_status: 'Verified',
    email_confidence: 91,
    email_source: 'https://quantumsol.tech/contact',
    phone: '+1 (303) 555-0149',
    phone_status: 'Verified',
    phone_confidence: 91,
    phone_source: 'https://quantumsol.tech/contact',
    contact_person: 'Elena Rostova',
    contact_person_role: 'Operations VP',
    contact_page_url: 'https://quantumsol.tech/contact',
    address: '1600 17th St',
    city: 'Denver',
    state: 'CO',
    country: 'USA',
    postal_code: '80202',
    facebook: 'Not Found',
    instagram: 'Not Found',
    linkedin: 'https://linkedin.com/company/quantum-sol',
    youtube: 'Not Found',
    twitter: 'https://x.com/quantumsoltech',
    tiktok: 'Not Found',
    verification_status: 'Verified',
    confidence_score: 91,
    pages_crawled: 16,
    crawl_depth: 2,
    last_checked: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    source_pages: [],
    extracted_fields: []
  },
  {
    id: 'lead-6',
    business_name: 'Synthetic Health Systems',
    category: 'Healthcare Intelligence & Clinical Trials',
    description: 'Accelerated patient screening and compliant synthetic cohort simulation for therapeutic efficacy research.',
    website: 'https://synthetichealth.io',
    email: 'hello@synthetichealth.io',
    email_status: 'Verified',
    email_confidence: 94,
    email_source: 'https://synthetichealth.io/contact',
    phone: '+1 (617) 849-0021',
    phone_status: 'Verified',
    phone_confidence: 92,
    phone_source: 'https://synthetichealth.io/contact',
    contact_person: 'Arthur Sterling, MD',
    contact_person_role: 'Co-Founder & Chief Medical Officer',
    contact_page_url: 'https://synthetichealth.io/contact',
    address: '100 Binney St',
    city: 'Cambridge',
    state: 'MA',
    country: 'USA',
    postal_code: '02142',
    facebook: 'Not Found',
    instagram: 'Not Found',
    linkedin: 'https://linkedin.com/company/synthetic-health-io',
    youtube: 'Not Found',
    twitter: 'https://x.com/synthetichealth',
    tiktok: 'Not Found',
    verification_status: 'Verified',
    confidence_score: 94,
    pages_crawled: 18,
    crawl_depth: 2,
    last_checked: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    source_pages: [],
    extracted_fields: []
  }
];

export const initialJobs: ScrapingJob[] = [
  {
    id: '1042',
    url: 'https://datadoghq.com',
    domain: 'datadoghq.com',
    status: 'processing',
    pages_crawled: 14,
    max_pages: 25,
    crawl_depth: 2,
    progress_percent: 56,
    current_subpath: '/contact-us',
    duration_seconds: 3.2,
    started_at: new Date(Date.now() - 3200).toISOString(),
    discovered_counts: {
      emails: 4,
      phones: 2,
      socials: 4
    }
  },
  {
    id: '1041',
    url: 'https://synthetichealth.io',
    domain: 'synthetichealth.io',
    status: 'completed',
    pages_crawled: 18,
    max_pages: 25,
    crawl_depth: 2,
    progress_percent: 100,
    current_subpath: '/completed',
    duration_seconds: 4.1,
    started_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 5 + 4100).toISOString(),
    discovered_counts: {
      emails: 2,
      phones: 1,
      socials: 3
    },
    lead_id: 'lead-6'
  },
  {
    id: '1040',
    url: 'https://privatevault-corp.com',
    domain: 'privatevault-corp.com',
    status: 'failed',
    pages_crawled: 1,
    max_pages: 25,
    crawl_depth: 2,
    progress_percent: 4,
    current_subpath: '/index',
    duration_seconds: 0.9,
    started_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 20 + 900).toISOString(),
    error_message: 'HTTP 403 Forbidden Access. Website access is restricted. No data was extracted.',
    compliance_note: 'Compliance safeguards triggered: Cloudflare Bot Management & strict WAF header challenge.',
    discovered_counts: {
      emails: 0,
      phones: 0,
      socials: 0
    }
  },
  {
    id: '1039',
    url: 'https://blankstealth.org',
    domain: 'blankstealth.org',
    status: 'completed',
    pages_crawled: 6,
    max_pages: 25,
    crawl_depth: 2,
    progress_percent: 100,
    current_subpath: '/completed',
    duration_seconds: 1.4,
    started_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 45 + 1400).toISOString(),
    error_message: 'No publicly available lead information was found.',
    compliance_note: 'Verified clean site, no email leaks. Accurate Not Found handling.',
    discovered_counts: {
      emails: 0,
      phones: 0,
      socials: 0
    }
  }
];

export const initialSettings: ScraperSettings = {
  max_pages_per_website: 25,
  max_crawl_depth: 2,
  request_delay_ms: 600,
  timeout_seconds: 12,
  respect_robots_txt: true,
  ai_validation: 'Strict',
  export_preferences: {
    default_format: 'csv',
    include_audit_trail: true
  },
  duplicate_handling: 'update',
  confidence_threshold: 70
};

export const initialCreditAccount: CreditAccount = {
  balance: 250,
  total_spent: 42,
  total_earned: 292,
  plan_tier: 'Pro Growth',
  daily_bonus_available: true,
  last_daily_bonus: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  transactions: [
    {
      id: 'tx-init-1',
      type: 'bonus',
      amount: 250,
      reason: 'Welcome Starter Credits Granted',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      balance_after: 250
    },
    {
      id: 'tx-init-2',
      type: 'deduction',
      amount: -1,
      reason: 'Crawl & verified business lead data',
      target: 'veritasdynamics.ai',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      balance_after: 249
    },
    {
      id: 'tx-init-3',
      type: 'deduction',
      amount: -2,
      reason: 'Deep Technical SEO Site Audit & Pitch',
      target: 'luminarycloud.com',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      balance_after: 247
    }
  ]
};

export const initialPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-1',
    name: 'Bank Transfer (Meezan Bank / HBL / IBAN)',
    account_title: 'LeadPulse Digital Services',
    account_number: 'PK05MEZN0012345678901234',
    instructions: 'Send payment via online bank transfer or Raast. Mention your email in transaction note or enter TxID below.',
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'pm-2',
    name: 'EasyPaisa Mobile Account',
    account_title: 'Muhammad Admin',
    account_number: '0300-1234567',
    instructions: 'Transfer via EasyPaisa app or retail shop. Provide the 11-digit TRX ID receipt number.',
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
  },
  {
    id: 'pm-3',
    name: 'JazzCash Wallet',
    account_title: 'LeadPulse Operations',
    account_number: '0321-9876543',
    instructions: 'Send money via JazzCash to mobile number. Enter the TID sent to your phone via SMS.',
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
  {
    id: 'pm-4',
    name: 'USDT (Tether TRC-20 Crypto)',
    account_title: 'Binance / Tron Wallet Address',
    account_number: 'TYR89LwkmqP72J3wNVxzKbT2E1v9Q5bZkm',
    instructions: 'Send only USDT via TRC20 network. Paste the transaction hash (TxHash) after sending.',
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
  {
    id: 'pm-5',
    name: 'PayPal / International Card',
    account_title: 'LeadPulse Global Ltd',
    account_number: 'billing@leadpulse.ai',
    instructions: 'Send payment in USD via PayPal Friends & Family or Goods & Services. Enter your PayPal email or Transaction ID.',
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
];

export const initialUsers: AppUser[] = [
  {
    id: 'user-admin-1',
    name: 'Master Admin',
    email: 'admin@leadpulse.ai',
    role: 'admin',
    credits: 9999,
    plan: 'Agency Scale',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    status: 'active',
  },
  {
    id: 'user-client-1',
    name: 'Demo Client User',
    email: 'client@leadpulse.ai',
    role: 'user',
    credits: 247,
    plan: 'Starter Pack',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    status: 'active',
  },
  {
    id: 'user-client-2',
    name: 'Growth Agency HQ',
    email: 'growth@agency.io',
    role: 'user',
    credits: 1250,
    plan: 'Pro Growth',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    status: 'active',
  },
];

export const initialBlogCategories: BlogCategory[] = [
  {
    id: 'cat-1',
    name: 'Technical SEO & Audits',
    slug: 'technical-seo',
    description: 'In-depth guides on crawl errors, robots directives, schema validation, and Core Web Vitals.',
    color: '#3b82f6',
  },
  {
    id: 'cat-2',
    name: 'B2B Lead Generation',
    slug: 'lead-generation',
    description: 'Actionable strategies for sourcing verified executive emails, phones, and decision-maker data.',
    color: '#10b981',
  },
  {
    id: 'cat-3',
    name: 'Agency Growth & Outreach',
    slug: 'agency-growth',
    description: 'High-converting cold email scripts, audit teardown pitch formulas, and client retention tips.',
    color: '#8b5cf6',
  },
  {
    id: 'cat-4',
    name: 'Search Engine Updates',
    slug: 'search-updates',
    description: 'Analysis of Google algorithm changes, helpful content guidelines, and AI search results.',
    color: '#f59e0b',
  },
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'How Technical SEO Audits Uncover Hidden Organic Traffic Opportunities',
    slug: 'how-technical-seo-audits-uncover-traffic',
    category_id: 'cat-1',
    category_name: 'Technical SEO & Audits',
    excerpt: 'Learn how single-page technical mistakes like missing H1 tags, broken canonical links, and unparsed robots.txt files silently destroy ranking potential.',
    content: `### Why Technical Auditing Comes First

Before investing thousands of dollars into backlinks and high-volume content production, your technical foundation must be airtight. When search engine bots like Googlebot encounter 405 errors, missing XML sitemaps, or malformed JSON-LD structured data, they reduce your crawl budget and deprioritize deeper subpages.

#### The 5 Pillars of a Perfect Audit
1. **Robots.txt Directives**: Ensuring crawlers aren't disallowed from critical CSS, JavaScript, or product taxonomy.
2. **Title & Meta Snippets**: Calibrating exact lengths (25–65 characters for title, 60–165 for meta descriptions) to avoid awkward SERP truncation.
3. **Structured Data Hierarchy**: Adding Organization, LocalBusiness, and FAQ schemas directly in JSON-LD.
4. **Header Tag Sequencing**: Enforcing exactly one semantic H1 tag per page followed by logical H2/H3 hierarchies.
5. **Mobile Viewport & Security**: Valid HTTPS handshakes, responsive viewport tags, and low TTFB (Time to First Byte).

By addressing these technical flaws with automated code snippets, SEO agencies can pitch prospective clients with undeniable empirical proof of what needs fixing.`,
    featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    author: 'LeadPulse Technical Team',
    read_time: '6 min read',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: 'published',
    views: 482,
  },
  {
    id: 'post-2',
    title: 'The B2B Lead Scraping Playbook: From Cold URL to Executive Contract',
    slug: 'b2b-lead-scraping-playbook',
    category_id: 'cat-2',
    category_name: 'B2B Lead Generation',
    excerpt: 'A comprehensive workflow for scraping deeply nested contact pages, verifying corporate emails, and bypassing generic inbox filters.',
    content: `### Sourcing Verified Decision-Maker Data

Cold email campaigns fail when sales teams blast generic \`info@\` or \`support@\` email addresses. High-converting B2B outreach requires direct executive contact points, including verified work emails, corporate phone numbers, and official LinkedIn profiles.

#### Deep Crawling vs. Surface Scraping
Surface scrapers only look at the homepage footer. A true enterprise crawler traverses:
- \`/contact\`, \`/contact-us\`, \`/get-in-touch\`
- \`/about\`, \`/our-team\`, \`/leadership\`
- Legal registry disclosures, privacy footnotes, and copyright statements

#### Verification Scoring
Every lead should carry a confidence score based on syntax verification, domain MX records, and multi-source cross-referencing. When confidence exceeds 90%, deliverability jumps to 98%+, keeping your sender domain off spam blacklists.`,
    featured_image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    author: 'Sarah Lin, Lead Gen Director',
    read_time: '8 min read',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    status: 'published',
    views: 890,
  },
  {
    id: 'post-3',
    title: 'How to Turn Free SEO Audits into $3,000/Month Agency Retainers',
    slug: 'turn-free-seo-audits-into-client-retainers',
    category_id: 'cat-3',
    category_name: 'Agency Growth & Outreach',
    excerpt: 'Step-by-step cold pitch templates and visual audit reports that convince business owners to hire your optimization team immediately.',
    content: `### The "Value-First" Pitch Formula

Most cold outreach consists of vague promises like *"We can get you to page 1 on Google!"* Business owners delete these instantly.

In contrast, when you send a personalized video or PDF audit showing:
1. Their exact current score (e.g., 68/100, Grade C)
2. The 3 critical mistakes currently driving customers to their competitors
3. Copy-paste code fixes already written for their developer
4. Estimated lost monthly traffic

The conversation shifts from *"Who is this stranger trying to sell me?"* to *"This agency already solved my problem before asking for a dollar."* Use LeadPulse's one-click Pitch Generator to draft these proposals in 30 seconds.`,
    featured_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    author: 'Alex Vance, SEO Strategist',
    read_time: '5 min read',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    status: 'published',
    views: 1240,
  },
];

export const initialCustomPages: CustomPage[] = [
  {
    id: 'page-about',
    title: 'About LeadPulse AI',
    slug: 'about-us',
    content: `## About LeadPulse AI

LeadPulse AI is the industry-standard all-in-one lead generation engine, technical SEO crawler, and business intelligence platform built for growth agencies, marketing consultants, and enterprise sales teams.

### Our Mission
We believe every growth team deserves transparent, accurate, and deeply actionable business data. We eliminate guesswork by combining deep site crawling with direct executive contact verification and instant technical audit reporting.

### Why Choose Us
- **Live Empirical Audits**: We don't rely on outdated third-party databases. Every audit inspects real DOM elements, live server response times, and robots.txt directives.
- **Strict Data Verification**: Our multi-step enrichment validates emails, formats phone numbers, and verifies social presence.
- **Admin-Controlled Credits**: Fair, flexible credit pricing with diverse local and international payment options managed securely.`,
    meta_description: 'Discover the story, mission, and technical innovation behind LeadPulse AI - the premier lead extraction and SEO audit platform.',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    is_published: true,
  },
  {
    id: 'page-privacy',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `## Privacy Policy & Data Protection

Last Updated: October 2025

### 1. Information We Collect
LeadPulse AI collects publicly available corporate contact information (such as official business names, publicly listed emails, phone numbers, and website addresses) for the sole purpose of commercial research and technical diagnostics.

### 2. How Data is Used
Data queried on our platform is used solely to generate technical SEO diagnostic reports, identify website performance errors, and facilitate direct professional business-to-business communications.

### 3. Payment Privacy & Security
All credit purchase requests and transactions are handled with strict privacy. Admin verifies payments through secure references and does not store sensitive personal financial keys on client-side storage.`,
    meta_description: 'Read the LeadPulse AI Privacy Policy regarding data extraction, confidentiality, and user protection standards.',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    is_published: true,
  },
  {
    id: 'page-terms',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: `## Terms of Service

### 1. Acceptance of Terms
By accessing or using LeadPulse AI, you agree to comply with and be bound by these Terms of Service.

### 2. Fair Use & Crawling Policy
Users agree to utilize the scraper and audit features in accordance with robots.txt standards, applicable local laws, and courteous crawling rate limits.

### 3. Credit System & Admin Approval
Credits represent platform compute tokens. Purchase requests submitted by users are reviewed and approved directly by the Platform Administrator based on verified payment receipts.`,
    meta_description: 'Terms of Service and conditions for using LeadPulse AI lead scraping and website SEO audit services.',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    is_published: true,
  },
  {
    id: 'page-credit-policy',
    title: 'Credit & Payment Policy',
    slug: 'credit-policy',
    content: `## Credit Allotment & Payment Policy

### How Credits Work
- 1 Lead Crawl & Full Verification: 1 Credit
- 1 Deep Technical SEO Audit & AI Pitch: 2 Credits
- Daily Free Bonus Refill: +25 Free Credits every 24 hours

### Purchasing Additional Credits
When purchasing credits:
1. Select your preferred package or custom credit amount.
2. Choose from any of the Admin's currently active payment options (Bank Transfer, EasyPaisa, JazzCash, USDT, or PayPal).
3. Transfer the funds using the account details provided and submit your Transaction Reference ID.
4. The Platform Administrator verifies the incoming payment and credits your account balance promptly.`,
    meta_description: 'Comprehensive overview of LeadPulse AI credit consumption, purchase methods, and approval workflows.',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    is_published: true,
  },
];

export const initialPurchaseRequests: CreditPurchaseRequest[] = [
  {
    id: 'order-101',
    user_id: 'user-client-2',
    user_name: 'Growth Agency HQ',
    user_email: 'growth@agency.io',
    amount_credits: 1000,
    payment_method_id: 'pm-1',
    payment_method_name: 'Bank Transfer (Meezan Bank / HBL / IBAN)',
    transaction_id: 'PK-BNK-99823412',
    sender_account: 'Growth Agency Meezan A/C',
    notes: 'Paid for Pro Growth package via online portal.',
    amount_paid: '$49 (Rs. 13,800)',
    status: 'approved',
    credits_granted: 1000,
    admin_notes: 'Payment confirmed in Meezan Bank account. 1000 credits assigned.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'order-102',
    user_id: 'user-client-1',
    user_name: 'Demo Client User',
    user_email: 'client@leadpulse.ai',
    amount_credits: 500,
    payment_method_id: 'pm-2',
    payment_method_name: 'EasyPaisa Mobile Account',
    transaction_id: 'EP-78219034',
    sender_account: '0301-4455667',
    notes: 'Transferred Rs. 7,000 for 500 lead credits top-up.',
    amount_paid: 'Rs. 7,000 ($25)',
    status: 'pending',
    admin_notes: '',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

export const veritasAudit: SEOAuditData = {
  url: 'https://veritasdynamics.ai',
  domain: 'veritasdynamics.ai',
  audited_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  overall_score: 84,
  grade: 'A',
  lead_id: 'lead-1',
  lead_name: 'Veritas Dynamics Inc.',
  lead_email: 'hello@veritasdynamics.ai',
  categories: {
    on_page: { name: 'On-Page SEO', grade: 'A', score: 82, passed: 6, warnings: 2, errors: 0, summary: 'Well optimized on-page signals' },
    links: { name: 'Links', grade: 'A', score: 88, passed: 3, warnings: 0, errors: 0, summary: '44 total links (36 internal, 8 external)' },
    usability: { name: 'Usability', grade: 'A+', score: 95, passed: 4, warnings: 0, errors: 0, summary: 'Mobile optimized viewport detected' },
    performance: { name: 'Performance', grade: 'A', score: 86, passed: 3, warnings: 0, errors: 0, summary: 'Response time 340ms, page size 56.4 KB' },
    social: { name: 'Social', grade: 'B', score: 75, passed: 2, warnings: 1, errors: 0, summary: '3 social profile(s) connected' },
  },
  keywords_analysis: [
    { keyword: 'enterprise', count: 22, inTitle: true, inMetaDesc: true, inHeadings: true },
    { keyword: 'infrastructure', count: 18, inTitle: true, inMetaDesc: true, inHeadings: true },
    { keyword: 'streaming', count: 14, inTitle: false, inMetaDesc: true, inHeadings: true },
    { keyword: 'compliance', count: 11, inTitle: false, inMetaDesc: true, inHeadings: true },
    { keyword: 'pipeline', count: 9, inTitle: false, inMetaDesc: false, inHeadings: true },
    { keyword: 'distributed', count: 8, inTitle: false, inMetaDesc: true, inHeadings: false },
    { keyword: 'workloads', count: 6, inTitle: false, inMetaDesc: true, inHeadings: false },
  ],
  links_analysis: {
    total_links: 44,
    internal_links: 36,
    external_links: 8,
    dofollow_links: 41,
    nofollow_links: 3,
    sample_internal: [
      { text: 'Solutions', href: 'https://veritasdynamics.ai/solutions' },
      { text: 'Architecture Overview', href: 'https://veritasdynamics.ai/platform' },
      { text: 'Compliance Engine', href: 'https://veritasdynamics.ai/compliance' },
      { text: 'Developer Docs', href: 'https://veritasdynamics.ai/docs' },
      { text: 'Leadership Team', href: 'https://veritasdynamics.ai/team' },
      { text: 'Contact & Assessment', href: 'https://veritasdynamics.ai/contact' },
    ],
    sample_external: [
      { text: 'LinkedIn Company', href: 'https://linkedin.com/company/veritas-ai' },
      { text: 'X (Twitter)', href: 'https://x.com/veritasdynamics' },
      { text: 'GitHub Open Source', href: 'https://github.com/veritasdynamics' },
    ],
  },
  social_analysis: {
    has_open_graph: true,
    og_title: 'Veritas Dynamics | Enterprise AI & Distributed Infrastructure',
    og_description: 'Enterprise AI & distributed streaming data infrastructure systems for high-throughput compliance workloads.',
    og_image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    og_url: 'https://veritasdynamics.ai',
    has_twitter_card: true,
    twitter_card_type: 'summary_large_image',
    twitter_title: 'Veritas Dynamics | Enterprise AI Infrastructure',
    twitter_image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    detected_profiles: {
      linkedin: 'https://linkedin.com/company/veritas-ai',
      twitter: 'https://x.com/veritasdynamics',
      github: 'https://github.com/veritasdynamics',
    },
  },
  usability_analysis: {
    has_viewport: true,
    has_favicon: true,
    favicon_url: 'https://www.google.com/s2/favicons?domain=veritasdynamics.ai&sz=64',
    has_apple_icon: true,
    language: 'en',
    charset: 'UTF-8',
    mobile_ready_score: 96,
  },
  summary: {
    critical_errors: 0,
    warnings: 3,
    passed_checks: 8,
  },
  metrics: {
    title: {
      value: 'Veritas Dynamics Inc. | Enterprise AI & Distributed Data Infrastructure Platform',
      length: 77,
      status: 'warning',
      message: 'Title tag is 77 chars long. Google SERPs typically truncate titles after 65 characters.',
    },
    meta_description: {
      value: 'Enterprise AI & distributed streaming data infrastructure systems for high-throughput compliance workloads. Schedule a discovery session today.',
      length: 144,
      status: 'good',
      message: 'Meta description length is ideal (144 chars, recommended 60-165 chars).',
    },
    canonical: {
      value: 'https://veritasdynamics.ai/',
      status: 'good',
      message: 'Canonical URL link tag is properly specified.',
    },
    h1_count: 1,
    h1_samples: ['Autonomous Enterprise AI & Real-Time Data Infrastructure'],
    h2_count: 6,
    h3_count: 12,
    word_count: 1480,
    images_count: 16,
    images_missing_alt: 3,
    is_https: true,
    has_viewport: true,
    has_robots_txt: true,
    has_sitemap: true,
    has_schema_org: false,
    has_open_graph: true,
    has_twitter_card: true,
    has_google_analytics: true,
    has_gtm: false,
    has_facebook_pixel: false,
    has_noindex: false,
    is_compressed: true,
    email_privacy_exposed: false,
    exposed_emails_count: 0,
    response_time_ms: 340,
    page_size_kb: 56.4,
  },
  mistakes: [
    {
      id: 'mistake-title-length',
      category: 'meta_tags',
      title: 'Title Tag Exceeds Recommended Length',
      severity: 'warning',
      description: 'The current title is 77 characters long ("Veritas Dynamics Inc. | Enterprise AI & Distributed Data Infrastructure Platform").',
      impact: 'Google desktop and mobile SERPs truncate titles longer than 60-65 characters with an ellipsis, obscuring your core brand message.',
      currentValue: '77 characters',
      recommendedFix: 'Shorten page title to 50-60 characters (e.g., "Veritas Dynamics | Enterprise AI & Data Infrastructure").',
      codeSample: '<title>Veritas Dynamics | Enterprise AI & Data Infrastructure</title>',
    },
    {
      id: 'mistake-image-alt',
      category: 'content_headings',
      title: '3 Images Missing Alt Attribute',
      severity: 'warning',
      description: 'Found 3 out of 16 total images on the homepage without descriptive alt text.',
      impact: 'Reduces search visibility in Google Image search and impairs accessibility for screen-reading software.',
      currentValue: '3/16 images lack alt text',
      recommendedFix: 'Add keyword-aligned descriptive alt attributes to all content and architecture diagram images.',
      codeSample: '<img src="/img/architecture-diagram.webp" alt="Veritas high-throughput streaming architecture overview" />',
    },
    {
      id: 'mistake-schema-missing',
      category: 'performance_technical',
      title: 'Missing Schema.org Structured Data',
      severity: 'warning',
      description: 'No JSON-LD structured data (schema.org) was detected in the document header.',
      impact: 'Prevents Google from generating Rich Snippets (Knowledge Panel, site breadcrumbs, organizational search markup) in search results.',
      currentValue: 'No JSON-LD schema detected',
      recommendedFix: 'Implement Organization and SoftwareApplication schema in JSON-LD format in your page <head>.',
      codeSample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Veritas Dynamics Inc.",
  "url": "https://veritasdynamics.ai",
  "logo": "https://veritasdynamics.ai/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-650-412-9900",
    "contactType": "customer support"
  }
}
</script>`,
    },
  ],
  passed_checks: [
    { title: 'Meta Description Optimized', detail: 'Ideal length (144 chars) with strong conversion action: "Enterprise AI & distributed streaming..."' },
    { title: 'Primary H1 Structure Validated', detail: 'Single primary H1 found: "Autonomous Enterprise AI & Real-Time Data Infrastructure"' },
    { title: 'Mobile Viewport Configured', detail: 'Responsive viewport meta tag active for all mobile devices.' },
    { title: 'SSL / HTTPS Security Active', detail: 'Secure encrypted connection with valid TLS certificate.' },
    { title: 'Robots.txt Crawl Directives Valid', detail: 'Verified crawl instructions active at https://veritasdynamics.ai/robots.txt' },
    { title: 'XML Sitemap Available', detail: 'Discovered XML sitemap declared at https://veritasdynamics.ai/sitemap.xml' },
    { title: 'Fast Server Response (TTFB)', detail: 'Clocked at 340ms (well under the 1,200ms Core Web Vitals threshold).' },
    { title: 'Social Open Graph Cards', detail: 'Open Graph title, description, and preview card active for social platforms.' },
  ],
  ai_optimizer_recommendations: [
    'Refine the primary page title to under 65 characters to avoid mobile SERP truncation.',
    'Add descriptive alt text to the 3 untagged product screenshot images.',
    'Implement Organization JSON-LD Schema markup in page head to capture Google Rich Snippets.',
    'Consider adding FAQ schema to address common enterprise compliance questions directly in SERPs.',
  ],
  suggested_pitch_email: {
    subject: 'Quick SEO audit for veritasdynamics.ai: 3 high-impact fixes for Google rankings',
    body: `Hi Sarah,\n\nI hope you're doing well.\n\nI recently ran an in-depth technical SEO optimizer audit on veritasdynamics.ai and wanted to share a few quick findings that could significantly boost your organic visibility on Google.\n\nVeritas Dynamics is currently scoring 84/100 (Health Grade A), but there are 3 quick fixes that will protect your search rankings:\n\n1. Title Tag SERP Truncation: Your current title is 77 characters long. Google cuts this off on mobile screens. Shortening it to under 65 chars prevents truncation.\n2. Missing Image Alt Tags: 3 product images on the homepage lack descriptive alt attributes, costing you qualified image search traffic and accessibility compliance.\n3. Schema.org Structured Data: Adding JSON-LD Organization markup will help Google recognize Veritas Dynamics as an established authority and generate rich snippet cards in search results.\n\nI've already drafted the exact code snippets for your web development team. Would you be open to a quick 10-minute sync this week so I can share the complete technical report?\n\nBest regards,\n\nLeadPulse Technical Growth Team\nAudit Engine: https://veritasdynamics.ai`,
    recipient_email: 'hello@veritasdynamics.ai',
  },
};
