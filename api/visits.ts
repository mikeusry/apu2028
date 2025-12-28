/**
 * Ayn Parker Usry - Visit Dashboard API
 *
 * Returns recent visits and video plays for viewing.
 * Protected by a simple key (not full auth since it's just viewing visits).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple key protection - check query param or header
  const key = req.query.key || req.headers['x-api-key'];
  const expectedKey = process.env.TRACKER_VIEW_KEY || 'ayn2028';

  if (key !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get recent video plays (most interesting data)
    const videoPlays = await kv.lrange('video_plays', 0, 49);
    const parsedVideoPlays = videoPlays.map((v: string | object) => {
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      }
      return v;
    });

    // Get high-value events (resume downloads, email clicks, form submissions)
    const highValueEvents = await kv.lrange('high_value_events', 0, 49);
    const parsedHighValueEvents = highValueEvents.map((v: string | object) => {
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      }
      return v;
    });

    // Get today's events
    const today = new Date().toISOString().split('T')[0];
    const todayEventIds = await kv.zrange(`events:${today}`, 0, -1);

    // Get yesterday's events too
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdayEventIds = await kv.zrange(`events:${yesterday}`, 0, -1);

    // Fetch full event data for today
    const todayEvents = [];
    for (const id of todayEventIds.slice(-50)) { // Last 50
      const event = await kv.get(`events:${today}:${id}`);
      if (event) todayEvents.push(event);
    }

    // Fetch full event data for yesterday
    const yesterdayEvents = [];
    for (const id of yesterdayEventIds.slice(-50)) {
      const event = await kv.get(`events:${yesterday}:${id}`);
      if (event) yesterdayEvents.push(event);
    }

    // Summary stats
    const allEvents = [...todayEvents, ...yesterdayEvents];
    const uniqueCities = [...new Set(allEvents.map((e: any) => e.city).filter(Boolean))];
    const videoPlayCount = allEvents.filter((e: any) => e.type === 'video_play').length;

    // Count events by UTM source
    const utmSources: Record<string, number> = {};
    allEvents.forEach((e: any) => {
      if (e.utm?.utm_source) {
        utmSources[e.utm.utm_source] = (utmSources[e.utm.utm_source] || 0) + 1;
      }
    });

    // Count high-value event types
    const highValueCounts: Record<string, number> = {};
    parsedHighValueEvents.forEach((e: any) => {
      if (e.type) {
        highValueCounts[e.type] = (highValueCounts[e.type] || 0) + 1;
      }
    });

    return res.status(200).json({
      summary: {
        todayPageviews: todayEvents.filter((e: any) => e.type === 'pageview').length,
        todayVideoPlays: todayEvents.filter((e: any) => e.type === 'video_play').length,
        yesterdayPageviews: yesterdayEvents.filter((e: any) => e.type === 'pageview').length,
        yesterdayVideoPlays: yesterdayEvents.filter((e: any) => e.type === 'video_play').length,
        uniqueCities: uniqueCities.length,
        citiesVisited: uniqueCities.slice(0, 20), // Top 20 cities
        utmSources: utmSources, // Breakdown by UTM source
        highValueCounts: highValueCounts // Counts of resume downloads, email clicks, etc.
      },
      recentVideoPlays: parsedVideoPlays.slice(0, 20),
      highValueEvents: parsedHighValueEvents.slice(0, 20), // Resume downloads, email clicks, etc.
      todayEvents: todayEvents.slice(-30).reverse(), // Most recent first
      yesterdayEvents: yesterdayEvents.slice(-30).reverse()
    });

  } catch (error) {
    console.error('[APU Visits] Error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
