# JWT Authentication Implementation Guide

## Overview

This application implements JWT (JSON Web Token) authentication with automatic Bearer token injection using Axios interceptors. All authenticated API requests automatically include the JWT token in the Authorization header.

## How It Works

### 1. **Axios Interceptor** (`src/main/src/utils/axios.config.ts`)

The interceptor automatically adds the Bearer token to every API request:

```typescript
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getToken();
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    }
);
```

### 2. **Token Manager**

The `tokenManager` provides centralized token management:

- `getToken()` - Retrieves JWT token from localStorage
- `setToken(token)` - Stores JWT token
- `getRefreshToken()` - Retrieves refresh token
- `setRefreshToken(token)` - Stores refresh token
- `clearTokens()` - Clears all tokens (on logout or 401 errors)

### 3. **Authentication Flow**

#### Login Process:
1. User submits credentials via login form
2. `AuthService.login()` sends credentials to `/auth/login`
3. Backend returns JWT token in response
4. Token is automatically stored in localStorage
5. All subsequent API requests include the token

#### Token Storage:
```typescript
// After successful login
if (response.data.token) {
    tokenManager.setToken(response.data.token);
}
if (response.data.refreshToken) {
    tokenManager.setRefreshToken(response.data.refreshToken);
}
```

#### Automatic Token Injection:
```
Every API request → Interceptor → Adds "Authorization: Bearer <token>" → Server
```

### 4. **Error Handling**

The response interceptor handles authentication errors:

```typescript
case 401:
    // Unauthorized - clear tokens and redirect to login
    tokenManager.clearTokens();
    if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
    }
    break;
```

## Usage Examples

### Using AuthContext (Recommended)

```typescript
import { useAuth } from '../../contexts/AuthContext';

function LoginComponent() {
    const { login, isLoading } = useAuth();
    
    const handleLogin = async () => {
        try {
            await login({
                email: 'user@example.com',
                password: 'password123'
            });
            // Token is automatically stored and used in all requests
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };
}
```

### Making Authenticated API Calls

Once logged in, all API calls automatically include the token:

```typescript
import { apiClient } from '../utils/axios.config';

// This request automatically includes: Authorization: Bearer <token>
const response = await apiClient.get('/api/events');
const events = response.data;

// POST request also includes the token
const newEvent = await apiClient.post('/api/events', eventData);
```

### Manual Token Management

```typescript
import { tokenManager } from '../utils/axios.config';

// Get current token
const token = tokenManager.getToken();

// Check if user is authenticated
const isAuthenticated = !!tokenManager.getToken();

// Clear tokens (logout)
tokenManager.clearTokens();
```

## Backend API Requirements

Your backend should return the following structure on successful login:

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "optional-refresh-token",
    "user": {
        "id": "user-id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "permissions": ["read", "write"]
    },
    "expiresIn": 3600
}
```

## API Endpoints

Expected authentication endpoints:

- `POST /auth/login` - Login with credentials
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout (optional)
- `POST /auth/refresh` - Refresh access token using refresh token

## Configuration

Update the API base URL in `src/main/src/config/environment.ts`:

```typescript
export default {
    apiBaseUrl: 'http://localhost:5000/api', // Your backend API URL
};
```

## Security Best Practices

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for enhanced security)
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Implement token refresh mechanism for long-lived sessions
4. **Logout**: Always clear tokens on logout
5. **401 Handling**: Automatic token clearing and redirect on authentication failure

## Token Refresh Implementation

The `AuthService` includes a refresh token method:

```typescript
async refreshToken(): Promise<string> {
    const refreshToken = tokenManager.getRefreshToken();
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    tokenManager.setToken(response.data.token);
    return response.data.token;
}
```

To implement automatic token refresh on 401 errors, you can enhance the response interceptor:

```typescript
apiClient.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const newToken = await authService.refreshToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                tokenManager.clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);
```

## Testing

### Test Login Flow:
1. Open browser DevTools (Network tab)
2. Login with credentials
3. Check localStorage for `authToken`
4. Make any API request
5. Verify `Authorization: Bearer <token>` header in request

### Test Token Expiration:
1. Set expired token in localStorage
2. Make API request
3. Verify redirect to login page
4. Verify tokens are cleared

## Troubleshooting

### Token not being sent:
- Check if token exists in localStorage
- Verify `apiClient` is being used for requests
- Check browser console for errors

### 401 Errors:
- Token may be expired
- Token format may be incorrect
- Backend may not be validating token properly

### CORS Issues:
- Ensure backend allows Authorization header
- Check CORS configuration on backend

## Files Modified/Created

1. ✅ `src/main/src/utils/axios.config.ts` - Enhanced interceptor with token management
2. ✅ `src/main/src/models/Auth.ts` - Authentication type definitions
3. ✅ `src/main/src/services/AuthService.ts` - Authentication service
4. ✅ `src/main/src/contexts/AuthContext.tsx` - Auth context provider
5. ✅ `src/main/src/pages/auth/LoginPage.tsx` - Login page implementation

## Next Steps

1. Wrap your app with `AuthProvider` in `App.tsx`
2. Update API endpoints to match your backend
3. Implement protected routes using auth state
4. Add token refresh mechanism if needed
5. Test the authentication flow end-to-end
