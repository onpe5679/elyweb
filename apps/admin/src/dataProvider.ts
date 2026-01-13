import { supabaseDataProvider } from 'ra-supabase';
import { createClient } from '@supabase/supabase-js';
import { DataProvider } from 'react-admin';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const webApiUrl = import.meta.env.VITE_WEB_API_URL || 'http://localhost:3000';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export const dataProvider: DataProvider = {
    ...baseDataProvider,

    create: async (resource, params) => {
        const processedData = await processImageFields(params.data, resource);
        return baseDataProvider.create(resource, { ...params, data: processedData });
    },

    update: async (resource, params) => {
        const processedData = await processImageFields(params.data, resource);
        return baseDataProvider.update(resource, { ...params, data: processedData });
    },
};
