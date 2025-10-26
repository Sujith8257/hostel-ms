# Fix for "Add Student" Not Working

## Problem
The "Add Student" feature is not working because of Row Level Security (RLS) policies on the `students` table.

## Root Cause
The Supabase database has strict RLS policies that only allow authenticated users with the 'admin' role to insert students. If you're not logged in or don't have the right role, the insert will fail.

## Solution

### Option 1: Apply the Migration (Recommended)
I've created a migration file that makes the RLS policies less restrictive for development:

1. **Apply the migration to your Supabase database:**
   ```bash
   supabase db push
   ```
   
   Or manually run the SQL in the Supabase dashboard:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Open the file `supabase/migrations/20250912000000_fix_students_rls.sql`
   - Copy and paste the SQL
   - Click "Run"

2. **Verify the migration was applied:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'students';
   ```

### Option 2: Disable RLS Temporarily (Quick Fix)
If you want to quickly test without applying the migration:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run this command:
   ```sql
   ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
   ```

⚠️ **Warning**: This disables all security on the students table. Only do this for local development/testing.

### Option 3: Ensure You're Authenticated as Admin
If you want to keep the strict security:

1. Make sure you're logged in to the application
2. Check that your user has the 'admin' role in the `profiles` table
3. Verify your authentication session is active

## Testing After the Fix

1. Open the Students page
2. Click "Add Student"
3. Fill in the form (Register Number and Full Name are required)
4. Click "Add Student"
5. Check the browser console (F12) for any errors
6. You should see:
   - Console log: "Adding student with data: ..."
   - Console log: "Student created successfully: ..."
   - Toast notification: "Student added successfully"
   - The student should appear in the list

## What Changed in the Code

1. **src/lib/services.ts**: Added `face_embedding` to insert/update operations
2. **src/pages/StudentsPage.tsx**: 
   - Updated `loadData()` to try database first, fallback to CSV
   - Added detailed console logging to `onAddStudent()`
   - Made it reload data after adding a student
3. **Created migration**: `supabase/migrations/20250912000000_fix_students_rls.sql` to fix RLS policies

## Debugging

If it still doesn't work, check:

1. **Browser Console (F12)**: Look for error messages
2. **Network Tab**: Check for failed requests to Supabase
3. **Application**: Make sure you're logged in as an admin

Common error messages and solutions:

| Error Message | Solution |
|--------------|----------|
| "new row violates row-level security policy" | Apply the migration file above |
| "permission denied for table students" | Run Option 1 or 2 above |
| "column 'register_number' has unique constraint violation" | You're trying to add a duplicate register number |
| "Missing Supabase environment variables" | Check your `.env` file |

## Production Deployment

For production, you should:
1. Remove the "anon" (anonymous) access policies
2. Keep only authenticated user policies
3. Implement proper role-based access control
4. Add logging and monitoring

The migration file includes both policies - remove the anon policies before going to production.

