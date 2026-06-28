import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, FileText } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="default" asChild>
            <a href="/" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </a>
          </Button>
          <Button variant="civic" asChild>
            <a href="/report" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Report Issue</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
