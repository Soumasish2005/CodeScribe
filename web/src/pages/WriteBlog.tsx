import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { X, Plus, Save, Send } from 'lucide-react';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

type BlogForm = z.infer<typeof blogSchema>;

const WriteBlog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BlogForm>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: [],
    }
  });

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: BlogForm, isDraft = true) => {
    setIsSubmitting(true);
    try {
      const blogData = {
        title: data.title,
        content: content,
        tags: tags,
      };

      const response = await api.createBlog(blogData);
      const blogId = response?.data?._id;
      if (!isDraft) {
        if (blogId) {
          await api.submitBlog(blogId);
          toast({
            title: "Blog submitted!",
            description: "Your blog has been submitted for admin approval.",
          });
        } else {
          toast({
            title: "Error",
            description: "Blog ID not found in response.",
          });
        }
      } else {
        toast({
          title: "Draft saved!",
          description: "Your blog has been saved as a draft.",
        });
      }
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Write Your Story
            </h1>
            <p className="text-muted-foreground mt-2">
              Share your knowledge with the CodeScript community
            </p>
          </div>

          <form onSubmit={handleSubmit((data) => onSubmit(data, true))} className="space-y-6">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Blog Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter your blog title..."
                    {...register('title')}
                    className="text-lg"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTag} size="icon" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.tags && (
                    <p className="text-sm text-destructive">{errors.tags.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <MDEditor
                    value={content}
                    onChange={(val) => {
                      setContent(val || '');
                      setValue('content', val || '');
                    }}
                    preview="edit"
                    height={400}
                    data-color-mode="dark"
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive">{errors.content.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                disabled={isSubmitting}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, false))}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Submit for Review
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;