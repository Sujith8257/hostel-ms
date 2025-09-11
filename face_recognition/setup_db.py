#!/usr/bin/env python3
"""
Database migration script for face recognition service
Ensures the students table has the correct schema for face embeddings
"""

import os
from dotenv import load_dotenv
from supabase import create_client
import sys

load_dotenv()

def setup_database():
    """Set up the database schema for face recognition"""
    try:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not key:
            print("❌ Missing Supabase credentials. Check your .env file.")
            return False
            
        supabase = create_client(url, key)
        
        # Check if students table exists and has face_embedding column
        print("🔍 Checking students table schema...")
        
        # Try to query the table structure
        try:
            result = supabase.table('students').select('face_embedding').limit(1).execute()
            print("✅ Students table with face_embedding column found")
            return True
        except Exception as e:
            print(f"⚠️  Students table check failed: {e}")
            print("📝 You may need to run the following SQL in Supabase:")
            print_schema_sql()
            return False
            
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False

def print_schema_sql():
    """Print the SQL schema for manual execution"""
    sql = """
-- Create hostel_status enum if it doesn't exist
CREATE TYPE IF NOT EXISTS hostel_status AS ENUM ('resident', 'day_scholar', 'alumni');

-- Create students table with face recognition support
CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  register_number text NOT NULL,
  full_name text NOT NULL,
  email text NULL,
  phone text NULL,
  hostel_status public.hostel_status NOT NULL DEFAULT 'resident'::hostel_status,
  room_number text NULL,
  face_embedding bytea NULL,
  profile_image_url text NULL,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  building_id uuid NULL,
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_register_number_key UNIQUE (register_number)
);

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at column
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster face recognition queries
CREATE INDEX IF NOT EXISTS idx_students_register_number_active 
ON students(register_number) WHERE is_active = true;

-- Grant necessary permissions (adjust as needed)
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
"""
    print("\n" + "="*80)
    print("SQL SCHEMA TO EXECUTE IN SUPABASE:")
    print("="*80)
    print(sql)
    print("="*80)

if __name__ == "__main__":
    print("Face Recognition Database Setup")
    print("=" * 50)
    
    success = setup_database()
    
    if success:
        print("\n✅ Database setup completed successfully!")
        print("   The face recognition service is ready to use.")
    else:
        print("\n❌ Database setup incomplete.")
        print("   Please run the SQL schema manually in Supabase.")
        sys.exit(1)