# Marketing Recruiting Implementation Plan

> Transform Ayn's recruiting site into a full marketing funnel with CRM, email automation, and advanced tracking.

## Current State Summary

### Already Built ✅
- **Website**: Fast Astro site with video, stats, schedule, about, contact
- **Tracking**: Custom pixel with pageview, video play, scroll, time-on-site
- **Geo Detection**: City/region/country from Vercel headers
- **Email Alerts**: SendGrid triggers on 30s+ engagement
- **Dashboard**: `/coach-visits` with real-time activity feed
- **College Town Detection**: 30 hardcoded schools highlighted
- **Notion CRM**: Existing database with 20+ schools and 20+ coaches
- **UTM Tracking**: Full campaign attribution (Phase 1 complete)

### Missing Components 🔧

- ~~Coach CRM database~~ ✅ Using Notion
- Email outreach engine with templates
- ~~UTM parameter tracking~~ ✅ Implemented
- Lead capture forms
- Activity scoring
- Automated follow-up sequences
- **Website ↔ Notion Integration** (geo-matching, interaction logging)

---

## Phase 1: Quick Wins ✅ COMPLETED

### 1.1 UTM Parameter Tracking ✅
**Files**: `public/tracker.js` + `api/track.ts`

Implemented UTM parameter parsing:
- `utm_source` (email, twitter, instagram, tournament)
- `utm_medium` (social, email, referral)
- `utm_campaign` (coach_outreach_jan, pony_nationals_2025)
- `utm_content` (video_link, schedule_link)
- `utm_term` (optional keyword)

**Usage**: Add UTM params to any link:
```
https://aynparkerusry.com/?utm_source=email&utm_campaign=coach_outreach_jan
```

### 1.2 Enhanced Custom Events ✅
**File**: `public/tracker.js`

New automatic tracking:
- `resume_download` - Tracks PDF downloads (auto-detects resume links)
- `coach_email_click` - Tracks mailto link clicks (player/parent emails)
- `schedule_view` - Tracks when schedule section is viewed
- `section_view` - Tracks section visibility via IntersectionObserver
- `contact_form_submit` - Ready for future form implementation

**Manual API**:
```javascript
window.apuTrack.resumeDownload('pdf');
window.apuTrack.emailClick('player');
window.apuTrack.scheduleView('pony_nationals');
window.apuTrack.sectionView('stats');
window.apuTrack.formSubmit('inquiry');
window.apuTrack.getUtm(); // Returns current UTM params
```

### 1.3 Dashboard Enhancements ✅
**File**: `src/pages/coach-visits.astro`

- Added UTM source pills showing traffic sources with counts
- Added "High Value" filter for resume downloads, email clicks
- New event type badges: Resume, Email, Schedule, Form
- High-value events highlighted with purple border
- Source column shows UTM source + campaign when available

### 1.4 Email Alert Enhancements ✅
**File**: `api/alert.ts`

- Email alerts now include UTM source attribution
- Subject line shows source (e.g., "via email")
- Campaign info displayed in email body

### 1.5 High-Value Event Tracking ✅
**File**: `api/track.ts`

- Separate `high_value_events` list in Redis for quick lookup
- Tracks: resume_download, coach_email_click, contact_form_submit
- UTM attribution stored with each event

### 1.6 Downloadable PDF Resume 🔜 TODO
**File**: `public/ayn-parker-usry-recruiting-resume.pdf`

One-page PDF with:
- Photo + name + grad year + position
- Key measurables (height, weight, 60yd, arm velocity)
- Stats snapshot
- Academic info (GPA, test scores)
- Contact info
- QR code to website

---

## Phase 2: Notion CRM Integration

### 2.1 Architecture Decision: Notion as CRM ✅

**Why Notion (not Supabase)?**

| Consideration | Notion | Supabase |
| ------------- | ------ | -------- |
| **Data already exists** | ✅ 20+ schools, 20+ coaches | Would need migration |
| **Parent-friendly editing** | ✅ Familiar UI | Requires technical knowledge |
| **Relational data** | ✅ Schools ↔ Contacts linked | ✅ Full SQL relations |
| **Real-time webhooks** | ❌ No native support | ✅ Built-in |
| **Geo queries** | ❌ Limited | ✅ PostGIS |
| **Rate limits** | 3 req/sec | Much higher |
| **Query complexity** | Basic filters | Full SQL |

**Decision**: Use **Hybrid Architecture**

- **Notion** = Source of truth for CRM (schools, contacts, action items)
- **Vercel KV** = High-frequency tracking events (already built)
- **Integration Layer** = Sync and match data between systems

### 2.2 Existing Notion Structure

**Recruiting Home Page**: `61af5757-ce21-4bb0-b38c-a6a14b5ace4c`

| Database | ID | Key Fields |
| -------- | --- | ---------- |
| **Softball Schools** | `1684d5cd-ab4b-80ac-8b7b-f54d31eb6653` | Name, Tier, Conference, Location, Miles, Twitter, Program Rating, Rationale |
| **College Contacts** | `1684d5cd-ab4b-8066-ab48-ff0e97b1e0ca` | Name, Role, School (relation), Email, Phone, Priority, Response Status |
| **Recruiting Action Items** | `1684d5cd-ab4b-80a7-91fa-e19a20f7ba4e` | Task tracking with status |
| **Softball Events** | `1684d5cd-ab4b-8027-8ac5-c3f2d49b09d4` | Tournament/camp calendar |

### 2.3 Integration Tasks

#### 2.3.1 School Geo-Lookup Cache

**Purpose**: Match visitor locations to nearby schools

**Implementation**:

1. Sync Notion schools to Vercel KV with geocoded coordinates
2. On high-value visit, find schools within 50 miles of visitor
3. Highlight potential coach visits in dashboard

```typescript
// Cached school lookup
interface SchoolGeoCache {
  notionId: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  tier: 'Reach' | 'Realistic' | 'Safety';
}
```

#### 2.3.2 Visitor → School Matching

**API Endpoint**: `/api/match-school`

- Input: visitor city/region
- Output: matching schools from Notion
- Used by: Dashboard, email alerts

#### 2.3.3 Interaction Logging to Notion

**When to log**:

- High-value event (resume download, email click)
- Video play from school's city
- 60+ second engagement from target region

**How**:

- Create page in "Recruiting Action Items" database
- Link to school via relation
- Include event details (timestamp, pages viewed, UTM source)

### 2.4 Notion API Integration

**File**: `lib/notion.ts`

```typescript
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Database IDs
export const NOTION_DBS = {
  schools: '1684d5cd-ab4b-80ac-8b7b-f54d31eb6653',
  contacts: '1684d5cd-ab4b-8066-ab48-ff0e97b1e0ca',
  actionItems: '1684d5cd-ab4b-80a7-91fa-e19a20f7ba4e',
  events: '1684d5cd-ab4b-8027-8ac5-c3f2d49b09d4'
};

// Fetch all schools for geo-lookup
export async function getSchools() { ... }

// Find school by city/state
export async function findSchoolByLocation(city: string, state: string) { ... }

// Log interaction to Action Items
export async function logInteraction(schoolId: string, type: string, details: object) { ... }
```

### 2.5 Environment Variables

```bash
# Add to .env.local
NOTION_API_KEY=secret_xxx
NOTION_RECRUITING_PAGE_ID=61af5757-ce21-4bb0-b38c-a6a14b5ace4c
```

---

## Phase 3: Email Engine (Week 3-4)

### 3.1 Email Template System
**Templates Needed**:

1. **Initial Outreach**
   - Subject: `2028 OF | Ayn Parker Usry | .380 AVG, Plus Arm, 3.74 GPA`
   - Body: Brief intro, why their program, one standout, video link, CTA

2. **Event Announcement**
   - Subject: `See me at [Tournament] - Schedule Inside`
   - Body: Event details, field/times, link to schedule page

3. **Follow-Up (No Reply)**
   - Subject: `Quick video check-in - Ayn Parker Usry (2028 OF)`
   - Body: Different angle, updated content if available

4. **Post-Event**
   - Subject: `Thanks for watching at [Tournament]`
   - Body: Recap, specific game reference, next steps

### 3.2 Tracked Link Generation
**Per-Email Unique Links**:
```typescript
// Generate tracked link
function generateTrackedLink(coachId: string, emailId: string, targetUrl: string) {
  const trackingId = generateId();
  // Store: trackingId → { coachId, emailId, targetUrl }
  return `https://aynparkerusry.com/t/${trackingId}`;
}
```

**Redirect Handler**: `/t/[id]` → log click → redirect to target

### 3.3 Email Sending Infrastructure
**Options**:
- SendGrid (already integrated)
- Add open tracking pixel
- Webhook for delivery/open/click events

---

## Phase 4: Lead Capture & Forms (Week 4)

### 4.1 Coach Inquiry Form
**Location**: New section on homepage or modal

**Fields**:
- School (dropdown or autocomplete)
- Your Role (Head Coach, Assistant, Recruiting Coordinator)
- Email
- What grad years are you recruiting? (multi-select)
- Optional message

**On Submit**:
1. Create `coach_lead_created` event
2. Store in CRM as new coach with source="website_form"
3. Send email alert
4. Auto-respond with highlight video + one-pager

### 4.2 "Get Updates" Newsletter
**Simple Form**:
- Email only
- Tags visitor for future batch emails
- Confirms interest level

---

## Phase 5: Automation & Scoring (Week 5+)

### 5.1 Activity-Based Scoring
**Points System**:
```typescript
const SCORING = {
  site_visit: 1,
  video_play: 5,
  video_complete: 10, // 100% progress
  resume_download: 15,
  form_submit: 25,
  email_open: 3,
  email_click: 10,
  repeat_visit: 5, // same city within 7 days
  long_session: 10, // 60+ seconds
};

// Threshold for "Hot" status: 50+ points
```

### 5.2 Triggered Automations
**Rules Engine**:

1. **High Engagement Alert**
   - When: Score > 50 in 7 days
   - Action: Email Mike, mark as Hot, suggest direct outreach

2. **Pre-Event Outreach**
   - When: Event in 7 days
   - Action: Generate targeted emails to coaches at attending schools

3. **Post-Event Follow-Up**
   - When: Event completed
   - Action: Generate follow-up templates for engaged visitors

4. **Stale Lead Re-Engagement**
   - When: Hot/Warm coach no activity in 30 days
   - Action: Generate re-engagement email with new content

---

## Phase 6: Dashboard Enhancements

### 6.1 Enhanced `/coach-visits`
- **Filtering**: By score, by school tier, by date range
- **Coach Lookup**: Match visitor location to CRM coaches
- **Export**: CSV of high-engagement visits

### 6.2 New `/admin/pipeline` Dashboard
- Kanban view: Prospect → Engaged → Serious → Offer → Committed
- Drag-drop status changes
- Quick actions: Send email, Add note, Mark hot

### 6.3 Weekly Report Email
- Top engaged schools
- New video plays
- Email performance (sent/opened/clicked)
- Suggested follow-ups

---

## Data Model Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         NOTION (CRM)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐      ┌─────────────────┐                   │
│  │ Softball Schools│──1:N─│ College Contacts│                   │
│  ├─────────────────┤      ├─────────────────┤                   │
│  │ Name            │      │ Name            │                   │
│  │ Tier            │      │ Role            │                   │
│  │ Conference      │      │ Email/Phone     │                   │
│  │ Location/Miles  │      │ Priority        │                   │
│  │ Twitter         │      │ Response Status │                   │
│  │ Program Rating  │      │ Notes           │                   │
│  │ Rationale       │      │ Last Contact    │                   │
│  └─────────────────┘      └─────────────────┘                   │
│           │                                                     │
│           └──────────────┐                                      │
│                          ▼                                      │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ Softball Events │    │  Action Items   │                     │
│  ├─────────────────┤    ├─────────────────┤                     │
│  │ Tournament/Camp │    │ Task + Status   │                     │
│  │ Dates           │    │ School (link)   │                     │
│  └─────────────────┘    │ Site Visit Logs │                     │
│                         └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Integration Layer
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL KV (Tracking)                       │
├─────────────────────────────────────────────────────────────────┤
│  events:{date}:{id}     - All tracking events                   │
│  video_plays            - Video play list                       │
│  high_value_events      - Resume downloads, email clicks        │
│  utm:{date}:{source}    - UTM source counters                   │
│  school_geo_cache       - Notion schools with coordinates       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Decisions

### Database Architecture ✅ DECIDED

**Hybrid Approach**:

| System | Purpose | Data |
| ------ | ------- | ---- |
| **Notion** | CRM Source of Truth | Schools, Contacts, Action Items, Events |
| **Vercel KV** | High-Frequency Tracking | Pageviews, video plays, UTM events |
| **Integration Layer** | Sync & Match | Geo-lookup cache, interaction logging |

**Why not full Supabase migration?**

- Notion already has 20+ schools and coaches populated
- Parents can edit Notion without technical knowledge
- Vercel KV already handles tracking well
- Supabase would be overkill for current scale

### Email Tracking

**Options**:

1. **SendGrid Events Webhook** - Receive open/click callbacks
2. **Custom Pixel** - Embed tracking pixel in emails
3. **Custom Click Tracking** - `/t/[id]` redirect links

**Recommendation**: Use all three for complete visibility

---

## Implementation Priority

| Priority | Feature | Impact | Effort | Status |
| -------- | ------- | ------ | ------ | ------ |
| 🔥 P0 | UTM tracking | High | Low | ✅ Done |
| 🔥 P0 | PDF resume download | High | Low | 🔜 TODO |
| 🔥 P0 | Enhanced events | Medium | Low | ✅ Done |
| 🟡 P1 | Notion CRM integration | High | Medium | 🔜 Next |
| 🟡 P1 | Email templates | High | Medium | |
| 🟡 P1 | Tracked links | High | Medium | |
| 🟢 P2 | Lead capture form | Medium | Low | |
| 🟢 P2 | Activity scoring | Medium | Medium | |
| 🔵 P3 | Automation rules | High | High | |
| 🔵 P3 | Pipeline dashboard | Medium | High | |

---

## Quick Start Commands

```bash
# Phase 1 - Quick wins ✅ COMPLETED
# UTM tracking, enhanced events implemented

# Phase 2 - Notion Integration
# Already using Notion MCP Server - no new dependencies needed
# Notion API key already configured

# Environment variables needed:
# NOTION_API_KEY=secret_xxx (for direct API calls if needed)
# NOTION_RECRUITING_PAGE_ID=61af5757-ce21-4bb0-b38c-a6a14b5ace4c
```

---

## Success Metrics

1. **Awareness**: Unique visitors per week (target: 50+)
2. **Engagement**: Video plays (target: 20+ per week)
3. **Lead Gen**: Coach form submissions (target: 5+ per month)
4. **Pipeline**: Schools in active conversation (target: 10+)
5. **Conversion**: Camp invites / campus visits (target: 3+ per season)

---

## Next Steps

1. ✅ Review this plan
2. ✅ Phase 1 (UTM + Events) - COMPLETED
3. ✅ Decide CRM: **Notion** (already populated with data)
4. 🔜 Phase 2: Build Notion integration layer (geo-matching, interaction logging)
5. 🔜 Create PDF recruiting resume
6. 🔜 Phase 3: Email templates with tracked links
7. 🔜 Phase 4: Lead capture form on website

---

*Last updated: December 2024*
*CRM: Notion (via MCP Server)*
*For questions: mike@point.dog*
