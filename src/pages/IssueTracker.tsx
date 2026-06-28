import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Search, Filter, MapPin, Clock, User, FileText, Heart, MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { getIssues as fetchIssues, toggleLike, addComment, deleteIssue } from "@/services/issueService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Get issues from Firebase with pagination
const getIssues = async (lastDoc?: any) => {
  try {
    const { issues: firebaseIssues, lastDoc: newLastDoc } = await fetchIssues(5, lastDoc);
    const processedIssues = firebaseIssues.map(issue => ({
      ...issue,
      updates: [
        { date: issue.reportedAt, message: `Issue reported by ${issue.reportedBy}`, status: "pending" }
      ]
    }));
    return { issues: processedIssues, lastDoc: newLastDoc };
  } catch (error) {
    console.error('Failed to fetch from Firebase:', error);
    return { issues: [], lastDoc: null };
  }
};

export default function IssueTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [allIssues, setAllIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialIssues = async () => {
      setIsLoading(true);
      try {
        const { issues, lastDoc: newLastDoc } = await getIssues();
        setAllIssues(Array.isArray(issues) ? issues : []);
        setLastDoc(newLastDoc);
        setHasMore(Array.isArray(issues) && issues.length === 5);
      } catch (error) {
        console.error('Failed to load issues:', error);
        toast({
          title: "Error",
          description: "Failed to load issues. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialIssues();
  }, []);

  const loadMoreIssues = async () => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const { issues, lastDoc: newLastDoc } = await getIssues(lastDoc);
      setAllIssues(prev => [...prev, ...(Array.isArray(issues) ? issues : [])]);
      setLastDoc(newLastDoc);
      setHasMore(Array.isArray(issues) && issues.length === 5);
    } catch (error) {
      console.error('Failed to load more issues:', error);
      toast({
        title: "Error",
        description: "Failed to load more issues.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredIssues = allIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort by priority: Critical first, then High, then Medium, then Low
    const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    const aPriority = priorityOrder[a.priority] ?? 4;
    const bPriority = priorityOrder[b.priority] ?? 4;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same priority, sort by date (newest first)
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const handleLike = async (issueId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to like issues",
        variant: "destructive"
      });
      return;
    }

    try {
      await toggleLike(issueId, user.id);
      // Update the specific issue in the list
      setAllIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, likes: Array.isArray(issue.likes) && issue.likes.includes(user.id) 
              ? issue.likes.filter(id => id !== user.id)
              : [...(issue.likes || []), user.id] }
          : issue
      ));
      // Update selected issue if it's the one that was liked
      if (selectedIssue?.id === issueId) {
        const updatedIssue = allIssues.find(issue => issue.id === issueId);
        if (updatedIssue) setSelectedIssue(updatedIssue);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }

    setIsDeletingIssue(issueId);
    try {
      await deleteIssue(issueId);
      setAllIssues(prev => prev.filter(issue => issue.id !== issueId));
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(null);
      }
      toast({
        title: "Issue Deleted",
        description: "The issue has been successfully deleted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete issue",
        variant: "destructive"
      });
    } finally {
      setIsDeletingIssue(null);
    }
  };

  const canDeleteIssue = (issue: any) => {
    if (!user) return false;
    // Admin can delete anonymous issues
    const isAdmin = sessionStorage.getItem("adminAuth") === "true";
    if (isAdmin && (!issue.reportedById || issue.reportedById === null)) {
      return true;
    }
    // Users can delete their own issues
    return issue.reportedById === user.id;
  };

  const handleAddComment = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to comment",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim() || !selectedIssue) return;

    setIsSubmittingComment(true);
    try {
      await addComment(selectedIssue.id, {
        text: newComment.trim(),
        authorName: user.name,
        authorId: user.id,
        createdAt: new Date().toISOString()
      });
      
      setNewComment("");
      // Update the specific issue with new comment
      const newCommentObj = {
        id: Date.now().toString(),
        text: newComment.trim(),
        authorName: user.name,
        authorId: user.id,
        createdAt: new Date().toISOString()
      };
      
      setAllIssues(prev => prev.map(issue => 
        issue.id === selectedIssue.id 
          ? { ...issue, comments: [...(issue.comments || []), newCommentObj] }
          : issue
      ));
      
      if (selectedIssue) {
        setSelectedIssue({
          ...selectedIssue,
          comments: [...(selectedIssue.comments || []), newCommentObj]
        });
      }
      
      toast({
        title: "Comment Added",
        description: "Your comment has been posted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-2 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-4">Issue Tracker</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Search and track the status of reported civic issues in your community
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, title, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Issues List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              {isLoading ? 'Loading...' : `Showing ${filteredIssues.length} of ${allIssues.length} issues`}
            </div>
            
            {filteredIssues.map((issue) => (
              <div key={issue.id}>
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedIssue?.id === issue.id ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    // Desktop: show in sidebar
                    if (window.innerWidth >= 1024) {
                      setSelectedIssue(issue);
                    } else {
                      // Mobile: toggle expanded view
                      setExpandedIssueId(expandedIssueId === issue.id ? null : issue.id);
                    }
                  }}
                >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <img 
                      src={issue.image} 
                      alt={issue.title}
                      className="w-full sm:w-24 h-32 sm:h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-foreground truncate">{issue.title}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <StatusBadge status={issue.status as "pending" | "in-progress" | "resolved"} />
                          <PriorityBadge priority={issue.priority as "Low" | "Medium" | "High" | "Critical"} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{issue.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm mb-4">
                    <div className="flex items-center text-muted-foreground min-w-0">
                      <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium mr-1">ID:</span>
                      <span className="truncate">{issue.id}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{formatRelativeTime(issue.reportedAt)}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground min-w-0">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{issue.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground min-w-0">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{issue.reportedBy}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(issue.id);
                        }}
                        className={`flex items-center gap-2 ${
                          issue.likes?.includes(user?.id) ? 'text-red-500' : 'text-muted-foreground'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${issue.likes?.includes(user?.id) ? 'fill-current' : ''}`} />
                        <span>{issue.likes?.length || 0}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{issue.comments?.length || 0}</span>
                      </Button>
                    </div>
                    {canDeleteIssue(issue) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteIssue(issue.id);
                        }}
                        disabled={isDeletingIssue === issue.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {isDeletingIssue === issue.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
                </Card>
                
                {/* Mobile expanded details */}
                {expandedIssueId === issue.id && (
                  <div className="lg:hidden mt-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Issue Details</span>
                          <StatusBadge status={issue.status as "pending" | "in-progress" | "resolved"} />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {issue.status === 'resolved' && issue.completionImage ? (
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-center">Before & After Comparison</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <img 
                                  src={issue.image} 
                                  alt="Before - Original issue"
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <p className="text-xs text-center text-muted-foreground">Before</p>
                              </div>
                              <div className="space-y-1">
                                <img 
                                  src={issue.completionImage} 
                                  alt="After - Issue resolved"
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <p className="text-xs text-center text-green-600 font-medium">After (Resolved)</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={issue.image} 
                            alt={issue.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold text-foreground">{issue.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Issue ID:</span>
                            <span className="font-medium">{issue.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Priority:</span>
                            <span className="font-medium">{issue.priority}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reported By:</span>
                            <span className="font-medium">{issue.reportedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assigned To:</span>
                            <span className="font-medium">{issue.assignedTo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium text-right">{issue.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reported:</span>
                            <span className="font-medium">{formatDate(issue.reportedAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Community Engagement</span>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span>{issue.likes?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4 text-blue-500" />
                              <span>{issue.comments?.length || 0}</span>
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Button
                            variant={issue.likes?.includes(user?.id) ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(issue.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Heart className={`w-4 h-4 ${issue.likes?.includes(user?.id) ? 'fill-current' : ''}`} />
                            {issue.likes?.includes(user?.id) ? 'Liked' : 'Like'}
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Comments ({issue.comments?.length || 0})</h4>
                          
                          {issue.comments?.map((comment, index) => (
                            <div key={comment.id || index} className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{comment.authorName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm">{comment.text}</p>
                            </div>
                          ))}
                          
                          {(!issue.comments || issue.comments.length === 0) && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No comments yet. Be the first to comment!
                            </p>
                          )}
                          
                          {user ? (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Add a comment..."
                                value={expandedIssueId === issue.id ? newComment : ''}
                                onChange={(e) => {
                                  if (expandedIssueId === issue.id) {
                                    setNewComment(e.target.value);
                                    setSelectedIssue(issue);
                                  }
                                }}
                                className="min-h-20"
                              />
                              <Button
                                onClick={() => {
                                  setSelectedIssue(issue);
                                  handleAddComment();
                                }}
                                disabled={!newComment.trim() || isSubmittingComment}
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Send className="w-4 h-4" />
                                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              <a href="/login" className="text-primary hover:underline">Login</a> to add comments
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <h3 className="font-semibold text-foreground mb-2">Loading issues...</h3>
                  <p className="text-muted-foreground">Please wait while we fetch the latest data</p>
                </CardContent>
              </Card>
            ) : filteredIssues.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No issues found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
                </CardContent>
              </Card>
            ) : null}
            
            {/* Load More Button */}
            {!isLoading && hasMore && (
              <div className="text-center mt-6">
                <Button 
                  onClick={loadMoreIssues} 
                  disabled={isLoadingMore}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    'Load More Issues'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Issue Details Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-4">
            {selectedIssue ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Issue Details</span>
                      <StatusBadge status={selectedIssue.status as "pending" | "in-progress" | "resolved"} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedIssue.status === 'resolved' && selectedIssue.completionImage ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-center">Before & After Comparison</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <img 
                              src={selectedIssue.image} 
                              alt="Before - Original issue"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <p className="text-xs text-center text-muted-foreground">Before</p>
                          </div>
                          <div className="space-y-1">
                            <img 
                              src={selectedIssue.completionImage} 
                              alt="After - Issue resolved"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <p className="text-xs text-center text-green-600 font-medium">After (Resolved)</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={selectedIssue.image} 
                        alt={selectedIssue.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-foreground">{selectedIssue.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{selectedIssue.description}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issue ID:</span>
                        <span className="font-medium">{selectedIssue.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <span className="font-medium">{selectedIssue.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reported By:</span>
                        <span className="font-medium">{selectedIssue.reportedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assigned To:</span>
                        <span className="font-medium">{selectedIssue.assignedTo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium text-right">{selectedIssue.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reported:</span>
                        <span className="font-medium">{formatDate(selectedIssue.reportedAt)}</span>
                      </div>
                    </div>
                    
                    {canDeleteIssue(selectedIssue) && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteIssue(selectedIssue.id)}
                          disabled={isDeletingIssue === selectedIssue.id}
                          className="w-full"
                        >
                          {isDeletingIssue === selectedIssue.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Issue
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Community Engagement</span>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>{selectedIssue.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                          <span>{selectedIssue.comments?.length || 0}</span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant={selectedIssue.likes?.includes(user?.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLike(selectedIssue.id)}
                        className="flex items-center gap-2"
                      >
                        <Heart className={`w-4 h-4 ${selectedIssue.likes?.includes(user?.id) ? 'fill-current' : ''}`} />
                        {selectedIssue.likes?.includes(user?.id) ? 'Liked' : 'Like'}
                      </Button>
                    </div>
                    
                    {/* Comments Section */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Comments ({selectedIssue.comments?.length || 0})</h4>
                      
                      {selectedIssue.comments?.map((comment, index) => (
                        <div key={comment.id || index} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{comment.authorName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      ))}
                      
                      {(!selectedIssue.comments || selectedIssue.comments.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                      
                      {/* Add Comment */}
                      {user ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-20"
                          />
                          <Button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || isSubmittingComment}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          <a href="/login" className="text-primary hover:underline">Login</a> to add comments
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedIssue.updates.map((update, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{update.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(update.date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Select an Issue</h3>
                  <p className="text-muted-foreground text-sm">
                    Click on an issue from the list to view detailed information and status updates
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}