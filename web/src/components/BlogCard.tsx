import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Blog } from '@/lib/api';

interface BlogCardProps {
  blog: Blog;
  showAuthor?: boolean;
}

const BlogCard = ({ blog, showAuthor = true }: BlogCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="blog-card shadow-card border-border/50 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link to={`/blog/${blog._id}`}>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2 link-underline transition-smooth hover:text-primary">
                {blog.title}
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
              {blog.content.replace(/[#*`]/g, '').substring(0, 150)}...
            </p>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {blog.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{blog.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {/* Author info */}
          {showAuthor && (
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-muted text-xs">
                  {blog.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium">{blog.author.name}</span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(blog.createdAt)}
                </div>
              </div>
            </div>
          )}

          {/* Stats and status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{blog.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{blog.likeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{blog.commentCount}</span>
              </div>
            </div>

            {blog.status !== 'published' && (
              <Badge className={`text-xs ${getStatusColor(blog.status)}`}>
                {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;