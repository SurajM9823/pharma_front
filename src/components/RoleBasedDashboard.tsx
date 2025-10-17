import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Building2, Users, TrendingUp, Package, 
  DollarSign, Activity, Target, BarChart3, Settings,
  Hospital, Pill, ShoppingCart, Truck, UserIcon,
  CreditCard, AlertTriangle, Calendar, FileText,
  PlusCircle, Search, Clock, TrendingDown, Filter, X,
  CheckCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { inventoryAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { type User, getUsersByOrganization, getUsersByBranch, getOrganizationById, getBranchById } from "@/data/mockData";
import { CentralizedReports } from "./CentralizedReports";
import { dashboardService } from "@/services/dashboardService";

interface RoleBasedDashboardProps {
  user: User;
}

export function RoleBasedDashboard({ user }: RoleBasedDashboardProps) {
  // Initialize all hooks at the top level
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Check if user is on reports page
  const currentPath = window.location.pathname;
  if (currentPath.includes('/reports') || currentPath.includes('/admin/reports')) {
    return <CentralizedReports user={user} />;
  }

  // Check user permissions for modules
  const hasPermission = (module: string) => {
    // Super admin and pharmacy owner have access to all modules
    if (user.role === 'pharmacy_owner' || user.role === 'super_admin') return true;
    
    // Check if user has modulePermissions array
    if (!user?.modulePermissions || !Array.isArray(user.modulePermissions)) {
      // If no permissions data, allow access for now (fallback)
      console.warn('No module permissions found for user, allowing access to:', module);
      return true;
    }

    // Find the module permission
    const moduleData = user.modulePermissions.find(m => m.id === module || m.name?.toLowerCase() === module.toLowerCase());
    if (!moduleData) {
      console.warn('Module permission not found for:', module);
      return false;
    }
    
    return moduleData.has_access || false;
  };

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  const getSearchResultPath = (type: string, id: string) => {
    switch (type) {
      case 'Patient': return hasPermission('patients') ? `/patients/detail/${id}` : null;
      case 'Medicine': return hasPermission('inventory') ? `/inventory/medication-list?search=${id}` : null;
      case 'Supplier': return hasPermission('suppliers') ? `/suppliers/management?search=${id}` : null;
      case 'Staff': return hasPermission('network') ? `/network/users?search=${id}` : null;
      default: return null;
    }
  };

  const searchResults = [
    { type: 'Patient', name: 'John Doe', id: 'P001' },
    { type: 'Medicine', name: 'Paracetamol 500mg', id: 'M001' },
    { type: 'Supplier', name: 'MedSupply Co.', id: 'S001' },
    { type: 'Staff', name: 'Dr. Smith', id: 'ST001' }
  ].filter(item => {
    const hasAccess = getSearchResultPath(item.type, item.id) !== null;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.type.toLowerCase().includes(searchQuery.toLowerCase());
    return hasAccess && matchesQuery;
  });

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
      </div>
    );
  }

  // Hospital Pharmacy Owner Dashboard
  if (user.role === 'pharmacy_owner') {
    const organization = getOrganizationById(user.organizationId!);
    const orgUsers = getUsersByOrganization(user.organizationId!);

    // Dynamic data based on filters - now fetched from API
    const [dashboardStats, setDashboardStats] = useState({
      totalSales: 0,
      patientCredit: 0,
      supplierCredit: 0,
      criticalStock: 0,
      expiringItems: 0
    });
    const [loadingStats, setLoadingStats] = useState(false);

    // Fetch dashboard stats when filters change
    useEffect(() => {
      const fetchDashboardStats = async () => {
        setLoadingStats(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}/pos/dashboard/stats/?date_filter=${dateFilter}&branch_id=${selectedBranch}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setDashboardStats({
              totalSales: data.totalSales || 0,
              patientCredit: data.patientCredit || 0,
              supplierCredit: data.supplierCredit || 0,
              criticalStock: data.criticalStock || 0,
              expiringItems: data.expiringItems || 0
            });
          }
        } catch (error) {
          console.error('Failed to fetch dashboard stats:', error);
        } finally {
          setLoadingStats(false);
        }
      };

      fetchDashboardStats();
    }, [dateFilter, selectedBranch]);

    // Use real data from API
    const filteredData = dashboardStats;
    const selectedBranchName = selectedBranch === 'all' ? 'All Branches' : organization?.branches.find(b => b.id === selectedBranch)?.name || 'Unknown';

    // Fetch sales chart data
    const [salesData, setSalesData] = useState([]);
    const [loadingChart, setLoadingChart] = useState(false);

    useEffect(() => {
      const fetchSalesChart = async () => {
        setLoadingChart(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}/pos/dashboard/sales-chart/?date_filter=${dateFilter}&branch_id=${selectedBranch}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setSalesData(data);
          }
        } catch (error) {
          console.error('Failed to fetch sales chart:', error);
        } finally {
          setLoadingChart(false);
        }
      };

      fetchSalesChart();
    }, [dateFilter, selectedBranch]);

    // Fetch stock categories data
    const [medicineData, setMedicineData] = useState([]);
    const [loadingPie, setLoadingPie] = useState(false);

    // Fetch recent activities
    const [recentActivities, setRecentActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(false);

    useEffect(() => {
      const fetchStockCategories = async () => {
        setLoadingPie(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}/pos/dashboard/stock-categories/?branch_id=${selectedBranch}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setMedicineData(data);
          }
        } catch (error) {
          console.error('Failed to fetch stock categories:', error);
        } finally {
          setLoadingPie(false);
        }
      };

      const fetchRecentActivities = async () => {
        setLoadingActivities(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}/pos/dashboard/recent-activities/?branch_id=${selectedBranch}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setRecentActivities(data);
          }
        } catch (error) {
          console.error('Failed to fetch recent activities:', error);
        } finally {
          setLoadingActivities(false);
        }
      };

      fetchStockCategories();
      fetchRecentActivities();
    }, [selectedBranch]);

    const staffData = selectedBranch === 'all' ? [
      { name: 'Dr. Smith', sales: 25000 },
      { name: 'John P.', sales: 18500 },
      { name: 'Sarah T.', sales: 12300 },
      { name: 'Mike R.', sales: 15800 },
      { name: 'Lisa K.', sales: 21200 }
    ] : [
      { name: 'Dr. Smith', sales: 15000 },
      { name: 'John P.', sales: 11000 },
      { name: 'Sarah T.', sales: 7400 }
    ];
    
    return (
      <div className="w-full max-w-full space-y-6 overflow-x-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hospital className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{organization?.name}</h1>
              <p className="text-muted-foreground">Hospital Pharmacy Management Dashboard</p>
            </div>
          </div>
          
          {/* Global Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {organization?.branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          <Card className="border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{filteredData.totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This week' : dateFilter === 'month' ? 'This month' : 'This year'}</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Patient Credit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{filteredData.patientCredit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Supplier Credit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{filteredData.supplierCredit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">To pay</p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Critical Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredData.criticalStock}</div>
              <p className="text-xs text-muted-foreground">Low inventory</p>
            </CardContent>
          </Card>

          <Card className="border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredData.expiringItems}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {hasPermission('pos') && (
                <Button 
                  className="h-16 flex-col gap-2" 
                  variant="outline"
                  onClick={() => handleQuickAction('/pos/billing')}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-xs">POS</span>
                </Button>
              )}
              {hasPermission('inventory') && (
                <Button 
                  className="h-16 flex-col gap-2" 
                  variant="outline"
                  onClick={() => handleQuickAction('/inventory/stock-management')}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span className="text-xs">Stock Entry</span>
                </Button>
              )}
              {hasPermission('suppliers') && (
                <Button 
                  className="h-16 flex-col gap-2" 
                  variant="outline"
                  onClick={() => handleQuickAction('/suppliers/management')}
                >
                  <Truck className="w-5 h-5" />
                  <span className="text-xs">Suppliers</span>
                </Button>
              )}
              {hasPermission('network') && (
                <Button 
                  className="h-16 flex-col gap-2" 
                  variant="outline"
                  onClick={() => handleQuickAction('/network/users')}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs">Users</span>
                </Button>
              )}
              <Button 
                className="h-16 flex-col gap-2" 
                variant="outline"
                onClick={() => setShowSearchModal(true)}
              >
                <Search className="w-5 h-5" />
                <span className="text-xs">Search</span>
              </Button>
              {hasPermission('inventory') && (
                <Button 
                  className="h-16 flex-col gap-2" 
                  variant="outline"
                  onClick={() => handleQuickAction('/inventory/manage-orders')}
                >
                  <Package className="w-5 h-5" />
                  <span className="text-xs">Manage Orders</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Modal */}
        <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Global Search
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSearchModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search patients, medicines, suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <div 
                        key={index} 
                        className="p-3 border rounded hover:bg-muted cursor-pointer"
                        onClick={() => {
                          const path = getSearchResultPath(result.type, result.id);
                          if (path) {
                            navigate(path);
                            setShowSearchModal(false);
                            setSearchQuery('');
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{result.name}</div>
                            <div className="text-sm text-muted-foreground">{result.type} • {result.id}</div>
                          </div>
                          <Badge variant="outline">{result.type}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Report Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sales Report & Lead Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loadingChart ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">Loading chart data...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [name === 'sales' ? `₹${value.toLocaleString()}` : value, name === 'sales' ? 'Sales' : 'Leads']} />
                      <Bar dataKey="sales" fill="#8884d8" />
                      <Bar dataKey="leads" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold">₹{salesData.length > 0 ? Math.round(salesData.reduce((sum, item) => sum + item.sales, 0) / salesData.length).toLocaleString() : '0'}</div>
                  <div className="text-xs text-muted-foreground">{dateFilter === 'today' ? 'Avg/Hour' : 'Daily Avg'}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{salesData.reduce((sum, item) => sum + item.leads, 0)}</div>
                  <div className="text-xs text-muted-foreground">{dateFilter === 'today' ? 'Today Leads' : 'Total Leads'}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{salesData.reduce((sum, item) => sum + item.leads, 0) > 0 ? Math.round((salesData.reduce((sum, item) => sum + item.sales, 0) / salesData.reduce((sum, item) => sum + item.leads, 0)) * 100) / 100 : 0}%</div>
                  <div className="text-xs text-muted-foreground">Avg Sale/Lead</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medicine Categories Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Stock & Medicine Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loadingPie ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">Loading stock data...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={medicineData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {medicineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {medicineData.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-3 h-3 rounded mx-auto mb-1`} style={{ backgroundColor: item.color }}></div>
                    <div className="text-sm font-medium">{item.value?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-muted-foreground">{item.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingActivities ? (
                <div className="text-center text-muted-foreground py-4">Loading activities...</div>
              ) : recentActivities.length > 0 ? (
                recentActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="text-sm">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-muted-foreground">{activity.description}</div>
                  </div>
                ))
              ) : (
                <>
                  <div className="text-sm">
                    <div className="font-medium">Stock updated</div>
                    <div className="text-muted-foreground">Paracetamol 500mg - 2 mins ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">New sale</div>
                    <div className="text-muted-foreground">₹1,250 - 5 mins ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Low stock alert</div>
                    <div className="text-muted-foreground">Insulin - 10 mins ago</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Staff Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Staff Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={60} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingStats ? (
                <div className="text-center text-muted-foreground py-4">Loading alerts...</div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{dashboardStats.criticalStock || 0} items critically low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{dashboardStats.expiringItems || 0} items expiring soon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">₹{dashboardStats.patientCredit?.toLocaleString() || '0'} patient credit outstanding</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Branch Manager Dashboard
  if (user.role === 'branch_manager') {
    const [managerStats, setManagerStats] = useState({
      total_sales: 0,
      credit_to_receive: 0,
      credit_to_pay: 0,
      ongoing_purchase_orders: 0,
      ongoing_sales_orders: 0
    });
    const [salesOverTime, setSalesOverTime] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [staffPerformance, setStaffPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('month');

    useEffect(() => {
      const fetchManagerData = async () => {
        try {
          setLoading(true);
          const [statsRes, salesRes, paymentRes, productsRes, activitiesRes, staffRes] = await Promise.all([
            inventoryAPI.getManagerDashboardStats(dateFilter),
            inventoryAPI.getManagerSalesOverTime(),
            inventoryAPI.getManagerPaymentMethodsChart(),
            inventoryAPI.getManagerTopProducts(),
            inventoryAPI.getManagerRecentActivities(),
            inventoryAPI.getManagerStaffPerformance()
          ]);

          if (statsRes.success) setManagerStats(statsRes.data);
          if (salesRes.success) setSalesOverTime(salesRes.data);
          if (paymentRes.success) setPaymentMethods(paymentRes.data);
          if (productsRes.success) setTopProducts(productsRes.data);
          if (activitiesRes.success) setRecentActivities(activitiesRes.data);
          if (staffRes.success) setStaffPerformance(staffRes.data);
        } catch (error) {
          console.error('Failed to fetch manager dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchManagerData();
    }, [dateFilter]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-secondary-foreground" />
            <div>
              <h1 className="text-2xl font-bold">Branch Manager Dashboard</h1>
              <p className="text-muted-foreground">Complete branch operations and analytics</p>
            </div>
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{loading ? '...' : managerStats.total_sales?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This week' : dateFilter === 'month' ? 'This month' : 'This year'}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Credit to Receive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{loading ? '...' : managerStats.credit_to_receive?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Patient outstanding</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Credit to Pay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{loading ? '...' : managerStats.credit_to_pay?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Vendor outstanding</p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Purchase Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : managerStats.ongoing_purchase_orders}</div>
              <p className="text-xs text-muted-foreground">Ongoing orders</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Sales Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : managerStats.ongoing_sales_orders}</div>
              <p className="text-xs text-muted-foreground">Today's orders</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">Loading chart...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">Loading chart...</div>
                  </div>
                ) : paymentMethods.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                      >
                        {paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No payment data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-center py-4">Loading products...</div>
              ) : topProducts.length > 0 ? (
                topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.total_quantity} units sold</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{product.total_sales?.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{product.total_orders} orders</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No product data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-center py-4">Loading activities...</div>
              ) : recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-muted-foreground">{activity.description}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No recent activities</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-center py-4">Loading staff data...</div>
              ) : staffPerformance.length > 0 ? (
                staffPerformance.slice(0, 5).map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border">
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-sm text-muted-foreground">{staff.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{staff.total_sales?.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{staff.total_orders} orders</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No staff data available</div>
              )}
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
              {hasPermission('patients') && (
                <Button className="w-full justify-start" variant="outline">
                  <Pill className="w-4 h-4 mr-2" />
                  Process Prescriptions
                </Button>
              )}
              {hasPermission('inventory') && (
                <Button className="w-full justify-start" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Check Inventory
                </Button>
              )}
              {hasPermission('pos') && (
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

  // Supplier Admin Dashboard
  if (user.role === 'supplier_admin') {
    const [supplierStats, setSupplierStats] = useState({
      total_orders: 0,
      completed_orders: 0,
      total_customers: 0,
      total_sales: 0,
      credit_to_receive: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [ordersOverTime, setOrdersOverTime] = useState([]);
    const [customersChart, setCustomersChart] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchSupplierData = async () => {
        try {
          setLoading(true);
          const [statsRes, ordersRes, timeRes, customersRes, productsRes] = await Promise.all([
            inventoryAPI.getSupplierDashboardStats(),
            inventoryAPI.getSupplierRecentOrders(),
            inventoryAPI.getSupplierOrdersOverTime(),
            inventoryAPI.getSupplierCustomersChart(),
            inventoryAPI.getSupplierTopProducts()
          ]);

          if (statsRes.success) setSupplierStats(statsRes.data);
          if (ordersRes.success) setRecentOrders(ordersRes.data);
          if (timeRes.success) setOrdersOverTime(timeRes.data);
          if (customersRes.success) setCustomersChart(customersRes.data);
          if (productsRes.success) setTopProducts(productsRes.data);
        } catch (error) {
          console.error('Failed to fetch supplier dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSupplierData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
                <ShoppingCart className="w-4 h-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : supplierStats.total_orders}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : supplierStats.completed_orders}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : supplierStats.total_customers}</div>
              <p className="text-xs text-muted-foreground">Active pharmacies</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Credit to Receive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{loading ? '...' : supplierStats.credit_to_receive?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Outstanding payments</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-center py-4">Loading orders...</div>
              ) : recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border">
                    <div>
                      <div className="font-medium">{order.buyer_name}</div>
                      <div className="text-sm text-muted-foreground">Order #{order.order_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{order.total_amount?.toLocaleString()}</div>
                      <Badge variant={order.status === 'completed' ? 'default' : 'outline'} className={order.status === 'completed' ? 'bg-green-100 text-green-800' : 'text-warning border-warning'}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No recent orders</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">Loading chart...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ordersOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">Loading chart...</div>
                  </div>
                ) : customersChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customersChart}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="orders"
                        label={({ name, orders }) => `${name}: ${orders}`}
                      >
                        {customersChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No customer data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-center py-4">Loading products...</div>
              ) : topProducts.length > 0 ? (
                topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.total_orders} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{product.total_quantity} units</div>
                      <div className="text-sm text-muted-foreground">₹{product.total_value?.toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No product data available</div>
              )}
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