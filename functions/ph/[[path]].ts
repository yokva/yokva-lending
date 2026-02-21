interface Env {
  POSTHOG_PROXY_HOST?: string;
}

const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

function getTargetHost(env: Env): string {
  return String(env.POSTHOG_PROXY_HOST ?? '').trim() || DEFAULT_POSTHOG_HOST;
}

function buildUpstreamUrl(requestUrl: string, targetHost: string): string {
  const incoming = new URL(requestUrl);
  const strippedPath = incoming.pathname.replace(/^\/ph/, '') || '/';
  return new URL(`${strippedPath}${incoming.search}`, targetHost).toString();
}

function sanitizeRequestHeaders(input: Headers): Headers {
  const headers = new Headers(input);

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  headers.delete('cookie');
  headers.delete('cf-connecting-ip');
  headers.delete('x-forwarded-for');
  headers.delete('x-forwarded-proto');
  headers.delete('x-real-ip');

  return headers;
}

function sanitizeResponseHeaders(input: Headers): Headers {
  const headers = new Headers(input);

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  return headers;
}

export async function onRequest(context: EventContext<Env, string, unknown>) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
      },
    });
  }

  try {
    const targetHost = getTargetHost(env);
    const upstreamUrl = buildUpstreamUrl(request.url, targetHost);

    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: sanitizeRequestHeaders(request.headers),
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    });

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: sanitizeResponseHeaders(upstreamResponse.headers),
    });
  } catch (error) {
    console.error('[posthog-proxy] request failed', error);
    return new Response('PostHog proxy error', { status: 502 });
  }
}
