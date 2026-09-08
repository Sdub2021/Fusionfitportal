/**
 * Edge cache in front of GitHub Pages.
 * GitHub Pages sends Cache-Control: max-age=600. This worker
 * caches static assets at the Cloudflare edge for 7 days and
 * keeps HTML / the service worker fresh.
 *
 * Origin must be the unproxied GitHub Pages host, not this domain
 * (that would loop). Set ORIGIN in wrangler.toml.
 */
const STATIC = /\.(?:css|js|mjs|map|svg|png|jpe?g|webp|gif|ico|woff2?|ttf|otf|json|txt|xml|webmanifest)$/i;
const NEVER = /(?:^\/sw\.js$)|(?:\/sw\.js\?)/i;

function cacheControl(pathname) {
  if (NEVER.test(pathname) || pathname.endsWith('.html') || pathname === '/' || pathname === '') {
    return 'public, max-age=60, must-revalidate';
  }
  if (STATIC.test(pathname)) {
    return 'public, max-age=604800, stale-while-revalidate=86400';
  }
  return 'public, max-age=60, must-revalidate';
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return fetch(request);
    }

    const url = new URL(request.url);
    const originBase = (env.ORIGIN || 'https://sdub2021.github.io/Fusionfitportal').replace(/\/$/, '');
    const originUrl = originBase + url.pathname + url.search;

    const edgeKey = new Request(url.toString(), { method: 'GET' });
    const cache = caches.default;
    const hit = await cache.match(edgeKey);
    if (hit) return hit;

    const inbound = new Headers(request.headers);
    inbound.delete('cookie');
    inbound.set('host', new URL(originBase).host);

    const upstream = await fetch(originUrl, {
      method: request.method,
      headers: inbound,
      redirect: 'follow',
    });

    const headers = new Headers(upstream.headers);
    headers.set('Cache-Control', cacheControl(url.pathname));
    headers.set('CDN-Cache-Control', cacheControl(url.pathname));
    headers.set('X-FIT-Edge', 'cloudflare-worker');

    const res = new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });

    if (upstream.ok && request.method === 'GET') {
      ctx.waitUntil(cache.put(edgeKey, res.clone()));
    }
    return res;
  },
};
