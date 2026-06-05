import axios from "axios";

const token = import.meta.env.VITE_GITHUB_TOKEN;

const api = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

export async function fetchUser(username) {
  try {
    const { data } = await api.get(`/users/${encodeURIComponent(username)}`);
    return data;
  } catch (error) {
    if (
      error.response?.status === 403 &&
      error.response?.headers["x-ratelimit-remaining"] === "0"
    ) {
      throw new Error(
        "GitHub API rate limit reached. Please try again later or add a GitHub token to increase limits.",
      );
    }
    throw error;
  }
}

export async function fetchRepos(username) {
  try {
    const { data } = await api.get(
      `/users/${encodeURIComponent(username)}/repos`,
      {
        params: { per_page: 100, sort: "updated" },
      },
    );
    return data;
  } catch (error) {
    if (
      error.response?.status === 403 &&
      error.response?.headers["x-ratelimit-remaining"] === "0"
    ) {
      throw new Error(
        "GitHub API rate limit reached. Please try again later or add a GitHub token to increase limits.",
      );
    }
    throw error;
  }
}

export async function fetchProfile(username) {
  const [user, repos] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
  ]);
  return { user, repos };
}
