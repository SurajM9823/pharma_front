import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard, TrendingUp, Calendar, RefreshCw,
  Loader2, DollarSign, Users, Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { organizationsAPI } from "@/services/api";

export default function SubscriptionManagementPage() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    fetchOrganizations();
    fetchDashboardStats();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await organizationsAPI.getOrganizations();
      if (response.success && response.data) {
        setOrganizations(response.data);
      } else {
        setOrganizations([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations.",
        variant: "destructive",
      });
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await organizationsAPI.getDashboardStats();
      if (response.success && response.data) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const getSubscriptionBadgeColor = (plan: string) => {
    const colors = {
      trial: "bg-gray-100 text-gray-800",
      basic: "bg-blue-100 text-blue-800",
      professional: "bg-green-100 text-green-800",
      enterprise: "bg-purple-100 text-purple-800",
    };
    return colors[plan as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const subscriptionPlans = [
    {
      name: "Trial",
      price: "₹0",
      period: "month",
      features: ["Basic features", "Up to 10 users", "1 organization", "Community support"],
      color: "gray"
    },
    {
      name: "Basic",
      price: "₹5,000",
      period: "month",
      features: ["All trial features", "Up to 50 users", "5 organizations", "Email support", "Basic reporting"],
      color: "blue"
    },
    {
      name: "Professional",
      price: "₹15,000",
      period: "month",
      features: ["All basic features", "Unlimited users", "Unlimited organizations", "Priority support", "Advanced reporting", "API access"],
      color: "green"
    },
    {
      name: "Enterprise",
      price: "₹50,000",
      period: "month",
      features: ["All professional features", "Custom integrations", "Dedicated support", "SLA guarantee", "White-label option"],
      color: "purple"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-warning" />
          <div>
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="text-muted-foreground">Manage subscription plans and billing</p>
          </div>
        </div>
        <Button onClick={() => { fetchOrganizations(); fetchDashboardStats(); }} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${(loading || statsLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Subscription Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Total Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (dashboardStats?.total_organizations || organizations.length)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (dashboardStats?.active_subscriptions || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `₹${(dashboardStats?.monthly_revenue || 0).toLocaleString('en-IN')}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `${dashboardStats?.growth_percentage || 0}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="organizations">Organization Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.name} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    <Badge className={getSubscriptionBadgeColor(plan.name.toLowerCase())}>
                      {plan.name}
                    </Badge>
                  </CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4" variant="outline">
                    Manage Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading organizations...</span>
                </div>
              ) : organizations.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No organizations found</h3>
                  <p className="text-muted-foreground">Organizations will appear here once they are created.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {organizations.map((org) => (
                    <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{org.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Created {new Date(org.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getSubscriptionBadgeColor(org.subscription_plan)}>
                          {org.subscription_plan || 'Trial'}
                        </Badge>
                        <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                          {org.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading analytics...</span>
                  </div>
                ) : (
                  [
                    { tier: 'Enterprise', count: dashboardStats?.subscription_distribution?.enterprise || 0, revenue: (dashboardStats?.subscription_distribution?.enterprise || 0) * 50000, color: 'destructive' },
                    { tier: 'Professional', count: dashboardStats?.subscription_distribution?.professional || 0, revenue: (dashboardStats?.subscription_distribution?.professional || 0) * 15000, color: 'default' },
                    { tier: 'Basic', count: dashboardStats?.subscription_distribution?.basic || 0, revenue: (dashboardStats?.subscription_distribution?.basic || 0) * 5000, color: 'outline' },
                    { tier: 'Trial', count: dashboardStats?.subscription_distribution?.trial || 0, revenue: 0, color: 'secondary' }
                  ].map((sub) => (
                    <div key={sub.tier} className="flex items-center justify-between p-3 border">
                      <div className="flex items-center gap-3">
                        <Badge variant={sub.color as any}>{sub.tier}</Badge>
                        <span className="font-medium">{sub.count} organizations</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{(sub.revenue / 100000).toFixed(1)}L</div>
                        <div className="text-xs text-muted-foreground">per month</div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Revenue Analytics</h3>
                  <p className="text-muted-foreground">Detailed revenue analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}