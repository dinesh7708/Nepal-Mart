/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { supabase, signInWithPhone, verifyOtp } from '../lib/supabase';
import { cn } from '../lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Use Custom Twilio OTP API
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await response.json();
      
      if (data.success) {
        setStep('otp');
      } else {
        const fullError = data.details ? `${data.error} ${data.details}` : (data.error || 'Failed to send OTP');
        throw new Error(fullError);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setIsLoading(true);
    setError(null);
    try {
      // Use Custom Twilio OTP API
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, code: otpCode })
      });
      const data = await response.json();
      
      if (data.success) {
        // If server returned a Firebase custom token, sign in with it (if we were using Firebase)
        // For this app which is mixed, we'll dispatch a mock login event if it was successful
        window.dispatchEvent(new CustomEvent('mock-login', { 
          detail: { phone, name: 'User' } 
        }));
        onClose();
      } else {
        const fullError = data.details ? `${data.error} ${data.details}` : (data.error || 'Invalid OTP');
        throw new Error(fullError);
      }
    } catch (e: any) {
      setError(e.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    window.dispatchEvent(new CustomEvent('mock-login', { 
      detail: { phone, name } 
    }));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: "100%" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: "100%" }}
            className="fixed bottom-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full max-w-md bg-white z-[110] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter">NEPAL<span className="text-accent">MART</span></h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Fresh & Local Delivery</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {step === 'phone' && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-800">Phone Verification</h3>
                      <p className="text-sm text-slate-500">We'll send you a verification code via SMS.</p>
                    </div>

                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 border-r border-slate-200">
                          <span className="text-xs font-bold text-slate-500">Phone</span>
                        </div>
                        <input 
                          type="tel" 
                          placeholder="+977 98XXXXXXXX"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-20 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest leading-none">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      <button 
                        disabled={isLoading}
                        className="group w-full bg-primary text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-primary/20"
                      >
                        {isLoading ? 'Connecting...' : 'Send OTP Code'}
                        {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === 'otp' && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-800">Enter OTP</h3>
                      <p className="text-sm text-slate-500">Code sent to <span className="font-bold text-slate-800">+977 {phone}</span></p>
                    </div>

                    <form onSubmit={handleOtpVerify} className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="0 0 0 0 0 0"
                        maxLength={6}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 px-4 text-center text-3xl font-black tracking-[0.2em] focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        required
                        autoFocus
                      />

                      {error && (
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      <button 
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-primary/20"
                      >
                        {isLoading ? 'Verifying...' : 'Verify & Continue'}
                      </button>

                      <button 
                        type="button"
                        onClick={() => setStep('phone')}
                        className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
                      >
                        Change Number or Retry
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === 'name' && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-800">What's your name?</h3>
                      <p className="text-sm text-slate-500">We'd love to know who we're delivering to!</p>
                    </div>

                    <form onSubmit={handleNameSubmit} className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Your Full Name"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>

                      <button 
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
                      >
                        Start Shopping
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  By signing in, you agree to our <br/>
                  <span className="text-slate-800 underline">Terms of Service</span> & <span className="text-slate-800 underline">Privacy Policy</span>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
