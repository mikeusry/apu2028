# Coach Visits Dashboard

> Tracking system to identify potential college coach interest

---

## Purpose

The coach-visits dashboard at `/coach-visits` tracks visitor activity from college towns to help identify when coaches may be evaluating Ayn's recruiting profile.

**Key Insight:** When you see visits from Spartanburg (USC Upstate), Kennesaw (KSU), or Jacksonville (JSU), a coach may be looking.

---

## Access

- **URL:** https://aynparkerusry.com/coach-visits
- **Auth:** Access key required (production), auto-bypass in local dev
- **Data Source:** Vercel KV (via tracking pixel on main site)

---

## Dashboard Features

### Stats Cards
| Metric | What It Means |
|--------|---------------|
| **College Towns** | Unique visits from cities with target schools |
| **Page Views** | Total site visits today |
| **Video Plays** | Video embed interactions |
| **30s+ Engaged** | Visitors who stayed 30+ seconds |

### Activity Feed
Real-time table showing:
- Event type (View, Video, Watch, 30s+)
- Location (city, state, country flag)
- Source / Device
- Duration (for engagement events)
- Time (relative)

### Filters
- **All** - All events
- **Videos** - Video plays and progress events
- **30s+ Only** - High engagement visits
- **College Towns** - Visitors from target school cities

---

## College Town Detection

The dashboard highlights visits from cities containing target schools:

```javascript
const collegeTowns = [
  'Kennesaw', 'Spartanburg', 'Jacksonville',
  'Carrollton', 'Atlanta', 'Macon', 'Clinton',
  'Greenville', 'Charlotte', 'Chattanooga',
  'Boiling Springs', 'Charleston', 'Cullowhee'
  // ... and more
];
```

When a visit comes from a college town:
- Row highlighted in blue
- Blue dot indicator
- Counted in "College Towns" stat

---

## Tracking Events

The main site's `tracker.js` sends these events:

| Event | Trigger |
|-------|---------|
| `pageview` | Page load |
| `video_play` | Video starts |
| `video_progress` | Video watched (25%, 50%, 75%, 100%) |
| `engagement` | 30+ seconds on page |

Each event includes:
- Timestamp
- IP-based geolocation (city, region, country)
- Device type
- Referrer/source
- User agent

---

## API Endpoints

### GET /api/coach-visits
Returns aggregated visit data for the dashboard.

**Query params:**
- `key` - Access key (required in production)

**Response:**
```json
{
  "summary": {
    "todayPageviews": 42,
    "todayVideoPlays": 8,
    "totalEngagements": 15,
    "citiesVisited": ["Atlanta, GA", "Kennesaw, GA", ...]
  },
  "todayEvents": [
    {
      "type": "pageview",
      "city": "Kennesaw",
      "region": "GA",
      "country_code": "US",
      "source": "Twitter",
      "device": "Mobile",
      "timestamp": "2025-12-28T12:00:00Z"
    }
  ]
}
```

---

## Design Decisions

### Why a separate dashboard?
- Coaches shouldn't see tracking data on the main site
- Parents/family want visibility into who's looking
- Helps prioritize outreach based on interest signals

### Why college town detection?
- Direct signal of coach interest
- Helps identify which schools are evaluating
- Multiple visits from same town = stronger signal

### Why 30s+ engagement tracking?
- Separates accidental clicks from real interest
- Coaches who watch video are more interested
- Helps identify quality vs quantity of visits

---

## Local Development

In local dev mode (`import.meta.env.DEV`):
- Auth is bypassed
- Mock data displayed
- "Local" banner shown

To test with real data locally:
1. Set `PUBLIC_VISITS_KEY` in `.env.local`
2. Disable the `isLocal` check temporarily

---

## UI Components

The dashboard uses:
- **Tailwind CSS** (via CDN)
- **Dark theme** (gray-900 background)
- **Flowbite-style** advanced table
- **Sticky header** on table
- **Live toggle** with pulsing indicator

---

## Future Enhancements

- [ ] Email alerts for college town visits
- [ ] Weekly digest of activity
- [ ] School-specific filters
- [ ] Historical trends view
- [ ] Export to CSV

---

*Last updated: December 2025*
