# APU2028 Documentation

> Ayn Parker Usry - Class of 2028 Softball Recruiting Site

## Quick Links

| Doc | Purpose |
|-----|---------|
| [Recruiting Strategy](recruiting/strategy.md) | Target schools, conference tiers, positioning |
| [Recruiting Wisdom](recruiting/wisdom.md) | Key insights from D1 athletes & coaches |
| [Coach Visits Dashboard](technical/coach-visits.md) | Tracking system for coach interest |
| [Site Architecture](technical/architecture.md) | Tech stack, components, deployment |

---

## Project Overview

**Purpose:** Get college coaches to video as fast as possible while providing everything they need to evaluate Ayn as a recruit.

**Live Site:** https://aynparkerusry.com

### The Player

| Attribute | Value |
|-----------|-------|
| Name | Ayn Parker Usry |
| Grad Year | 2028 |
| Position | Outfield (CF/Corner) |
| Team | Stars National Walker (PGF National) |
| NCAA ID | 2509718485 |
| GPA | 3.74 |
| Twitter | @AynParkerUsry |

### Fall 2025 Stats

```
AVG: .380 | OBP: .438 | OPS: .922
Team Record: 24-7-2 | Alliance Atlantic Region Champions
```

---

## Documentation Structure

```
docs/
├── index.md                    # This file - entry point
├── recruiting/
│   ├── strategy.md            # Target schools, tiers, approach
│   ├── wisdom.md              # Recruiting myths, rules, advice
│   └── contacts.md            # College coach contacts (private)
├── technical/
│   ├── architecture.md        # Site structure, components
│   ├── coach-visits.md        # Tracking dashboard docs
│   └── deployment.md          # Vercel, env vars, domains
└── sessions/
    └── YYYY-MM-DD.md          # Session logs
```

---

## Key Recruiting Insights

From [Recruiting Wisdom](recruiting/wisdom.md):

1. **Recruiting windows are REAL** - Fall is prime; they close fast
2. **Stats DO matter** - Coaches look at them and bring them up
3. **If undersized, OVERWHELM with metrics** - Need one undeniable tool
4. **Grades are a differentiator** - 3.74 GPA opens doors
5. **Use camps strategically** - Cut useless ones, train instead

---

## Target School Tiers

From [Strategy](recruiting/strategy.md):

**REALISTIC (Best Fit):**
1. Kennesaw State - 35 mi, C-USA
2. USC Upstate - 150 mi, Big South
3. Jacksonville State - 170 mi, C-USA
4. Wofford - 110 mi, elite academics
5. Charlotte - 260 mi, AAC

**SAFETY:**
1. West Georgia - 75 mi, ASUN
2. Georgia State - 70 mi, Sun Belt
3. Mercer - 80 mi, SoCon
4. Presbyterian - 115 mi, Big South
5. Furman - 130 mi, SoCon

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro |
| Styling | Tailwind CSS |
| Images/Video | Cloudinary |
| Hosting | Vercel |
| Tracking | Custom (Vercel KV) |

---

## Session Protocol

Before ending any session:
1. Run `/doc-check` to audit undocumented work
2. Update relevant docs with new knowledge
3. Commit changes with descriptive message
4. Update `.claude-context.md` with session summary
