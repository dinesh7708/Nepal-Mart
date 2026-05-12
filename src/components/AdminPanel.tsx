import { useState, useEffect, FormEvent } from 'react';
import { 
  BarChart3, 
  Users, 
  Store, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  Plus,
  CheckCircle2,
  XCircle,
  DollarSign,
  Percent,
  ChevronRight,
  TrendingDown,
  Eye,
  FileText,
  Clock,
  MapPin,
  Phone,
  User,
  ExternalLink,
  MessageSquare,
  Mail,
  Wallet,
  History,
  CheckCircle,
  XCircle as XCircleIcon,
  QrCode,
  Banknote,
  Upload
} from 'lucide-react';
import { SupportTicket, StoreProfile, Product, Order, SupportSettings, CommissionPayment, WithdrawalRequest, UserReport } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  stores: StoreProfile[];
  orders: Order[];
  tickets?: SupportTicket[];
  globalCommission: number;
  onUpdateGlobalCommission: (rate: number) => void;
  onUpdateStoreCommission: (id: string, rate: number) => void;
  onApproveStore: (id: string) => void;
  onRejectStore: (id: string, reason: string) => void;
  onSuspendStore?: (id: string) => void;
  onResolveTicket?: (id: string) => void;
  reports?: UserReport[];
  onResolveReport?: (id: string) => void;
  supportSettings?: SupportSettings;
  onUpdateSupportSettings?: (settings: SupportSettings) => void;
  commissionPayments?: CommissionPayment[];
  onVerifyCommission?: (id: string, status: CommissionPayment['status'], notes?: string) => void;
  withdrawals?: WithdrawalRequest[];
  onWithdraw?: (request: Partial<WithdrawalRequest>) => void;
  adminWithdrawalSettings?: any;
  onUpdateAdminWithdrawalSettings?: (settings: any) => void;
}

export function AdminPanel({ 
  stores, 
  orders, 
  tickets = [],
  globalCommission, 
  onUpdateGlobalCommission,
  onUpdateStoreCommission,
  onApproveStore, 
  onRejectStore,
  onSuspendStore,
  onResolveTicket,
  reports = [],
  onResolveReport,
  supportSettings,
  onUpdateSupportSettings,
  commissionPayments = [],
  onVerifyCommission,
  withdrawals = [],
  onWithdraw,
  adminWithdrawalSettings,
  onUpdateAdminWithdrawalSettings
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'revenue' | 'verifications' | 'tickets' | 'settings' | 'payouts' | 'reports'>('overview');
  const [editingGlobal, setEditingGlobal] = useState(false);
  const [newRate, setNewRate] = useState(globalCommission);
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [settingsForm, setSettingsForm] = useState<SupportSettings>(supportSettings || {
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    updatedAt: Date.now()
  });

  const [withdrawalForm, setWithdrawalForm] = useState<any>(adminWithdrawalSettings || {
    esewaId: '',
    khaltiId: '',
    bankDetails: '',
    qrImage: ''
  });

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  useEffect(() => {
    if (supportSettings) {
      setSettingsForm(supportSettings);
    }
  }, [supportSettings]);

  useEffect(() => {
    if (adminWithdrawalSettings) {
      setWithdrawalForm(adminWithdrawalSettings);
    }
  }, [adminWithdrawalSettings]);

  const handleSettingsSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateSupportSettings?.(settingsForm);
  };

  const totalSales = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalCommission = orders.reduce((acc, o) => acc + (o.commissionAmount || 0), 0);
  const activeStoresCount = stores.filter(s => s.status === 'approved').length;
  const pendingStoresCount = stores.filter(s => s.status === 'pending').length;

  const stats = [
    { label: 'Total Platform Sales', value: `Rs. ${totalSales.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Platform Commissions', value: `Rs. ${totalCommission.toLocaleString()}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Partners', value: activeStoresCount.toString(), icon: Store, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pending Approvals', value: pendingStoresCount.toString(), icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const pendingStores = stores.filter(s => s.status === 'pending');
  const approvedStores = stores.filter(s => s.status === 'approved' || s.status === 'suspended');

  const storeReports = approvedStores.map(store => {
    const storeOrders = orders.filter(o => o.storeId === store.id);
    const storeSales = storeOrders.reduce((acc, o) => acc + o.totalPrice, 0);
    const storeCommissions = storeOrders.reduce((acc, o) => acc + (o.commissionAmount || 0), 0);
    const storeEarnings = storeSales - storeCommissions;
    return {
      ...store,
      sales: storeSales,
      commission: storeCommissions,
      earnings: storeEarnings
    };
  }).sort((a, b) => b.sales - a.sales);

  const selectedStore = stores.find(s => s.id === selectedVerificationId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">Platform Admin</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage Nepal Mart ecosystem and revenue</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {(['overview', 'verifications', 'stores', 'revenue', 'payouts', 'reports', 'tickets', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
              {tab === 'verifications' && pendingStoresCount > 0 && (
                <span className="ml-2 bg-red-500 text-white w-4 h-4 rounded-full inline-flex items-center justify-center text-[8px]">
                  {pendingStoresCount}
                </span>
              )}
              {tab === 'payouts' && commissionPayments.filter(cp => cp.status === 'pending').length > 0 && (
                <span className="ml-2 bg-primary text-white w-4 h-4 rounded-full inline-flex items-center justify-center text-[8px]">
                  {commissionPayments.filter(cp => cp.status === 'pending').length}
                </span>
              )}
              {tab === 'reports' && reports.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white w-4 h-4 rounded-full inline-flex items-center justify-center text-[8px]">
                  {reports.filter(r => r.status === 'pending').length}
                </span>
              )}
              {tab === 'tickets' && tickets.filter(t => t.status === 'open').length > 0 && (
                <span className="ml-2 bg-primary text-white w-4 h-4 rounded-full inline-flex items-center justify-center text-[8px]">
                  {tickets.filter(t => t.status === 'open').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-black text-slate-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Commission Revenue (Monthly)
              </h3>
              <div className="h-64 flex items-end justify-between gap-2 pt-4">
                {[25, 40, 30, 60, 50, 80, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className="w-full bg-primary/20 rounded-t-lg group relative hover:bg-primary transition-colors cursor-help"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Rs. {(h * 1000).toLocaleString()}
                      </div>
                    </motion.div>
                    <span className="text-[10px] font-bold text-slate-400">Month {i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary">Global Config</h3>
                  <Percent className="w-4 h-4 text-primary" />
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/10">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Commission Rate</span>
                    {editingGlobal ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={newRate}
                          onChange={(e) => setNewRate(Number(e.target.value))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-lg font-black outline-none focus:border-primary"
                        />
                        <button 
                          onClick={() => {
                            onUpdateGlobalCommission(newRate);
                            setEditingGlobal(false);
                          }}
                          className="bg-primary text-white p-2 rounded-lg"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-black text-2xl">{globalCommission}%</span>
                        <button 
                          onClick={() => setEditingGlobal(true)}
                          className="text-[10px] font-bold text-primary hover:underline uppercase"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sponsored Fee</span>
                      <span className="font-black">Rs. 50/day</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payout Cycle</span>
                      <span className="font-black uppercase">Instant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'verifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Pending Verification</h3>
                <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black">{pendingStores.length} NEW</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto no-scrollbar">
                {pendingStores.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm italic">All stores verified!</div>
                ) : (
                  pendingStores.map(store => (
                    <button 
                      key={store.id} 
                      onClick={() => setSelectedVerificationId(store.id)}
                      className={cn(
                        "w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all text-left",
                        selectedVerificationId === store.id ? "bg-primary/5 border-l-4 border-l-primary" : ""
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                          <img src={store.logo || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop"} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">{store.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{store.category} • {store.address}</p>
                          <p className="text-[8px] font-black text-primary uppercase bg-primary/5 px-1.5 py-0.5 rounded mt-1 inline-block">
                            Submitted {new Date(store.verificationDetails?.submittedAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedStore ? (
                <motion.div 
                  key={selectedStore.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
                        <img src={selectedStore.logo || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop"} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{selectedStore.name}</h3>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">{selectedStore.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                         <ExternalLink className="w-5 h-5" />
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-500">
                        <User className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Owner Name</p>
                          <p className="text-sm font-bold">{selectedStore.verificationDetails?.ownerFullName || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <Phone className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Contact</p>
                          <p className="text-sm font-bold">{selectedStore.contactNumber}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-500">
                        <MapPin className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Address</p>
                          <p className="text-sm font-bold">{selectedStore.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Operating Hours</p>
                          <p className="text-sm font-bold">{selectedStore.openingTime} - {selectedStore.closingTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Uploaded Documents
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(selectedStore.verificationDetails?.documents || {}).map(([key, url]) => (
                        url ? (
                          <div key={key} className="space-y-2">
                             <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 group relative">
                               <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <button className="text-white p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                   <Eye className="w-5 h-5" />
                                 </button>
                               </div>
                             </div>
                             <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest">
                               {key === 'idCard' ? 'Citizenship' : key === 'shopFront' ? 'Shop Front' : 'License'}
                             </p>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>

                  {isRejecting ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-6 bg-red-50 rounded-2xl border border-red-100">
                      <div className="flex items-center gap-2 text-red-600">
                        <MessageSquare className="w-5 h-5" />
                        <h4 className="font-black uppercase text-sm">Rejection Reason</h4>
                      </div>
                      <textarea 
                        className="w-full bg-white border border-red-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. ID card is blurry, please re-upload clear photos."
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsRejecting(false)}
                          className="flex-1 py-3 bg-white border border-red-200 text-red-500 rounded-xl font-black uppercase text-[10px] transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            if (!rejectionReason) return;
                            onRejectStore(selectedStore.id, rejectionReason);
                            setSelectedVerificationId(null);
                            setIsRejecting(false);
                            setRejectionReason('');
                          }}
                          className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black uppercase text-[10px] transition-all shadow-lg shadow-red-500/20"
                        >
                          Confirm Reject
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setIsRejecting(true)}
                        className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
                      >
                        Reject Application
                      </button>
                      <button 
                        onClick={() => {
                          onApproveStore(selectedStore.id);
                          setSelectedVerificationId(null);
                        }}
                        className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                      >
                        Approve & Activate
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-10 h-10 text-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-400 uppercase">No Store Selected</h4>
                    <p className="text-xs text-slate-300 font-medium">Select a pending application from the left to start verification.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-800 uppercase tracking-tight">Store Commission Reports</h3>
            <div className="flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-primary" />
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue by Store</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4">Total Sales</th>
                  <th className="px-6 py-4">Commission (%)</th>
                  <th className="px-6 py-4">Commission Paid</th>
                  <th className="px-6 py-4">Final Earnings</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {storeReports.map(store => (
                  <tr key={store.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          <img src={store.logo || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop"} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{store.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{store.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">Rs. {store.sales.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                          {store.commissionRate || globalCommission}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-red-500">- Rs. {store.commission.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-black text-green-600">Rs. {store.earnings.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stores' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Active Partners & Commission Rates</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {approvedStores.map(store => (
                <div key={store.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <img src={store.logo || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop"} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{store.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active since {new Date(store.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Commission Rate</span>
                      <div className="flex items-center gap-2 mt-1">
                        <input 
                          type="number" 
                          defaultValue={store.commissionRate || globalCommission}
                          className="w-16 bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs font-black text-center outline-none focus:border-primary"
                          onBlur={(e) => onUpdateStoreCommission(store.id, Number(e.target.value))}
                        />
                        <span className="text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => onSuspendStore?.(store.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                          store.status === 'suspended' ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                        )}
                      >
                        {store.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <button className="bg-slate-900 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-900/10 space-y-6">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Platform Earning</p>
                    <Wallet className="w-5 h-5 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-4xl font-black">Rs. {totalCommission.toLocaleString()}</p>
                    <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Total Commission from all stores</p>
                 </div>
                 <button 
                   onClick={() => {
                     setWithdrawAmount(totalCommission);
                     setIsWithdrawModalOpen(true);
                   }}
                   className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   Withdraw Platform Earnings
                 </button>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Withdrawal Setup</p>
                    <QrCode className="w-5 h-5 text-slate-400" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase">eSewa ID</p>
                       <p className="text-sm font-black truncate">{withdrawalForm.esewaId || 'Not Set'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase">Khalti ID</p>
                       <p className="text-sm font-black truncate">{withdrawalForm.khaltiId || 'Not Set'}</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setActiveTab('settings')}
                   className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                 >
                   Update Withdrawal Methods
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="font-black text-slate-800 uppercase tracking-tight">Pending Commission Verifications</h3>
                 <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black">
                   {commissionPayments.filter(cp => cp.status === 'pending').length} ACTION NEEDED
                 </span>
              </div>
              <div className="divide-y divide-slate-50">
                 {commissionPayments.filter(cp => cp.status === 'pending').length === 0 ? (
                   <div className="p-20 text-center text-slate-400 text-sm italic">No pending verifications</div>
                 ) : (
                   commissionPayments.filter(cp => cp.status === 'pending').map(cp => {
                     const store = stores.find(s => s.id === cp.storeId);
                     return (
                       <div key={cp.id} className="p-6 flex items-center justify-between animate-in fade-in slide-in-from-right-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                <img src={store?.logo} className="w-full h-full object-cover" />
                             </div>
                             <div>
                                <h4 className="text-sm font-black text-slate-800">{store?.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  Rs. {cp.amount.toLocaleString()} • {cp.paymentMethod} • {new Date(cp.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-[10px] text-primary font-black mt-1">Ref: {cp.transactionId}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => onVerifyCommission?.(cp.id, 'rejected', 'Invalid transaction reference')}
                               className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                               title="Reject"
                             >
                               <XCircleIcon className="w-5 h-5" />
                             </button>
                             <button 
                               onClick={() => onVerifyCommission?.(cp.id, 'verified')}
                               className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                             >
                               Verify Payment
                             </button>
                          </div>
                       </div>
                     );
                   })
                 )}
              </div>
           </div>

           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="font-black text-slate-800 uppercase tracking-tight">Recent Payouts & History</h3>
                 <History className="w-5 h-5 text-slate-200" />
              </div>
              <div className="divide-y divide-slate-50">
                 {commissionPayments.filter(cp => cp.status !== 'pending').length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm italic">No history found</div>
                 ) : (
                    commissionPayments.filter(cp => cp.status !== 'pending').slice().reverse().map(cp => {
                      const store = stores.find(s => s.id === cp.storeId);
                      return (
                        <div key={cp.id} className="p-6 flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                cp.status === 'verified' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                              )}>
                                 {cp.status === 'verified' ? <CheckCircle className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-800 leading-none">{store?.name}</h4>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                   Rs. {cp.amount.toLocaleString()} • {cp.status}
                                 </p>
                              </div>
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(cp.createdAt).toLocaleDateString()}</p>
                        </div>
                      );
                    })
                 )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Support Tickets & Reports</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tickets.length} Total</span>
             </div>
             <div className="divide-y divide-slate-50">
               {tickets.length === 0 ? (
                 <div className="p-20 text-center space-y-4">
                    <MessageSquare className="w-12 h-12 text-slate-100 mx-auto" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No tickets reported yet</p>
                 </div>
               ) : (
                 tickets.map(ticket => (
                    <div key={ticket.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                       <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-8 h-8 rounded-lg flex items-center justify-center",
                               ticket.status === 'open' ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                             )}>
                                <AlertCircle className="w-4 h-4" />
                             </div>
                             <h4 className="font-black text-slate-800 uppercase tracking-tight">{ticket.subject.replace('_', ' ')}</h4>
                             <span className={cn(
                               "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                               ticket.status === 'open' ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                             )}>{ticket.status}</span>
                          </div>
                          <div className="bg-slate-100/50 p-4 rounded-xl text-xs text-slate-600 font-medium leading-relaxed">
                             "{ticket.message}"
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {ticket.name}</span>
                             <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {ticket.email}</span>
                             <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleString()}</span>
                          </div>
                       </div>
                       {ticket.status === 'open' && (
                         <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onResolveTicket?.(ticket.id)}
                              className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                              Resolve Ticket
                            </button>
                         </div>
                       )}
                    </div>
                 ))
               )}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Platform Moderation & Reports</h3>
                <span className="text-[10px] font-black text-red-500">{reports.filter(r => r.status === 'pending').length} New Reports</span>
              </div>
              <div className="divide-y divide-slate-50">
                 {reports.length === 0 ? (
                   <div className="p-20 text-center italic text-slate-400">No reports found</div>
                 ) : (
                   reports.slice().reverse().map(report => (
                     <div key={report.id} className="p-6 space-y-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter",
                                report.targetType === 'store' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                              )}>{report.targetType}</span>
                              <h4 className="font-black text-slate-800 uppercase tracking-tight">{report.reason.replace('_', ' ')}</h4>
                              <span className={cn(
                                "text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter border",
                                report.status === 'pending' ? "border-amber-200 text-amber-600" : "border-green-200 text-green-600"
                              )}>{report.status}</span>
                           </div>
                           <p className="text-[10px] font-bold text-slate-400">{new Date(report.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 text-xs font-medium text-slate-600">
                           {report.description}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase">Reporter: {report.reporterName} ({report.reporterId})</p>
                           {report.status === 'pending' && (
                             <button 
                               onClick={() => onResolveReport?.(report.id)}
                               className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-all"
                             >
                               Mark Resolved
                             </button>
                           )}
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
           <div>
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Support & Contact Settings</h3>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Update customer care details across the app</p>
           </div>

           <form onSubmit={handleSettingsSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Support Email</label>
                 <input 
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                   value={settingsForm.email}
                   onChange={e => setSettingsForm({...settingsForm, email: e.target.value})}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Care Phone</label>
                 <input 
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                   value={settingsForm.phone}
                   onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})}
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">WhatsApp Number</label>
                 <input 
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                   value={settingsForm.whatsapp}
                   onChange={e => setSettingsForm({...settingsForm, whatsapp: e.target.value})}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Office Address</label>
                 <input 
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                   value={settingsForm.address}
                   onChange={e => setSettingsForm({...settingsForm, address: e.target.value})}
                 />
               </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-slate-50">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Social Media Links</h4>
               <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600">
                       <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </div>
                    <input 
                      placeholder="Facebook URL"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                      value={settingsForm.facebook || ''}
                      onChange={e => setSettingsForm({...settingsForm, facebook: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-600">
                       <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </div>
                    <input 
                      placeholder="Instagram URL"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                      value={settingsForm.instagram || ''}
                      onChange={e => setSettingsForm({...settingsForm, instagram: e.target.value})}
                    />
                  </div>
               </div>
             </div>

             <button 
               type="submit"
               className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 mt-6"
             >
               Save Changes
             </button>
           </form>
        </div>
      )}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
           >
              <div className="p-8 bg-slate-900 text-white space-y-2">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase tracking-tight">Withdrawal Request</h3>
                    <button onClick={() => setIsWithdrawModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><XCircleIcon className="w-6 h-6" /></button>
                 </div>
                 <p className="text-xs text-primary font-bold uppercase tracking-widest">Platform Revenue Payout</p>
              </div>

              <div className="p-8 space-y-6">
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdrawal Amount</p>
                    <p className="text-3xl font-black text-slate-900">Rs. {withdrawAmount.toLocaleString()}</p>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Payout Method</p>
                    <div className="grid grid-cols-2 gap-3">
                       <button className="p-4 rounded-2xl border-2 border-primary bg-primary/5 flex flex-col items-center gap-2">
                          <Banknote className="w-6 h-6 text-primary" />
                          <span className="text-[10px] font-black uppercase">Bank Acc</span>
                       </button>
                       <button className="p-4 rounded-2xl border flex flex-col items-center gap-2 text-slate-400">
                          <QrCode className="w-6 h-6" />
                          <span className="text-[10px] font-black uppercase">eSewa/QR</span>
                       </button>
                    </div>
                 </div>

                 <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-[10px] text-amber-700 font-bold leading-tight">This will create a recorded transaction for your accounting. Funds will represent your take-home revenue.</p>
                 </div>

                 <button 
                   onClick={() => {
                     onWithdraw?.({ amount: withdrawAmount, method: 'bank', status: 'completed' });
                     setIsWithdrawModalOpen(false);
                   }}
                   className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-slate-900/20 active:scale-95"
                 >
                   Confirm & Record
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
