/**
 * Ayn Parker Usry - Recruitment Tracker
 *
 * Tracks pageviews and video plays with geolocation.
 * Stores events in Supabase (public.site_events, service role only).
 *
 * Vercel provides geo data automatically via headers:
 * - x-vercel-ip-city
 * - x-vercel-ip-country-region
 * - x-vercel-ip-country
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import { db } from './_db.js';

// UTM parameters for campaign attribution
interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

// All supported event types
type EventType =
  | 'pageview'
  | 'video_play'
  | 'video_progress'
  | 'resume_download'
  | 'schedule_view'
  | 'coach_email_click'
  | 'contact_form_submit'
  | 'section_view';

interface TrackingEvent {
  id: string;
  type: EventType;
  timestamp: string;
  // Geo data (from Vercel headers)
  city: string | null;
  region: string | null;
  country: string | null;
  // Page data
  page: string;
  referrer: string | null;
  // Video data (optional)
  videoId?: string;
  videoProgress?: number; // percentage watched
  // Device info
  userAgent: string | null;
  device: 'mobile' | 'tablet' | 'desktop';
  // UTM params (optional)
  utm?: UtmParams;
  // Event-specific metadata
  format?: string; // for resume_download
  tournament?: string; // for schedule_view
  emailType?: string; // for coach_email_click
  formType?: string; // for contact_form_submit
  section?: string; // for section_view
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function detectDevice(ua: string | null): 'mobile' | 'tablet' | 'desktop' {
  if (!ua) return 'desktop';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|iphone|android.*mobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const userAgent = req.headers['user-agent'] as string || '';

    // Ignore Vercel's screenshot bot
    if (userAgent.includes('vercel-screenshot')) {
      return res.status(200).json({ ok: true, ignored: true });
    }

    // Get geo data from Vercel headers (automatically populated)
    const city = req.headers['x-vercel-ip-city'] as string || null;
    const region = req.headers['x-vercel-ip-country-region'] as string || null;
    const country = req.headers['x-vercel-ip-country'] as string || null;

    // Decode city (comes URL encoded)
    const decodedCity = city ? decodeURIComponent(city) : null;

    const event: TrackingEvent = {
      id: generateId(),
      type: body.type || 'pageview',
      timestamp: new Date().toISOString(),
      city: decodedCity,
      region: region,
      country: country,
      page: body.page || '/',
      referrer: body.referrer || null,
      videoId: body.videoId || undefined,
      videoProgress: body.videoProgress || undefined,
      userAgent: userAgent,
      device: detectDevice(userAgent),
      // UTM params
      utm: body.utm || undefined,
      // Event-specific metadata
      format: body.format || undefined,
      tournament: body.tournament || undefined,
      emailType: body.emailType || undefined,
      formType: body.formType || undefined,
      section: body.section || undefined
    };

    // Store in Supabase (public.site_events). Short timeout so tracking never hangs the page.
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const ipHash = ip ? createHash('sha256').update(`apu-site-track:${ip}`).digest('hex').slice(0, 32) : null;
    const meta: Record<string, unknown> = {};
    for (const k of ['videoProgress', 'format', 'tournament', 'emailType', 'formType', 'section'] as const) {
      if (event[k] !== undefined) meta[k] = event[k];
    }
    await db('site_events', 'POST', {
      type: String(event.type).slice(0, 40),
      page: String(event.page).slice(0, 500),
      referrer: event.referrer ? String(event.referrer).slice(0, 500) : null,
      city: event.city, region: event.region, country: event.country,
      device: event.device,
      user_agent: userAgent.slice(0, 500),
      video_id: event.videoId ? String(event.videoId).slice(0, 100) : null,
      utm: event.utm || null,
      meta: Object.keys(meta).length ? meta : null,
      ip_hash: ipHash,
    }, 'return=minimal', 2500);

    // Build log message
    const utmInfo = event.utm?.utm_source ? ` [utm_source=${event.utm.utm_source}]` : '';
    console.log(`[APU Tracker] ${event.type} from ${decodedCity || 'Unknown'}, ${region || ''} ${country || ''}${utmInfo}`);

    return res.status(200).json({ ok: true, id: event.id });

  } catch (error) {
    console.error('[APU Tracker] Error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
