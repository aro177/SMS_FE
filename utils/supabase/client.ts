import { Database } from '@/types/types_db';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export type BrowserSupabaseClient = SupabaseClient<
    Database,
    'public',
    'public',
    Database['public']
>;

export function createClient() {
    return createBrowserClient<Database, 'public'>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ) as unknown as BrowserSupabaseClient;
}