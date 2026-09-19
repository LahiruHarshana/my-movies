# Phase 7: UI/UX Polish

> **Goal**: Transform the functional app into a polished, professional cinema-themed experience with responsive design, dark mode, animations, and delightful micro-interactions.

---

## 7.1 Design System

### Color Palette (Dark Cinema Theme)

| Token | Value | Usage |
|:---|:---|:---|
| `--bg-primary` | `#0a0a0f` | Main background (near black) |
| `--bg-secondary` | `#12121a` | Card/section backgrounds |
| `--bg-tertiary` | `#1a1a2e` | Elevated surfaces, modals |
| `--text-primary` | `#e8e8ed` | Main text |
| `--text-secondary` | `#9898a8` | Muted text, descriptions |
| `--accent-primary` | `#6366f1` | Primary actions (indigo) |
| `--accent-secondary` | `#ec4899` | Favorites, hearts (pink) |
| `--accent-gold` | `#f59e0b` | Ratings, stars (amber) |
| `--success` | `#22c55e` | Watched status, success |
| `--warning` | `#f59e0b` | Medium priority |
| `--danger` | `#ef4444` | Remove, errors |
| `--border` | `#2a2a3e` | Subtle borders |

### Typography
| Element | Font | Size | Weight |
|:---|:---|:---|:---|
| Headings | Inter | 24–36px | 700 (Bold) |
| Body | Inter | 14–16px | 400 (Regular) |
| Caption | Inter | 12px | 400 |
| Monospace | JetBrains Mono | 13px | 400 |

### Spacing Scale
Use Tailwind's default spacing: `4, 8, 12, 16, 24, 32, 48, 64px`

---

## 7.2 Layout Components

### Sidebar Navigation: `src/components/layout/Sidebar.tsx`

```
┌─────────────────┐
│  🎬 My Movies   │  ← Logo/brand
│                 │
│  📊 Dashboard   │  ← Active indicator
│  ✅ Watched     │
│  📋 Watchlist   │
│  💡 For You     │  ← Recommendations
│  🔍 Search      │
│                 │
│  ─────────────  │
│                 │
│  👤 Lahiru      │  ← User menu
│  ⚙️ Settings    │
│  🚪 Sign Out    │
└─────────────────┘
```

- Fixed on desktop (240px width)
- Collapsible to icon-only mode (64px)
- Hidden on mobile (replaced by bottom nav)

### Mobile Bottom Nav: `src/components/layout/MobileNav.tsx`

```
┌────────┬────────┬────────┬────────┬────────┐
│   🏠   │   ✅   │   🔍   │   📋   │   💡   │
│  Home  │Watched │ Search │  List  │For You │
└────────┴────────┴────────┴────────┴────────┘
```

- Fixed bottom bar on mobile (< 768px)
- Active tab indicator with accent color
- Smooth icon transition

### Navbar: `src/components/layout/Navbar.tsx`

- Sticky top bar
- Search bar (centered or right-aligned)
- User avatar + dropdown menu
- Dark/light mode toggle (if implementing light mode)

---

## 7.3 Responsive Breakpoints

| Breakpoint | Width | Layout |
|:---|:---|:---|
| Mobile | < 640px | Single column, bottom nav, full-width cards |
| Tablet | 640–1024px | 2-column grid, collapsible sidebar |
| Desktop | 1024–1280px | 3-column grid, full sidebar |
| Large | > 1280px | 4-column grid, full sidebar |

### Movie Card Grid Columns
```css
grid-template-columns: 
  repeat(auto-fill, minmax(180px, 1fr));  /* Responsive grid */
```

---

## 7.4 Animation & Transitions

### Page Transitions
- Fade-in on route change (200ms ease)
- Use Next.js `loading.tsx` for route-level loading states

### Card Interactions
| Interaction | Animation |
|:---|:---|
| Card hover | Scale 1.03, subtle shadow lift (200ms) |
| Card click | Scale 0.97 press effect (100ms) |
| Poster hover | Overlay slides up from bottom with movie overview |
| Add to list | Card briefly glows green (watched) or blue (watchlist) |
| Remove from list | Card fades out and collapses (300ms) |

### Micro-Interactions
| Element | Animation |
|:---|:---|
| Star rating | Stars fill with cascade animation (50ms stagger) |
| Heart (favorite) | Bounce + scale animation |
| Add button | Checkmark morphs from plus icon |
| Loading | Pulsing skeleton placeholders |
| Toast notification | Slide in from top-right, auto-dismiss (3s) |
| Modal | Backdrop fade + modal scale-up (200ms) |

### Horizontal Carousel
- Smooth scroll with CSS `scroll-snap-type: x mandatory`
- Left/right navigation arrows
- Fade edges on sides
- Swipe support on mobile (touch events)

---

## 7.5 Loading States

### Skeleton Components: `src/components/ui/Skeleton.tsx`

**Movie Card Skeleton:**
```
┌─────────────┐
│  ░░░░░░░░░  │  ← Poster placeholder (shimmer)
│  ░░░░░░░░░  │
│  ░░░░░░░░░  │
│  ░░░░░░░░░  │
├─────────────┤
│  ░░░░░░░░   │  ← Title placeholder
│  ░░░░       │  ← Year placeholder
│  ░░░ ░░░    │  ← Genre badges placeholder
└─────────────┘
```

**Movie Detail Skeleton:**
```
┌───────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░ (backdrop)      │
├───────┬───────────────────────────────┤
│ ░░░░░ │  ░░░░░░░░░░ (title)          │
│ ░░░░░ │  ░░░░░░ (genres)             │
│ ░░░░░ │  ░░░ (rating)                │
└───────┴───────────────────────────────┘
```

**Loading files per route:**
- `src/app/(main)/dashboard/loading.tsx`
- `src/app/(main)/watched/loading.tsx`
- `src/app/(main)/watchlist/loading.tsx`
- `src/app/(main)/recommendations/loading.tsx`
- `src/app/(main)/movie/[id]/loading.tsx`

---

## 7.6 Toast Notification System

### File: `src/components/ui/Toast.tsx`

Use a lightweight toast system (build custom or use `sonner` library — free):

**Toast Types:**
- ✅ **Success**: "Movie added to watched list!"
- ❌ **Error**: "Failed to add movie. Please try again."
- ℹ️ **Info**: "Movie moved from watchlist to watched."
- ⚠️ **Warning**: "This movie is already in your list."

**Behavior:**
- Stacks up to 3 toasts
- Auto-dismiss after 3 seconds
- Can be manually dismissed
- Slide-in from top-right

---

## 7.7 Empty States

Design engaging empty states for each page:

### Watched List Empty State
```
     🎬
   (film reel illustration)

  "You haven't watched any movies yet!"
  
  Start building your watched list by
  searching for movies you've seen.

  [🔍 Search Movies]  ← CTA button
```

### Watchlist Empty State
```
     📋
   (clipboard illustration)

  "Your watchlist is empty!"
  
  Discover new movies and save them
  for later viewing.

  [💡 Get Recommendations]  ← CTA button
```

### Recommendations Empty State (new user)
```
     🤖
   (robot thinking illustration)

  "We need more data to recommend movies!"
  
  Add at least 5 watched movies so we can
  understand your taste and suggest films.

  Progress: ██░░░ 2/5 movies added

  [✅ Add Watched Movies]  ← CTA button
```

---

## 7.8 Error States

### Error Boundary: `src/app/(main)/error.tsx`

```
     ⚠️
   
  "Something went wrong"
  
  We encountered an unexpected error.
  Don't worry, your data is safe.

  [🔄 Try Again]  [🏠 Go Home]
```

### 404 Page: `src/app/not-found.tsx`

```
     🎬 404
   
  "This movie doesn't exist in our universe"
  
  The page you're looking for couldn't be found.

  [🏠 Go Home]  [🔍 Search Movies]
```

---

## 7.9 Accessibility

| Feature | Implementation |
|:---|:---|
| Keyboard navigation | Tab order, focus rings, Enter/Space activation |
| Screen reader support | ARIA labels, roles, live regions |
| Color contrast | WCAG AA minimum (4.5:1 text, 3:1 large text) |
| Focus management | Return focus to trigger on modal close |
| Reduced motion | Respect `prefers-reduced-motion` media query |
| Alt text | All poster images have descriptive alt text |

---

## 7.10 Performance Optimizations

| Optimization | Implementation |
|:---|:---|
| Image optimization | Next.js `<Image>` with lazy loading, responsive sizes |
| Poster sizes | Use `w342` for cards, `w500` for detail, `w780` for backdrop |
| Code splitting | Dynamic imports for modals, carousels |
| Virtualized lists | For large watched lists (100+ movies) |
| Prefetching | `<Link prefetch>` on sidebar navigation |
| Bundle analysis | Run `@next/bundle-analyzer` to identify large chunks |

---

## 7.11 Deliverables Checklist

- [ ] Dark cinema theme applied globally via Tailwind config
- [ ] `src/components/layout/Sidebar.tsx` — Desktop sidebar navigation
- [ ] `src/components/layout/MobileNav.tsx` — Mobile bottom navigation
- [ ] `src/components/layout/Navbar.tsx` — Top navigation bar
- [ ] `src/components/ui/Skeleton.tsx` — Skeleton loading components
- [ ] `src/components/ui/Toast.tsx` — Toast notification system
- [ ] Loading states for all 5 main pages (`loading.tsx`)
- [ ] Empty states for watched, watchlist, and recommendations
- [ ] Error boundary and 404 page
- [ ] Card hover/click animations
- [ ] Star rating cascade animation
- [ ] Horizontal carousel with scroll snap
- [ ] Responsive layout tested: mobile, tablet, desktop
- [ ] Accessibility audit passed (keyboard nav, screen reader, contrast)
- [ ] `prefers-reduced-motion` respected
- [ ] Next.js Image component used for all TMDB images
- [ ] Git commit: `feat: add UI polish, animations, and responsive design`

---

## Estimated Time: 4–6 hours
