import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Calendar, CreditCard, Users, UserCheck, Eye, EyeOff, Plus, Loader2, Settings, Key, Power } from 'lucide-react';
import { organizationsAPI, usersAPI, subscriptionAPI, Organization, User, Branch } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Module Permission Data Structure (from backend)
interface ModulePermission {
  id: string;
  name: string;
  has_access: boolean;
  sub_modules: SubModulePermission[];
}

interface SubModulePermission {
  id: string;
  name: string;
  has_access: boolean;
}

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // User action dialogs
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    confirm_password: '',
  });

  // Permissions state
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [availableModules, setAvailableModules] = useState<ModulePermission[]>([]);
  const [userModules, setUserModules] = useState<ModulePermission[]>([]);

  // User form state
  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    role: 'staff',
    phone: '',
    organization_id: id || '',
    branch_id: '',
  });

  useEffect(() => {
    if (id) {
      loadOrganization();
      loadUsers();
      loadBranches();
      loadSubscriptionDetails();
      loadSubscriptionPlans();
    }
  }, [id]);

  // Reload users when branch filter changes
  useEffect(() => {
    if (id) {
      loadUsers();
    }
  }, [selectedBranchFilter]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const response = await organizationsAPI.getOrganization(id!);
      if (response.success && response.data) {
        setOrganization(response.data);
      }
    } catch (error) {
      console.error('Failed to load organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const params: any = { organization_id: id };
      
      // Add branch filter if selected
      if (selectedBranchFilter !== 'all') {
        params.branch_id = selectedBranchFilter;
      }
      
      const response = await usersAPI.getUsers(params);
      console.log('Users API response:', response); // Debug log
      if (response.success && response.data) {
        // Filter users by organization (backend should handle this, but keeping as fallback)
        const orgUsers = response.data.filter((user: User) => {
          console.log('User organization_id:', user.organization_id, 'Current org ID:', parseInt(id!)); // Debug log
          return user.organization_id === parseInt(id!);
        });
        console.log('Filtered users:', orgUsers); // Debug log
        setUsers(orgUsers);
      } else {
        console.log('No success or data in response:', response); // Debug log
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await organizationsAPI.getBranches({ organization: id });
      
      let allBranches: Branch[] = [];
      if (response.success && response.data) {
        allBranches = response.data;
      } else if (Array.isArray(response)) {
        allBranches = response;
      }

      setBranches(allBranches);
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const loadSubscriptionDetails = async () => {
    try {
      setLoadingSubscription(true);
      const response = await subscriptionAPI.getSubscriptions({
        organization: id,
        status: 'active'
      });
      
      if (response.success && response.data) {
        const subscriptions = response.data.results || response.data;
        const activeSubscription = Array.isArray(subscriptions) 
          ? subscriptions.find((sub: any) => sub.status === 'active')
          : null;
        setSubscriptionDetails(activeSubscription);
      }
    } catch (error) {
      console.error('Failed to load subscription details:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      const response = await subscriptionAPI.getPlans();
      if (response.success && response.data) {
        setSubscriptionPlans(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSubscriptionStatusBadge = (status: string, endDate?: string) => {
    if (endDate) {
      const daysLeft = getDaysUntilExpiry(endDate);
      if (daysLeft <= 0) {
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      } else if (daysLeft <= 7) {
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
      }
    }
    
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const createDefaultBranch = async () => {
    try {
      const response = await organizationsAPI.createDefaultBranch();
      const responseData = response as any;
      
      if (responseData && (responseData.branch || responseData.data)) {
        await loadBranches(); // Reload branches
        return responseData.branch || responseData.data;
      } else {
        throw new Error(responseData?.error || "Failed to create default branch");
      }
    } catch (error) {
      console.error('Failed to create default branch:', error);
      throw error;
    }
  };

  const handleCreateUser = async () => {
    try {
      setUserLoading(true);

      // Validate required fields
      if (!userForm.first_name || !userForm.last_name || !userForm.email || !userForm.username || !userForm.password || !userForm.password_confirm) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      // Validate password confirmation
      if (userForm.password !== userForm.password_confirm) {
        toast({
          title: 'Validation Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        });
        return;
      }

      // Get current user to check if superuser
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const isSuperUser = currentUser?.role === 'super_admin';
      
      // Branch handling for non-superusers
      let finalBranchId = userForm.branch_id;
      
      if (!isSuperUser && userForm.role !== 'super_admin') {
        // Check if branches exist
        if (branches.length === 0) {
          // No branches exist, create default main branch
          try {
            toast({
              title: "Info",
              description: "Creating default main branch...",
            });
            const newBranch = await createDefaultBranch();
            // Update the branches state with the new branch
            setBranches([newBranch]);
            // Use the newly created branch
            finalBranchId = newBranch.id.toString();
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to create default branch. Please create a branch first.",
              variant: "destructive",
            });
            return;
          }
        } else if (!finalBranchId || finalBranchId === '') {
          // If no branch selected, auto-select the first available branch (main branch)
          const mainBranch = branches.find(b => b.type === 'main') || branches[0];
          if (mainBranch) {
            finalBranchId = mainBranch.id.toString();
          }
        }
      }

      // Prepare user data, excluding empty branch_id
      const userData: any = {
        first_name: userForm.first_name,
        last_name: userForm.last_name,
        email: userForm.email,
        username: userForm.username,
        password: userForm.password,
        password_confirm: userForm.password_confirm,
        role: userForm.role,
        phone: userForm.phone,
        organization_id: parseInt(id!),
        status: 'active'
      };

      // Only include branch_id if it's not empty and user is not super_admin
      if (userForm.role !== 'super_admin' && finalBranchId && finalBranchId !== '') {
        userData.branch_id = parseInt(finalBranchId);
      }

      const response = await usersAPI.createUser(userData);
      console.log('Create user API response:', response); // Debug log

      if (response.success) {
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
        setShowCreateUserDialog(false);
        resetUserForm();
        loadUsers();
      } else {
        console.log('Create user failed:', response); // Debug log
        toast({
          title: 'Error',
          description: response.error || 'Failed to create user',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setUserLoading(false);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      password: '',
      password_confirm: '',
      role: 'staff',
      phone: '',
      organization_id: id || '',
      branch_id: '',
    });
  };

  const handlePasswordChange = async () => {
    if (!selectedUser) return;

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUserLoading(true);
      const response = await usersAPI.changeUserPassword(selectedUser.id, {
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });

      console.log('Password change response:', response);

      if (response.success || (response as any).user) {
        toast({
          title: 'Success',
          description: 'Password updated successfully',
        });
        setShowPasswordChangeDialog(false);
        setPasswordForm({ new_password: '', confirm_password: '' });
        setSelectedUser(null);
        // Refresh user list to show updated plain text password
        loadUsers();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update password',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setUserLoading(false);
    }
  };

  const handleUserStatusToggle = async (user: User) => {
    try {
      setUserLoading(true);
      const newStatus = user.status === 'active' ? 'inactive' : 'active';

      // Include required fields to avoid validation errors
      const updateData = {
        status: newStatus,
        phone: user.phone, // Include phone to satisfy backend validation
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      };

      const response = await usersAPI.updateUser(user.id, updateData);

      // Handle both wrapped and direct response formats
      if (response.success || (response as any).user) {
        toast({
          title: 'Success',
          description: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        });
        loadUsers();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update user status',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update user status',
        variant: 'destructive',
      });
    } finally {
      setUserLoading(false);
    }
  };

  const openPasswordChangeDialog = (user: User) => {
    setSelectedUser(user);
    setShowPasswordChangeDialog(true);
  };

  const openPermissionsDialog = (user: User) => {
    setSelectedUser(user);
    loadUserPermissions(user);
    setShowPermissionsDialog(true);
  };

  const loadUserPermissions = async (user: User) => {
    setLoadingPermissions(true);
    try {
      // Load available modules first
      const modulesResponse = await usersAPI.getAvailableModules();
      if (modulesResponse.success && modulesResponse.data && modulesResponse.data.modules) {
        setAvailableModules(modulesResponse.data.modules);
      }

      // Load user's specific permissions
      const permissionsResponse = await usersAPI.getUserModulePermissions(user.id);
      console.log('Permissions response:', permissionsResponse);
      console.log('Permissions response.data:', permissionsResponse.data);
      if (permissionsResponse.success && permissionsResponse.data) {
        // Handle nested response structure
        const userModulesData = permissionsResponse.data.data?.modules || permissionsResponse.data.modules || [];
        console.log('Setting userModules to:', userModulesData);
        setUserModules(userModulesData);

        // Convert to permissions object for checkboxes
        const permissions: Record<string, boolean> = {};
        if (userModulesData) {
          userModulesData.forEach((module: ModulePermission) => {
            permissions[module.id] = module.has_access;
            if (module.sub_modules) {
              module.sub_modules.forEach((subModule: SubModulePermission) => {
                permissions[subModule.id] = subModule.has_access;
              });
            }
          });
        }

        setUserPermissions(permissions);
      }
    } catch (error) {
      console.error('Failed to load user permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user permissions',
        variant: 'destructive',
      });
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setUserPermissions(prev => {
      const newPermissions = { ...prev, [permissionId]: checked };
      
      // Find if this is a main module
      const mainModule = userModules.find(module => module.id === permissionId);
      
      if (mainModule && checked) {
        // If checking a main module, auto-check all its sub-modules
        mainModule.sub_modules.forEach(subModule => {
          newPermissions[subModule.id] = true;
        });
      } else if (mainModule && !checked) {
        // If unchecking a main module, auto-uncheck all its sub-modules
        mainModule.sub_modules.forEach(subModule => {
          newPermissions[subModule.id] = false;
        });
      } else {
        // If this is a sub-module, check if all sub-modules are checked to auto-check parent
        const parentModule = userModules.find(module => 
          module.sub_modules.some(sub => sub.id === permissionId)
        );
        
        if (parentModule) {
          const allSubModulesChecked = parentModule.sub_modules.every(sub => 
            sub.id === permissionId ? checked : newPermissions[sub.id]
          );
          
          // Auto-check/uncheck parent module based on sub-modules state
          newPermissions[parentModule.id] = allSubModulesChecked;
        }
      }
      
      return newPermissions;
    });
  };

  const saveUserPermissions = async () => {
    if (!selectedUser) return;

    try {
      setLoadingPermissions(true);

      // Save permissions to backend
      const response = await usersAPI.updateUserModulePermissions(selectedUser.id, userPermissions);

      if (response.success) {
        const isOwner = selectedUser?.role === 'pharmacy_owner';
        toast({
          title: 'Success',
          description: isOwner
            ? 'Permissions updated successfully. Changes may affect other users in the organization.'
            : 'Permissions updated successfully',
        });
        setShowPermissionsDialog(false);
        setSelectedUser(null);
        setUserPermissions({});
        setUserModules([]);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update permissions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permissions',
        variant: 'destructive',
      });
    } finally {
      setLoadingPermissions(false);
    }
  };

  const getFilteredModules = () => {
    console.log('getFilteredModules called, userModules:', userModules);
    return userModules || [];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      inactive: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      suspended: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      pending: { variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Organization not found</h2>
          <p className="text-gray-600 mt-2">The organization you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/organizations')} className="mt-4">
            Back to Organizations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/organizations')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Organizations
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{organization.name}</h1>
          <p className="text-muted-foreground">Organization Details & Management</p>
        </div>
      </div>

      {/* Organization Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organization Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Type:</span>
                <span className="capitalize">{organization.type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {getStatusBadge(organization.status)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="font-medium">Created:</span>
                <span>{new Date(organization.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Email:</span>
                <span className="text-sm">{organization.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="font-medium">Phone:</span>
                <span>{organization.phone}</span>
              </div>
              {organization.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Website:</span>
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="font-medium">Address:</span>
              </div>
              <div className="text-sm text-gray-600 ml-6">
                <div>{organization.address}</div>
                <div>{organization.city}, {organization.state} {organization.postal_code}</div>
                <div>{organization.country}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">Users:</span>
                <span>{organization.total_users || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Branches:</span>
                <span>{organization.total_branches || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="font-medium">Plan:</span>
                <span className="capitalize">{organization.subscription_plan}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Organization Users ({users?.length || 0})
                </div>
                <div className="flex items-center gap-2">
                  {/* Branch Filter */}
                  <Select value={selectedBranchFilter} onValueChange={setSelectedBranchFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.name} ({branch.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new user for {organization.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 p-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name *</Label>
                          <Input
                            id="first_name"
                            value={userForm.first_name}
                            onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name *</Label>
                          <Input
                            id="last_name"
                            value={userForm.last_name}
                            onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                            placeholder="Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username *</Label>
                          <Input
                            id="username"
                            value={userForm.username}
                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                            placeholder="johndoe"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userForm.email}
                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                            placeholder="john.doe@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={userForm.phone}
                            onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                            placeholder="+977-1-234567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role *</Label>
                          <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="super_admin">Super Administrator</SelectItem>
                              <SelectItem value="pharmacy_owner">Pharmacy Owner</SelectItem>
                              <SelectItem value="branch_manager">Branch Manager</SelectItem>
                              <SelectItem value="senior_pharmacist">Senior Pharmacist</SelectItem>
                              <SelectItem value="pharmacist">Pharmacist</SelectItem>
                              <SelectItem value="pharmacy_technician">Pharmacy Technician</SelectItem>
                              <SelectItem value="cashier">Cashier</SelectItem>
                              <SelectItem value="supplier_admin">Supplier Administrator</SelectItem>
                              <SelectItem value="sales_representative">Sales Representative</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Password *</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={userForm.password}
                              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                              placeholder="Enter password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password_confirm">Confirm Password *</Label>
                          <div className="relative">
                            <Input
                              id="password_confirm"
                              type={showConfirmPassword ? "text" : "password"}
                              value={userForm.password_confirm}
                              onChange={(e) => setUserForm({ ...userForm, password_confirm: e.target.value })}
                              placeholder="Confirm password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {/* Branch selection - only show for non-superuser roles */}
                        {userForm.role !== 'super_admin' && (
                          <div className="space-y-2">
                            <Label htmlFor="branch">Branch *</Label>
                            <Select 
                              value={userForm.branch_id} 
                              onValueChange={(value) => setUserForm({ ...userForm, branch_id: value })}
                              disabled={loadingBranches}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select branch"} />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.length === 0 ? (
                                  <SelectItem value="no-branches" disabled>
                                    {loadingBranches ? "Loading..." : "No branches available"}
                                  </SelectItem>
                                ) : (
                                  branches.map(branch => (
                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                      {branch.name} ({branch.type})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {branches.length === 0 && !loadingBranches && (
                              <p className="text-xs text-muted-foreground mt-1">
                                No branches found. A default "Main Branch" will be created automatically.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 px-6 pb-6">
                      <Button variant="outline" onClick={() => setShowCreateUserDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser} disabled={userLoading || loadingBranches}>
                        {userLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create User
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Password Change Dialog */}
                <Dialog open={showPasswordChangeDialog} onOpenChange={(open) => {
                  setShowPasswordChangeDialog(open);
                  if (!open) {
                    setSelectedUser(null);
                    setPasswordForm({ new_password: '', confirm_password: '' });
                  }
                }}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Change password for {selectedUser?.first_name} {selectedUser?.last_name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Display current user info */}
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Username:</span>
                          <span className="text-gray-600">{selectedUser?.email}</span>
                        </div>
                        {selectedUser?.plain_text_password && (
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Current Password:</span>
                            <span className="text-gray-600 font-mono">{selectedUser.plain_text_password}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password *</Label>
                        <Input
                          id="new_password"
                          type="password"
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm_new_password">Confirm New Password *</Label>
                        <Input
                          id="confirm_new_password"
                          type="password"
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowPasswordChangeDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handlePasswordChange} disabled={userLoading}>
                        {userLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Update Password
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Permissions Dialog */}
                <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Module Permissions</DialogTitle>
                      <DialogDescription>
                          Manage module permissions for {selectedUser?.first_name} {selectedUser?.last_name}
                          {selectedUser?.role === 'pharmacy_owner' ? (
                            <span className="block text-sm text-blue-600 mt-1">
                              Owner role has access to all modules by default
                            </span>
                          ) : (
                            <span className="block text-sm text-amber-600 mt-1">
                              Only modules permitted by the organization's pharmacy owner are shown
                            </span>
                          )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {loadingPermissions ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                      ) : (
                        <>
                          {getFilteredModules()?.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-600">No modules available for this user.</p>
                            </div>
                          ) : (
                            getFilteredModules()?.map((module) => (
                              <div key={module.id} className="border rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-4">
                                  <input
                                    type="checkbox"
                                    id={module.id}
                                    checked={userPermissions[module.id] || false}
                                    onChange={(e) => handlePermissionChange(module.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <label htmlFor={module.id} className="text-lg font-medium text-gray-900">
                                    {module.name}
                                  </label>
                                </div>

                                <div className="ml-7">
                                  <div className="flex flex-wrap gap-4">
                                    {module.sub_modules.map((subModule) => (
                                      <div key={subModule.id} className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          id={subModule.id}
                                          checked={userPermissions[subModule.id] || false}
                                          onChange={(e) => handlePermissionChange(subModule.id, e.target.checked)}
                                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor={subModule.id} className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                          {subModule.name}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveUserPermissions} disabled={loadingPermissions}>
                        {loadingPermissions && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Permissions
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by adding the first user for {organization.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.email} • {user.role}
                            {user.branch_name && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {user.branch_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPermissionsDialog(user)}
                            title="Module Permissions"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPasswordChangeDialog(user)}
                            title="Change Password"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserStatusToggle(user)}
                            title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                            disabled={userLoading}
                          >
                            <Power className={`w-4 h-4 ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Organization Branches ({branches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBranches ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : branches.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Branches Found</h3>
                  <p className="text-gray-600 mb-4">
                    No branches found for {organization.name}
                  </p>
                  <Button>
                    Add New Branch
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{branch.name}</div>
                          <div className="text-sm text-gray-600">
                            {branch.code} • {branch.type}
                          </div>
                          <div className="text-sm text-gray-500">
                            {branch.address}, {branch.city}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(branch.status)}
                        <div className="text-sm text-gray-600">
                          {branch.total_users || 0} users
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Branch
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSubscription ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : subscriptionDetails ? (
                <div className="space-y-6">
                  {/* Current Subscription Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Current Plan</span>
                      </div>
                      <div className="text-2xl font-bold">{subscriptionDetails.plan_details?.display_name || organization.subscription_plan}</div>
                      <div className="text-sm text-gray-600 capitalize">{subscriptionDetails.plan_details?.name || organization.subscription_plan}</div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Status</span>
                      </div>
                      <div className="mb-2">{getSubscriptionStatusBadge(subscriptionDetails.status, subscriptionDetails.end_date)}</div>
                      <div className="text-sm text-gray-600">
                        {subscriptionDetails.end_date && getDaysUntilExpiry(subscriptionDetails.end_date) > 0
                          ? `${getDaysUntilExpiry(subscriptionDetails.end_date)} days left`
                          : 'Expired'
                        }
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Valid Until</span>
                      </div>
                      <div className="text-lg font-bold">
                        {subscriptionDetails.end_date ? new Date(subscriptionDetails.end_date).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Expiry date</div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        <span className="font-medium">Auto Renew</span>
                      </div>
                      <div className="text-lg font-bold">
                        {subscriptionDetails.auto_renew ? (
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Disabled</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Renewal setting</div>
                    </div>
                  </div>

                  {/* Plan Details */}
                  {subscriptionDetails.plan_details && (
                    <div className="border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Plan Features & Limits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Usage Limits</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Max Users:</span>
                              <span className="font-medium">
                                {subscriptionDetails.plan_details.max_users || 'Unlimited'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Organizations:</span>
                              <span className="font-medium">
                                {subscriptionDetails.plan_details.max_organizations || 'Unlimited'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Branches:</span>
                              <span className="font-medium">
                                {subscriptionDetails.plan_details.max_branches || 'Unlimited'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Current Usage</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Active Users:</span>
                              <span className="font-medium">{organization.total_users || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Organizations:</span>
                              <span className="font-medium">1</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Branches:</span>
                              <span className="font-medium">{organization.total_branches || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Pricing Tiers</h4>
                          <div className="space-y-2 text-sm">
                            {subscriptionDetails.plan_details.pricing_tiers && subscriptionDetails.plan_details.pricing_tiers.length > 0 ? (
                              subscriptionDetails.plan_details.pricing_tiers.map((tier: any, index: number) => (
                                <div key={index} className="flex justify-between">
                                  <span className="capitalize">{tier.cycle}:</span>
                                  <span className="font-medium">{formatCurrency(parseFloat(tier.price))}</span>
                                </div>
                              ))
                            ) : (
                              <div className="flex justify-between">
                                <span>Price:</span>
                                <span className="font-medium">{formatCurrency(subscriptionDetails.plan_details.price)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Features List */}
                      {subscriptionDetails.plan_details.features && subscriptionDetails.plan_details.features.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium text-gray-900 mb-3">Included Features</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {subscriptionDetails.plan_details.features.map((feature: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subscription History */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Subscription Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Subscription Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subscription ID:</span>
                            <span className="font-mono">{subscriptionDetails.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Start Date:</span>
                            <span>{new Date(subscriptionDetails.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Created:</span>
                            <span>{new Date(subscriptionDetails.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Updated:</span>
                            <span>{new Date(subscriptionDetails.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Organization Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Organization:</span>
                            <span>{subscriptionDetails.organization_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Owner:</span>
                            <span>{organization.owner_name || 'Not assigned'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>License:</span>
                            <span>{organization.license_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>License Expiry:</span>
                            <span>{new Date(organization.license_expiry).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4">
                    <Button variant="outline">
                      View Billing History
                    </Button>
                    <Button>
                      Manage Subscription
                    </Button>
                    <Button variant="outline">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 mb-4">
                    This organization doesn't have an active subscription.
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Plan</span>
                        </div>
                        <div className="text-lg font-bold capitalize">{organization.subscription_plan}</div>
                        <div className="text-sm text-gray-600">From organization data</div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-red-600" />
                          <span className="font-medium">Status</span>
                        </div>
                        <div className="text-lg font-bold capitalize">{organization.subscription_status}</div>
                        <div className="text-sm text-gray-600">Subscription status</div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Users</span>
                        </div>
                        <div className="text-lg font-bold">{organization.total_users || 0}</div>
                        <div className="text-sm text-gray-600">Active users</div>
                      </div>
                    </div>
                    <Button>
                      Create Subscription
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}