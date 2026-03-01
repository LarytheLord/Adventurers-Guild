export async function fetchRankings(params: { sort?: string; order?: string; limit?: string; rank?: string }) {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.append('limit', params.limit);
  if (params.rank) searchParams.append('rank', params.rank);
  
  const res = await fetch(`/api/rankings?${searchParams.toString()}`);
  const data = await res.json();
  return data.rankings || [];
}

export async function getUserRank(userId: string) {
  const res = await fetch(`/api/rankings/user?userId=${userId}`);
  const data = await res.json();
  return data.rank || null;
}