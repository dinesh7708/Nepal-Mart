import { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Banknote,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
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
    screenshot?: string,
    status?: Order['paymentStatus']
  }) => void;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  store, 
  totalAmount,
  onComplete 
}: CheckoutModalProps) {
  const [step, setStep] = useState<'method' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<Order['paymentMethod'] | null>(null);

  const methods = [
    { id: 'cod', name: 'Cash on Delivery', icon: Banknote, enabled: true, note: 'Pay when items arrive' },
  ] as const;

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('cod');
    }
  }, [isOpen]);

  const handleNext = () => {
    if (selectedMethod === 'cod') {
      onComplete({ method: 'cod' });
      setStep('success');
    }
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
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pay via Cash on Delivery</p>
            </div>

            <div className="space-y-3">
              {methods.map(m => (
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
                 Confirm Rs. {totalAmount.toLocaleString()}
                 <ArrowRight className="w-5 h-5" />
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
