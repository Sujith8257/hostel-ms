-- Extend role enum to include new hierarchy roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hostel_director';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'deputy_warden';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'assistant_warden';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'caretaker';

-- Create hostel buildings table
CREATE TABLE IF NOT EXISTS public.hostel_buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    total_floors INTEGER NOT NULL DEFAULT 1,
    total_rooms INTEGER NOT NULL DEFAULT 0,
    capacity INTEGER NOT NULL DEFAULT 0,
    director_id UUID REFERENCES public.profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create staff assignments table
CREATE TABLE IF NOT EXISTS public.staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.profiles(id) NOT NULL,
    building_id UUID REFERENCES public.hostel_buildings(id),
    floor_numbers INTEGER[],
    assignment_type VARCHAR(50) NOT NULL DEFAULT 'building', -- 'building', 'floor', 'section'
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create maintenance requests table
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES public.hostel_buildings(id),
    room_number VARCHAR(20),
    reported_by UUID REFERENCES public.profiles(id) NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id),
    issue_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create attendance logs table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by UUID REFERENCES public.profiles(id) NOT NULL,
    building_id UUID REFERENCES public.hostel_buildings(id),
    floor_number INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES public.hostel_buildings(id),
    floor_number INTEGER,
    room_number VARCHAR(20),
    incident_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    reported_by UUID REFERENCES public.profiles(id) NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add phone field to profiles table if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(15),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add building_id to students table for better organization
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES public.hostel_buildings(id);

-- Enable RLS for new tables
ALTER TABLE public.hostel_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Create updated timestamp triggers for new tables
CREATE TRIGGER update_hostel_buildings_updated_at
    BEFORE UPDATE ON public.hostel_buildings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_assignments_updated_at
    BEFORE UPDATE ON public.staff_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at
    BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for hostel_buildings
CREATE POLICY "Directors can manage their buildings"
ON public.hostel_buildings FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director') OR
    director_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can view buildings they're assigned to"
ON public.hostel_buildings FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director') OR
    id IN (
        SELECT building_id FROM public.staff_assignments 
        WHERE staff_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        AND is_active = true
    )
);

-- RLS Policies for staff_assignments
CREATE POLICY "Admins and directors can manage staff assignments"
ON public.staff_assignments FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director')
);

CREATE POLICY "Staff can view their own assignments"
ON public.staff_assignments FOR SELECT
TO authenticated
USING (
    staff_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for maintenance_requests
CREATE POLICY "Authenticated users can view maintenance requests"
ON public.maintenance_requests FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director') OR
    reported_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can create maintenance requests"
ON public.maintenance_requests FOR INSERT
TO authenticated
WITH CHECK (
    reported_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for attendance_logs
CREATE POLICY "Staff can manage attendance for their assigned buildings"
ON public.attendance_logs FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director') OR
    building_id IN (
        SELECT building_id FROM public.staff_assignments 
        WHERE staff_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        AND is_active = true
    )
);

-- RLS Policies for incidents
CREATE POLICY "Staff can manage incidents for their assigned areas"
ON public.incidents FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director') OR
    reported_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    building_id IN (
        SELECT building_id FROM public.staff_assignments 
        WHERE staff_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        AND is_active = true
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_assignments_staff_id ON public.staff_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_building_id ON public.staff_assignments(building_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_building_id ON public.maintenance_requests(building_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_student_date ON public.attendance_logs(student_id, date);
CREATE INDEX IF NOT EXISTS idx_incidents_building_status ON public.incidents(building_id, status);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.hostel_buildings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Insert sample data

-- Sample hostel building
INSERT INTO public.hostel_buildings (name, address, total_floors, total_rooms, capacity)
VALUES 
('Block A - Men''s Hostel', 'University Campus, Block A', 4, 120, 240),
('Block B - Women''s Hostel', 'University Campus, Block B', 3, 90, 180)
ON CONFLICT DO NOTHING;

-- Update students to belong to buildings
UPDATE public.students 
SET building_id = (SELECT id FROM public.hostel_buildings WHERE name LIKE 'Block A%' LIMIT 1)
WHERE register_number IN ('REG001', 'REG003');

UPDATE public.students 
SET building_id = (SELECT id FROM public.hostel_buildings WHERE name LIKE 'Block B%' LIMIT 1)
WHERE register_number = 'REG002';