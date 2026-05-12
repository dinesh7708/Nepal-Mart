import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Flag, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UserReport } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'store' | 'product';
  targetName: string;
  onSubmit: (report: Partial<UserReport>) => void;
}

export function ReportModal({ 
  isOpen, 
  onClose, 
  targetId, 
  targetType, 
  targetName,
  onSubmit 
}: ReportModalProps) {
  const [reason, setReason] = useState<UserReport['reason']>('fraud');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { id: 'fraud', label: 'Fraud / Scam', icon: AlertTriangle },
    { id: 'prohibited_item', label: 'Prohibited Item', icon: ShieldAlert },
    { id: 'fake_pricing', label: 'Fake Pricing', icon: Flag },
    { id: 'bad_behavior', label: 'Inappropriate Content', icon: AlertTriangle },
    { id: 'other', label: 'Other Issue', icon: Flag },
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      targetId,
      targetType,
      reason,
      description,
    });
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>

        {!submitted ? (
          <div className="p-8 space-y-8">
            <div className="space-y-1 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Report {targetType}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Help us keep Nepal Mart safe</p>
              <p className="text-sm font-bold text-primary mt-2">{targetName}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reason for reporting</p>
                <div className="grid grid-cols-1 gap-2">
                  {reasons.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setReason(r.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                        reason === r.id ? "border-red-500 bg-red-50" : "border-slate-50 hover:border-slate-100"
                      )}
                    >
                      <r.icon className={cn("w-5 h-5", reason === r.id ? "text-red-500" : "text-slate-400")} />
                      <span className={cn("text-xs font-black uppercase tracking-tight", reason === r.id ? "text-red-700" : "text-slate-600")}>
                        {r.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Detailed Description</label>
                 <textarea 
                   required
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium outline-none focus:border-red-500 transition-all resize-none"
                   placeholder="Tell us what happened..."
                   rows={4}
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                 />
              </div>

              <button 
                type="submit"
                className="w-full bg-red-500 text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all"
              >
                Submit Report
              </button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Report Received</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-4">
                Thank you for helping us. Our safety team will review your report within 24 hours.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest"
            >
              Close
            </button>
          </div>
        )}

        <div className="bg-slate-50 p-4 border-t border-slate-100">
           <p className="text-[8px] font-black text-slate-400 text-center uppercase tracking-widest">Nepal Mart Safety & Community Standards</p>
        </div>
      </motion.div>
    </div>
  );
}
