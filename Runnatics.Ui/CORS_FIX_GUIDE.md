# CORS Error Fix Guide

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a security mechanism that prevents web pages from making requests to a different domain than the one serving the web page.

**Your Setup:**
- Frontend: Running on `http://localhost:5173` (or similar Vite dev server)
- Backend: Running on `http://localhost:5286/api`

Since these are different ports, the browser blocks the request by default for security reasons.

---

## ✅ Solution 1: Configure CORS on Backend (RECOMMENDED)

This is the **proper production solution**. You need to configure your backend to allow requests from your frontend.

### For .NET Backend (C#/ASP.NET Core)

Add this to your `Program.cs` or `Startup.cs`:

```csharp
// Program.cs (for .NET 6+)
var builder = WebApplication.CreateBuilder(args);

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",  // Vite default
                "http://localhost:3000",  // React default
                "http://localhost:5174"   // Alternative Vite port
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // Only if you need cookies/authentication
    });
});

var app = builder.Build();

// Use CORS middleware (MUST be before UseAuthorization)
app.UseCors("AllowReactApp");

app.UseAuthorization();
app.MapControllers();

app.Run();
```

### For Development (Allow All Origins)

⚠️ **NEVER use this in production!**

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

app.UseCors("AllowAll");
```

---

## ✅ Solution 2: Use Vite Proxy (TEMPORARY FIX)

If you can't modify the backend immediately, use a Vite proxy to avoid CORS.

### Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5286',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  }
})
```

### Update Environment Config:

Change your `environment.ts` to use relative URL:

```typescript
export const config = {
    // Use relative URL so proxy handles it
    apiBaseUrl: '/api',  // Changed from 'http://localhost:5286/api'
    isDevelopment: (import.meta as any).env?.DEV,
    isProduction: (import.meta as any).env?.PROD,
    mode: (import.meta as any).env?.MODE,
};
```

**After making this change, restart your Vite dev server!**

---

## ✅ Solution 3: Create .env File

Create a `.env` file in your project root:

```env
# .env
VITE_API_BASE_URL=http://localhost:5286/api
```

For development with proxy:

```env
# .env.development
VITE_API_BASE_URL=/api
```

For production:

```env
# .env.production
VITE_API_BASE_URL=https://your-api-domain.com/api
```

---

## 🔍 Debugging CORS Issues

### 1. Check Browser Console

Look for messages like:
- `Access to XMLHttpRequest has been blocked by CORS policy`
- `No 'Access-Control-Allow-Origin' header is present`

### 2. Check Network Tab

In DevTools → Network:
1. Find the failed request
2. Check the **Request Headers**:
   - Origin: `http://localhost:5173`
   - Should see this in your frontend
3. Check the **Response Headers**:
   - Should have: `Access-Control-Allow-Origin: http://localhost:5173`
   - If missing = backend CORS not configured

### 3. Check Preflight Request

For POST/PUT/DELETE, browser sends an OPTIONS request first:
- Look for the OPTIONS request before your POST
- It should return 200 OK
- Check if it has proper CORS headers

---

## 🚀 Quick Test Steps

### Step 1: Verify Backend is Running
```bash
curl http://localhost:5286/api/health
# or
curl http://localhost:5286/api/events
```

If this fails, your backend isn't running or URL is wrong.

### Step 2: Test CORS Headers
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5286/api/events/create \
     -v
```

Look for `Access-Control-Allow-Origin` in the response.

### Step 3: Update Frontend Configuration

I've already updated your axios config with better error logging. The console will now show:
- 🚀 For requests
- ✅ For successful responses
- 🚫 For CORS/network errors
- ❌ For API errors

---

## 📝 My Recommendations

### For Development:
1. **Option A (Best)**: Add CORS policy to backend (5 minutes)
2. **Option B (Quick)**: Use Vite proxy (see Solution 2 above)

### For Production:
- **MUST** configure proper CORS on backend
- Set specific allowed origins (never use `AllowAnyOrigin`)
- Use environment variables for API URLs

---

## 🔧 What I've Already Done

1. ✅ Updated `EventService.ts` with better CORS error logging
2. ✅ Created `axios.config.ts` with comprehensive error handling
3. ✅ Added detailed console logging for debugging

---

## 🎯 Next Steps

**Choose ONE of these:**

### Quick Fix (5 minutes):
1. Add CORS to your backend (see Solution 1)
2. Restart backend
3. Try creating event again

### Alternative (if you can't modify backend now):
1. Update `vite.config.ts` with proxy (see Solution 2)
2. Change `apiBaseUrl` in `environment.ts` to `/api`
3. Restart Vite dev server
4. Try creating event again

---

## 📞 Still Having Issues?

If you're still getting CORS errors after trying these solutions:

1. **Share the error message** from browser console
2. **Share the Network tab** details (request/response headers)
3. **Confirm**:
   - Is backend running?
   - What port is backend on?
   - What port is frontend on?
   - Did you restart servers after changes?

Let me know which solution you want to try first! 🚀
