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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { Upload, X, Plus, Trash2, Code, FileText, Table, Lightbulb } from "lucide-react";
import { uploadFile, blogsApi } from '../../lib/supabase';
import type { Blog } from "@shared/schema";

const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  short_description: z.string().min(1, "Short description is required"),
  author: z.string().min(1, "Author is required"),
  published_date: z.string().min(1, "Published date is required"),
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  hero_gradient: z.string().default("gradient-blue"),
  hero_logo: z.string().optional(),
  hero_image: z.string().optional(),
  hero_emoji: z.string().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

type BlogFormData = z.infer<typeof blogFormSchema>;

interface BlogFormProps {
  blog?: Blog | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BlogForm({ blog, onSuccess, onCancel }: BlogFormProps) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(blog?.thumbnail || "");
  const [heroTags, setHeroTags] = useState<string[]>(
    blog?.hero_section?.tags || [""]
  );
  const [ctaButtons, setCtaButtons] = useState<{href: string, text: string}[]>(
    blog?.hero_section?.cta_buttons || []
  );
  const [sections, setSections] = useState<any[]>(blog?.sections || []);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveBlogMutation = useMutation({
    mutationFn: async (blogData: any) => {
      if (blog) {
        return blogsApi.update(blog.id, blogData);
      } else {
        return blogsApi.create(blogData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Blog post ${blog ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Save blog error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save blog",
        variant: "destructive",
      });
    },
  });

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: blog?.title || "",
      slug: blog?.slug || "",
      short_description: blog?.short_description || "",
      author: blog?.author || "",
      published_date: blog?.published_date || new Date().toISOString().split('T')[0],
      hero_title: blog?.hero_section?.title || "",
      hero_subtitle: blog?.hero_section?.subtitle || "",
      hero_gradient: blog?.hero_section?.gradient || "gradient-blue",
      hero_logo: blog?.hero_section?.logo || "",
      hero_image: blog?.hero_section?.image || "",
      hero_emoji: blog?.hero_section?.emoji || "",
      featured: blog?.featured || false,
      published: (blog as any)?.published !== undefined ? (blog as any).published : true,
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
    if (!blog) {
      const slug = generateSlug(title);
      form.setValue("slug", slug);
      if (!form.getValues("hero_title")) {
        form.setValue("hero_title", title);
      }
    }
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const addHeroTag = () => {
    setHeroTags([...heroTags, ""]);
  };

  const updateHeroTag = (index: number, value: string) => {
    const newTags = [...heroTags];
    newTags[index] = value;
    setHeroTags(newTags);
  };

  const removeHeroTag = (index: number) => {
    setHeroTags(heroTags.filter((_, i) => i !== index));
  };

  const addCtaButton = () => {
    setCtaButtons([...ctaButtons, { href: "", text: "" }]);
  };

  const updateCtaButton = (index: number, field: 'href' | 'text', value: string) => {
    const newButtons = [...ctaButtons];
    newButtons[index][field] = value;
    setCtaButtons(newButtons);
  };

  const removeCtaButton = (index: number) => {
    setCtaButtons(ctaButtons.filter((_, i) => i !== index));
  };

  // Section management functions
  const addSection = (type: string) => {
    if (!type) return;
    
    let newSection: any = {
      type,
      title: "",
      subtitle: "",
    };

    // Initialize section based on type
    switch (type) {
      case "intro":
        newSection.features = [];
        break;
      case "comparison":
        newSection.table = {
          headers: ["Feature", "Option 1", "Option 2"],
          rows: []
        };
        break;
      case "code_examples":
        newSection.examples = [];
        break;
      case "advanced_features":
        newSection.features = [];
        break;
      case "benefits":
        newSection.cards = [];
        break;
      case "tools_showcase":
        newSection.tools = [];
        break;
      case "best_practices":
        newSection.practices = [];
        break;
      case "conclusion":
        newSection.content = "";
        break;
      default:
        newSection.content = "";
    }

    setSections([...sections, newSection]);
  };

  const updateSection = (index: number, updates: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };
    setSections(newSections);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const renderSectionEditor = (section: any, index: number) => {
    const sectionTypes = [
      { value: "intro", label: "Introduction", icon: FileText },
      { value: "comparison", label: "Comparison Table", icon: Table },
      { value: "code_examples", label: "Code Examples", icon: Code },
      { value: "advanced_features", label: "Advanced Features", icon: Lightbulb },
      { value: "benefits", label: "Benefits", icon: FileText },
      { value: "tools_showcase", label: "Tools Showcase", icon: FileText },
      { value: "best_practices", label: "Best Practices", icon: FileText },
      { value: "conclusion", label: "Conclusion", icon: FileText },
    ];

    return (
      <Card key={index} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Section {index + 1}: {sectionTypes.find(t => t.value === section.type)?.label || section.type}
            </CardTitle>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => removeSection(index)}
              data-testid={`remove-section-${index}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Section Type</Label>
              <Select 
                value={section.type} 
                onValueChange={(value) => updateSection(index, { type: value })}
              >
                <SelectTrigger data-testid={`section-type-${index}`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {sectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Section Title</Label>
              <Input
                value={section.title || ""}
                onChange={(e) => updateSection(index, { title: e.target.value })}
                placeholder="Section title"
                data-testid={`section-title-${index}`}
              />
            </div>
            
            <div>
              <Label>Section Subtitle</Label>
              <Input
                value={section.subtitle || ""}
                onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                placeholder="Section subtitle"
                data-testid={`section-subtitle-${index}`}
              />
            </div>
          </div>

          {/* Section-specific content editors */}
          {section.type === "intro" && (
            <div>
              <Label>Features</Label>
              {(section.features || []).map((feature: any, featureIndex: number) => (
                <div key={featureIndex} className="border rounded-lg p-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Feature Title</Label>
                      <Input
                        value={feature.title || ""}
                        onChange={(e) => {
                          const newFeatures = [...(section.features || [])];
                          newFeatures[featureIndex] = { ...feature, title: e.target.value };
                          updateSection(index, { features: newFeatures });
                        }}
                        placeholder="Feature title"
                      />
                    </div>
                    <div>
                      <Label>Icon URL</Label>
                      <Input
                        value={feature.icon || ""}
                        onChange={(e) => {
                          const newFeatures = [...(section.features || [])];
                          newFeatures[featureIndex] = { ...feature, icon: e.target.value };
                          updateSection(index, { features: newFeatures });
                        }}
                        placeholder="Icon URL"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Description</Label>
                    <Textarea
                      value={feature.description || ""}
                      onChange={(e) => {
                        const newFeatures = [...(section.features || [])];
                        newFeatures[featureIndex] = { ...feature, description: e.target.value };
                        updateSection(index, { features: newFeatures });
                      }}
                      placeholder="Feature description"
                      rows={3}
                    />
                  </div>
                  <div className="mt-4">
                    <Label>Gradient Classes</Label>
                    <Input
                      value={feature.gradient || ""}
                      onChange={(e) => {
                        const newFeatures = [...(section.features || [])];
                        newFeatures[featureIndex] = { ...feature, gradient: e.target.value };
                        updateSection(index, { features: newFeatures });
                      }}
                      placeholder="from-blue-50 to-blue-100 border-blue-200"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newFeatures = (section.features || []).filter((_: any, i: number) => i !== featureIndex);
                      updateSection(index, { features: newFeatures });
                    }}
                    className="mt-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Feature
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const newFeatures = [...(section.features || []), { title: "", icon: "", description: "", gradient: "" }];
                  updateSection(index, { features: newFeatures });
                }}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
          )}

          {section.type === "comparison" && (
            <div>
              <Label>Comparison Table</Label>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Table Headers</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(section.table?.headers || []).map((header: string, headerIndex: number) => (
                      <Input
                        key={headerIndex}
                        value={header}
                        onChange={(e) => {
                          const newHeaders = [...(section.table?.headers || [])];
                          newHeaders[headerIndex] = e.target.value;
                          updateSection(index, { 
                            table: { ...section.table, headers: newHeaders }
                          });
                        }}
                        placeholder={`Header ${headerIndex + 1}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Table Rows</Label>
                  {(section.table?.rows || []).map((row: string[], rowIndex: number) => (
                    <div key={rowIndex} className="grid grid-cols-3 gap-2 mt-2">
                      {row.map((cell: string, cellIndex: number) => (
                        <Input
                          key={cellIndex}
                          value={cell}
                          onChange={(e) => {
                            const newRows = [...(section.table?.rows || [])];
                            newRows[rowIndex][cellIndex] = e.target.value;
                            updateSection(index, { 
                              table: { ...section.table, rows: newRows }
                            });
                          }}
                          placeholder={`Row ${rowIndex + 1}, Col ${cellIndex + 1}`}
                        />
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newRows = (section.table?.rows || []).filter((_: any, i: number) => i !== rowIndex);
                          updateSection(index, { 
                            table: { ...section.table, rows: newRows }
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newRows = [...(section.table?.rows || []), ["", "", ""]];
                      updateSection(index, { 
                        table: { ...section.table, rows: newRows }
                      });
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Row
                  </Button>
                </div>
              </div>
            </div>
          )}

          {section.type === "code_examples" && (
            <div>
              <Label>Code Examples</Label>
              {(section.examples || []).map((example: any, exampleIndex: number) => (
                <div key={exampleIndex} className="border rounded-lg p-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Example Title</Label>
                      <Input
                        value={example.title || ""}
                        onChange={(e) => {
                          const newExamples = [...(section.examples || [])];
                          newExamples[exampleIndex] = { ...example, title: e.target.value };
                          updateSection(index, { examples: newExamples });
                        }}
                        placeholder="Example title"
                      />
                    </div>
                    <div>
                      <Label>Language</Label>
                      <Input
                        value={example.language || ""}
                        onChange={(e) => {
                          const newExamples = [...(section.examples || [])];
                          newExamples[exampleIndex] = { ...example, language: e.target.value };
                          updateSection(index, { examples: newExamples });
                        }}
                        placeholder="javascript, python, etc."
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Code</Label>
                    <Textarea
                      value={example.code || ""}
                      onChange={(e) => {
                        const newExamples = [...(section.examples || [])];
                        newExamples[exampleIndex] = { ...example, code: e.target.value };
                        updateSection(index, { examples: newExamples });
                      }}
                      placeholder="Enter code example"
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newExamples = (section.examples || []).filter((_: any, i: number) => i !== exampleIndex);
                      updateSection(index, { examples: newExamples });
                    }}
                    className="mt-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Example
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const newExamples = [...(section.examples || []), { title: "", code: "", language: "javascript" }];
                  updateSection(index, { examples: newExamples });
                }}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Code Example
              </Button>
            </div>
          )}

          {(section.type === "conclusion" || section.type === "benefits") && (
            <div>
              <Label>Content</Label>
              <Textarea
                value={section.content || ""}
                onChange={(e) => updateSection(index, { content: e.target.value })}
                placeholder="Enter section content..."
                rows={6}
                data-testid={`section-content-${index}`}
              />
            </div>
          )}

          {/* Advanced JSON Editor for complex sections */}
          <div>
            <Label>Advanced JSON Editor (Optional)</Label>
            <Textarea
              value={JSON.stringify(section, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateSection(index, parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={8}
              placeholder="Edit section as JSON for advanced customization..."
              className="font-mono text-sm"
              data-testid={`section-json-${index}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Advanced users can edit the JSON structure directly. Changes will override the form fields above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      setIsUploading(true);
      let thumbnailUrl = blog?.thumbnail || "";

      // Upload thumbnail if a new one was selected
      if (thumbnailFile) {
        const uploadPath = `blogs/thumbnails/${Date.now()}-${thumbnailFile.name}`;
        try {
          const uploadedUrl = await uploadFile(thumbnailFile, "blog-assets", uploadPath);
          if (uploadedUrl) {
            thumbnailUrl = uploadedUrl;
          }
        } catch (error) {
          console.error('Failed to upload thumbnail:', error);
          toast({
            title: "Upload Warning",
            description: `Failed to upload thumbnail: ${thumbnailFile.name}`,
            variant: "destructive",
          });
        }
      }

      const blogData = {
        title: data.title,
        slug: data.slug,
        short_description: data.short_description,
        author: data.author,
        published_date: data.published_date,
        thumbnail: thumbnailUrl,
        hero_section: {
          title: data.hero_title || data.title,
          subtitle: data.hero_subtitle || "",
          gradient: data.hero_gradient,
          logo: data.hero_logo || undefined,
          image: data.hero_image || undefined,
          emoji: data.hero_emoji || undefined,
          tags: heroTags.filter(tag => tag.trim() !== ""),
          cta_buttons: ctaButtons.filter(btn => btn.href && btn.text),
        },
        sections: sections,
        featured: data.featured,
        published: data.published,
      };

      console.log("Submitting blog data:", blogData);
      await saveBlogMutation.mutateAsync(blogData);
    } catch (error) {
      console.error("Error preparing blog data:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to prepare blog data",
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
          {blog ? "Edit Blog Post" : "Create New Blog Post"}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {blog ? "Update blog post information" : "Write and publish a new blog post"}
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
                    <FormLabel>Blog Title *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter blog title"
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
                        placeholder="blog-url-slug"
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
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={2}
                        placeholder="Brief description for SEO and previews"
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
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Author name"
                        data-testid="input-author"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Date *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date"
                        data-testid="input-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="border-b pb-6">
            <Label>Thumbnail Image *</Label>
            <div className="mt-2">
              {thumbnailPreview ? (
                <div className="relative inline-block">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail Preview" 
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeThumbnail}
                    data-testid="remove-thumbnail"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload thumbnail</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        data-testid="input-thumbnail"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Hero Section Configuration */}
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
                        placeholder="Hero section title (optional)"
                        data-testid="input-hero-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_gradient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gradient Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-gradient">
                          <SelectValue placeholder="Select gradient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gradient-blue">Blue Gradient</SelectItem>
                        <SelectItem value="gradient-purple">Purple Gradient</SelectItem>
                        <SelectItem value="gradient-green">Green Gradient</SelectItem>
                        <SelectItem value="gradient-orange">Orange Gradient</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4">
              <FormField
                control={form.control}
                name="hero_subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Subtitle</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={2}
                        placeholder="Hero section subtitle (optional)"
                        data-testid="input-hero-subtitle"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <FormField
                control={form.control}
                name="hero_logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Logo URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://example.com/logo.png"
                        data-testid="input-hero-logo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://example.com/hero.jpg"
                        data-testid="input-hero-image"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Emoji</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="ðŸš€"
                        data-testid="input-hero-emoji"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Hero Tags */}
            <div className="mt-4">
              <Label>Hero Tags</Label>
              <div className="space-y-2 mt-2">
                {heroTags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={tag}
                      onChange={(e) => updateHeroTag(index, e.target.value)}
                      placeholder="#Tag"
                      data-testid={`hero-tag-${index}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeHeroTag(index)}
                      disabled={heroTags.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addHeroTag}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-4">
              <Label>CTA Buttons</Label>
              <div className="space-y-2 mt-2">
                {ctaButtons.map((button, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Input
                      value={button.href}
                      onChange={(e) => updateCtaButton(index, 'href', e.target.value)}
                      placeholder="Button URL"
                      data-testid={`cta-href-${index}`}
                    />
                    <div className="flex gap-2">
                      <Input
                        value={button.text}
                        onChange={(e) => updateCtaButton(index, 'text', e.target.value)}
                        placeholder="Button Text"
                        data-testid={`cta-text-${index}`}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeCtaButton(index)}
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
                  onClick={addCtaButton}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add CTA Button
                </Button>
              </div>
            </div>
          </div>

          {/* Blog Content Sections */}
          <div className="border-b pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Blog Content Sections</h4>
            <div className="space-y-4">
              {sections.map((section, index) => renderSectionEditor(section, index))}
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Label>Add Section:</Label>
                    <Select onValueChange={addSection}>
                      <SelectTrigger className="w-48" data-testid="add-section-select">
                        <SelectValue placeholder="Choose section type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intro">Introduction</SelectItem>
                        <SelectItem value="comparison">Comparison Table</SelectItem>
                        <SelectItem value="code_examples">Code Examples</SelectItem>
                        <SelectItem value="advanced_features">Advanced Features</SelectItem>
                        <SelectItem value="benefits">Benefits</SelectItem>
                        <SelectItem value="tools_showcase">Tools Showcase</SelectItem>
                        <SelectItem value="best_practices">Best Practices</SelectItem>
                        <SelectItem value="conclusion">Conclusion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Publishing Options */}
          <div className="border-b pb-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured Post</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Make this post featured on the homepage
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

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Published</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Make this post visible to the public
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-published"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

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
              disabled={isUploading || saveBlogMutation.isPending}
              data-testid="button-publish"
            >
              {isUploading || saveBlogMutation.isPending ? "Saving..." : blog ? "Update Blog" : "Publish Blog"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
