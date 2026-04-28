/**
 * Wrapper around fetch that redirects to login on 401 responses.
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 401 && typeof window !== 'undefined') {
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
  }

  return response;
}
