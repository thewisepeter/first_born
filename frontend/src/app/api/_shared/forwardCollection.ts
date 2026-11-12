import type { NextRequest } from 'next/server';

export async function forwardCollection(
  request: NextRequest,
  collection: 'drives' | 'opportunities'
) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const headers = new Headers();
  for (const name of ['cookie', 'authorization', 'accept', 'x-csrftoken']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const csrf = request.cookies.get('csrftoken')?.value;
  if (csrf && !headers.has('x-csrftoken')) headers.set('x-csrftoken', csrf);

  try {
    const response = await fetch(
      `${base.replace(/\/$/, '')}/api/${collection}/${collection}/${request.nextUrl.search}`,
      { headers, cache: 'no-store', redirect: 'manual' }
    );
    const output = new Headers({ 'Cache-Control': 'private, no-store' });
    for (const name of ['content-type', 'location', 'www-authenticate']) {
      const value = response.headers.get(name);
      if (value) output.set(name, value);
    }
    return new Response(response.body, { status: response.status, headers: output });
  } catch {
    return Response.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
