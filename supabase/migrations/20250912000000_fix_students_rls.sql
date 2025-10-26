-- Temporary fix for RLS policies on students table
-- This allows authenticated users to manage students without strict role checks
-- For production, this should be replaced with proper role-based policies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;

-- Create more permissive policies for development
-- Allow authenticated users to view students
CREATE POLICY "authenticated_users_can_view_students"
ON public.students FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert students
CREATE POLICY "authenticated_users_can_insert_students"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update students
CREATE POLICY "authenticated_users_can_update_students"
ON public.students FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete students
CREATE POLICY "authenticated_users_can_delete_students"
ON public.students FOR DELETE
TO authenticated
USING (true);

-- For development/testing only: Allow anonymous users to insert
-- Remove this policy in production!
CREATE POLICY "anon_can_insert_students_for_dev"
ON public.students FOR INSERT
TO anon
WITH CHECK (true);

-- Also allow anon users to view for testing
CREATE POLICY "anon_can_view_students_for_dev"
ON public.students FOR SELECT
TO anon
USING (true);

