# GitLens Pro - Premium GitHub Analytics Dashboard

GitLens Pro is a premium React + JavaScript GitHub analytics platform. It turns any public GitHub profile into a SaaS-style dashboard with profile intelligence, repository analytics, score systems, charts, achievements, comparison tools, leaderboards, themes, and downloadable profile cards.

## Highlights

- Premium landing page with animated hero, search suggestions, feature cards, and product metrics
- Smart search with popular profiles and persisted recent searches
- Profile dashboard with avatar, bio, company, location, joined date, account age, hireable status, links, share, follow, and export actions
- Custom GitHub score system for profile strength, open source impact, contribution, community, repository quality, and collaboration
- Analytics cards for followers, repositories, stars, forks, achievements, languages, gists, watchers, issues, PR estimates, commits, and releases
- GitHub trophies, GitHub stats cards, streak card, contribution graph, and top contributed repository
- Repository intelligence with search, language filter, sorting, topics, stars, forks, license, size, and update date
- Interactive charts powered by Recharts: donut charts, area charts, radar charts, and trend panels
- AI-style insights engine for strongest stack, best repo, activity, impact, and language diversity
- GitHub Wrapped storytelling cards
- Achievement system with locked/unlocked badges and progress bars
- Developer comparison tool
- Developer leaderboard
- Theme system with persistence: light, midnight, ocean, GitHub dark, and cyberpunk
- Mobile bottom navigation and responsive SaaS UI
- Premium PNG profile card export


## Tech Stack

- React 19
- JavaScript
- Vite
- React Router
- TanStack Query
- Axios
- Framer Motion
- Recharts
- React Icons
- React Hot Toast
- CSS variables and glassmorphism styling
- GitHub REST API

## Routes

```text
/
/search
/dashboard/:username
/repositories/:username?
/analytics/:username?
/compare
/leaderboards
/achievements/:username?
/settings
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

Build for production:

```bash
npm run build
```

Preview production output:

```bash
npm run preview
```

## Project Structure

```text
.
├── index.html
├── package.json
├── package-lock.json
├── src/
│   ├── data/
│   │   └── popularProfiles.js
│   ├── services/
│   │   └── github.js
│   ├── utils/
│   │   └── analytics.js
│   ├── main.jsx
│   └── styles.css
├── card.html
├── card.css
├── card.js
└── README.md
```

The active app is the React/Vite app inside `src/`. The old static HTML/CSS/JS files are kept only as reference.

## External Services

The app uses:

- `https://api.github.com/users/{username}`
- `https://api.github.com/users/{username}/repos`
- `https://github-profile-trophy.vercel.app`
- `https://github-readme-stats.vercel.app`
- `https://streak-stats.demolab.com`
- `https://github-readme-activity-graph.vercel.app`

Some visual cards are served by third-party public services, so they may occasionally load slowly or hit their own limits.

## Notes

- GitHub API calls are unauthenticated, so GitHub rate limits may apply.
- Commits, pull requests, releases, organizations, and some trend values are estimated from public REST data.
- The downloadable card is generated in the browser with Canvas.
- GitHub GraphQL is listed in the product vision, but this implementation uses REST API data so it can work without requiring a personal access token.

## Deployment

This Vite app can be deployed to Vercel, Netlify, or GitHub Pages.

## License

Open source and available for personal or commercial use.
