export type VerificationStatus = 'Verified' | 'Unverified' | 'Not Found';

export interface SourcePage {
  id: string;
  lead_id: string;
  url: string;
  page_type: 'index' | 'about' | 'contact' | 'team' | 'services' | 'careers' | 'legal' | 'subpage';
  http_status: number;
  extracted_at: string;
  note?: string;
}

export interface ExtractedField {
  id: string;
  lead_id: string;
  field_name: string;
  field_value: string;
  source_url: string;
  confidence_score: number;
  verification_status: VerificationStatus;
  note?: string;
}

export interface Lead {
  id: string;
  business_name: string;
  category: string;
  description: string;
  website: string;
  email: string;
  email_status: VerificationStatus;
  email_confidence: number;
  email_source?: string;
  phone: string;
  phone_status: VerificationStatus;
  phone_confidence: number;
  phone_source?: string;
  alt_phone?: string;
  contact_person: string;
  contact_person_role?: string;
  contact_person_source?: string;
  contact_page_url?: string;
  address: string;
  address_source?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  twitter: string;
  tiktok: string;
  github?: string;
  verification_status: VerificationStatus;
  confidence_score: number;
  pages_crawled: number;
  crawl_depth: number;
  last_checked: string;
  created_at: string;
  updated_at: string;
  source_pages: SourcePage[];
  extracted_fields: ExtractedField[];
  seo_audit?: SEOAuditData;
}

export interface ScrapingJob {
  id: string;
  url: string;
  domain: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pages_crawled: number;
  max_pages: number;
  crawl_depth: number;
  progress_percent: number;
  current_subpath?: string;
  duration_seconds: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  compliance_note?: string;
  discovered_counts: {
    emails: number;
    phones: number;
    socials: number;
  };
  lead_id?: string;
}

export interface ScraperSettings {
  max_pages_per_website: number;
  max_crawl_depth: number;
  request_delay_ms: number;
  timeout_seconds: number;
  respect_robots_txt: boolean;
  ai_validation: 'Strict' | 'Standard' | 'Off';
  export_preferences: {
    default_format: 'csv' | 'excel';
    include_audit_trail: boolean;
  };
  duplicate_handling: 'update' | 'skip' | 'keep_both';
  confidence_threshold: number;
}

export interface DashboardStats {
  total_leads: number;
  emails_found: number;
  phone_lines_found: number;
  social_profiles_found: number;
  average_confidence: number;
  verified_percentage: number;
  recent_leads_growth: string;
}

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'leads'
  | 'bulk'
  | 'audit'
  | 'history'
  | 'settings'
  | 'blog'
  | 'page'
  | 'admin';

export interface PaymentMethod {
  id: string;
  name: string; // e.g. "Bank Transfer (Meezan Bank)", "EasyPaisa", "JazzCash", "PayPal", "USDT / Crypto", "Wise"
  account_title: string;
  account_number: string; // Account # / IBAN / Wallet Address
  instructions: string;
  is_active: boolean;
  created_at: string;
}

export interface CreditPurchaseRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  amount_credits: number;
  payment_method_id: string;
  payment_method_name: string;
  transaction_id: string;
  sender_account?: string;
  notes?: string;
  amount_paid: string;
  status: 'pending' | 'approved' | 'rejected';
  credits_granted?: number;
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  credits: number;
  plan: 'Starter Pack' | 'Pro Growth' | 'Agency Scale';
  created_at: string;
  status: 'active' | 'suspended';
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  category_name: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author: string;
  read_time: string;
  published_at: string;
  status: 'published' | 'draft';
  views: number;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  updated_at: string;
  is_published: boolean;
}


export type IssueSeverity = 'critical' | 'warning' | 'good';
export type SEOCategory = 'meta_tags' | 'content_headings' | 'performance_technical' | 'links_social' | 'mobile_security';

export interface SEOMistake {
  id: string;
  category: SEOCategory;
  title: string;
  severity: IssueSeverity;
  priority?: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  currentValue?: string;
  recommendedFix: string;
  codeSample?: string;
}

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F';

export interface SEOCategoryGrade {
  name: string;
  grade: Grade;
  score: number;
  passed: number;
  warnings: number;
  errors: number;
  summary: string;
}

export interface SEOAuditCategories {
  on_page: SEOCategoryGrade;
  links: SEOCategoryGrade;
  usability: SEOCategoryGrade;
  performance: SEOCategoryGrade;
  social: SEOCategoryGrade;
}

export interface SEOKeywordItem {
  keyword: string;
  count: number;
  inTitle: boolean;
  inMetaDesc: boolean;
  inHeadings: boolean;
}

export interface SEOLinksAnalysis {
  total_links: number;
  internal_links: number;
  external_links: number;
  dofollow_links: number;
  nofollow_links: number;
  broken_links?: number;
  sample_internal?: { text: string; href: string }[];
  sample_external?: { text: string; href: string }[];
}

export interface SEOSocialAnalysis {
  has_open_graph: boolean;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_url?: string;
  has_twitter_card: boolean;
  twitter_card_type?: string;
  twitter_title?: string;
  twitter_image?: string;
  detected_profiles: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    github?: string;
  };
}

export interface SEOUsabilityAnalysis {
  has_viewport: boolean;
  has_favicon: boolean;
  favicon_url?: string;
  has_apple_icon: boolean;
  language?: string;
  charset?: string;
  mobile_ready_score: number;
}

export interface SEOAuditData {
  url: string;
  domain: string;
  audited_at: string;
  overall_score: number; // 0 - 100
  grade: Grade;
  lead_id?: string;
  lead_name?: string;
  lead_email?: string;
  categories?: SEOAuditCategories;
  keywords_analysis?: SEOKeywordItem[];
  links_analysis?: SEOLinksAnalysis;
  social_analysis?: SEOSocialAnalysis;
  usability_analysis?: SEOUsabilityAnalysis;
  summary: {
    critical_errors: number;
    warnings: number;
    passed_checks: number;
  };
  metrics: {
    title: { value: string; length: number; status: IssueSeverity; message: string };
    meta_description: { value: string; length: number; status: IssueSeverity; message: string };
    canonical: { value: string; status: IssueSeverity; message: string };
    h1_count: number;
    h1_samples: string[];
    h2_count: number;
    h3_count: number;
    word_count: number;
    images_count: number;
    images_missing_alt: number;
    is_https: boolean;
    has_viewport: boolean;
    has_robots_txt: boolean;
    has_sitemap: boolean;
    has_schema_org: boolean;
    has_open_graph: boolean;
    has_twitter_card: boolean;
    response_time_ms: number;
    page_size_kb: number;
    h4_count?: number;
    has_heading_hierarchy_gap?: boolean;
    og_image_present?: boolean;
    twitter_image_present?: boolean;
    external_assets_count?: number;
    external_scripts_count?: number;
    external_stylesheets_count?: number;
    total_external_assets?: number;
    has_hsts?: boolean;
    has_x_content_type_options?: boolean;
    has_google_analytics?: boolean;
    has_gtm?: boolean;
    has_facebook_pixel?: boolean;
    has_noindex?: boolean;
    is_compressed?: boolean;
    email_privacy_exposed?: boolean;
    exposed_emails_count?: number;
  };
  mistakes: SEOMistake[];
  passed_checks: { title: string; detail: string }[];
  ai_optimizer_recommendations?: string[];
  suggested_pitch_email: {
    subject: string;
    body: string;
    recipient_email?: string;
  };
}

export type CreditTransactionType = 'deduction' | 'addition' | 'bonus';

export interface CreditTransaction {
  id: string;
  type: CreditTransactionType;
  amount: number; // e.g., -1, -2, +100, +25
  reason: string;
  target?: string;
  timestamp: string;
  balance_after: number;
}

export interface CreditAccount {
  balance: number;
  total_spent: number;
  total_earned: number;
  plan_tier: 'Starter Pack' | 'Pro Growth' | 'Agency Scale';
  daily_bonus_available: boolean;
  last_daily_bonus?: string;
  transactions: CreditTransaction[];
}

