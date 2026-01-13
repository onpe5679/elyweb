import { supabaseAuthProvider } from 'ra-supabase';
import { supabase } from './dataProvider';

const baseAuthProvider = supabaseAuthProvider(supabase, {
    getIdentity: async (user) => {
        return {
            id: user.id,
            fullName: user.email,
        };
    },
});

export const authProvider = {
    ...baseAuthProvider,
    login: async (params: { username?: string; password?: string; email?: string }) => {
        const email = params.email || params.username;
        const password = params.password;
        return baseAuthProvider.login({ email, password });
    },
};
