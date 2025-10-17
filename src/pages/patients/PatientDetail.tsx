import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar,
  DollarSign, TrendingUp, CreditCard, Receipt, Package, Eye,
  Printer, Download, Plus, Activity, Heart, AlertTriangle, Edit, Save, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientDetail() {
  const { id } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [creditHistory, setCreditHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editedPatient, setEditedPatient] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');

        // Fetch patient details
        const patientResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}/patients/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (patientResponse.ok) {
          const patient = await patientResponse.json();
          setPatientData(patient);
          setEditedPatient(patient); // Initialize edited patient data
        } else {
          throw new Error('Failed to fetch patient data');
        }

        // Fetch purchase history (sales where this patient was involved)
        const salesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}/pos/sales/?patient_id=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (salesResponse.ok) {
          const salesData = await salesResponse.json();
          const sales = salesData.results || salesData || [];
          console.log('Purchase history data:', sales);
          setPurchaseHistory(sales);
        }

        // Fetch credit history (sales with outstanding credit)
        const creditResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}/pos/credit-history/?patient_id=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (creditResponse.ok) {
          const creditData = await creditResponse.json();
          const credits = creditData.results || creditData || [];
          console.log('Credit history data:', credits);
          setCreditHistory(credits);
        }

      } catch (error) {
        console.error('Error fetching patient data:', error);
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPatientData();
  }, [id]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const getTotalPurchases = () => {
    return purchaseHistory.reduce((sum, sale) => sum + parseFloat(sale.total || sale.total_amount || 0), 0);
  };

  const getTotalCredit = () => {
    // Calculate credit from both credit history and purchase history
    const creditFromCreditHistory = creditHistory.reduce((sum, sale) => sum + parseFloat(sale.credit_amount || 0), 0);
    const creditFromPurchaseHistory = purchaseHistory.reduce((sum, sale) => sum + parseFloat(sale.creditAmount || sale.credit_amount || 0), 0);
    return creditFromCreditHistory + creditFromPurchaseHistory;
  };

  const getTotalPaid = () => {
    return purchaseHistory.reduce((sum, sale) => sum + parseFloat(sale.paidAmount || sale.amount_paid || 0), 0);
  };

  const handleEditPatient = () => {
    setIsEditingPatient(true);
  };

  const handleCancelEdit = () => {
    setEditedPatient(patientData);
    setIsEditingPatient(false);
  };

  const handleSavePatient = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      // Prepare the data for API - split full_name into first_name and last_name if needed
      const updateData = { ...editedPatient };
      if (updateData.full_name) {
        const nameParts = updateData.full_name.trim().split(' ');
        updateData.first_name = nameParts[0] || '';
        updateData.last_name = nameParts.slice(1).join(' ') || '';
        delete updateData.full_name; // Remove full_name as API might not expect it
      }

      console.log('Sending update data:', updateData);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}/patients/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedPatient = await response.json();
        console.log('Updated patient data:', updatedPatient);
        setPatientData(updatedPatient);
        setEditedPatient(updatedPatient); // Update edited state too
        setIsEditingPatient(false);
        toast({
          title: "Success",
          description: "Patient information updated successfully",
        });
      } else {
        let errorMessage = 'Failed to update patient information';
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          console.error('Response Status:', response.status);
          console.error('Response Headers:', Object.fromEntries(response.headers.entries()));

          // Extract meaningful error message from API response
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'object' && errorData !== null) {
            // Handle field-specific errors (Django REST framework style)
            console.log('Processing error data object:', errorData);

            const fieldErrors = Object.entries(errorData)
              .filter(([key, value]) => key !== 'non_field_errors' && Array.isArray(value) && value.length > 0)
              .map(([field, errors]) => {
                const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const errorText = Array.isArray(errors) ? errors.join(', ') : String(errors);
                return `${fieldName}: ${errorText}`;
              });

            console.log('Field errors found:', fieldErrors);

            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('; ');
            } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
              errorMessage = errorData.non_field_errors.join(', ');
            } else {
              // Check if there are any array values that might be errors
              const allErrors = Object.values(errorData).filter(value => Array.isArray(value) && value.length > 0);
              if (allErrors.length > 0) {
                errorMessage = allErrors.flat().join('; ');
              } else {
                // Fallback: show all error details
                errorMessage = JSON.stringify(errorData, null, 2);
              }
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          // Try to get response text
          try {
            const textResponse = await response.text();
            console.error('Raw response text:', textResponse);
            if (textResponse) {
              errorMessage = textResponse;
            } else {
              errorMessage = `Request failed with status ${response.status} ${response.statusText}`;
            }
          } catch (textError) {
            errorMessage = `Request failed with status ${response.status} ${response.statusText}`;
          }
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        return; // Don't throw, just show error and return
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "Failed to update patient information",
        variant: "destructive"
      });
    }
  };

  const updateEditedPatient = (field, value) => {
    setEditedPatient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-sm text-muted-foreground">Loading patient details...</div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="text-center text-muted-foreground">
        Patient not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <NavLink to="/patients/directory">
            <ArrowLeft size={16} className="mr-2" />
            Back to Directory
          </NavLink>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{patientData.full_name || `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim()}</h1>
          <p className="text-sm text-muted-foreground">Patient ID: {patientData.patient_id}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-xl font-bold text-blue-600">NPR {getTotalPurchases().toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Purchases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-xl font-bold text-green-600">NPR {getTotalPaid().toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-xl font-bold text-orange-600">NPR {getTotalCredit().toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Outstanding Credit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-xl font-bold text-purple-600">{purchaseHistory.length}</p>
                <p className="text-xs text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User size={18} />
                Patient Information
              </span>
              {!isEditingPatient ? (
                <Button size="sm" variant="outline" onClick={handleEditPatient}>
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X size={14} className="mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSavePatient}>
                    <Save size={14} className="mr-1" />
                    Save
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Patient ID:</span>
                <div className="font-medium">{patientData.patient_id}</div>
              </div>
              <div>
                <Label className="font-medium text-muted-foreground">Full Name:</Label>
                {isEditingPatient ? (
                  <Input
                    value={editedPatient.full_name || `${editedPatient.first_name || ''} ${editedPatient.last_name || ''}`.trim()}
                    onChange={(e) => updateEditedPatient('full_name', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="font-medium">{patientData.full_name || `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim()}</div>
                )}
              </div>
              <div>
                <Label className="font-medium text-muted-foreground">Date of Birth:</Label>
                {isEditingPatient ? (
                  <Input
                    type="date"
                    value={editedPatient.date_of_birth || ''}
                    onChange={(e) => updateEditedPatient('date_of_birth', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="font-medium">{calculateAge(patientData.date_of_birth)} years</div>
                )}
              </div>
              <div>
                <Label className="font-medium text-muted-foreground">Gender:</Label>
                {isEditingPatient ? (
                  <Select value={editedPatient.gender || ''} onValueChange={(value) => updateEditedPatient('gender', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="font-medium capitalize">{patientData.gender || 'N/A'}</div>
                )}
              </div>
              <div>
                <Label className="font-medium text-muted-foreground">Blood Group:</Label>
                {isEditingPatient ? (
                  <Select value={editedPatient.blood_group || ''} onValueChange={(value) => updateEditedPatient('blood_group', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="font-medium">{patientData.blood_group || 'N/A'}</div>
                )}
              </div>
              <div>
                <Label className="font-medium text-muted-foreground">Patient Type:</Label>
                {isEditingPatient ? (
                  <Select value={editedPatient.patient_type || 'outpatient'} onValueChange={(value) => updateEditedPatient('patient_type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outpatient">Outpatient</SelectItem>
                      <SelectItem value="inpatient">Inpatient</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={patientData.patient_type === "inpatient" ? "default" : "secondary"}>
                    {patientData.patient_type || 'outpatient'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Phone size={14} />
                Contact Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-muted-foreground" />
                  {isEditingPatient ? (
                    <Input
                      value={editedPatient.phone || ''}
                      onChange={(e) => updateEditedPatient('phone', e.target.value)}
                      placeholder="Phone number"
                      className="flex-1"
                    />
                  ) : (
                    <span>{patientData.phone || 'N/A'}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-muted-foreground" />
                  {isEditingPatient ? (
                    <Input
                      value={editedPatient.email || ''}
                      onChange={(e) => updateEditedPatient('email', e.target.value)}
                      placeholder="Email address"
                      className="flex-1"
                    />
                  ) : (
                    <span>{patientData.email || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin size={14} />
                Address
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  {isEditingPatient ? (
                    <Input
                      value={editedPatient.address || ''}
                      onChange={(e) => updateEditedPatient('address', e.target.value)}
                      placeholder="Street address"
                    />
                  ) : (
                    <div>{patientData.address || 'N/A'}</div>
                  )}
                </div>
                <div>
                  {isEditingPatient ? (
                    <Input
                      value={editedPatient.city || ''}
                      onChange={(e) => updateEditedPatient('city', e.target.value)}
                      placeholder="City"
                    />
                  ) : (
                    <div className="text-muted-foreground">{patientData.city || ''}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle size={14} />
                Emergency Contact
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  {isEditingPatient ? (
                    <Input
                      value={editedPatient.emergency_contact_name || ''}
                      onChange={(e) => updateEditedPatient('emergency_contact_name', e.target.value)}
                      placeholder="Emergency contact name"
                    />
                  ) : (
                    <div className="font-medium">{patientData.emergency_contact_name || 'N/A'}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-muted-foreground" />
                  {isEditingPatient ? (
                    <Input
                      value={editedPatient.emergency_contact_phone || ''}
                      onChange={(e) => updateEditedPatient('emergency_contact_phone', e.target.value)}
                      placeholder="Emergency contact phone"
                      className="flex-1"
                    />
                  ) : (
                    <span>{patientData.emergency_contact_phone || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Heart size={14} />
                Medical Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <Label className="font-medium text-muted-foreground">Allergies:</Label>
                  {isEditingPatient ? (
                    <Textarea
                      value={editedPatient.allergies || ''}
                      onChange={(e) => updateEditedPatient('allergies', e.target.value)}
                      placeholder="List any allergies"
                      rows={2}
                      className="mt-1"
                    />
                  ) : (
                    <div>{patientData.allergies || 'None reported'}</div>
                  )}
                </div>
                <div>
                  <Label className="font-medium text-muted-foreground">Medical History:</Label>
                  {isEditingPatient ? (
                    <Textarea
                      value={editedPatient.chronic_conditions || ''}
                      onChange={(e) => updateEditedPatient('chronic_conditions', e.target.value)}
                      placeholder="Chronic conditions or medical history"
                      rows={2}
                      className="mt-1"
                    />
                  ) : (
                    <div>{patientData.chronic_conditions || 'None reported'}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt size={18} />
                Purchase History
              </span>
              <Badge variant="outline">{purchaseHistory.length} transactions</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchaseHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No purchase history found
              </div>
            ) : (
              <div className="space-y-4">
                {purchaseHistory.slice(0, 10).map((sale) => (
                  <div key={sale.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">Bill #{sale.id || sale.sale_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(sale.completedAt || sale.created_at).toLocaleDateString()} at {new Date(sale.completedAt || sale.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">NPR {parseFloat(sale.total || sale.total_amount || 0).toLocaleString()}</div>
                        <div className="flex gap-2 mt-1">
                          {parseFloat(sale.paidAmount || sale.amount_paid || 0) > 0 && (
                            <Badge variant="default" className="text-xs">
                              Paid: NPR {parseFloat(sale.paidAmount || sale.amount_paid || 0).toLocaleString()}
                            </Badge>
                          )}
                          {parseFloat(sale.creditAmount || sale.credit_amount || 0) > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              Credit: NPR {parseFloat(sale.creditAmount || sale.credit_amount || 0).toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground mb-2">
                      {sale.items?.length || 0} items purchased
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge variant={(sale.status === 'completed' || sale.status === 'credit') ? 'default' : 'secondary'}>
                        {sale.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSale(sale);
                          setShowSaleDialog(true);
                        }}
                      >
                        <Eye size={14} className="mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}

                {purchaseHistory.length > 10 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                      View All {purchaseHistory.length} Transactions
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credit History Section */}
      {creditHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={18} />
              Outstanding Credits
              <Badge variant="destructive">{creditHistory.length} pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {creditHistory.map((credit) => (
                <div key={credit.id} className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">Bill #{credit.sale_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(credit.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm mt-1">
                        Total: NPR {parseFloat(credit.total_amount || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-orange-600">
                        NPR {parseFloat(credit.credit_amount || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Outstanding</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sale Details Dialog */}
      <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sale Details - {selectedSale?.sale_number}</DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <span className="font-medium">Sale Number:</span>
                  <div className="font-mono">{selectedSale.id || selectedSale.sale_number}</div>
                </div>
                <div>
                  <span className="font-medium">Date:</span>
                  <div>{new Date(selectedSale.completedAt || selectedSale.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div>
                    <Badge variant={(selectedSale.status === 'completed' || selectedSale.status === 'credit') ? 'default' : 'secondary'}>
                      {selectedSale.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Cashier:</span>
                  <div>{selectedSale.completedBy || selectedSale.created_by_name || 'Unknown'}</div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-medium mb-3">Items Purchased</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Batch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name || item.product_name || item.product?.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>NPR {parseFloat(item.price || item.unit_price || 0).toLocaleString()}</TableCell>
                        <TableCell>NPR {(parseFloat(item.price || item.unit_price || 0) * parseFloat(item.quantity || 0)).toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-sm">{item.batch || item.batch_number || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Payment Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>NPR {parseFloat(selectedSale.subtotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>NPR {parseFloat(selectedSale.tax_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>NPR {parseFloat(selectedSale.discount_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-1">
                        <span>Total:</span>
                        <span>NPR {parseFloat(selectedSale.total_amount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Payment Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Amount Paid:</span>
                        <span className="text-green-600 font-medium">
                          NPR {parseFloat(selectedSale.paidAmount || selectedSale.amount_paid || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credit Amount:</span>
                        <span className={parseFloat(selectedSale.creditAmount || selectedSale.credit_amount || 0) > 0 ? 'text-orange-600 font-medium' : ''}>
                          NPR {parseFloat(selectedSale.creditAmount || selectedSale.credit_amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span>{selectedSale.paymentMethod || selectedSale.payment_method || 'N/A'}</span>
                      </div>
                      {selectedSale.transaction_id && (
                        <div className="flex justify-between">
                          <span>Transaction ID:</span>
                          <span className="font-mono text-xs">{selectedSale.transaction_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}