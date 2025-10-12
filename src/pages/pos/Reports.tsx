import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { 
  TrendingUp, DollarSign, ShoppingCart, Users, 
  Calendar, Download, FileText, BarChart3,
  Clock, CreditCard, Percent, Package
} from "lucide-react";

// Mock data for reports
const dailySalesData = [
  { date: "2024-01-15", sales: 15420, transactions: 87, customers: 62 },
  { date: "2024-01-14", sales: 18350, transactions: 94, customers: 71 },
  { date: "2024-01-13", sales: 12890, transactions: 76, customers: 58 },
  { date: "2024-01-12", sales: 21450, transactions: 108, customers: 85 },
  { date: "2024-01-11", sales: 16780, transactions: 89, customers: 67 },
  { date: "2024-01-10", sales: 19220, transactions: 102, customers: 78 },
  { date: "2024-01-09", sales: 14560, transactions: 81, customers: 61 },
];

const topProducts = [
  { name: "Paracetamol 500mg", sold: 156, revenue: 3990, profit: 1596 },
  { name: "Ibuprofen 400mg", sold: 89, revenue: 4005, profit: 1602 },
  { name: "Cough Syrup", sold: 67, revenue: 8040, profit: 2412 },
  { name: "Vitamin C 1000mg", sold: 45, revenue: 8100, profit: 2430 },
  { name: "Hand Sanitizer", sold: 78, revenue: 6630, profit: 1989 },
];

const paymentMethodData = [
  { name: "Cash", value: 68, amount: 45280 },
  { name: "Card", value: 25, amount: 16650 },
  { name: "Digital Wallet", value: 7, amount: 4660 },
];

const hourlySalesData = [
  { hour: "9 AM", sales: 1250 },
  { hour: "10 AM", sales: 2890 },
  { hour: "11 AM", sales: 3650 },
  { hour: "12 PM", sales: 4200 },
  { hour: "1 PM", sales: 2980 },
  { hour: "2 PM", sales: 3450 },
  { hour: "3 PM", sales: 4100 },
  { hour: "4 PM", sales: 3780 },
  { hour: "5 PM", sales: 2650 },
  { hour: "6 PM", sales: 1890 },
];

const cashierPerformance = [
  { name: "Ram Sharma", transactions: 156, sales: 45890, avgTransaction: 294 },
  { name: "Sita Thapa", transactions: 134, sales: 38920, avgTransaction: 290 },
  { name: "Hari Poudel", transactions: 98, sales: 28450, avgTransaction: 290 },
  { name: "Gita Rai", transactions: 87, sales: 24680, avgTransaction: 284 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function POSReports() {
  const [dateRange, setDateRange] = useState("7days");
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const totalSales = dailySalesData.reduce((sum, day) => sum + day.sales, 0);
  const totalTransactions = dailySalesData.reduce((sum, day) => sum + day.transactions, 0);
  const avgTransactionValue = totalSales / totalTransactions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <BarChart3 className="mr-2 text-primary" />
            POS Reports & Analytics
          </h2>
          <p className="text-muted-foreground">Comprehensive sales analytics and performance metrics</p>
        </div>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-foreground">NPR {totalSales.toLocaleString()}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +12.5% from last week
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +8.3% from last week
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold text-foreground">NPR {avgTransactionValue.toFixed(0)}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +3.8% from last week
                </p>
              </div>
              <Percent className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Customers</p>
                <p className="text-2xl font-bold text-foreground">485</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +15.2% from last week
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Trend */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Daily Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))'
                      }} 
                    />
                    <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hourly Sales Pattern */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Hourly Sales Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))'
                      }} 
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Package className="mr-2" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.name}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sold}</TableCell>
                      <TableCell>NPR {product.revenue.toLocaleString()}</TableCell>
                      <TableCell>NPR {product.profit.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={index < 2 ? "default" : "secondary"}>
                          {index < 2 ? "Excellent" : "Good"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <CreditCard className="mr-2" />
                  Payment Method Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Payment Method Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethodData.map((method, index) => (
                    <div key={method.name} className="flex items-center justify-between p-3 border border-border rounded">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-foreground">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">NPR {method.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{method.value}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Users className="mr-2" />
                Cashier Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cashier Name</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Avg Transaction</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashierPerformance.map((cashier, index) => (
                    <TableRow key={cashier.name}>
                      <TableCell className="font-medium">{cashier.name}</TableCell>
                      <TableCell>{cashier.transactions}</TableCell>
                      <TableCell>NPR {cashier.sales.toLocaleString()}</TableCell>
                      <TableCell>NPR {cashier.avgTransaction}</TableCell>
                      <TableCell>
                        <Badge variant={index === 0 ? "default" : index < 2 ? "secondary" : "outline"}>
                          {index === 0 ? "Top Performer" : index < 2 ? "Good" : "Average"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Customer Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border border-border rounded">
                  <span className="text-foreground">New Customers (This Week)</span>
                  <span className="font-bold text-primary">47</span>
                </div>
                <div className="flex justify-between items-center p-3 border border-border rounded">
                  <span className="text-foreground">Returning Customers</span>
                  <span className="font-bold text-primary">438</span>
                </div>
                <div className="flex justify-between items-center p-3 border border-border rounded">
                  <span className="text-foreground">Average Purchase Value</span>
                  <span className="font-bold text-primary">NPR 294</span>
                </div>
                <div className="flex justify-between items-center p-3 border border-border rounded">
                  <span className="text-foreground">Customer Retention Rate</span>
                  <span className="font-bold text-success">78.5%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Purchase Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Daily Visitors</span>
                    <span className="font-bold text-primary">85-120</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Weekly Regulars</span>
                    <span className="font-bold text-primary">45-60</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Monthly Customers</span>
                    <span className="font-bold text-primary">25-35</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">One-time Buyers</span>
                    <span className="font-bold text-muted-foreground">15-25</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}