/**
 * Cloudflare Worker — Notie 이미지 업로드 (R2)
 *
 * Routes:
 *   PUT  /:key   — 이미지 업로드
 *   DELETE /:key — 이미지 삭제
 *
 * 환경 변수 (wrangler.toml 또는 Cloudflare Dashboard):
 *   IMAGES_BUCKET  — R2 bucket binding
 *   API_KEY        — 클라이언트 인증용 키
 *   ALLOWED_ORIGIN — CORS origin (예: https://notie.app)
 */

interface Env {
  IMAGES_BUCKET: R2Bucket;
  API_KEY: string;
  ALLOWED_ORIGIN: string;
}

const cors = (env: Env) => ({
  'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
});

function unauthorized(env: Env) {
  return new Response('Unauthorized', { status: 401, headers: cors(env) });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = cors(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // API Key 인증
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${env.API_KEY}`) {
      return unauthorized(env);
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1); // "userId/timestamp.jpg"

    if (!key) {
      return new Response('Missing key', { status: 400, headers });
    }

    if (request.method === 'PUT') {
      const body = await request.arrayBuffer();
      const contentType = request.headers.get('Content-Type') || 'image/jpeg';

      await env.IMAGES_BUCKET.put(key, body, {
        httpMetadata: { contentType },
      });

      // R2 Public URL (Custom Domain 또는 r2.dev subdomain)
      const publicUrl = `${url.origin}/${key}`;

      return new Response(JSON.stringify({ url: publicUrl, size: body.byteLength }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'DELETE') {
      await env.IMAGES_BUCKET.delete(key);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // GET — 이미지 서빙 (R2 public access 대신 Worker에서 서빙할 경우)
    if (request.method === 'GET') {
      const object = await env.IMAGES_BUCKET.get(key);
      if (!object) {
        return new Response('Not Found', { status: 404, headers });
      }

      const objectHeaders = new Headers(headers);
      objectHeaders.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
      objectHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
      objectHeaders.set('ETag', object.httpEtag);

      return new Response(object.body, { headers: objectHeaders });
    }

    return new Response('Method Not Allowed', { status: 405, headers });
  },
};
