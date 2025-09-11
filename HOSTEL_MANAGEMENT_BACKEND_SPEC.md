# Hostel Management System - Backend Integration & Role Hierarchy Specification

## 📋 Project Overview
Integrate a comprehensive Node.js backend with Express.js and create separate pages for hostel management hierarchy with respective APIs and database schemas.

## 🏗️ Architecture Overview
```
Frontend (React + Vite) ←→ Node.js Backend (Express.js) ←→ Supabase Database
```

## 👥 Role Hierarchy Structure

### 1. **Admin/System Administrator** (Top Level)
- Full system access and control
- Can manage all lower roles
- System-wide settings and configurations

### 2. **Hostel Director** (Institution Level)
- Oversees entire hostel operations
- Manages wardens and below
- Institution-wide policies and decisions

### 3. **Warden** (Building/Block Level)
- Manages building operations
- Supervises associate wardens and caretakers
- Building-level security and administration

### 4. **Associate Warden/Deputy Warden** (Floor/Section Level)
- Assists warden in daily operations
- Manages specific floors or sections
- Direct supervision of students

### 5. **Caretaker/Floor Incharge** (Maintenance Level)
- Room maintenance and basic supervision
- Student assistance and support
- Ground-level operations

---

## 🎯 Implementation Phases

## Phase 1: Backend Infrastructure & Admin APIs ✅

### 1.1 Node.js Backend Setup
- [ ] Initialize Express.js server
- [ ] Configure middleware (CORS, helmet, compression)
- [ ] Set up environment configuration
- [ ] Implement logging (Winston)
- [ ] Add request validation (Joi/Zod)
- [ ] Set up error handling middleware

### 1.2 Database Schema Updates
- [ ] Extend user roles enum to include new hierarchy
- [ ] Create hostel_structure table
- [ ] Create staff_assignments table
- [ ] Add permissions table
- [ ] Update RLS policies for new roles

### 1.3 Admin APIs
- [ ] **POST** `/api/admin/users` - Create new staff user
- [ ] **GET** `/api/admin/users` - List all staff with pagination
- [ ] **PUT** `/api/admin/users/:id` - Update user details/role
- [ ] **DELETE** `/api/admin/users/:id` - Deactivate user
- [ ] **GET** `/api/admin/permissions` - Get role permissions matrix
- [ ] **PUT** `/api/admin/permissions` - Update role permissions
- [ ] **GET** `/api/admin/system-health` - System status and metrics
- [ ] **POST** `/api/admin/backup` - Trigger database backup
- [ ] **GET** `/api/admin/audit-logs` - System audit trail

### 1.4 Admin Frontend Pages
- [ ] Admin Dashboard redesign
- [ ] Staff Management page
- [ ] Role & Permissions manager
- [ ] System Settings page
- [ ] Audit Logs viewer
- [ ] System Health monitor

---

## Phase 2: Hostel Director APIs & Frontend ⏳

### 2.1 Hostel Director APIs
- [ ] **GET** `/api/director/dashboard` - Director overview stats
- [ ] **GET** `/api/director/hostels` - Hostel buildings managed
- [ ] **POST** `/api/director/hostels` - Create new hostel building
- [ ] **PUT** `/api/director/hostels/:id` - Update hostel details
- [ ] **GET** `/api/director/staff` - Staff under supervision
- [ ] **POST** `/api/director/staff/assign` - Assign staff to buildings
- [ ] **GET** `/api/director/reports/occupancy` - Occupancy reports
- [ ] **GET** `/api/director/reports/security` - Security incident reports
- [ ] **GET** `/api/director/policies` - Institution policies
- [ ] **POST** `/api/director/policies` - Create/update policies

### 2.2 Hostel Director Frontend
- [ ] Director Dashboard page
- [ ] Hostel Buildings management
- [ ] Staff Assignment interface
- [ ] Policy Management system
- [ ] Comprehensive Reporting dashboard
- [ ] Institution-wide Analytics

---

## Phase 3: Warden APIs & Frontend ⏳

### 3.1 Warden APIs
- [ ] **GET** `/api/warden/dashboard` - Warden building overview
- [ ] **GET** `/api/warden/building/:id` - Specific building details
- [ ] **GET** `/api/warden/students` - Students in warden's building
- [ ] **POST** `/api/warden/students/assign-room` - Room assignment
- [ ] **PUT** `/api/warden/students/:id/status` - Update student status
- [ ] **GET** `/api/warden/entries/today` - Today's entry/exit logs
- [ ] **GET** `/api/warden/alerts/active` - Active security alerts
- [ ] **POST** `/api/warden/alerts/:id/resolve` - Resolve security alert
- [ ] **GET** `/api/warden/maintenance/requests` - Maintenance requests
- [ ] **POST** `/api/warden/maintenance/requests` - Create maintenance request

### 3.2 Warden Frontend
- [ ] Warden Dashboard (building-specific)
- [ ] Student Management (building scope)
- [ ] Room Assignment interface
- [ ] Security Alerts management
- [ ] Entry/Exit monitoring
- [ ] Maintenance Request system

---

## Phase 4: Associate Warden APIs & Frontend ⏳

### 4.1 Associate Warden APIs
- [ ] **GET** `/api/associate-warden/dashboard` - Floor/section overview
- [ ] **GET** `/api/associate-warden/floors` - Assigned floors
- [ ] **GET** `/api/associate-warden/students/floor/:floorId` - Floor students
- [ ] **POST** `/api/associate-warden/attendance/mark` - Mark attendance
- [ ] **GET** `/api/associate-warden/attendance/report` - Attendance reports
- [ ] **POST** `/api/associate-warden/incidents/report` - Report incidents
- [ ] **GET** `/api/associate-warden/incidents/history` - Incident history
- [ ] **GET** `/api/associate-warden/rooms/status` - Room status overview

### 4.2 Associate Warden Frontend
- [ ] Associate Warden Dashboard
- [ ] Floor Management interface
- [ ] Attendance Management system
- [ ] Incident Reporting tool
- [ ] Room Status monitor

---

## Phase 5: Caretaker APIs & Frontend ⏳

### 5.1 Caretaker APIs
- [ ] **GET** `/api/caretaker/dashboard` - Caretaker task overview
- [ ] **GET** `/api/caretaker/assignments` - Daily assignments
- [ ] **POST** `/api/caretaker/tasks/complete` - Mark task complete
- [ ] **GET** `/api/caretaker/maintenance/pending` - Pending maintenance
- [ ] **POST** `/api/caretaker/maintenance/update` - Update maintenance status
- [ ] **GET** `/api/caretaker/rooms/assigned` - Assigned rooms
- [ ] **POST** `/api/caretaker/cleaning/log` - Log cleaning activities
- [ ] **POST** `/api/caretaker/issues/report` - Report issues

### 5.2 Caretaker Frontend
- [ ] Caretaker Dashboard
- [ ] Task Management interface
- [ ] Maintenance Tracking system
- [ ] Cleaning Log manager
- [ ] Issue Reporting tool

---

## 🗄️ Database Schema Extensions

### New Tables to Create

#### 1. hostel_buildings
```sql
CREATE TABLE hostel_buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    total_floors INTEGER NOT NULL,
    total_rooms INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    director_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 2. staff_assignments
```sql
CREATE TABLE staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES profiles(id),
    building_id UUID REFERENCES hostel_buildings(id),
    floor_numbers INTEGER[],
    assignment_type VARCHAR(50), -- 'building', 'floor', 'section'
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 3. maintenance_requests
```sql
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES hostel_buildings(id),
    room_number VARCHAR(20),
    reported_by UUID REFERENCES profiles(id),
    assigned_to UUID REFERENCES profiles(id),
    issue_type VARCHAR(50),
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);
```

#### 4. attendance_logs
```sql
CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'present',
    marked_by UUID REFERENCES profiles(id),
    building_id UUID REFERENCES hostel_buildings(id),
    floor_number INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 5. incidents
```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES hostel_buildings(id),
    floor_number INTEGER,
    room_number VARCHAR(20),
    incident_type VARCHAR(50),
    description TEXT,
    severity VARCHAR(20) DEFAULT 'low',
    reported_by UUID REFERENCES profiles(id),
    status VARCHAR(20) DEFAULT 'open',
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Role Enum Extension
```sql
ALTER TYPE app_role ADD VALUE 'hostel_director';
ALTER TYPE app_role ADD VALUE 'deputy_warden';
ALTER TYPE app_role ADD VALUE 'assistant_warden';
ALTER TYPE app_role ADD VALUE 'caretaker';
```

---

## 🔐 Security & Permissions Matrix

| Role | Students | Rooms | Security | Reports | Staff | System |
|------|----------|-------|----------|---------|-------|--------|
| Admin | Full | Full | Full | Full | Full | Full |
| Hostel Director | Full | Full | Full | Full | Manage | View |
| Warden | Building | Building | Building | Building | View | None |
| Deputy Warden | Floor | Floor | Floor | Floor | None | None |
| Caretaker | View | Maintain | Basic | None | None | None |

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] API endpoint testing
- [ ] Database query testing
- [ ] Authentication middleware testing
- [ ] Permission checking functions

### Integration Tests
- [ ] Full API workflow testing
- [ ] Database integration testing
- [ ] Role-based access testing

### E2E Tests
- [ ] Complete user journey testing
- [ ] Cross-role interaction testing
- [ ] Security breach attempt testing

---

## 📁 Folder Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── directorController.js
│   │   │   ├── wardenController.js
│   │   │   ├── associateWardenController.js
│   │   │   └── caretakerController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── permissions.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   └── package.json
├── src/
│   ├── pages/
│   │   ├── AdminDashboard.tsx ✅
│   │   ├── HostelDirectorDashboard.tsx
│   │   ├── WardenDashboard.tsx ✅
│   │   ├── AssociateWardenDashboard.tsx
│   │   └── CaretakerDashboard.tsx
│   └── api/
│       └── client.ts
```

---

## 🚀 Deployment Checklist

### Backend Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API documentation generated
- [ ] Health checks implemented
- [ ] Monitoring set up

### Frontend Deployment
- [ ] API endpoints updated
- [ ] Role-based routing configured
- [ ] Permission guards implemented
- [ ] Error handling added

---

## 📊 Success Metrics

- [ ] All 5 role hierarchies have functional dashboards
- [ ] API response times < 200ms
- [ ] 100% test coverage for critical paths
- [ ] Zero security vulnerabilities
- [ ] Mobile-responsive design
- [ ] Real-time data updates working

---

## 🔄 Current Progress

### ✅ Completed
- [x] Current codebase analysis
- [x] Role hierarchy definition
- [x] Database schema design
- [x] API specification documentation
- [x] **Phase 1: Backend Infrastructure & Admin APIs**
  - [x] Express.js server setup with middleware
  - [x] Authentication and authorization middleware
  - [x] Request validation with Joi
  - [x] Supabase integration with helpers
  - [x] Admin API endpoints (dashboard, users, system health)
  - [x] Placeholder routes for all roles
  - [x] Error handling and logging
- [x] **Frontend Integration**
  - [x] API client with TypeScript support
  - [x] Updated role types and enums
  - [x] Hostel Director Dashboard page
  - [x] Associate Warden Dashboard page
  - [x] Caretaker Dashboard page
  - [x] Updated RoleDashboard routing

### 🔄 In Progress
- [ ] Database migration deployment (pending Docker/Supabase setup)
- [ ] Phase 2: Director implementation (APIs ready, needs database)

### ⏳ Pending
- [ ] Phase 2: Complete Director backend implementation
- [ ] Phase 3: Complete Warden backend implementation  
- [ ] Phase 4: Complete Associate Warden implementation
- [ ] Phase 5: Complete Caretaker implementation
- [ ] Database migration deployment
- [ ] Production deployment

---

**Next Steps**: Begin Phase 1 implementation with backend infrastructure setup and Admin APIs.