# Hostel Management System - Supabase Integration

This project now includes full Supabase backend integration for authentication and data management.

## Features Added

### Authentication
- ✅ Supabase Authentication with email/password
- ✅ User profiles with role-based access (admin, warden, student)
- ✅ Automatic profile creation on signup
- ✅ Session management and persistence
- ✅ Protected routes based on authentication status

### Database
- ✅ PostgreSQL database with Row Level Security (RLS)
- ✅ Students management (register_number, full_name, hostel_status, etc.)
- ✅ Entry/Exit logs with timestamps and confidence scores
- ✅ Security alerts system with status tracking
- ✅ User profiles linked to authentication

### Real-time Features
- ✅ Real-time subscriptions for entry logs, alerts, and student updates
- ✅ Live dashboard with actual database data
- ✅ Automatic UI updates when data changes

## Database Schema

### Tables
1. **profiles** - User profiles linked to auth.users
2. **students** - Student records with registration details
3. **entry_logs** - Entry/exit tracking with face recognition data
4. **alerts** - Security alerts for unknown faces/unauthorized access

### Key Features
- Row Level Security (RLS) policies
- Automatic timestamp updates
- Real-time subscriptions enabled
- Foreign key relationships
- Proper indexing for performance

## Environment Setup

### Required Environment Variables
```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

## Getting Started

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration files in order:
   - `supabase/migrations/20250823150030_f5fd4753-825d-47d0-82f8-1ddf4d4f4b61.sql`
   - `supabase/migrations/20250823150056_eb3003d9-9f57-4131-a621-66c34204852f.sql`
3. Optionally run the seed data: `supabase/seed_data.sql`
4. Update your `.env` file with your Supabase credentials

### 2. Application Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Test Authentication
- Navigate to `/signup` to create a new account
- Use the login page at `/login` with test credentials
- Check the "Live Data" tab on the dashboard to see real Supabase data

## Available Services

### Authentication Service (`AuthContext`)
```typescript
const { user, profile, session, login, signup, logout, isLoading } = useAuth();

// Login
const result = await login(email, password);

// Signup
const result = await signup(email, password, fullName, role);

// Logout
await logout();
```

### Data Services (`lib/services.ts`)
```typescript
// Student management
const students = await studentService.getStudents();
const student = await studentService.createStudent(studentData);

// Entry logs
const logs = await entryLogService.getEntryLogs();
const log = await entryLogService.createEntryLog(logData);

// Alerts
const alerts = await alertService.getAlerts();
const alert = await alertService.createAlert(alertData);

// Real-time subscriptions
const subscription = subscribeToEntryLogs((payload) => {
  console.log('New entry log:', payload);
});
```

## Security Features

### Row Level Security (RLS)
- Users can only access data based on their role
- Admin users have full access
- Warden users can manage students, logs, and alerts
- Student users have limited access

### Authentication Policies
- Secure password requirements
- Email verification (optional)
- Session management with automatic refresh
- Protected API endpoints

## Dashboard Features

### Overview Tab
- Mock data for demonstration
- Role-based quick actions
- Statistics and metrics
- Recent activity summaries

### Live Data Tab
- Real Supabase data integration
- Students list with status
- Recent entry logs
- Active alerts
- Refresh functionality

## Development Notes

### Type Safety
- Full TypeScript support
- Database types generated from schema
- Proper error handling
- Type-safe API calls

### Real-time Updates
- Automatic UI updates when data changes
- WebSocket connections for live data
- Subscription management
- Error handling for connection issues

### Performance
- Optimized queries with proper indexes
- Pagination for large datasets
- Efficient real-time subscriptions
- Proper loading states

## Next Steps

1. **Face Recognition Integration**
   - Add face embedding storage and processing
   - Implement confidence scoring for entry logs
   - Camera integration for live detection

2. **Advanced Features**
   - File uploads for student photos
   - Bulk import/export functionality
   - Advanced reporting and analytics
   - Mobile app support

3. **Security Enhancements**
   - Multi-factor authentication
   - Audit logs
   - Rate limiting
   - IP restrictions

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check environment variables
   - Verify Supabase project settings
   - Check browser console for errors

2. **Database connection issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure migrations are applied

3. **Real-time not updating**
   - Check Supabase realtime settings
   - Verify subscription setup
   - Check network connectivity

### Support
- Check the Supabase documentation
- Review the database logs in Supabase dashboard
- Use browser dev tools for debugging
- Check the application console for error messages