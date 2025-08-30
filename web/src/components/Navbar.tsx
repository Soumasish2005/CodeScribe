import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PenTool, User, LogOut, Menu, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 transition-smooth hover:opacity-80">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-mono font-bold text-sm">CS</span>
          </div>
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            CodeScript
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`flex items-center space-x-2 transition-smooth hover:text-primary ${
              isActive('/') ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            <span>Home</span>
          </Link>
          
          <Link
            to="/trending"
            className={`flex items-center space-x-2 transition-smooth hover:text-primary ${
              isActive('/trending') ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Trending</span>
          </Link>

          <Link
            to="/search"
            className={`flex items-center space-x-2 transition-smooth hover:text-primary ${
              isActive('/search') ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden md:flex items-center space-x-2"
              >
                <Link to="/write">
                  <PenTool className="w-4 h-4" />
                  <span>Write</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link to="/write" className="flex items-center">
                      <PenTool className="w-4 h-4 mr-2" />
                      Write Article
                    </Link>
                  </DropdownMenuItem>
                  {user?.roles?.includes('admin') && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Menu className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="gradient-primary">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;