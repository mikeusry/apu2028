# Softball Program Discovery - SaaS Product Deep Dive

> Strategic analysis for a softball recruiting discovery platform
> Created: December 29, 2025

---

## 1. THE PROBLEM (Why This Matters)

### The Current Reality

**For a 14-year-old softball player:**
- Knows 20 schools (the ones on ESPN)
- Needs to find 1 school (her future home)
- Has access to 300+ D1/D2/D3 programs
- **Gap: 280 programs she's never heard of**

**For parents:**
- Investing $10-30K/year in travel ball
- Making career-defining decisions with incomplete information
- Relying on travel coaches who know their region, not the whole landscape
- Googling individual schools one at a time

**For travel coaches:**
- Asked "what schools should I look at?" constantly
- Know maybe 50 programs well
- Can't keep up with coaching changes, program trajectories
- No systematic way to match players to programs

### What Exists Today

| Service | What They Do | What's Missing |
|---------|--------------|----------------|
| **SportsRecruits** | Profile hosting, messaging coaches | No program discovery or education |
| **NCSA** | Matchmaking, exposure events | Sales-driven, pushes quantity over fit |
| **CaptainU** | Video hosting, coach database | No program intelligence |
| **Softball America** | Rankings, news | No personalized guidance |
| **Perfect Game** | Rankings, events | Player-focused, not school-focused |

**The Gap:** Nobody helps families LEARN about programs. Everyone assumes you already know where you want to go.

---

## 2. THE OPPORTUNITY

### Market Size

**D1 Softball:**
- 312 programs
- ~25 players per roster = 7,800 roster spots
- ~4 recruiting classes active = ~2,000 spots per class
- Average recruiting cycle = 2-3 years

**Travel Softball (Primary Customer Base):**
- ~500,000 girls playing travel softball (ages 10-18)
- ~50,000 serious D1 prospects (top 10%)
- ~15,000 families actively recruiting each year (classes 2026-2029)

**Spend Profile:**
- Travel ball: $8-15K/year
- Camps/showcases: $2-5K/year
- Recruiting services: $500-2K/year (NCSA, etc.)
- Private lessons: $3-5K/year
- **Total investment: $15-30K/year for 4+ years**

**Families spending $100K+ on softball will pay for good information.**

### TAM/SAM/SOM

| Segment | Size | Annual Value | Total |
|---------|------|--------------|-------|
| **TAM** (all travel softball families) | 500,000 | $200/yr | $100M |
| **SAM** (serious D1/D2 prospects) | 50,000 | $300/yr | $15M |
| **SOM** (Year 1-2 realistic) | 2,000 | $250/yr | $500K |

---

## 3. THE PRODUCT VISION

### Core Value Proposition

> **"Know every program like a local knows their state school."**

Turn 280 unknown programs into informed options with:
- Deep program profiles (not just facts - insights)
- Smart matching (find programs that fit YOU)
- Discovery tools (explore by what matters to you)
- Living data (coaching changes, trajectory, recruiting class status)

### The Three User Types

**1. The Family (Primary Buyer)**
- Parent + player making decisions together
- Needs: Education, confidence, organized information
- Willing to pay: $20-40/month or $200-400/year

**2. The Travel Coach (Force Multiplier)**
- Advising 15-50 families
- Needs: Quick answers, credibility, time savings
- Willing to pay: $50-100/month or team license

**3. The Travel Organization (Enterprise)**
- 5-20 teams, 100-300 families
- Needs: Differentiation, parent satisfaction, coach tools
- Willing to pay: $2-10K/year

---

## 4. FEATURE SET

### Core Features (MVP)

**1. Program Profiles (The Foundation)**
```
Each of 300+ D1 programs gets:
├── Overview
│   ├── Location, conference, facilities
│   ├── Program trajectory (rising/stable/declining)
│   └── Coaching staff + tenure
├── Culture & Fit
│   ├── Coaching philosophy
│   ├── Player development style
│   ├── Academic emphasis
│   └── Team culture indicators
├── Recruiting Intel
│   ├── What they look for (positions, measurables)
│   ├── Current class composition
│   ├── Historical recruiting patterns
│   └── Geographic preferences
├── Results & Rankings
│   ├── Recent seasons
│   ├── NCAA tournament history
│   └── Conference performance
└── Insider Notes
    ├── Curated insights (the stuff you can't Google)
    ├── Strengths/weaknesses
    └── "Good fit if..." / "Not ideal if..."
```

**2. Smart Search (The Differentiator)**
```
Natural language queries powered by pgvector:
- "Programs within 400 miles that develop contact hitters"
- "Schools similar to Liberty but smaller class size"
- "Rising programs in warm weather states"
- "D1 programs where academics matter as much as softball"
- "Schools that take chances on undersized players with speed"
```

**3. Player-Program Matching**
```
Input: Player profile (measurables, stats, academics, preferences)
Output: Tiered recommendations
├── Reach (stretch programs - worth a shot)
├── Realistic (strong mutual fit)
├── Safety (likely to get interest)
└── Hidden Gems (programs you've never heard of that fit perfectly)
```

**4. Comparison Tools**
```
Side-by-side program comparison:
- Facilities, coaching, culture, results
- Distance from home
- Academic rankings
- Cost of attendance
- Recruiting class status
```

**5. Discovery Modes**
```
Browse by:
├── Geography (map view, radius search)
├── Conference (SEC, ACC, Big 12, mid-majors)
├── Program Type (powerhouse, rising, developmental)
├── Culture (high-intensity, balanced, academic-first)
├── Position needs (who needs OFs in 2028?)
└── "Schools like X" (similarity search)
```

### Advanced Features (Post-MVP)

**6. Recruiting Tracker**
- Track your target schools
- See when rosters/commits change
- Get alerts on coaching changes

**7. Camp/Event Calendar**
- Which schools have camps when
- Which camps are worth attending
- Registration tracking

**8. Outreach Tools**
- Email templates
- Contact tracking
- Response management

**9. Coach Portal**
- Team roster management
- Bulk player-program matching
- Parent communication tools

**10. Community/Reviews**
- Verified family reviews of camps
- "We visited and here's what we learned"
- Coach interaction ratings

---

## 5. TECHNICAL ARCHITECTURE

### Data Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (PostgreSQL + pgvector)            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────┐      ┌─────────────────────┐              │
│  │      programs       │      │       coaches       │              │
│  ├─────────────────────┤      ├─────────────────────┤              │
│  │ id                  │──1:N─│ id                  │              │
│  │ name                │      │ program_id          │              │
│  │ location (PostGIS)  │      │ name, role          │              │
│  │ conference          │      │ email               │              │
│  │ division            │      │ tenure_start        │              │
│  │ facilities_score    │      │ background          │              │
│  │ culture_profile     │      │ philosophy_embedding│              │
│  │ recruiting_style    │      └─────────────────────┘              │
│  │ program_trajectory  │                                           │
│  │ profile_embedding   │◄── pgvector (1536 dims)                   │
│  │ rationale_embedding │◄── pgvector                               │
│  │ insider_notes       │                                           │
│  │ last_updated        │                                           │
│  └─────────────────────┘                                           │
│           │                                                        │
│           │                                                        │
│  ┌────────┴────────┐     ┌─────────────────────┐                  │
│  │                 │     │                     │                  │
│  ▼                 ▼     ▼                     │                  │
│  ┌─────────────────────┐ ┌─────────────────────┐                  │
│  │   recruiting_class  │ │       events        │                  │
│  ├─────────────────────┤ ├─────────────────────┤                  │
│  │ program_id          │ │ program_id          │                  │
│  │ year (2026-2030)    │ │ event_type          │                  │
│  │ commits_count       │ │ date                │                  │
│  │ positions_needed    │ │ registration_url    │                  │
│  │ scholarship_avail   │ │ cost                │                  │
│  └─────────────────────┘ │ grades_allowed      │                  │
│                          └─────────────────────┘                  │
│                                                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐                 │
│  │       users         │  │    player_profiles  │                 │
│  ├─────────────────────┤  ├─────────────────────┤                 │
│  │ id                  │──│ user_id             │                 │
│  │ email               │  │ grad_year           │                 │
│  │ role (family/coach) │  │ position            │                 │
│  │ subscription_tier   │  │ measurables (JSON)  │                 │
│  │ organization_id     │  │ stats (JSON)        │                 │
│  └─────────────────────┘  │ preferences (JSON)  │                 │
│                           │ profile_embedding   │◄── pgvector     │
│                           └─────────────────────┘                 │
│                                                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐                 │
│  │   saved_programs    │  │    interactions     │                 │
│  ├─────────────────────┤  ├─────────────────────┤                 │
│  │ user_id             │  │ user_id             │                 │
│  │ program_id          │  │ program_id          │                 │
│  │ tier (reach/real)   │  │ type (view/save)    │                 │
│  │ notes               │  │ timestamp           │                 │
│  │ status              │  └─────────────────────┘                 │
│  └─────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Vector Search Implementation

```typescript
// Semantic search for programs
async function searchPrograms(query: string, filters?: ProgramFilters) {
  // Generate embedding for search query
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query
  });

  // Vector similarity search with filters
  const results = await supabase.rpc('match_programs', {
    query_embedding: embedding.data[0].embedding,
    match_threshold: 0.7,
    match_count: 20,
    filter_division: filters?.division,
    filter_distance: filters?.maxDistance,
    user_location: filters?.userLocation
  });

  return results;
}

// PostgreSQL function for hybrid search
CREATE FUNCTION match_programs(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_division text DEFAULT NULL,
  filter_distance int DEFAULT NULL,
  user_location geography DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  similarity float,
  distance_miles float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    1 - (p.profile_embedding <=> query_embedding) as similarity,
    ST_Distance(p.location, user_location) / 1609.34 as distance_miles
  FROM programs p
  WHERE 1 - (p.profile_embedding <=> query_embedding) > match_threshold
    AND (filter_division IS NULL OR p.division = filter_division)
    AND (filter_distance IS NULL OR ST_DWithin(p.location, user_location, filter_distance * 1609.34))
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

### Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Database** | Supabase (Postgres + pgvector) | Vector search, PostGIS, auth, realtime |
| **Backend** | Supabase Edge Functions or Cloudflare Workers | Serverless, low cost |
| **Frontend** | Next.js or Astro | SEO for program pages, fast |
| **Search** | pgvector + OpenAI embeddings | Semantic search |
| **Maps** | Mapbox or Google Maps | Geographic discovery |
| **Auth** | Supabase Auth | Built-in, simple |
| **Payments** | Stripe | Subscriptions |
| **Email** | SendGrid | Transactional + marketing |

---

## 6. DATA STRATEGY (The Moat)

### Where Does the Data Come From?

**Tier 1: Public Data (Automated)**
- School websites (rosters, schedules, staff)
- Conference sites (standings, stats)
- NCAA database (academic rates, compliance)
- Social media (Twitter handles, activity)

**Tier 2: Curated Intelligence (Human)**
- Program profiles and rationales
- Coaching philosophy assessments
- Culture observations
- "Insider notes" from camp visits, conversations
- This is the stuff already being built for Ayn

**Tier 3: Community Contributed**
- Family reviews of camps
- Visit reports
- Coach interaction notes
- "We committed here and here's why"

**Tier 4: Partner Data**
- Travel team relationships
- Showcase event data
- Coach referral networks

### The Moat

**Data moats:**
1. **Curated insights** - Can't be scraped, requires expertise
2. **Embeddings** - Program profiles vectorized for semantic search
3. **Community knowledge** - Reviews, reports, verified experiences
4. **Freshness** - Coaching changes, roster updates, trajectory tracking

**Network effects:**
1. More families → more reviews → better data
2. More coaches → more referrals → more families
3. More data → better matching → higher value

---

## 7. BUSINESS MODEL

### Pricing Tiers

**Free Tier (Lead Gen)**
- Browse 50 program profiles
- Basic search (filters only, no semantic)
- Limited comparisons (2 schools)
- Camp calendar (view only)

**Family Plan - $29/month or $249/year**
- Full access to all 300+ profiles
- Semantic search ("programs like X")
- Player-program matching
- Unlimited comparisons
- Saved lists and tracking
- Email alerts on changes
- Camp calendar + tracking

**Coach Plan - $79/month or $699/year**
- Everything in Family
- Team roster management (up to 20 players)
- Bulk matching for players
- Parent sharing/reporting
- Priority data requests
- Direct line for questions

**Organization Plan - Custom ($2-10K/year)**
- Everything in Coach
- Unlimited teams/players
- Custom branding
- API access
- Dedicated support
- Data partnership opportunities

### Revenue Projections

| Year | Families | Coaches | Orgs | ARR |
|------|----------|---------|------|-----|
| Y1 | 500 @ $200 | 50 @ $600 | 5 @ $3K | $145K |
| Y2 | 2,000 @ $220 | 200 @ $650 | 20 @ $4K | $650K |
| Y3 | 5,000 @ $240 | 500 @ $700 | 50 @ $5K | $1.8M |

### Additional Revenue Streams

1. **Camp/Event Listings** - Programs pay for featured placement
2. **Lead Gen** - Warm introductions to interested families (with consent)
3. **Data Licensing** - Aggregate insights to programs/conferences
4. **Consulting** - "Help us improve our recruiting presence"

---

## 8. GO-TO-MARKET

### Phase 1: Prove Value (Months 1-3)

**Target: 50 beta families from Stars National + network**

- Build MVP with 50 fully-profiled programs (Southeast focus)
- Free access for beta users
- Gather feedback, refine matching
- Document wins ("we found our school through this")

### Phase 2: Travel Team Distribution (Months 4-6)

**Target: 5 travel organizations, 500 families**

Strategy:
- Partner with travel orgs as a "value add" they offer families
- Coaches get free access, families get discounted rate
- Travel org gets revenue share or flat fee

**Why this works:**
- Travel coaches are ASKED about schools constantly
- This makes them look smart without doing the work
- Parents already trust the org with $15K/year

### Phase 3: Direct + Content (Months 6-12)

**Target: 2,000 families**

Strategy:
- SEO: "Best softball programs in [state]", "[School] softball recruiting"
- Content: Program spotlights, "hidden gem" articles, recruiting guides
- Social: Instagram/TikTok content about program discovery
- Podcast: Interview coaches, "how we found our school" stories

### Phase 4: National Expansion (Year 2)

- Expand from 50 to 300+ programs
- Regional travel org partnerships
- Showcase/tournament partnerships
- Potential NCSA/SportsRecruits competitor positioning

---

## 9. COMPETITIVE POSITIONING

### vs. SportsRecruits / NCSA / CaptainU

| Feature | Them | Us |
|---------|------|-----|
| Profile hosting | Core feature | Not our focus |
| Coach messaging | Core feature | Maybe later |
| **Program discovery** | Nonexistent | **Core feature** |
| **Program intelligence** | Basic facts | **Deep insights** |
| **Semantic search** | No | **Yes** |
| **Matching algorithm** | Basic | **AI-powered** |
| Recruiting "services" | Upsell-heavy | Self-serve |

**Positioning:** "They help you GET recruited. We help you find WHERE you belong."

**Not competing on:**
- Video hosting (they own this)
- Coach messaging infrastructure (they own this)
- Exposure events (not our model)

**Competing on:**
- Quality of school information
- Discovery and matching
- Education over sales pressure

### Potential Partners (Not Competitors)

- **SportsRecruits/NCSA** - We're complementary, could integrate
- **Perfect Game / PGF** - Event data partnership
- **Travel organizations** - Distribution
- **Softball media** - Content partnerships

---

## 10. MVP SCOPE

### MVP: 8-Week Build

**Week 1-2: Data Foundation**
- Supabase setup with schema
- Seed 50 programs (SEC, ACC, top mid-majors in Southeast)
- Import Ayn's Notion data as starting point
- Basic embedding generation

**Week 3-4: Core Features**
- Program profile pages
- Basic search with filters
- Geographic map view
- Comparison tool (2-3 schools)

**Week 5-6: Smart Features**
- Semantic search with pgvector
- Player profile input
- Basic matching algorithm
- Saved programs list

**Week 7-8: Polish + Launch**
- Auth + subscription (Stripe)
- Mobile responsive
- Beta user onboarding
- Feedback mechanisms

### MVP Feature Cut

| Feature | MVP | Post-MVP |
|---------|-----|----------|
| 50 program profiles | Yes | Expand to 300 |
| Semantic search | Yes | Improve with feedback |
| Geographic search | Yes | |
| Player matching | Basic | Advanced ML |
| Comparison tool | Yes | |
| Camp calendar | No | Yes |
| Outreach tools | No | Yes |
| Coach portal | No | Yes |
| Community reviews | No | Yes |
| API | No | Yes |

### MVP Cost Estimate

| Item | Cost |
|------|------|
| Supabase Pro | $25/month |
| OpenAI (embeddings) | $50/month |
| Vercel Pro | $20/month |
| Domain | $20/year |
| Stripe fees | 2.9% + $0.30 |
| **Total monthly** | ~$100 |

Development: Your time (or contractor at $5-15K for MVP)

---

## 11. RISKS & MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data quality/freshness | High | High | Automated scraping + community updates |
| Low adoption | Medium | High | Travel coach distribution, not direct-to-family |
| Incumbents copy features | Medium | Medium | Speed to market, community moat |
| Coaching changes invalidate data | High | Medium | Automated monitoring, quick updates |
| Families don't pay | Medium | High | Prove value in beta, coach channel |
| Legal/compliance issues | Low | High | Terms of service, don't scrape private data |

---

## 12. WHAT MAKES THIS WORK

### Must-Haves for Success

1. **50 deeply-profiled programs** - Not Wikipedia summaries. Real insight.
2. **Semantic search that works** - "Show me programs like X" must deliver.
3. **Travel coach buy-in** - They're the distribution channel.
4. **3-5 "we found our school" stories** - Social proof is everything.
5. **Freshness mechanism** - Data must stay current.

### Why This Team Specifically

1. **Living it** - Ayn's recruiting = real-time product research
2. **Data already started** - Notion has 100 schools researched
3. **Technical capability** - Can build this
4. **Network** - Stars National, travel ball community
5. **Adjacent business** - point.dog could distribute/support

---

## 13. NEXT STEPS (If Proceeding)

### Immediate (This Week)
1. Validate concept with 3-5 travel coaches (would they use this?)
2. Validate with 3-5 families (would they pay $25/month?)
3. Pick a name / domain

### Short-Term (Next 2 Weeks)
1. Set up Supabase with schema
2. Migrate Ayn's Notion data as seed
3. Generate embeddings for 10 programs
4. Build proof-of-concept semantic search

### Medium-Term (Month 1-2)
1. Build MVP with 50 programs
2. Beta test with Stars National families
3. Iterate based on feedback
4. Soft launch with Stripe

---

## TL;DR

**The product:** Softball program discovery platform - helps families find schools they've never heard of that are actually perfect fits.

**The gap:** Everyone sells "get recruited" but nobody teaches "find the right program."

**The moat:** Curated insights + semantic search + community knowledge. Not just data - intelligence.

**The market:** 50,000 serious prospects, $15-30K/year travel ball spend, underserved.

**The path:**
1. Build MVP with 50 programs (8 weeks)
2. Beta with Stars National families
3. Distribute through travel coaches
4. Expand to 300+ programs

---

*Created: December 29, 2025*
*Status: Concept / Validation Stage*
*Owner: Mike Usry*
