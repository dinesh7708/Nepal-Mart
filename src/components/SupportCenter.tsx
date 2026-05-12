/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  ArrowRight,
  Send,
  ArrowLeft,
  MapPin
} from 'lucide-react';
import { useState, FormEvent } from 'react';
import { cn } from '../lib/utils';
import { SupportTicket, SupportSettings } from '../types';

interface SupportCenterProps {
  onBack: () => void;
  lang: 'en' | 'np';
  onSubmitTicket: (ticket: Partial<SupportTicket>) => void;
  settings: SupportSettings;
}

export function SupportCenter({ onBack, lang, onSubmitTicket, settings }: SupportCenterProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'order_issue',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: lang === 'en' ? "How do I track my order?" : "म कसरि मेरो अर्डर ट्र्याक गर्न सक्छु?",
      a: lang === 'en' ? "You can track your order in the 'Orders' tab. Once a store accepts your order, you'll see real-time updates." : "तपाईं 'अर्डर' ट्याबमा आफ्नो अर्डर ट्र्याक गर्न सक्नुहुन्छ। एकपटक पसलले तपाईंको अर्डर स्वीकार गरेपछि, तपाईंले वास्तविक समय अपडेटहरू देख्नुहुनेछ।"
    },
    {
      q: lang === 'en' ? "What if my food is late?" : "यदि मेरो खाना ढिलो भयो भने के हुन्छ?",
      a: lang === 'en' ? "Nepal Mart stores manage their own delivery. You can call the store directly using the contact number provided in your order details." : "नेपाल मार्टका पसलहरूले आफ्नै डेलिभरी व्यवस्थापन गर्छन्। तपाईंले आफ्नो अर्डर विवरणमा दिइएको सम्पर्क नम्बर प्रयोग गरेर सिधै पसललाई कल गर्न सक्नुहुन्छ।"
    },
    {
      q: lang === 'en' ? "Can I get a refund?" : "के म फिर्ता पाउन सक्छु?",
      a: lang === 'en' ? "Refunds are processed if items are damaged or missing. Please report the issue within 2 hours of delivery for food items." : "यदि सामानहरू क्षतिग्रस्त वा हराइरहेका छन् भने पैसा फिर्ता गरिन्छ। कृपया खानाका सामानहरूको लागि डेलिभरी भएको २ घण्टा भित्र समस्या रिपोर्ट गर्नुहोस्।"
    }
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmitTicket(formData);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <h1 className="text-xl font-black uppercase text-slate-800 tracking-tight">
          {lang === 'en' ? 'Support Center' : 'सहयोग केन्द्र'}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        {/* Quick Contact */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <a 
             href={`tel:${settings.phone}`}
             className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3 hover:border-primary/50 transition-all group"
           >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Phone className="w-5 h-5" />
              </div>
              <p className="font-black text-slate-800 tracking-tight">Call Us</p>
              <p className="text-sm font-bold text-slate-400">{settings.phone}</p>
           </a>
           <a 
             href={`mailto:${settings.email}`}
             className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3 hover:border-blue/50 transition-all group"
           >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Mail className="w-5 h-5" />
              </div>
              <p className="font-black text-slate-800 tracking-tight">Email Support</p>
              <p className="text-sm font-bold text-slate-400 truncate w-full">{settings.email}</p>
           </a>
           <a 
             href={`https://wa.me/${settings.whatsapp.replace('+', '').replace(/\s/g, '')}`}
             target="_blank"
             rel="noreferrer"
             className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3 hover:border-purple/50 transition-all group"
           >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <MessageSquare className="w-5 h-5" />
              </div>
              <p className="font-black text-slate-800 tracking-tight">WhatsApp</p>
              <p className="text-sm font-bold text-slate-400">Message Us</p>
           </a>
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center">
                 <MapPin className="w-5 h-5" />
              </div>
              <p className="font-black text-slate-800 tracking-tight">Office</p>
              <p className="text-[10px] font-bold text-slate-400">{settings.address}</p>
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">FAQs</h2>
             </div>
             <div className="space-y-3">
               {faqs.map((faq, idx) => (
                 <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full p-5 flex items-center justify-between text-left group"
                    >
                      <span className="font-bold text-slate-700 text-sm">{faq.q}</span>
                      {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-primary" />}
                    </button>
                    {activeFaq === idx && (
                      <div className="px-5 pb-5 text-sm text-slate-500 font-medium leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                 </div>
               ))}
             </div>
          </section>

          {/* Contact Form */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Report an Issue</h2>
             </div>
             
             {submitted ? (
               <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center space-y-4">
                  <div className="w-16 h-16 bg-white text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-green-800 tracking-tight">Ticket Submitted!</h3>
                  <p className="text-sm font-bold text-green-600/80">Our support team will review your report and get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-black uppercase text-green-700 underline tracking-widest pt-4"
                  >
                    Submit another report
                  </button>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Your Name</label>
                   <input 
                     required
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Email / Phone</label>
                   <input 
                     required
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                     value={formData.email}
                     onChange={e => setFormData({...formData, email: e.target.value})}
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Issue Type</label>
                   <select 
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                     value={formData.subject}
                     onChange={e => setFormData({...formData, subject: e.target.value})}
                   >
                     <option value="order_issue">Order Issue (Missing, Late, Wrong)</option>
                     <option value="store_complaint">Store Complaint</option>
                     <option value="app_bug">App Bug / Technical Problem</option>
                     <option value="payment">Payment Problem</option>
                     <option value="other">Other</option>
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Description</label>
                   <textarea 
                     required
                     rows={4}
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                     placeholder="Please provide details about your problem..."
                     value={formData.message}
                     onChange={e => setFormData({...formData, message: e.target.value})}
                   />
                 </div>
                 <button 
                   type="submit"
                   className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                 >
                   Submit Report <ArrowRight className="w-4 h-4" />
                 </button>
               </form>
             )}
          </section>
        </div>
      </div>
    </div>
  );
}
