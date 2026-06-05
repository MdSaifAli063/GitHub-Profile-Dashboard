import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: { Accept: 'application/vnd.github+json' },
});

export async function fetchUser(username) {
  const { data } = await api.get(`/users/${encodeURIComponent(username)}`);
  return data;
}

export async function fetchRepos(username) {
  const { data } = await api.get(`/users/${encodeURIComponent(username)}/repos`, {
    params: { per_page: 100, sort: 'updated' },
  });
  return data;
}

export async function fetchProfile(username) {
  const [user, repos] = await Promise.all([fetchUser(username), fetchRepos(username)]);
  return { user, repos };
}
