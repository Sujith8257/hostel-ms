# Face Recognition API with Supabase Integration

This is a FastAPI-based face recognition service that integrates with Supabase to store and retrieve face embeddings for student authentication.

## Features

- **Face Registration**: Register student faces with their register numbers
- **Face Authentication**: Authenticate students using face recognition
- **Supabase Integration**: Store face embeddings in PostgreSQL database
- **RESTful API**: Easy to integrate with other services
- **Health Monitoring**: Built-in health check endpoint

## Setup

### Prerequisites

- Python 3.8+
- TensorFlow Lite model (`output_model.tflite`)
- Supabase account and project

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

3. Ensure the `students` table exists in Supabase with the correct schema.

### Running the Service

#### Option 1: Using the start script
```bash
./start.sh
```

#### Option 2: Manual start
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Testing the Setup

Run the test script to verify everything is working:
```bash
python test_setup.py
```

## API Endpoints

### POST /register/
Register a new student's face.

**Parameters:**
- `register_number` (form): Student's register number
- `full_name` (form, optional): Student's full name
- `file` (file): Image file containing the student's face

**Example:**
```bash
curl -X POST "http://localhost:8000/register/" \
  -F "register_number=CS2021001" \
  -F "full_name=John Doe" \
  -F "file=@student_photo.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Student CS2021001 registered successfully",
  "register_number": "CS2021001",
  "full_name": "John Doe"
}
```

### POST /authenticate/
Authenticate a student using face recognition.

**Parameters:**
- `register_number` (form): Student's register number
- `file` (file): Image file for authentication

**Example:**
```bash
curl -X POST "http://localhost:8000/authenticate/" \
  -F "register_number=CS2021001" \
  -F "file=@auth_photo.jpg"
```

**Response:**
```json
{
  "success": true,
  "similarity": 0.85,
  "register_number": "CS2021001",
  "message": "Authentication successful"
}
```

### GET /student/{register_number}
Get student information by register number.

**Example:**
```bash
curl "http://localhost:8000/student/CS2021001"
```

### DELETE /student/{register_number}
Deactivate a student (soft delete).

**Example:**
```bash
curl -X DELETE "http://localhost:8000/student/CS2021001"
```

### GET /health
Health check endpoint.

**Example:**
```bash
curl "http://localhost:8000/health"
```

## Database Schema

The service expects a `students` table in Supabase with the following structure:

```sql
create table public.students (
  id uuid not null default gen_random_uuid (),
  register_number text not null,
  full_name text not null,
  email text null,
  phone text null,
  hostel_status public.hostel_status not null default 'resident'::hostel_status,
  room_number text null,
  face_embedding bytea null,
  profile_image_url text null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  building_id uuid null,
  constraint students_pkey primary key (id),
  constraint students_register_number_key unique (register_number)
);
```

## Architecture

- **MediaPipe**: Used for face detection
- **TensorFlow Lite**: Used for face embedding generation
- **FastAPI**: Web framework for the API
- **Supabase**: PostgreSQL database for storing embeddings
- **OpenCV**: Image processing

## Security Considerations

- Face embeddings are stored as binary data in the database
- Service role key is used for database operations
- Face embeddings are not returned in API responses
- Input validation for image files and register numbers

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (e.g., no face detected)
- `404`: Student not found
- `500`: Internal server error

## Performance

- The service can process images in real-time
- Embedding comparison is done using cosine similarity
- Threshold for authentication is configurable (currently 0.5)

## Integration with Hostel Management System

This face recognition API can be integrated with the main hostel management system for:
- Student check-in/check-out
- Access control
- Attendance tracking
- Identity verification