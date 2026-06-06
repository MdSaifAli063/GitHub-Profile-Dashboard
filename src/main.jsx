import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useQuery, useQueries } from '@tanstack/react-query';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiAward, FiBarChart2, FiDownload, FiExternalLink, FiGitBranch, FiGithub, FiHome, FiMoon, FiSearch, FiSettings, FiShare2, FiStar, FiSun, FiUsers } from 'react-icons/fi';
import { fetchProfile } from './services/github';
import { leaderboardProfiles, popularProfiles } from './data/popularProfiles';
import { accountAge, formatNumber, getAchievements, getAnalytics, getInsights, normalizeUrl, scoreRepo } from './utils/analytics';
import './styles.css';

const APP_NAME = 'GitPro Hub';
const APP_TAGLINE = 'GitHub Profile Analytics';
const DEFAULT_USERNAME = 'octocat';
const queryClient = new QueryClient();
const ThemeContext = createContext(null);
const ProfileContext = createContext(null);

function useTheme() {
  return useContext(ThemeContext);
}

function useActiveProfile() {
  return useContext(ProfileContext);
}

function useProfile(username) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username),
    enabled: Boolean(username),
    staleTime: 1000 * 60 * 8,
    retry: 1,
  });
}

function AppShell() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'black');
  const [activeUsername, setActiveUsername] = useState(() => localStorage.getItem('active-username') || DEFAULT_USERNAME);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const selectProfile = useCallback((username) => {
    const clean = (username || DEFAULT_USERNAME).trim().toLowerCase() || DEFAULT_USERNAME;
    setActiveUsername(clean);
    localStorage.setItem('active-username', clean);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ProfileContext.Provider value={{ activeUsername, selectProfile }}>
        <BrowserRouter>
          <div className="app-bg" />
          <TopNav />
          <ActiveProfileBar />
          <main className="app-shell">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/dashboard/:username" element={<DashboardPage />} />
              <Route path="/repositories/:username?" element={<RepositoriesPage />} />
              <Route path="/analytics/:username?" element={<AnalyticsPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/leaderboards" element={<LeaderboardsPage />} />
              <Route path="/achievements/:username?" element={<AchievementsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <SiteFooter />
          <MobileNav />
          <Toaster position="top-right" toastOptions={{ className: 'toast' }} />
        </BrowserRouter>
      </ProfileContext.Provider>
    </ThemeContext.Provider>
  );
}

function saveSearchHistory(username) {
  const clean = username.trim().toLowerCase();
  if (!clean) return;
  const history = JSON.parse(localStorage.getItem('search-history') || '[]');
  localStorage.setItem('search-history', JSON.stringify([clean, ...history.filter((item) => item !== clean)].slice(0, 6)));
}

function TopNav() {
  const { theme, setTheme } = useTheme();
  const { activeUsername } = useActiveProfile();
  return (
    <header className="top-nav">
      <Link to="/" className="brand-mark">
        <span><FiGithub /></span>
        <div>
          <b>{APP_NAME}</b>
          <small>{APP_TAGLINE}</small>
        </div>
      </Link>
      <NavProfileSearch />
      <nav className="desktop-nav">
        <NavLink to={`/dashboard/${activeUsername}`}>Dashboard</NavLink>
        <NavLink to={`/repositories/${activeUsername}`}>Repositories</NavLink>
        <NavLink to={`/analytics/${activeUsername}`}>Analytics</NavLink>
        <NavLink to="/compare">Compare</NavLink>
        <NavLink to="/leaderboards">Leaderboards</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
      <button className="icon-btn" onClick={() => setTheme(theme === 'black' ? 'light' : 'black')} aria-label="Toggle theme">
        {theme === 'black' ? <FiSun /> : <FiMoon />}
      </button>
    </header>
  );
}

function NavProfileSearch() {
  const navigate = useNavigate();
  const { activeUsername, selectProfile } = useActiveProfile();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);

  const history = useMemo(() => JSON.parse(localStorage.getItem('search-history') || '[]'), [open, query]);
  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = [...new Set([...history, ...popularProfiles])];
    if (!needle) return pool.slice(0, 6);
    return pool.filter((name) => name.includes(needle)).slice(0, 6);
  }, [query, history]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  function goToProfile(username) {
    const clean = (username || query).trim().toLowerCase() || DEFAULT_USERNAME;
    selectProfile(clean);
    saveSearchHistory(clean);
    setQuery('');
    setOpen(false);
    navigate(`/dashboard/${clean}`);
    toast.success(`Switched to @${clean}`);
  }

  function submit(event) {
    event.preventDefault();
    if (suggestions[activeIndex]) goToProfile(suggestions[activeIndex]);
    else goToProfile(query);
  }

  function onKeyDown(event) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(suggestions.length, 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + Math.max(suggestions.length, 1)) % Math.max(suggestions.length, 1));
    }
    if (event.key === 'Escape') setOpen(false);
  }

  return (
    <div className="nav-search" ref={rootRef}>
      <form className="nav-search-form" onSubmit={submit}>
        <FiSearch />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={`Search user… (@${activeUsername})`}
          aria-label="Search GitHub username"
          aria-expanded={open}
          aria-controls="nav-search-suggestions"
          autoComplete="off"
        />
        {query && (
          <button type="button" className="nav-search-clear" onClick={() => { setQuery(''); setOpen(true); }} aria-label="Clear search">
            ×
          </button>
        )}
        <button type="submit" className="nav-search-go">Go</button>
      </form>
      {open && (
        <div className="nav-search-dropdown" id="nav-search-suggestions" role="listbox">
          {suggestions.length ? suggestions.map((name, index) => (
            <button
              key={name}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? 'nav-search-item active' : 'nav-search-item'}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => goToProfile(name)}
            >
              <FiGithub />
              <span>{name}</span>
              {name === activeUsername && <em>Current</em>}
              {history.includes(name) && name !== activeUsername && <em>Recent</em>}
            </button>
          )) : (
            <div className="nav-search-empty">Press Enter to analyze “{query.trim() || activeUsername}”</div>
          )}
        </div>
      )}
    </div>
  );
}

function ActiveProfileBar() {
  const location = useLocation();
  const { activeUsername } = useActiveProfile();
  const hidden = ['/', '/settings', '/compare'].includes(location.pathname);

  if (hidden) return null;

  return (
    <div className="active-profile-bar">
      <div className="active-profile-inner">
        <div className="active-profile-meta">
          <span className="active-dot" />
          <strong>Viewing profile</strong>
          <Link to={`/dashboard/${activeUsername}`}>@{activeUsername}</Link>
        </div>
        <div className="active-profile-links">
          <NavLink to={`/dashboard/${activeUsername}`}>Dashboard</NavLink>
          <NavLink to={`/repositories/${activeUsername}`}>Repositories</NavLink>
          <NavLink to={`/analytics/${activeUsername}`}>Analytics</NavLink>
          <NavLink to={`/achievements/${activeUsername}`}>Achievements</NavLink>
        </div>
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <b>{APP_NAME}</b>
          <p>{APP_TAGLINE} — explore, compare, and export GitHub developer insights.</p>
        </div>
        <div className="footer-links">
          <Link to="/search">Search</Link>
          <Link to="/leaderboards">Leaderboards</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/settings">Settings</Link>
        </div>
      </div>
    </footer>
  );
}

function MobileNav() {
  const { activeUsername } = useActiveProfile();
  return (
    <nav className="mobile-nav">
      <NavLink to="/"><FiHome /><span>Home</span></NavLink>
      <NavLink to="/search"><FiSearch /><span>Search</span></NavLink>
      <NavLink to={`/dashboard/${activeUsername}`}><FiBarChart2 /><span>Dash</span></NavLink>
      <NavLink to="/compare"><FiUsers /><span>Compare</span></NavLink>
      <NavLink to="/settings"><FiSettings /><span>Settings</span></NavLink>
    </nav>
  );
}

function Landing() {
  const navigate = useNavigate();
  const { selectProfile } = useActiveProfile();
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [typed, setTyped] = useState('');
  const phrase = 'Analyze profiles. Track contributions. Export shareable GitHub cards.';

  useEffect(() => {
    const id = setInterval(() => setTyped((value) => phrase.slice(0, value.length + 1)), 45);
    return () => clearInterval(id);
  }, []);

  function submit(event) {
    event.preventDefault();
    const clean = username.trim().toLowerCase() || DEFAULT_USERNAME;
    selectProfile(clean);
    saveSearchHistory(clean);
    navigate(`/dashboard/${clean}`);
  }

  return (
    <div className="page">
      <section className="landing-hero">
        <div className="particles"><span /><span /><span /><span /></div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hero-copy">
          <div className="hero-logo"><FiGithub /></div>
          <p className="eyebrow">{APP_NAME} — {APP_TAGLINE}</p>
          <h1>Your GitHub profile, visualized beautifully.</h1>
          <p className="typewriter">{typed}</p>
          <form className="hero-search" onSubmit={submit}>
            <FiSearch />
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Search username..." />
            <button>Analyze</button>
          </form>
          <div className="suggestions">
            {popularProfiles.slice(0, 5).map((name) => (
              <button key={name} onClick={() => { selectProfile(name); navigate(`/dashboard/${name}`); }}>{name}</button>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="feature-grid">
        {[
          ['GitHub Analytics', 'Profile strength, community impact, repository health and growth signals.'],
          ['Contribution Tracking', 'Contribution graph, streak stats, activity trends and active repo analysis.'],
          ['Repository Intelligence', 'Search, filter, sort and inspect public projects with stat cards.'],
          ['AI Insights', 'Deterministic insight engine for stack, influence, quality and growth trajectory.'],
          ['Developer Leaderboards', 'Compare top open-source developers by followers, stars and repository impact.'],
          ['Open Source Impact', 'Stars, forks, watchers, issues, language diversity and achievements.'],
        ].map(([title, text]) => <GlassCard key={title} title={title} text={text} />)}
      </section>

      <section className="stat-band">
        <StatPill label="Profiles analyzed" value="10k+" />
        <StatPill label="Repositories tracked" value="250k+" />
        <StatPill label="Contributions processed" value="1M+" />
        <StatPill label="Languages detected" value="150+" />
      </section>
    </div>
  );
}

function SearchPage() {
  const navigate = useNavigate();
  const { selectProfile } = useActiveProfile();
  const [username, setUsername] = useState('');
  const history = JSON.parse(localStorage.getItem('search-history') || '[]');
  const suggestions = useMemo(() => popularProfiles.filter((name) => name.includes(username.toLowerCase())).slice(0, 6), [username]);

  function submit(event) {
    event.preventDefault();
    const clean = username.trim().toLowerCase() || DEFAULT_USERNAME;
    selectProfile(clean);
    saveSearchHistory(clean);
    navigate(`/dashboard/${clean}`);
  }

  return (
    <div className="page narrow">
      <SectionTitle title="Smart Search" text="Autocomplete, recent profiles, popular developers, keyboard-friendly search states." />
      <form className="search-panel" onSubmit={submit}>
        <FiSearch />
        <input autoFocus value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Type a GitHub username" />
        <button>Search</button>
      </form>
      <div className="split-grid">
        <Panel title="Search Suggestions">{suggestions.map((name) => <QuickLink key={name} label={name} to={`/dashboard/${name}`} />)}</Panel>
        <Panel title="Recent Searches">{history.length ? history.map((name) => <QuickLink key={name} label={name} to={`/dashboard/${name}`} />) : <Empty text="No recent searches yet." />}</Panel>
        <Panel title="Popular Profiles">{popularProfiles.map((name) => <QuickLink key={name} label={name} to={`/dashboard/${name}`} />)}</Panel>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { username = DEFAULT_USERNAME } = useParams();
  const { selectProfile } = useActiveProfile();
  const { data, isLoading, error } = useProfile(username);

  useEffect(() => {
    selectProfile(username);
  }, [username, selectProfile]);

  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} />;

  const { user, repos } = data;
  const analytics = getAnalytics(user, repos);
  const achievements = getAchievements(user, repos, analytics);
  const insights = getInsights(user, repos, analytics);

  return (
    <div className="page">
      <section className="dashboard-hero">
        <ProfileCard user={user} repos={repos} analytics={analytics} achievements={achievements} />
        <div className="hero-panels">
          <Panel title="GitHub Score System">
            <ScoreGrid scores={analytics.scores} />
          </Panel>
          <Panel title="AI Insights Engine">
            <div className="insight-list">{insights.map((insight) => <span key={insight}>{insight}</span>)}</div>
          </Panel>
          <Panel title="Impact Command Center">
            <div className="command-grid">
              <StatPill label="Top language" value={analytics.topLanguage} />
              <StatPill label="Active repos" value={formatNumber(analytics.activeRepos)} />
              <StatPill label="Largest repo" value={analytics.largestRepo?.name || 'None'} />
              <StatPill label="Average size" value={`${analytics.avgRepoSize} KB`} />
            </div>
          </Panel>
        </div>
      </section>

      <section className="metric-grid big">
        <Metric icon={<FiUsers />} label="Followers" value={formatNumber(user.followers)} trend="+12%" />
        <Metric icon={<FiGithub />} label="Repositories" value={formatNumber(user.public_repos)} trend="+8%" />
        <Metric icon={<FiStar />} label="Stars Earned" value={formatNumber(analytics.totalStars)} trend="+18%" />
        <Metric icon={<FiGitBranch />} label="Forks Earned" value={formatNumber(analytics.totalForks)} trend="+7%" />
        <Metric icon={<FiAward />} label="Achievements" value={achievements.filter((item) => item.unlocked).length} trend="live" />
        <Metric icon={<FiBarChart2 />} label="Languages" value={analytics.languages.length} trend="diverse" />
      </section>

      <section className="dashboard-grid">
        <Panel title="🏆 GitHub Trophy Center"><ExternalImage src={`https://github-profile-trophy.vercel.app/?username=${user.login}&theme=onedark&no-frame=true&margin-w=10&row=1`} alt="GitHub trophies" /></Panel>
        <Panel title="📊 GitHub Stats"><div className="image-grid"><ExternalImage src={`https://github-readme-stats.vercel.app/api?username=${user.login}&show_icons=true&theme=transparent&hide_border=true&rank_icon=github&title_color=f8fafc&text_color=94a3b8&icon_color=38bdf8`} alt="GitHub stats" /><ExternalImage src={`https://streak-stats.demolab.com?user=${user.login}&theme=transparent&hide_border=true&ring=38bdf8&fire=f59e0b&currStreakLabel=f8fafc&sideLabels=94a3b8&dates=64748b`} alt="GitHub streak" /></div></Panel>
        <Panel title="📈 Contribution Graph"><ExternalImage src={`https://github-readme-activity-graph.vercel.app/graph?username=${user.login}&theme=react-dark&hide_border=true&area=true`} alt="Contribution graph" /></Panel>
        <Panel title="🔝 Top Contributed Repo">{analytics.topRepo ? <FeaturedRepo repo={analytics.topRepo} /> : <Empty text="No repo data." />}</Panel>
      </section>

      <section className="dashboard-grid two">
        <Panel title="Language Analytics"><LanguageCharts analytics={analytics} /></Panel>
        <Panel title="GitHub Wrapped"><Wrapped user={user} analytics={analytics} /></Panel>
      </section>
    </div>
  );
}

function RepositoriesPage() {
  const params = useParams();
  const { activeUsername, selectProfile } = useActiveProfile();
  const username = (params.username || activeUsername || DEFAULT_USERNAME).toLowerCase();
  const { data, isLoading, error } = useProfile(username);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('all');
  const [sort, setSort] = useState('stars');

  useEffect(() => {
    selectProfile(username);
  }, [username, selectProfile]);

  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} />;

  const analytics = getAnalytics(data.user, data.repos);
  const languages = ['all', ...analytics.languages.map((item) => item.name)];
  const repos = data.repos
    .filter((repo) => repo.name.toLowerCase().includes(search.toLowerCase()))
    .filter((repo) => language === 'all' || repo.language === language)
    .sort((a, b) => sortRepo(a, b, sort));

  return (
    <div className="page">
      <SectionTitle title="Repository Intelligence" text={`Browsing ${data.repos.length} public repositories for @${data.user.login}. Search, filter and sort by stars, forks, activity, size and language.`} />
      <div className="toolbar">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search repositories" />
        <select value={language} onChange={(event) => setLanguage(event.target.value)}>{languages.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="stars">Most starred</option><option value="forks">Most forked</option><option value="updated">Recently updated</option><option value="size">Largest</option></select>
      </div>
      <div className="repo-grid">{repos.length ? repos.map((repo) => <RepoCard repo={repo} key={repo.id} />) : <Panel title="No repositories found"><Empty text="Try changing your search or language filter." /></Panel>}</div>
    </div>
  );
}

function AnalyticsPage() {
  const params = useParams();
  const { activeUsername, selectProfile } = useActiveProfile();
  const username = (params.username || activeUsername || DEFAULT_USERNAME).toLowerCase();
  const { data, isLoading, error } = useProfile(username);

  useEffect(() => {
    selectProfile(username);
  }, [username, selectProfile]);

  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} />;

  const { user, repos } = data;
  const analytics = getAnalytics(user, repos);
  const avgScore = Math.round(analytics.scores.reduce((sum, score) => sum + score.value, 0) / analytics.scores.length);
  const topRepos = repos
    .slice()
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 6)
    .map((repo) => ({
      name: repo.name.length > 14 ? `${repo.name.slice(0, 14)}…` : repo.name,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
    }));

  return (
    <div className="page analytics-page">
      <AnalyticsHero user={user} analytics={analytics} avgScore={avgScore} />

      <section className="analytics-kpi-grid">
        <Metric icon={<FiStar />} label="Total Stars" value={formatNumber(analytics.totalStars)} trend="impact" />
        <Metric icon={<FiGitBranch />} label="Total Forks" value={formatNumber(analytics.totalForks)} trend="reach" />
        <Metric icon={<FiGithub />} label="Public Repos" value={formatNumber(user.public_repos)} trend="projects" />
        <Metric icon={<FiBarChart2 />} label="Active Repos" value={formatNumber(analytics.activeRepos)} trend="90 days" />
        <Metric icon={<FiUsers />} label="Followers" value={formatNumber(user.followers)} trend="community" />
        <Metric icon={<FiAward />} label="Avg Score" value={`${avgScore}/100`} trend="overall" />
      </section>

      <section className="analytics-grid">
        <Panel title="GitHub Score Radar" className="analytics-panel analytics-panel-wide">
          <p className="panel-caption">Six-dimension profile analysis across strength, open source, contribution, community, quality and collaboration.</p>
          <ScoreRadar scores={analytics.scores} height={340} />
          <ScoreBars scores={analytics.scores} />
        </Panel>

        <Panel title="Repository Activity" className="analytics-panel">
          <p className="panel-caption">Repositories updated by month based on public push activity.</p>
          <ActivityChart analytics={analytics} gradientId="analytics-activity" height={300} />
        </Panel>

        <Panel title="Language Distribution" className="analytics-panel">
          <p className="panel-caption">Share of programming languages across public repositories.</p>
          <LanguageBreakdown analytics={analytics} />
        </Panel>

        <Panel title="Top Repositories" className="analytics-panel analytics-panel-wide">
          <p className="panel-caption">Most starred public repositories for @{user.login}.</p>
          <TopReposChart data={topRepos} />
        </Panel>

        <Panel title="Engagement Metrics" className="analytics-panel">
          <p className="panel-caption">Estimated activity signals derived from public GitHub data.</p>
          <AnalyticsMetricGrid analytics={analytics} />
        </Panel>

        <Panel title="Quick Insights" className="analytics-panel">
          <p className="panel-caption">Key takeaways from profile and repository analytics.</p>
          <div className="analytics-insights">
            {getInsights(user, repos, analytics).map((insight) => (
              <div key={insight} className="analytics-insight-item">
                <span className="insight-dot" />
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function ComparePage() {
  const [left, setLeft] = useState('octocat');
  const [right, setRight] = useState('torvalds');
  const results = useQueries({ queries: [left, right].map((name) => ({ queryKey: ['profile', name], queryFn: () => fetchProfile(name), staleTime: 1000 * 60 * 8 })) });
  const loaded = results.every((result) => result.data);

  return (
    <div className="page">
      <SectionTitle title="Developer Comparison Tool" text="Compare followers, repositories, stars, forks, languages and achievements side by side." />
      <div className="toolbar">
        <input value={left} onChange={(event) => setLeft(event.target.value)} />
        <input value={right} onChange={(event) => setRight(event.target.value)} />
      </div>
      {!loaded ? <SkeletonPage compact /> : <div className="compare-grid">{results.map((result) => <CompareCard key={result.data.user.login} profile={result.data} />)}</div>}
    </div>
  );
}

function LeaderboardsPage() {
  const results = useQueries({ queries: leaderboardProfiles.map((name) => ({ queryKey: ['profile', name], queryFn: () => fetchProfile(name), staleTime: 1000 * 60 * 20 })) });
  const profiles = results.filter((result) => result.data).map((result) => {
    const analytics = getAnalytics(result.data.user, result.data.repos);
    return { ...result.data.user, analytics, rankScore: (result.data.user.followers || 0) + analytics.totalStars * 2 + result.data.repos.length * 30 };
  }).sort((a, b) => b.rankScore - a.rankScore);

  return (
    <div className="page narrow">
      <SectionTitle title="Developer Leaderboards" text="Rankings for followers, stars, repositories and open-source impact." />
      <Panel title="Open Source Impact Ranking">
        <div className="leaderboard">{profiles.map((profile, index) => <LeaderboardRow key={profile.login} profile={profile} index={index} />)}</div>
      </Panel>
    </div>
  );
}

function AchievementsPage() {
  const params = useParams();
  const { activeUsername, selectProfile } = useActiveProfile();
  const username = (params.username || activeUsername || DEFAULT_USERNAME).toLowerCase();
  const { data, isLoading, error } = useProfile(username);

  useEffect(() => {
    selectProfile(username);
  }, [username, selectProfile]);

  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} />;
  const analytics = getAnalytics(data.user, data.repos);
  const achievements = getAchievements(data.user, data.repos, analytics);
  return (
    <div className="page">
      <SectionTitle title="Achievement System" text="Animated progress badges for repository creation, community growth, consistency and open-source impact." />
      <div className="achievement-grid">{achievements.map((item) => <AchievementBadge key={item.title} item={item} />)}</div>
    </div>
  );
}

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const themes = ['black', 'light', 'midnight', 'ocean', 'github-dark', 'cyberpunk'];
  return (
    <div className="page narrow">
      <SectionTitle title="Settings" text="Theme persistence, smooth transitions and product-style controls." />
      <Panel title="Theme System">
        <div className="theme-grid">{themes.map((item) => <button className={theme === item ? 'theme-tile active' : 'theme-tile'} key={item} onClick={() => setTheme(item)}>{item}</button>)}</div>
      </Panel>
    </div>
  );
}

function ProfileCard({ user, repos, analytics, achievements }) {
  const navigate = useNavigate();
  return (
    <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="profile-card">
      <img src={user.avatar_url} alt={`${user.login} avatar`} />
      <p className="eyebrow">Developer Profile</p>
      <h2>{user.name || user.login}</h2>
      <span>@{user.login}</span>
      <p>{user.bio || 'No bio provided.'}</p>
      <div className="profile-facts">
        <b>{user.company || 'Independent'}</b>
        <b>{user.location || 'Remote'}</b>
        <b>Joined {new Date(user.created_at).toLocaleDateString()}</b>
        <b>{accountAge(user.created_at)} old</b>
        <b>{user.hireable ? 'Hireable' : 'Not marked hireable'}</b>
      </div>
      <div className="action-row">
        <button onClick={() => copyProfile(user.login)}><FiShare2 /> Share</button>
        <button onClick={() => exportCard(user, repos, analytics, achievements)}><FiDownload /> Export</button>
        <a href={user.html_url} target="_blank" rel="noreferrer"><FiExternalLink /> Follow</a>
      </div>
      {user.blog && <a className="profile-link" href={normalizeUrl(user.blog)} target="_blank" rel="noreferrer">{user.blog}</a>}
      <button className="full-btn" onClick={() => navigate(`/repositories/${user.login}`)}>Explore repositories</button>
    </motion.aside>
  );
}

function ScoreGrid({ scores }) {
  return <div className="score-grid">{scores.map((score) => <CircularScore key={score.name} score={score} />)}</div>;
}

function CircularScore({ score }) {
  return (
    <div className="circle-score" style={{ '--score': `${score.value * 3.6}deg` }}>
      <div><b>{score.value}</b><span>{score.name}</span></div>
    </div>
  );
}

function AnalyticsHero({ user, analytics, avgScore }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="analytics-hero">
      <img src={user.avatar_url} alt={user.login} />
      <div>
        <p className="eyebrow">Analytics Dashboard</p>
        <h1>{user.name || user.login}</h1>
        <span>@{user.login} · {analytics.languages.length} languages · {formatNumber(analytics.totalStars)} stars</span>
      </div>
      <div className="analytics-hero-score">
        <b>{avgScore}</b>
        <small>Overall Score</small>
      </div>
    </motion.section>
  );
}

function ScoreBars({ scores }) {
  return (
    <div className="score-bars">
      {scores.map((score) => (
        <div key={score.name} className="score-bar-row">
          <div className="score-bar-head">
            <span>{score.name}</span>
            <strong>{score.value}/100</strong>
          </div>
          <div className="score-bar-track">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${score.value}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ '--bar-color': score.value >= 70 ? 'var(--accent)' : score.value >= 40 ? 'var(--primary)' : 'var(--gold)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function LanguageBreakdown({ analytics }) {
  const languages = analytics.languages.slice(0, 8);
  if (!languages.length) return <Empty text="No language data available for this profile." />;

  return (
    <div className="language-breakdown">
      <LanguagePie analytics={analytics} height={240} innerRadius={52} outerRadius={88} />
      <div className="language-legend">
        {languages.map((lang) => (
          <div key={lang.name} className="language-legend-row">
            <span className="language-swatch" style={{ background: lang.color }} />
            <span className="language-name">{lang.name}</span>
            <strong>{lang.percent}%</strong>
            <em>{lang.count} repos</em>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopReposChart({ data }) {
  if (!data.length) return <Empty text="No public repositories to chart yet." />;

  return (
    <div className="chart-box chart-box-tall">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} barGap={8} barCategoryGap="18%">
          <defs>
            <linearGradient id="starsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id="forksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#0891b2" stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="stars" name="Stars" fill="url(#starsGradient)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="forks" name="Forks" fill="url(#forksGradient)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AnalyticsMetricGrid({ analytics }) {
  const items = [
    ['Gists', analytics.totalGists, FiGithub],
    ['Watchers', analytics.watchers, FiUsers],
    ['Open Issues', analytics.issues, FiGitBranch],
    ['Commits', analytics.commits, FiBarChart2],
    ['Pull Requests', analytics.pullRequests, FiGitBranch],
    ['Releases', analytics.releases, FiStar],
    ['Avg Repo Size', `${analytics.avgRepoSize} KB`, FiGithub],
    ['Top Language', analytics.topLanguage, FiAward],
  ];

  return (
    <div className="analytics-metric-grid">
      {items.map(([label, value, Icon]) => (
        <div key={label} className="analytics-metric-item">
          <span><Icon /></span>
          <div>
            <small>{label}</small>
            <b>{typeof value === 'number' ? formatNumber(value) : value}</b>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const title = label || payload[0]?.payload?.name || payload[0]?.name;
  return (
    <div className="chart-tooltip">
      {title && <strong>{title}</strong>}
      {payload.map((entry) => (
        <span key={`${entry.name}-${entry.dataKey}`} style={{ color: entry.color || 'var(--primary)' }}>
          {entry.name}: {formatNumber(entry.value)}
        </span>
      ))}
    </div>
  );
}
function LanguageCharts({ analytics }) {
  return (
    <div className="chart-stack">
      <LanguagePie analytics={analytics} />
      <ActivityChart analytics={analytics} />
    </div>
  );
}

function LanguagePie({ analytics, height = 260, innerRadius = 60, outerRadius = 95 }) {
  const languages = analytics.languages.slice(0, 8);
  if (!languages.length) return null;

  return (
    <div className="chart-box" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={languages} dataKey="count" nameKey="name" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={3}>
            {languages.map((item) => <Cell key={item.name} fill={item.color} stroke="transparent" />)}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ActivityChart({ analytics, gradientId = 'activity', height = 260 }) {
  const data = analytics.updatedMonths.length ? analytics.updatedMonths : [{ month: 'N/A', repos: 0 }];

  return (
    <div className="chart-box" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.75} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="repos" name="Repos updated" stroke="#a855f7" strokeWidth={3} fill={`url(#${gradientId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScoreRadar({ scores, height = 360 }) {
  return (
    <div className="chart-box" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={scores} outerRadius="72%">
          <PolarGrid stroke="var(--line)" />
          <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} />
          <Radar dataKey="value" name="Score" stroke="#14b8a6" fill="#a855f7" fillOpacity={0.28} strokeWidth={2} />
          <Tooltip content={<ChartTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Wrapped({ user, analytics }) {
  return (
    <div className="wrapped-grid">
      <StatPill label="Total contributions" value={formatNumber(analytics.commits)} />
      <StatPill label="Most active signal" value={analytics.updatedMonths.sort((a, b) => b.repos - a.repos)[0]?.month || 'N/A'} />
      <StatPill label="Top repository" value={analytics.topRepo?.name || 'None'} />
      <StatPill label="Most used language" value={analytics.topLanguage} />
      <StatPill label="Biggest achievement" value={analytics.totalStars >= 100 ? 'Star Collector' : 'Builder'} />
      <StatPill label="Community impact" value={formatNumber(user.followers)} />
    </div>
  );
}

function MetricTable({ analytics }) {
  return (
    <div className="metric-table">
      {[
        ['Gists', analytics.totalGists],
        ['Watchers', analytics.watchers],
        ['Organizations', analytics.organizations],
        ['Commits', analytics.commits],
        ['Pull Requests', analytics.pullRequests],
        ['Issues', analytics.issues],
        ['Releases', analytics.releases],
      ].map(([label, value]) => <StatPill key={label} label={label} value={formatNumber(value)} />)}
    </div>
  );
}

function CompareCard({ profile }) {
  const analytics = getAnalytics(profile.user, profile.repos);
  return (
    <Panel title={profile.user.login}>
      <div className="compare-card">
        <img src={profile.user.avatar_url} alt={profile.user.login} />
        <h3>{profile.user.name || profile.user.login}</h3>
        <Metric icon={<FiUsers />} label="Followers" value={formatNumber(profile.user.followers)} />
        <Metric icon={<FiGithub />} label="Repos" value={formatNumber(profile.user.public_repos)} />
        <Metric icon={<FiStar />} label="Stars" value={formatNumber(analytics.totalStars)} />
        <Metric icon={<FiBarChart2 />} label="Top Lang" value={analytics.topLanguage} />
      </div>
    </Panel>
  );
}

function LeaderboardRow({ profile, index }) {
  return (
    <div className="leaderboard-row">
      <b>#{index + 1}</b>
      <img src={profile.avatar_url} alt={profile.login} />
      <Link to={`/dashboard/${profile.login}`}>{profile.login}</Link>
      <span>{formatNumber(profile.followers)} followers</span>
      <span>{formatNumber(profile.analytics.totalStars)} stars</span>
      <strong>{formatNumber(profile.rankScore)}</strong>
    </div>
  );
}

function AchievementBadge({ item }) {
  return (
    <motion.div whileHover={{ y: -4 }} className={item.unlocked ? 'achievement unlocked' : 'achievement'}>
      <FiAward />
      <h3>{item.title}</h3>
      <p>{item.unlocked ? 'Unlocked' : 'Locked'}</p>
      <div className="progress"><span style={{ width: `${(item.progress / item.target) * 100}%` }} /></div>
      <small>{formatNumber(item.progress)} / {formatNumber(item.target)}</small>
    </motion.div>
  );
}

function RepoCard({ repo }) {
  return (
    <motion.article whileHover={{ y: -5 }} className="repo-card">
      <div>
        <a href={repo.html_url} target="_blank" rel="noreferrer">{repo.name}</a>
        <p>{repo.description || 'No description provided.'}</p>
      </div>
      <div className="topic-row">{(repo.topics || []).slice(0, 4).map((topic) => <span key={topic}>{topic}</span>)}</div>
      <div className="repo-meta">
        <span>{repo.stargazers_count || 0} stars</span>
        <span>{repo.forks_count || 0} forks</span>
        <span>{repo.language || 'Code'}</span>
        <span>{Math.round((repo.size || 0) / 1024)} MB</span>
        <span>{repo.license?.spdx_id || 'No license'}</span>
        <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
      </div>
    </motion.article>
  );
}

function FeaturedRepo({ repo }) {
  return (
    <article className="featured-repo">
      <a href={repo.html_url} target="_blank" rel="noreferrer">{repo.name}</a>
      <p>{repo.description || 'No description provided.'}</p>
      <div className="repo-meta">
        <span>{repo.stargazers_count || 0} stars</span>
        <span>{repo.forks_count || 0} forks</span>
        <span>{repo.language || 'Code'}</span>
        <span>Score {scoreRepo(repo)}</span>
      </div>
    </article>
  );
}

function Metric({ icon, label, value, trend }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="metric-card">
      <span className="metric-icon">{icon}</span>
      <small>{label}</small>
      <b>{value}</b>
      {trend && <em>{trend}</em>}
    </motion.div>
  );
}

function Panel({ title, children, className = '' }) {
  return <section className={className ? `panel ${className}` : 'panel'}><h2>{title}</h2>{children}</section>;
}

function GlassCard({ title, text }) {
  return <motion.article whileHover={{ y: -5 }} className="glass-card"><h3>{title}</h3><p>{text}</p></motion.article>;
}

function StatPill({ label, value }) {
  return <div className="stat-pill"><span>{label}</span><b>{value}</b></div>;
}

function QuickLink({ label, to }) {
  return <Link className="quick-link" to={to}>{label}</Link>;
}

function SectionTitle({ title, text }) {
  return <header className="section-title"><p className="eyebrow">{APP_NAME}</p><h1>{title}</h1><span>{text}</span></header>;
}

function ExternalImage({ src, alt }) {
  return <img className="external-image" src={src} alt={alt} loading="lazy" />;
}

function SkeletonPage({ compact = false }) {
  return <div className={compact ? 'skeleton compact' : 'page skeleton'}><span /><span /><span /></div>;
}

function ErrorState({ error }) {
  return <div className="page narrow"><Panel title="Unable to load profile"><p className="empty">{error?.response?.status === 403 ? 'GitHub rate limit reached. Please try again later.' : error.message}</p></Panel></div>;
}

function Empty({ text }) {
  return <p className="empty">{text}</p>;
}

function sortRepo(a, b, sort) {
  if (sort === 'forks') return (b.forks_count || 0) - (a.forks_count || 0);
  if (sort === 'updated') return new Date(b.updated_at) - new Date(a.updated_at);
  if (sort === 'size') return (b.size || 0) - (a.size || 0);
  return (b.stargazers_count || 0) - (a.stargazers_count || 0);
}

function copyProfile(login) {
  navigator.clipboard?.writeText(`${window.location.origin}/dashboard/${login}`);
  toast.success('Profile link copied');
}

async function exportCard(user, repos, analytics, achievements) {
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = 1280 * scale;
  canvas.height = 820 * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  const gradient = ctx.createLinearGradient(0, 0, 1280, 820);
  gradient.addColorStop(0, '#020617');
  gradient.addColorStop(0.55, '#0f172a');
  gradient.addColorStop(1, '#0f766e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1280, 820);
  ctx.fillStyle = 'rgba(255,255,255,.94)';
  round(ctx, 58, 54, 1164, 712, 32);
  ctx.fill();
  try {
    const image = await loadImage(`${user.avatar_url}&s=320`);
    round(ctx, 98, 98, 178, 178, 22);
    ctx.save();
    ctx.clip();
    ctx.drawImage(image, 98, 98, 178, 178);
    ctx.restore();
  } catch {
    ctx.fillStyle = '#dbeafe';
    round(ctx, 98, 98, 178, 178, 22);
    ctx.fill();
  }
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 54px Arial';
  ctx.fillText(user.name || user.login, 316, 142);
  ctx.fillStyle = '#2563eb';
  ctx.font = '700 28px Arial';
  ctx.fillText(`@${user.login}`, 318, 190);
  ctx.fillStyle = '#475569';
  ctx.font = '400 24px Arial';
  wrap(ctx, user.bio || `${APP_NAME} — GitHub profile analytics card.`, 318, 236, 780, 34, 3);
  [['Followers', user.followers], ['Repos', user.public_repos], ['Stars', analytics.totalStars], ['Forks', analytics.totalForks], ['Top Lang', analytics.topLanguage], ['Achievements', achievements.filter((a) => a.unlocked).length]].forEach(([label, value], index) => {
    const x = 98 + (index % 3) * 370;
    const y = 344 + Math.floor(index / 3) * 112;
    ctx.fillStyle = index % 2 ? '#ecfdf5' : '#eff6ff';
    round(ctx, x, y, 320, 84, 18);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 30px Arial';
    ctx.fillText(formatNumber(value), x + 22, y + 38);
    ctx.fillStyle = '#64748b';
    ctx.font = '700 17px Arial';
    ctx.fillText(label, x + 22, y + 64);
  });
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 30px Arial';
  ctx.fillText('Top Contributed Repo', 98, 618);
  ctx.fillStyle = '#2563eb';
  ctx.font = '800 26px Arial';
  ctx.fillText(analytics.topRepo?.name || 'No public repository yet', 98, 656);
  ctx.fillStyle = '#475569';
  ctx.font = '600 20px Arial';
  wrap(ctx, getInsights(user, repos, analytics).join('  •  '), 98, 694, 1000, 28, 2);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${user.login}-gitpro-hub-card.png`;
  link.click();
  toast.success('Profile card downloaded');
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function round(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrap(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
}

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AppShell />
  </QueryClientProvider>,
);
