import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, Plus, RotateCcw, AlertTriangle, 
  Calendar, DollarSign, Package, FileText
} from "lucide-react";

const returnsData = [
  {
    id: "RET-001",
    originalSale: "SALE-1234",
    customerName: "John Doe",
    customerPhone: "(555) 123-4567",
    products: [
      { name: "Ibuprofen 400mg", quantity: 2, price: 8.99, reason: "Expired" },
      { name: "Vitamin D3", quantity: 1, price: 15.99, reason: "Wrong product" }
    ],
    totalAmount: 33.97,
    refundAmount: 33.97,
    status: "Pending",
    date: "2024-01-13",
    processedBy: "Sarah Wilson",
    notes: "Customer received wrong dosage, full refund approved"
  },
  {
    id: "RET-002", 
    originalSale: "SALE-1235",
    customerName: "Jane Smith",
    customerPhone: "(555) 234-5678",
    products: [
      { name: "Blood Pressure Monitor", quantity: 1, price: 45.00, reason: "Defective" }
    ],
    totalAmount: 45.00,
    refundAmount: 45.00,
    status: "Completed",
    date: "2024-01-12",
    processedBy: "Mike Johnson",
    notes: "Device not working properly, exchanged for new unit"
  },
  {
    id: "RET-003",
    originalSale: "SALE-1236", 
    customerName: "Bob Wilson",
    customerPhone: "(555) 345-6789",
    products: [
      { name: "Amoxicillin 500mg", quantity: 1, price: 12.50, reason: "Allergic reaction" }
    ],
    totalAmount: 12.50,
    refundAmount: 12.50,
    status: "Rejected",
    date: "2024-01-11",
    processedBy: "Dr. Johnson",
    notes: "Return rejected - medication already opened and partially used"
  }
];

const recentSales = [
  { id: "SALE-1240", customer: "Alice Brown", total: 67.89, date: "2024-01-13", items: 3 },
  { id: "SALE-1239", customer: "Tom Davis", total: 23.45, date: "2024-01-13", items: 2 },
  { id: "SALE-1238", customer: "Lisa Garcia", total: 156.78, date: "2024-01-12", items: 5 },
  { id: "SALE-1237", customer: "James Miller", total: 89.90, date: "2024-01-12", items: 4 }
];

export default function Returns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [newReturn, setNewReturn] = useState({
    reason: "",
    notes: "",
    refundAmount: 0
  });
  const [showNewReturnForm, setShowNewReturnForm] = useState(false);

  const filteredReturns = returnsData.filter(returnItem =>
    returnItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.originalSale.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const variants = {
      "Pending": "secondary",
      "Completed": "default", 
      "Rejected": "destructive"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handleProcessReturn = (returnId, action) => {
    alert(`Return ${returnId} ${action}`);
  };

  const startNewReturn = (sale) => {
    setSelectedSale(sale);
    setNewReturn({
      reason: "",
      notes: "",
      refundAmount: sale.total
    });
    setShowNewReturnForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Returns Management</h2>
          <p className="text-muted-foreground">Process customer returns and refunds</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-hover"
          onClick={() => setShowNewReturnForm(true)}
        >
          <Plus size={16} className="mr-2" />
          New Return
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold text-foreground">{returnsData.length}</p>
              </div>
              <RotateCcw className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">
                  {returnsData.filter(r => r.status === "Pending").length}
                </p>
              </div>
              <AlertTriangle className="text-warning" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refund Amount</p>
                <p className="text-2xl font-bold text-destructive">
                  ${returnsData.filter(r => r.status === "Completed").reduce((sum, r) => sum + r.refundAmount, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-destructive" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">
                  {returnsData.filter(r => r.status === "Completed").length}
                </p>
              </div>
              <Package className="text-success" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Returns List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-card-foreground">Return Requests</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search returns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReturns.map((returnItem) => (
                  <div key={returnItem.id} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{returnItem.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          Original Sale: {returnItem.originalSale}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Customer: {returnItem.customerName}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(returnItem.status)}
                        <p className="text-sm text-muted-foreground mt-1">
                          <Calendar size={12} className="inline mr-1" />
                          {returnItem.date}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      {returnItem.products.map((product, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-panel rounded">
                          <span className="text-panel-foreground">{product.quantity}x {product.name}</span>
                          <div className="text-right">
                            <span className="font-medium text-panel-foreground">${(product.quantity * product.price).toFixed(2)}</span>
                            <p className="text-xs text-muted-foreground">{product.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div>
                        <p className="text-sm text-foreground">
                          <span className="font-medium">Refund Amount: ${returnItem.refundAmount.toFixed(2)}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Processed by: {returnItem.processedBy}
                        </p>
                      </div>
                      {returnItem.status === "Pending" && (
                        <div className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleProcessReturn(returnItem.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleProcessReturn(returnItem.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>

                    {returnItem.notes && (
                      <div className="mt-3 p-2 bg-panel rounded text-sm">
                        <p className="text-panel-foreground">{returnItem.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Return / Recent Sales */}
        <div className="space-y-4">
          {showNewReturnForm ? (
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  {selectedSale ? `Return for ${selectedSale.id}` : "New Return"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSale && (
                  <div className="p-3 bg-panel rounded">
                    <p className="font-medium text-panel-foreground">Sale: {selectedSale.id}</p>
                    <p className="text-sm text-muted-foreground">Customer: {selectedSale.customer}</p>
                    <p className="text-sm text-muted-foreground">Total: ${selectedSale.total}</p>
                    <p className="text-sm text-muted-foreground">Items: {selectedSale.items}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-foreground">Return Reason</label>
                  <Input
                    placeholder="e.g., Defective, Wrong item, Expired"
                    value={newReturn.reason}
                    onChange={(e) => setNewReturn({...newReturn, reason: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Refund Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newReturn.refundAmount}
                    onChange={(e) => setNewReturn({...newReturn, refundAmount: parseFloat(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Notes</label>
                  <Textarea
                    placeholder="Additional notes about the return"
                    value={newReturn.notes}
                    onChange={(e) => setNewReturn({...newReturn, notes: e.target.value})}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      alert("Return processed successfully!");
                      setShowNewReturnForm(false);
                      setSelectedSale(null);
                    }}
                  >
                    Process Return
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowNewReturnForm(false);
                      setSelectedSale(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <FileText className="mr-2" size={18} />
                  Recent Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="p-3 border border-border rounded hover:bg-panel transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-foreground">{sale.id}</p>
                          <p className="text-sm text-muted-foreground">{sale.customer}</p>
                          <p className="text-xs text-muted-foreground">{sale.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">${sale.total}</p>
                          <p className="text-xs text-muted-foreground">{sale.items} items</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-1"
                            onClick={() => startNewReturn(sale)}
                          >
                            Return
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}