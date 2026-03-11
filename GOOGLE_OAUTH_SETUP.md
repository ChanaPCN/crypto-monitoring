# Google OAuth Setup Instructions

## ✅ What Was Updated

I've added Google OAuth authentication to both login and signup pages. Here's what changed:

### Files Modified:
1. **`/app/login/page.tsx`** - Added Google sign-in button
2. **`/app/signup/page.tsx`** - Added Google sign-up button
3. **`/app/auth/callback/route.ts`** - Created OAuth callback handler

### Features Added:
- ✅ "Continue with Google" button on login page
- ✅ "Continue with Google" button on signup page
- ✅ Proper OAuth redirect handling
- ✅ Loading states for Google authentication
- ✅ Error handling
- ✅ Beautiful Google logo and styling

## ⚙️ Supabase Configuration Required

You mentioned you've already linked OAuth with Google in Supabase. Please verify these settings:

### 1. Check OAuth Redirect URL

In your Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Add this to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   ```
3. For production, also add:
   ```
   https://your-domain.com/auth/callback
   ```

### 2. Verify Google Provider Settings

1. Go to **Authentication** → **Providers**
2. Click on **Google**
3. Ensure it's **Enabled**
4. Verify your **Client ID** and **Client Secret** are filled in
5. The **Authorized redirect URI** should be:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```

### 3. Google Cloud Console Settings

Make sure in your Google Cloud Console (https://console.cloud.google.com):

1. **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - `https://your-production-domain.com` (for production)

2. **Authorized redirect URIs**:
   - `https://jsrccpodmfmhshzdmzei.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`

## 🧪 Testing

1. **Restart your development server** (if it's still running):
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Visit Login Page**:
   - Go to http://localhost:3000/login
   - You should see the "Continue with Google" button

3. **Click the Google Button**:
   - It will redirect you to Google's login page
   - After logging in, you'll be redirected back to `/dashboard`

## 🎨 UI Updates

The new Google button:
- Uses authentic Google colors and logo
- Shows loading state ("Connecting...")
- Matches the dark theme
- Has a subtle divider: "Or continue with email"
- Works on both login and signup pages

## 🔧 How It Works

1. User clicks "Continue with Google"
2. Supabase redirects to Google's OAuth consent screen
3. User authorizes the application
4. Google redirects back to `/auth/callback` with a code
5. The callback route exchanges the code for a session
6. User is redirected to `/dashboard`

## ⚠️ Common Issues & Solutions

### "Invalid redirect URL" error
**Solution**: Add `http://localhost:3000/auth/callback` to Supabase redirect URLs

### "Unauthorized" error from Google
**Solution**: Check that `http://localhost:3000` is in Google Cloud Console's authorized origins

### Button doesn't work
**Solution**: 
1. Check browser console for errors
2. Verify Supabase credentials in `.env` file
3. Ensure Google OAuth is enabled in Supabase

### Redirects to callback but nothing happens
**Solution**: Clear browser cache and cookies, then try again

## 📝 Next Steps

1. ✅ Verify OAuth redirect URL in Supabase
2. ✅ Test login with Google
3. ✅ Test signup with Google
4. ✅ Verify redirection to dashboard works

## 🚀 Production Deployment

When deploying to production:

1. Add your production URL to Supabase redirect URLs
2. Add your production URL to Google Cloud Console
3. Both should look like:
   ```
   https://your-app.vercel.app/auth/callback
   ```

---

**Everything is ready! Just verify your Supabase OAuth settings and test the Google login!** 🎉
