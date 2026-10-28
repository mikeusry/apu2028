/**
 * Ayn Parker Usry - Contact form
 *
 * POST /api/contact (JSON or form-encoded)
 * 1. Honeypot + server-side validation + rate limit (Vercel KV, per hashed IP)
 * 2. Log to Supabase public.site_contacts (program-match project) via service-role key
 * 3. Email Mike via SendGrid, same env vars as api/alert.ts
 *    (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, ALERT_EMAIL), reply-to = sender
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server only; never shipped to the client).
 * No email address or phone is ever returned to the browser.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';
import { kv } from '@vercel/kv';
import { createHash } from 'node:crypto';

const ROLES = ['College coach', 'Club/HS coach', 'Recruiter', 'Other'] as const;
const LIMITS = { name: 120, school: 160, email: 200, phone: 40, message: 5000 };
const RATE_MAX = 5; // submissions per IP per hour
const RATE_WINDOW_S = 60 * 60;

type Contact = { name: string; role: string; school: string; email: string; phone: string; message: string };

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const EMAIL_RE = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/;

function validate(body: Record<string, unknown>): { ok: true; data: Contact } | { ok: false; error: string } {
  const data: Contact = {
    name: clean(body.name, LIMITS.name),
    role: clean(body.role, 40),
    school: clean(body.school, LIMITS.school),
    email: clean(body.email, LIMITS.email),
    phone: clean(body.phone, LIMITS.phone),
    message: clean(body.message, LIMITS.message),
  };
  if (data.name.length < 2) return { ok: false, error: 'Please enter your name.' };
  if (data.role && !(ROLES as readonly string[]).includes(data.role)) return { ok: false, error: 'Please choose a role from the list.' };
  if (!EMAIL_RE.test(data.email)) return { ok: false, error: 'Please enter a valid email.' };
  if (data.phone && !/^[0-9+().\-\s x]{7,40}$/i.test(data.phone)) return { ok: false, error: 'Please check the phone number.' };
  if (data.message.length < 5) return { ok: false, error: 'Please enter a message.' };
  return { ok: true, data };
}

async function supabase(path: string, method: string, body?: unknown, prefer = 'return=representation') {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
    method,
    // New-style keys (sb_secret_...) go in apikey only; legacy JWT service-role keys also need Authorization.
    headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json', Prefer: prefer },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`supabase ${method} ${r.status}`);
  return r.status === 204 ? [] : r.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  let body: Record<string, unknown> = {};
  if (typeof req.body === 'string') {
    try { body = JSON.parse(req.body); } catch { body = Object.fromEntries(new URLSearchParams(req.body)); }
  } else body = req.body || {};

  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (clean(body.website, 200)) return res.status(200).json({ ok: true });

  const v = validate(body);
  if (v.ok === false) return res.status(400).json({ ok: false, error: v.error });
  const c = v.data;

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const ipHash = createHash('sha256').update(`${process.env.CONTACT_IP_SALT || 'apu-site-contact'}:${ip}`).digest('hex').slice(0, 32);

  // Rate limit (fail open if KV is unavailable)
  try {
    const key = `contact:rl:${ipHash}`;
    const n = await kv.incr(key);
    if (n === 1) await kv.expire(key, RATE_WINDOW_S);
    if (n > RATE_MAX) return res.status(429).json({ ok: false, error: 'Too many messages. Please try again later.' });
  } catch (e) {
    console.error('[contact] rate limit unavailable', (e as Error).message);
  }

  const pageUrl = clean(body.page_url, 500) || String(req.headers.referer || '').slice(0, 500);
  const userAgent = String(req.headers['user-agent'] || '').slice(0, 500);

  // 1) Log first so nothing is lost if email fails
  let rowId: string | null = null;
  let logged = false;
  try {
    const rows = (await supabase('site_contacts', 'POST', {
      name: c.name, role: c.role || null, school: c.school || null, email: c.email, phone: c.phone || null,
      message: c.message, page_url: pageUrl || null, user_agent: userAgent || null, ip_hash: ipHash, email_status: 'pending',
    })) as Array<{ id: string }> | null;
    if (rows) { rowId = rows[0]?.id ?? null; logged = true; }
    else console.error('[contact] Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  } catch (e) {
    console.error('[contact] log failed', (e as Error).message);
  }

  // 2) Email Mike
  let emailStatus = 'not_sent';
  let sendgridCode: number | null = null;
  const apiKey = process.env.SENDGRID_API_KEY;
  if (apiKey) {
    sgMail.setApiKey(apiKey);
    const rowsHtml = ([['Name', c.name], ['Role', c.role || '-'], ['School / program', c.school || '-'], ['Email', c.email], ['Phone', c.phone || '-'], ['Page', pageUrl || '-']] as const)
      .map(([k, val]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b">${k}</td><td style="padding:6px 0;font-weight:600">${esc(val)}</td></tr>`).join('');
    try {
      const [resp] = await sgMail.send({
        to: process.env.ALERT_EMAIL || 'mike@point.dog',
        from: process.env.SENDGRID_FROM_EMAIL || 'alerts@point.dog',
        replyTo: { email: c.email, name: c.name },
        subject: `Ayn site contact: ${c.name}${c.school ? `, ${c.school}` : ''}`.slice(0, 200),
        text: `Name: ${c.name}\nRole: ${c.role || '-'}\nSchool/program: ${c.school || '-'}\nEmail: ${c.email}\nPhone: ${c.phone || '-'}\nPage: ${pageUrl || '-'}\n\n${c.message}\n`,
        html: `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px"><h2 style="margin:0 0 12px">New contact from Ayn's site</h2><table>${rowsHtml}</table><p style="white-space:pre-wrap;margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px">${esc(c.message)}</p><p style="color:#94a3b8;font-size:12px">Reply to this email to answer ${esc(c.name)} directly.</p></div>`,
      });
      sendgridCode = resp?.statusCode ?? null;
      emailStatus = sendgridCode === 202 ? 'sent_202' : `sendgrid_${sendgridCode}`;
    } catch (e) {
      const code = (e as { code?: number }).code;
      emailStatus = `failed${code ? `_${code}` : ''}`;
      console.error('[contact] SendGrid failed', code);
    }
  } else {
    emailStatus = 'no_api_key';
  }

  if (rowId) {
    try { await supabase(`site_contacts?id=eq.${rowId}`, 'PATCH', { email_status: emailStatus }, 'return=minimal'); }
    catch (e) { console.error('[contact] status update failed', (e as Error).message); }
  }

  if (!logged && !emailStatus.startsWith('sent')) {
    return res.status(500).json({ ok: false, error: 'Sorry, something went wrong. Please try again later.' });
  }
  return res.status(200).json({ ok: true, logged, email: emailStatus, ...(sendgridCode ? { sendgrid: sendgridCode } : {}) });
}
