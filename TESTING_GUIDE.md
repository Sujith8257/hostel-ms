# Testing Supabase Authentication

## Manual Testing Instructions

Since the Supabase CLI is not available, you can test the authentication directly through the application:

### 1. Create Test Users via Signup

1. Navigate to the signup page: `http://localhost:5173/signup`
2. Create test accounts with these details:

**Admin User:**
- Email: `admin@hostelms.com`
- Password: `admin123`
- Full Name: `System Administrator`
- Role: `System Administrator`

**Warden User:**
- Email: `warden@hostelms.com`
- Password: `warden123`
- Full Name: `Hostel Warden`
- Role: `Warden`

**Student User:**
- Email: `student@hostelms.com`
- Password: `student123`
- Full Name: `Test Student`
- Role: `Student`

### 2. Add Sample Data via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the seed data script (`supabase/seed_data.sql`) to add sample students, entry logs, and alerts

### 3. Test Authentication Flow

1. **Signup Process:**
   - Fill out the signup form
   - Check that user profile is created in the `profiles` table
   - Verify email verification works (if enabled)

2. **Login Process:**
   - Use the login page with created credentials
   - Verify dashboard redirects work properly
   - Check role-based access controls

3. **Live Data Dashboard:**
   - Navigate to Dashboard → Live Data tab
   - Verify real-time data displays correctly
   - Test the refresh functionality

### 4. Database Verification

Check in Supabase Dashboard that:
- Users are created in `auth.users` table
- Profiles are automatically created in `profiles` table
- Sample data appears in `students`, `entry_logs`, and `alerts` tables
- RLS policies are working (users can only see allowed data)

### 5. Real-time Testing

1. Open the Live Data dashboard in one browser tab
2. In another tab, use Supabase dashboard to:
   - Add a new entry log
   - Create a new alert
   - Update student information
3. Verify the Live Data dashboard updates automatically

## Expected Behavior

### Authentication
- ✅ Users can signup with valid email/password
- ✅ User profiles are automatically created
- ✅ Login/logout works correctly
- ✅ Protected routes redirect to login when not authenticated
- ✅ Role-based access control works

### Data Management
- ✅ Students data loads from Supabase
- ✅ Entry logs display with proper formatting
- ✅ Alerts show with status badges
- ✅ Real-time updates work
- ✅ Error handling for network issues

### Security
- ✅ RLS policies prevent unauthorized access
- ✅ User sessions persist across browser refreshes
- ✅ Sensitive operations require authentication
- ✅ API keys are properly configured

## Troubleshooting

### Common Issues

1. **"Invalid API key" errors:**
   - Check `.env` file has correct Supabase URL and anon key
   - Verify environment variables are loaded properly

2. **Database permission errors:**
   - Check RLS policies are enabled
   - Verify user roles match policy requirements
   - Ensure migrations were applied correctly

3. **Real-time not working:**
   - Check Supabase project has realtime enabled
   - Verify network connectivity
   - Check browser console for WebSocket errors

4. **Authentication redirects not working:**
   - Clear browser storage/cookies
   - Check React Router setup
   - Verify AuthContext provider wraps the app

### Debug Commands

```javascript
// In browser console, check current user:
console.log('Current user:', await supabase.auth.getUser());

// Check session:
console.log('Session:', await supabase.auth.getSession());

// Test database connection:
console.log('Students:', await supabase.from('students').select('*'));
```

## Next Steps

1. Install Supabase CLI for easier development:
   ```bash
   npm install -g supabase
   supabase init
   supabase start
   ```

2. Set up local development environment
3. Configure email templates for better UX
4. Add more comprehensive error handling
5. Implement advanced features like password reset