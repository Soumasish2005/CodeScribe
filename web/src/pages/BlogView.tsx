import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { Heart, Eye, MessageCircle, ArrowLeft, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BlogView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => api.getBlog(id!),
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: () => api.likeBlog(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
      toast({ title: 'Blog liked!' });
    },
    onError: () => {
      toast({ title: 'Failed to like blog', variant: 'destructive' });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => api.unlikeBlog(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
      toast({ title: 'Blog unliked' });
    },
    onError: () => {
      toast({ title: 'Failed to unlike blog', variant: 'destructive' });
    },
  });

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'draft': return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
      case 'rejected': return 'bg-red-500/20 text-red-700 dark:text-red-300';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-muted-foreground">Blog not found</h1>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <article className="space-y-8">
          {/* Header */}
          <header className="space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(blog.status)}>
                {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
              </Badge>
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="hover:bg-accent">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl font-bold tracking-tight leading-tight">
              {blog.title}
            </h1>

            {/* Author and Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog.author.name}`} />
                  <AvatarFallback>{blog.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{blog.author.name}</p>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(blog.publishedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {blog.viewCount}
                </span>
                <span className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {blog.likeCount}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {blog.commentCount}
                </span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <MDEditor.Markdown 
              source={blog.content} 
              style={{ 
                backgroundColor: 'transparent',
                color: 'inherit'
              }}
            />
          </div>

          {/* Actions */}
          {user && (
            <div className="flex items-center space-x-4 pt-8 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                className="hover:bg-accent/50"
              >
                <Heart className="w-4 h-4 mr-2" />
                Like ({blog.likeCount})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-accent/50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Comment ({blog.commentCount})
              </Button>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogView;