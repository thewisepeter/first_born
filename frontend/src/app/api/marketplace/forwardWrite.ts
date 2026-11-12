// Three 5 MiB photos plus multipart fields. Bound memory even without an incoming length.
const MAX_BODY_BYTES = 16 * 1024 * 1024;

export async function forwardListingWrite(request: Request, id?: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const headers = new Headers();
  for (const name of ['content-type', 'cookie', 'x-csrftoken', 'origin', 'referer']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const tooLarge = () => Response.json({ detail: 'Upload exceeds 16 MiB.' }, { status: 413 });
    if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) return tooLarge();
    const reader = request.body?.getReader();
    const chunks: ArrayBuffer[] = [];
    let size = 0;
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_BODY_BYTES) {
            await reader.cancel();
            return tooLarge();
          }
          chunks.push(value.slice().buffer as ArrayBuffer);
        }
      } finally {
        reader.releaseLock();
      }
    }
    // A sized Blob lets fetch send Content-Length to WSGI. It does not re-encode
    // the multipart body, so the original Content-Type (boundary included) is correct.
    const upstream = await fetch(
      `${base}/api/marketplace/listings/${id ? encodeURIComponent(id) + '/' : ''}`,
      {
        method: request.method,
        headers,
        body: new Blob(chunks),
        cache: 'no-store',
        redirect: 'error',
      }
    );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return Response.json({ detail: 'Marketplace unavailable. Please try again.' }, { status: 503 });
  }
}
