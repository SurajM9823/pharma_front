import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Download, Calendar, TrendingUp, 
  DollarSign, BarChart3, PieChart, FileSpreadsheet
} from "lucide-react";

const monthlyData = [
  { month: "Jan", amount: 4500, transactions: 45 },
  { month: "Feb", amount: 3800, transactions: 38 },
  { month: "Mar", amount: 5200, transactions: 52 },
  { month: "Apr", amount: 4100, transactions: 41 },
  { month: "May", amount: 4800, transactions: 48 },
  { month: "Jun", amount: 5500, transactions: 55 },
];

const categoryData = [
  { category: "Office Supplies", amount: 8900, percentage: 32 },
  { category: "Medical Equipment", amount: 7200, percentage: 26 },
  { category: "Marketing", amount: 4800, percentage: 17 },
  { category: "Utilities", amount: 3500, percentage: 13 },
  { category: "Travel", amount: 2100, percentage: 8 },
  { category: "Other", amount: 1100, percentage: 4 },
];

const recentExpenses = [
  {
    id: "EXP-156",
    category: "Office Supplies",
    amount: 234.50,
    date: "2024-01-13",
    status: "approved",
    submittedBy: "John Doe"
  },
  {
    id: "EXP-155",
    category: "Medical Equipment", 
    amount: 1250.00,
    date: "2024-01-12",
    status: "approved",
    submittedBy: "Jane Smith"
  },
  {
    id: "EXP-154",
    category: "Marketing",
    amount: 456.75,
    date: "2024-01-11",
    status: "pending",
    submittedBy: "Mike Wilson"
  },
  {
    id: "EXP-153",
    category: "Utilities",
    amount: 890.00,
    date: "2024-01-10",
    status: "approved",
    submittedBy: "Sarah Johnson"
  },
];

export default function ExpenseReports() {
  const [dateRange, setDateRange] = useState({ from: "2024-01-01", to: "2024-01-31" });
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expense Reports</h2>
          <p className="text-muted-foreground">Analyze spending patterns and generate reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <FileSpreadsheet size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="bg-card border border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Date Range:</span>
              <Input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="w-40"
              />
              <span className="text-muted-foreground">to</span>
              <Input 
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Category:</span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Categories</option>
                <option value="office">Office Supplies</option>
                <option value="medical">Medical Equipment</option>
                <option value="marketing">Marketing</option>
                <option value="utilities">Utilities</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</p>
              </div>
              <DollarSign className="text-primary" size={24} />
            </div>
            <p className="text-xs text-success mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">
                  ${monthlyData[monthlyData.length - 1]?.amount.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="text-success" size={24} />
            </div>
            <p className="text-xs text-warning mt-1">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. per Transaction</p>
                <p className="text-2xl font-bold text-foreground">
                  ${Math.round(totalExpenses / monthlyData.reduce((sum, m) => sum + m.transactions, 0))}
                </p>
              </div>
              <BarChart3 className="text-warning" size={24} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on recent data</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-foreground">{categoryData.length}</p>
              </div>
              <PieChart className="text-primary" size={24} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <BarChart3 className="mr-2 text-primary" size={20} />
              Monthly Expense Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-12 text-sm text-muted-foreground">{data.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${(data.amount / Math.max(...monthlyData.map(m => m.amount))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">${data.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{data.transactions} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <PieChart className="mr-2 text-success" size={20} />
              Expense by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3`} 
                         style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                    <span className="text-sm text-foreground">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">${category.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses Table */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Expense ID</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Submitted By</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-border hover:bg-panel transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-primary">{expense.id}</p>
                    </td>
                    <td className="py-3 px-4 text-foreground">{expense.category}</td>
                    <td className="py-3 px-4 font-medium text-foreground">${expense.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-foreground">{expense.date}</td>
                    <td className="py-3 px-4 text-foreground">{expense.submittedBy}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(expense.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}