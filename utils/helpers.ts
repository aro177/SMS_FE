// Returns a full Supabase Storage image URL given a storage path or full URL
export function getFullSupabaseImageUrl(
    url: string | null | undefined
): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const normalized = url.startsWith('/') ? url : `/${url}`;
    if (normalized.startsWith('/storage/v1/')) {
        return supabaseUrl + normalized;
    }
    if (normalized.startsWith('/object/')) {
        return supabaseUrl + '/storage/v1' + normalized;
    }
    return supabaseUrl + '/storage/v1' + normalized;
}
import { Database } from '@/types/types_db';

type Price = Database['public']['Tables']['prices']['Row'];

export const getURL = (path?: string) => {
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ??
        process?.env?.NEXT_PUBLIC_VERCEL_URL ??
        'http://localhost:3000';
    url = url.includes('http') ? url : `https://${url}`;
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

    if (path) {
        path = path.replace(/^\/+/, '');

        return path ? `${url}/${path}` : url;
    }

    return url;
};

export const postData = async ({
                                   url,
                                   data
                               }: {
    url: string;
    data?: { price: Price };
}) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw Error(res.statusText);
    }

    return res.json();
};

export const toDateTime = (secs: number) => {
    const t = new Date('1970-01-01T00:30:00Z');
    t.setSeconds(secs);
    return t;
};

export const calculateTrialEndUnixTimestamp = (
    trialPeriodDays: number | null | undefined
) => {
    if (
        trialPeriodDays === null ||
        trialPeriodDays === undefined ||
        trialPeriodDays < 2
    ) {
        return undefined;
    }

    const currentDate = new Date();
    const trialEnd = new Date(
        currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000
    );
    return Math.floor(trialEnd.getTime() / 1000);
};

const toastKeyMap: { [key: string]: string[] } = {
    status: ['status', 'status_description'],
    error: ['error', 'error_description']
};

const getToastRedirect = (
    path: string,
    toastType: string,
    toastName: string,
    toastDescription: string = '',
    disableButton: boolean = false,
    arbitraryParams: string = ''
): string => {
    const [nameKey, descriptionKey] = toastKeyMap[toastType];

    let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

    if (toastDescription) {
        redirectPath += `&${descriptionKey}=${encodeURIComponent(
            toastDescription
        )}`;
    }

    if (disableButton) {
        redirectPath += `&disable_button=true`;
    }

    if (arbitraryParams) {
        redirectPath += `&${arbitraryParams}`;
    }

    return redirectPath;
};

export const getStatusRedirect = (
    path: string,
    statusName: string,
    statusDescription: string = '',
    disableButton: boolean = false,
    arbitraryParams: string = ''
) =>
    getToastRedirect(
        path,
        'status',
        statusName,
        statusDescription,
        disableButton,
        arbitraryParams
    );

export const getErrorRedirect = (
    path: string,
    errorName: string,
    errorDescription: string = '',
    disableButton: boolean = false,
    arbitraryParams: string = ''
) =>
    getToastRedirect(
        path,
        'error',
        errorName,
        errorDescription,
        disableButton,
        arbitraryParams
    );
