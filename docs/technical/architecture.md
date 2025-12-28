# Site Architecture

> Technical structure of the APU2028 recruiting site

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | **Astro** | Static-first, minimal JS, fast builds |
| Styling | **Tailwind CSS** | Utility-first responsive design |
| Images | **Cloudinary** | Optimization, responsive images, video |
| Hosting | **Vercel** | Edge network, automatic deploys |
| Tracking | **Custom** | Vercel KV for visit tracking |
| Font | **Inter** | Clean, professional sans-serif |

### Why Astro?

- Zero JS by default (coaches on slow hotel wifi)
- Faster initial load than Next.js
- No need for React interactivity on a recruiting site
- Built-in image optimization

---

## Directory Structure

```
apu2028/
├── public/
│   ├── favicon.ico
│   ├── og-image.jpg           # Social share image
│   └── tracker.js             # Visit tracking script
├── src/
│   ├── components/
│   │   ├── Header.astro       # Sticky nav
│   │   ├── Hero.astro         # Profile + action shot
│   │   ├── VideoSection.astro # Highlight video embed
│   │   ├── SkillsGrid.astro   # Skills breakdown
│   │   ├── StatsTable.astro   # Stats + measurables
│   │   ├── Schedule.astro     # Tournament schedule
│   │   ├── About.astro        # Bio + academics
│   │   ├── Contact.astro      # Player/parent/coach info
│   │   ├── Footer.astro
│   │   └── CloudinaryImage.astro  # Responsive images
│   ├── layouts/
│   │   └── Layout.astro       # Base HTML, meta, fonts
│   ├── pages/
│   │   ├── index.astro        # Main recruiting page
│   │   └── coach-visits.astro # Tracking dashboard
│   └── styles/
│       └── global.css         # Tailwind imports
├── api/
│   └── coach-visits.ts        # Vercel serverless function
├── docs/                      # This documentation
├── astro.config.mjs
├── tailwind.config.mjs
├── vercel.json
└── package.json
```

---

## Key Components

### Layout.astro
Base HTML wrapper with:
- Meta tags (SEO, Open Graph, Twitter Cards)
- Font preloading (Inter)
- Tracker script injection
- Responsive viewport

### Hero.astro
Above-the-fold content:
- Cloudinary-optimized action photo
- Name, class year, position
- Team and school info
- CTA to video section
- Social links

### CloudinaryImage.astro
Responsive image component:
- Auto-format (WebP when supported)
- Auto-quality optimization
- Srcset generation for responsive sizes
- Lazy loading (except hero)

### VideoSection.astro
Highlight reel embed:
- Cloudinary video delivery
- Auto-generated poster
- Responsive aspect ratio
- No autoplay (respect data/context)

---

## Cloudinary Setup

**Cloud Name:** `southland-organics`
**Folder:** `AynParkerUsry`

### Image URL Pattern
```
https://res.cloudinary.com/southland-organics/image/upload/{transforms}/{publicId}
```

### Common Transforms
- `c_fill` - Crop to fill dimensions
- `q_auto` - Automatic quality
- `f_auto` - Automatic format
- `w_XXX` - Width constraint

### Video URL Pattern
```
https://res.cloudinary.com/southland-organics/video/upload/q_auto/{publicId}.mp4
```

### Poster from Video
```
https://res.cloudinary.com/southland-organics/video/upload/so_0/{publicId}.jpg
```

---

## Environment Variables

```bash
# .env.local (not committed)
PUBLIC_VISITS_KEY=xxx        # Dashboard access key
```

---

## Vercel Configuration

```json
// vercel.json
{
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

---

## Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| Lighthouse Performance | 95+ | Coaches on slow wifi |
| First Contentful Paint | < 1.5s | Immediate feedback |
| Largest Contentful Paint | < 2.5s | Hero image |
| Total Blocking Time | < 200ms | No JS blocking |
| Cumulative Layout Shift | < 0.1 | Stable layout |
| Page Weight | < 500KB | Excluding video |

### Performance Checklist
- [x] All images via Cloudinary with `f_auto,q_auto`
- [x] Hero image `loading="eager"`, others `loading="lazy"`
- [x] Video lazy-loaded
- [x] Fonts preloaded with `display=swap`
- [x] No blocking JavaScript
- [x] Minimal dependencies

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

*Last updated: December 2025*
