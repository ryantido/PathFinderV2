const API_BASE = 'http://localhost:4000/api';

export async function fetchAllJobs() {
  const res = await fetch(`${API_BASE}/jobs`);
  if (!res.ok) throw new Error(`jobs status ${res.status}`);
  return res.json();
}

export async function fetchFavoriteJobs(userId) {
  const res = await fetch(`${API_BASE}/favoriteJobs/${userId}`);
  if (!res.ok) throw new Error(`favoriteJobs status ${res.status}`);
  return res.json();
}

export async function fetchAllQuizzes() {
  const res = await fetch(`${API_BASE}/quizzes`);
  if (!res.ok) throw new Error(`quizzes status ${res.status}`);
  return res.json();
}

export async function fetchProfileData(userId) {
  const res = await fetch(`${API_BASE}/profile/${userId}`);
  if (!res.ok) throw new Error(`profile status ${res.status}`);
  return res.json();
} 