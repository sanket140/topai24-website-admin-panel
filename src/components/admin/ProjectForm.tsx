import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast } from '../../hooks/use-toast';
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { uploadFile, projectsApi } from '../../lib/supabase';
import type { Project } from "@shared/schema";

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  technologies: z.string().optional(),
  custom_url: z.string().url().optional().or(z.literal("")),
  slug: z.string().min(1, "Slug is required"),
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  hero_description: z.string().optional(),
  video_url: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: Project | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(project?.image || "");
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>(
    project?.screenshots || []
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState(project?.video_path || "");
  const [features, setFeatures] = useState<string[]>(
    project?.content?.features || [""]
  );
  const [architectureFields, setArchitectureFields] = useState<{key: string, value: string}[]>(
    project?.content?.architecture ? 
      Object.entries(project.content.architecture).map(([key, value]) => ({ key, value: String(value) })) :
      [{ key: "", value: "" }]
  );
  const [performanceMetrics, setPerformanceMetrics] = useState<{icon: string, title: string, description: string}[]>(
    project?.content?.performance_metrics || [{ icon: "", title: "", description: "" }]
  );
  const [projectOverview, setProjectOverview] = useState<{icon: string, title: string, description: string}[]>(
    project?.content?.project_overview || [{ icon: "", title: "", description: "" }]
  );
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      if (project) {
        return projectsApi.update(project.id, projectData);
      } else {
        return projectsApi.create(projectData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Project ${project ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save project",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      category: project?.category || "",
      featured: project?.featured || false,
      technologies: project?.technologies?.join(", ") || "",
      custom_url: project?.custom_url || "",
      slug: project?.slug || "",
      hero_title: project?.content?.hero?.title || "",
      hero_subtitle: project?.content?.hero?.subtitle || "",
      hero_description: project?.content?.hero?.description || "",
      video_url: project?.content?.video || "",
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    if (!project) {
      const slug = generateSlug(title);
      form.setValue("slug", slug);
      if (!form.getValues("hero_title")) {
        form.setValue("hero_title", title);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const remainingSlots = 6 - screenshotPreviews.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      if (files.length > remainingSlots) {
        toast({
          title: "Too many screenshots",
          description: `You can only upload ${remainingSlots} more screenshot(s). Maximum 6 screenshots allowed.`,
          variant: "destructive",
        });
      }
      
      setScreenshotFiles(prev => [...prev, ...filesToAdd]);
      
      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setScreenshotPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshotPreviews(prev => prev.filter((_, i) => i !== index));
    setScreenshotFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addArchitectureField = () => {
    setArchitectureFields([...architectureFields, { key: "", value: "" }]);
  };

  const updateArchitectureField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...architectureFields];
    newFields[index][field] = value;
    setArchitectureFields(newFields);
  };

  const removeArchitectureField = (index: number) => {
    setArchitectureFields(architectureFields.filter((_, i) => i !== index));
  };

  const addPerformanceMetric = () => {
    setPerformanceMetrics([...performanceMetrics, { icon: "", title: "", description: "" }]);
  };

  const updatePerformanceMetric = (index: number, field: 'icon' | 'title' | 'description', value: string) => {
    const newMetrics = [...performanceMetrics];
    newMetrics[index][field] = value;
    setPerformanceMetrics(newMetrics);
  };

  const removePerformanceMetric = (index: number) => {
    setPerformanceMetrics(performanceMetrics.filter((_, i) => i !== index));
  };

  const addProjectOverviewItem = () => {
    setProjectOverview([...projectOverview, { icon: "", title: "", description: "" }]);
  };

  const updateProjectOverviewItem = (index: number, field: 'icon' | 'title' | 'description', value: string) => {
    const newOverview = [...projectOverview];
    newOverview[index][field] = value;
    setProjectOverview(newOverview);
  };

  const removeProjectOverviewItem = (index: number) => {
    setProjectOverview(projectOverview.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsUploading(true);
      
      // Upload main image
      let imageUrl = project?.image || "";
      if (imageFile) {
        const uploadPath = `projects/images/${Date.now()}-${imageFile.name}`;
        try {
          const uploadedUrl = await uploadFile(imageFile, "project-assets", uploadPath);
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
          toast({
            title: "Upload Warning",
            description: `Failed to upload image: ${imageFile.name}`,
            variant: "destructive",
          });
        }
      }
      
      // Upload screenshots
      const screenshotUrls: string[] = [...screenshotPreviews.filter(url => url.startsWith('http'))];
      for (const file of screenshotFiles) {
        const uploadPath = `projects/screenshots/${Date.now()}-${file.name}`;
        try {
          const uploadedUrl = await uploadFile(file, "project-assets", uploadPath);
          if (uploadedUrl) {
            screenshotUrls.push(uploadedUrl);
          }
        } catch (error) {
          console.error('Failed to upload screenshot:', error);
          toast({
            title: "Upload Warning",
            description: `Failed to upload screenshot: ${file.name}`,
            variant: "destructive",
          });
        }
      }

      // Upload video
      let videoUrl: string | null = videoPreview.startsWith('http') ? videoPreview : null;
      if (videoFile) {
        const uploadPath = `projects/videos/${Date.now()}-${videoFile.name}`;
        try {
          const uploadedUrl = await uploadFile(videoFile, "project-assets", uploadPath);
          if (uploadedUrl) {
            videoUrl = uploadedUrl;
          }
        } catch (error) {
          console.error('Failed to upload video:', error);
          toast({
            title: "Upload Warning",
            description: `Failed to upload video: ${videoFile.name}`,
            variant: "destructive",
          });
        }
      }

      // Build architecture object
      const architecture: Record<string, any> = {};
      architectureFields.forEach(field => {
        if (field.key && field.value) {
          architecture[field.key] = field.value;
        }
      });

      const projectData = {
        title: data.title,
        description: data.description,
        category: data.category,
        featured: data.featured,
        technologies: data.technologies ? data.technologies.split(",").map(t => t.trim()).filter(Boolean) : [],
        custom_url: data.custom_url || null,
        slug: data.slug,
        image: imageUrl || null,
        screenshots: screenshotUrls,
        video_path: videoUrl,
        content: {
          hero: {
            title: data.hero_title || data.title,
            subtitle: data.hero_subtitle || `${data.category} Project`,
            description: data.hero_description || data.description,
          },
          video: data.video_url || videoUrl || undefined,
          features: features.filter(f => f.trim() !== ""),
          architecture,
          performance_metrics: performanceMetrics.filter(metric => 
            metric.icon.trim() !== "" && metric.title.trim() !== "" && metric.description.trim() !== ""
          ),
          project_overview: projectOverview.filter(item => 
            item.icon.trim() !== "" && item.title.trim() !== "" && item.description.trim() !== ""
          ),
        },
      };

      await saveProjectMutation.mutateAsync(projectData);
    } catch (error) {
      console.error("Error preparing project data:", error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to prepare project data",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {project ? "Edit Project" : "Add New Project"}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {project ? "Update project information" : "Create a new project entry for your portfolio"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter project title"
                        onChange={(e) => {
                          field.onChange(e);
                          handleTitleChange(e.target.value);
                        }}
                        data-testid="input-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="project-url-slug"
                        data-testid="input-slug"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={3}
                        placeholder="Brief project description"
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Web App">Web App</SelectItem>
                        <SelectItem value="Mobile App">Mobile App</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="custom_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="url"
                        placeholder="https://example.com"
                        data-testid="input-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4">
              <FormField
                control={form.control}
                name="technologies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technologies Used</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="React, Node.js, MongoDB (comma separated)"
                        data-testid="input-technologies"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Hero Section */}
          <div className="border-b pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Hero Section</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hero_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Hero section title"
                        data-testid="input-hero-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Subtitle</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Hero section subtitle"
                        data-testid="input-hero-subtitle"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4">
              <FormField
                control={form.control}
                name="hero_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={2}
                        placeholder="Hero section description"
                        data-testid="input-hero-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4">
              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="/projects/demo-video.mp4 or https://example.com/video.mp4"
                        data-testid="input-video-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="border-b pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Project Features</h4>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Enter project feature"
                    data-testid={`feature-${index}`}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeFeature(index)}
                    disabled={features.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addFeature}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          {/* Architecture Section */}
          <div className="border-b pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Architecture Details</h4>
            <div className="space-y-3">
              {architectureFields.map((field, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input
                    value={field.key}
                    onChange={(e) => updateArchitectureField(index, 'key', e.target.value)}
                    placeholder="Field name (e.g., frontend, backend)"
                    data-testid={`arch-key-${index}`}
                  />
                  <div className="flex gap-2">
                    <Input
                      value={field.value}
                      onChange={(e) => updateArchitectureField(index, 'value', e.target.value)}
                      placeholder="Field value"
                      data-testid={`arch-value-${index}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeArchitectureField(index)}
                      disabled={architectureFields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addArchitectureField}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Architecture Field
              </Button>
            </div>
          </div>

          {/* Performance Metrics Section */}
          <div className="border-b pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Performance Metrics</h4>
            <div className="space-y-3">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <Input
                    value={metric.icon}
                    onChange={(e) => updatePerformanceMetric(index, 'icon', e.target.value)}
                    placeholder="Icon (e.g., âš¡, ðŸš€, ðŸ“Š)"
                    data-testid={`perf-icon-${index}`}
                  />
                  <Input
                    value={metric.title}
                    onChange={(e) => updatePerformanceMetric(index, 'title', e.target.value)}
                    placeholder="Metric title"
                    data-testid={`perf-title-${index}`}
                  />
                  <div className="flex gap-2">
                    <Input
                      value={metric.description}
                      onChange={(e) => updatePerformanceMetric(index, 'description', e.target.value)}
                      placeholder="Metric description"
                      data-testid={`perf-desc-${index}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removePerformanceMetric(index)}
                      disabled={performanceMetrics.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addPerformanceMetric}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Performance Metric
              </Button>
            </div>
          </div>

       

          {/* Main Image Upload */}
          <div className="border-b pb-6">
            <Label>Main Project Image *</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Project Preview" 
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                    data-testid="remove-image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload main image</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        data-testid="input-image"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Screenshots Upload */}
          <div className="border-b pb-6">
            <Label>Screenshots (Max 6)</Label>
            <div className="mt-2">
              {screenshotPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {screenshotPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt={`Screenshot ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeScreenshot(index)}
                        data-testid={`remove-screenshot-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {screenshotPreviews.length < 6 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload screenshots ({screenshotPreviews.length}/6)</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept="image/*"
                        multiple
                        onChange={handleScreenshotUpload}
                        data-testid="input-screenshots"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div className="border-b pb-6">
            <Label>Project Video</Label>
            <div className="mt-2">
              {videoPreview && (
                <div className="mb-4">
                  <div className="relative">
                    <video 
                      src={videoPreview} 
                      className="w-full h-48 object-cover rounded-lg border"
                      controls
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => {
                        setVideoPreview("");
                        setVideoFile(null);
                      }}
                      data-testid="remove-video"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {!videoPreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload video</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept="video/*"
                        onChange={handleVideoUpload}
                        data-testid="input-video"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">MP4, WebM up to 50MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Featured Toggle */}
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured Project</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Display this project prominently on the homepage
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-featured"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || saveProjectMutation.isPending}
              data-testid="button-save"
            >
              {isUploading || saveProjectMutation.isPending ? "Saving..." : project ? "Update Project" : "Save Project"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
