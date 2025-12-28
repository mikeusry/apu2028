/**
 * Ayn Parker Usry - Recruitment Tracker
 *
 * Tracks pageviews and video plays with geolocation.
 * Stores events in Vercel KV (Redis) for easy querying.
 *
 * Vercel provides geo data automatically via headers:
 * - x-vercel-ip-city
 * - x-vercel-ip-country-region
 * - x-vercel-ip-country
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

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

    // Get geo data from Vercel headers (automatically populated)
    const city = req.headers['x-vercel-ip-city'] as string || null;
    const region = req.headers['x-vercel-ip-country-region'] as string || null;
    const country = req.headers['x-vercel-ip-country'] as string || null;
    const userAgent = req.headers['user-agent'] as string || null;

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

    // Store in Vercel KV
    // Key format: events:{date}:{id}
    const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const eventKey = `events:${dateKey}:${event.id}`;

    await kv.set(eventKey, event, { ex: 60 * 60 * 24 * 90 }); // Keep for 90 days

    // Also add to a sorted set for easy date queries
    await kv.zadd(`events:${dateKey}`, {
      score: Date.now(),
      member: event.id
    });

    // Track video plays separately for quick lookup
    if (event.type === 'video_play' && event.city) {
      await kv.lpush('video_plays', JSON.stringify({
        city: event.city,
        region: event.region,
        timestamp: event.timestamp,
        device: event.device,
        utm: event.utm
      }));
      // Trim to last 500 video plays
      await kv.ltrim('video_plays', 0, 499);
    }

    // Track high-value engagement events separately
    const highValueEvents = ['resume_download', 'coach_email_click', 'contact_form_submit'];
    if (highValueEvents.includes(event.type) && event.city) {
      await kv.lpush('high_value_events', JSON.stringify({
        type: event.type,
        city: event.city,
        region: event.region,
        timestamp: event.timestamp,
        device: event.device,
        utm: event.utm,
        metadata: {
          format: event.format,
          emailType: event.emailType,
          formType: event.formType
        }
      }));
      // Trim to last 200 high-value events
      await kv.ltrim('high_value_events', 0, 199);
    }

    // Track UTM sources separately for analytics
    if (event.utm?.utm_source) {
      const utmKey = `utm:${dateKey}:${event.utm.utm_source}`;
      await kv.incr(utmKey);
      // Set expiry on first increment
      await kv.expire(utmKey, 60 * 60 * 24 * 90); // 90 days
    }

    // Build log message
    const utmInfo = event.utm?.utm_source ? ` [utm_source=${event.utm.utm_source}]` : '';
    console.log(`[APU Tracker] ${event.type} from ${decodedCity || 'Unknown'}, ${region || ''} ${country || ''}${utmInfo}`);

    return res.status(200).json({ ok: true, id: event.id });

  } catch (error) {
    console.error('[APU Tracker] Error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
