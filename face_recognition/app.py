import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from scipy.spatial.distance import cosine
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Optional
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import io
import base64

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
def save_embedding_to_supabase(register_number: str, embedding: np.ndarray, full_name: str = None) -> bool:
    """Save face embedding to Supabase students table"""
    try:
        # Convert embedding to bytes for storage
        embedding_bytes = embedding.astype(np.float32).tobytes()
        
        # Check if student already exists
        existing_student = supabase.table('students').select('*').eq('register_number', register_number).execute()
        
        if existing_student.data:
            # Update existing student with face embedding
            result = supabase.table('students').update({
                'face_embedding': embedding_bytes,
                'updated_at': 'now()'
            }).eq('register_number', register_number).execute()
        else:
            # Create new student record
            result = supabase.table('students').insert({
                'register_number': register_number,
                'full_name': full_name or f"Student {register_number}",
                'face_embedding': embedding_bytes,
                'is_active': True
            }).execute()
        
        return True
    except Exception as e:
        print(f"Error saving embedding to Supabase: {e}")
        return False

def get_embedding_from_supabase(register_number: str) -> Optional[np.ndarray]:
    """Retrieve face embedding from Supabase students table"""
    try:
        result = supabase.table('students').select('face_embedding').eq('register_number', register_number).eq('is_active', True).execute()
        
        if result.data and result.data[0]['face_embedding']:
            # Convert bytes back to numpy array
            embedding_bytes = result.data[0]['face_embedding']
            embedding = np.frombuffer(embedding_bytes, dtype=np.float32)
            return embedding
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
    return embedding

# ------------------------------
# FastAPI app
# ------------------------------
app = FastAPI()

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
async def authenticate(register_number: str = Form(...), file: UploadFile = File(...)):
    """Authenticate a student using their face"""
    try:
        # Check if student exists
        if not student_exists(register_number):
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
        similarity = 1 - cosine(stored_embedding, embedding)
        similarity = similarity + 0.125  # Adjustment as in original code
        success = bool(similarity > 0.5)   # Threshold as in original code

        return {
            "success": success, 
            "similarity": float(similarity),
            "register_number": register_number,
            "message": "Authentication successful" if success else "Authentication failed"
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "face-recognition-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)
