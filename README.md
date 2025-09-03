# Learning Management System (LMS)

## Project Overview
Developed a comprehensive Learning Management System with modern web technologies, featuring a responsive Next.js frontend with robust course management capabilities. The application provides a seamless learning experience with comprehensive admin management and student enrollment features.

## Admin Dashboard Access
To access the admin dashboard features, you will need to log in with an admin user account.

**Demo Admin Credentials:**
- Email: admin@example.com
- Password: admin123

Once logged in with admin credentials, you will have access to:
- Course management (Create, Edit, Delete courses)
- Chapter and lesson management
- Student enrollment tracking and analytics
- User management system
- Analytics and reporting dashboard

## Key Features Implemented

### 🔐 User Authentication & Authorization
- Secure user registration and login system
- Better-Auth based authentication with session management
- Protected routes and role-based access control
- User profile management with avatar support
- Magic link authentication support

### 📚 Course Management System
- Dynamic course catalog with search and filtering
- Course details with rich text descriptions
- Category-based course organization
- Multi-level course structure (Courses → Chapters → Lessons)
- Course difficulty levels (Beginner, Intermediate, Advanced)
- Course status management (Draft, Published, Archived)
- File upload system for course thumbnails and videos

### 🎓 Learning Experience
- Interactive course enrollment system
- Progress tracking for lessons and chapters
- Video-based lesson content
- Course completion certificates
- Responsive course player interface
- Drag-and-drop course content organization

### 💳 Payment & Enrollment
- Stripe integration for secure payments
- Course pricing and payment processing
- Enrollment status tracking (Pending, Active, Cancelled)
- 30-day money-back guarantee
- Lifetime access to purchased courses

### 👨‍💼 Admin Dashboard
- Comprehensive admin panel for course management
- Course CRUD operations (Create, Read, Update, Delete)
- Chapter and lesson management with drag-and-drop reordering
- Student enrollment analytics and reporting
- User management with role assignment
- Interactive charts and statistics

### 📱 User Experience Features
- Responsive design for mobile and desktop
- Modern UI with Tailwind CSS and Radix UI components
- Dark/Light theme support
- Rich text editor for course descriptions
- File upload with drag-and-drop functionality
- Toast notifications and loading states
- Collapsible course content sections

### ⚙️ Technical Features
- Server-side rendering with Next.js App Router
- Type-safe database operations with Prisma ORM
- AWS S3 integration for file storage
- Email notifications with Resend
- Form validation with React Hook Form and Zod
- State management with React hooks
- Security middleware with Arcjet

## Technology Stack

### Frontend:
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible component primitives
- **React Hook Form** with Zod validation
- **TipTap** for rich text editing
- **Recharts** for data visualization

### Backend & Database:
- **Next.js API Routes** for serverless functions
- **Prisma ORM** with PostgreSQL database
- **Better-Auth** for authentication
- **AWS S3** for file storage
- **Stripe** for payment processing

### Development Tools:
- **TypeScript** for enhanced development experience
- **ESLint** for code quality
- **Prisma Studio** for database management
- **Vercel** deployment ready

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: Authentication, profiles, and role management
- **Courses**: Course information, pricing, and metadata
- **Chapters**: Course content organization
- **Lessons**: Individual learning units with video content
- **Enrollments**: Student course purchases and access
- **Lesson Progress**: Individual lesson completion tracking

## Technical Achievements

- Implemented secure authentication system with session management
- Created scalable component architecture with reusable UI components
- Developed comprehensive admin panel for course and user management
- Built responsive design ensuring cross-device compatibility
- Integrated payment processing with Stripe for course purchases
- Implemented file upload system with AWS S3 integration
- Created rich text editing capabilities for course content
- Built progress tracking system for student learning analytics
- Implemented proper error handling and data validation
- Designed type-safe API routes with proper middleware protection

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- AWS S3 bucket for file storage
- Stripe account for payments

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd LMS/client
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES="your-s3-bucket"
STRIPE_SECRET_KEY="your-stripe-secret"
RESEND_API_KEY="your-resend-key"
```

5. Set up the database
```bash
npx prisma generate
npx prisma db push
```

6. Run the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
client/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (public)/          # Public course pages
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # Student dashboard
│   ├── api/               # API routes
│   └── data/              # Server actions and data fetching
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
└── prisma/               # Database schema and migrations
```

This project demonstrates proficiency in full-stack development, modern web technologies, educational platform architecture, and comprehensive learning management system implementation.
