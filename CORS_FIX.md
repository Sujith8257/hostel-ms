# CORS Configuration Fix for Supabase

## The Issue
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://omnmyjuqygveshjkcebo.supabase.co/auth/v1/token?grant_type=password. (Reason: CORS request did not succeed).
```

This happens because Supabase needs to be configured to allow requests from your local development server.

## Solution Steps

### 1. Configure CORS in Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `omnmyjuqygveshjkcebo`
3. **Navigate to Settings → API**
4. **Add your local development URL to the allowed origins**:
   - Find the "Site URL" or "Allowed Origins" section
   - Add: `http://localhost:5173`
   - Add: `http://127.0.0.1:5173`
   - Also add: `http://localhost:3000` (for backup)

### 2. Update Authentication Settings

1. **Go to Authentication → Settings**
2. **Site URL**: Set to `http://localhost:5173`
3. **Redirect URLs**: Add:
   - `http://localhost:5173/**`
   - `http://127.0.0.1:5173/**`

### 3. Verify Environment Variables

Check your `.env` file has the correct values:

```env
VITE_SUPABASE_PROJECT_ID="omnmyjuqygveshjkcebo"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://omnmyjuqygveshjkcebo.supabase.co"
```

### 4. Restart Development Server

After making changes to Supabase settings:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
bun run dev
# or
npm run dev
```

## Alternative Quick Fix

If you need to test immediately, you can also:

1. **Disable CORS temporarily in your browser** (NOT recommended for production):
   - Chrome: Start with `--disable-web-security --user-data-dir="/tmp/chrome_dev"`
   - Firefox: Set `security.fileuri.strict_origin_policy` to `false` in about:config

2. **Use a different port** that might already be configured:
   ```bash
   # Try port 3000
   vite --port 3000
   ```

## Expected Supabase Dashboard Settings

### Authentication Settings:
- **Site URL**: `http://localhost:5173`
- **Redirect URLs**: 
  - `http://localhost:5173/**`
  - `http://127.0.0.1:5173/**`
- **JWT expiry**: 3600 seconds (default)
- **Disable signup**: false (for testing)

### API Settings:
- **Auto schema generation**: enabled
- **Max rows**: 1000 (default)

## Testing After Fix

1. **Clear browser cache and storage**
2. **Restart development server**
3. **Try to signup/login again**
4. **Check browser console for errors**

## If Still Not Working

1. **Check Supabase project status**: Ensure it's not paused
2. **Verify API keys**: Make sure they're correct and active
3. **Check network**: Try different network/VPN
4. **Browser issues**: Try incognito mode or different browser

## Production Deployment Note

When deploying to production, make sure to:
1. Update Site URL to your production domain
2. Update Redirect URLs to match your production URLs
3. Remove localhost URLs from allowed origins
4. Update environment variables for production

## Contact Support

If the issue persists:
1. Check Supabase status page
2. Contact Supabase support with your project ID
3. Provide the exact error message and browser/OS details