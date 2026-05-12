/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  quantity?: number;
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
  storeName?: string;
  onReport?: (id: string, name: string) => void;
}

export function ProductCard({ product, quantity = 0, onAdd, onRemove, storeName, onReport }: ProductCardProps) {
  const isAvailable = product.isAvailable !== false;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-xl p-4 border border-slate-100 flex flex-col h-[340px] group hover:shadow-xl hover:shadow-slate-200/50 transition-all relative",
        !isAvailable && "opacity-75 grayscale-[0.5]"
      )}
    >
      <div className="relative h-32 bg-slate-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden group-hover:bg-slate-100 transition-colors">
        <img 
          src={product.image} 
          className={cn(
            "w-2/3 h-2/3 object-contain transition-transform duration-500 group-hover:scale-110",
            !isAvailable && "grayscale"
          )} 
          alt={product.name} 
        />
        {product.discountPrice && isAvailable && (
          <div className="absolute top-2 left-2 bg-accent text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
             Sale
          </div>
        )}
        {product.isSponsored && isAvailable && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">
             Sponsored
          </div>
        )}
        <button 
          onClick={() => onReport?.(product.id, product.name)}
          className="absolute top-2 right-2 bg-white p-1.5 rounded-lg border border-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 z-10"
          title="Report Product"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </button>
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-slate-900 text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest shadow-xl">Sold Out</span>
          </div>
        )}
      </div>

      <div className="space-y-1 mb-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.unit || '1 unit'}</p>
          {storeName && (
            <span className="text-[8px] font-black text-primary/60 uppercase border border-primary/20 px-1 rounded bg-primary/5">{storeName}</span>
          )}
        </div>
        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight min-h-[40px] uppercase tracking-tight">{product.name}</h4>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex flex-col">
          {product.discountPrice ? (
            <>
              <span className="font-black text-slate-900">Rs. {product.discountPrice}</span>
              <span className="text-[10px] text-slate-400 line-through">Rs. {product.price}</span>
            </>
          ) : (
            <span className="font-black text-slate-900">Rs. {product.price}</span>
          )}
        </div>

        {isAvailable && (
          quantity > 0 ? (
            <div className="flex items-center bg-primary text-white rounded-lg px-2 py-1.5 gap-3 shadow-md shadow-primary/20">
              <button 
                onClick={() => onRemove(product.id)}
                className="hover:scale-110 transition-transform"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black w-4 text-center">{quantity}</span>
              <button 
                onClick={() => onAdd(product)}
                className="hover:scale-110 transition-transform"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onAdd(product)}
              className="border border-primary text-primary px-5 py-1.5 rounded-lg text-xs font-black hover:bg-primary hover:text-white transition-all active:scale-95 uppercase tracking-widest"
            >
              ADD
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
