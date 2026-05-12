import { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ChevronRight, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Banknote,
  Info,
  Camera,
  ArrowRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { CartItem, StoreProfile, UserProfile, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  store: StoreProfile;
  user: UserProfile;
  totalAmount: number;
  onComplete: (paymentDetails: { 
    method: Order['paymentMethod'], 
    transactionId?: string,
    screenshot?: string 
  }) => void;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  store, 
  user, 
  totalAmount,
  onComplete 
}: CheckoutModalProps) {
  const [step, setStep] = useState<'method' | 'details' | 'verification' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<Order['paymentMethod'] | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [showQR, setShowQR] = useState(false);

  const paymentSettings = store.paymentSettings || { 
    codEnabled: true,
    esewaEnabled: false,
    khaltiEnabled: false,
    qrEnabled: false,
    bankEnabled: false
  } as any;

  const methods = [
    { id: 'cod', name: 'Cash on Delivery', icon: Banknote, enabled: paymentSettings.codEnabled, note: 'Pay when items arrive' },
    { id: 'esewa', name: 'eSewa Wallet', icon: Smartphone, enabled: paymentSettings.esewaEnabled, note: 'Instant Mobile Transfer' },
    { id: 'khalti', name: 'Khalti Wallet', icon: Wallet, enabled: paymentSettings.khaltiEnabled, note: 'Instant Mobile Transfer' },
    { id: 'qr', name: 'QR Code Scan', icon: QrCode, enabled: paymentSettings.qrEnabled, note: 'Scan & Pay Instantly' },
    { id: 'bank', name: 'Bank Transfer', icon: CreditCard, enabled: paymentSettings.bankEnabled, note: 'Transfer to Store Account' },
  ] as const;

  const handleNext = () => {
    if (selectedMethod === 'cod') {
      onComplete({ method: 'cod' });
      setStep('success');
    } else {
      setStep('details');
    }
  };

  const handleFinalSubmit = () => {
    onComplete({ 
      method: selectedMethod!, 
      transactionId,
      screenshot: '' // In real app, upload image
    });
    setStep('success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>

        {step === 'method' && (
          <div className="p-8 space-y-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Select Payment</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pay directly to {store.name}</p>
            </div>

            <div className="space-y-3">
              {methods.filter(m => m.enabled).map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={cn(
                    "w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between text-left",
                    selectedMethod === m.id 
                      ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      selectedMethod === m.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
                    )}>
                      <m.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 uppercase tracking-tight">{m.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.note}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedMethod === m.id ? "border-primary bg-primary" : "border-slate-200"
                  )}>
                    {selectedMethod === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4">
               <button 
                 disabled={!selectedMethod}
                 onClick={handleNext}
                 className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-3 transition-all active:scale-95"
               >
                 Continue to pay Rs. {totalAmount.toLocaleString()}
                 <ArrowRight className="w-5 h-5" />
               </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="p-8 space-y-8">
             <div className="flex items-center gap-4">
                <button onClick={() => setStep('method')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400 rotate-90" />
                </button>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Complete Payment</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Follow instructions to pay {selectedMethod?.toUpperCase()}</p>
                </div>
             </div>

             <div className="bg-slate-900 rounded-[2rem] p-8 text-white text-center space-y-6 relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary">Amount to Pay</p>
                   <p className="text-4xl font-black">Rs. {totalAmount.toLocaleString()}</p>
                </div>
                
                {selectedMethod === 'qr' && (
                  <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl animate-in zoom-in-95 duration-500">
                     <img src={paymentSettings.qrImage} className="w-48 h-48 object-contain" />
                  </div>
                )}

                <div className="relative z-10 space-y-4 pt-4 border-t border-white/10">
                   {selectedMethod === 'esewa' && (
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">eSewa ID (Mobile)</p>
                       <p className="text-xl font-black">{paymentSettings.esewaId}</p>
                     </div>
                   )}
                   {selectedMethod === 'khalti' && (
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khalti ID (Mobile)</p>
                       <p className="text-xl font-black">{paymentSettings.khaltiId}</p>
                     </div>
                   )}
                   {selectedMethod === 'bank' && (
                     <div className="space-y-2 text-left bg-white/5 p-5 rounded-2xl border border-white/10">
                       <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bank</span>
                          <span className="text-xs font-black">{paymentSettings.bankName}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Holder</span>
                          <span className="text-xs font-black">{paymentSettings.accountHolder}</span>
                       </div>
                       <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">A/C No</span>
                          <span className="text-sm font-black text-primary">{paymentSettings.accountNumber}</span>
                       </div>
                     </div>
                   )}
                </div>

                {paymentSettings.instructions && (
                  <div className="bg-white/5 p-4 rounded-xl flex gap-3 text-left">
                     <Info className="w-4 h-4 text-primary shrink-0" />
                     <p className="text-[10px] font-medium text-slate-300 leading-tight">{paymentSettings.instructions}</p>
                  </div>
                )}
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Payment Reference / Transaction ID</label>
                   <input 
                     type="text"
                     className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-black outline-none focus:border-primary transition-all uppercase tracking-widest"
                     placeholder="e.g. 5X89W2K..."
                     value={transactionId}
                     onChange={(e) => setTransactionId(e.target.value)}
                   />
                </div>

                <div className="flex items-center gap-4">
                   <button className="flex-1 py-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:border-primary/50 transition-all">
                      <Camera className="w-5 h-5 text-slate-300 group-hover:text-primary" />
                      <span className="text-[8px] font-black text-slate-300 uppercase group-hover:text-primary">Upload Screenshot</span>
                   </button>
                   <div className="w-2/3 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Why verify?</p>
                      <p className="text-[8px] text-slate-300 font-medium">Providing the transaction ID helps the store verify your payment faster and start preparing your order.</p>
                   </div>
                </div>

                <button 
                  disabled={!transactionId}
                  onClick={handleFinalSubmit}
                  className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl shadow-slate-900/20 disabled:opacity-50 transition-all active:scale-95"
                >
                  Confirm Payment
                </button>
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center space-y-8">
             <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
             </div>
             <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Order Placed!</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Your order successfully sent to {store.name}</p>
             </div>
             <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Order Status</span>
                   <span className="text-primary">Processing</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Payment Method</span>
                   <span className="text-slate-800">{selectedMethod?.toUpperCase()}</span>
                </div>
                {selectedMethod !== 'cod' && (
                   <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Ref ID</span>
                      <span className="text-slate-800">{transactionId}</span>
                   </div>
                )}
             </div>
             <button 
               onClick={onClose}
               className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl shadow-slate-900/20 transition-all active:scale-95"
             >
               View My Orders
             </button>
          </div>
        )}

        <div className="bg-slate-50 p-4 flex items-center justify-center gap-3">
           <ShieldCheck className="w-4 h-4 text-slate-400" />
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nepal Mart Secure Marketplace Checkout</p>
        </div>
      </motion.div>
    </div>
  );
}
