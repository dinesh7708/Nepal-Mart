/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  ChevronRight, 
  FileText, 
  Lock, 
  RefreshCcw, 
  Store, 
  Utensils, 
  Truck, 
  ShieldCheck,
  ArrowLeft,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { POLICIES } from '../policyConstants';
import { cn } from '../lib/utils';

interface LegalCenterProps {
  onBack: () => void;
  lang: 'en' | 'np';
}

export function LegalCenter({ onBack, lang }: LegalCenterProps) {
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const policies = POLICIES[lang as 'en' | 'np'] || POLICIES['en'];

  const menuItems = [
    { id: 'terms', title: policies.terms.title, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { id: 'privacy', title: policies.privacy.title, icon: Lock, color: 'bg-purple-50 text-purple-600' },
    { id: 'refund', title: policies.refund.title, icon: RefreshCcw, color: 'bg-amber-50 text-amber-600' },
    { id: 'partner', title: policies.partner.title, icon: Store, color: 'bg-green-50 text-green-600' },
    { id: 'food', title: policies.food.title, icon: Utensils, color: 'bg-orange-50 text-orange-600' },
    { id: 'delivery', title: policies.delivery.title, icon: Truck, color: 'bg-slate-50 text-slate-600' },
  ];

  const currentPolicy = activePolicy ? (policies as any)[activePolicy] : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={activePolicy ? () => setActivePolicy(null) : onBack} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <h1 className="text-xl font-black uppercase text-slate-800 tracking-tight">
            {activePolicy ? currentPolicy?.title : lang === 'en' ? 'Legal & Policies' : 'कानूनी र नीतिहरू'}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {!activePolicy ? (
          <div className="space-y-4">
             <div className="text-center mb-10 space-y-2">
                <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{lang === 'en' ? 'Transparency matters to us' : 'हाम्रो लागि पारदर्शिता महत्त्वपूर्ण छ'}</h2>
                <p className="text-slate-400 font-medium text-sm">{lang === 'en' ? 'Please read our policies to understand how we operate and protect you.' : 'हामी कसरी सञ्चालन गर्छौं र तपाईंलाई सुरक्षित राख्छौं भनेर बुझ्नको लागि कृपया हाम्रा नीतिहरू पढ्नुहोस्।'}</p>
             </div>

             <div className="grid gap-3">
               {menuItems.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => setActivePolicy(item.id)}
                   className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary/30 transition-all group"
                 >
                   <div className="flex items-center gap-4">
                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.color)}>
                        <item.icon className="w-5 h-5" />
                     </div>
                     <span className="font-bold text-slate-700">{item.title}</span>
                   </div>
                   <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                 </button>
               ))}
             </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
             {currentPolicy.sections.map((section: any, idx: number) => (
               <div key={idx} className="space-y-3">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <span className="text-primary text-xs">0{idx + 1}.</span>
                    {section.title}
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm leading-relaxed text-slate-600 font-medium text-sm">
                    {section.content}
                  </div>
               </div>
             ))}

             <div className="pt-10 border-t border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated: May 11, 2026</p>
                <button 
                  onClick={() => setActivePolicy(null)}
                  className="mt-6 text-primary font-black uppercase text-xs tracking-widest hover:underline"
                >
                  {lang === 'en' ? 'Back to all policies' : 'सबै नीतिहरूमा फर्कनुहोस्'}
                </button>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
