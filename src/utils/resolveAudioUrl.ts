const _API_BASE = ((import.meta.env.VITE_API_BASE_URL as string) ?? (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/$/, '');

/**
 * Converts a relative backend path like /Track/{id}/stream to a full URL.
 * Absolute URLs (http/https) are returned as-is.
 */
export function resolveAudioUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${_API_BASE}/api/v1${url}`;
}
