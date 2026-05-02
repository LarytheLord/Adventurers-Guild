import { fetchWithAuth } from '@/lib/fetch-with-auth';

export async function fetchRankings(params: {
  mode?: 'adventurer' | 'company';
  sort?: string;
  order?: string;
  limit?: string;
  rank?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.mode) searchParams.append('mode', params.mode);
  if (params.sort) searchParams.append('sort', params.sort);
  if (params.order) searchParams.append('order', params.order);
  if (params.limit) searchParams.append('limit', params.limit);
  if (params.rank) searchParams.append('rank', params.rank);
  
  const res = await fetchWithAuth(`/api/rankings?${searchParams.toString()}`);
  const data = await res.json();
  return data.rankings || [];
}

export async function getUserRank(
  userId: string,
  params?: { mode?: 'adventurer' | 'company'; sort?: string; order?: string }
) {
  const searchParams = new URLSearchParams({ userId });
  if (params?.mode) searchParams.append('mode', params.mode);
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.order) searchParams.append('order', params.order);

  const res = await fetchWithAuth(`/api/rankings/user?${searchParams.toString()}`);
  const data = await res.json();
  return data.rank || null;
}
