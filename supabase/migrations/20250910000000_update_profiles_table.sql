-- Add additional fields to profiles table for signup form
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS organization TEXT,
ADD COLUMN IF NOT EXISTS justification TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, role, phone, organization, justification, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'warden')::app_role,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'organization',
        NEW.raw_user_meta_data->>'justification',
        CASE 
            WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'warden') = 'warden' THEN true
            ELSE false
        END
    );
    RETURN NEW;
END;
$$;

-- Create index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Update RLS policy to check if user is active
CREATE POLICY "Active users can access system"
ON public.profiles FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id AND is_active = true
);

-- Admin policy to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin'
);