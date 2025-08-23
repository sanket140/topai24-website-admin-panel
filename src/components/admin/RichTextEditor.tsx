import { useState } from "react";
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code,
  Plus,
  Trash2,
  MoveUp,
  MoveDown
} from "lucide-react";

interface Section {
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  features?: string[];
  [key: string]: any;
}

interface RichTextEditorProps {
  content: Section[];
  onChange: (content: Section[]) => void;
}

const sectionTypes = [
  { value: "intro", label: "Introduction" },
  { value: "features", label: "Features List" },
  { value: "benefits", label: "Benefits" },
  { value: "comparison", label: "Comparison" },
  { value: "code_examples", label: "Code Examples" },
  { value: "tools_showcase", label: "Tools Showcase" },
  { value: "best_practices", label: "Best Practices" },
  { value: "conclusion", label: "Conclusion" },
];

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [selectedText, setSelectedText] = useState("");

  const addSection = (type: string) => {
    if (!type || type === '') return;
    
    const newSection: Section = {
      type,
      title: "",
      subtitle: "",
    };

    switch (type) {
      case "intro":
        newSection.features = [];
        break;
      case "features":
        newSection.features = [""];
        break;
      case "benefits":
        newSection.cards = [];
        break;
      case "comparison":
        newSection.table = { headers: [], rows: [] };
        break;
      case "code_examples":
        newSection.examples = [];
        break;
      case "tools_showcase":
        newSection.tools = [];
        break;
      case "best_practices":
        newSection.practices = [];
        break;
    }

    onChange([...content, newSection]);
  };

  const updateSection = (index: number, updates: Partial<Section>) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], ...updates };
    onChange(newContent);
  };

  const removeSection = (index: number) => {
    const newContent = content.filter((_, i) => i !== index);
    onChange(newContent);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newContent = [...content];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newContent.length) {
      [newContent[index], newContent[newIndex]] = [newContent[newIndex], newContent[index]];
      onChange(newContent);
    }
  };

  const renderSectionEditor = (section: Section, index: number) => {
    return (
      <Card key={index} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{sectionTypes.find(t => t.value === section.type)?.label || section.type}</CardTitle>
            <div className="flex space-x-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0}
                data-testid={`move-up-${index}`}
              >
                <MoveUp className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => moveSection(index, 'down')}
                disabled={index === content.length - 1}
                data-testid={`move-down-${index}`}
              >
                <MoveDown className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => removeSection(index)}
                data-testid={`remove-section-${index}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Section Title</Label>
              <Input
                value={section.title || ""}
                onChange={(e) => updateSection(index, { title: e.target.value })}
                placeholder="Enter section title"
                data-testid={`section-title-${index}`}
              />
            </div>
            <div>
              <Label>Section Subtitle</Label>
              <Input
                value={section.subtitle || ""}
                onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                placeholder="Enter section subtitle"
                data-testid={`section-subtitle-${index}`}
              />
            </div>
          </div>

          {section.type === "intro" && (
            <div>
              <Label>Features List</Label>
              {(section.features || []).map((feature: string, featureIndex: number) => (
                <div key={featureIndex} className="flex gap-2 mt-2">
                  <Input
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...(section.features || [])];
                      newFeatures[featureIndex] = e.target.value;
                      updateSection(index, { features: newFeatures });
                    }}
                    placeholder="Enter feature"
                    data-testid={`feature-${index}-${featureIndex}`}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newFeatures = (section.features || []).filter((_, i) => i !== featureIndex);
                      updateSection(index, { features: newFeatures });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newFeatures = [...(section.features || []), ""];
                  updateSection(index, { features: newFeatures });
                }}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
          )}

          {(section.type === "features" || section.type === "conclusion") && (
            <div>
              <Label>Content</Label>
              <Textarea
                value={section.content || ""}
                onChange={(e) => updateSection(index, { content: e.target.value })}
                placeholder="Enter section content..."
                rows={4}
                data-testid={`section-content-${index}`}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4" data-testid="rich-text-editor">
      {/* Editor Toolbar */}
      <div className="border border-gray-300 rounded-lg">
        <div className="border-b border-gray-300 p-3 bg-gray-50 rounded-t-lg">
          <div className="flex flex-wrap gap-1">
            <Button type="button" size="sm" variant="outline">
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline">
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline">
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px bg-gray-300 mx-2"></div>
            <Button type="button" size="sm" variant="outline">
              <List className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px bg-gray-300 mx-2"></div>
            <Button type="button" size="sm" variant="outline">
              <Link className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline">
              <Image className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline">
              <Code className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {content.map((section, index) => renderSectionEditor(section, index))}
      </div>

      {/* Add Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label>Add Section:</Label>
            <Select onValueChange={addSection}>
              <SelectTrigger className="w-48" data-testid="add-section-select">
                <SelectValue placeholder="Choose section type" />
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
        </CardContent>
      </Card>

      {/* Preview */}
      {content.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No content sections added yet.</p>
          <p className="text-sm">Use the dropdown above to add your first section.</p>
        </div>
      )}
    </div>
  );
}
