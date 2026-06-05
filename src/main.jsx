import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useQuery, useQueries } from '@tanstack/react-query';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiAward, FiBarChart2, FiDownload, FiExternalLink, FiGitBranch, FiGithub, FiHome, FiMoon, FiSearch, FiSettings, FiShare2, FiStar, FiSun, FiUsers } from 'react-icons/fi';
import { fetchProfile } from './services/github';
import { leaderboardProfiles, popularProfiles } from './data/popularProfiles';
import { accountAge, formatNumber, getAchievements, getAnalytics, getInsights, normalizeUrl, scoreRepo } from './utils/analytics';
import './styles.css';

const DEFAULT_USERNAME = 'octocat';
const queryClient = new QueryClient();
const ThemeContext = createContext(null);

function useTheme() {
  return useContext(ThemeContext);
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <BrowserRouter>
        <div className="app-bg" />
        <TopNav />
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
        <MobileNav />
        <Toaster position="top-right" toastOptions={{ className: 'toast' }} />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

function TopNav() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="top-nav">
      <Link to="/" className="brand-mark">
        <span><FiGithub /></span>
        <div>
          <b>GitLens Pro</b>
          <small>AI GitHub Analytics</small>
        </div>
      </Link>
      <nav className="desktop-nav">
        <NavLink to="/search">Search</NavLink>
        <NavLink to={`/dashboard/${DEFAULT_USERNAME}`}>Dashboard</NavLink>
        <NavLink to={`/repositories/${DEFAULT_USERNAME}`}>Repositories</NavLink>
        <NavLink to={`/analytics/${DEFAULT_USERNAME}`}>Analytics</NavLink>
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

function MobileNav() {
  return (
    <nav className="mobile-nav">
      <NavLink to="/"><FiHome /><span>Home</span></NavLink>
      <NavLink to="/search"><FiSearch /><span>Search</span></NavLink>
      <NavLink to={`/dashboard/${DEFAULT_USERNAME}`}><FiBarChart2 /><span>Dash</span></NavLink>
      <NavLink to="/compare"><FiUsers /><span>Compare</span></NavLink>
      <NavLink to="/settings"><FiSettings /><span>Settings</span></NavLink>
    </nav>
  );
}

function Landing() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [typed, setTyped] = useState('');
  const phrase = 'Analyze developers. Rank impact. Export premium GitHub cards.';

  useEffect(() => {
    const id = setInterval(() => setTyped((value) => phrase.slice(0, value.length + 1)), 45);
    return () => clearInterval(id);
  }, []);

  function submit(event) {
    event.preventDefault();
    navigate(`/dashboard/${username.trim() || DEFAULT_USERNAME}`);
  }

  return (
    <div className="page">
      <section className="landing-hero">
        <div className="particles"><span /><span /><span /><span /></div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hero-copy">
          <div className="hero-logo"><FiGithub /></div>
          <p className="eyebrow">Premium SaaS GitHub Intelligence</p>
          <h1>World-class GitHub analytics for modern developers.</h1>
          <p className="typewriter">{typed}</p>
          <form className="hero-search" onSubmit={submit}>
            <FiSearch />
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Search username..." />
            <button>Analyze</button>
          </form>
          <div className="suggestions">
            {popularProfiles.slice(0, 5).map((name) => <button key={name} onClick={() => navigate(`/dashboard/${name}`)}>{name}</button>)}
          </div>
        </motion.div>
      </section>

      <section className="feature-grid">
        {[
          ['GitHub Analytics', 'Profile strength, community impact, repository health and growth signals.'],
          ['Contribution Tracking', 'Contribution graph, streak stats, activity trends and active repo analysis.'],
          ['Repository Intelligence', 'Search, filter, sort and inspect public projects with premium cards.'],
          ['AI Insights', 'Deterministic insight engine for stack, influence, quality and growth trajectory.'],
          ['Developer Ranking', 'Leaderboard-ready scoring for followers, stars, repos and open-source impact.'],
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
  const [username, setUsername] = useState('');
  const history = JSON.parse(localStorage.getItem('search-history') || '[]');
  const suggestions = useMemo(() => popularProfiles.filter((name) => name.includes(username.toLowerCase())).slice(0, 6), [username]);

  function submit(event) {
    event.preventDefault();
    const clean = username.trim() || DEFAULT_USERNAME;
    localStorage.setItem('search-history', JSON.stringify([clean, ...history.filter((item) => item !== clean)].slice(0, 6)));
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
  const { data, isLoading, error } = useProfile(username);
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
  const username = params.username || DEFAULT_USERNAME;
  const { data, isLoading, error } = useProfile(username);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('all');
  const [sort, setSort] = useState('stars');
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
      <SectionTitle title="Repository Intelligence" text="Search, filter and sort repositories by stars, forks, activity, size and language." />
      <div className="toolbar">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search repositories" />
        <select value={language} onChange={(event) => setLanguage(event.target.value)}>{languages.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="stars">Most starred</option><option value="forks">Most forked</option><option value="updated">Recently updated</option><option value="size">Largest</option></select>
      </div>
      <div className="repo-grid">{repos.map((repo) => <RepoCard repo={repo} key={repo.id} />)}</div>
    </div>
  );
}

function AnalyticsPage() {
  const { username = DEFAULT_USERNAME } = useParams();
  const { data, isLoading, error } = useProfile(username);
  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} />;
  const analytics = getAnalytics(data.user, data.repos);

  return (
    <div className="page">
      <SectionTitle title="Analytics Dashboard" text="Interactive charts for scores, languages, repository activity and contribution trends." />
      <section className="dashboard-grid two">
        <Panel title="Score Radar"><ScoreRadar scores={analytics.scores} /></Panel>
        <Panel title="Activity Trend"><ActivityChart analytics={analytics} /></Panel>
        <Panel title="Language Donut"><LanguagePie analytics={analytics} /></Panel>
        <Panel title="Repository Metrics"><MetricTable analytics={analytics} /></Panel>
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
  const { username = DEFAULT_USERNAME } = useParams();
  const { data, isLoading, error } = useProfile(username);
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

function LanguageCharts({ analytics }) {
  return (
    <div className="chart-stack">
      <LanguagePie analytics={analytics} />
      <ActivityChart analytics={analytics} />
    </div>
  );
}

function LanguagePie({ analytics }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={analytics.languages.slice(0, 8)} dataKey="count" nameKey="name" innerRadius={60} outerRadius={95}>
            {analytics.languages.slice(0, 8).map((item) => <Cell key={item.name} fill={item.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ActivityChart({ analytics }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={analytics.updatedMonths}>
          <defs><linearGradient id="activity" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8} /><stop offset="100%" stopColor="#60a5fa" stopOpacity={0.05} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="repos" stroke="#2563eb" fill="url(#activity)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScoreRadar({ scores }) {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={scores}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.35} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
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

function Panel({ title, children }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
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
  return <header className="section-title"><p className="eyebrow">GitLens Pro</p><h1>{title}</h1><span>{text}</span></header>;
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
  wrap(ctx, user.bio || 'Premium GitHub analytics profile card.', 318, 236, 780, 34, 3);
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
  link.download = `${user.login}-gitlens-pro-card.png`;
  link.click();
  toast.success('Premium card downloaded');
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
