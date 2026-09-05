import {
  Lead,
  ScrapingJob,
  ScraperSettings,
  DashboardStats,
  SEOAuditData,
  CreditAccount,
  CreditTransaction,
  PaymentMethod,
  CreditPurchaseRequest,
  AppUser,
  BlogCategory,
  BlogPost,
  CustomPage,
} from '../src/types.js';

// Pre-seeded high quality realistic business leads matching mockups
const initialLeads: Lead[] = [
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

const initialJobs: ScrapingJob[] = [
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

const initialSettings: ScraperSettings = {
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

const initialCreditAccount: CreditAccount = {
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

const initialPaymentMethods: PaymentMethod[] = [
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

const initialUsers: AppUser[] = [
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

const initialBlogCategories: BlogCategory[] = [
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

const initialBlogPosts: BlogPost[] = [
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

const initialCustomPages: CustomPage[] = [
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

const initialPurchaseRequests: CreditPurchaseRequest[] = [
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

class Database {
  private leads: Lead[] = [...initialLeads];
  private jobs: ScrapingJob[] = [...initialJobs];
  private settings: ScraperSettings = { ...initialSettings };
  private credits: CreditAccount = { ...initialCreditAccount, transactions: [...initialCreditAccount.transactions] };
  private audits: Map<string, SEOAuditData> = new Map();
  private paymentMethods: PaymentMethod[] = [...initialPaymentMethods];
  private users: AppUser[] = [...initialUsers];
  private categories: BlogCategory[] = [...initialBlogCategories];
  private blogPosts: BlogPost[] = [...initialBlogPosts];
  private pages: CustomPage[] = [...initialCustomPages];
  private purchaseRequests: CreditPurchaseRequest[] = [...initialPurchaseRequests];

  constructor() {
    this.seedInitialAudits();
  }

  private seedInitialAudits() {
    const veritasAudit: SEOAuditData = {
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

    this.saveAudit(veritasAudit);
  }

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

    // Sort by updated_at descending
    result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return result;
  }

  public getLeadById(id: string): Lead | undefined {
    return this.leads.find((lead) => lead.id === id);
  }

  public getLeadByWebsite(website: string): Lead | undefined {
    const clean = website.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    return this.leads.find((lead) => {
      const existingClean = lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
      return existingClean === clean;
    });
  }

  public saveLead(lead: Lead): Lead {
    const index = this.leads.findIndex((l) => l.id === lead.id);
    if (index >= 0) {
      this.leads[index] = { ...lead, updated_at: new Date().toISOString() };
      return this.leads[index];
    } else {
      this.leads.unshift(lead);
      return lead;
    }
  }

  public deleteLead(id: string): boolean {
    const prevLen = this.leads.length;
    this.leads = this.leads.filter((l) => l.id !== id);
    return this.leads.length < prevLen;
  }

  public deleteBatchLeads(ids: string[]): number {
    const set = new Set(ids);
    const prev = this.leads.length;
    this.leads = this.leads.filter((l) => !set.has(l.id));
    return prev - this.leads.length;
  }

  public getJobs(): ScrapingJob[] {
    return [...this.jobs];
  }

  public addJob(job: ScrapingJob): ScrapingJob {
    this.jobs.unshift(job);
    return job;
  }

  public updateJob(id: string, updates: Partial<ScrapingJob>): ScrapingJob | undefined {
    const job = this.jobs.find((j) => j.id === id);
    if (job) {
      Object.assign(job, updates);
      return job;
    }
    return undefined;
  }

  public clearCompletedJobs(): void {
    this.jobs = this.jobs.filter((j) => j.status === 'processing' || j.status === 'pending');
  }

  public getSettings(): ScraperSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<ScraperSettings>): ScraperSettings {
    this.settings = { ...this.settings, ...newSettings };
    return { ...this.settings };
  }

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
      recent_leads_growth: '+12% this week'
    };
  }

  public saveAudit(audit: SEOAuditData): SEOAuditData {
    const key = audit.domain.toLowerCase();
    this.audits.set(key, audit);
    if (audit.lead_id) {
      const lead = this.getLeadById(audit.lead_id);
      if (lead) {
        lead.seo_audit = audit;
      }
    } else {
      const lead = this.getLeadByWebsite(audit.domain);
      if (lead) {
        lead.seo_audit = audit;
      }
    }
    return audit;
  }

  public getAudit(domainOrLeadId: string): SEOAuditData | undefined {
    const cleanKey = domainOrLeadId.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    if (this.audits.has(cleanKey)) {
      return this.audits.get(cleanKey);
    }
    for (const audit of this.audits.values()) {
      if (audit.lead_id === domainOrLeadId || audit.domain.toLowerCase() === cleanKey) {
        return audit;
      }
    }
    // Also check lead attached audit
    const lead = this.getLeadById(domainOrLeadId) || this.getLeadByWebsite(domainOrLeadId);
    if (lead && lead.seo_audit) {
      return lead.seo_audit;
    }
    return undefined;
  }

  public getAllAudits(): SEOAuditData[] {
    return Array.from(this.audits.values());
  }

  // Credit Account Management
  public getCreditAccount(): CreditAccount {
    // Check if daily bonus is ready (24 hours passed since last bonus)
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
    // Keep max 50 recent transactions
    if (this.credits.transactions.length > 50) {
      this.credits.transactions = this.credits.transactions.slice(0, 50);
    }

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
    return {
      success: true,
      bonus,
      account: this.getCreditAccount(),
      message: `Successfully claimed +${bonus} Free Daily Credits! Your new balance is ${this.credits.balance}.`,
    };
  }

  // ================= PAYMENT METHODS =================
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
    return newMethod;
  }

  public updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): PaymentMethod | null {
    const idx = this.paymentMethods.findIndex((pm) => pm.id === id);
    if (idx === -1) return null;
    this.paymentMethods[idx] = { ...this.paymentMethods[idx], ...updates };
    return this.paymentMethods[idx];
  }

  public deletePaymentMethod(id: string): boolean {
    const prev = this.paymentMethods.length;
    this.paymentMethods = this.paymentMethods.filter((pm) => pm.id !== id);
    return this.paymentMethods.length < prev;
  }

  // ================= CREDIT PURCHASE ORDERS =================
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

    // Also credit to the matching user if found, plus global credits pool
    const user = this.users.find(
      (u) => u.id === req.user_id || u.email.toLowerCase() === req.user_email.toLowerCase()
    );
    if (user) {
      user.credits += grantAmount;
    }

    // Add to active account credits balance
    this.addCredits(
      grantAmount,
      `Credit Order Approved (${req.payment_method_name} - Ref: ${req.transaction_id})`
    );

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

    return {
      success: true,
      request: req,
      message: 'Purchase request has been marked as rejected.',
    };
  }

  // ================= USERS & DIRECT CREDITS CONTROL =================
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

    return {
      success: true,
      user,
      message: `Adjusted ${user.name}'s credits by ${delta > 0 ? '+' : ''}${delta}. Current balance: ${user.credits}.`,
    };
  }

  public updateUserStatus(id: string, status: 'active' | 'suspended'): boolean {
    const user = this.users.find((u) => u.id === id);
    if (!user) return false;
    user.status = status;
    return true;
  }

  // ================= BLOG CATEGORIES =================
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
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<BlogCategory>): BlogCategory | null {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.categories[idx] = { ...this.categories[idx], ...updates };
    return this.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const prev = this.categories.length;
    this.categories = this.categories.filter((c) => c.id !== id);
    return this.categories.length < prev;
  }

  // ================= BLOG POSTS =================
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
    return newPost;
  }

  public updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | null {
    const idx = this.blogPosts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.blogPosts[idx] = { ...this.blogPosts[idx], ...updates };
    return this.blogPosts[idx];
  }

  public deleteBlogPost(id: string): boolean {
    const prev = this.blogPosts.length;
    this.blogPosts = this.blogPosts.filter((p) => p.id !== id);
    return this.blogPosts.length < prev;
  }

  public incrementBlogPostViews(slug: string): void {
    const post = this.blogPosts.find((p) => p.slug === slug);
    if (post) {
      post.views = (post.views || 0) + 1;
    }
  }

  // ================= CUSTOM PAGES =================
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
    return newPage;
  }

  public updatePage(id: string, updates: Partial<CustomPage>): CustomPage | null {
    const idx = this.pages.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.pages[idx] = { ...this.pages[idx], ...updates, updated_at: new Date().toISOString() };
    return this.pages[idx];
  }

  public deletePage(id: string): boolean {
    const prev = this.pages.length;
    this.pages = this.pages.filter((p) => p.id !== id);
    return this.pages.length < prev;
  }
}

export const db = new Database();
