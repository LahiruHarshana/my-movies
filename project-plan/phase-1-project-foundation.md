# Phase 1: Project Foundation

> **Goal**: Initialize the Next.js 15 project with all tooling, folder structure, and environment configuration.

---

## 1.1 Project Initialization

### Create Next.js 15 App
```bash
npx create-next-app@latest my-movies --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Configuration Choices
| Option | Value |
|:---|:---|
| TypeScript | ✅ Yes |
| ESLint | ✅ Yes |
| Tailwind CSS | ✅ Yes (v4) |
| `src/` directory | ✅ Yes |
| App Router | ✅ Yes |
| Import alias | `@/*` |

---

## 1.2 Folder Structure

```
my-movies/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Route group: auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx             # Auth-specific layout (no sidebar)
│   │   ├── (main)/                    # Route group: authenticated pages
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Home dashboard
│   │   │   ├── watched/
│   │   │   │   └── page.tsx           # Watched movies list
│   │   │   ├── watchlist/
│   │   │   │   └── page.tsx           # Future watchlist
│   │   │   ├── recommendations/
│   │   │   │   └── page.tsx           # Recommended movies
│   │   │   ├── movie/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Movie detail page
│   │   │   ├── search/
│   │   │   │   └── page.tsx           # Search results
│   │   │   └── layout.tsx             # Main layout (with sidebar/nav)
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts       # Auth.js route handler
│   │   │   └── tmdb/
│   │   │       ├── search/
│   │   │       │   └── route.ts       # Proxy TMDB search
│   │   │       ├── movie/
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts   # Proxy TMDB movie details
│   │   │       └── recommendations/
│   │   │           └── route.ts       # Proxy TMDB recommendations
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Landing page (redirect to dashboard)
│   │   └── globals.css                # Global styles + Tailwind
│   ├── components/
│   │   ├── ui/                        # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── StarRating.tsx
│   │   ├── layout/                    # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── movies/                    # Movie-specific components
│   │   │   ├── MovieCard.tsx
│   │   │   ├── MovieGrid.tsx
│   │   │   ├── MovieDetailView.tsx
│   │   │   ├── MovieSearchBar.tsx
│   │   │   ├── MovieListItem.tsx
│   │   │   ├── AddToListButton.tsx
│   │   │   └── MovieFilters.tsx
│   │   └── auth/                      # Auth components
│   │       ├── LoginForm.tsx
│   │       ├── SignupForm.tsx
│   │       └── UserMenu.tsx
│   ├── lib/                           # Shared utilities
│   │   ├── mongodb.ts                 # MongoDB connection singleton
│   │   ├── tmdb.ts                    # TMDB API helper functions
│   │   ├── utils.ts                   # General utility functions
│   │   └── validations.ts            # Zod schemas for validation
│   ├── models/                        # Mongoose schemas
│   │   ├── User.ts
│   │   ├── WatchedMovie.ts
│   │   └── WatchlistMovie.ts
│   ├── actions/                       # Server Actions
│   │   ├── auth.ts                    # Auth server actions
│   │   ├── watched.ts                 # Watched list CRUD
│   │   ├── watchlist.ts               # Watchlist CRUD
│   │   └── recommendations.ts        # Recommendation logic
│   ├── hooks/                         # Custom React hooks
│   │   ├── useDebounce.ts
│   │   └── useMovieSearch.ts
│   ├── types/                         # TypeScript type definitions
│   │   ├── movie.ts                   # Movie-related types
│   │   ├── user.ts                    # User-related types
│   │   └── api.ts                     # API response types
│   ├── constants/                     # App constants
│   │   └── genres.ts                  # TMDB genre ID mappings
│   ├── auth.ts                        # Auth.js main config
│   ├── auth.config.ts                 # Auth.js edge config (for middleware)
│   └── middleware.ts                  # Next.js middleware (route protection)
├── public/
│   ├── tmdb-logo.svg                  # TMDB attribution logo (required)
│   ├── placeholder-poster.png         # Fallback poster image
│   └── favicon.ico
├── .env.local                         # Environment variables (NOT committed)
├── .env.example                       # Example env file (committed)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 1.3 Dependencies to Install

### Core Dependencies
```bash
npm install mongoose bcryptjs next-auth@beta zod
```

### Dev Dependencies
```bash
npm install -D @types/bcryptjs prettier eslint-config-prettier
```

| Package | Purpose | Cost |
|:---|:---|:---|
| `mongoose` | MongoDB ODM with schema validation | Free |
| `bcryptjs` | Password hashing | Free |
| `next-auth@beta` | Auth.js v5 for authentication | Free |
| `zod` | Runtime schema validation | Free |
| `prettier` | Code formatting | Free |

---

## 1.4 Environment Variables

### `.env.example` (committed to Git)
```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/my-movies?retryWrites=true&w=majority

# Auth.js
AUTH_SECRET=           # Generate with: openssl rand -base64 32
AUTH_URL=http://localhost:3000

# TMDB API
TMDB_API_KEY=          # Get from https://www.themoviedb.org/settings/api
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 1.5 Next.js Configuration

### Key `next.config.ts` Settings
- Configure `images.remotePatterns` to allow TMDB poster images from `image.tmdb.org`
- Set up any necessary experimental features

---

## 1.6 Git Initialization

```bash
git init
git add .
git commit -m "feat: initialize Next.js 15 project with TypeScript and Tailwind"
```

### `.gitignore` Additions
```
.env.local
.env*.local
node_modules/
.next/
```

---

## 1.7 Deliverables Checklist

- [ ] Next.js 15 app created with App Router + TypeScript
- [ ] Tailwind CSS 4 configured and working
- [ ] ESLint + Prettier configured
- [ ] Full folder structure created (empty placeholder files)
- [ ] All dependencies installed
- [ ] `.env.example` created with all required variables
- [ ] `next.config.ts` configured for TMDB images
- [ ] Git initialized with first commit
- [ ] Dev server runs without errors: `npm run dev`

---

## Estimated Time: 1–2 hours
