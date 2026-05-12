/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  Clock,
  Search as SearchIcon,
  Menu,
  X,
  Plus,
  Minus,
  Award,
  Store as StoreIcon,
  CheckCircle2,
  Box,
  Truck,
  ClipboardList,
  History,
  Package,
  ShieldCheck,
  Utensils,
  Leaf,
  MessageSquare,
  HelpCircle,
  FileText,
  AlertTriangle,
  Phone,
  Mail,
  Navigation,
  Star,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, MOCK_PRODUCTS, MOCK_STORES } from './constants';
import { cn } from './lib/utils';
import { Product, CartItem, UserProfile, Order, Review, StoreProfile, SupportTicket, SupportSettings, UserReport } from './types';
import { ProductCard } from './components/ProductCard';
import { LoyaltyDashboard } from './components/LoyaltyDashboard';
import { LOYALTY_TIERS, POINTS_CONVERSION_RATE, REDEMPTION_VALUE } from './constants';
import { TRANSLATIONS, Language } from './i18n';

import { auth, logout, db } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { LoginModal } from './components/LoginModal';
import { PartnerOnboarding } from './components/PartnerOnboarding';
import { StoreDashboard } from './components/StoreDashboard';
import { AdminPanel } from './components/AdminPanel';
import { StoreView } from './components/StoreView';
import { LegalCenter } from './components/LegalCenter';
import { SupportCenter } from './components/SupportCenter';
import { CheckoutModal } from './components/CheckoutModal';
import { ReportModal } from './components/ReportModal';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [city, setCity] = useState('Kathmandu');
  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key];
  };

  const [activeTab, setActiveTab] = useState<'shop' | 'loyalty' | 'orders' | 'partner' | 'dashboard' | 'admin' | 'legal' | 'support'>('shop');
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [address, setAddress] = useState('Kathmandu, Nepal');
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<'none' | 'processing' | 'shipped' | 'delivered'>('none');
  const [globalCommission, setGlobalCommission] = useState(5);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [reportModalData, setReportModalData] = useState<{ isOpen: boolean; targetId: string; targetType: 'store' | 'product'; targetName: string }>({
    isOpen: false,
    targetId: '',
    targetType: 'store',
    targetName: ''
  });
  const [supportSettings, setSupportSettings] = useState<SupportSettings>({
    email: 'help@nepalmart.com',
    phone: '+977 9800000000',
    whatsapp: '+977 9800000000',
    address: 'Kathmandu, Nepal',
    updatedAt: Date.now()
  });

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'settings', 'support'), (snapshot) => {
      if (snapshot.exists()) {
        setSupportSettings(snapshot.data() as SupportSettings);
      }
    });

    let unsubTickets: (() => void) | null = null;
    let unsubReports: (() => void) | null = null;

    if (isAdmin) {
      unsubTickets = onSnapshot(collection(db, 'tickets'), (snapshot) => {
        const docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as SupportTicket));
        setTickets(docs.sort((a, b) => b.createdAt - a.createdAt));
      });

      unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
        const docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as UserReport));
        setReports(docs.sort((a, b) => b.createdAt - a.createdAt));
      });
    }

    return () => {
      unsub();
      if (unsubTickets) unsubTickets();
      if (unsubReports) unsubReports();
    };
  }, [isAdmin]);

  const handleReportSubmit = async (report: Partial<UserReport>) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    const newReport = {
      ...report,
      reporterId: user.id,
      reporterName: user.name,
      status: 'pending',
      createdAt: Date.now()
    };

    if (db) {
       await addDoc(collection(db, 'reports'), newReport);
    } else {
       setReports(prev => [{ ...newReport, id: Math.random().toString() } as UserReport, ...prev]);
    }
  };

  const handleSupportTicket = async (ticket: Partial<SupportTicket>) => {
    if (!db) {
       // Fallback for no DB
       const newTicket: SupportTicket = {
         id: `t-${Math.random().toString(36).substr(2, 9)}`,
         name: ticket.name || 'Anonymous',
         email: ticket.email || '',
         subject: ticket.subject || 'other',
         message: ticket.message || '',
         status: 'open',
         createdAt: Date.now()
       };
       setTickets(prev => [newTicket, ...prev]);
       return;
    }

    try {
      await addDoc(collection(db, 'tickets'), {
        ...ticket,
        status: 'open',
        createdAt: Date.now() // toMillis for rule check if request.time is used
      });
    } catch (e) {
      console.error("Error submitting ticket:", e);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus('success');
        setAddress('Current GPS Location');
      },
      () => {
        setLocationStatus('error');
      }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Real-time state for demo
  const [allProducts, setAllProducts] = useState<Product[]>(MOCK_PRODUCTS.map((p, i) => ({ ...p, isAvailable: true, isSponsored: i % 5 === 0 } as Product)));
  const [allStores, setAllStores] = useState<StoreProfile[]>(MOCK_STORES.map((s, i) => ({ 
    ...s, 
    ownerId: `owner-${s.id}`,
    contactNumber: '9841234567',
    openingTime: '09:00',
    closingTime: '21:00',
    createdAt: Date.now(),
    deliveryRadius: 5,
    minOrderAmount: 150,
    status: (s as any).status || (i === 0 ? 'approved' : 'pending'), 
    isFeatured: i === 0,
    commissionRate: 5
  } as StoreProfile)));

  const sortedStores = useMemo(() => {
    let list = allStores.filter(s => s.status === 'approved');
    
    if (userLocation) {
      list = list.map(store => ({
        ...store,
        distance: store.location ? calculateDistance(userLocation.lat, userLocation.lng, store.location.lat, store.location.lng) : 999
      })).sort((a: any, b: any) => a.distance - b.distance);
    }
    
    return list;
  }, [allStores, userLocation]);

  const [myStore, setMyStore] = useState<StoreProfile | null>(null);

  // Simulated or Authenticated User Profile
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const handleMockLogin = () => {
      setUser({
        id: 'guest-123',
        name: 'Admin User (Demo)',
        email: 'admin@nepalmart.com',
        points: 500,
        totalSpent: 12500,
        tier: 'gold',
        referralCode: 'PLATFORM_ADMIN',
        isPartner: true, 
        storeId: 's1'
      });

      setMyStore({
        id: 's1',
        ownerId: 'guest-123',
        name: 'Kathmandu Daily Mart',
        category: 'Grocery',
        address: 'Jawalakhel, Lalitpur',
        contactNumber: '9841XXXXXX',
        logo: 'https://images.unsplash.com/photo-1534723452862-4c874e70d98a?q=80&w=100&h=100&auto=format&fit=crop',
        status: 'approved',
        createdAt: Date.now(),
        deliveryCharge: 40,
        minOrderAmount: 200,
        deliveryRadius: 5,
        freeDeliveryThreshold: 1000
      });

      alert("Demo Mode Activated! I've also set you up as a Partner Store owner.");
    };

    window.addEventListener('mock-login', handleMockLogin);
    
    return () => {
      window.removeEventListener('mock-login', handleMockLogin);
    };
  }, []);

  useEffect(() => {
    if (!auth || !db) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user is admin
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        setIsAdmin(adminDoc.exists());

        // In a real app, we would fetch the user profile from Firestore here
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Nepal Mart User',
          email: firebaseUser.email || '',
          points: 0, // Mocked for now, would come from DB
          totalSpent: 0, // Mocked for now, would come from DB
          tier: 'bronze',
          referralCode: `MART${firebaseUser.uid.slice(0, 5).toUpperCase()}`,
        });
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (product: Product, instructions?: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, instructions: instructions || item.instructions } : item);
      }
      return [...prev, { ...product, quantity: 1, instructions }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'r1',
      storeId: 's1',
      customerId: 'u2',
      customerName: 'Aarav Sharma',
      rating: 5,
      comment: 'Super fast delivery and fresh vegetables!',
      createdAt: Date.now() - 86400000
    }
  ]);
  const [selectedReviewStore, setSelectedReviewStore] = useState<string | null>(null);

  const filteredProducts = allProducts.filter(product => {
    const store = allStores.find(s => s.id === product.storeId);
    if (!store || store.status !== 'approved') return false;
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = !selectedStoreId || product.storeId === selectedStoreId;
    return matchesCategory && matchesSearch && matchesStore;
  });

  const handleCheckout = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const completeCheckout = (paymentDetails: { method: Order['paymentMethod'], transactionId?: string, screenshot?: string }) => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tier = LOYALTY_TIERS.find(t => t.id === user?.tier) || LOYALTY_TIERS[0];
    const pointsEarned = Math.floor((total / POINTS_CONVERSION_RATE) * tier.pointsMultiplier);
    
    if (user) {
      const newTotalSpent = user.totalSpent + total;
      let newTier = user.tier;
      
      const nextTier = LOYALTY_TIERS.slice().reverse().find(t => newTotalSpent >= t.minSpend);
      if (nextTier) newTier = nextTier.id;

      setUser(prev => prev ? ({
        ...prev,
        points: prev.points + pointsEarned,
        totalSpent: newTotalSpent,
        tier: newTier
      }) : null);
    }

    // Record order with commission logic
    const storeId = cartItems[0]?.storeId;
    const store = allStores.find(s => s.id === storeId);
    const commissionRate = store?.commissionRate || globalCommission;
    const commissionAmount = (total * commissionRate) / 100;
    const storeEarnings = total - commissionAmount;

    const newOrder: Order = {
      id: `ord-${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.id || 'guest',
      customerId: user?.id || 'guest',
      storeId: storeId || 'unknown',
      items: [...cartItems],
      totalPrice: total,
      subtotal: total,
      deliveryCharge: store?.deliveryCharge || 0,
      totalAmount: total + (store?.deliveryCharge || 0),
      commissionRate,
      commissionAmount,
      storeEarnings,
      status: 'processing',
      createdAt: Date.now(),
      deliveryAddress: address,
      paymentMethod: paymentDetails.method,
      paymentStatus: paymentDetails.method === 'cod' ? 'pending' : 'awaiting_verification',
      transactionId: paymentDetails.transactionId,
      paymentScreenshot: paymentDetails.screenshot
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    setCartItems([]);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setOrderStatus('processing');
    
    // Simulate delivery progress for the active order
    setTimeout(() => {
      setOrderStatus('shipped');
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'shipped' } : o));
    }, 5000);
    setTimeout(() => {
      setOrderStatus('delivered');
      setActiveOrder(null);
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'delivered' } : o));
    }, 15000);

    setActiveTab('orders');
  };

  const handlePartnerComplete = (data: any) => {
    const newStore: StoreProfile = {
      id: `s-${Math.random().toString(36).substr(2, 9)}`,
      ownerId: user?.id || 'unknown',
      name: data.storeName,
      category: data.category,
      address: data.address,
      contactNumber: data.mobile,
      logo: 'https://images.unsplash.com/photo-1534723452862-4c874e70d98a?q=80&w=100&h=100&auto=format&fit=crop',
      status: 'pending',
      createdAt: Date.now(),
      deliveryCharge: 50,
      minOrderAmount: 150,
      deliveryRadius: 3,
      openingTime: data.openingTime || "09:00 AM",
      closingTime: data.closingTime || "09:00 PM",
      verificationDetails: {
        ownerFullName: data.ownerFullName,
        mobileVerified: true,
        documents: data.documents,
        submittedAt: Date.now()
      }
    };
    setAllStores(prev => [...prev, newStore]);
    setMyStore(newStore);
    setUser(prev => prev ? {
      ...prev,
      isPartner: true,
      storeId: newStore.id
    } : null);
    alert("Store verification submitted! Our admin team will review your documents within 24-48 hours.");
    setActiveTab('dashboard');
  };

  const getItemQuantity = (productId: string) => {
    return cartItems.find(item => item.id === productId)?.quantity || 0;
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 lg:px-12 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('shop')}>
            <h1 className="text-2xl font-black text-primary tracking-tighter">
              NEPAL<span className="text-accent">MART</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">10 Minute Delivery</p>
          </div>

          {/* Delivery Location */}
          <div className="hidden md:flex flex-col border-l border-slate-200 pl-6 cursor-pointer group relative">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">{city}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <MapPin className="w-2.5 h-2.5 text-primary" />
              <span className="truncate max-w-[120px]">{address}</span>
            </div>
            
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Change Location</h4>
                    <MapPin className="w-3 h-3 text-primary" />
                  </div>
                  
                  <button 
                    onClick={detectLocation}
                    className="w-full flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    {locationStatus === 'loading' ? (
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Navigation className="w-3 h-3" />
                    )}
                    Use Current Location
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] uppercase font-black text-slate-300">
                      <span className="bg-white px-2">Or select city</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(TRANSLATIONS[lang].nepalCities as string[]).slice(0, 6).map(c => (
                      <button 
                        key={c}
                        onClick={() => { setCity(c); setAddress(`${c}, Nepal`); }}
                        className={cn(
                          "px-3 py-2 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 border transition-all text-left",
                          city === c ? "border-primary bg-primary/5 text-primary" : "border-slate-100"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative">
            <SearchIcon className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full bg-slate-100 border-none rounded-xl py-3 px-12 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          {/* Language Toggle */}
          <button 
            onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
            className="text-[10px] font-black border border-slate-200 px-2 py-1 rounded bg-slate-50 hover:bg-white transition-all uppercase tracking-tighter"
          >
            {lang === 'en' ? 'नेपाली' : 'English'}
          </button>

          <button 
            onClick={() => {
              if (!user) setIsLoginOpen(true);
              else setActiveTab('partner');
            }}
            className="hidden xl:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            {t('partner')}
          </button>

          {user ? (
            <>
              {user.isPartner && (
                <button 
                  onClick={() => setActiveTab(activeTab === 'dashboard' ? 'shop' : 'dashboard')}
                  className="hidden xl:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all active:scale-95 border-2 border-white shadow-lg"
                >
                  <StoreIcon className="w-3.5 h-3.5" />
                  {activeTab === 'dashboard' ? 'Shop Mode' : 'Store Dashboard'}
                </button>
              )}

              <button 
                onClick={() => setActiveTab('orders')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                  activeTab === 'orders' ? "bg-primary/10 text-primary border border-primary/20" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <ClipboardList className="w-4 h-4" />
                {t('orders')}
              </button>

              {user.email === 'admin@nepalmart.com' && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                    activeTab === 'admin' ? "bg-accent/10 text-accent border border-accent/20" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </button>
              )}

              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setActiveTab('loyalty')}>
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-slate-600">{user.points} pts</span>
              </div>
              
              <button 
                onClick={() => setActiveTab(activeTab === 'shop' ? 'loyalty' : 'shop')}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
              >
                {user.name.split(' ')[0]}
              </button>
              
              <button 
                onClick={() => logout()}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-accent transition-colors hidden lg:block"
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="text-sm font-bold text-primary px-4 py-2 rounded-xl hover:bg-primary/5 transition-all"
            >
              Log In
            </button>
          )}
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl flex items-center gap-3 font-bold shadow-lg shadow-primary/10 transition-all active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Cart • {totalItems}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container-wide py-8">
        {activeOrder && (
          <div className="container-wide py-4">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          {allStores.find(s => s.id === activeOrder.storeId)?.type === 'restaurant' ? (
                            <Utensils className="w-6 h-6 text-primary animate-bounce" />
                          ) : (
                            <Truck className="w-6 h-6 text-primary animate-bounce" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Active order from {allStores.find(s => s.id === activeOrder.storeId)?.name}</h4>
                          <p className="text-xs font-bold text-primary uppercase tracking-widest">{activeOrder.status} • Rs. {activeOrder.totalPrice} ({activeOrder.paymentMethod.toUpperCase()})</p>
                        </div>
                      </div>
              <button 
                onClick={() => setActiveOrder(null)}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && myStore ? (
          <StoreDashboard 
            store={myStore}
            products={allProducts.filter(p => p.storeId === myStore.id)}
            orders={orders.filter(o => o.storeId === myStore.id)}
            onUpdateProducts={(updatedStoreProducts) => {
              const otherProducts = allProducts.filter(p => p.storeId !== myStore.id);
              setAllProducts([...otherProducts, ...updatedStoreProducts]);
            }}
            onUpdateOrderStatus={(id, status) => {
              setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
            }}
            onUpdateStore={(updatedStore) => {
              setMyStore(updatedStore);
              setAllStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));
            }}
          />
        ) : activeTab === 'orders' ? (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">Order History</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Track and manage your recent purchases</p>
              </div>
              <button 
                onClick={() => setActiveTab('shop')}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
              >
                New Order
              </button>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white p-20 rounded-3xl border border-slate-100 text-center space-y-6 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
                    <History className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-slate-800 uppercase tracking-tight">No orders yet</p>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">You haven't placed any orders yet. Start shopping to see your history here!</p>
                  </div>
                  <button onClick={() => setActiveTab('shop')} className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-tight shadow-xl shadow-primary/20 transition-all active:scale-95">Go Shopping</button>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50",
                        order.status === 'delivered' ? "text-primary bg-primary/5" : "text-amber-500 bg-amber-50"
                      )}>
                        <Package className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-black text-slate-800 uppercase tracking-tight">Order #{order.id.slice(-6)}</p>
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                            order.status === 'delivered' ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-600"
                          )}>{order.status}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
                        <p className="text-sm font-black text-slate-800 italic">Rs. {order.totalPrice}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 md:flex-none border border-slate-100 text-slate-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">View Details</button>
                      {order.status === 'delivered' && (
                        <button className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">Reorder</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'admin' ? (
          <AdminPanel 
            stores={allStores.filter(s => s.status !== 'rejected')}
            orders={orders}
            tickets={tickets}
            onResolveTicket={(id) => setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' } : t))}
            reports={reports}
            onResolveReport={(id) => {
              if (db) updateDoc(doc(db, 'reports', id), { status: 'resolved' });
              else setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
            }}
            onSuspendStore={(id) => {
              setAllStores(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'suspended' ? 'approved' : 'suspended' } : s));
            }}
            globalCommission={globalCommission}
            onUpdateGlobalCommission={setGlobalCommission}
            supportSettings={supportSettings}
            onUpdateSupportSettings={async (settings) => {
              if (db) {
                await setDoc(doc(db, 'settings', 'support'), { ...settings, updatedAt: Date.now() });
              } else {
                setSupportSettings({ ...settings, updatedAt: Date.now() });
              }
            }}
            onUpdateStoreCommission={(id, rate) => {
              setAllStores(prev => prev.map(s => s.id === id ? { ...s, commissionRate: rate } : s));
            }}
            onApproveStore={(id) => {
              setAllStores(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
            }}
            onRejectStore={(id, reason) => {
              setAllStores(prev => prev.map(s => s.id === id ? { 
                ...s, 
                status: 'rejected',
                verificationDetails: {
                  ...s.verificationDetails,
                  rejectionReason: reason
                } as any
              } : s));
            }}
          />
        ) : activeTab === 'loyalty' ? (
          user ? (
            <div className="max-w-4xl mx-auto py-4">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Loyalty Portal</h2>
                 <button onClick={() => setActiveTab('shop')} className="text-primary font-bold hover:underline flex items-center gap-2 text-sm">
                   Return to Shop <ChevronDown className="w-4 h-4 -rotate-90" />
                 </button>
              </div>
              <LoyaltyDashboard user={user} />
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-20 space-y-6">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <Award className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Members Only</h2>
                <p className="text-slate-500">Log in to view your loyalty points, rewards, and exclusive member benefits.</p>
              </div>
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20"
              >
                Login to Continue
              </button>
            </div>
          )
        ) : activeTab === 'partner' ? (
          user?.isPartner ? (
             <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                 <CheckCircle2 className="w-10 h-10" />
               </div>
               <h2 className="text-3xl font-black">Partner Dashboard</h2>
               <p className="text-slate-500">Your store is currently being verified. You'll receive an email once you can start adding products.</p>
               <button onClick={() => setActiveTab('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Back to Shopping</button>
             </div>
          ) : (
            <PartnerOnboarding onComplete={handlePartnerComplete} />
          )
        ) : selectedStoreId ? (
          <StoreView 
            store={allStores.find(s => s.id === selectedStoreId)!}
            products={allProducts.filter(p => p.storeId === selectedStoreId)}
            cartItems={cartItems}
            onAdd={addToCart}
            onRemove={removeFromCart}
            onBack={() => setSelectedStoreId(null)}
            onReport={(id, name) => setReportModalData({ isOpen: true, targetId: id, targetType: 'store', targetName: name })}
          />
        ) : activeTab === 'legal' ? (
          <LegalCenter lang={lang} onBack={() => setActiveTab('shop')} />
        ) : activeTab === 'support' ? (
          <SupportCenter 
            lang={lang} 
            onBack={() => setActiveTab('shop')} 
            onSubmitTicket={handleSupportTicket}
            settings={supportSettings}
          />
        ) : (
          <div className="grid grid-cols-12 gap-12">
            <aside className="col-span-12 lg:col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Box className="w-4 h-4 text-primary" />
                  {t('categories')}
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={cn(
                        "group py-3 px-4 rounded-xl font-bold flex items-center gap-3 text-[10px] transition-all border uppercase tracking-wider",
                        selectedCategory === cat.id 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-slate-200"
                      )}
                    >
                      <div className="w-6 h-6 rounded-lg overflow-hidden bg-white shrink-0 group-hover:scale-110 transition-transform">
                        <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Truck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('deliveryInfo')}</span>
                </div>
                <p className="text-xs font-bold leading-relaxed text-slate-400">{t('typicalTime')} <span className="text-white">30-45 {t('mins')}</span></p>
                <div className="pt-2">
                  <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">{t('trackDriver')}</button>
                </div>
              </div>
            </aside>

            {/* Products Area */}
            <div className="col-span-12 lg:col-span-9 space-y-12">
              {/* Order Tracking Widget */}
              <AnimatePresence>
                {orderStatus !== 'none' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-2xl border border-primary/20 shadow-lg shadow-primary/5 overflow-hidden"
                  >
                    <div className="bg-primary/5 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-2 rounded-lg">
                           <Clock className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Order (COD)</p>
                          <p className="font-bold text-slate-800">Collect Rs. {totalPrice} on delivery</p>
                        </div>
                      </div>
                      <button onClick={() => setOrderStatus('none')} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 flex items-center justify-between gap-4">
                      {['Processing', 'On the Way', 'Delivered'].map((step, i) => {
                        const isCompleted = (orderStatus === 'shipped' && i <= 1) || (orderStatus === 'delivered' && i <= 2) || (orderStatus === 'processing' && i === 0);
                        const isCurrent = (orderStatus === 'processing' && i === 0) || (orderStatus === 'shipped' && i === 1) || (orderStatus === 'delivered' && i === 2);
                        
                        return (
                          <div key={step} className="flex-1 flex flex-col items-center gap-2 relative">
                            {i < 2 && (
                               <div className={cn(
                                 "absolute left-[calc(50%+1rem)] right-[calc(-50%+1rem)] top-3 h-[2px]",
                                 isCompleted ? "bg-primary" : "bg-slate-100"
                               )} />
                            )}
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-colors",
                              isCompleted ? "bg-primary text-white" : "bg-slate-100 text-slate-400",
                              isCurrent && "ring-4 ring-primary/20"
                            )}>
                              {isCompleted ? "✓" : i + 1}
                            </div>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-tight",
                              isCompleted ? "text-primary" : "text-slate-400"
                            )}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nearby Stores Slider */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nearby Stores</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stores around your current location</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedStoreId(null); setSelectedCategory(null); }}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {sortedStores.map((store: any) => (
                    <div 
                      key={store.id}
                      onClick={() => setSelectedStoreId(selectedStoreId === store.id ? null : store.id)}
                      className={cn(
                        "flex-shrink-0 w-48 bg-white border rounded-2xl p-4 cursor-pointer transition-all relative overflow-hidden group",
                        selectedStoreId === store.id 
                          ? "border-primary ring-2 ring-primary/10 shadow-lg" 
                          : "border-slate-100 hover:border-slate-200 hover:shadow-md"
                      )}
                    >
                      {store.isFeatured && (
                        <div className="absolute top-0 right-0 bg-accent text-[8px] font-black text-white px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter shadow-sm z-10">
                          Featured
                        </div>
                      )}
                      <div className="w-14 h-14 rounded-xl overflow-hidden mb-3 bg-slate-50 group-hover:scale-105 transition-transform">
                        <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-xs font-black text-slate-800 line-clamp-1 uppercase tracking-tight">{store.name}</h4>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-0.5 bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-black">
                           <Star className="w-2.5 h-2.5 fill-current" />
                           {store.rating || 4.5}
                        </div>
                        {store.distance !== undefined && (
                          <div className="flex items-center gap-1 text-slate-400">
                             <Navigation className="w-2.5 h-2.5" />
                             <span className="text-[9px] font-bold">{store.distance.toFixed(1)} km</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 space-y-1">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          {store.deliveryTime || '20-30 mins'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Truck className="w-3 h-3 text-slate-300" />
                          Rs. {store.deliveryCharge} Delivery
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Discovery Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Popular Restaurants */}
                <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                            <Utensils className="w-4 h-4" />
                         </div>
                         <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Popular Restaurants</h3>
                      </div>
                      <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Explore</button>
                   </div>
                   <div className="space-y-3">
                      {sortedStores.filter(s => s.type === 'restaurant').slice(0, 2).map(store => (
                        <div 
                          key={store.id} 
                          onClick={() => setSelectedStoreId(store.id)}
                          className="bg-white p-3 rounded-xl flex items-center gap-4 cursor-pointer hover:shadow-sm transition-all border border-orange-50"
                        >
                           <img src={store.logo} className="w-12 h-12 rounded-lg object-cover" alt="" />
                           <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-slate-800 uppercase truncate">{store.name}</h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{store.category}</p>
                           </div>
                           <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90" />
                        </div>
                      ))}
                   </div>
                </div>

                {/* Groceries Near You */}
                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                            <Box className="w-4 h-4" />
                         </div>
                         <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Grocery Essentials</h3>
                      </div>
                      <button className="text-[10px] font-black text-primary uppercase tracking-widest">All Marts</button>
                   </div>
                   <div className="space-y-3">
                      {sortedStores.filter(s => s.type === 'grocery' || !s.type).slice(0, 2).map(store => (
                        <div 
                          key={store.id} 
                          onClick={() => setSelectedStoreId(store.id)}
                          className="bg-white p-3 rounded-xl flex items-center gap-4 cursor-pointer hover:shadow-sm transition-all border border-primary/5"
                        >
                           <img src={store.logo} className="w-12 h-12 rounded-lg object-cover" alt="" />
                           <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-slate-800 uppercase truncate">{store.name}</h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fresh Stock Daily</p>
                           </div>
                           <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90" />
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Promo Banner */}
              <section className="bg-gradient-to-r from-accent to-red-600 rounded-2xl h-44 flex items-center justify-between px-12 text-white overflow-hidden relative shadow-xl shadow-accent/10">
                <div className="z-10">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Limited Time Offer</p>
                  <h3 className="text-4xl font-black leading-tight">FRESH VEGETABLES<br />UP TO 40% OFF</h3>
                  <button className="mt-5 bg-white text-accent px-8 py-2.5 rounded-xl font-black text-sm hover:scale-105 transition-transform">Order Now</button>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-white/10 skew-x-12 translate-x-20 pointer-events-none"></div>
                <div className="hidden md:flex gap-6 z-10">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl shadow-inner backdrop-blur-sm">🍅</div>
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl shadow-inner backdrop-blur-sm">🥬</div>
                </div>
              </section>

              {/* Product Grid */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-800">Fresh Near You</h2>
                  <a href="#" className="text-sm font-bold text-primary hover:underline">View All</a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product.id}>
                      <ProductCard 
                        product={product as Product}
                        quantity={getItemQuantity(product.id)}
                        onAdd={addToCart}
                        onRemove={removeFromCart}
                        storeName={allStores.find(s => s.id === product.storeId)?.name}
                        onReport={(id, name) => setReportModalData({ isOpen: true, targetId: id, targetType: 'product', targetName: name })}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Partner CTA */}
              <section className="bg-slate-900 rounded-3xl p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 mt-12 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="space-y-4 max-w-lg z-10">
                  <h3 className="text-3xl font-black tracking-tight leading-tight uppercase">Own a business?<br /><span className="text-primary">Grow with Nepal Mart</span></h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Join hundreds of local partners selling groceries, medicines, and specialty items directly to customers in your neighborhood.</p>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
                    {['Zero Setup Fee', 'Same Day Payouts', 'Store Delivery', 'Merchant Portal'].map(benefit => (
                      <li key={benefit} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-primary" /> {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <button 
                  onClick={() => {
                    if (!user) setIsLoginOpen(true);
                    else setActiveTab('partner');
                  }}
                  className="bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-primary/20 z-10 uppercase tracking-tight"
                >
                  Partner With Us
                </button>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-6 flex items-center justify-between md:hidden z-50">
        <button 
          onClick={() => setActiveTab('shop')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'shop' ? "text-primary" : "text-slate-400")}
        >
          <Box className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">{t('shop')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'orders' ? "text-primary" : "text-slate-400")}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">{t('orders')}</span>
        </button>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-primary text-white p-3 rounded-full -mt-10 shadow-lg shadow-primary/30 relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
              {totalItems}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('loyalty')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'loyalty' ? "text-primary" : "text-slate-400")}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">{t('loyalty')}</span>
        </button>
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">Account</span>
        </button>
      </nav>

      <footer className="bg-slate-900 text-slate-400 px-6 lg:px-12 py-5 flex flex-col md:flex-row items-center justify-between text-[11px] mt-20 gap-4 mb-16 md:mb-0">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold uppercase tracking-widest">Verified Partners:</span> 120+ Local Stores
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold uppercase tracking-widest">Average Delivery:</span> 14 Minutes
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold uppercase tracking-widest">Service Area:</span> Kathmandu, Lalitpur, Bhaktapur
          </div>
        </div>
        <div className="flex items-center gap-8">
          <span className="hover:text-white cursor-pointer transition-colors">Help Center</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          <span className="text-primary flex items-center gap-2 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 
            Live Status: All stores active
          </span>
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  My Cart <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm text-[10px]">{totalItems} Items</span>
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                       <ShoppingCart className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium whitespace-pre-wrap">{"Your cart is empty.\nAdd items to get started!"}</p>
                    <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold" onClick={() => setIsCartOpen(false)}>Shop Now</button>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-gray-100 bg-white">
                      <div className="relative">
                        <img src={item.image} className="w-20 h-20 object-cover rounded-lg" alt={item.name} />
                        {item.isVeg !== undefined && (
                          <div className={cn(
                            "absolute top-1 left-1 w-3 h-3 border flex items-center justify-center p-[1px] bg-white",
                            item.isVeg ? "border-green-600" : "border-red-600"
                          )}>
                            <div className={cn("w-full h-full rounded-full", item.isVeg ? "bg-green-600" : "bg-red-600")} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-sm leading-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.unit}</p>
                        
                        {item.preparationTime && (
                          <p className="text-[9px] text-primary font-bold uppercase tracking-tighter">Prep: {item.preparationTime} mins</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                           <span className="font-bold text-primary">Rs. {item.price}</span>
                           <div className="flex items-center bg-primary text-white rounded-lg px-2 py-1 gap-3 shadow-lg shadow-primary/10">
                              <button onClick={() => removeFromCart(item.id)} className="font-bold hover:scale-125 transition-transform">-</button>
                              <span className="text-xs font-bold">{item.quantity}</span>
                              <button onClick={() => addToCart(item)} className="font-bold hover:scale-125 transition-transform">+</button>
                           </div>
                        </div>

                        {/* Instructions for restaurants */}
                        {allStores.find(s => s.id === item.storeId)?.type === 'restaurant' && (
                          <div className="mt-3 pt-3 border-t border-slate-50">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                              <MessageSquare className="w-3 h-3" />
                              Cooking Instructions
                            </div>
                            <input 
                              type="text" 
                              placeholder="e.g. Less spicy, Extra sauce..."
                              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] outline-none focus:border-primary/50"
                              value={item.instructions || ''}
                              onChange={(e) => {
                                setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, instructions: e.target.value } : i));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="px-6 py-4 bg-slate-50 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method</label>
                  <div className="flex items-center justify-between p-3 bg-white border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-black text-[10px]">COD</div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Cash on Delivery</p>
                        <p className="text-[9px] text-slate-400 font-medium">Pay when you receive items</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-gray-700">Redeem Points</span>
                  </div>
                  <span className="text-xs text-gray-500">{user?.points || 0} points available</span>
                </div>
                <button 
                  disabled={!user}
                  className="w-full bg-white border border-primary/20 text-primary py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  Apply {Math.min(user?.points || 0, 500)} Points (-Rs. {Math.min(user?.points || 0, 500)})
                </button>
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="Referral / Promo Code" 
                     className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary"
                   />
                   <button className="bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold">APPLY</button>
                </div>
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
                  <div className="flex items-center justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>Rs. {totalPrice}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
                  >
                    Proceed to Checkout
                    <ChevronDown className="w-5 h-5 -rotate-90" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {isCheckoutOpen && cartItems.length > 0 && user && (
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          store={allStores.find(s => s.id === cartItems[0].storeId)!}
          user={user}
          totalAmount={totalPrice}
          onComplete={completeCheckout}
        />
      )}

      {reportModalData.isOpen && (
        <ReportModal 
          isOpen={reportModalData.isOpen}
          onClose={() => setReportModalData(prev => ({ ...prev, isOpen: false }))}
          targetId={reportModalData.targetId}
          targetType={reportModalData.targetType}
          targetName={reportModalData.targetName}
          onSubmit={handleReportSubmit}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-20 pt-16 pb-8">
        <div className="container-wide grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12 mb-8">
          <div className="space-y-4">
             <h3 className="text-2xl font-black tracking-tighter">NEPAL<span className="text-accent">MART</span></h3>
             <p className="text-slate-400 text-xs font-medium leading-relaxed">Connecting Nepal's local shops and restaurants to your doorstep. Supporting local businesses across the country.</p>
             <div className="flex items-center gap-3">
               <a href={`tel:${supportSettings.phone}`} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                 <Phone className="w-4 h-4" />
               </a>
               <a href={`mailto:${supportSettings.email}`} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                 <Mail className="w-4 h-4" />
               </a>
               {supportSettings.whatsapp && (
                 <a href={`https://wa.me/${supportSettings.whatsapp.replace('+', '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-green-500 transition-colors cursor-pointer">
                   <MessageSquare className="w-4 h-4" />
                 </a>
               )}
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Company</h4>
             <ul className="space-y-2 text-xs font-bold text-slate-400">
               <li><button onClick={() => setActiveTab('shop')} className="hover:text-white transition-colors">About Us</button></li>
               <li><button onClick={() => setActiveTab('partner')} className="hover:text-white transition-colors">Become a Partner</button></li>
               <li><button onClick={() => setActiveTab('shop')} className="hover:text-white transition-colors">Careers</button></li>
               <li><button onClick={() => setActiveTab('support')} className="hover:text-white transition-colors">{t('helpCenter') || 'Help Center'}</button></li>
             </ul>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Legal</h4>
             <ul className="space-y-2 text-xs font-bold text-slate-400">
               <li><button onClick={() => { setActiveTab('legal'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Terms of Service</button></li>
               <li><button onClick={() => { setActiveTab('legal'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Privacy Policy</button></li>
               <li><button onClick={() => { setActiveTab('legal'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Refund Policy</button></li>
               <li><button onClick={() => { setActiveTab('legal'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Store Policy</button></li>
             </ul>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Support</h4>
             <ul className="space-y-2 text-xs font-bold text-slate-400">
               <li><button onClick={() => setActiveTab('support')} className="hover:text-white transition-colors">Report an Issue</button></li>
               <li><button onClick={() => setActiveTab('support')} className="hover:text-white transition-colors">Contact Support</button></li>
               <li><button onClick={() => setActiveTab('support')} className="hover:text-white transition-colors">FAQs</button></li>
             </ul>
          </div>
        </div>
        <div className="container-wide flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           <p>© 2026 Nepal Mart Marketplace. All rights reserved.</p>
           <div className="flex items-center gap-6">
             <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Secure Payments</span>
             <span className="flex items-center gap-2"><Truck className="w-3 h-3" /> Reliable Delivery</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
