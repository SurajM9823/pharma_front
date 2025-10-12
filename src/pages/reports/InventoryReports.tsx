import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { 
  ArrowLeft, Download, Filter, Calendar,
  Package, AlertTriangle, TrendingDown, TrendingUp,
  Clock, DollarSign, RefreshCw, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const inventoryData = [
  { month: "Jan", stockValue: 145000, turnover: 4.2, incoming: 25000, outgoing: 32000 },
  { month: "Feb", stockValue: 152000, turnover: 3.8, incoming: 28000, outgoing: 35000 },
  { month: "Mar", stockValue: 138000, turnover: 4.5, incoming: 22000, outgoing: 38000 },
  { month: "Apr", stockValue: 165000, turnover: 3.9, incoming: 31000, outgoing: 29000 },
  { month: "May", stockValue: 158000, turnover: 4.1, incoming: 27000, outgoing: 33000 },
  { month: "Jun", stockValue: 172000, turnover: 4.3, incoming: 35000, outgoing: 36000 }
];

const expiryData = [
  { month: "Jul", expiring: 12, expired: 3, value: 8500 },
  { month: "Aug", expiring: 18, expired: 5, value: 12300 },
  { month: "Sep", expiring: 25, expired: 8, value: 15600 },
  { month: "Oct", expiring: 22, expired: 6, value: 13900 },
  { month: "Nov", expiring: 15, expired: 4, value: 9800 },
  { month: "Dec", expiring: 28, expired: 9, value: 18200 }
];

const lowStockItems = [
  { name: "Ibuprofen 400mg", current: 45, minimum: 100, status: "critical", category: "Pain Relief" },
  { name: "Vitamin B12", current: 78, minimum: 150, status: "low", category: "Vitamins" },
  { name: "Insulin Pens", current: 12, minimum: 50, status: "critical", category: "Diabetes" },
  { name: "Blood Test Strips", current: 89, minimum: 200, status: "low", category: "Testing" },
  { name: "Thermometer Digital", current: 8, minimum: 25, status: "critical", category: "Equipment" }
];

const topMovingItems = [
  { name: "Paracetamol 500mg", movement: 450, trend: "+12%", value: 15600 },
  { name: "Vitamin D3", movement: 380, trend: "+8%", value: 12400 },
  { name: "Amoxicillin", movement: 220, trend: "+15%", value: 18900 },
  { name: "Face Masks", movement: 680, trend: "+25%", value: 8900 },
  { name: "Hand Sanitizer", movement: 520, trend: "+18%", value: 11200 }
];

const inventoryMetrics = [
  { label: "Total Stock Value", value: "$172,000", change: "+8.9%", trend: "up", icon: DollarSign },
  { label: "Inventory Turnover", value: "4.3x", change: "+0.2", trend: "up", icon: RefreshCw },
  { label: "Low Stock Items", value: "23", change: "-3", trend: "down", icon: AlertTriangle },
  { label: "Expiring Soon", value: "28", change: "+5", trend: "up", icon: Clock }
];

const chartConfig = {
  stockValue: {
    label: "Stock Value",
    color: "hsl(var(--primary))",
  },
  turnover: {
    label: "Turnover",
    color: "hsl(var(--success))",
  },
  incoming: {
    label: "Incoming",
    color: "hsl(var(--warning))",
  },
  outgoing: {
    label: "Outgoing",
    color: "hsl(var(--destructive))",
  },
};

export default function InventoryReports() {
  const navigate = useNavigate();

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-destructive';
      case 'low': return 'text-warning';
      default: return 'text-success';
    }
  };

  const getStockStatusVariant = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/reports')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Reports
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Inventory Reports</h2>
            <p className="text-muted-foreground">Stock management and movement analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar size={16} className="mr-2" />
            Date Range
          </Button>
          <Button className="bg-primary hover:bg-primary-hover">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {inventoryMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className={`text-xs flex items-center mt-1 ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {metric.trend === 'up' ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                    {metric.change} from last month
                  </p>
                </div>
                <metric.icon className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-panel">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="movement">Movement</TabsTrigger>
          <TabsTrigger value="expiry">Expiry Tracking</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Value Trend */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Stock Value Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={inventoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="stockValue" stroke="var(--color-stockValue)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Inventory Turnover */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Inventory Turnover Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="turnover" fill="var(--color-turnover)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movement" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Stock Movement */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Stock Movement Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="incoming" fill="var(--color-incoming)" />
                      <Bar dataKey="outgoing" fill="var(--color-outgoing)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top Moving Items */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Fast Moving Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topMovingItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-4 bg-panel rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-panel-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.movement} units moved</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-panel-foreground">${item.value.toLocaleString()}</p>
                        <Badge variant="secondary" className="text-success">
                          {item.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expiry" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Expiry Tracking */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Expiry Tracking Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expiryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="expiring" fill="hsl(var(--warning))" />
                      <Bar dataKey="expired" fill="hsl(var(--destructive))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Expiry Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="mx-auto text-warning mb-2" size={32} />
                    <p className="text-2xl font-bold text-foreground">28</p>
                    <p className="text-sm text-muted-foreground">Expiring This Month</p>
                    <p className="text-xs text-warning mt-1">Value: $18,200</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertCircle className="mx-auto text-destructive mb-2" size={32} />
                    <p className="text-2xl font-bold text-foreground">9</p>
                    <p className="text-sm text-muted-foreground">Already Expired</p>
                    <p className="text-xs text-destructive mt-1">Loss: $3,400</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingDown className="mx-auto text-success mb-2" size={32} />
                    <p className="text-2xl font-bold text-foreground">2.1%</p>
                    <p className="text-sm text-muted-foreground">Waste Reduction</p>
                    <p className="text-xs text-success mt-1">vs Last Month</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Low Stock Alerts */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <AlertTriangle className="mr-2 text-warning" size={20} />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-4 bg-panel rounded-lg border-l-4 border-destructive">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className={getStockStatusColor(item.status)} size={20} />
                      <div>
                        <p className="font-medium text-panel-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right space-x-4 flex items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Current: {item.current}</p>
                        <p className="text-sm text-muted-foreground">Minimum: {item.minimum}</p>
                      </div>
                      <Badge variant={getStockStatusVariant(item.status)}>
                        {item.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reorder Recommendations */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Reorder Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Ibuprofen 400mg", supplier: "MedSupply Co", leadTime: "3-5 days", suggestedQty: 500, cost: 1250 },
                  { name: "Insulin Pens", supplier: "DiabetesCare", leadTime: "7-10 days", suggestedQty: 100, cost: 2800 },
                  { name: "Thermometer Digital", supplier: "HealthTech", leadTime: "2-3 days", suggestedQty: 50, cost: 890 }
                ].map((item) => (
                  <div key={item.name} className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Supplier: {item.supplier}</p>
                        <p className="text-sm text-muted-foreground">Lead Time: {item.leadTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">Qty: {item.suggestedQty}</p>
                        <p className="text-sm text-muted-foreground">Cost: ${item.cost}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Create PO
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}