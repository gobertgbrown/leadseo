import { handleClientApiRequest } from './clientApiHandler.js';

let isInterceptorInstalled = false;
let isStaticHostConfirmed = false;

export function setupClientApiInterceptor(): void {
  if (typeof window === 'undefined' || isInterceptorInstalled) return;

  const hostname = window.location.hostname.toLowerCase();
  // If running on Netlify, Vercel, GitHub Pages, or any static deployment domain without custom Node server
  if (
    hostname.includes('netlify.app') ||
    hostname.includes('vercel.app') ||
    hostname.includes('github.io') ||
    hostname.includes('surge.sh') ||
    hostname.includes('render.com') ||
    hostname.includes('onrender.com')
  ) {
    isStaticHostConfirmed = true;
    console.info('[LeadPulse] Static cloud deployment detected (Netlify/Vercel). Activating client-side data engine.');
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let urlStr = '';
    if (typeof input === 'string') {
      urlStr = input;
    } else if (input instanceof URL) {
      urlStr = input.href;
    } else if (input && typeof (input as Request).url === 'string') {
      urlStr = (input as Request).url;
    }

    const isApiRequest = urlStr.startsWith('/api/') || urlStr.includes('/api/');

    if (!isApiRequest) {
      return originalFetch(input, init);
    }

    // If static host is already detected, directly route to client handler
    if (isStaticHostConfirmed) {
      try {
        return await handleClientApiRequest(urlStr, init);
      } catch (err) {
        console.error('[LeadPulse Interceptor Error]', err);
        return new Response(JSON.stringify({ error: 'Client API execution error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Try server first; if server returns 404 HTML (Netlify missing backend) or network fails, fallback to client handler
    try {
      const response = await originalFetch(input, init);
      const contentType = response.headers.get('content-type') || '';
      const isHtmlResponse = contentType.includes('text/html');

      if (!response.ok && (response.status === 404 || response.status === 405 || isHtmlResponse)) {
        isStaticHostConfirmed = true;
        console.warn(`[LeadPulse] Server returned ${response.status} (${contentType}) for ${urlStr}. Automatically switching to client-side data store.`);
        return await handleClientApiRequest(urlStr, init);
      }

      return response;
    } catch (networkError) {
      isStaticHostConfirmed = true;
      console.warn(`[LeadPulse] Backend unreachable. Automatically switching to client-side data store.`, networkError);
      return await handleClientApiRequest(urlStr, init);
    }
  };

  isInterceptorInstalled = true;
  console.info('[LeadPulse] API Interceptor active with zero-config static hosting support.');
}
