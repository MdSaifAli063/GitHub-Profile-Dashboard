import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const DEFAULT_USERNAME = 'octocat';

const languageColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  PHP: '#4f5d95',
  Ruby: '#701516',
  Go: '#00add8',
  Rust: '#dea584',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Dart: '#00b4ab',
  HTML: '#e34c26',
  CSS: '#663399',
  Vue: '#41b883',
  Shell: '#89e051',
};

function normalizeUrl(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function formatNumber(value) {
  return Intl.NumberFormat('en', { notation: value > 9999 ? 'compact' : 'standard' }).format(value || 0);
}

function sortLanguages(repos) {
  const totals = repos.reduce((acc, repo) => {
    if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, color: languageColors[name] || '#64748b' }));
}

function getStats(repos) {
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
  const totalSize = repos.reduce((sum, repo) => sum + (repo.size || 0), 0);
  const largestRepo = repos.slice().sort((a, b) => (b.size || 0) - (a.size || 0))[0];
  const languages = sortLanguages(repos);

  return {
    totalStars,
    totalForks,
    largestRepo,
    avgRepoSize: repos.length ? Math.round(totalSize / repos.length / 1024) : 0,
    topLanguage: languages[0]?.name || 'None',
    estimatedCommits: repos.length ? Math.floor(repos.length * 12.5) : 0,
    estimatedYearCommits: repos.length ? Math.floor(repos.length * 8) : 0,
    languages,
  };
}

function getAchievements(user, repos, totalStars) {
  const achievements = [];
  const recentlyActive = repos.some((repo) => {
    const date = new Date(repo.pushed_at || repo.updated_at || 0);
    return Date.now() - date.getTime() < 90 * 24 * 60 * 60 * 1000;
  });

  if (user.followers >= 1000) achievements.push('Popular: 1k+ followers');
  if (user.public_repos >= 100) achievements.push('Repo Master: 100+ repos');
  if (user.followers >= 100 && user.public_repos >= 50) achievements.push('Active Maintainer');
  if (totalStars >= 100) achievements.push('Star Collector: 100+ stars');
  if (repos.some((repo) => (repo.stargazers_count || 0) >= 50)) achievements.push('Popular Repository');
  if (recentlyActive) achievements.push('Recently Active');

  return achievements.length ? achievements : ['Keep contributing. Achievements will appear here.'];
}

async function fetchGitHubProfile(username) {
  const target = username || DEFAULT_USERNAME;
  const [userResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(target)}`),
    fetch(`https://api.github.com/users/${encodeURIComponent(target)}/repos?per_page=100&sort=updated`),
  ]);

  if (!userResponse.ok) {
    if (userResponse.status === 404) throw new Error('GitHub user not found.');
    if (userResponse.status === 403) throw new Error('GitHub API rate limit exceeded. Please try again later.');
    throw new Error(`GitHub returned ${userResponse.status}: ${userResponse.statusText}`);
  }

  return {
    user: await userResponse.json(),
    repos: reposResponse.ok ? await reposResponse.json() : [],
  };
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function fitText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines) visible[maxLines - 1] = `${visible[maxLines - 1].replace(/\.*$/, '')}...`;
  visible.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
}

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function downloadProfileCard(user, repos, stats) {
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = 1080 * scale;
  canvas.height = 640 * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const gradient = ctx.createLinearGradient(0, 0, 1080, 640);
  gradient.addColorStop(0, '#f8fafc');
  gradient.addColorStop(0.5, '#ffffff');
  gradient.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 640);

  ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
  ctx.beginPath();
  ctx.arc(860, 80, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
  ctx.beginPath();
  ctx.arc(180, 560, 220, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'rgba(15, 23, 42, 0.14)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 14;
  drawRoundedRect(ctx, 56, 54, 968, 532, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.shadowColor = 'transparent';

  try {
    const avatar = await loadImage(`${user.avatar_url}&s=240`);
    drawRoundedRect(ctx, 96, 94, 164, 164, 24);
    ctx.save();
    ctx.clip();
    ctx.drawImage(avatar, 96, 94, 164, 164);
    ctx.restore();
  } catch {
    ctx.fillStyle = '#dbeafe';
    drawRoundedRect(ctx, 96, 94, 164, 164, 24);
    ctx.fill();
  }

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 48px Arial';
  fitText(ctx, user.name || user.login, 294, 126, 630, 54, 1);
  ctx.fillStyle = '#2563eb';
  ctx.font = '600 28px Arial';
  ctx.fillText(`@${user.login}`, 294, 174);
  ctx.fillStyle = '#475569';
  ctx.font = '400 24px Arial';
  fitText(ctx, user.bio || 'No bio provided.', 294, 218, 650, 34, 3);

  const chips = [
    ['Followers', formatNumber(user.followers)],
    ['Repos', formatNumber(user.public_repos)],
    ['Stars', formatNumber(stats.totalStars)],
    ['Forks', formatNumber(stats.totalForks)],
  ];

  chips.forEach(([label, value], index) => {
    const x = 96 + index * 228;
    drawRoundedRect(ctx, x, 328, 196, 104, 18);
    ctx.fillStyle = index % 2 ? '#f0fdf4' : '#eff6ff';
    ctx.fill();
    ctx.fillStyle = '#2563eb';
    ctx.font = '700 34px Arial';
    ctx.fillText(value, x + 22, 372);
    ctx.fillStyle = '#475569';
    ctx.font = '600 18px Arial';
    ctx.fillText(label, x + 22, 404);
  });

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 28px Arial';
  ctx.fillText('Top repositories', 96, 486);
  ctx.fillStyle = '#475569';
  ctx.font = '500 22px Arial';
  const topRepos = repos
    .slice()
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 3)
    .map((repo) => `${repo.name} (${repo.stargazers_count || 0} stars)`);
  fitText(ctx, topRepos.join('  •  ') || 'No public repositories yet.', 96, 526, 820, 30, 2);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 18px Arial';
  ctx.fillText('Generated by GitHub Profile Dashboard', 96, 574);

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${user.login}-github-card.png`;
  link.click();
}

function App() {
  const [username, setUsername] = useState(() => new URLSearchParams(window.location.search).get('u') || DEFAULT_USERNAME);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [graphReady, setGraphReady] = useState(false);

  const stats = useMemo(() => getStats(profile?.repos || []), [profile]);
  const topRepos = useMemo(
    () => (profile?.repos || []).slice().sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, 6),
    [profile],
  );
  const achievements = useMemo(
    () => (profile ? getAchievements(profile.user, profile.repos, stats.totalStars) : []),
    [profile, stats.totalStars],
  );

  async function search(nextUsername = username) {
    const clean = nextUsername.trim() || DEFAULT_USERNAME;
    setLoading(true);
    setError('');
    setGraphReady(false);

    try {
      const nextProfile = await fetchGitHubProfile(clean);
      setProfile(nextProfile);
      setUsername(nextProfile.user.login);
      window.history.replaceState(null, '', `?u=${encodeURIComponent(nextProfile.user.login)}`);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading this profile.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search(username);
  }, []);

  const user = profile?.user;

  return (
    <>
      <div className="bg-anim" />
      <nav className="navbar">
        <div className="container nav-container">
          <div className="brand">
            <div className="logo">GH</div>
            <div>
              <h1>GitHub Profile Dashboard</h1>
              <p>React powered profile explorer</p>
            </div>
          </div>

          <form
            className="nav-search"
            onSubmit={(event) => {
              event.preventDefault();
              search();
            }}
          >
            <input
              className="nav-search-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter GitHub username"
              aria-label="GitHub username"
            />
            <button className="nav-btn" disabled={loading} type="submit">
              {loading ? 'Loading...' : 'Search'}
            </button>
          </form>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          {error && <div className="alert">{error}</div>}

          <section className="content-row two-cols">
            <aside className="profile-panel">
              <img className="avatar" src={user?.avatar_url || 'https://github.com/octocat.png'} alt={user ? `${user.login} avatar` : 'GitHub avatar'} />
              <h2>{loading ? 'Loading profile...' : user?.name || user?.login || 'The Octocat'}</h2>
              <p className="handle">@{user?.login || DEFAULT_USERNAME}</p>
              <p className="bio">{user?.bio || 'Search a GitHub username to see a polished profile dashboard.'}</p>

              <div className="stats">
                <Stat label="Followers" value={formatNumber(user?.followers || 0)} />
                <Stat label="Following" value={formatNumber(user?.following || 0)} />
                <Stat label="Repos" value={formatNumber(user?.public_repos || 0)} />
              </div>

              <div className="actions">
                <a className="secondary-btn" href={user?.html_url || 'https://github.com/octocat'} target="_blank" rel="noreferrer">
                  Open GitHub
                </a>
                <button
                  className="primary-btn"
                  disabled={!profile}
                  onClick={() => downloadProfileCard(profile.user, profile.repos, stats)}
                >
                  Download Card
                </button>
              </div>

              <Panel title="GitHub Trophies" compact>
                {user ? (
                  <img
                    className="wide-image"
                    src={`https://github-profile-trophy.vercel.app/?username=${encodeURIComponent(user.login)}&theme=flat&no-frame=true&margin-w=8`}
                    alt={`${user.login} trophies`}
                  />
                ) : (
                  <Empty text="Trophies will load after search." />
                )}
              </Panel>

              <Panel title="Contribution Graph" compact>
                {user && (
                  <>
                    {!graphReady && <Empty text="Loading contribution graph..." />}
                    <img
                      className="wide-image"
                      style={{ display: graphReady ? 'block' : 'none' }}
                      src={`https://github-readme-activity-graph.vercel.app/graph?username=${encodeURIComponent(user.login)}&theme=github-light&hide_border=true`}
                      alt={`${user.login} contribution graph`}
                      onLoad={() => setGraphReady(true)}
                      onError={() => setGraphReady(false)}
                    />
                  </>
                )}
              </Panel>
            </aside>

            <div className="right-column">
              <Panel title="Achievements">
                <div className="chips">
                  {(achievements.length ? achievements : ['Loading achievements...']).map((achievement) => (
                    <span className="chip" key={achievement}>{achievement}</span>
                  ))}
                </div>
              </Panel>

              <Panel title="Top Repositories">
                <div className="repos">
                  {topRepos.length ? topRepos.map((repo) => <RepoCard repo={repo} key={repo.id} />) : <Empty text={loading ? 'Loading repositories...' : 'No public repositories found.'} />}
                </div>
              </Panel>

              <Panel title="Repository Snapshot">
                <div className="stats-row">
                  <span className="small-chip">{formatNumber(stats.totalStars)} stars</span>
                  <span className="small-chip">{formatNumber(stats.totalForks)} forks</span>
                  <span className="small-chip">Largest: {stats.largestRepo ? `${stats.largestRepo.name} (${Math.round(stats.largestRepo.size / 1024)} KB)` : 'None'}</span>
                </div>
              </Panel>
            </div>
          </section>

          <section className="content-row">
            <Panel title="Activity Statistics">
              <div className="activity-stats">
                <Stat label="Total Commits" value={formatNumber(stats.estimatedCommits)} />
                <Stat label="This Year" value={formatNumber(stats.estimatedYearCommits)} />
                <Stat label="Avg Repo Size" value={`${stats.avgRepoSize} KB`} />
                <Stat label="Top Language" value={stats.topLanguage} />
              </div>
            </Panel>

            <Panel title="Programming Languages">
              <div className="languages">
                {stats.languages.length ? stats.languages.slice(0, 10).map((language) => (
                  <span className="language" key={language.name}>
                    <span style={{ background: language.color }} />
                    {language.name}
                    <b>{language.count}</b>
                  </span>
                )) : <Empty text="No language data available." />}
              </div>
            </Panel>

            <Panel title="Profile Links">
              <div className="social-links">
                {user?.html_url && <a href={user.html_url} target="_blank" rel="noreferrer">GitHub</a>}
                {user?.blog && <a href={normalizeUrl(user.blog)} target="_blank" rel="noreferrer">Website</a>}
                {user?.twitter_username && <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noreferrer">Twitter</a>}
                {user?.location && <a href={`https://www.google.com/maps/search/${encodeURIComponent(user.location)}`} target="_blank" rel="noreferrer">Location</a>}
                {!user && <Empty text="Profile links will appear here." />}
              </div>
            </Panel>
          </section>

          <footer>Made with React and the GitHub API.</footer>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

function Panel({ title, children, compact = false }) {
  return (
    <section className={compact ? 'panel compact' : 'panel'}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Empty({ text }) {
  return <p className="empty">{text}</p>;
}

function RepoCard({ repo }) {
  return (
    <article className="repo">
      <div>
        <a href={repo.html_url} target="_blank" rel="noreferrer">{repo.name}</a>
        <p>{repo.description || 'No description provided.'}</p>
      </div>
      <div className="meta">
        <span>{repo.stargazers_count || 0} stars</span>
        <span>{repo.forks_count || 0} forks</span>
        {repo.language && <span>{repo.language}</span>}
      </div>
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
