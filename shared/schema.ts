import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"), // Main project image
  category: text("category").notNull(),
  featured: boolean("featured").default(false),
  technologies: json("technologies").$type<string[]>().default([]),
  custom_url: text("custom_url"),
  slug: text("slug").notNull().unique(),
  screenshots: json("screenshots").$type<string[]>().default([]),
  video_path: text("video_path"),
  content: json("content").$type<{
    hero: {
      title: string;
      subtitle: string;
      description: string;
    };
    video?: string;
    features: string[];
    architecture: Record<string, any>;
  }>(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const blogs = pgTable("blogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  thumbnail: text("thumbnail"),
  short_description: text("short_description"),
  author: text("author").notNull(),
  published_date: text("published_date").notNull(),
  hero_section: json("hero_section").$type<{
    logo?: string;
    image?: string;
    tags?: string[];
    emoji?: string;
    title: string;
    gradient: string;
    subtitle: string;
    cta_buttons?: { href: string; text: string }[];
  }>(),
  sections: json("sections").$type<any[]>().default([]),
  featured: boolean("featured").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertBlogSchema = createInsertSchema(blogs).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog = typeof blogs.$inferSelect;
