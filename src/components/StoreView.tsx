/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Star, 
  Clock, 
  Info, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  ChevronRight,
  MapPin,
  Phone,
  Utensils,
  Leaf,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { StoreProfile, Product, CartItem } from '../types';
import { cn } from '../lib/utils';

interface StoreViewProps {
  store: StoreProfile;
  products: Product[];
  cartItems: CartItem[];
  onAdd: (product: Product, instructions?: string) => void;
  onRemove: (productId: string) => void;
  onBack: () => void;
  onReport?: (id: string, name: string) => void;
}

export function StoreView({ store, products, cartItems, onAdd, onRemove, onBack, onReport }: StoreViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedInstruction, setSelectedInstruction] = useState<{[key: string]: string}>({});

  if (store.status === 'suspended') {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black uppercase text-slate-800">Store Suspended</h2>
        <p className="text-slate-500 leading-relaxed">
          This store has been temporarily suspended due to a violation of our community safety guidelines or a pending investigation into reported issues.
        </p>
        <button 
          onClick={onBack}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold active:scale-95 transition-transform"
        >
          Back to Shopping
        </button>
      </div>
    );
  }

  const instructionPresets = ['Less spicy', 'No onion/garlic', 'Extra spicy', 'Serve hot', 'No cutlery'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiet = 
      activeFilter === 'all' ? true :
      activeFilter === 'veg' ? p.isVeg : !p.isVeg;
    return matchesSearch && matchesDiet;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const getItemQuantity = (id: string) => cartItems.find(item => item.id === id)?.quantity || 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Back Button & Header Sticky */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3 flex items-center gap-4 md:hidden">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <span className="font-black uppercase text-xs tracking-tight truncate">{store.name}</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <button onClick={onBack} className="hover:text-primary transition-colors">Home</button>
           <ChevronRight className="w-3 h-3" />
           <button onClick={onBack} className="hover:text-primary transition-colors">Restaurants</button>
           <ChevronRight className="w-3 h-3" />
           <span className="text-slate-800">{store.name}</span>
        </div>

        {/* Store Profile Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                   <img src={store.logo || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                 </div>
                 <div className="space-y-1">
                   <h1 className="text-3xl font-black text-slate-800 tracking-tight">{store.name}</h1>
                   <p className="text-sm font-bold text-slate-400">{store.category} • {store.address}</p>
                 </div>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                  <Star className="w-4 h-4 text-green-600 fill-green-600" />
                  <span className="text-sm font-black text-green-700">{store.rating || '4.5'}</span>
                  <span className="text-[10px] font-bold text-green-600 uppercase mb-px">({store.reviewsCount || '100+'})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-bold">30-40 mins</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-bold">{store.deliveryRadius} km</span>
                </div>
                <button 
                  onClick={() => onReport?.(store.id, store.name)}
                  className="flex items-center gap-1.5 text-red-500 hover:text-red-600 transition-colors text-[10px] font-black uppercase tracking-widest ml-auto"
                >
                  <Info className="w-3 h-3" />
                  Report Shop
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-4 min-w-[240px]">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                 <span>Offer Available</span>
                 <Flame className="w-3 h-3 text-red-500" />
               </div>
               <div className="space-y-1">
                 <p className="text-lg font-black tracking-tight">40% OFF up to Rs. 100</p>
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">USE CODE: NEPALMART40</p>
               </div>
               <div className="pt-2 border-t border-white/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Free Delivery above Rs. {store.freeDeliveryThreshold || 500}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Filters & Menu Search */}
        <div className="sticky top-20 z-30 bg-slate-50/95 backdrop-blur-sm py-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              <button 
                onClick={() => setActiveFilter('all')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                  activeFilter === 'all' ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                )}
              >
                Full Menu
              </button>
              <button 
                onClick={() => setActiveFilter('veg')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2",
                  activeFilter === 'veg' ? "bg-green-600 text-white border-green-600 shadow-xl shadow-green-600/20" : "bg-white text-slate-400 border-slate-200 hover:border-green-200"
                )}
              >
                <div className="w-2.5 h-2.5 border border-green-600 flex items-center justify-center p-[1px]">
                   <div className="w-full h-full bg-green-600 rounded-full" />
                </div>
                Veg Only
              </button>
              <button 
                onClick={() => setActiveFilter('non-veg')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2",
                  activeFilter === 'non-veg' ? "bg-red-600 text-white border-red-600 shadow-xl shadow-red-600/20" : "bg-white text-slate-400 border-slate-200 hover:border-red-200"
                )}
              >
                <div className="w-2.5 h-2.5 border border-red-600 flex items-center justify-center p-[1px]">
                   <div className="w-full h-full bg-red-600 rounded-full" />
                </div>
                Non-Veg
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for dishes..."
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-12 pb-20">
          {categories.map(category => {
            const catProducts = filteredProducts.filter(p => p.category === category);
            if (catProducts.length === 0) return null;

            return (
              <section key={category} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{category}</h2>
                  <div className="h-[2px] flex-1 bg-slate-200/50" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{catProducts.length} Items</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {catProducts.map(product => (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between gap-6"
                    >
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                           <div className={cn(
                             "w-3.5 h-3.5 border flex items-center justify-center p-[2px]",
                             product.isVeg ? "border-green-600" : "border-red-600"
                           )}>
                              <div className={cn("w-full h-full rounded-full", product.isVeg ? "bg-green-600" : "bg-red-600")} />
                           </div>
                           {product.isFeatured && (
                             <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase bg-amber-50 px-1.5 py-0.5 rounded">
                               <Star className="w-2 h-2 fill-amber-500" /> Bestseller
                             </span>
                           )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-slate-800 leading-tight">{product.name}</h4>
                          <p className="text-sm font-black text-slate-800">Rs. {product.price}</p>
                        </div>
                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{product.description}</p>
                        
                        {product.preparationTime && (
                           <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              <Clock className="w-3 h-3" /> {product.preparationTime} mins
                           </div>
                        )}
                      </div>

                      <div className="relative w-32 h-32 flex-shrink-0">
                        <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-100">
                          <img src={product.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                          {getItemQuantity(product.id) > 0 ? (
                            <div className="bg-white border border-primary/20 shadow-xl shadow-primary/10 rounded-xl py-1 px-2 flex items-center gap-3 min-w-[90px] justify-between">
                              <button 
                                onClick={() => onRemove(product.id)}
                                className="w-6 h-6 rounded-lg bg-slate-50 text-primary flex items-center justify-center hover:bg-primary/5 transition-all"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black text-primary">{getItemQuantity(product.id)}</span>
                              <button 
                                onClick={() => onAdd(product, selectedInstruction[product.id])}
                                className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              {/* Quick Instructions */}
                              <div className="hidden group-hover:flex absolute bottom-12 left-1/2 -translate-x-1/2 bg-white p-2 rounded-xl border border-slate-100 shadow-2xl flex-col gap-1 min-w-[120px] z-20">
                                <p className="text-[8px] font-black uppercase text-slate-400 px-2 pb-1 border-b border-slate-50">Instructions</p>
                                {instructionPresets.map(preset => (
                                  <button 
                                    key={preset}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedInstruction(prev => ({...prev, [product.id]: preset}));
                                    }}
                                    className={cn(
                                      "text-[9px] font-bold px-2 py-1.5 rounded-lg text-left transition-all",
                                      selectedInstruction[product.id] === preset ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                  >
                                    {preset}
                                  </button>
                                ))}
                              </div>
                              <button 
                                onClick={() => onAdd(product, selectedInstruction[product.id])}
                                className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 text-primary px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary/50 transition-all active:scale-95 whitespace-nowrap"
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
