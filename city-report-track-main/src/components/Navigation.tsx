import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Search, Shield, Info, Home, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

const UserSection = () => {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <img 
          src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <span className="hidden md:inline text-sm font-medium">{user.name}</span>
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" asChild>
      <Link to="/login" className="flex items-center gap-2">
        <LogIn className="w-4 h-4" />
        <span>Login</span>
      </Link>
    </Button>
  );
};

export const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const adminAuth = sessionStorage.getItem("adminAuth");
    setIsAdmin(adminAuth === "true");
  }, [location.pathname]);
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    ...(user && !isAdmin ? [{ path: "/profile", label: "Profile", icon: User }] : []),
    ...(user && !isAdmin ? [{ path: "/report", label: "Report Issue", icon: FileText }] : []),
    { path: "/tracker", label: "Track Issues", icon: Search },
    { path: "/admin-login", label: "Authority Portal", icon: Shield },
    { path: "/about", label: "About", icon: Info },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/logo.ico" 
            alt="CivicReports Logo" 
            className="w-8 h-8"
          />
          <span className="font-semibold text-lg text-foreground">CivicReports</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center space-x-3">
          {!isAdmin && <UserSection />}
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => {
              sessionStorage.removeItem("adminAuth");
              window.location.href = "/";
            }}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};