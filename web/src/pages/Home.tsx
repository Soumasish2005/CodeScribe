import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api, Blog } from '@/lib/api';
import BlogCard from '@/components/BlogCard';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsResponse, trendingResponse] = await Promise.all([
          api.getBlogs({ limit: 12 }),
          api.getTrendingBlogs({ limit: 5 }),
        ]);
        
        setBlogs(blogsResponse.data);
        setTrendingBlogs(trendingResponse);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load blogs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Share Your Code Stories
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join CodeScript, the premier platform for developers to share insights, 
              tutorials, and experiences. Write, discover, and connect with the coding community.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="gradient-primary shadow-glow">
                  <Link to="/write">
                    <PenTool className="w-5 h-5 mr-2" />
                    Start Writing
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="gradient-primary shadow-glow">
                    <Link to="/register">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Started Free
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-glow"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-glow"></div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Trending Section */}
        {trendingBlogs.length > 0 && (
          <section className="mb-16 animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Trending This Week</h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/trending">View All</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingBlogs.slice(0, 3).map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </section>
        )}

        {/* Latest Blogs Section */}
        <section className="animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Latest Articles</h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/search">Explore All</Link>
            </Button>
          </div>

          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <PenTool className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share your coding knowledge with the community.
              </p>
              {isAuthenticated && (
                <Button asChild className="gradient-primary">
                  <Link to="/write">Write the First Article</Link>
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;