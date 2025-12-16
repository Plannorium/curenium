# Curenium EHR

Curenium EHR is a comprehensive Electronic Health Records (EHR) system designed for seamless healthcare management. It offers communication, collaboration, appointment scheduling, audits, and control for efficient patient management in modern healthcare environments.

## Features

- **Patient Management**: Comprehensive patient profiles with medical history, vitals, prescriptions, and more.
- **Appointment Scheduling**: Book, confirm, and manage appointments with doctors.
- **Real-time Communication**: Chat and video calls between healthcare professionals and patients.
- **EHR Modules**: Admissions, discharges, lab orders, nursing care plans, and audit logs.
- **Shift Tracking**: Manage staff shifts, breaks, and performance metrics.
- **Notifications & Alerts**: Real-time alerts for critical events and notifications.
- **Audit & Compliance**: Full audit logging for all actions, ensuring HIPAA compliance.
- **Multi-role Support**: Roles like admin, doctor, nurse, lab tech, receptionist, and matron nurse.
- **Responsive UI**: Modern, accessible interface with dark/light themes and gesture controls.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Real-time**: WebSockets (Cloudflare Workers), Pusher fallback
- **File Storage**: Cloudinary/R2 for uploads
- **Deployment**: Vercel/Cloudflare

## Project Structure

```
curenium/
├── app/                          # Next.js app directory
│   ├── (dashboard)/              # Dashboard routes
│   │   ├── components/           # Shared components (Chat, EHRLayout, etc.)
│   │   ├── dashboard/            # Dashboard pages (EHR, chat, settings, etc.)
│   │   └── call/                 # Video call pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication
│   │   ├── patients/             # Patient management
│   │   ├── appointments/         # Appointment scheduling
│   │   └── ...                   # Other endpoints
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── models/                       # Mongoose models
│   ├── Patient.ts                # Patient data model
│   ├── User.ts                   # User authentication and roles
│   ├── Appointment.ts            # Appointment scheduling
│   └── ...                       # Other models
├── hooks/                        # Custom React hooks
│   ├── useChat.ts                # Chat functionality
│   ├── useNotifications.ts       # Notification management
│   └── ...                       # Other hooks
├── components/                   # Shared UI components
├── lib/                          # Utility libraries
└── ...
```

## User Flows

### Authentication Flow
1. User visits landing page (`/`)
2. Signs up or logs in via NextAuth.js
3. Completes account setup (role selection, organization)
4. Redirected to dashboard

### Dashboard Navigation
- **Main Dashboard**: Overview of alerts, appointments, and quick actions
- **EHR Sections**:
  - Patients: Search, view, add patients; manage records (vitals, prescriptions, etc.)
  - Appointments: Schedule, confirm, view calendar
  - Admissions/Discharges: Manage patient admissions and discharges
  - Lab: Order tests, view results
  - Pharmacy: Dispense prescriptions
  - Shift Tracking: View and manage staff shifts
- **Communication**: Chat rooms, video calls, notifications

### EHR Workflow Example (Patient Care)
1. Patient admitted via Admissions module
2. Nurse records vitals and notes
3. Doctor schedules appointment, reviews records
4. Lab orders placed and results uploaded
5. Prescriptions prescribed and administered
6. Patient discharged with summary

## Data Structures & Models

Key Mongoose models include:

- **User**: Authentication, roles (admin, doctor, nurse, etc.), settings
- **Patient**: Demographics, medical history, assigned providers
- **Appointment**: Scheduling with doctors, status tracking
- **Admission/Discharge**: Hospital stay management
- **Vital**: Patient vitals (BP, HR, etc.)
- **Prescription**: Medications, dosages, administration records
- **LabOrder/LabResult**: Test orders and results
- **ShiftTracking**: Staff shifts, breaks, performance
- **AuditLog**: All actions logged for compliance
- **Message/Channel**: Communication data
- **Organization**: Multi-tenant support

Each model includes timestamps, indexes for performance, and audit plugins for logging.

## API Endpoints

API routes are organized under `app/api/`:

- **Auth**: `/api/auth/[...nextauth]` - NextAuth.js handlers
- **Patients**: `/api/patients` - CRUD operations, search
- **Appointments**: `/api/appointments` - Scheduling and management
- **Vitals**: `/api/vitals` - Record and retrieve patient vitals
- **Prescriptions**: `/api/prescriptions` - Manage medications
- **Lab**: `/api/lab-orders`, `/api/lab-results` - Test management
- **Admissions/Discharges**: `/api/admissions`, `/api/discharges`
- **Shifts**: `/api/shifts`, `/api/shift-tracking`
- **Chat**: `/api/chat/socket` - WebSocket for real-time messaging
- **Notifications**: `/api/notifications` - Alerts and notifications
- **Uploads**: `/api/upload`, `/api/upload-pdf` - File handling
- **Audit Logs**: `/api/audit-logs` - Compliance logging

All endpoints support authentication and role-based access.

## System Design

### Architecture
- **Monolithic with Microservices Elements**: Next.js handles frontend and API routes; external services for real-time (Cloudflare Workers).
- **Database**: MongoDB with Mongoose ODM for data modeling.
- **Authentication**: NextAuth.js with providers (email, OAuth).
- **Real-time Communication**: WebSockets via Cloudflare Durable Objects for chat and calls; Pusher as fallback.
- **File Storage**: Cloudinary for images/PDFs, with thumbnails and previews.
- **Audit & Security**: All changes logged; HIPAA-compliant with encryption.

### Key Features
- **Real-time**: Live chat, video calls, notifications.
- **Scalable**: Modular design for EHR modules.
- **Secure**: Role-based access, audit trails.
- **Responsive**: Works on desktop, tablet, mobile.

## UI Approach

- **Framework**: Tailwind CSS for utility-first styling.
- **Components**: shadcn/ui for consistent, accessible components (buttons, modals, etc.).
- **Themes**: Light/dark mode with custom color palettes (primary, accent).
- **Responsiveness**: Mobile-first design with breakpoints.
- **Animations**: Framer Motion for smooth transitions; custom CSS for modals and gestures.
- **Accessibility**: ARIA labels, keyboard navigation.
- **Special Features**: Gesture controls for video calls (hand tracking), glassmorphic cards, custom scrollbars.

## Installation and Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account for file uploads
- Pusher/Cloudflare Workers for real-time (optional)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/curenium.git
   cd curenium
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
   NEXT_PUBLIC_CLOUDFLARE_WORKER_URL=your_worker_url
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and sign up.

### Database Setup
- Models auto-create collections on first use.
- Seed initial data if needed (e.g., default channels).

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo to Vercel.
2. Set environment variables in Vercel dashboard.
3. Deploy automatically on push.

### Other Platforms
- Use `npm run build` and deploy to any Node.js host.
- For real-time: Deploy Cloudflare Workers separately.

## Contributing

1. Fork the repo.
2. Create a feature branch.
3. Make changes and test.
4. Submit a PR with description.

## License

This project is licensed under the MIT License. See LICENSE for details.
