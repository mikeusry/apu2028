# Ayn Parker Usry - Softball Recruiting Website

## Project Overview

A single-page recruiting website for Ayn Parker Usry, a 2028 softball prospect (outfielder) seeking D1 scholarship opportunities. The site serves one purpose: **get college coaches to video as fast as possible** while providing everything they need to evaluate her as a recruit.

**Live URL Target:** `aynparkerusry.com` (or similar)

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | **Astro** | Static-first, fast builds, minimal JS |
| Styling | **Tailwind CSS v4** | Utility-first, responsive |
| Images | **Cloudinary** | Optimization, responsive images, transformations |
| Video | **Gumlet** | Video hosting, adaptive streaming |
| Deployment | **Vercel** | Edge network, automatic deployments |
| Font | Inter or similar clean sans-serif | Professional, readable |

### Why Astro over Next.js
- Zero JS by default (coaches on slow hotel wifi)
- Faster initial load
- No need for React interactivity on a single-page recruiting site
- Built-in image optimization works with Cloudinary

---

## Design Requirements

### Philosophy
- **Speed over flash** - Coaches will bail if it's slow
- **Mobile-first** - They're watching on phones at tournaments
- **One-click to video** - Hero section should have play button
- **Scannable** - They're evaluating hundreds of prospects
- **Professional but warm** - Not corporate, not amateur

### Color Palette
```css
/* Primary - Based on Stars National purple/black */
--color-primary: #4B0082;      /* Deep purple */
--color-primary-light: #6B238E;
--color-accent: #FFD700;        /* Gold accent */

/* Neutrals */
--color-dark: #1a1a2e;
--color-gray: #4a4a68;
--color-light: #f8f9fa;
--color-white: #ffffff;
```

### Typography
- Headlines: Bold, confident, not playful
- Body: Clean, readable at small sizes
- Stats: Tabular/monospace numbers for alignment

### Responsive Breakpoints
- Mobile: 320px - 768px (PRIMARY - design here first)
- Tablet: 768px - 1024px
- Desktop: 1024px+

---

## Site Structure

Single page with smooth scroll navigation. No multi-page routing needed.

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (sticky)                                            │
│  Logo/Name | Video | Stats | Schedule | About | Contact     │
├─────────────────────────────────────────────────────────────┤
│  HERO SECTION                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Photo (action shot)          │  Name & Info        │   │
│  │                               │  Class of 2028      │   │
│  │                               │  OF | R/R | 5'6"    │   │
│  │                               │  Stars National     │   │
│  │                               │  [▶ Watch Film]     │   │
│  │                               │  Twitter | Email    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  HIGHLIGHT VIDEO (embedded, large)                          │
│  Primary highlight reel - 2-3 minutes max                   │
├─────────────────────────────────────────────────────────────┤
│  SKILLS VIDEOS (grid)                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Hitting  │ │ Fielding │ │ Throwing │ │  Speed   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│  STATS SECTION                                              │
│  Current season stats table + career highlights             │
├─────────────────────────────────────────────────────────────┤
│  SCHEDULE - "WHERE TO SEE ME PLAY"                          │
│  Upcoming tournaments with dates/locations                  │
├─────────────────────────────────────────────────────────────┤
│  ABOUT / ACADEMICS                                          │
│  GPA, School, Intended Major, Character/Leadership          │
├─────────────────────────────────────────────────────────────┤
│  CONTACT                                                    │
│  Player email, Parent contact, Travel coach info            │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
│  Social links, Copyright                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Content Sections - Detailed

### 1. Header (Sticky)
```
- Name as logo: "AYN PARKER USRY" or "APU" monogram
- Nav links: Video | Stats | Schedule | About | Contact
- Mobile: Hamburger menu or horizontal scroll
- Background: Transparent → solid on scroll
```

### 2. Hero Section
**Must include:**
- Action photo (Cloudinary optimized, WebP with fallback)
- Full name: **Ayn Parker Usry**
- Class year: **Class of 2028**
- Position: **Outfield (CF/Corner)**
- Physical: **5'6" | 135 lbs**
- Bats/Throws: **R/R**
- Team: **Stars National Walker** (with link)
- High School: **Liberty University Online Academy** (Bogart, GA)
- Primary CTA: **▶ Watch Highlights** (scrolls to video)
- Secondary: Twitter icon (@AynParkerUsry) | Email icon

### 3. Highlight Video
```
- Gumlet embedded player
- Poster image (Cloudinary)
- 16:9 aspect ratio
- Lazy load but above-the-fold priority
- NO autoplay (respect data/context)
- Controls visible
- Full-screen capable
```

### 4. Skills Videos Grid
Four video thumbnails in a grid:

| Video | Content Focus |
|-------|---------------|
| **Hitting** | Swing mechanics, bat speed, contact, game ABs |
| **Fielding** | Reads, routes, catches, ground balls |
| **Arm** | Throws from outfield, accuracy, velocity |
| **Speed** | Home to first, baserunning, stolen bases |

Each card:
- Thumbnail (Cloudinary)
- Title overlay
- Click to play (modal or inline expand)
- Duration badge

### 5. Stats Section

**Fall 2025 - Stars National Walker**
```
| Stat | Value |
|------|-------|
| GP/GS | 33/9 |
| AVG | .380 |
| OBP | .438 |
| SLG | .479 |
| OPS | .922 |
| H | 27 |
| 2B | 3 |
| HR | 1 |
| RBI | 14 |
| SB | 9/11 (82%) |
| QAB% | 60.5% |
```

**Team Record:** 24-7-2 | Alliance Atlantic Region Champions

**Athletic Measurables:**
- Home to 1st: TBD (add when available)
- Overhand Throw: Plus arm
- 60-yard dash: TBD

### 6. Schedule - "Where to See Me Play"

**Summer 2026 Tournament Schedule:**

| Date | Event | Location |
|------|-------|----------|
| Jun 5-8 | Show Me The Money (PGF) | Newberry, FL |
| Jun 11-14 | Top Gun Invite | Shawnee, KS |
| Jun 18-21 | Scenic City | Dalton, GA |
| Jun 28 - Jul 5 | Colorado 4th of July Sparkler | Denver, CO |
| Jul 10-12 | Atlanta Legacy Invitational | Atlanta, GA |
| Jul 19-26 | Alliance Championship Series | Kokomo, IN |

Display as cards or clean table. Include "Schedule subject to change" note.

### 7. About / Academics

**Academic Profile:**
- GPA: 3.74
- School: Liberty University Online Academy (Bogart, GA)
- Honors: BETA Club inductee (2025-2026)
- Intended Major: Open (mention if she has preferences)

**About Text (keep brief):**
> Contact-first outfielder with plus speed and a plus arm. State track finalist in triple jump as a freshman. Made the jump to top-tier PGF National team for Fall 2025 and maintained strong production against elite competition. High softball IQ with excellent plate discipline. Looking for a program where I can compete, grow, and contribute from day one.

**Character/Leadership (optional bullet points):**
- Team captain experience
- Community service
- Other sports/activities

### 8. Contact Section

**Player:**
- Email: aynparkerusry2028@gmail.com
- Twitter: [@AynParkerUsry](https://x.com/AynParkerUsry)
- NCAA ID: 2509718485

**Parent Contact:**
- Mike Usry
- Email: (add preferred email)
- Phone: (add if desired)

**Travel Ball Coach:**
- Coach Walker - Stars National Walker
- Twitter: [@StarsNatWalker](https://x.com/StarsNatWalker)

### 9. Footer
- Social icons (Twitter, YouTube if applicable)
- Copyright: © 2025 Ayn Parker Usry
- "Built with ❤️ in Georgia"

---

## Technical Implementation

### Astro Project Setup
```bash
npm create astro@latest ayn-recruiting-site
# Select: Empty project, TypeScript (strict), Tailwind

cd ayn-recruiting-site
npx astro add tailwind
npm install @astrojs/cloudinary
```

### File Structure
```
/
├── public/
│   ├── favicon.ico
│   └── og-image.jpg          # Social share image
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── VideoPlayer.astro  # Gumlet embed wrapper
│   │   ├── SkillsGrid.astro
│   │   ├── StatsTable.astro
│   │   ├── Schedule.astro
│   │   ├── About.astro
│   │   ├── Contact.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Layout.astro       # Base HTML, meta tags, fonts
│   ├── pages/
│   │   └── index.astro        # Single page, imports all components
│   ├── styles/
│   │   └── global.css         # Tailwind imports + custom CSS
│   └── data/
│       ├── stats.json         # Stats data (easy to update)
│       ├── schedule.json      # Tournament schedule
│       └── videos.json        # Video URLs/metadata
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
└── README.md
```

### Cloudinary Integration

```javascript
// src/components/Hero.astro
---
import { Image } from 'astro:assets';

const heroImage = "https://res.cloudinary.com/YOUR_CLOUD/image/upload/c_fill,w_800,h_1000,q_auto,f_auto/ayn-action-shot.jpg";
---

<img 
  src={heroImage}
  alt="Ayn Parker Usry - Outfielder"
  width="800"
  height="1000"
  loading="eager"
  decoding="async"
/>
```

Cloudinary transformations to use:
- `c_fill` - Crop to fill dimensions
- `q_auto` - Automatic quality optimization
- `f_auto` - Automatic format (WebP when supported)
- `w_XXX` - Width based on breakpoint

### Gumlet Video Embed

```html
<!-- src/components/VideoPlayer.astro -->
---
interface Props {
  videoId: string;
  title: string;
  poster?: string;
}

const { videoId, title, poster } = Astro.props;
---

<div class="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
  <iframe
    src={`https://play.gumlet.io/embed/${videoId}`}
    title={title}
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    class="w-full h-full"
  ></iframe>
</div>
```

### Data Files (Easy Updates)

```json
// src/data/stats.json
{
  "season": "Fall 2025",
  "team": "Stars National Walker",
  "record": "24-7-2",
  "stats": {
    "gp": 33,
    "gs": 9,
    "avg": ".380",
    "obp": ".438",
    "slg": ".479",
    "ops": ".922",
    "hits": 27,
    "doubles": 3,
    "hr": 1,
    "rbi": 14,
    "sb": "9/11",
    "sbPct": "82%"
  }
}
```

```json
// src/data/schedule.json
{
  "season": "Summer 2026",
  "events": [
    {
      "name": "Show Me The Money",
      "org": "PGF",
      "dates": "Jun 5-8",
      "location": "Newberry, FL"
    },
    {
      "name": "Top Gun Invite",
      "org": "Top Gun Events",
      "dates": "Jun 11-14",
      "location": "Shawnee, KS"
    }
    // ... etc
  ]
}
```

---

## SEO & Meta Tags

```html
<!-- src/layouts/Layout.astro -->
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <title>Ayn Parker Usry | 2028 Softball Recruit | Outfield</title>
  <meta name="description" content="Ayn Parker Usry - Class of 2028 softball recruit. Outfielder for Stars National Walker. Contact-hitter with plus speed and plus arm. Seeking D1 opportunities." />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Ayn Parker Usry | 2028 Softball Recruit" />
  <meta property="og:description" content="Class of 2028 outfielder for Stars National Walker. View highlights, stats, and schedule." />
  <meta property="og:image" content="https://aynparkerusry.com/og-image.jpg" />
  <meta property="og:url" content="https://aynparkerusry.com" />
  <meta property="og:type" content="website" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@AynParkerUsry" />
  <meta name="twitter:title" content="Ayn Parker Usry | 2028 Softball Recruit" />
  <meta name="twitter:description" content="Class of 2028 outfielder. View highlights and stats." />
  <meta name="twitter:image" content="https://aynparkerusry.com/og-image.jpg" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
```

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 95+ |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Total Blocking Time | < 200ms |
| Cumulative Layout Shift | < 0.1 |
| Page Weight | < 500KB (excluding video) |

### Performance Checklist
- [ ] All images served via Cloudinary with `f_auto,q_auto`
- [ ] Hero image `loading="eager"`, all others `loading="lazy"`
- [ ] Videos lazy-loaded (iframe only loads on scroll into view)
- [ ] Fonts preloaded with `display=swap`
- [ ] No blocking JavaScript
- [ ] CSS inlined for critical path
- [ ] Minimal dependencies (Astro = near-zero JS)

---

## Deployment (Vercel)

### vercel.json
```json
{
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Environment Variables
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
GUMLET_COLLECTION_ID=your_collection_id
```

---

## Content Checklist (For Mike)

Before launch, ensure these assets are ready:

### Photos (upload to Cloudinary)
- [ ] Hero action shot (batting or fielding, high quality)
- [ ] Headshot (for contact section)
- [ ] Video thumbnail images (4 - one per skill category)
- [ ] OG share image (1200x630px)

### Videos (upload to Gumlet)
- [ ] Main highlight reel (2-3 min max)
- [ ] Hitting clips compilation
- [ ] Fielding clips compilation
- [ ] Arm/throwing clips
- [ ] Speed/baserunning clips

### Data
- [ ] Current season stats (update after each tournament)
- [ ] Tournament schedule
- [ ] Measurables (home to first, 60-yard, throw velo if available)
- [ ] Academic info (current GPA, test scores if available)

---

## Future Enhancements (Post-Launch)

1. **Analytics** - Add Vercel Analytics or Plausible to track coach visits
2. **Contact Form** - Simple form that emails inquiries (use Formspree or similar)
3. **Video Updates** - Easy way to swap in new highlight reels
4. **Testimonials** - Quotes from coaches (travel or HS)
5. **Press/Awards** - Section for any recognition

---

## Quick Reference

**Domain:** TBD (aynparkerusry.com recommended)
**Twitter:** @AynParkerUsry
**Email:** aynparkerusry2028@gmail.com
**NCAA ID:** 2509718485
**Grad Year:** 2028
**Position:** Outfield (CF/Corner)
**Team:** Stars National Walker
**Location:** Bogart, GA

---

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Deploy (auto via Vercel git integration)
git push origin main
```

---

*This README serves as the complete specification for Claude Code to build the site. All content, structure, and technical decisions are defined above.*
