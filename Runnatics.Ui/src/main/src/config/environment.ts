export const config = {
    // Use proxy in development to avoid CORS, direct URL in production
    apiBaseUrl: (import.meta as any).env?.VITE_API_BASE_URL || 
                ((import.meta as any).env?.DEV ? '/api' : 'http://localhost:5286/api'),
    isDevelopment: (import.meta as any).env?.DEV,
    isProduction: (import.meta as any).env?.PROD,
    mode: (import.meta as any).env?.MODE,
};

if (config.isDevelopment) {
    console.log('🔧 Environment Config:', {
        apiBaseUrl: config.apiBaseUrl,
        mode: config.mode,
    });
}

export default config;


// // src/main/src/config/environment.ts

// export const config = {
//     apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5286/api',
//     isDevelopment: import.meta.env.DEV,
//     isProduction: import.meta.env.PROD,
//     mode: import.meta.env.MODE,
// };

// // Log configuration in development (helps with debugging)
// if (config.isDevelopment) {
//     console.log('🔧 Environment Config:', {
//         apiBaseUrl: config.apiBaseUrl,
//         mode: config.mode,
//     });
// }

// export default config;