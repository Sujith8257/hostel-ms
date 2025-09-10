-- Create room types enum
CREATE TYPE public.room_type AS ENUM ('single', 'double', 'triple', 'dormitory');

-- Create room status enum  
CREATE TYPE public.room_status AS ENUM ('available', 'occupied', 'maintenance', 'reserved');

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR(20) NOT NULL,
    building_id UUID REFERENCES public.hostel_buildings(id) NOT NULL,
    floor_number INTEGER NOT NULL,
    room_type room_type NOT NULL DEFAULT 'double',
    capacity INTEGER NOT NULL DEFAULT 2,
    current_occupancy INTEGER DEFAULT 0,
    status room_status DEFAULT 'available',
    rent_amount DECIMAL(10, 2),
    amenities TEXT[], -- Array of amenities like ['AC', 'WiFi', 'Study_Table']
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(building_id, room_number)
);

-- Create room allotments table
CREATE TABLE IF NOT EXISTS public.room_allotments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) NOT NULL,
    room_id UUID REFERENCES public.rooms(id) NOT NULL,
    allotted_by UUID REFERENCES public.profiles(id) NOT NULL,
    allotment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    vacate_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'vacated', 'transferred')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create waiting list table for room requests
CREATE TABLE IF NOT EXISTS public.room_waiting_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) NOT NULL,
    preferred_building_id UUID REFERENCES public.hostel_buildings(id),
    preferred_room_type room_type,
    preferred_floor INTEGER,
    priority_score INTEGER DEFAULT 0,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'allotted', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_allotments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_waiting_list ENABLE ROW LEVEL SECURITY;

-- Create updated timestamp triggers for new tables
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_allotments_updated_at
    BEFORE UPDATE ON public.room_allotments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_waiting_list_updated_at
    BEFORE UPDATE ON public.room_waiting_list
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for rooms
CREATE POLICY "Staff can view rooms in their assigned buildings"
ON public.rooms FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director') OR
    building_id IN (
        SELECT building_id FROM public.staff_assignments 
        WHERE staff_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        AND is_active = true
    )
);

CREATE POLICY "Admins and directors can manage rooms"
ON public.rooms FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director')
);

-- RLS Policies for room_allotments
CREATE POLICY "Staff can view allotments in their assigned buildings"
ON public.room_allotments FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director') OR
    room_id IN (
        SELECT r.id FROM public.rooms r
        JOIN public.staff_assignments sa ON r.building_id = sa.building_id
        WHERE sa.staff_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        AND sa.is_active = true
    )
);

CREATE POLICY "Authorized staff can manage room allotments"
ON public.room_allotments FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden')
);

-- RLS Policies for room_waiting_list
CREATE POLICY "Staff can view waiting list"
ON public.room_waiting_list FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden')
);

CREATE POLICY "Authorized staff can manage waiting list"
ON public.room_waiting_list FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_building_floor ON public.rooms(building_id, floor_number);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_allotments_student ON public.room_allotments(student_id);
CREATE INDEX IF NOT EXISTS idx_room_allotments_room ON public.room_allotments(room_id);
CREATE INDEX IF NOT EXISTS idx_room_allotments_status ON public.room_allotments(status);
CREATE INDEX IF NOT EXISTS idx_waiting_list_student ON public.room_waiting_list(student_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_status ON public.room_waiting_list(status);

-- Function to update room occupancy when allotment changes
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    -- Update room occupancy count
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE public.rooms 
        SET current_occupancy = current_occupancy + 1,
            status = CASE 
                WHEN current_occupancy + 1 >= capacity THEN 'occupied'::room_status 
                ELSE status 
            END
        WHERE id = NEW.room_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status = 'active' AND NEW.status != 'active' THEN
            -- Student vacated
            UPDATE public.rooms 
            SET current_occupancy = current_occupancy - 1,
                status = CASE 
                    WHEN current_occupancy - 1 = 0 THEN 'available'::room_status
                    WHEN current_occupancy - 1 < capacity AND status = 'occupied' THEN 'available'::room_status
                    ELSE status 
                END
            WHERE id = OLD.room_id;
        ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
            -- Student moved in
            UPDATE public.rooms 
            SET current_occupancy = current_occupancy + 1,
                status = CASE 
                    WHEN current_occupancy + 1 >= capacity THEN 'occupied'::room_status 
                    ELSE status 
                END
            WHERE id = NEW.room_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE public.rooms 
        SET current_occupancy = current_occupancy - 1,
            status = CASE 
                WHEN current_occupancy - 1 = 0 THEN 'available'::room_status
                WHEN current_occupancy - 1 < capacity AND status = 'occupied' THEN 'available'::room_status
                ELSE status 
            END
        WHERE id = OLD.room_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room occupancy updates
CREATE TRIGGER room_allotment_occupancy_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.room_allotments
    FOR EACH ROW
    EXECUTE FUNCTION update_room_occupancy();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_allotments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_waiting_list;

-- Insert sample rooms data
DO $$
DECLARE
    building_a_id UUID;
    building_b_id UUID;
    floor_num INTEGER;
    room_num INTEGER;
BEGIN
    -- Get building IDs
    SELECT id INTO building_a_id FROM public.hostel_buildings WHERE name LIKE 'Block A%' LIMIT 1;
    SELECT id INTO building_b_id FROM public.hostel_buildings WHERE name LIKE 'Block B%' LIMIT 1;
    
    -- Insert rooms for Building A (4 floors, 30 rooms per floor)
    IF building_a_id IS NOT NULL THEN
        FOR floor_num IN 1..4 LOOP
            FOR room_num IN 1..30 LOOP
                INSERT INTO public.rooms (
                    room_number, 
                    building_id, 
                    floor_number, 
                    room_type, 
                    capacity,
                    rent_amount,
                    amenities
                ) VALUES (
                    'A' || floor_num || LPAD(room_num::text, 2, '0'),
                    building_a_id,
                    floor_num,
                    CASE 
                        WHEN room_num <= 10 THEN 'single'::room_type
                        WHEN room_num <= 25 THEN 'double'::room_type
                        ELSE 'triple'::room_type
                    END,
                    CASE 
                        WHEN room_num <= 10 THEN 1
                        WHEN room_num <= 25 THEN 2
                        ELSE 3
                    END,
                    CASE 
                        WHEN room_num <= 10 THEN 8000.00
                        WHEN room_num <= 25 THEN 6000.00
                        ELSE 4500.00
                    END,
                    CASE 
                        WHEN room_num <= 10 THEN ARRAY['AC', 'WiFi', 'Study_Table', 'Wardrobe']
                        WHEN room_num <= 25 THEN ARRAY['Fan', 'WiFi', 'Study_Table', 'Wardrobe']
                        ELSE ARRAY['Fan', 'WiFi', 'Study_Table']
                    END
                );
            END LOOP;
        END LOOP;
    END IF;
    
    -- Insert rooms for Building B (3 floors, 30 rooms per floor)
    IF building_b_id IS NOT NULL THEN
        FOR floor_num IN 1..3 LOOP
            FOR room_num IN 1..30 LOOP
                INSERT INTO public.rooms (
                    room_number, 
                    building_id, 
                    floor_number, 
                    room_type, 
                    capacity,
                    rent_amount,
                    amenities
                ) VALUES (
                    'B' || floor_num || LPAD(room_num::text, 2, '0'),
                    building_b_id,
                    floor_num,
                    CASE 
                        WHEN room_num <= 10 THEN 'single'::room_type
                        WHEN room_num <= 25 THEN 'double'::room_type
                        ELSE 'triple'::room_type
                    END,
                    CASE 
                        WHEN room_num <= 10 THEN 1
                        WHEN room_num <= 25 THEN 2
                        ELSE 3
                    END,
                    CASE 
                        WHEN room_num <= 10 THEN 8000.00
                        WHEN room_num <= 25 THEN 6000.00
                        ELSE 4500.00
                    END,
                    CASE 
                        WHEN room_num <= 10 THEN ARRAY['AC', 'WiFi', 'Study_Table', 'Wardrobe']
                        WHEN room_num <= 25 THEN ARRAY['Fan', 'WiFi', 'Study_Table', 'Wardrobe']
                        ELSE ARRAY['Fan', 'WiFi', 'Study_Table']
                    END
                );
            END LOOP;
        END LOOP;
    END IF;
END $$;

-- Update existing students to have proper room allotments
DO $$
DECLARE
    student_rec RECORD;
    room_id_var UUID;
    admin_id UUID;
BEGIN
    -- Get admin user ID for allotment records
    SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    -- Update students with room allotments
    FOR student_rec IN 
        SELECT id, room_number, building_id 
        FROM public.students 
        WHERE room_number IS NOT NULL AND building_id IS NOT NULL
    LOOP
        -- Find matching room
        SELECT id INTO room_id_var
        FROM public.rooms 
        WHERE room_number = student_rec.room_number 
        AND building_id = student_rec.building_id;
        
        -- Create allotment record if room found
        IF room_id_var IS NOT NULL AND admin_id IS NOT NULL THEN
            INSERT INTO public.room_allotments (
                student_id, 
                room_id, 
                allotted_by, 
                allotment_date,
                status
            ) VALUES (
                student_rec.id,
                room_id_var,
                admin_id,
                CURRENT_DATE - INTERVAL '30 days',
                'active'
            ) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;