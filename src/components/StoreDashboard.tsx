/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  DollarSign, 
  Clock, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Box,
  Image as ImageIcon,
  ClipboardList,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  History,
  Utensils,
  CreditCard,
  Wallet,
  QrCode,
  Banknote,
  Upload
} from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { Product, StoreProfile, Order, PaymentSettings, CommissionPayment } from '../types';
import { cn } from '../lib/utils';
import { CATEGORIES } from '../constants';

interface StoreDashboardProps {
  store: StoreProfile;
  products: Product[];
  orders: Order[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateStore: (store: StoreProfile) => void;
  onUpdateOrderStatus: (id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => void;
  commissionPayments?: CommissionPayment[];
  onPayCommission?: (payment: Partial<CommissionPayment>) => void;
}

export function StoreDashboard({ 
  store, 
  products, 
  orders, 
  onUpdateProducts, 
  onUpdateStore, 
  onUpdateOrderStatus,
  commissionPayments = [],
  onPayCommission
}: StoreDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'earnings' | 'settings' | 'payments'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (store.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-6">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-8">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Application Under Review</h2>
            <p className="text-slate-400 text-sm font-medium">Thank you for partnering with Nepal Mart! Our admin team is currently reviewing your documents.</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span>Step</span>
               <span>Status</span>
             </div>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                     <CheckCircle2 className="w-3.5 h-3.5" />
                   </div>
                   <span className="text-xs font-bold text-slate-700 uppercase">Registration</span>
                 </div>
                 <span className="text-[10px] font-black text-green-500 uppercase">Completed</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center">
                     <Clock className="w-3.5 h-3.5" />
                   </div>
                   <span className="text-xs font-bold text-slate-700 uppercase">Verification</span>
                 </div>
                 <span className="text-[10px] font-black text-amber-500 uppercase">In Progress</span>
               </div>
             </div>
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Expected time: 24-48 Working Hours</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all hover:bg-slate-800 active:scale-95"
          >
            Check Status
          </button>
        </div>
      </div>
    );
  }

  if (store.status === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-6">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-8">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Application Rejected</h2>
            <p className="text-slate-400 text-sm font-medium">Unfortunately, your application could not be approved at this time.</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-6 text-left border border-red-100">
             <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Rejection Reason</p>
             <p className="text-sm font-bold text-red-700 leading-relaxed italic">
               "{store.verificationDetails?.rejectionReason || "No specific reason provided. Please contact support."}"
             </p>
          </div>
          <div className="pt-4 space-y-4">
            <button 
              onClick={() => onUpdateStore({ ...store, status: 'pending' as any })} // Simplified: Should go back to edit documents
              className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
            >
              Update Documents & Re-submit
            </button>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalSales = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const commissionPaid = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.commissionAmount || 0), 0);

  const earnings = totalSales - commissionPaid;

  const activeOrders = orders.filter(o => !['delivered', 'rejected'].includes(o.status));
  const orderHistory = orders.filter(o => ['delivered', 'rejected'].includes(o.status));

  // ... rest of the component state logic remains similar ...
  // [KEEPING the previous productForm logic in mind but adding activeTab handlers]

  const handleProductSubmit = (e: FormEvent) => {
    // ... same as before ...
    e.preventDefault();
    if (editingProduct) {
      const updated = products.map(p => p.id === editingProduct.id ? { ...p, ...productForm } as Product : p);
      onUpdateProducts(updated);
    } else {
      const newProduct: Product = {
        ...productForm,
        id: `p-${Math.random().toString(36).substr(2, 9)}`,
        storeId: store.id,
      } as Product;
      onUpdateProducts([...products, newProduct]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 0,
      unit: '',
      category: CATEGORIES[0].id,
      image: '',
      stock: 0,
      isAvailable: true,
      isVeg: true,
      preparationTime: 15,
    });
  };

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    unit: '',
    category: CATEGORIES[0].id,
    image: '',
    stock: 0,
    isAvailable: true,
    isVeg: true,
    preparationTime: 15,
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  const toggleAvailability = (id: string) => {
    onUpdateProducts(products.map(p => 
      p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
    ));
  };

  const [paymentSettingsForm, setPaymentSettingsForm] = useState<PaymentSettings>(store.paymentSettings || {
    codEnabled: true,
    qrEnabled: false,
    esewaEnabled: false,
    khaltiEnabled: false,
    bankEnabled: false
  });

  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [commissionForm, setCommissionForm] = useState({
    amount: 0,
    screenshot: '',
    notes: ''
  });

  const pendingCommission = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.commissionAmount || 0), 0) - 
    commissionPayments
    .filter(cp => cp.status === 'verified')
    .reduce((sum, cp) => sum + cp.amount, 0);

  const handlePaymentSettingsSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateStore({ ...store, paymentSettings: paymentSettingsForm });
    alert("Payment settings updated successfully!");
  };

  const handleCommissionSubmit = (e: FormEvent) => {
    e.preventDefault();
    onPayCommission?.(commissionForm);
    setIsCommissionModalOpen(false);
    setCommissionForm({ amount: 0, screenshot: '', notes: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Box className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{store.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Store Manager</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <span>Status</span>
                  <span className="text-primary">Online</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-primary" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('products')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all text-left",
                activeTab === 'products' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
              )}
            >
              <Package className="w-4 h-4" />
              Products
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all text-left relative",
                activeTab === 'orders' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
              )}
            >
              <ClipboardList className="w-4 h-4" />
              Orders
              {activeOrders.length > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('earnings')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all text-left",
                activeTab === 'earnings' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Earnings
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all text-left",
                activeTab === 'settings' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
              )}
            >
              <Settings className="w-4 h-4" />
              Delivery Settings
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all text-left",
                activeTab === 'payments' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
              )}
            >
              <CreditCard className="w-4 h-4" />
              Payment Setup
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            
            {activeTab === 'products' ? (
              // ... products UI ...
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search items..."
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: '',
                        description: '',
                        price: 0,
                        unit: '',
                        category: CATEGORIES[0].id,
                        image: '',
                        stock: 0,
                        isAvailable: true,
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Product
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-50 overflow-hidden flex-shrink-0">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-800 leading-tight">{product.name}</p>
                                    {store.type === 'restaurant' && (
                                      <div className={cn(
                                        "w-3 h-3 rounded-full border flex items-center justify-center p-[2px]",
                                        product.isVeg ? "border-green-500" : "border-red-500"
                                      )}>
                                        <div className={cn(
                                          "w-full h-full rounded-full",
                                          product.isVeg ? "bg-green-500" : "bg-red-500"
                                        )} />
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{product.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className={cn(
                                  "text-sm font-black",
                                  product.stock < 10 ? "text-red-500" : "text-slate-800"
                                )}>{product.stock} {product.unit}</span>
                                {product.stock < 10 && (
                                  <span className="text-[8px] font-black italic text-red-400 uppercase">Low Stock</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800">Rs. {product.price}</span>
                                {product.discountPrice && (
                                  <span className="text-[10px] text-primary font-bold">Deal: Rs. {product.discountPrice}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => toggleAvailability(product.id)}
                                className={cn(
                                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                  product.isAvailable ? "bg-primary/10 text-primary border border-primary/20" : "bg-slate-100 text-slate-400 border border-slate-200"
                                )}
                              >
                                {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setProductForm(product);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => deleteProduct(product.id)}
                                  className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : activeTab === 'orders' ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Active Orders</h3>
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">{activeOrders.length} New</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {activeOrders.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold">No active orders</p>
                      </div>
                    ) : (
                      activeOrders.map(order => (
                        <div key={order.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Order #{order.id.slice(-6)}</p>
                                <span className={cn(
                                  "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                                  order.status === 'pending' ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"
                                )}>{order.status}</span>
                              </div>
                              <p className="text-xs text-slate-400 font-medium">Customer ID: {order.customerId}</p>
                              <div className="mt-3 space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-600">{item.name} x{item.quantity}</span>
                                    {item.instructions && (
                                      <span className="text-[9px] text-primary italic font-black bg-primary/5 px-2 py-0.5 rounded-full inline-block w-fit mt-0.5">
                                        Inst: {item.instructions}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-slate-800 font-bold mt-2">Total Rs. {order.totalPrice}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {order.status === 'pending' ? (
                                <>
                                  <button 
                                    onClick={() => onUpdateOrderStatus(order.id, 'accepted')}
                                    className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => onUpdateOrderStatus(order.id, 'rejected')}
                                    className="border border-slate-100 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <>
                                  <select 
                                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none pr-8 appearance-none cursor-pointer"
                                    value={order.status}
                                    onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                                  >
                                    <option value="accepted">Accepted</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Completed</option>
                                  </select>
                                  <button 
                                    onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all"
                                  >
                                    Mark Delivered
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-50">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Order History</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {orderHistory.map(order => (
                      <div key={order.id} className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            order.status === 'delivered' ? "bg-primary/10 text-primary" : "bg-red-50 text-red-400"
                          )}>
                            {order.status === 'delivered' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Order #{order.id.slice(-6)}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-800">Rs. {order.totalPrice}</p>
                          <p className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            order.status === 'delivered' ? "text-primary" : "text-red-500"
                          )}>{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === 'earnings' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-900/10 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Sales</p>
                    <div className="space-y-1">
                      <p className="text-3xl font-black">Rs. {totalSales.toLocaleString()}</p>
                      <p className="text-[10px] opacity-80 font-bold">Gross revenue</p>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission Paid</p>
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-red-500">Rs. {commissionPaid.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Platform fee ({store.commissionRate || '5'}%)</p>
                    </div>
                  </div>
                  <div className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/20 flex flex-col justify-between">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Pending Commission</p>
                      <div className="space-y-1">
                        <p className="text-3xl font-black">Rs. {pendingCommission.toLocaleString()}</p>
                        <p className="text-[10px] opacity-80 font-bold">Pay to Admin</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setCommissionForm({...commissionForm, amount: pendingCommission});
                        setIsCommissionModalOpen(true);
                      }}
                      className="mt-6 bg-white text-slate-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Commission Payments</h3>
                  </div>
                  <div className="space-y-6">
                    {commissionPayments.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-sm">No commission payments made yet</div>
                    ) : (
                      commissionPayments.slice().reverse().map(cp => (
                        <div key={cp.id} className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                               "w-10 h-10 rounded-xl flex items-center justify-center",
                               cp.status === 'verified' ? "bg-green-50 text-green-600" : cp.status === 'rejected' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                             )}>
                               <History className="w-5 h-5" />
                             </div>
                             <div>
                               <p className="text-xs font-black text-slate-800">Payment #{cp.id.slice(-6)}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(cp.createdAt).toLocaleDateString()} • {cp.status}</p>
                             </div>
                          </div>
                          <p className="text-sm font-black text-slate-800">Rs. {cp.amount.toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Earning Transactions</h3>
                    <div className="flex gap-2">
                       <button className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all hover:bg-slate-100">Filter By Date</button>
                       <button className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all hover:bg-primary/20">Download Report</button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {orderHistory.filter(o => o.status === 'delivered').length === 0 ? (
                      <div className="py-20 text-center text-slate-400 text-sm">No completed transactions found</div>
                    ) : (
                      orderHistory.filter(o => o.status === 'delivered').slice().reverse().map(o => (
                        <div key={o.id} className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800">Order #{o.id.slice(-6)}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString()} • {o.items.length} items</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-800">Rs. {o.totalPrice.toLocaleString()}</p>
                            <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">Comm: -Rs. {o.commissionAmount?.toLocaleString()}</p>
                            <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Net: Rs. {o.storeEarnings?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === 'payments' ? (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Payment Setup</h3>
                      <p className="text-xs text-slate-400 mt-1">Configure how customers pay you directly.</p>
                    </div>
                  </div>

                  <form onSubmit={handlePaymentSettingsSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* COD */}
                      <div className="p-6 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                              <Banknote className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Cash on Delivery</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setPaymentSettingsForm({...paymentSettingsForm, codEnabled: !paymentSettingsForm.codEnabled})}
                            className="focus:outline-none"
                          >
                            {paymentSettingsForm.codEnabled ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                          </button>
                        </div>
                      </div>

                      {/* eSewa */}
                      <div className="p-6 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-black text-[10px]">eS</div>
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">eSewa Wallet</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setPaymentSettingsForm({...paymentSettingsForm, esewaEnabled: !paymentSettingsForm.esewaEnabled})}
                          >
                            {paymentSettingsForm.esewaEnabled ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                          </button>
                        </div>
                        {paymentSettingsForm.esewaEnabled && (
                          <input 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none border-dashed"
                            placeholder="eSewa ID (Mobile Number)"
                            value={paymentSettingsForm.esewaId || ''}
                            onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, esewaId: e.target.value})}
                          />
                        )}
                      </div>

                      {/* Khalti */}
                      <div className="p-6 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-black text-[10px]">Kh</div>
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Khalti Wallet</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setPaymentSettingsForm({...paymentSettingsForm, khaltiEnabled: !paymentSettingsForm.khaltiEnabled})}
                          >
                            {paymentSettingsForm.khaltiEnabled ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                          </button>
                        </div>
                        {paymentSettingsForm.khaltiEnabled && (
                          <input 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none border-dashed"
                            placeholder="Khalti Mobile Number"
                            value={paymentSettingsForm.khaltiId || ''}
                            onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, khaltiId: e.target.value})}
                          />
                        )}
                      </div>

                      {/* Bank */}
                      <div className="p-6 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                              <Wallet className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Bank Transfer</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setPaymentSettingsForm({...paymentSettingsForm, bankEnabled: !paymentSettingsForm.bankEnabled})}
                          >
                            {paymentSettingsForm.bankEnabled ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                          </button>
                        </div>
                        {paymentSettingsForm.bankEnabled && (
                          <div className="space-y-2">
                             <input 
                               className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-[10px] font-bold outline-none"
                               placeholder="Bank Name"
                               value={paymentSettingsForm.bankName || ''}
                               onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, bankName: e.target.value})}
                             />
                             <input 
                               className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-[10px] font-bold outline-none"
                               placeholder="Account Holder Name"
                               value={paymentSettingsForm.accountHolder || ''}
                               onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, accountHolder: e.target.value})}
                             />
                             <input 
                               className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-[10px] font-bold outline-none"
                               placeholder="Account Number"
                               value={paymentSettingsForm.accountNumber || ''}
                               onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, accountNumber: e.target.value})}
                             />
                          </div>
                        )}
                      </div>

                      {/* QR */}
                      <div className="p-6 rounded-2xl border border-slate-100 space-y-4 col-span-1 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                              <QrCode className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">QR Code Payment</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setPaymentSettingsForm({...paymentSettingsForm, qrEnabled: !paymentSettingsForm.qrEnabled})}
                          >
                            {paymentSettingsForm.qrEnabled ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                          </button>
                        </div>
                        {paymentSettingsForm.qrEnabled && (
                          <div className="flex flex-col md:flex-row gap-6">
                             <div className="w-40 h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden shrink-0">
                                {paymentSettingsForm.qrImage ? (
                                  <img src={paymentSettingsForm.qrImage} className="w-full h-full object-cover" />
                                ) : (
                                  <>
                                    <Upload className="w-6 h-6 text-slate-300" />
                                    <span className="text-[8px] font-black text-slate-300 uppercase mt-2">Upload QR</span>
                                  </>
                                )}
                             </div>
                             <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">QR Image URL</label>
                                  <input 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none"
                                    placeholder="Paste URL of your payment QR code"
                                    value={paymentSettingsForm.qrImage || ''}
                                    onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, qrImage: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Special Instructions</label>
                                  <textarea 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none resize-none"
                                    placeholder="Any message for customer during payment..."
                                    rows={2}
                                    value={paymentSettingsForm.instructions || ''}
                                    onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, instructions: e.target.value})}
                                  />
                                </div>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                    >
                      Save Payment Settings
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Delivery Configuration</h3>
                    <p className="text-xs text-slate-400 mt-1">Manage how you deliver items to your local customers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Delivery Charge (Rs.)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                          value={store.deliveryCharge}
                          onChange={e => onUpdateStore({...store, deliveryCharge: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Delivery Radius (KM)</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                          value={store.deliveryRadius}
                          onChange={e => onUpdateStore({...store, deliveryRadius: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Min. Order Amount (Rs.)</label>
                      <div className="relative">
                        <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                          value={store.minOrderAmount}
                          onChange={e => onUpdateStore({...store, minOrderAmount: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Free Delivery Threshold (Rs.)</label>
                      <div className="relative">
                        <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                          value={store.freeDeliveryThreshold}
                          placeholder="Optional: e.g. 500"
                          onChange={e => onUpdateStore({...store, freeDeliveryThreshold: e.target.value ? Number(e.target.value) : undefined})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Note on Delivery Charges</p>
                      <p className="text-[10px] text-amber-600 mt-1 italic">Nepal Mart doesn't handle delivery. You are responsible for fulfilling orders within your specified radius. Updates reflect instantly to customers.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Commission Payment Modal */}
      <AnimatePresence>
        {isCommissionModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsCommissionModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl space-y-6"
            >
               <div>
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Pay Admin Commission</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Please transfer commission to platform bank/wallet</p>
               </div>

               <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Payable Amount:</span>
                    <span className="text-lg font-black text-slate-900">Rs. {commissionForm.amount.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest">Platform Payment Details:</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                           <p className="text-[8px] font-black uppercase text-slate-400">eSewa ID</p>
                           <p className="text-[10px] font-bold text-slate-800">9801234567</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                           <p className="text-[8px] font-black uppercase text-slate-400">Khalti ID</p>
                           <p className="text-[10px] font-bold text-slate-800">9801234567</p>
                        </div>
                     </div>
                  </div>
               </div>

               <form onSubmit={handleCommissionSubmit} className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Payment Screenshot URL</label>
                   <input 
                     required
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none"
                     placeholder="Paste screenshot link after payment"
                     value={commissionForm.screenshot}
                     onChange={e => setCommissionForm({...commissionForm, screenshot: e.target.value})}
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Notes (Optional)</label>
                   <textarea 
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none resize-none"
                     placeholder="Any transaction details..."
                     rows={2}
                     value={commissionForm.notes}
                     onChange={e => setCommissionForm({...commissionForm, notes: e.target.value})}
                   />
                 </div>
                 <button 
                   type="submit"
                   className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   Submit Payment Proof
                 </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <div className="w-full md:w-5/12 bg-slate-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
                <div className="w-32 h-32 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden group cursor-pointer hover:border-primary transition-all">
                  {productForm.image ? (
                    <img src={productForm.image} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center px-4">Upload Product Image</span>
                    </>
                  )}
                </div>
                <div className="mt-6 w-full space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={productForm.image}
                    onChange={e => setProductForm({...productForm, image: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex-1 p-8 overflow-y-auto max-h-[80vh] md:max-h-none">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Fill in the details for Nepal Mart</p>
                  </div>
                  <button onClick={() => setIsProductModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all">
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Product Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Basmati Rice 5KG"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={productForm.name}
                      onChange={e => setProductForm({...productForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={productForm.category}
                      onChange={e => setProductForm({...productForm, category: e.target.value})}
                    >
                      {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Price (Rs.)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={productForm.price}
                      onChange={e => setProductForm({...productForm, price: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Unit</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. 500g, 1L, Pcs"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={productForm.unit}
                      onChange={e => setProductForm({...productForm, unit: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Stock Quantity</label>
                    <input 
                      required
                      type="number" 
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={productForm.stock}
                      onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})}
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                    <textarea 
                      rows={2}
                      placeholder="Briefly describe the product..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                      value={productForm.description}
                      onChange={e => setProductForm({...productForm, description: e.target.value})}
                    />
                  </div>

                  {store.type === 'restaurant' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Dietary Type</label>
                        <div className="flex gap-4 p-1 bg-slate-50 rounded-xl border border-slate-100">
                          <button 
                            type="button"
                            onClick={() => setProductForm({...productForm, isVeg: true})}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                              productForm.isVeg ? "bg-white text-green-600 shadow-sm border border-green-100" : "text-slate-400"
                            )}
                          >
                            Veg
                          </button>
                          <button 
                            type="button"
                            onClick={() => setProductForm({...productForm, isVeg: false})}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                              !productForm.isVeg ? "bg-white text-red-600 shadow-sm border border-red-100" : "text-slate-400"
                            )}
                          >
                            Non-Veg
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Prep Time (Mins)</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="number" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                            value={productForm.preparationTime}
                            onChange={e => setProductForm({...productForm, preparationTime: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="col-span-2 pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all"
                    >
                      {editingProduct ? 'Save Changes' : 'Add to Inventory'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
