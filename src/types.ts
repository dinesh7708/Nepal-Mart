/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  storeId: string;
  stock: number;
  discountPrice?: number;
  isAvailable: boolean;
  isSponsored?: boolean;
  isFeatured?: boolean;
  isVeg?: boolean;
  preparationTime?: number; // in minutes
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export interface Store {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  deliveryTime: string;
}

export interface VerificationDetails {
  ownerFullName: string;
  mobileVerified: boolean;
  citizenshipNumber: string;
  panVatNumber?: string;
  documents: {
    shopFront: string;
    idCard: string;
    license?: string;
    panCard?: string;
    storeLogo?: string;
    qrCode?: string;
  };
  rejectionReason?: string;
  submittedAt?: number;
}

export interface PaymentSettings {
  codEnabled: boolean;
  qrEnabled: boolean;
  qrImage?: string;
  esewaEnabled: boolean;
  esewaId?: string;
  khaltiEnabled: boolean;
  khaltiId?: string;
  bankEnabled: boolean;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifscCode?: string;
  mobileNumber?: string;
  instructions?: string;
}

export interface StoreProfile {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  type?: 'grocery' | 'restaurant';
  address: string;
  location?: {
    lat: number;
    lng: number;
  };
  contactNumber: string;
  logo?: string;
  banner?: string;
  openingTime: string;
  closingTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verificationDetails?: VerificationDetails;
  createdAt: number;
  deliveryCharge: number;
  minOrderAmount: number;
  deliveryRadius: number;
  freeDeliveryThreshold?: number;
  isFeatured?: boolean;
  commissionRate?: number; // Store-specific commission percentage
  rating?: number;
  reviewsCount?: number;
  paymentSettings?: PaymentSettings;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  points: number;
  totalSpent: number;
  tier: 'bronze' | 'silver' | 'gold';
  referralCode: string;
  referredBy?: string;
  isPartner?: boolean;
  storeId?: string | null;
}

export interface MembershipTier {
  id: 'bronze' | 'silver' | 'gold';
  name: string;
  minSpend: number;
  pointsMultiplier: number;
  benefits: string[];
  color: string;
}

export interface CartItem extends Product {
  quantity: number;
  instructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerId: string;
  storeId: string;
  storeOwnerId?: string;
  items: CartItem[];
  totalPrice: number;
  totalAmount: number;
  subtotal: number;
  deliveryCharge: number;
  commissionRate?: number;
  commissionAmount?: number;
  storeEarnings?: number;
  status: 'pending' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled' | 'accepted' | 'rejected' | 'processing' | 'shipped';
  paymentStatus: 'pending' | 'paid' | 'verified' | 'failed' | 'refunded' | 'awaiting_verification';
  paymentMethod: 'cod' | 'qr' | 'esewa' | 'khalti' | 'bank';
  transactionId?: string;
  paymentScreenshot?: string;
  createdAt: number;
  deliveryAddress: string;
  instructions?: string;
}

export interface CommissionPayment {
  id: string;
  storeId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'verified' | 'rejected';
  screenshot: string;
  notes?: string;
  createdAt: number;
  verifiedAt?: number;
}

export interface AdminStats {
  totalPlatformSales: number;
  totalCommissionEarned: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  method: 'bank' | 'esewa' | 'khalti' | 'qr';
  details: string; // Account info
  status: 'pending' | 'completed' | 'rejected';
  createdAt: number;
  completedAt?: number;
}

export interface Review {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string; // Store ID or Product ID
  targetType: 'store' | 'product';
  reason: 'fraud' | 'prohibited_item' | 'bad_behavior' | 'fake_pricing' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'safety' | 'update' | 'promotion';
  createdAt: number;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: number;
}

export interface SupportSettings {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  updatedAt: number;
}
