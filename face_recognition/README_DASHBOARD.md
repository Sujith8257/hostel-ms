# Face Recognition Dashboard - Enhanced Version

This enhanced face recognition system now includes a beautiful web dashboard and automatic logging of entries and attendance.

## ✨ New Features

### 🎨 Beautiful Web Dashboard
- Real-time statistics display
- Student registration interface
- Live camera feed for face recognition
- Activity logs
- Modern, responsive design

### 📊 Database Logging
- **Entry Logs**: Tracks all face recognition attempts with timestamps, confidence scores, and locations
- **Attendance Logs**: Automatically marks attendance when face recognition is successful
- **Real-time Stats**: Dashboard shows live statistics

### 🔐 Enhanced Security
- Automatic confidence scoring
- Failed attempt logging
- Entry/exit tracking

## 🚀 Quick Start

### 1. Database Setup

First, set up the new database tables:

```bash
# Run the database setup script
python3.9 setup_enhanced_db.py
```

If the script shows SQL commands, copy and paste them into your Supabase SQL editor.

### 2. Start the Server

```bash
# Start the enhanced face recognition server
python3.9 -m uvicorn app:app --host 0.0.0.0 --port 8005 --reload
```

### 3. Access the Dashboard

Open your web browser and go to:
```
http://localhost:8005
```

### 4. Test the System

```bash
# Test all endpoints
python3.9 test_dashboard.py
```

## 📱 Dashboard Features

### Main Dashboard
- **Total Students**: Shows number of registered students
- **Today's Entries**: Number of face recognition attempts today
- **Present Today**: Students marked present via face recognition
- **System Status**: Real-time system health

### Student Registration
- Register new students with face images
- Upload photos for face embedding generation
- Automatic validation and feedback

### Authentication
- Test face recognition with uploaded images
- Real-time confidence scoring
- Automatic entry and attendance logging

### Live Camera Feed
- Real-time camera integration
- Capture and process faces instantly
- Live face detection feedback

### Activity Logs
- Real-time activity feed
- Success/failure notifications
- Timestamp tracking

## 🗄️ Database Tables

### entry_logs
Tracks all face recognition attempts:
- `student_id`: Reference to student
- `register_number`: Student register number
- `student_name`: Student full name
- `entry_type`: 'entry', 'exit', or 'failed_attempt'
- `timestamp`: When the recognition occurred
- `confidence_score`: Recognition confidence (0-1)
- `image_url`: Optional image storage
- `location`: Where the recognition happened

### attendance_logs
Tracks daily attendance:
- `student_id`: Reference to student
- `date`: Date of attendance
- `status`: 'present', 'absent', 'late', 'excused'
- `marked_by`: Who marked the attendance
- `building_id`: Optional building reference
- `floor_number`: Optional floor number
- `notes`: Additional notes

## 🔌 API Endpoints

### Dashboard Endpoints
- `GET /` - Main dashboard HTML
- `GET /api/stats` - Dashboard statistics
- `GET /api/recent_entries` - Recent entry logs
- `GET /api/attendance_today` - Today's attendance

### Face Recognition Endpoints
- `POST /register/` - Register new student
- `POST /authenticate/` - Authenticate student (with logging)
- `POST /process_face/` - Process face for detection points
- `POST /mark_attendance/` - Manually mark attendance

### Management Endpoints
- `GET /student/{register_number}` - Get student info
- `DELETE /student/{register_number}` - Deactivate student
- `GET /health` - System health check

## 🎯 Usage Examples

### Automatic Entry Logging
When a student is authenticated successfully:
1. Face recognition confidence is calculated
2. Entry is logged to `entry_logs` table
3. Attendance is automatically marked as 'present'
4. Dashboard statistics are updated

### Manual Attendance
```bash
curl -X POST "http://localhost:8005/mark_attendance/" \
  -F "register_number=CS001" \
  -F "status=present" \
  -F "marked_by=admin_user_id" \
  -F "notes=Manually marked present"
```

### View Recent Activity
```bash
curl "http://localhost:8005/api/recent_entries?limit=10"
```

## 🔧 Configuration

### Environment Variables
Make sure your `.env` file contains:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Camera Access
The dashboard requires camera permissions for live face recognition. Make sure to:
1. Use HTTPS in production
2. Grant camera permissions when prompted
3. Ensure good lighting for face detection

## 🛠️ Troubleshooting

### Database Issues
```bash
# Check if tables exist
python3.9 setup_enhanced_db.py

# Test database connectivity
python3.9 test_dashboard.py
```

### Camera Not Working
1. Check browser permissions
2. Ensure camera is not used by other applications
3. Try refreshing the page

### Face Recognition Issues
1. Ensure good lighting
2. Face should be clearly visible
3. Check confidence scores in logs

## 📊 Monitoring

### Dashboard Statistics
- Monitor recognition success rates
- Track daily attendance patterns
- View system health status

### Database Logs
- Query `entry_logs` for detailed recognition history
- Analyze `attendance_logs` for attendance patterns
- Monitor confidence scores for system accuracy

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- Face embedding data is stored securely
- Failed attempts are logged for security monitoring
- Confidence thresholds prevent false positives

## 🚀 Production Deployment

For production use:
1. Use HTTPS
2. Configure proper database permissions
3. Set up monitoring and alerts
4. Regular backup of face embeddings
5. Monitor system performance

## 📞 Support

If you encounter issues:
1. Check the console logs in the browser
2. Review server logs for errors
3. Verify database connectivity
4. Test API endpoints individually