import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/hooks/useSearch";
import { 
  Search, Plus, Edit, Trash2, Tag, 
  DollarSign, TrendingUp, Calculator
} from "lucide-react";

const categoriesData = [
  {
    id: "1",
    name: "Office Supplies",
    description: "Paper, pens, printing materials",
    budget: 2000,
    spent: 1450,
    transactions: 23,
    color: "blue",
    isActive: true,
  },
  {
    id: "2", 
    name: "Medical Equipment",
    description: "Thermometers, blood pressure monitors",
    budget: 5000,
    spent: 3200,
    transactions: 8,
    color: "green",
    isActive: true,
  },
  {
    id: "3",
    name: "Marketing",
    description: "Advertising, promotional materials",
    budget: 1500,
    spent: 890,
    transactions: 12,
    color: "purple",
    isActive: true,
  },
  {
    id: "4",
    name: "Utilities",
    description: "Electricity, water, internet",
    budget: 3000,
    spent: 2750,
    transactions: 6,
    color: "orange",
    isActive: true,
  },
];

export default function ExpenseCategories() {
  const [showForm, setShowForm] = useState(false);
  
  const { 
    searchTerm, 
    setSearchTerm, 
    filteredData: filteredCategories 
  } = useSearch({
    data: categoriesData,
    searchFields: ["name", "description"],
  });

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return { variant: "destructive", label: "Over Budget" };
    if (percentage >= 75) return { variant: "secondary", label: "High Usage" };
    return { variant: "default", label: "On Track" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expense Categories</h2>
          <p className="text-muted-foreground">Manage and organize expense categories</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold text-foreground">{categoriesData.length}</p>
              </div>
              <Tag className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">
                  ${categoriesData.reduce((sum, cat) => sum + cat.budget, 0).toLocaleString()}
                </p>
              </div>
              <Calculator className="text-success" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">
                  ${categoriesData.reduce((sum, cat) => sum + cat.spent, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-warning" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Usage</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((categoriesData.reduce((sum, cat) => sum + (cat.spent/cat.budget), 0) / categoriesData.length) * 100)}%
                </p>
              </div>
              <TrendingUp className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const budgetStatus = getBudgetStatus(category.spent, category.budget);
          const usagePercentage = Math.round((category.spent / category.budget) * 100);
          
          return (
            <Card key={category.id} className="bg-card border border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-card-foreground flex items-center">
                      <div className={`w-3 h-3 rounded-full bg-${category.color}-500 mr-2`}></div>
                      {category.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  </div>
                  <Badge variant={budgetStatus.variant as any}>
                    {budgetStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Budget Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Budget Usage</span>
                      <span className="text-foreground">{usagePercentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          usagePercentage >= 90 ? 'bg-destructive' : 
                          usagePercentage >= 75 ? 'bg-warning' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium text-foreground">${category.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Spent</p>
                      <p className="font-medium text-foreground">${category.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-medium text-foreground">${(category.budget - category.spent).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Transactions</p>
                      <p className="font-medium text-foreground">{category.transactions}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <Button variant="outline" size="sm">
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}