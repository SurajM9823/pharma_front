import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Minus, Trash2, X, Eye, Filter, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReceiptModal from "@/components/ReceiptModal";

export default function POSBilling() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", discount: 0 });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [showPatientSearchResults, setShowPatientSearchResults] = useState(false);
  const [savedBills, setSavedBills] = useState([]);
  const [completedBills, setCompletedBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billSearch, setBillSearch] = useState("");
  const [billFilter, setBillFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState("percent");
  const [transactionType, setTransactionType] = useState("cash");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [editingBillId, setEditingBillId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [posSettings, setPosSettings] = useState({
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    receipt_footer: '',
    receipt_logo: null,
    tax_rate: 13,
    tax_inclusive: false,
    payment_methods: ['cash', 'online']
  });
  const { toast } = useToast();

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userBranchId = currentUser?.branch_id;

  // Fetch POS settings for current branch
  const fetchPOSSettings = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/pos/settings/', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosSettings({
          business_name: data.business_name || '',
          business_address: data.business_address || '',
          business_phone: data.business_phone || '',
          business_email: data.business_email || '',
          receipt_footer: data.receipt_footer || '',
          receipt_logo: data.receipt_logo || null,
          tax_rate: data.tax_rate || 13,
          tax_inclusive: data.tax_inclusive || false,
          payment_methods: data.payment_methods || ['cash', 'online']
        });
      }
    } catch (error) {
      console.error('Error fetching POS settings:', error);
      // Use default settings if fetch fails
      setPosSettings({
        business_name: '',
        business_address: '',
        business_phone: '',
        business_email: '',
        receipt_footer: '',
        receipt_logo: null,
        tax_rate: 13,
        tax_inclusive: false,
        payment_methods: ['cash', 'online']
      });
    }
  };

  // Helper function to get available stock considering cart items
  const getAvailableStock = (medicineId) => {
    const product = inventory.find(p => p.medicine_id === medicineId);
    if (!product) return 0;
    
    const cartQty = cartItems
      .filter(item => item.medicine_id === medicineId)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    return Math.max(0, product.total_stock - cartQty);
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const url = userBranchId 
        ? `http://localhost:8000/api/inventory/inventory-items/?branch_id=${userBranchId}&pos_mode=true`
        : 'http://localhost:8000/api/inventory/inventory-items/?pos_mode=true';
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const posProducts = data.map(item => ({
          id: item.id,
          medicine_id: item.medicine_id,
          name: item.medicine?.name || 'Unknown Medicine',
          batch: item.batch_number,
          price: parseFloat(item.selling_price) || 0,
          stock: item.current_stock,
          total_stock: item.total_stock,
          expiry: item.expiry_date,
          barcode: item.medicine?.product_code || '',
          strength: item.medicine?.strength || '',
          dosage_form: item.medicine?.dosage_form || '',
          unit: item.unit,
          location: item.location,
          all_batches: item.all_batches || []
        })).filter(item => item.total_stock > 0);
        
        setInventory(posProducts);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedBills = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/pos/sales/', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompletedBills(data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchPendingBills = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/pos/sales/pending/', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedBills(data);
      }
    } catch (error) {
      console.error('Error fetching pending bills:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchCompletedBills();
    fetchPendingBills();
    fetchPOSSettings();
  }, []);

  const filteredProducts = inventory.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = async (product, requestedQuantity = 1) => {
    // Check available stock first
    const currentCartQty = cartItems
      .filter(item => item.medicine_id === product.medicine_id)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    const totalRequested = currentCartQty + requestedQuantity;
    
    if (totalRequested > product.total_stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.total_stock} units available. You already have ${currentCartQty} in cart.`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/inventory/allocate-stock/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          medicine_id: product.medicine_id,
          quantity: requestedQuantity,
          branch_id: userBranchId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Stock Error",
          description: errorData.error || "Failed to allocate stock",
          variant: "destructive",
        });
        return;
      }
      
      const allocation = await response.json();
      
      const priceGroups = {};
      allocation.allocations.forEach(alloc => {
        const priceKey = alloc.selling_price.toString();
        if (!priceGroups[priceKey]) {
          priceGroups[priceKey] = {
            price: alloc.selling_price,
            quantity: 0,
            batches: []
          };
        }
        priceGroups[priceKey].quantity += alloc.allocated_quantity;
        priceGroups[priceKey].batches.push({
          inventory_item_id: alloc.batch_id,
          batch_number: alloc.batch_number,
          allocated_quantity: alloc.allocated_quantity,
          selling_price: alloc.selling_price
        });
      });
      
      setCartItems(prevItems => {
        let newItems = [...prevItems];
        
        Object.values(priceGroups).forEach(group => {
          const cartKey = `${product.medicine_id}_${group.price}`;
          const existingItemIndex = newItems.findIndex(item => item.cart_key === cartKey);
          
          if (existingItemIndex >= 0) {
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + group.quantity,
              batch_info: [...newItems[existingItemIndex].batch_info, ...group.batches]
            };
          } else {
            newItems.push({
              ...product,
              id: cartKey,
              cart_key: cartKey,
              medicine_id: product.medicine_id,
              price: group.price,
              quantity: group.quantity,
              batch_info: group.batches
            });
          }
        });
        
        return newItems;
      });
      
      fetchInventory();
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateQuantity = async (cartKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    
    const cartItem = cartItems.find(item => item.cart_key === cartKey);
    if (!cartItem) return;
    
    // Find the product to check total stock
    const product = inventory.find(p => p.medicine_id === cartItem.medicine_id);
    if (!product) {
      toast({
        title: "Product Not Found",
        description: "Unable to validate stock for this item",
        variant: "destructive",
      });
      return;
    }
    
    // Check if new quantity exceeds available stock
    const otherCartQty = cartItems
      .filter(item => item.medicine_id === cartItem.medicine_id && item.cart_key !== cartKey)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    const totalRequested = otherCartQty + newQuantity;
    
    if (totalRequested > product.total_stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.total_stock} units available. Maximum you can set: ${product.total_stock - otherCartQty}`,
        variant: "destructive",
      });
      return;
    }
    
    const quantityDiff = newQuantity - cartItem.quantity;
    if (quantityDiff > 0) {
      await addToCart(cartItem, quantityDiff);
    } else {
      setCartItems(prevItems => prevItems.map(item =>
        item.cart_key === cartKey ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prevItems => prevItems.filter(item => item.cart_key !== cartKey));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Dynamic tax calculation based on settings
  const shouldShowTax = posSettings.tax_rate > 0 && posSettings.tax_inclusive === true;
  const taxAmount = shouldShowTax ? subtotal * (posSettings.tax_rate / 100) : 0;
  const subtotalWithTax = subtotal + taxAmount;
  
  const calculatedDiscountAmount = discountType === "amount" 
    ? discountAmount 
    : (subtotalWithTax * customerInfo.discount) / 100;
  const total = subtotalWithTax - calculatedDiscountAmount;
  const creditAmount = Math.max(0, total - (parseFloat(paidAmount) || 0));

  const handlePatientSearch = async (value) => {
    setPatientSearchTerm(value);
    if (value.trim()) {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/patients/?search=${encodeURIComponent(value)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPatientSearchResults(data.results || []);
          setShowPatientSearchResults(true);
        }
      } catch (error) {
        console.error('Error searching patients:', error);
      }
    } else {
      setShowPatientSearchResults(false);
      setPatientSearchResults([]);
    }
  };

  const handlePatientSelect = (patient) => {
    setPatientId(patient.patient_id || '');
    setPatientName(patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim());
    setPatientPhone(patient.phone || '');
    setPatientAge(patient.age || '');
    setPatientGender(patient.gender || '');
    setCustomerInfo({ 
      name: patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim(), 
      phone: patient.phone || '', 
      discount: 0 
    });
    setShowPatientSearchResults(false);
    setPatientSearchTerm('');
  };

  const handleSaveBill = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to cart before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const pendingBillData = {
        patient_id: patientId,
        patient_name: patientName || "Walk-in Customer",
        patient_age: patientAge,
        patient_phone: patientPhone,
        patient_gender: patientGender,
        branch_id: userBranchId,
        items: cartItems.map(item => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          price: item.price,
          batch: item.batch,
          batch_info: item.batch_info
        })),
        subtotal,
        total,
        discount_amount: calculatedDiscountAmount,
        tax_amount: taxAmount,
        payment_method: paymentMethod
      };

      const url = editingBillId 
        ? `http://localhost:8000/api/pos/sales/${editingBillId}/update-pending/`
        : 'http://localhost:8000/api/pos/sales/save-pending/';
      
      const response = await fetch(url, {
        method: editingBillId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(pendingBillData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save pending bill');
      }

      const result = await response.json();
      
      // Clear current cart
      setCartItems([]);
      setPatientId("");
      setPatientName("");
      setPatientPhone("");
      setPatientAge("");
      setPatientGender("");
      setPatientSearchTerm("");
      setShowPatientSearchResults(false);
      setCustomerInfo({ name: "", phone: "", discount: 0 });
      setDiscountAmount(0);
      setPaidAmount("");
      setEditingBillId(null);

      // Refresh pending bills
      fetchPendingBills();

      toast({
        title: editingBillId ? "Bill Updated" : "Bill Saved",
        description: `Bill ${result.sale_number} ${editingBillId ? 'updated' : 'saved'} successfully`,
      });
    } catch (error) {
      console.error('Error saving pending bill:', error);
      toast({
        title: "Save Error",
        description: error.message || "Failed to save pending bill",
        variant: "destructive",
      });
    }
  };

  const handleLoadBill = (bill) => {
    setPatientId(bill.patientId);
    setPatientName(bill.patientName);
    setPatientPhone(bill.patientPhone);
    setPatientAge(bill.patientAge);
    setPatientGender(bill.patientGender);
    setCartItems(bill.items);
    setCustomerInfo({ name: bill.patientName, phone: bill.patientPhone, discount: 0 });
    setEditingBillId(bill.id); // Track that we're editing this bill
    
    toast({
      title: "Bill Loaded",
      description: `Bill ${bill.sale_number} loaded to cart`,
    });
  };

  const handleDeleteSavedBill = async (billId) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/pos/sales/${billId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        setSavedBills(prev => prev.filter(b => b.id !== billId));
        toast({ title: "Bill Deleted", description: "Pending bill deleted successfully" });
      } else {
        const errorData = await response.json();
        toast({ 
          title: "Delete Error", 
          description: errorData.error || "Failed to delete pending bill",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting pending bill:', error);
      toast({ 
        title: "Delete Error", 
        description: "Failed to delete pending bill",
        variant: "destructive"
      });
    }
  };

  const showSalePreview = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to cart before checkout.",
        variant: "destructive",
      });
      return;
    }
    setShowPreviewModal(true);
  };

  const handleCheckout = async () => {

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const saleData = {
        patient_id: patientId,
        patient_name: patientName || "Walk-in Customer",
        patient_age: patientAge,
        patient_phone: patientPhone,
        patient_gender: patientGender,
        branch_id: userBranchId,
        items: cartItems.map(item => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          price: item.price,
          batch: item.batch,
          batch_info: item.batch_info
        })),
        subtotal,
        total,
        discount_amount: calculatedDiscountAmount,
        tax_amount: taxAmount,
        payment_method: paymentMethod,
        paid_amount: parseFloat(paidAmount) || 0,
        credit_amount: creditAmount,
        transaction_id: paymentMethod === 'online' ? `TXN_${Date.now()}` : '',
        sale_id: editingBillId // Include sale_id if completing pending bill
      };

      const endpoint = editingBillId 
        ? 'http://localhost:8000/api/pos/sales/complete/'
        : 'http://localhost:8000/api/pos/sales/create/';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(saleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sale');
      }

      const result = await response.json();
      
      const saleType = creditAmount > 0 ? 'Credit Sale' : 'Cash Sale';
      const message = creditAmount > 0 
        ? `Credit sale completed. Due: NPR ${creditAmount.toFixed(2)}` 
        : `Sale completed for NPR ${total.toFixed(2)}`;

      toast({
        title: saleType,
        description: `${message} - Bill: ${result.sale_number}`,
      });

      // Show receipt modal
      if (result.receipt) {
        setReceiptData(result.receipt);
        setShowReceiptModal(true);
      }

      // Clear form
      setCartItems([]);
      setCustomerInfo({ name: "", phone: "", discount: 0 });
      setPaymentMethod("cash");
      setPaidAmount("");
      setSearchTerm("");
      setPatientId("");
      setPatientName("");
      setPatientPhone("");
      setPatientAge("");
      setPatientGender("");
      setPatientSearchTerm("");
      setShowPatientSearchResults(false);
      setDiscountAmount(0);
      setDiscountType("percent");
      setTransactionType("cash");
      setEditingBillId(null);
      
      // Refresh data
      fetchInventory();
      fetchCompletedBills();
      fetchPendingBills();
      
    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: "Sale Error",
        description: error.message || "Failed to complete sale",
        variant: "destructive",
      });
    }
  };

  const handleViewBill = async (bill) => {
    setSelectedBill(bill);
    setShowBillModal(true);
    
    // Generate receipt data for viewing
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/pos/sales/${bill.id}/receipt/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const receiptData = await response.json();
        setReceiptData(receiptData);
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
    }
  };

  const handleDeleteBill = async (billId) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/pos/sales/${billId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        setCompletedBills(prev => prev.filter(b => b.id !== billId));
        toast({ title: "Bill Deleted", description: "Bill deleted successfully" });
        fetchInventory(); // Refresh inventory to show restored stock
      } else {
        const errorData = await response.json();
        toast({ 
          title: "Delete Error", 
          description: errorData.error || "Failed to delete bill",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({ 
        title: "Delete Error", 
        description: "Failed to delete bill",
        variant: "destructive"
      });
    }
  };

  const filteredBills = completedBills.filter(bill => {
    const matchesSearch = bill.patientName.toLowerCase().includes(billSearch.toLowerCase()) ||
                         bill.id.toLowerCase().includes(billSearch.toLowerCase()) ||
                         bill.patientPhone.includes(billSearch);
    const matchesFilter = billFilter === "all" || bill.status === billFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-gray-50 p-2 space-y-4">
      <div className="flex flex-col gap-2">
        {/* Top Section: Customer Details, Medicine Search, and Cart */}
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Left Section: Customer Details and Medicine Search */}
          <div className="lg:w-2/3 bg-white rounded-md shadow p-2 flex flex-col gap-2">
            {/* Customer Details */}
            <div className="grid grid-cols-6 gap-2">
              <div className="relative col-span-2">
                <Label htmlFor="patientId" className="text-xs">Patient ID</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={14} />
                  <Input
                    id="patientId"
                    value={patientSearchTerm || patientId}
                    onChange={(e) => {
                      if (e.target.value.trim()) {
                        handlePatientSearch(e.target.value);
                      } else {
                        setPatientId('');
                        setPatientSearchTerm('');
                        setShowPatientSearchResults(false);
                      }
                    }}
                    placeholder="Search Patient ID, Name or Phone"
                    className="h-8 text-sm pl-7"
                  />
                  {showPatientSearchResults && patientSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-20 max-h-32 overflow-y-auto">
                      {patientSearchResults.map((patient, index) => (
                        <div
                          key={patient.id || `patient-${index}`}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="font-medium text-xs">{patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim()}</div>
                          <div className="text-xs text-gray-500">{patient.patient_id} • {patient.phone || 'No phone'} • {patient.age}Y/{patient.gender}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="patientName" className="text-xs">Name</Label>
                <Input
                  id="patientName"
                  value={patientName}
                  onChange={(e) => {
                    setPatientName(e.target.value);
                    setCustomerInfo({ ...customerInfo, name: e.target.value });
                  }}
                  placeholder="Patient Name"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="patientAge" className="text-xs">Age</Label>
                <Input
                  id="patientAge"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="Age"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="patientPhone" className="text-xs">Phone</Label>
                <Input
                  id="patientPhone"
                  value={patientPhone}
                  onChange={(e) => {
                    setPatientPhone(e.target.value);
                    setCustomerInfo({ ...customerInfo, phone: e.target.value });
                  }}
                  placeholder="Phone"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="patientGender" className="text-xs">Gender</Label>
                <Select value={patientGender} onValueChange={setPatientGender}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Saved Bills */}
            {savedBills.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-1">
                <h3 className="text-xs font-semibold mb-1">Pending Bills ({savedBills.length})</h3>
                <div className="grid grid-cols-4 gap-1 max-h-16 overflow-y-auto">
                  {savedBills.map((bill, index) => (
                    <div key={bill.id || `saved-bill-${index}`} className="relative bg-white border rounded p-1 text-xs hover:bg-gray-50 h-8 flex flex-col justify-center">
                      <div 
                        className="cursor-pointer text-center"
                        onClick={() => handleLoadBill(bill)}
                      >
                        <div className="font-medium text-xs leading-tight">{String(bill.id).split('_')[1]?.slice(-3) || String(bill.id).slice(-3)}</div>
                        <div className="text-gray-500 text-xs truncate leading-tight">{bill.patientName.slice(0,4)}</div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteSavedBill(bill.id)}
                      >
                        <X size={6} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div>
              <Input
                type="text"
                placeholder="Search medicine, barcode, batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 text-xs"
              />
            </div>

            {/* Inventory Table */}
            <div className="flex-1 overflow-y-auto border rounded">
              {loading ? (
                <div className="text-center py-2 text-xs">Loading...</div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 sticky top-0 text-left">
                      <th className="p-1 font-medium">Medicine</th>
                      <th className="p-1 font-medium">Batch</th>
                      <th className="p-1 font-medium">Strength</th>
                      <th className="p-1 font-medium">Stock</th>
                      <th className="p-1 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product, index) => (
                        <tr
                          key={product.id || `product-${index}`}
                          className={`border-b hover:bg-gray-50 cursor-pointer ${
                            getAvailableStock(product.medicine_id) <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => getAvailableStock(product.medicine_id) > 0 && addToCart(product)}
                        >
                          <td className="p-1">{product.name}</td>
                          <td className="p-1">{product.batch}</td>
                          <td className="p-1">{product.strength}</td>
                          <td className="p-1">
                            {(() => {
                              const availableStock = getAvailableStock(product.medicine_id);
                              return (
                                <Badge variant={availableStock === 0 ? "secondary" : availableStock < 10 ? "destructive" : "default"} className="text-xs">
                                  {availableStock}
                                </Badge>
                              );
                            })()}
                          </td>
                          <td className="p-1">NPR {product.price.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Section: Cart and Billing */}
          <div className="lg:w-1/3 bg-white rounded-md shadow p-2 flex flex-col h-full">
            <h2 className="text-sm font-semibold mb-2">Cart</h2>
            <div className="flex-1 max-h-[200px] overflow-y-auto">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div key={item.cart_key || `cart-item-${index}`} className="flex justify-between items-center py-1 border-b text-xs">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500 text-xs">
                        {item.batch} | NPR {item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty input for editing, don't remove from cart
                          if (value === '') {
                            setCartItems(prevItems => prevItems.map(cartItem =>
                              cartItem.cart_key === item.cart_key ? { ...cartItem, quantity: '' } : cartItem
                            ));
                            return;
                          }
                          const newQty = parseInt(value);
                          if (!isNaN(newQty) && newQty > 0) {
                            setCartItems(prevItems => prevItems.map(cartItem =>
                              cartItem.cart_key === item.cart_key ? { ...cartItem, quantity: newQty } : cartItem
                            ));
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === '' || value === '0') {
                            removeFromCart(item.cart_key);
                            return;
                          }
                          const newQty = parseInt(value) || 1;
                          updateQuantity(item.cart_key, newQty);
                        }}
                        className="w-12 h-5 text-xs text-center"
                        min="1"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-5 w-5"
                        onClick={() => removeFromCart(item.cart_key)}
                      >
                        <Trash2 size={10} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-xs py-4">Cart is empty</p>
              )}
            </div>

            {/* Cart Total Display */}
            {cartItems.length > 0 && (
              <div className="bg-blue-50 p-2 rounded text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Cart Total:</span>
                  <span>NPR {subtotal.toFixed(2)}</span>
                </div>
                {shouldShowTax && (
                  <div className="flex justify-between text-orange-700">
                    <span>Tax ({posSettings.tax_rate}%):</span>
                    <span>NPR {taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Subtotal:</span>
                  <span>NPR {subtotalWithTax.toFixed(2)}</span>
                </div>
                {calculatedDiscountAmount > 0 && (
                  <div className="flex justify-between text-red-700">
                    <span>Less: Discount</span>
                    <span>-NPR {calculatedDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* 1. Input Fields Section */}
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-700 mb-1">📝 Discount</div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger className="h-8 text-sm bg-orange-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="amount">Amount (NPR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    type="number"
                    value={discountType === "percent" ? (customerInfo.discount || "") : (discountAmount || "")}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                      if (discountType === "percent") {
                        setCustomerInfo({ ...customerInfo, discount: value });
                      } else {
                        setDiscountAmount(value);
                      }
                    }}
                    placeholder={discountType === "percent" ? "Enter %" : "Enter NPR"}
                    className="h-8 text-sm bg-orange-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">📝 Payment Mode</div>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      {posSettings.payment_methods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {paymentMethod === "online" && (
                  <div>
                    <Input
                      type="text"
                      placeholder="Transaction ID"
                      className="h-8 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-1" />

            {/* 2. Summary Section */}
            <div className="space-y-1">
              <div className="bg-gray-800 text-white p-1 rounded text-sm">
                <div className="flex justify-between">
                  <span>Total to Pay:</span>
                  <span className="font-bold">NPR {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Separator className="my-1" />

            {/* 3. Payment & Return/Due Section */}
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-700 mb-1">💵 Payment</div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <Input
                    type="number"
                    value={paidAmount || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? "" : parseFloat(e.target.value) || 0;
                      setPaidAmount(value);
                    }}
                    placeholder={`NPR ${total.toFixed(2)}`}
                    className="h-8 text-sm font-medium bg-green-50"
                  />
                </div>
                <div>
                  {paidAmount !== "" && paidAmount > 0 ? (
                    <div className={`p-1 rounded text-sm ${parseFloat(paidAmount) > total ? 'bg-green-100 text-green-800' : parseFloat(paidAmount) < total ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      <div className="flex justify-between">
                        <span>{parseFloat(paidAmount) > total ? 'Return:' : parseFloat(paidAmount) < total ? 'Due:' : 'Exact:'}</span>
                        <span className="font-bold">
                          {parseFloat(paidAmount) === total ? 'NPR 0.00' : `NPR ${Math.abs(total - parseFloat(paidAmount)).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-1 rounded text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Enter payment</span>
                        <span>NPR 0.00</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-1" />

            {/* 4. Action Buttons */}
            <div className="grid grid-cols-3 gap-1">
              <Button 
                className="h-6 text-sm bg-gray-500 hover:bg-gray-600 text-white"
                onClick={handleSaveBill}
              >
                💾 Save
              </Button>
              <Button className={`col-span-2 h-6 text-sm ${parseFloat(paidAmount) < total && paidAmount !== "" ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'}`} onClick={showSalePreview}>
                {parseFloat(paidAmount) < total && paidAmount !== "" ? '🏦 Credit Sale' : '💳 Complete Sale'} - NPR {total.toFixed(2)}
              </Button>
            </div>
          </div>
        </div>

        {/* Bills History Section */}
        <div className="w-full bg-white rounded-md shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Completed Bills</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search bills..."
                  value={billSearch}
                  onChange={(e) => setBillSearch(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={billFilter} onValueChange={setBillFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bills</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Bill ID</th>
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Credit</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBills.map((bill, index) => (
                  <tr key={bill.id || `bill-${index}`} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{bill.id}</td>
                    <td className="p-2">{bill.patientName}</td>
                    <td className="p-2">{bill.patientPhone}</td>
                    <td className="p-2">NPR {bill.total.toFixed(2)}</td>
                    <td className="p-2">
                      {bill.creditAmount > 0 ? (
                        <Badge variant="destructive">NPR {bill.creditAmount.toFixed(2)}</Badge>
                      ) : (
                        <Badge variant="default">Paid</Badge>
                      )}
                    </td>
                    <td className="p-2">
                      <Badge variant={bill.status === "completed" ? "default" : "secondary"}>
                        {bill.status}
                      </Badge>
                    </td>
                    <td className="p-2">{bill.completedAt}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleViewBill(bill)}>
                          <Eye size={14} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
                            const response = await fetch(`http://localhost:8000/api/pos/sales/${bill.id}/receipt/`, {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            
                            if (response.ok) {
                              const receiptData = await response.json();
                              setReceiptData(receiptData);
                              setShowReceiptModal(true);
                            } else {
                              toast({
                                title: "Receipt Error",
                                description: "Failed to generate receipt",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            console.error('Error generating receipt:', error);
                            toast({
                              title: "Receipt Error",
                              description: "Failed to generate receipt",
                              variant: "destructive",
                            });
                          }
                        }}>
                          <Printer size={14} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteBill(bill.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBills.length)} of {filteredBills.length} bills
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm">{currentPage} of {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Details Modal */}
      <Dialog open={showBillModal} onOpenChange={setShowBillModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details - {selectedBill?.id}</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Patient Information</h3>
                  <p><strong>Name:</strong> {selectedBill.patientName}</p>
                  <p><strong>ID:</strong> {selectedBill.patientId}</p>
                  <p><strong>Age:</strong> {selectedBill.patientAge}</p>
                  <p><strong>Phone:</strong> {selectedBill.patientPhone}</p>
                  <p><strong>Gender:</strong> {selectedBill.patientGender}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Bill Summary</h3>
                  <p><strong>Subtotal:</strong> NPR {selectedBill.subtotal.toFixed(2)}</p>
                  <p><strong>Discount:</strong> NPR {selectedBill.discountAmount.toFixed(2)}</p>
                  <p><strong>Tax:</strong> NPR {selectedBill.taxAmount.toFixed(2)}</p>
                  <p><strong>Total:</strong> NPR {selectedBill.total.toFixed(2)}</p>
                  <p><strong>Paid:</strong> NPR {selectedBill.paidAmount.toFixed(2)}</p>
                  <p><strong>Credit:</strong> NPR {selectedBill.creditAmount.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Medicine</th>
                      <th className="p-2 text-left">Batch</th>
                      <th className="p-2 text-left">Qty</th>
                      <th className="p-2 text-left">Price</th>
                      <th className="p-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, index) => (
                      <tr key={item.id || `item-${index}`} className="border-b">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.batch}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">NPR {item.price.toFixed(2)}</td>
                        <td className="p-2">NPR {(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sale Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2" size={18} />
              Sale Preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Patient Info */}
            {(patientName || patientPhone) && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Patient Information</h4>
                {patientName && <p className="text-sm">Name: {patientName}</p>}
                {patientPhone && <p className="text-sm">Phone: {patientPhone}</p>}
                {patientAge && <p className="text-sm">Age: {patientAge}</p>}
                {patientGender && <p className="text-sm">Gender: {patientGender}</p>}
              </div>
            )}
            
            {/* Items */}
            <div>
              <h4 className="font-medium mb-2">Items ({cartItems.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={item.cart_key || `preview-item-${index}`} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">{item.batch} • NPR {item.price} × {item.quantity}</p>
                    </div>
                    <p className="font-medium">NPR {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Summary */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>NPR {subtotal.toFixed(2)}</span>
                </div>
                {shouldShowTax && (
                  <div className="flex justify-between text-sm">
                    <span>Tax ({posSettings.tax_rate}%):</span>
                    <span>NPR {taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {calculatedDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount:</span>
                    <span>-NPR {calculatedDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>NPR {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Payment Method:</span>
                  <Badge variant="outline">{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Paid Amount:</span>
                  <span>NPR {(parseFloat(paidAmount) || 0).toFixed(2)}</span>
                </div>
                {creditAmount > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Credit Amount:</span>
                    <span>NPR {creditAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowPreviewModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowPreviewModal(false);
                  handleCheckout();
                }} 
                className={`flex-1 ${parseFloat(paidAmount) < total && paidAmount !== "" ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'}`}
              >
                Confirm Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <ReceiptModal 
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receiptData={receiptData}
      />
    </div>
  );
}