# SpeakEnglish Admin Dashboard

A production-ready web-based admin dashboard for managing the SpeakEnglish mobile application. Built with React 18, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

- **User Management**: View, search, filter, and manage users. Change user levels, view progress, and subscription history.
- **Course Management**: Create, edit, and publish courses and chapters. Upload videos to Contabo S3 storage.
- **Exam Management**: Create and manage exam questions for each chapter with multiple-choice questions.
- **Subscription Management**: View subscriptions, extend or cancel subscriptions, and monitor revenue.
- **Speaking Sessions**: Monitor active and historical 1-v-1 speaking sessions with real-time updates.
- **Analytics Dashboard**: View platform statistics, revenue charts, user growth, and recent activity.
- **Secure Authentication**: Admin-only access with Supabase Auth and role verification.

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query) + Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Headless UI
- **Backend**: Supabase (PostgreSQL, Auth)
- **Storage**: Contabo S3-compatible storage

## Prerequisites

- Node.js 18+ and npm
- Supabase project with the SpeakEnglish database schema
- Contabo S3 credentials (for video uploads)

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd englishadminappdash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://irgatccwxeexvvcrozxg.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_CONTABO_ACCESS_KEY=your_contabo_access_key
   VITE_CONTABO_SECRET_KEY=your_contabo_secret_key
   VITE_CONTABO_BUCKET_NAME=your_bucket_name
   VITE_CONTABO_ENDPOINT=https://your-contabo-endpoint.com
   ```

   **Important**: Replace the placeholder values with your actual credentials.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in the terminal)

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory. You can preview it with:

```bash
npm run preview
```

## Admin Setup

Before you can log in, you need to:

1. **Create an admin user in Supabase**
   
   In your Supabase dashboard, go to the `admin_users` table and insert a record:
   ```sql
   INSERT INTO admin_users (id, is_admin)
   VALUES ('your-auth-user-id', true);
   ```
   
   Replace `your-auth-user-id` with the UUID from `auth.users` table (the user you want to make admin).

2. **Create the admin account**
   
   Use Supabase Auth to create a user account with email/password, then add that user's ID to the `admin_users` table as shown above.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout/         # Sidebar, Header, MainLayout
│   └── ProtectedRoute.tsx
├── hooks/             # React Query hooks for data fetching
│   ├── useDashboard.ts
│   ├── useUsers.ts
│   ├── useCourses.ts
│   ├── useExams.ts
│   ├── useSubscriptions.ts
│   └── useSpeakingSessions.ts
├── lib/                # Utilities and configurations
│   ├── supabase.ts     # Supabase client
│   ├── s3.ts           # Contabo S3 upload functions
│   ├── auth.ts         # Authentication utilities
│   └── queryClient.ts  # React Query client
├── pages/              # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Users.tsx
│   ├── Courses.tsx
│   ├── Subscriptions.tsx
│   ├── SpeakingSessions.tsx
│   ├── Exams.tsx
│   └── Settings.tsx
├── store/              # Zustand stores
│   └── authStore.ts
├── types/              # TypeScript type definitions
│   └── database.ts
└── App.tsx             # Main app component with routing
```

## Key Features Explained

### Authentication
- Login page with email/password
- Protected routes that verify admin status
- Session persistence
- Auto-logout if admin status is revoked

### Dashboard
- Real-time statistics (users, subscriptions, revenue, sessions)
- Revenue chart (last 30 days)
- User growth chart
- Subscription plan distribution (pie chart)
- Recent activity feed

### User Management
- Search and filter users by level, subscription status
- View user details: profile, subscriptions, course progress, speaking sessions
- Change user levels (with confirmation)
- Export user data to CSV

### Course Management
- Create/edit courses with level, title, description, order
- Publish/unpublish courses
- Manage chapters within courses
- Upload videos to Contabo S3
- Set video duration
- Create exams for chapters

### Exam Management
- Create exams with passing score
- Add/edit/delete multiple-choice questions
- Set correct answers (A, B, C, or D)
- Reorder questions

### Subscription Management
- View all subscriptions with filters
- Extend subscriptions (add days or months)
- Cancel active subscriptions
- View payment history
- Export subscription data

### Speaking Sessions
- View active and historical sessions
- Real-time updates (refreshes every 10 seconds)
- Session statistics (total, active, average duration, sessions today)
- View session details and ratings

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_CONTABO_ACCESS_KEY` | Contabo S3 access key | Yes (for video uploads) |
| `VITE_CONTABO_SECRET_KEY` | Contabo S3 secret key | Yes (for video uploads) |
| `VITE_CONTABO_BUCKET_NAME` | Contabo S3 bucket name | Yes (for video uploads) |
| `VITE_CONTABO_ENDPOINT` | Contabo S3 endpoint URL | Yes (for video uploads) |

## Security Notes

- **Never commit `.env` file** - It contains sensitive credentials
- The Supabase anon key is safe to expose in the frontend (RLS policies protect your data)
- Contabo credentials are exposed in the bundle (use environment variables, but be aware they're visible in the client)
- All routes are protected and verify admin status
- Admin verification happens on every route access

## Troubleshooting

### "Access denied. Admin privileges required."
- Make sure the user exists in the `admin_users` table with `is_admin = true`
- Verify the user ID matches the one in `auth.users`

### Video upload fails
- Check Contabo S3 credentials in `.env`
- Verify bucket name and endpoint are correct
- Ensure the bucket allows public uploads or configure CORS

### Charts not displaying
- Check browser console for errors
- Verify data is being fetched (check Network tab)
- Ensure Recharts is properly installed

### Routes not working
- Make sure React Router is properly set up
- Check that all routes are wrapped in `ProtectedRoute`
- Verify authentication state in Zustand store

## Development Tips

- Use React Query DevTools (install `@tanstack/react-query-devtools`) for debugging queries
- Check Supabase logs in the dashboard for database errors
- Use browser DevTools to inspect network requests
- Check Zustand store state in React DevTools

## License

Private project for SpeakEnglish application management.

## Support

For issues or questions, check:
1. Supabase dashboard logs
2. Browser console errors
3. Network tab for failed requests
4. React Query DevTools for query states
