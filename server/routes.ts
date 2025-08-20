import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertBlogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Projects Routes
  app.get("/api/projects", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const category = req.query.category as string;
      
      const result = await storage.getProjects(limit, offset, search, category);
      res.json(result);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      // Get auth token from header
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7); // Remove "Bearer "
      
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData, token);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      // Get auth token from header
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7); // Remove "Bearer "
      
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData, token);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      // Get auth token from header
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7); // Remove "Bearer "
      
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      await storage.deleteProject(req.params.id, token);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Blogs Routes
  app.get("/api/blogs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const status = req.query.status as string;
      
      const result = await storage.getBlogs(limit, offset, search, status);
      res.json(result);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ error: "Failed to fetch blogs" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ error: "Failed to fetch blog" });
    }
  });

  app.post("/api/blogs", async (req, res) => {
    try {
      // Get auth token from header
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7); // Remove "Bearer "
      
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertBlogSchema.parse(req.body);
      const blog = await storage.createBlog(validatedData, token);
      res.status(201).json(blog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating blog:", error);
      res.status(500).json({ error: "Failed to create blog" });
    }
  });

  app.put("/api/blogs/:id", async (req, res) => {
    try {
      // Get auth token from header
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7); // Remove "Bearer "
      
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertBlogSchema.partial().parse(req.body);
      const blog = await storage.updateBlog(req.params.id, validatedData, token);
      res.json(blog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating blog:", error);
      res.status(500).json({ error: "Failed to update blog" });
    }
  });

  app.delete("/api/blogs/:id", async (req, res) => {
    try {
      // Get auth token from header
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7); // Remove "Bearer "
      
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      await storage.deleteBlog(req.params.id, token);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ error: "Failed to delete blog" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
