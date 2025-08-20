# Company Admin Panel

A full-stack admin panel application for managing company website content with projects and blog posts.

## Features

- **Dashboard**: Overview of projects, blogs, and statistics
- **Projects Management**: Create, edit, and manage portfolio projects with multiple images (up to 6 per project)
- **Blog Management**: Create and manage blog posts with rich content
- **Authentication**: Secure login with Supabase Auth
- **File Upload**: Multiple image upload support via Supabase Storage

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
PORT=5000
NODE_ENV=development
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL from `setup-database.sql` in your Supabase SQL editor
   - Set up storage buckets: `project-images` and `blog-images`
   - Configure RLS policies as needed

### Running the Application

#### Development Mode (Recommended for local development)

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Frontend dev server on `http://localhost:3000`
- Backend API server on `http://localhost:5000`

#### Alternative: Run backend only (for Replit-style development)
```bash
npm run local
```

This runs the backend with Vite middleware on `http://localhost:5000`

#### Production Build
```bash
npm run build
npm start
```

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── supabase-storage.ts # Database operations
│   └── middleware/        # Express middleware
├── shared/                # Shared TypeScript types
└── migrations/           # Database migrations
```

### API Endpoints

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/projects` - List projects with pagination
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/blogs` - List blogs with pagination
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

### Authentication

The application uses Supabase Auth. Make sure to:
1. Set up authentication in your Supabase project
2. Create an admin user account
3. Configure RLS policies for secure data access

### File Upload

Projects support up to 6 images each. Images are stored in Supabase Storage in the `project-images` bucket.

### Troubleshooting

1. **Port conflicts**: Change the PORT in `.env` if 5000 is occupied
2. **Database connection**: Verify your Supabase URL and keys
3. **File upload issues**: Check Supabase Storage bucket permissions
4. **Build errors**: Run `npm run check` to verify TypeScript

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License