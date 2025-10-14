import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Building2, Users, MapPin, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { organizationsAPI, usersAPI, Organization, Branch, User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface OrganizationFormData {
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  license_number: string;
  license_expiry: string;
  tax_id: string;
  registration_number: string;
  currency: string;
  tax_rate: string;
  timezone: string;
  language: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_expiry: string;
  logo?: File;
}


export function OrganizationManagement() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('organizations');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Form states
  const [orgForm, setOrgForm] = useState<OrganizationFormData>({
    name: '',
    type: 'retail_pharmacy',
    address: '',
    city: 'Kathmandu',
    state: 'Bagmati',
    postal_code: '44600',
    country: 'Nepal',
    phone: '+977-1-234567',
    email: '',
    website: '',
    license_number: '',
    license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tax_id: '',
    registration_number: '',
    currency: 'NPR',
    tax_rate: '13.00',
    timezone: 'Asia/Kathmandu',
    language: 'en',
    subscription_plan: 'basic',
    subscription_status: 'active',
    subscription_expiry: '',
    logo: undefined,
  });


  // Load data on component mount
  useEffect(() => {
    loadOrganizations();
    loadBranches();
    loadUsers();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await organizationsAPI.getOrganizations();
      if (response.success && response.data) {
        setOrganizations(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await organizationsAPI.getBranches();
      console.log('DEBUG: Branch API Response:', response);

      // Handle both wrapped response format and direct array format
      if (response.success && response.data) {
        // Wrapped response format: {success: true, data: [...]}
        setBranches(response.data);
      } else if (Array.isArray(response)) {
        // Direct array format: [...]
        setBranches(response);
      } else {
        console.warn('Unexpected branch API response format:', response);
        setBranches([]);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      setBranches([]);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getUsers();
      console.log('DEBUG: Users API Response:', response);

      // Handle both wrapped response format and direct array format
      if (response.success && response.data) {
        // Wrapped response format: {success: true, data: [...]}
        setUsers(response.data);
      } else if (Array.isArray(response)) {
        // Direct array format: [...]
        setUsers(response);
      } else {
        console.warn('Unexpected users API response format:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  };

  const handleCreateOrganization = async () => {
    try {
      setLoading(true);
      setFormErrors({});

      // Validate required fields
      if (!orgForm.name || !orgForm.email || !orgForm.address || !orgForm.license_number || !orgForm.license_expiry ||
          !orgForm.city || !orgForm.state || !orgForm.postal_code || !orgForm.phone || !orgForm.subscription_plan) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required organization fields marked with *',
          variant: 'destructive',
        });
        return;
      }


      // Clean the data
      const cleanOrgForm: any = {
        name: orgForm.name.trim(),
        type: orgForm.type,
        address: orgForm.address.trim(),
        city: orgForm.city.trim(),
        state: orgForm.state.trim(),
        postal_code: orgForm.postal_code.trim(),
        country: orgForm.country.trim(),
        phone: orgForm.phone.trim(),
        email: orgForm.email.replace(/,+$/, '').trim(), // Remove trailing commas
        license_number: orgForm.license_number.trim(),
        license_expiry: orgForm.license_expiry,
        currency: orgForm.currency,
        tax_rate: parseFloat(orgForm.tax_rate) || 13.00,
        timezone: orgForm.timezone,
        language: orgForm.language,
        subscription_plan: orgForm.subscription_plan,
        subscription_status: orgForm.subscription_status,
        subscription_expiry: orgForm.subscription_expiry || null,
      };

      // Only include optional fields if they have values
      if (orgForm.website.trim()) {
        cleanOrgForm.website = orgForm.website.trim();
      }
      if (orgForm.tax_id.trim()) {
        cleanOrgForm.tax_id = orgForm.tax_id.trim();
      }
      if (orgForm.registration_number.trim()) {
        cleanOrgForm.registration_number = orgForm.registration_number.trim();
      }


      // Prepare payload
      let response: any;
      if (orgForm.logo) {
        // Use FormData for file upload
        const formData = new FormData();
        Object.entries(cleanOrgForm).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        formData.append('logo', orgForm.logo);

        const axios = (await import('axios')).default;
        const token = localStorage.getItem('access_token');
        const axiosResponse = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}/organizations/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        // Handle backend response structure for FormData
        if (axiosResponse.data && axiosResponse.data.organization) {
          response = {
            success: true,
            data: axiosResponse.data.organization,
            message: axiosResponse.data.message || 'Organization created successfully'
          };
        } else {
          response = {
            success: true,
            data: axiosResponse.data,
            message: 'Organization created successfully'
          };
        }
      } else {
        // Use JSON payload
        response = await organizationsAPI.createOrganization(cleanOrgForm);
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Organization created successfully',
        });
        setShowCreateDialog(false);
        resetForms();
        loadOrganizations();
        loadUsers();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create organization',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      setFormErrors(errorData || {});
      toast({
        title: 'Error',
        description: errorData?.error || JSON.stringify(errorData) || 'Failed to create organization',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setOrgForm({
      name: '',
      type: 'retail_pharmacy',
      address: '',
      city: 'Kathmandu',
      state: 'Bagmati',
      postal_code: '44600',
      country: 'Nepal',
      phone: '+977-1-234567',
      email: '',
      website: '',
      license_number: '',
      license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tax_id: '',
      registration_number: '',
      currency: 'NPR',
      tax_rate: '13.00',
      timezone: 'Asia/Kathmandu',
      language: 'en',
      subscription_plan: 'basic',
      subscription_status: 'active',
      subscription_expiry: '',
      logo: undefined,
    });
    setFormErrors({});
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      inactive: { variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600' },
      suspended: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      pending: { variant: 'outline' as const, icon: Loader2, color: 'text-yellow-600' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">Manage pharmacy organizations and their branches</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Create a new pharmacy organization.
              </DialogDescription>
            </DialogHeader>

            {Object.keys(formErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  Please correct the following errors:
                  <ul className="list-disc pl-5">
                    {Object.entries(formErrors).map(([field, errors]) => (
                      <li key={field}>{field}: {Array.isArray(errors) ? errors.join(', ') : errors}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {/* Organization Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name *</Label>
                  <Input
                    id="org-name"
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    placeholder="Enter organization name"
                    className="border"
                    required
                  />
                  {formErrors.name && <span className="text-red-500 text-sm">{formErrors.name[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-email">Email *</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={orgForm.email}
                    onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                    placeholder="organization@example.com"
                    className="border"
                    required
                  />
                  {formErrors.email && <span className="text-red-500 text-sm">{formErrors.email[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-license">License Number *</Label>
                  <Input
                    id="org-license"
                    value={orgForm.license_number}
                    onChange={(e) => setOrgForm({ ...orgForm, license_number: e.target.value })}
                    placeholder="PH-2024-001234"
                    className="border"
                    required
                  />
                  {formErrors.license_number && <span className="text-red-500 text-sm">{formErrors.license_number[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-license-expiry">License Expiry *</Label>
                  <Input
                    id="org-license-expiry"
                    type="date"
                    value={orgForm.license_expiry}
                    onChange={(e) => setOrgForm({ ...orgForm, license_expiry: e.target.value })}
                    className="border"
                    required
                  />
                  {formErrors.license_expiry && <span className="text-red-500 text-sm">{formErrors.license_expiry[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-city">City *</Label>
                  <Input
                    id="org-city"
                    value={orgForm.city}
                    onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
                    placeholder="Kathmandu"
                    className="border"
                    required
                  />
                  {formErrors.city && <span className="text-red-500 text-sm">{formErrors.city[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-state">State *</Label>
                  <Input
                    id="org-state"
                    value={orgForm.state}
                    onChange={(e) => setOrgForm({ ...orgForm, state: e.target.value })}
                    placeholder="Bagmati"
                    className="border"
                    required
                  />
                  {formErrors.state && <span className="text-red-500 text-sm">{formErrors.state[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-postal-code">Postal Code *</Label>
                  <Input
                    id="org-postal-code"
                    value={orgForm.postal_code}
                    onChange={(e) => setOrgForm({ ...orgForm, postal_code: e.target.value })}
                    placeholder="44600"
                    className="border"
                    required
                  />
                  {formErrors.postal_code && <span className="text-red-500 text-sm">{formErrors.postal_code[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone *</Label>
                  <Input
                    id="org-phone"
                    value={orgForm.phone}
                    onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                    placeholder="+977-1-234567"
                    className="border"
                    required
                  />
                  {formErrors.phone && <span className="text-red-500 text-sm">{formErrors.phone[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-subscription-plan">Subscription Plan *</Label>
                  <Select value={orgForm.subscription_plan} onValueChange={(value) => setOrgForm({ ...orgForm, subscription_plan: value })}>
                    <SelectTrigger className="border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial (Free)</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.subscription_plan && <span className="text-red-500 text-sm">{formErrors.subscription_plan[0]}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-address">Address *</Label>
                <Textarea
                  id="org-address"
                  value={orgForm.address}
                  onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                  placeholder="Enter full address"
                  rows={2}
                  className="border"
                  required
                />
                {formErrors.address && <span className="text-red-500 text-sm">{formErrors.address[0]}</span>}
              </div>

            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrganization} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Organization
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organizations ({organizations.length})
              </CardTitle>
              <CardDescription>
                Manage pharmacy organizations and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">S.No</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Logo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Branches</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org, index) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{org.id}</TableCell>
                        <TableCell>
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {org.logo ? (
                              <img
                                src={org.logo}
                                alt={`${org.name} logo`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">' + org.name.charAt(0).toUpperCase() + '</div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                {org.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => {
                              window.location.href = `/admin/organizations/${org.id}`;
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {org.name}
                          </button>
                        </TableCell>
                        <TableCell>{org.type.replace('_', ' ')}</TableCell>
                        <TableCell>{getStatusBadge(org.status)}</TableCell>
                        <TableCell>{org.owner_name || 'Not assigned'}</TableCell>
                        <TableCell>{org.total_branches || 0}</TableCell>
                        <TableCell>{org.total_users || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Navigate to organization detail page
                                window.location.href = `/admin/organizations/${org.id}`;
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
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

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Branches ({branches.length})
              </CardTitle>
              <CardDescription>
                Manage organization branches and locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.code}</TableCell>
                      <TableCell>{branch.organization_name}</TableCell>
                      <TableCell>{getStatusBadge(branch.status)}</TableCell>
                      <TableCell>{branch.manager_name || 'Not assigned'}</TableCell>
                      <TableCell>{branch.total_users || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users ({users.length})
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role.replace('_', ' ')}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.organization_name || 'N/A'}</TableCell>
                      <TableCell>{user.branch_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}