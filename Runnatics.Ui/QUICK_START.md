# Quick Start Guide - After Auth Fix

## What Was Fixed
✅ **Import path inconsistency in App.tsx** - All imports now use `"./main/src/..."` instead of mixed `"../src/main/src/..."` and `"./main/src/..."`
✅ **AuthProvider now properly wraps all routes** - The LoginPage can access the useAuth hook without errors

## Test It Now

### 1. Start Dev Server
```bash
cd Runnatics.Ui
npm run dev
```

### 2. Open Browser
```
http://localhost:5173
```
- Should redirect to `/login`
- Should see login form with header (no side nav)
- NO errors in console about "useAuth must be used within an AuthProvider"

### 3. Test Login
1. Enter credentials
2. Watch browser console for token storage logs
3. Should redirect to `/dashboard` on success
4. Dashboard should show full layout (header + side nav)

## What To Check

### Browser Console (should see):
```
[AuthService] Login attempt for: your-email@example.com
[AuthService] Login response received
[AuthService] Token stored successfully: true
[TokenManager] Token stored in localStorage
```

### Network Tab (should see):
- POST request to `/api/Auth/Login`
- Subsequent requests should have `Authorization: Bearer <token>` header

### LocalStorage (should have):
```javascript
// Check in browser console
localStorage.getItem('auth_token')
// Should return your JWT token
```

## If Something's Wrong

### Clear Everything
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Restart Dev Server
```bash
# In terminal, press Ctrl+C then:
npm run dev
```

### Check Backend
Make sure your backend returns:
```json
{
  "token": "eyJhbG...",
  "user": { ... }
}
```

## Files Changed
- `/src/App.tsx` - Fixed import paths

## Files Already Working
- `/src/main/src/contexts/AuthContext.tsx`
- `/src/main/src/pages/auth/LoginPage.tsx`
- `/src/main/src/components/AuthLayout.tsx`
- `/src/main/src/utils/axios.config.ts`
- `/src/main/src/services/AuthService.ts`

## Summary
🎉 **Ready to test!** Start the dev server and navigate to the login page.
