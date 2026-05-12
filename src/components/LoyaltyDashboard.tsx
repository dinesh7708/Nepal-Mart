/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Award, Share2, TrendingUp, Gift, ChevronRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { UserProfile } from '../types';
import { LOYALTY_TIERS, POINTS_CONVERSION_RATE } from '../constants';
import { cn } from '../lib/utils';

interface LoyaltyDashboardProps {
  user: UserProfile;
}

export function LoyaltyDashboard({ user }: LoyaltyDashboardProps) {
  const [copied, setCopied] = useState(false);
  const currentTier = LOYALTY_TIERS.find(t => t.id === user.tier) || LOYALTY_TIERS[0];
  const nextTierIndex = LOYALTY_TIERS.findIndex(t => t.id === user.tier) + 1;
  const nextTier = nextTierIndex < LOYALTY_TIERS.length ? LOYALTY_TIERS[nextTierIndex] : null;

  const progress = nextTier 
    ? (user.totalSpent / nextTier.minSpend) * 100 
    : 100;

  const copyReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tier Overview Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${currentTier.color} 0%, #1a1a1a 100%)` }}
      >
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest opacity-70">Membership Status</span>
              <h2 className="text-4xl font-black italic">{currentTier.name}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
              <Award className="w-10 h-10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-xs opacity-70 mb-1">Available Points</p>
              <p className="text-2xl font-bold">{user.points}</p>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-xs opacity-70 mb-1">Total Savings</p>
              <p className="text-2xl font-bold">Rs. {(user.points * 1).toFixed(0)}</p>
            </div>
          </div>

          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>PROGRESS TO {nextTier.name.toUpperCase()}</span>
                <span>Rs. {user.totalSpent} / Rs. {nextTier.minSpend}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              </div>
              <p className="text-[10px] opacity-70 italic text-center">
                Spend Rs. {nextTier.minSpend - user.totalSpent} more to unlock {nextTier.name} benefits!
              </p>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Benefits Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary w-5 h-5" />
            Your {currentTier.name} Benefits
          </h3>
          <ul className="space-y-3">
            {currentTier.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <div className="mt-1 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Referral Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-primary/5 rounded-3xl p-6 border border-primary/10 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Gift className="text-primary w-5 h-5" />
              Refer & Earn
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Give Rs. 150 to a friend and get Rs. 150 off when they make their first purchase!
            </p>
            
            <div className="bg-white p-2 rounded-2xl flex items-center gap-3 border border-primary/20 shadow-sm">
              <code className="flex-1 font-mono font-bold text-center text-primary tracking-widest px-4">
                {user.referralCode}
              </code>
              <button 
                onClick={copyReferral}
                className={cn(
                  "p-3 rounded-xl transition-all active:scale-95",
                  copied ? "bg-green-500 text-white" : "bg-primary text-white"
                )}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            
            <button className="w-full mt-4 flex items-center justify-center gap-2 text-primary font-bold text-sm hover:underline py-2">
              <Share2 className="w-4 h-4" /> Share with Friends
            </button>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/5 rounded-full border-4 border-dashed border-primary/20 pointer-events-none"
          />
        </motion.div>
      </div>
    </div>
  );
}
