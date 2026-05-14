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
  FileText,
  CreditCard,
  Navigation
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
    panVatNumber: '',
    citizenshipNumber: '',
    openingTime: '08:00',
    closingTime: '20:00',
    location: null as { lat: number, lng: number } | null,
    bankDetails: {
      bankName: '',
      accountHolder: '',
      accountNumber: '',
      ifscCode: '',
      mobileNumber: ''
    },
    documents: {
      shopFront: '',
      idCard: '',
      license: '',
      panCard: '',
      storeLogo: '',
      qrCode: ''
    }
  });

  const groceryCategories = ['Grocery', 'Kirana Shop', 'Bakeries', 'Meat Shop', 'Pharmacy', 'Local Specialty', 'Electronics', 'Fashion'];
  const restaurantCategories = ['Fast Food', 'Restaurants', 'Cafe', 'Bakeries', 'Local Nepali', 'Indian', 'Continental'];

  const categories = formData.type === 'grocery' ? groceryCategories : restaurantCategories;

  const detectStoreLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }));
        alert("Location pinned successfully!");
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  };

  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) return;
    setIsVerifyingOtp(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        alert(data.error || 'Failed to send OTP. Ensure Twilio keys are set in the environment.');
      }
    } catch (e) {
      console.error("OTP Send error:", e);
      alert('Error connecting to authentication server.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, code: otpCode })
      });
      const data = await response.json();
      if (data.success) {
        setIsOtpVerified(true);
        setStep(3);
      } else {
        alert(data.error || 'Invalid OTP code.');
      }
    } catch (e) {
      console.error("OTP Verify error:", e);
      alert('Error verifying OTP.');
    }
  };

  const handleFileUpload = (field: 'shopFront' | 'idCard' | 'license' | 'storeLogo' | 'panCard' | 'qrCode') => {
    // Simulate file upload with placeholder images
    const placeholders = {
      shopFront: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop',
      idCard: 'https://images.unsplash.com/photo-1554224155-169641357599?w=800&auto=format&fit=crop',
      license: 'https://images.unsplash.com/photo-1554224154-22dec7786151?w=800&auto=format&fit=crop',
      storeLogo: 'https://images.unsplash.com/photo-1534723452862-4c874e70d98a?q=80&w=200&h=200&auto=format&fit=crop',
      panCard: 'https://images.unsplash.com/photo-1554224155-1e33bef493c8?w=800&auto=format&fit=crop',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=example'
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
      if (!formData.documents.shopFront || !formData.documents.idCard || !formData.documents.storeLogo || !formData.documents.panCard) {
        alert('Please upload mandatory documents: Logo, Shop Front, ID Card, and PAN Card.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!formData.bankDetails.bankName || !formData.bankDetails.accountNumber) {
        alert('Please provide bank details for payouts.');
        return;
      }
      setStep(5);
    } else if (step === 5) {
      onComplete({
        ...formData,
        status: 'pending',
        logo: formData.documents.storeLogo,
        verificationDetails: {
          ownerFullName: formData.ownerFullName,
          mobileVerified: true,
          citizenshipNumber: formData.citizenshipNumber,
          panVatNumber: formData.panVatNumber,
          documents: formData.documents,
          submittedAt: Date.now()
        },
        paymentSettings: {
          codEnabled: true,
          qrEnabled: !!formData.documents.qrCode,
          qrImage: formData.documents.qrCode,
          esewaEnabled: false,
          khaltiEnabled: false,
          bankEnabled: true,
          bankName: formData.bankDetails.bankName,
          accountHolder: formData.bankDetails.accountHolder,
          accountNumber: formData.bankDetails.accountNumber,
          ifscCode: formData.bankDetails.ifscCode,
          mobileNumber: formData.bankDetails.mobileNumber
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
          {[1, 2, 3, 4, 5].map(i => (
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
                <h3 className="text-lg font-black uppercase tracking-tight">Business Profile</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Shop Name</label>
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name (Owner)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Enter legal name"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
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

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Moblie / Phone Number</label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Citizenship / National ID</label>
                    <input 
                      required
                      type="text" 
                      placeholder="ID Number"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={formData.citizenshipNumber}
                      onChange={e => setFormData({...formData, citizenshipNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">PAN / VAT Number</label>
                    <input 
                      required
                      type="text" 
                      placeholder="PAN Number"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={formData.panVatNumber}
                      onChange={e => setFormData({...formData, panVatNumber: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Shop Address</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="Detailed address"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={detectStoreLocation}
                      className={cn(
                        "px-4 rounded-xl flex items-center justify-center transition-all border",
                        formData.location ? "bg-green-50 text-green-600 border-green-100" : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      )}
                    >
                      <Navigation className="w-5 h-5" />
                    </button>
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
                      placeholder="0 0 0 0"
                      maxLength={4}
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
                <h3 className="text-lg font-black uppercase">KYC & Documents</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Store Logo */}
                <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl hover:border-primary/50 transition-all bg-primary/5">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-[10px] font-black uppercase">Store Logo</p>
                    {formData.documents.storeLogo ? (
                      <img src={formData.documents.storeLogo} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <button type="button" onClick={() => handleFileUpload('storeLogo')} className="p-4 bg-white rounded-xl text-slate-400"><ImageIcon /></button>
                    )}
                  </div>
                </div>

                {/* Shop Front */}
                <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl hover:border-primary/50 transition-all">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-[10px] font-black uppercase">Shop Front</p>
                    {formData.documents.shopFront ? (
                      <img src={formData.documents.shopFront} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <button type="button" onClick={() => handleFileUpload('shopFront')} className="p-4 bg-slate-50 rounded-xl text-slate-400"><ImageIcon /></button>
                    )}
                  </div>
                </div>

                {/* ID Card */}
                <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl hover:border-primary/50 transition-all">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-[10px] font-black uppercase">Citizenship / ID</p>
                    {formData.documents.idCard ? (
                      <img src={formData.documents.idCard} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <button type="button" onClick={() => handleFileUpload('idCard')} className="p-4 bg-slate-50 rounded-xl text-slate-400"><FileText /></button>
                    )}
                  </div>
                </div>

                {/* PAN Card */}
                <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl hover:border-primary/50 transition-all bg-amber-50/30">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-[10px] font-black uppercase text-amber-700">PAN / VAT Copy</p>
                    {formData.documents.panCard ? (
                      <img src={formData.documents.panCard} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <button type="button" onClick={() => handleFileUpload('panCard')} className="p-4 bg-white rounded-xl text-amber-400"><Upload /></button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-black uppercase">Shop License</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Optional ward permit</p>
                  </div>
                  {formData.documents.license ? (
                    <img src={formData.documents.license} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <button type="button" onClick={() => handleFileUpload('license')} className="text-primary p-2"><Upload className="w-5 h-5"/></button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-primary">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-lg font-black uppercase">Payout Details</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Bank Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. NIC Asia Bank"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm font-bold outline-none"
                    value={formData.bankDetails.bankName}
                    onChange={e => setFormData({...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value}})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Account Holder Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Name in bank records"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm font-bold outline-none"
                    value={formData.bankDetails.accountHolder}
                    onChange={e => setFormData({...formData, bankDetails: { ...formData.bankDetails, accountHolder: e.target.value}})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Account Number</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter full account number"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm font-bold outline-none"
                    value={formData.bankDetails.accountNumber}
                    onChange={e => setFormData({...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value}})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">IFSC / Routing Code</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. NICB000123"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm font-bold outline-none uppercase"
                      value={formData.bankDetails.ifscCode}
                      onChange={e => setFormData({...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase()}})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Bank Contact Mobile</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="98XXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm font-bold outline-none"
                      value={formData.bankDetails.mobileNumber}
                      onChange={e => setFormData({...formData, bankDetails: { ...formData.bankDetails, mobileNumber: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="relative p-6 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase">QR Code for Payments</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Optional but recommended</p>
                    </div>
                    {formData.documents.qrCode ? (
                      <img src={formData.documents.qrCode} className="w-20 h-20 rounded-xl border border-slate-200" />
                    ) : (
                      <button type="button" onClick={() => handleFileUpload('qrCode')} className="bg-white p-4 rounded-xl text-primary shadow-sm"><Upload /></button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Review & Submit</h3>
                  <p className="text-slate-400 text-sm">Please verify your information carefully.</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100 divide-y divide-slate-200/50">
                <div className="flex justify-between items-center pb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Name</span>
                  <span className="text-sm font-black text-slate-800">{formData.storeName}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</span>
                  <span className="text-sm font-black text-slate-800">{formData.ownerFullName}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank</span>
                  <span className="text-xs font-bold text-slate-600">{formData.bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KYC Docs</span>
                  <span className="text-xs font-black text-green-600 uppercase">Documents Verified</span>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-primary text-[10px] font-bold leading-relaxed uppercase tracking-wide">
                Note: By submitting, you agree to Nepal Mart's commission structure and payouts schedule. Approval may take up to 48 hours.
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
              className="flex-[2] bg-primary hover:bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {step === 5 ? 'Register Shop' : 'Next Step'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
