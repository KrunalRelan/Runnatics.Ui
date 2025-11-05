# Event Creation - Token Verification Guide

## ✅ How the Token is Added

The JWT Bearer token is **automatically** added to ALL API requests via the axios interceptor in `utils/axios.config.ts`.

### Request Flow:

```
1. Your Code: EventService.createEvent(eventData)
   ↓
2. apiClient.post('Events/create', eventData)
   ↓
3. Interceptor adds: Authorization: Bearer <your-token>
   ↓
4. Request sent to: http://localhost:5286/api/Events/create
   ↓
5. Backend receives authenticated request
```

## 🔍 How to Verify Token is Being Sent

### 1. Check Browser Console (Development Mode)

When you create an event, you should see console logs like:

```javascript
🚀 API Request: {
  method: "POST",
  url: "Events/create",
  baseURL: "http://localhost:5286/api",
  headers: {
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    Content-Type: "application/json"
  },
  data: { /* your event data */ }
}
```

**✅ If you see `Authorization: "Bearer ..."` - Token is being sent!**

### 2. Check Browser DevTools Network Tab

1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Network** tab
3. Create an event
4. Find the `create` request
5. Click on it → **Headers** tab
6. Look for **Request Headers**
7. ✅ You should see: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Check localStorage

Open DevTools Console and run:
```javascript
localStorage.getItem('authToken')
```

✅ Should return your JWT token string

## 🐛 Troubleshooting

### Problem: Token Not Being Sent

**Check 1: Is user logged in?**
```javascript
// In browser console:
localStorage.getItem('authToken')
// Should return a token, not null
```

**Check 2: Is apiClient being used?**
```typescript
// In EventService.ts, verify you're using:
import { apiClient } from '../utils/axios.config';

// NOT plain axios:
// import axios from 'axios'; ❌
```

**Check 3: Is interceptor working?**
```javascript
// In browser console, check console logs when making request
// You should see: 🚀 API Request: { ... }
```

### Problem: 401 Unauthorized

**Possible causes:**
1. Token expired - Login again
2. Token format wrong - Check it starts with "eyJ..."
3. Backend not validating correctly - Check backend logs

### Problem: Wrong Endpoint

**Before (Wrong):**
```
POST http://localhost:5286/api/events/create
```

**After (Correct):**
```
POST http://localhost:5286/api/Events/create
```

Note the capital "E" in "Events" - this has been fixed in ServiceUrls.ts!

## 📝 Current Configuration

### API Base URL:
- **Development**: `/api` (uses proxy) or `http://localhost:5286/api`
- **Production**: Set via `VITE_API_BASE_URL` environment variable

### Endpoints (Fixed):
- ✅ Create Event: `Events/create` (capital E)
- ✅ Search Events: `Events/search` (capital E)
- ✅ Get All Events: `Events` (capital E)

### Token Storage:
- **Key**: `authToken`
- **Location**: localStorage
- **Format**: JWT string (starts with "eyJ...")

## 🧪 Test the Token

### Manual Test in Browser Console:

```javascript
// 1. Check if token exists
const token = localStorage.getItem('authToken');
console.log('Token:', token);

// 2. Make a test API call
fetch('http://localhost:5286/api/Events/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Test Event",
    slug: "test-event",
    description: "Test",
    eventDate: "2025-12-15T06:00:00Z",
    // ... rest of your event data
  })
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

## ✅ What Was Fixed

1. **ServiceUrls.ts**: Changed `events/create` → `Events/create` (capital E)
2. **ServiceUrls.ts**: Changed `events/search` → `Events/search` (capital E)
3. **ServiceUrls.ts**: Changed `events` → `Events` (capital E)

These changes ensure the frontend URLs match your backend API exactly.

## 🎯 Expected Request

When you create an event, the request should look EXACTLY like your curl:

```
POST http://localhost:5286/api/Events/create
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  Accept: application/json
Body: { your event data }
```

## 🚀 Next Steps

1. **Clear browser cache and localStorage** (optional, to start fresh)
2. **Login again** to get a fresh token
3. **Try creating an event**
4. **Check browser console** for the 🚀 API Request log
5. **Verify** Authorization header is present

The token is being added automatically - you don't need to do anything manually! 🎉
