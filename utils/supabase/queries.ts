import type { ServerSupabaseClient } from '@/utils/supabase/server';
import { cache } from 'react';

export const getUser = cache(async (supabase: ServerSupabaseClient) => {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        return null;
    }

    const {
        data: { user }
    } = await supabase.auth.getUser();
    return user;
});