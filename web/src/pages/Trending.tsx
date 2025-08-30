import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, Blog } from '@/lib/api';
import BlogCard from '@/components/BlogCard';
import { useToast } from '@/hooks/use-toast';

const Trending = () => {
  const { toast } = useToast();
  const [dailyTrending, setDailyTrending] = useState<Blog[]>([]);
  const [weeklyTrending, setWeeklyTrending] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('24h');

  useEffect(() => {
    const fetchTrendingBlogs = async () => {
      setIsLoading(true);
      try {
        const [daily, weekly] = await Promise.all([
          api.getTrendingBlogs({ window: '24h', limit: 20 }),
          api.getTrendingBlogs({ window: '7d', limit: 20 }),
        ]);
        
        setDailyTrending(daily);
        setWeeklyTrending(weekly);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load trending blogs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingBlogs();
  }, [toast]);

  const currentBlogs = activeTab === '24h' ? dailyTrending : weeklyTrending;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted rounded-lg"></div>
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Trending Articles</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the most popular and engaging content from the CodeScript community.
          </p>
        </div>

        {/* Trending Tabs */}
        <Card className="mb-8 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Trending Period</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="24h" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Last 24 Hours</span>
                </TabsTrigger>
                <TabsTrigger value="7d" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>This Week</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="24h" className="mt-6">
                <div className="text-sm text-muted-foreground mb-4">
                  Articles gaining the most traction in the last 24 hours
                </div>
              </TabsContent>

              <TabsContent value="7d" className="mt-6">
                <div className="text-sm text-muted-foreground mb-4">
                  Most popular articles from the past week
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trending Blogs */}
        <div className="animate-slide-up">
          {currentBlogs.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {currentBlogs.length} trending article{currentBlogs.length !== 1 ? 's' : ''} 
                  {activeTab === '24h' ? ' in the last 24 hours' : ' this week'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBlogs.map((blog, index) => (
                  <div key={blog._id} className="relative">
                    {/* Trending rank badge */}
                    {index < 3 && (
                      <div className="absolute -top-2 -left-2 z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          'bg-amber-600'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    )}
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No trending articles yet</h3>
              <p className="text-muted-foreground mb-6">
                Check back later or help create trending content by writing and sharing articles.
              </p>
              <Button asChild variant="outline">
                <a href="/">Browse All Articles</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trending;