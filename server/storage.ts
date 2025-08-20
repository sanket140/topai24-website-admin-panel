import { type User, type InsertUser, type Project, type InsertProject, type Blog, type InsertBlog } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProjects(limit?: number, offset?: number, search?: string, category?: string): Promise<{ projects: Project[], total: number }>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Blogs
  getBlogs(limit?: number, offset?: number, search?: string, status?: string): Promise<{ blogs: Blog[], total: number }>;
  getBlog(id: string): Promise<Blog | undefined>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: string, blog: Partial<InsertBlog>): Promise<Blog>;
  deleteBlog(id: string): Promise<void>;
  
  // Stats
  getDashboardStats(): Promise<{
    totalProjects: number;
    publishedBlogs: number;
    featuredContent: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  private projects: Project[] = [
    {
      id: '1',
      title: 'E-commerce Platform',
      slug: 'ecommerce-platform',
      description: 'A modern e-commerce platform built with React and Node.js featuring user authentication, payment processing, and inventory management.',
      images: [],
      category: 'Web App',
      featured: true,
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      custom_url: 'https://demo1.example.com',
      screenshots: [],
      video_path: null,
      content: {
        hero: { 
          title: 'E-commerce Platform', 
          subtitle: 'Modern online shopping experience', 
          description: 'A comprehensive e-commerce solution with modern UI and secure payment processing' 
        },
        features: [
          'User Authentication - Secure login and registration system',
          'Payment Integration - Multiple payment gateways including Stripe and PayPal',
          'Inventory Management - Real-time inventory tracking and management',
          'Order Processing - Complete order lifecycle management'
        ],
        architecture: { 
          frontend: 'React with TypeScript', 
          backend: 'Node.js with Express', 
          database: 'PostgreSQL',
          deployment: 'Docker on AWS'
        }
      },
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-20')
    },
    {
      id: '2',
      title: 'Mobile Banking App',
      slug: 'mobile-banking-app',
      description: 'A secure mobile banking application with biometric authentication, real-time transactions, and comprehensive financial management tools.',
      images: [],
      category: 'Mobile App',
      featured: false,
      technologies: ['React Native', 'Firebase', 'TypeScript', 'Plaid API'],
      custom_url: 'https://demo2.example.com',
      screenshots: [],
      video_path: null,
      content: {
        hero: { 
          title: 'Mobile Banking App', 
          subtitle: 'Banking made simple and secure', 
          description: 'Next-generation mobile banking with advanced security and user-friendly interface' 
        },
        features: [
          'Biometric Authentication - Fingerprint and face recognition for secure access',
          'Real-time Transactions - Instant money transfers and payments',
          'Account Management - Comprehensive account overview and management',
          'Financial Insights - AI-powered spending analysis and budgeting tools'
        ],
        architecture: { 
          frontend: 'React Native', 
          backend: 'Firebase Functions', 
          database: 'Firestore',
          authentication: 'Firebase Auth with biometrics'
        }
      },
      created_at: new Date('2024-02-01'),
      updated_at: new Date('2024-02-15')
    },
    {
      id: '3',
      title: 'AI Chat Dashboard',
      slug: 'ai-chat-dashboard',
      description: 'An intelligent chat dashboard powered by AI with real-time conversations, analytics, and custom chatbot training capabilities.',
      images: [],
      category: 'Web App',
      featured: true,
      technologies: ['Vue.js', 'Python', 'FastAPI', 'OpenAI API'],
      custom_url: 'https://demo3.example.com',
      screenshots: [],
      video_path: null,
      content: {
        hero: { 
          title: 'AI Chat Dashboard', 
          subtitle: 'Intelligent conversations at scale', 
          description: 'Advanced AI-powered chat platform with analytics and custom model training' 
        },
        features: [
          'AI-Powered Responses - Smart conversation handling with context awareness',
          'Real-time Analytics - Live conversation metrics and performance insights',
          'Custom Training - Train chatbots on your specific data and use cases',
          'Multi-platform Integration - Connect with websites, apps, and messaging platforms'
        ],
        architecture: { 
          frontend: 'Vue.js 3 with Composition API', 
          backend: 'Python FastAPI', 
          database: 'PostgreSQL with Vector search',
          ai: 'OpenAI GPT-4 with custom fine-tuning'
        }
      },
      created_at: new Date('2024-02-20'),
      updated_at: new Date('2024-03-01')
    }
  ];

  private blogs: Blog[] = [
    {
      id: '1',
      title: 'Getting Started with React Hooks',
      slug: 'getting-started-react-hooks',
      short_description: 'Learn how to use React Hooks effectively in your projects. This comprehensive guide covers useState, useEffect, and custom hooks with practical examples.',
      published_date: '2024-01-10',
      author: 'John Doe',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      featured: true,
      published: true,
      hero_section: {
        title: 'Getting Started with React Hooks',
        subtitle: 'Modern React Development Guide',
        gradient: 'gradient-blue',
        tags: ['React', 'JavaScript', 'Hooks', 'Frontend']
      },
      sections: [
        { 
          type: 'text', 
          content: 'React Hooks revolutionized how we write React components by allowing us to use state and other React features without writing a class. In this comprehensive guide, we\'ll explore the most commonly used hooks and how to implement them effectively in your projects.' 
        },
        { 
          type: 'code', 
          content: `import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}` 
        },
        { 
          type: 'text', 
          content: 'The useState hook is the most fundamental hook that lets you add state to functional components. The useEffect hook lets you perform side effects in functional components, replacing componentDidMount, componentDidUpdate, and componentWillUnmount in class components.' 
        }
      ],
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-01-12')
    },
    {
      id: '2',
      title: 'Building Scalable APIs with Node.js',
      slug: 'building-scalable-apis-nodejs',
      short_description: 'Best practices for creating robust and scalable APIs with Node.js, Express, and modern development patterns including error handling and security.',
      published_date: '2024-01-25',
      author: 'Jane Smith',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
      featured: false,
      published: true,
      hero_section: {
        title: 'Building Scalable APIs with Node.js',
        subtitle: 'Backend Development Masterclass',
        gradient: 'gradient-green',
        tags: ['Node.js', 'API', 'Backend', 'Express']
      },
      sections: [
        { 
          type: 'text', 
          content: 'Creating scalable APIs is crucial for modern applications. In this guide, we\'ll cover essential patterns and practices for building robust Node.js APIs that can handle growth and maintain performance under load.' 
        },
        { 
          type: 'text', 
          content: 'Key principles include proper error handling, input validation, rate limiting, and implementing comprehensive logging and monitoring systems.' 
        }
      ],
      created_at: new Date('2024-01-25'),
      updated_at: new Date('2024-01-28')
    },
    {
      id: '3',
      title: 'The Future of AI in Web Development',
      slug: 'future-ai-web-development',
      short_description: 'Exploring how artificial intelligence is transforming web development, from automated testing to intelligent code generation and user experience optimization.',
      published_date: '2024-02-10',
      author: 'Alex Johnson',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      featured: true,
      published: true,
      hero_section: {
        title: 'The Future of AI in Web Development',
        subtitle: 'Transforming How We Build the Web',
        gradient: 'gradient-purple',
        tags: ['AI', 'Web Development', 'Future Tech', 'Automation']
      },
      sections: [
        { 
          type: 'text', 
          content: 'Artificial Intelligence is rapidly changing the landscape of web development. From automated code generation to intelligent testing and personalized user experiences, AI tools are becoming essential for modern developers.' 
        },
        { 
          type: 'text', 
          content: 'This transformation includes AI-powered IDEs, intelligent debugging tools, automated accessibility testing, and dynamic content personalization that adapts to user behavior in real-time.' 
        }
      ],
      created_at: new Date('2024-02-10'),
      updated_at: new Date('2024-02-12')
    }
  ];

  private users: User[] = [
    {
      id: '1',
      username: 'admin',
      password: '$2b$10$hashed_password_here' // In real app, this would be properly hashed
    }
  ];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      ...user
    };
    this.users.push(newUser);
    return newUser;
  }

  async getProjects(limit = 10, offset = 0, search?: string, category?: string): Promise<{ projects: Project[], total: number }> {
    let filtered = [...this.projects];
    
    if (search) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    const total = filtered.length;
    const projects = filtered
      .sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0))
      .slice(offset, offset + limit);
    
    return { projects, total };
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.find(project => project.id === id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const newProject: Project = {
      id: (this.projects.length + 1).toString(),
      ...project,
      content: project.content || {
        hero: { title: project.title, subtitle: "", description: project.description || "" },
        features: [],
        architecture: {}
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    this.projects.push(newProject);
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    this.projects[index] = {
      ...this.projects[index],
      ...project,
      updated_at: new Date()
    };
    
    return this.projects[index];
  }

  async deleteProject(id: string): Promise<void> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    this.projects.splice(index, 1);
  }

  async getBlogs(limit = 10, offset = 0, search?: string, status?: string): Promise<{ blogs: Blog[], total: number }> {
    let filtered = [...this.blogs];
    
    if (search) {
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.short_description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status) {
      if (status === 'featured') {
        filtered = filtered.filter(b => b.featured);
      }
    }
    
    const total = filtered.length;
    const blogs = filtered
      .sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0))
      .slice(offset, offset + limit);
    
    return { blogs, total };
  }

  async getBlog(id: string): Promise<Blog | undefined> {
    return this.blogs.find(blog => blog.id === id);
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const newBlog: Blog = {
      id: (this.blogs.length + 1).toString(),
      ...blog,
      hero_section: blog.hero_section || {
        title: blog.title,
        subtitle: "",
        gradient: "gradient-blue"
      },
      sections: blog.sections || [],
      created_at: new Date(),
      updated_at: new Date()
    };
    this.blogs.push(newBlog);
    return newBlog;
  }

  async updateBlog(id: string, blog: Partial<InsertBlog>): Promise<Blog> {
    const index = this.blogs.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Blog not found');
    }
    
    this.blogs[index] = {
      ...this.blogs[index],
      ...blog,
      updated_at: new Date()
    };
    
    return this.blogs[index];
  }

  async deleteBlog(id: string): Promise<void> {
    const index = this.blogs.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Blog not found');
    }
    this.blogs.splice(index, 1);
  }

  async getDashboardStats(): Promise<{ totalProjects: number; publishedBlogs: number; featuredContent: number }> {
    const totalProjects = this.projects.length;
    const publishedBlogs = this.blogs.length;
    const featuredContent = this.projects.filter(p => p.featured).length + this.blogs.filter(b => b.featured).length;
    
    return {
      totalProjects,
      publishedBlogs,
      featuredContent
    };
  }
}

export const storage = new DatabaseStorage();