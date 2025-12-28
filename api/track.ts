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

interface TrackingEvent {
  id: string;
  type: 'pageview' | 'video_play' | 'video_progress';
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
      device: detectDevice(userAgent)
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
        device: event.device
      }));
      // Trim to last 500 video plays
      await kv.ltrim('video_plays', 0, 499);
    }

    console.log(`[APU Tracker] ${event.type} from ${decodedCity || 'Unknown'}, ${region || ''} ${country || ''}`);

    return res.status(200).json({ ok: true, id: event.id });

  } catch (error) {
    console.error('[APU Tracker] Error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
