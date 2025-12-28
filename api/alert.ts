/**
 * Ayn Parker Usry - Engagement Alert
 *
 * Sends email alert when someone spends 30+ seconds on the site.
 * This indicates genuine interest from a potential coach.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';
import { kv } from '@vercel/kv';

interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

interface EngagementData {
  timeOnSite: number; // seconds
  pagesViewed: string[];
  watchedVideo: boolean;
  videoProgress?: number;
  city: string | null;
  region: string | null;
  country: string | null;
  device: string;
  referrer: string | null;
  utm?: UtmParams;
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
    const body: EngagementData = req.body || {};

    // Only alert for 30+ seconds of engagement
    if (!body.timeOnSite || body.timeOnSite < 30) {
      return res.status(200).json({ ok: true, alerted: false, reason: 'insufficient_time' });
    }

    // Get geo data from Vercel headers
    const city = req.headers['x-vercel-ip-city'] as string || body.city || null;
    const region = req.headers['x-vercel-ip-country-region'] as string || body.region || null;
    const country = req.headers['x-vercel-ip-country'] as string || body.country || null;

    // Decode city (comes URL encoded)
    const decodedCity = city ? decodeURIComponent(city) : 'Unknown';
    const decodedRegion = region || '';

    // Check if we already alerted for this location today (prevent spam)
    const today = new Date().toISOString().split('T')[0];
    const alertKey = `alert:${today}:${decodedCity}:${decodedRegion}`;

    const alreadyAlerted = await kv.get(alertKey);
    if (alreadyAlerted) {
      console.log(`[APU Alert] Already alerted for ${decodedCity}, ${decodedRegion} today`);
      return res.status(200).json({ ok: true, alerted: false, reason: 'already_alerted_today' });
    }

    // Mark as alerted (expires at midnight)
    await kv.set(alertKey, true, { ex: 60 * 60 * 24 });

    // Build email
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('[APU Alert] No SendGrid API key configured');
      return res.status(200).json({ ok: true, alerted: false, reason: 'no_api_key' });
    }

    sgMail.setApiKey(apiKey);

    const locationStr = [decodedCity, decodedRegion, country].filter(Boolean).join(', ');
    const timeStr = body.timeOnSite >= 60
      ? `${Math.floor(body.timeOnSite / 60)}m ${body.timeOnSite % 60}s`
      : `${body.timeOnSite}s`;

    const videoStatus = body.watchedVideo
      ? `Yes! (${body.videoProgress || 0}% watched)`
      : 'No';

    const pagesStr = body.pagesViewed?.length
      ? body.pagesViewed.join(' → ')
      : 'Homepage only';

    // Build UTM attribution string
    const utmSource = body.utm?.utm_source;
    const utmCampaign = body.utm?.utm_campaign;
    const utmStr = utmSource
      ? `${utmSource}${utmCampaign ? ` (${utmCampaign})` : ''}`
      : null;

    const subject = `🥎 Coach Interest Alert: ${decodedCity}, ${decodedRegion || country || 'Unknown'}${utmSource ? ` via ${utmSource}` : ''}`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1e3a5f; margin-bottom: 20px;">Someone's Checking Out Ayn!</h2>

        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
            Visitor Details
          </h3>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 120px;">Location</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${locationStr || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Time on Site</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${timeStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Watched Video</td>
              <td style="padding: 8px 0; font-weight: 600; color: ${body.watchedVideo ? '#22c55e' : '#64748b'};">${videoStatus}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Device</td>
              <td style="padding: 8px 0; color: #0f172a;">${body.device || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Pages Viewed</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 13px;">${pagesStr}</td>
            </tr>
            ${body.referrer ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Came From</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 13px;">${body.referrer}</td>
            </tr>
            ` : ''}
            ${utmStr ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Campaign</td>
              <td style="padding: 8px 0; font-weight: 600; color: #8b5cf6;">${utmStr}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <p style="color: #64748b; font-size: 13px; margin: 0;">
          <a href="https://aynparkerusry.com/coach-visits" style="color: #0ea5e9;">View all visits →</a>
        </p>
      </div>
    `;

    const textBody = `
Someone's Checking Out Ayn!

Location: ${locationStr || 'Unknown'}
Time on Site: ${timeStr}
Watched Video: ${videoStatus}
Device: ${body.device || 'Unknown'}
Pages: ${pagesStr}
${body.referrer ? `Came From: ${body.referrer}` : ''}
${utmStr ? `Campaign: ${utmStr}` : ''}

View all visits: https://aynparkerusry.com/coach-visits
    `.trim();

    const msg = {
      to: process.env.ALERT_EMAIL || 'mike@point.dog',
      from: process.env.SENDGRID_FROM_EMAIL || 'alerts@point.dog',
      subject: subject,
      text: textBody,
      html: htmlBody,
    };

    await sgMail.send(msg);
    console.log(`[APU Alert] Email sent for ${decodedCity}, ${decodedRegion}`);

    return res.status(200).json({ ok: true, alerted: true });

  } catch (error) {
    console.error('[APU Alert] Error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
