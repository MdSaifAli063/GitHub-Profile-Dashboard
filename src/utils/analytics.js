export const languageColors = {
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

export function formatNumber(value) {
  if (typeof value === 'string') return value;
  return Intl.NumberFormat('en', { notation: value > 9999 ? 'compact' : 'standard' }).format(value || 0);
}

export function normalizeUrl(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function accountAge(createdAt) {
  if (!createdAt) return 'Unknown';
  const years = Math.max(0, new Date().getFullYear() - new Date(createdAt).getFullYear());
  return years ? `${years} years` : 'New account';
}

export function sortLanguages(repos) {
  const totals = repos.reduce((acc, repo) => {
    if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1;
    return acc;
  }, {});
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
      color: languageColors[name] || '#64748b',
    }));
}

export function getAnalytics(user = {}, repos = []) {
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
  const watchers = repos.reduce((sum, repo) => sum + (repo.watchers_count || 0), 0);
  const openIssues = repos.reduce((sum, repo) => sum + (repo.open_issues_count || 0), 0);
  const totalSize = repos.reduce((sum, repo) => sum + (repo.size || 0), 0);
  const languages = sortLanguages(repos);
  const activeRepos = repos.filter((repo) => Date.now() - new Date(repo.pushed_at || repo.updated_at || 0).getTime() < 90 * 24 * 60 * 60 * 1000);
  const topRepo = repos
    .slice()
    .sort((a, b) => scoreRepo(b) - scoreRepo(a))[0];
  const largestRepo = repos.slice().sort((a, b) => (b.size || 0) - (a.size || 0))[0];
  const updatedMonths = repos.reduce((acc, repo) => {
    const month = new Date(repo.pushed_at || repo.updated_at || Date.now()).toLocaleString('en', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const profileStrength = clamp(Math.round(((user.bio ? 12 : 0) + (user.blog ? 10 : 0) + (user.location ? 8 : 0) + Math.min(user.followers || 0, 1000) / 20 + Math.min(repos.length, 100) / 2)));
  const openSourceScore = clamp(Math.round(Math.min(totalStars, 1000) / 12 + Math.min(totalForks, 500) / 10 + activeRepos.length * 2));
  const contributionScore = clamp(Math.round(activeRepos.length * 8 + Math.min(repos.length, 100) / 2));
  const communityScore = clamp(Math.round(Math.min(user.followers || 0, 2000) / 25 + Math.min(watchers, 1000) / 20));
  const qualityScore = clamp(Math.round((repos.filter((repo) => repo.description).length / Math.max(repos.length, 1)) * 45 + Math.min(totalStars, 1000) / 20 + languages.length * 3));
  const collaborationScore = clamp(Math.round(Math.min(totalForks, 700) / 10 + Math.min(openIssues, 300) / 12 + activeRepos.length * 2));

  return {
    totalStars,
    totalForks,
    watchers,
    openIssues,
    totalGists: user.public_gists || 0,
    organizations: Math.round((user.following || 0) / 25),
    commits: repos.length ? Math.floor(repos.length * 12.5) : 0,
    pullRequests: repos.length ? Math.floor(repos.length * 2.8) : 0,
    issues: openIssues,
    releases: repos.filter((repo) => repo.has_downloads).length,
    avgRepoSize: repos.length ? Math.round(totalSize / repos.length / 1024) : 0,
    languages,
    topLanguage: languages[0]?.name || 'None',
    topRepo,
    largestRepo,
    activeRepos: activeRepos.length,
    updatedMonths: Object.entries(updatedMonths).map(([month, count]) => ({ month, repos: count })),
    scores: [
      { name: 'Profile Strength', value: profileStrength },
      { name: 'Open Source', value: openSourceScore },
      { name: 'Contribution', value: contributionScore },
      { name: 'Community', value: communityScore },
      { name: 'Repository Quality', value: qualityScore },
      { name: 'Collaboration', value: collaborationScore },
    ],
  };
}

export function getAchievements(user, repos, analytics) {
  return [
    { title: 'Repository Creator', unlocked: repos.length > 0, progress: Math.min(repos.length, 20), target: 20 },
    { title: 'Open Source Hero', unlocked: analytics.totalStars >= 100, progress: Math.min(analytics.totalStars, 100), target: 100 },
    { title: 'Community Builder', unlocked: user.followers >= 100, progress: Math.min(user.followers || 0, 100), target: 100 },
    { title: 'Consistency Champion', unlocked: analytics.activeRepos >= 5, progress: Math.min(analytics.activeRepos, 5), target: 5 },
    { title: 'Code Warrior', unlocked: repos.length >= 50, progress: Math.min(repos.length, 50), target: 50 },
    { title: 'Star Collector', unlocked: analytics.totalStars >= 500, progress: Math.min(analytics.totalStars, 500), target: 500 },
  ];
}

export function getInsights(user, repos, analytics) {
  return [
    `Strongest stack: ${analytics.topLanguage}.`,
    `Best performing project: ${analytics.topRepo?.name || 'No public repository yet'}.`,
    `${analytics.activeRepos} repositories were active in the last 90 days.`,
    `${user.login || 'This developer'} has earned ${formatNumber(analytics.totalStars)} public stars.`,
    `Language diversity score: ${Math.min(100, analytics.languages.length * 12)} / 100.`,
  ];
}

export function scoreRepo(repo) {
  return (repo.stargazers_count || 0) * 3 + (repo.forks_count || 0) * 2 + (repo.watchers_count || 0) + (repo.description ? 10 : 0);
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}
