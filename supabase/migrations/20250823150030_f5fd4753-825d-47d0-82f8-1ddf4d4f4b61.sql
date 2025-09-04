-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'warden', 'student');

-- Create enum for hostel status
CREATE TYPE public.hostel_status AS ENUM ('resident', 'day_scholar', 'former_resident');

-- Create enum for entry/exit type
CREATE TYPE public.entry_type AS ENUM ('entry', 'exit');

-- Create profiles table for user management
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role app_role DEFAULT 'warden',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    hostel_status hostel_status NOT NULL DEFAULT 'resident',
    room_number TEXT,
    face_embedding BYTEA, -- Store face recognition data
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create entry/exit logs table
CREATE TABLE public.entry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    register_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    entry_type entry_type NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    confidence_score DECIMAL(3,2), -- Face recognition confidence
    image_url TEXT,
    location TEXT DEFAULT 'Main Gate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create alerts table for unknown faces
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    confidence_score DECIMAL(3,2),
    location TEXT DEFAULT 'Main Gate',
    status TEXT DEFAULT 'pending', -- pending, resolved, false_alarm
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for students (admins and wardens can access)
CREATE POLICY "Authenticated users can view students"
ON public.students FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'warden')
);

CREATE POLICY "Admins can manage students"
ON public.students FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin'
);

-- RLS Policies for entry logs
CREATE POLICY "Authenticated users can view entry logs"
ON public.entry_logs FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'warden')
);

CREATE POLICY "System can insert entry logs"
ON public.entry_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies for alerts
CREATE POLICY "Authenticated users can view alerts"
ON public.alerts FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'warden')
);

CREATE POLICY "Admins can manage alerts"
ON public.alerts FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin'
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        'warden'
    );
    RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data
INSERT INTO public.students (register_number, full_name, email, phone, hostel_status, room_number) VALUES
('REG001', 'John Doe', 'john.doe@example.com', '9876543210', 'resident', 'A101'),
('REG002', 'Jane Smith', 'jane.smith@example.com', '9876543211', 'resident', 'A102'),
('REG003', 'Mike Johnson', 'mike.johnson@example.com', '9876543212', 'day_scholar', NULL);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.entry_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;