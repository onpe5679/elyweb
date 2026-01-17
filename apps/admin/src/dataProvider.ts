import { supabaseDataProvider } from 'ra-supabase';
import { createClient } from '@supabase/supabase-js';
import { DataProvider } from 'react-admin';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const webApiUrl = import.meta.env.VITE_WEB_API_URL || 'http://localhost:3000';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function revalidateWebsite(): Promise<void> {
    try {
        await fetch(`${webApiUrl}/api/revalidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
    } catch (e) {
        console.warn('Revalidation failed:', e);
    }
}

const baseDataProvider = supabaseDataProvider({
    instanceUrl: supabaseUrl,
    apiKey: supabaseAnonKey,
    supabaseClient: supabase,
});

async function uploadFile(file: File, folder: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(`${webApiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    const { url } = await response.json();
    return url;
}

function isRawFile(value: unknown): value is { rawFile: File } {
    if (value === null || typeof value !== 'object' || !('rawFile' in value)) {
        return false;
    }
    const rawFile = (value as { rawFile: unknown }).rawFile;
    if (rawFile instanceof File) return true;
    if (rawFile && typeof rawFile === 'object' && 'name' in rawFile && 'size' in rawFile && 'type' in rawFile) {
        return true;
    }
    return false;
}

async function processImageFields(data: Record<string, unknown>, resource: string): Promise<Record<string, unknown>> {
    const processed = { ...data };
    const folder = resource;

    for (const [key, value] of Object.entries(processed)) {
        if (isRawFile(value)) {
            processed[key] = await uploadFile(value.rawFile, folder);
        }
        
        if (Array.isArray(value)) {
            const processedArray = await Promise.all(
                value.map(async (item) => {
                    if (isRawFile(item)) {
                        return await uploadFile(item.rawFile, folder);
                    }
                    if (typeof item === 'object' && item !== null) {
                        for (const [itemKey, itemValue] of Object.entries(item)) {
                            if (isRawFile(itemValue)) {
                                (item as Record<string, unknown>)[itemKey] = await uploadFile(itemValue.rawFile, folder);
                            }
                        }
                    }
                    return item;
                })
            );
            processed[key] = processedArray;
        }
    }

    return processed;
}

async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

const authUsersProvider = {
    getList: async () => {
        const token = await getAuthToken();
        try {
            const response = await fetch(`${webApiUrl}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Network error' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            const data = await response.json();
            return { data: data || [], total: (data || []).length };
        } catch (error) {
            console.error('Failed to fetch users:', error);
            return { data: [], total: 0 };
        }
    },

    getOne: async (_resource: string, params: { id: string }) => {
        const token = await getAuthToken();
        const response = await fetch(`${webApiUrl}/api/admin/users/${params.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        return { data };
    },

    create: async (_resource: string, params: { data: { email: string; password: string } }) => {
        const token = await getAuthToken();
        const response = await fetch(`${webApiUrl}/api/admin/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params.data),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { data };
    },

    update: async (_resource: string, params: { id: string; data: { email?: string; password?: string } }) => {
        const token = await getAuthToken();
        const updateData: Record<string, string> = {};
        if (params.data.email) updateData.email = params.data.email;
        if (params.data.password) updateData.password = params.data.password;
        
        const response = await fetch(`${webApiUrl}/api/admin/users/${params.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { data };
    },

    delete: async (_resource: string, params: { id: string }) => {
        const token = await getAuthToken();
        const response = await fetch(`${webApiUrl}/api/admin/users/${params.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }
        return { data: { id: params.id } };
    },
};

export const dataProvider: DataProvider = {
    ...baseDataProvider,

    getList: async (resource, params) => {
        if (resource === 'auth_users') return authUsersProvider.getList();
        return baseDataProvider.getList(resource, params);
    },

    getOne: async (resource, params) => {
        if (resource === 'auth_users') return authUsersProvider.getOne(resource, { id: String(params.id) });
        return baseDataProvider.getOne(resource, params);
    },

    create: async (resource, params) => {
        if (resource === 'auth_users') return authUsersProvider.create(resource, params as any);
        const processedData = await processImageFields(params.data, resource);
        const result = await baseDataProvider.create(resource, { ...params, data: processedData });
        await revalidateWebsite();
        return result;
    },

    update: async (resource, params) => {
        if (resource === 'auth_users') return authUsersProvider.update(resource, params as any);
        const processedData = await processImageFields(params.data, resource);
        const result = await baseDataProvider.update(resource, { ...params, data: processedData });
        await revalidateWebsite();
        return result;
    },

    delete: async (resource, params) => {
        if (resource === 'auth_users') return authUsersProvider.delete(resource, { id: String(params.id) }) as any;
        return baseDataProvider.delete(resource, params);
    },
};
