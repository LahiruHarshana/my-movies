# Phase 4: TMDB Integration

> **Goal**: Integrate TMDB API for movie search, details, images, and discovery — all through server-side proxy routes to keep the API key secure.

---

## 4.1 TMDB API Setup

### Getting Your Free API Key
1. Create account at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to **Settings → API** → Request an API key
3. Select "Developer" → Fill in app details:
   - Application Name: `My Movies`
   - Application URL: `http://localhost:3000`
   - Summary: "Personal movie tracker for managing watched/watchlist films"
4. Copy the **API Read Access Token** (Bearer token — v4 style, recommended over v3 API key)
5. Add to `.env.local` as `TMDB_API_KEY`

### TMDB API Endpoints We'll Use

| Endpoint | Purpose | Rate Limit |
|:---|:---|:---|
| `GET /search/movie` | Search movies by title | ~40 req/10s |
| `GET /movie/{id}` | Get full movie details | ~40 req/10s |
| `GET /movie/{id}/credits` | Get cast & crew | ~40 req/10s |
| `GET /movie/{id}/recommendations` | TMDB's built-in recommendations | ~40 req/10s |
| `GET /movie/{id}/similar` | Similar movies | ~40 req/10s |
| `GET /trending/movie/{time_window}` | Trending movies (day/week) | ~40 req/10s |
| `GET /movie/top_rated` | All-time top rated | ~40 req/10s |
| `GET /discover/movie` | Discover by genre, year, rating | ~40 req/10s |
| `GET /genre/movie/list` | Get genre ID → name mapping | ~40 req/10s |

### TMDB Image URLs
Posters and backdrops are served from:
```
https://image.tmdb.org/t/p/{size}/{path}
```

**Poster Sizes:** `w92`, `w154`, `w185`, `w342`, `w500`, `w780`, `original`  
**Backdrop Sizes:** `w300`, `w780`, `w1280`, `original`

---

## 4.2 TMDB API Helper

### File: `src/lib/tmdb.ts`

Create a centralized TMDB API wrapper with the following functions:

```
tmdbFetch(endpoint, params?)
├── Builds full URL with base URL
├── Adds Bearer token header
├── Handles errors consistently
├── Returns typed JSON response
└── Supports query parameters
```

**Functions to implement:**

| Function | Description | TMDB Endpoint |
|:---|:---|:---|
| `searchMovies(query, page?)` | Search movies by title | `/search/movie` |
| `getMovieDetails(tmdbId)` | Full movie details + runtime | `/movie/{id}` |
| `getMovieCredits(tmdbId)` | Cast & crew | `/movie/{id}/credits` |
| `getMovieRecommendations(tmdbId)` | TMDB recommendations | `/movie/{id}/recommendations` |
| `getSimilarMovies(tmdbId)` | Similar movies | `/movie/{id}/similar` |
| `getTrendingMovies(window)` | Trending (day/week) | `/trending/movie/{window}` |
| `getTopRatedMovies(page?)` | Top rated movies | `/movie/top_rated` |
| `discoverMovies(params)` | Discover by genre/year/rating | `/discover/movie` |
| `getGenreList()` | Genre ID mapping | `/genre/movie/list` |
| `getImageUrl(path, size)` | Build full image URL | N/A (utility) |

---

## 4.3 TypeScript Types

### File: `src/types/movie.ts`

Define types matching TMDB API responses:

```typescript
// Core movie type from TMDB search/list results
interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  adult: boolean;
}

// Detailed movie (from /movie/{id})
interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  production_companies: { id: number; name: string; logo_path: string }[];
  spoken_languages: { english_name: string; iso_639_1: string }[];
}

// TMDB paginated response
interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Credit types
interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}
```

---

## 4.4 API Proxy Routes

> [!IMPORTANT]
> **Why proxy?** The TMDB API key must stay server-side. Client components call our `/api/tmdb/*` routes, which forward to TMDB with the secret key attached.

### Route: `src/app/api/tmdb/search/route.ts`

```
GET /api/tmdb/search?query=inception&page=1

→ Validates query param exists
→ Calls tmdb.searchMovies(query, page)
→ Returns JSON response to client
```

### Route: `src/app/api/tmdb/movie/[id]/route.ts`

```
GET /api/tmdb/movie/550

→ Validates id is a number
→ Calls tmdb.getMovieDetails(id)
→ Optionally appends credits
→ Returns JSON response to client
```

### Route: `src/app/api/tmdb/recommendations/route.ts`

```
GET /api/tmdb/recommendations?movieId=550&page=1

→ Validates movieId
→ Calls tmdb.getMovieRecommendations(movieId, page)
→ Returns JSON response to client
```

### Route: `src/app/api/tmdb/trending/route.ts`

```
GET /api/tmdb/trending?window=week

→ Calls tmdb.getTrendingMovies(window)
→ Returns JSON response
```

### Route: `src/app/api/tmdb/discover/route.ts`

```
GET /api/tmdb/discover?genres=28,12&year=2024&sort=vote_average.desc

→ Calls tmdb.discoverMovies(params)
→ Returns JSON response
```

---

## 4.5 Response Caching Strategy

### Next.js Built-in Caching

Use Next.js `fetch` options in the TMDB helper for intelligent caching:

| Data Type | Cache Strategy | TTL |
|:---|:---|:---|
| Movie details | `force-cache` | Until revalidated |
| Search results | `no-store` | No cache (real-time) |
| Genre list | `force-cache` | 24 hours (`revalidate: 86400`) |
| Trending movies | `revalidate: 3600` | 1 hour |
| Top rated | `revalidate: 86400` | 24 hours |
| Recommendations | `revalidate: 86400` | 24 hours |

This minimizes TMDB API calls while keeping data reasonably fresh.

---

## 4.6 Next.js Image Configuration

### File: `next.config.ts`

Configure remote image patterns to allow TMDB poster/backdrop images:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'image.tmdb.org',
      pathname: '/t/p/**',
    },
  ],
}
```

This allows using `<Image>` component with TMDB image URLs for automatic optimization.

---

## 4.7 Error Handling

### TMDB API Error Scenarios

| Scenario | Handling |
|:---|:---|
| Invalid API key | Return 401 with clear error message |
| Movie not found | Return 404 |
| Rate limited (429) | Return 429 with retry-after header |
| TMDB server error (5xx) | Return 502 with fallback message |
| Network timeout | Return 504, show cached data if available |
| Missing poster/backdrop | Use placeholder image |

---

## 4.8 TMDB Attribution

> [!IMPORTANT]
> TMDB requires attribution. You must display the TMDB logo and text like "This product uses the TMDB API but is not endorsed or certified by TMDB" in your app footer.

Download the TMDB logo from their brand assets page and save to `public/tmdb-logo.svg`.

---

## 4.9 Deliverables Checklist

- [ ] TMDB API key obtained and added to `.env.local`
- [ ] `src/lib/tmdb.ts` — TMDB API wrapper with all helper functions
- [ ] `src/types/movie.ts` — TypeScript types for TMDB responses
- [ ] `src/app/api/tmdb/search/route.ts` — Search proxy
- [ ] `src/app/api/tmdb/movie/[id]/route.ts` — Movie details proxy
- [ ] `src/app/api/tmdb/recommendations/route.ts` — Recommendations proxy
- [ ] `src/app/api/tmdb/trending/route.ts` — Trending proxy
- [ ] `src/app/api/tmdb/discover/route.ts` — Discover proxy
- [ ] `next.config.ts` updated with TMDB image domains
- [ ] Caching strategy implemented on all fetch calls
- [ ] Error handling for all API failure scenarios
- [ ] TMDB attribution logo added to `public/`
- [ ] Test: Search "Inception" → verify results with posters
- [ ] Test: Get movie details → verify all fields populated
- [ ] Git commit: `feat: add TMDB API integration with proxy routes`

---

## Estimated Time: 2–3 hours
