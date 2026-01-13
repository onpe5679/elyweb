import { supabaseAuthProvider } from 'ra-supabase';
import { supabase } from './dataProvider';

export const authProvider = supabaseAuthProvider(supabase, {
    getIdentity: async (user) => {
        return {
            id: user.id,
            fullName: user.email,
        };
    },
});
