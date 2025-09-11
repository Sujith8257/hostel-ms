-- Create entry_type enum
CREATE TYPE IF NOT EXISTS entry_type AS ENUM ('entry', 'exit', 'failed_attempt');

-- Create entry_logs table
CREATE TABLE IF NOT EXISTS public.entry_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NULL,
  register_number text NOT NULL,
  student_name text NOT NULL,
  entry_type public.entry_type NOT NULL,
  timestamp timestamp with time zone NULL DEFAULT now(),
  confidence_score numeric(3, 2) NULL,
  image_url text NULL,
  location text NULL DEFAULT 'Main Gate'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT entry_logs_pkey PRIMARY KEY (id),
  CONSTRAINT entry_logs_student_id_fkey FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
);

-- Create attendance_logs table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  date date NOT NULL,
  status character varying(20) NULL DEFAULT 'present'::character varying,
  marked_by uuid NOT NULL,
  building_id uuid NULL,
  floor_number integer NULL,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT attendance_logs_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_logs_building_id_fkey FOREIGN KEY (building_id) REFERENCES hostel_buildings (id),
  CONSTRAINT attendance_logs_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES profiles (id),
  CONSTRAINT attendance_logs_student_id_fkey FOREIGN KEY (student_id) REFERENCES students (id),
  CONSTRAINT attendance_logs_status_check CHECK (
    (status)::text = ANY (
      ARRAY[
        'present'::character varying,
        'absent'::character varying,
        'late'::character varying,
        'excused'::character varying
      ]::text[]
    )
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_logs_student_date 
ON public.attendance_logs USING btree (student_id, date);

CREATE INDEX IF NOT EXISTS idx_entry_logs_timestamp 
ON public.entry_logs USING btree (timestamp);

CREATE INDEX IF NOT EXISTS idx_entry_logs_register_number 
ON public.entry_logs USING btree (register_number);

CREATE INDEX IF NOT EXISTS idx_entry_logs_student_id 
ON public.entry_logs USING btree (student_id);

-- Enable RLS (Row Level Security) for security
ALTER TABLE entry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON entry_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON entry_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON attendance_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON attendance_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON attendance_logs FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT ALL ON entry_logs TO anon, authenticated;
GRANT ALL ON attendance_logs TO anon, authenticated;