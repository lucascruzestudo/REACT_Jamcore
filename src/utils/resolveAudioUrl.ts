import Cookies from 'js-cookie';

const _API_BASE = ((import.meta.env.VITE_API_BASE_URL as string) ?? (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/$/, '');

/**
 * Converts a relative backend path like /Track/{id}/stream to a full URL.
 * For stream paths, appends access_token as query param so the browser
 * audio element (which cannot send Authorization headers) is authenticated.
 * Absolute URLs (http/https) are returned as-is.
 */
export function resolveAudioUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const fullUrl = `${_API_BASE}/api/v1${url}`;
    if (url.includes('/stream')) {
        const token = Cookies.get('token');
        if (token) return `${fullUrl}?access_token=${encodeURIComponent(token)}`;
    }
    return fullUrl;
}
