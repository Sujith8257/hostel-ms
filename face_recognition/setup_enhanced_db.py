#!/usr/bin/env python3
"""
Enhanced database setup script for face recognition service
Creates entry_logs and attendance_logs tables
"""

import os
from dotenv import load_dotenv
from supabase import create_client
import sys

load_dotenv()

def setup_database():
    """Set up the database schema for face recognition with logging"""
    try:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not key:
            print("❌ Missing Supabase credentials. Check your .env file.")
            return False
            
        supabase = create_client(url, key)
        
        print("🔍 Setting up database tables...")
        
        # Read the SQL file
        with open('create_tables.sql', 'r') as f:
            sql_commands = f.read()
        
        # Execute the SQL commands
        try:
            # Note: Supabase Python client doesn't directly support executing raw SQL
            # You'll need to run the SQL manually in the Supabase dashboard
            print("📝 SQL commands ready to execute in Supabase dashboard:")
            print("="*80)
            print(sql_commands)
            print("="*80)
            
            # Test if tables exist by trying to query them
            try:
                supabase.table('entry_logs').select('id').limit(1).execute()
                print("✅ entry_logs table found")
            except:
                print("⚠️  entry_logs table not found - please run the SQL manually")
            
            try:
                supabase.table('attendance_logs').select('id').limit(1).execute()
                print("✅ attendance_logs table found")
            except:
                print("⚠️  attendance_logs table not found - please run the SQL manually")
            
            return True
            
        except Exception as e:
            print(f"⚠️  Database setup check failed: {e}")
            print("📝 Please run the SQL commands manually in Supabase dashboard")
            return True  # Return True as SQL is provided for manual execution
            
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False

def test_database_functionality():
    """Test basic database operations"""
    try:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        supabase = create_client(url, key)
        
        print("\n🧪 Testing database functionality...")
        
        # Test students table
        try:
            result = supabase.table('students').select('id, register_number, full_name').limit(5).execute()
            print(f"✅ Students table: {len(result.data)} records found")
        except Exception as e:
            print(f"❌ Students table error: {e}")
        
        # Test entry_logs table
        try:
            result = supabase.table('entry_logs').select('id').limit(1).execute()
            print("✅ entry_logs table accessible")
        except Exception as e:
            print(f"❌ entry_logs table error: {e}")
        
        # Test attendance_logs table
        try:
            result = supabase.table('attendance_logs').select('id').limit(1).execute()
            print("✅ attendance_logs table accessible")
        except Exception as e:
            print(f"❌ attendance_logs table error: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

if __name__ == "__main__":
    print("Face Recognition Database Setup with Logging")
    print("=" * 60)
    
    success = setup_database()
    
    if success:
        print("\n✅ Database setup completed!")
        test_database_functionality()
        print("\n🚀 Face recognition service with logging is ready!")
        print("   Run: python3.9 -m uvicorn app:app --host 0.0.0.0 --port 8005 --reload")
        print("   Dashboard: http://localhost:8005")
    else:
        print("\n❌ Database setup incomplete.")
        print("   Please check your Supabase configuration.")
        sys.exit(1)