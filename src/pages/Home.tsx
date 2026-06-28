import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { FileText, Search, Users, TrendingUp, MapPin, Clock } from "lucide-react";
import heroImage from "@/assets/civic-hero.jpg";
import { getIssues as fetchIssues } from "@/services/issueService";

const stats = [
  { label: "Total Reports", value: "1,247", icon: FileText },
  { label: "Resolved Issues", value: "892", icon: TrendingUp },
  { label: "Active Citizens", value: "3,456", icon: Users },
  { label: "Avg Response Time", value: "2.3 days", icon: Clock },
];

// Get recent issues from Firebase only
const getRecentIssues = async () => {
  try {
    const firebaseIssues = await fetchIssues();
    return firebaseIssues.slice(0, 3);
  } catch (error) {
    console.error('Failed to fetch from Firebase:', error);
    return [];
  }
};

export default function Home() {
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminAuth = sessionStorage.getItem("adminAuth");
    setIsAdmin(adminAuth === "true");
    
    const loadRecentIssues = async () => {
      const issues = await getRecentIssues();
      setRecentIssues(issues);
      setIsLoading(false);
    };
    loadRecentIssues();
  }, []);

  // Redirect admin to dashboard
  if (isAdmin && !isLoading) {
    return <Navigate to="/authority-dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <div className="w-full h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Your City, Your Voice
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Report, Track, Resolve. An efficient platform connecting citizens with local authorities to improve our community together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/report" className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Report Issue Now</span>
                  </Link>
                </Button>
                <Button variant="civic" size="lg" asChild>
                  <Link to="/tracker" className="flex items-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Track Your Issue</span>
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img
                src={heroImage}
                alt="Modern civic technology connecting citizens with local government"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-md transition-shadow">
                  <CardContent className="space-y-3 p-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Recent Issue Reports</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest community issues and their resolution progress
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {recentIssues.map((issue) => (
              <Card key={issue.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="relative">
                  {issue.status === 'resolved' && issue.completionImage ? (
                    <div className="relative h-48">
                      <div className="grid grid-cols-2 h-full">
                        <div className="relative">
                          <img 
                            src={issue.image} 
                            alt="Before - Original issue"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Before
                          </div>
                        </div>
                        <div className="relative">
                          <img 
                            src={issue.completionImage} 
                            alt="After - Issue resolved"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute bottom-1 right-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            After
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={issue.image} 
                      alt={issue.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    <StatusBadge status={issue.status as "pending" | "in-progress" | "resolved"} />
                    <PriorityBadge priority={issue.priority as "Low" | "Medium" | "High" | "Critical"} />
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <CardTitle className="text-lg font-semibold line-clamp-2">{issue.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{issue.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatRelativeTime(issue.reportedAt)}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {issue.id}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/tracker">View All Issues</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary-hover text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of citizens working together to improve our community
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/report">Start Reporting Issues</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}