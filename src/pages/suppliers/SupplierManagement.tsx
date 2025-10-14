import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Plus, Edit, Eye, Trash2, UserCog, 
  Building, Phone, Mail, MapPin, Star, DollarSign, Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavLink } from "react-router-dom";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [paymentSummary, setPaymentSummary] = useState({ totalCredit: 0, totalSuppliers: 0 });
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      // Fetch suppliers with transaction history from ledger (branch-specific)
      const ledgerSuppliersResponse = await fetch(`${API_BASE_URL}/inventory/supplier-ledger/suppliers/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      // Fetch registered suppliers with transaction history only
      const suppliersResponse = await fetch(`${API_BASE_URL}/auth/users/?role=supplier_admin&has_transactions=true`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      // Fetch payment summary
      const summaryResponse = await fetch(`${API_BASE_URL}/inventory/supplier-ledger/summary/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      let allSuppliers = [];
      
      // Get both responses
      let ledgerSuppliers = [];
      let registeredSuppliersList = [];
      
      if (ledgerSuppliersResponse.ok) {
        ledgerSuppliers = await ledgerSuppliersResponse.json();
      }
      
      if (suppliersResponse.ok) {
        const registeredSuppliers = await suppliersResponse.json();
        registeredSuppliersList = registeredSuppliers.results || [];
      }
      
      // Use a Map to avoid duplicates based on supplier ID
      const suppliersMap = new Map();
      
      // Process each ledger supplier and avoid duplicates
      ledgerSuppliers.forEach(ledgerSupplier => {
        const supplierName = ledgerSupplier.supplier_name;
        
        // Try to find matching registered supplier
        const matchingRegisteredSupplier = registeredSuppliersList.find(supplier => {
          const fullName = `${supplier.first_name} ${supplier.last_name}`.trim();
          return fullName === supplierName || supplier.organization_name === supplierName;
        });
        
        if (matchingRegisteredSupplier) {
          // Add as pharmacy supplier (registered user) - use supplier ID as key
          const supplierId = matchingRegisteredSupplier.id;
          if (!suppliersMap.has(supplierId)) {
            suppliersMap.set(supplierId, {
              ...matchingRegisteredSupplier,
              supplier_type: 'pharmacy',
              total_credit: ledgerSupplier.total_credit,
              pending_credit: ledgerSupplier.pending_credit
            });
          }
        } else {
          // Add as custom supplier (no registered user found)
          const customId = `custom_${supplierName.replace(/\s+/g, '_')}`;
          if (!suppliersMap.has(customId)) {
            suppliersMap.set(customId, {
              id: customId,
              first_name: supplierName.split(' ')[0] || '',
              last_name: supplierName.split(' ').slice(1).join(' ') || '',
              organization_name: supplierName,
              email: 'N/A',
              phone: 'N/A',
              supplier_type: 'custom',
              is_active: true,
              total_credit: ledgerSupplier.total_credit,
              pending_credit: ledgerSupplier.pending_credit
            });
          }
        }
      });
      
      // Convert Map values to array
      allSuppliers = Array.from(suppliersMap.values());
      
      console.log('Final suppliers list:', allSuppliers);
      setSuppliers(allSuppliers);
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setPaymentSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to load suppliers with transaction history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.branch_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || 
      (filterType === "organization" && supplier.organization_name) ||
      (filterType === "branch" && supplier.branch_name) ||
      (filterType === "name" && (supplier.first_name || supplier.last_name));
    
    const matchesTab = activeTab === "all" ||
      (activeTab === "pharmacy" && supplier.supplier_type === "pharmacy") ||
      (activeTab === "custom" && supplier.supplier_type === "custom");
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const pharmacySuppliers = suppliers.filter(s => s.supplier_type === "pharmacy");
  const customSuppliers = suppliers.filter(s => s.supplier_type === "custom");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Supplier Management</h1>
          <p className="text-muted-foreground">Manage suppliers with transaction history for your branch</p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCog className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{suppliers.length}</p>
                <p className="text-xs text-muted-foreground">Total Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold">{pharmacySuppliers.length}</p>
                <p className="text-xs text-muted-foreground">Pharmacy Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{customSuppliers.length}</p>
                <p className="text-xs text-muted-foreground">Custom Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-lg font-bold">NPR {paymentSummary.totalCredit?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">Total Pending Credit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers by name, organization, branch, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  <SelectItem value="organization">By Organization</SelectItem>
                  <SelectItem value="branch">By Branch</SelectItem>
                  <SelectItem value="name">By Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table with Tabs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Suppliers ({filteredSuppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 border border-border rounded-lg p-1 h-8">
              <TabsTrigger value="all" className="text-xs h-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">All ({suppliers.length})</TabsTrigger>
              <TabsTrigger value="pharmacy" className="text-xs h-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Pharmacy ({pharmacySuppliers.length})</TabsTrigger>
              <TabsTrigger value="custom" className="text-xs h-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Custom ({customSuppliers.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-2">
              <SupplierTable suppliers={filteredSuppliers} loading={loading} />
            </TabsContent>
            
            <TabsContent value="pharmacy" className="mt-2">
              <SupplierTable suppliers={filteredSuppliers} loading={loading} />
            </TabsContent>
            
            <TabsContent value="custom" className="mt-2">
              <SupplierTable suppliers={filteredSuppliers} loading={loading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Supplier Table Component
function SupplierTable({ suppliers, loading }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="text-xs font-medium py-2">Name</TableHead>
            <TableHead className="text-xs font-medium py-2">Organization</TableHead>
            <TableHead className="text-xs font-medium py-2">Branch</TableHead>
            <TableHead className="text-xs font-medium py-2">Contact</TableHead>
            <TableHead className="text-xs font-medium py-2">Type</TableHead>
            <TableHead className="text-xs font-medium py-2">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-xs">
                Loading suppliers...
              </TableCell>
            </TableRow>
          ) : suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-xs">
                No suppliers found
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="border-b hover:bg-muted/50">
                <TableCell className="py-2">
                  <div>
                    <NavLink to={`/suppliers/detail/${supplier.id}`} className="text-xs font-medium text-blue-600 hover:underline">
                      {supplier.organization_name || `${supplier.first_name} ${supplier.last_name}`}
                    </NavLink>
                    <p className="text-xs text-muted-foreground">{supplier.email}</p>
                  </div>
                </TableCell>
                <TableCell className="py-2 text-xs">{supplier.organization_name || 'N/A'}</TableCell>
                <TableCell className="py-2 text-xs">{supplier.branch_name || 'N/A'}</TableCell>
                <TableCell className="py-2">
                  <div className="space-y-1">
                    {supplier.phone && (
                      <div className="flex items-center gap-1 text-xs">
                        <Phone size={10} />
                        {supplier.phone}
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-1 text-xs">
                        <Mail size={10} />
                        {supplier.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant={supplier.supplier_type === "pharmacy" ? "default" : "secondary"} className="text-xs px-2 py-0">
                    {supplier.supplier_type || "Custom"}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant={supplier.is_active ? "default" : "secondary"} className="text-xs px-2 py-0">
                    {supplier.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}