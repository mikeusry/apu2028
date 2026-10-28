/**
 * Tiny Supabase REST helper shared by the API routes (server-side only).
 * Uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. Every call has a timeout so a
 * slow store can never hang a request.
 */
export async function db(path: string, method = 'GET', body?: unknown, prefer = 'return=minimal', timeoutMs = 3000) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('supabase not configured');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
      method,
      signal: ctrl.signal,
      // New-style keys (sb_secret_...) go in apikey only; legacy JWT service-role keys also need Authorization.
      headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json', Prefer: prefer },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error(`supabase ${method} ${r.status}`);
    const text = await r.text();
    return text ? JSON.parse(text) : [];
  } finally {
    clearTimeout(t);
  }
}

/** Count rows matching a PostgREST filter (uses Prefer: count=exact on a HEAD-like query). */
export async function countRows(table: string, filter: string, timeoutMs = 1500): Promise<number> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('supabase not configured');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${table}?select=id&${filter}`, {
      method: 'HEAD',
      signal: ctrl.signal,
      headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}), Prefer: 'count=exact' },
    });
    if (!r.ok) throw new Error(`supabase count ${r.status}`);
    const range = r.headers.get('content-range') || '';
    return Number(range.split('/')[1] || 0);
  } finally {
    clearTimeout(t);
  }
}
