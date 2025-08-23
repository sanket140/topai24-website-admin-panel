import { createClient } from '@supabase/supabase-js';
import.meta.env;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Anon Key:", import.meta.env.VITE_SUPABASE_ANON_KEY);

  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Storage bucket utilities
export async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
  try {
    // Check if bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: ['image/*', 'video/*'],
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (createError) {
        console.error('Failed to create bucket:', createError);
        // Try to continue anyway in case bucket exists but we can't list it
      }
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Projects API
export const projectsApi = {
  async getAll(options: { search?: string; category?: string; limit?: number; offset?: number } = {}) {
    const { search, category, limit = 10, offset = 0 } = options;
    
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;
    
    if (error) throw error;
    return { projects: data || [], total: count || 0 };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(project: any) {
    // Ensure slug is generated if not provided
    if (!project.slug && project.title) {
      project.slug = project.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    }

    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, project: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Blogs API
export const blogsApi = {
  async getAll(options: { search?: string; status?: string; limit?: number; offset?: number } = {}) {
    const { search, status, limit = 9, offset = 0 } = options;
    
    let query = supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (status === 'featured') {
      query = query.eq('featured', true);
    }

    const { data, error, count } = await query;
    
    if (error) throw error;
    return { blogs: data || [], total: count || 0 };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(blog: any) {
    // Ensure slug is generated if not provided
    if (!blog.slug && blog.title) {
      blog.slug = blog.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    }

    const { data, error } = await supabase
      .from('blogs')
      .insert(blog)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, blog: any) {
    const { data, error } = await supabase
      .from('blogs')
      .update(blog)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Dashboard API
export const dashboardApi = {
  async getStats() {
    // Get project count
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Get blog count 
    const { count: publishedBlogs } = await supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true });

    // Get featured content count
    const { count: featuredProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('featured', true);

    const { count: featuredBlogs } = await supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true })
      .eq('featured', true);

    return {
      totalProjects: totalProjects || 0,
      publishedBlogs: publishedBlogs || 0,
      featuredContent: (featuredProjects || 0) + (featuredBlogs || 0)
    };
  }
};
