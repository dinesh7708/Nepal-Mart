import React from 'react';
import { ShoppingBag, Store, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface RoleSelectionProps {
  onSelect: (role: 'buy' | 'sell') => void;
}

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-12 text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            Welcome to <span className="text-primary italic">Nepal Mart</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            How would you like to continue today?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 pt-0">
          <button 
            onClick={() => onSelect('buy')}
            className="group relative flex flex-col items-center justify-center p-10 bg-slate-50 border-2 border-transparent hover:border-primary/30 hover:bg-white rounded-[2rem] transition-all space-y-6"
          >
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-primary/5">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black uppercase text-slate-800">Buy Products</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Shop from local experts</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Shop Now <ChevronRight className="w-3 h-3" />
            </div>
          </button>

          <button 
            onClick={() => onSelect('sell')}
            className="group relative flex flex-col items-center justify-center p-10 bg-slate-50 border-2 border-transparent hover:border-accent/30 hover:bg-white rounded-[2rem] transition-all space-y-6"
          >
            <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all shadow-xl shadow-accent/5">
              <Store className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black uppercase text-slate-800">Sell Products</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Register your shop & grow</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Start Selling <ChevronRight className="w-3 h-3" />
            </div>
          </button>
        </div>

        <div className="p-8 text-center bg-slate-50/50 border-t border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
            Support local businesses. Build a stronger Nepal.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
