import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Proxy to backend image endpoint (so frontend code stays stable if backend host changes)
export async function GET(req: NextRequest, context: any) {
  const id = context?.params?.id;
  if (!id || typeof id !== 'string') {
    return new Response('Missing id', { status: 400 });
  }
  const backendBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
  const url = `${backendBase}/images/${id}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    return new Response('Error fetching image', { status: res.status });
  }
  const arrayBuffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  return new Response(arrayBuffer, {
    status: 200,
    headers: {
      'content-type': contentType,
      'cache-control': 'public, max-age=86400',
    },
  });
}
