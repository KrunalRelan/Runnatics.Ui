export const config = {
    // Always use VITE_API_BASE_URL if set, otherwise default to http://localhost:5286/api
    apiBaseUrl: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5286/api',
    isDevelopment: (import.meta as any).env?.DEV,
    isProduction: (import.meta as any).env?.PROD,
    mode: (import.meta as any).env?.MODE,
};

// Log configuration in development (helps with debugging)
if (config.isDevelopment) {
    console.log('🔧 Environment Config:', {
        apiBaseUrl: config.apiBaseUrl,
        mode: config.mode,
    });
}

export default config;