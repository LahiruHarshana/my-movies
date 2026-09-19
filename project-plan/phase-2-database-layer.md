# Phase 2: Database Layer

> **Goal**: Set up MongoDB Atlas (free tier), create connection singleton, and define all Mongoose schemas/models.

---

## 2.1 MongoDB Atlas Setup

### Step-by-Step
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → Create free account
2. Create a new project named `my-movies`
3. Build a **FREE** M0 cluster:
   - Provider: AWS (or Google Cloud)
   - Region: Choose closest to you (e.g., `ap-south-1` for Sri Lanka)
4. Create a database user with a strong password
5. Configure Network Access:
   - For development: Add your current IP
   - For Vercel deployment: Add `0.0.0.0/0` (allow all — needed for serverless)
6. Get the connection string → paste into `.env.local`

### Free Tier Limits (M0)
| Resource | Limit |
|:---|:---|
| Storage | 512 MB |
| Connections | 500 max concurrent |
| CRUD Rate | ~100 ops/second |
| Clusters | 1 per project |

> [!NOTE]
> 512 MB is more than enough for a personal movie tracker. Even with 10,000 movies stored with full metadata, you'd use roughly 50–100 MB.

---

## 2.2 MongoDB Connection Singleton

### File: `src/lib/mongodb.ts`

Create a cached connection singleton to prevent connection exhaustion in serverless environments (Next.js creates new function instances on each request).

**Pattern:**
```
1. Check if a cached connection exists on `globalThis`
2. If yes → return it immediately
3. If no → create new connection with mongoose.connect()
4. Cache it on `globalThis` for reuse
5. Set bufferCommands: false for serverless compatibility
```

**Key Configuration:**
- `bufferCommands: false` — Fail fast instead of queuing when disconnected
- Connection string from `process.env.MONGODB_URI`
- Throw a clear error if `MONGODB_URI` is not defined

---

## 2.3 Mongoose Schemas

### 2.3.1 User Schema

**File:** `src/models/User.ts`

| Field | Type | Required | Details |
|:---|:---|:---|:---|
| `name` | String | ✅ | Display name |
| `email` | String | ✅ | Unique, lowercase, trimmed |
| `password` | String | ✅ | bcrypt hashed (min 8 chars raw) |
| `avatar` | String | ❌ | Profile image URL |
| `favoriteGenres` | Number[] | ❌ | TMDB genre IDs for better recommendations |
| `createdAt` | Date | Auto | Mongoose timestamps |
| `updatedAt` | Date | Auto | Mongoose timestamps |

**Indexes:**
- `email` — unique index (for login lookups)

**Validations:**
- Email format validation (regex)
- Password minimum length: 8 characters (before hashing)

---

### 2.3.2 WatchedMovie Schema

**File:** `src/models/WatchedMovie.ts`

| Field | Type | Required | Details |
|:---|:---|:---|:---|
| `userId` | ObjectId | ✅ | Reference to User |
| `tmdbId` | Number | ✅ | TMDB movie ID |
| `title` | String | ✅ | Movie title |
| `posterPath` | String | ❌ | TMDB poster path |
| `backdropPath` | String | ❌ | TMDB backdrop path |
| `genres` | Object[] | ✅ | `[{id: number, name: string}]` |
| `releaseDate` | String | ❌ | Release date |
| `overview` | String | ❌ | Movie plot summary |
| `voteAverage` | Number | ❌ | TMDB community rating |
| `runtime` | Number | ❌ | Runtime in minutes |
| `rating` | Number | ❌ | User's personal rating (1–10) |
| `review` | String | ❌ | User's personal notes/review |
| `watchedDate` | Date | ❌ | When the user watched it |
| `isFavorite` | Boolean | Default: false | Mark as personal favorite |
| `createdAt` | Date | Auto | Mongoose timestamps |
| `updatedAt` | Date | Auto | Mongoose timestamps |

**Indexes:**
- `{ userId: 1, tmdbId: 1 }` — compound unique index (prevent duplicates)
- `{ userId: 1, createdAt: -1 }` — for listing user's movies sorted by date
- `{ userId: 1, "genres.id": 1 }` — for genre-based recommendation queries

**Key Design Decision — Denormalization:**
We store movie metadata (title, poster, genres) directly in the document rather than just `tmdbId`. This avoids extra TMDB API calls when listing movies and works offline. The trade-off is slightly more storage, but with free 512 MB, this is negligible.

---

### 2.3.3 WatchlistMovie Schema

**File:** `src/models/WatchlistMovie.ts`

| Field | Type | Required | Details |
|:---|:---|:---|:---|
| `userId` | ObjectId | ✅ | Reference to User |
| `tmdbId` | Number | ✅ | TMDB movie ID |
| `title` | String | ✅ | Movie title |
| `posterPath` | String | ❌ | TMDB poster path |
| `backdropPath` | String | ❌ | TMDB backdrop path |
| `genres` | Object[] | ✅ | `[{id: number, name: string}]` |
| `releaseDate` | String | ❌ | Release date |
| `overview` | String | ❌ | Movie plot summary |
| `voteAverage` | Number | ❌ | TMDB community rating |
| `priority` | String | Default: "medium" | `"high" \| "medium" \| "low"` |
| `addedReason` | String | ❌ | Why user wants to watch it |
| `createdAt` | Date | Auto | Mongoose timestamps |
| `updatedAt` | Date | Auto | Mongoose timestamps |

**Indexes:**
- `{ userId: 1, tmdbId: 1 }` — compound unique index
- `{ userId: 1, priority: 1, createdAt: -1 }` — for sorted watchlist display

---

## 2.4 Zod Validation Schemas

### File: `src/lib/validations.ts`

Create Zod schemas that mirror the Mongoose schemas. These are used to validate data **before** it reaches the database:

**Schemas to create:**
- `signupSchema` — email, password (min 8), name
- `loginSchema` — email, password
- `addWatchedMovieSchema` — tmdbId, rating (optional, 1–10), review (optional)
- `addWatchlistMovieSchema` — tmdbId, priority (optional), addedReason (optional)
- `updateRatingSchema` — rating (1–10)

---

## 2.5 Data Access Layer

### File: `src/actions/watched.ts` (Server Actions)

Create a clean data access layer using Next.js Server Actions:

**Functions to implement:**
- `addToWatched(movieData)` — Add movie to watched list
- `removeFromWatched(tmdbId)` — Remove from watched list
- `getWatchedMovies(options)` — Get paginated list with filters
- `updateMovieRating(tmdbId, rating)` — Update personal rating
- `updateMovieReview(tmdbId, review)` — Update personal review
- `toggleFavorite(tmdbId)` — Toggle favorite status
- `getWatchedStats()` — Get stats (total count, genre breakdown, avg rating)

### File: `src/actions/watchlist.ts` (Server Actions)

- `addToWatchlist(movieData)` — Add movie to watchlist
- `removeFromWatchlist(tmdbId)` — Remove from watchlist
- `getWatchlistMovies(options)` — Get paginated list with filters
- `updatePriority(tmdbId, priority)` — Change priority level
- `moveToWatched(tmdbId)` — Move from watchlist to watched list

---

## 2.6 Database Seeding (Optional)

Create a seed script for development that:
1. Creates a test user
2. Adds sample watched movies with ratings
3. Adds sample watchlist movies

**File:** `scripts/seed.ts`

---

## 2.7 Deliverables Checklist

- [ ] MongoDB Atlas M0 cluster created and configured
- [ ] Connection string added to `.env.local`
- [ ] `src/lib/mongodb.ts` — Connection singleton with caching
- [ ] `src/models/User.ts` — User schema with email index
- [ ] `src/models/WatchedMovie.ts` — Watched movie schema with compound indexes
- [ ] `src/models/WatchlistMovie.ts` — Watchlist schema with compound indexes
- [ ] `src/lib/validations.ts` — Zod validation schemas
- [ ] `src/actions/watched.ts` — Server actions for watched movies
- [ ] `src/actions/watchlist.ts` — Server actions for watchlist
- [ ] Database connection verified from Next.js dev server
- [ ] Git commit: `feat: add MongoDB models and data access layer`

---

## Estimated Time: 2–3 hours
