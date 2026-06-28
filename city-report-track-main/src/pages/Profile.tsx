import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { User, MapPin, Clock, FileText, Settings, LogOut, Camera, Bell, Shield, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Issue } from "@/services/issueService";
import { getUserIssues, updateUserAvatar } from "@/services/userService";
import { deleteIssue } from "@/services/issueService";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, logout, login } = useAuth();
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadUserIssues = async () => {
      try {
        const userIssuesData = await getUserIssues(user.email);
        setUserIssues(userIssuesData as Issue[]);
      } catch (error) {
        console.error('Failed to fetch user issues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserIssues();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDeleteIssue = async (issueId: string) => {
    setIsDeletingIssue(issueId);
    try {
      await deleteIssue(issueId);
      const updatedIssues = await getUserIssues(user!.email);
      setUserIssues(updatedIssues as Issue[]);
      setDeleteConfirm(null);
      toast({
        title: "Issue Deleted",
        description: "Your issue has been successfully deleted"
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

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
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

    setIsUpdatingAvatar(true);
    try {
      const base64Avatar = await convertToBase64(file);
      
      // Save avatar to Firebase with retry logic
      try {
        await updateUserAvatar(user.id, base64Avatar);
      } catch (dbError) {
        console.warn('Database update failed, continuing with local update:', dbError);
      }
      
      // Update user data with new avatar (always update locally)
      const updatedUser = {
        ...user,
        avatar: base64Avatar
      };
      
      login(updatedUser); // This updates the user in context and localStorage
      
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully"
      });
    } catch (error) {
      console.error('Avatar update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingAvatar(false);
      // Clear the file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 overflow-hidden border-2 border-border">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUpdatingAvatar}
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{user.name}</h1>
                  <p className="text-muted-foreground text-sm md:text-base truncate">{user.email}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 md:gap-2 md:flex-shrink-0">
                <div className="flex items-center justify-center sm:justify-start gap-6 text-sm bg-muted/30 rounded-lg p-3">
                  <div className="text-center">
                    <div className="font-bold text-lg">{userIssues.length}</div>
                    <div className="text-muted-foreground text-xs">Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-green-600">{userIssues.filter(i => i.status === 'resolved').length}</div>
                    <div className="text-muted-foreground text-xs">Resolved</div>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowSettings(!showSettings)}
                    className="whitespace-nowrap"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="whitespace-nowrap"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Change Profile Picture</div>
                    <div className="text-sm text-muted-foreground">Update your avatar</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => toast({ title: "Coming Soon", description: "Notification settings will be available soon" })}>
                  <Bell className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Notifications</div>
                    <div className="text-sm text-muted-foreground">Manage email & push notifications</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => toast({ title: "Coming Soon", description: "Privacy settings will be available soon" })}>
                  <Eye className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Privacy</div>
                    <div className="text-sm text-muted-foreground">Control your data visibility</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => toast({ title: "Coming Soon", description: "Security settings will be available soon" })}>
                  <Shield className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Security</div>
                    <div className="text-sm text-muted-foreground">Password & account security</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4 border-destructive/20 hover:bg-destructive/5" onClick={() => toast({ title: "Coming Soon", description: "Account deletion will be available soon", variant: "destructive" })}>
                  <Trash2 className="w-5 h-5 mr-3 text-destructive" />
                  <div className="text-left">
                    <div className="font-medium text-destructive">Delete Account</div>
                    <div className="text-sm text-muted-foreground">Permanently delete your account</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4" onClick={handleLogout}>
                  <LogOut className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Sign Out</div>
                    <div className="text-sm text-muted-foreground">Log out of your account</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              My Reported Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading your issues...</p>
              </div>
            ) : userIssues.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No Issues Reported</h3>
                <p className="text-muted-foreground mb-4">You haven't reported any issues yet.</p>
                <Button asChild>
                  <a href="/report">Report Your First Issue</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userIssues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex gap-4">
                      <img 
                        src={issue.image} 
                        alt={issue.title}
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">{issue.title}</h4>
                          <StatusBadge status={issue.status} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground min-w-0 flex-1">
                            <span className="flex items-center gap-1 min-w-0">
                              <FileText className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{issue.id}</span>
                            </span>
                            <span className="flex items-center gap-1 min-w-0">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{issue.location}</span>
                            </span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{formatRelativeTime(issue.reportedAt)}</span>
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(issue.id!)}
                            disabled={isDeletingIssue === issue.id}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                          >
                            {isDeletingIssue === issue.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this issue? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteIssue(deleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}