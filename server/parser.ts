import * as cheerio from 'cheerio';
import type { ExtractedWebsiteData, HeadingItem, ImageAuditItem, LinkAuditItem } from '../src/types/audit.js';
import type { CrawlResult } from './crawler.js';

const CTA_KEYWORDS = [
  'get started',
  'start free',
  'free trial',
  'sign up',
  'book a demo',
  'schedule',
  'contact us',
  'try now',
  'request demo',
  'join now',
  'buy now',
  'order now',
  'subscribe',
  'explore pricing',
  'learn more',
  'get in touch',
  'start now',
];

export function parseHtml(crawlData: CrawlResult, initialUrl: string): ExtractedWebsiteData {
  const { html, status, finalUrl, responseTimeMs, contentLength } = crawlData;
  const $ = cheerio.load(html);

  const parsedUrl = new URL(finalUrl);
  const domain = parsedUrl.hostname;

  // Basic metadata
  const title = ($('title').first().text() || '').trim();
  const metaDescription = ($('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '').trim();
  const canonicalUrl = ($('link[rel="canonical"]').attr('href') || '').trim();
  const language = ($('html').attr('lang') || $('meta[http-equiv="content-language"]').attr('content') || '').trim();
  const charset = ($('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '').trim();
  const viewport = ($('meta[name="viewport"]').attr('content') || '').trim();
  const hasViewportMeta = viewport.length > 0;
  const isHttps = finalUrl.startsWith('https://');

  // Headings
  const h1List: string[] = [];
  const h2List: string[] = [];
  const h3List: string[] = [];
  const sampleHeadings: HeadingItem[] = [];

  $('h1').each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, ' ').trim();
    if (txt) {
      h1List.push(txt);
      if (sampleHeadings.length < 20) {
        sampleHeadings.push({ tag: 'h1', text: txt });
      }
    }
  });

  $('h2').each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, ' ').trim();
    if (txt) {
      h2List.push(txt);
      if (sampleHeadings.length < 20) {
        sampleHeadings.push({ tag: 'h2', text: txt });
      }
    }
  });

  $('h3').each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, ' ').trim();
    if (txt) {
      h3List.push(txt);
      if (sampleHeadings.length < 20) {
        sampleHeadings.push({ tag: 'h3', text: txt });
      }
    }
  });

  const totalHeadings = h1List.length + h2List.length + h3List.length;

  // Links
  let internalCount = 0;
  let externalCount = 0;
  let emptyTextCount = 0;
  const ctaLinks: string[] = [];
  const sampleLinks: LinkAuditItem[] = [];

  $('a').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    const ariaLabel = ($(el).attr('aria-label') || '').trim();
    const visibleOrAccessibleText = text || ariaLabel;

    if (!visibleOrAccessibleText && href) {
      emptyTextCount++;
    }

    let isExternal = false;
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
      try {
        const linkUrl = new URL(href.startsWith('//') ? 'https:' + href : href);
        if (linkUrl.hostname !== domain && !linkUrl.hostname.endsWith('.' + domain)) {
          isExternal = true;
          externalCount++;
        } else {
          internalCount++;
        }
      } catch {
        internalCount++;
      }
    } else if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      internalCount++;
    }

    // Detect CTA keywords
    const lowerText = visibleOrAccessibleText.toLowerCase();
    const isCta = CTA_KEYWORDS.some((kw) => lowerText.includes(kw));
    if (isCta && visibleOrAccessibleText && !ctaLinks.includes(visibleOrAccessibleText)) {
      ctaLinks.push(visibleOrAccessibleText);
    }

    if (sampleLinks.length < 25 && href) {
      sampleLinks.push({
        text: visibleOrAccessibleText || '[No link text / Icon only]',
        href: href.slice(0, 100),
        isExternal,
        isCtaLike: isCta,
        hasText: !!visibleOrAccessibleText,
      });
    }
  });

  // Images
  let withAltCount = 0;
  let missingAltCount = 0;
  const sampleImages: ImageAuditItem[] = [];
  const missingAltSamples: string[] = [];

  $('img').each((_, el) => {
    const src = ($(el).attr('src') || $(el).attr('data-src') || '').trim();
    const alt = $(el).attr('alt');
    const hasAlt = typeof alt === 'string' && alt.trim().length > 0;

    if (hasAlt) {
      withAltCount++;
    } else {
      missingAltCount++;
      if (src && missingAltSamples.length < 10) {
        missingAltSamples.push(src.slice(0, 80));
      }
    }

    if (sampleImages.length < 20 && src) {
      sampleImages.push({
        src: src.slice(0, 100),
        alt: typeof alt === 'string' ? alt : '[Missing alt attribute]',
        hasAlt,
      });
    }
  });

  const totalImages = withAltCount + missingAltCount;
  const altCoveragePercent = totalImages > 0 ? Math.round((withAltCount / totalImages) * 100) : 100;

  // Semantics
  const hasHeader = $('header').length > 0;
  const hasNav = $('nav').length > 0;
  const hasMain = $('main, [role="main"]').length > 0;
  const hasSection = $('section').length > 0;
  const hasFooter = $('footer').length > 0;
  const hasArticle = $('article').length > 0;
  const hasAside = $('aside').length > 0;
  const hasForm = $('form').length > 0;
  const hasButton = $('button').length > 0;

  const tagsFound: string[] = [];
  if (hasHeader) tagsFound.push('<header>');
  if (hasNav) tagsFound.push('<nav>');
  if (hasMain) tagsFound.push('<main>');
  if (hasSection) tagsFound.push('<section>');
  if (hasFooter) tagsFound.push('<footer>');
  if (hasArticle) tagsFound.push('<article>');
  if (hasAside) tagsFound.push('<aside>');
  if (hasForm) tagsFound.push('<form>');
  if (hasButton) tagsFound.push('<button>');

  // Open Graph / Social
  const ogTitle = ($('meta[property="og:title"]').attr('content') || '').trim();
  const ogDescription = ($('meta[property="og:description"]').attr('content') || '').trim();
  const ogImage = ($('meta[property="og:image"]').attr('content') || '').trim();
  const ogType = ($('meta[property="og:type"]').attr('content') || '').trim();
  const twitterCard = ($('meta[name="twitter:card"]').attr('content') || '').trim();
  const hasOgComplete = !!(ogTitle && ogDescription && ogImage);

  // Performance Signals
  const scriptsCount = $('script').length;
  const stylesheetsCount = $('link[rel="stylesheet"]').length;
  const inlineStyleCount = $('style, [style]').length;

  // Forms
  let inputsWithoutLabels = false;
  const sampleFormActions: string[] = [];
  $('form').each((_, formEl) => {
    const action = $(formEl).attr('action') || '[inline / js handled]';
    sampleFormActions.push(action);
    const inputs = $(formEl).find('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
    inputs.each((_, inputEl) => {
      const id = $(inputEl).attr('id');
      const ariaLabel = $(inputEl).attr('aria-label');
      const placeholder = $(inputEl).attr('placeholder');
      const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
      if (!hasLabel && !ariaLabel && !placeholder) {
        inputsWithoutLabels = true;
      }
    });
  });

  // Clean visible text preview
  // Remove non-visible tags
  $('script, style, noscript, svg, template, iframe').remove();
  const bodyText = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .trim();
  const approxWordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const bodySnippet = bodyText.slice(0, 3500);

  return {
    url: initialUrl,
    finalUrl,
    domain,
    httpStatus: status,
    responseTimeMs,
    htmlSizeBytes: contentLength,
    title,
    metaDescription,
    canonicalUrl,
    language,
    charset,
    viewport,
    hasViewportMeta,
    isHttps,
    headings: {
      h1: h1List,
      h2: h2List,
      h3: h3List,
      totalCount: totalHeadings,
      h1Count: h1List.length,
      hasMultipleH1: h1List.length > 1,
      hasMissingH1: h1List.length === 0,
      sampleList: sampleHeadings,
    },
    links: {
      totalCount: internalCount + externalCount,
      internalCount,
      externalCount,
      emptyTextCount,
      ctaLinks,
      sampleLinks,
    },
    images: {
      totalCount: totalImages,
      withAltCount,
      missingAltCount,
      altCoveragePercent,
      sampleImages,
      missingAltSamples,
    },
    semantics: {
      hasHeader,
      hasNav,
      hasMain,
      hasSection,
      hasFooter,
      hasArticle,
      hasAside,
      hasForm,
      hasButton,
      totalLandmarks: tagsFound.length,
      tagsFound,
    },
    socialMeta: {
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      twitterCard,
      hasOgComplete,
    },
    performanceSignals: {
      scriptsCount,
      stylesheetsCount,
      inlineStyleCount,
      textLength: bodyText.length,
      approxWordCount,
    },
    forms: {
      count: $('form').length,
      hasInputsWithoutLabels: inputsWithoutLabels,
      sampleFormActions,
    },
    bodySnippet,
  };
}
