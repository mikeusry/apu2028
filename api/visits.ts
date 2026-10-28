/**
 * Ayn Parker Usry - Visit Dashboard API
 *
 * Returns recent visits and video plays for viewing.
 * Protected by a simple key (not full auth since it's just viewing visits).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple key protection - check query param or header
  const key = req.query.key || req.headers['x-api-key'];
  const expectedKey = process.env.TRACKER_VIEW_KEY || 'ayn2028';

  if (key !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Events live in Supabase (public.site_events). Map rows back to the old event shape.
    const toEvent = (r: any) => ({
      id: r.id, type: r.type, timestamp: r.created_at, city: r.city, region: r.region, country: r.country,
      page: r.page, referrer: r.referrer, videoId: r.video_id || undefined, device: r.device, utm: r.utm || undefined,
      ...(r.meta || {}),
    });
    const sel = 'select=id,created_at,type,page,referrer,city,region,country,device,video_id,utm,meta';
    const notInternal = 'type=not.in.(contact_attempt,visit_alert)';
    const videoPlays = ((await db(`site_events?${sel}&type=eq.video_play&city=not.is.null&order=created_at.desc&limit=50`)) as any[]).map(toEvent);
    const parsedVideoPlays = videoPlays;
    const parsedHighValueEvents = ((await db(`site_events?${sel}&type=in.(resume_download,coach_email_click,contact_form_submit)&order=created_at.desc&limit=50`)) as any[])
      .map(toEvent).map((e: any) => ({ ...e, metadata: { format: e.format, emailType: e.emailType, formType: e.formType } }));

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    // Oldest-first within each day, last 50, to match the previous behavior
    const dayEvents = async (d: string, next: string) =>
      ((await db(`site_events?${sel}&${notInternal}&created_at=gte.${d}T00:00:00Z&created_at=lt.${next}T00:00:00Z&order=created_at.desc&limit=50`)) as any[])
        .map(toEvent).reverse();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const todayEvents = await dayEvents(today, tomorrow);
    const yesterdayEvents = await dayEvents(yesterday, today);

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
