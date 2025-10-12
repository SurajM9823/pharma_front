import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { inventoryAPI, Category, Manufacturer } from "@/services/api";
import { useAppStore } from "@/store/appStore";
import {
  Package, AlertTriangle, RotateCw, Bell,
  Save, Settings, Calendar, DollarSign, Plus, Edit, Trash2
} from "lucide-react";

export default function InventorySettings() {
  const [settings, setSettings] = useState({
    // Stock Management
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    autoReorder: true,
    reorderQuantity: 50,

    // Expiry Management
    expiryWarningDays: 30,
    criticalExpiryDays: 7,
    enableExpiryAlerts: true,
    removeExpiredFromSales: true,

    // Cost Settings
    defaultMarkupPercent: 25,
    allowNegativeStock: false,
    trackLotNumbers: true,
    requireApprovalForOrders: true,

    // Notifications
    stockAlerts: true,
    expiryAlerts: true,
    orderAlerts: true,
    emailNotifications: false,
  });

  // Category and Manufacturer management
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isManufacturerDialogOpen, setIsManufacturerDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAppStore();

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    parent: "",
    is_active: true
  });

  const [manufacturerForm, setManufacturerForm] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    license_number: "",
    is_active: true
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, manufacturersResponse] = await Promise.all([
        inventoryAPI.getCategories(),
        inventoryAPI.getManufacturers()
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }
      if (manufacturersResponse.success) {
        setManufacturers(manufacturersResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load categories and manufacturers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleInputChange = (key: string, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Category handlers
  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description,
        parent: categoryForm.parent || null,
        is_active: categoryForm.is_active,
        organization: 1
      };

      const response = await inventoryAPI.createCategory(categoryData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Category added successfully"
        });
        setIsCategoryDialogOpen(false);
        resetCategoryForm();
        loadData();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add category",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      parent: category.parent?.toString() || "",
      is_active: category.is_active
    });
    setIsCategoryDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) return;

    try {
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description,
        parent: categoryForm.parent ? parseInt(categoryForm.parent) : null,
        is_active: categoryForm.is_active,
        organization: 1
      };

      const response = await inventoryAPI.updateCategory(editingCategory.id, categoryData);
      if (response.success) {
        // Update local state with the response data
        const updatedCategory = response.data || { ...editingCategory, ...categoryData };
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
        
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
        setIsCategoryDialogOpen(false);
        resetCategoryForm();
        setEditingCategory(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await inventoryAPI.deleteCategory(categoryId);
      if (response.success) {
        // Remove from local state immediately
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        
        toast({
          title: "Success",
          description: "Category deleted successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      parent: "",
      is_active: true
    });
  };

  // Manufacturer handlers
  const handleAddManufacturer = async () => {
    if (!manufacturerForm.name.trim()) {
      toast({
        title: "Error",
        description: "Manufacturer name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const manufacturerData = {
        name: manufacturerForm.name,
        contact_person: manufacturerForm.contact_person,
        phone: manufacturerForm.phone,
        email: manufacturerForm.email,
        address: manufacturerForm.address,
        website: manufacturerForm.website,
        license_number: manufacturerForm.license_number,
        is_active: manufacturerForm.is_active,
        organization: 1
      };

      const response = await inventoryAPI.createManufacturer(manufacturerData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Manufacturer added successfully"
        });
        setIsManufacturerDialogOpen(false);
        resetManufacturerForm();
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add manufacturer",
        variant: "destructive"
      });
    }
  };

  const resetManufacturerForm = () => {
    setManufacturerForm({
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      website: "",
      license_number: "",
      is_active: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Settings</h2>
          <p className="text-muted-foreground">Configure inventory management preferences and manage categories</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Save size={16} className="mr-2" />
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Management */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <Package className="mr-2 text-primary" size={20} />
                  Stock Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Low Stock Threshold</label>
                  <Input
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => handleInputChange("lowStockThreshold", parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Alert when stock falls below this level</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Critical Stock Threshold</label>
                  <Input
                    type="number"
                    value={settings.criticalStockThreshold}
                    onChange={(e) => handleInputChange("criticalStockThreshold", parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Urgent alert when stock falls below this level</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto Reorder</p>
                    <p className="text-xs text-muted-foreground">Automatically suggest reorders for low stock</p>
                  </div>
                  <Switch
                    checked={settings.autoReorder}
                    onCheckedChange={() => handleToggle("autoReorder")}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Default Reorder Quantity</label>
                  <Input
                    type="number"
                    value={settings.reorderQuantity}
                    onChange={(e) => handleInputChange("reorderQuantity", parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Allow Negative Stock</p>
                    <p className="text-xs text-muted-foreground">Allow sales even when out of stock</p>
                  </div>
                  <Switch
                    checked={settings.allowNegativeStock}
                    onCheckedChange={() => handleToggle("allowNegativeStock")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Expiry Management */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <Calendar className="mr-2 text-warning" size={20} />
                  Expiry Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Expiry Warning (Days)</label>
                  <Input
                    type="number"
                    value={settings.expiryWarningDays}
                    onChange={(e) => handleInputChange("expiryWarningDays", parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Warn when products expire within this many days</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Critical Expiry Warning (Days)</label>
                  <Input
                    type="number"
                    value={settings.criticalExpiryDays}
                    onChange={(e) => handleInputChange("criticalExpiryDays", parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Urgent alert for near-expiry products</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable Expiry Alerts</p>
                    <p className="text-xs text-muted-foreground">Receive notifications for expiring products</p>
                  </div>
                  <Switch
                    checked={settings.enableExpiryAlerts}
                    onCheckedChange={() => handleToggle("enableExpiryAlerts")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Remove Expired from Sales</p>
                    <p className="text-xs text-muted-foreground">Automatically hide expired products from POS</p>
                  </div>
                  <Switch
                    checked={settings.removeExpiredFromSales}
                    onCheckedChange={() => handleToggle("removeExpiredFromSales")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cost & Pricing */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <DollarSign className="mr-2 text-success" size={20} />
                  Cost & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Default Markup (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.defaultMarkupPercent}
                    onChange={(e) => handleInputChange("defaultMarkupPercent", parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Default markup percentage for new products</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Track Lot Numbers</p>
                    <p className="text-xs text-muted-foreground">Track inventory by lot/batch numbers</p>
                  </div>
                  <Switch
                    checked={settings.trackLotNumbers}
                    onCheckedChange={() => handleToggle("trackLotNumbers")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Require Order Approval</p>
                    <p className="text-xs text-muted-foreground">Purchase orders need manager approval</p>
                  </div>
                  <Switch
                    checked={settings.requireApprovalForOrders}
                    onCheckedChange={() => handleToggle("requireApprovalForOrders")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <Bell className="mr-2 text-primary" size={20} />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Stock Alerts</p>
                    <p className="text-xs text-muted-foreground">Notifications for low/critical stock</p>
                  </div>
                  <Switch
                    checked={settings.stockAlerts}
                    onCheckedChange={() => handleToggle("stockAlerts")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Expiry Alerts</p>
                    <p className="text-xs text-muted-foreground">Notifications for expiring products</p>
                  </div>
                  <Switch
                    checked={settings.expiryAlerts}
                    onCheckedChange={() => handleToggle("expiryAlerts")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Order Alerts</p>
                    <p className="text-xs text-muted-foreground">Notifications for order status changes</p>
                  </div>
                  <Switch
                    checked={settings.orderAlerts}
                    onCheckedChange={() => handleToggle("orderAlerts")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Send alerts via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleToggle("emailNotifications")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-card-foreground">
                <div className="flex items-center">
                  <Settings className="mr-2 text-primary" size={20} />
                  Product Categories
                </div>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingCategory(null); resetCategoryForm(); }}>
                      <Plus size={16} className="mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                      <DialogDescription>
                        {editingCategory ? 'Update category information' : 'Create a new product category'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category-name" className="text-right">Name</Label>
                        <Input
                          id="category-name"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category-description" className="text-right">Description</Label>
                        <Textarea
                          id="category-description"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                          className="col-span-3"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category-parent" className="text-right">Parent Category</Label>
                        <Select value={categoryForm.parent || "none"} onValueChange={(value) => setCategoryForm({...categoryForm, parent: value === "none" ? "" : value})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select parent category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {categories.filter(c => c.id !== editingCategory?.id).map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Active</Label>
                        <div className="col-span-3">
                          <Switch
                            checked={categoryForm.is_active}
                            onCheckedChange={(checked) => setCategoryForm({...categoryForm, is_active: checked})}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                        {editingCategory ? 'Update' : 'Add'} Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell>{category.parent ? categories.find(c => c.id === category.parent)?.name : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                              <Edit size={12} className="mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(category.id)}>
                              <Trash2 size={12} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manufacturers" className="space-y-6">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-card-foreground">
                <div className="flex items-center">
                  <Settings className="mr-2 text-primary" size={20} />
                  Manufacturers
                </div>
                <Dialog open={isManufacturerDialogOpen} onOpenChange={setIsManufacturerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetManufacturerForm()}>
                      <Plus size={16} className="mr-2" />
                      Add Manufacturer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Manufacturer</DialogTitle>
                      <DialogDescription>
                        Create a new medication manufacturer/supplier
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-name" className="text-right">Name *</Label>
                        <Input
                          id="manufacturer-name"
                          value={manufacturerForm.name}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, name: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-contact" className="text-right">Contact Person</Label>
                        <Input
                          id="manufacturer-contact"
                          value={manufacturerForm.contact_person}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, contact_person: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-phone" className="text-right">Phone</Label>
                        <Input
                          id="manufacturer-phone"
                          value={manufacturerForm.phone}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, phone: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-email" className="text-right">Email</Label>
                        <Input
                          id="manufacturer-email"
                          type="email"
                          value={manufacturerForm.email}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, email: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-address" className="text-right">Address</Label>
                        <Textarea
                          id="manufacturer-address"
                          value={manufacturerForm.address}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, address: e.target.value})}
                          className="col-span-3"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-website" className="text-right">Website</Label>
                        <Input
                          id="manufacturer-website"
                          value={manufacturerForm.website}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, website: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-license" className="text-right">License Number</Label>
                        <Input
                          id="manufacturer-license"
                          value={manufacturerForm.license_number}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, license_number: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Active</Label>
                        <div className="col-span-3">
                          <Switch
                            checked={manufacturerForm.is_active}
                            onCheckedChange={(checked) => setManufacturerForm({...manufacturerForm, is_active: checked})}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsManufacturerDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddManufacturer}>
                        Add Manufacturer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manufacturers.map((manufacturer) => (
                      <TableRow key={manufacturer.id}>
                        <TableCell className="font-medium">{manufacturer.name}</TableCell>
                        <TableCell>{manufacturer.contact_person || '-'}</TableCell>
                        <TableCell>{manufacturer.phone || '-'}</TableCell>
                        <TableCell>{manufacturer.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={manufacturer.is_active ? "default" : "secondary"}>
                            {manufacturer.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}