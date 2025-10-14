import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  SidebarInset, 
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, LogOut, Settings, Bell, Search, 
  Shield, Heart, User as UserIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { 
  type User, 
  getUserById, 
  getOrganizationById, 
  getBranchById,
  mockOrganizations,
  getRoleDisplayName 
} from "@/data/mockData";
import { RoleBasedDashboard } from "./RoleBasedDashboard";

export default function LayoutFixed() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Initialize session timeout (30 minutes with 5 minute warning)
  useSessionTimeout({
    timeout: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes warning
  });
  
  // Initialize automatic token refresh (every 15 minutes)
  useTokenRefresh({
    refreshInterval: 15 * 60 * 1000, // 15 minutes
    enabled: true
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedOrg = localStorage.getItem("selectedOrganization");
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      
      if (storedOrg) {
        setSelectedOrg(storedOrg);
      } else if (user.organizationId) {
        setSelectedOrg(user.organizationId);
      }
    }
    // AuthGuard will handle redirecting to login if no user
  }, []);

  const handleLogout = () => {
    // Clear authentication data but preserve remembered credentials
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("selectedOrganization");
    // Keep rememberedEmail and rememberedPassword for next login
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate("/login", { replace: true });
  };

  const handleOrgChange = (orgId: string) => {
    setSelectedOrg(orgId);
    localStorage.setItem("selectedOrganization", orgId);
    
    toast({
      title: "Organization Changed",
      description: `Switched to ${getOrganizationById(orgId)?.name}`,
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'super_admin': 'bg-warning text-warning-foreground',
      'owner': 'bg-primary text-primary-foreground',
      'manager': 'bg-secondary text-secondary-foreground',
      'pharmacist': 'bg-accent text-accent-foreground',
      'technician': 'bg-muted text-muted-foreground',
      'cashier': 'bg-muted text-muted-foreground',
      'supplier': 'bg-destructive text-destructive-foreground'
    };
    return colors[role as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-50 to-indigo-100/80 backdrop-blur-sm border-b border-blue-200 z-50 flex items-center px-4">
        <div className="flex items-center gap-3 ml-12">
          <Heart className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold">drpharmas</h1>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {/* Organization Selector */}
          {(currentUser.role === 'super_admin' || 
            (currentUser.role === 'owner' && mockOrganizations.length > 1)) && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <Select value={selectedOrg} onValueChange={handleOrgChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Organization..." />
                </SelectTrigger>
                <SelectContent>
                  {mockOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search */}
          <Button variant="ghost" size="icon">
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="flex items-center gap-2">
              <UserIcon className="w-6 h-6 bg-primary text-primary-foreground p-1 rounded" />
              <div>
                <div className="text-sm font-medium">
                  {currentUser.first_name && currentUser.last_name
                    ? `${currentUser.first_name} ${currentUser.last_name}`
                    : currentUser.name || 'User'}
                </div>
                <Badge className={`text-xs ${getRoleColor(currentUser.role)}`}>
                  {getRoleDisplayName(currentUser.role)}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex pt-16 min-h-screen">
        <SidebarProvider>
          {/* Sidebar Trigger in header area */}
          <div className="fixed top-4 left-4 z-50">
            <SidebarTrigger className="bg-white/80 hover:bg-white border border-slate-200 shadow-sm" />
          </div>

          {/* Fixed Sidebar */}
          <AppSidebar />
          
          {/* Main Content Area */}
          <SidebarInset className="flex-1 min-w-0">
            <main className="p-6 w-full">
              <div 
                key={location.pathname}
                className="animate-in slide-in-from-top-4 fade-in duration-700 ease-out"
              >
                {location.pathname === "/" ? (
                  <RoleBasedDashboard user={currentUser} />
                ) : (
                  <Outlet />
                )}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}