# Debugging Student Add Feature

## Issue
The "Add Student" button is not working.

## How to Debug

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for any errors when you:
- Click "Add Student" button
- Fill in the form
- Click "Add Student" in the dialog

### 2. Check Network Tab
In Developer Tools, go to the Network tab and look for requests to Supabase when you click "Add Student". Look for:
- Any 400/500 error responses
- What data is being sent
- What error message is returned

### 3. Verify Environment Variables
Check that these variables are set in your `.env` file:
```env
VITE_SUPABASE_URL="https://omnmyjuqygveshjkcebo.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbG..."
```

### 4. Test Supabase Connection
Run this in the browser console:
```javascript
// Check if Supabase is configured
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + '...');

// Test database connection
import { supabase } from './lib/supabase';

const { data, error } = await supabase.from('students').select('count').single();
console.log('Database connection test:', { data, error });
```

### 5. Check Database Table Structure
Verify the `students` table exists in your Supabase project and has the correct columns:
- id (uuid, primary key)
- register_number (text)
- full_name (text)
- email (text, nullable)
- phone (text, nullable)
- hostel_status (text)
- room_number (text, nullable)
- face_embedding (bytea, nullable)
- profile_image_url (text, nullable)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)

### 6. Common Issues

#### Issue 1: Row Level Security (RLS)
If RLS is enabled on the `students` table and you don't have policies set up, you won't be able to insert data.

**Solution**: Disable RLS temporarily for testing or add a policy:
```sql
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
```

Or add a policy:
```sql
CREATE POLICY "Enable insert for authenticated users" 
ON students FOR INSERT 
TO authenticated 
WITH CHECK (true);
```

#### Issue 2: Missing Required Fields
Make sure you're filling in at least:
- Register Number
- Full Name

#### Issue 3: Duplicate Register Number
If you're trying to add a student with a register_number that already exists, it will fail due to unique constraint.

## Expected Behavior

When you click "Add Student":
1. Dialog opens
2. You fill in the form (at least register_number and full_name are required)
3. Click "Add Student" button in the dialog
4. The app calls `studentService.createStudent()` which inserts into Supabase
5. If successful:
   - Shows "Student added successfully" toast
   - Dialog closes
   - Student list reloads showing the new student
6. If it fails:
   - Shows error toast with the error message
   - Check browser console for details

## Testing Steps

1. Open the Students page
2. Click "Add Student" button
3. Fill in the form:
   - Register Number: `TEST001`
   - Full Name: `Test Student`
   - Email: `test@example.com`
   - Phone: `1234567890`
   - Hostel Status: `resident`
   - Room Number: `A-101`
4. Click "Add Student"
5. Check browser console for any errors
6. Check if success toast appears
7. Check if student appears in the list

## If It Still Doesn't Work

Check these logs in the browser console:
- "Error adding student: [error message]"
- Any Supabase error messages
- Any network errors

Share the exact error message you see in the console.

