# Routing Structure - Auth vs Protected Routes

## Overview

The application now has two types of routes:

1. **Public Auth Routes** - Header only (login, register) - NO side navigation
2. **Protected Routes** - Full DashboardLayout (header + side navigation)

## Route Structure

```
/
├── /login              → LoginPage (AuthLayout - header only)
├── /register           → RegisterPage (AuthLayout - header only)
├── /                   → Redirect to /login
└── /* (all other)      → DashboardLayout wrapper
    ├── /support        → With header + side navigation
    ├── /events         → With header + side navigation
    └── ...             → With header + side navigation
```

## Implementation

### App.tsx Structure

```tsx
<Routes>
  {/* Auth routes - HEADER ONLY (no side nav) */}
  <Route element={<AuthLayoutWrapper />}>
    <Route path="/login" element={<LoginPage />} />
  </Route>
  
  {/* Protected routes - FULL DASHBOARD (header + side nav) */}
  <Route element={<DashboardLayoutWrapper />}>
    {/* All event routes render inside DashboardLayout */}
    {eventsRoutes.map(...)}
  </Route>
</Routes>
```

## How It Works

### 1. Login Page (`/login`)
- **URL**: `http://localhost:5173/login`
- **Layout**: AuthLayout (header only)
- **Display**: Header bar with theme switcher + login form
- **Navigation**: NO side navigation
- **Purpose**: User authentication

### 2. Protected Pages (e.g., `/support`, `/events`)
- **URL**: `http://localhost:5173/support`
- **Layout**: DashboardLayout (full layout)
- **Display**: Header bar + side navigation + content
- **Navigation**: Full side navigation menu
- **Purpose**: Application content

## Benefits

✅ **Professional Login** - Users see header with branding and login form
✅ **No Distractions** - No side navigation on login page
✅ **Consistent Branding** - Header appears on all pages
✅ **Theme Toggle** - Users can change theme even on login page
✅ **Easy to Extend** - Add new auth pages (register, forgot password) with same header
✅ **Better UX** - Clear separation between auth and app

## Example: Adding a Register Page

```tsx
// In App.tsx
<Route path="/register" element={<RegisterPage />} />
```

The register page will automatically render without the dashboard layout.

## Example: Adding a Protected Page

```tsx
// In your routes file
export const myRoutes: RouteObject[] = [
  {
    path: "/my-page",
    element: <MyPage />,
  },
];

// In App.tsx (inside DashboardLayoutWrapper)
{myRoutes.map((route, index) => (
  <Route key={index} path={route.path} element={route.element} />
))}
```

The page will automatically render with the dashboard layout.

## Key Components

### AuthLayoutWrapper
```tsx
const AuthLayoutWrapper = () => {
  return (
    <AuthLayout>
      <Outlet /> {/* Child routes render here */}
    </AuthLayout>
  );
};
```

This wrapper provides **header only** for auth pages (login, register).

### DashboardLayoutWrapper
```tsx
const DashboardLayoutWrapper = () => {
  return (
    <DashboardLayout>
      <Outlet /> {/* Child routes render here */}
    </DashboardLayout>
  );
};
```

This wrapper provides **full dashboard** (header + side nav) for protected pages.

## Testing

### Test Login Route (Header Only):
1. Navigate to `/login`
2. ✅ Should see: Header bar (with app name and theme switcher)
3. ✅ Should see: Login form
4. ✅ Should NOT see: Side navigation

### Test Protected Route (Full Layout):
1. Navigate to `/support` (or any protected route)
2. ✅ Should see: Header bar
3. ✅ Should see: Side navigation
4. ✅ Should see: Page content

## Visual Comparison

### Login Page Layout:
```
/login → AuthLayout
         ├── Header Bar (Top) ✅
         │   ├── App Name: "Racetik"
         │   └── Theme Switcher
         ├── NO Side Navigation ❌
         └── LoginPage Content ✅
```

### Protected Page Layout:
```
/support → DashboardLayout
           ├── Header Bar (Top) ✅
           │   ├── Menu Toggle
           │   ├── Page Title
           │   ├── Theme Switcher
           │   ├── Notifications
           │   └── User Avatar
           ├── Side Navigation (Left) ✅
           │   ├── Dashboard
           │   ├── Events
           │   ├── Support
           │   └── Settings
           └── Page Content ✅
```

## Future Enhancements

Consider adding:
- `/register` - User registration (no layout)
- `/forgot-password` - Password reset (no layout)
- `/verify-email` - Email verification (no layout)
- All protected routes with layout automatically

---

**Result**: Clean separation between authentication pages and application pages! 🎉
