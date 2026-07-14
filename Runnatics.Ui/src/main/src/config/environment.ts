export const config = {
    // Always use VITE_API_BASE_URL if set, otherwise default to http://localhost:5286/api
    apiBaseUrl: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5286/api',
    // SignalR hub base URL - derives from API URL by stripping /api suffix
    hubBaseUrl: (import.meta as any).env?.VITE_HUB_BASE_URL
        || ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5286/api').replace(/\/api$/, ''),
    // Min ms between two accepted BIB-mapping scans (guards against a rapid second
    // EPC from the keyboard-wedge reader being accepted as a wrong selection)
    bibMapLockoutMs: Number((import.meta as any).env?.VITE_BIB_MAP_LOCKOUT_MS) || 2000,
    isDevelopment: (import.meta as any).env?.DEV,
    isProduction: (import.meta as any).env?.PROD,
    mode: (import.meta as any).env?.MODE,
};


export default config;