export const getCookieValue = (name: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(
        new RegExp(
            `(?:^|; )${name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1')}=([^;]*)`
        )
    );
    return match ? decodeURIComponent(match[1]) : null;
};

export const swrFetcher = async <T>(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<T> => {
    const cookieKey = process.env.NEXT_PUBLIC_SUPABASE_AUTH_COOKIE_NAME!;
    const rawCookie = getCookieValue(cookieKey);

    let token = null;

    if (rawCookie && rawCookie.startsWith('base64-')) {
        try {
            const base64Data = rawCookie.replace('base64-', '');
            const decodedData = JSON.parse(atob(base64Data));
            token = decodedData.access_token;
        } catch (e) {
            console.error('Error decoding Supabase auth cookie:', e);
        }
    }

    const headers = new Headers(init?.headers || {});
    headers.set('Accept', 'application/json');

    // Automatically set Content-Type for POST/PUT/PATCH with body
    if (init?.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(input, {
        ...init,
        headers,
        credentials: 'same-origin'
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
        if (isJson) {
            const errorBody = await response.json().catch(() => ({}));
            const moreInfo = errorBody?.moreInfo;
            const infoMessages: string[] = [];
            const isString = (value: unknown): value is string =>
                typeof value === 'string';

            if (Array.isArray(moreInfo)) {
                infoMessages.push(...moreInfo.filter(isString));
            } else if (moreInfo && typeof moreInfo === 'object') {
                infoMessages.push(...Object.values(moreInfo).filter(isString));
            }

            const message =
                infoMessages.length > 0
                    ? infoMessages.join(' ')
                    : errorBody.message || 'Request failed';

            throw new Error(message);
        }

        const errorText = await response.text().catch(() => 'Request failed');
        throw new Error(errorText || 'Request failed');
    }

    if (response.status === 204) {
        return null as T;
    }

    if (isJson) {
        const rawText = await response.text().catch(() => '');
        if (!rawText.trim()) {
            return null as T;
        }
        try {
            return JSON.parse(rawText) as T;
        } catch (error) {
            throw error;
        }
    }

    const text = await response.text().catch(() => '');
    return (text.trim() ? text : null) as T;
};