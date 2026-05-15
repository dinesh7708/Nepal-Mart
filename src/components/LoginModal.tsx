/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, User, ArrowRight, AlertCircle, Mail } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { supabase, sendEmailOtp, verifyEmailOtp } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'name'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await sendEmailOtp(email);
      setStep('otp');
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP to your email.');
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
      const user = await verifyEmailOtp(email, otpCode);
      if (user) {
        // We'll trust the App.tsx's onAuthStateChange to handle the actual login state
        // but we might need to set the name if it's a new user.
        // Actually, let's check if the user has a name in metadata.
        if (user.user_metadata?.full_name) {
          onClose();
        } else {
          setStep('name');
        }
      }
    } catch (e: any) {
      setError(e.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
      if (error) throw error;
      
      // Update our custom users table too
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('users').update({ name }).eq('id', user.id);
      }
      
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to update your name.');
    } finally {
      setIsLoading(false);
    }
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
                {step === 'email' && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-800">Email Login</h3>
                      <p className="text-sm text-slate-500">Enter your email and we'll send a 6-digit code.</p>
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="email" 
                          placeholder="your@email.com"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold leading-relaxed">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {error}
                        </div>
                      )}

                      <button 
                        disabled={isLoading}
                        className="group w-full bg-primary text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-primary/20"
                      >
                        {isLoading ? 'Connecting...' : 'Send Login Code'}
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
                      <h3 className="text-xl font-black text-slate-800">Enter Code</h3>
                      <p className="text-sm text-slate-500">Check your inbox at <span className="font-bold text-slate-800">{email}</span></p>
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
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold leading-relaxed">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {error}
                        </div>
                      )}

                      <button 
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-primary/20"
                      >
                        {isLoading ? 'Verifying...' : 'Verify & Continue'}
                      </button>

                      <button 
                        type="button"
                        onClick={() => setStep('email')}
                        className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
                      >
                        Change Email or Retry
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
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Start Shopping'}
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
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
