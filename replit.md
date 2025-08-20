# Company Admin Panel

## Overview

This is a full-stack admin panel application for managing a company website's content. The application provides CRUD operations for projects and blog posts, along with a dashboard for viewing key statistics. It's built with a modern React frontend and Express.js backend, using PostgreSQL as the database through Drizzle ORM. The application is designed to help company administrators manage their portfolio projects and blog content efficiently.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured endpoints for projects, blogs, and dashboard stats
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling with proper status codes and JSON responses

### Database Architecture
- **Database**: PostgreSQL with connection via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Design**: Three main entities - users, projects, and blogs with JSON fields for flexible content storage
- **Migrations**: Drizzle Kit for database schema migrations

### Data Models
- **Users**: Basic authentication with username/password
- **Projects**: Portfolio items with metadata, categories, technologies, and rich content structure
- **Blogs**: Articles with hero sections, multiple content sections, and publishing workflow

### File Storage
- **Images**: Supabase Storage for handling file uploads (thumbnails, project images, blog assets)
- **Integration**: Custom upload utilities with error handling and public URL generation

### Development Environment
- **Development Server**: Vite dev server with HMR for frontend, tsx for backend hot reloading
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Shared TypeScript types between frontend and backend via shared schema

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database for scalable data storage
- **File Storage**: Supabase for image and asset management with CDN capabilities
- **Authentication**: Basic session-based authentication (expandable to Supabase Auth)

### Key Libraries
- **Database**: Drizzle ORM with Neon serverless driver for type-safe database operations
- **UI Components**: Radix UI primitives with shadcn/ui components for accessibility and consistency
- **Validation**: Zod for runtime type validation and schema definition
- **File Upload**: Custom Supabase integration for handling media assets
- **Date Handling**: date-fns for date manipulation and formatting

### Development Tools
- **Build Tools**: Vite for frontend, esbuild for backend bundling
- **Type Checking**: TypeScript with strict configuration
- **Styling**: Tailwind CSS with PostCSS for processing
- **Development**: tsx for TypeScript execution, Replit integration for cloud development