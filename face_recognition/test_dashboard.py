#!/usr/bin/env python3
"""
Test script for the enhanced face recognition dashboard
"""

import requests
import json
import sys

def test_dashboard():
    """Test the dashboard endpoints"""
    base_url = "http://localhost:8005"
    
    print("🧪 Testing Face Recognition Dashboard")
    print("=" * 50)
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check: OK")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
        print("   Make sure the server is running: python3.9 -m uvicorn app:app --host 0.0.0.0 --port 8005 --reload")
        return False
    
    # Test dashboard endpoint
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200 and "Face Recognition Dashboard" in response.text:
            print("✅ Dashboard HTML: OK")
        else:
            print(f"❌ Dashboard failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Dashboard error: {e}")
    
    # Test stats endpoint
    try:
        response = requests.get(f"{base_url}/api/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Stats API: OK")
            print(f"   Total Students: {stats.get('total_students', 'N/A')}")
            print(f"   Today's Entries: {stats.get('today_entries', 'N/A')}")
            print(f"   Present Today: {stats.get('present_today', 'N/A')}")
        else:
            print(f"❌ Stats API failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Stats API error: {e}")
    
    # Test recent entries endpoint
    try:
        response = requests.get(f"{base_url}/api/recent_entries")
        if response.status_code == 200:
            print("✅ Recent entries API: OK")
        else:
            print(f"❌ Recent entries failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Recent entries error: {e}")
    
    # Test attendance endpoint
    try:
        response = requests.get(f"{base_url}/api/attendance_today")
        if response.status_code == 200:
            print("✅ Attendance API: OK")
        else:
            print(f"❌ Attendance API failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Attendance API error: {e}")
    
    print("\n🎉 Dashboard testing completed!")
    print(f"📱 Open your browser to: {base_url}")
    return True

if __name__ == "__main__":
    success = test_dashboard()
    if not success:
        sys.exit(1)