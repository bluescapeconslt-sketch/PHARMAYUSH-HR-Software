
import { CompanySettings, BuddySettings, LeaveAllocationSettings } from '../types.ts';

// Robust API Base URL determination
// If VITE_API_URL is set, use it.
// If not, and we are in DEV mode, default to localhost:3000/api to ensure direct connection.
// If in PROD (and variable missing), assume relative path /api.
const getApiBase = () => {
    const env = (import.meta as any).env;
    if (env?.VITE_API_URL) return env.VITE_API_URL;
    if (env?.DEV) return 'http://localhost:3000/api'; 
    return '/api';
};

const API_BASE = getApiBase();

// --- Helper: Generic Fetch Wrapper ---
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        if (!response.ok) {
            // If 404, check if it's a "File not found" HTML response (common with bad proxies/static server fallbacks)
            if (response.status === 404) {
                const text = await response.text();
                if (text.includes('<!DOCTYPE html>') || text.includes('File not found')) {
                    throw new Error('API endpoint not found. Ensure the backend server is running and accessible.');
                }
                // Try to parse JSON error if available
                try {
                    const jsonError = JSON.parse(text);
                    throw new Error(jsonError.error || `API Error: ${response.status} ${response.statusText}`);
                } catch (e) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        // Handle empty responses (e.g. from DELETE)
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        console.error(`Request failed for ${endpoint} at ${API_BASE}:`, error);
        throw error;
    }
};

// --- Generic Operations ---

export const find = async <T>(table: string): Promise<T[]> => {
    return apiRequest<T[]>(`/${table}`);
};

export const findById = async <T extends {id: number}>(table: string, id: number): Promise<T | undefined> => {
    try {
        return await apiRequest<T>(`/${table}/${id}`);
    } catch (error) {
        // If 404, return undefined
        return undefined;
    }
};

export const insert = async <T extends {id: number}>(table: string, newItem: Omit<T, 'id'>): Promise<T> => {
    return apiRequest<T>(`/${table}`, {
        method: 'POST',
        body: JSON.stringify(newItem),
    });
};

export const update = async <T extends {id: number}>(table: string, updatedItem: T): Promise<T> => {
    return apiRequest<T>(`/${table}/${updatedItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedItem),
    });
};

export const remove = async <T extends {id: number}>(table: string, id: number): Promise<void> => {
    await apiRequest(`/${table}/${id}`, {
        method: 'DELETE',
    });
};

// --- Key-Value Store Operations (Settings) ---

export const getKV = async <T>(key: string): Promise<T> => {
    try {
        const result = await apiRequest<{ value: T }>(`/settings/${key}`);
        return result.value;
    } catch (error) {
        console.warn(`Setting ${key} not found, returning default if handled by caller.`);
        // Return an empty object as fallback, letting the caller handle defaults
        return {} as T; 
    }
};

export const saveKV = async <T>(key: string, value: T): Promise<void> => {
    await apiRequest(`/settings/${key}`, {
        method: 'POST',
        body: JSON.stringify({ value }),
    });
};
