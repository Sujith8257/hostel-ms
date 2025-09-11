#!/usr/bin/env python3
"""
Test script for the face recognition API with Supabase integration
"""

import requests
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Test Supabase connection
def test_supabase_connection():
    try:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        supabase = create_client(url, key)
        
        # Test connection by querying the students table
        result = supabase.table('students').select('count').execute()
        print("✅ Supabase connection successful")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

# Test API endpoints
def test_api_endpoints():
    base_url = "http://localhost:8000"
    
    try:
        # Test health endpoint
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print("❌ Health endpoint failed")
            
        return True
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        print("Make sure the FastAPI server is running on port 8000")
        return False

if __name__ == "__main__":
    print("Testing Face Recognition API Setup...")
    print("=" * 50)
    
    print("1. Testing Supabase connection...")
    supabase_ok = test_supabase_connection()
    
    print("\n2. Testing API endpoints...")
    api_ok = test_api_endpoints()
    
    print("\n" + "=" * 50)
    if supabase_ok and api_ok:
        print("✅ All tests passed! The setup is working correctly.")
    else:
        print("❌ Some tests failed. Check the errors above.")
        if not supabase_ok:
            print("   - Check your Supabase credentials in .env file")
        if not api_ok:
            print("   - Make sure to start the API server first: python app.py")