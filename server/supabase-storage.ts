import { createClient } from '@supabase/supabase-js';
import { type User, type InsertUser, type Project, type InsertProject, type Blog, type InsertBlog } from "@shared/schema";

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and key must be provided');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

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

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data as User;
  }

  async getProjects(limit = 10, offset = 0, search?: string, category?: string): Promise<{ projects: Project[], total: number }> {
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' });
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(`Failed to fetch projects: ${error.message}`);
    
    return {
      projects: (data || []) as Project[],
      total: count || 0
    };
  }

  async getProject(id: string): Promise<Project | undefined> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Project;
  }

  async createProject(project: InsertProject, authToken?: string): Promise<Project> {
    const projectData = {
      ...project,
      slug: project.slug || project.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
      content: project.content || {
        hero: { title: project.title, subtitle: "", description: project.description || "" },
        features: [],
        architecture: {}
      }
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase create project error:', error);
      throw new Error(`Failed to create project: ${error.message}`);
    }
    return data as Project;
  }

  async updateProject(id: string, project: Partial<InsertProject>, authToken?: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase update project error:', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }
    return data as Project;
  }

  async deleteProject(id: string, authToken?: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete project: ${error.message}`);
  }

  async getBlogs(limit = 10, offset = 0, search?: string, status?: string): Promise<{ blogs: Blog[], total: number }> {
    let query = supabase
      .from('blogs')
      .select('*', { count: 'exact' });
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }
    
    if (status) {
      if (status === 'featured') {
        query = query.eq('featured', true);
      } else if (status === 'published') {
        query = query.eq('published', true);
      } else if (status === 'draft') {
        query = query.eq('published', false);
      }
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(`Failed to fetch blogs: ${error.message}`);
    
    return {
      blogs: (data || []) as Blog[],
      total: count || 0
    };
  }

  async getBlog(id: string): Promise<Blog | undefined> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Blog;
  }

  async createBlog(blog: InsertBlog, authToken?: string): Promise<Blog> {
    const blogData = {
      ...blog,
      slug: blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
      hero_section: blog.hero_section || {
        title: blog.title,
        subtitle: "",
        gradient: "gradient-blue"
      },
      sections: blog.sections || []
    };

    const { data, error } = await supabase
      .from('blogs')
      .insert(blogData)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create blog: ${error.message}`);
    return data as Blog;
  }

  async updateBlog(id: string, blog: Partial<InsertBlog>, authToken?: string): Promise<Blog> {
    const { data, error } = await supabase
      .from('blogs')
      .update(blog)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase update blog error:', error);
      if (error.message.includes('row-level security') || error.message.includes('single')) {
        throw new Error('Unable to update blog: Database access restricted. Please check your Supabase RLS policies or use a service role key for admin operations.');
      }
      throw new Error(`Failed to update blog: ${error.message}`);
    }
    return data as Blog;
  }

  async deleteBlog(id: string, authToken?: string): Promise<void> {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete blog: ${error.message}`);
  }

  async getDashboardStats(): Promise<{ totalProjects: number; publishedBlogs: number; featuredContent: number }> {
    const [projectsResult, blogsResult, featuredProjectsResult, featuredBlogsResult] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('blogs').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('featured', true),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('featured', true)
    ]);

    return {
      totalProjects: projectsResult.count || 0,
      publishedBlogs: blogsResult.count || 0,
      featuredContent: (featuredProjectsResult.count || 0) + (featuredBlogsResult.count || 0)
    };
  }
}

export const storage = new SupabaseStorage();