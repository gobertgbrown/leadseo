import * as cheerio from 'cheerio';
import {
  SEOAuditData,
  SEOMistake,
  IssueSeverity,
  SEOAuditCategories,
  SEOKeywordItem,
  SEOLinksAnalysis,
  SEOSocialAnalysis,
  SEOUsabilityAnalysis,
  Grade,
} from '../src/types.js';
import { normalizeTargetUrl } from './crawler.js';
import { generateSEOInsightsAndPitch } from './gemini.js';

interface AuditTargetMeta {
  leadId?: string;
  businessName?: string;
  email?: string;
}

const COMMON_STOP_WORDS = new Set([
  'about', 'above', 'across', 'after', 'again', 'against', 'almost', 'along', 'already',
  'also', 'although', 'always', 'among', 'another', 'because', 'before', 'behind', 'below',
  'beside', 'between', 'beyond', 'could', 'during', 'either', 'enough', 'every', 'everyone',
  'everything', 'everywhere', 'except', 'first', 'following', 'having', 'instead', 'myself',
  'neither', 'nothing', 'nowhere', 'often', 'perhaps', 'please', 'really', 'several',
  'should', 'since', 'someone', 'something', 'sometimes', 'somewhere', 'still', 'their',
  'theirs', 'them', 'themselves', 'there', 'therefore', 'these', 'they', 'thing', 'things',
  'through', 'throughout', 'together', 'under', 'until', 'upon', 'using', 'various', 'very',
  'what', 'whatever', 'when', 'whenever', 'where', 'wherever', 'whether', 'which', 'whichever',
  'while', 'whilst', 'will', 'with', 'within', 'without', 'would', 'your', 'yours', 'yourself',
  'privacy', 'policy', 'terms', 'service', 'rights', 'reserved', 'copyright', 'cookie', 'cookies',
  'click', 'here', 'more', 'read', 'learn', 'view', 'home', 'page', 'site', 'website', 'contact'
]);

/**
 * SEOptimer standard 12-tier grading scale
 */
export function computeGrade(score: number): Grade {
  if (score >= 95) return 'A+';
  if (score >= 88) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 45) return 'D+';
  if (score >= 40) return 'D';
  return 'F';
}

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'no-cache',
};

/**
 * Bulletproof live web fetcher with protocol & subdomain fallback.
 * Authentically retrieves HTML without being blocked by Cloudflare or WAF.
 */
async function fetchWebsiteHtml(rawUrl: string, cleanDomain: string) {
  const candidates: string[] = [];

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    candidates.push(rawUrl);
  }

  const bareDomain = cleanDomain.replace(/^www\./i, '');
  const httpsUrl = `https://${bareDomain}`;
  const httpsWww = `https://www.${bareDomain}`;
  const httpUrl = `http://${bareDomain}`;
  const httpWww = `http://www.${bareDomain}`;

  for (const u of [httpsUrl, httpsWww, httpUrl, httpWww]) {
    if (!candidates.includes(u)) {
      candidates.push(u);
    }
  }

  let lastError: any = null;
  const startTime = Date.now();

  for (const urlToTry of candidates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(urlToTry, {
        signal: controller.signal,
        headers: BROWSER_HEADERS,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      const responseTimeMs = Date.now() - startTime;
      const html = await res.text();

      // Ensure we received actual HTML or text content
      if (html && (html.length > 50 || res.status < 400)) {
        const finalUrl = res.url || urlToTry;
        const isHttps = finalUrl.startsWith('https://');
        const contentEncoding = res.headers.get('content-encoding') || '';
        const isCompressed =
          contentEncoding.includes('gzip') ||
          contentEncoding.includes('br') ||
          contentEncoding.includes('deflate');

        return {
          html,
          finalUrl,
          isHttps,
          httpStatus: res.status,
          responseTimeMs,
          pageSizeKb: Math.round((new TextEncoder().encode(html).length / 1024) * 10) / 10,
          hasHsts: Boolean(res.headers.get('strict-transport-security')),
          hasXContentTypeOptions: Boolean(res.headers.get('x-content-type-options')),
          hasXFrameOptions: Boolean(res.headers.get('x-frame-options')),
          isCompressed,
          xRobotsTag: res.headers.get('x-robots-tag') || '',
        };
      }
    } catch (err: any) {
      lastError = err;
      // Try next fallback candidate
    }
  }

  throw new Error(
    `Could not establish connection with "${cleanDomain}". The website appears to be offline or unreachable (${lastError?.message || 'Connection timed out'}). Please verify the domain and ensure it is accessible.`
  );
}

/**
 * Conducts a comprehensive technical SEO optimizer audit on a target website.
 * Follows SEOptimer standard scoring, categories, checks, and heuristics.
 */
export async function auditWebsite(
  rawUrl: string,
  targetMeta?: AuditTargetMeta
): Promise<SEOAuditData> {
  const { cleanDomain, rootUrl } = normalizeTargetUrl(rawUrl);
  const auditedAt = new Date().toISOString();

  // 1. Fetch real page HTML
  const {
    html,
    finalUrl,
    isHttps,
    httpStatus,
    responseTimeMs,
    pageSizeKb,
    hasHsts,
    hasXContentTypeOptions,
    isCompressed,
    xRobotsTag,
  } = await fetchWebsiteHtml(rawUrl, cleanDomain);

  const $ = cheerio.load(html);

  // 2. Title Tag Analysis
  const rawTitle = $('head > title, title').first().text().replace(/\s+/g, ' ').trim();
  const titleLength = rawTitle.length;
  let titleStatus: IssueSeverity = 'good';
  let titleMessage = 'Title tag length is optimal for Google search results (30 – 65 characters).';

  if (!rawTitle) {
    titleStatus = 'critical';
    titleMessage = 'Missing <title> tag. Search engines cannot index or rank this page properly.';
  } else if (titleLength < 30) {
    titleStatus = 'warning';
    titleMessage = `Title tag is too short (${titleLength} chars). Optimal range is 30 – 65 characters to maximize click-through rate.`;
  } else if (titleLength > 65) {
    titleStatus = 'warning';
    titleMessage = `Title tag is too long (${titleLength} chars). Google desktop and mobile SERPs will truncate titles beyond ~65 characters.`;
  }

  // 3. Meta Description Analysis
  const rawMetaDesc = (
    $('meta[name="description" i]').attr('content') ||
    $('meta[property="og:description" i]').attr('content') ||
    ''
  ).replace(/\s+/g, ' ').trim();
  const metaDescLength = rawMetaDesc.length;
  let metaDescStatus: IssueSeverity = 'good';
  let metaDescMessage = 'Meta description length is in the optimal range (60 – 165 characters).';

  if (!rawMetaDesc) {
    metaDescStatus = 'critical';
    metaDescMessage = 'Missing meta description. Google will generate an arbitrary text snippet from your page.';
  } else if (metaDescLength < 60) {
    metaDescStatus = 'warning';
    metaDescMessage = `Meta description is short (${metaDescLength} chars). Expand to 60 – 165 characters to improve search click-through rate.`;
  } else if (metaDescLength > 165) {
    metaDescStatus = 'warning';
    metaDescMessage = `Meta description exceeds 165 characters (${metaDescLength} chars). Google will cut it off with an ellipsis in search results.`;
  }

  // 4. Headings Analysis (H1, H2, H3, H4)
  const h1Elements: string[] = [];
  $('h1').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) h1Elements.push(text);
  });
  const h1Count = h1Elements.length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  const h4Count = $('h4').length;

  const hasHeadingHierarchyGap =
    (h1Count === 0 && (h2Count > 0 || h3Count > 0)) ||
    (h2Count === 0 && h3Count > 0) ||
    (h3Count === 0 && h4Count > 0);

  // 5. Image Alt Text Analysis
  let imagesCount = 0;
  let imagesMissingAlt = 0;
  $('img').each((_, el) => {
    imagesCount++;
    const alt = $(el).attr('alt');
    if (alt === undefined || alt === null || alt.trim() === '') {
      imagesMissingAlt++;
    }
  });

  // 6. Viewport & Mobile Usability
  const viewportContent = $('meta[name="viewport" i]').attr('content') || '';
  const hasViewport =
    viewportContent.includes('width=device-width') ||
    viewportContent.includes('initial-scale=');

  // 7. Canonical Tag Analysis
  const canonicalHref = $('link[rel="canonical" i]').attr('href') || '';
  const canonicalUrl = canonicalHref.trim();
  let canonicalStatus: IssueSeverity = 'good';
  let canonicalMessage = 'Canonical URL link is properly configured.';

  if (!canonicalUrl) {
    canonicalStatus = 'warning';
    canonicalMessage = 'Missing canonical tag. Search engines may identify duplicate content on parameters or protocol variations.';
  }

  // 8. Noindex Directive Check (Critical Search Blocker)
  const robotsMeta = (
    $('meta[name="robots" i]').attr('content') ||
    $('meta[name="googlebot" i]').attr('content') ||
    ''
  ).toLowerCase();
  const hasNoindex =
    robotsMeta.includes('noindex') ||
    xRobotsTag.toLowerCase().includes('noindex');

  // 9. Structured Data (Schema.org)
  let hasSchemaOrg = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    const rawJson = $(el).html() || '';
    if (rawJson.includes('@context') || rawJson.includes('schema.org')) {
      hasSchemaOrg = true;
    }
  });
  if (!hasSchemaOrg) {
    hasSchemaOrg = $('[itemscope], [itemtype]').length > 0;
  }

  // 10. Open Graph & Social Cards
  const ogTitle = $('meta[property="og:title" i]').attr('content') || '';
  const ogDescription = $('meta[property="og:description" i]').attr('content') || '';
  const ogImage = $('meta[property="og:image" i]').attr('content') || '';
  const ogUrl = $('meta[property="og:url" i]').attr('content') || '';
  const hasOpenGraph = Boolean(ogTitle || ogImage || $('meta[property^="og:" i]').length >= 2);
  const hasOgImage = Boolean(ogImage);

  // Twitter Card
  const twitterCard = $('meta[name="twitter:card" i]').attr('content') || '';
  const twitterTitle = $('meta[name="twitter:title" i]').attr('content') || '';
  const twitterImage = $('meta[name="twitter:image" i]').attr('content') || '';
  const hasTwitterCard = Boolean(twitterCard || twitterTitle || $('meta[name^="twitter:" i]').length >= 2);
  const hasTwitterImage = Boolean(twitterImage);

  // 11. Assets & External Resources Count
  const externalScriptsCount = $('script[src]').length;
  const externalStylesheetsCount = $('link[rel="stylesheet" i]').length;
  const totalExternalAssets = externalScriptsCount + externalStylesheetsCount;

  // 12. Google Analytics & Google Tag Manager Detection
  const hasGoogleAnalytics = Boolean(
    html.includes('googletagmanager.com/gtag/js') ||
    html.includes('google-analytics.com/analytics.js') ||
    html.includes('google-analytics.com/ga.js') ||
    /G-[A-Z0-9]{7,12}/i.test(html) ||
    /UA-\d+-\d+/i.test(html) ||
    html.includes("gtag('config'") ||
    html.includes('ga("create"')
  );

  const hasGtm = Boolean(
    html.includes('googletagmanager.com/gtm.js') ||
    /GTM-[A-Z0-9]+/i.test(html)
  );

  // 13. Facebook Pixel Detection
  const hasFacebookPixel = Boolean(
    html.includes('connect.facebook.net') ||
    html.includes('fbevents.js') ||
    html.includes("fbq('init'") ||
    html.includes('fbq("init"')
  );

  // 14. Clean Body Text & Word Count Analysis
  const bodyClone = $('body').clone();
  bodyClone.find('script, style, noscript, svg, nav, footer, header, iframe').remove();
  const cleanBodyText = bodyClone.text().replace(/\s+/g, ' ').trim();
  const wordCount = cleanBodyText ? cleanBodyText.split(/\s+/).length : 0;

  // 15. Email Privacy Check
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const rawEmails = cleanBodyText.match(emailRegex) || [];
  const validEmails = Array.from(new Set(rawEmails)).filter(
    (em) =>
      !em.endsWith('.png') &&
      !em.endsWith('.jpg') &&
      !em.endsWith('.webp') &&
      !em.endsWith('.svg') &&
      !em.includes('example.com') &&
      !em.includes('sentry.io') &&
      !em.includes('w3.org')
  );
  const emailPrivacyExposed = validEmails.length > 0;

  // 16. Probe for robots.txt & sitemap.xml
  let hasRobotsTxt = false;
  let hasSitemap = false;
  let detectedSitemapUrl = '';

  try {
    const probeTimeout = 3500;
    const probeHeaders = {
      'User-Agent': BROWSER_HEADERS['User-Agent'],
      Accept: 'text/plain,text/xml,application/xml,*/*',
    };

    const bareDomain = cleanDomain.replace(/^www\./i, '');
    const robotsCandidates = [
      `${rootUrl}/robots.txt`,
      `https://${bareDomain}/robots.txt`,
      `https://www.${bareDomain}/robots.txt`,
    ];

    for (const rCandidate of robotsCandidates) {
      const rRes = await fetch(rCandidate, {
        headers: probeHeaders,
        signal: AbortSignal.timeout(probeTimeout),
        redirect: 'follow',
      }).catch(() => null);

      if (rRes && rRes.status < 400) {
        const rText = await rRes.text();
        const rLower = rText.toLowerCase();
        if (
          rLower.includes('user-agent:') ||
          rLower.includes('disallow:') ||
          rLower.includes('allow:') ||
          rLower.includes('sitemap:')
        ) {
          hasRobotsTxt = true;
          const sMatch = rText.match(/sitemap:\s*(https?:\/\/[^\s\r\n]+)/i);
          if (sMatch && sMatch[1]) {
            detectedSitemapUrl = sMatch[1].trim();
            hasSitemap = true;
          }
          break;
        }
      }
    }

    if (!hasSitemap) {
      const sCandidates = [
        `${rootUrl}/sitemap.xml`,
        `${rootUrl}/sitemap_index.xml`,
        `https://${bareDomain}/sitemap.xml`,
      ];
      for (const sCandidate of sCandidates) {
        const sRes = await fetch(sCandidate, {
          headers: probeHeaders,
          signal: AbortSignal.timeout(probeTimeout),
          redirect: 'follow',
        }).catch(() => null);

        if (sRes && sRes.status < 400) {
          const sText = await sRes.text();
          if (
            sText.includes('<urlset') ||
            sText.includes('<sitemapindex') ||
            sText.includes('<?xml')
          ) {
            hasSitemap = true;
            detectedSitemapUrl = sCandidate;
            break;
          }
        }
      }
    }

    if (!hasSitemap && $('link[rel="sitemap"]').length > 0) {
      hasSitemap = true;
    }
  } catch {
    // Non-blocking
  }

  // 17. Links Extraction & Analysis
  let totalLinks = 0;
  let internalLinks = 0;
  let externalLinks = 0;
  let dofollowLinks = 0;
  let nofollowLinks = 0;
  let unfriendlyLinksCount = 0;
  const sampleInternal: { text: string; href: string }[] = [];
  const sampleExternal: { text: string; href: string }[] = [];

  const detectedSocialProfiles: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    github?: string;
  } = {};

  const cleanBareDomain = cleanDomain.replace(/^www\./i, '').toLowerCase();

  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().replace(/\s+/g, ' ').trim() || 'Link';
    const rel = $(el).attr('rel') || '';

    if (!href || href.startsWith('javascript:') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return;
    }

    totalLinks++;
    const isNofollow = rel.toLowerCase().includes('nofollow');
    if (isNofollow) {
      nofollowLinks++;
    } else {
      dofollowLinks++;
    }

    const hrefLower = href.toLowerCase();
    const isExternal =
      (hrefLower.startsWith('http://') || hrefLower.startsWith('https://') || hrefLower.startsWith('//')) &&
      !hrefLower.includes(cleanBareDomain);

    if (isExternal) {
      externalLinks++;
      if (sampleExternal.length < 8 && text.length < 60) {
        sampleExternal.push({ text: text.slice(0, 50), href: href.slice(0, 100) });
      }

      // Detect verified social profiles
      if (hrefLower.includes('facebook.com/') && !detectedSocialProfiles.facebook) {
        detectedSocialProfiles.facebook = href;
      } else if (hrefLower.includes('instagram.com/') && !detectedSocialProfiles.instagram) {
        detectedSocialProfiles.instagram = href;
      } else if ((hrefLower.includes('twitter.com/') || hrefLower.includes('x.com/')) && !detectedSocialProfiles.twitter) {
        detectedSocialProfiles.twitter = href;
      } else if (hrefLower.includes('linkedin.com/') && !detectedSocialProfiles.linkedin) {
        detectedSocialProfiles.linkedin = href;
      } else if (hrefLower.includes('youtube.com/') && !detectedSocialProfiles.youtube) {
        detectedSocialProfiles.youtube = href;
      } else if (hrefLower.includes('tiktok.com/') && !detectedSocialProfiles.tiktok) {
        detectedSocialProfiles.tiktok = href;
      } else if (hrefLower.includes('github.com/') && !detectedSocialProfiles.github) {
        detectedSocialProfiles.github = href;
      }
    } else {
      internalLinks++;
      if (sampleInternal.length < 8 && text.length < 60) {
        sampleInternal.push({ text: text.slice(0, 50), href: href.slice(0, 100) });
      }

      if (href.includes('?') && (href.includes('id=') || href.includes('p=') || href.includes('session=') || href.includes('%20'))) {
        unfriendlyLinksCount++;
      }
    }
  });

  // 18. Usability Details (Favicon, Apple Touch Icon, Language, Charset)
  let rawFavicon = $('link[rel*="icon" i]').attr('href') || '';
  let hasFavicon = Boolean(rawFavicon);
  let faviconUrl = '';

  if (!hasFavicon) {
    // Probe /favicon.ico
    try {
      const favRes = await fetch(`${rootUrl}/favicon.ico`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(2000),
        headers: { 'User-Agent': BROWSER_HEADERS['User-Agent'] },
      }).catch(() => null);
      if (favRes && favRes.status === 200) {
        hasFavicon = true;
        rawFavicon = '/favicon.ico';
      }
    } catch {}
  }

  if (hasFavicon) {
    if (rawFavicon.startsWith('http')) faviconUrl = rawFavicon;
    else if (rawFavicon.startsWith('//')) faviconUrl = `https:${rawFavicon}`;
    else faviconUrl = `${rootUrl}${rawFavicon.startsWith('/') ? '' : '/'}${rawFavicon}`;
  } else {
    faviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=64`;
  }

  const hasAppleIcon = Boolean($('link[rel="apple-touch-icon" i]').attr('href'));
  const htmlLang = $('html').attr('lang') || 'en';
  const htmlCharset = $('meta[charset]').attr('charset') || 'UTF-8';

  // 19. Top Keywords & Consistency Analysis
  const words = cleanBodyText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !COMMON_STOP_WORDS.has(w));

  const wordFrequencies: Record<string, number> = {};
  for (const w of words) {
    wordFrequencies[w] = (wordFrequencies[w] || 0) + 1;
  }

  const sortedKeywords = Object.entries(wordFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const titleLower = rawTitle.toLowerCase();
  const metaDescLower = rawMetaDesc.toLowerCase();
  const headingsCombined = [
    ...h1Elements,
    ...$('h2, h3').map((_, el) => $(el).text()).get(),
  ]
    .join(' ')
    .toLowerCase();

  const keywordsAnalysis: SEOKeywordItem[] = sortedKeywords.map(([keyword, count]) => ({
    keyword,
    count,
    inTitle: titleLower.includes(keyword),
    inMetaDesc: metaDescLower.includes(keyword),
    inHeadings: headingsCombined.includes(keyword),
  }));

  // 20. Compile Mistakes & Passed Checks
  const mistakes: SEOMistake[] = [];
  const passedChecks: { title: string; detail: string }[] = [];

  // NOINDEX CHECK (Critical Google Blocker)
  if (hasNoindex) {
    mistakes.push({
      id: 'mistake-noindex',
      category: 'meta_tags',
      title: 'Search Indexing Blocked (noindex Directive Detected)',
      severity: 'critical',
      priority: 'high',
      description: 'The page specifies a "noindex" robots meta directive or X-Robots-Tag header.',
      impact: 'CRITICAL: Googlebot and Bingbot are strictly prohibited from indexing this page. It will NOT appear in any Google search results.',
      currentValue: robotsMeta || xRobotsTag,
      recommendedFix: 'Remove the "noindex" tag from your HTML <head> or server headers to allow search engines to crawl and index your site.',
    });
  } else {
    passedChecks.push({
      title: 'Search Engine Indexing Permitted',
      detail: 'No blocking "noindex" directives found. Googlebot can crawl and rank this page.',
    });
  }

  // TITLE TAG
  if (!rawTitle) {
    mistakes.push({
      id: 'mistake-title-missing',
      category: 'meta_tags',
      title: 'Missing Page Title Tag (<title>)',
      severity: 'critical',
      priority: 'high',
      description: 'The page has no HTML title tag specified.',
      impact: 'Google cannot generate a primary headline in search results. Severely damages organic rankings and click-through rates.',
      currentValue: 'None',
      recommendedFix: `Add a keyword-rich <title> tag between 30–65 characters (e.g., "<title>${cleanDomain} | Official Website</title>").`,
      codeSample: `<title>${cleanDomain} | Official Website</title>`,
    });
  } else if (titleLength < 30) {
    mistakes.push({
      id: 'mistake-title-short',
      category: 'meta_tags',
      title: 'Page Title Is Too Short',
      severity: 'warning',
      priority: 'medium',
      description: `Current title is only ${titleLength} characters long: "${rawTitle}".`,
      impact: 'Short titles fail to take full advantage of Google SERP headline space and miss high-intent keyword opportunities.',
      currentValue: `"${rawTitle}" (${titleLength} chars)`,
      recommendedFix: 'Expand title to 45–60 characters including your primary keyword and brand name.',
    });
  } else if (titleLength > 65) {
    mistakes.push({
      id: 'mistake-title-long',
      category: 'meta_tags',
      title: 'Page Title Exceeds 65 Characters (Truncation Risk)',
      severity: 'warning',
      priority: 'medium',
      description: `Current title is ${titleLength} characters long: "${rawTitle}".`,
      impact: 'Google desktop and mobile snippets truncate titles longer than ~65 characters with an ellipsis (...).',
      currentValue: `"${rawTitle}" (${titleLength} chars)`,
      recommendedFix: 'Shorten page title to under 65 characters to ensure your full brand message is visible.',
    });
  } else {
    passedChecks.push({
      title: 'Page Title Length Optimal',
      detail: `"${rawTitle}" (${titleLength} chars, recommended 30–65 chars).`,
    });
  }

  // META DESCRIPTION
  if (!rawMetaDesc) {
    mistakes.push({
      id: 'mistake-meta-missing',
      category: 'meta_tags',
      title: 'Missing Meta Description Tag',
      severity: 'critical',
      priority: 'high',
      description: 'The page lacks a meta description tag in the <head>.',
      impact: 'Google will auto-generate an excerpt from random page text, reducing CTR by up to 35%.',
      currentValue: 'None',
      recommendedFix: 'Add a persuasive <meta name="description"> between 120–160 characters describing your offer with a call to action.',
      codeSample: `<meta name="description" content="Discover professional services and platform solutions from ${cleanDomain}. Get started today.">`,
    });
  } else if (metaDescLength < 60) {
    mistakes.push({
      id: 'mistake-meta-short',
      category: 'meta_tags',
      title: 'Meta Description Is Too Short',
      severity: 'warning',
      priority: 'medium',
      description: `Current meta description is only ${metaDescLength} characters long.`,
      impact: 'Under-utilized snippet space lowers search appeal and ranking relevance.',
      currentValue: `"${rawMetaDesc}" (${metaDescLength} chars)`,
      recommendedFix: 'Expand meta description to 120–160 characters with strong benefit statements.',
    });
  } else if (metaDescLength > 165) {
    mistakes.push({
      id: 'mistake-meta-long',
      category: 'meta_tags',
      title: 'Meta Description Exceeds Recommended Length',
      severity: 'warning',
      priority: 'medium',
      description: `Current meta description is ${metaDescLength} characters long.`,
      impact: 'Google truncates meta descriptions over 165 characters on search results pages.',
      currentValue: `"${rawMetaDesc.slice(0, 80)}..." (${metaDescLength} chars)`,
      recommendedFix: 'Trim meta description to under 165 characters so the complete message is displayed.',
    });
  } else {
    passedChecks.push({
      title: 'Meta Description Tag Configured',
      detail: `Ideal length (${metaDescLength} chars, target 60–165 chars) with persuasive preview text.`,
    });
  }

  // H1 HEADING
  if (h1Count === 0) {
    mistakes.push({
      id: 'mistake-h1-missing',
      category: 'content_headings',
      title: 'Missing Primary H1 Heading Tag',
      severity: 'critical',
      priority: 'high',
      description: 'The page has 0 <h1> heading tags in the HTML body.',
      impact: 'H1 is the primary on-page topical authority signal for search engines. Without it, Google cannot identify the core topic.',
      currentValue: '0 H1 tags',
      recommendedFix: 'Add a single, prominent <h1> tag containing your primary target keyword at the top of your content hierarchy.',
      codeSample: `<h1>Welcome to ${cleanDomain}</h1>`,
    });
  } else if (h1Count > 1) {
    mistakes.push({
      id: 'mistake-h1-multiple',
      category: 'content_headings',
      title: `Multiple H1 Headings Detected (${h1Count} Found)`,
      severity: 'warning',
      priority: 'medium',
      description: `Found ${h1Count} <h1> tags on the page.`,
      impact: 'Multiple H1 tags dilute semantic focus and confuse search crawlers on the primary subject of the page.',
      currentValue: `${h1Count} H1 tags (${h1Elements.slice(0, 2).map((t) => `"${t}"`).join(', ')})`,
      recommendedFix: 'Keep exactly one <h1> for the page title, and downgrade secondary titles to <h2> or <h3> tags.',
    });
  } else {
    passedChecks.push({
      title: 'Single Primary H1 Tag Configured',
      detail: `Found 1 distinct H1 tag: "${h1Elements[0]}".`,
    });
  }

  // SUBHEADINGS & HIERARCHY
  if (h2Count === 0) {
    mistakes.push({
      id: 'mistake-h2-missing',
      category: 'content_headings',
      title: 'No H2 Subheadings Found',
      severity: 'warning',
      priority: 'low',
      description: 'The page has no <h2> subheadings structuring the content.',
      impact: 'Subheadings break up copy for human readers and help search engines understand content sections.',
      currentValue: '0 H2 tags',
      recommendedFix: 'Organize your content into clear thematic sections using <h2> subheadings.',
    });
  } else {
    passedChecks.push({
      title: 'H2 Subheadings Structured',
      detail: `Detected ${h2Count} H2 and ${h3Count} H3 subheadings structuring content.`,
    });
  }

  if (hasHeadingHierarchyGap) {
    mistakes.push({
      id: 'mistake-heading-gap',
      category: 'content_headings',
      title: 'Heading Hierarchy Levels Skipped',
      severity: 'warning',
      priority: 'low',
      description: 'Heading tags skip hierarchical order (e.g. H1 to H3 or H2 to H4 without intermediate levels).',
      impact: 'Skipping heading levels confuses assistive technologies (screen readers) and impairs semantic HTML outline.',
      currentValue: `H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}, H4: ${h4Count}`,
      recommendedFix: 'Nest headings sequentially (H1 -> H2 -> H3 -> H4) without skipping levels.',
    });
  }

  // IMAGE ALT TEXT
  if (imagesCount > 0 && imagesMissingAlt > 0) {
    const missingRatio = Math.round((imagesMissingAlt / imagesCount) * 100);
    const severity: IssueSeverity = imagesMissingAlt > 5 || missingRatio > 40 ? 'critical' : 'warning';

    mistakes.push({
      id: 'mistake-image-alt',
      category: 'content_headings',
      title: `${imagesMissingAlt} of ${imagesCount} Images Missing Alt Text (${missingRatio}%)`,
      severity,
      priority: severity === 'critical' ? 'high' : 'medium',
      description: `Found ${imagesMissingAlt} image(s) lacking descriptive alt attributes.`,
      impact: 'Search engines rely on alt attributes to understand image contents and index them in Google Image Search. Also required for ADA/WCAG accessibility.',
      currentValue: `${imagesMissingAlt} untagged images`,
      recommendedFix: 'Add keyword-relevant descriptive alt text attributes to all content images.',
      codeSample: '<img src="/product.webp" alt="Detailed description of image content" />',
    });
  } else if (imagesCount > 0) {
    passedChecks.push({
      title: 'All Images Include Alt Attributes',
      detail: `All ${imagesCount} evaluated images contain descriptive alt text.`,
    });
  }

  // RESPONSIVE VIEWPORT
  if (!hasViewport) {
    mistakes.push({
      id: 'mistake-viewport-missing',
      category: 'mobile_security',
      title: 'Missing Mobile Viewport Meta Tag',
      severity: 'critical',
      priority: 'high',
      description: 'No <meta name="viewport"> tag detected.',
      impact: 'Mobile browsers will render the website as a zoomed-out desktop canvas. Google penalizes non-mobile-friendly sites heavily in mobile search.',
      currentValue: 'Missing viewport',
      recommendedFix: 'Add standard responsive viewport meta tag inside the HTML <head>.',
      codeSample: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    });
  } else {
    passedChecks.push({
      title: 'Mobile Viewport Tag Enabled',
      detail: 'Standard responsive viewport configured for mobile devices.',
    });
  }

  // HTTPS / SSL
  if (!isHttps) {
    mistakes.push({
      id: 'mistake-ssl-missing',
      category: 'mobile_security',
      title: 'Website Not Secured With HTTPS / SSL',
      severity: 'critical',
      priority: 'high',
      description: 'The website is served over insecure HTTP.',
      impact: 'Google explicitly penalizes non-HTTPS websites in search rankings, and modern browsers display a "Not Secure" warning to users.',
      currentValue: 'Insecure HTTP',
      recommendedFix: 'Install a valid SSL certificate (e.g. via Let\'s Encrypt or Cloudflare) and enforce 301 redirects to HTTPS.',
    });
  } else {
    passedChecks.push({
      title: 'SSL / HTTPS Active',
      detail: 'Secure encrypted connection with valid HTTPS.',
    });
  }

  // CANONICAL URL
  if (!canonicalUrl) {
    mistakes.push({
      id: 'mistake-canonical-missing',
      category: 'meta_tags',
      title: 'Missing Canonical Link Tag',
      severity: 'warning',
      priority: 'medium',
      description: 'No <link rel="canonical"> tag detected.',
      impact: 'Can lead to duplicate content penalties if your site is reachable via both www and non-www, or with URL tracking parameters.',
      currentValue: 'None',
      recommendedFix: `Add a canonical link in the <head> pointing to the definitive URL (e.g. <link rel="canonical" href="${rootUrl}/" />).`,
      codeSample: `<link rel="canonical" href="${rootUrl}/" />`,
    });
  } else {
    passedChecks.push({
      title: 'Canonical Tag Specified',
      detail: `Pointing to canonical origin: ${canonicalUrl}`,
    });
  }

  // STRUCTURED DATA (SCHEMA.ORG)
  if (!hasSchemaOrg) {
    mistakes.push({
      id: 'mistake-schema-missing',
      category: 'performance_technical',
      title: 'Missing Schema.org Structured Data',
      severity: 'warning',
      priority: 'medium',
      description: 'No JSON-LD structured data (schema.org) was detected in the document.',
      impact: 'Prevents Google from generating Rich Snippets (star ratings, FAQ accordions, business info) in search results, reducing CTR by up to 30%.',
      currentValue: 'No JSON-LD schema detected',
      recommendedFix: 'Implement Organization, LocalBusiness, or WebSite schema in JSON-LD format in your page head.',
      codeSample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${cleanDomain}",
  "url": "${rootUrl}"
}
</script>`,
    });
  } else {
    passedChecks.push({
      title: 'Structured Data (Schema.org) Present',
      detail: 'Valid JSON-LD schema found for search engine rich results.',
    });
  }

  // GOOGLE ANALYTICS & TAG MANAGER
  if (hasGoogleAnalytics || hasGtm) {
    passedChecks.push({
      title: 'Google Analytics / GTM Active',
      detail: `${hasGtm ? 'Google Tag Manager' : 'Google Analytics'} script detected on page for visitor tracking.`,
    });
  } else {
    mistakes.push({
      id: 'mistake-analytics-missing',
      category: 'performance_technical',
      title: 'Missing Google Analytics or Google Tag Manager',
      severity: 'warning',
      priority: 'medium',
      description: 'No Google Analytics 4 (GA4) or Google Tag Manager (GTM) tracking script was found.',
      impact: 'Without web analytics, you cannot track organic search visitor behavior, bounce rates, or conversions.',
      currentValue: 'No analytics tag detected',
      recommendedFix: 'Install Google Tag Manager or GA4 tracking tag to monitor traffic and Core Web Vitals.',
    });
  }

  // ROBOTS.TXT
  if (!hasRobotsTxt) {
    mistakes.push({
      id: 'mistake-robots-missing',
      category: 'performance_technical',
      title: 'Missing robots.txt File (/robots.txt)',
      severity: 'warning',
      priority: 'medium',
      description: 'Could not detect a standard robots.txt file at the root of the domain.',
      impact: 'Search engine bots crawl without priority instructions, potentially consuming crawl budget on uncached or duplicate assets.',
      currentValue: 'HTTP 404 or missing',
      recommendedFix: 'Create a robots.txt file at domain root with standard crawl directives and link to your sitemap.xml.',
      codeSample: `User-agent: *\nAllow: /\nSitemap: ${rootUrl}/sitemap.xml`,
    });
  } else {
    passedChecks.push({
      title: 'robots.txt Present',
      detail: `Validated crawl instructions at ${rootUrl}/robots.txt`,
    });
  }

  // XML SITEMAP
  if (!hasSitemap) {
    mistakes.push({
      id: 'mistake-sitemap-missing',
      category: 'performance_technical',
      title: 'XML Sitemap Not Detectable (/sitemap.xml)',
      severity: 'warning',
      priority: 'medium',
      description: 'Could not access /sitemap.xml on the target domain root.',
      impact: 'Sitemaps help Googlebot discover new pages and prioritize deep URL crawling.',
      currentValue: 'HTTP 404 or inaccessible',
      recommendedFix: 'Generate a clean sitemap.xml file, upload to domain root, and submit to Google Search Console.',
    });
  } else {
    passedChecks.push({
      title: 'XML Sitemap Available',
      detail: detectedSitemapUrl
        ? `Sitemap discovered at: ${detectedSitemapUrl}`
        : 'Verified XML sitemap accessible for crawl indexing.',
    });
  }

  // OPEN GRAPH SOCIAL TAGS
  if (!hasOpenGraph) {
    mistakes.push({
      id: 'mistake-og-missing',
      category: 'links_social',
      title: 'Missing Open Graph (og:) Social Tags',
      severity: 'critical',
      priority: 'high',
      description: 'Page lacks og:title, og:description, or og:image tags.',
      impact: 'When shared on LinkedIn, X/Twitter, Facebook, or WhatsApp, links will render as plain text or broken cards without images.',
      currentValue: 'No Open Graph tags found',
      recommendedFix: 'Add Open Graph meta tags (og:title, og:description, og:image, og:url) for high-converting social snippets.',
      codeSample: `<meta property="og:title" content="${rawTitle || cleanDomain}">\n<meta property="og:description" content="${rawMetaDesc || 'Explore our platform'}">\n<meta property="og:image" content="${rootUrl}/og-image.jpg">`,
    });
  } else if (!hasOgImage) {
    mistakes.push({
      id: 'mistake-og-image-missing',
      category: 'links_social',
      title: 'Missing Open Graph Image (og:image)',
      severity: 'warning',
      priority: 'high',
      description: 'The page defines Open Graph metadata but lacks an og:image tag.',
      impact: 'Social networks require an og:image to render preview cards. Without it, links display as plain text with over 50% lower CTR.',
      currentValue: 'No og:image tag found',
      recommendedFix: 'Specify a high-resolution preview image (recommended 1200x630 pixels) using <meta property="og:image" content="...">.',
      codeSample: `<meta property="og:image" content="${rootUrl}/og-preview.jpg">`,
    });
  } else {
    passedChecks.push({
      title: 'Open Graph Social Cards Configured',
      detail: 'Social preview meta tags and og:image are active for LinkedIn, Facebook, and Twitter.',
    });
  }

  // TWITTER CARDS
  if (!hasTwitterCard) {
    mistakes.push({
      id: 'mistake-twitter-card-missing',
      category: 'links_social',
      title: 'Missing Twitter / X Card Meta Tags',
      severity: 'warning',
      priority: 'medium',
      description: 'No <meta name="twitter:card"> tag was detected on the page.',
      impact: 'Twitter/X will not show a large summary visual card when users tweet or share your URL.',
      currentValue: 'No twitter:card tag',
      recommendedFix: 'Add <meta name="twitter:card" content="summary_large_image"> to enable rich visual tweets.',
      codeSample: '<meta name="twitter:card" content="summary_large_image">',
    });
  } else {
    passedChecks.push({
      title: 'Twitter Card Tags Active',
      detail: `Configured as ${twitterCard || 'summary_large_image'} for X/Twitter sharing.`,
    });
  }

  // SOCIAL PROFILES
  const detectedSocialCount = Object.keys(detectedSocialProfiles).length;
  if (detectedSocialCount === 0) {
    mistakes.push({
      id: 'mistake-social-profiles-missing',
      category: 'links_social',
      title: 'No Social Media Profiles Connected',
      severity: 'warning',
      priority: 'medium',
      description: 'No links to active social media business profiles (LinkedIn, Facebook, X/Twitter, Instagram, YouTube) were found.',
      impact: 'Brand social presence is a trust and authority signal evaluated by prospective clients and search engines.',
      currentValue: '0 social links detected',
      recommendedFix: 'Include links to your company LinkedIn, Facebook, and Twitter/X channels in your header or footer.',
    });
  } else {
    passedChecks.push({
      title: 'Social Network Profiles Connected',
      detail: `Detected active profiles on ${Object.keys(detectedSocialProfiles).join(', ')}.`,
    });
  }

  // EMAIL PRIVACY
  if (emailPrivacyExposed) {
    mistakes.push({
      id: 'mistake-email-privacy',
      category: 'mobile_security',
      title: `Plain Text Email Address Exposed (${validEmails.length} Found)`,
      severity: 'warning',
      priority: 'low',
      description: `Found plain text email address (${validEmails.slice(0, 2).join(', ')}) directly in the page source code.`,
      impact: 'Spambots scrape web pages for raw email addresses, leading to high spam volume and phishing attempts.',
      currentValue: validEmails.slice(0, 2).join(', '),
      recommendedFix: 'Obfuscate email addresses using a contact form or JavaScript encoding to protect your inbox from scrapers.',
    });
  } else {
    passedChecks.push({
      title: 'Email Privacy Protected',
      detail: 'No plain text email addresses exposed to automated harvesting bots.',
    });
  }

  // FAVICON & APPLE TOUCH ICON
  if (!hasFavicon) {
    mistakes.push({
      id: 'mistake-favicon-missing',
      category: 'mobile_security',
      title: 'Missing Website Favicon',
      severity: 'warning',
      priority: 'low',
      description: 'No favicon was discovered in the HTML head or at /favicon.ico.',
      impact: 'Google mobile SERPs display favicons next to search results. Missing favicons reduce brand recognition and CTR.',
      currentValue: 'No favicon detected',
      recommendedFix: 'Add <link rel="icon" href="/favicon.ico"> in your HTML head.',
    });
  } else {
    passedChecks.push({
      title: 'Favicon Configured',
      detail: 'Favicon detected and active for browser tabs and Google mobile search results.',
    });
  }

  if (!hasAppleIcon) {
    mistakes.push({
      id: 'mistake-apple-icon-missing',
      category: 'mobile_security',
      title: 'Missing Apple Touch Icon',
      severity: 'warning',
      priority: 'low',
      description: 'No <link rel="apple-touch-icon"> tag was detected.',
      impact: 'When mobile users bookmark or add the site to their iOS home screen, a low-quality snapshot is used instead of your brand icon.',
      currentValue: 'No apple-touch-icon declared',
      recommendedFix: 'Add <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"> in the <head>.',
    });
  } else {
    passedChecks.push({
      title: 'Apple Touch Icon Defined',
      detail: 'High-resolution icon ready for iOS home screen bookmarks.',
    });
  }

  // CONTENT DEPTH
  if (wordCount < 250) {
    mistakes.push({
      id: 'mistake-thin-content',
      category: 'content_headings',
      title: `Thin Content Detected (${wordCount} Words)`,
      severity: 'warning',
      priority: 'medium',
      description: `Only ${wordCount} words of readable body text found on the page.`,
      impact: 'Google algorithms penalize thin pages with low information density for competitive search queries.',
      currentValue: `${wordCount} words`,
      recommendedFix: 'Expand the page content to at least 400–600 words of authentic, informative copy answering user intent.',
    });
  } else {
    passedChecks.push({
      title: 'Adequate Content Depth',
      detail: `${wordCount.toLocaleString()} words of readable content.`,
    });
  }

  // RESPONSE SPEED (TTFB)
  if (responseTimeMs > 1200) {
    mistakes.push({
      id: 'mistake-slow-speed',
      category: 'performance_technical',
      title: `Slow Server Response Time (${responseTimeMs}ms)`,
      severity: 'warning',
      priority: 'medium',
      description: `Page took ${responseTimeMs}ms to respond to initial HTTP request.`,
      impact: 'Core Web Vitals (TTFB/LCP) impact rankings. Bounce rates increase significantly when response time exceeds 1 second.',
      currentValue: `${responseTimeMs}ms`,
      recommendedFix: 'Implement edge caching (Cloudflare/Fastly), optimize database queries, or upgrade hosting tier.',
    });
  } else {
    passedChecks.push({
      title: 'Fast Server Response (TTFB)',
      detail: `Response time clocked at ${responseTimeMs}ms (well under Core Web Vitals 1,200ms threshold).`,
    });
  }

  // SECURITY HEADERS (HSTS)
  if (isHttps && !hasHsts) {
    mistakes.push({
      id: 'mistake-hsts-missing',
      category: 'mobile_security',
      title: 'Missing HTTP Strict Transport Security (HSTS)',
      severity: 'warning',
      priority: 'low',
      description: 'The web server does not send a Strict-Transport-Security response header.',
      impact: 'Without HSTS, browsers can initially attempt unencrypted HTTP connections, exposing users to SSL-stripping and man-in-the-middle attacks.',
      currentValue: 'No HSTS header',
      recommendedFix: 'Configure your web server or Cloudflare SSL to send "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload".',
    });
  } else if (isHttps && hasHsts) {
    passedChecks.push({
      title: 'HSTS Security Header Active',
      detail: 'Strict-Transport-Security enforces encrypted browser connections.',
    });
  }

  // CONTENT COMPRESSION
  if (!isCompressed && pageSizeKb > 50) {
    mistakes.push({
      id: 'mistake-compression-missing',
      category: 'performance_technical',
      title: 'Gzip or Brotli Compression Inactive',
      severity: 'warning',
      priority: 'low',
      description: 'The server response did not include Gzip, Brotli (br), or Deflate content-encoding.',
      impact: 'Uncompressed text payloads take longer to download over mobile cellular networks, delaying LCP.',
      currentValue: 'Uncompressed',
      recommendedFix: 'Enable Gzip or Brotli compression on your web server or CDN to reduce payload transfer by up to 70%.',
    });
  } else if (isCompressed) {
    passedChecks.push({
      title: 'Text Compression Enabled',
      detail: 'Page payload is compressed via Gzip/Brotli for fast mobile delivery.',
    });
  }

  // 21. SEOptimer Mathematical Category Scoring Engine
  // Category 1: On-Page SEO (Weight: 30%)
  let onPageScore = 100;
  if (!rawTitle) onPageScore -= 28;
  else if (titleLength < 30 || titleLength > 65) onPageScore -= 8;

  if (!rawMetaDesc) onPageScore -= 22;
  else if (metaDescLength < 60 || metaDescLength > 165) onPageScore -= 8;

  if (h1Count === 0) onPageScore -= 20;
  else if (h1Count > 1) onPageScore -= 6;

  if (h2Count === 0) onPageScore -= 6;
  if (hasHeadingHierarchyGap) onPageScore -= 8;

  if (imagesCount > 0 && imagesMissingAlt > 0) {
    const missingRatio = imagesMissingAlt / imagesCount;
    onPageScore -= Math.round(Math.min(18, 6 + missingRatio * 12));
  }

  if (!canonicalUrl) onPageScore -= 6;
  if (!hasSchemaOrg) onPageScore -= 8;
  if (!hasRobotsTxt) onPageScore -= 8;
  if (!hasSitemap) onPageScore -= 8;
  if (!hasGoogleAnalytics && !hasGtm) onPageScore -= 6;
  if (wordCount < 250) onPageScore -= 8;
  if (hasNoindex) onPageScore -= 40; // Critical indexing block

  onPageScore = Math.max(20, Math.min(100, onPageScore));
  const onPageGrade = computeGrade(onPageScore);

  // Category 2: Links (Weight: 20%)
  let linksScore = 100;
  if (totalLinks === 0) linksScore -= 45;
  else if (totalLinks < 5) linksScore -= 25;
  else if (totalLinks < 15) linksScore -= 12;

  if (internalLinks === 0) linksScore -= 30;
  if (externalLinks === 0) linksScore -= 14;
  if (unfriendlyLinksCount > 2) linksScore -= 8;

  linksScore = Math.max(20, Math.min(100, linksScore));
  const linksGrade = computeGrade(linksScore);

  // Category 3: Usability (Weight: 20%)
  let usabilityScore = 100;
  if (!hasViewport) usabilityScore -= 45;
  if (!isHttps) usabilityScore -= 30;
  if (!hasFavicon) usabilityScore -= 12;
  if (!hasAppleIcon) usabilityScore -= 8;
  if (!htmlLang || htmlLang.trim() === '') usabilityScore -= 8;
  if (!htmlCharset) usabilityScore -= 4;
  if (emailPrivacyExposed) usabilityScore -= 6;

  usabilityScore = Math.max(20, Math.min(100, usabilityScore));
  const usabilityGrade = computeGrade(usabilityScore);

  // Category 4: Performance (Weight: 15%)
  let perfScore = 100;
  if (responseTimeMs > 2500) perfScore -= 35;
  else if (responseTimeMs > 1200) perfScore -= 20;
  else if (responseTimeMs > 700) perfScore -= 10;

  if (pageSizeKb > 2500) perfScore -= 22;
  else if (pageSizeKb > 1000) perfScore -= 12;

  if (totalExternalAssets > 60) perfScore -= 18;
  else if (totalExternalAssets > 40) perfScore -= 10;

  if (!isCompressed && pageSizeKb > 50) perfScore -= 10;

  perfScore = Math.max(20, Math.min(100, perfScore));
  const perfGrade = computeGrade(perfScore);

  // Category 5: Social (Weight: 15%)
  let socialScore = 100;
  if (!hasOpenGraph) socialScore -= 40;
  else if (!hasOgImage) socialScore -= 20;

  if (!hasTwitterCard) socialScore -= 20;
  else if (!hasTwitterImage && !hasOgImage) socialScore -= 10;

  if (detectedSocialCount === 0) socialScore -= 30;
  else if (detectedSocialCount === 1) socialScore -= 16;
  else if (detectedSocialCount === 2) socialScore -= 8;

  if (!hasFacebookPixel) socialScore -= 6;

  socialScore = Math.max(15, Math.min(100, socialScore));
  const socialGrade = computeGrade(socialScore);

  // Composite Overall Score (SEOptimer standard weight formula)
  const overallScore = Math.max(
    20,
    Math.min(
      99,
      Math.round(
        onPageScore * 0.30 +
        linksScore * 0.20 +
        usabilityScore * 0.20 +
        perfScore * 0.15 +
        socialScore * 0.15
      )
    )
  );
  const overallGrade = computeGrade(overallScore);

  // Categories payload
  const categories: SEOAuditCategories = {
    on_page: {
      name: 'On-Page SEO',
      grade: onPageGrade,
      score: onPageScore,
      passed: passedChecks.filter((p) =>
        ['Title', 'Meta', 'H1', 'Subheadings', 'Alt', 'Indexing', 'Depth'].some((k) => p.title.includes(k))
      ).length,
      warnings: mistakes.filter((m) => m.category === 'meta_tags' || m.category === 'content_headings').length,
      errors: mistakes.filter(
        (m) => (m.category === 'meta_tags' || m.category === 'content_headings') && m.severity === 'critical'
      ).length,
      summary: `${h1Count} H1 heading(s), ${wordCount.toLocaleString()} words, ${imagesCount} image(s)`,
    },
    links: {
      name: 'Links',
      grade: linksGrade,
      score: linksScore,
      passed: totalLinks > 0 ? 2 : 0,
      warnings: externalLinks === 0 ? 1 : 0,
      errors: totalLinks === 0 ? 1 : 0,
      summary: `${totalLinks} total links (${internalLinks} internal, ${externalLinks} external)`,
    },
    usability: {
      name: 'Usability',
      grade: usabilityGrade,
      score: usabilityScore,
      passed: [hasViewport, isHttps, hasFavicon, !emailPrivacyExposed].filter(Boolean).length,
      warnings: mistakes.filter((m) => m.category === 'mobile_security' && m.severity !== 'critical').length,
      errors: mistakes.filter((m) => m.category === 'mobile_security' && m.severity === 'critical').length,
      summary: hasViewport ? 'Mobile responsive viewport detected' : 'Missing responsive viewport tag',
    },
    performance: {
      name: 'Performance',
      grade: perfGrade,
      score: perfScore,
      passed: responseTimeMs < 1200 ? 2 : 1,
      warnings: responseTimeMs > 1200 ? 1 : 0,
      errors: responseTimeMs > 2500 ? 1 : 0,
      summary: `Response time ${responseTimeMs}ms, page size ${pageSizeKb} KB`,
    },
    social: {
      name: 'Social',
      grade: socialGrade,
      score: socialScore,
      passed: [hasOpenGraph, hasTwitterCard, detectedSocialCount > 0].filter(Boolean).length,
      warnings: mistakes.filter((m) => m.category === 'links_social' && m.severity !== 'critical').length,
      errors: mistakes.filter((m) => m.category === 'links_social' && m.severity === 'critical').length,
      summary: `${detectedSocialCount} social profile(s) connected`,
    },
  };

  const businessName = targetMeta?.businessName || cleanDomain;
  const recipientEmail =
    targetMeta?.email && targetMeta.email !== 'Not Found' ? targetMeta.email : `contact@${cleanDomain}`;

  // AI pitch and recommendations with deterministic fallback
  const aiOutput = (await generateSEOInsightsAndPitch({
    domain: cleanDomain,
    businessName,
    overallScore,
    grade: overallGrade,
    mistakes: mistakes.map((m) => ({
      title: m.title,
      severity: m.severity,
      description: m.description,
      recommendedFix: m.recommendedFix,
    })),
  })) || generateDeterministicPitch(cleanDomain, businessName, overallScore, overallGrade, mistakes, recipientEmail);

  return {
    url: finalUrl,
    domain: cleanDomain,
    audited_at: auditedAt,
    overall_score: overallScore,
    grade: overallGrade,
    lead_id: targetMeta?.leadId,
    lead_name: targetMeta?.businessName || cleanDomain,
    lead_email: recipientEmail,
    categories,
    keywords_analysis: keywordsAnalysis,
    links_analysis: {
      total_links: totalLinks,
      internal_links: internalLinks,
      external_links: externalLinks,
      dofollow_links: dofollowLinks,
      nofollow_links: nofollowLinks,
      broken_links: 0,
      sample_internal: sampleInternal,
      sample_external: sampleExternal,
    },
    social_analysis: {
      has_open_graph: hasOpenGraph,
      og_title: ogTitle,
      og_description: ogDescription,
      og_image: ogImage,
      og_url: ogUrl,
      has_twitter_card: hasTwitterCard,
      twitter_card_type: twitterCard,
      twitter_title: twitterTitle,
      twitter_image: twitterImage,
      detected_profiles: detectedSocialProfiles,
    },
    usability_analysis: {
      has_viewport: hasViewport,
      has_favicon: hasFavicon,
      favicon_url: faviconUrl,
      has_apple_icon: hasAppleIcon,
      language: htmlLang,
      charset: htmlCharset,
      mobile_ready_score: usabilityScore,
    },
    summary: {
      critical_errors: mistakes.filter((m) => m.severity === 'critical').length,
      warnings: mistakes.filter((m) => m.severity === 'warning').length,
      passed_checks: passedChecks.length,
    },
    metrics: {
      title: {
        value: rawTitle,
        length: titleLength,
        status: titleStatus,
        message: titleMessage,
      },
      meta_description: {
        value: rawMetaDesc,
        length: metaDescLength,
        status: metaDescStatus,
        message: metaDescMessage,
      },
      canonical: {
        value: canonicalUrl,
        status: canonicalStatus,
        message: canonicalMessage,
      },
      h1_count: h1Count,
      h1_samples: h1Elements,
      h2_count: h2Count,
      h3_count: h3Count,
      h4_count: h4Count,
      has_heading_hierarchy_gap: hasHeadingHierarchyGap,
      word_count: wordCount,
      images_count: imagesCount,
      images_missing_alt: imagesMissingAlt,
      is_https: isHttps,
      has_viewport: hasViewport,
      has_robots_txt: hasRobotsTxt,
      has_sitemap: hasSitemap,
      has_schema_org: hasSchemaOrg,
      has_open_graph: hasOpenGraph,
      og_image_present: hasOgImage,
      has_twitter_card: hasTwitterCard,
      twitter_image_present: hasTwitterImage,
      has_hsts: hasHsts,
      has_x_content_type_options: hasXContentTypeOptions,
      external_scripts_count: externalScriptsCount,
      external_stylesheets_count: externalStylesheetsCount,
      total_external_assets: totalExternalAssets,
      response_time_ms: responseTimeMs,
      page_size_kb: pageSizeKb,
      has_google_analytics: hasGoogleAnalytics,
      has_gtm: hasGtm,
      has_facebook_pixel: hasFacebookPixel,
      has_noindex: hasNoindex,
      is_compressed: isCompressed,
      email_privacy_exposed: emailPrivacyExposed,
      exposed_emails_count: validEmails.length,
    },
    mistakes,
    passed_checks: passedChecks,
    ai_optimizer_recommendations: aiOutput.recommendations,
    suggested_pitch_email: {
      subject: aiOutput.emailSubject,
      body: aiOutput.emailBody,
      recipient_email: recipientEmail,
    },
  };
}

/**
 * Deterministic pitch generator tailored with real detected mistakes.
 */
function generateDeterministicPitch(
  domain: string,
  businessName: string,
  score: number,
  grade: string,
  mistakes: SEOMistake[],
  recipientEmail?: string
) {
  const criticals = mistakes.filter((m) => m.severity === 'critical');
  const warnings = mistakes.filter((m) => m.severity === 'warning');

  const mistakeBullets = [...criticals, ...warnings]
    .slice(0, 5)
    .map((m) => `• ${m.title}: ${m.description}\n  -> Impact: ${m.impact}`)
    .join('\n\n');

  const subject = `Urgent SEO Audit Notice for ${domain}: ${criticals.length} Critical Ranking Issues Found`;

  const body = `Hi ${businessName} Team,

I hope you're having a productive week.

I recently ran an automated Technical SEO audit across ${domain} and noticed several technical optimization gaps that are actively holding back your website from ranking higher on Google and converting organic search visitors.

Your site currently scored ${score}/100 (Health Grade: ${grade}).

Here are the key technical mistakes discovered during the audit:

${mistakeBullets || '• Optimization gaps detected in title tags and meta description structure.'}

Because Google prioritizes fast, accessible, and properly tagged pages with Mobile-First indexing, fixing these issues usually delivers a direct 20% to 45% lift in search impressions and qualified inbound inquiries.

Would you be open to a brief 10-minute chat this week where I can share the step-by-step resolution plan and help you implement these fixes?

Best regards,

SEO Optimization & Technical Growth Specialist
Audit Engine: LeadPulse AI
Website: https://${domain}`;

  const recommendations = [
    criticals.length > 0
      ? `Correct the ${criticals.length} critical on-page tags immediately to avoid Google crawl de-indexation.`
      : 'Optimize page title and meta description lengths for desktop & mobile snippet displays.',
    'Add structured JSON-LD Schema markup to qualify for rich snippet visibility and higher CTR.',
    'Ensure all content images include keyword-focused descriptive ALT attributes.',
    'Review heading hierarchy (H1, H2, H3) to maximize semantic topical relevance for search crawlers.',
  ];

  return {
    recommendations,
    emailSubject: subject,
    emailBody: body,
    recipientEmail,
  };
}
