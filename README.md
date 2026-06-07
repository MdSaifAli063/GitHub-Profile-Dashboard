# GitPro Hub

**GitHub Profile Analytics Dashboard**

GitPro Hub is a modern React application that turns any public GitHub profile into a rich analytics dashboard. Search a username, explore scores and charts, compare developers, browse leaderboards, unlock achievements, and export a shareable profile card — all from the browser.

---


## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Routes](#routes)
- [Pages Overview](#pages-overview)
- [Scoring System](#scoring-system)
- [Achievements](#achievements)
- [Themes](#themes)
- [Project Structure](#project-structure)
- [External Services](#external-services)
- [Data & Limitations](#data--limitations)
- [Deployment](#deployment)
- [License](#license)

---


## Features

### Landing Page (`/`)
- Animated hero with typewriter tagline
- Quick username search with one-click popular profile suggestions
- Feature cards highlighting analytics, contributions, repositories, insights, rankings, and open-source impact
- Product stat band (profiles, repos, contributions, languages)

### Smart Search (`/search`)
- Live autocomplete against a curated list of popular developers
- Recent search history stored in `localStorage` (last 6 usernames)
- Quick links to popular profiles

### Profile Dashboard (`/dashboard/:username`)
- Full profile card: avatar, bio, company, location, join date, account age, hireable status, blog link
- **Share** — copies a direct dashboard URL to clipboard
- **Export** — downloads a high-resolution PNG card (`{username}-gitpro-hub-card.png`) generated with Canvas
- **Follow** — opens the GitHub profile in a new tab
- GitHub Score System with six circular score rings
- AI-style insights engine (deterministic, based on public data)
- Impact command center: top language, active repos, largest repo, average size
- Metric cards: followers, repositories, stars, forks, achievements, languages
- Embedded third-party cards: GitHub trophies, readme stats, streak stats, contribution graph
- Top contributed repository highlight
- Language analytics charts and GitHub Wrapped summary cards

### Repository Intelligence (`/repositories/:username?`)
- Search repositories by name
- Filter by programming language
- Sort by stars, forks, last updated, or size
- Repo cards with topics, stars, forks, language, size, license, and update date

### Analytics Dashboard (`/analytics/:username?`)
- Score radar chart (Recharts)
- Repository activity area chart (updates by month)
- Language donut chart
- Metric table: gists, watchers, organizations, commits, pull requests, issues, releases

### Developer Comparison (`/compare`)
- Side-by-side comparison of two GitHub usernames (default: `octocat` vs `torvalds`)
- Followers, repos, stars, and top language for each developer

### Leaderboards (`/leaderboards`)
- Ranks curated developers by a composite score:
  `followers + (totalStars × 2) + (repoCount × 30)`
- Shows followers, stars, and rank score per profile

### Achievements (`/achievements/:username?`)
- Six unlockable badges with progress bars:
  - Repository Creator
  - Open Source Hero
  - Community Builder
  - Consistency Champion
  - Code Warrior
  - Star Collector

### Settings (`/settings`)
- Six themes with persistence via `localStorage`
- Quick light/dark toggle in the top navigation

### UI & UX
- Responsive layout with desktop top nav and mobile bottom nav
- Skeleton loading states and friendly error messages (including GitHub rate-limit handling)
- Framer Motion animations on cards, metrics, and achievements
- Toast notifications via React Hot Toast
- Glassmorphism styling with CSS variables

---


## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, JavaScript (JSX) |
| Build | Vite 7 |
| Routing | React Router 7 |
| Data fetching | TanStack Query 5, Axios |
| Charts | Recharts 3 |
| Animation | Framer Motion 12 |
| Icons | React Icons (Feather) |
| Notifications | React Hot Toast |
| Styling | CSS variables, glassmorphism, responsive grid |
| API | GitHub REST API v3 |

---


## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd "Github Profile Dashboard"

# Install dependencies
npm install
```

### Run locally

```bash
npm run dev
```

Open the app at:

```text
http://127.0.0.1:5173
```

Try a profile directly:

```text
http://127.0.0.1:5173/dashboard/octocat
```

### Production build

```bash
npm run build
npm run preview
```

Preview runs at `http://127.0.0.1:4173` by default.

---


## Environment Variables

GitPro Hub works without authentication, but GitHub limits unauthenticated requests to **60 per hour**. Adding a token raises the limit to **5,000 per hour**.

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Create a token at [github.com/settings/tokens](https://github.com/settings/tokens) (classic token with `public_repo` scope is sufficient for public profile data).

3. Add it to `.env`:

```env
VITE_GITHUB_TOKEN=your_github_token_here
```

4. Restart the dev server.

> **Note:** Never commit `.env` to version control. It is already listed in `.gitignore`.

---


## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on `127.0.0.1:5173` |
| `npm run build` | Build optimized production assets to `dist/` |
| `npm run preview` | Serve the production build locally |

---


## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero search |
| `/search` | Smart search with history and suggestions |
| `/dashboard/:username` | Main profile analytics dashboard |
| `/repositories/:username?` | Repository browser (defaults to `octocat`) |
| `/analytics/:username?` | Charts and metrics dashboard |
| `/compare` | Two-developer side-by-side comparison |
| `/leaderboards` | Open-source impact rankings |
| `/achievements/:username?` | Achievement badges and progress |
| `/settings` | Theme picker |

---


## Pages Overview

```text
┌─────────────────────────────────────────────────────────┐
│  Landing / Search  →  Dashboard  →  Repos / Analytics   │
│                              ↓                          │
│         Compare  ←  Leaderboards  →  Achievements       │
│                              ↓                          │
│                         Settings                        │
└─────────────────────────────────────────────────────────┘
```

**Default username:** `octocat` (used when no username is provided on optional routes)

**Cached profiles:** TanStack Query caches profile data for 8 minutes; leaderboard data for 20 minutes.

---


## Scoring System

GitPro Hub computes six scores (0–100) from public GitHub REST data:

| Score | Based on |
|-------|----------|
| **Profile Strength** | Bio, blog, location, followers, repo count |
| **Open Source** | Total stars, forks, recently active repos |
| **Contribution** | Active repos (last 90 days), total repos |
| **Community** | Followers, watchers across repos |
| **Repository Quality** | Descriptions, stars, language diversity |
| **Collaboration** | Forks, open issues, active repos |

Repository ranking uses a weighted formula: stars × 3 + forks × 2 + watchers + description bonus.

---


## Achievements

| Badge | Unlock condition | Target |
|-------|------------------|--------|
| Repository Creator | At least 1 public repo | 20 repos |
| Open Source Hero | 100+ total stars | 100 stars |
| Community Builder | 100+ followers | 100 followers |
| Consistency Champion | 5+ active repos (90 days) | 5 repos |
| Code Warrior | 50+ public repos | 50 repos |
| Star Collector | 500+ total stars | 500 stars |

---


## Themes

Six themes are available in **Settings** and persisted in `localStorage`:

| Theme | Style |
|-------|-------|
| `black` | Default dark theme |
| `light` | Light mode |
| `midnight` | Deep blue dark |
| `ocean` | Teal / ocean tones |
| `github-dark` | GitHub-inspired dark |
| `cyberpunk` | Neon accent dark |

The top navigation also provides a quick toggle between `black` and `light`.

---


## Project Structure

```text
.
├── index.html              # Vite entry HTML
├── package.json
├── .env.example            # GitHub token template
├── .gitignore
├── README.md
│
├── src/
│   ├── main.jsx            # App shell, routes, pages, UI components
│   ├── styles.css          # Global styles, themes, responsive layout
│   ├── data/
│   │   └── popularProfiles.js   # Popular & leaderboard usernames
│   ├── services/
│   │   └── github.js       # GitHub REST API client (Axios)
│   └── utils/
│       └── analytics.js    # Scores, achievements, insights, formatting
│
├── card.html               # Legacy static reference page
├── card.css
└── card.js
```

The active application lives in `src/`. The `card.html` / `card.css` / `card.js` files are a standalone static prototype kept for reference.

---


## External Services

### GitHub REST API

- `GET /users/{username}` — profile data
- `GET /users/{username}/repos?per_page=100&sort=updated` — public repositories

### Third-party embed cards

| Service | Used for |
|---------|----------|
| [github-profile-trophy](https://github-profile-trophy.vercel.app) | GitHub trophy badges |
| [github-readme-stats](https://github-readme-stats.vercel.app) | Stats card |
| [streak-stats.demolab.com](https://streak-stats.demolab.com) | Contribution streak |
| [github-readme-activity-graph](https://github-readme-activity-graph.vercel.app) | Contribution graph |

These cards are loaded as external images and may occasionally be slow or unavailable due to third-party rate limits.

---


## Data & Limitations

- **Public data only** — private repos and private profile fields are not accessible without appropriate scopes.
- **Rate limits** — unauthenticated API calls are capped at 60/hour per IP. Use `VITE_GITHUB_TOKEN` for higher limits.
- **Estimated metrics** — commits, pull requests, organizations, and some trend percentages are derived or estimated from public REST data, not live GitHub GraphQL queries.
- **Repo cap** — up to 100 repositories are fetched per user (`per_page=100`).
- **No backend** — all processing and card export happen in the browser; no server-side storage.
- **Leaderboard scope** — rankings use a fixed list of well-known developers defined in `popularProfiles.js`.

---


## Deployment

GitPro Hub is a static Vite SPA and deploys easily to:

- **Vercel** — connect repo, set `VITE_GITHUB_TOKEN` in project env vars, deploy
- **Netlify** — same env var setup
- **GitHub Pages** — run `npm run build` and publish the `dist/` folder

For client-side routing, configure your host to redirect all routes to `index.html` (SPA fallback).

---


## License

Open source — available for personal and commercial use.
