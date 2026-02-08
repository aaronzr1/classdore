# Classdore

Course search app for Vanderbilt University. Students can search and filter courses with fast, full-text search powered by RediSearch, and add them to their YES cart.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Frontend:** React 19, Tailwind CSS 4, Radix UI, react-window
- **Backend:** Next.js API routes, Redis (RediSearch)
- **Analytics:** Vercel Analytics

## Setup

```bash
bun install
```

Create a `.env` file with your Redis connection:

```
REDIS_URL=redis://...
REDIS_PASSWORD=...
REDIS_HOST=...
REDIS_PORT=...
```

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── courses/         # Course listing + search endpoints
│   │   ├── departments/     # Department filter endpoint
│   │   └── schools/         # School filter endpoint
│   ├── page.tsx             # Home (course browser)
│   └── layout.tsx           # Root layout + providers
├── components/
│   ├── ui/                  # Shadcn/ui primitives (button, dialog, input, select)
│   ├── course-browser.tsx   # Main course browser orchestrator
│   ├── search-bar.tsx       # Search input + department/school filters
│   ├── landing.tsx          # Landing page with search + welcome section
│   ├── course-list.tsx      # Virtualized course list
│   ├── course-dialog.tsx    # Course info modal
│   ├── empty-state.tsx      # Empty results placeholder
│   └── index.ts             # Barrel exports
└── lib/
    ├── types.ts             # Core TypeScript interfaces
    ├── yes-links.ts         # YES cart URL generation
    ├── redis-service.ts     # Redis/RediSearch client + queries
    ├── utils.tsx            # Query parsing, sanitization, toast helpers
    ├── use-debounce.ts      # Debounce hook
    └── use-sticky.ts        # Intersection observer sticky detection hook
```

## Key Concepts

**Course search:** Server-side RediSearch for indexed full-text queries with department/school filters and course code prefix detection. The search bar supports natural queries (e.g. "travel class") as well as structured patterns (e.g. "ECON 3").

**YES integration:** Courses link directly to Vanderbilt's YES system for cart/registration actions.
