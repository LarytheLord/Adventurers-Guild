/**
 * Wrapper around fetch that handles 401 responses consistently.
 * When the server returns 401, the user's session has expired —
 * redirect to login instead of showing a confusing error.
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 401) {
    // Session expired — redirect to login
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
    }
    // Return the response anyway so callers can handle it if needed
  }

  return response;
}
