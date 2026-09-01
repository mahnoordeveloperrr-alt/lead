import { verifyPublicDns } from './ssrfGuard.js';

export interface CrawlResult {
  html: string;
  status: number;
  finalUrl: string;
  responseTimeMs: number;
  contentLength: number;
}

const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5 MB max
const FETCH_TIMEOUT_MS = 12000; // 12 seconds timeout
const MAX_REDIRECTS = 5;

export async function crawlWebsite(targetUrl: string): Promise<CrawlResult> {
  const parsed = new URL(targetUrl);
  const isPublic = await verifyPublicDns(parsed.hostname);
  if (!isPublic) {
    throw new Error('Target hostname resolved to a forbidden private IP address.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const startTime = Date.now();
  let currentUrl = targetUrl;
  let redirectCount = 0;

  try {
    let response: Response;
    while (true) {
      response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (AI-Website-Auditor/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
        redirect: 'manual',
      });

      // Handle redirects manually for security validation
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) break;

        redirectCount++;
        if (redirectCount > MAX_REDIRECTS) {
          throw new Error(`Too many redirects (exceeded ${MAX_REDIRECTS}).`);
        }

        // Resolve relative URLs
        const redirectUrl = new URL(location, currentUrl).href;
        const redirectParsed = new URL(redirectUrl);

        // Validate redirect target is not private
        const isPublicRedirect = await verifyPublicDns(redirectParsed.hostname);
        if (!isPublicRedirect) {
          throw new Error('Redirect targets a forbidden private IP address.');
        }

        currentUrl = redirectUrl;
        continue;
      }

      break;
    }

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;

    if (!response.ok && response.status >= 500) {
      throw new Error(`Target server returned HTTP ${response.status} (${response.statusText}).`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (
      !contentType.includes('text/html') &&
      !contentType.includes('application/xhtml+xml') &&
      !contentType.includes('text/plain') &&
      !contentType.includes('application/xml')
    ) {
      // If it's a binary file like PDF or image, warn
      if (contentType.includes('image/') || contentType.includes('application/pdf')) {
        throw new Error(`The target URL returned a binary file (${contentType}) rather than a web page.`);
      }
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_RESPONSE_BYTES) {
      throw new Error(`Page size exceeds maximum safety limit of 5MB.`);
    }

    const decoder = new TextDecoder('utf-8');
    const html = decoder.decode(arrayBuffer);

    return {
      html,
      status: response.status,
      finalUrl: response.url || targetUrl,
      responseTimeMs,
      contentLength: arrayBuffer.byteLength,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Connection timed out after ${FETCH_TIMEOUT_MS / 1000}s while attempting to reach the website.`);
    }
    throw error;
  }
}
