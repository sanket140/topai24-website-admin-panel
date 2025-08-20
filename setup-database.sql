-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail TEXT,
  category TEXT,
  technologies TEXT[],
  demo_url TEXT,
  github_url TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  author TEXT,
  thumbnail TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  hero_section JSONB,
  sections JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author);

-- Insert sample data for testing
INSERT INTO users (username, password) VALUES ('admin', '$2b$10$example_hashed_password') ON CONFLICT (username) DO NOTHING;

INSERT INTO projects (title, slug, description, thumbnail, category, technologies, demo_url, github_url, featured, status, content) VALUES 
('E-commerce Platform', 'ecommerce-platform', 'A modern e-commerce platform built with React and Node.js', 'https://example.com/thumbnail1.jpg', 'Web App', ARRAY['React', 'Node.js', 'PostgreSQL'], 'https://demo1.example.com', 'https://github.com/example/project1', true, 'published', '{"hero": {"title": "E-commerce Platform", "subtitle": "Modern online shopping experience", "description": "A comprehensive e-commerce solution"}, "features": [{"title": "User Authentication", "description": "Secure login system"}, {"title": "Payment Integration", "description": "Multiple payment options"}], "architecture": {"frontend": "React", "backend": "Node.js", "database": "PostgreSQL"}}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO projects (title, slug, description, thumbnail, category, technologies, demo_url, github_url, featured, status, content) VALUES 
('Mobile Banking App', 'mobile-banking-app', 'A secure mobile banking application with modern UI', 'https://example.com/thumbnail2.jpg', 'Mobile App', ARRAY['React Native', 'Firebase', 'TypeScript'], 'https://demo2.example.com', 'https://github.com/example/project2', false, 'published', '{"hero": {"title": "Mobile Banking App", "subtitle": "Banking made simple", "description": "Secure and user-friendly mobile banking"}, "features": [{"title": "Biometric Auth", "description": "Fingerprint and face recognition"}, {"title": "Real-time Transactions", "description": "Instant money transfers"}], "architecture": {"frontend": "React Native", "backend": "Firebase", "database": "Firestore"}}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, author, thumbnail, featured, published, hero_section, sections) VALUES 
('Getting Started with React Hooks', 'getting-started-react-hooks', 'Learn how to use React Hooks effectively in your projects', 'John Doe', 'https://example.com/blog1.jpg', true, true, '{"title": "Getting Started with React Hooks", "subtitle": "Modern React Development", "gradient": "gradient-blue", "tags": ["React", "JavaScript", "Hooks"]}', '[{"type": "text", "content": "React Hooks revolutionized how we write React components..."}, {"type": "code", "content": "const [count, setCount] = useState(0);"}]')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, author, thumbnail, featured, published, hero_section, sections) VALUES 
('Building Scalable APIs with Node.js', 'building-scalable-apis-nodejs', 'Best practices for creating robust and scalable APIs', 'Jane Smith', 'https://example.com/blog2.jpg', false, true, '{"title": "Building Scalable APIs with Node.js", "subtitle": "Backend Development Guide", "gradient": "gradient-green", "tags": ["Node.js", "API", "Backend"]}', '[{"type": "text", "content": "Creating scalable APIs is crucial for modern applications..."}, {"type": "image", "content": "https://example.com/api-diagram.jpg"}]')
ON CONFLICT (slug) DO NOTHING;