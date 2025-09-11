#!/usr/bin/env python3
"""
Example client for testing the face recognition API
"""

import requests
import sys
import os

API_BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✅ API is healthy")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Could not connect to API: {e}")
        return False

def register_student(register_number, full_name, image_path):
    """Register a student with face recognition"""
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            data = {
                'register_number': register_number,
                'full_name': full_name
            }
            
            response = requests.post(f"{API_BASE_URL}/register/", files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Registration successful: {result['message']}")
                return True
            else:
                print(f"❌ Registration failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return False

def authenticate_student(register_number, image_path):
    """Authenticate a student using face recognition"""
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            data = {'register_number': register_number}
            
            response = requests.post(f"{API_BASE_URL}/authenticate/", files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Authentication result: {result['message']}")
                print(f"   Success: {result['success']}")
                print(f"   Similarity: {result['similarity']:.3f}")
                return result['success']
            else:
                print(f"❌ Authentication failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return False

def get_student_info(register_number):
    """Get student information"""
    try:
        response = requests.get(f"{API_BASE_URL}/student/{register_number}")
        
        if response.status_code == 200:
            result = response.json()
            student = result['student']
            print(f"✅ Student found:")
            print(f"   Register Number: {student['register_number']}")
            print(f"   Full Name: {student['full_name']}")
            print(f"   Active: {student['is_active']}")
            return True
        else:
            print(f"❌ Student not found: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error getting student info: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python example_client.py health")
        print("  python example_client.py register <register_number> <full_name> <image_path>")
        print("  python example_client.py auth <register_number> <image_path>")
        print("  python example_client.py info <register_number>")
        return
    
    command = sys.argv[1]
    
    if command == "health":
        test_health()
    
    elif command == "register":
        if len(sys.argv) != 5:
            print("Usage: python example_client.py register <register_number> <full_name> <image_path>")
            return
        register_number, full_name, image_path = sys.argv[2:5]
        register_student(register_number, full_name, image_path)
    
    elif command == "auth":
        if len(sys.argv) != 4:
            print("Usage: python example_client.py auth <register_number> <image_path>")
            return
        register_number, image_path = sys.argv[2:4]
        authenticate_student(register_number, image_path)
    
    elif command == "info":
        if len(sys.argv) != 3:
            print("Usage: python example_client.py info <register_number>")
            return
        register_number = sys.argv[2]
        get_student_info(register_number)
    
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()