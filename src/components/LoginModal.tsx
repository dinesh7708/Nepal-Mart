/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, LogIn, Chrome, Phone, User } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { signInWithGoogle, registerWithEmail, loginWithEmail } from '../lib/firebase';
import { cn } from '../lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      alert("Failed to login with Google. Ensure Firebase is correctly set up.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !name)) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (error: any) {
      console.error("Auth error:", error);
      alert(error.message || "An error occurred during authentication.");
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[110] rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter">NEPAL<span className="text-accent">MART</span></h2>
                  <p className="text-sm font-medium text-slate-400">
                    {isRegistering ? 'Create your account' : 'Login to your account'}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isRegistering && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="text" 
                          placeholder="John Doe"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="tel" 
                          placeholder="98XXXXXXXX"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="email" 
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3",
                    isLoading && "opacity-50 pointer-events-none"
                  )}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      {isRegistering ? 'Sign Up' : 'Continue with Email'}
                    </>
                  )}
                </button>
              </form>

              <div className="text-center space-y-3">
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-xs font-bold text-primary hover:underline block w-full"
                >
                  {isRegistering ? 'Already have an account? Login' : 'New to Nepal Mart? Create account'}
                </button>
                <div className="pt-1">
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('mock-login'));
                      onClose();
                    }}
                    className="text-[10px] font-black text-slate-400 border border-slate-100 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all uppercase tracking-widest"
                  >
                    Continue as Guest (Demo)
                  </button>
                </div>
              </div>

              <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-slate-100"></div>
                 </div>
                 <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                   <span className="bg-white px-4 text-slate-400">Or connect with</span>
                 </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={cn(
                  "w-full bg-white border border-slate-200 text-slate-600 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3",
                  isLoading && "opacity-50 pointer-events-none"
                )}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Chrome className="w-4 h-4" />
                )}
                Login with Google
              </button>

              <p className="text-[10px] text-center text-slate-400 leading-relaxed">
                By continuing, you agree to Nepal Mart's <br/>
                <span className="text-slate-800 font-bold underline cursor-pointer">Terms of Service</span> and <span className="text-slate-800 font-bold underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
