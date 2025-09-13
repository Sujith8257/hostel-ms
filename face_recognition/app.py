import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from scipy.spatial.distance import cosine
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from typing import Dict, Optional, List
import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
import io
import base64
import binascii
from datetime import datetime, date
import uuid

# Load environment variables
load_dotenv()

# ------------------------------
# Supabase Configuration
# ------------------------------
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# ------------------------------
# Load TFLite Model
# ------------------------------
interpreter = tf.lite.Interpreter(model_path="output_model.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

mp_face_detection = mp.solutions.face_detection

# ------------------------------
# Helper Functions for Supabase
# ------------------------------

def decode_base64_embedding(data: str) -> Optional[bytes]:
    """Robust base64 decoding with error handling and cleanup"""
    try:
        # Clean the string - remove any whitespace and non-base64 characters
        clean_data = ''.join(c for c in data if c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=')
        
        # Remove any existing padding
        clean_data = clean_data.rstrip('=')
        
        # Check if length is fundamentally wrong (not recoverable)
        if len(clean_data) % 4 == 1:
            # Length ending in 1 mod 4 is impossible for valid base64
            # Try to remove last character to see if it's recoverable
            clean_data = clean_data[:-1]
            if len(clean_data) % 4 == 1:
                # Still impossible, data is corrupted beyond repair
                return None
        
        # Add correct padding
        missing_padding = len(clean_data) % 4
        if missing_padding:
            clean_data += '=' * (4 - missing_padding)
        
        return base64.b64decode(clean_data)
    except Exception as e:
        print(f"Failed to decode base64: {e}")
        return None

def get_all_students(limit: int = 2000) -> List[Dict]:
    """Fetch all students from Supabase with non-null face embeddings"""
    try:
        print(f"🔍 Fetching students with face embeddings from Supabase (limit: {limit})...")
        result = supabase.table('students').select('*').eq('is_active', True).not_.is_('face_embedding', 'null').limit(limit).execute()
        print(f"   Raw result type: {type(result)}")
        print(f"   Result data type: {type(result.data) if hasattr(result, 'data') else 'No data attr'}")
        
        if result.data:
            print(f"   Found {len(result.data)} students with face embeddings")
            # Check first student structure
            if len(result.data) > 0:
                first_student = result.data[0]
                print(f"   First student keys: {list(first_student.keys())}")
                print(f"   First student register_number: {first_student.get('register_number')}")
                print(f"   First student face_embedding type: {type(first_student.get('face_embedding'))}")
        else:
            print(f"   No students with face embeddings found")
            
        return result.data if result.data else []
    except Exception as e:
        print(f"❌ Error fetching students from Supabase: {e}")
        print(f"   Exception type: {type(e)}")
        return []

def get_all_students_including_no_face(limit: int = 2000) -> List[Dict]:
    """Fetch all students from Supabase (including those without face embeddings)"""
    try:
        result = supabase.table('students').select('*').eq('is_active', True).limit(limit).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Error fetching all students from Supabase: {e}")
        return []

def save_embedding_to_supabase(register_number: str, embedding: np.ndarray, full_name: str = None) -> bool:
    """Save face embedding to Supabase students table"""
    try:
        # Convert embedding to list for JSONB storage
        embedding_list = embedding.astype(np.float32).tolist()
        
        print(f"💾 Saving embedding for student {register_number}:")
        print(f"   Original embedding shape: {embedding.shape}")
        print(f"   Converted to list length: {len(embedding_list)}")
        print(f"   List type: {type(embedding_list)}")
        print(f"   First 3 values: {embedding_list[:3]}")
        
        # Check if student already exists
        existing_student = supabase.table('students').select('*').eq('register_number', register_number).execute()
        
        if existing_student.data:
            # Update existing student with face embedding
            result = supabase.table('students').update({
                'face_embedding': embedding_list,
                'updated_at': datetime.now().isoformat()
            }).eq('register_number', register_number).execute()
            
            # Log the embedding update
            student_info = existing_student.data[0]
            log_entry(
                register_number=register_number,
                student_name=student_info.get('full_name', f"Student {register_number}"),
                entry_type='system_update',
                confidence_score=1.0,
                location='Face Recognition System'
            )
        else:
            # Create new student record
            result = supabase.table('students').insert({
                'register_number': register_number,
                'full_name': full_name or f"Student {register_number}",
                'face_embedding': embedding_list,
                'hostel_status': 'resident',
                'is_active': True
            }).execute()
            
            # Log the new registration
            log_entry(
                register_number=register_number,
                student_name=full_name or f"Student {register_number}",
                entry_type='registration',
                confidence_score=1.0,
                location='Face Recognition System'
            )
        
        print(f"✅ Successfully saved embedding for {register_number} to Supabase!")
        print(f"   Storage format: JSONB list")
        print(f"   Embedding length: {len(embedding_list)}")
        
        return True
    except Exception as e:
        print(f"Error saving embedding to Supabase: {e}")
        return False

def get_embedding_from_supabase(register_number: str) -> Optional[np.ndarray]:
    """Retrieve face embedding from Supabase students table"""
    try:
        print(f"📥 Retrieving embedding for student {register_number} from Supabase...")
        result = supabase.table('students').select('face_embedding').eq('register_number', register_number).eq('is_active', True).execute()
        
        if result.data and result.data[0]['face_embedding']:
            # For JSONB column, we get a list directly
            embedding_data = result.data[0]['face_embedding']
            print(f"   Raw data type from Supabase: {type(embedding_data)}")
            if isinstance(embedding_data, list):
                print(f"   List length: {len(embedding_data)}")
                print(f"   First 3 values: {embedding_data[:3]}")
            
            if isinstance(embedding_data, list):
                # Convert list to numpy array (JSONB format)
                embedding = np.array(embedding_data, dtype=np.float32)
            elif isinstance(embedding_data, str):
                # Try to parse as JSON array first
                try:
                    parsed_data = json.loads(embedding_data)
                    if isinstance(parsed_data, list):
                        embedding = np.array(parsed_data, dtype=np.float32)
                        print(f"   Parsed JSON string to array with {len(parsed_data)} elements")
                    else:
                        raise ValueError("Parsed data is not a list")
                except (json.JSONDecodeError, ValueError):
                    # Handle legacy base64 encoded strings (for backward compatibility)
                    embedding_bytes = decode_base64_embedding(embedding_data)
                    if embedding_bytes is None:
                        print(f"Failed to decode legacy embedding for {register_number}")
                        return None
                    
                    try:
                        embedding = np.frombuffer(embedding_bytes, dtype=np.float32)
                    except ValueError as e:
                        print(f"Failed to convert legacy bytes to array for {register_number}: {e}")
                        return None
            elif isinstance(embedding_data, bytes):
                # Handle legacy bytea format (for backward compatibility)
                embedding = np.frombuffer(embedding_data, dtype=np.float32)
            else:
                print(f"Unexpected embedding data type for {register_number}: {type(embedding_data)}")
                return None
            
            # Validate embedding size (flexible for different model versions)
            expected_sizes = [120, 128, 256, 512]  # Support various embedding dimensions
            if len(embedding) not in expected_sizes:
                print(f"❌ Invalid embedding size for {register_number}: {len(embedding)} (expected one of {expected_sizes})")
                return None
            
            print(f"✅ Successfully retrieved embedding for {register_number}:")
            print(f"   Shape: {embedding.shape}")
            print(f"   Data type: {embedding.dtype}")
            print(f"   Min: {embedding.min():.6f}, Max: {embedding.max():.6f}")
            print(f"   Mean: {embedding.mean():.6f}")
            print(f"   L2 norm: {np.linalg.norm(embedding):.6f}")
                
            return embedding
        else:
            print(f"❌ No face embedding found for student {register_number}")
        return None
    except Exception as e:
        print(f"Error retrieving embedding from Supabase: {e}")
        return None

def student_exists(register_number: str) -> bool:
    """Check if student exists in Supabase"""
    try:
        result = supabase.table('students').select('id').eq('register_number', register_number).eq('is_active', True).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error checking student existence: {e}")
        return False

def log_entry(register_number: str, student_name: str, entry_type: str = 'entry', confidence_score: float = None, image_url: str = None, location: str = 'Main Gate') -> bool:
    """Log entry to entry_logs table"""
    try:
        # Get student ID
        student_result = supabase.table('students').select('id').eq('register_number', register_number).eq('is_active', True).execute()
        
        if not student_result.data:
            print(f"Student {register_number} not found")
            return False
        
        student_id = student_result.data[0]['id']
        
        # Insert entry log
        entry_data = {
            'student_id': student_id,
            'register_number': register_number,
            'student_name': student_name,
            'entry_type': entry_type,
            'confidence_score': confidence_score,
            'image_url': image_url,
            'location': location,
            'timestamp': datetime.now().isoformat(),
            'created_at': datetime.now().isoformat()
        }
        
        result = supabase.table('entry_logs').insert(entry_data).execute()
        return True
    except Exception as e:
        print(f"Error logging entry: {e}")
        return False

def log_attendance(student_id: str, marked_by: str, status: str = 'present', building_id: str = None, floor_number: int = None, notes: str = None) -> bool:
    """Log attendance to attendance_logs table"""
    try:
        today = date.today()
        
        # Check if attendance already exists for today
        existing = supabase.table('attendance_logs').select('id').eq('student_id', student_id).eq('date', today.isoformat()).execute()
        
        if existing.data:
            # Update existing attendance
            result = supabase.table('attendance_logs').update({
                'status': status,
                'marked_by': marked_by,
                'building_id': building_id,
                'floor_number': floor_number,
                'notes': notes,
                'created_at': datetime.now().isoformat()
            }).eq('id', existing.data[0]['id']).execute()
        else:
            # Create new attendance record
            attendance_data = {
                'student_id': student_id,
                'date': today.isoformat(),
                'status': status,
                'marked_by': marked_by,
                'building_id': building_id,
                'floor_number': floor_number,
                'notes': notes,
                'created_at': datetime.now().isoformat()
            }
            result = supabase.table('attendance_logs').insert(attendance_data).execute()
        
        return True
    except Exception as e:
        print(f"Error logging attendance: {e}")
        return False

def get_student_by_register_number(register_number: str) -> Optional[Dict]:
    """Get full student information by register number"""
    try:
        result = supabase.table('students').select('*').eq('register_number', register_number).eq('is_active', True).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error getting student info: {e}")
        return None

# ------------------------------
# Preprocess face
# ------------------------------
def preprocess_face(image):
    with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
        results = face_detection.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        if not results.detections:
            return None
        bbox = results.detections[0].location_data.relative_bounding_box
        h, w, _ = image.shape
        x1, y1 = max(0, int(bbox.xmin * w)), max(0, int(bbox.ymin * h))
        x2, y2 = min(w, x1 + int(bbox.width * w)), min(h, y1 + int(bbox.height * h))
        face = image[y1:y2, x1:x2]
        if face.size == 0:
            return None
        face = cv2.resize(face, (112, 112))
        face = face.astype("float32") / 127.5 - 1.0
        return np.expand_dims(face, axis=0)

# ------------------------------
# Get embedding
# ------------------------------
def get_embedding(face_img):
    interpreter.set_tensor(input_details[0]['index'], face_img)
    interpreter.invoke()
    embedding = interpreter.get_tensor(output_details[0]['index']).flatten()
    # L2 normalize
    embedding = embedding / np.linalg.norm(embedding)
    
    # Console log the extracted embedding details
    print(f"🔍 Extracted face embedding:")
    print(f"   Shape: {embedding.shape}")
    print(f"   Length: {len(embedding)}")
    print(f"   Data type: {embedding.dtype}")
    print(f"   Min value: {embedding.min():.6f}")
    print(f"   Max value: {embedding.max():.6f}")
    print(f"   Mean: {embedding.mean():.6f}")
    print(f"   L2 norm: {np.linalg.norm(embedding):.6f}")
    print(f"   First 5 values: {embedding[:5]}")
    
    return embedding

# ------------------------------
# Dashboard HTML Template
# ------------------------------
DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Face Recognition Dashboard - Hostel Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --background: #faf9f5;
            --foreground: #3d3929;
            --card: #faf9f5;
            --card-foreground: #141413;
            --popover: #ffffff;
            --popover-foreground: #28261b;
            --primary: #c96442;
            --primary-foreground: #ffffff;
            --secondary: #e9e6dc;
            --secondary-foreground: #535146;
            --muted: #ede9de;
            --muted-foreground: #83827d;
            --accent: #e9e6dc;
            --accent-foreground: #28261b;
            --destructive: #141413;
            --destructive-foreground: #ffffff;
            --border: #dad9d4;
            --input: #b4b2a7;
            --ring: #c96442;
            --radius: 1.125rem;
        }

        .dark {
            --background: #262624;
            --foreground: #c3c0b6;
            --card: #262624;
            --card-foreground: #faf9f5;
            --popover: #30302e;
            --popover-foreground: #e5e5e2;
            --primary: #d97757;
            --primary-foreground: #ffffff;
            --secondary: #faf9f5;
            --secondary-foreground: #30302e;
            --muted: #1b1b19;
            --muted-foreground: #b7b5a9;
            --accent: #1a1915;
            --accent-foreground: #f5f4ee;
            --destructive: #ef4444;
            --destructive-foreground: #ffffff;
            --border: #3e3e38;
            --input: #52514a;
            --ring: #d97757;
        }

        body {
            background-color: var(--background);
            color: var(--foreground);
            font-family: 'Bricolage Grotesque', 'Inter', system-ui, sans-serif;
        }

        .card {
            background-color: var(--card);
            color: var(--card-foreground);
            border: 1px solid var(--border);
            border-radius: var(--radius);
        }

        .btn-primary {
            background-color: var(--primary);
            color: var(--primary-foreground);
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            background-color: #b05730;
            transform: translateY(-2px);
        }

        .btn-secondary {
            background-color: var(--secondary);
            color: var(--secondary-foreground);
            border: 1px solid var(--border);
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .form-input {
            background-color: var(--background);
            border: 1px solid var(--border);
            color: var(--foreground);
            padding: 0.75rem;
            border-radius: var(--radius);
            width: 100%;
            transition: border-color 0.3s ease;
        }

        .form-input:focus {
            outline: none;
            border-color: var(--ring);
            box-shadow: 0 0 0 2px rgba(201, 100, 66, 0.2);
        }

        .text-gradient {
            background: linear-gradient(45deg, #c96442, #d97757, #c96442);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200% 200%;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .animate-shimmer {
            animation: shimmer 2s infinite;
        }

        .animate-float {
            animation: float 3s ease-in-out infinite;
        }

        .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        #videoElement {
            border-radius: var(--radius);
            width: 100%;
            max-width: 400px;
            height: auto;
        }

        .student-item {
            padding: 0.75rem;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .student-item:hover {
            background-color: var(--accent);
            transform: translateX(4px);
        }

        .student-item.selected {
            background-color: var(--primary);
            color: var(--primary-foreground);
        }

        .log-entry {
            padding: 1rem;
            border-left: 4px solid var(--primary);
            background-color: var(--muted);
            margin-bottom: 0.5rem;
            border-radius: 0 var(--radius) var(--radius) 0;
        }

        .log-entry.success {
            border-left-color: #10b981;
            background-color: rgba(16, 185, 129, 0.1);
        }

        .log-entry.error {
            border-left-color: #ef4444;
            background-color: rgba(239, 68, 68, 0.1);
        }
    </style>
</head>
<body class="min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gradient mb-4">🏫 Face Recognition Dashboard</h1>
            <p class="text-lg text-muted-foreground">Hostel Management System - Real-time Face Recognition & Attendance</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="card p-6 animate-float">
                <h3 class="text-2xl font-bold mb-2" id="totalStudents">Loading...</h3>
                <p class="text-muted-foreground">Total Students</p>
            </div>
            <div class="card p-6 animate-float" style="animation-delay: 0.1s">
                <h3 class="text-2xl font-bold mb-2" id="todayEntries">Loading...</h3>
                <p class="text-muted-foreground">Today's Entries</p>
            </div>
            <div class="card p-6 animate-float" style="animation-delay: 0.2s">
                <h3 class="text-2xl font-bold mb-2" id="presentToday">Loading...</h3>
                <p class="text-muted-foreground">Present Today</p>
            </div>
            <div class="card p-6 animate-float" style="animation-delay: 0.3s">
                <h3 class="text-2xl font-bold mb-2">🟢 Online</h3>
                <p class="text-muted-foreground">System Status</p>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Student Registration -->
            <div class="card p-6">
                <h3 class="text-xl font-semibold mb-4">📝 Student Registration</h3>
                
                <!-- Student Search -->
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Search Students:</label>
                    <input type="text" id="studentSearch" class="form-input" placeholder="Search by name or register number..." onkeyup="filterStudents()">
                </div>

                <!-- Student List -->
                <div class="mb-4">
                    <div class="h-48 overflow-y-auto border border-border rounded-lg p-2" id="studentList">
                        <div class="text-center text-muted-foreground">Loading students...</div>
                    </div>
                </div>

                <!-- Selected Student Info -->
                <div id="selectedStudentInfo" class="mb-4 p-3 bg-muted rounded-lg hidden">
                    <h4 class="font-medium">Selected Student:</h4>
                    <p id="selectedStudentName"></p>
                    <p id="selectedStudentRegister" class="text-sm text-muted-foreground"></p>
                </div>

                <!-- Registration Form -->
                <form id="registerForm" class="space-y-4">
                    <input type="hidden" id="selectedRegisterNumber" name="registerNumber">
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Face Image:</label>
                        <input type="file" id="imageFile" name="imageFile" accept="image/*" class="form-input">
                    </div>
                    
                    <button type="submit" class="btn-primary w-full">Register Face Embedding</button>
                </form>
            </div>

            <!-- Live Camera Feed -->
            <div class="card p-6">
                <h3 class="text-xl font-semibold mb-4">📷 Live Camera Recognition</h3>
                
                <!-- Location Selector -->
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Entry Location:</label>
                    <select id="cameraLocation" class="form-input">
                        <option value="Main Gate">Main Gate</option>
                        <option value="Building A">Building A</option>
                        <option value="Building B">Building B</option>
                        <option value="Library">Library</option>
                        <option value="Cafeteria">Cafeteria</option>
                        <option value="Live Camera">Live Camera</option>
                    </select>
                </div>
                
                <div class="video-container mb-4">
                    <video id="videoElement" autoplay playsinline class="w-full"></video>
                    <canvas id="captureCanvas" style="display: none;"></canvas>
                </div>

                <div class="space-y-3">
                    <button id="startCamera" class="btn-primary w-full">Start Camera</button>
                    <button id="takePhoto" class="btn-secondary w-full" style="display:none;">Capture & Recognize</button>
                    <button id="usePhotoForRegistration" class="btn-primary w-full" style="display:none;">Use Photo for Registration</button>
                </div>

                <!-- Captured Photo Preview -->
                <div id="photoPreview" class="mt-4 hidden">
                    <img id="capturedImage" class="w-full rounded-lg">
                    <div id="recognitionResult" class="mt-2 p-3 rounded-lg hidden">
                        <div id="recognitionStatus" class="font-medium"></div>
                        <div id="recognitionDetails" class="text-sm mt-1"></div>
                    </div>
                </div>
            </div>


        </div>

        <!-- Activity Logs -->
        <div class="card p-6 mt-8">
            <h3 class="text-xl font-semibold mb-4">📋 Recent Activity</h3>
            <div id="activityLogs">
                <div class="log-entry">
                    <strong>System Started</strong> - Face recognition dashboard is ready
                    <span class="text-sm text-muted-foreground block">Just now</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        let stream = null;
        let allStudents = [];
        let selectedStudent = null;
        let capturedPhotoBlob = null;

        // Load all students from Supabase
        async function loadStudents() {
            try {
                const response = await fetch('/api/students');
                const data = await response.json();
                allStudents = data.students || [];
                displayStudents(allStudents);
                addLog(`Loaded ${allStudents.length} students from database`, 'success');
            } catch (error) {
                console.error('Error loading students:', error);
                addLog(`Error loading students: ${error.message}`, 'error');
            }
        }

        // Display students in the list
        function displayStudents(students) {
            const studentList = document.getElementById('studentList');
            if (students.length === 0) {
                studentList.innerHTML = '<div class="text-center text-muted-foreground">No students found</div>';
                return;
            }

            studentList.innerHTML = students.map(student => `
                <div class="student-item" onclick="selectStudent('${student.register_number}')">
                    <div class="font-medium">${student.full_name}</div>
                    <div class="text-sm text-muted-foreground">${student.register_number}</div>
                    <div class="text-xs text-muted-foreground">${student.hostel_status} • ${student.face_embedding ? 'Face Enrolled' : 'No Face Data'}</div>
                </div>
            `).join('');
        }

        // Filter students based on search
        function filterStudents() {
            const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
            const filtered = allStudents.filter(student => 
                student.full_name.toLowerCase().includes(searchTerm) ||
                student.register_number.toLowerCase().includes(searchTerm)
            );
            displayStudents(filtered);
        }

        // Select a student
        function selectStudent(registerNumber) {
            selectedStudent = allStudents.find(s => s.register_number === registerNumber);
            if (selectedStudent) {
                document.getElementById('selectedRegisterNumber').value = registerNumber;
                document.getElementById('selectedStudentName').textContent = selectedStudent.full_name;
                document.getElementById('selectedStudentRegister').textContent = `Register: ${selectedStudent.register_number}`;
                document.getElementById('selectedStudentInfo').classList.remove('hidden');
                
                // Update selection in UI
                document.querySelectorAll('.student-item').forEach(item => item.classList.remove('selected'));
                event.target.classList.add('selected');
                
                addLog(`Selected student: ${selectedStudent.full_name} (${registerNumber})`, 'info');
            }
        }

        // Load dashboard stats
        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                const stats = await response.json();
                
                document.getElementById('totalStudents').textContent = stats.total_students || '0';
                document.getElementById('todayEntries').textContent = stats.today_entries || '0';
                document.getElementById('presentToday').textContent = stats.present_today || '0';
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        // Add log entry
        function addLog(message, type = 'info') {
            const logsContainer = document.getElementById('activityLogs');
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${type}`;
            logEntry.innerHTML = `
                <strong>${new Date().toLocaleTimeString()}</strong> - ${message}
                <span class="text-sm text-muted-foreground block">Just now</span>
            `;
            logsContainer.insertBefore(logEntry, logsContainer.firstChild);
            
            // Keep only last 10 logs
            while (logsContainer.children.length > 10) {
                logsContainer.removeChild(logsContainer.lastChild);
            }
        }

        // Camera functionality
        document.getElementById('startCamera').addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 } 
                });
                document.getElementById('videoElement').srcObject = stream;
                document.getElementById('startCamera').style.display = 'none';
                document.getElementById('takePhoto').style.display = 'block';
                addLog('Camera started successfully', 'success');
            } catch (error) {
                addLog(`Camera error: ${error.message}`, 'error');
            }
        });

        // Take photo from camera
        document.getElementById('takePhoto').addEventListener('click', () => {
            const video = document.getElementById('videoElement');
            const canvas = document.getElementById('captureCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob(async (blob) => {
                capturedPhotoBlob = blob;
                const imageUrl = URL.createObjectURL(blob);
                document.getElementById('capturedImage').src = imageUrl;
                document.getElementById('photoPreview').classList.remove('hidden');
                document.getElementById('usePhotoForRegistration').style.display = 'block';
                addLog('Photo captured successfully', 'success');
                
                // Automatically recognize face and log entry
                await recognizeCapturedFace(blob);
            }, 'image/jpeg', 0.8);
        });

        // Recognize captured face and log entry
        async function recognizeCapturedFace(photoBlob) {
            try {
                addLog('Analyzing captured face...', 'info');
                
                const selectedLocation = document.getElementById('cameraLocation').value;
                const resultDiv = document.getElementById('recognitionResult');
                const statusDiv = document.getElementById('recognitionStatus');
                const detailsDiv = document.getElementById('recognitionDetails');
                
                // Show loading state
                resultDiv.classList.remove('hidden');
                resultDiv.className = 'mt-2 p-3 rounded-lg bg-blue-100 border border-blue-300';
                statusDiv.textContent = '🔍 Analyzing face...';
                detailsDiv.textContent = 'Please wait while we check for matches...';
                
                const formData = new FormData();
                formData.append('file', photoBlob, 'capture.jpg');
                formData.append('location', selectedLocation);
                
                const response = await fetch('/recognize_face/', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success && result.recognized) {
                    // Student recognized - log successful entry
                    resultDiv.className = 'mt-2 p-3 rounded-lg bg-green-100 border border-green-300';
                    statusDiv.textContent = `✅ Welcome ${result.student.full_name}!`;
                    detailsDiv.textContent = `${result.confidence_percentage}% match • Entry logged at ${result.location}`;
                    
                    addLog(`🎉 Welcome ${result.student.full_name}! (${result.confidence_percentage}% match)`, 'success');
                    addLog(`Entry logged at ${result.location}`, 'success');
                    loadStats(); // Refresh stats
                } else if (result.success && !result.recognized) {
                    // Face detected but no match
                    resultDiv.className = 'mt-2 p-3 rounded-lg bg-yellow-100 border border-yellow-300';
                    statusDiv.textContent = '⚠️ Face detected, no match found';
                    detailsDiv.textContent = `Checked ${result.students_checked} students • Best similarity: ${(result.best_similarity * 100).toFixed(1)}%`;
                    
                    addLog(`👤 Face detected but no matching student found (checked ${result.students_checked} records)`, 'error');
                    if (result.best_similarity > 0) {
                        addLog(`Best similarity: ${(result.best_similarity * 100).toFixed(1)}% (threshold: ${(result.threshold * 100).toFixed(1)}%)`, 'info');
                    }
                } else {
                    // No face detected
                    resultDiv.className = 'mt-2 p-3 rounded-lg bg-red-100 border border-red-300';
                    statusDiv.textContent = '❌ No face detected';
                    detailsDiv.textContent = 'Please ensure your face is clearly visible and try again';
                    
                    addLog('❌ No face detected in captured image', 'error');
                }
            } catch (error) {
                const resultDiv = document.getElementById('recognitionResult');
                const statusDiv = document.getElementById('recognitionStatus');
                const detailsDiv = document.getElementById('recognitionDetails');
                
                resultDiv.classList.remove('hidden');
                resultDiv.className = 'mt-2 p-3 rounded-lg bg-red-100 border border-red-300';
                statusDiv.textContent = '💥 Recognition Error';
                detailsDiv.textContent = error.message;
                
                addLog(`Face recognition error: ${error.message}`, 'error');
            }
        }

        // Use captured photo for registration
        document.getElementById('usePhotoForRegistration').addEventListener('click', () => {
            if (!selectedStudent) {
                addLog('Please select a student first', 'error');
                return;
            }
            
            if (!capturedPhotoBlob) {
                addLog('Please capture a photo first', 'error');
                return;
            }
            
            // Create a file from the blob and submit
            const file = new File([capturedPhotoBlob], 'capture.jpg', { type: 'image/jpeg' });
            registerWithPhoto(file);
        });

        // Register with photo
        async function registerWithPhoto(file) {
            const formData = new FormData();
            formData.append('register_number', selectedStudent.register_number);
            formData.append('file', file);
            
            try {
                const response = await fetch('/register_from_dashboard/', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    addLog(`Face embedding registered for ${selectedStudent.full_name}`, 'success');
                    loadStats();
                    loadStudents(); // Refresh student list
                } else {
                    addLog(`Registration failed: ${result.detail || result.message}`, 'error');
                }
            } catch (error) {
                addLog(`Registration error: ${error.message}`, 'error');
            }
        }

        // Register form handler
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!selectedStudent) {
                addLog('Please select a student first', 'error');
                return;
            }
            
            const formData = new FormData(e.target);
            formData.set('register_number', selectedStudent.register_number);
            
            try {
                const response = await fetch('/register_from_dashboard/', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    addLog(`Face embedding registered for ${selectedStudent.full_name}`, 'success');
                    e.target.reset();
                    loadStats();
                    loadStudents(); // Refresh student list
                } else {
                    addLog(`Registration failed: ${result.detail || result.message}`, 'error');
                }
            } catch (error) {
                addLog(`Registration error: ${error.message}`, 'error');
            }
        });

        // Authentication form handler
        // Removed - authentication functionality disabled

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', () => {
            loadStudents();
            loadStats();
            
            // Refresh stats every 30 seconds
            setInterval(loadStats, 30000);
        });
    </script>
</body>
</html>
"""

# ------------------------------
# FastAPI app
# ------------------------------
app = FastAPI(title="Face Recognition API", description="Hostel Management Face Recognition System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:3000",  # Alternative dev server port
        "http://127.0.0.1:3000",
        "http://localhost:8080",  # Another common dev port
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.post("/register_from_dashboard/")
async def register_from_dashboard(register_number: str = Form(...), file: UploadFile = File(...)):
    """Register a student's face from the dashboard and save to database"""
    try:
        # Check if student exists in the system first
        if not student_exists(register_number):
            raise HTTPException(status_code=404, detail="Student not found in the system")

        img_bytes = await file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        face = preprocess_face(image)
        if face is None:
            raise HTTPException(status_code=400, detail="No face detected in the image")

        embedding = get_embedding(face)
        
        # Save to Supabase
        success = save_embedding_to_supabase(register_number, embedding)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save face data to database")

        return {
            "success": True, 
            "message": f"Face recognition enrolled for student {register_number}",
            "register_number": register_number,
            "embedding_size": len(embedding)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/register/")
async def register(register_number: str = Form(...), full_name: str = Form(None), file: UploadFile = File(...)):
    """Register a student's face with their register number"""
    try:
        img_bytes = await file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        face = preprocess_face(image)
        if face is None:
            raise HTTPException(status_code=400, detail="No face detected in the image")

        embedding = get_embedding(face)
        
        # Save to Supabase
        success = save_embedding_to_supabase(register_number, embedding, full_name)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save face data to database")

        return {
            "success": True, 
            "message": f"Student {register_number} registered successfully",
            "register_number": register_number,
            "full_name": full_name
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

# @app.post("/authenticate/")
# async def authenticate(user_id: str = Form(...), file: UploadFile = File(...)):
#     if user_id not in registered_users:
#         return {"success": False, "message": "User not registered"}

#     img_bytes = await file.read()
#     nparr = np.frombuffer(img_bytes, np.uint8)
#     image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#     face = preprocess_face(image)
#     if face is None:
#         return {"success": False, "message": "No face detected"}

#     embedding = get_embedding(face)
#     stored_embedding = np.array(registered_users[user_id])

#     similarity = 1 - cosine(stored_embedding, embedding)
#     success = similarity > 0.75  # tune this threshold

#     return {"success": success, "similarity": float(similarity)}

@app.post("/authenticate/")
async def authenticate(register_number: str = Form(...), file: UploadFile = File(...), location: str = Form('Main Gate')):
    """Authenticate a student using their face and log entry/attendance"""
    try:
        # Check if student exists
        student_info = get_student_by_register_number(register_number)
        if not student_info:
            raise HTTPException(status_code=404, detail="Student not registered")

        img_bytes = await file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        face = preprocess_face(image)
        if face is None:
            raise HTTPException(status_code=400, detail="No face detected in the image")

        embedding = get_embedding(face)
        
        # Get stored embedding from Supabase
        stored_embedding = get_embedding_from_supabase(register_number)
        if stored_embedding is None:
            raise HTTPException(status_code=404, detail="No face data found for this student")

        # Calculate similarity
        cosine_dist = cosine(stored_embedding, embedding)
        raw_similarity = 1 - cosine_dist
        similarity = raw_similarity  # Adjustment as in original code
        threshold = 0.5
        success = bool(similarity > threshold)
        
        print(f"🔐 Authentication comparison for {register_number}:")
        print(f"   Query embedding shape: {embedding.shape}")
        print(f"   Stored embedding shape: {stored_embedding.shape}")
        print(f"   Cosine distance: {cosine_dist:.6f}")
        print(f"   Raw similarity: {raw_similarity:.6f}")
        print(f"   Adjusted similarity: {similarity:.6f}")
        print(f"   Threshold: {threshold}")
        print(f"   Authentication result: {'✅ SUCCESS' if success else '❌ FAILED'}")

        if success:
            # Log entry to entry_logs table
            entry_logged = log_entry(
                register_number=register_number,
                student_name=student_info['full_name'],
                entry_type='entry',
                confidence_score=float(similarity),
                location=location
            )
            
            # Log attendance (mark as present)
            # For attendance, we need a marked_by user ID - using system user for now
            attendance_logged = log_attendance(
                student_id=student_info['id'],
                marked_by=student_info['id'],  # Self-marked for face recognition
                status='present',
                notes=f'Auto-marked via face recognition (confidence: {similarity:.2%})'
            )
            
            return {
                "success": success, 
                "similarity": float(similarity),
                "register_number": register_number,
                "student_name": student_info['full_name'],
                "message": "Authentication successful",
                "entry_logged": entry_logged,
                "attendance_logged": attendance_logged,
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Log failed entry attempt
            log_entry(
                register_number=register_number,
                student_name=student_info['full_name'],
                entry_type='failed_attempt',
                confidence_score=float(similarity),
                location=location
            )
            
            return {
                "success": success, 
                "similarity": float(similarity),
                "register_number": register_number,
                "message": "Authentication failed - insufficient similarity"
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@app.get("/student/{register_number}")
async def get_student_info(register_number: str):
    """Get student information by register number"""
    try:
        result = supabase.table('students').select('*').eq('register_number', register_number).eq('is_active', True).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Student not found")
        
        student = result.data[0]
        # Don't return the face_embedding in the response for security
        student.pop('face_embedding', None)
        
        return {"success": True, "student": student}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve student info: {str(e)}")

@app.delete("/student/{register_number}")
async def delete_student(register_number: str):
    """Soft delete a student (set is_active to false)"""
    try:
        result = supabase.table('students').update({
            'is_active': False,
            'updated_at': 'now()'
        }).eq('register_number', register_number).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Student not found")
        
        return {"success": True, "message": f"Student {register_number} deactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to deactivate student: {str(e)}")

@app.post("/mark_attendance/")
async def mark_attendance_manual(
    register_number: str = Form(...),
    status: str = Form('present'),
    marked_by: str = Form(...),
    building_id: str = Form(None),
    floor_number: int = Form(None),
    notes: str = Form(None)
):
    """Manually mark attendance for a student"""
    try:
        # Validate status
        valid_statuses = ['present', 'absent', 'late', 'excused']
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        # Get student info
        student_info = get_student_by_register_number(register_number)
        if not student_info:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Log attendance
        success = log_attendance(
            student_id=student_info['id'],
            marked_by=marked_by,
            status=status,
            building_id=building_id,
            floor_number=floor_number,
            notes=notes
        )
        
        if success:
            return {
                "success": True,
                "message": f"Attendance marked as {status} for {student_info['full_name']}",
                "student": student_info,
                "status": status,
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to mark attendance")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark attendance: {str(e)}")

@app.post("/process_face/")
async def process_face(file: UploadFile = File(...)):
    """Process face image and return detection points and embedding for visualization"""
    try:
        img_bytes = await file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Get face detection with landmarks
        with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
            results = face_detection.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            if not results.detections:
                raise HTTPException(status_code=400, detail="No face detected in the image")
            
            detection = results.detections[0]
            bbox = detection.location_data.relative_bounding_box
            h, w, _ = image.shape
            
            # Get face bounding box
            x1, y1 = max(0, int(bbox.xmin * w)), max(0, int(bbox.ymin * h))
            x2, y2 = min(w, x1 + int(bbox.width * w)), min(h, y1 + int(bbox.height * h))
            
            # Get key points (if available)
            key_points = []
            if hasattr(detection.location_data, 'relative_keypoints'):
                for keypoint in detection.location_data.relative_keypoints:
                    key_points.append({
                        "x": int(keypoint.x * w),
                        "y": int(keypoint.y * h)
                    })
            
            # Preprocess face for embedding
            face = preprocess_face(image)
            if face is None:
                raise HTTPException(status_code=400, detail="Failed to preprocess face")
            
            # Get embedding
            embedding = get_embedding(face)
            
            # Create face detection points for visualization
            face_points = []
            
            # Add corner points of bounding box
            face_points.extend([
                {"x": x1, "y": y1, "type": "corner"},
                {"x": x2, "y": y1, "type": "corner"},
                {"x": x2, "y": y2, "type": "corner"},
                {"x": x1, "y": y2, "type": "corner"}
            ])
            
            # Add center point
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            face_points.append({"x": center_x, "y": center_y, "type": "center"})
            
            # Add key points if available
            face_points.extend([{**kp, "type": "keypoint"} for kp in key_points])
            
            # Add some feature points based on embedding extraction areas
            # These represent areas that are important for face recognition
            face_width = x2 - x1
            face_height = y2 - y1
            
            # Eye regions
            eye_y = y1 + int(face_height * 0.3)
            left_eye_x = x1 + int(face_width * 0.3)
            right_eye_x = x1 + int(face_width * 0.7)
            
            face_points.extend([
                {"x": left_eye_x, "y": eye_y, "type": "feature"},
                {"x": right_eye_x, "y": eye_y, "type": "feature"}
            ])
            
            # Nose region
            nose_x = center_x
            nose_y = y1 + int(face_height * 0.5)
            face_points.append({"x": nose_x, "y": nose_y, "type": "feature"})
            
            # Mouth region
            mouth_x = center_x
            mouth_y = y1 + int(face_height * 0.7)
            face_points.append({"x": mouth_x, "y": mouth_y, "type": "feature"})
            
            return {
                "success": True,
                "face_detected": True,
                "bounding_box": {
                    "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                    "width": face_width, "height": face_height
                },
                "face_points": face_points,
                "embedding_size": len(embedding),
                "confidence": float(detection.score[0]) if detection.score else 0.0,
                "image_dimensions": {"width": w, "height": h}
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face processing failed: {str(e)}")

@app.get("/", response_class=HTMLResponse)
async def dashboard():
    """Serve the dashboard HTML page"""
    return DASHBOARD_HTML

@app.post("/capture_and_register/")
async def capture_and_register(register_number: str = Form(...), file: UploadFile = File(...)):
    """Capture photo from camera and register face embedding"""
    try:
        # Check if student exists
        student_info = get_student_by_register_number(register_number)
        if not student_info:
            raise HTTPException(status_code=404, detail="Student not found in system")

        img_bytes = await file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        face = preprocess_face(image)
        if face is None:
            raise HTTPException(status_code=400, detail="No face detected in the captured image")

        embedding = get_embedding(face)
        
        # Save to Supabase
        success = save_embedding_to_supabase(register_number, embedding, student_info['full_name'])
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save face data to database")

        return {
            "success": True, 
            "message": f"Face embedding registered for {student_info['full_name']}",
            "register_number": register_number,
            "student_name": student_info['full_name'],
            "embedding_size": len(embedding)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/recognize_face/")
async def recognize_face(file: UploadFile = File(...), location: str = Form('Main Gate')):
    """Recognize face from photo and log entry if match found"""
    try:
        img_bytes = await file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        face = preprocess_face(image)
        if face is None:
            return {
                "success": False,
                "message": "No face detected in the image",
                "face_detected": False
            }

        embedding = get_embedding(face)
        
        # Get all students with face embeddings (filter at database level)
        students = get_all_students(limit=2000)
        print(f"📊 Database query results:")
        print(f"   Total students with face embeddings: {len(students)}")
        
        # Debug: Check the first few students
        for i, student in enumerate(students[:3]):
            print(f"   Student {i+1}: {student.get('register_number', 'N/A')} ({student.get('full_name', 'Unknown')}) - Face data: {type(student.get('face_embedding'))}")
            if student.get('face_embedding'):
                face_data = student['face_embedding']
                if isinstance(face_data, list):
                    print(f"     JSONB list length: {len(face_data)}")
                    print(f"     First 3 values: {face_data[:3]}")
                elif isinstance(face_data, str):
                    print(f"     String length: {len(face_data)}")
                    print(f"     First 50 chars: {face_data[:50]}...")
                else:
                    print(f"     Other type: {type(face_data)}")
        
        # All students returned should have face embeddings, but validate them
        students_with_faces = []
        students_with_face_data_count = 0
        
        for student in students:
            face_data = student.get('face_embedding')
            if face_data:  # Double-check since we filtered at DB level
                # Additional check for valid data
                if isinstance(face_data, list) and len(face_data) > 0:
                    students_with_faces.append(student)
                    students_with_face_data_count += 1
                    print(f"   ✅ Student {student.get('register_number')} ({student.get('full_name', 'Unknown')}) has valid JSONB face data")
                elif isinstance(face_data, str) and len(face_data) > 0:
                    # Try to parse string as JSON array
                    try:
                        parsed_data = json.loads(face_data)
                        if isinstance(parsed_data, list) and len(parsed_data) > 0:
                            students_with_faces.append(student)
                            students_with_face_data_count += 1
                            print(f"   ✅ Student {student.get('register_number')} ({student.get('full_name', 'Unknown')}) has JSON string face data (length: {len(parsed_data)})")
                        else:
                            print(f"   ❌ Student {student.get('register_number')} has invalid JSON string data")
                    except json.JSONDecodeError:
                        # Legacy base64 string
                        students_with_faces.append(student)
                        students_with_face_data_count += 1
                        print(f"   ✅ Student {student.get('register_number')} ({student.get('full_name', 'Unknown')}) has legacy base64 face data")
                elif isinstance(face_data, bytes) and len(face_data) > 0:
                    students_with_faces.append(student)
                    students_with_face_data_count += 1
                    print(f"   ✅ Student {student.get('register_number')} ({student.get('full_name', 'Unknown')}) has legacy bytes face data")
                else:
                    print(f"   ❌ Student {student.get('register_number')} has invalid face data: {type(face_data)}")
        
        print(f"📊 Face data summary: {students_with_face_data_count} students have valid face embeddings")
        
        best_match = None
        best_similarity = 0.0
        recognition_threshold = 0.5  # Threshold for face recognition
        
        print(f"🔍 Starting face recognition comparison...")
        print(f"   Query embedding shape: {embedding.shape}")
        print(f"   Students with face data: {len(students_with_faces)}")
        print(f"   Recognition threshold: {recognition_threshold}")
        
        # Compare with all registered faces
        comparison_count = 0
        for student in students_with_faces:
            try:
                face_embedding_data = student.get('face_embedding')
                if not face_embedding_data:
                    continue
                
                comparison_count += 1
                student_reg = student.get('register_number', 'unknown')
                print(f"\n🔄 Comparing with student {student_reg} ({comparison_count}/{len(students_with_faces)})...")
                
                # Handle JSONB list format (current) and legacy formats
                try:
                    if isinstance(face_embedding_data, list):
                        # JSONB list format (current)
                        stored_embedding = np.array(face_embedding_data, dtype=np.float32)
                    elif isinstance(face_embedding_data, str):
                        # Try to parse as JSON array first
                        try:
                            parsed_data = json.loads(face_embedding_data)
                            if isinstance(parsed_data, list):
                                stored_embedding = np.array(parsed_data, dtype=np.float32)
                                print(f"     Parsed JSON string to array with {len(parsed_data)} elements")
                            else:
                                raise ValueError("Parsed data is not a list")
                        except (json.JSONDecodeError, ValueError):
                            # Legacy base64 encoded data
                            stored_embedding_bytes = decode_base64_embedding(face_embedding_data)
                            if stored_embedding_bytes is None:
                                print(f"Failed to decode base64 embedding for student {student.get('register_number', 'unknown')}")
                                continue
                            stored_embedding = np.frombuffer(stored_embedding_bytes, dtype=np.float32)
                    elif isinstance(face_embedding_data, bytes):
                        # Legacy raw bytes data
                        stored_embedding = np.frombuffer(face_embedding_data, dtype=np.float32)
                    else:
                        print(f"Unknown embedding data type for student {student.get('register_number', 'unknown')}: {type(face_embedding_data)}")
                        continue
                    
                    # Validate embedding size (should match query embedding size)
                    if len(stored_embedding) != len(embedding):
                        print(f"Embedding size mismatch for student {student.get('register_number', 'unknown')}: stored={len(stored_embedding)}, query={len(embedding)}")
                        continue
                        
                except Exception as decode_error:
                    print(f"Failed to process embedding for student {student.get('register_number', 'unknown')}: {decode_error}")
                    continue
                
                # Calculate similarity
                cosine_dist = cosine(stored_embedding, embedding)
                similarity = 1 - cosine_dist
                adjusted_similarity = similarity  # Adjustment as in original code
                
                print(f"   Similarity calculation:")
                print(f"     Cosine distance: {cosine_dist:.6f}")
                print(f"     Raw similarity: {similarity:.6f}")
                print(f"     Adjusted similarity: {adjusted_similarity:.6f}")
                print(f"     Above threshold ({recognition_threshold}): {adjusted_similarity > recognition_threshold}")
                
                if adjusted_similarity > best_similarity:
                    print(f"     🎯 New best match! Previous best: {best_similarity:.6f}")
                    best_similarity = adjusted_similarity
                    best_match = student
                else:
                    print(f"     Current best remains: {best_similarity:.6f}")
                    
            except Exception as e:
                print(f"Error comparing with student {student.get('register_number', 'unknown')}: {e}")
                continue
        
        print(f"\n🏁 Face recognition completed:")
        print(f"   Total comparisons: {comparison_count}")
        print(f"   Best similarity: {best_similarity:.6f}")
        print(f"   Recognition threshold: {recognition_threshold}")
        print(f"   Match found: {best_match is not None and best_similarity > recognition_threshold}")
        
        if best_match and best_similarity > recognition_threshold:
            print(f"✅ STUDENT RECOGNIZED:")
            print(f"   Name: {best_match['full_name']}")
            print(f"   Register Number: {best_match['register_number']}")
            print(f"   Confidence: {round(best_similarity * 100, 1)}%")
            print(f"   Location: {location}")
            
            # Log entry for recognized student
            entry_logged = log_entry(
                register_number=best_match['register_number'],
                student_name=best_match['full_name'],
                entry_type='entry',
                confidence_score=float(best_similarity),
                location=location
            )
            
            # Log attendance (mark as present)
            attendance_logged = log_attendance(
                student_id=best_match['id'],
                marked_by=best_match['id'],  # Self-marked for face recognition
                status='present',
                notes=f'Auto-marked via face recognition (confidence: {best_similarity:.2%})'
            )
            
            return {
                "success": True,
                "recognized": True,
                "student": {
                    "register_number": best_match['register_number'],
                    "full_name": best_match['full_name'],
                    "hostel_status": best_match.get('hostel_status', 'unknown')
                },
                "similarity": float(best_similarity),
                "confidence_percentage": round(best_similarity * 100, 1),
                "location": location,
                "entry_logged": entry_logged,
                "attendance_logged": attendance_logged,
                "message": f"Welcome {best_match['full_name']}! Entry logged successfully."
            }
        else:
            return {
                "success": True,
                "recognized": False,
                "face_detected": True,
                "best_similarity": float(best_similarity) if best_match else 0.0,
                "threshold": recognition_threshold,
                "students_checked": len(students_with_faces),
                "message": "Face detected but no matching student found in database."
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "An error occurred during face recognition."
        }

@app.get("/cleanup_embeddings")
async def cleanup_invalid_embeddings():
    """Clean up invalid face embeddings from the database"""
    try:
        students = get_all_students(limit=2000)
        invalid_count = 0
        fixed_count = 0
        total_count = 0
        
        for student in students:
            if student.get('face_embedding'):
                total_count += 1
                register_number = student['register_number']
                
                # Try to decode the embedding
                embedding_data = student['face_embedding']
                
                if isinstance(embedding_data, list):
                    # JSONB list format (current)
                    try:
                        embedding = np.array(embedding_data, dtype=np.float32)
                        if len(embedding) != 512:
                            print(f"Invalid embedding size for {register_number}: {len(embedding)}")
                            invalid_count += 1
                            continue
                    except Exception as e:
                        print(f"Failed to convert list to array for {register_number}: {e}")
                        invalid_count += 1
                        continue
                        
                elif isinstance(embedding_data, str):
                    # Legacy base64 encoded data - convert to JSONB list
                    embedding_bytes = decode_base64_embedding(embedding_data)
                    if embedding_bytes is None:
                        print(f"Invalid base64 embedding for {register_number}")
                        invalid_count += 1
                        continue
                    
                    try:
                        embedding = np.frombuffer(embedding_bytes, dtype=np.float32)
                        if len(embedding) != 512:
                            print(f"Invalid embedding size for {register_number}: {len(embedding)}")
                            invalid_count += 1
                            continue
                        
                        # Convert legacy format to JSONB list
                        embedding_list = embedding.tolist()
                        supabase.table('students').update({
                            'face_embedding': embedding_list,
                            'updated_at': datetime.now().isoformat()
                        }).eq('register_number', register_number).execute()
                        fixed_count += 1
                        print(f"Converted legacy embedding for {register_number} to JSONB format")
                        
                    except Exception as e:
                        print(f"Failed to decode embedding for {register_number}: {e}")
                        invalid_count += 1
                        continue
                        
                elif isinstance(embedding_data, bytes):
                    # Legacy raw bytes data - convert to JSONB list
                    try:
                        embedding = np.frombuffer(embedding_data, dtype=np.float32)
                        if len(embedding) != 512:
                            print(f"Invalid embedding size for {register_number}: {len(embedding)}")
                            invalid_count += 1
                            continue
                        
                        # Convert legacy format to JSONB list
                        embedding_list = embedding.tolist()
                        supabase.table('students').update({
                            'face_embedding': embedding_list,
                            'updated_at': datetime.now().isoformat()
                        }).eq('register_number', register_number).execute()
                        fixed_count += 1
                        print(f"Converted legacy embedding for {register_number} to JSONB format")
                        
                    except Exception as e:
                        print(f"Failed to decode raw bytes for {register_number}: {e}")
                        invalid_count += 1
                        continue
                        
                else:
                    print(f"Unknown embedding data type for {register_number}: {type(embedding_data)}")
                    invalid_count += 1
                    continue
                    
                # If we get here, the embedding is valid
                print(f"Valid embedding for {register_number}: shape {embedding.shape}")
        
        return {
            "success": True,
            "total_embeddings": total_count,
            "invalid_embeddings": invalid_count,
            "fixed_embeddings": fixed_count,
            "valid_embeddings": total_count - invalid_count,
            "message": f"Cleanup complete. Fixed {fixed_count} embeddings, {invalid_count} remain invalid."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/test_embedding")
async def test_embedding():
    """Test endpoint to verify embedding conversion"""
    try:
        # Create a test embedding
        test_embedding = np.random.rand(512).astype(np.float32)
        
        # Convert to JSONB list format
        embedding_list = test_embedding.tolist()
        
        # Convert back
        decoded_embedding = np.array(embedding_list, dtype=np.float32)
        
        return {
            "success": True,
            "original_shape": test_embedding.shape,
            "list_length": len(embedding_list),
            "decoded_shape": decoded_embedding.shape,
            "data_integrity": bool(np.allclose(test_embedding, decoded_embedding)),
            "message": "JSONB embedding conversion test successful"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/students")
async def get_students_endpoint():
    """Get all students from Supabase"""
    try:
        students = get_all_students_including_no_face(limit=2000)
        return {
            "success": True,
            "students": students,
            "count": len(students)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch students: {str(e)}")

@app.get("/api/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Total students
        total_students_result = supabase.table('students').select('id', count='exact').eq('is_active', True).execute()
        total_students = total_students_result.count if hasattr(total_students_result, 'count') else len(total_students_result.data)
        
        # Today's entries
        today = date.today().isoformat()
        today_entries_result = supabase.table('entry_logs').select('id', count='exact').gte('created_at', f'{today}T00:00:00').execute()
        today_entries = today_entries_result.count if hasattr(today_entries_result, 'count') else len(today_entries_result.data)
        
        # Present today
        present_today_result = supabase.table('attendance_logs').select('id', count='exact').eq('date', today).eq('status', 'present').execute()
        present_today = present_today_result.count if hasattr(present_today_result, 'count') else len(present_today_result.data)
        
        return {
            "total_students": total_students,
            "today_entries": today_entries,
            "present_today": present_today,
            "system_status": "online"
        }
    except Exception as e:
        return {
            "total_students": 0,
            "today_entries": 0,
            "present_today": 0,
            "system_status": "error",
            "error": str(e)
        }

@app.get("/api/recent_entries")
async def get_recent_entries(limit: int = 20):
    """Get recent entry logs"""
    try:
        result = supabase.table('entry_logs').select('*').order('created_at', desc=True).limit(limit).execute()
        return {"success": True, "entries": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recent entries: {str(e)}")

@app.get("/api/attendance_today")
async def get_attendance_today():
    """Get today's attendance records"""
    try:
        today = date.today().isoformat()
        result = supabase.table('attendance_logs').select('*, students(register_number, full_name)').eq('date', today).execute()
        return {"success": True, "attendance": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get today's attendance: {str(e)}")

@app.get("/debug/students")
async def debug_students():
    """Debug endpoint to check student data in database"""
    try:
        print("🔍 Debug: Checking student data...")
        students = get_all_students_including_no_face(limit=10)
        
        debug_info = {
            "total_students": len(students),
            "students_with_face_data": 0,
            "face_data_types": {},
            "sample_students": []
        }
        
        for i, student in enumerate(students):
            face_data = student.get('face_embedding')
            
            # Count students with face data
            if face_data:
                debug_info["students_with_face_data"] += 1
                
                # Track data types
                data_type = type(face_data).__name__
                debug_info["face_data_types"][data_type] = debug_info["face_data_types"].get(data_type, 0) + 1
            
            # Include first 3 students as samples
            if i < 3:
                sample = {
                    "register_number": student.get('register_number'),
                    "full_name": student.get('full_name'),
                    "has_face_data": bool(face_data),
                    "face_data_type": type(face_data).__name__ if face_data else None,
                    "face_data_length": len(face_data) if isinstance(face_data, (list, str, bytes)) else None
                }
                
                if isinstance(face_data, list) and len(face_data) > 0:
                    sample["first_3_values"] = face_data[:3]
                
                debug_info["sample_students"].append(sample)
        
        return {
            "success": True,
            "debug_info": debug_info
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "face-recognition-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)