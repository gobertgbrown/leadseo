import React, { useState, useEffect } from 'react';
import { BlogPost, CustomPage } from '../types.js';
import { APP_ASSETS } from '../assets.js';
import {
  Search,
  Sparkles,
  SearchCheck,
  Users,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Coins,
  Globe,
  Lock,
  Star,
  Zap,
  Code,
  FileSpreadsheet,
  Check,
  BarChart3,
  BookOpen,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  onRunInstantAudit: (domain: string) => void;
  onOpenCreditsModal: () => void;
  onNavigateBlog: () => void;
  onNavigatePage: (slug: string) => void;
  onOpenAdminGate: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onRunInstantAudit,
  onOpenCreditsModal,
  onNavigateBlog,
  onNavigatePage,
  onOpenAdminGate,
}) => {
  const [instantUrl, setInstantUrl] = useState('');
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Fetch latest blogs & pages for the landing footer and highlights
    fetch('/api/blogs')
      .then((r) => r.json())
      .then((d) => {
        if (d.posts) setRecentPosts(d.posts.slice(0, 3));
      })
      .catch(() => {});

    fetch('/api/pages')
      .then((r) => r.json())
      .then((d) => {
        if (d.pages) setCustomPages(d.pages);
      })
      .catch(() => {});
  }, []);

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instantUrl.trim()) return;
    onRunInstantAudit(instantUrl.trim());
  };

  const FAQS = [
    {
      q: 'How does the deep B2B website crawler find emails & phones?',
      a: 'LeadPulse initiates polite asynchronous HTTP workers that crawl your target domain up to 3 sub-levels deep, automatically discovering high-intent subpages like /contact, /about, /team, and /privacy. It parses regex mailto signatures, tel links, and social footprints while verifying MX records to eliminate bounce rates.',
    },
    {
      q: 'How accurate is the technical SEO site audit tool?',
      a: 'The SEO audit engine performs 18+ real-world checks matching Google SERP benchmarks: title tag lengths, meta descriptions, crawler robots.txt access, XML sitemaps, OpenGraph cards, schema.org JSON-LD, and Core Web Vitals. It assigns an actionable letter grade (A+ to F) and lists copy-paste code fixes.',
    },
    {
      q: 'How does the credit system work and how do I buy credits?',
      a: 'Each lead crawl or technical SEO audit consumes credits. You can purchase credits anytime using our supported payment methods (Bank Transfer, EasyPaisa, JazzCash, USDT Crypto, or PayPal). Once you submit your payment reference ID, the administrator confirms the transaction and credits your account balance.',
    },
    {
      q: 'Can I export scraped leads with their SEO audit reports?',
      a: 'Yes! All discovered leads and technical audits can be exported instantly to CSV, Excel-ready XLSX, or JSON formats, complete with contact information and SEO pitch recommendations.',
    },
  ];

  return (
    <div id="leadpulse-landing-page" className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#faf8ff]/85 backdrop-blur-xl border-b border-[#eaedff]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onLaunchApp}>
            <img
              src={APP_ASSETS.logo}
              alt="LeadPulse AI Logo"
              className="h-8 w-auto object-contain flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-bold text-lg text-[#131b2e] tracking-tight">
              LeadPulse <span className="text-[#3525cd]">AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#464555]">
            <a href="#features" className="hover:text-[#3525cd] transition-colors">
              Features
            </a>
            <a href="#audit-demo" className="hover:text-[#3525cd] transition-colors">
              Site Audit
            </a>
            <a href="#pricing" className="hover:text-[#3525cd] transition-colors">
              Pricing & Credits
            </a>
            <button
              onClick={onNavigateBlog}
              className="hover:text-[#3525cd] transition-colors text-xs font-semibold"
            >
              Blog & Guides
            </button>
            {customPages.length > 0 && (
              <button
                onClick={() => onNavigatePage(customPages[0].slug)}
                className="hover:text-[#3525cd] transition-colors text-xs font-semibold"
              >
                {customPages[0].title}
              </button>
            )}
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCreditsModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eaedff] hover:bg-[#d6e0ff] text-xs font-bold text-[#3525cd] transition-all"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Buy Credits</span>
            </button>
            <button
              onClick={onLaunchApp}
              className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#3525cd]/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-[#3525cd]/10 to-[#006e4b]/10 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eaedff] text-[#3525cd] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Lead Discovery & Technical SEO</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#131b2e] leading-[1.1] mb-6">
            Autonomous B2B Lead Extraction &{' '}
            <span className="bg-gradient-to-r from-[#3525cd] to-[#6366f1] bg-clip-text text-transparent">
              Deep Technical SEO
            </span>{' '}
            Engine
          </h1>

          <p className="text-base sm:text-lg text-[#464555] max-w-2xl mx-auto mb-10 leading-relaxed">
            Crawl company websites at scale, extract verified C-level emails, phones & social
            handles, and generate automated technical SEO audit teardowns that close agency deals.
          </p>

          {/* Instant Audit Search Form directly in Hero */}
          <div className="max-w-2xl mx-auto bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-[#eaedff] mb-8">
            <form onSubmit={handleAuditSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-[#595768]" />
                <input
                  type="text"
                  required
                  value={instantUrl}
                  onChange={(e) => setInstantUrl(e.target.value)}
                  placeholder="Enter any website (e.g., stripe.com or client-domain.com)"
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-transparent rounded-xl focus:outline-none focus:border-[#3525cd] text-[#131b2e]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#3525cd]/20 flex items-center justify-center gap-2 transition-all flex-shrink-0"
              >
                <SearchCheck className="w-4 h-4" />
                <span>Run Instant SEO Audit</span>
              </button>
            </form>
          </div>

          {/* Proof Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#595768]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#006e4b]" />
              <span>250,000+ Audits Executed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#006e4b]" />
              <span>99.4% Lead Accuracy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#006e4b]" />
              <span>18+ Technical Checks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#006e4b]" />
              <span>AI Outreach Pitch Teardowns</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Bento Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] mb-3">
            Engineered for Modern Agencies & Outbound Teams
          </h2>
          <p className="text-sm text-[#595768]">
            Stop paying thousands for disconnected prospecting tools and separate audit software.
            LeadPulse unifies precision crawling and deep SERP diagnostics in one engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Lead Scraper */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#eaedff] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#eaedff] text-[#3525cd] flex items-center justify-center mb-5 shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#131b2e] mb-2">Deep Multi-Page Lead Crawler</h3>
              <p className="text-xs text-[#595768] leading-relaxed mb-4">
                Traverses up to 3 sub-path hierarchies (/contact, /about, teams, footnote registries)
                extracting decision-maker emails, phone numbers, and LinkedIn/Twitter handles with
                syntax & MX verification.
              </p>
            </div>
            <div className="pt-4 border-t border-[#eaedff] text-xs font-bold text-[#3525cd] flex items-center gap-1">
              <span>Bulk Domain Queue Supported</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Technical SEO Audit */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#eaedff] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#e6f7ef] text-[#006e4b] flex items-center justify-center mb-5 shadow-xs">
                <SearchCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#131b2e] mb-2">SEOptimer-Grade Technical Audit</h3>
              <p className="text-xs text-[#595768] leading-relaxed mb-4">
                Evaluates title length, meta descriptions, robots.txt crawler access, XML sitemaps,
                OpenGraph cards, schema.org microdata, and Core Web Vitals. Outputs a letter grade
                (A+ to F) with exact code recommendations.
              </p>
            </div>
            <div className="pt-4 border-t border-[#eaedff] text-xs font-bold text-[#006e4b] flex items-center gap-1">
              <span>18 Comprehensive Checkpoints</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: AI Pitch Engine */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#eaedff] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#f5f3ff] text-[#6366f1] flex items-center justify-center mb-5 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#131b2e] mb-2">AI-Driven Outreach Pitch Teardowns</h3>
              <p className="text-xs text-[#595768] leading-relaxed mb-4">
                Instantly converts technical SEO flaws into personalized client cold email pitches.
                Select tone (Executive, Consultative, Direct) and send teardowns that convert leads
                into retainer clients.
              </p>
            </div>
            <div className="pt-4 border-t border-[#eaedff] text-xs font-bold text-[#6366f1] flex items-center gap-1">
              <span>Ready-to-Send Email Templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Audit Demo Teaser Section */}
      <section id="audit-demo" className="py-16 px-4 sm:px-6 bg-[#f0f3ff] border-y border-[#eaedff]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#d6e0ff]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e6f7ef] text-[#006e4b] rounded-full text-xs font-bold uppercase mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Interactive Audit Preview</span>
                </div>
                <h3 className="text-2xl font-bold text-[#131b2e]">
                  Technical Audit Report for <span className="text-[#3525cd]">stripe.com</span>
                </h3>
                <p className="text-xs text-[#595768]">
                  Automated scan complete in 1.4 seconds. Score calculated across 5 core SEO pillars.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-[#faf8ff] p-4 rounded-2xl border border-[#eaedff]">
                <div className="w-16 h-16 rounded-2xl bg-[#006e4b] text-white flex flex-col items-center justify-center shadow-md">
                  <span className="text-2xl font-black font-mono">A-</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider">Grade</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#131b2e] font-mono">88 / 100</div>
                  <div className="text-xs text-[#006e4b] font-semibold">Strong Performance</div>
                  <div className="text-[11px] text-[#595768]">2 Minor Mistakes Detected</div>
                </div>
              </div>
            </div>

            {/* Checklist Teaser */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-[#f8faff] rounded-xl border border-[#eaedff] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#131b2e]">Title Tag SERP Length</span>
                <span className="text-[#006e4b] font-bold">Optimal (52 Chars)</span>
              </div>
              <div className="p-3 bg-[#f8faff] rounded-xl border border-[#eaedff] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#131b2e]">Robots.txt Crawlability</span>
                <span className="text-[#006e4b] font-bold">200 OK & Accessible</span>
              </div>
              <div className="p-3 bg-[#f8faff] rounded-xl border border-[#eaedff] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#131b2e]">XML Sitemap Index</span>
                <span className="text-[#006e4b] font-bold">Valid & Referenced</span>
              </div>
              <div className="p-3 bg-[#f8faff] rounded-xl border border-[#eaedff] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#131b2e]">Structured Schema.org</span>
                <span className="text-[#006e4b] font-bold">Organization & WebSite</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={onLaunchApp}
                className="px-6 py-3 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Launch App to Audit Any Domain</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Credit Packages Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] mb-3">
            Simple, Transparent Credit Packages
          </h2>
          <p className="text-sm text-[#595768]">
            Pay only for what you crawl and audit. Choose a package below or pay via local Bank Transfer,
            EasyPaisa, JazzCash, USDT TRC20, or PayPal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1 */}
          <div className="bg-white p-6 rounded-3xl border border-[#eaedff] shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-[#131b2e] mb-1">Starter Pack</h4>
              <p className="text-xs text-[#595768] mb-4">For solo consultants & freelancers</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-[#131b2e]">$15</span>
                <span className="text-xs text-[#595768]">/ 250 Credits</span>
              </div>
              <div className="text-xs font-bold text-[#3525cd] mb-6">Approx Rs. 4,200</div>

              <ul className="space-y-2.5 text-xs text-[#464555] mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>250 Website Leads / Audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>Deep Multi-Page Crawling</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>CSV & Excel Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>Daily Free Bonus Claim (+25)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenCreditsModal}
              className="w-full py-2.5 bg-[#eaedff] hover:bg-[#d6e0ff] text-[#3525cd] text-xs font-bold rounded-xl transition-colors"
            >
              Buy Starter Credits
            </button>
          </div>

          {/* Plan 2: POPULAR */}
          <div className="bg-white p-6 rounded-3xl border-2 border-[#3525cd] shadow-lg relative flex flex-col justify-between">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#3525cd] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              Most Popular
            </span>

            <div>
              <h4 className="text-lg font-bold text-[#131b2e] mb-1">Pro Growth</h4>
              <p className="text-xs text-[#595768] mb-4">For growing agencies & sales teams</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-[#3525cd]">$49</span>
                <span className="text-xs text-[#595768]">/ 1,000 Credits</span>
              </div>
              <div className="text-xs font-bold text-[#3525cd] mb-6">Approx Rs. 13,800</div>

              <ul className="space-y-2.5 text-xs text-[#464555] mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>1,000 Website Leads / Audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>AI Outreach Pitch Teardowns</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>Bulk Domain Queue Processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>Priority Verification Speed</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenCreditsModal}
              className="w-full py-2.5 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#3525cd]/20 transition-colors"
            >
              Buy Pro Growth Pack
            </button>
          </div>

          {/* Plan 3 */}
          <div className="bg-white p-6 rounded-3xl border border-[#eaedff] shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-[#131b2e] mb-1">Agency Scale</h4>
              <p className="text-xs text-[#595768] mb-4">High-volume outbound operations</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-[#131b2e]">$99</span>
                <span className="text-xs text-[#595768]">/ 2,500 Credits</span>
              </div>
              <div className="text-xs font-bold text-[#3525cd] mb-6">Approx Rs. 27,500</div>

              <ul className="space-y-2.5 text-xs text-[#464555] mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>2,500 Full Leads & Technical Audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>Custom Payment Channels Accepted</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>White-label Teardown Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#006e4b]" />
                  <span>Dedicated Account Manager</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenCreditsModal}
              className="w-full py-2.5 bg-[#eaedff] hover:bg-[#d6e0ff] text-[#3525cd] text-xs font-bold rounded-xl transition-colors"
            >
              Buy Agency Scale
            </button>
          </div>
        </div>
      </section>

      {/* Blog & Editorial Highlights Section */}
      {recentPosts.length > 0 && (
        <section className="py-16 px-4 sm:px-6 bg-white border-t border-[#eaedff]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-[#131b2e]">Latest SEO Insights & Guides</h3>
                <p className="text-xs text-[#595768]">
                  Actionable playbooks written by our search engineering team
                </p>
              </div>
              <button
                onClick={onNavigateBlog}
                className="text-xs font-bold text-[#3525cd] hover:underline flex items-center gap-1"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={onNavigateBlog}
                  className="rounded-2xl border border-[#eaedff] overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <span className="px-2 py-0.5 bg-[#eaedff] text-[#3525cd] text-[10px] font-bold rounded-full uppercase">
                        {post.category_name}
                      </span>
                      <h4 className="font-bold text-sm text-[#131b2e] mt-2 mb-1 line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-[#595768] line-clamp-2">{post.excerpt}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 text-[11px] text-[#777587]">
                    {post.read_time} • {new Date(post.published_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-center text-[#131b2e] mb-2">
          Frequently Asked Questions
        </h3>
        <p className="text-xs text-center text-[#595768] mb-10">
          Everything you need to know about crawlers, audits, and credit allocation.
        </p>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#eaedff] overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-[#131b2e] hover:bg-[#faf8ff] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#595768] transition-transform ${
                    openFaq === idx ? 'rotate-180 text-[#3525cd]' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-[#464555] leading-relaxed border-t border-[#eaedff] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#131b2e] text-white pt-14 pb-8 px-4 sm:px-6 border-t border-[#232d43]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img
                src={APP_ASSETS.logo}
                alt="Logo"
                className="h-7 w-auto object-contain brightness-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-bold text-base text-white">LeadPulse AI</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Enterprise-grade B2B website scraping & deep technical SEO auditing software for modern
              growth agencies.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Product</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={onLaunchApp} className="hover:text-white transition-colors">
                  Dashboard & Leads
                </button>
              </li>
              <li>
                <button onClick={onLaunchApp} className="hover:text-white transition-colors">
                  Site Audit (SEO)
                </button>
              </li>
              <li>
                <button onClick={onLaunchApp} className="hover:text-white transition-colors">
                  Bulk Domain Crawler
                </button>
              </li>
              <li>
                <button onClick={onOpenCreditsModal} className="hover:text-white transition-colors">
                  Buy Credit Packages
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Company & CMS</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={onNavigateBlog} className="hover:text-white transition-colors">
                  SEO Blog & Guides
                </button>
              </li>
              {customPages.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onNavigatePage(p.slug)}
                    className="hover:text-white transition-colors"
                  >
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Safe Payment Channels */}
          <div>
            <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
              Payment Methods Accepted
            </h5>
            <p className="text-xs text-gray-400 mb-3">
              Local bank transfer, EasyPaisa, JazzCash, USDT TRC20, and PayPal verified by admin.
            </p>
            <button
              onClick={onOpenCreditsModal}
              className="px-3.5 py-1.5 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-lg transition-colors"
            >
              Order Credits Now
            </button>
          </div>
        </div>

        {/* Bottom bar: Copyright & Discreet Admin Gate */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div>© {new Date().getFullYear()} LeadPulse AI. All rights reserved.</div>

          {/* Discreet Admin Lock Gate - Kept private without loud public banners */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdminGate}
              title="System Administrative Gate"
              className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-200 transition-colors cursor-pointer opacity-70 hover:opacity-100"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Gate</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
