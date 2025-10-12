import { useState, useEffect } from "react";
import { Bell, User, LogOut, Menu, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { authService, UserProfile } from "@/services/authService";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await authService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Fallback to localStorage data
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setUserProfile(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout properly",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <header className="bg-header text-header-foreground shadow-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-header-foreground hover:bg-header-foreground/10"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">PharmaCare Pro</h1>
                <p className="text-xs text-header-foreground/70">Loading...</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-header text-header-foreground shadow-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-header-foreground hover:bg-header-foreground/10"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">PharmaCare Pro</h1>
              <div className="flex items-center space-x-2 text-xs text-header-foreground/70">
                {userProfile?.organization_name && (
                  <>
                    <span>{userProfile.organization_name}</span>
                    {userProfile.branch_name && (
                      <>
                        <span>•</span>
                        <span>{userProfile.branch_name}</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-header-foreground/10">
            <Bell size={18} />
            <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">3</Badge>
          </Button>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <User size={14} className="text-primary-foreground" />
            </div>
            <div className="hidden md:block text-right">
              <div className="font-medium">{userProfile?.name || 'User'}</div>
              <div className="text-xs text-header-foreground/70 flex items-center space-x-1">
                <span>{userProfile?.role_display || userProfile?.role?.replace('_', ' ')}</span>
                {userProfile?.branch_name && (
                  <>
                    <span>•</span>
                    <span>{userProfile.branch_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-header-foreground hover:bg-header-foreground/10"
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}