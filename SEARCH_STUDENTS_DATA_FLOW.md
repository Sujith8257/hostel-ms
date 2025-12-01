# Search Students Data Flow

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  1. DATA SOURCE                                                 │
│     └──> Supabase PostgreSQL Database (Cloud)                   │
│         Table: 'students'                                       │
│         URL: https://omnmyjuqygveshjkcebo.supabase.co          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ SQL Query via Supabase Client
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. FACE RECOGNITION APP (Python Backend)                      │
│     File: face_recognition/app.py                              │
│                                                                 │
│     Function: get_all_students_including_no_face()             │
│     Line 98-105                                                 │
│                                                                 │
│     Code:                                                      │
│     result = supabase.table('students')                        │
│              .select('*')                                       │
│              .eq('is_active', True)                             │
│              .limit(2000)                                       │
│              .execute()                                        │
│                                                                 │
│     Returns: List of student dictionaries                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP GET Request
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. API ENDPOINT                                                │
│     Route: GET /api/students                                    │
│     Line 1831-1846                                             │
│                                                                 │
│     Function: get_students_endpoint()                          │
│                                                                 │
│     Code:                                                      │
│     students = get_all_students_including_no_face(limit=2000)│
│     return {                                                   │
│         "success": True,                                       │
│         "students": students,                                  │
│         "count": len(students)                                 │
│     }                                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ JSON Response
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. FRONTEND (Browser JavaScript)                              │
│     File: face_recognition/app.py (in HTML template)          │
│                                                                 │
│     Function: loadStudents()                                   │
│     Line 705-716                                                │
│                                                                 │
│     Code:                                                      │
│     const response = await fetch('/api/students');            │
│     const data = await response.json();                        │
│     allStudents = data.students || [];                         │
│     displayStudents(allStudents);                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Store in 'allStudents' array
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. SEARCH FUNCTION                                             │
│     Function: filterStudents()                                 │
│     Line 759-788                                                │
│                                                                 │
│     Code:                                                      │
│     const searchTerm = searchInput.value.trim().toLowerCase(); │
│     const filtered = allStudents.filter(student =>            │
│         student.full_name.toLowerCase().includes(searchTerm) ||│
│         student.register_number.toLowerCase().includes(...)   │
│     );                                                          │
│     displayStudents(filtered);                                │
└─────────────────────────────────────────────────────────────────┘
```

## Data Source Configuration

### Environment Variables
File: `face_recognition/.env`

```env
SUPABASE_URL=https://omnmyjuqygveshjkcebo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Connection
File: `face_recognition/app.py` (Lines 27-29)

```python
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)
```

## What Data is Retrieved?

The function `get_all_students_including_no_face()` fetches:

### Query Details:
- **Table**: `students`
- **Filter**: Only active students (`is_active = True`)
- **Limit**: Up to 2000 students
- **Fields**: All fields (`select('*')`)

### Data Structure:
Each student object contains:
```json
{
  "id": "uuid",
  "register_number": "REG001",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "hostel_status": "resident",
  "room_number": "A101",
  "face_embedding": null or [array of floats],
  "profile_image_url": "https://...",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

## Search Functionality

### What is Searched?

The search filters by:
1. **Full Name** (case-insensitive, substring matching)
2. **Register Number** (case-insensitive, substring matching)

### Example Searches:

| Search Term | Matches                                          |
|-------------|--------------------------------------------------|
| "john"      | Any student with "john" in name or register no |
| "REG001"    | Students with "REG001" in register number     |
| "smith"     | Students with "smith" in name                   |
| "" (empty)  | Shows all students                              |

## When Data is Loaded

Data is loaded automatically:
1. **On page load** - Line 999: `loadStudents()` called in `DOMContentLoaded` event
2. **After face registration** - Line 930: `loadStudents()` refreshes list
3. **After photo upload** - Line 963: `loadStudents()` refreshes list

## Data Storage

- **Backend**: Supabase PostgreSQL database
- **Frontend**: `allStudents` array in browser memory
- **Updates**: Real-time when new students are registered

## API Endpoint Details

**Endpoint**: `GET /api/students`

**Response Format**:
```json
{
  "success": true,
  "students": [
    {
      "id": "uuid",
      "register_number": "REG001",
      "full_name": "John Doe",
      ...
    }
  ],
  "count": 150
}
```

## Summary

**Where data comes from**: Supabase PostgreSQL database (`students` table)

**How it gets there**: 
1. Frontend calls `/api/students` endpoint
2. Backend queries Supabase with `supabase.table('students').select('*').eq('is_active', True).limit(2000).execute()`
3. Data is returned as JSON
4. Stored in `allStudents` array
5. Filtered by search function based on user input

**Database**: The same database used by the main application (`https://omnmyjuqygveshjkcebo.supabase.co`)

