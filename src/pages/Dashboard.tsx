import { useState, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, Users, Package, ShoppingCart, 
  AlertTriangle, DollarSign, Activity, Clock, CheckCircle,
  Truck, Route, UserCheck, FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { NotificationCenter } from "@/components/NotificationCenter";

// Role-specific dashboard configurations
const getDashboardConfig = (role: string) => {
  const configs = {
    PHARMACY_OWNER: {
      title: "Pharmacy Owner Dashboard",
      subtitle: "Complete business overview and strategic insights",
      stats: [
        { name: "Total Revenue", value: "$124,500", change: "+12.5%", icon: DollarSign, color: "text-green-600", up: true },
        { name: "Active Customers", value: "2,847", change: "+8.2%", icon: Users, color: "text-blue-600", up: true },
        { name: "Profit Margin", value: "23.4%", change: "+2.1%", icon: TrendingUp, color: "text-purple-600", up: true },
        { name: "Staff Performance", value: "94%", change: "+3.0%", icon: Activity, color: "text-indigo-600", up: true },
      ],
      sections: ["financial", "inventory", "staff", "alerts"]
    },
    PHARMACY_MANAGER: {
      title: "Manager Dashboard",
      subtitle: "Operational oversight and team management",
      stats: [
        { name: "Daily Orders", value: "247", change: "+5.2%", icon: ShoppingCart, color: "text-green-600", up: true },
        { name: "Inventory Value", value: "$89,340", change: "-2.1%", icon: Package, color: "text-orange-600", up: false },
        { name: "Staff Online", value: "12/15", change: "80%", icon: Users, color: "text-blue-600", up: true },
        { name: "Efficiency", value: "87%", change: "+4.3%", icon: Activity, color: "text-purple-600", up: true },
      ],
      sections: ["operations", "inventory", "staff", "alerts"]
    },
    SENIOR_PHARMACIST: {
      title: "Senior Pharmacist Dashboard",
      subtitle: "Clinical oversight and prescription management",
      stats: [
        { name: "Prescriptions", value: "156", change: "+7.1%", icon: FileText, color: "text-green-600", up: true },
        { name: "Consultations", value: "43", change: "+12.3%", icon: Users, color: "text-blue-600", up: true },
        { name: "Compliance Score", value: "98%", change: "+0.5%", icon: CheckCircle, color: "text-green-600", up: true },
        { name: "Critical Alerts", value: "3", change: "-2", icon: AlertTriangle, color: "text-red-600", up: true },
      ],
      sections: ["prescriptions", "compliance", "alerts"]
    },
    PHARMACY_TECHNICIAN: {
      title: "Technician Dashboard",
      subtitle: "Daily operations and inventory management",
      stats: [
        { name: "Items Processed", value: "89", change: "+15.2%", icon: Package, color: "text-green-600", up: true },
        { name: "Orders Fulfilled", value: "34", change: "+8.7%", icon: CheckCircle, color: "text-blue-600", up: true },
        { name: "Inventory Updates", value: "127", change: "+22.1%", icon: Activity, color: "text-purple-600", up: true },
        { name: "Customer Assists", value: "18", change: "+5.9%", icon: Users, color: "text-indigo-600", up: true },
      ],
      sections: ["tasks", "inventory", "alerts"]
    },
    CASHIER: {
      title: "Cashier Dashboard",
      subtitle: "Sales transactions and customer service",
      stats: [
        { name: "Transactions", value: "67", change: "+11.2%", icon: ShoppingCart, color: "text-green-600", up: true },
        { name: "Revenue", value: "$3,247", change: "+18.5%", icon: DollarSign, color: "text-blue-600", up: true },
        { name: "Customers Served", value: "89", change: "+9.4%", icon: Users, color: "text-purple-600", up: true },
        { name: "Avg. Transaction", value: "$48.47", change: "+6.7%", icon: TrendingUp, color: "text-indigo-600", up: true },
      ],
      sections: ["sales", "customers"]
    },
    SUPPLIER_ADMIN: {
      title: "Supplier Admin Dashboard",
      subtitle: "Complete supplier portal management",
      stats: [
        { name: "Active Clients", value: "42", change: "+3", icon: Users, color: "text-green-600", up: true },
        { name: "Orders Processed", value: "186", change: "+12.4%", icon: ShoppingCart, color: "text-blue-600", up: true },
        { name: "Revenue", value: "$67,890", change: "+8.7%", icon: DollarSign, color: "text-purple-600", up: true },
        { name: "Delivery Rate", value: "96%", change: "+2.1%", icon: Truck, color: "text-indigo-600", up: true },
      ],
      sections: ["clients", "orders", "deliveries"]
    },
    SALES_MANAGER: {
      title: "Sales Manager Dashboard",
      subtitle: "Territory and client relationship management",
      stats: [
        { name: "Territory Sales", value: "$45,670", change: "+15.3%", icon: DollarSign, color: "text-green-600", up: true },
        { name: "Active Clients", value: "28", change: "+4", icon: Users, color: "text-blue-600", up: true },
        { name: "Conversion Rate", value: "67%", change: "+5.2%", icon: TrendingUp, color: "text-purple-600", up: true },
        { name: "Pipeline Value", value: "$78,920", change: "+22.1%", icon: Activity, color: "text-indigo-600", up: true },
      ],
      sections: ["territory", "clients", "performance"]
    },
    ACCOUNT_REPRESENTATIVE: {
      title: "Account Representative Dashboard",
      subtitle: "Client management and order processing",
      stats: [
        { name: "Assigned Clients", value: "15", change: "+2", icon: Users, color: "text-green-600", up: true },
        { name: "Orders Managed", value: "73", change: "+18.9%", icon: ShoppingCart, color: "text-blue-600", up: true },
        { name: "Client Satisfaction", value: "92%", change: "+3.4%", icon: CheckCircle, color: "text-purple-600", up: true },
        { name: "Response Time", value: "1.2h", change: "-0.3h", icon: Clock, color: "text-green-600", up: true },
      ],
      sections: ["clients", "orders", "support"]
    },
    DELIVERY_COORDINATOR: {
      title: "Delivery Coordinator Dashboard",
      subtitle: "Route planning and delivery management",
      stats: [
        { name: "Active Routes", value: "8", change: "+1", icon: Route, color: "text-green-600", up: true },
        { name: "Deliveries Today", value: "47", change: "+12.7%", icon: Truck, color: "text-blue-600", up: true },
        { name: "On-Time Rate", value: "94%", change: "+2.8%", icon: CheckCircle, color: "text-purple-600", up: true },
        { name: "Drivers Active", value: "6/8", change: "75%", icon: UserCheck, color: "text-indigo-600", up: true },
      ],
      sections: ["routes", "deliveries", "drivers"]
    },
  };

  return configs[role as keyof typeof configs] || configs.CASHIER;
};

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const config = getDashboardConfig(currentUser.role);

  const renderSection = (section: string) => {
    switch (section) {
      case "financial":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Revenue and profit analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Monthly Revenue</span>
                  <span className="font-semibold text-green-600">$124,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Operating Costs</span>
                  <span className="font-semibold text-red-600">$95,300</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Net Profit</span>
                  <span className="font-semibold text-blue-600">$29,200</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "operations":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Daily Operations</CardTitle>
              <CardDescription>Today's operational metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Orders Processed</span>
                  <Badge variant="secondary">247</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Returns Handled</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Inventory Updates</span>
                  <Badge variant="secondary">89</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "prescriptions":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Prescription Management</CardTitle>
              <CardDescription>Clinical oversight dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Pending Reviews</span>
                  <Badge variant="destructive">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Approved Today</span>
                  <Badge variant="secondary">156</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Consultations</span>
                  <Badge variant="outline">43</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "sales":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Today's Sales</CardTitle>
              <CardDescription>Transaction summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Transactions</span>
                  <span className="font-semibold">67</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cash Sales</span>
                  <span className="font-semibold">$1,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Card Sales</span>
                  <span className="font-semibold">$1,400</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "inventory":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Stock levels and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Low Stock Items</span>
                  <Badge variant="destructive">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Expiring Soon</span>
                  <Badge variant="outline">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Out of Stock</span>
                  <Badge variant="destructive">3</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "alerts":
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>3 medications expire within 7 days</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>Low stock: Acetaminophen 500mg</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>System backup completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground mt-2">{config.subtitle}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {currentUser.name} • {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {config.stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs flex items-center ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {stat.change} from yesterday
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {config.sections.map((section) => (
          <div key={section}>
            {renderSection(section)}
          </div>
        ))}
      </div>

      {/* Add Analytics Section for All Roles */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Analytics & Insights</h2>
          <NotificationCenter />
        </div>
        <DashboardAnalytics />
      </div>
    </div>
  );
}