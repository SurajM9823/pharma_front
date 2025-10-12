import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Building2, Users, TrendingUp, Package, 
  DollarSign, Activity, Target, BarChart3, Settings,
  Hospital, Pill, ShoppingCart, Truck, UserIcon
} from "lucide-react";
import { type User, getUsersByOrganization, getUsersByBranch, getOrganizationById, getBranchById } from "@/data/mockData";
import { CentralizedReports } from "./CentralizedReports";

interface RoleBasedDashboardProps {
  user: User;
}

export function RoleBasedDashboard({ user }: RoleBasedDashboardProps) {
  // Check if user is on reports page
  const currentPath = window.location.pathname;
  if (currentPath.includes('/reports') || currentPath.includes('/admin/reports')) {
    return <CentralizedReports user={user} />;
  }

  // Super Admin Dashboard
  if (user.role === 'super_admin') {
    return (
      <div className="w-full max-w-none space-y-6 overflow-x-hidden">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-warning" />
          <div>
            <h1 className="text-2xl font-bold">System Administration</h1>
            <p className="text-muted-foreground">Multi-tenant pharmacy network overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Card className="border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Active pharmacy networks</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">Across all organizations</p>
            </CardContent>
          </Card>

          <Card className="border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹2.4M</div>
              <p className="text-xs text-muted-foreground">Monthly recurring</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">System availability</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Organizations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['MediCare Hospital Network', 'HealthPlus Pharmacy Chain', 'CityMed Group'].map((name, i) => (
                <div key={i} className="flex items-center justify-between p-3 border">
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-muted-foreground">Enterprise • 45 users</div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Database Performance</span>
                <Badge variant="outline" className="text-success border-success">Excellent</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>API Response Time</span>
                <Badge variant="outline" className="text-success border-success">120ms</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Sessions</span>
                <Badge variant="outline">1,247</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pharmacy Owner Dashboard
  if (user.role === 'owner') {
    const organization = getOrganizationById(user.organizationId!);
    const orgUsers = getUsersByOrganization(user.organizationId!);
    
    return (
      <div className="w-full max-w-full space-y-6 overflow-x-hidden">
        <div className="flex items-center gap-3">
          <Hospital className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{organization?.name}</h1>
            <p className="text-muted-foreground">Multi-branch pharmacy network management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Branches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organization?.branches.length}</div>
              <p className="text-xs text-muted-foreground">Active locations</p>
            </CardContent>
          </Card>

          <Card className="border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orgUsers.length}</div>
              <p className="text-xs text-muted-foreground">Total employees</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{user.collectionAmount?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(((user.collectionAmount || 0) / (user.targets?.monthly || 1)) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Monthly achievement</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Branch Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {organization?.branches.map((branch) => {
                const branchUsers = getUsersByBranch(branch.id);
                return (
                  <div key={branch.id} className="flex items-center justify-between p-3 border rounded min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{branch.name}</div>
                      <div className="text-sm text-muted-foreground">{branchUsers.length} staff • {branch.status}</div>
                    </div>
                    <Badge variant={branch.status === 'active' ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                      {branch.status}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orgUsers.slice(0, 5).map((staffUser) => (
                <div key={staffUser.id} className="flex items-center justify-between p-3 border rounded min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{staffUser.name}</div>
                    <div className="text-sm text-muted-foreground">{staffUser.role.replace('_', ' ')}</div>
                  </div>
                  <div className="text-sm font-medium text-success flex-shrink-0 ml-2">
                    ₹{staffUser.collectionAmount?.toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Branch Manager Dashboard
  if (user.role === 'manager') {
    const branch = getBranchById(user.branchId!);
    const branchUsers = getUsersByBranch(user.branchId!);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-secondary-foreground" />
          <div>
            <h1 className="text-2xl font-bold">{branch?.name}</h1>
            <p className="text-muted-foreground">Branch operations and team management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{branchUsers.length}</div>
              <p className="text-xs text-muted-foreground">Active staff</p>
            </CardContent>
          </Card>

          <Card className="border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">Items in stock</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{user.collectionAmount?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(((user.collectionAmount || 0) / (user.targets?.monthly || 1)) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Achievement</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {branchUsers.filter(u => u.id !== user.id).map((staffUser) => (
                <div key={staffUser.id} className="flex items-center justify-between p-3 border">
                  <div>
                    <div className="font-medium">{staffUser.name}</div>
                    <div className="text-sm text-muted-foreground">{staffUser.role.replace('_', ' ')}</div>
                  </div>
                  <div className="text-sm font-medium text-success">
                    ₹{staffUser.collectionAmount?.toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Inventory Management
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Sales Reports
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Staff Management
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Branch Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pharmacy Staff Dashboard (Pharmacist, Technician, Cashier)
  if (['SENIOR_PHARMACIST', 'PHARMACIST', 'PHARMACY_TECHNICIAN', 'CASHIER'].includes(user.role)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Pill className="w-8 h-8 text-accent-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            <p className="text-muted-foreground">{user.role.replace('_', ' ')} Dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                My Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{user.collectionAmount?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(((user.collectionAmount || 0) / (user.targets?.monthly || 1)) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Achievement</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">Processed today</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">Currently on duty</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.permissions.includes('prescriptions') && (
                <Button className="w-full justify-start" variant="outline">
                  <Pill className="w-4 h-4 mr-2" />
                  Process Prescriptions
                </Button>
              )}
              {user.permissions.includes('inventory') && (
                <Button className="w-full justify-start" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Check Inventory
                </Button>
              )}
              {user.permissions.includes('pos') && (
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Point of Sale
                </Button>
              )}
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                My Performance
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Monthly Target</span>
                <span className="font-medium">₹{user.targets?.monthly.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Achieved</span>
                <span className="font-medium text-success">₹{user.collectionAmount?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Remaining</span>
                <span className="font-medium text-warning">₹{((user.targets?.monthly || 0) - (user.collectionAmount || 0)).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Supplier Dashboard
  if (['SUPPLIER_ADMIN', 'SALES_REPRESENTATIVE'].includes(user.role)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Truck className="w-8 h-8 text-warning-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
            <p className="text-muted-foreground">{user.role.replace('_', ' ')} Operations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{user.collectionAmount?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">Active pharmacies</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Pending delivery</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(((user.collectionAmount || 0) / (user.targets?.monthly || 1)) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Achievement</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['MediCare Hospital Network', 'HealthPlus Pharmacy Chain', 'CityMed Group'].map((client, i) => (
                <div key={i} className="flex items-center justify-between p-3 border">
                  <div>
                    <div className="font-medium">{client}</div>
                    <div className="text-sm text-muted-foreground">Order #{1000 + i}</div>
                  </div>
                  <Badge variant="outline" className="text-warning border-warning">Pending</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Manage Inventory
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Client Management
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Truck className="w-4 h-4 mr-2" />
                Delivery Schedule
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Sales Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserIcon className="w-8 h-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">Your personalized dashboard</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to your dashboard. Your role-specific features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}