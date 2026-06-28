import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter,
  MapPin,
  User,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Camera,
  Upload
} from "lucide-react";
import { getIssues as fetchIssues, Issue, convertToBase64, markAsResolvedWithImage } from "@/services/issueService";
import { updateIssueStatus, assignIssue, updateIssuePriority } from "@/services/issueUpdateService";
import { useToast } from "@/hooks/use-toast";





export default function AuthorityDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isUploadingCompletion, setIsUploadingCompletion] = useState(false);
  const completionFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const result = await fetchIssues(50); // Get more issues for admin
        const fetchedIssues = Array.isArray(result) ? result : result.issues || [];
        setIssues(fetchedIssues);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };
    loadIssues();
  }, []);

  const dashboardStats = [
    { 
      label: "Open Issues", 
      value: Array.isArray(issues) ? issues.filter(i => i.status === 'pending').length : 0, 
      icon: AlertTriangle, 
      trend: "+3 this week", 
      color: "text-warning" 
    },
    { 
      label: "In Progress", 
      value: Array.isArray(issues) ? issues.filter(i => i.status === 'in-progress').length : 0, 
      icon: Clock, 
      trend: "+5 this week", 
      color: "text-primary" 
    },
    { 
      label: "Resolved", 
      value: Array.isArray(issues) ? issues.filter(i => i.status === 'resolved').length : 0, 
      icon: CheckCircle, 
      trend: "↑ 12% vs yesterday", 
      color: "text-success" 
    },
    { 
      label: "Total Issues", 
      value: Array.isArray(issues) ? issues.length : 0, 
      icon: FileText, 
      trend: "All time", 
      color: "text-primary" 
    },
  ];

  const priorityIssues = Array.isArray(issues) ? issues.filter(issue => 
    (issue.priority === 'High' || issue.priority === 'Emergency' || issue.priority === 'Critical') && 
    issue.status !== 'resolved'
  ).slice(0, 3) : [];
  
  const filteredIssues = Array.isArray(issues) ? issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const isNotCritical = issue.priority !== 'Critical' && issue.priority !== 'Emergency';
    const isResolvedCritical = (issue.priority === 'Critical' || issue.priority === 'Emergency') && issue.status === 'resolved';
    return matchesSearch && matchesStatus && (isNotCritical || isResolvedCritical);
  }) : [];

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-600/20 text-red-700 border-red-600/30 font-bold";
      case "Emergency": return "bg-red-500/20 text-red-600 border-red-500/30 font-bold";
      case "High": return "bg-danger/10 text-danger border-danger/20";
      case "Medium": return "bg-warning/10 text-warning border-warning/20";
      case "Low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    try {
      await updateIssueStatus(issueId, newStatus);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));
      toast({
        title: "Status Updated",
        description: `Issue status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleAssignIssue = async (issueId: string, assignedTo: string) => {
    try {
      await assignIssue(issueId, assignedTo);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, assignedTo } : issue
      ));
      toast({
        title: "Issue Assigned",
        description: `Issue assigned to ${assignedTo}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign issue",
        variant: "destructive"
      });
    }
  };

  const handleCompletionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedIssue) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingCompletion(true);
    try {
      const base64Image = await convertToBase64(file);
      await markAsResolvedWithImage(selectedIssue.id!, base64Image);
      
      // Refresh issues
      const result = await fetchIssues(50);
      const updatedIssues = Array.isArray(result) ? result : result.issues || [];
      setIssues(updatedIssues);
      
      // Update selected issue
      const updatedIssue = updatedIssues.find(issue => issue.id === selectedIssue.id);
      if (updatedIssue) setSelectedIssue(updatedIssue);
      
      toast({
        title: "Issue Resolved",
        description: "Issue marked as resolved with completion image"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload completion image",
        variant: "destructive"
      });
    } finally {
      setIsUploadingCompletion(false);
    }
  };

  const recentActivity = Array.isArray(issues) ? issues.slice(0, 4).map(issue => ({
    action: `Issue ${issue.id} reported: ${issue.title}`,
    user: issue.reportedBy,
    time: formatRelativeTime(issue.reportedAt)
  })) : [];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Authority Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Municipal Issue Management System</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Export", description: "Report export feature coming soon" })}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Priority Issues */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    High Priority Issues
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading issues...</p>
                  </div>
                ) : priorityIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No high priority issues found</p>
                  </div>
                ) : (
                  priorityIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img 
                          src={issue.image} 
                          alt={issue.title}
                          className="w-16 h-12 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{issue.title}</h4>
                            <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                            <StatusBadge status={issue.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{issue.id}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeTime(issue.reportedAt)}</p>
                          <Button variant="outline" size="sm" className="mt-1" onClick={() => setSelectedIssue(issue)}>Manage</Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>All Issues Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search issues by ID, title, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading issues...</p>
                    </div>
                  ) : filteredIssues.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No issues found matching your criteria</p>
                    </div>
                  ) : (
                    filteredIssues.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <img 
                            src={issue.image} 
                            alt={issue.title}
                            className="w-16 h-12 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground">{issue.title}</h4>
                              <StatusBadge status={issue.status} />
                            </div>
                            <p className="text-sm text-muted-foreground">{issue.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{issue.id}</p>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(issue.reportedAt)}</p>
                            <Button variant="outline" size="sm" className="mt-1" onClick={() => setSelectedIssue(issue)}>Manage</Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {filteredIssues.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">View All {filteredIssues.length} Issues</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed & Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.action}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground truncate">{activity.user}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => toast({ title: "Feature Coming Soon", description: "Manual report creation will be available soon" })}>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Manual Report
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => toast({ title: "Team Management", description: "Bulk assignment feature coming soon" })}>
                  <Users className="w-4 h-4 mr-2" />
                  Assign to Team Member
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => toast({ title: "Scheduling", description: "Maintenance scheduling feature coming soon" })}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => toast({ title: "Analytics", description: "Detailed analytics dashboard coming soon" })}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Response Rate</span>
                      <span className="text-success font-medium">98.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Resolution</span>
                      <span className="font-medium">2.3 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Citizen Satisfaction</span>
                      <span className="text-success font-medium">4.7/5</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Status Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-warning rounded-full"></div>
                          <span>Pending</span>
                        </div>
                        <span className="font-medium">{Array.isArray(issues) ? issues.filter(i => i.status === 'pending').length : 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          <span>In Progress</span>
                        </div>
                        <span className="font-medium">{Array.isArray(issues) ? issues.filter(i => i.status === 'in-progress').length : 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-success rounded-full"></div>
                          <span>Resolved</span>
                        </div>
                        <span className="font-medium">{Array.isArray(issues) ? issues.filter(i => i.status === 'resolved').length : 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Issue Management Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Manage Issue: {selectedIssue.id}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIssue(null)}>×</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <img 
                  src={selectedIssue.image} 
                  alt={selectedIssue.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                
                <div>
                  <h3 className="font-semibold text-lg">{selectedIssue.title}</h3>
                  <p className="text-muted-foreground mt-1">{selectedIssue.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {selectedIssue.location}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={selectedIssue.status} onValueChange={(value) => handleStatusUpdate(selectedIssue.id!, value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Assign To</label>
                    <Select value={selectedIssue.assignedTo} onValueChange={(value) => handleAssignIssue(selectedIssue.id!, value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Road Maintenance Team">Road Maintenance Team</SelectItem>
                        <SelectItem value="Water Utilities Dept">Water Utilities Dept</SelectItem>
                        <SelectItem value="Waste Management">Waste Management</SelectItem>
                        <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
                        <SelectItem value="Public Safety">Public Safety</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Completion Image Section */}
                {selectedIssue.status === 'resolved' && selectedIssue.completionImage && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Completion Image</label>
                    <img 
                      src={selectedIssue.completionImage} 
                      alt="Issue completion"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Resolved on: {selectedIssue.completionDate ? new Date(selectedIssue.completionDate).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                )}

                <input
                  ref={completionFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCompletionImageUpload}
                  className="hidden"
                />

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setSelectedIssue(null)}>Close</Button>
                  {selectedIssue.status !== 'resolved' && (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => completionFileRef.current?.click()}
                        disabled={isUploadingCompletion}
                        className="flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        {isUploadingCompletion ? 'Uploading...' : 'Resolve with Image'}
                      </Button>
                      <Button onClick={() => handleStatusUpdate(selectedIssue.id!, 'resolved')}>Mark as Resolved</Button>
                    </>
                  )}

                </div>
              </CardContent>
            </Card>
          </div>
        )}


      </div>
    </div>
  );
}