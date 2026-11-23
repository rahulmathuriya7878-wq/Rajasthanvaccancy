# Rajasthan Vacancy Portal — Safe Full Speedup & Performance Optimization Plan

This plan eliminates the root causes slowing down builds, live preview responsiveness, and AI edits across the portal by pruning over 3,000 lines of unused vacancy data, clearing bloated build caches, optimizing middleware and client-side rendering, and enabling faster module bundling—while keeping every active post, tool, SEO route, and Firebase integration 100% intact.

## User Review & Critical Decisions

> [!IMPORTANT]
> Both speed preferences from your answers are locked in below. Review the plan and click **Proceed** to execute the optimization safely:

- **Confirmed Decision 1 (Target Slowness Areas)**: Optimize all three areas simultaneously—build/restart speed, live preview responsiveness, and AI editing speed.
- **Confirmed Decision 2 (Optimization Level — Safe Full Speedup)**: Remove verified dead data/code, clear stale build cache (243 MB), optimize hot runtime paths (middleware lookups, client storage writes, render memoization, icon barrel imports), and preserve 100% of the existing UI, active posts, Photo & Signature Resize Tool, SEO routes, and Firebase Auth/Firestore rules.

---

## 1. Overview & Core Concept

- **What It Does**: Dramatically reduces the amount of JavaScript and TypeScript parsed on every compile, eliminates main-thread UI stalls during navigation and clicks, and cleans out accumulated build caches so the workspace, preview, and server restarts feel snappy again.
- **Target Audience**: Both site visitors (mobile & desktop candidates browsing vacancies and using the Photo & Signature Resize Tool) and the site owner editing and deploying updates in AI Studio.
- **Key Value**: Faster Next.js dev & production builds, zero lag when tapping posts or presets in the live preview, and significantly faster AI edit cycles because oversized dead data blocks are removed from the workspace.

---

## 2. User Experience & Visual Design

- **Key User Flows (Preserved Identically, Made Faster)**:
  1. **Homepage Discovery**: Instant initial render of the 6-box vacancy grid with memoized category sorting and zero unnecessary re-sorts during scroll or click interactions.
  2. **Post Opening & Navigation**: Clicking any post in the grid, header marquee ticker, or category archive opens immediately without blocking the browser main thread on synchronous full-catalog `localStorage` serialization.
  3. **Photo & Signature Resize Tool**: Continues to load cleanly on its dedicated route without triggering unnecessary homepage catalog processing or middleware overhead.
  4. **Admin & Cloud Sync**: Existing Firebase Auth and Firestore real-time overrides continue to sync seamlessly across devices, while public visitors avoid downloading or processing admin-only directory lookups.
- **Visual Identity & Theme**: Zero visual regressions—retains the exact clean white canvas (`#ffffff`), `#15803d` signature emerald headers, `#0066cc` clean post links, Devanagari/Hindi typography, and responsive mobile layout.
- **Interactive Feedback**: Preserves all existing non-blocking inline toasts, loading fallbacks, and error boundaries while removing frame drops caused by heavy synchronous storage writes and repeated list sorting.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Prune ~3,100 Lines of Dead Vacancy Data**
  - *Chosen Approach*: Remove all ~31 unreferenced legacy vacancy constants, unused exam calendar arrays, and unused tag helper functions from the central catalog while retaining 100% of the active vacancies currently exported into the live portal list.
  - *Why*: The central vacancy catalog is imported across more than 10 routes (homepage, middleware, sitemap, RSS, SEO inspection APIs, footer, and portal state). Cutting ~80% of dead lines speeds up TypeScript typechecking, Turbopack compilation, SSR memory usage, and AI context processing in one safe move.
  - *Alternatives Considered*: Keeping dead vacancies commented out (still bloats files and slows AI edits).
- **Decision 2 — Precomputed O(1) Middleware Lookups & Fast-Path Routing**
  - *Chosen Approach*: Precompute a lightweight lowercase slug-to-ID map once at module startup and immediately fast-path primary routes (`/`, `/photo-signature-resize-tool`, `/sitemap.xml`, `/robots.txt`, `/rss.xml`) instead of re-filtering the entire vacancy array on every incoming HTTP request.
  - *Why*: Eliminates redundant per-request date parsing and array scanning on every navigation and asset check.
  - *Alternatives Considered*: Removing the redirect middleware altogether (would break canonical SEO redirects for legacy slug URLs).
- **Decision 3 — Debounced Client Storage & Render Memoization**
  - *Chosen Approach*: Debounce `localStorage` vacancy persistence (writing asynchronously after brief idle delay instead of synchronously on every click-count update), memoize sorted marquee ticker items in the header, and have the footer read active vacancies from shared context only when admin mode is enabled.
  - *Why*: Prevents main-thread jank when opening posts on mobile and avoids duplicating catalog imports in the footer bundle.
  - *Alternatives Considered*: Disabling offline cache completely (would lose offline post reading support).
- **Decision 4 — Build Cache Reset & Icon Import Optimization**
  - *Chosen Approach*: Clear the stale 243 MB Next.js build/dev cache directory before a clean rebuild, and configure Next.js `optimizePackageImports` for the icon library so dev and production builds only compile icons actually used.
  - *Why*: Reduces dev-server startup time, shrinks disk footprint, and avoids scanning hundreds of unused icon modules.
  - *Alternatives Considered*: Replacing the icon library (unnecessary churn for the same benefit).

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌──────────────────────────────────────────────────────────────────────┐
│                   Next.js Edge/Proxy Fast-Path Layer                 │
│  • Immediate pass-through for /, /photo-signature-resize-tool, SEO   │
│  • Precomputed O(1) Slug Map (computed once, zero per-request scan)  │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  Lean Active Vacancy Catalog (~80% Smaller)          │
│  • Only active posts retained (~3,100+ dead lines removed)           │
│  • Shared across SSR metadata, Sitemap, RSS, and Client State        │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  Optimized Client Portal Runtime                     │
│  • Memoized Header Ticker & Grid Buckets (zero redundant re-sorts)   │
│  • Debounced localStorage Sync (non-blocking main-thread clicks)     │
│  • Shared Context Reuse in Footer (admin-only directory rendering)   │
│  • Next.js optimizePackageImports + Clean Build Cache Reset          │
└──────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - Active vacancy records remain byte-for-byte identical in structure and content; exact active post count before and after cleanup will be verified to confirm zero data loss.
  - Firestore real-time override listeners (`vacancy_overrides`) and Firebase Auth admin permissions remain completely unchanged.
- **Interactive Component & State Mapping**:
  - Clicking any post updates active state immediately, increments click counts in memory, and schedules a debounced background cache save rather than blocking the tap handler.
  - Switching categories, searching, or navigating between `/` and `/photo-signature-resize-tool` executes with memoized selectors and O(1) middleware pass-through.
  - Navigating back/forward or opening shared `/?vacancy=...` links continues to work identically.
- **Verification Plan**:
  - Record active vacancy count before and after pruning to prove zero active posts were lost.
  - Clear stale `.next` cache, run `compile_applet` and `lint_applet` together, and verify strict TypeScript unused checks pass with zero errors.
  - Restart the dev server and verify fast HTTP 200 responses across `/`, `/?vacancy=...`, `/photo-signature-resize-tool`, `/sitemap.xml`, `/robots.txt`, and `/rss.xml`.
