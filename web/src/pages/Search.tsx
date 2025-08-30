import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { api, Blog } from '@/lib/api';
import BlogCard from '@/components/BlogCard';
import { useToast } from '@/hooks/use-toast';

const Search = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const popularTags = [
    'javascript', 'react', 'typescript', 'python', 'nodejs', 
    'css', 'html', 'vue', 'angular', 'mongodb', 'tutorial', 'beginners'
  ];

  useEffect(() => {
    searchBlogs();
  }, [searchQuery, selectedTags, pagination.page]);

  const searchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.searchBlogs({
        q: searchQuery,
        tags: selectedTags.join(','),
        page: pagination.page,
        limit: pagination.limit,
      });
      
      setBlogs(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.meta?.total ?? 0,
        totalPages: response.data.meta?.totalPages ?? 0,
      }));
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search blogs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-4">Discover Articles</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search through thousands of developer articles and find exactly what you're looking for.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 animate-slide-up">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles, tutorials, guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-12 text-base"
                />
              </div>

              {/* Tags Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter by tags:</span>
                  </div>
                  {(searchQuery || selectedTags.length > 0) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer transition-smooth hover:scale-105"
                      onClick={() => toggleTag(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="animate-slide-up">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Found {pagination.total} article{pagination.total !== 1 ? 's' : ''}
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {blogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={pagination.page === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page }))}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <SearchIcon className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;