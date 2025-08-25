# TraceVision - Missing Persons Detection System

A modern web application for managing missing persons cases and real-time AI-powered detection alerts.

## 🚀 Features

### Landing Page
- **Beautiful Hero Section**: Engaging landing page with gradient backgrounds and animations
- **Feature Showcase**: Detailed presentation of TraceVision capabilities
- **Statistics Display**: Real-time metrics and success stories
- **Testimonials**: Reviews from law enforcement and NGO partners
- **Call-to-Action**: Clear signup and login paths

### Authentication System
- **Enhanced Login Page**: Split-screen design with image and form
- **User Registration**: Comprehensive signup process with role-based access requests
- **Quick Test Login**: One-click login for different user roles during testing
- **Password Recovery**: Forgot password functionality
- **Role-based Access**: Different permissions for user types

### User Roles
- **Admin**: Full system access including user management and system configuration
- **Case Manager**: Create and manage missing persons cases, view analytics
- **Investigator**: View cases and alerts, field-focused interface

### Core Functionality
- **Dashboard**: Real-time overview of system status and recent activity
- **Case Management**: Create, track, and manage missing persons cases
- **Alert Dashboard**: Real-time AI detection alerts with confidence scoring
- **Missing Persons Database**: Searchable database of cases
- **Map View**: Geographic visualization of detections and camera coverage
- **Analytics**: System performance metrics and detection statistics
- **Admin Panel**: User management, system settings, and camera configuration

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Package Manager**: Bun

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd narayana-project
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

## 🔐 Test Credentials

The application includes dummy credentials for testing different user roles:

### Admin User
- **Email**: `admin@tracevision.com`
- **Password**: `admin123`
- **Access**: Full system access

### Case Manager (Police)
- **Email**: `sarah.johnson@police.gov`
- **Password**: `police123`
- **Access**: Case management, analytics

### Case Manager (NGO)
- **Email**: `coordinator@missingpersons.org`
- **Password**: `ngo123`
- **Access**: Case management, alerts

### Investigator
- **Email**: `mike.chen@police.gov`
- **Password**: `officer123`
- **Access**: View-only access to cases and alerts

## 📱 User Interface

### Layout Features
- **Collapsible Sidebar**: Clean navigation with role-based menu items
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Automatic theme detection with manual toggle
- **Smooth Animations**: Framer Motion animations throughout
- **Beautiful Components**: Modern shadcn/ui components with consistent styling

### Navigation
- **Main Navigation**: Dashboard, Cases, Alerts, Missing Persons, Map, Analytics
- **Admin Section**: User Management, System Settings, Camera Sources, AI Config
- **User Menu**: Profile, Settings, Logout functionality

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (blue-600 to purple-600)
- **Status Colors**:
  - Active/New: Red variants
  - Verified/Found: Green variants
  - Pending/Warning: Yellow variants
  - Inactive: Gray variants

### Components
- **Cards**: Clean white cards with subtle shadows
- **Badges**: Color-coded status indicators
- **Buttons**: Consistent styling with hover effects
- **Tables**: Responsive data tables with actions
- **Forms**: Well-structured forms with validation
- **Alerts**: Contextual notifications and warnings

## 🔒 Security Features

- **Role-based Access Control**: Different permissions for user roles
- **Authentication**: Login/logout functionality with session management
- **Protected Routes**: Route-level protection based on authentication
- **Input Validation**: Form validation and sanitization

## 📊 Dashboard Features

### Statistics Cards
- Active Cases count with trend indicators
- New Alerts with real-time updates
- Detection metrics and accuracy
- Resolved cases tracking

### Recent Activity
- Latest detection alerts with confidence scores
- Recent case updates and status changes
- System status monitoring
- Quick action buttons

### Real-time Updates
- Live alert feed from AI detection system
- Confidence scoring and verification status
- Geographic location mapping
- Time-based filtering

## 🛠️ Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navbar, Sidebar)
│   └── ui/             # shadcn/ui components
├── contexts/           # React Context providers
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

### Available Scripts
- `bun run dev`: Start development server
- `bun run build`: Build for production
- `bun run lint`: Run ESLint
- `bun run preview`: Preview production build

### Adding New Components
```bash
# Add shadcn/ui components
bunx shadcn@latest add [component-name]

# Example: Add a new form component
bunx shadcn@latest add form checkbox switch
```

## 🚧 Future Enhancements

- **Real AI Integration**: Connect to actual face recognition APIs
- **Live Camera Feeds**: Real-time camera monitoring
- **Mobile App**: React Native companion app
- **Advanced Analytics**: Machine learning insights
- **Multi-language Support**: Internationalization
- **Notification System**: Email/SMS alerts
- **API Integration**: External database connections
- **Export Functionality**: PDF reports and data export

## 📝 Notes

This is a prototype/demo application showcasing the user interface and user experience for a missing persons detection system. The AI detection features are simulated with dummy data for demonstration purposes.

The application demonstrates:
- Modern React development practices
- Beautiful, accessible UI components
- Responsive design principles
- Role-based user interfaces
- Real-time data visualization concepts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for demonstration purposes. Please ensure proper licensing for production use.
