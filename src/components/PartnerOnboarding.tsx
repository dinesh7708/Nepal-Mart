/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  Store as StoreIcon, 
  User as UserIcon,
  Clock,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { cn } from '../lib/utils';

interface PartnerOnboardingProps {
  onComplete: (data: any) => void;
}

export function PartnerOnboarding({ onComplete }: PartnerOnboardingProps) {
  const [step, setStep] = useState(1);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: '',
    ownerFullName: '',
    type: 'grocery' as 'grocery' | 'restaurant',
    category: 'Grocery',
    address: '',
    phone: '',
    openingTime: '08:00',
    closingTime: '20:00',
    documents: {
      shopFront: '',
      idCard: '',
      license: ''
    }
  });

  const groceryCategories = ['Grocery', 'Bakery', 'Meat & Poultry', 'Pharmacy', 'Local Specialty', 'Electronics', 'Fashion'];
  const restaurantCategories = ['Fast Food', 'Fine Dining', 'Cafe', 'Bakery', 'Local Nepali', 'Indian', 'Continental'];

  const categories = formData.type === 'grocery' ? groceryCategories : restaurantCategories;

  const handleSendOtp = () => {
    if (!formData.phone || formData.phone.length < 10) return;
    setIsVerifyingOtp(true);
    // Simulate API call
    setTimeout(() => {
      setOtpSent(true);
      setIsVerifyingOtp(false);
      // In a real app, this would send an SMS
      console.log('OTP Sent: 123456');
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otpCode === '123456') {
      setIsOtpVerified(true);
      setStep(3);
    } else {
      alert('Invalid OTP. Use 123456 for demo.');
    }
  };

  const handleFileUpload = (field: 'shopFront' | 'idCard' | 'license') => {
    // Simulate file upload with placeholder images
    const placeholders = {
      shopFront: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop',
      idCard: 'https://images.unsplash.com/photo-1554224155-169641357599?w=800&auto=format&fit=crop',
      license: 'https://images.unsplash.com/photo-1554224154-22dec7786151?w=800&auto=format&fit=crop'
    };
    
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: placeholders[field]
      }
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 3) {
      if (!formData.documents.shopFront || !formData.documents.idCard) {
        alert('Please upload mandatory documents.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      onComplete({
        ...formData,
        status: 'pending',
        verificationDetails: {
          ownerFullName: formData.ownerFullName,
          mobileVerified: true,
          documents: formData.documents,
          submittedAt: Date.now()
        }
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="mb-12 text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <StoreIcon className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Partner Store Registration</h2>
        <p className="text-slate-500">Join Nepal Mart and start growing your local business today.</p>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 pt-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={cn(
                "h-1.5 w-12 rounded-full transition-all",
                step >= i ? "bg-primary" : "bg-slate-100"
              )} />
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-primary">
                <Building2 className="w-5 h-5" />
                <h3 className="text-lg font-black uppercase">Store Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Store Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Kathmandu Fresh Mart"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={formData.storeName}
                    onChange={e => setFormData({...formData, storeName: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Owner Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="text" 
                      placeholder="Enter legal name"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={formData.ownerFullName}
                      onChange={e => setFormData({...formData, ownerFullName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Business Type</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                      value={formData.type}
                      onChange={e => {
                        const type = e.target.value as 'grocery' | 'restaurant';
                        setFormData({
                          ...formData, 
                          type,
                          category: type === 'grocery' ? 'Grocery' : 'Fast Food'
                        });
                      }}
                    >
                      <option value="grocery">Retail/Store (Mart)</option>
                      <option value="restaurant">Restaurant/Cafe</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="tel" 
                        placeholder="98XXXXXXXX"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Store Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Jawalakhel, Lalitpur"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    Operating Hours
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Open</label>
                      <input 
                        type="time" 
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs"
                        value={formData.openingTime}
                        onChange={e => setFormData({...formData, openingTime: e.target.value})}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Close</label>
                      <input 
                        type="time" 
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs"
                        value={formData.closingTime}
                        onChange={e => setFormData({...formData, closingTime: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase">Verify Mobile</h3>
                  <p className="text-slate-400 text-xs font-medium">OTP has been sent to <span className="text-slate-800 font-bold">{formData.phone}</span></p>
                </div>
              </div>

              {!otpSent ? (
                <div className="space-y-4">
                  <button 
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isVerifyingOtp}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {isVerifyingOtp ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-4 text-2xl text-center font-black tracking-[0.5em] outline-none focus:border-primary transition-all"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
                  >
                    Verify & Continue
                  </button>
                  <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Didn't receive? <button type="button" className="text-primary hover:underline">Resend OTP</button>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-primary">
                <Upload className="w-5 h-5" />
                <h3 className="text-lg font-black uppercase">Document Upload</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Shop Front */}
                <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl hover:border-primary/50 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800 uppercase">Shop Front Photo</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">A clear photo of your store facade</p>
                    </div>
                    {formData.documents.shopFront ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100">
                        <img src={formData.documents.shopFront} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => handleFileUpload('shopFront')}
                        className="bg-slate-50 text-slate-400 p-3 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all"
                      >
                        <ImageIcon className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>

                {/* ID Card */}
                <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl hover:border-primary/50 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800 uppercase">Citizenship / ID Card</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Front and back combined or main page</p>
                    </div>
                    {formData.documents.idCard ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100">
                        <img src={formData.documents.idCard} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => handleFileUpload('idCard')}
                        className="bg-slate-50 text-slate-400 p-3 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all"
                      >
                        <FileText className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>

                {/* License (Optional) */}
                <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl hover:border-primary/50 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800 uppercase">Business License (Optional)</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tax registration or local ward permit</p>
                    </div>
                    {formData.documents.license ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100">
                        <img src={formData.documents.license} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => handleFileUpload('license')}
                        className="bg-slate-50 text-slate-400 p-3 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all"
                      >
                        <Upload className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Ensure all photos are high resolution and text is clearly readable for faster approval.</p>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 py-4"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Ready for Submission</h3>
                  <p className="text-slate-400 text-sm font-medium">Please review your store details before finishing.</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store</span>
                  <span className="text-sm font-black text-slate-800">{formData.storeName}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</span>
                  <span className="text-sm font-black text-slate-800">{formData.ownerFullName}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                  <span className="text-sm font-black text-slate-800">{formData.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</span>
                  <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded">3 Uploaded</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl text-white/80 text-[10px] font-bold leading-relaxed">
                By clicking Submit, your store will enter the "Pending Verification" stage. Our team usually reviews applications within 24-48 hours.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 2 && (
          <div className="flex gap-4">
            {step > 1 && (
              <button 
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-slate-50 text-slate-400 py-5 rounded-2xl font-black uppercase tracking-widest transition-all"
              >
                Back
              </button>
            )}
            <button 
              type="submit"
              className="flex-[2] bg-primary hover:bg-primary-dark text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {step === 4 ? 'Submit Application' : 'Continue'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
